import { anchorPoint, getRect, type MeasuredLayout } from "./thread-measure";
import { clamp, type Point } from "./thread-path";
import { PHONE_CASE_ROUTES, type PhoneRouteData } from "./thread-phone-data";

export type PhoneCaseId = keyof typeof PHONE_CASE_ROUTES;

/**
 * Phone (<= 700px) case-study routes.
 *
 * The routes in thread-phone-data.ts were traced from the production site's
 * phone layout. Each one is stored as waypoints (x as a fraction of the page
 * width, y in production pixels) plus "landmarks": pairs of
 *   production y  <->  an edge of a piece of artwork.
 * At runtime every landmark is looked up in the live layout and the waypoints'
 * y values are re-mapped piecewise between them. Whatever the copy length, the
 * thread therefore keeps the same relationship to the paragraph, the title and
 * each drawing that it has in production: it passes the paragraph on the open
 * right-hand side, goes behind the same drawings and swings around the title
 * the same way.
 */

const SECTION_BOTTOM_EPSILON = 0.5;

function resolveLandmark(
  layout: MeasuredLayout,
  id: PhoneCaseId,
  ref: string,
): number | null {
  const frame = getRect(layout, `case.study.${id}`);
  if (ref === "section.top") return frame.top;
  if (ref === "section.bottom") return frame.bottom;

  const dot = ref.lastIndexOf(".");
  const name = ref.slice(0, dot);
  const edge = ref.slice(dot + 1) as "top" | "bottom";
  const anchor = layout.anchors.get(`case.study.${id}.${name}`);
  if (!anchor) return null;
  return edge === "top" ? anchor.rect.top : anchor.rect.bottom;
}

/** Live y for every landmark that exists, kept strictly increasing. */
function liveLandmarks(
  layout: MeasuredLayout,
  id: PhoneCaseId,
  data: PhoneRouteData,
) {
  const result: { prod: number; live: number }[] = [];
  for (const [prod, ref] of data.landmarks) {
    const live = resolveLandmark(layout, id, ref);
    if (live === null || !Number.isFinite(live)) continue;
    const last = result[result.length - 1];
    if (last && (live <= last.live + 1 || prod <= last.prod)) continue;
    result.push({ prod, live });
  }
  return result;
}

/**
 * Smooth, strictly monotone map from production y to live y (Fritsch-Carlson
 * monotone cubic through the landmarks). A piecewise-linear map would change
 * slope at every landmark and put a visible kink in the thread there; this
 * one stretches the route gradually, so the curvature stays natural.
 */
function makeYMap(marks: { prod: number; live: number }[]) {
  const n = marks.length;
  if (n < 2) return (py: number) => py;

  const h: number[] = [];
  const delta: number[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    h.push(marks[i + 1].prod - marks[i].prod);
    delta.push((marks[i + 1].live - marks[i].live) / h[i]);
  }
  const m: number[] = new Array(n).fill(0);
  m[0] = delta[0];
  m[n - 1] = delta[n - 2];
  for (let i = 1; i < n - 1; i += 1) {
    m[i] =
      delta[i - 1] * delta[i] <= 0
        ? 0
        : (3 * (h[i - 1] + h[i])) /
          ((2 * h[i] + h[i - 1]) / delta[i - 1] +
            (h[i] + 2 * h[i - 1]) / delta[i]);
  }
  for (let i = 0; i < n - 1; i += 1) {
    if (delta[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / delta[i];
    const b = m[i + 1] / delta[i];
    const r = Math.hypot(a, b);
    if (r > 3) {
      m[i] = (3 * a * delta[i]) / r;
      m[i + 1] = (3 * b * delta[i]) / r;
    }
  }

  return (py: number) => {
    if (py <= marks[0].prod) return marks[0].live + (py - marks[0].prod) * m[0];
    if (py >= marks[n - 1].prod) {
      return marks[n - 1].live + (py - marks[n - 1].prod) * m[n - 1];
    }
    let i = 0;
    while (py > marks[i + 1].prod) i += 1;
    const t = (py - marks[i].prod) / h[i];
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * marks[i].live +
      (t3 - 2 * t2 + t) * h[i] * m[i] +
      (-2 * t3 + 3 * t2) * marks[i + 1].live +
      (t3 - t2) * h[i] * m[i + 1]
    );
  };
}

const fmt = (value: number) => Number(value.toFixed(2)).toString();

/**
 * Centripetal Catmull-Rom through `pts`, written as cubic Beziers. The first
 * and last tangents are vertical so the thread joins the neighbouring sections
 * the way every other segment of the thread does.
 */
export function smoothPath(pts: Point[]): string {
  if (pts.length < 2) return "";
  const alpha = 0.5;
  const dist = (a: Point, b: Point) =>
    Math.max(1e-3, Math.pow(Math.hypot(b.x - a.x, b.y - a.y), alpha));

  let d = `M ${fmt(pts[0].x)} ${fmt(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p0 = pts[i - 1];
    const p3 = pts[i + 2];
    const span = Math.hypot(p2.x - p1.x, p2.y - p1.y);

    let c1: Point;
    let c2: Point;

    if (!p0) {
      // Vertical start tangent.
      c1 = { x: p1.x, y: p1.y + span / 3 };
    } else {
      const d0 = dist(p0, p1);
      const d1 = dist(p1, p2);
      const m1 = {
        x: (p1.x - p0.x) / d0 - (p2.x - p0.x) / (d0 + d1) + (p2.x - p1.x) / d1,
        y: (p1.y - p0.y) / d0 - (p2.y - p0.y) / (d0 + d1) + (p2.y - p1.y) / d1,
      };
      c1 = { x: p1.x + (m1.x * d1) / 3, y: p1.y + (m1.y * d1) / 3 };
    }

    if (!p3) {
      // Vertical end tangent.
      c2 = { x: p2.x, y: p2.y - span / 3 };
    } else {
      const d1 = dist(p1, p2);
      const d2 = dist(p2, p3);
      const m2 = {
        x: (p2.x - p1.x) / d1 - (p3.x - p1.x) / (d1 + d2) + (p3.x - p2.x) / d2,
        y: (p2.y - p1.y) / d1 - (p3.y - p1.y) / (d1 + d2) + (p3.y - p2.y) / d2,
      };
      c2 = { x: p2.x - (m2.x * d1) / 3, y: p2.y - (m2.y * d1) / 3 };
    }

    // Never let a control point run backwards past its neighbour vertically
    // by more than the span; keeps long hidden stretches from looping.
    c1.y = clamp(
      c1.y,
      Math.min(p1.y, p2.y) - span,
      Math.max(p1.y, p2.y) + span,
    );
    c2.y = clamp(
      c2.y,
      Math.min(p1.y, p2.y) - span,
      Math.max(p1.y, p2.y) + span,
    );

    d += ` C ${fmt(c1.x)} ${fmt(c1.y)} ${fmt(c2.x)} ${fmt(c2.y)} ${fmt(p2.x)} ${fmt(p2.y)}`;
  }
  return d;
}

type Node = { p: Point; t: Point };

const unit = (x: number, y: number): Point => {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
};

/**
 * One cubic between two nodes that each carry a position and a unit tangent.
 * Handle length follows the distance travelled along each tangent, so a quarter
 * turn stays a clean quarter turn and a straight run stays straight.
 */
function hermite(a: Node, b: Node): Point[] {
  const dx = b.p.x - a.p.x;
  const dy = b.p.y - a.p.y;
  const d = Math.hypot(dx, dy);
  const handle = (t: Point) =>
    Math.max(0.18 * d, 0.55 * Math.abs(t.x * dx + t.y * dy));
  const h0 = handle(a.t);
  const h1 = handle(b.t);
  return [
    a.p,
    { x: a.p.x + a.t.x * h0, y: a.p.y + a.t.y * h0 },
    { x: b.p.x - b.t.x * h1, y: b.p.y - b.t.y * h1 },
    b.p,
  ];
}

/**
 * KABRI on a phone: the production route, except that the part that crosses
 * the floor plan and the two documents is rebuilt from the live anchors so the
 * thread
 *   - enters through the centre of the north door (heading straight down),
 *   - runs down the hall and leaves through the centre of the east door
 *     (heading straight right),
 *   - passes through the centre of the estimate (lease) and
 *   - through the centre of the before/after drawing (inspection),
 * then rejoins the production route on the right margin below them.
 * Returns null (production route unchanged) if an anchor is missing or the
 * layout is too odd for the chain to make sense.
 */
function kabriThroughDoors(
  layout: MeasuredLayout,
  segs: Point[][],
): Point[][] | null {
  const ids = ["door.north", "door.east", "lease", "inspection", "flat"];
  if (!ids.every((name) => layout.anchors.has(`case.study.kabri.${name}`))) {
    return null;
  }

  const N = anchorPoint(layout, "case.study.kabri.door.north");
  const E = anchorPoint(layout, "case.study.kabri.door.east");
  const L = anchorPoint(layout, "case.study.kabri.lease");
  const I = anchorPoint(layout, "case.study.kabri.inspection");
  const flat = getRect(layout, "case.study.kabri.flat");
  const lease = getRect(layout, "case.study.kabri.lease");

  const entry = segs[1];
  const p = entry[3];
  const tp = unit(entry[3].x - entry[2].x, entry[3].y - entry[2].y);
  const tail = segs[8][3];

  const finite = [N, E, L, I, p, tail].every(
    (pt) => Number.isFinite(pt.x) && Number.isFinite(pt.y),
  );
  if (
    !finite ||
    N.y < p.y + 16 ||
    E.y < N.y + 24 ||
    flat.bottom < E.y + 10 ||
    L.y <= flat.bottom ||
    I.y > tail.y - 10 ||
    layout.width - 8 < E.x + 8
  ) {
    return null;
  }

  // Hall: down from the north door, one quarter turn, then straight east.
  const r = clamp(0.155 * (E.y - N.y), 10, 24);

  // Outside the east door: out to the right rail, down past the floor plan,
  // back left above the estimate, round its left edge and into its centre.
  const gap = lease.top - flat.bottom;
  const yTop = Math.min(flat.bottom + clamp(0.5 * gap, 14, 34), L.y - 24);
  if (yTop <= flat.bottom + 6) return null;

  const rail = Math.max(
    E.x + 8,
    Math.min(layout.width - 8, E.x + 0.6 * (layout.width - E.x)),
  );
  const hookX = clamp(lease.left - 8, 8, Math.max(8, L.x - 30));
  const x3 = hookX + Math.max(50, 0.5 * (rail - hookX));

  // Before the north door: leave the production bulge, come in under the
  // paragraph and drop onto the door from straight above.
  const Q = {
    x: N.x + clamp(0.4 * (p.x - N.x), 30, 90),
    y: p.y + 0.55 * (N.y - p.y),
  };

  const nodes: Node[] = [
    { p, t: tp },
    { p: Q, t: unit(-1, 0.2) },
    { p: N, t: { x: 0, y: 1 } },
    { p: { x: N.x, y: E.y - r }, t: { x: 0, y: 1 } },
    { p: { x: N.x + r, y: E.y }, t: { x: 1, y: 0 } },
    { p: E, t: { x: 1, y: 0 } },
    {
      p: { x: rail, y: flat.bottom + 0.4 * (yTop - flat.bottom) },
      t: { x: 0, y: 1 },
    },
    { p: { x: x3, y: yTop }, t: { x: -1, y: 0 } },
    { p: { x: hookX, y: yTop + 0.5 * (L.y - yTop) }, t: { x: 0, y: 1 } },
    { p: L, t: { x: 1, y: 0 } },
    { p: I, t: { x: 1, y: 0 } },
    { p: tail, t: { x: 0, y: 1 } },
  ];

  const chain: Point[][] = [];
  for (let i = 0; i < nodes.length - 1; i += 1) {
    chain.push(hermite(nodes[i], nodes[i + 1]));
  }

  // Keep the two opening sweeps and everything from the right margin down.
  return [segs[0], segs[1], ...chain, ...segs.slice(9)];
}

/** x where a phone case-study route begins (the entry the previous one meets). */
export function phoneEntryX(layout: MeasuredLayout, id: PhoneCaseId) {
  const frame = getRect(layout, `case.study.${id}`);
  const first = PHONE_CASE_ROUTES[id].segments[0];
  return frame.left + first[0] * frame.width;
}

/**
 * The route for one case study on a phone, from `start` (where the previous
 * section ended) to the bottom edge of the section.
 *
 * The route is a short chain of cubic Beziers (a few long sweeps, like the
 * hand-drawn original). Their control points are mapped onto the live layout:
 * x scales with the page width, y goes through the smooth landmark map. Both
 * ends are vertical so every section joins its neighbours without a corner.
 */
export function buildPhoneCasePath(
  layout: MeasuredLayout,
  id: PhoneCaseId,
  start: Point,
): string {
  const data = PHONE_CASE_ROUTES[id];
  const frame = getRect(layout, `case.study.${id}`);
  const mapY = makeYMap(liveLandmarks(layout, id, data));
  const X = (xf: number) => frame.left + xf * frame.width;

  let segs = data.segments.map((seg) => {
    const p: Point[] = [];
    for (let i = 0; i < 8; i += 2) {
      p.push({ x: X(seg[i]), y: mapY(seg[i + 1]) });
    }
    return p;
  });

  // KABRI: thread through the door centres and the centres of the documents.
  if (id === "kabri") segs = kabriThroughDoors(layout, segs) ?? segs;

  // Pin the very end to the section's bottom edge.
  const lastSeg = segs[segs.length - 1];
  const bottom = frame.bottom - SECTION_BOTTOM_EPSILON;
  const shift = bottom - lastSeg[3].y;
  lastSeg[3] = { x: lastSeg[3].x, y: bottom };
  lastSeg[2] = { x: lastSeg[2].x, y: lastSeg[2].y + shift };

  const first = segs[0];
  let d = `M ${fmt(start.x)} ${fmt(start.y)}`;
  const gap = first[0].y - start.y;
  if (gap > 8) {
    // Vertical-to-vertical S from where the previous section ended.
    const k = gap * 0.5;
    d += ` C ${fmt(start.x)} ${fmt(start.y + k)} ${fmt(first[0].x)} ${fmt(first[0].y - k)} ${fmt(first[0].x)} ${fmt(first[0].y)}`;
  } else if (Math.abs(first[0].x - start.x) > 0.5) {
    d += ` L ${fmt(first[0].x)} ${fmt(first[0].y)}`;
  }
  for (const [p0, p1, p2, p3] of segs) {
    void p0;
    d += ` C ${fmt(p1.x)} ${fmt(p1.y)} ${fmt(p2.x)} ${fmt(p2.y)} ${fmt(p3.x)} ${fmt(p3.y)}`;
  }
  return d;
}
