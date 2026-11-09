export function WorkFlowSection() {
  return (
    <section
      className="work-flow"
      id="work-flow"
      aria-labelledby="work-flow-title"
    >
      <div className="work-flow-intro">
        <div className="work-flow-copy">
          <h2
            id="work-flow-title"
            data-thread-anchor="work.flow.heading"
            data-thread-label="Work flow · title box"
          >
            <span>ENGINEERING</span>
            <span>PRODUCTS</span>
            <span>WITH IMPACT</span>
          </h2>
        </div>
        <div
          className="work-flow-drawing"
          aria-hidden="true"
          data-thread-anchor="work.flow.drawing"
          data-thread-label="Work flow · work flow drawing"
        >
          <span
            className="work-flow-label practice-step-problem"
            data-thread-anchor="work.flow.step.problem"
            data-thread-label="Work Flow · Problem"
          >
            Problem
          </span>
          <span
            className="work-flow-label practice-step-investigate"
            data-thread-anchor="work.flow.step.investigate"
            data-thread-label="Work Flow · Investigate"
          >
            Investigate
          </span>
          <span
            className="work-flow-label practice-step-design"
            data-thread-anchor="work.flow.step.design"
            data-thread-label="Work Flow · Design and Architect"
          >
            Design and Architect
          </span>
          <span
            className="work-flow-label practice-step-build"
            data-thread-anchor="work.flow.step.build"
            data-thread-label="Work Flow · Build"
          >
            Build
          </span>
          <span
            className="work-flow-label practice-step-verify"
            data-thread-anchor="work.flow.step.verify"
            data-thread-label="Work Flow · Verify & Test"
          >
            Verify &amp; Test
          </span>
          <span
            className="work-flow-label practice-step-ship"
            data-thread-anchor="work.flow.step.ship"
            data-thread-label="Work Flow · Ship"
          >
            Ship
          </span>
          <span
            className="work-flow-label practice-step-operate"
            data-thread-anchor="work.flow.step.operate"
            data-thread-label="Work Flow · Operate and improve"
          >
            Operate and improve
          </span>
        </div>
        <p
          className="work-flow-description"
          data-thread-anchor="work.flow.description"
          data-thread-label="WORK FLOW · closing paragraph"
        >
          More than connecting a UI to an API. I connect human intent, product
          behavior, and the systems underneath.
        </p>
      </div>
    </section>
  );
}
