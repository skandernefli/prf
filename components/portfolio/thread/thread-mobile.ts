import {
  clamp,
  pathEnd,
  transformPath,
  type Point,
  type Rect,
} from "./thread-path";

/**
 * How the case-study thread is drawn on phones (<= 700px wide).
 *
 *   "template"  the hand-drawn reference route, squashed to the phone layout.
 *               This is what the production site does: same route, same
 *               points, only narrower.
 *   "weave"     the margin-to-margin serpentine that was added later. Kept so
 *               the two can be compared; it does not match production.
 */
export const MOBILE_CASE_STUDY_ROUTE: "template" | "weave" = "template";

/**
 * PRODUCTION PARITY.
 * The production site has no phone-specific thread logic: every section uses
 * the same hand-drawn routes at every width, only scaled. Each flag below,
 * when true, switches the phone-only (<= 700px) deviations off for that
 * section so phones follow exactly what production does. Set one to false to
 * bring that section's phone tweaks back.
 */
export const PRODUCTION_PARITY = {
  hero: false,
  work: false,
  capabilities: false,
  caseStudies: true,
} as const;

/** True when a phone-only tweak should run for `section`. */
export const phoneTweak = (
  width: number,
  section: keyof typeof PRODUCTION_PARITY,
) => width <= 700 && !PRODUCTION_PARITY[section];

/**
 * Maps a reference route (drawn for a 1425px-wide page) onto a live frame.
 * x is scaled by the width ratio, y by the height ratio, so every point of
 * the route keeps its position relative to the artwork.
 */
export function squashTemplate(
  d: string,
  template: { top: number; height: number },
  frame: Rect,
  referenceWidth: number,
): string {
  const xScale = frame.width / referenceWidth;
  const yScale = frame.height / Math.max(1, template.height);

  return transformPath(d, (value) => ({
    x: frame.left + value.x * xScale,
    y: frame.top + (value.y - template.top) * yScale,
  }));
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * KABRI, after the east door.
 *
 * The suffix of the reference route is shifted sideways so that it leaves the
 * live east door. On a desktop the shift is a few pixels. On a phone the door
 * sits against the right wall of a full-width floor plan, so the same shift
 * would push the rest of the route off the screen.
 *
 * Instead the shift is full at the door and fades to zero over the next
 * `blend` pixels of height, so the thread leaves the door and then settles
 * onto the squashed reference route. `mapped` is the point after the vertical
 * mapping and before the shift; the result is clamped to the page margins.
 */
export function blendKabriSuffix(
  mapped: Point,
  offset: Point,
  eastY: number,
  frame: Rect,
  pageWidth: number,
  margin = 8,
): Point {
  const blend = Math.max(1, 0.22 * frame.height);
  const weight = 1 - smoothstep(clamp((mapped.y - eastY) / blend, 0, 1));

  return {
    x: clamp(mapped.x + offset.x * weight, margin, pageWidth - margin),
    y: mapped.y + offset.y,
  };
}

/**
 * Joins a hand-drawn case-study route to whatever came before it.
 *
 * The routes were drawn for the production order of case studies, so a route
 * rarely begins where the previous one now ends. Moving only the first point
 * leaves the first curve with the wrong tangent and makes the thread swoop.
 * Here the whole opening of the route is shifted: the full offset at the
 * start, easing to zero over `blendFraction` of the frame height, so the
 * thread leaves the previous exit cleanly and then follows the original
 * route through the artwork exactly as drawn.
 */
export function joinRouteStart(
  d: string,
  start: Point,
  target: Point,
  frameHeight: number,
  blendFraction = 0.2,
): string {
  const offset = { x: target.x - start.x, y: target.y - start.y };
  const blend = Math.max(1, blendFraction * frameHeight);

  return transformPath(d, (value) => {
    const weight = 1 - smoothstep(clamp((value.y - start.y) / blend, 0, 1));
    return {
      x: value.x + offset.x * weight,
      y: value.y + offset.y * weight,
    };
  });
}

/**
 * Adapts the END of a case-study route to the START of the one that follows.
 *
 * The routes were drawn for production's order of case studies, so with the
 * new order a route often ends at a different x than the next one begins.
 * Instead of shearing the next route's opening (which bends it away from its
 * artwork), the last `fraction` of this route eases sideways to the next
 * entry. The shift is zero until the blend begins and has zero slope at both
 * ends of the blend, so the thread stays smooth, and the rest of the route
 * stays exactly as drawn.
 */
export function blendRouteEnd(
  d: string,
  targetX: number,
  frame: Rect,
  fraction = 0.25,
): string {
  const end = pathEnd(d);
  const shift = targetX - end.x;
  if (Math.abs(shift) < 0.5) return d;

  const blend = Math.max(1, fraction * frame.height);
  const from = frame.bottom - blend;

  return transformPath(d, (value) => ({
    x: value.x + shift * smoothstep(clamp((value.y - from) / blend, 0, 1)),
    y: value.y,
  }));
}
