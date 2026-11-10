"use client";

import { useEffect, useRef, useState } from "react";

type Connector = { id: string; d: string };

const FIELDS = ["invoice", "total", "status"] as const;

function sameConnectors(a: Connector[], b: Connector[]) {
  return (
    a.length === b.length &&
    a.every((item, index) => item.id === b[index].id && item.d === b[index].d)
  );
}

/**
 * Three dashed threads that tie each extracted value (right-hand panel) to the
 * orange box it was read from on the verified invoice.
 *
 * Everything is measured from the live DOM, so the connectors follow the
 * artwork at every breakpoint and while the papers drift on scroll. The
 * overlay is pointer-transparent and sits inside `.case-study-composition`.
 *
 * Each connector is shown through a mask. The solid `.scan-connector-reveal`
 * path inside the mask is what the scene draws with DrawSVG, so the visible
 * dashes keep their pattern while the thread draws in. Once all three paths
 * have geometry, a `scan-connectors:measured` event tells the scene it can
 * build the sequence.
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
        setConnectors((prev) => (prev.length ? [] : prev));
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
      setConnectors((prev) => (sameConnectors(prev, next) ? prev : next));
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(composition);
    window.addEventListener("resize", schedule);
    // Fired by the Norma scene while the papers drift on scroll.
    window.addEventListener("scan-connectors:measure", measure);
    document.fonts?.ready.then(schedule);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scan-connectors:measure", measure);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Tell the scene once every connector has real geometry (after the DOM
  // has been updated with the measured paths).
  useEffect(() => {
    if (connectors.length === FIELDS.length) {
      window.dispatchEvent(new Event("scan-connectors:measured"));
    }
  }, [connectors]);

  const pathFor = (field: string) =>
    connectors.find((connector) => connector.id === field)?.d ?? "";

  return (
    <svg ref={svgRef} className="scan-connectors" aria-hidden="true">
      <defs>
        {FIELDS.map((field) => (
          <mask
            key={field}
            id={`scan-connector-mask-${field}`}
            maskUnits="userSpaceOnUse"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <path
              className="scan-connector-reveal"
              d={pathFor(field)}
              style={{
                fill: "none",
                stroke: "#fff",
                strokeWidth: 8,
                strokeLinecap: "butt",
              }}
            />
          </mask>
        ))}
      </defs>
      {FIELDS.map((field) => (
        <path
          key={field}
          className="scan-connector"
          d={pathFor(field)}
          mask={`url(#scan-connector-mask-${field})`}
        />
      ))}
    </svg>
  );
}
