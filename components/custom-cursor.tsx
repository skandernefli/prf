"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

const CTA_TITLE_SELECTOR =
  "#norma-title, #shop-ops-title, #lega-lexy-title, #kabri-title";

// Match these to your CSS sizes
const DEFAULT_SIZE = 16;
const CTA_SIZE = 120;

export default function CustomCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const cursor = cursorRef.current;
      const text = textRef.current;
      if (!cursor || !text) return;

      gsap.set(cursor, {
        x: -100,
        y: -100,
        xPercent: -50,
        yPercent: -50,
        autoAlpha: 0,
        width: DEFAULT_SIZE,
        height: DEFAULT_SIZE,
      });
      gsap.set(text, { autoAlpha: 0, scale: 0.8 });

      // One reversible timeline = interruptible, always smooth
      const ctaTl = gsap
        .timeline({
          paused: true,
          defaults: { duration: 0.35, ease: "power3.out" },
        })
        .to(cursor, { width: CTA_SIZE, height: CTA_SIZE }, 0)
        .to(text, { autoAlpha: 1, scale: 1 }, 0.05);

      const xTo = gsap.quickTo(cursor, "x", {
        duration: 0.6,
        ease: "power3.out",
      });
      const yTo = gsap.quickTo(cursor, "y", {
        duration: 0.6,
        ease: "power3.out",
      });

      let isVisible = false;
      let isOverCTA = false;
      let lastX = 0;
      let lastY = 0;
      let rafId = 0;

      const setCTA = (next: boolean) => {
        if (next === isOverCTA) return;
        isOverCTA = next;
        cursor.dataset.state = next ? "cta" : "default";
        if (next) ctaTl.play();
        else ctaTl.reverse();
      };

      const checkTarget = (el: Element | null) => {
        setCTA(!!el?.closest?.(CTA_TITLE_SELECTOR));
      };

      const showCursor = () =>
        gsap.to(cursor, { autoAlpha: 1, duration: 0.3, overwrite: "auto" });

      const hideCursor = () => {
        isVisible = false;
        setCTA(false);
        gsap.to(cursor, { autoAlpha: 0, duration: 0.3, overwrite: "auto" });
      };

      const handlePointerMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;

        lastX = e.clientX;
        lastY = e.clientY;

        if (!isVisible) {
          gsap.set(cursor, { x: lastX, y: lastY });
          isVisible = true;
          showCursor();
        } else {
          xTo(lastX);
          yTo(lastY);
        }

        // Synchronous, so entering the title reacts instantly
        checkTarget(e.target as Element | null);
      };

      // Scrolling moves content under a stationary pointer: re-check manually
      const handleScroll = () => {
        if (!isVisible || rafId) return;
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          checkTarget(document.elementFromPoint(lastX, lastY));
        });
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("scroll", handleScroll, {
        passive: true,
        capture: true,
      });
      document.documentElement.addEventListener("pointerleave", hideCursor);

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("scroll", handleScroll, { capture: true });
        document.documentElement.removeEventListener(
          "pointerleave",
          hideCursor,
        );
      };
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} aria-hidden="true">
      <div ref={cursorRef} className="custom-cursor" data-state="default">
        <span ref={textRef} className="custom-cursor-text">
          visit case study
        </span>
      </div>
    </div>
  );
}
