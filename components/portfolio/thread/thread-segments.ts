import { HERO_BACK, HERO_FRONT } from "./route-data";
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
 * The hero thread passes behind and in front of the headline, so it lives in
 * two SVGs portalled into the hero. Everything else lives in the page SVG.
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
 * The hero is 11 pieces split across two layers. This is the order the thread
 * travels through them, i.e. the order a draw-on animation should follow.
 */
const HERO_TRAVEL = [
  { layer: "back", index: 0 },
  { layer: "front", index: 0 },
  { layer: "back", index: 1 },
  { layer: "front", index: 1 },
  { layer: "back", index: 2 },
  { layer: "front", index: 2 },
  { layer: "back", index: 3 },
  { layer: "front", index: 3 },
  { layer: "back", index: 4 },
  { layer: "back", index: 5 },
  { layer: "back", index: 6 },
] as const;

const HERO_SEGMENTS: SegmentDef[] = HERO_TRAVEL.map(
  ({ layer, index }, order) => ({
    id: `hero.${String(order + 1).padStart(2, "0")}`,
    section: "hero",
    surface: layer === "back" ? "hero-back" : "hero-front",
    role: "trunk",
    order,
    className: "thread-path",
    initialD: layer === "back" ? HERO_BACK[index] : HERO_FRONT[index],
    route: (model: ThreadModel) =>
      layer === "back"
        ? { d: model.hero.back[index], points: model.hero.backPoints[index] }
        : { d: model.hero.front[index], points: model.hero.frontPoints[index] },
  }),
);

const HERO_COUNT = HERO_SEGMENTS.length;

/**
 * Listed in PAINT order (== DOM order, which is SVG z-order). This matches the
 * previous layer: every trunk piece, then the AI branch, then the signature,
 * then the footer lead. `order` is the travel order and is independent of it.
 */
export const SEGMENT_DEFS: readonly SegmentDef[] = [
  ...HERO_SEGMENTS,
  {
    id: "work",
    section: "work",
    surface: "page",
    role: "trunk",
    order: HERO_COUNT,
    className: "thread-path",
    route: (m) => m.work,
  },
  {
    id: "capabilities.entry",
    section: "capabilities",
    surface: "page",
    role: "trunk",
    order: HERO_COUNT + 1,
    className: "thread-path",
    route: (m) => m.capsEntry,
  },
  {
    id: "capabilities.product",
    section: "capabilities",
    surface: "page",
    role: "trunk",
    order: HERO_COUNT + 2,
    className: "thread-path",
    route: (m) => m.capsProduct,
  },
  {
    id: "capabilities.exit",
    section: "capabilities",
    surface: "page",
    role: "trunk",
    order: HERO_COUNT + 4,
    className: "thread-path",
    route: (m) => m.capsExit,
  },
  {
    id: "kabri",
    section: "kabri",
    surface: "page",
    role: "trunk",
    order: HERO_COUNT + 5,
    className: "thread-path",
    route: (m) => m.projects.kabri,
  },
  {
    id: "norma",
    section: "norma",
    surface: "page",
    role: "trunk",
    order: HERO_COUNT + 6,
    className: "thread-path",
    route: (m) => m.projects.norma,
  },
  {
    id: "shopops",
    section: "shopops",
    surface: "page",
    role: "trunk",
    order: HERO_COUNT + 7,
    className: "thread-path",
    route: (m) => m.projects.shopops,
  },
  {
    id: "legalexy",
    section: "legalexy",
    surface: "page",
    role: "trunk",
    order: HERO_COUNT + 8,
    className: "thread-path",
    route: (m) => m.projects.legalexy,
  },
  {
    id: "why",
    section: "why",
    surface: "page",
    role: "trunk",
    order: HERO_COUNT + 9,
    className: "thread-path",
    route: (m) => m.why,
  },
  {
    id: "capabilities.ai",
    section: "capabilities",
    surface: "page",
    role: "branch",
    order: HERO_COUNT + 3,
    className: "thread-branch",
    route: (m) => m.capsAi,
  },
  {
    id: "conclusion",
    section: "conclusion",
    surface: "page",
    role: "trunk",
    order: HERO_COUNT + 10,
    className: "thread-fingerprint",
    clipId: CONCLUSION_CLIP_ID,
    route: (m) => m.conclusion,
  },
  {
    id: "footer",
    section: "footer",
    surface: "page",
    role: "trunk",
    order: HERO_COUNT + 11,
    className: "thread-path thread-footer",
    route: (m) => m.footer,
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
  origin: Point;
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
    origin: model.hero.origin,
    terminal: model.terminal,
  };
}
