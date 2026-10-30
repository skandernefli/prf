"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

import {
  PreloaderContext,
  type PreloaderContextValue,
  type PreloaderPhase,
} from "./preloader-context";
import { PreloaderOverlay } from "./preloader-overlay";
import { usePageReady } from "./use-page-ready";

type PreloaderProviderProps = {
  children: ReactNode;
};

const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function PreloaderProvider({ children }: PreloaderProviderProps) {
  const [phase, setPhase] = useState<PreloaderPhase>("loading");
  const mounted = useSyncExternalStore(
    subscribeToClient,
    getClientSnapshot,
    getServerSnapshot,
  );
  const hasExitedRef = useRef(false);
  const { ready: assetsReady } = usePageReady();

  useEffect(() => {
    const root = document.documentElement;

    if (phase === "ready") {
      delete root.dataset.preloading;
      return;
    }

    root.dataset.preloading = "true";
  }, [phase]);

  useEffect(() => {
    return () => {
      delete document.documentElement.dataset.preloading;
    };
  }, []);

  const handleExitStart = useCallback(() => {
    setPhase((current) => (current === "loading" ? "exiting" : current));
  }, []);

  const handleExited = useCallback(() => {
    if (hasExitedRef.current) {
      return;
    }

    hasExitedRef.current = true;
    setPhase("ready");
    window.dispatchEvent(new CustomEvent("site:ready"));
  }, []);

  const value = useMemo<PreloaderContextValue>(
    () => ({
      phase,
      isReady: phase === "ready",
      isExiting: phase === "exiting",
    }),
    [phase],
  );

  const contentLocked = mounted && phase !== "ready";

  return (
    <PreloaderContext.Provider value={value}>
      {phase !== "ready" && (
        <PreloaderOverlay
          assetsReady={assetsReady}
          onExitStart={handleExitStart}
          onExited={handleExited}
        />
      )}
      <div
        style={{ display: "contents" }}
        inert={contentLocked ? true : undefined}
        aria-busy={contentLocked}
      >
        {children}
      </div>
    </PreloaderContext.Provider>
  );
}
