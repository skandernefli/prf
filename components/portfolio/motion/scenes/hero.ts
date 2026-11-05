import { gsap } from "gsap";

import { addFromTo } from "../motion-utils";

export function buildHeroScene(root: HTMLElement) {
  const hero = root.querySelector<HTMLElement>(".hero");
  const heroCopy = root.querySelector<HTMLElement>(".hero-copy");
  const lines = Array.from(
    root.querySelectorAll<HTMLElement>(".hero-title > span"),
  );
  const support = root.querySelector<HTMLElement>(".hero-support p");
  const scrollCue = root.querySelector<HTMLElement>(".scroll-cue");
  const timeline = gsap.timeline({ delay: 0.15 });

  if (lines.length > 0) {
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
}
