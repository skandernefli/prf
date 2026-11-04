"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { HERO_BACK, HERO_FRONT } from "./route-data";
import { createThreadDrawer, DEFAULT_DRAW_RANGES } from "./thread-draw";
import { buildThreadModel, type ThreadModel } from "./thread-geometry";
import { measureLayout } from "./thread-measure";
import {
  buildNavigationTrack,
  createAnchorEventState,
  pageScrollProgress,
  reconcileAnchorState,
  updateAnchorEvents,
  type NavigationTrack,
} from "./thread-motion";

const SVG_NS = "http://www.w3.org/2000/svg";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

type HeroSlots = {
  back: HTMLElement | null;
  front: HTMLElement | null;
};

function createCircle(className: string, radius: number) {
  const circle = document.createElementNS(SVG_NS, "circle");
  circle.setAttribute("class", className);
  circle.setAttribute("r", String(radius));
  return circle;
}

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

  const pageSvgRef = useRef<SVGSVGElement>(null);
  const pagePathRef = useRef<SVGPathElement>(null);
  const aiPathRef = useRef<SVGPathElement>(null);
  const fingerprintPathRef = useRef<SVGPathElement>(null);
  const contactPathRef = useRef<SVGPathElement>(null);
  const clipRectRef = useRef<SVGRectElement>(null);
  const markersRef = useRef<SVGGElement>(null);
  const terminalGroupRef = useRef<SVGGElement>(null);
  const terminalRingRef = useRef<SVGCircleElement>(null);
  const terminalCoreRef = useRef<SVGCircleElement>(null);
  const originRef = useRef<SVGCircleElement>(null);
  const backSvgRef = useRef<SVGSVGElement>(null);
  const frontSvgRef = useRef<SVGSVGElement>(null);
  const backPathRefs = useRef<Array<SVGPathElement | null>>([]);
  const frontPathRefs = useRef<Array<SVGPathElement | null>>([]);

  useEffect(() => {
    if (!mounted) return;

    const root = document.querySelector<HTMLElement>(".portfolio");
    if (!root) return;

    let model: ThreadModel | null = null;
    let track: NavigationTrack | null = null;
    let lastSignature = "";
    let forceBuild = true;
    let started = false;
    let startedTicker = false;
    let rebuilds = 0;
    let tickMs = 0;
    let scrollProgress = 0;
    let disposed = false;
    const eventState = createAnchorEventState();
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);

    // ------------------------------------------------------------------
    // DRAWING: scroll-agnostic. Anything can call drawer.draw(progress)
    // or drawer.drawTo(progress, { duration }).
    // ------------------------------------------------------------------
    const drawer = createThreadDrawer({
      segments: [
        {
          id: "page",
          element: pagePathRef.current,
          range: DEFAULT_DRAW_RANGES.page,
        },
        {
          id: "branch",
          element: aiPathRef.current,
          range: DEFAULT_DRAW_RANGES.branch,
        },
        {
          id: "fingerprint",
          element: fingerprintPathRef.current,
          range: DEFAULT_DRAW_RANGES.fingerprint,
        },
        {
          id: "footer",
          element: contactPathRef.current,
          range: DEFAULT_DRAW_RANGES.footer,
        },
      ],
      terminal: {
        element: terminalGroupRef.current,
        at: DEFAULT_DRAW_RANGES.footer[1],
      },
    });

    // ------------------------------------------------------------------
    // SCROLL DRIVER: the only place scroll is translated into a draw call.
    // ------------------------------------------------------------------
    const driveDrawFromScroll = () => {
      if (reducedMotion.matches) {
        drawer.draw(1); // show the finished thread, no scroll-linked motion
        return;
      }
      drawer.draw(started ? scrollProgress : 0);
    };

    const writeModel = (next: ThreadModel) => {
      const pageSvg = pageSvgRef.current;
      if (pageSvg) {
        pageSvg.setAttribute("viewBox", `0 0 ${next.width} ${next.height}`);
        pageSvg.style.width = `${next.width}px`;
        pageSvg.style.height = `${next.height}px`;
      }

      const heroBackSvg = backSvgRef.current;
      if (heroBackSvg) {
        heroBackSvg.setAttribute(
          "viewBox",
          `0 0 ${next.width} ${next.heroHeight}`,
        );
      }
      const heroFrontSvg = frontSvgRef.current;
      if (heroFrontSvg) {
        heroFrontSvg.setAttribute(
          "viewBox",
          `0 0 ${next.width} ${next.heroHeight}`,
        );
      }

      next.hero.back.forEach((d, index) => {
        backPathRefs.current[index]?.setAttribute("d", d);
      });
      next.hero.front.forEach((d, index) => {
        frontPathRefs.current[index]?.setAttribute("d", d);
      });

      originRef.current?.setAttribute("cx", String(next.hero.origin.x));
      originRef.current?.setAttribute("cy", String(next.hero.origin.y));

      pagePathRef.current?.setAttribute("d", next.pagePath);
      aiPathRef.current?.setAttribute("d", next.capsAi.d);
      fingerprintPathRef.current?.setAttribute("d", next.conclusion.d);
      contactPathRef.current?.setAttribute("d", next.footer.d);

      clipRectRef.current?.setAttribute("x", String(next.conclusion.rect.left));
      clipRectRef.current?.setAttribute("y", String(next.conclusion.rect.top));
      clipRectRef.current?.setAttribute(
        "width",
        String(next.conclusion.rect.width),
      );
      clipRectRef.current?.setAttribute(
        "height",
        String(next.conclusion.rect.height),
      );

      const markerGroups: SVGElement[] = [];
      const markers = markersRef.current;
      if (markers) {
        markers.replaceChildren();
        for (const marker of next.markers) {
          const group = document.createElementNS(SVG_NS, "g");
          const ring = createCircle("thread-marker", marker.radius);
          const core = createCircle("thread-marker-core", marker.core);
          ring.setAttribute("cx", String(marker.point.x));
          ring.setAttribute("cy", String(marker.point.y));
          core.setAttribute("cx", String(marker.point.x));
          core.setAttribute("cy", String(marker.point.y));
          group.append(ring, core);
          markers.append(group);
          markerGroups.push(group);
        }
      }

      terminalRingRef.current?.setAttribute("cx", String(next.terminal.x));
      terminalRingRef.current?.setAttribute("cy", String(next.terminal.y));
      terminalCoreRef.current?.setAttribute("cx", String(next.terminal.x));
      terminalCoreRef.current?.setAttribute("cy", String(next.terminal.y));

      // Geometry changed: tell the drawer, which re-applies the current state.
      drawer.setMarkers(
        markerGroups,
        next.markers.map((marker) => marker.point),
      );
      drawer.refresh();
    };

    const tick = () => {
      if (disposed) return;
      const tickStart = performance.now();
      const layout = measureLayout(root);
      scrollProgress = pageScrollProgress();
      const signatureChanged = layout.signature !== lastSignature;

      if (forceBuild || signatureChanged || !model || !track) {
        model = buildThreadModel(layout, model ?? undefined);
        track = buildNavigationTrack(model, layout);
        writeModel(model);
        reconcileAnchorState(eventState, track, scrollProgress);
        lastSignature = layout.signature;
        forceBuild = false;
        rebuilds += 1;
      }

      driveDrawFromScroll();

      if (track && started) {
        updateAnchorEvents(eventState, track, scrollProgress, scrollProgress);
      }

      tickMs = performance.now() - tickStart;

      if (process.env.NODE_ENV !== "production") {
        window.__threadDebug = {
          get anchorCount() {
            return track?.anchors.length ?? 0;
          },
          get progress() {
            return scrollProgress;
          },
          get paths() {
            return {
              heroBack: model?.hero.back ?? [],
              heroFront: model?.hero.front ?? [],
              page: model?.pagePath ?? "",
              branch: model?.capsAi.d ?? "",
              fingerprint: model?.conclusion.d ?? "",
              footer: model?.footer.d ?? "",
            };
          },
          get rebuilds() {
            return rebuilds;
          },
          get tickMs() {
            return tickMs;
          },
          get trackLength() {
            return track?.total ?? 0;
          },
          get anchors() {
            return (track?.anchors ?? []).map(
              ({ id, label, distance, progress }) => ({
                id,
                label,
                distance,
                progress,
              }),
            );
          },
          get keys() {
            return model?.keys ?? {};
          },
        };
      }
    };

    const markDirty = () => {
      forceBuild = true;
    };

    const start = () => {
      if (started || disposed) return;
      started = true;
      forceBuild = true;
      if (!startedTicker) {
        startedTicker = true;
        gsap.ticker.add(tick);
      }
    };

    const onReady = () => start();
    window.addEventListener("site:ready", onReady, { once: true });
    if (!document.querySelector("[data-site-preloader]")) {
      start();
    }

    const onResize = () => markDirty();
    window.addEventListener("resize", onResize);

    const observer = new ResizeObserver(markDirty);
    observer.observe(root);

    void document.fonts.ready.then(() => markDirty());

    return () => {
      disposed = true;
      window.removeEventListener("site:ready", onReady);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      drawer.destroy();
      if (startedTicker) gsap.ticker.remove(tick);
      if (process.env.NODE_ENV !== "production") {
        delete window.__threadDebug;
      }
    };
  }, [mounted]);

  return (
    <>
      {mounted &&
        slots.back &&
        createPortal(
          <svg
            ref={backSvgRef}
            className="hero-thread-svg"
            viewBox="0 0 1425 900"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {HERO_BACK.map((d, index) => (
              <path
                key={index}
                ref={(element) => {
                  backPathRefs.current[index] = element;
                }}
                className="thread-path"
                d={d}
              />
            ))}
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
            viewBox="0 0 1425 900"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {HERO_FRONT.map((d, index) => (
              <path
                key={index}
                ref={(element) => {
                  frontPathRefs.current[index] = element;
                }}
                className="thread-path"
                d={d}
              />
            ))}
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
          <clipPath id="thread-conclusion-clip">
            <rect ref={clipRectRef} x="0" y="0" width="0" height="0" />
          </clipPath>
        </defs>
        <path ref={pagePathRef} className="thread-path" d="" />
        <path ref={aiPathRef} className="thread-branch" d="" />
        <path
          ref={fingerprintPathRef}
          className="thread-fingerprint"
          d=""
          clipPath="url(#thread-conclusion-clip)"
        />
        <path ref={contactPathRef} className="thread-path thread-footer" d="" />
        <g ref={markersRef} />
        <g ref={terminalGroupRef} className="thread-terminal-group">
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
