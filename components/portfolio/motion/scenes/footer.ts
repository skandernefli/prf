import { gsap } from "gsap";

import {
  addFromTo,
  maskLine,
  scrollTriggerDefaults,
} from "../motion-utils";

export function buildFooterScene(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".footer-finale");
  if (!section) return;

  const statement = section.querySelector<HTMLElement>(".footer-statement");
  const statementLines = Array.from(
    section.querySelectorAll<HTMLElement>(".footer-statement > span"),
  );
  const statementInners = statementLines
    .map(maskLine)
    .filter((inner): inner is HTMLElement => inner !== null);

  if (statement && statementInners.length > 0) {
    const reveal = gsap.timeline({
      scrollTrigger: scrollTriggerDefaults(
        statement,
        "top 90%",
        "top 48%",
        0.65,
      ),
    });

    addFromTo(
      reveal,
      statementInners,
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

  const pull = section.querySelector<HTMLElement>(".footer-pull");
  if (pull) {
    const reveal = gsap.timeline({
      scrollTrigger: scrollTriggerDefaults(
        pull,
        "top 92%",
        "top 68%",
        0.5,
      ),
    });

    addFromTo(
      reveal,
      pull,
      { opacity: 0, clipPath: "inset(0 100% 0 0)" },
      {
        opacity: 1,
        clipPath: "inset(-0.2em -0.1em -0.2em -0.1em)",
        duration: 0.55,
        ease: "power3.out",
      },
      0,
    );
  }

  const links = section.querySelector<HTMLElement>(".footer-links");
  if (links) {
    const reveal = gsap.timeline({
      scrollTrigger: scrollTriggerDefaults(
        links,
        "top 92%",
        "top 68%",
        0.5,
      ),
    });

    const items = Array.from(
      links.querySelectorAll<HTMLElement>(".footer-item"),
    );
    if (items.length > 0) {
      addFromTo(
        reveal,
        items,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power3.out",
        },
        0,
      );
    }

    const status = links.querySelector<HTMLElement>(".footer-status");
    if (status) {
      addFromTo(
        reveal,
        status,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: "power2.out" },
        0.2,
      );
    }
  }

  const top = section.querySelector<HTMLElement>(".footer-top");
  if (top) {
    const reveal = gsap.timeline({
      scrollTrigger: scrollTriggerDefaults(top, "top 100%", "top 94%", 0.4),
    });

    addFromTo(
      reveal,
      top,
      { opacity: 0 },
      { opacity: 1, duration: 0.35, ease: "power2.out" },
      0,
    );
  }
}
