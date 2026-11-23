"use client";

import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { useEffect } from "react";

import { restoreMotionWrappers } from "./motion-utils";
import { buildCapabilitiesScene } from "./scenes/capabilities";
import { buildKabriScene } from "./scenes/case-kabri";
import { buildLegalexyScene } from "./scenes/case-legalexy";
import { buildNormaScene } from "./scenes/case-norma";
import { buildShopOpsScene } from "./scenes/case-shopops";
import { buildConclusionScene } from "./scenes/conclusion";
import { buildFooterScene } from "./scenes/footer";
import { buildHeroScene } from "./scenes/hero";
import { buildWhyMeScene } from "./scenes/why-me";
import { buildWorkFlowScene } from "./scenes/work-flow";
import { buildThreadScroll } from "./thread-scroll";

import { THREAD_MODEL_READY_EVENT } from "../thread/thread-dom";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

if (typeof window !== "undefined") {
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/**
 * How long to wait for the thread geometry chunk before building the scroll
 * timeline anyway. The geometry normally arrives in a few hundred ms, long
 * before the preloader exits; this only guards against a failed chunk so the
 * preloader can never stall.
 */
const THREAD_READY_TIMEOUT_MS = 2000;

export function PortfolioMotion() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const update = () => ScrollTrigger.update();
    lenis.on("scroll", update);
    ScrollTrigger.update();

    return () => lenis.off("scroll", update);
  }, [lenis]);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".portfolio");
    if (!root) return;

    let started = false;
    let disposed = false;
    let fontsReady = false;
    let mm: ReturnType<typeof gsap.matchMedia> | null = null;
    let refreshFrame: number | null = null;
    let stopThread: (() => void) | null = null;
    let threadReadyTimer: number | null = null;

    const start = () => {
      if (started || disposed || !fontsReady) return;
      started = true;

      mm = gsap.matchMedia(root);
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 700px)",
        },
        (context) => {
          if (!context.conditions?.motion) return;

          const mobile = Boolean(context.conditions?.mobile);

          const heroEntrance = buildHeroScene(root);
          const playHeroEntrance = () => heroEntrance.play();
          if (
            document.documentElement.dataset.siteRevealing === "true" ||
            !document.querySelector("[data-site-preloader]")
          ) {
            playHeroEntrance();
          } else {
            document.addEventListener("site:revealing", playHeroEntrance, {
              once: true,
            });
          }
          buildWorkFlowScene(root);
          buildCapabilitiesScene(root);
          buildKabriScene(root, mobile);
          buildNormaScene(root, mobile);
          buildShopOpsScene(root, mobile);
          buildLegalexyScene(root, mobile);
          buildWhyMeScene(root);
          buildConclusionScene(root);
          buildFooterScene(root);

          // The thread is built once the route geometry has been applied as a
          // single timeline (see thread-scroll.ts). The geometry is loaded in
          // its own chunk by thread-layer, so wait for its readiness signal;
          // the timeout keeps the preloader from stalling if it never arrives.
          const startThread = () => {
            if (disposed || stopThread) return;

            if (threadReadyTimer !== null) {
              window.clearTimeout(threadReadyTimer);
              threadReadyTimer = null;
            }
            document.removeEventListener(
              THREAD_MODEL_READY_EVENT,
              startThread,
            );

            ScrollTrigger.refresh();
            stopThread = buildThreadScroll(root);
            document.documentElement.dataset.motionReady = "true";
            document.dispatchEvent(new CustomEvent("site:motion-ready"));
          };

          refreshFrame = window.requestAnimationFrame(() => {
            if (disposed) return;

            ScrollTrigger.refresh();

            if (document.documentElement.dataset.threadReady === "true") {
              startThread();
            } else {
              document.addEventListener(THREAD_MODEL_READY_EVENT, startThread);
              threadReadyTimer = window.setTimeout(
                startThread,
                THREAD_READY_TIMEOUT_MS,
              );
            }
          });

          return () => {
            document.removeEventListener("site:revealing", playHeroEntrance);
            document.removeEventListener(
              THREAD_MODEL_READY_EVENT,
              startThread,
            );
            if (threadReadyTimer !== null) {
              window.clearTimeout(threadReadyTimer);
              threadReadyTimer = null;
            }
            stopThread?.();
            stopThread = null;
            restoreMotionWrappers();
          };
        },
      );
    };

    void (document.fonts?.ready ?? Promise.resolve()).then(() => {
      fontsReady = true;
      start();
    });

    return () => {
      disposed = true;
      delete document.documentElement.dataset.motionReady;
      if (refreshFrame !== null) window.cancelAnimationFrame(refreshFrame);
      mm?.revert();
      restoreMotionWrappers();
    };
  }, []);

  return null;
}
