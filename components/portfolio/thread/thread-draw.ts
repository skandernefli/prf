import { gsap } from "gsap";

/**
 * Thread drawing engine.
 *
 * This module knows NOTHING conclusion scroll. It exposes one primitive,
 * `draw(progress)`, where progress is a global 0..1 value. Anything can drive
 * it: the scroll loop, a click, a hover, a timeline, a route change.
 *
 * It never touches path geometry (`d`). It only animates how much of each
 * path is visible, using stroke-dasharray / stroke-dashoffset with
 * `pathLength="1"` so no length measuring is needed and rebuilds are cheap.
 */

export type DrawRange = readonly [start: number, end: number];

export type DrawSegment = {
  id: string;
  element: SVGPathElement | null;
  /** Global progress window in which this path goes from 0% to 100% drawn. */
  range: DrawRange;
};

export type ThreadDrawerConfig = {
  segments: DrawSegment[];
  /** Id of the segment markers are positioned along. Defaults to "page". */
  markerSegmentId?: string;
  /** Element revealed once global progress reaches `at`. */
  terminal?: { element: SVGElement | null; at: number };
  /** Optional remap of global progress (e.g. to follow a non-linear track). */
  mapProgress?: (progress: number) => number;
};

export type DrawToOptions = {
  duration?: number;
  ease?: string;
  onComplete?: () => void;
};

export type ThreadDrawer = {
  /** Render the thread at a global progress (0..1). Cheap; safe per frame. */
  draw: (progress: number) => void;
  /** Animate to a progress value over time (for non-scroll triggers). */
  drawTo: (progress: number, options?: DrawToOptions) => gsap.core.Tween;
  /** Register marker groups + their points so they reveal as the line arrives. */
  setMarkers: (
    groups: SVGElement[],
    points: ReadonlyArray<{ x: number; y: number }>,
  ) => void;
  /** Call after path geometry changes (rebuild/resize). Re-applies current state. */
  refresh: () => void;
  readonly progress: number;
  destroy: () => void;
};

/**
 * Default windows, in global progress. Tune these to match where each
 * section sits on the page.
 */
export const DEFAULT_DRAW_RANGES = {
  page: [0, 1],
  branch: [0.3, 0.5],
  fingerprint: [0.45, 0.65],
  footer: [0.85, 1],
} as const satisfies Record<string, DrawRange>;

const EPSILON = 1e-4;
const SAMPLES = 600;
const REVEAL_TRANSITION = "opacity 0.35s ease";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

type SegmentState = { segment: DrawSegment; last: number };
type RevealState = {
  element: SVGElement | null;
  at: number;
  on: boolean | null;
};

function applyPath(element: SVGPathElement, local: number) {
  const style = element.style;
  if (local <= 0) {
    style.visibility = "hidden";
    return;
  }
  style.visibility = "visible";
  if (local >= 1) {
    // Fully drawn: hand control back to the stylesheet.
    style.removeProperty("stroke-dasharray");
    style.removeProperty("stroke-dashoffset");
    return;
  }
  style.strokeDasharray = "1 1";
  style.strokeDashoffset = String(1 - local);
}

function applyReveal(state: RevealState, on: boolean) {
  if (state.on === on) return;
  state.on = on;
  const element = state.element;
  if (!element) return;
  element.style.transition = REVEAL_TRANSITION;
  element.style.opacity = on ? "1" : "0";
}

export function createThreadDrawer(config: ThreadDrawerConfig): ThreadDrawer {
  const mapProgress = config.mapProgress ?? ((value: number) => value);
  const markerSegmentId = config.markerSegmentId ?? "page";

  const segments: SegmentState[] = config.segments.map((segment) => ({
    segment,
    last: Number.NaN,
  }));

  const terminal: RevealState | null = config.terminal
    ? { element: config.terminal.element, at: config.terminal.at, on: null }
    : null;

  let markers: RevealState[] = [];
  let markerInput: {
    groups: SVGElement[];
    points: ReadonlyArray<{ x: number; y: number }>;
  } = { groups: [], points: [] };

  let current = 0;
  let tween: gsap.core.Tween | null = null;

  const prepare = () => {
    for (const state of segments) {
      state.segment.element?.setAttribute("pathLength", "1");
      state.last = Number.NaN;
    }
    if (terminal) terminal.on = null;
  };

  const computeMarkerThresholds = () => {
    const host = segments.find((s) => s.segment.id === markerSegmentId);
    const path = host?.segment.element;
    const [start, end] = host?.segment.range ?? [0, 1];

    markers = markerInput.groups.map((element) => ({
      element,
      at: Number.POSITIVE_INFINITY,
      on: null,
    }));

    if (!path) return;

    let length = 0;
    try {
      length = path.getTotalLength();
    } catch {
      length = 0;
    }
    if (!length) return;

    const samples: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= SAMPLES; i += 1) {
      const point = path.getPointAtLength((i / SAMPLES) * length);
      samples.push({ x: point.x, y: point.y });
    }

    markerInput.points.forEach((target, index) => {
      const marker = markers[index];
      if (!marker) return;
      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let i = 0; i < samples.length; i += 1) {
        const dx = samples[i].x - target.x;
        const dy = samples[i].y - target.y;
        const distance = dx * dx + dy * dy;
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      }
      marker.at = start + (best / SAMPLES) * (end - start);
    });
  };

  const draw = (progress: number) => {
    current = clamp01(progress);
    const mapped = mapProgress(current);

    for (const state of segments) {
      const { element, range } = state.segment;
      if (!element) continue;

      const span = Math.max(range[1] - range[0], 1e-6);
      const local = clamp01((mapped - range[0]) / span);

      if (local === state.last) continue;
      const inside = local > 0 && local < 1 && state.last > 0 && state.last < 1;
      if (inside && Math.abs(local - state.last) < EPSILON) continue;

      state.last = local;
      applyPath(element, local);
    }

    for (const marker of markers) {
      applyReveal(marker, mapped >= marker.at);
    }
    if (terminal) applyReveal(terminal, mapped >= terminal.at);
  };

  const drawTo = (progress: number, options: DrawToOptions = {}) => {
    tween?.kill();
    const proxy = { value: current };
    tween = gsap.to(proxy, {
      value: clamp01(progress),
      duration: options.duration ?? 1.2,
      ease: options.ease ?? "power2.inOut",
      onUpdate: () => draw(proxy.value),
      onComplete: options.onComplete,
    });
    return tween;
  };

  const setMarkers: ThreadDrawer["setMarkers"] = (groups, points) => {
    markerInput = { groups, points };
  };

  const refresh = () => {
    prepare();
    computeMarkerThresholds();
    draw(current);
  };

  const destroy = () => {
    tween?.kill();
    tween = null;
  };

  prepare();
  draw(0);

  return {
    draw,
    drawTo,
    setMarkers,
    refresh,
    get progress() {
      return current;
    },
    destroy,
  };
}
