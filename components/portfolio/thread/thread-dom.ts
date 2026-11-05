import type { ThreadRole, ThreadSection } from "./thread-segments";

/**
 * DOM contract of the rendered thread. Scenes should use these helpers instead
 * of hard-coding selectors, so the markup can change without touching GSAP code.
 *
 * Every path:    data-thread-segment   stable id, e.g. "capabilities.product"
 *                data-thread-section   which part of the page it belongs to
 *                data-thread-role      "trunk" | "branch"
 *                data-thread-order     travel order along the thread (0..n)
 * Every marker:  data-thread-marker    anchor id, e.g. "case.study.kabri.door.east"
 *                data-thread-section, and data-thread-on = id of the path it sits on
 *                data-thread-progress  0..1 position along that path
 *
 * The thread is rebuilt when the layout changes (resize, fonts). Path `d`
 * values then change, so any length cached by an animation is stale: listen
 * for THREAD_UPDATED_EVENT and rebuild or refresh the affected scenes.
 */

export const THREAD_UPDATED_EVENT = "thread:updated";

const byOrder = (a: SVGPathElement, b: SVGPathElement) =>
  Number(a.dataset.threadOrder) - Number(b.dataset.threadOrder);

/** Paths in travel order, optionally limited to one section and/or role. */
export function getThreadSegments(
  root: ParentNode,
  section?: ThreadSection,
  role?: ThreadRole,
): SVGPathElement[] {
  const selector = [
    "path[data-thread-segment]",
    section ? `[data-thread-section="${section}"]` : "",
    role ? `[data-thread-role="${role}"]` : "",
  ].join("");

  return Array.from(root.querySelectorAll<SVGPathElement>(selector)).sort(
    byOrder,
  );
}

export function getThreadSegment(
  root: ParentNode,
  id: string,
): SVGPathElement | null {
  return root.querySelector<SVGPathElement>(
    `path[data-thread-segment="${id}"]`,
  );
}

/** Markers in DOM order, optionally limited to one section. */
export function getThreadMarkers(
  root: ParentNode,
  section?: ThreadSection,
): SVGGElement[] {
  const selector = [
    "g[data-thread-marker]",
    section ? `[data-thread-section="${section}"]` : "",
  ].join("");

  return Array.from(root.querySelectorAll<SVGGElement>(selector));
}

export const markerProgress = (marker: Element) =>
  Number(marker.getAttribute("data-thread-progress") ?? 0);
