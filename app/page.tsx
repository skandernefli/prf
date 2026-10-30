import { InlineSvg } from "@/components/portfolio/inline-svg";
import { InlineReferenceSvg } from "@/components/portfolio/inline-reference-svg";
import { InlineReferenceElement } from "@/components/portfolio/inline-reference-element";
import type { CSSProperties } from "react";

const productCapabilities = [
  ["Product Strategy", "Find the right problem to solve.", "17.5038%", "12%", "79.8656px"],
  ["UX Research", "Understand people before shaping solutions.", "3.75068%", "31%", "50.6294px"],
  ["Interaction Design", "Make every action feel clear and natural.", "0%", "50%", "28px"],
  ["Design Systems", "Build consistency that grows with the product.", "3.75068%", "69%", "34.3907px"],
  ["Prototyping", "Make ideas tangible. Test what matters.", "17.5038%", "88%", "46.2335px"],
] as const;

const aiCapabilities = [
  ["AI Products", "Turn intelligence into useful experiences.", "82.4962%", "12%", "79.8656px"],
  ["Agentic Systems", "Multi agent orchestration with clear roles and handoffs.", "96.2493%", "31%", "50.6294px"],
  ["MCP", "Connect models to the tools they need.", "100%", "50%", "28px"],
  ["RAG", "Ground responses in relevant knowledge.", "96.2493%", "69%", "34.3907px"],
  ["Automation", "Turn repeated work into reliable workflows.", "82.4962%", "88%", "46.2335px"],
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
      <h3>{title}</h3>
      <ul>
        {items.map(([name, description, left, top, clearance]) => (
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
        <a className="wordmark" href="#top" aria-label="DG home">
          DG
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

      <main id="main-content" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 className="hero-title" id="hero-title">
              <span>I DESIGN</span>
              <span>PRODUCTS</span>
              <span>THAT THINK.</span>
            </h1>
            <div className="hero-footer">
              <div className="hero-support">
                <p>
                  Product designer working across digital experiences, AI
                  products and intelligent systems.
                </p>
              </div>
              <a className="scroll-cue" href="#work">
                SCROLL TO FOLLOW THE THREAD <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </section>

        <section className="selected-work" id="work" aria-labelledby="work-title">
          <div className="practice-intro">
            <div className="practice-copy">
              <h2 id="work-title">
                <span>FROM WHAT</span>
                <span>PEOPLE NEED</span>
                <span>TO WHAT</span>
                <span>FEELS RIGHT.</span>
              </h2>
            </div>
            <div className="practice-drawing" aria-hidden="true">
              <span className="practice-label practice-intent">INTENT</span>
              <span className="practice-label practice-interaction">
                INTERACTION
              </span>
              <span className="practice-label practice-system">SYSTEM</span>
            </div>
            <p className="practice-description">
              I connect human intent, product behavior and the systems
              underneath.
            </p>
          </div>
        </section>

        <section
          className="capabilities"
          id="capabilities"
          aria-labelledby="capabilities-title"
        >
          <div className="capability-heading">
            <h2 id="capabilities-title">
              <span>I DESIGN THE EXPERIENCE.</span>
              <span>AND THE INTELLIGENCE</span>
              <span>BEHIND IT.</span>
            </h2>
          </div>
          <div className="capability-orbit">
            <CapabilityList
              title="PRODUCT DESIGN"
              items={productCapabilities}
              side="product"
            />
            <CapabilityList
              title="AI SYSTEMS"
              items={aiCapabilities}
              side="ai"
            />
          </div>
        </section>

        <div className="project-worlds" id="projects">
          <article
            className="project-world world-eigna world-light"
            id="eigna"
            aria-labelledby="eigna-title"
          >
            <ProjectHeader
              number="01"
              category="PROPERTY MANAGEMENT"
              description="Manage properties, tenants, rent, maintenance and finances from one place."
            />
            <div className="world-composition">
              <figure className="world-object eigna-flat">
                <InlineSvg asset="unit-03-occupied-two-bedroom-flat-with-living-room-kitchen-and-bathroom-mvv7k1zy.svg" />
              </figure>
              <figure className="world-object eigna-lease">
                <InlineSvg asset="unit-03-lease-signed-monthly-rent-32000-mvv7k5ze.svg" />
              </figure>
              <figure className="world-object eigna-inspection">
                <InlineSvg asset="ai-inspection-compares-move-in-and-move-out-records-and-detects-wall-damage-with-94-percent-confidence-mvv7k4eb.svg" />
              </figure>
              <ProjectTitle id="eigna-title">EIGNA</ProjectTitle>
              <figure className="world-object eigna-repair">
                <InlineSvg asset="wall-repair-completed-4800-becomes-an-expense-in-the-property-ledger-mvv7k3he.svg" />
              </figure>
              <figure className="world-object eigna-book">
                <InlineSvg asset="property-03-ledger-rent-32000-repair-4800-other-expenses-1250-net-25950-the-same-repair-record-carries-into-itr--schedule-hp-mvv7k7e4.svg" />
              </figure>
            </div>
            <ProjectLink />
          </article>

          <article
            className="project-world world-orbit"
            id="orbit"
            aria-labelledby="orbit-title"
          >
            <ProjectHeader
              number="02"
              category="AGENTIC AI"
              description="Ask for what you need and Orbit works across the right tools to get it done."
            />
            <div className="world-composition">
              <figure className="world-object orbit-tracks">
                <InlineSvg asset="svg-19-mvv7k9wu.svg" />
              </figure>
              <figure className="world-object orbit-mail">
                <InlineSvg asset="svg-20-mvv7kaze.svg" />
              </figure>
              <figure className="world-object orbit-fragment orbit-document">
                <InlineSvg asset="svg-24-mvv7key1.svg" />
              </figure>
              <figure className="world-object orbit-fragment orbit-brief">
                <InlineSvg asset="svg-26-mvv7kj06.svg" />
              </figure>
              <figure className="world-object orbit-fragment orbit-draft">
                <InlineSvg asset="svg-22-mvv7kbn4.svg" />
              </figure>
              <ProjectTitle id="orbit-title">ORBIT</ProjectTitle>
              <figure className="world-object orbit-assistant">
                <InlineReferenceSvg label="Orbit finds the latest project update, analyzes the financials, and drafts a response to Alex across Search, Finance, Writing and Mail. Analysis included, ready for review before sending." />
              </figure>
            </div>
            <ProjectLink />
          </article>

          <article
            className="project-world world-mesa world-light"
            id="mesa"
            aria-labelledby="mesa-title"
          >
            <ProjectHeader
              number="03"
              category="WORKPLACE MEALS"
              description="A workplace meal platform for ordering food, managing benefits and running meal programs."
            />
            <div className="world-composition">
              <figure className="world-object mesa-plate">
                <InlineSvg asset="a-plate-drawn-in-fine-architectural-lines-mvv7kq9l.svg" />
              </figure>
              <figure className="world-object mesa-fork">
                <InlineSvg asset="a-fork-in-flat-linework-mvv7kqxu.svg" />
              </figure>
              <figure className="world-object mesa-message">
                <InlineReferenceSvg label="Employee in Teams or Slack: Order a rice bowl from Bowlstory." />
              </figure>
              <ProjectTitle id="mesa-title">MEALOPS</ProjectTitle>
              <figure className="world-object mesa-ticket">
                <InlineReferenceSvg label="Bowlstory order confirmed: one rice bowl, total 240 rupees" />
              </figure>
              <figure className="world-object mesa-reply">
                <InlineSvg asset="mealops-replies-order-placed-your-rice-bowl-is-on-its-way-mvv7kwbt.svg" />
              </figure>
              <figure className="world-object mesa-bag">
                <InlineSvg asset="meal-delivery-bag-on-the-way-arrives-at-1245-mvv7kzo8.svg" />
              </figure>
              <InlineReferenceElement
                label="Company wallet"
                className="world-object mesa-wallet"
                role="group"
              />
              <InlineReferenceElement
                label="Company meal statistics"
                className="world-object mesa-dashboard"
                role="group"
              />
            </div>
            <ProjectLink />
          </article>

          <article
            className="project-world papertrail-scan"
            id="papertrail"
            aria-labelledby="papertrail-title"
          >
            <ProjectHeader
              number="04"
              category="DOCUMENT AUTOMATION"
              description="Upload accounting documents and turn them into reviewed, structured data ready to use."
            />
            <div className="world-composition">
              <figure className="scan-ledger scan-ledger-top">
                <InlineSvg asset="svg-37-mvv7l25k.svg" />
              </figure>
              <figure className="scan-ledger scan-ledger-bottom">
                <InlineSvg asset="svg-38-mvv7l40p.svg" />
              </figure>
              <ProjectTitle id="papertrail-title">PAPERTRAIL</ProjectTitle>
              <figure className="scan-paper scan-paper-acme">
                <InlineReferenceSvg label="ACME SUPPLY invoice" />
              </figure>
              <figure className="scan-paper scan-paper-river">
                <InlineReferenceSvg label="RIVER &amp; CO. invoice" />
              </figure>
              <figure className="scan-paper scan-paper-river scan-paper-river-cover">
                <InlineReferenceSvg label="RIVER &amp; CO. invoice" />
              </figure>
              <figure className="scan-paper scan-paper-front">
                <InlineReferenceSvg label="Northridge invoice INV-1042, total 1,280.00, verified" />
              </figure>
              <figure className="scan-paper scan-paper-main">
                <InlineReferenceSvg label="Northridge invoice INV-1042, total 1,280.00, verified" />
              </figure>
              <figure className="scan-paper scan-paper-rejected">
                <InlineReferenceSvg label="HARBOR LTD. invoice, rejected" />
              </figure>
              <InlineReferenceElement
                label="Extracted invoice values"
                className="scan-extracted"
              />
            </div>
            <ProjectLink />
          </article>

          <article
            className="project-world world-scribe world-light"
            id="scribe"
            aria-labelledby="scribe-title"
          >
            <ProjectHeader
              number="05"
              category="MEETING INTELLIGENCE"
              description="Turn meetings into structured documents such as BRDs, SOPs and project charters."
            />
            <div className="world-composition">
              <figure className="world-object scribe-audio">
                <InlineSvg asset="meeting-recording-playback-kickoffmp4-24-minutes-16-seconds-mvv7l774.svg" />
              </figure>
              <figure className="world-object scribe-analysis">
                <InlineSvg asset="ai-analyzes-the-meeting-to-identify-goals-owners-and-decisions-mvv7l7uu.svg" />
              </figure>
              <ProjectTitle id="scribe-title">SCRIBE</ProjectTitle>
              <figure className="world-object scribe-charter">
                <InlineSvg asset="generated-project-charter-goal-owners-and-key-decisions-a-revision-adds-the-approval-requirement-mvv7lan7.svg" />
              </figure>
              <figure className="world-object scribe-request">
                <InlineReferenceSvg label="Revision request: Add an approval step." />
              </figure>
              <figure className="world-object scribe-reply">
                <InlineSvg asset="scribe-replies-updated-in-version-2-mvv7lbwl.svg" />
              </figure>
            </div>
            <ProjectLink />
          </article>

          <article
            className="project-world creditflow-world"
            id="creditflow"
            aria-labelledby="creditflow-title"
          >
            <ProjectHeader
              number="06"
              category="DIGITAL LENDING"
              description="Apply for a business loan, submit financial documents and move from eligibility to disbursement."
            />
            <div className="world-composition">
              <figure className="world-object credit-pan">
                <InlineSvg asset="pan-identity-card-with-masked-personal-details-mvv7le41.svg" />
              </figure>
              <figure className="world-object credit-gst">
                <InlineSvg asset="gst-return-with-filing-period-masked-gstin-and-tax-summary-mvv7lf08.svg" />
              </figure>
              <ProjectTitle id="creditflow-title" className="world-title credit-title">
                CREDIFLOW
              </ProjectTitle>
              <figure className="world-object credit-bank">
                <InlineSvg asset="six-months-of-business-bank-statements-mvv7lkll.svg" />
              </figure>
              <figure className="world-object credit-itr">
                <InlineSvg asset="three-years-of-income-tax-returns-mvv7lih1.svg" />
              </figure>
              <section className="world-object credit-application">
                <p>APPLICATION / 0248</p>
                <div>
                  <span>REQUESTED AMOUNT</span>
                  <strong>₹25L</strong>
                </div>
              </section>
              <section className="world-object credit-assessment">
                <p>FINANCIAL ASSESSMENT</p>
                <dl>
                  <div>
                    <dt>Revenue</dt>
                    <dd>₹42L</dd>
                    <small>Annual</small>
                  </div>
                  <div>
                    <dt>Cash flow</dt>
                    <dd>₹8.4L</dd>
                    <small>6 Months</small>
                  </div>
                  <div>
                    <dt>Obligations</dt>
                    <dd>₹2.1L</dd>
                    <small>Annual</small>
                  </div>
                  <div>
                    <dt>Score</dt>
                    <dd>742</dd>
                    <small>Bureau Score</small>
                  </div>
                </dl>
              </section>
              <section className="world-object credit-outcome">
                <p className="credit-outcome-label">ELIGIBLE</p>
                <span className="credit-up-to">UP TO</span>
                <strong>₹18.5L</strong>
                <div className="credit-approval">
                  <span>OFFER READY</span>
                  <span>Review terms</span>
                </div>
              </section>
            </div>
            <ProjectLink />
          </article>
        </div>

        <section className="about-story" id="about" aria-labelledby="about-title">
          <div className="about-stage">
            <div className="about-profile">
              <div className="about-intro">
                <h2 className="about-heading" id="about-title">
                  <span>EVERY PRODUCT</span>
                  <span>CARRIES A</span>
                  <span>HUMAN IMPRINT.</span>
                </h2>
                <p className="about-personal">
                  Mine comes from understanding people, shaping how things
                  feel, and building the systems that make them work.
                </p>
              </div>
              <div className="about-byline">
                <p className="about-name">DAKSH GAJJAR.</p>
                <p className="about-role">Product designer. Curious builder.</p>
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
                <span>HAVE A</span>
                <span>PROBLEM</span>
                <span>WORTH</span>
                <span>UNTANGLING?</span>
              </h2>
              <span className="contact-pull">LET&apos;S TALK.</span>
            </div>
          </div>
          <div className="contact-bottom">
            <a className="contact-top" href="#top">
              BACK TO TOP <span aria-hidden="true">↑</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
