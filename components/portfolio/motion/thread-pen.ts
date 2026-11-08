/**
 * The pen: a ring + core that rides the tip of the thread.
 *
 * It lives once, in the page SVG (see ThreadLayer), and is moved by whichever
 * animation is currently drawing:
 *
 *   1. the hero intro (hero.ts), along the hero pieces, then
 *   2. the scroll timeline (thread-scroll.ts), along the active leg.
 *
 * The two never overlap: while the intro is running the scroll driver stays
 * out of the way (`penState.introRunning`). Both hand over at the same point,
 * the start of the "work" segment, so the pen never jumps.
 *
 * Hero paths live in their own SVGs, so points are converted through the
 * screen CTMs instead of assuming the SVGs share a coordinate system.
 */

export const penState = { introRunning: false };

const penOf = (root: ParentNode) =>
  root.querySelector<SVGGElement>("g[data-thread-pen]");

const pageSvgOf = (root: ParentNode) =>
  root.querySelector<SVGSVGElement>("svg.thread-layer");

export function showPen(root: ParentNode, visible = true) {
  const pen = penOf(root);
  if (pen) pen.style.opacity = visible ? "1" : "0";
}

export function placePen(root: ParentNode, x: number, y: number) {
  const pen = penOf(root);
  if (!pen) return;
  pen.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
}

/** Puts the pen on `path` at `length` (user units of the path). */
export function placePenOnPath(
  root: ParentNode,
  path: SVGPathElement,
  length: number,
) {
  const total = path.getTotalLength();
  const point = path.getPointAtLength(Math.min(Math.max(length, 0), total));
  const pageSvg = pageSvgOf(root);
  const from = path.getScreenCTM();
  const to = pageSvg?.getScreenCTM();

  if (!pageSvg || !from || !to || path.ownerSVGElement === pageSvg) {
    placePen(root, point.x, point.y);
    return;
  }

  const screen = new DOMPoint(point.x, point.y).matrixTransform(from);
  const local = screen.matrixTransform(to.inverse());
  placePen(root, local.x, local.y);
}
