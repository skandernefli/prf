import { gsap } from "gsap";

import { addFromTo, maskLine, scrollTriggerDefaults } from "../motion-utils";

export function buildCapabilitiesScene(root: HTMLElement) {
  const section = root.querySelector<HTMLElement>(".capabilities");
  if (!section) return;

  const headingLines = Array.from(
    section.querySelectorAll<HTMLElement>(".capability-heading h2 > span"),
  );

  // Build the same mask wrappers used by the work-flow title (and hero).
  // The outer <span> stays the x-drift target; only its inner wrapper rises.
  const headingInners: HTMLElement[] = [];
  headingLines.forEach((line) => {
    // Inline boxes ignore both transform and overflow, so promote to
    // inline-block when needed (no-op if CSS already makes them block-level).
    if (getComputedStyle(line).display === "inline") {
      line.style.display = "inline-block";
    }

    const inner = maskLine(line);
    if (inner) {
      // Close the bottom edge of the mask right at the line, exactly as the
      // work-flow / hero titles do, so a line waiting to rise doesn't peek
      // through the gap below it. A hair of slack keeps the baseline safe.
      line.style.clipPath = "inset(-0.35em -0.15em -0.05em -0.15em)";

      if (getComputedStyle(inner).display === "inline") {
        inner.style.display = "inline-block";
      }

      headingInners.push(inner);
    }
  });

  // Title: one continuous x-drift across the whole section scroll.
  //  - Entry: starts offset on the opposite side, drifts toward 0.
  //  - "top top": x hits 0 exactly (its original place).
  //  - Exit: keeps going in the same direction to the other offset.
  // Single trigger + single ease = no boundary, no stop, no reversal.
  if (headingLines.length > 0) {
    // Alternating exit direction per line — [1, -1, 1] for three lines,
    // matching the work-flow title exactly.
    const driftDirections = headingLines.map((_, i) => (i % 2 === 0 ? 1 : -1));

    const EDGE_MARGIN = 24;
    const MAX_DRIFT = () => Math.min(window.innerWidth * 0.06, 72);

    // Room available on a given side (+1 = right, -1 = left), measured from
    // the element's *untransformed* box so refreshes don't compound.
    const roomOn = (el: HTMLElement, side: number) => {
      const currentX = Number(gsap.getProperty(el, "x")) || 0;
      const rect = el.getBoundingClientRect();
      const left = rect.left - currentX;
      const right = rect.right - currentX;
      const available =
        side > 0 ? window.innerWidth - EDGE_MARGIN - right : left - EDGE_MARGIN;
      return Math.max(0, Math.min(available, MAX_DRIFT()));
    };

    // Symmetric amplitude — the smaller of the two sides, so the line
    // travels equally far on either side of its resting position and
    // never crosses the edge margin.
    const drift = (el: HTMLElement) => Math.min(roomOn(el, 1), roomOn(el, -1));

    // Fraction of the section's scroll range at which "top top" occurs.
    let p0 = 0.5;

    // Piecewise-linear ease: 0 → 0.5 at p0 → 1. The tween's x midpoint (0)
    // therefore lands exactly at "top top", with no keyframe or pause.
    const ease = (p: number) =>
      p < p0 ? (p / p0) * 0.5 : 0.5 + ((p - p0) / (1 - p0)) * 0.5;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          const range = self.end - self.start;
          const raw = range > 0 ? window.innerHeight / range : 0.5;
          p0 = Math.max(0.08, Math.min(0.92, raw));
        },
      },
    });

    headingLines.forEach((line, i) => {
      const dir = driftDirections[i];
      tl.fromTo(
        line,
        // Start on the opposite side; end on the exit side. x = 0 at p0.
        { x: () => -dir * drift(line) },
        {
          x: () => dir * drift(line),
          ease,
          immediateRender: false,
        },
        0,
      );
    });
  }

  // Entrance: same mask-rise + blur as the work-flow title, played once when
  // the section is clearly on screen. Runs on the inner wrappers only, so it
  // never competes with the x-drift on the outer lines.
  if (headingInners.length) {
    const entrance = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 30%",
        once: true,
      },
    });

    addFromTo(
      entrance,
      headingInners,
      { yPercent: 112, filter: "blur(10px)" },
      {
        yPercent: 0,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.12,
        clearProps: "filter",
      },
      0,
    );
  }

  section
    .querySelectorAll<HTMLElement>(".capability-discipline h3")
    .forEach((heading) => {
      const reveal = gsap.timeline({
        scrollTrigger: scrollTriggerDefaults(
          heading,
          "top 50%",
          "top 40%",
          0.45,
        ),
      });

      addFromTo(
        reveal,
        heading,
        { opacity: 0, filter: "blur(5px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.55,
          ease: "power2.out",
        },
        0,
      );
    });

  section
    .querySelectorAll<HTMLElement>(".capability-discipline li")
    .forEach((item) => {
      const inner = item.querySelector<HTMLElement>(":scope > span");
      if (!inner) return;

      const reveal = gsap.timeline({
        scrollTrigger: scrollTriggerDefaults(item, "top 50%", "top 40%", 0.55),
      });

      addFromTo(
        reveal,
        inner,
        { y: 14, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          ease: "power3.out",
        },
        0,
      );
    });
}
