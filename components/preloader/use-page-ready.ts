"use client";

import { useEffect, useState } from "react";

const MIN_VISIBLE_MS = 1200;
const MAX_WAIT_MS = 10000;
const CRITICAL_IMAGE_SELECTOR =
  'img[data-preload], img[fetchpriority="high"], img[loading="eager"]';

function waitForWindowLoad(signal: AbortSignal) {
  if (document.readyState === "complete") {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const onLoad = () => resolve();
    const onAbort = () => resolve();

    window.addEventListener("load", onLoad, { once: true, signal });
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function waitForImage(image: HTMLImageElement, signal: AbortSignal) {
  if (image.complete) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const onSettled = () => resolve();
    const onAbort = () => resolve();

    image.addEventListener("load", onSettled, { once: true, signal });
    image.addEventListener("error", onSettled, { once: true, signal });
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export function usePageReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let minTimer: number | undefined;
    let maxTimer: number | undefined;
    const controller = new AbortController();
    const { signal } = controller;

    const minimumDelay = new Promise<void>((resolve) => {
      minTimer = window.setTimeout(resolve, MIN_VISIBLE_MS);
      signal.addEventListener("abort", () => resolve(), { once: true });
    });

    const maximumWait = new Promise<void>((resolve) => {
      maxTimer = window.setTimeout(resolve, MAX_WAIT_MS);
      signal.addEventListener("abort", () => resolve(), { once: true });
    });

    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>(CRITICAL_IMAGE_SELECTOR),
    );

    const assets = Promise.allSettled([
      waitForWindowLoad(signal),
      document.fonts?.ready ?? Promise.resolve(),
      ...images.map((image) => waitForImage(image, signal)),
    ]);

    async function waitForAssets() {
      await Promise.race([assets, maximumWait]);

      if (maxTimer !== undefined) {
        window.clearTimeout(maxTimer);
      }

      await minimumDelay;

      if (!cancelled) {
        setReady(true);
      }
    }

    void waitForAssets();

    return () => {
      cancelled = true;
      controller.abort();

      if (minTimer !== undefined) {
        window.clearTimeout(minTimer);
      }

      if (maxTimer !== undefined) {
        window.clearTimeout(maxTimer);
      }
    };
  }, []);

  return { ready };
}
