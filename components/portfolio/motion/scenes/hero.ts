import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

import { getThreadSegments } from "../../thread/thread-dom";
import { addFromTo } from "../motion-utils";
import { penState, placePenOnPath, showPen } from "../thread-pen";

gsap.registerPlugin(DrawSVGPlugin);

export function buildHeroScene(root: HTMLElement) {
  const hero = root.querySelector<HTMLElement>(".hero");
  const heroCopy = root.querySelector<HTMLElement>(".hero-copy");
  const lines = Array.from(
    root.querySelectorAll<HTMLElement>(".hero-title > span"),
  );
  const support = root.querySelector<HTMLElement>(".hero-support p");
  const scrollCue = root.querySelector<HTMLElement>(".scroll-cue");

  const backSvg = root.querySelector<SVGSVGElement>(
    '[data-thread-scene="hero"][data-thread-layer="back"]',
  );

  const heroPaths = getThreadSegments(root, "hero");

  const origin = backSvg?.querySelector<SVGCircleElement>(".thread-origin-dot");

  // Hidden until the intro starts; the start dot is not part of the layout.
  if (origin) gsap.set(origin, { autoAlpha: 0 });
  showPen(root, false);

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

  // The start dot stays where the thread begins; the pen (a separate ring) is
  // what travels along the tip, here and later on scroll.
  const drawThread = (
    paths: SVGPathElement[],
    startDot: SVGCircleElement | null,
    position: number,
  ) => {
    if (!paths.length) return;

    const lengths = paths.map((path) => path.getTotalLength());
    const total = lengths.reduce((sum, length) => sum + length, 0);

    if (total <= 0) return;

    gsap.set(paths, { drawSVG: "0%" });

    if (startDot) {
      const firstPoint = paths[0].getPointAtLength(0);

      startDot.setAttribute("cx", firstPoint.x.toFixed(2));
      startDot.setAttribute("cy", firstPoint.y.toFixed(2));

      timeline.set(startDot, { autoAlpha: 1 }, position);
    }

    penState.introRunning = true;
    placePenOnPath(root, paths[0], 0);
    timeline.call(() => showPen(root, true), undefined, position);
    timeline.eventCallback("onComplete", () => {
      penState.introRunning = false;
    });
    timeline.eventCallback("onInterrupt", () => {
      penState.introRunning = false;
    });

    let previousPosition: number | string = position;

    paths.forEach((path, index) => {
      const length = lengths[index];

      if (length <= 0) return;

      const duration = Math.max(0.12, (length / total) * 3);

      const tween: gsap.core.Tween = gsap.to(path, {
        drawSVG: "100%",
        duration,
        ease: "none",
        onUpdate: () => placePenOnPath(root, path, length * tween.ratio),
      });

      timeline.add(tween, previousPosition);

      previousPosition = ">";
    });
  };

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
