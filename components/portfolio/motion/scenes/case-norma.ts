import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { addFromTo, maskExistingTitle } from "../motion-utils";
import {
  addCaseHeaderReveal,
  addCaseLinkReveal,
  addCaseSceneExit,
  createCaseTimeline,
} from "./case-scene";

gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger);

const FIELDS = ["invoice", "total", "status"] as const;
const SHAPE_SELECTOR = "rect, path, circle, ellipse, line, polyline, polygon";
const CARET = "|";

type Drift = {
  selectors: string[];
  x: [number, number];
  rotation: [number, number];
};

// Each entry drifts together. Overlay pairs share one entry so they never
// separate while moving.
const DRIFTS: Drift[] = [
  { selectors: [".scan-paper-acme"], x: [-16, 14], rotation: [-4, 3] },
  {
    selectors: [
      ".scan-paper-river:not(.scan-paper-river-cover)",
      ".scan-paper-river-cover",
    ],
    x: [12, -12],
    rotation: [3, -3],
  },
  {
    selectors: [".scan-paper-front", ".scan-paper-main"],
    x: [-12, 12],
    rotation: [-2.5, 2.5],
  },
  { selectors: [".scan-paper-rejected"], x: [14, -14], rotation: [5, -4] },
];

/** The drawable shapes of a [data-scan-field] element (it may be a <g>). */
function shapesOf(el: Element): SVGGeometryElement[] {
  if (el.matches(SHAPE_SELECTOR)) return [el as SVGGeometryElement];
  return Array.from(el.querySelectorAll<SVGGeometryElement>(SHAPE_SELECTOR));
}

/** Draws a box outline, fading in so round caps don't leave a dot at 0%. */
function addBoxDraw(
  timeline: gsap.core.Timeline,
  shapes: SVGGeometryElement[],
  duration: number,
  position: number,
) {
  if (shapes.length === 0) return;
  const finalOpacity = shapes.map((shape) => {
    const value = parseFloat(getComputedStyle(shape).opacity);
    return Number.isFinite(value) ? value : 1;
  });
  addFromTo(
    timeline,
    shapes,
    { drawSVG: "0%", opacity: 0 },
    {
      drawSVG: "100%",
      opacity: (index: number) => finalOpacity[index],
      duration,
      ease: "power2.inOut",
    },
    position,
  );
}

/** Types `el`'s text one character at a time (scrub-safe, works in reverse). */
function addTyping(
  timeline: gsap.core.Timeline,
  el: HTMLElement,
  full: string,
  duration: number,
  position: gsap.Position,
) {
  const state = { n: 0 };
  el.textContent = "";
  timeline.fromTo(
    state,
    { n: 0 },
    {
      n: full.length,
      duration,
      ease: "none",
      onUpdate: () => {
        const count = Math.round(state.n);
        el.textContent =
          count <= 0
            ? ""
            : count >= full.length
              ? full
              : full.slice(0, count) + CARET;
      },
    },
    position,
  );
}

/** Counts a number inside `full` (e.g. "2,280.00") up from zero. */
function addCountUp(
  timeline: gsap.core.Timeline,
  el: HTMLElement,
  full: string,
  duration: number,
  position: gsap.Position,
) {
  const match = full.match(/\d[\d,]*(?:\.(\d+))?/);
  if (!match || match.index === undefined) return;

  const prefix = full.slice(0, match.index);
  const suffix = full.slice(match.index + match[0].length);
  const decimals = match[1]?.length ?? 0;
  const target = parseFloat(match[0].replace(/,/g, ""));
  const format = (value: number) =>
    value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  const state = { value: 0 };
  el.textContent = prefix + format(0) + suffix;
  timeline.fromTo(
    state,
    { value: 0 },
    {
      value: target,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = prefix + format(state.value) + suffix;
      },
    },
    position,
  );
}

/**
 * The connector paths are measured after mount, so their `d` is empty at
 * first. DrawSVG needs real geometry, so wait until all of them have one.
 */
function whenConnectorsReady(article: HTMLElement, run: () => void) {
  const ready = () => {
    const paths = Array.from(
      article.querySelectorAll<SVGPathElement>(".scan-connector-reveal"),
    );
    return paths.length > 0 && paths.every((path) => path.getAttribute("d"));
  };

  if (ready()) {
    run();
    return;
  }

  const onMeasured = () => {
    if (!ready()) return;
    window.removeEventListener("scan-connectors:measured", onMeasured);
    run();
    ScrollTrigger.refresh();
  };
  window.addEventListener("scan-connectors:measured", onMeasured);
}

export function buildNormaScene(root: HTMLElement, mobile: boolean) {
  const article = root.querySelector<HTMLElement>("#norma");
  if (!article) return;

  addCaseLinkReveal(article);
  addCaseSceneExit(article);
  addCaseHeaderReveal(article);

  // ---- Title (unchanged) ----
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

  // ---- Ledgers: static, no animation ----

  // ---- Papers: small x translation + small rotation, entry to exit ----
  const k = mobile ? 0.6 : 1;
  const drift = createCaseTimeline(article, "top bottom", "bottom top", 0.6);

  DRIFTS.forEach(({ selectors, x, rotation }) => {
    const targets = selectors
      .map((selector) => article.querySelector(`${selector} > span`))
      .filter((target): target is HTMLElement => target instanceof HTMLElement);
    if (targets.length === 0) return;

    addFromTo(
      drift,
      targets,
      { x: x[0] * k, rotation: rotation[0] },
      { x: x[1] * k, rotation: rotation[1], duration: 1, ease: "none" },
      0,
    );
  });

  // The connectors are measured from the boxes' live positions, so tell them
  // to re-measure while the papers move.
  drift.eventCallback("onUpdate", () => {
    window.dispatchEvent(new Event("scan-connectors:measure"));
  });

  // ---- Boxes -> connectors -> extracted values (one sequence) ----
  const extracted = article.querySelector<HTMLElement>(".scan-extracted");
  const main = article.querySelector<HTMLElement>(".scan-paper-main");
  const front = article.querySelector<HTMLElement>(".scan-paper-front");
  const trigger = extracted ?? main;
  if (!trigger) return;

  whenConnectorsReady(article, () => {
    const sequence = createCaseTimeline(trigger, "top 85%", "bottom 45%", 0.8);

    // 1) The three orange boxes draw one after another. If the front
    //    overlay carries copies of the boxes, they draw together.
    FIELDS.forEach((field, index) => {
      const shapes = [main, front].flatMap((paper) =>
        paper
          ? Array.from(
              paper.querySelectorAll(`[data-scan-field="${field}"]`),
            ).flatMap(shapesOf)
          : [],
      );
      addBoxDraw(sequence, shapes, 0.5, index * 0.3);
    });

    // 2) Right after the boxes, the connectors are drawn with DrawSVG.
    //    The solid mask path is what draws, so the dashes stay dashed.
    const connectorMasks = Array.from(
      article.querySelectorAll<SVGPathElement>(".scan-connector-reveal"),
    );
    if (connectorMasks.length > 0) {
      connectorMasks.forEach((path) => path.removeAttribute("pathLength"));
      gsap.set(connectorMasks, { drawSVG: "0%" });
      addFromTo(
        sequence,
        connectorMasks,
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          duration: 0.6,
          stagger: 0.2,
          ease: "power1.inOut",
        },
        ">",
      );
    }

    // 3) Once the connectors are fully drawn, the extracted values reveal:
    //    labels fade in, text values are typed, the number counts up.
    if (extracted) {
      sequence.addLabel("values", ">");

      const intro = Array.from(
        extracted.querySelectorAll<HTMLElement>(":scope > p"),
      );
      const rows = Array.from(
        extracted.querySelectorAll<HTMLElement>(":scope dl > div"),
      );

      // Opacity only: a transform would shift the points the connectors
      // are measured to.
      const fadeTargets = [...intro, ...rows];
      if (fadeTargets.length > 0) {
        addFromTo(
          sequence,
          fadeTargets,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.3,
            stagger: 0.08,
            ease: "power2.out",
          },
          "values",
        );
      }

      rows.forEach((row, index) => {
        const valueEl =
          row.querySelector<HTMLElement>("dd") ??
          (row.lastElementChild as HTMLElement | null);
        if (!valueEl) return;

        const full = (valueEl.textContent ?? "").trim();
        if (!full) return;

        const start = `values+=${0.15 + index * 0.35}`;
        const isNumber = /\d/.test(full) && !/[A-Za-z]/.test(full);

        if (isNumber) {
          addCountUp(sequence, valueEl, full, 0.6, start);
        } else {
          addTyping(sequence, valueEl, full, 0.1 * full.length + 0.1, start);
        }
      });
    }
  });
}
