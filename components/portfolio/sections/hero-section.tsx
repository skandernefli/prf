export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-visual" aria-hidden="true">
        <div className="hero-visual-image" />
        <div className="hero-visual-grade" />
        <div className="hero-visual-vignette" />
        <div className="hero-visual-fade" />
      </div>
      <span className="absolute top-0 right-[25%]" data-thread-anchor="start" />
      <div
        className="hero-thread-slot hero-thread-back"
        data-thread-slot="hero-back"
        aria-hidden="true"
      />
      <div className="hero-copy">
        <h1 className="hero-title" id="hero-title">
          <span
            data-thread-anchor="hero.from"
            data-thread-label="Hero · FROM line"
          >
            FROM
          </span>
          <span
            data-thread-anchor="hero.concept"
            data-thread-label="Hero · CONCEPT line"
          >
            CONCEPT
          </span>
          <span
            data-thread-anchor="hero.launch"
            data-thread-label="Hero · TO LAUNCH line"
          >
            TO LAUNCH
          </span>
        </h1>
        <div className="hero-footer">
          <div className="hero-support">
            <p>
              Designing the experience. Engineering the intelligence. End-to-end
              product ownership.
            </p>
          </div>
          <a
            className="scroll-cue"
            href="#work"
            data-thread-anchor="hero.scroll-cue"
            data-thread-label="Hero · scroll cue"
          >
            SCROLL TO FOLLOW THE THREAD <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
      <div
        className="hero-thread-slot hero-thread-front"
        data-thread-slot="hero-front"
        aria-hidden="true"
      />
    </section>
  );
}
