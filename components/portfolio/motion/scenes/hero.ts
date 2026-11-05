import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

import { getThreadSegments } from "../../thread/thread-dom";
import { addFromTo } from "../motion-utils";

gsap.registerPlugin(DrawSVGPlugin);

export function buildHeroScene(root: HTMLElement) {
  const hero = root.querySelector<HTMLElement>(".hero");
  const heroCopy = root.querySelector<HTMLElement>(".hero-copy");
  const lines = Array.from(
    root.querySelectorAll<HTMLElement>(".hero-title > span"),
  );
  const support = root.querySelector<HTMLElement>(".hero-support p");
  const scrollCue = root.querySelector<HTMLElement>(".scroll-cue");

  // The origin dot lives in the back layer; the pen tip it represents moves
  // across both layers, so it is looked up once and driven by the single pen.
  const backSvg = root.querySelector<SVGSVGElement>(
    '[data-thread-scene="hero"][data-thread-layer="back"]',
  );

  // Hero segments in true travel order (data-thread-order). This interleaves
  // the two SVG layers: back0, front0, back1, front1, ... back6.
  const heroPaths = getThreadSegments(root, "hero");

  const origin = backSvg?.querySelector<SVGCircleElement>(".thread-origin-dot");

  const timeline = gsap.timeline({ delay: 0.15 });

  // 1. Headline reveal
  if (lines.length) {
    addFromTo(
      timeline,
      lines,
      {
        opacity: 0,
        filter: "blur(10px)",
        clipPath: "inset(-0.3em 100% -0.3em -0.12em)",
      },
      {
        opacity: 1,
        filter: "blur(0px)",
        clipPath: "inset(-0.3em -0.12em -0.3em -0.12em)",
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.12,
      },
      0,
    );
  }

  // 2. Supporting text
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

  // 4. Hero thread: one pen, drawn piece by piece in travel order.
  const drawThread = (
    paths: SVGPathElement[],
    dot: SVGCircleElement | null,
    position: number,
  ) => {
    if (!paths.length) return;

    const lengths = paths.map((path) => path.getTotalLength());
    const total = lengths.reduce((sum, length) => sum + length, 0);

    if (total <= 0) return;

    gsap.set(paths, { drawSVG: "0%" });

    if (dot) {
      const firstPoint = paths[0].getPointAtLength(0);

      dot.setAttribute("cx", firstPoint.x.toFixed(2));
      dot.setAttribute("cy", firstPoint.y.toFixed(2));

      gsap.set(dot, { autoAlpha: 1 });
    }

    let previousPosition: number | string = position;

    paths.forEach((path, index) => {
      const length = lengths[index];

      if (length <= 0) return;

      // Duration is proportional to length and the ease is linear, so the pen
      // moves at constant speed through every joint instead of slowing down
      // and restarting on each piece.
      const duration = Math.max(0.12, (length / total) * 3);

      const tween: gsap.core.Tween = gsap.to(path, {
        drawSVG: "100%",
        duration,
        ease: "none",
        onUpdate: () => {
          if (!dot) return;

          // Eased progress of this piece (1:1 with the drawn length).
          const point = path.getPointAtLength(length * tween.ratio);

          dot.setAttribute("cx", point.x.toFixed(2));
          dot.setAttribute("cy", point.y.toFixed(2));
        },
      });

      timeline.add(tween, previousPosition);

      previousPosition = ">";
    });
  };

  // 5. One chain over all 11 pieces, back and front interleaved.
  drawThread(heroPaths, origin ?? null, 0.2);

  // 6. Hero exit on scroll
  if (hero && heroCopy) {
    const exit = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 0.55,
      },
    });

    addFromTo(
      exit,
      heroCopy,
      { opacity: 1 },
      { opacity: 0.62, duration: 1, ease: "none" },
    );
  }

  return timeline;
}
