import {
  CAPABILITIES_ENTRY,
  CAPABILITIES_EXIT,
  CAPABILITIES_GREEN_DEV,
  CAPABILITIES_MIG_DEV,
  CASE_STUDY_KABRI,
  CASE_STUDY_LEGA_LEXY,
  CASE_STUDY_NORMA,
  CASE_STUDY_SHOP_OPS,
  CONCLUSION_FINGERPRINT,
  CONTACT_ROUTE,
  WORK_INDEX,
} from "./route-data";
import { ANCHOR_LABELS } from "./thread-anchors";
import { getRect, type MeasuredLayout } from "./thread-measure";
import {
  MOBILE_CASE_STUDY_ROUTE,
  blendKabriSuffix,
  blendRouteEnd,
  joinRouteStart,
  phoneTweak,
  squashTemplate,
} from "./thread-mobile";
import {
  PathBuilder,
  alignStartTangent,
  appendRoundedCorners,
  assertDistance,
  assertPathSmooth,
  assertTangentContinuous,
  assertVerticalEnd,
  clamp,
  closestPointOnPolyline,
  cubicCommand,
  cumulativeLengths,
  distance,
  flattenPath,
  format,
  lineCommand,
  middle,
  moveCommand,
  parsePath,
  pathEnd,
  pathStart,
  pointAtLength,
  retargetEnd,
  retargetStart,
  serializePath,
  smoothPathJoins,
  splitCubic,
  transformPath,
  type Cubic,
  type Point,
  type Rect,
} from "./thread-path";
import { buildPhoneCasePath, phoneEntryX, smoothPath } from "./thread-phone";

const MOBILE_SPLIT_ROOM = 52;
const REFERENCE_WIDTH = 1425;
const REFERENCE_PROJECT_HEIGHT = 1024.703125;

const REF_WORK = {
  start: { x: 1035.2718505859375, y: 879.9199829101562 },
  end: { x: 992.071875, y: 1800 },
  drawing: { left: 809.9, top: 966, width: 480, height: 768 },
  drawingBottom: 1734,
  bulb: { left: 866.8, top: 1019.76, right: 1203.75, bottom: 1344.62 },
  waves: [
    { top: 1436.78, bottom: 1513.58 },
    { top: 1513.58, bottom: 1621.1 },
    { top: 1621.1, bottom: 1734 },
  ],
} as const;

type Template = {
  top: number;
  height: number;
  d: string;
};

const PROJECT_TEMPLATES: Record<
  "kabri" | "norma" | "shop-ops" | "lega-lexy",
  Template
> = {
  kabri: {
    top: 3243.96875,
    height: REFERENCE_PROJECT_HEIGHT,
    d: CASE_STUDY_KABRI,
  },
  norma: {
    top: 6318.078125,
    height: REFERENCE_PROJECT_HEIGHT,
    d: CASE_STUDY_NORMA,
  },
  "shop-ops": {
    top: 5293.375,
    height: REFERENCE_PROJECT_HEIGHT,
    d: CASE_STUDY_SHOP_OPS,
  },
  "lega-lexy": {
    top: 8367.484375,
    height: REFERENCE_PROJECT_HEIGHT,
    d: CASE_STUDY_LEGA_LEXY,
  },
};

const KABRI_COMMANDS = parsePath(CASE_STUDY_KABRI);
const KABRI_EAST = { x: 669.5201612903226, y: 3520.1225126008067 };
const KABRI_EAST_INDEX = KABRI_COMMANDS.findIndex(({ command, values }) => {
  if (command !== "C") return false;
  return (
    Math.abs(values[4] - KABRI_EAST.x) < 0.05 &&
    Math.abs(values[5] - KABRI_EAST.y) < 0.05
  );
});

if (process.env.NODE_ENV !== "production" && KABRI_EAST_INDEX < 0) {
  throw new Error("Thread: could not find the KABRI east-door cubic.");
}

export type RouteModel = {
  key: string;
  d: string;
  start: Point;
  end: Point;
  points: Point[];
};

export type AboutModel = RouteModel & {
  rect: Rect;
};

export type MarkerModel = {
  id: string;
  kind: "service" | "door";
  point: Point;
  radius: number;
  core: number;
};

export type ThreadModel = {
  width: number;
  height: number;
  heroHeight: number;
  pagePad: number;
  work: RouteModel;
  capsEntry: RouteModel;
  capsProduct: RouteModel;
  capsAi: RouteModel;
  capsExit: RouteModel;
  projects: {
    kabri: RouteModel;
    norma: RouteModel;
    shopops: RouteModel;
    legalexy: RouteModel;
  };
  why: RouteModel;
  conclusion: AboutModel;
  pagePath: string;
  markers: MarkerModel[];
  /**
   * Last point of the thread. With no footer route, this is exactly the end
   * of the conclusion fingerprint — the last stroke of the thread.
   */
  terminal: Point;
  derived: Map<string, Point>;
  keys: Record<string, string>;
};

const pointKey = (value: Point) =>
  `${Math.round(value.x * 4) / 4},${Math.round(value.y * 4) / 4}`;

const rectKey = (rect: Rect) =>
  `${Math.round(rect.left * 4) / 4},${Math.round(rect.top * 4) / 4},${
    Math.round(rect.width * 4) / 4
  },${Math.round(rect.height * 4) / 4}`;

const centerOf = (rect: Rect): Point => middle(rect);

const routeFromPath = (key: string, d: string, stepPx: number): RouteModel => ({
  key,
  d,
  start: pathStart(d),
  end: pathEnd(d),
  points: flattenPath(d, stepPx),
});

const reuseRoute = (
  previous: RouteModel | undefined,
  key: string,
): RouteModel | undefined =>
  previous && previous.key === key ? previous : undefined;

/**
 * Where the whole thread begins: the empty `start` span that sits absolutely
 * at the top of the hero, 25% in from the right edge. An empty absolute span
 * reports a zero-width rect at exactly that anchor, so we just take its left
 * edge and top. A sensible fallback (75% across the hero top) is used if the
 * anchor is somehow unmeasurable.
 */
function resolveStartPoint(layout: MeasuredLayout): Point {
  const anchor = layout.anchors.get("start");
  if (anchor && anchor.rect.height > 0) {
    return { x: anchor.rect.left, y: anchor.rect.top + anchor.rect.height / 2 };
  }
  if (anchor) {
    return { x: anchor.rect.left, y: anchor.rect.top };
  }
  return { x: layout.width * 0.75, y: layout.hero.top };
}

function cubicYRange(cubic: Cubic) {
  return {
    min: Math.min(cubic[0].y, cubic[1].y, cubic[2].y, cubic[3].y),
    max: Math.max(cubic[0].y, cubic[1].y, cubic[2].y, cubic[3].y),
  };
}

function cubicYAt(cubic: Cubic, t: number) {
  const mt = 1 - t;
  return (
    mt * mt * mt * cubic[0].y +
    3 * mt * mt * t * cubic[1].y +
    3 * mt * t * t * cubic[2].y +
    t * t * t * cubic[3].y
  );
}

function findCubicRootAtY(cubic: Cubic, y: number): number | null {
  let previousT = 0;
  let previousValue = cubicYAt(cubic, 0) - y;

  if (Math.abs(previousValue) < 1e-6) return 0;

  for (let index = 1; index <= 32; index += 1) {
    const t = index / 32;
    const value = cubicYAt(cubic, t) - y;
    if (previousValue * value <= 0) {
      let low = previousT;
      let high = t;
      for (let iteration = 0; iteration < 28; iteration += 1) {
        const mid = (low + high) / 2;
        if ((cubicYAt(cubic, mid) - y) * previousValue <= 0) {
          high = mid;
        } else {
          low = mid;
        }
      }
      return (low + high) / 2;
    }
    previousT = t;
    previousValue = value;
  }

  return null;
}

function splitCubicAtZones(
  cubic: Cubic,
  boundaries: readonly number[],
  depth = 0,
): Cubic[] {
  if (depth > 6) return [cubic];
  const range = cubicYRange(cubic);
  const boundary = boundaries.find(
    (value) => range.min < value - 1e-5 && range.max > value + 1e-5,
  );
  if (boundary === undefined) return [cubic];

  const t = findCubicRootAtY(cubic, boundary);
  if (t === null || t <= 1e-5 || t >= 1 - 1e-5) return [cubic];

  const [first, second] = splitCubic(cubic, t);
  return [
    ...splitCubicAtZones(first, boundaries, depth + 1),
    ...splitCubicAtZones(second, boundaries, depth + 1),
  ];
}

function buildWork(
  layout: MeasuredLayout,
  start: Point,
  capsTop: number,
  previous: RouteModel | undefined,
): RouteModel {
  const drawing = getRect(layout, "work.flow.drawing");
  const heading = getRect(layout, "work.flow.heading");
  // Single-column layout: the title sits ABOVE the drawing, so the straight
  // hero -> drawing diagonal would slice through it.
  const stacked =
    phoneTweak(layout.width, "work") && heading.bottom <= drawing.top + 8;
  const workExitX =
    drawing.left +
    ((REF_WORK.end.x - REF_WORK.drawing.left) / REF_WORK.drawing.width) *
      drawing.width;
  // Phones (as on production): the thread rides the right margin past the
  // title, and leaves the drawing the same way, hugging the right margin down
  // past the paragraph into the next section.
  const phoneRailX = layout.width - clamp(layout.pagePad * 0.45, 6, 14);
  const end = { x: stacked ? phoneRailX : workExitX, y: capsTop };
  const tailStart = REF_WORK.drawingBottom - 0.5;
  const key = [
    pointKey(start),
    pointKey(end),
    rectKey(drawing),
    rectKey(heading),
    layout.width,
  ].join("|");

  const cached = reuseRoute(previous, key);
  if (cached) return cached;

  const warp = (value: Point): Point => {
    const refY = value.y;
    const drawingX =
      drawing.left +
      ((value.x - REF_WORK.drawing.left) / REF_WORK.drawing.width) *
        drawing.width;

    if (refY < REF_WORK.drawing.top) {
      const t = clamp(
        (refY - REF_WORK.start.y) / (REF_WORK.drawing.top - REF_WORK.start.y),
        0,
        1,
      );
      return {
        x: start.x + (drawingX - start.x) * t,
        y: start.y + (drawing.top - start.y) * t,
      };
    }

    if (refY <= REF_WORK.drawingBottom) {
      return {
        x: drawingX,
        y:
          drawing.top +
          ((refY - REF_WORK.drawing.top) / REF_WORK.drawing.height) *
            drawing.height,
      };
    }

    const t = clamp(
      (refY - REF_WORK.drawingBottom) /
        (REF_WORK.end.y - REF_WORK.drawingBottom),
      0,
      1,
    );
    return {
      x: drawingX + (end.x - drawingX) * t,
      y: drawing.bottom + (end.y - drawing.bottom) * t,
    };
  };

  const builder = new PathBuilder(warp(REF_WORK.start));

  if (stacked) {
    // Ride the right margin past the title, then ease into the drawing.
    const railX = layout.width - clamp(layout.pagePad * 0.45, 6, 14);
    const entry = {
      x:
        drawing.left +
        ((REF_WORK.start.x - REF_WORK.drawing.left) / REF_WORK.drawing.width) *
          drawing.width,
      y: drawing.top,
    };
    const approachY = Math.max(
      start.y + 12,
      Math.min(start.y + 90, heading.top - 8),
    );

    if (Math.abs(start.x - railX) > 1) {
      const dy = approachY - start.y;
      builder.cubic(
        { x: start.x, y: start.y + 0.55 * dy },
        { x: railX, y: approachY - 0.55 * dy },
        { x: railX, y: approachY },
      );
    } else {
      builder.line({ x: railX, y: approachY });
    }

    // Start turning as soon as we are clear of the last line of the title, so
    // the sweep to the drawing has the whole gap to be smooth in.
    const bendY = Math.min(
      entry.y - 16,
      heading.bottom + clamp(0.1 * (entry.y - heading.bottom), 6, 12),
    );
    builder.line({ x: railX, y: bendY });
    const bendDy = entry.y - bendY;
    builder.cubic(
      { x: railX, y: bendY + 0.55 * bendDy },
      { x: entry.x, y: entry.y - 0.55 * bendDy },
      entry,
    );
  }

  const boundaries = [REF_WORK.drawing.top, REF_WORK.drawingBottom];
  let rawCurrent: Point = { ...REF_WORK.start };
  // Direction the path is travelling at its current point (for the phone tail).
  let lastControl: Point | null = null;

  for (const command of parsePath(WORK_INDEX)) {
    if (command.command === "M") {
      rawCurrent = { x: command.values[0], y: command.values[1] };
      continue;
    }

    // Phones: the reference tail (below the drawing) swings back to the
    // desktop exit column, straight through the paragraph. It is replaced
    // below by a tail that stays on the right margin.
    const inTail = stacked && rawCurrent.y >= tailStart;

    if (command.command === "L") {
      const next = { x: command.values[0], y: command.values[1] };
      if (!inTail) {
        lastControl = builder.current;
        builder.line(warp(next));
      }
      rawCurrent = next;
      continue;
    }

    if (command.command === "C") {
      const end = { x: command.values[4], y: command.values[5] };
      const full: Cubic = [
        rawCurrent,
        { x: command.values[0], y: command.values[1] },
        { x: command.values[2], y: command.values[3] },
        end,
      ];
      for (const part of splitCubicAtZones(full, boundaries)) {
        if (stacked && part[3].y <= REF_WORK.drawing.top + 0.5) continue;
        if (stacked && part[0].y >= tailStart) continue;
        const c2 = warp(part[2]);
        lastControl = c2;
        builder.cubic(warp(part[1]), c2, warp(part[3]));
      }
      rawCurrent = end;
      continue;
    }

    if (command.command === "Q") {
      const end = { x: command.values[2], y: command.values[3] };
      if (!inTail) {
        const control = warp({ x: command.values[0], y: command.values[1] });
        lastControl = control;
        builder.quad(control, warp(end));
      }
      rawCurrent = end;
      continue;
    }

    const end = { x: command.values[5], y: command.values[6] };
    if (!inTail) {
      lastControl = null;
      builder.arc(
        command.values[0],
        command.values[1],
        command.values[2],
        command.values[3] ? 1 : 0,
        command.values[4] ? 1 : 0,
        warp(end),
      );
    }
    rawCurrent = end;
  }

  if (stacked) {
    // Leave the drawing the way production does: carry on in the direction
    // we were going, then settle onto the right margin and run down past the
    // paragraph into the next section.
    const from = builder.current;
    const dy = end.y - from.y;
    if (dy > 8) {
      let tx = 0;
      let ty = 1;
      if (lastControl) {
        const vx = from.x - lastControl.x;
        const vy = from.y - lastControl.y;
        const len = Math.hypot(vx, vy);
        if (len > 0.001 && vy > 0) {
          tx = vx / len;
          ty = vy / len;
        }
      }
      const reach = clamp(0.4 * dy, 16, 110);
      // The route must finish with a short vertical run: the capabilities
      // entry continues straight down from here (see assertVerticalEnd).
      // On phones the thread has to be on the right margin before it gets
      // level with the closing paragraph, as on production, so it never
      // crosses the text.
      const paragraph = layout.anchors.get("work.flow.description")?.rect;
      let settleY = end.y - clamp(0.2 * dy, 4, 28);
      if (paragraph && paragraph.top - 12 > from.y + 40) {
        settleY = Math.min(settleY, paragraph.top - 12);
      }
      const settle = { x: end.x, y: settleY };
      builder.cubic(
        { x: from.x + tx * reach, y: from.y + ty * reach },
        { x: settle.x, y: settle.y - 0.45 * (settle.y - from.y) },
        settle,
      );
      builder.line(end);
    } else {
      builder.line(end);
    }
  }

  let d = retargetStart(builder.d, start);
  d = retargetEnd(d, end);
  d = alignStartTangent(d, { x: 0, y: 1 });
  d = smoothPathJoins(d);

  return routeFromPath(key, d, 8);
}

function buildCapabilities(
  layout: MeasuredLayout,
  work: RouteModel,
  previous: {
    entry?: RouteModel;
    product?: RouteModel;
    ai?: RouteModel;
    exit?: RouteModel;
  },
  exitTargetX?: number,
) {
  const heading = getRect(layout, "capabilities.heading");
  const orbit = getRect(layout, "capabilities.orbit");
  const capsStart = work.end;
  const rightRailX = Math.min(
    layout.width - 8,
    Math.max(layout.width - 25, heading.right + 12),
  );
  const leftRailX = Math.max(24, heading.left + 32);
  const lowerRailY = Math.max(heading.bottom + 24, orbit.top - 164);

  let splitX = orbit.left + orbit.width / 2;
  // The capability dots are placed in % of the orbit box, on the ellipse that
  // fills that box exactly. The ring must be that same ellipse, otherwise the
  // dots drift off the thread.
  let ringTop = orbit.top;
  let ringBottom = orbit.bottom;
  let ringRx = orbit.width / 2;
  let ringRy = (ringBottom - ringTop) / 2;
  let mobileColumns: { xL: number; xR: number; capRadius: number } | undefined;

  // On phones, size the two capability rails from the actual measured dots,
  // not the much larger decorative orbit rectangle. This avoids the oversized
  // empty capsule visible in the local mobile screenshot.
  if (phoneTweak(layout.width, "capabilities")) {
    const dots = (side: "product" | "ai") =>
      [1, 2, 3, 4, 5].map((index) =>
        centerOf(getRect(layout, `capabilities.${side}.${index}`)),
      );
    const productDots = dots("product");
    const aiDots = dots("ai");
    const xL =
      productDots.reduce((sum, point) => sum + point.x, 0) / productDots.length;
    const xR = aiDots.reduce((sum, point) => sum + point.x, 0) / aiDots.length;
    const ys = [...productDots, ...aiDots].map((point) => point.y);
    const capRadius = clamp(layout.width * 0.035, 8, 14);

    splitX = (xL + xR) / 2;
    // Room above the first and below the last dot for the Y split / merge.
    ringTop = Math.min(...ys) - MOBILE_SPLIT_ROOM;
    ringBottom = Math.max(...ys) + MOBILE_SPLIT_ROOM;
    ringRx = Math.max(Math.abs(splitX - xL), Math.abs(xR - splitX));
    ringRy = (ringBottom - ringTop) / 2;
    mobileColumns = { xL, xR, capRadius };
  }

  const verticalRoom = lowerRailY - capsStart.y;
  const horizontalRoom = rightRailX - leftRailX;
  const ringRoom = ringTop - lowerRailY;
  let cornerR = clamp(
    Math.min(
      0.02 * layout.width,
      0.09 * verticalRoom,
      0.12 * horizontalRoom,
      ringRoom / 3.2,
    ),
    6,
    28,
  );

  const guardCorner = Math.min(
    (verticalRoom - 2) / 4,
    (rightRailX - capsStart.x - 8) / 2,
    (rightRailX - leftRailX - 8) / 2,
    (splitX - leftRailX - 8) / 2,
    (ringRoom - 8) / 3,
    Math.max(0, (heading.top - capsStart.y - 8) / 2),
  );
  if (guardCorner > 0) {
    cornerR = Math.min(cornerR, guardCorner);
  }
  cornerR = Math.max(3, cornerR);

  const mobileDotKey = phoneTweak(layout.width, "capabilities")
    ? ["product", "ai"]
        .flatMap((side) =>
          [1, 2, 3, 4, 5].map((index) =>
            rectKey(getRect(layout, `capabilities.${side}.${index}`)),
          ),
        )
        .join("|")
    : "desktop";

  const key = [
    pointKey(capsStart),
    rectKey(heading),
    rectKey(orbit),
    mobileDotKey,
    layout.width,
    layout.capabilities.bottom,
  ].join("|");

  const entryKey = `${key}|entry`;
  const productKey = `${key}|product`;
  const aiKey = `${key}|ai`;
  const exitKey = `${key}|exit|${exitTargetX === undefined ? "-" : Math.round(exitTargetX * 10)}`;

  const cachedEntry = reuseRoute(previous.entry, entryKey);
  const cachedProduct = reuseRoute(previous.product, productKey);
  const cachedAi = reuseRoute(previous.ai, aiKey);
  const cachedExit = reuseRoute(previous.exit, exitKey);

  if (cachedEntry && cachedProduct && cachedAi && cachedExit) {
    return {
      entry: cachedEntry,
      product: cachedProduct,
      ai: cachedAi,
      exit: cachedExit,
      splitX,
      ringTop,
      ringBottom,
      ringRx,
      ringRy,
    };
  }

  const entryBuilder = new PathBuilder(capsStart);
  let phoneEntryD: string | undefined;
  if (mobileColumns) {
    // Phones: no rounded-rectangle serpentine. One easy S down the right
    // margin, past the headline, then in to the centre of the two rails.
    const railX = layout.width - clamp(layout.pagePad * 0.45, 6, 14);
    const slideY =
      capsStart.y + clamp(0.35 * (heading.top - capsStart.y), 24, 90);
    const dy1 = slideY - capsStart.y;
    if (Math.abs(railX - capsStart.x) > 1) {
      entryBuilder.cubic(
        { x: capsStart.x, y: capsStart.y + 0.55 * dy1 },
        { x: railX, y: slideY - 0.55 * dy1 },
        { x: railX, y: slideY },
      );
    } else {
      entryBuilder.line({ x: railX, y: slideY });
    }
    const downY = Math.max(slideY, heading.bottom + 16);
    const dy2 = ringTop - downY;
    // Production: down the right margin, a sweep to the left under the
    // headline, a small hook just before the split, then straight down into it.
    const uY = heading.bottom + clamp(0.4 * (ringTop - heading.bottom), 40, 70);
    const w = layout.width;
    if (uY + 30 < ringTop && uY - 38 > slideY + 4) {
      phoneEntryD = smoothPath([
        { x: capsStart.x, y: capsStart.y },
        { x: railX, y: slideY },
        { x: railX, y: uY - 40 },
        { x: railX - 0.07 * w, y: uY - 6 },
        { x: 0.68 * w, y: uY },
        { x: 0.6 * w, y: uY - 9 },
        { x: splitX + 0.075 * w, y: uY - 21 },
        { x: splitX + 0.034 * w, y: uY - 28 },
        { x: splitX + 0.006 * w, y: uY - 20 },
        { x: splitX, y: uY - 4 },
        { x: splitX, y: ringTop },
      ]);
    } else {
      if (downY > slideY + 0.5) entryBuilder.line({ x: railX, y: downY });
      if (dy2 > 1) {
        entryBuilder.cubic(
          { x: railX, y: downY + 0.55 * dy2 },
          { x: splitX, y: ringTop - 0.55 * dy2 },
          { x: splitX, y: ringTop },
        );
      }
    }
  } else
    entryBuilder
      .line({ x: capsStart.x, y: capsStart.y + cornerR })
      .arc(cornerR, cornerR, 0, 0, 0, {
        x: capsStart.x + cornerR,
        y: capsStart.y + 2 * cornerR,
      })
      .line({ x: rightRailX - cornerR, y: capsStart.y + 2 * cornerR })
      .arc(cornerR, cornerR, 0, 0, 1, {
        x: rightRailX,
        y: capsStart.y + 3 * cornerR,
      })
      .line({ x: rightRailX, y: lowerRailY - cornerR })
      .arc(cornerR, cornerR, 0, 0, 1, {
        x: rightRailX - cornerR,
        y: lowerRailY,
      })
      .line({ x: leftRailX + cornerR, y: lowerRailY })
      .arc(cornerR, cornerR, 0, 0, 0, {
        x: leftRailX + cornerR,
        y: lowerRailY + 2 * cornerR,
      })
      .line({ x: splitX - cornerR, y: lowerRailY + 2 * cornerR })
      .arc(cornerR, cornerR, 0, 0, 1, {
        x: splitX,
        y: lowerRailY + 3 * cornerR,
      })
      .line({ x: splitX, y: ringTop });

  let productD = `${moveCommand({ x: splitX, y: ringTop })} A ${ringRx} ${ringRy} 0 0 0 ${splitX} ${ringBottom}`;
  let aiD = `${moveCommand({ x: splitX, y: ringTop })} A ${ringRx} ${ringRy} 0 0 1 ${splitX} ${ringBottom}`;

  if (mobileColumns) {
    const { xL, xR } = mobileColumns;
    const dL = splitX - xL;
    const dR = xR - splitX;
    const top = format(ringTop);
    const bottom = format(ringBottom);

    if (dL > 4 && dR > 4) {
      // Smooth Y split at the top, straight rails through the dots, smooth
      // merge at the bottom. Every join has a vertical tangent.
      const k = MOBILE_SPLIT_ROOM - 4;
      const branch = (x: number) => {
        const yTop = ringTop + k;
        const yBottom = ringBottom - k;
        return (
          `M ${format(splitX)} ${top} ` +
          `C ${format(splitX)} ${format(ringTop + 0.55 * k)}, ${format(x)} ${format(yTop - 0.55 * k)}, ${format(x)} ${format(yTop)} ` +
          `L ${format(x)} ${format(yBottom)} ` +
          `C ${format(x)} ${format(yBottom + 0.55 * k)}, ${format(splitX)} ${format(ringBottom - 0.55 * k)}, ${format(splitX)} ${bottom}`
        );
      };
      productD = branch(xL);
      aiD = branch(xR);
    } else {
      // Degenerate single-column layouts still share exact branch endpoints.
      productD = `${moveCommand({ x: splitX, y: ringTop })} ${lineCommand({
        x: xL,
        y: ringBottom,
      })} ${lineCommand({ x: splitX, y: ringBottom })}`;
      aiD = `${moveCommand({ x: splitX, y: ringTop })} ${lineCommand({
        x: xR,
        y: ringBottom,
      })} ${lineCommand({ x: splitX, y: ringBottom })}`;
    }
  }

  let exitD = `${moveCommand({ x: splitX, y: ringBottom })} ${lineCommand({
    x: splitX,
    y: layout.capabilities.bottom,
  })}`;
  if (
    exitTargetX !== undefined &&
    Math.abs(exitTargetX - splitX) > 4 &&
    layout.capabilities.bottom - ringBottom > 60
  ) {
    // Phones: the first case study is entered on the right, so the thread
    // leaves the merge, runs straight for a moment and then sweeps across to
    // that entry in one long S, arriving vertical (as on production).
    const bottomY = layout.capabilities.bottom;
    const room = bottomY - ringBottom;
    const sY = ringBottom + room * 0.3;
    const k = (bottomY - sY) * 0.55;
    exitD =
      `${moveCommand({ x: splitX, y: ringBottom })} ${lineCommand({ x: splitX, y: sY })} ` +
      `C ${format(splitX)} ${format(sY + k)}, ${format(exitTargetX)} ${format(bottomY - k)}, ${format(exitTargetX)} ${format(bottomY)}`;
  }

  return {
    entry: routeFromPath(entryKey, phoneEntryD ?? entryBuilder.d, 8),
    product: routeFromPath(productKey, productD, 8),
    ai: routeFromPath(aiKey, aiD, 8),
    exit: routeFromPath(exitKey, exitD, 8),
    splitX,
    ringTop,
    ringBottom,
    ringRx,
    ringRy,
  };
}

/**
 * Maps the reference template Y coordinates to the live DOM Y coordinates.
 * Instead of blindly stretching the whole path, it anchors the middle of the
 * path to the middle of the actual rendered artwork bands.
 */
function dynamicReframe(
  template: Template,
  frame: Rect,
  layout: MeasuredLayout,
  id: string,
): string {
  const xScale = frame.width / REFERENCE_WIDTH;

  // Try to find the actual artwork bands to anchor the Y axis
  const ids = NARROW_BAND_IDS[id] || [];
  const bands = artworkBands(layout, ids, frame.top - 100, frame.bottom + 100);

  // Define reference points
  const refTop = template.top;
  const refBottom = template.top + template.height;
  const refMid = refTop + template.height / 2;

  // Define live points
  const liveTop = frame.top;
  const liveBottom = frame.bottom;
  const liveMid =
    bands.length > 0
      ? (bands[0].top + bands[bands.length - 1].bottom) / 2
      : (frame.top + frame.bottom) / 2;

  return transformPath(template.d, (value) => {
    const x = frame.left + value.x * xScale;

    // Piecewise linear interpolation to anchor to the live bands
    let y = value.y;
    if (value.y < refMid) {
      const p = (value.y - refTop) / Math.max(1, refMid - refTop);
      y = liveTop + p * (liveMid - liveTop);
    } else {
      const p = (value.y - refMid) / Math.max(1, refBottom - refMid);
      y = liveMid + p * (liveBottom - liveMid);
    }

    return { x, y };
  });
}

function distanceToRect(value: Point, rect: Rect) {
  const dx = Math.max(rect.left - value.x, 0, value.x - rect.right);
  const dy = Math.max(rect.top - value.y, 0, value.y - rect.bottom);
  return Math.hypot(dx, dy);
}

function assertNodesOnPath(d: string, targets: Point[], tolerance = 0.75) {
  if (process.env.NODE_ENV === "production") return;

  const points = flattenPath(d, 2);
  const cumulative = cumulativeLengths(points);

  for (const target of targets) {
    const closest = closestPointOnPolyline(points, cumulative, target);
    if (closest.distance > tolerance) {
      throw new Error(
        `Thread node is off the path: ${closest.distance.toFixed(2)}px`,
      );
    }
  }
}

function assertPathMissesRects(d: string, rects: Rect[], tolerance = 0) {
  if (process.env.NODE_ENV === "production") return;

  const points = flattenPath(d, 2);

  for (const rect of rects) {
    for (const value of points) {
      if (distanceToRect(value, rect) <= tolerance) {
        throw new Error(
          `Thread route intersects a layout box at ${value.x.toFixed(
            2,
          )}, ${value.y.toFixed(2)}`,
        );
      }
    }
  }
}

function routeMissesRect(points: Point[], rect: Rect, tolerance: number) {
  let nearest = Infinity;
  for (const value of points) {
    nearest = Math.min(nearest, distanceToRect(value, rect));
    if (nearest <= tolerance) return false;
  }
  return true;
}

function insertMessagePass(d: string, message: Rect): string {
  const commands = parsePath(d);
  if (commands.length < 2 || commands[0].command !== "M") return d;
  const firstCubicCommand = commands[1];
  if (!firstCubicCommand || firstCubicCommand.command !== "C") return d;

  const start = { x: commands[0].values[0], y: commands[0].values[1] };
  const cubic: Cubic = [
    start,
    { x: firstCubicCommand.values[0], y: firstCubicCommand.values[1] },
    { x: firstCubicCommand.values[2], y: firstCubicCommand.values[3] },
    { x: firstCubicCommand.values[4], y: firstCubicCommand.values[5] },
  ];
  const [first] = splitCubic(cubic, 0.65);
  const splitPoint = first[3];
  const messageCenter = centerOf(message);
  const link = (from: Point, to: Point): string =>
    cubicCommand(
      {
        x: from.x + (to.x - from.x) * 0.34,
        y: from.y + (to.y - from.y) * 0.34,
      },
      {
        x: from.x + (to.x - from.x) * 0.67,
        y: from.y + (to.y - from.y) * 0.67,
      },
      to,
    );

  const inserted = [
    { command: "M" as const, values: [start.x, start.y] },
    {
      command: "C" as const,
      values: [
        first[1].x,
        first[1].y,
        first[2].x,
        first[2].y,
        splitPoint.x,
        splitPoint.y,
      ],
    },
    {
      command: "C" as const,
      values: parseCommandValues(link(splitPoint, messageCenter)),
    },
    {
      command: "C" as const,
      values: parseCommandValues(link(messageCenter, cubic[3])),
    },
    ...commands.slice(2),
  ];

  return serializePath(inserted);
}

function parseCommandValues(command: string) {
  const parsed = parsePath(command)[0];
  return parsed.command === "C" ? parsed.values : [];
}

// ---------------------------------------------------------------------------
// Phones: weave the thread through the case-study artwork in reading order,
// passing just beneath each piece (alternating between the two page margins),
// the way the reference does, instead of squashing the desktop template.
// (Only used when MOBILE_CASE_STUDY_ROUTE === "weave"; the default is
// "template", which squashes the reference route to the phone layout.)
// ---------------------------------------------------------------------------
const NARROW_BAND_IDS: Record<string, string[]> = {
  kabri: [
    "case.study.kabri.lease",
    "case.study.kabri.inspection",
    "case.study.kabri.repair",
    "case.study.kabri.book",
  ],
  norma: [
    "case.study.norma.ledger-top",
    "case.study.norma.ledger-bottom",
    "case.study.norma.paper-main",
    "case.study.norma.paper-acme",
    "case.study.norma.paper-rejected",
  ],
  shopops: [
    "case.study.shopops.message",
    "case.study.shopops.plate",
    "case.study.shopops.fork",
    "case.study.shopops.reply",
    "case.study.shopops.ticket",
    "case.study.shopops.wallet",
    "case.study.shopops.dashboard",
    "case.study.shopops.bag",
  ],
  legalexy: [
    "case.study.legalexy.pan",
    "case.study.legalexy.gst",
    "case.study.legalexy.bank",
    "case.study.legalexy.itr",
    "case.study.legalexy.application",
    "case.study.legalexy.assessment",
    "case.study.legalexy.outcome",
  ],
};

type Band = { top: number; bottom: number };

function safeRect(layout: MeasuredLayout, id: string): Rect | null {
  try {
    const rect = getRect(layout, id);
    return rect.width > 4 && rect.height > 4 ? rect : null;
  } catch {
    return null;
  }
}

/** Artwork rects -> vertical bands (side-by-side pieces merge into one). */
function artworkBands(
  layout: MeasuredLayout,
  ids: string[],
  fromY: number,
  toY: number,
): Band[] {
  const rects = ids
    .map((id) => safeRect(layout, id))
    .filter((rect): rect is Rect => rect !== null)
    .filter((rect) => rect.top > fromY && rect.bottom < toY)
    .sort((a, b) => a.top - b.top);

  const bands: Band[] = [];
  for (const rect of rects) {
    const last = bands[bands.length - 1];
    if (last && rect.top < last.bottom - 4) {
      last.bottom = Math.max(last.bottom, rect.bottom);
    } else {
      bands.push({ top: rect.top, bottom: rect.bottom });
    }
  }
  return bands;
}

function narrowEdges(layout: MeasuredLayout) {
  const edge = clamp(layout.pagePad * 0.45, 6, 14);
  return { left: edge, right: layout.width - edge };
}

/**
 * Appends a serpentine to `builder`: down one margin past a piece, under it
 * to the other margin, down past the next piece, and so on, finishing
 * vertically at `endY`. Returns the x the thread finishes on.
 */
function appendWeave(
  builder: PathBuilder,
  layout: MeasuredLayout,
  bands: Band[],
  blockers: number[],
  endY: number,
): number {
  const { left, right } = narrowEdges(layout);
  const from = builder.current;
  let cur = Math.abs(from.x - left) < Math.abs(from.x - right) ? left : right;
  let opp = cur === left ? right : left;
  const vertices: Point[] = [from];

  if (Math.abs(from.x - cur) > 1) {
    const y1 = Math.min(from.y + 20, endY - 4);
    vertices.push({ x: from.x, y: y1 }, { x: cur, y: y1 });
  }

  bands.forEach((band, index) => {
    const nextTops = [
      ...(bands[index + 1] ? [bands[index + 1].top] : []),
      ...blockers.filter((top) => top > band.bottom),
      endY,
    ];
    const gap = Math.min(...nextTops) - band.bottom;
    if (index === bands.length - 1 && gap < 70) return;
    const under = band.bottom + clamp(0.4 * gap, 8, 16);
    vertices.push({ x: cur, y: under }, { x: opp, y: under });
    [cur, opp] = [opp, cur];
  });

  vertices.push({ x: cur, y: endY });
  appendRoundedCorners(builder, vertices, () => 14);
  return cur;
}

function buildProjectTemplate(
  layout: MeasuredLayout,
  id: "norma" | "shopops" | "legalexy",
  template: Template,
  previous: RouteModel | undefined,
  previousEnd: Point,
  nextStartX?: number,
): RouteModel {
  const frame = getRect(layout, `case.study.${id}`);
  const key = [
    pointKey(previousEnd),
    rectKey(frame),
    layout.width,
    nextStartX === undefined ? "end" : nextStartX.toFixed(1),
  ].join("|");
  const cached = reuseRoute(previous, key);
  if (cached) return cached;

  if (layout.width <= 700 && MOBILE_CASE_STUDY_ROUTE === "prod") {
    let d = buildPhoneCasePath(layout, id, previousEnd);
    if (nextStartX !== undefined) d = blendRouteEnd(d, nextStartX, frame, 0.2);
    return routeFromPath(key, d, 10);
  }

  if (layout.width <= 700 && MOBILE_CASE_STUDY_ROUTE === "weave") {
    const title = safeRect(layout, `case.study.${id}.title`);
    const bands = artworkBands(
      layout,
      NARROW_BAND_IDS[id],
      previousEnd.y,
      frame.bottom,
    );
    const builder = new PathBuilder(previousEnd);
    appendWeave(builder, layout, bands, title ? [title.top] : [], frame.bottom);
    return routeFromPath(key, builder.d, 10);
  }

  // Phones squash the reference route to the narrow frame; larger screens
  // anchor it to the live artwork bands.
  let d =
    layout.width <= 700
      ? squashTemplate(template.d, template, frame, REFERENCE_WIDTH)
      : dynamicReframe(template, frame, layout, id);
  // The route must begin exactly where the previous case study ended. On a
  // phone the squashed template's own start can be tens of pixels away.
  d = joinRouteStart(d, pathStart(d), previousEnd, frame.height);
  // Phones: hand over to the next case study by easing the tail of this route
  // toward the next entry, keeping the route through the artwork untouched.
  if (layout.width <= 700 && nextStartX !== undefined) {
    d = blendRouteEnd(d, nextStartX, frame);
  }

  if (id === "shopops") {
    const message = getRect(layout, "case.study.shopops.message");
    const points = flattenPath(d, 8);
    if (routeMissesRect(points, message, 8)) {
      d = insertMessagePass(d, message);
    }
  }

  return routeFromPath(key, d, 10);
}

function buildKabri(
  layout: MeasuredLayout,
  previous: RouteModel | undefined,
  start: Point,
  nextStartX?: number,
): RouteModel {
  const frame = getRect(layout, "case.study.kabri");
  const north = centerOf(getRect(layout, "case.study.kabri.door.north"));
  const east = centerOf(getRect(layout, "case.study.kabri.door.east"));
  const key = [
    pointKey(start),
    rectKey(frame),
    pointKey(north),
    pointKey(east),
    layout.width,
    nextStartX === undefined ? "end" : nextStartX.toFixed(1),
  ].join("|");
  const cached = reuseRoute(previous, key);
  if (cached) return cached;

  if (layout.width <= 700 && MOBILE_CASE_STUDY_ROUTE === "prod") {
    let d = buildPhoneCasePath(layout, "kabri", start);
    if (nextStartX !== undefined) d = blendRouteEnd(d, nextStartX, frame, 0.2);
    return routeFromPath(key, d, 10);
  }

  // Phones: exactly production's route (the whole reference route squashed to
  // the frame, as for the other case studies), not a rebuilt hall prefix.
  if (layout.width <= 700 && MOBILE_CASE_STUDY_ROUTE !== "weave") {
    let d = squashTemplate(
      PROJECT_TEMPLATES.kabri.d,
      PROJECT_TEMPLATES.kabri,
      frame,
      REFERENCE_WIDTH,
    );
    d = joinRouteStart(d, pathStart(d), start, frame.height);
    if (nextStartX !== undefined) d = blendRouteEnd(d, nextStartX, frame);
    return routeFromPath(key, d, 10);
  }

  if (layout.width <= 700 && MOBILE_CASE_STUDY_ROUTE === "weave") {
    const { right } = narrowEdges(layout);
    const flat = getRect(layout, "case.study.kabri.flat");
    const title = safeRect(layout, "case.study.kabri.title");
    const blockers = title ? [title.top] : [];
    const all = artworkBands(
      layout,
      NARROW_BAND_IDS.kabri,
      start.y,
      frame.bottom,
    );
    const before = all.filter((band) => band.bottom <= flat.top);
    const after = all.filter((band) => band.top >= flat.bottom);
    const rr = Math.min(24, Math.max(14, 0.155 * (east.y - north.y)));
    const hall = east.y - 2;
    const b = new PathBuilder(start);
    const approachY = Math.max(start.y + 40, north.y - 50);
    const cur = appendWeave(b, layout, before, blockers, approachY);
    const dN = north.y - approachY;
    b.cubic(
      { x: cur, y: approachY + 0.5 * dN },
      { x: north.x, y: north.y - 0.5 * dN },
      north,
    )
      .cubic(
        { x: north.x, y: north.y + 0.336 * (east.y - north.y) },
        { x: north.x, y: north.y + 0.664 * (east.y - north.y) },
        { x: north.x, y: east.y - rr },
      )
      .cubic(
        { x: north.x, y: east.y - rr * 0.55 },
        { x: north.x + rr * 0.45, y: hall },
        { x: north.x + rr, y: hall },
      )
      .cubic(
        { x: north.x + rr + 56, y: hall },
        { x: east.x - 58, y: east.y },
        east,
      );
    const dxE = right - east.x;
    if (dxE > 6) {
      const dyE = Math.max(40, dxE * 0.9);
      b.cubic(
        { x: east.x + 0.55 * dxE, y: east.y },
        { x: right, y: east.y + 0.45 * dyE },
        { x: right, y: east.y + dyE },
      );
    }
    appendWeave(b, layout, after, blockers, frame.bottom);
    return routeFromPath(key, b.d, 10);
  }

  const r = Math.min(24, Math.max(14, 0.155 * (east.y - north.y)));
  const hallY = east.y - 2;
  const prefix = new PathBuilder(start);
  prefix
    .cubic(
      { x: start.x, y: start.y + 0.49 * (north.y - start.y) },
      { x: north.x, y: north.y - 0.47 * (north.y - start.y) },
      north,
    )
    .cubic(
      { x: north.x, y: north.y + 0.336 * (east.y - north.y) },
      { x: north.x, y: north.y + 0.664 * (east.y - north.y) },
      { x: north.x, y: east.y - r },
    )
    .cubic(
      { x: north.x, y: east.y - r * 0.55 },
      { x: north.x + r * 0.45, y: hallY },
      { x: north.x + r, y: hallY },
    )
    .cubic(
      { x: north.x + r + 56, y: hallY },
      { x: east.x - 58, y: east.y },
      east,
    );

  const suffixCommands = KABRI_COMMANDS.slice(KABRI_EAST_INDEX + 1);
  const suffix = serializePath([
    { command: "M", values: [KABRI_EAST.x, KABRI_EAST.y] },
    ...suffixCommands,
  ]);

  const xScale = frame.width / REFERENCE_WIDTH;

  // FIX: Anchor the suffix Y mapping to the east door, rather than stretching from the top.
  const refEastY = KABRI_EAST.y;
  const refBottomY =
    PROJECT_TEMPLATES.kabri.top + PROJECT_TEMPLATES.kabri.height;
  const liveBottomY = frame.bottom;
  const liveEastY = east.y;

  const yScaleTop =
    (liveEastY - frame.top) /
    Math.max(1, refEastY - PROJECT_TEMPLATES.kabri.top);
  const yScaleBottom =
    (liveBottomY - liveEastY) / Math.max(1, refBottomY - refEastY);

  const parityPhone =
    layout.width <= 700 && !phoneTweak(layout.width, "caseStudies");
  const yScaleLinear =
    frame.height / Math.max(1, PROJECT_TEMPLATES.kabri.height);

  const framePoint = (value: Point): Point => {
    // Production mapping: one linear stretch of the whole reference route.
    if (parityPhone) {
      return {
        x: frame.left + value.x * xScale,
        y: frame.top + (value.y - PROJECT_TEMPLATES.kabri.top) * yScaleLinear,
      };
    }
    const isBelowEast = value.y >= refEastY;
    const yScale = isBelowEast ? yScaleBottom : yScaleTop;

    return {
      x: frame.left + value.x * xScale,
      y: isBelowEast
        ? liveEastY + (value.y - refEastY) * yScale
        : liveEastY - (refEastY - value.y) * yScale,
    };
  };

  const mappedEast = framePoint(KABRI_EAST);
  const offset = {
    x: east.x - mappedEast.x,
    y: east.y - mappedEast.y,
  };
  const mappedSuffix = transformPath(suffix, (value) => {
    const mapped = framePoint(value);
    return phoneTweak(layout.width, "caseStudies")
      ? blendKabriSuffix(mapped, offset, east.y, frame, layout.width)
      : { x: mapped.x + offset.x, y: mapped.y + offset.y };
  });
  const mappedEnd = pathEnd(mappedSuffix);
  const suffixWithBottom = retargetEnd(mappedSuffix, {
    x: mappedEnd.x,
    y: frame.bottom,
  });

  // One continuous subpath: the suffix starts exactly where the prefix ends
  // (the east door), so its leading "M" is dropped. A second "M" would make
  // this a compound path, and DrawSVG/stroke-dash restarts per subpath, so
  // the part after the door would not follow the pen.
  const [, ...suffixRest] = parsePath(suffixWithBottom);
  assertDistance(
    prefix.end,
    pathStart(mappedSuffix),
    "KABRI hall → east door suffix",
  );
  const d = `${prefix.d} ${serializePath(suffixRest)}`;
  return routeFromPath(key, d, 10);
}

/**
 * Appends a smooth S-curve from the builder's current point to `to`. Both ends
 * are vertical, so it joins straight runs (and the next curve) without a kink.
 * When the two x's are (almost) equal the curve bulges sideways by `amp` and
 * comes back, so the road still meanders instead of becoming a ruler line.
 */
function meander(builder: PathBuilder, to: Point, amp: number, side: 1 | -1) {
  const from = builder.current;
  const dy = to.y - from.y;
  if (dy < 0.5) {
    builder.line(to);
    return;
  }

  if (Math.abs(to.x - from.x) > 2 || amp < 1) {
    builder.cubic(
      { x: from.x, y: from.y + 0.55 * dy },
      { x: to.x, y: to.y - 0.55 * dy },
      to,
    );
    return;
  }

  const mid = { x: from.x + side * amp, y: from.y + 0.5 * dy };
  builder.cubic(
    { x: from.x, y: from.y + 0.3 * dy },
    { x: mid.x, y: mid.y - 0.22 * dy },
    mid,
  );
  builder.cubic(
    { x: mid.x, y: mid.y + 0.22 * dy },
    { x: to.x, y: to.y - 0.3 * dy },
    to,
  );
}

function buildWhy(
  layout: MeasuredLayout,
  previous: RouteModel | undefined,
  start: Point,
  aboutStart: Point,
): RouteModel {
  const title = getRect(layout, "why.title");
  const intro = getRect(layout, "why.intro");
  const nodes = [1, 2, 3, 4, 5].map((index) =>
    centerOf(getRect(layout, `why.point.${index}`)),
  );
  const copies = [1, 2, 3, 4, 5].map((index) =>
    getRect(layout, `why.copy.${index}`),
  );
  const key = [
    pointKey(start),
    pointKey(aboutStart),
    rectKey(title),
    rectKey(intro),
    ...nodes.map(pointKey),
    ...copies.map(rectKey),
    layout.width,
    "v3",
  ].join("|");
  const cached = reuseRoute(previous, key);
  if (cached) return cached;

  // The thread never turns back on itself: it slides to the right of the
  // headline (the title anchor is a text range, so this is the widest line,
  // not the whole container), runs down past the intro, then wanders from
  // bullet to bullet like a village road.
  const narrow = layout.width <= 700;
  const maxX = layout.width - clamp(layout.pagePad * 0.45, 6, 14);
  const railX = narrow
    ? maxX
    : clamp(
        Math.max(title.right + 28, start.x),
        start.x,
        Math.max(start.x, maxX - 8),
      );

  const builder = new PathBuilder(start);

  // 1. Slide over to the rail before the headline starts.
  const slideY = Math.max(
    start.y + 24,
    Math.min(title.top - 16, start.y + 160),
  );
  if (Math.abs(railX - start.x) > 1) {
    const dy = slideY - start.y;
    builder.cubic(
      { x: start.x, y: start.y + 0.55 * dy },
      { x: railX, y: slideY - 0.55 * dy },
      { x: railX, y: slideY },
    );
  } else if (slideY > start.y) {
    builder.line({ x: railX, y: slideY });
  }

  // 2. Down the rail, past the headline and the intro.
  const introY = Math.min(intro.bottom + 20, nodes[0].y - 24);
  if (introY > builder.current.y + 0.5) {
    builder.line({ x: railX, y: introY });
  }

  // 3. Into the first bullet, then bullet to bullet. Each hop first drops
  // below the copy it just passed, so the curve never touches text.
  const amp = clamp(0.5 * (nodes[0].x - 4), 0, 9);
  meander(builder, nodes[0], 0, 1);

  const targets = [...nodes.slice(1), aboutStart];
  targets.forEach((target, index) => {
    const copy = copies[index];
    const gap = clamp(0.08 * copy.height, 12, 24);
    const dropY = Math.min(
      Math.max(builder.current.y + 24, copy.bottom + gap),
      target.y - 24,
    );
    if (dropY > builder.current.y + 0.5) {
      builder.line({ x: builder.current.x, y: dropY });
    }
    meander(builder, target, amp, index % 2 === 0 ? 1 : -1);
  });

  return routeFromPath(key, builder.d, 10);
}

function buildAbout(
  layout: MeasuredLayout,
  previous: AboutModel | undefined,
): AboutModel {
  const section = getRect(layout, "conclusion.section");
  const profile = getRect(layout, "conclusion.profile");
  const key = [rectKey(section), rectKey(profile), layout.width, "v3"].join(
    "|",
  );
  if (previous && previous.key === key) return previous;

  const reference = {
    left: 865.77,
    top: 9392.1875,
    width: 427.74,
    height: 900,
  };
  const free = section.right - profile.right - 32;
  const rawScale = Math.min(
    1,
    free / reference.width,
    section.height / reference.height,
  );

  let scale = rawScale;
  let x0: number;
  const y0 = section.top;

  // Phones: profile text fills the whole width, so the fingerprint can't sit
  // beside it. Park it (mirrored, hanging off the right-hand rail) BELOW the
  // profile and run the thread down the margin to reach it.
  const sideBySide = free >= 200 && rawScale >= 0.42;
  if (!sideBySide && profile.width > section.width * 0.7) {
    // Phones: the profile text fills the width, so no vertical line at the
    // fingerprint axis can reach the print without crossing the copy. The
    // thread therefore starts on the right-hand rail (the same rail the
    // Why Me section uses, so the hand-over stays natural), runs down the
    // open margin past the whole profile, and only below the last line of
    // text swings in to the centred fingerprint with one long S-curve.
    const rail = clamp(layout.pagePad * 0.45, 6, 14);
    const railX = layout.width - rail;
    const axisOffset = 869.25 - reference.left;
    // Production shows the print at under half the screen width on phones.
    const fit = (top: number) =>
      clamp(
        Math.min(
          0.46,
          (layout.width - 2 * rail) / reference.width,
          (section.bottom - top - 16) / reference.height,
        ),
        0.3,
        0.46,
      );
    const axisFor = (s: number) =>
      (layout.width - reference.width * s) / 2 + axisOffset * s;

    // The S-curve needs some height below the text to stay clear of it: the
    // wider the sideways run, the more room it gets.
    const probeTop = Math.max(section.top + 1, profile.bottom + 24);
    const drop = clamp(0.3 * Math.abs(railX - axisFor(fit(probeTop))), 56, 96);
    const top = Math.max(section.top + 1, profile.bottom + drop);
    const s = fit(top);
    const axisX = axisFor(s);

    const mapped = transformPath(CONCLUSION_FINGERPRINT, (value) => ({
      x: axisX + (value.x - 869.25) * s,
      y: top + (value.y - reference.top) * s,
    }));
    const tail = mapped.replace(/^M\s+\S+\s+\S+\s*/, "");

    // Down the rail until the last line of text is behind us...
    const exitY = Math.max(section.top + 1, profile.bottom);
    let lead = `M ${format(railX)} ${format(section.top)} `;
    if (exitY > section.top + 0.5) {
      lead += `L ${format(railX)} ${format(exitY)} `;
    }
    // ...then a vertical-to-vertical S into the fingerprint's start, so both
    // joins stay free of corners.
    const dy = top - exitY;
    lead += `C ${format(railX)} ${format(exitY + 0.55 * dy)} ${format(
      axisX,
    )} ${format(top - 0.55 * dy)} ${format(axisX)} ${format(top)} `;
    return { ...routeFromPath(key, lead + tail, 6), rect: section };
  }

  if (sideBySide) {
    const targetWidth = reference.width * scale;
    x0 = profile.right + Math.max(16, (free - targetWidth) / 2);
  } else {
    scale = Math.min(section.height / reference.height, 0.62);
    x0 = section.right - reference.width * scale - 8;
  }

  if (layout.width === REFERENCE_WIDTH && Math.abs(scale - 1) < 1e-9) {
    x0 = reference.left;
  }

  const map = (value: Point): Point => ({
    x: x0 + (value.x - reference.left) * scale,
    y: y0 + (value.y - reference.top) * scale,
  });

  const d = transformPath(CONCLUSION_FINGERPRINT, map);
  return {
    ...routeFromPath(key, d, 6),
    rect: section,
  };
}

function workDerivedAnchors(points: Point[], drawing: Rect) {
  const bulbRef = REF_WORK.bulb;
  const bulb = {
    left:
      drawing.left +
      ((bulbRef.left - REF_WORK.drawing.left) / REF_WORK.drawing.width) *
        drawing.width,
    top:
      drawing.top +
      ((bulbRef.top - REF_WORK.drawing.top) / REF_WORK.drawing.height) *
        drawing.height,
    right:
      drawing.left +
      ((bulbRef.right - REF_WORK.drawing.left) / REF_WORK.drawing.width) *
        drawing.width,
    bottom:
      drawing.top +
      ((bulbRef.bottom - REF_WORK.drawing.top) / REF_WORK.drawing.height) *
        drawing.height,
  };

  const bulbPoints = points.filter(
    (value) =>
      value.x >= bulb.left - 2 &&
      value.x <= bulb.right + 2 &&
      value.y >= bulb.top - 2 &&
      value.y <= bulb.bottom + 2,
  );

  const bulbCenter =
    bulbPoints.length > 0
      ? {
          x:
            (Math.min(...bulbPoints.map(({ x }) => x)) +
              Math.max(...bulbPoints.map(({ x }) => x))) /
            2,
          y:
            (Math.min(...bulbPoints.map(({ y }) => y)) +
              Math.max(...bulbPoints.map(({ y }) => y))) /
            2,
        }
      : { x: (bulb.left + bulb.right) / 2, y: (bulb.top + bulb.bottom) / 2 };

  const waves = REF_WORK.waves.map((band) => {
    const top =
      drawing.top +
      ((band.top - REF_WORK.drawing.top) / REF_WORK.drawing.height) *
        drawing.height;
    const bottom =
      drawing.top +
      ((band.bottom - REF_WORK.drawing.top) / REF_WORK.drawing.height) *
        drawing.height;
    const candidates = points.filter(
      (value) => value.y >= top - 1 && value.y <= bottom + 1,
    );
    if (candidates.length === 0) {
      return { x: drawing.right - 12, y: (top + bottom) / 2 };
    }
    return candidates.reduce((best, value) =>
      value.x > best.x ? value : best,
    );
  });

  return { bulb: bulbCenter, waves };
}

export function buildThreadModel(
  layout: MeasuredLayout,
  previous?: ThreadModel,
): ThreadModel {
  const startPoint = resolveStartPoint(layout);
  const work = buildWork(
    layout,
    startPoint,
    layout.capabilities.top,
    previous?.work,
  );
  const capabilities = buildCapabilities(
    layout,
    work,
    {
      entry: previous?.capsEntry,
      product: previous?.capsProduct,
      ai: previous?.capsAi,
      exit: previous?.capsExit,
    },
    layout.width <= 700 && MOBILE_CASE_STUDY_ROUTE === "prod"
      ? phoneEntryX(layout, "kabri")
      : undefined,
  );

  // x where each case study's route begins (the entry the previous one must
  // hand over to). Only phones use it; larger screens anchor to the artwork.
  const entryX = (
    id: "kabri" | "norma" | "shopops" | "legalexy",
    template: Template,
  ) => {
    const frame = getRect(layout, `case.study.${id}`);
    if (layout.width <= 700 && MOBILE_CASE_STUDY_ROUTE === "prod") {
      return phoneEntryX(layout, id);
    }
    return (
      frame.left + pathStart(template.d).x * (frame.width / REFERENCE_WIDTH)
    );
  };
  const kabri = buildKabri(
    layout,
    previous?.projects.kabri,
    capabilities.exit.end,
    entryX("norma", PROJECT_TEMPLATES.norma),
  );
  const norma = buildProjectTemplate(
    layout,
    "norma",
    PROJECT_TEMPLATES.norma,
    previous?.projects.norma,
    kabri.end,
    entryX("shopops", PROJECT_TEMPLATES["shop-ops"]),
  );
  const shopops = buildProjectTemplate(
    layout,
    "shopops",
    PROJECT_TEMPLATES["shop-ops"],
    previous?.projects.shopops,
    norma.end,
    entryX("legalexy", PROJECT_TEMPLATES["lega-lexy"]),
  );
  const legalexy = buildProjectTemplate(
    layout,
    "legalexy",
    PROJECT_TEMPLATES["lega-lexy"],
    previous?.projects.legalexy,
    shopops.end,
  );

  const conclusion = buildAbout(layout, previous?.conclusion);
  const why = buildWhy(layout, previous?.why, legalexy.end, conclusion.start);

  const aboutStart = conclusion.start;

  const workAnchors = workDerivedAnchors(
    work.points,
    getRect(layout, "work.flow.drawing"),
  );

  const capabilityMarkers: MarkerModel[] = [];
  const capabilityRadius =
    layout.width <= 700 ? 2.2 : layout.width <= 820 ? 2.6 : 3.2;
  const capabilityCore =
    layout.width <= 700 ? 0.9 : layout.width <= 820 ? 1.1 : 1.35;

  // Markers are projected onto the thread so the ring is always ON it, even
  // when the DOM dot is a pixel or two off the arc.
  const fineProduct = flattenPath(capabilities.product.d, 2);
  const fineAi = flattenPath(capabilities.ai.d, 2);
  const fineProductLengths = cumulativeLengths(fineProduct);
  const fineAiLengths = cumulativeLengths(fineAi);
  const snapTo = (points: Point[], lengths: number[], target: Point): Point =>
    closestPointOnPolyline(points, lengths, target).point;

  for (let index = 1; index <= 5; index += 1) {
    capabilityMarkers.push({
      id: `capabilities.product.${index}`,
      kind: "service",
      point: snapTo(
        fineProduct,
        fineProductLengths,
        centerOf(getRect(layout, `capabilities.product.${index}`)),
      ),
      radius: capabilityRadius,
      core: capabilityCore,
    });
    capabilityMarkers.push({
      id: `capabilities.ai.${index}`,
      kind: "service",
      point: snapTo(
        fineAi,
        fineAiLengths,
        centerOf(getRect(layout, `capabilities.ai.${index}`)),
      ),
      radius: capabilityRadius,
      core: capabilityCore,
    });
  }

  // Bullet dots are thread markers, drawn exactly like the capability dots.
  const whyMarkers: MarkerModel[] = [1, 2, 3, 4, 5].map((index) => ({
    id: `why.point.${index}`,
    kind: "service",
    point: centerOf(getRect(layout, `why.point.${index}`)),
    radius: capabilityRadius,
    core: capabilityCore,
  }));

  // On phones the Kabri route is production's, squashed; the door dots are
  // projected onto it so they always sit on the thread.
  const snapDoor = (point: Point): Point => {
    if (layout.width > 700) return point;
    const fine = flattenPath(kabri.d, 2);
    return closestPointOnPolyline(fine, cumulativeLengths(fine), point).point;
  };

  // Production's phone layout has no door rings (the thread simply runs
  // through the opening in the plan), so on phones they are drawn at zero size.
  const noDoorRings = layout.width <= 700 && MOBILE_CASE_STUDY_ROUTE === "prod";
  const doorMarkers: MarkerModel[] = [
    {
      id: "case.study.kabri.door.north",
      kind: "door",
      point: snapDoor(centerOf(getRect(layout, "case.study.kabri.door.north"))),
      radius: noDoorRings ? 0 : 4,
      core: noDoorRings ? 0 : 1.5,
    },
    {
      id: "case.study.kabri.door.east",
      kind: "door",
      point: snapDoor(centerOf(getRect(layout, "case.study.kabri.door.east"))),
      radius: noDoorRings ? 0 : 4,
      core: noDoorRings ? 0 : 1.5,
    },
  ];

  const derived = new Map<string, Point>([
    ["thread.origin", work.start],
    ["hero.handoff", work.start],
    ["work.bulb", workAnchors.bulb],
    ["work.wave.1", workAnchors.waves[0]],
    ["work.wave.2", workAnchors.waves[1]],
    ["work.wave.3", workAnchors.waves[2]],
    ["work.exit", work.end],
    [
      "capabilities.split.top",
      { x: capabilities.splitX, y: capabilities.ringTop },
    ],
    [
      "capabilities.split.bottom",
      { x: capabilities.splitX, y: capabilities.ringBottom },
    ],
    [
      "capabilities.branch.product",
      {
        x: capabilities.splitX - capabilities.ringRx,
        y: (capabilities.ringTop + capabilities.ringBottom) / 2,
      },
    ],
    [
      "capabilities.branch.ai",
      {
        x: capabilities.splitX + capabilities.ringRx,
        y: (capabilities.ringTop + capabilities.ringBottom) / 2,
      },
    ],
    ["capabilities.exit", capabilities.exit.end],
    ["case.study.kabri.exit", kabri.end],
    ["case.study.norma.exit", norma.end],
    ["case.study.shopops.exit", shopops.end],
    ["case.study.legalexy.exit", legalexy.end],
    ["why.exit", aboutStart],
    ["conclusion.fingerprint", conclusion.start],
    ["conclusion.fingerprint.start", conclusion.start],
    ["conclusion.fingerprint.end", conclusion.end],
    // No footer route: the thread ends at the last stroke of the fingerprint.
    ["thread.terminal", conclusion.end],
  ]);

  const pagePath = [
    work.d,
    capabilities.entry.d,
    capabilities.product.d,
    capabilities.exit.d,
    kabri.d,
    norma.d,
    shopops.d,
    legalexy.d,
    why.d,
  ].join(" ");

  const keys = {
    work: work.key,
    capabilities: capabilities.entry.key,
    kabri: kabri.key,
    norma: norma.key,
    shopops: shopops.key,
    legalexy: legalexy.key,
    why: why.key,
    conclusion: conclusion.key,
  };

  if (process.env.NODE_ENV !== "production") {
    assertPathSmooth(work.d, "work route", 1.5);
    assertVerticalEnd(work.d, "work → capabilities connector");
    assertTangentContinuous(
      work.d,
      capabilities.entry.d,
      "work → capabilities",
      2,
    );
    assertTangentContinuous(legalexy.d, why.d, "LEGALEXY → why-me", 2);
    assertTangentContinuous(why.d, conclusion.d, "why-me → conclusion", 2);
    assertPathSmooth(why.d, "why-me route", 1.5);

    const whyNodes = [1, 2, 3, 4, 5].map((index) =>
      centerOf(getRect(layout, `why.point.${index}`)),
    );
    const whyCopies = [1, 2, 3, 4, 5].map((index) =>
      getRect(layout, `why.copy.${index}`),
    );

    assertNodesOnPath(why.d, whyNodes, 0.75);
    assertPathMissesRects(
      why.d,
      [
        getRect(layout, "why.title"),
        getRect(layout, "why.intro"),
        ...whyCopies,
      ],
      0,
    );

    assertDistance(work.end, capabilities.entry.start, "work → capabilities");
    assertDistance(capabilities.exit.end, kabri.start, "capabilities → KABRI");
    assertDistance(kabri.end, norma.start, "KABRI → NORMA");
    assertDistance(norma.end, shopops.start, "NORMA → SHOPOPS");
    assertDistance(shopops.end, legalexy.start, "SHOPOPS → LEGALEXY");
    assertDistance(legalexy.end, why.start, "LEGALEXY → why-me");
    assertDistance(why.end, conclusion.start, "why-me → conclusion");
  }

  return {
    width: layout.width,
    height: layout.height,
    heroHeight: layout.hero.height,
    pagePad: layout.pagePad,
    work,
    capsEntry: capabilities.entry,
    capsProduct: capabilities.product,
    capsAi: capabilities.ai,
    capsExit: capabilities.exit,
    projects: { kabri, norma, shopops, legalexy },
    why,
    conclusion,
    pagePath,
    markers: [...capabilityMarkers, ...whyMarkers, ...doorMarkers],
    terminal: conclusion.end,
    derived,
    keys,
  };
}

export function masterTrack(model: ThreadModel): Point[] {
  const points: Point[] = [];
  const append = (segment: Point[]) => {
    for (const value of segment) {
      const last = points[points.length - 1];
      if (
        !last ||
        Math.abs(last.x - value.x) > 1e-6 ||
        Math.abs(last.y - value.y) > 1e-6
      ) {
        points.push(value);
      }
    }
  };

  append(model.work.points);
  append(model.capsEntry.points);
  append(model.capsProduct.points);
  append(model.capsExit.points);
  append(model.projects.kabri.points);
  append(model.projects.norma.points);
  append(model.projects.shopops.points);
  append(model.projects.legalexy.points);
  append(model.why.points);
  append(model.conclusion.points);

  return points;
}

export function labelForAnchor(id: string) {
  return ANCHOR_LABELS[id] ?? id;
}

export {
  CAPABILITIES_ENTRY,
  CAPABILITIES_EXIT,
  CAPABILITIES_GREEN_DEV,
  CAPABILITIES_MIG_DEV,
  CONTACT_ROUTE,
  REFERENCE_WIDTH,
  cumulativeLengths,
  distance,
  pointAtLength,
};
