import { gsap } from "gsap";

import {
  addFromTo,
  maskExistingTitle,
} from "../motion-utils";
import {
  addCaseHeaderReveal,
  addCaseLinkReveal,
  addCaseSceneExit,
  createCaseTimeline,
} from "./case-scene";

function revealDocument(
  article: HTMLElement,
  selector: string,
  start: string,
  end: string,
  scrub: number,
  fromVars: gsap.TweenVars,
  toVars: gsap.TweenVars,
) {
  const figure = article.querySelector<HTMLElement>(selector);
  const inner = figure?.querySelector(":scope > span");
  if (!figure || !inner) return null;

  const reveal = createCaseTimeline(figure, start, end, scrub);
  addFromTo(reveal, inner, fromVars, toVars, 0);
  return reveal;
}

function addScanSweep(
  timeline: gsap.core.Timeline,
  scan: Element,
  distance: number,
  duration: number,
) {
  addFromTo(
    timeline,
    scan,
    { visibility: "visible", opacity: 0, x: 2 },
    {
      visibility: "visible",
      opacity: 1,
      x: distance,
      duration,
      ease: "none",
    },
    0,
  );
  timeline.to(
    scan,
    {
      visibility: "hidden",
      opacity: 0,
      duration: 0.15,
      ease: "none",
    },
    duration,
  );
}

function addPanelReveal(
  article: HTMLElement,
  selector: string,
  start: string,
  end: string,
  scrub: number,
  childSelector: string,
  childY: number,
  childStagger = 0,
) {
  const panel = article.querySelector<HTMLElement>(selector);
  if (!panel) return;

  const reveal = createCaseTimeline(panel, start, end, scrub);
  addFromTo(
    reveal,
    panel,
    { clipPath: "inset(0 100% 0 0)" },
    {
      clipPath: "inset(-2% -2% -2% 0)",
      duration: selector === ".credit-outcome" ? 0.55 : 0.5,
      ease: "power3.out",
    },
    0,
  );

  const children = Array.from(
    panel.querySelectorAll<HTMLElement>(childSelector),
  );
  if (children.length > 0) {
    addFromTo(
      reveal,
      children,
      { opacity: 0, y: childY },
      {
        opacity: 1,
        y: 0,
        duration: selector === ".credit-outcome" ? 0.35 : 0.3,
        stagger: childStagger,
        ease: "power3.out",
      },
      0,
    );
  }

  return { panel, reveal };
}

export function buildLegalexyScene(root: HTMLElement, mobile: boolean) {
  const article = root.querySelector<HTMLElement>("#lega-lexy");
  if (!article) return;

  addCaseLinkReveal(article);
  addCaseSceneExit(article);
  addCaseHeaderReveal(article);

  const title = article.querySelector<HTMLElement>(".case-study-title");
  const titleInner = title
    ? maskExistingTitle(title, title.querySelector(":scope > span"))
    : null;

  if (title && titleInner) {
    const reveal = createCaseTimeline(title, "top 86%", "top 58%", 0.65);
    addFromTo(
      reveal,
      titleInner,
      { yPercent: 112, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.85,
        ease: "expo.out",
      },
      0,
    );
  }

  const pan = revealDocument(
    article,
    ".credit-pan",
    "top 88%",
    "top 64%",
    0.6,
    { opacity: 0, y: mobile ? -18 : -28, scale: 0.96 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.55,
      ease: "power3.out",
    },
  );
  const panScan = article.querySelector(".credit-pan .credit-scan");
  if (pan && panScan) {
    addScanSweep(pan, panScan, mobile ? 152 : 276, 0.35);
  }

  const gst = revealDocument(
    article,
    ".credit-gst",
    "top 88%",
    "top 64%",
    0.6,
    { opacity: 0, y: mobile ? -21 : -32, scale: 0.97 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.55,
      ease: "power3.out",
    },
  );
  const gstScan = article.querySelector(".credit-gst .credit-scan");
  if (gst && gstScan) {
    addScanSweep(gst, gstScan, mobile ? 138 : 250, 0.35);
  }

  revealDocument(
    article,
    ".credit-bank",
    "top 90%",
    "top 66%",
    0.6,
    {
      opacity: 0,
      y: mobile ? 29 : 44,
      rotate: 2,
    },
    {
      opacity: 1,
      y: 0,
      rotate: 0,
      duration: 0.6,
      ease: "power3.out",
    },
  );

  const itr = revealDocument(
    article,
    ".credit-itr",
    "top 90%",
    "top 66%",
    0.6,
    {
      opacity: 0,
      y: mobile ? 26 : 40,
      rotate: 2,
    },
    {
      opacity: 1,
      y: 0,
      rotate: 0,
      duration: 0.55,
      ease: "power3.out",
    },
  );
  const itrScan = article.querySelector(".credit-itr .credit-scan");
  if (itr && itrScan) {
    addScanSweep(itr, itrScan, mobile ? 220 : 400, 0.4);
  }

  addPanelReveal(
    article,
    ".credit-application",
    "top 90%",
    "top 66%",
    0.6,
    ":scope > p, :scope > div",
    8,
  );
  addPanelReveal(
    article,
    ".credit-assessment",
    "top 90%",
    "top 66%",
    0.6,
    ":scope > p, :scope dl > div",
    8,
    0.04,
  );

  const outcome = addPanelReveal(
    article,
    ".credit-outcome",
    "top 90%",
    "top 68%",
    0.6,
    ":scope > p, :scope > .credit-up-to, :scope > strong, :scope > .credit-approval",
    16,
    0.04,
  );

  const outcomeAmount = outcome?.panel.querySelector<HTMLElement>(
    ":scope > strong",
  );
  if (outcome && outcomeAmount) {
    addFromTo(
      outcome.reveal,
      outcomeAmount,
      { scale: 0.96 },
      { scale: 1, duration: 0.35, ease: "power3.out" },
      0,
    );
  }
}
