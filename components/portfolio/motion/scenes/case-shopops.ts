import { addFromTo, maskExistingTitle } from "../motion-utils";
import {
  addCaseHeaderReveal,
  addCaseLinkReveal,
  addCaseSceneExit,
  createCaseTimeline,
} from "./case-scene";

function revealFigureInner(
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
  if (!figure || !inner) return;

  const reveal = createCaseTimeline(figure, start, end, scrub);
  addFromTo(reveal, inner, fromVars, toVars, 0);
}

export function buildShopOpsScene(root: HTMLElement, mobile: boolean) {
  const article = root.querySelector<HTMLElement>("#shop-ops");
  if (!article) return;

  addCaseLinkReveal(article);
  addCaseSceneExit(article);
  addCaseHeaderReveal(article);

  const title = article.querySelector<HTMLElement>(".case-study-title");
  const titleInner = title
    ? maskExistingTitle(title, title.querySelector(":scope > span"))
    : null;

  if (title && titleInner) {
    if (getComputedStyle(title).display === "inline") {
      title.style.display = "inline-block";
    }
    if (getComputedStyle(titleInner).display === "inline") {
      titleInner.style.display = "inline-block";
    }
    title.style.clipPath = "inset(-0.35em -0.15em -0.05em -0.15em)";

    const reveal = createCaseTimeline(title, "top 86%", "top 58%", 0.65);
    addFromTo(
      reveal,
      titleInner,
      { yPercent: 112, filter: "blur(10px)" },
      {
        yPercent: 0,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "expo.out",
        clearProps: "filter",
      },
      0,
    );
  }

  revealFigureInner(
    article,
    ".shop-ops-plate",
    "top 88%",
    "top 64%",
    0.6,
    { opacity: 0, x: mobile ? -15 : -28, scale: 1.04 },
    {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: 0.65,
      ease: "power3.out",
    },
  );
  revealFigureInner(
    article,
    ".shop-ops-fork",
    "top 88%",
    "top 64%",
    0.6,
    { opacity: 0, y: mobile ? -14 : -22 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power3.out",
    },
  );
  revealFigureInner(
    article,
    ".shop-ops-message",
    "top 86%",
    "top 62%",
    0.6,
    { opacity: 0, y: mobile ? -12 : -18, scale: 0.97 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      ease: "power3.out",
    },
  );
  revealFigureInner(
    article,
    ".shop-ops-reply",
    "top 88%",
    "top 64%",
    0.6,
    { opacity: 0, x: mobile ? -16.5 : -30 },
    {
      opacity: 1,
      x: 0,
      duration: 0.5,
      ease: "power3.out",
    },
  );
  revealFigureInner(
    article,
    ".shop-ops-ticket",
    "top 88%",
    "top 64%",
    0.6,
    { opacity: 0, y: mobile ? 18 : 28, rotate: 4 },
    {
      opacity: 1,
      y: 0,
      rotate: 0,
      duration: 0.5,
      ease: "power3.out",
    },
  );
  revealFigureInner(
    article,
    ".shop-ops-bag",
    "top 90%",
    "top 66%",
    0.55,
    { opacity: 0, y: mobile ? 21 : 32, scale: 0.96 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.55,
      ease: "power3.out",
    },
  );

  const wallet = article.querySelector<HTMLElement>(".shop-ops-wallet");
  if (wallet) {
    const reveal = createCaseTimeline(wallet, "top 90%", "top 68%", 0.55);
    const children = Array.from(
      wallet.querySelectorAll<HTMLElement>(
        ":scope > .shop-ops-wallet-brand, :scope > .shop-ops-wallet-amount, :scope > .shop-ops-wallet-status",
      ),
    );

    if (children.length > 0) {
      addFromTo(
        reveal,
        children,
        { opacity: 0, y: mobile ? 6.5 : 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.04,
          ease: "power2.out",
        },
        0,
      );
    }

    const paidCheck = wallet.querySelector(".shop-ops-paid-check");
    if (paidCheck) {
      addFromTo(
        reveal,
        paidCheck,
        { opacity: 0, scale: 0.6 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: "power2.out",
        },
        0,
      );
    }

    const walletAfter = wallet.querySelector(".shop-ops-wallet-after");
    if (walletAfter) {
      addFromTo(
        reveal,
        walletAfter,
        { opacity: 0.3 },
        { opacity: 1, duration: 0.3, ease: "power2.out" },
        0,
      );
    }
  }

  const dashboard = article.querySelector<HTMLElement>(".shop-ops-dashboard");
  if (dashboard) {
    const reveal = createCaseTimeline(dashboard, "top 90%", "top 68%", 0.55);
    const children = Array.from(
      dashboard.querySelectorAll<HTMLElement>(
        ":scope > p, .shop-ops-dashboard-summary > div",
      ),
    );

    if (children.length > 0) {
      addFromTo(
        reveal,
        children,
        { opacity: 0, y: mobile ? 8 : 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        },
        0,
      );
    }

    const bars = Array.from(dashboard.querySelectorAll(".shop-ops-chart rect"));
    if (bars.length > 0) {
      addFromTo(
        reveal,
        bars,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.3,
          stagger: 0.03,
          ease: "power2.out",
        },
        0,
      );
    }
  }
}
