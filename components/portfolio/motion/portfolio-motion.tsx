"use client";

import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";
import { useLenis } from "lenis/react";
import { useEffect } from "react";

import { restoreMotionWrappers } from "./motion-utils";
import { buildHeroScene } from "./scenes/hero";
import { buildWorkFlowScene } from "./scenes/work-flow";
import { buildCapabilitiesScene } from "./scenes/capabilities";
import { buildKabriScene } from "./scenes/case-kabri";
import { buildNormaScene } from "./scenes/case-norma";
import { buildShopOpsScene } from "./scenes/case-shopops";
import { buildLegalexyScene } from "./scenes/case-legalexy";
import { buildWhyMeScene } from "./scenes/why-me";
import { buildConclusionScene } from "./scenes/conclusion";
import { buildFooterScene } from "./scenes/footer";

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
    let siteReady = !document.querySelector("[data-site-preloader]");
    let observer: MutationObserver | null = null;
    let mm: ReturnType<typeof gsap.matchMedia> | null = null;
    let refreshFrame: number | null = null;

    const start = () => {
      if (started || disposed || !fontsReady || !siteReady) return;
      started = true;

      mm = gsap.matchMedia(root);
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 700px)",
        },
        (context) => {
          if (!context.conditions?.motion) return;

          buildHeroScene(root);
          buildWorkFlowScene(root);
          buildCapabilitiesScene(root);
          buildKabriScene(root, Boolean(context.conditions?.mobile));
          buildNormaScene(root, Boolean(context.conditions?.mobile));
          buildShopOpsScene(root, Boolean(context.conditions?.mobile));
          buildLegalexyScene(root, Boolean(context.conditions?.mobile));
          buildWhyMeScene(root);
          buildConclusionScene(root);
          buildFooterScene(root);
          refreshFrame = window.requestAnimationFrame(() =>
            ScrollTrigger.refresh(),
          );

          return () => restoreMotionWrappers();
        },
      );
    };

    const onSiteReady = () => {
      siteReady = true;
      observer?.disconnect();
      start();
    };

    document.addEventListener("site:ready", onSiteReady, { once: true });

    if (!siteReady) {
      observer = new MutationObserver(() => {
        if (!document.querySelector("[data-site-preloader]")) {
          siteReady = true;
          observer?.disconnect();
          start();
        }
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    }

    void (document.fonts?.ready ?? Promise.resolve()).then(() => {
      fontsReady = true;
      start();
    });

    return () => {
      disposed = true;
      document.removeEventListener("site:ready", onSiteReady);
      observer?.disconnect();
      if (refreshFrame !== null) window.cancelAnimationFrame(refreshFrame);
      mm?.revert();
      restoreMotionWrappers();
    };
  }, []);

  return null;
}
