import {
  parsePath,
  serializePath,
  splitCubic,
  type Cubic,
  type ParsedCommand,
  type Point,
} from "./thread-path";

/**
 * Moves the junction between two consecutive pieces of the thread along the
 * thread, without changing its shape.
 *
 * Hero pieces alternate between the layer behind the letters and the layer in
 * front of them. The switch is only invisible when it happens in free space;
 * a junction that lands inside a glyph makes the thread pop in or out in the
 * middle of the letter. Moving the junction changes which layer owns the
 * stretch in between, and nothing else: the union of the two paths is
 * identical, and the two pieces still meet at one shared point.
 *
 *   delta < 0  the junction moves back towards the start of `a`
 *   delta > 0  the junction moves forward into `b`
 *
 * `delta` is an arc length in the same units as the path.
 */

const SAMPLES = 48;

const lerp = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

function cubicPoint([p0, p1, p2, p3]: Cubic, t: number): Point {
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

/** Cumulative arc length at SAMPLES + 1 parameter values of one cubic. */
function cubicTable(cubic: Cubic): number[] {
  const table = [0];
  let previous = cubic[0];
  for (let i = 1; i <= SAMPLES; i += 1) {
    const point = cubicPoint(cubic, i / SAMPLES);
    table.push(
      table[i - 1] + Math.hypot(point.x - previous.x, point.y - previous.y),
    );
    previous = point;
  }
  return table;
}

const asPoint = (values: number[], offset: number): Point => ({
  x: values[offset],
  y: values[offset + 1],
});

function endOf(command: ParsedCommand): Point {
  const { command: type, values } = command;
  if (type === "M" || type === "L") return asPoint(values, 0);
  if (type === "C") return asPoint(values, 4);
  throw new Error(`Thread junction: unsupported command "${type}".`);
}

function commandLength(from: Point, command: ParsedCommand): number {
  if (command.command === "L") {
    const to = asPoint(command.values, 0);
    return Math.hypot(to.x - from.x, to.y - from.y);
  }
  if (command.command === "C") {
    const cubic: Cubic = [
      from,
      asPoint(command.values, 0),
      asPoint(command.values, 2),
      asPoint(command.values, 4),
    ];
    const table = cubicTable(cubic);
    return table[table.length - 1];
  }
  throw new Error(`Thread junction: unsupported command "${command.command}".`);
}

export function pathArcLength(commands: ParsedCommand[]): number {
  let current = endOf(commands[0]);
  let total = 0;
  for (const command of commands.slice(1)) {
    total += commandLength(current, command);
    current = endOf(command);
  }
  return total;
}

/**
 * Splits at an arc length. `head` starts with the original M and ends at the
 * split point; `tail` starts with an M at the split point.
 */
export function splitAtLength(
  commands: ParsedCommand[],
  target: number,
): { head: ParsedCommand[]; tail: ParsedCommand[] } {
  let current = endOf(commands[0]);
  let travelled = 0;

  for (let index = 1; index < commands.length; index += 1) {
    const command = commands[index];
    const length = commandLength(current, command);

    if (travelled + length >= target || index === commands.length - 1) {
      const local = Math.min(length, Math.max(0, target - travelled));

      if (command.command === "L") {
        const to = asPoint(command.values, 0);
        const point = lerp(current, to, length > 0 ? local / length : 0);
        return {
          head: [
            ...commands.slice(0, index),
            { command: "L", values: [point.x, point.y] },
          ],
          tail: [
            { command: "M", values: [point.x, point.y] },
            command,
            ...commands.slice(index + 1),
          ],
        };
      }

      const cubic: Cubic = [
        current,
        asPoint(command.values, 0),
        asPoint(command.values, 2),
        asPoint(command.values, 4),
      ];
      const table = cubicTable(cubic);
      let step = 1;
      while (step < table.length - 1 && table[step] < local) step += 1;
      const span = table[step] - table[step - 1];
      const t =
        (step - 1 + (span > 0 ? (local - table[step - 1]) / span : 0)) /
        SAMPLES;
      const [first, second] = splitCubic(cubic, Math.min(1, Math.max(0, t)));
      const flat = (c: Cubic) => [
        c[1].x,
        c[1].y,
        c[2].x,
        c[2].y,
        c[3].x,
        c[3].y,
      ];

      return {
        head: [
          ...commands.slice(0, index),
          { command: "C", values: flat(first) },
        ],
        tail: [
          { command: "M", values: [second[0].x, second[0].y] },
          { command: "C", values: flat(second) },
          ...commands.slice(index + 1),
        ],
      };
    }

    travelled += length;
    current = endOf(command);
  }

  return { head: commands, tail: [commands[commands.length - 1]] };
}

export function moveJunction(
  a: string,
  b: string,
  delta: number,
): [string, string] {
  if (delta === 0) return [a, b];

  const aCommands = parsePath(a);
  const bCommands = parsePath(b);

  if (delta < 0) {
    const total = pathArcLength(aCommands);
    const cut = Math.max(total * 0.05, total - Math.min(-delta, total * 0.9));
    const { head, tail } = splitAtLength(aCommands, cut);
    return [
      serializePath(head),
      serializePath([...tail, ...bCommands.slice(1)]),
    ];
  }

  const total = pathArcLength(bCommands);
  const cut = Math.min(delta, total * 0.9);
  const { head, tail } = splitAtLength(bCommands, cut);
  return [serializePath([...aCommands, ...head.slice(1)]), serializePath(tail)];
}
