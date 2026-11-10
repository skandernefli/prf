import { gsap } from "gsap";

import { addFromTo, maskLine } from "../motion-utils";

export function buildHeroScene(root: HTMLElement) {
  const hero = root.querySelector<HTMLElement>(".hero");
  const heroCopy = root.querySelector<HTMLElement>(".hero-copy");
  const lines = Array.from(
    root.querySelectorAll<HTMLElement>(".hero-title > span"),
  );
  const support = root.querySelector<HTMLElement>(".hero-support p");
  const scrollCue = root.querySelector<HTMLElement>(".scroll-cue");

  // The pen (a separate ring) is not used in the hero anymore — no thread
  // draw happens here — so keep it hidden for this scene.

  const timeline = gsap.timeline({ delay: 0.15, paused: true });

  // 1. Headline reveal — vertical rise behind an overflow mask, staggered,
  // decelerating, with the text resolving from a blur as it settles. Mask does
  // the concealment; no opacity, no typography morphing.
  if (lines.length) {
    const headingInners = lines
      .map((line) => {
        // Bare <span>s render inline by default. On inline boxes BOTH
        // `transform` (yPercent) and `overflow: hidden` are ignored, so the
        // mask + rise reveal silently no-ops. Promote to inline-block so the
        // mask wrapper clips and the inner's transform applies. No-op if the
        // line is already block-level from CSS.
        if (getComputedStyle(line).display === "inline") {
          line.style.display = "inline-block";
        }

        // The hero lines are thread anchors (rect mode). The line itself never
        // moves here — only its inner wrapper rises — so its box is stable.
        const inner = maskLine(line, { allowAnchoredLine: true });

        // The default mask reaches well below the line. The hero's lines are
        // set so tight that a line waiting to rise would show its tops inside
        // the gap below it, so close the bottom edge of the mask right at the
        // line (a hair of slack so the baseline is never shaved).
        if (inner)
          line.style.clipPath = "inset(-0.35em -0.15em -0.05em -0.15em)";

        // The inner is what actually receives the yPercent transform; it
        // must be a block-level box too or the transform is discarded.
        if (inner && getComputedStyle(inner).display === "inline") {
          inner.style.display = "inline-block";
        }

        return inner;
      })
      .filter((inner): inner is HTMLElement => inner !== null);

    if (headingInners.length) {
      addFromTo(
        timeline,
        headingInners,
        { yPercent: 112, filter: "blur(10px)" },
        {
          yPercent: 0,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.12,
          // Leave no residual filter on the finished title.
          clearProps: "filter",
        },
        0,
      );
    }
  }

  if (support) {
    addFromTo(
      timeline,
      support,
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
      },
      0.55,
    );
  }

  // 3. Scroll cue
  if (scrollCue) {
    addFromTo(
      timeline,
      scrollCue,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.45,
        ease: "power2.out",
      },
      0.7,
    );
  }

  // 6. Hero exit on scroll — headline lines drift apart (copy stays fully opaque)
  if (hero && heroCopy) {
    const exit = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 0.55,
        // So the function-based `x` values below re-measure on resize.
        invalidateOnRefresh: true,
      },
    });

    if (lines.length === 3) {
      // Outer lines drift right, the middle one drifts left.
      const driftDirections = [1, -1, 1];

      // Desired drift distance, before clamping to viewport space.
      const MAX_DRIFT = () => Math.min(window.innerWidth * 0.06, 72);

      // Px we always keep between a line and the viewport edge.
      const EDGE_MARGIN = 24;

      const safeDrift = (el: HTMLElement, dir: number) => {
        // Read the *untransformed* box so `refresh()` doesn't compound on itself.
        const currentX = Number(gsap.getProperty(el, "x")) || 0;
        const rect = el.getBoundingClientRect();
        const left = rect.left - currentX;
        const right = rect.right - currentX;

        // How much room we actually have on the side we're drifting toward.
        const available =
          dir > 0
            ? window.innerWidth - EDGE_MARGIN - right
            : left - EDGE_MARGIN;

        const distance = Math.max(0, Math.min(available, MAX_DRIFT()));
        return dir * distance;
      };

      lines.forEach((line, i) => {
        const dir = driftDirections[i];

        exit.fromTo(
          line,
          { x: 0 },
          {
            x: () => safeDrift(line, dir),
            duration: 1,
            ease: "none",
          },
          0,
        );
      });
    }
  }

  return timeline;
}
