"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

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

      const showCursor = () => {
        gsap.to(cursor, {
          autoAlpha: 1,
          duration: 0.3,
          overwrite: "auto",
        });
      };

      const hideCursor = () => {
        isVisible = false;

        gsap.to(cursor, {
          autoAlpha: 0,
          duration: 0.3,
          overwrite: "auto",
        });
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

          return;
        }

        // Smoothly follow subsequent movements
        xTo(event.clientX);
        yTo(event.clientY);
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
      <div ref={cursorRef} className="custom-cursor" />
    </div>
  );
}
