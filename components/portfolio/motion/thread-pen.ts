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
 *
 * Visibility: the pen is shown only while it is actually being moved. Each
 * placement resets a short idle timer; when no placement happens for IDLE_MS,
 * the pen fades out. Callers that need the pen to stay put (e.g. a hero intro
 * pause) can call `showPen(root, true)` after their last placement, which
 * clears the timer and keeps the pen visible until the next placement or an
 * explicit `showPen(root, false)`.
 */

export const penState = { introRunning: false };

// Cached DOM references — queried once per root, invalidated when the caller
// passes a different root (no explicit invalidation needed; thread-layer owns
// the SVG and never swaps it without a rebuild).
let _cachedRoot: ParentNode | null = null;
let _cachedPen: SVGGElement | null = null;
let _cachedPageSvg: SVGSVGElement | null = null;

const penOf = (root: ParentNode) => {
  if (_cachedRoot !== root) {
    _cachedRoot = root;
    _cachedPen = null;
    _cachedPageSvg = null;
  }
  if (!_cachedPen) {
    _cachedPen = root.querySelector<SVGGElement>("g[data-thread-pen]");
  }
  return _cachedPen;
};

const pageSvgOf = (root: ParentNode) => {
  if (_cachedRoot !== root) {
    _cachedRoot = root;
    _cachedPen = null;
    _cachedPageSvg = null;
  }
  if (!_cachedPageSvg) {
    _cachedPageSvg = root.querySelector<SVGSVGElement>("svg.thread-layer");
  }
  return _cachedPageSvg;
};

/** How long the pen stays visible after its last placement. */
const IDLE_MS = 180;

/** Sub-pixel threshold: below this, treat the pen as static. */
const MOVE_EPSILON = 0.01;

let lastX = Number.NaN;
let lastY = Number.NaN;
let primed = false;
let hideTimer: number | null = null;

const clearHideTimer = () => {
  if (hideTimer !== null) {
    window.clearTimeout(hideTimer);
    hideTimer = null;
  }
};

export function showPen(root: ParentNode, visible = true) {
  const pen = penOf(root);
  if (!pen) return;

  clearHideTimer();
  pen.style.opacity = visible ? "1" : "0";
}

export function placePen(root: ParentNode, x: number, y: number) {
  const pen = penOf(root);
  if (!pen) return;

  pen.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);

  const moved =
    primed &&
    (Math.abs(x - lastX) > MOVE_EPSILON || Math.abs(y - lastY) > MOVE_EPSILON);

  lastX = x;
  lastY = y;
  primed = true;

  if (moved) {
    pen.style.opacity = "1";
  }

  clearHideTimer();
  hideTimer = window.setTimeout(() => {
    hideTimer = null;
    const current = penOf(root);
    if (current) current.style.opacity = "0";
  }, IDLE_MS);
}

/** Puts the pen on `path` at `length` (user units of the path).
 *
 * Pass `cachedTotalLength` when it was already computed by the caller to
 * avoid a duplicate `getTotalLength()` call per frame. */
export function placePenOnPath(
  root: ParentNode,
  path: SVGPathElement,
  length: number,
  cachedTotalLength?: number,
) {
  const total = cachedTotalLength ?? path.getTotalLength();
  const point = path.getPointAtLength(Math.min(Math.max(length, 0), total));

  // Fast path: when the path lives in the page SVG, no CTM conversion needed.
  const pageSvg = pageSvgOf(root);
  if (!pageSvg || path.ownerSVGElement === pageSvg) {
    placePen(root, point.x, point.y);
    return;
  }

  // Cross-SVG coordinate conversion (hero paths in their own SVGs).
  const from = path.getScreenCTM();
  const to = pageSvg.getScreenCTM();
  if (!from || !to) {
    placePen(root, point.x, point.y);
    return;
  }

  const screen = new DOMPoint(point.x, point.y).matrixTransform(from);
  const local = screen.matrixTransform(to.inverse());
  placePen(root, local.x, local.y);
}
