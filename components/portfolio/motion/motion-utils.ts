const LINE_CLIP_PATH = "inset(-0.35em -0.15em -0.35em -0.15em)";
const TITLE_CLIP_PATH = LINE_CLIP_PATH;

type InlineProperty = {
  value: string;
  priority: string;
};

type MotionRecord = {
  line: HTMLElement;
  inner: HTMLElement;
  created: boolean;
  lineClipPath: InlineProperty;
  innerDisplay: InlineProperty;
  innerMotionAttribute: string | null;
  lineMotionAttribute: string | null;
};

type ExistingTitleRecord = {
  title: HTMLElement;
  inner: HTMLElement;
  titleClipPath: InlineProperty;
  innerMotionAttribute: string | null;
};

const records = new Set<MotionRecord | ExistingTitleRecord>();

function getInlineProperty(element: HTMLElement, property: string) {
  return {
    value: element.style.getPropertyValue(property),
    priority: element.style.getPropertyPriority(property),
  };
}

function restoreInlineProperty(
  element: HTMLElement,
  property: string,
  original: InlineProperty,
) {
  if (original.value) {
    element.style.setProperty(property, original.value, original.priority);
  } else {
    element.style.removeProperty(property);
  }
}

function isNonEmpty(element: HTMLElement) {
  return Boolean(element.textContent?.trim());
}

function directMotionInner(line: HTMLElement) {
  return Array.from(line.children).find(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.hasAttribute("data-motion-inner"),
  );
}

export type MaskLineOptions = {
  /**
   * Allow a line that is itself a thread anchor. Only the inner wrapper is ever
   * transformed, never the line, so the anchor's measured box does not move.
   * Lines that CONTAIN anchors stay refused: their anchors would move.
   */
  allowAnchoredLine?: boolean;
};

export function maskLine(
  target: Element | null,
  options: MaskLineOptions = {},
): HTMLElement | null {
  if (
    !(target instanceof HTMLElement) ||
    !isNonEmpty(target) ||
    (!options.allowAnchoredLine && target.hasAttribute("data-thread-anchor")) ||
    target.querySelector("[data-thread-anchor]")
  ) {
    return null;
  }

  const existing = directMotionInner(target);
  const innerMotionAttribute =
    existing?.getAttribute("data-motion-inner") ?? null;
  const lineMotionAttribute = target.getAttribute("data-motion-line");
  const originalInner = existing?.style.getPropertyValue("display") ?? "";
  const originalInnerPriority =
    existing?.style.getPropertyPriority("display") ?? "";
  const inner =
    existing ??
    ((): HTMLElement => {
      const wrapper = document.createElement("span");
      wrapper.setAttribute("data-motion-inner", "");
      while (target.firstChild) wrapper.appendChild(target.firstChild);
      target.appendChild(wrapper);
      return wrapper;
    })();

  if (existing) {
    existing.setAttribute("data-motion-inner", "");
  }

  const record: MotionRecord = {
    line: target,
    inner,
    created: !existing,
    lineClipPath: getInlineProperty(target, "clip-path"),
    innerDisplay: {
      value: originalInner,
      priority: originalInnerPriority,
    },
    innerMotionAttribute,
    lineMotionAttribute,
  };

  target.setAttribute("data-motion-line", "");
  inner.style.display = "block";
  target.style.clipPath = LINE_CLIP_PATH;
  records.add(record);

  return inner;
}

export function maskExistingTitle(
  title: Element | null,
  innerSpan: Element | null,
): HTMLElement | null {
  if (
    !(title instanceof HTMLElement) ||
    !(innerSpan instanceof HTMLElement) ||
    !title.matches(".case-study-title") ||
    innerSpan.parentElement !== title
  ) {
    return null;
  }

  const record: ExistingTitleRecord = {
    title,
    inner: innerSpan,
    titleClipPath: getInlineProperty(title, "clip-path"),
    innerMotionAttribute: innerSpan.getAttribute("data-motion-inner"),
  };

  title.style.clipPath = TITLE_CLIP_PATH;
  innerSpan.setAttribute("data-motion-inner", "");
  records.add(record);
  return innerSpan;
}

export function restoreMotionWrappers() {
  for (const record of [...records].reverse()) {
    if ("created" in record) {
      restoreInlineProperty(record.inner, "display", record.innerDisplay);

      if (record.created) {
        while (record.inner.firstChild) {
          record.line.insertBefore(record.inner.firstChild, record.inner);
        }
        record.inner.remove();
      } else if (record.innerMotionAttribute === null) {
        record.inner.removeAttribute("data-motion-inner");
      } else {
        record.inner.setAttribute(
          "data-motion-inner",
          record.innerMotionAttribute,
        );
      }

      if (record.lineMotionAttribute === null) {
        record.line.removeAttribute("data-motion-line");
      } else {
        record.line.setAttribute(
          "data-motion-line",
          record.lineMotionAttribute,
        );
      }

      restoreInlineProperty(record.line, "clip-path", record.lineClipPath);
    } else {
      restoreInlineProperty(record.title, "clip-path", record.titleClipPath);
      if (record.innerMotionAttribute === null) {
        record.inner.removeAttribute("data-motion-inner");
      } else {
        record.inner.setAttribute(
          "data-motion-inner",
          record.innerMotionAttribute,
        );
      }
    }

    records.delete(record);
  }
}

export function assertTransformSafe(target: Element) {
  if (
    process.env.NODE_ENV !== "production" &&
    (target.hasAttribute("data-thread-anchor") ||
      target.querySelector("[data-thread-anchor]"))
  ) {
    throw new Error("Unsafe transform target contains a thread anchor");
  }
}

type MotionTarget = Element | Element[];

export function addFromTo(
  timeline: gsap.core.Timeline,
  target: MotionTarget,
  fromVars: gsap.TweenVars,
  toVars: gsap.TweenVars,
  position?: gsap.Position,
) {
  timeline.fromTo(target, fromVars, toVars, position);
}

export function scrollTriggerDefaults(
  trigger: Element,
  start: string,
  end: string,
  scrub: number,
) {
  return {
    trigger,
    start,
    end,
    scrub,
  } satisfies ScrollTrigger.Vars;
}
