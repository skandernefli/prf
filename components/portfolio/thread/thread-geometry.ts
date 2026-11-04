import {
  ABOUT_FINGERPRINT,
  CAPABILITIES_AI,
  CAPABILITIES_ENTRY,
  CAPABILITIES_EXIT,
  CAPABILITIES_PRODUCT,
  CONTACT_ROUTE,
  HERO_BACK,
  HERO_FRONT,
  WORLD_CREDITFLOW,
  WORLD_EIGNA,
  WORLD_MESA,
  WORLD_PAPERTRAIL,
  WORK_INDEX,
} from "./route-data";
import { ANCHOR_LABELS } from "./thread-anchors";
import {
  getRect,
  type MeasuredLayout,
} from "./thread-measure";
import {
  PathBuilder,
  affineFrom3,
  alignEndTangent,
  alignStartTangent,
  appendRoundedCorners,
  applyAffine,
  assertDistance,
  assertPathSmooth,
  assertTangentContinuous,
  assertVerticalEnd,
  clamp,
  closestPointOnPolyline,
  cubicCommand,
  cumulativeLengths,
  distance,
  endpointTangent,
  flattenPath,
  lineCommand,
  middle,
  moveCommand,
  parsePath,
  pathBounds,
  pathEnd,
  pathStart,
  pointAtLength,
  retargetEnd,
  retargetStart,
  serializePath,
  similarityFrom2,
  smoothPathJoins,
  splitCubic,
  transformPath,
  type Cubic,
  type Point,
  type Rect,
} from "./thread-path";

const REFERENCE_WIDTH = 1425;
const REFERENCE_HERO_HEIGHT = 900;
const REFERENCE_PROJECT_HEIGHT = 1024.703125;

const REFERENCE_HERO_RECTS = {
  from: { left: 22.5, top: 204.9, width: 580.8, height: 163.4 },
  concept: { left: 22.5, top: 368.3, width: 955.9, height: 163.4 },
  launch: { left: 33.4, top: 531.7, width: 1119.5, height: 163.4 },
  o: { left: 277.8, top: 171.9, width: 151.9, height: 228 },
  c: { left: 22.5, top: 335.3, width: 139.7, height: 228 },
  ch: { left: 866, top: 498.7, width: 286.8, height: 228 },
} as const;

const HERO_REFERENCE = [...HERO_BACK, ...HERO_FRONT].map((d) => ({
  d,
  start: pathStart(d),
  end: pathEnd(d),
  bounds: pathBounds(d, 4),
}));

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
  "eigna" | "papertrail" | "mesa" | "creditflow",
  Template
> = {
  eigna: { top: 3243.96875, height: REFERENCE_PROJECT_HEIGHT, d: WORLD_EIGNA },
  papertrail: {
    top: 6318.078125,
    height: REFERENCE_PROJECT_HEIGHT,
    d: WORLD_PAPERTRAIL,
  },
  mesa: { top: 5293.375, height: REFERENCE_PROJECT_HEIGHT, d: WORLD_MESA },
  creditflow: {
    top: 8367.484375,
    height: REFERENCE_PROJECT_HEIGHT,
    d: WORLD_CREDITFLOW,
  },
};

const EIGNA_COMMANDS = parsePath(WORLD_EIGNA);
const EIGNA_EAST = { x: 669.5201612903226, y: 3520.1225126008067 };
const EIGNA_EAST_INDEX = EIGNA_COMMANDS.findIndex(({ command, values }) => {
  if (command !== "C") return false;
  return (
    Math.abs(values[4] - EIGNA_EAST.x) < 0.05 &&
    Math.abs(values[5] - EIGNA_EAST.y) < 0.05
  );
});

if (process.env.NODE_ENV !== "production" && EIGNA_EAST_INDEX < 0) {
  throw new Error("Thread: could not find the Eigna east-door cubic.");
}

export type RouteModel = {
  key: string;
  d: string;
  start: Point;
  end: Point;
  points: Point[];
};

export type HeroModel = {
  key: string;
  back: string[];
  front: string[];
  backPoints: Point[][];
  frontPoints: Point[][];
  origin: Point;
  handoff: Point;
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
  hero: HeroModel;
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
  about: AboutModel;
  contact: RouteModel;
  pagePath: string;
  markers: MarkerModel[];
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

const routeFromPath = (
  key: string,
  d: string,
  stepPx: number,
): RouteModel => ({
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

type Box = Pick<Rect, "left" | "top" | "width" | "height">;

function nearRect(a: Box, b: Box, tolerance = 0.3) {
  return (
    Math.abs(a.left - b.left) <= tolerance &&
    Math.abs(a.top - b.top) <= tolerance &&
    Math.abs(a.width - b.width) <= tolerance &&
    Math.abs(a.height - b.height) <= tolerance
  );
}

function glyphScale(live: Rect, reference: Box) {
  return Math.min(
    live.width / Math.max(1, reference.width),
    live.height / Math.max(1, reference.height),
  );
}

function connectorCenter(
  reference: { start: Point; end: Point; bounds: Rect },
  liveStart: Point,
  liveEnd: Point,
  scale: number,
): Point {
  const referenceMid = {
    x: (reference.start.x + reference.end.x) / 2,
    y: (reference.start.y + reference.end.y) / 2,
  };
  const referenceCenter = centerOf(reference.bounds);
  const offset = {
    x: referenceCenter.x - referenceMid.x,
    y: referenceCenter.y - referenceMid.y,
  };
  const referenceVector = {
    x: reference.end.x - reference.start.x,
    y: reference.end.y - reference.start.y,
  };
  const referenceLength = Math.max(1, Math.hypot(referenceVector.x, referenceVector.y));
  const referenceUnit = {
    x: referenceVector.x / referenceLength,
    y: referenceVector.y / referenceLength,
  };
  const liveVector = {
    x: liveEnd.x - liveStart.x,
    y: liveEnd.y - liveStart.y,
  };
  const liveLength = Math.max(1, Math.hypot(liveVector.x, liveVector.y));
  const liveUnit = { x: liveVector.x / liveLength, y: liveVector.y / liveLength };
  const liveNormal = { x: -liveUnit.y, y: liveUnit.x };
  const referenceNormal = {
    x: -referenceUnit.y,
    y: referenceUnit.x,
  };
  const parallel = offset.x * referenceUnit.x + offset.y * referenceUnit.y;
  const perpendicular =
    offset.x * referenceNormal.x + offset.y * referenceNormal.y;
  const chordScale = liveLength / referenceLength;

  return {
    x:
      liveStart.x +
      liveVector.x / 2 +
      liveUnit.x * parallel * chordScale +
      liveNormal.x * perpendicular * scale,
    y:
      liveStart.y +
      liveVector.y / 2 +
      liveUnit.y * parallel * chordScale +
      liveNormal.y * perpendicular * scale,
  };
}

function normalizePoint(value: Point, width: number, height: number) {
  return {
    x: clamp(value.x, -width, width * 2),
    y: clamp(value.y, -height, height * 2),
  };
}

function buildHero(
  layout: MeasuredLayout,
  previous: HeroModel | undefined,
): HeroModel {
  const from = getRect(layout, "hero.from");
  const concept = getRect(layout, "hero.concept");
  const launch = getRect(layout, "hero.launch");
  const o = getRect(layout, "hero.from.o");
  const c = getRect(layout, "hero.concept.c");
  const ch = getRect(layout, "hero.launch.ch");

  const key = [
    rectKey(from),
    rectKey(concept),
    rectKey(launch),
    rectKey(o),
    rectKey(c),
    rectKey(ch),
    rectKey(layout.hero),
    layout.width,
  ].join("|");

  if (previous && previous.key === key) return previous;

  const exact =
    Math.abs(layout.width - REFERENCE_WIDTH) < 0.1 &&
    Math.abs(layout.hero.height - REFERENCE_HERO_HEIGHT) < 0.1 &&
    nearRect(from, REFERENCE_HERO_RECTS.from) &&
    nearRect(concept, REFERENCE_HERO_RECTS.concept) &&
    nearRect(launch, REFERENCE_HERO_RECTS.launch) &&
    nearRect(o, REFERENCE_HERO_RECTS.o) &&
    nearRect(c, REFERENCE_HERO_RECTS.c) &&
    nearRect(ch, REFERENCE_HERO_RECTS.ch);

  let back: string[];
  let front: string[];
  let origin: Point;
  let handoff: Point;

  if (exact) {
    back = [...HERO_BACK];
    front = [...HERO_FRONT];
    origin = pathStart(back[0]);
    handoff = pathEnd(back[back.length - 1]);
  } else {
    origin = {
      x: from.left + 0.116 * from.width,
      y: from.top - 0.728 * from.height,
    };
    const oEntry = {
      x: o.left + 1.157 * o.width,
      y: o.top + 0.364 * o.height,
    };
    const oExit = {
      x: o.left + 0.984 * o.width,
      y: o.top + 0.591 * o.height,
    };
    const cEntry = {
      x: c.left + 1.026 * c.width,
      y: c.top + 0.285 * c.height,
    };
    const cMid = {
      x: c.left + 0.521 * c.width,
      y: c.top + 0.377 * c.height,
    };
    const cLower = {
      x: c.left + 0.038 * c.width,
      y: c.top + 0.674 * c.height,
    };
    const railY = launch.top + 0.0358 * launch.height;
    const railStart = {
      x: c.left + 0.608 * c.width,
      y: railY,
    };
    const railEnd = {
      x: ch.left + 0.272 * ch.width,
      y: railY,
    };
    const chLoopIn = {
      x: ch.left + 1.03 * ch.width,
      y: ch.top + 0.462 * ch.height,
    };
    const chLoopMid = {
      x: ch.left + 0.51 * ch.width,
      y: ch.top + 0.474 * ch.height,
    };
    const chDown = {
      x: ch.left + 0.767 * ch.width,
      y: ch.top + 0.833 * ch.height,
    };
    const squiggleTwo = {
      x: chDown.x - 0.1171 * ch.width,
      y: chDown.y + 0.3267 * ch.height,
    };
    handoff = {
      x: ch.left + 0.59 * ch.width,
      y: layout.hero.bottom - 20,
    };

    const oLoopCenter = {
      x: o.left + 1.14 * o.width,
      y: o.top + 0.4775 * o.height,
    };
    const cLoopCenter = {
      x: c.left + 0.532 * c.width,
      y: c.top + 0.586 * c.height,
    };
    const chLoopCenter = {
      x: ch.left + 0.6715 * ch.width,
      y: ch.top + 0.475 * ch.height,
    };

    const oScale = glyphScale(o, REFERENCE_HERO_RECTS.o);
    const cScale = glyphScale(c, REFERENCE_HERO_RECTS.c);
    const chScale = glyphScale(ch, REFERENCE_HERO_RECTS.ch);
    const oCScale = Math.min(oScale, cScale);
    const connector = (
      index: number,
      channelStart: Point,
      channelEnd: Point,
      scale: number,
    ) =>
      connectorCenter(
        HERO_REFERENCE[index],
        channelStart,
        channelEnd,
        Math.max(0.2, scale),
      );

    const channels: Array<{
      index: number;
      start: Point;
      end: Point;
      center: Point;
    }> = [
      {
        index: 0,
        start: origin,
        end: oEntry,
        center: connector(0, origin, oEntry, oScale),
      },
      {
        index: 1,
        start: oExit,
        end: cEntry,
        center: connector(1, oExit, cEntry, oCScale),
      },
      {
        index: 2,
        start: cMid,
        end: cLower,
        center: cLoopCenter,
      },
      {
        index: 3,
        start: railEnd,
        end: chLoopIn,
        center: connector(3, railEnd, chLoopIn, chScale),
      },
      {
        index: 4,
        start: chLoopMid,
        end: chDown,
        center: connector(4, chLoopMid, chDown, chScale),
      },
      {
        index: 5,
        start: chDown,
        end: squiggleTwo,
        center: connector(5, chDown, squiggleTwo, chScale),
      },
      {
        index: 6,
        start: squiggleTwo,
        end: handoff,
        center: connector(6, squiggleTwo, handoff, chScale),
      },
      {
        index: 7,
        start: oEntry,
        end: oExit,
        center: oLoopCenter,
      },
      {
        index: 8,
        start: cEntry,
        end: cMid,
        center: cLoopCenter,
      },
      {
        index: 9,
        start: cLower,
        end: railEnd,
        center: railStart,
      },
      {
        index: 10,
        start: chLoopIn,
        end: chLoopMid,
        center: chLoopCenter,
      },
    ];

    const loopChannels = new Set([2, 7, 8, 10]);

    const generated = channels.map(({ index, start, end, center }) => {
      const reference = HERO_REFERENCE[index];
      const matrix = loopChannels.has(index)
        ? similarityFrom2(
            [reference.start, reference.end],
            [start, end],
          )
        : affineFrom3(
            [reference.start, reference.end, centerOf(reference.bounds)],
            [start, end, normalizePoint(center, layout.width, layout.height)],
          );

      return applyAffine(reference.d, matrix);
    });

    back = generated.slice(0, 7);
    front = generated.slice(7);
  }

  const order: Array<{ array: "back" | "front"; index: number }> = [
    { array: "back", index: 0 },
    { array: "front", index: 0 },
    { array: "back", index: 1 },
    { array: "front", index: 1 },
    { array: "back", index: 2 },
    { array: "front", index: 2 },
    { array: "back", index: 3 },
    { array: "front", index: 3 },
    { array: "back", index: 4 },
    { array: "back", index: 5 },
    { array: "back", index: 6 },
  ];

  const read = (slot: (typeof order)[number]) =>
    slot.array === "back" ? back[slot.index] : front[slot.index];
  const assign = (slot: (typeof order)[number], value: string) => {
    if (slot.array === "back") {
      back[slot.index] = value;
    } else {
      front[slot.index] = value;
    }
  };

  for (let index = 1; index < order.length; index += 1) {
    const tangent = endpointTangent(read(order[index - 1]), "end");
    if (!tangent) continue;
    assign(order[index], alignStartTangent(read(order[index]), tangent));
  }

  back[back.length - 1] = alignEndTangent(back[back.length - 1], {
    x: 0,
    y: 1,
  });

  return {
    key,
    back,
    front,
    backPoints: back.map((d) => flattenPath(d, 10)),
    frontPoints: front.map((d) => flattenPath(d, 10)),
    origin,
    handoff,
  };
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
  hero: HeroModel,
  capsTop: number,
  previous: RouteModel | undefined,
): RouteModel {
  const drawing = getRect(layout, "work.drawing");
  const workExitX =
    drawing.left +
    ((REF_WORK.end.x - REF_WORK.drawing.left) / REF_WORK.drawing.width) *
      drawing.width;
  const end = { x: workExitX, y: capsTop };
  const key = [
    pointKey(hero.handoff),
    pointKey(end),
    rectKey(drawing),
    layout.width,
  ].join("|");

  const cached = reuseRoute(previous, key);
  if (cached) return cached;

  const start = hero.handoff;
  const warp = (value: Point): Point => {
    const refY = value.y;
    const drawingX =
      drawing.left +
      ((value.x - REF_WORK.drawing.left) / REF_WORK.drawing.width) *
        drawing.width;

    if (refY < REF_WORK.drawing.top) {
      const t = clamp(
        (refY - REF_WORK.start.y) /
          (REF_WORK.drawing.top - REF_WORK.start.y),
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
      (refY - REF_WORK.drawingBottom) / (REF_WORK.end.y - REF_WORK.drawingBottom),
      0,
      1,
    );
    return {
      x: drawingX + (end.x - drawingX) * t,
      y: drawing.bottom + (end.y - drawing.bottom) * t,
    };
  };

  const builder = new PathBuilder(warp(REF_WORK.start));
  const boundaries = [REF_WORK.drawing.top, REF_WORK.drawingBottom];
  let rawCurrent: Point = { ...REF_WORK.start };

  for (const command of parsePath(WORK_INDEX)) {
    if (command.command === "M") {
      rawCurrent = { x: command.values[0], y: command.values[1] };
      continue;
    }

    if (command.command === "L") {
      const next = { x: command.values[0], y: command.values[1] };
      builder.line(warp(next));
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
        builder.cubic(warp(part[1]), warp(part[2]), warp(part[3]));
      }
      rawCurrent = end;
      continue;
    }

    if (command.command === "Q") {
      const end = { x: command.values[2], y: command.values[3] };
      builder.quad(
        warp({ x: command.values[0], y: command.values[1] }),
        warp(end),
      );
      rawCurrent = end;
      continue;
    }

    const end = { x: command.values[5], y: command.values[6] };
    builder.arc(
      command.values[0],
      command.values[1],
      command.values[2],
      command.values[3] ? 1 : 0,
      command.values[4] ? 1 : 0,
      warp(end),
    );
    rawCurrent = end;
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
  const splitX = orbit.left + orbit.width / 2;
  const ringTop = orbit.top - 12;
  const ringBottom = orbit.bottom - 4;
  const ringRx = orbit.width / 2;
  const ringRy = (ringBottom - ringTop) / 2;

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

  const key = [
    pointKey(capsStart),
    rectKey(heading),
    rectKey(orbit),
    layout.width,
  ].join("|");

  const entryKey = `${key}|entry`;
  const productKey = `${key}|product`;
  const aiKey = `${key}|ai`;
  const exitKey = `${key}|exit`;

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

  const productD = `${moveCommand({ x: splitX, y: ringTop })} A ${ringRx} ${ringRy} 0 0 0 ${splitX} ${ringBottom}`;
  const aiD = `${moveCommand({ x: splitX, y: ringTop })} A ${ringRx} ${ringRy} 0 0 1 ${splitX} ${ringBottom}`;
  const exitD = `${moveCommand({ x: splitX, y: ringBottom })} ${lineCommand(
    { x: splitX, y: layout.capabilities.bottom },
  )}`;

  return {
    entry: routeFromPath(entryKey, entryBuilder.d, 8),
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

function reframeTemplate(
  template: Template,
  frame: Rect,
): string {
  const xScale = frame.width / REFERENCE_WIDTH;
  const yScale = frame.height / template.height;

  return transformPath(template.d, (value) => ({
    x: frame.left + value.x * xScale,
    y: frame.top + (value.y - template.top) * yScale,
  }));
}

function distanceToRect(value: Point, rect: Rect) {
  const dx = Math.max(rect.left - value.x, 0, value.x - rect.right);
  const dy = Math.max(rect.top - value.y, 0, value.y - rect.bottom);
  return Math.hypot(dx, dy);
}

function assertNodesOnPath(
  d: string,
  targets: Point[],
  tolerance = 0.75,
) {
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
    { command: "C" as const, values: parseCommandValues(link(splitPoint, messageCenter)) },
    { command: "C" as const, values: parseCommandValues(link(messageCenter, cubic[3])) },
    ...commands.slice(2),
  ];

  return serializePath(inserted);
}

function parseCommandValues(command: string) {
  const parsed = parsePath(command)[0];
  return parsed.command === "C" ? parsed.values : [];
}

function buildProjectTemplate(
  layout: MeasuredLayout,
  id: "norma" | "shopops" | "legalexy",
  template: Template,
  previous: RouteModel | undefined,
  previousEnd: Point,
): RouteModel {
  const frame = getRect(layout, `project.${id}`);
  const key = [
    pointKey(previousEnd),
    rectKey(frame),
    layout.width,
  ].join("|");
  const cached = reuseRoute(previous, key);
  if (cached) return cached;

  let d = reframeTemplate(template, frame);
  d = retargetStart(d, previousEnd);

  if (id === "shopops") {
    const message = getRect(layout, "project.shopops.message");
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
): RouteModel {
  const frame = getRect(layout, "project.kabri");
  const north = centerOf(getRect(layout, "project.kabri.door.north"));
  const east = centerOf(getRect(layout, "project.kabri.door.east"));
  const key = [
    pointKey(start),
    rectKey(frame),
    pointKey(north),
    pointKey(east),
    layout.width,
  ].join("|");
  const cached = reuseRoute(previous, key);
  if (cached) return cached;

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

  const suffixCommands = EIGNA_COMMANDS.slice(EIGNA_EAST_INDEX + 1);
  const suffix = serializePath([
    { command: "M", values: [EIGNA_EAST.x, EIGNA_EAST.y] },
    ...suffixCommands,
  ]);

  const xScale = frame.width / REFERENCE_WIDTH;
  const yScale = frame.height / PROJECT_TEMPLATES.eigna.height;
  const framePoint = (value: Point): Point => ({
    x: frame.left + value.x * xScale,
    y: frame.top + (value.y - PROJECT_TEMPLATES.eigna.top) * yScale,
  });
  const mappedEast = framePoint(EIGNA_EAST);
  const offset = {
    x: east.x - mappedEast.x,
    y: east.y - mappedEast.y,
  };
  const mappedSuffix = transformPath(suffix, (value) => {
    const mapped = framePoint(value);
    return { x: mapped.x + offset.x, y: mapped.y + offset.y };
  });
  const mappedEnd = pathEnd(mappedSuffix);
  const suffixWithBottom = retargetEnd(mappedSuffix, {
    x: mappedEnd.x,
    y: frame.bottom,
  });

  const d = `${prefix.d} ${suffixWithBottom}`;
  return routeFromPath(key, d, 10);
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
  ].join("|");
  const cached = reuseRoute(previous, key);
  if (cached) return cached;

  const wrapX = clamp(title.left - 4, 8, layout.width - 8);
  const topY = clamp(title.top - 96, start.y + 48, title.top - 24);
  let rTop = clamp(
    Math.min(32, 0.35 * (topY - start.y), 0.25 * (start.x - wrapX)),
    8,
    32,
  );
  if (start.x - wrapX < 2 * rTop + 24) {
    rTop = Math.max(8, (start.x - wrapX - 24) / 2);
  }

  const rBottom = clamp(Math.min(12, 0.3 * (title.left - 8)), 4, 12);
  const edge = 4;
  let uR = clamp(wrapX - rBottom - edge, 3, 12);
  let returnY = title.bottom + 2 * uR;
  let useHook = false;

  if (returnY > intro.top - 8) {
    const available = (intro.top - 8 - title.bottom) / 2;
    if (available >= 3) {
      uR = Math.min(uR, available);
      returnY = title.bottom + 2 * uR;
    } else {
      useHook = true;
      returnY = Math.max(title.bottom + 8, intro.top - 8);
    }
  }

  const descentX = clamp(
    Math.max(layout.width / 2, intro.right + 40),
    8,
    layout.width - 8,
  );
  const rCenter = clamp(
    Math.min(20, 0.4 * (nodes[0].y - returnY)),
    8,
    20,
  );

  const builder = new PathBuilder(start);
  builder
    .line({ x: start.x, y: topY - rTop })
    .arc(rTop, rTop, 0, 0, 1, { x: start.x - rTop, y: topY })
    .line({ x: wrapX + rTop, y: topY })
    .arc(rTop, rTop, 0, 0, 0, { x: wrapX, y: topY + rTop })
    .line({ x: wrapX, y: title.bottom - rBottom });

  if (useHook) {
    const hookY = Math.max(4, returnY - title.bottom);
    const hookX = Math.max(
      4,
      Math.min(24, wrapX - rBottom - edge, descentX - rCenter - wrapX - 8),
    );

    builder.cubic(
      { x: wrapX, y: title.bottom + 0.55 * hookY },
      { x: wrapX + 0.55 * hookX, y: returnY },
      { x: wrapX + hookX, y: returnY },
    );
  } else {
    builder.arc(rBottom, rBottom, 0, 0, 1, {
      x: wrapX - rBottom,
      y: title.bottom,
    });

    const availableRun = wrapX - rBottom - (edge + uR);
    const run = Math.min(24, Math.max(0, availableRun));
    const uStartX = Math.min(
      wrapX - rBottom,
      Math.max(edge + uR, wrapX - rBottom - run),
    );

    if (uStartX < wrapX - rBottom - 0.01) {
      builder.line({ x: uStartX, y: title.bottom });
    }

    builder.arc(uR, uR, 0, 0, 0, {
      x: uStartX,
      y: returnY,
    });
  }

  builder
    .line({ x: descentX - rCenter, y: returnY })
    .arc(rCenter, rCenter, 0, 0, 1, {
      x: descentX,
      y: returnY + rCenter,
    });

  const first = nodes[0];
  const descentY = Math.max(returnY + rCenter, intro.bottom + 24);
  const curveDy = first.y - descentY;

  if (descentY > returnY + rCenter + 0.01) {
    builder.line({ x: descentX, y: descentY });
  }

  if (curveDy > 0.01) {
    builder.cubic(
      { x: descentX, y: descentY + 0.55 * curveDy },
      { x: first.x, y: first.y - 0.55 * curveDy },
      first,
    );
  } else {
    builder.line(first);
  }

  const sides = copies.map((copy, index) =>
    (copy.left + copy.right) / 2 > nodes[index].x ? 1 : -1,
  );
  const alternating = sides.some((side) => side !== sides[0]);

  if (alternating) {
    nodes.forEach((node, index) => {
      const copy = copies[index];
      const next = index < nodes.length - 1 ? nodes[index + 1] : aboutStart;
      const gap = clamp(0.08 * copy.height, 12, 24);
      const underY = copy.bottom + gap;
      const minCorner = Math.min(8, gap);
      const corner = clamp(
        Math.min(
          20,
          gap,
          0.35 * Math.abs(next.x - node.x),
          0.35 * Math.max(0, underY - node.y),
        ),
        minCorner,
        20,
      );

      appendRoundedCorners(
        builder,
        [
          builder.current,
          { x: node.x, y: underY },
          { x: next.x, y: underY },
          next,
        ],
        (vertexIndex) =>
          vertexIndex === 1 || vertexIndex === 2 ? corner : 0,
      );
    });
  } else {
    const spineX = nodes[0].x;
    const last = nodes[nodes.length - 1];
    builder.line({ x: spineX, y: last.y });

    const lastCopy = copies[copies.length - 1];
    const gap = clamp(0.08 * lastCopy.height, 12, 24);
    const underY = lastCopy.bottom + gap;
    const dy = aboutStart.y - last.y;
    const dx = aboutStart.x - spineX;
    const room = aboutStart.y - underY;

    if (dy > 0.01 && Math.abs(dx) > 0.5 && room > 16) {
      const corner = clamp(
        Math.min(20, 0.35 * Math.abs(dx), 0.35 * room),
        8,
        20,
      );

      appendRoundedCorners(
        builder,
        [
          builder.current,
          { x: spineX, y: underY },
          { x: aboutStart.x, y: underY },
          aboutStart,
        ],
        (vertexIndex) =>
          vertexIndex === 1 || vertexIndex === 2 ? corner : 0,
      );
    } else if (dy > 0.01 && Math.abs(dx) > 0.5) {
      builder.cubic(
        { x: spineX, y: last.y + 0.55 * dy },
        { x: aboutStart.x, y: aboutStart.y - 0.55 * dy },
        aboutStart,
      );
    } else {
      builder.line(aboutStart);
    }
  }

  return routeFromPath(key, builder.d, 10);
}

function buildAbout(
  layout: MeasuredLayout,
  previous: AboutModel | undefined,
): AboutModel {
  const section = getRect(layout, "about.section");
  const profile = getRect(layout, "about.profile");
  const key = [
    rectKey(section),
    rectKey(profile),
    layout.width,
  ].join("|");
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

  if (free >= 200 && rawScale >= 0.42) {
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

  const d = transformPath(ABOUT_FINGERPRINT, map);
  return {
    ...routeFromPath(key, d, 6),
    rect: section,
  };
}

function buildContact(
  layout: MeasuredLayout,
  previous: RouteModel | undefined,
  start: Point,
): { route: RouteModel; terminal: Point } {
  const section = getRect(layout, "contact.section");
  const terminal = {
    x: section.right - layout.pagePad - 12,
    y: section.bottom - 30,
  };
  const key = [pointKey(start), pointKey(terminal), layout.pagePad].join("|");
  const cached = reuseRoute(previous, key);
  if (cached) return { route: cached, terminal };

  const dx = terminal.x - start.x;
  const dy = terminal.y - start.y;
  const length = Math.hypot(dx, dy);
  const unit = { x: dx / length, y: dy / length };
  const leadLength = clamp(0.12 * length, 60, 160);
  const leadEnd = {
    x: start.x + unit.x * leadLength,
    y: start.y + unit.y * leadLength,
  };
  const d = `${moveCommand(start)} ${cubicCommand(
    { x: start.x, y: start.y + 0.55 * leadLength },
    {
      x: leadEnd.x - unit.x * 0.35 * leadLength,
      y: leadEnd.y - unit.y * 0.35 * leadLength,
    },
    leadEnd,
  )} ${lineCommand(terminal)}`;
  return { route: routeFromPath(key, d, 10), terminal };
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
  const hero = buildHero(layout, previous?.hero);
  const work = buildWork(
    layout,
    hero,
    layout.capabilities.top,
    previous?.work,
  );
  const capabilities = buildCapabilities(layout, work, {
    entry: previous?.capsEntry,
    product: previous?.capsProduct,
    ai: previous?.capsAi,
    exit: previous?.capsExit,
  });

  const kabri = buildKabri(
    layout,
    previous?.projects.kabri,
    capabilities.exit.end,
  );
  const norma = buildProjectTemplate(
    layout,
    "norma",
    PROJECT_TEMPLATES.papertrail,
    previous?.projects.norma,
    kabri.end,
  );
  const shopops = buildProjectTemplate(
    layout,
    "shopops",
    PROJECT_TEMPLATES.mesa,
    previous?.projects.shopops,
    norma.end,
  );
  const legalexy = buildProjectTemplate(
    layout,
    "legalexy",
    PROJECT_TEMPLATES.creditflow,
    previous?.projects.legalexy,
    shopops.end,
  );

  const about = buildAbout(layout, previous?.about);
  const why = buildWhy(
    layout,
    previous?.why,
    legalexy.end,
    about.start,
  );

  const aboutStart = about.start;
  const contact = buildContact(layout, previous?.contact, about.end);

  const workAnchors = workDerivedAnchors(
    work.points,
    getRect(layout, "work.drawing"),
  );

  const capabilityMarkers: MarkerModel[] = [];
  const capabilityRadius = layout.width <= 700 ? 2.2 : layout.width <= 820 ? 2.6 : 3.2;
  const capabilityCore = layout.width <= 700 ? 0.9 : layout.width <= 820 ? 1.1 : 1.35;

  for (let index = 1; index <= 5; index += 1) {
    capabilityMarkers.push({
      id: `capabilities.product.${index}`,
      kind: "service",
      point: centerOf(getRect(layout, `capabilities.product.${index}`)),
      radius: capabilityRadius,
      core: capabilityCore,
    });
    capabilityMarkers.push({
      id: `capabilities.ai.${index}`,
      kind: "service",
      point: centerOf(getRect(layout, `capabilities.ai.${index}`)),
      radius: capabilityRadius,
      core: capabilityCore,
    });
  }

  const doorMarkers: MarkerModel[] = [
    {
      id: "project.kabri.door.north",
      kind: "door",
      point: centerOf(getRect(layout, "project.kabri.door.north")),
      radius: 4,
      core: 1.5,
    },
    {
      id: "project.kabri.door.east",
      kind: "door",
      point: centerOf(getRect(layout, "project.kabri.door.east")),
      radius: 4,
      core: 1.5,
    },
  ];

  const derived = new Map<string, Point>([
    ["thread.origin", hero.origin],
    ["hero.handoff", hero.handoff],
    ["work.bulb", workAnchors.bulb],
    ["work.wave.1", workAnchors.waves[0]],
    ["work.wave.2", workAnchors.waves[1]],
    ["work.wave.3", workAnchors.waves[2]],
    ["work.exit", work.end],
    ["capabilities.split.top", { x: capabilities.splitX, y: capabilities.ringTop }],
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
    ["project.kabri.exit", kabri.end],
    ["project.norma.exit", norma.end],
    ["project.shopops.exit", shopops.end],
    ["project.legalexy.exit", legalexy.end],
    ["why.exit", aboutStart],
    ["about.fingerprint", about.start],
    ["about.fingerprint.start", about.start],
    ["about.fingerprint.end", about.end],
    ["contact.terminal", contact.terminal],
    ["thread.terminal", contact.terminal],
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
    hero: hero.key,
    work: work.key,
    capabilities: capabilities.entry.key,
    kabri: kabri.key,
    norma: norma.key,
    shopops: shopops.key,
    legalexy: legalexy.key,
    why: why.key,
    about: about.key,
    contact: contact.route.key,
  };

  if (process.env.NODE_ENV !== "production") {
    const heroSequence = [
      hero.back[0],
      hero.front[0],
      hero.back[1],
      hero.front[1],
      hero.back[2],
      hero.front[2],
      hero.back[3],
      hero.front[3],
      hero.back[4],
      hero.back[5],
      hero.back[6],
    ];

    for (let index = 1; index < heroSequence.length; index += 1) {
      assertTangentContinuous(
        heroSequence[index - 1],
        heroSequence[index],
        `hero join ${index - 1} → ${index}`,
        2,
      );
    }

    assertTangentContinuous(hero.back[6], work.d, "hero → work", 2);
    assertPathSmooth(work.d, "work route", 1.5);
    assertVerticalEnd(work.d, "work → capabilities connector");
    assertTangentContinuous(
      work.d,
      capabilities.entry.d,
      "work → capabilities",
      2,
    );
    assertTangentContinuous(legalexy.d, why.d, "LEGALEXY → why-me", 2);
    assertTangentContinuous(why.d, about.d, "why-me → about", 2);
    assertTangentContinuous(
      about.d,
      contact.route.d,
      "about → contact",
      2,
    );
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

    assertDistance(hero.handoff, work.start, "hero → work");
    assertDistance(work.end, capabilities.entry.start, "work → capabilities");
    assertDistance(
      capabilities.exit.end,
      kabri.start,
      "capabilities → KABRI",
    );
    assertDistance(kabri.end, norma.start, "KABRI → NORMA");
    assertDistance(norma.end, shopops.start, "NORMA → SHOPOPS");
    assertDistance(shopops.end, legalexy.start, "SHOPOPS → LEGALEXY");
    assertDistance(legalexy.end, why.start, "LEGALEXY → why-me");
    assertDistance(why.end, about.start, "why-me → about");
    assertDistance(about.end, contact.route.start, "about → contact");
  }

  return {
    width: layout.width,
    height: layout.height,
    heroHeight: layout.hero.height,
    pagePad: layout.pagePad,
    hero,
    work,
    capsEntry: capabilities.entry,
    capsProduct: capabilities.product,
    capsAi: capabilities.ai,
    capsExit: capabilities.exit,
    projects: { kabri, norma, shopops, legalexy },
    why,
    about,
    contact: contact.route,
    pagePath,
    markers: [...capabilityMarkers, ...doorMarkers],
    terminal: contact.terminal,
    derived,
    keys,
  };
}

export function masterTrack(model: ThreadModel): Point[] {
  const heroOrder = [
    model.hero.backPoints[0],
    model.hero.frontPoints[0],
    model.hero.backPoints[1],
    model.hero.frontPoints[1],
    model.hero.backPoints[2],
    model.hero.frontPoints[2],
    model.hero.backPoints[3],
    model.hero.frontPoints[3],
    model.hero.backPoints[4],
    model.hero.backPoints[5],
    model.hero.backPoints[6],
  ];

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

  for (const segment of heroOrder) append(segment);
  append(model.work.points);
  append(model.capsEntry.points);
  append(model.capsProduct.points);
  append(model.capsExit.points);
  append(model.projects.kabri.points);
  append(model.projects.norma.points);
  append(model.projects.shopops.points);
  append(model.projects.legalexy.points);
  append(model.why.points);
  append(model.about.points);
  append(model.contact.points);

  return points;
}

export function labelForAnchor(id: string) {
  return ANCHOR_LABELS[id] ?? id;
}

export {
  CAPABILITIES_AI,
  CAPABILITIES_ENTRY,
  CAPABILITIES_EXIT,
  CAPABILITIES_PRODUCT,
  CONTACT_ROUTE,
  REFERENCE_WIDTH,
  cumulativeLengths,
  distance,
  pointAtLength,
};
