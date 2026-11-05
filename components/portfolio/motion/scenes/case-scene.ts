import { gsap } from "gsap";

import { addFromTo, scrollTriggerDefaults } from "../motion-utils";

export function createCaseTimeline(
  trigger: Element,
  start: string,
  end: string,
  scrub: number,
) {
  return gsap.timeline({
    scrollTrigger: scrollTriggerDefaults(trigger, start, end, scrub),
  });
}

export function addCaseHeaderReveal(article: HTMLElement) {
  const kicker = article.querySelector<HTMLElement>(".case-study-kicker");
  const description = article.querySelector<HTMLElement>(
    ".case-study-description",
  );
  if (!kicker) return;

  const targets = [kicker, description].filter(
    (target): target is HTMLElement => target !== null,
  );
  const reveal = createCaseTimeline(kicker, "top 92%", "top 70%", 0.5);

  addFromTo(
    reveal,
    targets,
    { opacity: 0, y: -10 },
    {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.04,
      ease: "power2.out",
    },
    0,
  );
}

export function addCaseSceneExit(article: HTMLElement) {
  const targets = [
    article.querySelector<HTMLElement>(".case-study-kicker"),
    article.querySelector<HTMLElement>(".case-study-description"),
    article.querySelector<HTMLElement>(".case-study-composition"),
    article.querySelector<HTMLElement>(".case-study-link"),
  ].filter((target): target is HTMLElement => target !== null);

  if (targets.length === 0) return;

  const exit = createCaseTimeline(article, "bottom 38%", "bottom 8%", 0.75);

  addFromTo(
    exit,
    targets,
    { opacity: 1, immediateRender: false },
    {
      opacity: 0.86,
      duration: 0.3,
      ease: "power1.in",
    },
    0,
  );
}

export function addCaseLinkReveal(article: HTMLElement) {
  const link = article.querySelector<HTMLElement>(".case-study-link");
  if (!link) return;

  const reveal = createCaseTimeline(link, "top 96%", "top 78%", 0.45);
  addFromTo(
    reveal,
    link,
    { opacity: 0, y: 8 },
    {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out",
    },
    0,
  );
}
