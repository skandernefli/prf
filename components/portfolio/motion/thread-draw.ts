import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

import { getThreadSegment } from "../thread/thread-dom";

gsap.registerPlugin(DrawSVGPlugin);

/**
 * Scroll-driven drawing of the thread, one pen.
 *
 * Every text/figure reveal already has a ScrollTrigger start ("top 86%", ...).
 * That start is a "stop": the scroll position where the reveal begins. The
 * thread is drawn between consecutive stops, so the pen reaches an element at
 * exactly the scroll position where that element starts to reveal.
 *
 *   scrollTriggerDefaults()  -> recordStop()      (motion-utils.ts)
 *   collectStops(build)      -> stops of one scene
 *   drawThreadSegment(...)   -> scrubbed drawSVG from the cursor to the last stop
 *
 * The cursor is the last stop already reached by the pen, so each segment
 * starts exactly where the previous one ended.
 */

export type Stop = { el: Element; start: string };

const MIN_GAP = 12; // px of scroll between two stops, avoids zero-length tweens
const SAMPLES = 200;

let recorder: Stop[] | null = null;
let cursor: Stop | null = null;

/** Called for every reveal. Exits ("bottom ...") are not stops. */
export function recordStop(el: Element, start: string) {
  if (recorder && start.startsWith("top")) recorder.push({ el, start });
}

/** Runs a scene builder and returns the stops its reveals registered. */
export function collectStops(build: () => void): Stop[] {
  const previous = recorder;
  const stops: Stop[] = [];
  recorder = stops;
  try {
    build();
  } finally {
    recorder = previous;
  }
  return stops;
}

export function seedThreadCursor(el: Element, start = "top top") {
  cursor = { el, start };
}

export const getThreadCursor = () => cursor;

const pageY = (root: HTMLElement, el: Element) =>
  el.getBoundingClientRect().top - root.getBoundingClientRect().top;

const startRatio = (start: string) => {
  const match = /(\d+(?:\.\d+)?)%/.exec(start);
  return match ? Number(match[1]) / 100 : 0;
};

/** Scroll position (px) at which a stop's ScrollTrigger start is reached. */
const scrollPos = (root: HTMLElement, stop: Stop) =>
  pageY(root, stop.el) - window.innerHeight * startRatio(stop.start);

/** First point after `from` (0..1) where the path crosses page-y `y`. */
function fractionAtY(path: SVGPathElement, y: number, from: number) {
  const length = path.getTotalLength();
  let previous = path.getPointAtLength(from * length).y;
  let best = from;
  let bestDistance = Math.abs(previous - y);

  for (let i = 1; i <= SAMPLES; i += 1) {
    const fraction = from + ((1 - from) * i) / SAMPLES;
    const current = path.getPointAtLength(fraction * length).y;

    if ((previous - y) * (current - y) <= 0) return fraction;

    const distance = Math.abs(current - y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = fraction;
    }
    previous = current;
  }

  return best;
}

type SegmentOptions = {
  /** Where the pen starts. Defaults to the cursor. */
  from?: Stop | null;
  /** Only use the first N stops (in scroll order); the last one ends at 100%. */
  take?: number;
};

export function drawThreadSegment(
  root: HTMLElement,
  id: string,
  stops: Stop[],
  { from = cursor, take }: SegmentOptions = {},
) {
  const path = getThreadSegment(root, id);
  if (!path || !from || path.getTotalLength() <= 0) return;

  let lastPos = scrollPos(root, from);
  const chain: Array<{ stop: Stop; pos: number }> = [];

  for (const item of stops
    .map((stop) => ({ stop, pos: scrollPos(root, stop) }))
    .sort((a, b) => a.pos - b.pos)) {
    if (item.pos - lastPos < MIN_GAP) continue;
    chain.push(item);
    lastPos = item.pos;
    if (take !== undefined && chain.length >= take) break;
  }

  if (!chain.length) return;

  gsap.set(path, { drawSVG: "0%" });

  let previous = from;
  let progress = 0;

  chain.forEach(({ stop }, index) => {
    const isLast = index === chain.length - 1;
    const next = isLast
      ? 100
      : fractionAtY(path, pageY(root, stop.el), progress / 100) * 100;

    gsap.fromTo(
      path,
      { drawSVG: `0% ${progress}%` },
      {
        drawSVG: `0% ${next}%`,
        ease: "none",
        immediateRender: index === 0,
        scrollTrigger: {
          trigger: previous.el,
          start: previous.start,
          endTrigger: stop.el,
          end: stop.start,
          scrub: 0.5,
        },
      },
    );

    previous = stop;
    progress = next;
  });

  const end = chain[chain.length - 1].stop;
  if (!cursor || scrollPos(root, end) > scrollPos(root, cursor)) cursor = end;
}
