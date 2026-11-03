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

export type ThreadMarker = {
  kind: "junction" | "row" | "terminal";
  x: number;
  y: number;
  radius: number;
  core?: number;
};

export type ThreadRoute = {
  id: string;
  d: string;
  start: Point;
  end: Point;
  clip?: "about";
};

export type PathCommand = {
  command: "M" | "C" | "L" | "A";
  values: number[];
};

export const TAU = Math.PI * 2;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const middle = (rect: Rect): Point => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

export const at = (rect: Rect, x: number, y: number): Point => ({
  x: rect.left + rect.width * x,
  y: rect.top + rect.height * y,
});

export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y);

export const point = (x: number, y: number): Point => ({ x, y });

export const format = (value: number) => {
  if (!Number.isFinite(value)) {
    throw new Error(`Thread geometry produced a non-finite coordinate: ${value}`);
  }

  return Number(value.toFixed(2)).toString();
};

export const formatPoint = (value: Point) =>
  `${format(value.x)} ${format(value.y)}`;

export const cubicCommand = (controlOne: Point, controlTwo: Point, to: Point) =>
  `C ${formatPoint(controlOne)}, ${formatPoint(controlTwo)}, ${formatPoint(to)}`;

export const quadCommand = (control: Point, to: Point) =>
  `Q ${formatPoint(control)}, ${formatPoint(to)}`;

export const moveCommand = (to: Point) => `M ${formatPoint(to)}`;

export const lineCommand = (to: Point) => `L ${formatPoint(to)}`;

export class PathBuilder {
  private parts: string[] = [];
  private current: Point;

  constructor(start: Point) {
    this.current = start;
    this.parts.push(moveCommand(start));
  }

  get end(): Point {
    return this.current;
  }

  line(to: Point) {
    this.parts.push(lineCommand(to));
    this.current = to;
    return this;
  }

  cubic(controlOne: Point, controlTwo: Point, to: Point) {
    this.parts.push(cubicCommand(controlOne, controlTwo, to));
    this.current = to;
    return this;
  }

  quad(control: Point, to: Point) {
    this.parts.push(quadCommand(control, to));
    this.current = to;
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
      `A ${format(rx)} ${format(ry)} ${format(rotation)} ${largeArc} ${sweep} ${formatPoint(to)}`,
    );
    this.current = to;
    return this;
  }

  horizontal(x: number) {
    return this.line({ x, y: this.current.y });
  }

  vertical(y: number) {
    return this.line({ x: this.current.x, y });
  }

  get d() {
    return this.parts.join(" ");
  }
}

const numberPattern = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;

export function parsePath(d: string): PathCommand[] {
  const commands: PathCommand[] = [];
  const commandPattern = /([MCLA])([^MCLA]*)/gi;
  let match: RegExpExecArray | null;

  while ((match = commandPattern.exec(d))) {
    const values = (match[2].match(numberPattern) ?? []).map(Number);
    if (values.some((value) => !Number.isFinite(value))) {
      throw new Error(`Thread route contained a non-finite value: ${match[0]}`);
    }
    commands.push({ command: match[1].toUpperCase() as PathCommand["command"], values });
  }

  return commands;
}

export function serializePath(commands: PathCommand[]) {
  return commands
    .map(({ command, values }) => `${command} ${values.map(format).join(" ")}`)
    .join(" ");
}

export function transformPath(
  d: string,
  transform: (value: Point) => Point,
): string {
  const commands = parsePath(d).map(({ command, values }) => {
    if (command === "A") {
      const nextPoint = transform({
        x: values[values.length - 2],
        y: values[values.length - 1],
      });
      return {
        command,
        values: [
          ...values.slice(0, values.length - 2),
          nextPoint.x,
          nextPoint.y,
        ],
      };
    }

    const next: number[] = [];

    for (let index = 0; index < values.length; index += 2) {
      const nextPoint = transform({ x: values[index], y: values[index + 1] });
      next.push(nextPoint.x, nextPoint.y);
    }

    return { command, values: next };
  });

  return serializePath(commands);
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
  if (last.command === "C" && last.values.length >= 6) {
    // Keep the arrival tangent vertical, matching the shared section junctions.
    last.values[endIndex - 2] = target.x;
  }
  last.values[endIndex] = target.x;
  last.values[endIndex + 1] = target.y;

  return serializePath(commands);
}

export type ProjectTemplate = {
  desktop: { d: string; top: number; height: number };
  mobile: { d: string; top: number; height: number };
};

export const projectTemplates = {
  eigna: {
    desktop: {
      top: 3243.96875,
      height: 1024.703125,
      d: "M 719.9921875 3243.96875 C 719.9921875 3322.2820398185486 338.0748387096774 3296.1776098790324 338.0748387096774 3374.4908996975805 C 338.0748387096774 3415.4612222782257 338.0748387096774 3455.456060987903 338.0748387096774 3496.4263835685483 C 338.0748387096774 3509.356260343221 348.55657483823074 3519.837996471774 361.4864516129032 3519.837996471774 C 418.06451612903226 3519.837996471774 618.0387096774194 3521.7889642137097 676.5677419354839 3521.7889642137097 C 705.832258064516 3521.7889642137097 763.2 3479.65046875 792 3500.14453125 C 820.8 3520.63859375 1002.0064864864866 3517.411524493243 1074.0064864864864 3537.905586993243 C 1146.0064864864864 3558.3996494932435 1200.492972972973 3558.3996494932435 1272.492972972973 3537.905586993243 C 1344.492972972973 3517.411524493243 1425.6 3653.85 1267.2 3705.08515625 C 1108.8 3756.3203125 158.4 3858.790625 158.4 4012.49609375 C 158.4 4166.2015625 547.2 4104.719375 676.8 4063.73125 C 806.4 4022.743125 892.8 4032.99015625 993.6 4073.97828125 C 1094.4 4114.96640625 720 4176.44859375 720 4268.671875",
    },
    mobile: {
      top: 2882.90625,
      height: 1211.765625,
      d: "M 262.5 2882.90625 C 262.5 2918.5817708333334 344.25 2954.257291666667 344.25 2989.9328125 C 344.25 3081.7469758064517 279.08165322580646 3081.7469758064517 225.76209677419354 3081.7469758064517 C 188.63709677419354 3081.7469758064517 158.26209677419354 3103.3469758064516 158.26209677419354 3129.7469758064517 C 158.26209677419354 3151.8477822580644 158.26209677419354 3173.422379032258 158.26209677419354 3195.523185483871 C 158.26209677419354 3212.3618951612902 162.47177419354838 3230.779233870968 162.47177419354838 3247.6179435483873 C 162.47177419354838 3262.8780241935483 162.47177419354838 3278.1381048387098 162.47177419354838 3293.398185483871 C 162.47177419354838 3343.914314516129 76.875 3397.2274194335937 84.375 3421.4627319335937 C 91.875 3445.6980444335936 180.62837837837836 3371.891376689189 199.37837837837836 3396.126689189189 C 218.12837837837836 3420.362001689189 284.0067567567568 3420.362001689189 302.7567567567568 3396.126689189189 C 321.5067567567568 3371.891376689189 363 3464.61671875 363 3476.734375 C 363 3485.8541666666665, 363 3494.9739583333335, 363 3504.09375 L 363 3575.44140625 C 363 3623.4796875, 317.775 3623.4796875, 212.25 3623.4796875 C 106.72500000000001 3623.4796875, 12 3653.595638559996, 12 3690.745546875 C 12 3721.140926405458, 26.26430412300983 3717.316313308873, 61.50000000000001 3745.78125 C 91.5 3770.0165625 149.99998474121094 3869.9678125 187.49998474121094 3894.203125 C 224.99998474121094 3918.4384375 274.07916931152346 3883.1797265625 311.57916931152346 3907.4150390625 C 319.07916931152346 3912.2621015625, 187.49998474121094 3927.23291015625, 187.49998474121094 3960.2626953125 C 187.49998474121094 4007.305908203125, 270 4047.628662109375, 270 4094.671875",
    },
  },
  papertrail: {
    desktop: {
      top: 6318.078125,
      height: 1024.703125,
      d: "M 835.2 6318.078125 C 835.2 6400.054375 331.2 6359.06625 331.2 6441.0425 C 331.2 6523.01875 691.2 6564.006875 691.2 6727.959375 C 691.2 6809.935625 115.2 6850.92375 115.2 6963.64109375 C 115.2 7055.864375 489.6 7066.11140625 691.2 7035.3703125 C 792 7019.999765625 864 7014.87625 864 7086.60546875 C 864 7219.816875 345.6 7189.07578125 345.6 7342.78125",
    },
    mobile: {
      top: 6287.046875,
      height: 1096.1875,
      d: "M 277.5 6287.046875 C 322.03125 6342.075260416666 337.5 6413.958333333333 285 6451.703125 C 232.5 6489.447916666667, 93.75 6527.192708333333, 93.75 6564.9375 C 93.75 6597.823125 236.25 6597.823125 236.25 6681.674375 C 236.25 6802.255 26.25 6736.48375 26.25 6846.1025 C 26.25 6922.835625 108.75 6933.7975 165 6922.835625 C 266.25 6903.10425 307.5 6977.645 307.5 7087.26375 C 307.5 7142.073125 226.875 7298.9503125 221.25 7383.234375",
    },
  },
  mesa: {
    desktop: {
      top: 5293.375,
      height: 1024.703125,
      d: "M 763.2 5293.375 C 763.2 5344.61015625 820.8 5365.10421875 820.8 5447.08046875 C 820.8 5529.05671875 518.4 5467.57453125 518.4 5549.55078125 C 518.4 5641.7740625 806.4 5631.52703125 950.4 5631.52703125 C 1094.4 5631.52703125 1267.2 5652.02109375 1180.8 5733.99734375 C 1094.4 5815.97359375 489.6 5785.2325 489.6 5856.96171875 C 489.6 5979.92609375 576 6061.90234375 748.8 6061.90234375 C 921.6 6061.90234375 1152 5949.1849999999995 1152 6051.6553125 C 1152 6154.125625 633.6 6061.90234375 633.6 6174.6196875000005 C 633.6 6287.33703125 835.2 6246.34890625 835.2 6318.078125",
    },
    mobile: {
      top: 5190.859375,
      height: 1096.1875,
      d: "M 319.25 5190.859375 C 319.25 5269.78984375, 274.575 5359.99609375, 274.575 5416.375 C 274.575 5452.333333333333, 161.25 5488.291666666667, 161.25 5524.25 C 161.25 5554.048958333334, 206.25 5583.847916666667, 206.25 5613.646875 C 206.25 5671.912565104167, 170.6683984375 5730.178255208333, 170.6683984375 5788.4439453125 C 170.6683984375 5853.879296874999, 283.12499237060547 5919.3146484375, 283.12499237060547 5984.75 C 283.12499237060547 6038.914583333333, 159.375 6093.079166666666, 159.375 6147.24375 C 159.375 6193.844791666666 232.96875 6232.018489583334 277.5 6287.046875",
    },
  },
  creditflow: {
    desktop: {
      top: 8367.484375,
      height: 1024.703125,
      d: "M 878.4 8367.484375 C 878.4 8449.460625 230.4 8428.9665625 230.4 8531.436875 C 230.4 8541.68390625 236.88 8550.70129375 248.54399999999998 8558.7964484375 C 295.2 8591.1770671875 424.79999999999995 8608.801960937499 554.4 8631.345429687499 C 716.4 8659.524765625 878.4 8695.389374999999 878.4 8777.365625 C 878.4 8849.504725 555.0105599999999 8881.96732 477.3970944 8951.567123679999 C 466.81344 8961.058006 460.8 8971.23945625 460.8 8982.30625 C 460.8 9037.64021875 652.608 8982.30625 837.1584 8960.1726625 C 960.192 8945.4169375 1080 8945.4169375 1137.6 9002.8003125 C 1281.6 9146.25875 1036.8 9146.25875 1036.8 9197.49390625 C 1036.8 9207.7409375 1065.6 9207.7409375 1065.6 9228.235 C 1065.6 9269.223125 878.4 9330.7053125 878.4 9392.1875",
    },
    mobile: {
      top: 8489.484375,
      height: 1096.1875,
      d: "M 285 8489.484375 C 335.26875 8527.756901041666 326.25 8564.451041666667 326.25 8601.934375 C 326.25 8627.837708333334, 300.2 8653.741041666666, 300.2 8679.644375 C 300.2 8721.757708333333, 114.3 8763.871041666667, 114.3 8805.984375 C 114.3 8814.151041666666, 236.25 8822.317708333334, 262.5 8830.484375 C 288.75 8838.651041666666, 337.5 8892.484375, 337.5 8954.484375 C 337.5 8990.951041666667, 286.3 9027.417708333332, 286.3 9063.884375 C 286.3 9122.877708333333, 174.79999999999998 9181.871041666665, 174.79999999999998 9240.864375 C 174.79999999999998 9288.254374999999, 270.11333333333334 9347.735819444444, 300 9383.034375 C 329.88666666666666 9418.332930555554, 294.3466666666667 9429.448597222221, 285 9460.884375 C 275.6533333333333 9492.320152777778, 292.5 9544.076041666667, 292.5 9585.671875",
    },
  },
} satisfies Record<string, ProjectTemplate>;

export const workTemplate = {
  top: 879.9199829101562,
  bottom: 1800,
  d: "M 1046.5218505859375 879.9199829101562 C 1046.5218505859375 925, 1046.521875 925, 1046.521875 1019.76 C 1046.521875 1144.944 1059.001875 1244.784 1059.001875 1344.624 C 1059.001875 1384.56 1096.441875 1384.56 1096.441875 1344.624 C 1096.441875 1284.72 1215.001875 1264.752 1215.001875 1174.896 C 1215.001875 1090.032 1140.121875 1035.12 1046.521875 1035.12 C 952.921875 1035.12 878.041875 1090.032 878.041875 1174.896 C 878.041875 1264.752 996.6018750000001 1284.72 996.6018750000001 1344.624 L 996.6018750000001 1436.784 C 996.6018750000001 1452.144 1015.801875 1459.824 1035.001875 1459.824 L 1132.921875 1459.824 C 1171.321875 1459.824 1171.321875 1513.5839999999998 1132.921875 1513.5839999999998 L 993.721875 1513.5839999999998 C 955.321875 1513.5839999999998 955.321875 1567.344 993.721875 1567.344 L 1132.921875 1567.344 C 1171.321875 1567.344 1171.321875 1621.104 1132.921875 1621.104 L 1051.321875 1621.104 C 1003.321875 1621.104 1003.321875 1676.4 1003.321875 1734 L 1003.321875 1800",
};

export const mobileCapabilitiesTemplates = {
  entry: {
    top: 1763.5625,
    d: "M 363 1763.5625 C 363 1795.5625, 363 1827.5625, 363 1922.90625 C 363 1970.90625, 307.5 1979.90625, 262.5 1952.90625 C 217.5 1925.90625, 187.5 1925.90625, 187.5 1970.90625 L 187.5 2034.90625",
  },
  product: {
    d: "M 187.5 2034.90625 C 151.821875 2056.41025, 136.53125 2056.41025, 136.53125 2096.34625 L 136.53125 2741.46625 C 136.53125 2781.40225, 151.821875 2781.40225, 187.5 2802.90625",
  },
  ai: {
    d: "M 187.5 2034.90625 C 223.178125 2056.41025, 238.46875 2056.41025, 238.46875 2096.34625 L 238.46875 2741.46625 C 238.46875 2781.40225, 223.178125 2781.40225, 187.5 2802.90625",
  },
  exit: {
    d: "M 187.5 2802.90625 C 187.5 2826.90625, 262.5 2826.90625, 262.5 2882.90625",
  },
};

export type ReframeOptions = {
  width: number;
  height: number;
  top: number;
  referenceWidth: number;
  referenceTop: number;
  referenceHeight: number;
  left?: number;
};

export function reframeProjectPath(d: string, options: ReframeOptions) {
  const xScale = options.width / options.referenceWidth;
  const yScale = options.height / options.referenceHeight;

  return transformPath(d, (value) => ({
    x: (options.left ?? 0) + value.x * xScale,
    y: options.top + (value.y - options.referenceTop) * yScale,
  }));
}

export function buildProjectRoute(
  id: string,
  template: { d: string; top: number; height: number },
  frame: { width: number; top: number; height: number },
  options: {
    referenceWidth: number;
    connectorFrom?: Point;
    start?: Point;
    end?: Point;
  },
): ThreadRoute {
  let d = reframeProjectPath(template.d, {
    width: frame.width,
    height: frame.height,
    top: frame.top,
    referenceWidth: options.referenceWidth,
    referenceTop: template.top,
    referenceHeight: template.height,
  });

  if (options.start) {
    d = retargetStart(d, options.start);
  }
  if (options.end) {
    d = retargetEnd(d, options.end);
  }

  const baseStart = options.start ?? pathStart(d);
  const start = options.connectorFrom ?? baseStart;
  if (options.connectorFrom) {
    d = `${moveCommand(start)} ${lineCommand(baseStart)} ${d}`;
  }

  return {
    id,
    d,
    start,
    end: options.end ?? pathEnd(d),
  };
}

export function assertContinuous(
  previous: ThreadRoute | null,
  next: ThreadRoute,
  tolerance = 0.5,
) {
  if (process.env.NODE_ENV === "production" || !previous) return;
  const delta = distance(previous.end, next.start);
  if (delta > tolerance) {
    throw new Error(
      `Thread route continuity failed between "${previous.id}" and "${next.id}": ${delta.toFixed(2)}px`,
    );
  }
}

export function assertInside(
  route: ThreadRoute,
  width: number,
  height: number,
  tolerance = 0.75,
) {
  if (process.env.NODE_ENV === "production") return;

  for (const [commandIndex, command] of parsePath(route.d).entries()) {
    if (command.command === "A") {
      const x = command.values[5];
      const y = command.values[6];
      if (
        x < -tolerance ||
        x > width + tolerance ||
        y < -tolerance ||
        y > height + tolerance
      ) {
        throw new Error(
          `Thread route "${route.id}" produced an out-of-bounds point (${x}, ${y}) at command ${commandIndex}.`,
        );
      }
      continue;
    }

    for (let index = 0; index < command.values.length; index += 2) {
      const x = command.values[index];
      const y = command.values[index + 1];
      if (
        x < -tolerance ||
        x > width + tolerance ||
        y < -tolerance ||
        y > height + tolerance
      ) {
        const commands = parsePath(route.d);
        throw new Error(
          `Thread route "${route.id}" produced an out-of-bounds point (${x}, ${y}) at command ${commandIndex}, point ${index / 2} of ${commands.length}: ${JSON.stringify(commands.slice(Math.max(0, commandIndex - 2), commandIndex + 2))}`,
        );
      }
    }
  }
}

type Axis = "left" | "right";

export type CapabilityGeometry = {
  split: Point;
  merge: Point;
  rowMarkers: ThreadMarker[];
};

export function capabilityRowMarkers(
  centerX: number,
  splitY: number,
  mergeY: number,
  radiusX: number,
  itemCenters: number[],
  mobile: boolean,
  mobileLeftX: number,
  mobileRightX: number,
): ThreadMarker[] {
  const centerY = (splitY + mergeY) / 2;
  const radiusY = (mergeY - splitY) / 2;

  return itemCenters.map((y, index) => {
    const side: Axis = index < 5 ? "left" : "right";

    if (mobile) {
      return {
        kind: "row",
        x: side === "left" ? mobileLeftX : mobileRightX,
        y,
        radius: 6.5,
      };
    }

    const ratio = clamp((y - centerY) / radiusY, -1, 1);
    const offset = radiusX * Math.sqrt(1 - ratio * ratio);

    return {
      kind: "row",
      x: side === "left" ? centerX - offset : centerX + offset,
      y,
      radius: 6.5,
    };
  });
}

export type FingerprintOptions = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  ridges: number;
  rotation?: number;
  seamAngle?: number;
  gap?: number;
  terminal?: Point;
};

type RidgeSample = {
  point: Point;
  tangent: Point;
};

const normalize = (value: Point): Point => {
  const length = Math.hypot(value.x, value.y) || 1;
  return { x: value.x / length, y: value.y / length };
};

export function buildFingerprint(options: FingerprintOptions) {
  const {
    cx,
    cy,
    rx,
    ry,
    ridges,
    rotation = -0.105,
    seamAngle = 1.22,
    gap = 0.62,
  } = options;
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);

  const ridgePoint = (angle: number, factor: number): Point => {
    const wobble =
      1 + 0.032 * Math.sin(3 * angle + 0.9) + 0.018 * Math.cos(5 * angle - 0.4);
    const widthScale = 1 - 0.075 * Math.sin(angle);
    const localX =
      Math.cos(angle) * rx * factor * wobble * widthScale +
      Math.sin(angle) * ry * factor * 0.04;
    const localY = Math.sin(angle) * ry * factor * wobble;

    return {
      x: cx + localX * cosine - localY * sine,
      y: cy + localX * sine + localY * cosine,
    };
  };

  const sample = (angle: number, factor: number, direction: number): RidgeSample => {
    const epsilon = 0.0025;
    const before = ridgePoint(angle - epsilon, factor);
    const after = ridgePoint(angle + epsilon, factor);
    const tangent = normalize({
      x: (after.x - before.x) * direction,
      y: (after.y - before.y) * direction,
    });

    return { point: ridgePoint(angle, factor), tangent };
  };

  const startFactor = (index: number) =>
    ridges <= 1 ? 1 : 1 - 0.72 * (index / (ridges - 1));

  const builder = new PathBuilder(ridgePoint(-Math.PI / 2, startFactor(0)));
  let previousEnd: Point | null = null;

  for (let ridge = 0; ridge < ridges; ridge += 1) {
    const factor = startFactor(ridge);
    const direction = ridge === 0 || ridge % 2 === 0 ? 1 : -1;
    let start: number;
    let sweep: number;

    if (ridge === 0) {
      start = -Math.PI / 2;
      sweep = seamAngle - gap / 2 - start;
    } else if (direction === 1) {
      start = seamAngle + gap / 2;
      sweep = TAU - gap;
    } else {
      start = seamAngle - gap / 2;
      sweep = -(TAU - gap);
    }

    const first = sample(start, factor, direction);
    if (previousEnd) {
      builder.cubic(
        {
          x: previousEnd.x + (first.point.x - previousEnd.x) * 0.35,
          y: previousEnd.y + (first.point.y - previousEnd.y) * 0.35,
        },
        {
          x: first.point.x - first.tangent.x * 3,
          y: first.point.y - first.tangent.y * 3,
        },
        first.point,
      );
    }

    const steps = Math.max(24, Math.round((Math.abs(sweep) / TAU) * 42));
    let previous = first;

    for (let step = 1; step <= steps; step += 1) {
      const angle = start + (sweep * step) / steps;
      const next = sample(angle, factor, direction);
      const span = Math.abs(sweep / steps);
      builder.cubic(
        {
          x: previous.point.x + previous.tangent.x * (span / 3),
          y: previous.point.y + previous.tangent.y * (span / 3),
        },
        {
          x: next.point.x - next.tangent.x * (span / 3),
          y: next.point.y - next.tangent.y * (span / 3),
        },
        next.point,
      );
      previous = next;
    }

    previousEnd = previous.point;
  }

  const terminal =
    options.terminal ?? {
      x: cx + rx * 0.58,
      y: cy + ry * 0.9,
    };

  if (previousEnd) {
    builder.cubic(
      {
        x: previousEnd.x + (terminal.x - previousEnd.x) * 0.32,
        y: previousEnd.y + (terminal.y - previousEnd.y) * 0.14,
      },
      {
        x: terminal.x - (terminal.x - previousEnd.x) * 0.18,
        y: terminal.y - (terminal.y - previousEnd.y) * 0.34,
      },
      terminal,
    );
  }

  return {
    d: builder.d,
    start: ridgePoint(-Math.PI / 2, startFactor(0)),
    end: terminal,
    terminal,
  };
}

export type TangleLoop = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotation?: number;
  sweep?: number;
};

export type TangleOptions = {
  rect: Rect;
  entry: Point;
  entryTangent: Point;
  loops: TangleLoop[];
};

type LoopSample = RidgeSample;

const ellipseSample = (
  center: Point,
  rx: number,
  ry: number,
  rotation: number,
  angle: number,
  direction: number,
): LoopSample => {
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);
  const localX = Math.cos(angle) * rx;
  const localY = Math.sin(angle) * ry;
  const tangentLocal = { x: -Math.sin(angle) * rx, y: Math.cos(angle) * ry };
  const tangentRotated = {
    x: tangentLocal.x * cosine - tangentLocal.y * sine,
    y: tangentLocal.x * sine + tangentLocal.y * cosine,
  };

  return {
    point: {
      x: center.x + localX * cosine - localY * sine,
      y: center.y + localX * sine + localY * cosine,
    },
    tangent: normalize({
      x: tangentRotated.x * direction,
      y: tangentRotated.y * direction,
    }),
  };
};

const nearestAngle = (
  value: Point,
  center: Point,
  rx: number,
  ry: number,
  rotation: number,
) => {
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);
  const dx = value.x - center.x;
  const dy = value.y - center.y;
  const localX = dx * cosine + dy * sine;
  const localY = -dx * sine + dy * cosine;
  return Math.atan2(localY / Math.max(ry, 1), localX / Math.max(rx, 1));
};

export function buildTangle(options: TangleOptions) {
  const builder = new PathBuilder(options.entry);
  let current = options.entry;
  let tangent = normalize(options.entryTangent);

  for (const loop of options.loops) {
    const center = { x: options.rect.left + options.rect.width * loop.cx, y: options.rect.top + options.rect.height * loop.cy };
    const rx = options.rect.width * loop.rx;
    const ry = options.rect.height * loop.ry;
    const rotation = loop.rotation ?? 0;
    const direction = (loop.sweep ?? TAU) >= 0 ? 1 : -1;
    const sweep = (loop.sweep ?? TAU) * direction;
    const startAngle = nearestAngle(current, center, rx, ry, rotation);
    const first = ellipseSample(center, rx, ry, rotation, startAngle, direction);
    const connectorDistance = Math.max(1, distance(current, first.point));
    const handle = Math.min(connectorDistance * 0.36, 90);

    builder.cubic(
      {
        x: current.x + tangent.x * handle,
        y: current.y + tangent.y * handle,
      },
      {
        x: first.point.x - first.tangent.x * handle,
        y: first.point.y - first.tangent.y * handle,
      },
      first.point,
    );

    const steps = 52;
    let previous = first;

    for (let step = 1; step <= steps; step += 1) {
      const angle = startAngle + (sweep * step) / steps;
      const next = ellipseSample(center, rx, ry, rotation, angle, direction);
      const span = Math.abs(sweep / steps);
      builder.cubic(
        {
          x: previous.point.x + previous.tangent.x * (span / 3),
          y: previous.point.y + previous.tangent.y * (span / 3),
        },
        {
          x: next.point.x - next.tangent.x * (span / 3),
          y: next.point.y - next.tangent.y * (span / 3),
        },
        next.point,
      );
      previous = next;
    }

    current = previous.point;
    tangent = previous.tangent;
  }

  return {
    d: builder.d,
    start: options.entry,
    end: current,
    endTangent: tangent,
  };
}

export function appendPath(builder: PathBuilder, d: string) {
  const commands = parsePath(d);

  for (const [index, command] of commands.entries()) {
    if (index === 0 && command.command === "M") continue;

    if (command.command === "L") {
      builder.line({ x: command.values[0], y: command.values[1] });
      continue;
    }

    if (command.command === "A") {
      builder.arc(
        command.values[0],
        command.values[1],
        command.values[2],
        command.values[3] as 0 | 1,
        command.values[4] as 0 | 1,
        {
          x: command.values[5],
          y: command.values[6],
        },
      );
      continue;
    }

    for (let valueIndex = 0; valueIndex < command.values.length; valueIndex += 6) {
      builder.cubic(
        {
          x: command.values[valueIndex],
          y: command.values[valueIndex + 1],
        },
        {
          x: command.values[valueIndex + 2],
          y: command.values[valueIndex + 3],
        },
        {
          x: command.values[valueIndex + 4],
          y: command.values[valueIndex + 5],
        },
      );
    }
  }

  return builder;
}

export function tailCommand(
  end: Point,
  endTangent: Point,
  points: Point[],
  handle = 120,
  exitHandle = handle,
) {
  let d = "";
  let current = end;
  let tangent = endTangent;

  for (const [index, next] of points.entries()) {
    const span = distance(current, next);
    const limit = index === 0 ? exitHandle : handle;
    const control = Math.min(Math.max(span * 0.35, 12), limit);
    const nextTangent = normalize({
      x: next.x - current.x,
      y: next.y - current.y,
    });
    const startTangent = index === 0 ? tangent : nextTangent;
    d += `${d ? " " : ""}${cubicCommand(
      {
        x: current.x + startTangent.x * control,
        y: current.y + startTangent.y * control,
      },
      {
        x: next.x - nextTangent.x * control * 0.65,
        y: next.y - nextTangent.y * control * 0.65,
      },
      next,
    )}`;
    current = next;
    tangent = nextTangent;
  }

  return d;
}

export function segmentPath(
  id: string,
  start: Point,
  build: (builder: PathBuilder) => void,
  clip?: "about",
): ThreadRoute {
  const builder = new PathBuilder(start);
  build(builder);
  return { id, d: builder.d, start, end: builder.end, clip };
}
