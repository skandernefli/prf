export function ConclusionSection() {
  return (
    <section
      className="conclusion-story"
      id="conclusion"
      aria-labelledby="conclusion-title"
      data-thread-anchor="conclusion.section"
      data-thread-label="About · section"
    >
      <div className="conclusion-stage">
        <div
          className="conclusion-profile"
          data-thread-anchor="conclusion.profile"
          data-thread-label="About · profile block"
        >
          <div className="conclusion-intro">
            <h2
              className="conclusion-heading"
              id="conclusion-title"
              data-thread-anchor="conclusion.heading"
              data-thread-label="About · heading"
            >
              <span>ONE THREAD,</span>
              <span>FROM PROBLEMA</span>
              <span>TO PRODUCTION.</span>
            </h2>
            <p className="conclusion-personal">
              I stay with an idea through every stage: understanding it,
              designing it, building it, and keeping it alive after launch.
            </p>
          </div>
          <div
            className="conclusion-byline"
            data-thread-anchor="conclusion.byline"
            data-thread-label="About · byline"
          >
            <p className="conclusion-name">SKANDER NEFLI</p>
            <p className="conclusion-role">
              FULLSTACK DEVELOPER. Curious builder.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
