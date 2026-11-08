import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { THREAD_UPDATED_EVENT, getThreadSegment } from "../thread/thread-dom";
import { penState, placePenOnPath, showPen } from "./thread-pen";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

/**
 * Scroll-driven drawing of the page thread: ONE timeline, ONE ScrollTrigger.
 *
 * The page is cut into contiguous scroll windows, one per segment, in travel
 * order. Window N ends exactly where window N+1 begins, so by construction:
 *
 *   - only one segment is ever being drawn (no overlap),
 *   - there is never a stretch of scroll where the pen is idle (no stalls),
 *   - the pen moves at a constant speed inside each window (smooth).
 *
 * Timeline time is measured in scroll pixels, so a tween placed at `start`
 * with `duration = end - start` is drawn while scrollY is in [start, end].
 *
 * Reveal animations (text, figures) are NOT involved any more: the pen no
 * longer needs to know about them.
 */

/** Where the pen head sits in the viewport, as a fraction of its height. */
const PEN_LINE = 0.75;

/** Smoothing. Lenis already eases scroll, so `true` (no extra lag) is right. */
const SCRUB: boolean | number = true;

type Leg = {
  /** data-thread-segment ids drawn together in this leg's window */
  ids: readonly string[];
  /** Scroll position where this leg starts: element selector + fraction of its height. */
  at: { selector: string; fraction?: number } | "top";
};

/**
 * Travel order. Each leg ends where the next one starts. A leg with several
 * ids draws them simultaneously (the two halves of the capabilities ring).
 */
const LEGS: readonly Leg[] = [
  { ids: ["work"], at: "top" }, // includes the hero tail
  { ids: ["capabilities.entry"], at: { selector: "#capabilities" } },
  {
    ids: ["capabilities.product", "capabilities.ai"],
    at: { selector: ".capability-orbit" },
  },
  {
    ids: ["capabilities.exit"],
    at: { selector: ".capability-orbit", fraction: 1 },
  },
  { ids: ["kabri"], at: { selector: "#kabri" } },
  { ids: ["norma"], at: { selector: "#norma" } },
  { ids: ["shopops"], at: { selector: "#shop-ops" } },
  { ids: ["legalexy"], at: { selector: "#lega-lexy" } },
  { ids: ["why"], at: { selector: "#why-me" } },
  { ids: ["conclusion"], at: { selector: "#conclusion" } },
  { ids: ["footer"], at: { selector: "#footer" } },
];

type PlacedLeg = { ids: readonly string[]; start: number };

function measureLegs(root: HTMLElement, maxScroll: number): PlacedLeg[] {
  const penOffset = window.innerHeight * PEN_LINE;
  let previous = 0;

  return LEGS.map(({ ids, at }) => {
    let start = previous;

    if (at === "top") {
      start = 0;
    } else {
      const el = root.querySelector<HTMLElement>(at.selector);
      if (el) {
        const rect = el.getBoundingClientRect();
        const top =
          rect.top + window.scrollY + rect.height * (at.fraction ?? 0);
        start = top - penOffset;
      }
    }

    // Monotonic and inside the scrollable range, so windows can never cross.
    start = Math.min(maxScroll, Math.max(previous, start));
    previous = start;
    return { ids, start };
  });
}

export function buildThreadScroll(root: HTMLElement): () => void {
  let timeline: gsap.core.Timeline | null = null;
  let signature = "";
  let frame = 0;
  let disposed = false;

  const teardown = () => {
    timeline?.scrollTrigger?.kill();
    timeline?.kill();
    timeline = null;
  };

  const build = () => {
    if (disposed) return;

    const maxScroll = ScrollTrigger.maxScroll(window);
    if (maxScroll <= 0) return;

    const legs = measureLegs(root, maxScroll);

    // Rebuild only when something that affects the mapping changed: window
    // positions, or a path's length (DrawSVG caches it, so a new `d` makes
    // old tweens stale).
    const next = [
      Math.round(maxScroll),
      ...legs.flatMap(({ ids, start }) =>
        ids.map((id) => {
          const length = getThreadSegment(root, id)?.getTotalLength() ?? 0;
          return `${id}:${Math.round(start)}:${Math.round(length)}`;
        }),
      ),
    ].join("|");

    if (timeline && next === signature) return;
    signature = next;

    teardown();

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { start: 0, end: "max", scrub: SCRUB },
    });

    legs.forEach(({ ids, start }, index) => {
      const end = index + 1 < legs.length ? legs[index + 1].start : maxScroll;

      for (const id of ids) {
        const path = getThreadSegment(root, id);
        if (!path) continue;

        if (process.env.NODE_ENV !== "production") {
          const subpaths = (path.getAttribute("d") ?? "").match(/M/gi)?.length;
          if (subpaths && subpaths > 1) {
            console.warn(
              `[thread] "${id}" has ${subpaths} subpaths; DrawSVG cannot draw it in order.`,
            );
          }
        }

        tl.fromTo(
          path,
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: Math.max(end - start, 0.001) },
          start,
        );
      }
    });

    // Pad so timeline time === scroll pixels.
    tl.to({}, { duration: 0 }, maxScroll);

    // The pen rides the tip of whichever leg is being drawn. It is derived
    // from the timeline position, not from tween callbacks, so it is correct
    // after fast scrolls, jumps (anchor links, reload mid-page) and reversals.
    const placePen = () => {
      if (penState.introRunning && window.scrollY < 1) return;

      const time = tl.time();
      let index = 0;
      for (let i = 0; i < legs.length; i += 1) {
        if (legs[i].start <= time) index = i;
      }

      const { ids, start } = legs[index];
      const end = index + 1 < legs.length ? legs[index + 1].start : maxScroll;
      const path = getThreadSegment(root, ids[0]);
      if (!path) return;

      const ratio = Math.min(
        1,
        Math.max(0, (time - start) / Math.max(end - start, 0.001)),
      );

      showPen(root, true);
      placePenOnPath(root, path, path.getTotalLength() * ratio);
    };

    // Markers appear when the pen reaches them, like beads on the thread.
    const markers = Array.from(
      root.querySelectorAll<SVGGElement>("g[data-thread-marker]"),
    ).map((element) => {
      const segment = element.getAttribute("data-thread-on") ?? "";
      const legIndex = legs.findIndex(({ ids }) => ids.includes(segment));
      return {
        element,
        legIndex,
        progress: Number(element.getAttribute("data-thread-progress") ?? 0),
      };
    });

    const updateMarkers = () => {
      const time = tl.time();
      for (const { element, legIndex, progress } of markers) {
        if (legIndex < 0) continue;
        const { start } = legs[legIndex];
        const end =
          legIndex + 1 < legs.length ? legs[legIndex + 1].start : maxScroll;
        const ratio = (time - start) / Math.max(end - start, 0.001);
        element.style.opacity = ratio >= progress - 0.002 ? "1" : "0";
      }
    };

    tl.eventCallback("onUpdate", () => {
      placePen();
      updateMarkers();
    });
    placePen();
    updateMarkers();

    timeline = tl;
  };

  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      build();
    });
  };

  build();

  const observer = new ResizeObserver(schedule);
  observer.observe(root);
  window.addEventListener("resize", schedule);
  root.addEventListener(THREAD_UPDATED_EVENT, schedule);
  void document.fonts?.ready.then(schedule);

  return () => {
    disposed = true;
    if (frame) window.cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener("resize", schedule);
    root.removeEventListener(THREAD_UPDATED_EVENT, schedule);
    teardown();
  };
}
