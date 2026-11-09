"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

// The four case-study titles that trigger the CTA state.
const CTA_TITLE_SELECTOR =
  "#norma-title, #shop-ops-title, #lega-lexy-title, #kabri-title";

export default function CustomCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cursor = cursorRef.current;

      if (!cursor) return;

      // Initial state
      gsap.set(cursor, {
        x: -100,
        y: -100,
        xPercent: -50,
        yPercent: -50,
        autoAlpha: 0,
      });

      // Optimized position setters
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

      const showCursor = () => {
        gsap.to(cursor, {
          autoAlpha: 1,
          duration: 0.3,
          overwrite: "auto",
        });
      };

      const hideCursor = () => {
        isVisible = false;
        isOverCTA = false;
        cursor.dataset.state = "default";

        gsap.to(cursor, {
          autoAlpha: 0,
          duration: 0.3,
          overwrite: "auto",
        });
      };

      const setCursorState = (nextIsOverCTA: boolean) => {
        if (nextIsOverCTA === isOverCTA) return;
        isOverCTA = nextIsOverCTA;
        cursor.dataset.state = nextIsOverCTA ? "cta" : "default";
      };

      const handlePointerMove = (event: PointerEvent) => {
        // Ignore touch and pen interactions
        if (event.pointerType !== "mouse") return;

        if (!isVisible) {
          // Place cursor immediately on first movement
          gsap.set(cursor, {
            x: event.clientX,
            y: event.clientY,
          });

          isVisible = true;
          showCursor();
        } else {
          // Smoothly follow subsequent movements
          xTo(event.clientX);
          yTo(event.clientY);
        }

        // Toggle the CTA state based on what the pointer is over.
        // `event.target` is the topmost element under the pointer
        // (the cursor itself has pointer-events: none), so closest()
        // walks up to the matching case-study title.
        const target = event.target as Element | null;
        const overCTA = !!target?.closest?.(CTA_TITLE_SELECTOR);
        setCursorState(overCTA);
      };

      window.addEventListener("pointermove", handlePointerMove);
      document.documentElement.addEventListener("pointerleave", hideCursor);

      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        document.documentElement.removeEventListener(
          "pointerleave",
          hideCursor,
        );
      };
    },
    {
      scope: containerRef,
    },
  );

  return (
    <div ref={containerRef} aria-hidden="true">
      <div ref={cursorRef} className="custom-cursor" data-state="default">
        <span className="custom-cursor-text">visit case study</span>
      </div>
    </div>
  );
}
