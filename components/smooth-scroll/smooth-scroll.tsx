"use client";

import { gsap } from "gsap";
import type { LenisOptions } from "lenis";
import { ReactLenis, useLenis } from "lenis/react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useSyncExternalStore } from "react";

import { usePreloader } from "@/components/preloader/preloader-context";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FOCUSABLE_TARGET =
  'a[href], button, input, select, textarea, [contenteditable=""], [tabindex]';

// easeInOutCubic for in-page anchor jumps
const anchorEasing = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function subscribeToReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

function samePageAnchor(anchor: HTMLAnchorElement) {
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname !== window.location.pathname) return null;
  if (!url.hash || url.hash === "#") return null;
  return url;
}

function elementForHash(hash: string) {
  let id: string;
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch {
    return null;
  }
  return document.getElementById(id);
}

function LenisRuntime() {
  const lenis = useLenis();
  const { isReady } = usePreloader();

  useEffect(() => {
    if (!lenis) return;

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update, false, true);
    // Prevent GSAP from compensating for frame hitches, which causes Lenis to jump.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      gsap.ticker.lagSmoothing(500, 33); // restore GSAP defaults
    };
  }, [lenis]);

  useEffect(() => {
    if (!lenis) return;
    if (isReady) lenis.start();
    else lenis.stop();
  }, [lenis, isReady]);

  useEffect(() => {
    if (!lenis) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const origin = event.target instanceof Element ? event.target : null;
      const anchor = origin?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      // Keep the skip link's native instant jump and focus behavior.
      if (anchor.classList.contains("skip-link")) return;

      const url = samePageAnchor(anchor);
      if (!url) return;

      const target = elementForHash(url.hash);
      if (!target) return;

      event.preventDefault();

      if (window.location.hash !== url.hash) {
        window.history.pushState(null, "", url.hash);
      }

      if (target.matches(FOCUSABLE_TARGET)) {
        target.focus({ preventScroll: true });
      }

      lenis.scrollTo(target, {
        duration: 1.6,
        easing: anchorEasing,
        offset: 0,
      });
    };

    const onPopState = () => {
      const hash = window.location.hash;
      if (!hash || hash === "#") return;
      const target = elementForHash(hash);
      if (target) lenis.scrollTo(target, { immediate: true });
    };

    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPopState);
    };
  }, [lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();

  const options = useMemo<LenisOptions>(
    () => ({
      autoRaf: false,
      lerp: 0.075,
      wheelMultiplier: 0.9,
      smoothWheel: !reducedMotion,
      syncTouch: false,
      anchors: false,
      autoToggle: false,
      respectReducedMotion: true,
    }),
    [reducedMotion],
  );

  return (
    <ReactLenis root options={options}>
      <LenisRuntime />
      {children}
    </ReactLenis>
  );
}
