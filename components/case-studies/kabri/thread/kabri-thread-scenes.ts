import type { gsap } from "gsap";

import type { ThreadPoint } from "./kabri-thread-path";

export type KabriThreadHandle = {
  path: SVGPathElement;
  timeline: gsap.core.Timeline;
  measured: { id: string; point: ThreadPoint }[];
};

export function buildKabriScenes(
  _root: HTMLElement,
  _thread: KabriThreadHandle,
) {
  // Scene timelines are added here in the animation pass. Both arguments are
  // part of the seam so scene builders can be registered without touching the
  // page or the thread implementation.
  void _root;
  void _thread;
}
