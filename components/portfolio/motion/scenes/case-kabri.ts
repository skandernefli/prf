import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

import { addFromTo, maskExistingTitle } from "../motion-utils";
import {
  addCaseHeaderReveal,
  addCaseLinkReveal,
  addCaseSceneExit,
  createCaseTimeline,
} from "./case-scene";

gsap.registerPlugin(DrawSVGPlugin);

/**
 * Draws a stroke from 0% to 100% inside a scrubbed timeline.
 * Opacity is faded in during the first instant so a round linecap
 * doesn't leave a dot at drawSVG: "0%".
 */
function addDraw(
  timeline: gsap.core.Timeline,
  target: Element,
  duration: number,
  position: number,
  ease = "power2.out",
) {
  gsap.set(target, { drawSVG: "0%", opacity: 0 });
  addFromTo(
    timeline,
    target,
    { opacity: 0 },
    { opacity: 1, duration: 0.05, ease: "none" },
    position,
  );
  addFromTo(
    timeline,
    target,
    { drawSVG: "0%" },
    { drawSVG: "100%", duration, ease },
    position,
  );
}

export function buildKabriScene(root: HTMLElement, mobile: boolean) {
  const article = root.querySelector<HTMLElement>("#kabri");
  if (!article) return;

  addCaseLinkReveal(article);
  addCaseSceneExit(article);
  addCaseHeaderReveal(article);

  // ---- Title: hero-style mask rise + blur ----
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

  // ---- .kabri-flat (house SVG): static, no animation ----

  // ---- .kabri-lease: ONLY signature + check circle + check path ----
  const lease = article.querySelector<HTMLElement>(".kabri-lease");
  if (lease) {
    // Signature. `pathLength="1"` can confuse DrawSVG, so strip it.
    const signature = lease.querySelector<SVGPathElement>(".kabri-signature");
    if (signature) {
      signature.removeAttribute("pathLength");
      const sigTl = createCaseTimeline(signature, "top 88%", "bottom 52%", 0.8);
      addDraw(sigTl, signature, 1, 0);
    }

    // Check ring + checkmark (drawn together, ring first)
    const checkGroup = lease.querySelector<SVGGElement>("g.kabri-lease-check");
    if (checkGroup) {
      const ring = checkGroup.querySelector<SVGCircleElement>("circle");
      const tick = checkGroup.querySelector<SVGPathElement>("path");
      tick?.removeAttribute("pathLength");

      if (ring || tick) {
        const checkTl = createCaseTimeline(
          checkGroup,
          "top 88%",
          "bottom 52%",
          0.8,
        );
        if (ring) addDraw(checkTl, ring, 0.6, 0);
        if (tick) addDraw(checkTl, tick, 0.4, ring ? 0.5 : 0);
      }
    }
  }

  // ---- .kabri-inspection (unchanged) ----
  const inspection = article.querySelector<HTMLElement>(".kabri-inspection");
  const inspectionInner = inspection?.querySelector(":scope > span");
  if (inspection && inspectionInner) {
    const reveal = createCaseTimeline(inspection, "top 86%", "top 62%", 0.6);

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

  // ---- .kabri-repair (unchanged) ----
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

  // ---- Wrench: no reveal; ~30° rotation from section entry to exit ----
  // Re-assert the baked-in SVG transform through GSAP so it owns the
  // element's transform (pivot matches the original rotate(... 180 100)).
  const wrench = article.querySelector<SVGGElement>(".kabri-wrench");
  if (wrench) {
    gsap.set(wrench, {
      svgOrigin: "180 100",
      x: -9,
      y: 5,
      rotation: -15,
    });

    const wrenchTl = createCaseTimeline(
      article,
      "top bottom",
      "bottom top",
      0.6,
    );
    addFromTo(
      wrenchTl,
      wrench,
      { rotation: -15 },
      { rotation: 15, duration: 1, ease: "none" }, // 30° total sweep
      0,
    );
  }

  // ---- .kabri-book: frame static; only listed text + check ring + check ----
  const book = article.querySelector<HTMLElement>(".kabri-book");
  if (book) {
    // Ledger: REVENUE, LUMBER, HARDWARE, NET (label + amount move together)
    const ledgerRows = Array.from(
      book.querySelectorAll(
        ".kabri-rent-row, .kabri-expense-row, .kabri-other-row, .kabri-net-row",
      ),
    );
    if (ledgerRows.length > 0) {
      gsap.set(ledgerRows, { opacity: 0 });
      const ledgerTl = createCaseTimeline(
        ledgerRows[0],
        "top 88%",
        "top 40%",
        0.8,
      );
      addFromTo(
        ledgerTl,
        ledgerRows,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, stagger: 0.25, ease: "power2.out" },
        0,
      );
    }

    // Tax record: RAW MATERIALS, C$4,800, INVOICE, MATCHED, SCHEDULE,
    // CRA / SCHEDULE 125, FILED, then the check ring + checkmark
    const taxRecord = book.querySelector<SVGGElement>(".kabri-tax-record");
    if (taxRecord) {
      const taxTexts = Array.from(taxRecord.querySelectorAll(":scope > text"));
      const ring = taxRecord.querySelector<SVGCircleElement>("circle");
      const tick = taxRecord.querySelector<SVGGeometryElement>(
        "path, polyline, line",
      );
      tick?.removeAttribute("pathLength");

      if (taxTexts.length > 0 || ring || tick) {
        const taxTl = createCaseTimeline(taxRecord, "top 88%", "top 40%", 0.8);

        if (taxTexts.length > 0) {
          gsap.set(taxTexts, { opacity: 0 });
          addFromTo(
            taxTl,
            taxTexts,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, stagger: 0.2, ease: "power2.out" },
            0,
          );
        }

        const textEnd =
          taxTexts.length > 0 ? 0.4 + (taxTexts.length - 1) * 0.2 : 0;
        const ringStart = Math.max(0, textEnd - 0.1);

        if (ring) addDraw(taxTl, ring, 0.5, ringStart);
        if (tick)
          addDraw(taxTl, tick, 0.35, ring ? ringStart + 0.4 : ringStart);
      }
    }
  }
}
