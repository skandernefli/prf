import { gsap } from "gsap";

import { addFromTo, maskLine, scrollTriggerDefaults } from "../motion-utils";

export function buildCapabilitiesScene(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".capabilities");
  if (!section) return;

  const headingTrigger = section.querySelector<HTMLElement>(
    ".capability-heading",
  );
  const headingLines = Array.from(
    section.querySelectorAll<HTMLElement>(".capability-heading h2 > span"),
  );
  const headingInners = headingLines
    .map(maskLine)
    .filter((inner): inner is HTMLElement => inner !== null);

  if (headingTrigger && headingInners.length > 0) {
    const heading = gsap.timeline({
      scrollTrigger: scrollTriggerDefaults(
        headingTrigger,
        "top 55%",
        "top 0%",
        0.65,
      ),
    });

    addFromTo(
      heading,
      headingInners,
      { yPercent: 112, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "expo.out",
      },
      0,
    );
  }

  section
    .querySelectorAll<HTMLElement>(".capability-discipline h3")
    .forEach((heading) => {
      const reveal = gsap.timeline({
        scrollTrigger: scrollTriggerDefaults(
          heading,
          "top 50%",
          "top 40%",
          0.45,
        ),
      });

      addFromTo(
        reveal,
        heading,
        { opacity: 0, filter: "blur(5px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.55,
          ease: "power2.out",
        },
        0,
      );
    });

  section
    .querySelectorAll<HTMLElement>(".capability-discipline li")
    .forEach((item) => {
      const inner = item.querySelector<HTMLElement>(":scope > span");
      if (!inner) return;

      const reveal = gsap.timeline({
        scrollTrigger: scrollTriggerDefaults(item, "top 50%", "top 40%", 0.55),
      });

      addFromTo(
        reveal,
        inner,
        { y: 14, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          ease: "power3.out",
        },
        0,
      );
    });
}
