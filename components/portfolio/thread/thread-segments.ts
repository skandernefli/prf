import type { ThreadModel } from "./thread-geometry";
import {
  closestPointOnPolyline,
  cumulativeLengths,
  type Point,
  type Rect,
} from "./thread-path";

/**
 * The thread as a flat list of named, ordered segments.
 *
 * The geometry code (thread-geometry.ts) computes the route; this file only
 * decides how that route is *presented* in the DOM:
 *
 *   - one <path> per segment (no compound paths, no string joins),
 *   - a stable id, section, role and travel order on every path,
 *   - markers that know which segment they sit on and how far along it,
 *   - a static table, so the DOM is created once and only attributes change.
 *
 * A GSAP scene can therefore do:
 *
 *   const paths = getThreadSegments(root, "capabilities");
 *   // -> [entry, product, ai, exit] in travel order, ready for drawSVG
 */

export type ThreadSection =
  | "hero"
  | "work"
  | "capabilities"
  | "kabri"
  | "norma"
  | "shopops"
  | "legalexy"
  | "why"
  | "conclusion"
  | "footer";

/**
 * Where a segment is mounted.
 * The hero no longer carries any thread; every segment lives in the page SVG.
 * The `hero-back` / `hero-front` values are kept for API compatibility.
 */
export type ThreadSurface = "hero-back" | "hero-front" | "page";

/**
 * "trunk"  - the single continuous thread (each trunk segment starts where
 *            the previous one ends).
 * "branch" - runs in parallel with the trunk (the AI half-ring).
 */
export type ThreadRole = "trunk" | "branch";

export const CONCLUSION_CLIP_ID = "thread-conclusion-clip";

type Route = { d: string; points: Point[] };

export type SegmentDef = {
  id: string;
  section: ThreadSection;
  surface: ThreadSurface;
  role: ThreadRole;
  /** 0-based position along the thread. Unique. Parallel branches get their own slot right after the trunk piece they run beside. */
  order: number;
  /** Class names are kept exactly as the stylesheet expects them. */
  className: string;
  /** Painted before the first measurement so the hero never flashes empty. */
  initialD?: string;
  clipId?: string;
  route: (model: ThreadModel) => Route;
};

/**
 * Listed in PAINT order (== DOM order, which is SVG z-order). `order` is the
 * travel order and is independent of it.
 *
 * The contact / footer section carries no thread: the whole stroke ends with
 * the last point of the conclusion fingerprint.
 */
export const SEGMENT_DEFS: readonly SegmentDef[] = [
  {
    id: "work",
    section: "work",
    surface: "page",
    role: "trunk",
    order: 0,
    className: "thread-path",
    route: (m) => m.work,
  },
  {
    id: "capabilities.entry",
    section: "capabilities",
    surface: "page",
    role: "trunk",
    order: 1,
    className: "thread-path",
    route: (m) => m.capsEntry,
  },
  {
    id: "capabilities.product",
    section: "capabilities",
    surface: "page",
    role: "trunk",
    order: 2,
    className: "thread-path",
    route: (m) => m.capsProduct,
  },
  {
    id: "capabilities.exit",
    section: "capabilities",
    surface: "page",
    role: "trunk",
    order: 4,
    className: "thread-path",
    route: (m) => m.capsExit,
  },
  {
    id: "kabri",
    section: "kabri",
    surface: "page",
    role: "trunk",
    order: 5,
    className: "thread-path",
    route: (m) => m.projects.kabri,
  },
  {
    id: "norma",
    section: "norma",
    surface: "page",
    role: "trunk",
    order: 6,
    className: "thread-path",
    route: (m) => m.projects.norma,
  },
  {
    id: "shopops",
    section: "shopops",
    surface: "page",
    role: "trunk",
    order: 7,
    className: "thread-path",
    route: (m) => m.projects.shopops,
  },
  {
    id: "legalexy",
    section: "legalexy",
    surface: "page",
    role: "trunk",
    order: 8,
    className: "thread-path",
    route: (m) => m.projects.legalexy,
  },
  {
    id: "why",
    section: "why",
    surface: "page",
    role: "trunk",
    order: 9,
    className: "thread-path",
    route: (m) => m.why,
  },
  {
    id: "capabilities.ai",
    section: "capabilities",
    surface: "page",
    role: "branch",
    order: 3,
    className: "thread-branch",
    route: (m) => m.capsAi,
  },
  {
    id: "conclusion",
    section: "conclusion",
    surface: "page",
    role: "trunk",
    order: 10,
    className: "thread-fingerprint",
    clipId: CONCLUSION_CLIP_ID,
    route: (m) => m.conclusion,
  },
];

export const SEGMENT_IDS = SEGMENT_DEFS.map(({ id }) => id);

export const segmentsOn = (surface: ThreadSurface) =>
  SEGMENT_DEFS.filter((segment) => segment.surface === surface);

export type MarkerDef = {
  id: string;
  /** The segment this marker sits on. */
  segment: string;
  section: ThreadSection;
};

/** Same order the geometry emits them in. */
export const MARKER_DEFS: readonly MarkerDef[] = [
  ...[1, 2, 3, 4, 5].flatMap((index): MarkerDef[] => [
    {
      id: `capabilities.product.${index}`,
      segment: "capabilities.product",
      section: "capabilities",
    },
    {
      id: `capabilities.ai.${index}`,
      segment: "capabilities.ai",
      section: "capabilities",
    },
  ]),
  ...[1, 2, 3, 4, 5].map(
    (index): MarkerDef => ({
      id: `why.point.${index}`,
      segment: "why",
      section: "why",
    }),
  ),
  {
    id: "case.study.kabri.door.north",
    segment: "kabri",
    section: "kabri",
  },
  {
    id: "case.study.kabri.door.east",
    segment: "kabri",
    section: "kabri",
  },
];

export type FrameMarker = {
  id: string;
  cx: number;
  cy: number;
  radius: number;
  core: number;
  /** 0..1 position of the marker along its segment. */
  progress: number;
};

/** Everything the DOM needs for one layout, already keyed by id. */
export type ThreadFrame = {
  width: number;
  height: number;
  heroHeight: number;
  paths: Record<string, string>;
  markers: FrameMarker[];
  conclusionClip: Rect;
  /**
   * Start of the whole thread (previously the hero origin dot position; now
   * the beginning of the work route). Kept on the type for downstream
   * consumers.
   */
  origin: Point;
  /**
   * Last point of the thread. With no footer route this is exactly the end of
   * the conclusion fingerprint.
   */
  terminal: Point;
};

const roundProgress = (value: number) => Math.round(value * 10000) / 10000;

function progressAlong(points: Point[], target: Point) {
  if (points.length < 2) return 0;
  const cumulative = cumulativeLengths(points);
  const total = cumulative[cumulative.length - 1];
  if (total <= 0) return 0;
  const { along } = closestPointOnPolyline(points, cumulative, target);
  return roundProgress(Math.min(1, Math.max(0, along / total)));
}

export function buildFrame(model: ThreadModel): ThreadFrame {
  const routes = new Map<string, Route>();
  const paths: Record<string, string> = {};

  for (const segment of SEGMENT_DEFS) {
    const route = segment.route(model);
    routes.set(segment.id, route);
    paths[segment.id] = route.d;
  }

  const markersById = new Map(
    model.markers.map((marker) => [marker.id, marker]),
  );
  const markers = MARKER_DEFS.map(({ id, segment }): FrameMarker => {
    const marker = markersById.get(id);
    if (!marker) {
      throw new Error(`Thread layer expected marker "${id}" from the model.`);
    }
    const route = routes.get(segment);
    return {
      id,
      cx: marker.point.x,
      cy: marker.point.y,
      radius: marker.radius,
      core: marker.core,
      progress: route ? progressAlong(route.points, marker.point) : 0,
    };
  });

  return {
    width: model.width,
    height: model.height,
    heroHeight: model.heroHeight,
    paths,
    markers,
    conclusionClip: model.conclusion.rect,
    origin: model.work.start,
    terminal: model.terminal,
  };
}
