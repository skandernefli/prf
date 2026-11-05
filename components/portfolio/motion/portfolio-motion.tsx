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
import {
  collectStops,
  drawThreadSegment,
  getThreadCursor,
  seedThreadCursor,
} from "./thread-draw";

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

          const mobile = Boolean(context.conditions?.mobile);

          // One pen: each segment is drawn from the stop where the previous
          // one ended to the last reveal stop of its own scene.
          const scene = (id: string, build: () => void) =>
            drawThreadSegment(root, id, collectStops(build));

          buildHeroScene(root);
          const hero = root.querySelector<HTMLElement>(".hero");
          if (hero) seedThreadCursor(hero);

          scene("work", () => buildWorkFlowScene(root));

          const caps = collectStops(() => buildCapabilitiesScene(root));
          const within = (selector: string) =>
            caps.filter(({ el }) => el.closest(selector));

          drawThreadSegment(
            root,
            "capabilities.entry",
            within(".capability-heading"),
          );
          const split = getThreadCursor();
          drawThreadSegment(
            root,
            "capabilities.product",
            within(".capability-product"),
            { from: split },
          );
          drawThreadSegment(root, "capabilities.ai", within(".capability-ai"), {
            from: split,
          });

          // The exit line reaches the first reveal of KABRI, then KABRI continues.
          const kabri = collectStops(() => buildKabriScene(root, mobile));
          drawThreadSegment(root, "capabilities.exit", kabri, { take: 1 });
          drawThreadSegment(root, "kabri", kabri);

          scene("norma", () => buildNormaScene(root, mobile));
          scene("shopops", () => buildShopOpsScene(root, mobile));
          scene("legalexy", () => buildLegalexyScene(root, mobile));
          scene("why", () => buildWhyMeScene(root));
          scene("conclusion", () => buildConclusionScene(root));
          scene("footer", () => buildFooterScene(root));
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
