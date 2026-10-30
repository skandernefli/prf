"use client";

import { createContext, useContext } from "react";

export type PreloaderPhase = "loading" | "exiting" | "ready";

export type PreloaderContextValue = {
  phase: PreloaderPhase;
  isReady: boolean;
  isExiting: boolean;
};

export const PreloaderContext = createContext<PreloaderContextValue | null>(
  null,
);

export function usePreloader() {
  const context = useContext(PreloaderContext);

  if (!context) {
    throw new Error("usePreloader must be used within a PreloaderProvider");
  }

  return context;
}
