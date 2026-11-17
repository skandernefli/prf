"use client";

import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { useEffect, useRef } from "react";

import styles from "../kabri-context.module.css";
import { measureThreadPoints, smoothThreadPath } from "./kabri-thread-path";
import {
  PHONE_QUERY,
  PHONE_THREAD_ROUTE,
  WIDE_THREAD_ROUTE,
} from "./kabri-thread-route";
import { buildKabriScenes } from "./kabri-thread-scenes";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const PEN_IDLE_MS = 160;

export function KabriThread() {
  const pathSvgRef = useRef<SVGSVGElement>(null);
  const penSvgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const penRef = useRef<SVGGElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const update = () => ScrollTrigger.update();
    lenis.on("scroll", update);
    ScrollTrigger.update();

    return () => lenis.off("scroll", update);
  }, [lenis]);

  useEffect(() => {
    const pathSvg = pathSvgRef.current;
    const penSvg = penSvgRef.current;
    const path = pathRef.current;
    const pen = penRef.current;
    const flow = pathSvg?.parentElement;

    if (!pathSvg || !penSvg || !path || !pen || !flow) return;

    let disposed = false;
    let frame = 0;
    let hideTimer: number | null = null;
    let timeline: gsap.core.Timeline | null = null;

    const clearHideTimer = () => {
      if (hideTimer !== null) {
        window.clearTimeout(hideTimer);
        hideTimer = null;
      }
    };

    const hidePen = () => {
      clearHideTimer();
      pen.style.opacity = "0";
    };

    const placePen = (progress: number) => {
      const total = path.getTotalLength();
      if (!total) return;

      const point = path.getPointAtLength(total * progress);
      pen.setAttribute(
        "transform",
        `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`,
      );

      if (progress <= 0.0001 || progress >= 0.9999) {
        hidePen();
        return;
      }

      pen.style.opacity = "1";
      clearHideTimer();
      hideTimer = window.setTimeout(hidePen, PEN_IDLE_MS);
    };

    const rebuild = () => {
      if (disposed) return;

      const width = flow.clientWidth;
      const height = flow.clientHeight;
      if (!width || !height) return;

      timeline?.scrollTrigger?.kill();
      timeline?.kill();
      timeline = null;
      hidePen();

      const isPhone = window.matchMedia(PHONE_QUERY).matches;
      const route = isPhone ? PHONE_THREAD_ROUTE : WIDE_THREAD_ROUTE;
      const measured = measureThreadPoints(flow, route);
      const d = smoothThreadPath(measured.map(({ point }) => point));

      pathSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      penSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      path.setAttribute("d", d);

      const reduceMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
      if (reduceMotion) {
        gsap.set(path, { drawSVG: "100%" });
        hidePen();
        return;
      }

      const start = flow.querySelector<HTMLElement>(
        '[data-thread-anchor="start"]',
      );
      const end = flow.querySelector<HTMLElement>('[data-thread-anchor="end"]');

      if (!start || !end) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[kabri-thread] start/end anchors are missing");
        }
        return;
      }

      gsap.set(path, { drawSVG: "0%" });
      gsap.set(pen, { opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: start,
          start: "top 75%",
          endTrigger: end,
          end: "top 75%",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        path,
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 1 },
      );

      tl.eventCallback("onUpdate", () => placePen(tl.progress()));

      timeline = tl;
      ScrollTrigger.refresh();
      placePen(tl.progress());

      buildKabriScenes(flow, { path, timeline: tl, measured });
    };

    const schedule = () => {
      if (disposed || frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        rebuild();
      });
    };

    schedule();
    void document.fonts?.ready.then(schedule);
    window.addEventListener("load", schedule);
    window.addEventListener("resize", schedule);

    const observer = new ResizeObserver(schedule);
    observer.observe(flow);

    const phoneQuery = window.matchMedia(PHONE_QUERY);
    phoneQuery.addEventListener("change", schedule);

    return () => {
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      clearHideTimer();
      observer.disconnect();
      phoneQuery.removeEventListener("change", schedule);
      window.removeEventListener("load", schedule);
      window.removeEventListener("resize", schedule);
      timeline?.scrollTrigger?.kill();
      timeline?.kill();
      timeline = null;
    };
  }, []);

  return (
    <>
      <svg
        ref={pathSvgRef}
        className={styles.threadPaths}
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path ref={pathRef} className={styles.threadStroke} />
      </svg>

      <svg
        ref={penSvgRef}
        className={styles.threadPenLayer}
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <g
          ref={penRef}
          className={styles.threadPenGroup}
          transform="translate(0 0)"
          style={{ opacity: 0 }}
        >
          <circle className={styles.threadPenRing} r="9" />
          <circle className={styles.threadPenCore} r="3" />
        </g>
      </svg>
    </>
  );
}
