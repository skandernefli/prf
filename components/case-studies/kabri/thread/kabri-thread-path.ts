export type ThreadPoint = { x: number; y: number };

const round = (value: number) => Math.round(value * 100) / 100;
const format = (point: ThreadPoint) => `${round(point.x)} ${round(point.y)}`;

export function smoothThreadPath(
  points: ThreadPoint[],
  tension = 0.9,
): string {
  if (points.length < 2) return "";

  const commands = [`M ${format(points[0])}`];

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;

    const c1 = {
      x: p1.x + ((p2.x - p0.x) / 6) * tension,
      y: p1.y + ((p2.y - p0.y) / 6) * tension,
    };
    const c2 = {
      x: p2.x - ((p3.x - p1.x) / 6) * tension,
      y: p2.y - ((p3.y - p1.y) / 6) * tension,
    };

    commands.push(`C ${format(c1)} ${format(c2)} ${format(p2)}`);
  }

  return commands.join(" ");
}

export function measureThreadPoints(
  root: HTMLElement,
  route: readonly string[],
): { id: string; point: ThreadPoint }[] {
  const rootRect = root.getBoundingClientRect();

  return route.flatMap((id) => {
    const anchor = root.querySelector<HTMLElement>(
      `[data-thread-anchor="${id}"]`,
    );

    if (!anchor) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[kabri-thread] missing anchor "${id}"`);
      }
      return [];
    }

    const rect = anchor.getBoundingClientRect();
    return [
      {
        id,
        point: {
          x: rect.left + rect.width / 2 - rootRect.left,
          y: rect.top + rect.height / 2 - rootRect.top,
        },
      },
    ];
  });
}
