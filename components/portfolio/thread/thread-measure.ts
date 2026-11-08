import type { Rect } from "./thread-path";

export type MeasuredAnchor = {
  id: string;
  label: string;
  mode: "rect" | "range" | "center";
  rect: Rect;
};

export type MeasuredLayout = {
  width: number;
  height: number;
  pagePad: number;
  hero: Rect;
  capabilities: Rect;
  /** The empty hole of the hero's "O", in root coordinates (null if unmeasurable). */
  heroOCounter: Rect | null;
  anchors: Map<string, MeasuredAnchor>;
  signature: string;
};

const round = (value: number) => Math.round(value * 4) / 4;

export function rectFromElement(element: Element, rootRect: DOMRect): Rect {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left - rootRect.left,
    top: rect.top - rootRect.top,
    right: rect.right - rootRect.left,
    bottom: rect.bottom - rootRect.top,
    width: rect.width,
    height: rect.height,
  };
}

function rangeRect(element: Element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const rect = range.getBoundingClientRect();
  range.detach();

  if (rect.width === 0 && rect.height === 0) {
    return element.getBoundingClientRect();
  }

  return rect;
}

function selectedRect(
  root: HTMLElement,
  rootRect: DOMRect,
  selector: string,
  description: string,
): Rect {
  const element = root.querySelector<HTMLElement>(selector);
  if (!element) {
    throw new Error(`Thread layer requires ${description} (${selector}).`);
  }
  return rectFromElement(element, rootRect);
}


/**
 * Finds the counter (the hole) of a single glyph by rasterising it with the
 * element's own font and scanning for the empty region around the ink centre.
 * Returns root-relative coordinates, or null when canvas/fonts are unavailable.
 */
export function measureGlyphCounter(
  element: Element,
  rootRect: DOMRect,
): Rect | null {
  try {
    const char = (element.textContent ?? "").trim().charAt(0);
    const style = window.getComputedStyle(element);
    const size = Number.parseFloat(style.fontSize);
    if (!char || !Number.isFinite(size) || size <= 0) return null;

    const pad = Math.ceil(size * 0.25);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    ctx.font = `${style.fontStyle} ${style.fontWeight} ${size}px ${style.fontFamily}`;
    const metrics = ctx.measureText(char);
    const ascent = metrics.fontBoundingBoxAscent ?? size * 0.9;
    const descent = metrics.fontBoundingBoxDescent ?? size * 0.25;

    canvas.width = Math.ceil(metrics.width + 2 * pad);
    canvas.height = Math.ceil(ascent + descent + 2 * pad);
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${size}px ${style.fontFamily}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#000";
    ctx.fillText(char, pad, pad + ascent);

    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    const ink = (x: number, y: number) => data[(y * width + x) * 4 + 3] > 127;

    let minX = width;
    let maxX = -1;
    let minY = height;
    let maxY = -1;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (!ink(x, y)) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (maxX < 0) return null;

    const cx = Math.round((minX + maxX) / 2);
    const cy = Math.round((minY + maxY) / 2);
    if (ink(cx, cy)) return null; // no hole at the centre

    let left = cx;
    while (left > minX && !ink(left, cy)) left -= 1;
    let right = cx;
    while (right < maxX && !ink(right, cy)) right += 1;
    let top = cy;
    while (top > minY && !ink(cx, top)) top -= 1;
    let bottom = cy;
    while (bottom < maxY && !ink(cx, bottom)) bottom += 1;

    // The element's range box starts at the glyph origin and at the top of
    // the font's content area, which is where the canvas text was drawn.
    const live = element.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(element);
    const box = range.getBoundingClientRect();
    range.detach();
    const originX = (box.width || live.width) > 0 ? box.left : live.left;
    const originY = box.height > 0 ? box.top : live.top;

    const x0 = originX - rootRect.left - pad;
    const y0 = originY - rootRect.top - pad;
    const rect = {
      left: x0 + left + 1,
      top: y0 + top + 1,
      right: x0 + right,
      bottom: y0 + bottom,
      width: Math.max(0, right - left - 1),
      height: Math.max(0, bottom - top - 1),
    };
    return rect.width > 2 && rect.height > 2 ? rect : null;
  } catch {
    return null;
  }
}

export function measureLayout(root: HTMLElement): MeasuredLayout {
  const rootRect = root.getBoundingClientRect();
  const heroRect = root.querySelector<HTMLElement>(".hero");
  if (!heroRect) {
    throw new Error("Thread layer requires the hero section.");
  }

  const hero = rectFromElement(heroRect, rootRect);
  const capabilities = selectedRect(
    root,
    rootRect,
    ".capabilities",
    "the capabilities section",
  );
  const paddingLeft = Number.parseFloat(
    window.getComputedStyle(heroRect).paddingLeft,
  );
  const pagePad = Number.isFinite(paddingLeft) ? paddingLeft : 24;

  const elements = Array.from(
    root.querySelectorAll<Element>("[data-thread-anchor]"),
  );
  const anchors = new Map<string, MeasuredAnchor>();
  const duplicates = new Set<string>();

  for (const element of elements) {
    const id = element.getAttribute("data-thread-anchor");
    if (!id) continue;

    if (anchors.has(id)) {
      duplicates.add(id);
      continue;
    }

    const label = element.getAttribute("data-thread-label") ?? "";
    const rawMode = element.getAttribute("data-thread-anchor-mode");
    const mode = rawMode === "range" || rawMode === "center" ? rawMode : "rect";
    const rect =
      mode === "range" ? rangeRect(element) : element.getBoundingClientRect();

    anchors.set(id, {
      id,
      label,
      mode,
      rect: {
        left: rect.left - rootRect.left,
        top: rect.top - rootRect.top,
        right: rect.right - rootRect.left,
        bottom: rect.bottom - rootRect.top,
        width: rect.width,
        height: rect.height,
      },
    });
  }

  if (process.env.NODE_ENV !== "production") {
    if (duplicates.size > 0) {
      throw new Error(
        `Thread layer found duplicate anchor ids: ${Array.from(duplicates).join(
          ", ",
        )}`,
      );
    }

    const missingLabels = Array.from(anchors.values()).filter(
      (anchor) => !anchor.label,
    );
    if (missingLabels.length > 0) {
      throw new Error(
        `Thread anchors are missing labels: ${missingLabels
          .map(({ id }) => id)
          .join(", ")}`,
      );
    }
  }

  const signatureParts = Array.from(anchors.values())
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map(
      ({ id, rect }) =>
        `${id}:${round(rect.left)},${round(rect.top)},${round(
          rect.right,
        )},${round(rect.bottom)}`,
    );

  signatureParts.unshift(
    `w:${round(rootRect.width)}`,
    `h:${round(rootRect.height)}`,
    `vh:${round(window.innerHeight)}`,
    `dpr:${window.devicePixelRatio}`,
  );

  const oElement = root.querySelector('[data-thread-anchor="hero.from.o"]');
  const heroOCounter = oElement ? measureGlyphCounter(oElement, rootRect) : null;
  if (heroOCounter) {
    signatureParts.push(
      `oc:${round(heroOCounter.left)},${round(heroOCounter.top)},${round(
        heroOCounter.width,
      )},${round(heroOCounter.height)}`,
    );
  }

  return {
    width: rootRect.width,
    height: rootRect.height,
    pagePad,
    hero,
    capabilities,
    heroOCounter,
    anchors,
    signature: signatureParts.join("|"),
  };
}

export function getAnchor(layout: MeasuredLayout, id: string): MeasuredAnchor {
  const anchor = layout.anchors.get(id);
  if (!anchor) {
    throw new Error(`Thread layer requires anchor "${id}".`);
  }
  return anchor;
}

export function getRect(layout: MeasuredLayout, id: string): Rect {
  return getAnchor(layout, id).rect;
}

export function anchorPoint(
  layout: MeasuredLayout,
  id: string,
): { x: number; y: number } {
  const rect = getRect(layout, id);
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

export function anchorSignature(
  layout: MeasuredLayout,
  ids: readonly string[],
  extra: readonly (string | number)[] = [],
) {
  const parts = ids.flatMap((id) => {
    const anchor = layout.anchors.get(id);
    if (!anchor) return [`${id}:missing`];
    const { rect } = anchor;
    return [
      `${id}:${round(rect.left)},${round(rect.top)},${round(
        rect.right,
      )},${round(rect.bottom)}`,
    ];
  });

  return [...parts, ...extra.map(String)].join("|");
}
