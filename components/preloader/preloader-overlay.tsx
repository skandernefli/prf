"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

import { Signature, SIGNATURE_VIEWBOX } from "./signature";
import styles from "./preloader.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, DrawSVGPlugin);
}

type PreloaderOverlayProps = {
  assetsReady: boolean;
  onExitStart: () => void;
  onExited: () => void;
};

export function PreloaderOverlay({
  assetsReady,
  onExitStart,
  onExited,
}: PreloaderOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const exitedRef = useRef(false);
  const [drawn, setDrawn] = useState(false);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const paths = gsap.utils.toArray<SVGPathElement>(
        "[data-signature-path]",
        container,
      );
      const dot = container.querySelector<SVGCircleElement>(
        "[data-signature-dot]",
      );
      const signature = container.querySelector<SVGSVGElement>(
        "[data-signature-svg]",
      );

      if (!paths.length || !dot || !signature) {
        return;
      }

      gsap.set(signature, { autoAlpha: 1 });

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(paths, { drawSVG: "0%" });
        gsap.set(dot, { autoAlpha: 0 });

        const firstPoint = paths[0].getPointAtLength(0);
        dot.setAttribute("cx", firstPoint.x.toFixed(2));
        dot.setAttribute("cy", firstPoint.y.toFixed(2));
        gsap.set(dot, { autoAlpha: 1 });

        const lengths = paths.map((path) => path.getTotalLength());
        const total = lengths.reduce((sum, length) => sum + length, 0);
        const timeline = gsap.timeline({
          onComplete: () => setDrawn(true),
        });

        paths.forEach((path, index) => {
          const length = lengths[index];
          const duration = Math.max(0.12, (length / total) * 3);
          const tweenState: {
            current: ReturnType<typeof gsap.to> | null;
          } = { current: null };

          const tween = gsap.to(path, {
            drawSVG: "100%",
            duration,
            ease: "power1.inOut",
            onUpdate: () => {
              const activeTween = tweenState.current;

              if (!activeTween) {
                return;
              }

              const point = path.getPointAtLength(
                length * activeTween.progress(),
              );
              dot.setAttribute("cx", point.x.toFixed(2));
              dot.setAttribute("cy", point.y.toFixed(2));
            },
          });

          tweenState.current = tween;
          timeline.add(tween, index === 0 ? 0 : ">");
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(paths, { drawSVG: "100%" });

        const lastPath = paths[paths.length - 1];
        const lastPoint = lastPath.getPointAtLength(lastPath.getTotalLength());

        dot.setAttribute("cx", lastPoint.x.toFixed(2));
        dot.setAttribute("cy", lastPoint.y.toFixed(2));
        gsap.set(dot, { autoAlpha: 1 });
        setDrawn(true);
      });

      return () => mm.revert();
    },
    { scope: containerRef },
  );

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container || !drawn) {
        return;
      }

      const dot = container.querySelector<SVGCircleElement>(
        "[data-signature-dot]",
      );

      if (!dot) {
        return;
      }

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (!assetsReady) {
        if (reducedMotion) {
          return;
        }

        const pulse = gsap.to(dot, {
          scale: 1.45,
          opacity: 0.45,
          duration: 0.65,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          transformOrigin: "50% 50%",
        });

        return () => {
          pulse.kill();
          gsap.set(dot, { scale: 1, opacity: 1 });
        };
      }

      onExitStart();

      const finish = () => {
        if (exitedRef.current) {
          return;
        }

        exitedRef.current = true;
        onExited();
      };

      if (reducedMotion) {
        gsap.to(container, {
          autoAlpha: 0,
          duration: 0.3,
          ease: "power1.out",
          onComplete: finish,
        });

        return;
      }

      gsap.to(dot, { autoAlpha: 0, duration: 0.25, ease: "power1.out" });
      gsap.to(container, {
        yPercent: -100,
        duration: 0.9,
        ease: "power3.inOut",
        delay: 0.1,
        onComplete: finish,
      });
    },
    {
      scope: containerRef,
      dependencies: [drawn, assetsReady, onExitStart, onExited],
    },
  );

  return (
    <div
      ref={containerRef}
      className={styles.overlay}
      style={{ backgroundColor: "#050505" }}
      data-site-preloader
      role="status"
      aria-label="Loading portfolio"
    >
      <svg
        className={styles.signature}
        data-signature-svg
        viewBox={SIGNATURE_VIEWBOX}
        aria-hidden="true"
        focusable="false"
      >
        <Signature />
        <circle className={styles.penDot} data-signature-dot r="8" />
      </svg>
      <span className={styles.srOnly}>Loading portfolio</span>
    </div>
  );
}
