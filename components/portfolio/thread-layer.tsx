"use client";

import { useEffect, useRef, useState } from "react";

import {
  PathBuilder,
  appendPath,
  assertContinuous,
  assertInside,
  at,
  buildFingerprint,
  buildProjectRoute,
  buildTangle,
  capabilityRowMarkers,
  clamp,
  format,
  middle,
  mobileCapabilitiesTemplates,
  moveCommand,
  parsePath,
  pathEnd,
  projectTemplates,
  retargetEnd,
  retargetStart,
  segmentPath,
  serializePath,
  tailCommand,
  transformPath,
  workTemplate,
  type Point,
  type Rect,
  type ThreadMarker,
  type ThreadRoute,
} from "./thread-geometry";

type ThreadRing = {
  x: number;
  y: number;
  radius: number;
  core: number;
};

type ThreadGeometry = {
  width: number;
  height: number;
  routes: ThreadRoute[];
  markers: ThreadMarker[];
  rings: ThreadRing[];
  aboutRect: Rect | null;
};

const anchorRect = (
  root: HTMLElement,
  rootRect: DOMRect,
  anchor: string,
): Rect => {
  const elements = root.querySelectorAll<HTMLElement>(
    `[data-thread-anchor="${anchor}"]`,
  );

  if (elements.length !== 1) {
    throw new Error(
      `Thread layer requires exactly one "${anchor}" anchor; found ${elements.length}.`,
    );
  }

  return rectFromElement(elements[0], rootRect);
};

const rectFromElement = (element: Element, rootRect: DOMRect): Rect => {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left - rootRect.left,
    top: rect.top - rootRect.top,
    right: rect.right - rootRect.left,
    bottom: rect.bottom - rootRect.top,
    width: rect.width,
    height: rect.height,
  };
};

const projectCopyBottom = (
  root: HTMLElement,
  rootRect: DOMRect,
  id: string,
): number => {
  const project = root.querySelector<HTMLElement>(`#${id}`);
  if (!project) {
    throw new Error(`Thread layer requires the "${id}" project section.`);
  }

  const copy = project.querySelectorAll<HTMLElement>(
    ".world-kicker, .world-description",
  );
  return Math.max(
    ...Array.from(copy, (element) =>
      rectFromElement(element, rootRect).bottom,
    ),
  );
};

const selectedRect = (
  root: HTMLElement,
  rootRect: DOMRect,
  selector: string,
  description: string,
): Rect => {
  const elements = root.querySelectorAll<HTMLElement>(selector);
  if (elements.length !== 1) {
    throw new Error(
      `Thread layer requires exactly one ${description}; found ${elements.length}.`,
    );
  }

  return rectFromElement(elements[0], rootRect);
};

function appendNodePass(
  builder: PathBuilder,
  node: Point,
  laneX: number,
  halfSpan = 52,
) {
  const handle = halfSpan * 0.45;
  builder.cubic(
    { x: laneX, y: node.y - halfSpan + handle },
    { x: node.x, y: node.y - handle },
    { x: node.x, y: node.y },
  );
  builder.cubic(
    { x: node.x, y: node.y + handle },
    { x: laneX, y: node.y + halfSpan - handle },
    { x: laneX, y: node.y + halfSpan },
  );
}

function appendBulb(
  builder: PathBuilder,
  cx: number,
  top: number,
  rx: number,
  ry: number,
) {
  const bottom = top + ry * 2;
  const neckX = cx - rx * 0.296;

  builder.line({ x: cx, y: top });
  builder.cubic(
    { x: cx, y: top + ry * 0.7 },
    { x: cx + rx * 0.074, y: top + ry * 1.25 },
    { x: cx + rx * 0.074, y: bottom },
  );
  builder.cubic(
    { x: cx + rx * 0.074, y: bottom + ry * 0.26 },
    { x: cx + rx * 0.296, y: bottom + ry * 0.26 },
    { x: cx + rx * 0.296, y: bottom },
  );
  builder.cubic(
    { x: cx + rx * 0.296, y: bottom - ry * 0.39 },
    { x: cx + rx, y: bottom - ry * 0.52 },
    { x: cx + rx, y: top + ry * 0.9 },
  );
  builder.cubic(
    { x: cx + rx, y: top + ry * 0.35 },
    { x: cx + rx * 0.6, y: top },
    { x: cx, y: top },
  );
  builder.cubic(
    { x: cx - rx * 0.6, y: top },
    { x: cx - rx, y: top + ry * 0.35 },
    { x: cx - rx, y: top + ry * 0.9 },
  );
  builder.cubic(
    { x: cx - rx, y: bottom - ry * 0.52 },
    { x: cx - rx * 0.296, y: bottom - ry * 0.39 },
    { x: neckX, y: bottom },
  );
}

function buildDesktopWork(
  heroExit: Point,
  workTop: number,
  workBottom: number,
  width: number,
): ThreadRoute {
  const yScale =
    (workBottom - workTop) / (workTemplate.bottom - workTemplate.top);
  const d = retargetStart(
    transformPath(workTemplate.d, (value) => ({
      x: (value.x * width) / 1425,
      y: workTop + (value.y - workTemplate.top) * yScale,
    })),
    heroExit,
  );

  return {
    id: "work",
    d,
    start: heroExit,
    end: pathEnd(d),
  };
}

function buildMobileWork(
  heroExit: Point,
  workTop: number,
  workBottom: number,
  drawing: Rect,
  steps: Rect[],
  width: number,
): ThreadRoute {
  const gutter = width - 12;
  const firstLabel = steps[0];
  const lastLabel = steps[steps.length - 1];
  const bulbTop = drawing.top + Math.max(8, drawing.height * 0.016);
  const bulbCenter = clamp(
    drawing.left + drawing.width * 0.32,
    70,
    Math.max(70, firstLabel.left - 82),
  );
  const rx = Math.max(
    34,
    Math.min(
      drawing.width * 0.17,
      firstLabel.left - bulbCenter - 34,
      68,
    ),
  );
  const ry = Math.max(
    34,
    Math.min(56, (firstLabel.top - bulbTop - 26) / 2),
  );
  const bottom = bulbTop + ry * 2;
  const neckX = bulbCenter - rx * 0.296;
  const waveTop = bottom + Math.max(30, drawing.height * 0.06);
  const waveGap = clamp(
    ((lastLabel.top - firstLabel.top) / (steps.length - 1)) * 0.9,
    38,
    56,
  );
  const waveRight = Math.min(bulbCenter + rx * 0.95, firstLabel.left - 34);
  const waveLeft = Math.max(12, bulbCenter - rx * 0.95);
  const exitY = lastLabel.bottom + Math.max(18, drawing.height * 0.045);

  const builder = new PathBuilder(heroExit);
  builder.line({ x: gutter, y: bulbTop - 58 });
  builder.cubic(
    { x: gutter, y: bulbTop - 24 },
    { x: bulbCenter + rx * 0.8, y: bulbTop - 28 },
    { x: bulbCenter, y: bulbTop },
  );
  appendBulb(builder, bulbCenter, bulbTop, rx, ry);
  builder.line({ x: neckX, y: waveTop });
  builder.cubic(
    { x: neckX + 8, y: waveTop + 7 },
    { x: waveRight - 28, y: waveTop + 7 },
    { x: waveRight, y: waveTop + 7 },
  );
  builder.cubic(
    { x: waveRight + 18, y: waveTop + 7 },
    { x: waveRight + 18, y: waveTop + waveGap },
    { x: waveRight - 8, y: waveTop + waveGap },
  );
  builder.line({ x: waveLeft + 8, y: waveTop + waveGap });
  builder.cubic(
    { x: waveLeft - 16, y: waveTop + waveGap },
    { x: waveLeft - 16, y: waveTop + waveGap * 2 },
    { x: waveLeft + 8, y: waveTop + waveGap * 2 },
  );
  builder.line({ x: waveRight - 8, y: waveTop + waveGap * 2 });
  builder.cubic(
    { x: waveRight + 16, y: waveTop + waveGap * 2 },
    { x: waveRight + 16, y: waveTop + waveGap * 3 },
    { x: waveRight - 8, y: waveTop + waveGap * 3 },
  );
  builder.line({ x: waveLeft + 20, y: waveTop + waveGap * 3 });
  builder.cubic(
    { x: waveLeft - 8, y: waveTop + waveGap * 3 },
    { x: waveLeft - 8, y: waveTop + waveGap * 3 + 10 },
    { x: waveLeft + 34, y: waveTop + waveGap * 3 + 10 },
  );
  builder.cubic(
    { x: waveRight - 22, y: waveTop + waveGap * 3 + 16 },
    { x: waveRight, y: waveTop + waveGap * 3 + 52 },
    { x: waveRight, y: exitY - 24 },
  );
  builder.cubic(
    { x: waveRight, y: exitY },
    { x: gutter, y: exitY },
    { x: gutter, y: exitY + 32 },
  );
  builder.line({ x: gutter, y: workBottom });

  return {
    id: "work",
    d: builder.d,
    start: heroExit,
    end: { x: gutter, y: workBottom },
  };
}

function buildDesktopCapabilities(
  workEnd: Point,
  orbit: Rect,
  items: Rect[],
  projectTop: number,
  width: number,
): { routes: ThreadRoute[]; markers: ThreadMarker[] } {
  const centerX = orbit.left + orbit.width / 2;
  const splitY = orbit.top - 18;
  const mergeY = orbit.top + orbit.height - 18;
  const railRight = width - 12;
  const railLeft = Math.max(48, width * 0.0578);
  const heading = orbit.top;
  const lowerRailY = Math.min(
    splitY - 44,
    Math.max(heading - 140, orbit.top - 170),
  );
  const firstTurn = workEnd.y + 18;
  const entry = new PathBuilder(workEnd);
  entry
    .line({ x: workEnd.x, y: firstTurn })
    .arc(12, 12, 0, 0, 0, {
      x: workEnd.x + 12,
      y: firstTurn + 12,
    })
    .line({ x: railRight - 12, y: firstTurn + 12 })
    .arc(12, 12, 0, 0, 1, {
      x: railRight,
      y: firstTurn + 24,
    })
    .line({ x: railRight, y: lowerRailY - 32 })
    .arc(32, 32, 0, 0, 1, {
      x: railRight - 32,
      y: lowerRailY,
    })
    .line({ x: railLeft + 32, y: lowerRailY })
    .arc(32, 32, 0, 0, 0, {
      x: railLeft,
      y: lowerRailY + 64,
    })
    .line({ x: centerX - 12, y: lowerRailY + 64 })
    .arc(12, 12, 0, 0, 1, {
      x: centerX,
      y: lowerRailY + 76,
    })
    .line({ x: centerX, y: splitY });

  const entryRoute: ThreadRoute = {
    id: "capabilities-entry",
    d: entry.d,
    start: workEnd,
    end: { x: centerX, y: splitY },
  };

  const split = { x: centerX, y: splitY };
  const merge = { x: centerX, y: mergeY };
  const rx = orbit.width / 2;
  const ry = orbit.height / 2;
  const leftArc = segmentPath(
    "capabilities-left",
    split,
    (builder) => {
      builder.arc(rx, ry, 0, 0, 0, merge);
    },
  );
  const rightArc = segmentPath(
    "capabilities-right",
    split,
    (builder) => {
      builder.arc(rx, ry, 0, 0, 1, merge);
    },
  );
  const exit = segmentPath("capabilities-exit", merge, (builder) => {
    builder.line({ x: centerX, y: projectTop });
  });

  const itemCenters = items.map((item) => middle(item).y);
  const markers = capabilityRowMarkers(
    centerX,
    splitY,
    mergeY,
    rx,
    itemCenters,
    false,
    0,
    0,
  );

  markers.push(
    { kind: "junction", x: split.x, y: split.y, radius: 4 },
    { kind: "junction", x: merge.x, y: merge.y, radius: 4 },
  );

  return {
    routes: [entryRoute, leftArc, rightArc, exit],
    markers,
  };
}

function buildMobileCapabilities(
  workEnd: Point,
  orbit: Rect,
  items: Rect[],
  projectsTop: number,
  width: number,
): { routes: ThreadRoute[]; markers: ThreadMarker[] } {
  const scaleX = width / 375;
  const shiftY = orbit.top - 2034.90625;
  const centerX = orbit.left + orbit.width / 2;
  const splitY = orbit.top;
  const mergeY = orbit.top + orbit.height - 64;

  const itemRight = Math.max(...items.slice(0, 5).map((item) => item.right));
  const itemLeft = Math.min(...items.slice(5).map((item) => item.left));
  const naturalRail = 50.96875 * scaleX;
  const railRoom = Math.min(
    centerX - itemRight - 16,
    itemLeft - 16 - centerX,
  );
  const armScale = clamp(railRoom / naturalRail, 0.36, 0.644);
  const transformX = (x: number) =>
    centerX + (x * scaleX - 187.5 * scaleX) * armScale;
  const leftArmX = transformX(136.53125);
  const rightArmX = transformX(238.46875);

  const transformCapability = (d: string, retarget?: Point) => {
    let next = transformPath(d, (value) => ({
      x: transformX(value.x),
      y: value.y + shiftY,
    }));
    if (retarget) next = retargetEnd(next, retarget);
    return next;
  };

  const entryD = retargetStart(
    transformCapability(mobileCapabilitiesTemplates.entry.d, {
      x: centerX,
      y: splitY,
    }),
    workEnd,
  );
  const productD = transformCapability(
    mobileCapabilitiesTemplates.product.d,
    { x: centerX, y: mergeY },
  );
  const aiD = transformCapability(mobileCapabilitiesTemplates.ai.d, {
    x: centerX,
    y: mergeY,
  });
  const exitD = retargetEnd(
    transformCapability(mobileCapabilitiesTemplates.exit.d),
    { x: width - 12, y: projectsTop },
  );

  const routes: ThreadRoute[] = [
    {
      id: "capabilities-entry",
      d: entryD,
      start: workEnd,
      end: { x: centerX, y: splitY },
    },
    {
      id: "capabilities-product",
      d: productD,
      start: { x: centerX, y: splitY },
      end: { x: centerX, y: mergeY },
    },
    {
      id: "capabilities-ai",
      d: aiD,
      start: { x: centerX, y: splitY },
      end: { x: centerX, y: mergeY },
    },
    {
      id: "capabilities-exit",
      d: exitD,
      start: { x: centerX, y: mergeY },
      end: { x: width - 12, y: projectsTop },
    },
  ];

  const markers: ThreadMarker[] = items.map((item, index) => ({
    kind: "row",
    x: index < 5 ? leftArmX : rightArmX,
    y: item.top + Math.min(10, item.height * 0.09),
    radius: 6.5,
  }));
  markers.push(
    { kind: "junction", x: centerX, y: splitY, radius: 4 },
    { kind: "junction", x: centerX, y: mergeY, radius: 4 },
  );

  return { routes, markers };
}

type CreditFigures = {
  pan: Rect;
  gst: Rect;
  bank: Rect;
  itr: Rect;
  outcome: Rect;
};

function lerp(from: number, to: number, ratio: number) {
  return from + (to - from) * ratio;
}

function buildDesktopCreditflow(
  credit: Rect,
  figures: CreditFigures,
  intro: Rect,
  start: Point,
  end: Point,
): ThreadRoute {
  const { pan, gst, bank, itr, outcome } = figures;
  const topLane = intro.top - 18;
  const gapX = (pan.right + gst.left) / 2;
  const panTop = pan.top - 32;
  const leftLane = pan.left - 62;
  const panBottom = pan.bottom + 34;
  const belowGst = gst.bottom + 60;
  const rightLane = Math.min(credit.right - 24, outcome.right + 20);
  const belowOutcome = outcome.bottom + 20;
  const bankRight = bank.right + 40;
  const belowBank = bank.bottom + 28;
  const leftBottom = Math.max(34, bank.left - 70);
  const bottomLane = Math.min(credit.bottom - 12, bank.bottom + 62);

  const builder = new PathBuilder(start);

  // Clear the project description, then drop into the gap between PAN and GST.
  builder.cubic(
    { x: lerp(start.x, gapX, 0.38), y: start.y + 14 },
    { x: lerp(start.x, gapX, 0.78), y: topLane - 12 },
    { x: gapX, y: topLane },
  );
  builder.cubic(
    { x: gapX - 4, y: topLane + 50 },
    { x: gapX, y: panTop - 30 },
    { x: gapX, y: panTop },
  );

  // A left-hand sweep around PAN: above, outside, then below the document.
  builder.cubic(
    { x: gapX - 130, y: panTop },
    { x: leftLane + 105, y: panTop },
    { x: leftLane + 62, y: panTop + 10 },
  );
  builder.cubic(
    { x: leftLane + 16, y: panTop + 22 },
    { x: leftLane, y: panTop + 48 },
    { x: leftLane, y: panTop + 92 },
  );
  builder.line({ x: leftLane, y: pan.bottom - 18 });
  builder.cubic(
    { x: leftLane, y: pan.bottom + 8 },
    { x: leftLane + 38, y: panBottom },
    { x: leftLane + 108, y: panBottom },
  );
  builder.cubic(
    { x: leftLane + 230, y: panBottom },
    { x: gapX - 84, y: panBottom + 2 },
    { x: gapX, y: pan.bottom + 34 },
  );

  // Pass under GST and across the open band beneath the assessment panel.
  builder.cubic(
    { x: gapX, y: belowGst - 34 },
    { x: gapX + 22, y: belowGst - 4 },
    { x: gapX + 96, y: belowGst },
  );
  builder.cubic(
    { x: lerp(gapX, rightLane, 0.4), y: belowGst + 8 },
    { x: lerp(gapX, rightLane, 0.66), y: belowGst + 14 },
    { x: lerp(gapX, rightLane, 0.86), y: belowGst + 20 },
  );
  builder.cubic(
    { x: lerp(gapX, rightLane, 0.94), y: belowGst + 24 },
    { x: rightLane - 78, y: belowGst + 32 },
    { x: rightLane, y: belowGst + 44 },
  );

  // Run the right gutter past the outcome, then curl below it and the bank.
  builder.cubic(
    { x: rightLane + 2, y: belowGst + 120 },
    { x: rightLane, y: belowOutcome - 120 },
    { x: rightLane, y: belowOutcome },
  );
  builder.cubic(
    { x: rightLane - 90, y: belowOutcome + 2 },
    { x: outcome.left - 12, y: belowOutcome + 4 },
    { x: itr.right + 36, y: belowOutcome + 16 },
  );
  builder.cubic(
    { x: itr.right - 40, y: belowOutcome + 58 },
    { x: bankRight + 90, y: belowBank - 58 },
    { x: bankRight, y: belowBank },
  );
  builder.cubic(
    { x: lerp(bankRight, leftBottom, 0.36), y: belowBank + 5 },
    { x: lerp(bankRight, leftBottom, 0.7), y: belowBank + 8 },
    { x: leftBottom, y: belowBank + 12 },
  );

  // Turn along the bottom and eke out a vertical arrival at the why-me seam.
  builder.cubic(
    { x: leftBottom - 16, y: belowBank + 18 },
    { x: leftBottom - 14, y: bottomLane },
    { x: leftBottom + 34, y: bottomLane + 6 },
  );
  builder.cubic(
    { x: lerp(leftBottom, end.x, 0.32), y: bottomLane + 12 },
    { x: end.x, y: credit.bottom - 8 },
    { x: end.x, y: credit.bottom },
  );

  return {
    id: "project-creditflow",
    d: builder.d,
    start,
    end,
  };
}

function buildDesktopProjects(
  kabri: Rect,
  norma: Rect,
  mesa: Rect,
  credit: Rect,
  creditFigures: CreditFigures,
  creditIntro: Rect,
  width: number,
  firstStart: Point,
): { routes: ThreadRoute[]; handoff: Point } {
  const jNorma = { x: width * 0.58, y: kabri.bottom };
  const jMesa = { x: width * 0.53, y: norma.bottom };
  const jCredit = { x: width * 0.58, y: credit.top };
  const jWhy = { x: width * 0.61, y: credit.bottom };

  const routes: ThreadRoute[] = [
    buildProjectRoute(
      "project-kabri",
      projectTemplates.eigna.desktop,
      { width, top: kabri.top, height: kabri.height },
      {
        referenceWidth: 1440,
        start: firstStart,
        end: jNorma,
      },
    ),
    buildProjectRoute(
      "project-norma",
      projectTemplates.papertrail.desktop,
      { width, top: norma.top, height: norma.height },
      {
        referenceWidth: 1440,
        start: jNorma,
        end: jMesa,
      },
    ),
    buildProjectRoute(
      "project-mesa",
      projectTemplates.mesa.desktop,
      { width, top: mesa.top, height: mesa.height },
      {
        referenceWidth: 1440,
        start: jMesa,
        end: jCredit,
      },
    ),
    buildDesktopCreditflow(
      credit,
      creditFigures,
      creditIntro,
      jCredit,
      jWhy,
    ),
  ];

  return { routes, handoff: jWhy };
}

function bypassMobileCopy(
  route: ThreadRoute,
  copyBottom: number,
  gutter: number,
): ThreadRoute {
  const commands = parsePath(route.d);
  const joinIndex = commands.findIndex((command, index) => {
    if (index === 0 || command.values.length < 2) return false;
    return command.values[command.values.length - 1] > copyBottom + 32;
  });

  if (joinIndex < 1) return route;

  const joinValues = commands[joinIndex].values;
  const join = {
    x: joinValues[joinValues.length - 2],
    y: joinValues[joinValues.length - 1],
  };
  const builder = new PathBuilder(route.start);
  const bypassY = copyBottom + 32;

  builder.line({ x: gutter, y: bypassY });
  builder.cubic(
    { x: gutter, y: bypassY },
    { x: join.x + 42, y: bypassY },
    join,
  );
  appendPath(builder, serializePath(commands.slice(joinIndex + 1)));

  return { ...route, d: builder.d };
}

function buildMobileProjects(
  kabri: Rect,
  norma: Rect,
  mesa: Rect,
  credit: Rect,
  copyBottoms: [number, number, number, number],
  width: number,
  firstStart: Point,
  gutter: number,
): { routes: ThreadRoute[]; handoff: Point } {
  const jNorma = { x: gutter, y: kabri.bottom };
  const jMesa = { x: gutter, y: norma.bottom };
  const jCredit = { x: gutter, y: mesa.bottom };
  const jWhy = { x: gutter, y: credit.bottom };

  const routes: ThreadRoute[] = [
    bypassMobileCopy(
      buildProjectRoute(
        "project-kabri",
        projectTemplates.eigna.mobile,
        { width, top: kabri.top, height: kabri.height },
        {
          referenceWidth: 375,
          start: firstStart,
          end: jNorma,
        },
      ),
      copyBottoms[0],
      gutter,
    ),
    bypassMobileCopy(
      buildProjectRoute(
        "project-norma",
        projectTemplates.papertrail.mobile,
        { width, top: norma.top, height: norma.height },
        {
          referenceWidth: 375,
          start: jNorma,
          end: jMesa,
        },
      ),
      copyBottoms[1],
      gutter,
    ),
    bypassMobileCopy(
      buildProjectRoute(
        "project-mesa",
        projectTemplates.mesa.mobile,
        { width, top: mesa.top, height: mesa.height },
        {
          referenceWidth: 375,
          start: jMesa,
          end: jCredit,
        },
      ),
      copyBottoms[2],
      gutter,
    ),
    bypassMobileCopy(
      buildProjectRoute(
        "project-creditflow",
        projectTemplates.creditflow.mobile,
        { width, top: credit.top, height: credit.height },
        {
          referenceWidth: 375,
          start: jCredit,
          end: jWhy,
        },
      ),
      copyBottoms[3],
      gutter,
    ),
  ];

  return { routes, handoff: jWhy };
}

function buildDesktopWhy(
  jWhy: Point,
  gutter: number,
  intro: Rect,
  nodes: Point[],
  copies: Rect[],
  jAbout: Point,
): ThreadRoute {
  const leftLane = nodes[0].x - 80;
  const rightLane = nodes[1].x + 80;
  let lane = leftLane;

  const builder = new PathBuilder(jWhy);
  builder.cubic(
    { x: jWhy.x + 120, y: jWhy.y + 18 },
    { x: gutter, y: jWhy.y + 72 },
    { x: gutter, y: jWhy.y + 128 },
  );
  builder.line({ x: gutter, y: intro.bottom + 18 });
  builder.cubic(
    { x: gutter, y: intro.bottom + 56 },
    { x: leftLane + 80, y: intro.bottom + 70 },
    { x: leftLane, y: intro.bottom + 102 },
  );
  builder.line({ x: lane, y: nodes[0].y - 52 });

  nodes.forEach((node, index) => {
    appendNodePass(builder, node, lane);

    if (index === nodes.length - 1) return;

    const gapY = clamp(
      (copies[index].bottom + copies[index + 1].top) / 2,
      node.y + 70,
      nodes[index + 1].y - 70,
    );
    const nextLane = lane === leftLane ? rightLane : leftLane;

    builder.line({ x: lane, y: gapY - 34 });
    builder.cubic(
      { x: lane, y: gapY },
      { x: nextLane, y: gapY },
      { x: nextLane, y: gapY + 34 },
    );
    builder.line({ x: nextLane, y: nodes[index + 1].y - 52 });
    lane = nextLane;
  });

  builder.line({ x: lane, y: jAbout.y - 170 });
  builder.cubic(
    { x: lane, y: jAbout.y - 96 },
    { x: jAbout.x - 120, y: jAbout.y - 36 },
    jAbout,
  );

  return {
    id: "why-me",
    d: builder.d,
    start: jWhy,
    end: jAbout,
  };
}

function buildMobileWhy(
  jWhy: Point,
  gutter: number,
  intro: Rect,
  nodes: Point[],
  jAbout: Point,
): ThreadRoute {
  const lane = Math.max(42, nodes[0].x + 19);

  const builder = new PathBuilder(jWhy);
  builder.cubic(
    { x: gutter, y: jWhy.y + 50 },
    { x: gutter, y: intro.bottom + 20 },
    { x: gutter, y: intro.bottom + 36 },
  );
  builder.cubic(
    { x: gutter, y: intro.bottom + 66 },
    { x: lane + 80, y: intro.bottom + 76 },
    { x: lane, y: intro.bottom + 108 },
  );
  builder.line({ x: lane, y: nodes[0].y - 30 });

  nodes.forEach((node, index) => {
    appendNodePass(builder, node, lane, 30);
    if (index < nodes.length - 1) {
      builder.line({ x: lane, y: nodes[index + 1].y - 30 });
    }
  });

  builder.line({ x: lane, y: jAbout.y - 180 });
  builder.cubic(
    { x: lane, y: jAbout.y - 110 },
    { x: jAbout.x - 110, y: jAbout.y - 50 },
    jAbout,
  );

  return {
    id: "why-me",
    d: builder.d,
    start: jWhy,
    end: jAbout,
  };
}

function buildDesktopAbout(
  jAbout: Point,
  jContact: Point,
  about: Rect,
  profile: Rect,
  width: number,
): { route: ThreadRoute; terminal: Point } {
  const left = Math.max(profile.right + 50, width * 0.55);
  const right = width - Math.max(60, width * 0.055);
  const top = about.top + 50;
  const bottom = about.bottom - 80;
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  const rx = Math.max(96, ((right - left) / 2) * 0.9);
  const ry = Math.max(120, ((bottom - top) / 2) * 0.86);
  const ridges = clamp(Math.round(rx / 22), 7, 11);
  const fingerprint = buildFingerprint({
    cx,
    cy,
    rx,
    ry,
    ridges,
    rotation: -0.105,
    terminal: {
      x: cx + rx * 0.43,
      y: bottom - 20,
    },
  });
  const start = fingerprint.start;
  const builder = new PathBuilder(jAbout);

  builder.cubic(
    { x: jAbout.x + 44, y: jAbout.y + 34 },
    { x: left + rx * 0.2, y: top + 8 },
    { x: start.x - 36, y: start.y - 30 },
  );
  builder.cubic(
    { x: start.x - 12, y: start.y - 10 },
    { x: start.x, y: start.y - 4 },
    start,
  );
  appendPath(builder, fingerprint.d);
  builder.cubic(
    { x: fingerprint.terminal.x + 44, y: fingerprint.terminal.y + 28 },
    { x: jContact.x + 140, y: about.bottom - 6 },
    jContact,
  );

  return {
    route: {
      id: "about",
      d: builder.d,
      start: jAbout,
      end: jContact,
      clip: "about",
    },
    terminal: fingerprint.terminal,
  };
}

function buildMobileAbout(
  jAbout: Point,
  jContact: Point,
  about: Rect,
  profile: Rect,
  width: number,
): { route: ThreadRoute; terminal: Point } {
  const gutter = width - 8;
  const bandTop = profile.bottom + 12;
  const ridgeLeft = Math.max(46, width * 0.17);
  const ridgeRight = Math.min(width - 58, width * 0.82);
  const ridgeGap = clamp((jContact.y - bandTop - 12) / 5, 10, 16);
  const builder = new PathBuilder(jAbout);

  builder.cubic(
    { x: jAbout.x + 26, y: jAbout.y + 20 },
    { x: gutter, y: jAbout.y + 42 },
    { x: gutter, y: jAbout.y + 78 },
  );
  builder.line({ x: gutter, y: bandTop - 18 });
  builder.cubic(
    { x: gutter, y: bandTop },
    { x: gutter - 14, y: bandTop },
    { x: ridgeRight, y: bandTop },
  );
  builder.cubic(
    { x: (ridgeLeft + ridgeRight) / 2, y: bandTop - 5 },
    { x: ridgeLeft + 24, y: bandTop + 2 },
    { x: ridgeLeft, y: bandTop + 3 },
  );
  builder.cubic(
    { x: ridgeLeft - 11, y: bandTop + 3 },
    { x: ridgeLeft - 11, y: bandTop + ridgeGap - 3 },
    { x: ridgeLeft, y: bandTop + ridgeGap },
  );
  builder.line({ x: ridgeRight, y: bandTop + ridgeGap });
  builder.cubic(
    { x: ridgeRight + 11, y: bandTop + ridgeGap },
    { x: ridgeRight + 11, y: bandTop + ridgeGap * 2 },
    { x: ridgeRight, y: bandTop + ridgeGap * 2 },
  );
  builder.line({ x: ridgeLeft, y: bandTop + ridgeGap * 2 });
  builder.cubic(
    { x: ridgeLeft - 11, y: bandTop + ridgeGap * 2 },
    { x: ridgeLeft - 11, y: bandTop + ridgeGap * 3 },
    { x: ridgeLeft, y: bandTop + ridgeGap * 3 },
  );
  builder.line({ x: ridgeRight - 18, y: bandTop + ridgeGap * 3 });
  builder.cubic(
    { x: ridgeRight - 2, y: bandTop + ridgeGap * 3 + 3 },
    { x: ridgeRight - 12, y: bandTop + ridgeGap * 4 },
    { x: ridgeRight - 46, y: bandTop + ridgeGap * 4 },
  );
  builder.cubic(
    { x: jContact.x + 58, y: bandTop + ridgeGap * 4 + 8 },
    { x: jContact.x + 32, y: jContact.y - 8 },
    jContact,
  );

  return {
    route: {
      id: "about",
      d: builder.d,
      start: jAbout,
      end: jContact,
      clip: "about",
    },
    terminal: { x: jContact.x, y: jContact.y - 9 },
  };
}

function buildDesktopContact(
  jContact: Point,
  contact: Rect,
  statement: Rect,
  links: Rect,
  backToTop: Rect,
  width: number,
): { route: ThreadRoute; terminal: Point } {
  const right = width - 24;
  const left = Math.min(
    right - 160,
    Math.max(statement.right + 24, width * 0.62),
  );
  const top = contact.top + 48;
  const bottom = Math.min(backToTop.top - 120, links.top - 40);
  const rect: Rect = {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
  const entryPoint = { x: left + 10, y: top + 12 };
  const builder = new PathBuilder(jContact);

  builder.cubic(
    { x: jContact.x + 34, y: jContact.y + 18 },
    { x: left - 86, y: contact.top + 22 },
    { x: left - 14, y: top + 4 },
  );
  builder.cubic(
    { x: left, y: top + 7 },
    { x: entryPoint.x, y: entryPoint.y - 5 },
    entryPoint,
  );

  const tangle = buildTangle({
    rect,
    entry: entryPoint,
    entryTangent: { x: 0.75, y: 0.35 },
    loops: [
      { cx: 0.48, cy: 0.15, rx: 0.42, ry: 0.17, rotation: -0.2 },
      { cx: 0.65, cy: 0.3, rx: 0.34, ry: 0.16, rotation: 0.28 },
      { cx: 0.43, cy: 0.46, rx: 0.4, ry: 0.15, rotation: -0.3 },
      { cx: 0.62, cy: 0.62, rx: 0.34, ry: 0.14, rotation: 0.2 },
      { cx: 0.4, cy: 0.77, rx: 0.38, ry: 0.13, rotation: -0.12 },
      { cx: 0.56, cy: 0.9, rx: 0.35, ry: 0.1, rotation: 0.1 },
    ],
  });

  appendPath(builder, tangle.d);

  const terminal = at(backToTop, 0.9, 0.5);
  const exitY = links.top - 24;
  const tailY = links.bottom + 28;

  builder.cubic(
    {
      x: tangle.end.x + tangle.endTangent.x * 42,
      y: tangle.end.y + tangle.endTangent.y * 42,
    },
    { x: right, y: exitY - 36 },
    { x: right, y: exitY },
  );
  builder.line({ x: right, y: tailY });
  builder.cubic(
    { x: right - 90, y: tailY },
    { x: terminal.x + 140, y: terminal.y + 18 },
    terminal,
  );

  return {
    route: {
      id: "contact",
      d: builder.d,
      start: jContact,
      end: terminal,
    },
    terminal,
  };
}

function buildMobileContact(
  jContact: Point,
  contact: Rect,
  statement: Rect,
  links: Rect,
  backToTop: Rect,
  width: number,
): { route: ThreadRoute; terminal: Point } {
  const gutter = width - 12;
  const leftGutter = 8;
  const terminal = at(backToTop, 0.9, 0.5);
  const copyOverflows = links.right > gutter - 4;
  const tailGutter = copyOverflows ? leftGutter : gutter;

  // The statement and link cards fill, and at the narrowest widths overflow,
  // the lower part of this section. The tangle therefore uses the clear band
  // above the statement, and the long run follows the margin that the copy
  // leaves clear.
  const top = contact.top + 14;
  const bottom = Math.min(top + 70, statement.top - 12);
  const left = width * 0.22;
  const right = width - 16;
  const rect: Rect = {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: Math.max(48, bottom - top),
  };
  const entryPoint = {
    x: left + rect.width * 0.55,
    y: contact.top + 6,
  };
  const builder = new PathBuilder(jContact);

  builder.cubic(
    { x: jContact.x + 8, y: jContact.y + 10 },
    { x: entryPoint.x + 12, y: entryPoint.y - 8 },
    entryPoint,
  );

  const tangle = buildTangle({
    rect,
    entry: entryPoint,
    entryTangent: { x: 0.2, y: 1 },
    loops: [
      { cx: 0.52, cy: 0.3, rx: 0.42, ry: 0.28, rotation: 0.26 },
      { cx: 0.38, cy: 0.55, rx: 0.36, ry: 0.26, rotation: -0.2 },
      { cx: 0.62, cy: 0.78, rx: 0.32, ry: 0.22, rotation: 0.16 },
    ],
  });

  appendPath(builder, tangle.d);

  // Join the margin above the statement, then clear the copy and cards before
  // approaching the existing back-to-top link from below.
  const tailStart = tangle.end;
  const tailY = Math.min(backToTop.bottom + 6, contact.bottom - 8);
  appendPath(
    builder,
    `${moveCommand(tailStart)} ${tailCommand(
      tailStart,
      tangle.endTangent,
      [
        { x: tailGutter, y: statement.top - 20 },
        { x: tailGutter, y: statement.top - 10 },
      ],
      60,
      24,
    )}`,
  );
  builder.line({ x: tailGutter, y: tailY });
  const approachX = terminal.x + 18;
  builder.cubic(
    { x: approachX, y: tailY },
    { x: approachX, y: terminal.y + 10 },
    { x: approachX, y: terminal.y },
  );
  builder.line({ x: terminal.x + 10, y: terminal.y });
  builder.cubic(
    { x: terminal.x + 2, y: terminal.y },
    { x: terminal.x, y: terminal.y - 2 },
    terminal,
  );

  return {
    route: {
      id: "contact",
      d: builder.d,
      start: jContact,
      end: terminal,
    },
    terminal,
  };
}

function buildGeometry(root: HTMLElement): ThreadGeometry {
  const rootRect = root.getBoundingClientRect();
  const width = rootRect.width;
  const height = rootRect.height;

  if (width <= 0 || height <= 0) {
    throw new Error("Thread layer requires a visible, non-zero portfolio root.");
  }

  const rect = (name: string) => anchorRect(root, rootRect, name);
  const mobile = width <= 700;
  const gutter = width - 12;

  const hero = rect("hero");
  const practice = rect("practice-drawing");
  const steps = Array.from({ length: 7 }, (_, index) =>
    rect(`practice-step-${index + 1}`),
  );
  const capabilities = rect("capabilities");
  const orbit = rect("capability-orbit");
  const capabilityItems = [
    ...Array.from({ length: 5 }, (_, index) =>
      rect(`capability-product-${index + 1}`),
    ),
    ...Array.from({ length: 5 }, (_, index) =>
      rect(`capability-ai-${index + 1}`),
    ),
  ];
  const kabri = rect("project-kabri");
  const norma = rect("project-norma");
  const mesa = rect("project-mesa");
  const credit = rect("project-creditflow");
  const creditFigures: CreditFigures = {
    pan: rect("credit-pan"),
    gst: rect("credit-gst"),
    bank: rect("credit-bank"),
    itr: rect("credit-itr"),
    outcome: rect("credit-outcome"),
  };
  const creditIntro = selectedRect(
    root,
    rootRect,
    ".creditflow-world .world-description",
    "creditflow description",
  );
  const projectCopyBottoms: [number, number, number, number] = [
    projectCopyBottom(root, rootRect, "kabri"),
    projectCopyBottom(root, rootRect, "norma"),
    projectCopyBottom(root, rootRect, "mesa"),
    projectCopyBottom(root, rootRect, "creditflow"),
  ];
  const whyMe = rect("why-me");
  const whyIntro = rect("why-me-intro");
  const about = rect("about-stage");
  const profile = rect("about-profile");
  const contact = selectedRect(
    root,
    rootRect,
    ".contact-finale",
    "contact section",
  );
  const contactStatement = selectedRect(
    root,
    rootRect,
    ".contact-statement",
    "contact statement",
  );
  const contactStatementElement = root.querySelector<HTMLElement>(
    ".contact-statement",
  );
  if (contactStatementElement) {
    contactStatement.right = Math.max(
      contactStatement.right,
      contactStatement.left + contactStatementElement.scrollWidth,
    );
  }
  const contactLinks = selectedRect(
    root,
    rootRect,
    ".contact-links",
    "contact links",
  );
  const backToTop = rect("contact-back-to-top");

  const heroExit = {
    x: mobile ? gutter : width * 0.734,
    y: hero.bottom,
  };

  const routes: ThreadRoute[] = [];
  const markers: ThreadMarker[] = [];
  const rings: ThreadRing[] = [];
  let previous: ThreadRoute | null = null;
  const add = (route: ThreadRoute) => {
    assertContinuous(previous, route);
    routes.push(route);
    previous = route;
    return route;
  };
  const addBranch = (origin: ThreadRoute, route: ThreadRoute) => {
    assertContinuous(origin, route);
    routes.push(route);
    return route;
  };

  const work = mobile
    ? buildMobileWork(
        heroExit,
        hero.bottom,
        capabilities.top,
        practice,
        steps,
        width,
      )
    : buildDesktopWork(heroExit, hero.bottom, capabilities.top, width);
  add(work);

  if (mobile) {
    const capabilityGeometry = buildMobileCapabilities(
      work.end,
      orbit,
      capabilityItems,
      kabri.top,
      width,
    );
    const [entryRoute, productRoute, aiRoute, exitRoute] =
      capabilityGeometry.routes;
    add(entryRoute);
    addBranch(entryRoute, productRoute);
    addBranch(entryRoute, aiRoute);
    previous = aiRoute;
    add(exitRoute);
    markers.push(...capabilityGeometry.markers);
  } else {
    const capabilityGeometry = buildDesktopCapabilities(
      work.end,
      orbit,
      capabilityItems,
      kabri.top,
      width,
    );
    const [entryRoute, leftArc, rightArc, exitRoute] =
      capabilityGeometry.routes;
    add(entryRoute);
    addBranch(entryRoute, leftArc);
    addBranch(entryRoute, rightArc);
    previous = rightArc;
    add(exitRoute);
    markers.push(...capabilityGeometry.markers);
  }

  const projects = mobile
    ? buildMobileProjects(
        kabri,
        norma,
        mesa,
        credit,
        projectCopyBottoms,
        width,
        routes[routes.length - 1].end,
        gutter,
      )
    : buildDesktopProjects(
        kabri,
        norma,
        mesa,
        credit,
        creditFigures,
        creditIntro,
        width,
        routes[routes.length - 1].end,
      );
  projects.routes.forEach(add);

  const whyNodes = Array.from({ length: 5 }, (_, index) =>
    middle(rect(`why-me-node-${index + 1}`)),
  );
  const whyCopies = Array.from({ length: 5 }, (_, index) =>
    rect(`why-me-copy-${index + 1}`),
  );
  const aboutX = mobile ? width * 0.8125 : width * 0.61;
  const jAbout = { x: aboutX, y: whyMe.bottom };
  const why = mobile
    ? buildMobileWhy(projects.handoff, gutter, whyIntro, whyNodes, jAbout)
    : buildDesktopWhy(
        projects.handoff,
        gutter,
        whyIntro,
        whyNodes,
        whyCopies,
        jAbout,
      );
  add(why);

  const contactX = mobile ? width * 0.635 : width * 0.61;
  const jContact = { x: contactX, y: about.bottom };
  const aboutGeometry = mobile
    ? buildMobileAbout(jAbout, jContact, about, profile, width)
    : buildDesktopAbout(jAbout, jContact, about, profile, width);
  add(aboutGeometry.route);
  rings.push({
    ...aboutGeometry.terminal,
    radius: mobile ? 7 : 9,
    core: mobile ? 2.5 : 3,
  });

  const contactGeometry = mobile
    ? buildMobileContact(
        jContact,
        contact,
        contactStatement,
        contactLinks,
        backToTop,
        width,
      )
    : buildDesktopContact(
        jContact,
        contact,
        contactStatement,
        contactLinks,
        backToTop,
        width,
      );
  add(contactGeometry.route);
  rings.push({
    ...contactGeometry.terminal,
    radius: mobile ? 9 : 11,
    core: mobile ? 3 : 4,
  });

  for (const route of routes) {
    assertInside(route, width, height);
  }

  return {
    width,
    height,
    routes,
    markers,
    rings,
    aboutRect: about,
  };
}

export function ThreadLayer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geometry, setGeometry] = useState<ThreadGeometry | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const root = svg?.parentElement;

    if (!(root instanceof HTMLElement)) {
      throw new Error("Thread layer must be mounted inside the portfolio root.");
    }

    let active = true;
    const updateGeometry = () => {
      if (!active) return;

      const rootRect = root.getBoundingClientRect();
      if (rootRect.width <= 0 || rootRect.height <= 0) return;

      const nextGeometry = buildGeometry(root);
      setGeometry((current) =>
        current &&
        current.width === nextGeometry.width &&
        current.height === nextGeometry.height &&
        current.routes.length === nextGeometry.routes.length &&
        current.routes.every(
          (route, index) => route.d === nextGeometry.routes[index]?.d,
        ) &&
        current.markers.length === nextGeometry.markers.length &&
        current.rings.length === nextGeometry.rings.length
          ? current
          : nextGeometry,
      );
    };
    const resizeObserver = new ResizeObserver(updateGeometry);

    resizeObserver.observe(root);
    root
      .querySelectorAll<HTMLElement>("[data-thread-anchor]")
      .forEach((anchor) => resizeObserver.observe(anchor));

    window.addEventListener("resize", updateGeometry, { passive: true });
    window.addEventListener("load", updateGeometry, { once: true });
    void document.fonts.ready.then(() => {
      if (active) updateGeometry();
    });

    updateGeometry();

    return () => {
      active = false;
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateGeometry);
      window.removeEventListener("load", updateGeometry);
    };
  }, []);

  const viewBox = geometry
    ? `0 0 ${format(geometry.width)} ${format(geometry.height)}`
    : "0 0 1 1";

  return (
    <svg
      ref={svgRef}
      className="thread-layer"
      aria-hidden="true"
      focusable="false"
      viewBox={viewBox}
      width={geometry?.width ?? 1}
      height={geometry?.height ?? 1}
    >
      {geometry ? (
        <>
          <defs>
            {geometry.aboutRect ? (
              <clipPath id="thread-about-clip" clipPathUnits="userSpaceOnUse">
                <rect
                  x="0"
                  y={format(geometry.aboutRect.top)}
                  width={format(geometry.width)}
                  height={format(geometry.aboutRect.height)}
                />
              </clipPath>
            ) : null}
          </defs>
          {geometry.routes.map((route) => (
            <path
              key={route.id}
              className="thread-path"
              d={route.d}
              data-route={route.id}
              clipPath={
                route.clip === "about" ? "url(#thread-about-clip)" : undefined
              }
            />
          ))}
          {geometry.markers.map((marker, index) => (
            <g key={`marker-${marker.kind}-${index}`}>
              <circle
                className={`thread-marker thread-marker-${marker.kind}`}
                cx={marker.x}
                cy={marker.y}
                r={marker.radius}
              />
              {marker.core ? (
                <circle
                  className="thread-marker-core"
                  cx={marker.x}
                  cy={marker.y}
                  r={marker.core}
                />
              ) : null}
            </g>
          ))}
          {geometry.rings.map((ring, index) => (
            <g key={`ring-${index}`}>
              <circle
                className="thread-terminal"
                cx={ring.x}
                cy={ring.y}
                r={ring.radius}
              />
              <circle
                className="thread-terminal-core"
                cx={ring.x}
                cy={ring.y}
                r={ring.core}
              />
            </g>
          ))}
        </>
      ) : null}
    </svg>
  );
}
