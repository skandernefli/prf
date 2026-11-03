"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import {
  cubicCommand,
  lineCommand,
  moveCommand,
  type Point,
  type Rect,
} from "./thread-geometry";

type HeroRing = {
  x: number;
  y: number;
  radius: number;
  core: number;
};

type HeroGeometry = {
  width: number;
  height: number;
  origin: Point;
  back: string[];
  front: string[];
  rings: HeroRing[];
};

const format = (value: number) => Number(value.toFixed(2)).toString();

function anchorRect(hero: HTMLElement, heroRect: DOMRect, anchor: string): Rect {
  const element = hero.querySelector<HTMLElement>(
    `[data-thread-anchor="${anchor}"]`,
  );
  if (!element) {
    throw new Error(`Hero thread requires the "${anchor}" anchor.`);
  }

  const rect = element.getBoundingClientRect();
  return {
    left: rect.left - heroRect.left,
    top: rect.top - heroRect.top,
    right: rect.right - heroRect.left,
    bottom: rect.bottom - heroRect.top,
    width: rect.width,
    height: rect.height,
  };
}

function desktopGeometry(
  width: number,
  height: number,
  lines: [Rect, Rect, Rect],
): HeroGeometry {
  const scaleX = width / 1425;
  const titleTop = lines[0].top;
  const titleHeight = lines[2].bottom - lines[0].top;
  const y = (value: number) =>
    titleTop + (value - 202.33) * (titleHeight / 495.33);
  const x = (value: number) => value * scaleX;

  const origin = { x: x(90.72), y: 86 };
  const h1End = { x: x(343.5), y: y(254.8) };
  const h2End = { x: x(309), y: y(306.7) };
  const h3End = { x: x(140), y: y(400.2) };
  const h4End = { x: x(90.5), y: y(421.4) };
  const h5End = { x: x(27.79), y: y(489.1) };
  const h6Turn = { x: x(107.5), y: y(537.6) };
  const h6End = { x: x(828), y: y(537.6) };
  const h7End = { x: x(1019), y: y(604) };
  const h8End = { x: x(888), y: y(606.9) };
  const h9End = { x: x(953), y: y(688.7) };
  const squiggle = {
    x: x(924),
    y: y(763),
  };
  const tail = { x: width * 0.734, y: height };

  const back = [
    `${moveCommand(origin)} ${cubicCommand(
      { x: x(124.6), y: y(165.7) },
      { x: x(215.5), y: y(216.8) },
      h1End,
    )}`,
    `${moveCommand(h2End)} ${cubicCommand(
      { x: x(260), y: y(334) },
      { x: x(180), y: y(366) },
      h3End,
    )}`,
    `${moveCommand(h4End)} ${cubicCommand(
      { x: x(52.3), y: y(434.2) },
      { x: x(27.79), y: y(463.2) },
      h5End,
    )}`,
    `${moveCommand(h6End)} ${cubicCommand(
      { x: x(1020), y: y(537.6) },
      { x: x(1060), y: y(525) },
      h7End,
    )}`,
    `${moveCommand(h8End)} ${cubicCommand(
      { x: x(888), y: y(590.9) },
      { x: x(972), y: y(586.5) },
      h9End,
    )}`,
    `${moveCommand(h9End)} ${cubicCommand(
      { x: x(944), y: y(701) },
      { x: x(948), y: y(714) },
      { x: x(946), y: y(712) },
    )} ${cubicCommand(
      { x: x(944), y: y(724) },
      { x: x(930), y: y(729) },
      { x: x(937), y: y(735) },
    )} ${cubicCommand(
      { x: x(943), y: y(746) },
      { x: x(912), y: y(750) },
      squiggle,
    )} ${cubicCommand(
      { x: x(900), y: y(792) },
      { x: x(980), y: y(852) },
      tail,
    )}`,
  ];

  const front = [
    `${moveCommand(h1End)} ${cubicCommand(
      { x: x(354), y: y(256.5) },
      { x: x(378), y: y(262) },
      h2End,
    )}`,
    `${moveCommand(h3End)} ${cubicCommand(
      { x: x(115), y: y(408) },
      { x: x(102), y: y(414) },
      h4End,
    )}`,
    `${moveCommand(h5End)} ${cubicCommand(
      { x: x(27.79), y: y(514.9) },
      { x: x(52.3), y: y(537.6) },
      h6Turn,
    )} ${lineCommand(h6End)}`,
    `${moveCommand(h7End)} ${cubicCommand(
      { x: x(1007), y: y(682) },
      { x: x(870), y: y(681) },
      h8End,
    )}`,
  ];

  return {
    width,
    height,
    origin,
    back,
    front,
    rings: [{ ...squiggle, radius: 9, core: 3 }],
  };
}

function mobileGeometry(
  width: number,
  height: number,
  lines: [Rect, Rect, Rect],
): HeroGeometry {
  const scaleX = width / 360;
  const l1 = lines[0];
  const l2 = lines[1];
  const l3 = lines[2];

  const p1 = (x: number, y: number): Point => ({
    x: l1.left + l1.width * x,
    y: l1.top + l1.height * y,
  });
  const p2 = (x: number, y: number): Point => ({
    x: l2.left + l2.width * x,
    y: l2.top + l2.height * y,
  });
  const p3 = (x: number, y: number): Point => ({
    x: l3.left + l3.width * x,
    y: l3.top + l3.height * y,
  });

  const origin = { x: 32 * scaleX, y: 86 };
  const m1End = p1(0.606, 0.314);
  const m2End = p1(0.588, 0.626);
  const m3End = p2(0.226, 0.179);
  const m4End = p2(0.153, 0.322);
  const m5End = p2(0.083, 0.733);
  const m6Turn = { x: 57.3 * scaleX, y: l3.top + l3.height * 0.031 };
  const m6End = p3(0.7, 0.031);
  const m7End = p3(0.885, 0.428);
  const m8End = p3(0.759, 0.446);
  const m9End = p3(0.824, 0.936);
  const m10End = p3(0.687, 3.56);
  const gutter = width - 12;

  const back = [
    `${moveCommand(origin)} ${cubicCommand(
      { x: width * 0.13, y: height * 0.2 },
      { x: m1End.x + width * 0.03, y: m1End.y - height * 0.025 },
      m1End,
    )}`,
    `${moveCommand(m2End)} ${cubicCommand(
      { x: m2End.x - 18 * scaleX, y: m2End.y + 8 },
      { x: m3End.x + 20 * scaleX, y: m3End.y - 8 },
      m3End,
    )}`,
    `${moveCommand(m4End)} ${cubicCommand(
      { x: m4End.x - 15 * scaleX, y: m4End.y + 8 },
      { x: m5End.x, y: m5End.y - 14 },
      m5End,
    )}`,
    `${moveCommand(m6End)} ${cubicCommand(
      { x: m6End.x + 30 * scaleX, y: m6End.y },
      { x: m7End.x, y: m6End.y + 8 },
      m7End,
    )}`,
    `${moveCommand(m8End)} ${cubicCommand(
      { x: m8End.x + 2 * scaleX, y: m8End.y - 12 },
      { x: m9End.x + 8 * scaleX, y: m9End.y - 16 },
      m9End,
    )}`,
    `${moveCommand(m9End)} ${cubicCommand(
      { x: 276 * scaleX, y: l3.top + l3.height * 1.48 },
      { x: 282 * scaleX, y: l3.top + l3.height * 1.66 },
      p3(0.834, 1.75),
    )} ${cubicCommand(
      { x: 264 * scaleX, y: l3.top + l3.height * 1.94 },
      { x: 258 * scaleX, y: l3.top + l3.height * 2.4 },
      p3(0.765, 2.59),
    )} ${cubicCommand(
      { x: 242 * scaleX, y: l3.top + l3.height * 2.9 },
      { x: 232 * scaleX, y: l3.top + l3.height * 3.3 },
      m10End,
    )} ${cubicCommand(
      { x: m10End.x + 12 * scaleX, y: m10End.y + 30 },
      { x: gutter, y: height - 150 },
      { x: gutter, y: height - 100 },
    )} ${lineCommand({ x: gutter, y: height })}`,
  ];

  const front = [
    `${moveCommand(m1End)} ${cubicCommand(
      { x: m1End.x + 10 * scaleX, y: m1End.y + 2 },
      { x: m2End.x + 14 * scaleX, y: m2End.y + 8 },
      m2End,
    )}`,
    `${moveCommand(m3End)} ${cubicCommand(
      { x: m3End.x - 10 * scaleX, y: m3End.y + 4 },
      { x: m4End.x + 8 * scaleX, y: m4End.y - 2 },
      m4End,
    )}`,
    `${moveCommand(m5End)} ${cubicCommand(
      { x: m5End.x, y: m6Turn.y - 12 },
      { x: m5End.x + 24 * scaleX, y: m6Turn.y },
      m6Turn,
    )} ${lineCommand(m6End)}`,
    `${moveCommand(m7End)} ${cubicCommand(
      { x: m7End.x + 6 * scaleX, y: m7End.y + 18 },
      { x: m8End.x - 12 * scaleX, y: m8End.y + 18 },
      m8End,
    )}`,
  ];

  return {
    width,
    height,
    origin,
    back,
    front,
    rings: [{ ...m10End, radius: 9, core: 3 }],
  };
}

export function HeroThread({ children }: { children: ReactNode }) {
  const backRef = useRef<SVGSVGElement>(null);
  const frontRef = useRef<SVGSVGElement>(null);
  const [geometry, setGeometry] = useState<HeroGeometry | null>(null);

  useEffect(() => {
    const back = backRef.current;
    const hero = back?.parentElement;

    if (!(hero instanceof HTMLElement)) {
      throw new Error("Hero thread must be mounted inside the hero section.");
    }

    let active = true;
    const updateGeometry = () => {
      if (!active) return;

      const heroRect = hero.getBoundingClientRect();
      if (heroRect.width <= 0 || heroRect.height <= 0) return;

      const lines: [Rect, Rect, Rect] = [
        anchorRect(hero, heroRect, "hero-line-1"),
        anchorRect(hero, heroRect, "hero-line-2"),
        anchorRect(hero, heroRect, "hero-line-3"),
      ];
      const nextGeometry =
        heroRect.width <= 700
          ? mobileGeometry(heroRect.width, heroRect.height, lines)
          : desktopGeometry(heroRect.width, heroRect.height, lines);

      setGeometry((current) =>
        JSON.stringify(current) === JSON.stringify(nextGeometry)
          ? current
          : nextGeometry,
      );
    };

    const resizeObserver = new ResizeObserver(updateGeometry);
    resizeObserver.observe(hero);
    hero
      .querySelectorAll<HTMLElement>(
        '[data-thread-anchor^="hero-line-"]',
      )
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
    <>
      <svg
        ref={backRef}
        className="hero-thread hero-thread-back"
        aria-hidden="true"
        focusable="false"
        viewBox={viewBox}
        width={geometry?.width ?? 1}
        height={geometry?.height ?? 1}
      >
        {geometry ? (
          <circle
            className="thread-origin-dot"
            cx={geometry.origin.x}
            cy={geometry.origin.y}
            r={4}
          />
        ) : null}
        {geometry?.back.map((d, index) => (
          <path className="thread-path" d={d} key={`back-${index}`} />
        ))}
        {geometry?.rings.map((ring) => (
          <g key={`hero-ring-${ring.x}-${ring.y}`}>
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
      </svg>
      {children}
      <svg
        ref={frontRef}
        className="hero-thread hero-thread-front"
        aria-hidden="true"
        focusable="false"
        viewBox={viewBox}
        width={geometry?.width ?? 1}
        height={geometry?.height ?? 1}
      >
        {geometry?.front.map((d, index) => (
          <path className="thread-path" d={d} key={`front-${index}`} />
        ))}
      </svg>
    </>
  );
}
