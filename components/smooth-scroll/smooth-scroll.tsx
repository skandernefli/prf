"use client";

import { gsap } from "gsap";
import type { LenisOptions } from "lenis";
import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { usePreloader } from "@/components/preloader/preloader-context";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FOCUSABLE_TARGET =
  'a[href], button, input, select, textarea, [contenteditable=""], [tabindex]';

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
    return () => {
      gsap.ticker.remove(update);
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

      lenis.scrollTo(target);
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
      lerp: 0.1,
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
