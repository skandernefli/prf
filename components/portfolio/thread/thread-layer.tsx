"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { THREAD_UPDATED_EVENT } from "./thread-dom";
import { buildThreadModel } from "./thread-geometry";
import { measureLayout } from "./thread-measure";
import {
  CONCLUSION_CLIP_ID,
  MARKER_DEFS,
  buildFrame,
  segmentsOn,
  type SegmentDef,
  type ThreadFrame,
} from "./thread-segments";

const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const HERO_BACK_SEGMENTS = segmentsOn("hero-back");
const HERO_FRONT_SEGMENTS = segmentsOn("hero-front");
const PAGE_SEGMENTS = segmentsOn("page");

type HeroSlots = {
  back: HTMLElement | null;
  front: HTMLElement | null;
};

const bind =
  <T extends Element>(store: Map<string, T>, id: string) =>
  (element: T | null) => {
    if (element) store.set(id, element);
    else store.delete(id);
  };

export function ThreadLayer() {
  const mounted = useSyncExternalStore(
    subscribeToClient,
    getClientSnapshot,
    getServerSnapshot,
  );

  const slots: HeroSlots = mounted
    ? {
        back: document.querySelector<HTMLElement>(
          '[data-thread-slot="hero-back"]',
        ),
        front: document.querySelector<HTMLElement>(
          '[data-thread-slot="hero-front"]',
        ),
      }
    : { back: null, front: null };

  // The DOM is created once from the static segment table; the effect below
  // only updates attributes, so GSAP can hold on to these elements.
  const pathRefs = useRef(new Map<string, SVGPathElement>());
  const markerRefs = useRef(new Map<string, SVGGElement>());
  const pageSvgRef = useRef<SVGSVGElement>(null);
  const backSvgRef = useRef<SVGSVGElement>(null);
  const frontSvgRef = useRef<SVGSVGElement>(null);
  const clipRectRef = useRef<SVGRectElement>(null);
  const originRef = useRef<SVGCircleElement>(null);
  const terminalRingRef = useRef<SVGCircleElement>(null);
  const terminalCoreRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!mounted) return;

    const root = document.querySelector<HTMLElement>(".portfolio");
    if (!root) return;

    let model: ReturnType<typeof buildThreadModel> | null = null;
    let lastSignature = "";
    let disposed = false;

    const apply = (frame: ThreadFrame) => {
      let changed = false;

      const set = (
        element: Element | null | undefined,
        name: string,
        value: string,
      ) => {
        if (!element || element.getAttribute(name) === value) return;
        element.setAttribute(name, value);
        changed = true;
      };

      const pageSvg = pageSvgRef.current;
      if (pageSvg) {
        set(pageSvg, "viewBox", `0 0 ${frame.width} ${frame.height}`);
        pageSvg.style.width = `${frame.width}px`;
        pageSvg.style.height = `${frame.height}px`;
      }

      const heroViewBox = `0 0 ${frame.width} ${frame.heroHeight}`;
      set(backSvgRef.current, "viewBox", heroViewBox);
      set(frontSvgRef.current, "viewBox", heroViewBox);

      for (const [id, d] of Object.entries(frame.paths)) {
        set(pathRefs.current.get(id), "d", d);
      }

      set(originRef.current, "cx", String(frame.origin.x));
      set(originRef.current, "cy", String(frame.origin.y));

      const clip = frame.conclusionClip;
      set(clipRectRef.current, "x", String(clip.left));
      set(clipRectRef.current, "y", String(clip.top));
      set(clipRectRef.current, "width", String(clip.width));
      set(clipRectRef.current, "height", String(clip.height));

      for (const marker of frame.markers) {
        const group = markerRefs.current.get(marker.id);
        if (!group) continue;
        const [ring, core] = Array.from(group.children);

        set(group, "data-thread-progress", String(marker.progress));
        set(ring, "cx", String(marker.cx));
        set(ring, "cy", String(marker.cy));
        set(ring, "r", String(marker.radius));
        set(core, "cx", String(marker.cx));
        set(core, "cy", String(marker.cy));
        set(core, "r", String(marker.core));
      }

      for (const element of [
        terminalRingRef.current,
        terminalCoreRef.current,
      ]) {
        set(element, "cx", String(frame.terminal.x));
        set(element, "cy", String(frame.terminal.y));
      }

      return changed;
    };

    const renderThread = () => {
      if (disposed) return;

      const layout = measureLayout(root);

      if (model && layout.signature === lastSignature) return;

      model = buildThreadModel(layout, model ?? undefined);
      lastSignature = layout.signature;

      if (apply(buildFrame(model))) {
        root.dispatchEvent(
          new CustomEvent(THREAD_UPDATED_EVENT, { bubbles: true }),
        );
      }
    };

    renderThread();

    const observer = new ResizeObserver(renderThread);
    observer.observe(root);

    window.addEventListener("resize", renderThread);

    void document.fonts.ready.then(() => {
      if (!disposed) renderThread();
    });

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("resize", renderThread);
    };
  }, [mounted]);

  const renderPath = (segment: SegmentDef) => (
    <path
      key={segment.id}
      ref={bind(pathRefs.current, segment.id)}
      className={segment.className}
      d={segment.initialD ?? ""}
      clipPath={segment.clipId ? `url(#${segment.clipId})` : undefined}
      data-thread-segment={segment.id}
      data-thread-section={segment.section}
      data-thread-role={segment.role}
      data-thread-order={segment.order}
    />
  );

  return (
    <>
      {mounted &&
        slots.back &&
        createPortal(
          <svg
            ref={backSvgRef}
            className="hero-thread-svg"
            data-thread-scene="hero"
            data-thread-layer="back"
            viewBox="0 0 1425 900"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {HERO_BACK_SEGMENTS.map(renderPath)}

            <circle
              ref={originRef}
              className="thread-origin-dot"
              cx="0"
              cy="0"
              r="3.2"
            />
          </svg>,
          slots.back,
        )}

      {mounted &&
        slots.front &&
        createPortal(
          <svg
            ref={frontSvgRef}
            className="hero-thread-svg"
            data-thread-scene="hero"
            data-thread-layer="front"
            viewBox="0 0 1425 900"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {HERO_FRONT_SEGMENTS.map(renderPath)}
          </svg>,
          slots.front,
        )}

      <svg
        ref={pageSvgRef}
        className="thread-layer"
        viewBox="0 0 1425 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={CONCLUSION_CLIP_ID}>
            <rect ref={clipRectRef} x="0" y="0" width="0" height="0" />
          </clipPath>
        </defs>

        {PAGE_SEGMENTS.map(renderPath)}

        <g>
          {MARKER_DEFS.map((marker) => (
            <g
              key={marker.id}
              ref={bind(markerRefs.current, marker.id)}
              data-thread-marker={marker.id}
              data-thread-section={marker.section}
              data-thread-on={marker.segment}
              data-thread-progress="0"
            >
              <circle className="thread-marker" cx="0" cy="0" r="0" />
              <circle className="thread-marker-core" cx="0" cy="0" r="0" />
            </g>
          ))}
        </g>

        {/* The pen: rides the tip of the thread while it is being drawn.
            Positioned by the motion layer (see motion/thread-pen.ts). */}
        <g
          className="thread-pen-group"
          data-thread-pen
          transform="translate(0 0)"
        >
          <circle className="thread-pen" cx="0" cy="0" r="9" />
          <circle className="thread-pen-core" cx="0" cy="0" r="3" />
        </g>

        <g className="thread-terminal-group">
          <circle
            ref={terminalRingRef}
            className="thread-terminal"
            cx="0"
            cy="0"
            r="7"
          />
          <circle
            ref={terminalCoreRef}
            className="thread-terminal-core"
            cx="0"
            cy="0"
            r="2.6"
          />
        </g>
      </svg>
    </>
  );
}
