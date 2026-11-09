import { PHONE_CASE_ROUTES, type PhoneRouteData } from "./thread-phone-data";
import { getRect, type MeasuredLayout } from "./thread-measure";
import { clamp, type Point } from "./thread-path";

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

function mapY(py: number, marks: { prod: number; live: number }[]) {
  if (marks.length < 2) return py;
  if (py <= marks[0].prod) return marks[0].live + (py - marks[0].prod);
  for (let i = 1; i < marks.length; i += 1) {
    if (py <= marks[i].prod) {
      const a = marks[i - 1];
      const b = marks[i];
      const t = (py - a.prod) / (b.prod - a.prod);
      return a.live + t * (b.live - a.live);
    }
  }
  const last = marks[marks.length - 1];
  return last.live + (py - last.prod);
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
    c1.y = clamp(c1.y, Math.min(p1.y, p2.y) - span, Math.max(p1.y, p2.y) + span);
    c2.y = clamp(c2.y, Math.min(p1.y, p2.y) - span, Math.max(p1.y, p2.y) + span);

    d += ` C ${fmt(c1.x)} ${fmt(c1.y)} ${fmt(c2.x)} ${fmt(c2.y)} ${fmt(p2.x)} ${fmt(p2.y)}`;
  }
  return d;
}

/** x where a phone case-study route begins (the entry the previous one meets). */
export function phoneEntryX(layout: MeasuredLayout, id: PhoneCaseId) {
  const frame = getRect(layout, `case.study.${id}`);
  const first = PHONE_CASE_ROUTES[id].points[0];
  return frame.left + first[0] * frame.width;
}

/**
 * The route for one case study on a phone, from `start` (where the previous
 * section ended) to the bottom edge of the section.
 */
export function buildPhoneCasePath(
  layout: MeasuredLayout,
  id: PhoneCaseId,
  start: Point,
): string {
  const data = PHONE_CASE_ROUTES[id];
  const frame = getRect(layout, `case.study.${id}`);
  const marks = liveLandmarks(layout, id, data);
  const margin = 6;

  const pts: Point[] = data.points.map(([xf, py]) => ({
    x: clamp(frame.left + xf * frame.width, frame.left + margin, frame.right - margin),
    y: mapY(py, marks),
  }));

  // Pin the very end to the section's bottom edge (the next section starts
  // there) and keep the polyline strictly descending in its first/last vertex.
  const last = pts[pts.length - 1];
  last.y = frame.bottom - SECTION_BOTTOM_EPSILON;
  if (pts.length > 1 && pts[pts.length - 2].y > last.y - 2) {
    pts[pts.length - 2].y = last.y - 2;
  }

  const route: Point[] = [];
  if (start.y < pts[0].y - 1) route.push({ x: start.x, y: start.y });
  else pts[0] = { x: start.x, y: start.y };
  route.push(...pts);

  return smoothPath(route);
}
