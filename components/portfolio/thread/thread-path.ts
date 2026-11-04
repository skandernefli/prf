export type Point = {
  x: number;
  y: number;
};

export type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type ParsedCommand = {
  command: "M" | "L" | "C" | "Q" | "A";
  values: number[];
};

export type AffineMatrix = {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
};

export type ClosestPoint = {
  point: Point;
  along: number;
  distance: number;
};

export const TAU = Math.PI * 2;
export const EPSILON = 1e-6;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y);

export const middle = (rect: Rect): Point => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

export const at = (rect: Rect, x: number, y: number): Point => ({
  x: rect.left + rect.width * x,
  y: rect.top + rect.height * y,
});

export const point = (x: number, y: number): Point => ({ x, y });

export const format = (value: number, precision = 3) => {
  if (!Number.isFinite(value)) {
    throw new Error(`Thread geometry produced a non-finite coordinate: ${value}`);
  }

  return Number(value.toFixed(precision)).toString();
};

export const formatPoint = (value: Point, precision = 3) =>
  `${format(value.x, precision)} ${format(value.y, precision)}`;

export const cubicCommand = (
  controlOne: Point,
  controlTwo: Point,
  to: Point,
  precision = 3,
) =>
  `C ${formatPoint(controlOne, precision)}, ${formatPoint(
    controlTwo,
    precision,
  )}, ${formatPoint(to, precision)}`;

export const quadCommand = (control: Point, to: Point, precision = 3) =>
  `Q ${formatPoint(control, precision)}, ${formatPoint(to, precision)}`;

export const moveCommand = (to: Point, precision = 3) =>
  `M ${formatPoint(to, precision)}`;

export const lineCommand = (to: Point, precision = 3) =>
  `L ${formatPoint(to, precision)}`;

export class PathBuilder {
  private parts: string[] = [];
  private currentPoint: Point;

  constructor(start: Point, private readonly precision = 3) {
    this.currentPoint = start;
    this.parts.push(moveCommand(start, precision));
  }

  get current(): Point {
    return this.currentPoint;
  }

  get end(): Point {
    return this.currentPoint;
  }

  line(to: Point) {
    this.parts.push(lineCommand(to, this.precision));
    this.currentPoint = to;
    return this;
  }

  cubic(controlOne: Point, controlTwo: Point, to: Point) {
    this.parts.push(cubicCommand(controlOne, controlTwo, to, this.precision));
    this.currentPoint = to;
    return this;
  }

  quad(control: Point, to: Point) {
    this.parts.push(quadCommand(control, to, this.precision));
    this.currentPoint = to;
    return this;
  }

  arc(
    rx: number,
    ry: number,
    rotation: number,
    largeArc: 0 | 1,
    sweep: 0 | 1,
    to: Point,
  ) {
    this.parts.push(
      `A ${format(rx, this.precision)} ${format(ry, this.precision)} ${format(
        rotation,
        this.precision,
      )} ${largeArc} ${sweep} ${formatPoint(to, this.precision)}`,
    );
    this.currentPoint = to;
    return this;
  }

  horizontal(x: number) {
    return this.line({ x, y: this.currentPoint.y });
  }

  vertical(y: number) {
    return this.line({ x: this.currentPoint.x, y });
  }

  get d() {
    return this.parts.join(" ");
  }
}

const numberPattern = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
const commandPattern = /([MLCQASHV])([^MLCQASHV]*)/gi;

const asPoint = (values: number[], index: number): Point => ({
  x: values[index],
  y: values[index + 1],
});

const pushPointValues = (target: number[], value: Point) => {
  target.push(value.x, value.y);
};

/**
 * Parses M/L/C/A/Q/S/H/V. S is expanded to C with the reflected previous
 * control point; H/V are expanded to L. All commands are absolute.
 */
export function parsePath(d: string): ParsedCommand[] {
  const commands: ParsedCommand[] = [];
  let current: Point = { x: 0, y: 0 };
  let previousCubicControl: Point | null = null;
  let match: RegExpExecArray | null;

  commandPattern.lastIndex = 0;

  while ((match = commandPattern.exec(d))) {
    const command = match[1].toUpperCase();
    const values = (match[2].match(numberPattern) ?? []).map(Number);

    if (values.some((value) => !Number.isFinite(value))) {
      throw new Error(`Thread route contained a non-finite value: ${match[0]}`);
    }

    if (command === "M") {
      if (values.length < 2) {
        throw new Error("Thread route contained an empty move command.");
      }

      current = asPoint(values, 0);
      commands.push({ command: "M", values: [current.x, current.y] });

      for (let index = 2; index + 1 < values.length; index += 2) {
        current = asPoint(values, index);
        commands.push({ command: "L", values: [current.x, current.y] });
      }

      previousCubicControl = null;
      continue;
    }

    if (command === "L") {
      for (let index = 0; index + 1 < values.length; index += 2) {
        current = asPoint(values, index);
        commands.push({ command: "L", values: [current.x, current.y] });
      }
      previousCubicControl = null;
      continue;
    }

    if (command === "H") {
      for (const x of values) {
        current = { x, y: current.y };
        commands.push({ command: "L", values: [current.x, current.y] });
      }
      previousCubicControl = null;
      continue;
    }

    if (command === "V") {
      for (const y of values) {
        current = { x: current.x, y };
        commands.push({ command: "L", values: [current.x, current.y] });
      }
      previousCubicControl = null;
      continue;
    }

    if (command === "C") {
      for (let index = 0; index + 5 < values.length; index += 6) {
        const controlOne = asPoint(values, index);
        const controlTwo = asPoint(values, index + 2);
        current = asPoint(values, index + 4);
        commands.push({
          command: "C",
          values: [
            controlOne.x,
            controlOne.y,
            controlTwo.x,
            controlTwo.y,
            current.x,
            current.y,
          ],
        });
        previousCubicControl = controlTwo;
      }
      continue;
    }

    if (command === "S") {
      for (let index = 0; index + 3 < values.length; index += 4) {
        const segmentStart = current;
        const controlTwo = asPoint(values, index);
        const end = asPoint(values, index + 2);
        const controlOne = previousCubicControl
          ? {
              x: 2 * segmentStart.x - previousCubicControl.x,
              y: 2 * segmentStart.y - previousCubicControl.y,
            }
          : segmentStart;

        commands.push({
          command: "C",
          values: [
            controlOne.x,
            controlOne.y,
            controlTwo.x,
            controlTwo.y,
            end.x,
            end.y,
          ],
        });
        current = end;
        previousCubicControl = controlTwo;
      }
      continue;
    }

    if (command === "Q") {
      for (let index = 0; index + 3 < values.length; index += 4) {
        const control = asPoint(values, index);
        current = asPoint(values, index + 2);
        commands.push({
          command: "Q",
          values: [control.x, control.y, current.x, current.y],
        });
      }
      previousCubicControl = null;
      continue;
    }

    if (command === "A") {
      for (let index = 0; index + 6 < values.length; index += 7) {
        current = { x: values[index + 5], y: values[index + 6] };
        commands.push({
          command: "A",
          values: [
            values[index],
            values[index + 1],
            values[index + 2],
            values[index + 3],
            values[index + 4],
            current.x,
            current.y,
          ],
        });
      }
      previousCubicControl = null;
    }
  }

  return commands;
}

export function serializePath(commands: ParsedCommand[], precision = 3) {
  return commands
    .map(({ command, values }) => {
      if (command === "A") {
        return `A ${format(values[0], precision)} ${format(
          values[1],
          precision,
        )} ${format(values[2], precision)} ${values[3]} ${values[4]} ${format(
          values[5],
          precision,
        )} ${format(values[6], precision)}`;
      }

      return `${command} ${values
        .map((value) => format(value, precision))
        .join(" ")}`;
    })
    .join(" ");
}

export function pathStart(d: string): Point {
  const first = parsePath(d)[0];
  if (!first || first.command !== "M") {
    throw new Error("Thread route must start with M.");
  }
  return { x: first.values[0], y: first.values[1] };
}

export function pathEnd(d: string): Point {
  const commands = parsePath(d);
  const last = commands[commands.length - 1];
  if (!last) {
    throw new Error("Thread route is empty.");
  }
  return {
    x: last.values[last.values.length - 2],
    y: last.values[last.values.length - 1],
  };
}

export function transformPath(
  d: string,
  transform: (value: Point) => Point,
): string {
  const commands = parsePath(d).map(({ command, values }) => {
    if (command === "A") {
      const nextPoint = transform({
        x: values[5],
        y: values[6],
      });
      return {
        command,
        values: [...values.slice(0, 5), nextPoint.x, nextPoint.y],
      };
    }

    if (command === "Q") {
      const control = transform({ x: values[0], y: values[1] });
      const end = transform({ x: values[2], y: values[3] });
      return {
        command,
        values: [control.x, control.y, end.x, end.y],
      };
    }

    const next: number[] = [];

    for (let index = 0; index < values.length; index += 2) {
      pushPointValues(
        next,
        transform({ x: values[index], y: values[index + 1] }),
      );
    }

    return { command, values: next };
  });

  return serializePath(commands);
}

export function applyAffine(d: string, matrix: AffineMatrix): string {
  const sx = Math.hypot(matrix.a, matrix.b);
  const sy = Math.hypot(matrix.c, matrix.d);
  const radiusScale = (sx + sy) / 2;

  const commands = parsePath(d).map(({ command, values }) => {
    if (command === "A") {
      const end = applyPoint(
        { x: values[5], y: values[6] },
        matrix,
      );
      return {
        command,
        values: [
          values[0] * radiusScale,
          values[1] * radiusScale,
          values[2],
          values[3],
          values[4],
          end.x,
          end.y,
        ],
      };
    }

    const next: number[] = [];

    for (let index = 0; index < values.length; index += 2) {
      pushPointValues(
        next,
        applyPoint({ x: values[index], y: values[index + 1] }, matrix),
      );
    }

    return { command, values: next };
  });

  return serializePath(commands);
}

export function applyPoint(value: Point, matrix: AffineMatrix): Point {
  return {
    x: matrix.a * value.x + matrix.c * value.y + matrix.e,
    y: matrix.b * value.x + matrix.d * value.y + matrix.f,
  };
}

function solveLinearSystem(rows: number[][]): number[] {
  const matrix = rows.map((row) => [...row]);

  for (let column = 0; column < 3; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < 3; row += 1) {
      if (Math.abs(matrix[row][column]) > Math.abs(matrix[pivot][column])) {
        pivot = row;
      }
    }

    if (Math.abs(matrix[pivot][column]) < EPSILON) {
      throw new Error("Thread affine reference points are collinear.");
    }

    [matrix[column], matrix[pivot]] = [matrix[pivot], matrix[column]];

    const divisor = matrix[column][column];
    for (let index = column; index < 4; index += 1) {
      matrix[column][index] /= divisor;
    }

    for (let row = 0; row < 3; row += 1) {
      if (row === column) continue;
      const factor = matrix[row][column];
      for (let index = column; index < 4; index += 1) {
        matrix[row][index] -= factor * matrix[column][index];
      }
    }
  }

  return [matrix[0][3], matrix[1][3], matrix[2][3]];
}

/**
 * Maps one reference segment onto a live segment with rotation and uniform
 * scale. Used for loop segments, where a third near-collinear center point
 * would make the affine ill-conditioned.
 */
export function similarityFrom2(
  reference: [Point, Point],
  live: [Point, Point],
): AffineMatrix {
  const [r0, r1] = reference;
  const [l0, l1] = live;
  const referenceVector = { x: r1.x - r0.x, y: r1.y - r0.y };
  const liveVector = { x: l1.x - l0.x, y: l1.y - l0.y };
  const referenceLength = Math.max(
    EPSILON,
    Math.hypot(referenceVector.x, referenceVector.y),
  );
  const liveLength = Math.max(
    EPSILON,
    Math.hypot(liveVector.x, liveVector.y),
  );
  const scale = liveLength / referenceLength;
  const cos =
    (referenceVector.x * liveVector.x +
      referenceVector.y * liveVector.y) /
    (referenceLength * liveLength);
  const sin =
    (referenceVector.x * liveVector.y -
      referenceVector.y * liveVector.x) /
    (referenceLength * liveLength);

  return {
    a: cos * scale,
    b: sin * scale,
    c: -sin * scale,
    d: cos * scale,
    e: l0.x - (cos * scale * r0.x - sin * scale * r0.y),
    f: l0.y - (sin * scale * r0.x + cos * scale * r0.y),
  };
}

/**
 * Solves x' = a*x + c*y + e, y' = b*x + d*y + f from three point pairs.
 */
export function affineFrom3(
  reference: [Point, Point, Point],
  live: [Point, Point, Point],
): AffineMatrix {
  const [r0, r1, r2] = reference;
  const [l0, l1, l2] = live;

  try {
    const x = solveLinearSystem([
      [r0.x, r0.y, 1, l0.x],
      [r1.x, r1.y, 1, l1.x],
      [r2.x, r2.y, 1, l2.x],
    ]);
    const y = solveLinearSystem([
      [r0.x, r0.y, 1, l0.y],
      [r1.x, r1.y, 1, l1.y],
      [r2.x, r2.y, 1, l2.y],
    ]);

    const matrix: AffineMatrix = {
      a: x[0],
      b: y[0],
      c: x[1],
      d: y[1],
      e: x[2],
      f: y[2],
    };

    // Nearly collinear control triangles can produce an affine that shears a
    // loop into a huge spike. Fall back to a similarity transform when the
    // solve is ill-conditioned or flips orientation.
    const scaleX = Math.hypot(matrix.a, matrix.b);
    const scaleY = Math.hypot(matrix.c, matrix.d);
    const determinant = matrix.a * matrix.d - matrix.b * matrix.c;
    const maxScale = Math.max(scaleX, scaleY);
    const minScale = Math.min(scaleX, scaleY);

    if (
      !Number.isFinite(determinant) ||
      determinant <= 0 ||
      !Number.isFinite(maxScale) ||
      !Number.isFinite(minScale) ||
      maxScale > 3 ||
      minScale < 0.08 ||
      maxScale / Math.max(EPSILON, minScale) > 8
    ) {
      throw new Error("Thread affine transform is ill-conditioned.");
    }

    return matrix;
  } catch {
    return similarityFrom2([r0, r1], [l0, l1]);
  }
}

export function retargetStart(d: string, target: Point) {
  const commands = parsePath(d);
  const first = commands[0];
  if (!first || first.command !== "M") {
    throw new Error("Thread route must start with M.");
  }

  const delta = {
    x: target.x - first.values[0],
    y: target.y - first.values[1],
  };
  first.values[0] = target.x;
  first.values[1] = target.y;

  const next = commands[1];
  if (next?.command === "C" && next.values.length >= 6) {
    next.values[0] += delta.x;
    next.values[1] += delta.y;
  } else if (next?.command === "Q" && next.values.length >= 4) {
    next.values[0] += delta.x;
    next.values[1] += delta.y;
  }

  return serializePath(commands);
}

export function retargetEnd(d: string, target: Point) {
  const commands = parsePath(d);
  const last = commands[commands.length - 1];
  if (!last) {
    throw new Error("Thread route is empty.");
  }

  const endIndex = last.values.length - 2;
  last.values[endIndex] = target.x;
  last.values[endIndex + 1] = target.y;

  if (last.command === "C" && last.values.length >= 6) {
    last.values[endIndex - 2] = target.x;
  } else if (last.command === "Q" && last.values.length >= 4) {
    last.values[0] = target.x;
  }

  return serializePath(commands);
}

export type Cubic = [Point, Point, Point, Point];

export function splitCubic(cubic: Cubic, t: number): [Cubic, Cubic] {
  const lerp = (a: Point, b: Point): Point => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });

  const [p0, p1, p2, p3] = cubic;
  const p01 = lerp(p0, p1);
  const p12 = lerp(p1, p2);
  const p23 = lerp(p2, p3);
  const p012 = lerp(p01, p12);
  const p123 = lerp(p12, p23);
  const p0123 = lerp(p012, p123);

  return [
    [p0, p01, p012, p0123],
    [p0123, p123, p23, p3],
  ];
}

function cubicAt(cubic: Cubic, t: number): Point {
  const [p0, p1, p2, p3] = cubic;
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

function quadAt(
  start: Point,
  control: Point,
  end: Point,
  t: number,
): Point {
  const mt = 1 - t;
  return {
    x: mt * mt * start.x + 2 * mt * t * control.x + t * t * end.x,
    y: mt * mt * start.y + 2 * mt * t * control.y + t * t * end.y,
  };
}

function controlPolygonLength(cubic: Cubic) {
  const [p0, p1, p2, p3] = cubic;
  return distance(p0, p1) + distance(p1, p2) + distance(p2, p3);
}

type ArcCentre = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  thetaStart: number;
  thetaDelta: number;
};

function arcFromCommand(
  start: Point,
  command: ParsedCommand,
): ArcCentre | null {
  let rx = Math.abs(command.values[0]);
  let ry = Math.abs(command.values[1]);
  const rotation = (command.values[2] * Math.PI) / 180;
  const largeArc = command.values[3] !== 0;
  const sweep = command.values[4] !== 0;
  const end = { x: command.values[5], y: command.values[6] };

  if (rx < EPSILON || ry < EPSILON || distance(start, end) < EPSILON) {
    return null;
  }

  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const dx = (start.x - end.x) / 2;
  const dy = (start.y - end.y) / 2;
  const x1p = cos * dx + sin * dy;
  const y1p = -sin * dx + cos * dy;

  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    const scale = Math.sqrt(lambda);
    rx *= scale;
    ry *= scale;
  }

  const numerator = Math.max(
    0,
    rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p,
  );
  const denominator = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const coefficient =
    (largeArc === sweep ? -1 : 1) *
    Math.sqrt(numerator / Math.max(EPSILON, denominator));
  const cxp = (coefficient * rx * y1p) / ry;
  const cyp = (-coefficient * ry * x1p) / rx;
  const cx = cos * cxp - sin * cyp + (start.x + end.x) / 2;
  const cy = sin * cxp + cos * cyp + (start.y + end.y) / 2;

  const vectorOne = {
    x: (x1p - cxp) / rx,
    y: (y1p - cyp) / ry,
  };
  const vectorTwo = {
    x: (-x1p - cxp) / rx,
    y: (-y1p - cyp) / ry,
  };

  const thetaStart = Math.atan2(vectorOne.y, vectorOne.x);
  let thetaDelta =
    Math.atan2(
      vectorOne.x * vectorTwo.y - vectorOne.y * vectorTwo.x,
      vectorOne.x * vectorTwo.x + vectorOne.y * vectorTwo.y,
    ) || 0;

  if (!sweep && thetaDelta > 0) thetaDelta -= TAU;
  if (sweep && thetaDelta < 0) thetaDelta += TAU;

  return { cx, cy, rx, ry, thetaStart, thetaDelta };
}

function appendPoint(points: Point[], value: Point) {
  const last = points[points.length - 1];
  if (
    !last ||
    Math.abs(last.x - value.x) > EPSILON ||
    Math.abs(last.y - value.y) > EPSILON
  ) {
    points.push(value);
  }
}

export function flattenPath(
  d: string,
  stepPx = 10,
  minSegments = 2,
): Point[] {
  const commands = parsePath(d);
  const points: Point[] = [];
  let current: Point = { x: 0, y: 0 };

  for (const command of commands) {
    if (command.command === "M") {
      current = { x: command.values[0], y: command.values[1] };
      points.push(current);
      continue;
    }

    if (command.command === "L") {
      current = { x: command.values[0], y: command.values[1] };
      appendPoint(points, current);
      continue;
    }

    if (command.command === "Q") {
      const control = { x: command.values[0], y: command.values[1] };
      const end = { x: command.values[2], y: command.values[3] };
      const length =
        distance(current, control) + distance(control, end);
      const segments = clamp(
        Math.ceil(length / Math.max(1, stepPx)),
        minSegments,
        128,
      );

      for (let index = 1; index <= segments; index += 1) {
        appendPoint(points, quadAt(current, control, end, index / segments));
      }
      current = end;
      continue;
    }

    if (command.command === "C") {
      const cubic: Cubic = [
        current,
        { x: command.values[0], y: command.values[1] },
        { x: command.values[2], y: command.values[3] },
        { x: command.values[4], y: command.values[5] },
      ];
      const segments = clamp(
        Math.ceil(controlPolygonLength(cubic) / Math.max(1, stepPx)),
        minSegments,
        256,
      );

      for (let index = 1; index <= segments; index += 1) {
        appendPoint(points, cubicAt(cubic, index / segments));
      }
      current = cubic[3];
      continue;
    }

    const arc = arcFromCommand(current, command);
    const end = { x: command.values[5], y: command.values[6] };

    if (!arc) {
      current = end;
      appendPoint(points, current);
      continue;
    }

    const rotation = (command.values[2] * Math.PI) / 180;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const arcLength =
      Math.abs(arc.thetaDelta) * Math.max(arc.rx, arc.ry);
    const segments = clamp(
      Math.ceil(arcLength / Math.max(1, stepPx)),
      minSegments,
      512,
    );

    for (let index = 1; index <= segments; index += 1) {
      const theta = arc.thetaStart + arc.thetaDelta * (index / segments);
      const x = arc.cx + cos * arc.rx * Math.cos(theta) - sin * arc.ry * Math.sin(theta);
      const y = arc.cy + sin * arc.rx * Math.cos(theta) + cos * arc.ry * Math.sin(theta);
      appendPoint(points, { x, y });
    }

    current = end;
  }

  return points;
}

export function pathBounds(d: string, stepPx = 6): Rect {
  const points = flattenPath(d, stepPx);
  if (points.length === 0) {
    return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
  }

  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const value of points) {
    left = Math.min(left, value.x);
    top = Math.min(top, value.y);
    right = Math.max(right, value.x);
    bottom = Math.max(bottom, value.y);
  }

  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}

export function polylineLength(points: Point[]) {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += distance(points[index - 1], points[index]);
  }
  return total;
}

export function cumulativeLengths(points: Point[]) {
  const cumulative = new Array<number>(points.length);
  cumulative[0] = 0;

  for (let index = 1; index < points.length; index += 1) {
    cumulative[index] =
      cumulative[index - 1] + distance(points[index - 1], points[index]);
  }

  return cumulative;
}

export function pointAtLength(
  points: Point[],
  cumulative: number[],
  length: number,
): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];

  const total = cumulative[cumulative.length - 1];
  const target = clamp(length, 0, total);

  let low = 0;
  let high = cumulative.length - 1;

  while (low < high - 1) {
    const middleIndex = Math.floor((low + high) / 2);
    if (cumulative[middleIndex] <= target) {
      low = middleIndex;
    } else {
      high = middleIndex;
    }
  }

  const segmentLength = cumulative[high] - cumulative[low];
  const t =
    segmentLength <= EPSILON ? 0 : (target - cumulative[low]) / segmentLength;

  return {
    x: points[low].x + (points[high].x - points[low].x) * t,
    y: points[low].y + (points[high].y - points[low].y) * t,
  };
}

export function closestPointOnPolyline(
  points: Point[],
  cumulative: number[],
  target: Point,
): ClosestPoint {
  if (points.length === 0) {
    return { point: target, along: 0, distance: Infinity };
  }

  let best: ClosestPoint = {
    point: points[0],
    along: 0,
    distance: distance(points[0], target),
  };

  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;
    const t =
      lengthSquared <= EPSILON
        ? 0
        : clamp(
            ((target.x - start.x) * dx + (target.y - start.y) * dy) /
              lengthSquared,
            0,
            1,
          );
    const value = {
      x: start.x + dx * t,
      y: start.y + dy * t,
    };
    const currentDistance = distance(value, target);

    if (currentDistance < best.distance) {
      best = {
        point: value,
        along: cumulative[index - 1] + Math.sqrt(lengthSquared) * t,
        distance: currentDistance,
      };
    }
  }

  return best;
}

export function pathLength(d: string, stepPx = 10) {
  return polylineLength(flattenPath(d, stepPx));
}

export function assertDistance(
  a: Point,
  b: Point,
  description: string,
  tolerance = 0.5,
) {
  if (process.env.NODE_ENV === "production") return;
  const delta = distance(a, b);
  if (delta > tolerance) {
    throw new Error(
      `Thread continuity failed (${description}): ${delta.toFixed(2)}px`,
    );
  }
}

const CIRCLE_K = 0.5522847498;

function normalizeVector(value: Point): Point | null {
  const length = Math.hypot(value.x, value.y);
  if (length < EPSILON) return null;
  return { x: value.x / length, y: value.y / length };
}

function commandEndPoint(command: ParsedCommand, start: Point): Point {
  if (command.command === "L") {
    return { x: command.values[0], y: command.values[1] };
  }

  if (command.command === "C") {
    return { x: command.values[4], y: command.values[5] };
  }

  if (command.command === "Q") {
    return { x: command.values[2], y: command.values[3] };
  }

  if (command.command === "A") {
    return { x: command.values[5], y: command.values[6] };
  }

  return start;
}

function commandTangent(
  command: ParsedCommand,
  start: Point,
  end: "start" | "end",
): Point | null {
  if (command.command === "L") {
    return normalizeVector({
      x: command.values[0] - start.x,
      y: command.values[1] - start.y,
    });
  }

  if (command.command === "C") {
    if (end === "start") {
      return normalizeVector({
        x: command.values[0] - start.x,
        y: command.values[1] - start.y,
      });
    }

    const point = { x: command.values[4], y: command.values[5] };
    return normalizeVector({
      x: point.x - command.values[2],
      y: point.y - command.values[3],
    });
  }

  if (command.command === "Q") {
    if (end === "start") {
      return normalizeVector({
        x: command.values[0] - start.x,
        y: command.values[1] - start.y,
      });
    }

    const point = { x: command.values[2], y: command.values[3] };
    return normalizeVector({
      x: point.x - command.values[0],
      y: point.y - command.values[1],
    });
  }

  if (command.command === "A") {
    const arc = arcFromCommand(start, command);
    if (!arc) {
      return normalizeVector({
        x: command.values[5] - start.x,
        y: command.values[6] - start.y,
      });
    }

    const theta =
      end === "start" ? arc.thetaStart : arc.thetaStart + arc.thetaDelta;
    const rotation = (command.values[2] * Math.PI) / 180;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const derivative = {
      x: -cos * arc.rx * Math.sin(theta) - sin * arc.ry * Math.cos(theta),
      y: -sin * arc.rx * Math.sin(theta) + cos * arc.ry * Math.cos(theta),
    };
    const direction = arc.thetaDelta >= 0 ? 1 : -1;

    return normalizeVector({
      x: derivative.x * direction,
      y: derivative.y * direction,
    });
  }

  return null;
}

/**
 * Returns the unit tangent at the start or end of a path. Arcs use the true
 * ellipse tangent; S is already expanded to C by parsePath.
 */
export function endpointTangent(
  d: string,
  end: "start" | "end",
): Point | null {
  const commands = parsePath(d);
  if (commands.length < 2 || commands[0].command !== "M") return null;

  if (end === "start") {
    return commandTangent(
      commands[1],
      { x: commands[0].values[0], y: commands[0].values[1] },
      "start",
    );
  }

  let current = { x: commands[0].values[0], y: commands[0].values[1] };
  for (let index = 1; index < commands.length - 1; index += 1) {
    current = commandEndPoint(commands[index], current);
  }

  const last = commands[commands.length - 1];
  if (last.command === "M") return null;
  return commandTangent(last, current, "end");
}

/**
 * Rotates the first control handle so the path starts in the requested
 * direction. Only cubics and quadratics are adjusted; lines and arcs are
 * returned unchanged.
 */
export function alignStartTangent(d: string, tangent: Point): string {
  const commands = parsePath(d);
  if (commands.length < 2 || commands[0].command !== "M") return d;

  const direction = normalizeVector(tangent);
  if (!direction) return d;

  const start = { x: commands[0].values[0], y: commands[0].values[1] };
  const command = commands[1];

  if (command.command === "C") {
    const control = { x: command.values[0], y: command.values[1] };
    const length = distance(start, control);
    if (length < EPSILON) return d;
    command.values[0] = start.x + direction.x * length;
    command.values[1] = start.y + direction.y * length;
    return serializePath(commands, 6);
  }

  if (command.command === "Q") {
    const control = { x: command.values[0], y: command.values[1] };
    const length = distance(start, control);
    if (length < EPSILON) return d;
    command.values[0] = start.x + direction.x * length;
    command.values[1] = start.y + direction.y * length;
    return serializePath(commands, 6);
  }

  return d;
}

/**
 * Rotates the last control handle so the path ends in the requested direction.
 * Only cubics and quadratics are adjusted; lines and arcs are returned
 * unchanged.
 */
export function alignEndTangent(d: string, tangent: Point): string {
  const commands = parsePath(d);
  if (commands.length < 2 || commands[0].command !== "M") return d;

  const direction = normalizeVector(tangent);
  if (!direction) return d;

  let current = { x: commands[0].values[0], y: commands[0].values[1] };
  for (let index = 1; index < commands.length - 1; index += 1) {
    current = commandEndPoint(commands[index], current);
  }

  const last = commands[commands.length - 1];

  if (last.command === "C") {
    const point = { x: last.values[4], y: last.values[5] };
    const control = { x: last.values[2], y: last.values[3] };
    const length = distance(point, control);
    if (length < EPSILON) return d;
    last.values[2] = point.x - direction.x * length;
    last.values[3] = point.y - direction.y * length;
    return serializePath(commands, 6);
  }

  if (last.command === "Q") {
    const point = { x: last.values[2], y: last.values[3] };
    const control = { x: last.values[0], y: last.values[1] };
    const length = distance(point, control);
    if (length < EPSILON) return d;
    last.values[0] = point.x - direction.x * length;
    last.values[1] = point.y - direction.y * length;
    return serializePath(commands, 6);
  }

  return d;
}

export function assertTangentContinuous(
  previousD: string,
  nextD: string,
  description: string,
  maxAngleDeg = 2,
) {
  if (process.env.NODE_ENV === "production") return;

  const previous = endpointTangent(previousD, "end");
  const next = endpointTangent(nextD, "start");
  if (!previous || !next) return;

  const dot = clamp(previous.x * next.x + previous.y * next.y, -1, 1);
  const angle = (Math.acos(dot) * 180) / Math.PI;

  if (angle > maxAngleDeg) {
    throw new Error(
      `Thread tangent failed (${description}): ${angle.toFixed(2)}°`,
    );
  }
}

export function assertPathSmooth(
  d: string,
  description: string,
  maxAngleDeg = 1.5,
) {
  if (process.env.NODE_ENV === "production") return;

  const commands = parsePath(d);
  if (commands.length < 2 || commands[0].command !== "M") return;

  let current = { x: commands[0].values[0], y: commands[0].values[1] };
  let previousEnd: Point | null = null;

  for (let index = 1; index < commands.length; index += 1) {
    const command = commands[index];
    const startTangent = commandTangent(command, current, "start");

    if (previousEnd && startTangent) {
      const dot = clamp(
        previousEnd.x * startTangent.x + previousEnd.y * startTangent.y,
        -1,
        1,
      );
      const angle = (Math.acos(dot) * 180) / Math.PI;

      if (angle > maxAngleDeg) {
        throw new Error(
          `Thread path is not smooth (${description}) at command ${index}: ${angle.toFixed(2)}°`,
        );
      }
    }

    previousEnd = commandTangent(command, current, "end");
    current = commandEndPoint(command, current);
  }
}

export function assertVerticalEnd(d: string, description: string) {
  if (process.env.NODE_ENV === "production") return;

  const commands = parsePath(d);
  if (commands.length < 2 || commands[0].command !== "M") return;

  let current = { x: commands[0].values[0], y: commands[0].values[1] };
  for (let index = 1; index < commands.length - 1; index += 1) {
    current = commandEndPoint(commands[index], current);
  }

  const last = commands[commands.length - 1];
  const end = commandEndPoint(last, current);
  const dx = Math.abs(end.x - current.x);

  if (dx > 0.01) {
    throw new Error(
      `Thread vertical failed (${description}): dx ${dx.toFixed(3)}px`,
    );
  }
}

/**
 * Rotates the first control handle of every cubic/quadratic command so its
 * start tangent matches the previous command's end tangent. Endpoints and
 * handle lengths are preserved. Lines and arcs are left untouched.
 */
export function smoothPathJoins(d: string): string {
  const commands = parsePath(d);
  if (commands.length < 3 || commands[0].command !== "M") return d;

  let current = { x: commands[0].values[0], y: commands[0].values[1] };
  let previousTangent: Point | null = null;

  for (let index = 1; index < commands.length; index += 1) {
    const command = commands[index];

    if (previousTangent) {
      if (command.command === "C") {
        const control = { x: command.values[0], y: command.values[1] };
        const length = distance(current, control);
        if (length > EPSILON) {
          command.values[0] = current.x + previousTangent.x * length;
          command.values[1] = current.y + previousTangent.y * length;
        }
      } else if (command.command === "Q") {
        const control = { x: command.values[0], y: command.values[1] };
        const length = distance(current, control);
        if (length > EPSILON) {
          command.values[0] = current.x + previousTangent.x * length;
          command.values[1] = current.y + previousTangent.y * length;
        }
      }
    }

    previousTangent = commandTangent(command, current, "end");
    current = commandEndPoint(command, current);
  }

  return serializePath(commands, 6);
}

/**
 * Appends straight runs and C1 cubic fillets through a vertex list. The
 * builder is assumed to be at vertices[0] (or a line is added to it).
 */
export function appendRoundedCorners(
  builder: PathBuilder,
  vertices: Point[],
  radiusAt: (index: number) => number,
) {
  if (vertices.length === 0) return;

  const first = vertices[0];
  if (distance(builder.current, first) > EPSILON) {
    builder.line(first);
  }

  for (let index = 1; index < vertices.length - 1; index += 1) {
    const previous = vertices[index - 1];
    const vertex = vertices[index];
    const next = vertices[index + 1];
    const inLength = distance(previous, vertex);
    const outLength = distance(vertex, next);

    if (inLength < EPSILON || outLength < EPSILON) {
      builder.line(vertex);
      continue;
    }

    const dIn = {
      x: (vertex.x - previous.x) / inLength,
      y: (vertex.y - previous.y) / inLength,
    };
    const dOut = {
      x: (next.x - vertex.x) / outLength,
      y: (next.y - vertex.y) / outLength,
    };
    const cross = dIn.x * dOut.y - dIn.y * dOut.x;
    const dot = dIn.x * dOut.x + dIn.y * dOut.y;

    if (Math.abs(cross) < 1e-6 && dot > 0) {
      builder.line(vertex);
      continue;
    }

    const radius = Math.min(
      Math.max(0, radiusAt(index)),
      inLength / 2,
      outLength / 2,
    );

    if (radius < 0.01) {
      builder.line(vertex);
      continue;
    }

    const k = radius * CIRCLE_K;
    const filletStart = {
      x: vertex.x - dIn.x * radius,
      y: vertex.y - dIn.y * radius,
    };
    const filletEnd = {
      x: vertex.x + dOut.x * radius,
      y: vertex.y + dOut.y * radius,
    };

    builder.line(filletStart).cubic(
      {
        x: filletStart.x + dIn.x * k,
        y: filletStart.y + dIn.y * k,
      },
      {
        x: filletEnd.x - dOut.x * k,
        y: filletEnd.y - dOut.y * k,
      },
      filletEnd,
    );
  }

  const last = vertices[vertices.length - 1];
  if (distance(builder.current, last) > EPSILON) {
    builder.line(last);
  }
}
