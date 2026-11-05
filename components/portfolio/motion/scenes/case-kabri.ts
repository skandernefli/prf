import {
  addFromTo,
  maskExistingTitle,
} from "../motion-utils";
import {
  addCaseLinkReveal,
  addCaseHeaderReveal,
  addCaseSceneExit,
  createCaseTimeline,
} from "./case-scene";

export function buildKabriScene(root: HTMLElement, mobile: boolean) {
  const article = root.querySelector<HTMLElement>("#kabri");
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

  const flat = article.querySelector<HTMLElement>(".kabri-flat");
  if (flat) {
    const reveal = createCaseTimeline(flat, "top 88%", "top 62%", 0.6);
    addFromTo(
      reveal,
      flat,
      { opacity: 0, clipPath: "inset(0 100% 0 0)" },
      {
        opacity: 1,
        clipPath: "inset(-4% -2% -4% 0)",
        duration: 0.6,
        ease: "power3.out",
      },
      0,
    );
  }

  const lease = article.querySelector<HTMLElement>(".kabri-lease");
  const leaseInner = lease?.querySelector(":scope > span");
  if (lease && leaseInner) {
    const reveal = createCaseTimeline(lease, "top 88%", "top 64%", 0.6);
    addFromTo(
      reveal,
      leaseInner,
      {
        opacity: 0,
        y: mobile ? 36 : 56,
        rotate: -2,
        scale: 0.96,
      },
      {
        opacity: 1,
        y: 0,
        rotate: 0,
        scale: 1,
        duration: 0.55,
        ease: "power3.out",
      },
      0,
    );
  }

  const inspection = article.querySelector<HTMLElement>(".kabri-inspection");
  const inspectionInner = inspection?.querySelector(":scope > span");
  if (inspection && inspectionInner) {
    const reveal = createCaseTimeline(
      inspection,
      "top 86%",
      "top 62%",
      0.6,
    );

    addFromTo(
      reveal,
      inspectionInner,
      { opacity: 0, y: mobile ? 25 : 38, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        ease: "power3.out",
      },
      0,
    );

    const crack = article.querySelector(".kabri-crack");
    if (crack) {
      addFromTo(
        reveal,
        crack,
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 0.45, ease: "power2.inOut" },
        0,
      );
    }

    const detection = article.querySelector(".kabri-detection");
    if (detection) {
      addFromTo(
        reveal,
        detection,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" },
        0,
      );
    }
  }

  const repair = article.querySelector<HTMLElement>(".kabri-repair");
  const repairInner = repair?.querySelector(":scope > span");
  if (repair && repairInner) {
    const reveal = createCaseTimeline(repair, "top 90%", "top 66%", 0.55);
    addFromTo(
      reveal,
      repairInner,
      {
        opacity: 0,
        y: mobile ? 31 : 48,
        rotate: 2,
      },
      {
        opacity: 1,
        y: 0,
        rotate: 0,
        duration: 0.55,
        ease: "power3.out",
      },
      0,
    );

    const wrench = article.querySelector(".kabri-wrench");
    if (wrench) {
      addFromTo(
        reveal,
        wrench,
        { opacity: 0.4 },
        { opacity: 1, duration: 0.45, ease: "power2.out" },
        0,
      );
    }

    const assigned = article.querySelector(".kabri-assigned");
    if (assigned) {
      addFromTo(
        reveal,
        assigned,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: "power2.out" },
        0,
      );
    }
  }

  const book = article.querySelector<HTMLElement>(".kabri-book");
  const bookInner = book?.querySelector(":scope > span");
  if (book && bookInner) {
    const reveal = createCaseTimeline(book, "top 90%", "top 68%", 0.55);
    addFromTo(
      reveal,
      bookInner,
      { opacity: 0, y: mobile ? 42 : 64, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
      },
      0,
    );

    const rows = Array.from(
      article.querySelectorAll(
        ".kabri-rent-row, .kabri-expense-row, .kabri-other-row, .kabri-net-row, .kabri-tax-record",
      ),
    );
    if (rows.length > 0) {
      addFromTo(
        reveal,
        rows,
        { opacity: 0.3 },
        {
          opacity: 1,
          duration: 0.35,
          stagger: 0.05,
          ease: "power2.out",
        },
        0,
      );
    }

    const taxStatus = article.querySelector(".kabri-tax-status");
    if (taxStatus) {
      addFromTo(
        reveal,
        taxStatus,
        { opacity: 0.3, filter: "blur(3px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.35,
          ease: "power2.out",
        },
        0,
      );
    }
  }

}
