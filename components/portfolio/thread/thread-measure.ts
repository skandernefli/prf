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
  anchors: Map<string, MeasuredAnchor>;
  signature: string;
};

const round = (value: number) => Math.round(value * 4) / 4;

export function rectFromElement(
  element: Element,
  rootRect: DOMRect,
): Rect {
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
    const mode =
      rawMode === "range" || rawMode === "center" ? rawMode : "rect";
    const rect =
      mode === "range"
        ? rangeRect(element)
        : element.getBoundingClientRect();

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
        `Thread layer found duplicate anchor ids: ${Array.from(
          duplicates,
        ).join(", ")}`,
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

  return {
    width: rootRect.width,
    height: rootRect.height,
    pagePad,
    hero,
    capabilities,
    anchors,
    signature: signatureParts.join("|"),
  };
}

export function getAnchor(
  layout: MeasuredLayout,
  id: string,
): MeasuredAnchor {
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
