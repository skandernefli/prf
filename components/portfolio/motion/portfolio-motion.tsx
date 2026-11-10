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

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

if (typeof window !== "undefined") {
  ScrollTrigger.config({ ignoreMobileResize: true });
}

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

          // The thread is built after layout has settled, as a single
          // timeline (see thread-scroll.ts).
          refreshFrame = window.requestAnimationFrame(() => {
            if (disposed) return;

            ScrollTrigger.refresh();
            stopThread = buildThreadScroll(root);
            document.documentElement.dataset.motionReady = "true";
            document.dispatchEvent(new CustomEvent("site:motion-ready"));
          });

          return () => {
            document.removeEventListener("site:revealing", playHeroEntrance);
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
