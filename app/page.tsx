import { InlineReferenceElement } from "@/components/portfolio/inline-reference-element";
import { InlineReferenceSvg } from "@/components/portfolio/inline-reference-svg";
import { InlineSvg } from "@/components/portfolio/inline-svg";
import { ContactButtons } from "@/components/portfolio/contact-buttons";
import { HeroThread } from "@/components/portfolio/hero-thread-layer";
import { ThreadLayer } from "@/components/portfolio/thread-layer";
import type { CSSProperties } from "react";

const productCapabilities = [
  [
    "Product Engineering",
    "Turn business requirements into production-ready software.",
    "17.5038%",
    "12%",
    "79.8656px",
  ],
  [
    "System Integration",
    "Connect APIs, platforms, and data into one workflow.",
    "3.75068%",
    "31%",
    "50.6294px",
  ],
  [
    "Process Automation",
    "Replace repetitive manual work with reliable software.",
    "0%",
    "50%",
    "28px",
  ],
  [
    "Data Engineering",
    "Transform complex datasets into useful products.",
    "3.75068%",
    "69%",
    "34.3907px",
  ],
  [
    "AI-Enabled Software",
    "Build smarter workflows with AI-assisted engineering.",
    "17.5038%",
    "88%",
    "46.2335px",
  ],
] as const;

const aiCapabilities = [
  [
    "Legacy Modernization",
    "Modernize existing systems without disrupting operations.",
    "82.4962%",
    "12%",
    "79.8656px",
  ],
  [
    "Business Applications",
    "Build internal tools that simplify complex operations.",
    "96.2493%",
    "31%",
    "50.6294px",
  ],
  [
    "Commerce Systems",
    "Connect storefronts, catalogs, and business platforms.",
    "100%",
    "50%",
    "28px",
  ],
  [
    "Performance & Reliability",
    "Improve query speed, data quality, and system resilience.",
    "96.2493%",
    "69%",
    "34.3907px",
  ],
  [
    "Production Engineering",
    "Deliver tested, maintainable software ready for production.",
    "82.4962%",
    "88%",
    "46.2335px",
  ],
] as const;
function CapabilityList({
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
      <h3 data-thread-anchor={`capability-${side}-heading`}>{title}</h3>
      <ul>
        {items.map(([name, description, left, top, clearance], index) => (
          <li
            key={name}
            style={
              {
                left,
                top,
                "--capability-clearance": clearance,
              } as CSSProperties
            }
          >
            <span data-thread-anchor={`capability-${side}-${index + 1}`}>
              <strong>{name}</strong>
              <small>{description}</small>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProjectHeader({
  number,
  category,
  description,
}: {
  number: string;
  category: string;
  description: string;
}) {
  return (
    <>
      <p className="world-kicker">
        {number} / {category}
      </p>
      <p className="world-description">{description}</p>
    </>
  );
}

function ProjectLink() {
  return (
    <span className="world-link" aria-label="Explore project">
      EXPLORE PROJECT <span aria-hidden="true">↗</span>
    </span>
  );
}

function ProjectTitle({
  children,
  id,
  className = "world-title",
}: {
  children: string;
  id: string;
  className?: string;
}) {
  return (
    <h3 className={className} id={id}>
      <span>{children}</span>
    </h3>
  );
}

export default function Home() {
  return (
    <div className="portfolio" id="top">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="SN home">
          SN
        </a>
        <button className="menu-button" type="button" aria-expanded="false">
          MENU
        </button>
        <nav aria-label="Primary navigation">
          <a href="#capabilities">CAPABILITIES</a>
          <a href="#projects">PROJECTS</a>
          <a href="#about">ABOUT</a>
          <a href="#contact">CONTACT</a>
        </nav>
      </header>

      <ThreadLayer />

      <main id="main-content" tabIndex={-1}>
        <section
          className="hero"
          aria-labelledby="hero-title"
          data-thread-anchor="hero"
        >
          <HeroThread>
            <div className="hero-copy">
              <h1 className="hero-title" id="hero-title">
                <span data-thread-anchor="hero-line-1">FROM</span>
                <span data-thread-anchor="hero-line-2">CONCEPT</span>
                <span data-thread-anchor="hero-line-3">TO LAUNCH</span>
              </h1>
              <div className="hero-footer">
                <div className="hero-support">
                  <p>
                    Designing the experience. Engineering the intelligence.
                    End-to-end product ownership.
                  </p>
                </div>
                <a className="scroll-cue" href="#work">
                  SCROLL TO FOLLOW THE THREAD <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          </HeroThread>
        </section>

        <section
          className="selected-work"
          id="work"
          aria-labelledby="work-title"
        >
          <div className="practice-intro">
            <div className="practice-copy">
              <h2 id="work-title">
                <span>ENGINEERING</span>
                <span>PRODUCTS</span>
                <span>WITH IMPACT</span>
              </h2>
            </div>
            <div
              className="practice-drawing"
              aria-hidden="true"
              data-thread-anchor="practice-drawing"
            >
              <span
                className="practice-label practice-step-problem"
                data-thread-anchor="practice-step-1"
              >
                Problem
              </span>
              <span
                className="practice-label practice-step-investigate"
                data-thread-anchor="practice-step-2"
              >
                Investigate
              </span>
              <span
                className="practice-label practice-step-design"
                data-thread-anchor="practice-step-3"
              >
                Design and Architect
              </span>
              <span
                className="practice-label practice-step-build"
                data-thread-anchor="practice-step-4"
              >
                Build
              </span>
              <span
                className="practice-label practice-step-verify"
                data-thread-anchor="practice-step-5"
              >
                Verify & Test
              </span>
              <span
                className="practice-label practice-step-ship"
                data-thread-anchor="practice-step-6"
              >
                Ship
              </span>
              <span
                className="practice-label practice-step-operate"
                data-thread-anchor="practice-step-7"
              >
                Operate and improve
              </span>
            </div>
            <p className="practice-description">
              More than connecting a UI to an API. I connect human intent,
              product behavior, and the systems underneath.
            </p>
          </div>
        </section>

        <section
          className="capabilities"
          id="capabilities"
          aria-labelledby="capabilities-title"
          data-thread-anchor="capabilities"
        >
          <div
            className="capability-heading"
            data-thread-anchor="capability-heading"
          >
            <h2 id="capabilities-title">
              <span>I DESIGN THE EXPERIENCE.</span>
              <span>AND THE INTELLIGENCE</span>
              <span>BEHIND IT.</span>
            </h2>
          </div>
          <div
            className="capability-orbit"
            data-thread-anchor="capability-orbit"
          >
            <CapabilityList
              title="Building Intelligent Software"
              items={productCapabilities}
              side="product"
            />
            <CapabilityList
              title="Making Software Work Better "
              items={aiCapabilities}
              side="ai"
            />
          </div>
        </section>

        <div className="project-worlds" id="projects">
          <article
            className="project-world world-kabri world-light"
            id="kabri"
            aria-labelledby="kabri-title"
            data-thread-anchor="project-kabri"
          >
            <ProjectHeader
              number="01"
              category="BUSINESS PROCESS AUTOMATION"
              description="Automated product configuration, quotation generation, and order management for a manufacturing business."
            />
            <div className="world-composition">
              <figure
                className="world-object kabri-flat"
                data-thread-anchor="kabri-flat"
              >
                <InlineSvg asset="unit-03-occupied-two-bedroom-flat-with-living-room-kitchen-and-bathroom-mvv7k1zy.svg" />
              </figure>
              <figure
                className="world-object kabri-lease"
                data-thread-anchor="kabri-lease"
              >
                <InlineSvg asset="unit-03-lease-signed-monthly-rent-32000-mvv7k5ze.svg" />
              </figure>
              <figure
                className="world-object kabri-inspection"
                data-thread-anchor="kabri-inspection"
              >
                <InlineSvg asset="ai-inspection-compares-move-in-and-move-out-records-and-detects-wall-damage-with-94-percent-confidence-mvv7k4eb.svg" />
              </figure>
              <ProjectTitle id="kabri-title">KABRI</ProjectTitle>
              <figure
                className="world-object kabri-repair"
                data-thread-anchor="kabri-repair"
              >
                <InlineSvg asset="wall-repair-completed-4800-becomes-an-expense-in-the-property-ledger-mvv7k3he.svg" />
              </figure>
              <figure
                className="world-object kabri-book"
                data-thread-anchor="kabri-book"
              >
                <InlineSvg asset="property-03-ledger-rent-32000-repair-4800-other-expenses-1250-net-25950-the-same-repair-record-carries-into-itr--schedule-hp-mvv7k7e4.svg" />
              </figure>
            </div>
            <ProjectLink />
          </article>
          <article
            className="project-world norma-scan"
            id="norma"
            aria-labelledby="norma-title"
            data-thread-anchor="project-norma"
          >
            <ProjectHeader
              number="02"
              category="REAL ESTATE DATA INTELLIGENCE & ANALYTICS"
              description="A real estate intelligence platform unifying property data, analytics, and business insights."
            />
            <div className="world-composition">
              <figure
                className="scan-ledger scan-ledger-top"
                data-thread-anchor="norma-ledger-top"
              >
                <InlineSvg asset="svg-37-mvv7l25k.svg" />
              </figure>
              <figure
                className="scan-ledger scan-ledger-bottom"
                data-thread-anchor="norma-ledger-bottom"
              >
                <InlineSvg asset="svg-38-mvv7l40p.svg" />
              </figure>
              <ProjectTitle id="norma-title">NORMA</ProjectTitle>
              <figure
                className="scan-paper scan-paper-acme"
                data-thread-anchor="norma-paper-acme"
              >
                <InlineReferenceSvg name="acme-invoice" />
              </figure>
              <figure
                className="scan-paper scan-paper-river"
                data-thread-anchor="norma-paper-river"
              >
                <InlineReferenceSvg name="river-invoice" />
              </figure>
              <figure
                className="scan-paper scan-paper-river scan-paper-river-cover"
                data-thread-anchor="norma-paper-river-cover"
              >
                <InlineReferenceSvg name="river-invoice" />
              </figure>
              <figure
                className="scan-paper scan-paper-front"
                data-thread-anchor="norma-paper-front"
              >
                <InlineReferenceSvg name="northridge-invoice-verified" />
              </figure>
              <figure
                className="scan-paper scan-paper-main"
                data-thread-anchor="norma-paper-main"
              >
                <InlineReferenceSvg name="northridge-invoice-verified" />
              </figure>
              <figure
                className="scan-paper scan-paper-rejected"
                data-thread-anchor="norma-paper-rejected"
              >
                <InlineReferenceSvg name="harbor-invoice-rejected" />
              </figure>
              <InlineReferenceElement
                label="Extracted invoice values"
                className="scan-extracted"
                threadAnchor="norma-extracted"
              />
            </div>
            <ProjectLink />
          </article>

          <article
            className="project-world world-mesa world-light"
            id="mesa"
            aria-labelledby="mesa-title"
            data-thread-anchor="project-mesa"
          >
            <ProjectHeader
              number="03"
              category="E-COMMERCE AND ASSISTIVE HEALTHCARE EQUIPMENT"
              description="Modernized assistive equipment e-commerce with product discovery, filtering, and integrated product data."
            />
            <div className="world-composition">
              <figure
                className="world-object mesa-plate"
                data-thread-anchor="mesa-plate"
              >
                <InlineSvg asset="a-plate-drawn-in-fine-architectural-lines-mvv7kq9l.svg" />
              </figure>
              <figure
                className="world-object mesa-fork"
                data-thread-anchor="mesa-fork"
              >
                <InlineSvg asset="a-fork-in-flat-linework-mvv7kqxu.svg" />
              </figure>
              <figure
                className="world-object mesa-message"
                data-thread-anchor="mesa-message"
              >
                <InlineReferenceSvg name="bowlstory-order-message" />
              </figure>
              <ProjectTitle id="mesa-title">SHOPOPS</ProjectTitle>
              <figure
                className="world-object mesa-ticket"
                data-thread-anchor="mesa-ticket"
              >
                <InlineReferenceSvg name="bowlstory-order-confirmation" />
              </figure>
              <figure
                className="world-object mesa-reply"
                data-thread-anchor="mesa-reply"
              >
                <InlineSvg asset="mealops-replies-order-placed-your-rice-bowl-is-on-its-way-mvv7kwbt.svg" />
              </figure>
              <figure
                className="world-object mesa-bag"
                data-thread-anchor="mesa-bag"
              >
                <InlineSvg asset="meal-delivery-bag-on-the-way-arrives-at-1245-mvv7kzo8.svg" />
              </figure>
              <InlineReferenceElement
                label="Company wallet"
                className="world-object mesa-wallet"
                role="group"
                threadAnchor="mesa-wallet"
              />
              <InlineReferenceElement
                label="Company meal statistics"
                className="world-object mesa-dashboard"
                role="group"
                threadAnchor="mesa-dashboard"
              />
            </div>
            <ProjectLink />
          </article>

          <article
            className="project-world creditflow-world"
            id="creditflow"
            aria-labelledby="creditflow-title"
            data-thread-anchor="project-creditflow"
          >
            <ProjectHeader
              number="04"
              category="LegalTech"
              description="Digitized corporate legal workflows, simplifying business incorporation, compliance, and document management for entrepreneurs."
            />
            <div className="world-composition">
              <figure
                className="world-object credit-document credit-pan"
                data-thread-anchor="credit-pan"
              >
                <InlineSvg asset="pan-identity-card-with-masked-personal-details-mvv7le41.svg" />
              </figure>
              <figure
                className="world-object credit-document credit-gst"
                data-thread-anchor="credit-gst"
              >
                <InlineSvg asset="gst-return-with-filing-period-masked-gstin-and-tax-summary-mvv7lf08.svg" />
              </figure>
              <ProjectTitle
                id="creditflow-title"
                className="world-title credit-title"
              >
                LEGALEXY
              </ProjectTitle>
              <figure
                className="world-object credit-document credit-bank"
                data-thread-anchor="credit-bank"
              >
                <InlineSvg asset="six-months-of-business-bank-statements-mvv7lkll.svg" />
              </figure>
              <figure
                className="world-object credit-document credit-itr"
                data-thread-anchor="credit-itr"
              >
                <InlineSvg asset="three-years-of-income-tax-returns-mvv7lih1.svg" />
              </figure>
              <section
                className="world-object credit-application"
                data-thread-anchor="credit-application"
              >
                <p>APPLICATION / 0248</p>
                <div>
                  <span>REQUESTED AMOUNT</span>
                  <strong>C$25L</strong>
                </div>
              </section>
              <section
                className="world-object credit-assessment"
                data-thread-anchor="credit-assessment"
              >
                <p>FINANCIAL ASSESSMENT</p>
                <dl>
                  <div>
                    <dt>Revenue</dt>
                    <dd>C$42K</dd>
                    <small>Annual</small>
                  </div>
                  <div>
                    <dt>Cash flow</dt>
                    <dd>C$8.4K</dd>
                    <small>6 Months</small>
                  </div>
                  <div>
                    <dt>Obligations</dt>
                    <dd>C$2.1K</dd>
                    <small>Annual</small>
                  </div>
                  <div>
                    <dt>Score</dt>
                    <dd>742</dd>
                    <small>Bureau Score</small>
                  </div>
                </dl>
              </section>
              <section
                className="world-object credit-outcome"
                data-thread-anchor="credit-outcome"
              >
                <p className="credit-outcome-label">AMOUNT</p>
                <span className="credit-up-to">STARTING FROM</span>
                <strong>C$500</strong>
                <div className="credit-approval">
                  <span>OFFER READY</span>
                  <span>Review terms</span>
                </div>
              </section>
            </div>
            <ProjectLink />
          </article>
        </div>

        <section
          className="why-me"
          id="why-me"
          aria-labelledby="why-me-title"
          data-thread-anchor="why-me"
        >
          <div className="why-me-inner">
            <p className="why-me-eyebrow">
              <span className="why-me-eyebrow-dot" aria-hidden="true" />
              WHY ME
            </p>

            <h2
              className="why-me-title"
              id="why-me-title"
              data-thread-anchor="why-me-title"
            >
              <span>The risk</span>
              <span>you’re weighing</span>
              <span>is smaller</span>
              <span>than it looks.</span>
            </h2>
            <p className="why-me-intro" data-thread-anchor="why-me-intro">
              You’ve seen the work. Here’s what it means for your team.
            </p>

            <div className="why-me-points">
              <article
                className="why-me-point"
                data-thread-anchor="why-me-point-1"
              >
                <span
                  className="why-me-node"
                  aria-hidden="true"
                  data-thread-anchor="why-me-node-1"
                />
                <div
                  className="why-me-point-copy"
                  data-thread-anchor="why-me-copy-1"
                >
                  <span className="why-me-number">01</span>
                  <h3 className="why-me-point-title">
                    I own outcomes, not tickets.
                  </h3>
                  <p className="why-me-point-description">
                    I start from the problem and stay until it’s running in
                    production and improving. Fewer handoffs, fewer gaps, less
                    of your senior engineers’ time spent chasing context.
                  </p>
                </div>
              </article>

              <article
                className="why-me-point"
                data-thread-anchor="why-me-point-2"
              >
                <span
                  className="why-me-node"
                  aria-hidden="true"
                  data-thread-anchor="why-me-node-2"
                />
                <div
                  className="why-me-point-copy"
                  data-thread-anchor="why-me-copy-2"
                >
                  <span className="why-me-number">02</span>
                  <h3 className="why-me-point-title">
                    I ship, and I can prove it.
                  </h3>
                  <p className="why-me-point-description">
                    Every case study above went live. Tested, maintained, and
                    still working. That’s a track record, not a promise.
                  </p>
                </div>
              </article>

              <article
                className="why-me-point"
                data-thread-anchor="why-me-point-3"
              >
                <span
                  className="why-me-node"
                  aria-hidden="true"
                  data-thread-anchor="why-me-node-3"
                />
                <div
                  className="why-me-point-copy"
                  data-thread-anchor="why-me-copy-3"
                >
                  <span className="why-me-number">03</span>
                  <h3 className="why-me-point-title">
                    I use AI as leverage, not as a crutch.
                  </h3>
                  <p className="why-me-point-description">
                    I use AI-assisted engineering to move faster, then verify,
                    test, and take responsibility for every line that ships. In
                    2027, that judgment is the skill that matters.
                  </p>
                </div>
              </article>

              <article
                className="why-me-point"
                data-thread-anchor="why-me-point-4"
              >
                <span
                  className="why-me-node"
                  aria-hidden="true"
                  data-thread-anchor="why-me-node-4"
                />
                <div
                  className="why-me-point-copy"
                  data-thread-anchor="why-me-copy-4"
                >
                  <span className="why-me-number">04</span>
                  <h3 className="why-me-point-title">
                    I learn fast and don’t need babysitting.
                  </h3>
                  <p className="why-me-point-description">
                    Legacy systems, new stacks, unfamiliar domains. I read the
                    codebase, ask the right questions, and contribute early.
                    Ramp-up time is short.
                  </p>
                </div>
              </article>

              <article
                className="why-me-point"
                data-thread-anchor="why-me-point-5"
              >
                <span
                  className="why-me-node"
                  aria-hidden="true"
                  data-thread-anchor="why-me-node-5"
                />
                <div
                  className="why-me-point-copy"
                  data-thread-anchor="why-me-copy-5"
                >
                  <span className="why-me-number">05</span>
                  <h3 className="why-me-point-title">
                    I’m built for the long game.
                  </h3>
                  <p className="why-me-point-description">
                    Hiring across borders is a commitment, and I treat it as
                    one. I’m looking for a team to grow with, not a stepping
                    stone. The visa process is a one-time effort on your side.
                    The return is an engineer who stays invested in your
                    product.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section
          className="about-story"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="about-stage" data-thread-anchor="about-stage">
            <div className="about-profile" data-thread-anchor="about-profile">
              <div className="about-intro">
                <h2 className="about-heading" id="about-title">
                  <span>ONE THREAD,</span>
                  <span>FROM PROBLEMA</span>
                  <span>TO PRODUCTION.</span>
                </h2>
                <p className="about-personal">
                  I stay with an idea through every stage: understanding it,
                  designing it, building it, and keeping it alive after launch.
                </p>
              </div>
              <div className="about-byline">
                <p className="about-name">SKANDER NEFLI</p>
                <p className="about-role">
                  FULLSTACK DEVELOPER. Curious builder.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="contact-finale"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="contact-stage">
            <div className="contact-copy">
              <h2 className="contact-statement" id="contact-title">
                <span>JUDGE ME</span>
                <span>IN CONVERSATION.</span>
              </h2>
              <span
                className="contact-pull"
                data-thread-anchor="contact-cta"
              >
                LET&apos;S TALK.
              </span>
            </div>
            <ContactButtons />
          </div>
          <div className="contact-bottom">
            <a
              className="contact-top"
              href="#top"
              data-thread-anchor="contact-back-to-top"
            >
              BACK TO TOP <span aria-hidden="true">↑</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
