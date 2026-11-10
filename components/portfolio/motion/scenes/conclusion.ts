import { gsap } from "gsap";

import {
  addFromTo,
  maskLine,
  scrollTriggerDefaults,
} from "../motion-utils";

export function buildConclusionScene(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".conclusion-story");
  if (!section) return;

  const heading = section.querySelector<HTMLElement>(".conclusion-heading");
  const headingLines = Array.from(
    section.querySelectorAll<HTMLElement>(".conclusion-heading > span"),
  );
  const headingInners = headingLines
    .map((line) => maskLine(line))
    .filter((inner): inner is HTMLElement => inner !== null);

  if (heading && headingInners.length > 0) {
    const reveal = gsap.timeline({
      scrollTrigger: scrollTriggerDefaults(
        heading,
        "top 86%",
        "top 40%",
        0.65,
      ),
    });

    addFromTo(
      reveal,
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

  const personal =
    section.querySelector<HTMLElement>(".conclusion-personal");
  if (personal) {
    const reveal = gsap.timeline({
      scrollTrigger: scrollTriggerDefaults(
        personal,
        "top 92%",
        "top 68%",
        0.5,
      ),
    });

    addFromTo(
      reveal,
      personal,
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "power3.out",
      },
      0,
    );
  }

  const byline = section.querySelector<HTMLElement>(".conclusion-byline");
  const name = section.querySelector<HTMLElement>(".conclusion-name");
  const role = section.querySelector<HTMLElement>(".conclusion-role");
  if (byline && name && role) {
    const reveal = gsap.timeline({
      scrollTrigger: scrollTriggerDefaults(
        byline,
        "top 92%",
        "top 70%",
        0.45,
      ),
    });

    addFromTo(
      reveal,
      name,
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      },
      0,
    );
    addFromTo(
      reveal,
      role,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      },
      0.06,
    );
  }
}
