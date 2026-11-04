import { greenDev, migrationDev } from "./data/capabilities";
import { CapabilityList } from "./shared/capability-list";

export function CapabilitiesSection() {
  return (
    <section
      className="capabilities"
      id="capabilities"
      aria-labelledby="capabilities-title"
    >
      <div className="capability-heading">
        <h2
          id="capabilities-title"
          data-thread-anchor="capabilities.heading"
          data-thread-label="Capabilities · title box"
        >
          <span>I DESIGN THE EXPERIENCE.</span>
          <span>AND THE INTELLIGENCE</span>
          <span>BEHIND IT.</span>
        </h2>
      </div>
      <div
        className="capability-orbit"
        data-thread-anchor="capabilities.orbit"
        data-thread-label="Capabilities · orbit box"
      >
        <CapabilityList
          title="Building Intelligent Software"
          items={greenDev}
          side="product"
        />
        <CapabilityList
          title="Making Software Work Better "
          items={migrationDev}
          side="ai"
        />
      </div>
    </section>
  );
}
