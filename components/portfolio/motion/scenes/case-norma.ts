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

export function buildNormaScene(root: HTMLElement, mobile: boolean) {
  const article = root.querySelector<HTMLElement>("#norma");
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

  const ledgerTop = article.querySelector<HTMLElement>(".scan-ledger-top");
  const ledgerTopInner = ledgerTop?.querySelector(":scope > span");
  if (ledgerTop && ledgerTopInner) {
    const reveal = createCaseTimeline(
      ledgerTop,
      "top 88%",
      "top 64%",
      0.6,
    );
    addFromTo(
      reveal,
      ledgerTopInner,
      { opacity: 0, clipPath: "inset(0 100% 0 0)" },
      {
        opacity: 1,
        clipPath: "inset(-2% -2% -2% 0)",
        duration: 0.55,
        ease: "power3.out",
      },
      0,
    );
  }

  const acme = article.querySelector<HTMLElement>(".scan-paper-acme");
  const acmeInner = acme?.querySelector(":scope > span");
  if (acme && acmeInner) {
    const reveal = createCaseTimeline(acme, "top 88%", "top 64%", 0.6);
    addFromTo(
      reveal,
      acmeInner,
      {
        opacity: 0,
        x: mobile ? -22 : -40,
        rotate: -3,
      },
      {
        opacity: 1,
        x: 0,
        rotate: 0,
        duration: 0.55,
        ease: "power3.out",
      },
      0,
    );
  }

  const river = article.querySelector<HTMLElement>(".scan-paper-river");
  const riverInner = river?.querySelector(":scope > span");
  if (river && riverInner) {
    const reveal = createCaseTimeline(river, "top 88%", "top 64%", 0.6);
    addFromTo(
      reveal,
      riverInner,
      {
        opacity: 0,
        x: mobile ? -18 : -32,
        rotate: -2,
      },
      {
        opacity: 1,
        x: 0,
        rotate: 0,
        duration: 0.5,
        ease: "power3.out",
      },
      0,
    );
  }

  const riverCover = article.querySelector<HTMLElement>(
    ".scan-paper-river-cover",
  );
  const riverCoverInner = riverCover?.querySelector(":scope > span");
  if (riverCover && riverCoverInner) {
    const reveal = createCaseTimeline(
      riverCover,
      "top 88%",
      "top 64%",
      0.6,
    );
    addFromTo(
      reveal,
      riverCoverInner,
      { opacity: 0, x: mobile ? 5.5 : 10 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: "power3.out",
      },
      0,
    );
  }

  const front = article.querySelector<HTMLElement>(".scan-paper-front");
  const frontInner = front?.querySelector(":scope > span");
  if (front && frontInner) {
    const reveal = createCaseTimeline(front, "top 88%", "top 64%", 0.6);
    addFromTo(
      reveal,
      frontInner,
      {
        opacity: 0,
        x: mobile ? -35 : -64,
        y: mobile ? 16 : 24,
        rotate: -4,
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        rotate: 0,
        duration: 0.6,
        ease: "power3.out",
      },
      0,
    );
  }

  const main = article.querySelector<HTMLElement>(".scan-paper-main");
  const mainInner = main?.querySelector(":scope > span");
  if (main && mainInner) {
    const reveal = createCaseTimeline(main, "top 88%", "top 62%", 0.6);
    addFromTo(
      reveal,
      mainInner,
      { opacity: 0, y: mobile ? 31 : 48, scale: 0.94 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        ease: "power3.out",
      },
      0,
    );
  }

  const rejected = article.querySelector<HTMLElement>(
    ".scan-paper-rejected",
  );
  const rejectedInner = rejected?.querySelector(":scope > span");
  if (rejected && rejectedInner) {
    const reveal = createCaseTimeline(
      rejected,
      "top 90%",
      "top 66%",
      0.55,
    );
    addFromTo(
      reveal,
      rejectedInner,
      {
        opacity: 0,
        x: mobile ? 20 : 36,
        rotate: 4,
      },
      {
        opacity: 1,
        x: 0,
        rotate: 0,
        duration: 0.5,
        ease: "power3.out",
      },
      0,
    );
  }

  const ledgerBottom = article.querySelector<HTMLElement>(
    ".scan-ledger-bottom",
  );
  const ledgerBottomInner = ledgerBottom?.querySelector(":scope > span");
  if (ledgerBottom && ledgerBottomInner) {
    const reveal = createCaseTimeline(
      ledgerBottom,
      "top 90%",
      "top 68%",
      0.55,
    );
    addFromTo(
      reveal,
      ledgerBottomInner,
      { opacity: 0, clipPath: "inset(0 0 0 100%)" },
      {
        opacity: 1,
        clipPath: "inset(-2% -2% -2% 0)",
        duration: 0.55,
        ease: "power3.out",
      },
      0,
    );
  }

  const extracted = article.querySelector<HTMLElement>(".scan-extracted");
  if (extracted) {
    const targets = Array.from(
      extracted.querySelectorAll<HTMLElement>(":scope > p, :scope dl > div"),
    );
    if (targets.length > 0) {
      const reveal = createCaseTimeline(
        extracted,
        "top 92%",
        "top 68%",
        0.55,
      );
      addFromTo(
        reveal,
        targets,
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

      // The dashed threads fade in once the values are on screen.
      const connectors = Array.from(
        article.querySelectorAll<SVGPathElement>(".scan-connector"),
      );
      if (connectors.length > 0) {
        addFromTo(
          reveal,
          connectors,
          { opacity: 0 },
          { opacity: 1, duration: 0.45, stagger: 0.12, ease: "power2.out" },
          0.25,
        );
      }
    }
  }
}
