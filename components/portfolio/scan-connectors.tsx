"use client";

import { useEffect, useRef, useState } from "react";

type Connector = { id: string; d: string };

const FIELDS = ["invoice", "total", "status"] as const;

/**
 * Three dashed threads that tie each extracted value (right-hand panel) to the
 * orange box it was read from on the verified invoice.
 *
 * Everything is measured from the live DOM, so the connectors follow the
 * artwork at every breakpoint instead of being tuned per width. The overlay
 * itself is pointer-transparent and sits inside `.case-study-composition`.
 */
export function ScanConnectors() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [connectors, setConnectors] = useState<Connector[]>([]);

  useEffect(() => {
    const svg = svgRef.current;
    const composition = svg?.parentElement;
    if (!svg || !composition) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const base = composition.getBoundingClientRect();
      const paper = composition.querySelector(".scan-paper-main");
      const rows = Array.from(
        composition.querySelectorAll<HTMLElement>(".scan-extracted dl > div"),
      );
      if (!paper || rows.length < FIELDS.length || base.width === 0) {
        setConnectors([]);
        return;
      }

      const next: Connector[] = [];
      FIELDS.forEach((field, index) => {
        const box = paper.querySelector(`[data-scan-field="${field}"]`);
        const row = rows[index];
        if (!box || !row) return;

        const from = box.getBoundingClientRect();
        const to = row.getBoundingClientRect();
        const x1 = from.right - base.left;
        const y1 = from.top + from.height / 2 - base.top;
        const x2 = to.left - base.left;
        const y2 = to.top + to.height / 2 - base.top;
        if (![x1, y1, x2, y2].every(Number.isFinite) || x2 - x1 < 8) return;

        const pull = Math.max(24, (x2 - x1) * 0.45);
        next.push({
          id: field,
          d: `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${(x1 + pull).toFixed(1)} ${y1.toFixed(1)}, ${(x2 - pull).toFixed(1)} ${y2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`,
        });
      });
      setConnectors(next);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(composition);
    window.addEventListener("resize", schedule);
    document.fonts?.ready.then(schedule);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <svg ref={svgRef} className="scan-connectors" aria-hidden="true">
      {connectors.map(({ id, d }) => (
        <path key={id} className="scan-connector" d={d} />
      ))}
    </svg>
  );
}
