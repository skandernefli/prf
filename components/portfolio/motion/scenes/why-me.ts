import { gsap } from "gsap";

import {
  addFromTo,
  maskLine,
  scrollTriggerDefaults,
} from "../motion-utils";

export function buildWhyMeScene(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".why-me");
  if (!section) return;

  const eyebrow = section.querySelector<HTMLElement>(".why-me-eyebrow");
  if (eyebrow) {
    const reveal = gsap.timeline({
      scrollTrigger: scrollTriggerDefaults(
        eyebrow,
        "top 92%",
        "top 72%",
        0.45,
      ),
    });

    addFromTo(
      reveal,
      eyebrow,
      { opacity: 0, y: -8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      },
      0,
    );
  }

  const title = section.querySelector<HTMLElement>(".why-me-title");
  const titleLines = Array.from(
    section.querySelectorAll<HTMLElement>(".why-me-title > span"),
  );
  const titleInners = titleLines
    .map(maskLine)
    .filter((inner): inner is HTMLElement => inner !== null);

  if (title && titleInners.length > 0) {
    const reveal = gsap.timeline({
      scrollTrigger: scrollTriggerDefaults(
        title,
        "top 86%",
        "top 42%",
        0.65,
      ),
    });

    addFromTo(
      reveal,
      titleInners,
      { yPercent: 112, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.09,
        ease: "expo.out",
      },
      0,
    );
  }

  const intro = section.querySelector<HTMLElement>(".why-me-intro");
  if (intro) {
    const reveal = gsap.timeline({
      scrollTrigger: scrollTriggerDefaults(
        intro,
        "top 92%",
        "top 70%",
        0.45,
      ),
    });

    addFromTo(
      reveal,
      intro,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: "power2.out" },
      0,
    );
  }

  for (let index = 1; index <= 5; index += 1) {
    const node = section.querySelector<HTMLElement>(
      `[data-thread-anchor="why.point.${index}"]`,
    );
    const copy = section.querySelector<HTMLElement>(
      `[data-thread-anchor="why.copy.${index}"]`,
    );
    const number = copy?.querySelector<HTMLElement>(".why-me-number");
    const pointTitle = copy?.querySelector<HTMLElement>(
      ".why-me-point-title",
    );
    const description = copy?.querySelector<HTMLElement>(
      ".why-me-point-description",
    );

    if (!node || !copy || !number || !pointTitle || !description) {
      throw new Error(`Missing Why Me point ${index} motion target`);
    }

    const reveal = gsap.timeline({
      scrollTrigger: {
        trigger: node,
        start: "center 76%",
        end: "center 54%",
        scrub: 0.55,
      },
    });

    addFromTo(
      reveal,
      node,
      {
        opacity: 0,
        boxShadow: "0px 0px 0px 0px rgba(255,59,18,0)",
      },
      {
        opacity: 1,
        boxShadow: "0px 0px 0px 10px rgba(255,59,18,0)",
        duration: 0.3,
        ease: "power2.out",
      },
      0,
    );
    addFromTo(
      reveal,
      number,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.25,
        ease: "power2.out",
      },
      0.02,
    );
    addFromTo(
      reveal,
      pointTitle,
      { opacity: 0, y: 26 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power3.out",
      },
      0.05,
    );
    addFromTo(
      reveal,
      description,
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      },
      0.1,
    );
  }
}
