export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-title">
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
            FR
            <span
              className="thread-glyph"
              data-thread-anchor="hero.from.o"
              data-thread-label="Hero · FROM / O"
              data-thread-anchor-mode="range"
            >
              O
            </span>
            M
          </span>
          <span
            data-thread-anchor="hero.concept"
            data-thread-label="Hero · CONCEPT line"
          >
            <span
              className="thread-glyph"
              data-thread-anchor="hero.concept.c"
              data-thread-label="Hero · CONCEPT / first C"
              data-thread-anchor-mode="range"
            >
              C
            </span>
            ONCEPT
          </span>
          <span
            data-thread-anchor="hero.launch"
            data-thread-label="Hero · TO LAUNCH line"
          >
            TO LAUN
            <span
              className="thread-glyph"
              data-thread-anchor="hero.launch.ch"
              data-thread-label="Hero · TO LAUNCH / CH"
              data-thread-anchor-mode="range"
            >
              CH
            </span>
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
