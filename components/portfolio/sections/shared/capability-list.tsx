import type { CSSProperties } from "react";

export function CapabilityList({
  title,
  items,
  side,
}: {
  title: string;
  items: readonly (readonly [string, string, string, string, string])[];
  side: "product" | "ai";
}) {
  return (
    <section className={`capability-discipline capability-${side}`}>
      <h3
        data-thread-anchor={`capabilities.${side}.title`}
        data-thread-label={
          side === "product"
            ? "Capabilities · product discipline title"
            : "Capabilities · AI discipline title"
        }
      >
        {title}
      </h3>
      <ul>
        {items.map(([name, description, left, top, clearance], index) => (
          <li
            key={name}
            data-thread-anchor={`capabilities.${side}.${index + 1}`}
            data-thread-label={`Capabilities · ${name} dot`}
            data-thread-anchor-mode="center"
            style={
              {
                left,
                top,
                "--capability-clearance": clearance,
              } as CSSProperties
            }
          >
            <span>
              <strong>{name}</strong>
              <small>{description}</small>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
