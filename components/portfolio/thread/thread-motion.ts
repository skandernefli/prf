import { ANCHOR_REGISTRY } from "./thread-anchors";
import type { ThreadModel } from "./thread-geometry";
import { masterTrack } from "./thread-geometry";
import type { MeasuredLayout } from "./thread-measure";
import {
  clamp,
  closestPointOnPolyline,
  cumulativeLengths,
  distance,
  middle,
  pointAtLength,
  type Point,
} from "./thread-path";

export type TrackAnchor = {
  id: string;
  label: string;
  point: Point;
  distance: number;
  progress: number;
};

export type NavigationTrack = {
  points: Point[];
  cumulative: number[];
  total: number;
  anchors: TrackAnchor[];
};

export type AnchorEventState = {
  initialized: boolean;
  lastProgress: number;
  visited: Set<string>;
};

export type AnchorEventDetail = {
  id: string;
  label: string;
  progress: number;
  scrollProgress: number;
};

export function createAnchorEventState(): AnchorEventState {
  return {
    initialized: false,
    lastProgress: 0,
    visited: new Set<string>(),
  };
}

function branchDistanceAtY(branch: readonly Point[], targetY: number) {
  let bestAlong = 0;
  let bestDelta = Infinity;
  let travelled = 0;

  for (let index = 1; index < branch.length; index += 1) {
    const start = branch[index - 1];
    const end = branch[index];
    const segmentLength = distance(start, end);
    const low = Math.min(start.y, end.y);
    const high = Math.max(start.y, end.y);

    if (targetY >= low && targetY <= high) {
      const t =
        Math.abs(end.y - start.y) < 1e-6
          ? 0
          : (targetY - start.y) / (end.y - start.y);
      const y = start.y + (end.y - start.y) * t;
      const delta = Math.abs(y - targetY);

      if (delta < bestDelta) {
        bestDelta = delta;
        bestAlong = travelled + segmentLength * clamp(t, 0, 1);
      }
    }

    travelled += segmentLength;
  }

  return bestAlong;
}

export function buildNavigationTrack(
  model: ThreadModel,
  layout: MeasuredLayout,
): NavigationTrack {
  const points = masterTrack(model);
  const cumulative = cumulativeLengths(points);
  const total = cumulative[cumulative.length - 1] ?? 0;
  const anchors: TrackAnchor[] = [];
  const seen = new Set<string>();

  const splitTop = model.derived.get("capabilities.split.top");
  const splitBottom = model.derived.get("capabilities.split.bottom");
  const productStart = splitTop
    ? closestPointOnPolyline(points, cumulative, splitTop).along
    : 0;
  const productEnd = splitBottom
    ? closestPointOnPolyline(points, cumulative, splitBottom).along
    : 0;
  const productLength = Math.max(0, productEnd - productStart);

  const append = (id: string, label: string, target: Point) => {
    if (seen.has(id)) return;

    // AI dots live on the decorative right half of the ring. Their events are
    // timed from the mirrored y-level on the product half, which is the half
    // the head actually traverses.
    const mirrored =
      id.startsWith("capabilities.ai.") && productLength > 0
        ? productStart +
          clamp(
            branchDistanceAtY(model.capsProduct.points, target.y),
            0,
            productLength,
          )
        : null;
    const closest =
      mirrored === null
        ? closestPointOnPolyline(points, cumulative, target)
        : {
            point: pointAtLength(points, cumulative, mirrored),
            along: mirrored,
            distance: 0,
          };

    if (!Number.isFinite(closest.distance)) return;
    seen.add(id);
    anchors.push({
      id,
      label,
      point: closest.point,
      distance: closest.along,
      progress: total > 0 ? clamp(closest.along / total, 0, 1) : 0,
    });
  };

  for (const anchor of layout.anchors.values()) {
    append(anchor.id, anchor.label, middle(anchor.rect));
  }

  for (const [id, target] of model.derived) {
    const definition = ANCHOR_REGISTRY.find((entry) => entry.id === id);
    append(id, definition?.label ?? id, target);
  }

  anchors.sort((a, b) =>
    a.distance === b.distance
      ? a.id < b.id
        ? -1
        : a.id > b.id
          ? 1
          : 0
      : a.distance - b.distance,
  );

  return { points, cumulative, total, anchors };
}

export function pageScrollProgress() {
  const maxScroll = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  return clamp(window.scrollY / maxScroll, 0, 1);
}

export function headPoint(track: NavigationTrack, progress: number) {
  return pointAtLength(track.points, track.cumulative, track.total * progress);
}

export function reconcileAnchorState(
  state: AnchorEventState,
  track: NavigationTrack,
  progress: number,
) {
  const ids = new Set(track.anchors.map(({ id }) => id));
  for (const id of state.visited) {
    if (!ids.has(id)) state.visited.delete(id);
  }

  for (const anchor of track.anchors) {
    if (anchor.progress <= progress) state.visited.add(anchor.id);
  }

  state.lastProgress = progress;
  state.initialized = true;
}

export function updateAnchorEvents(
  state: AnchorEventState,
  track: NavigationTrack,
  progress: number,
  scrollProgress: number,
) {
  if (!state.initialized) {
    reconcileAnchorState(state, track, progress);
    return;
  }

  if (progress >= state.lastProgress) {
    const crossed = track.anchors.filter(
      (anchor) =>
        !state.visited.has(anchor.id) &&
        anchor.progress > state.lastProgress &&
        anchor.progress <= progress,
    );

    for (const anchor of crossed) {
      state.visited.add(anchor.id);
      const detail: AnchorEventDetail = {
        id: anchor.id,
        label: anchor.label,
        progress: anchor.progress,
        scrollProgress,
      };
      window.dispatchEvent(new CustomEvent<AnchorEventDetail>("thread:anchor", { detail }));
    }

    state.lastProgress = progress;
    return;
  }

  if (progress < state.lastProgress - 0.001) {
    for (const anchor of track.anchors) {
      if (anchor.progress > progress) {
        state.visited.delete(anchor.id);
      }
    }
    state.lastProgress = progress;
  }
}

declare global {
  interface Window {
    __threadDebug?: {
      readonly anchorCount: number;
      readonly progress: number;
      readonly paths: {
        heroBack: readonly string[];
        heroFront: readonly string[];
        page: string;
        branch: string;
        fingerprint: string;
        contact: string;
      };
      readonly rebuilds: number;
      readonly tickMs: number;
      readonly trackLength: number;
      readonly anchors: readonly {
        id: string;
        label: string;
        distance: number;
        progress: number;
      }[];
      readonly keys: Readonly<Record<string, string>>;
    };
  }
}
