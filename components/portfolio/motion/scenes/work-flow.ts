import { gsap } from "gsap";

import { addFromTo, maskLine, scrollTriggerDefaults } from "../motion-utils";

export function buildWorkFlowScene(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".work-flow");
  if (!section) return;

  const copy = section.querySelector<HTMLElement>(".work-flow-copy");
  const headingLines = Array.from(
    section.querySelectorAll<HTMLElement>(".work-flow-copy h2 > span"),
  );
  const headingInners = headingLines
    .map(maskLine)
    .filter((inner): inner is HTMLElement => inner !== null);

  if (copy && headingInners.length > 0) {
    const heading = gsap.timeline({
      scrollTrigger: scrollTriggerDefaults(copy, "top 100%", "top 0%", 0.65),
    });

    addFromTo(
      heading,
      headingInners,
      { yPercent: 112, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.1,
        ease: "expo.out",
      },
      0,
    );
  }

  const description = section.querySelector<HTMLElement>(
    ".work-flow-description",
  );

  if (description) {
    const reveal = gsap.timeline({
      scrollTrigger: scrollTriggerDefaults(
        description,
        "top 50%",
        "top 40%",
        0.5,
      ),
    });

    addFromTo(
      reveal,
      description,
      { y: 18, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.65,
        ease: "power3.out",
      },
      0,
    );
  }

  const labels = section.querySelectorAll<HTMLElement>(".work-flow-label");

  labels.forEach((label) => {
    const reveal = gsap.timeline({
      scrollTrigger: scrollTriggerDefaults(label, "top 50%", "top 40%", 0.45),
    });

    addFromTo(
      reveal,
      label,
      { opacity: 0, filter: "blur(4px)" },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.45,
        ease: "power2.out",
      },
      0,
    );
  });
}
