"use client";

import { useEffect, useRef, useState } from "react";

type Point = {
  x: number;
  y: number;
};

type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

type ThreadGeometry = {
  width: number;
  height: number;
  path: string;
  problem: Point;
  production: Point;
  nodeRadius: number;
  terminal: Point;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const middle = (rect: Rect): Point => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

const at = (rect: Rect, x: number, y: number): Point => ({
  x: rect.left + rect.width * x,
  y: rect.top + rect.height * y,
});

const format = (value: number) => {
  if (!Number.isFinite(value)) {
    throw new Error(`Thread geometry produced a non-finite coordinate: ${value}`);
  }
  return Number(value.toFixed(2)).toString();
};

function spline(
  points: Point[],
  tension: number,
  width: number,
  height: number,
): string {
  const boundedPoints = points.map((point) => ({
    x: clamp(point.x, 8, width - 8),
    y: clamp(point.y, 0, height - 8),
  }));
  const cleanPoints = boundedPoints.filter(
    (point, index) =>
      index === 0 ||
      Math.hypot(
        point.x - boundedPoints[index - 1].x,
        point.y - boundedPoints[index - 1].y,
      ) > 0.5,
  );

  if (cleanPoints.length < 2) {
    return "";
  }

  let path = `M ${format(cleanPoints[0].x)} ${format(cleanPoints[0].y)}`;

  for (let index = 0; index < cleanPoints.length - 1; index += 1) {
    const previous = cleanPoints[Math.max(0, index - 1)];
    const start = cleanPoints[index];
    const end = cleanPoints[index + 1];
    const next = cleanPoints[Math.min(cleanPoints.length - 1, index + 2)];
    const factor = tension / 6;
    const controlOne = {
      x: clamp(start.x + (end.x - previous.x) * factor, 8, width - 8),
      y: clamp(start.y + (end.y - previous.y) * factor, 0, height - 8),
    };
    const controlTwo = {
      x: clamp(end.x - (next.x - start.x) * factor, 8, width - 8),
      y: clamp(end.y - (next.y - start.y) * factor, 0, height - 8),
    };

    path += ` C ${format(controlOne.x)} ${format(controlOne.y)}, ${format(controlTwo.x)} ${format(controlTwo.y)}, ${format(end.x)} ${format(end.y)}`;
  }

  return path;
}

function anchorRect(
  root: HTMLElement,
  rootRect: DOMRect,
  anchor: string,
): Rect {
  const elements = root.querySelectorAll<HTMLElement>(
    `[data-thread-anchor="${anchor}"]`,
  );

  if (elements.length !== 1) {
    throw new Error(
      `Thread layer requires exactly one "${anchor}" anchor; found ${elements.length}.`,
    );
  }

  const rect = elements[0].getBoundingClientRect();
  return {
    left: rect.left - rootRect.left,
    top: rect.top - rootRect.top,
    right: rect.right - rootRect.left,
    bottom: rect.bottom - rootRect.top,
    width: rect.width,
    height: rect.height,
  };
}

function figureEdge(
  rect: Rect,
  side: "top" | "right" | "bottom" | "left",
  clearance = 4,
): Point {
  switch (side) {
    case "top":
      return { x: middle(rect).x, y: rect.top - clearance };
    case "right":
      return { x: rect.right + clearance, y: middle(rect).y };
    case "bottom":
      return { x: middle(rect).x, y: rect.bottom + clearance };
    case "left":
      return { x: rect.left - clearance, y: middle(rect).y };
  }
}

function buildProjectPoints(
  root: HTMLElement,
  rootRect: DOMRect,
  articleName: string,
  figureNames: string[],
  width: number,
  entry: Point,
  specialHouseEntry = false,
): Point[] {
  const article = anchorRect(root, rootRect, articleName);
  const figures = figureNames
    .map((name) => ({
      name,
      rect: anchorRect(root, rootRect, name),
    }))
    .sort((a, b) => a.rect.top - b.rect.top);
  const points: Point[] = [entry];

  if (specialHouseEntry) {
    const house = figures.find(({ name }) => name === "kabri-flat");
    if (!house) {
      throw new Error('Thread layer requires the "kabri-flat" project anchor.');
    }

    points.push(at(house.rect, 0.5, 0));
    points.push(at(house.rect, 0.94, 0.36));
    for (const { name, rect } of figures) {
      if (name === "kabri-flat") continue;
      points.push(
        figureEdge(
          rect,
          name === "kabri-lease" || name === "kabri-inspection"
            ? "bottom"
            : name === "kabri-repair"
              ? "right"
              : "top",
        ),
      );
    }
  } else {
    const sides = ["top", "right", "bottom", "left"] as const;
    for (const [index, { rect }] of figures.entries()) {
      points.push(figureEdge(rect, sides[index % sides.length]));
    }
  }

  points.push({
    x: clamp(width * (specialHouseEntry ? 0.72 : 0.58), 12, width - 12),
    y: article.bottom,
  });

  return points;
}

function buildGeometry(root: HTMLElement): ThreadGeometry {
  const rootRect = root.getBoundingClientRect();
  const width = rootRect.width;
  // scrollHeight can include the SVG itself and keep its height from shrinking.
  const height = rootRect.height;

  if (width <= 0 || height <= 0) {
    throw new Error("Thread layer requires a visible, non-zero portfolio root.");
  }

  const rect = (name: string) => anchorRect(root, rootRect, name);
  const selectedRect = (selector: string, description: string): Rect => {
    const elements = root.querySelectorAll<HTMLElement>(selector);
    if (elements.length !== 1) {
      throw new Error(
        `Thread layer requires exactly one ${description}; found ${elements.length}.`,
      );
    }

    const elementRect = elements[0].getBoundingClientRect();
    return {
      left: elementRect.left - rootRect.left,
      top: elementRect.top - rootRect.top,
      right: elementRect.right - rootRect.left,
      bottom: elementRect.bottom - rootRect.top,
      width: elementRect.width,
      height: elementRect.height,
    };
  };
  const mobile = width <= 700;
  const pathParts: string[] = [];
  const smooth = (points: Point[]) => spline(points, 1, width, height);

  const hero = rect("hero");
  const heroLines = [rect("hero-line-1"), rect("hero-line-2"), rect("hero-line-3")];
  const heroExit = {
    x: mobile ? width - 7 : width * 0.53,
    y: hero.bottom,
  };

  const practiceDrawing = rect("practice-drawing");
  const processRows = Array.from({ length: 7 }, (_, index) =>
    rect(`practice-step-${index + 1}`),
  );
  const rowCenters = processRows.map(middle);
  const labelBoundary = Math.min(...processRows.map((row) => row.left)) - 9;
  const leftBoundary = practiceDrawing.left + practiceDrawing.width * 0.1;
  const rightBoundary = Math.min(
    practiceDrawing.left + practiceDrawing.width * 0.82,
    labelBoundary,
  );
  const bulbCenterX =
    practiceDrawing.left + practiceDrawing.width * (mobile ? 0.36 : 0.5);
  const bulbRadiusX = Math.max(
    12,
    Math.min(
      practiceDrawing.width * 0.36,
      bulbCenterX - leftBoundary,
      rightBoundary - bulbCenterX,
    ),
  );
  const bulbTop = practiceDrawing.top + practiceDrawing.height * 0.025;
  const bulbHeight = Math.max(
    practiceDrawing.height * 0.2,
    Math.min(
      practiceDrawing.height * 0.38,
      rowCenters[0].y - bulbTop - 8,
    ),
  );
  const bulbBaseY = bulbTop + bulbHeight;
  const bulbTopPoint = { x: bulbCenterX, y: bulbTop };
  const bulbNeckPoint = {
    x: bulbCenterX,
    y: bulbBaseY + practiceDrawing.height * 0.018,
  };
  const bulbOutline = [
    bulbTopPoint,
    { x: bulbCenterX + bulbRadiusX * 0.58, y: bulbTop + bulbHeight * 0.05 },
    { x: bulbCenterX + bulbRadiusX * 0.94, y: bulbTop + bulbHeight * 0.34 },
    { x: bulbCenterX + bulbRadiusX, y: bulbTop + bulbHeight * 0.62 },
    { x: bulbCenterX + bulbRadiusX * 0.77, y: bulbTop + bulbHeight * 0.83 },
    { x: bulbCenterX + bulbRadiusX * 0.3, y: bulbBaseY },
    { x: bulbCenterX + bulbRadiusX * 0.24, y: bulbNeckPoint.y },
    { x: bulbCenterX - bulbRadiusX * 0.24, y: bulbNeckPoint.y },
    { x: bulbCenterX - bulbRadiusX * 0.3, y: bulbBaseY },
    { x: bulbCenterX - bulbRadiusX * 0.77, y: bulbTop + bulbHeight * 0.83 },
    { x: bulbCenterX - bulbRadiusX, y: bulbTop + bulbHeight * 0.62 },
    { x: bulbCenterX - bulbRadiusX * 0.94, y: bulbTop + bulbHeight * 0.34 },
    { x: bulbCenterX - bulbRadiusX * 0.58, y: bulbTop + bulbHeight * 0.05 },
    bulbTopPoint,
  ];
  const filamentPoints = [
    bulbNeckPoint,
    ...rowCenters.map((row, index) => ({
      x: clamp(
        processRows[index].left - (index % 2 === 0 ? 8 : 26),
        leftBoundary + 4,
        rightBoundary - 4,
      ),
      y: row.y,
    })),
    {
      x: bulbCenterX,
      y: Math.min(practiceDrawing.bottom - 8, rowCenters[6].y + 34),
    },
  ];
  const practiceExit = filamentPoints[filamentPoints.length - 1];

  const capabilityHeading = rect("capability-heading");
  const capabilityOrbit = rect("capability-orbit");
  const productHeading = rect("capability-product-heading");
  const aiHeading = rect("capability-ai-heading");
  const disciplineHeadingX = (productHeading.right + aiHeading.left) / 2;
  const disciplineHeadingTop = Math.min(productHeading.top, aiHeading.top);
  const disciplineHeadingBottom = Math.max(
    productHeading.bottom,
    aiHeading.bottom,
  );
  const orbitTop = { x: middle(capabilityOrbit).x, y: capabilityOrbit.top };
  const productItems = Array.from({ length: 5 }, (_, index) =>
    rect(`capability-product-${index + 1}`),
  ).sort((a, b) => a.top - b.top);
  const aiItems = Array.from({ length: 5 }, (_, index) =>
    rect(`capability-ai-${index + 1}`),
  ).sort((a, b) => a.top - b.top);
  const projectEntry = rect("project-kabri");
  const capabilityItems = [...productItems, ...aiItems];
  const sideTop = Math.max(
    capabilityOrbit.top + 12,
    Math.min(...capabilityItems.map((item) => item.top)) - 14,
  );
  const sideBottom = Math.max(
    ...capabilityItems.map((item) => item.bottom + 14),
  );
  const orbitExitY = Math.min(
    Math.max(capabilityOrbit.bottom, sideBottom) + 24,
    projectEntry.top - 12,
  );
  const orbitBottom = { x: orbitTop.x, y: orbitExitY };
  const outerLeft = Math.min(...productItems.map((item) => item.left)) - 14;
  const outerRight = Math.max(...aiItems.map((item) => item.right)) + 14;
  const hasOuterClearance = outerLeft >= 8 && outerRight <= width - 8;
  const leftX = hasOuterClearance
    ? outerLeft
    : clamp(
        Math.max(...productItems.map((item) => item.right)) + 14,
        8,
        orbitTop.x - 12,
      );
  const rightX = hasOuterClearance
    ? outerRight
    : clamp(
        Math.min(...aiItems.map((item) => item.left)) - 14,
        orbitTop.x + 12,
        width - 8,
      );
  const leftArm = [
    orbitTop,
    {
      x: leftX + (orbitTop.x - leftX) * 0.42,
      y: sideTop - 18,
    },
    { x: leftX, y: sideTop },
    { x: leftX, y: sideBottom },
    {
      x: leftX + (orbitTop.x - leftX) * 0.42,
      y: orbitExitY - 18,
    },
    orbitBottom,
  ];
  const rightArm = [
    orbitTop,
    {
      x: rightX + (orbitTop.x - rightX) * 0.42,
      y: sideTop - 18,
    },
    { x: rightX, y: sideTop },
    { x: rightX, y: sideBottom },
    {
      x: rightX + (orbitTop.x - rightX) * 0.42,
      y: orbitExitY - 18,
    },
    orbitBottom,
  ];
  const pageRight = width - 12;

  pathParts.push(
    smooth([
      { x: width * 0.035, y: 0 },
      at(heroLines[0], 0.66, 0.54),
      at(heroLines[1], 0.28, 0.54),
      at(heroLines[2], 0.72, 0.54),
      {
        x: heroExit.x,
        y: Math.max(heroLines[2].bottom + 12, hero.bottom - (mobile ? 8 : 24)),
      },
      heroExit,
    ]),
  );
  pathParts.push(smooth([heroExit, bulbTopPoint]));
  pathParts.push(smooth(bulbOutline));
  pathParts.push(smooth(filamentPoints));
  pathParts.push(
    smooth([
      practiceExit,
      { x: pageRight, y: capabilityHeading.top + 12 },
      { x: pageRight, y: capabilityHeading.bottom + 18 },
    ]),
  );
  pathParts.push(
    smooth([
      { x: pageRight, y: capabilityHeading.bottom + 18 },
      { x: disciplineHeadingX, y: disciplineHeadingTop - 14 },
    ]),
  );
  pathParts.push(
    smooth([
      { x: disciplineHeadingX, y: disciplineHeadingTop - 14 },
      { x: disciplineHeadingX, y: disciplineHeadingBottom + 14 },
      orbitTop,
    ]),
  );
  pathParts.push(smooth(leftArm));
  pathParts.push(smooth(rightArm));

  const kabriPoints = buildProjectPoints(
    root,
    rootRect,
    "project-kabri",
    ["kabri-flat", "kabri-lease", "kabri-inspection", "kabri-repair", "kabri-book"],
    width,
    orbitBottom,
    true,
  );
  const normaRect = rect("project-norma");
  const normaFigures = [
    "norma-ledger-top",
    "norma-ledger-bottom",
    "norma-paper-acme",
    "norma-paper-river",
    "norma-paper-river-cover",
    "norma-paper-front",
    "norma-paper-main",
    "norma-paper-rejected",
  ]
    .map((name) => ({ name, rect: rect(name) }))
    .concat({
      name: "norma-extracted",
      rect: selectedRect('[data-thread-anchor="norma-extracted"]', "Norma's extracted invoice panel"),
    })
    .sort((a, b) => a.rect.top - b.rect.top);
  const normaPoints = [
    kabriPoints[kabriPoints.length - 1],
    ...normaFigures.map(({ rect: figure, name }, index) =>
      figureEdge(
        figure,
        name === "norma-extracted"
          ? "left"
          : (["top", "right", "bottom", "left"] as const)[index % 4],
      ),
    ),
    { x: width * 0.42, y: normaRect.bottom },
  ];

  const mesaRect = rect("project-mesa");
  const mesaFigures = [
    "mesa-plate",
    "mesa-fork",
    "mesa-message",
    "mesa-ticket",
    "mesa-reply",
    "mesa-bag",
  ]
    .map((name) => ({ name, rect: rect(name) }))
    .concat(
      {
        name: "mesa-wallet",
        rect: selectedRect('[data-thread-anchor="mesa-wallet"]', "Mesa's wallet panel"),
      },
      {
        name: "mesa-dashboard",
        rect: selectedRect('[data-thread-anchor="mesa-dashboard"]', "Mesa's dashboard panel"),
      },
    )
    .sort((a, b) => a.rect.top - b.rect.top);
  const mesaPoints = [
    { x: width * 0.42, y: normaRect.bottom },
    ...mesaFigures.map(({ rect: figure }, index) =>
      figureEdge(figure, (["top", "right", "bottom", "left"] as const)[index % 4]),
    ),
    { x: width * 0.66, y: mesaRect.bottom },
  ];

  const creditRect = rect("project-creditflow");
  const creditFigures = [
    "credit-application",
    "credit-pan",
    "credit-gst",
    "credit-assessment",
    "credit-bank",
    "credit-itr",
    "credit-outcome",
  ]
    .map((name) => ({ name, rect: rect(name) }))
    .sort((a, b) => a.rect.top - b.rect.top);
  const creditPoints = [
    { x: width * 0.66, y: mesaRect.bottom },
    ...creditFigures.map(({ rect: figure }, index) =>
      figureEdge(figure, (["top", "right", "bottom", "left"] as const)[index % 4]),
    ),
    { x: width * 0.55, y: creditRect.bottom },
  ];

  pathParts.push(smooth(kabriPoints));
  pathParts.push(smooth(normaPoints));
  pathParts.push(smooth(mesaPoints));
  pathParts.push(smooth(creditPoints));

  const whyMe = rect("why-me");
  const whyNodes = Array.from({ length: 5 }, (_, index) =>
    middle(rect(`why-me-node-${index + 1}`)),
  );
  const whyPointRects = Array.from({ length: 5 }, (_, index) =>
    rect(`why-me-point-${index + 1}`),
  );
  const whyCopyRects = Array.from({ length: 5 }, (_, index) =>
    rect(`why-me-copy-${index + 1}`),
  );
  const whyLane = (index: number) => {
    const node = whyNodes[index];
    const copy = whyCopyRects[index];
    return clamp(
      node.x + (copy.left > node.x ? -18 : 18),
      8,
      width - 8,
    );
  };
  const whyRoute: Point[] = [whyNodes[0]];
  let whyExit = whyNodes[0];
  for (let index = 0; index < whyNodes.length; index += 1) {
    const node = whyNodes[index];
    const point = whyPointRects[index];
    const copy = whyCopyRects[index];
    const laneX = whyLane(index);
    const clearCopyY = Math.min(copy.bottom + 12, point.bottom - 16);
    const clearPointY = point.bottom - 8;

    whyRoute.push(
      { x: laneX, y: node.y + 18 },
      { x: laneX, y: clearCopyY },
      { x: laneX, y: clearPointY },
    );
    whyExit = { x: laneX, y: clearPointY };

    if (index < whyNodes.length - 1) {
      const nextNode = whyNodes[index + 1];
      const nextLaneX = whyLane(index + 1);
      whyRoute.push(
        { x: nextLaneX, y: Math.max(clearPointY + 4, nextNode.y - 18) },
        nextNode,
      );
    }
  }
  const whyTitle = rect("why-me-title");
  const whyIntro = rect("why-me-intro");
  const about = rect("about-stage");
  const aboutProfile = rect("about-profile");
  const nodeRadius = mobile ? 22 : clamp(width * 0.026, 30, 42);
  const problem = mobile
    ? {
        x: aboutProfile.right - nodeRadius - 4,
        y: about.top + Math.max(nodeRadius + 8, (aboutProfile.top - about.top) / 2),
      }
    : {
        x: about.left + about.width * 0.77,
        y: about.top + about.height * 0.28,
      };
  const production = mobile
    ? {
        x: aboutProfile.right - nodeRadius - 4,
        y: about.bottom - nodeRadius - 10,
      }
    : {
        x: about.left + about.width * 0.77,
        y: about.top + about.height * 0.72,
      };
  const aboutRoute = [
    whyExit,
    { x: pageRight, y: whyMe.bottom + 16 },
    { x: pageRight, y: about.top + about.height * (mobile ? 0.2 : 0.18) },
    problem,
    {
      x: problem.x + (mobile ? -12 : nodeRadius * 1.2),
      y: problem.y + (production.y - problem.y) * 0.34,
    },
    {
      x: problem.x + (mobile ? 10 : -nodeRadius * 1.25),
      y: problem.y + (production.y - problem.y) * 0.68,
    },
    production,
  ];

  pathParts.push(
    smooth([
      creditPoints[creditPoints.length - 1],
      { x: pageRight, y: whyTitle.top + 8 },
      { x: pageRight, y: whyIntro.bottom + 16 },
      { x: whyLane(0), y: whyCopyRects[0].top - 10 },
      whyNodes[0],
    ]),
  );
  pathParts.push(smooth(whyRoute));
  pathParts.push(smooth(aboutRoute));

  const contactCta = rect("contact-cta");
  const contactItems = ["contact-email", "contact-linkedin", "contact-phone"].map(
    (name) => rect(name),
  );
  const backToTop = rect("contact-back-to-top");
  const terminal = at(backToTop, 0.9, 0.5);
  const contactPoints: Point[] = [
    production,
    at(contactCta, 1, 0.5),
    ...contactItems.map((item, index) => ({
      x:
        index % 2 === 0
          ? clamp(item.left - 8, 8, width - 8)
          : clamp(item.right + 8, 8, width - 8),
      y: middle(item).y,
    })),
    terminal,
  ];
  pathParts.push(smooth(contactPoints));

  return {
    width,
    height,
    path: pathParts.filter(Boolean).join(" "),
    problem: { x: problem.x, y: problem.y + 0.5 },
    production: { x: production.x, y: production.y + 0.5 },
    nodeRadius,
    terminal,
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

      const nextGeometry = buildGeometry(root);
      setGeometry((current) =>
        current?.path === nextGeometry.path &&
        current.width === nextGeometry.width &&
        current.height === nextGeometry.height
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

  return (
    <svg
      ref={svgRef}
      className="thread-layer"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
      viewBox={
        geometry
          ? `0 0 ${format(geometry.width)} ${format(geometry.height)}`
          : "0 0 1 1"
      }
      width={geometry?.width ?? 1}
      height={geometry?.height ?? 1}
    >
      {geometry ? (
        <>
          <path className="thread-path" d={geometry.path} />
          <circle
            className="thread-about-node"
            cx={geometry.problem.x}
            cy={geometry.problem.y}
            r={geometry.nodeRadius}
          />
          <text
            className="thread-about-label"
            x={geometry.problem.x}
            y={geometry.problem.y}
          >
            PROBLEM
          </text>
          <circle
            className="thread-about-node"
            cx={geometry.production.x}
            cy={geometry.production.y}
            r={geometry.nodeRadius}
          />
          <text
            className="thread-about-label"
            x={geometry.production.x}
            y={geometry.production.y}
          >
            PRODUCTION
          </text>
          <circle
            className="thread-terminal"
            cx={geometry.terminal.x}
            cy={geometry.terminal.y}
            r="11"
          />
          <circle
            className="thread-terminal-core"
            cx={geometry.terminal.x}
            cy={geometry.terminal.y}
            r="4"
          />
        </>
      ) : null}
    </svg>
  );
}
