import { InlineReferenceElement } from "@/components/portfolio/inline-reference-element";
import { InlineReferenceSvg } from "@/components/portfolio/inline-reference-svg";
import { ContactButtons } from "@/components/portfolio/contact-buttons";
import { ThreadLayer } from "@/components/portfolio/thread/thread-layer";
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
  threadAnchor,
  threadLabel,
}: {
  children: string;
  id: string;
  className?: string;
  threadAnchor?: string;
  threadLabel?: string;
}) {
  return (
    <h3
      className={className}
      id={id}
      data-thread-anchor={threadAnchor}
      data-thread-label={threadLabel}
    >
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
      <ThreadLayer />
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

      <main id="main-content" tabIndex={-1}>
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
                FR<span
                  className="thread-glyph"
                  data-thread-anchor="hero.from.o"
                  data-thread-label="Hero · FROM / O"
                  data-thread-anchor-mode="range"
                >O</span>M
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
                >C</span>ONCEPT
              </span>
              <span
                data-thread-anchor="hero.launch"
                data-thread-label="Hero · TO LAUNCH line"
              >
                TO LAUN<span
                  className="thread-glyph"
                  data-thread-anchor="hero.launch.ch"
                  data-thread-label="Hero · TO LAUNCH / CH"
                  data-thread-anchor-mode="range"
                >CH</span>
              </span>
            </h1>
            <div className="hero-footer">
              <div className="hero-support">
                <p>
                  Designing the experience. Engineering the intelligence.
                  End-to-end product ownership.
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

        <section
          className="selected-work"
          id="work"
          aria-labelledby="work-title"
        >
          <div className="practice-intro">
            <div className="practice-copy">
              <h2
                id="work-title"
                data-thread-anchor="work.heading"
                data-thread-label="Selected Work · title box"
              >
                <span>ENGINEERING</span>
                <span>PRODUCTS</span>
                <span>WITH IMPACT</span>
              </h2>
            </div>
            <div
              className="practice-drawing"
              aria-hidden="true"
              data-thread-anchor="work.drawing"
              data-thread-label="Selected Work · practice drawing"
            >
              <span
                className="practice-label practice-step-problem"
                data-thread-anchor="work.step.problem"
                data-thread-label="Selected Work · Problem"
              >
                Problem
              </span>
              <span
                className="practice-label practice-step-investigate"
                data-thread-anchor="work.step.investigate"
                data-thread-label="Selected Work · Investigate"
              >
                Investigate
              </span>
              <span
                className="practice-label practice-step-design"
                data-thread-anchor="work.step.design"
                data-thread-label="Selected Work · Design and Architect"
              >
                Design and Architect
              </span>
              <span
                className="practice-label practice-step-build"
                data-thread-anchor="work.step.build"
                data-thread-label="Selected Work · Build"
              >
                Build
              </span>
              <span
                className="practice-label practice-step-verify"
                data-thread-anchor="work.step.verify"
                data-thread-label="Selected Work · Verify & Test"
              >
                Verify &amp; Test
              </span>
              <span
                className="practice-label practice-step-ship"
                data-thread-anchor="work.step.ship"
                data-thread-label="Selected Work · Ship"
              >
                Ship
              </span>
              <span
                className="practice-label practice-step-operate"
                data-thread-anchor="work.step.operate"
                data-thread-label="Selected Work · Operate and improve"
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
            data-thread-anchor="project.kabri"
            data-thread-label="KABRI · section"
          >
            <ProjectHeader
              number="01"
              category="BUSINESS PROCESS AUTOMATION"
              description="Automated product configuration, quotation generation, and order management for a manufacturing business."
            />
            <div className="world-composition">
              <figure
                className="world-object kabri-flat"
                data-thread-anchor="project.kabri.flat"
                data-thread-label="KABRI · floor-plan drawing"
              >
                <span dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 620 345" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="Cab 03: blueprint waiting for approval">
    <defs>
        <mask id="kabri-flat-wall-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="620" height="345">
            <rect width="620" height="345" fill="white" />
            <rect x="234" y="6" width="48" height="14" fill="black" />
            <rect class="kabri-flat-side-opening" x="598" y="153" width="14" height="20" fill="black" />
        </mask>
    </defs>
    <g mask="url(#kabri-flat-wall-mask)" stroke="currentColor" stroke-width=".9" stroke-linejoin="round">
        <path d="M30 8H610V329H291v-10h309V18H40v210H16v91h226v10H6V218H30Z" fill="var(--world-bg)" />
        <path d="M35 13h570v311H291M242 324H11V223h24V13" opacity=".45" />
        <path
            d="M210 18h7v111h-7zM210 174h7v41h-7zM210 260h7v59h-7zM416 18h7v111h-7zM416 174h7v111h-7zM416 312h7v7h-7zM40 174h170v6H40zM423 174h177v6H423zM423 248h37v6h-37zM500 248h100v6H500zM510 180v68"
            fill="var(--world-bg)" />
        <g fill="var(--world-bg)">
            <path
                d="M67 8h72v10H67zM268 8h85v10h-85zM476 8h73v10h-73zM65 319h85v10H65zM331 319h59v10h-59zM545 319h36v10h-36z" />
        </g>
        <path
            d="M67 12h72m-72 3h72M268 12h85m-85 3h85M476 12h73m-73 3h73M65 323h85m-85 3h85M331 323h59m-59 3h59M545 323h36m-36 3h36"
            opacity=".6" />
    </g>
    <g stroke="currentColor" stroke-width=".9">
        <path d="M234 8v10M282 8v10" />
        <path class="kabri-flat-side-opening" d="M600 153h10M600 173h10" />
    </g>
    <g class="kabri-furnishings" stroke="currentColor" stroke-width=".75" opacity=".6">
        <g>
            <rect x="66" y="49" width="91" height="108" rx="2" />
            <path
                d="M63 49v-5h97v5M70 53h38v23h-38zM115 53h38v23h-38zM66 82h91m-91 7h91M71 90v61h81V90M43 49h17v22h-17zM163 49h17v22h-17z" />
            <circle cx="51.5" cy="60" r="5" />
            <circle cx="171.5" cy="60" r="5" />
        </g>
        <g>
            <rect x="474" y="49" width="91" height="108" rx="2" />
            <path
                d="M471 49v-5h97v5M478 53h38v23h-38zM523 53h38v23h-38zM474 82h91m-91 7h91M479 90v61h81V90M451 49h17v22h-17zM571 49h17v22h-17z" />
            <circle cx="459.5" cy="60" r="5" />
            <circle cx="579.5" cy="60" r="5" />
        </g>
        <rect x="267" y="49" width="116" height="42" rx="3" />
        <path
            d="M272 53h106v9H272zM272 65h32v21h-32zM307 65h33v21h-33zM343 65h35v21h-35zM272 91v4m106-4v4M236 48h14v103h-14zM240 53h6v93h-6z" />
        <rect x="293" y="113" width="67" height="37" rx="17" />
        <path d="m318 119 16 3-3 19-16-3zM375 121h20v20h-20z" />
        <g transform="translate(356 172) rotate(25)">
            <rect width="35" height="38" rx="4" />
            <path d="M4 5h27v8H4zM6 16h23v16H6zM0 13h5v20H0m35-20h-5v20h5" />
        </g>
        <path
            d="M29 238h162v68H29zM29 271h162M36 244h45v21H36zM41 247h35v15H41zM61 241v-9h8M89 242h46v26H89zM29 277h162m-113 0v29m55-29v29M156 244h27v21h-27z" />
        <g>
            <circle cx="100" cy="250" r="4" />
            <circle cx="100" cy="261" r="3" />
        </g>
        <g>
            <circle cx="124" cy="250" r="4" />
            <circle cx="124" cy="261" r="3" />
        </g>
        <path
            d="M433 190h59v15h-59zM439 193h22v8h-22zM466 193h21v8h-21zM526 190h61v45h-61zM531 195h51v35h-51zM530 230l53-35M448 267h20v13h-20zM449 282c-5 22 25 22 18 0zM508 264h79v43h-79zM514 269h67v32h-67q-9-16 0-32" />
    </g>
    <g fill="currentColor" font-size="10"><text x="5" y="340">CAB 1103</text><text class="kabri-occupied" x="84"
            y="340">APPROVED</text><text x="610" y="340" text-anchor="end">10' x 12' or 12' x 20'</text></g>
    <circle data-thread-anchor="project.kabri.door.north"
        data-thread-label="KABRI · floor-plan north door"
        data-thread-anchor-mode="center" cx="258" cy="8" r="2"
        fill="none" stroke="none" pointer-events="none" />
    <circle data-thread-anchor="project.kabri.door.east"
        data-thread-label="KABRI · floor-plan east door"
        data-thread-anchor-mode="center" cx="605" cy="163" r="2"
        fill="none" stroke="none" pointer-events="none" />
</svg>` }} />
              </figure>
              <figure
                className="world-object kabri-lease"
                data-thread-anchor="project.kabri.lease"
                data-thread-label="KABRI · lease document"
              >
                <span dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 205 218" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="Cabin Construction Estimate, Estimated Cost C$32,000">
    <path d="M1 1h203v216H1Z" fill="var(--world-bg)" stroke="currentColor" stroke-width=".85" />
    <path d="M22 60h161M22 143h161M22 198h108" stroke="currentColor" stroke-width=".6" opacity=".4" />
    <g fill="currentColor"><text x="22" y="29" font-size="12">CONSTRUCTION ESTIMATE</text>
        <g font-size="8" opacity=".6"><text x="22" y="46">LOG CABIN</text><text x="183" y="46" text-anchor="end">JOB
                03</text><text x="22" y="80">ESTIMATED COST</text></g><text x="22" y="106"
            font-size="20">C$32,000</text><text x="183" y="106" text-anchor="end" font-size="9" opacity=".6">
            CAD</text><text x="22" y="127" font-size="9">CLIENT / 01</text><text class="kabri-lease-check" x="183"
            y="127" text-anchor="end" font-size="8">APPROVED</text><text x="22" y="160" font-size="8"
            opacity=".6">BUILDER
            SIGNATURE</text>
    </g>
    <path class="kabri-signature" pathLength="1" transform="translate(8 77) scale(.65)"
        d="M23 178c58-68 46-32 4 2c18-8 24-44 23-16s17-23 13-5s20-16 17 0s15-14 14 0s15-9 24-3l-91 29"
        stroke="currentColor" stroke-width="1.1" />
    <g class="kabri-lease-check">
        <circle cx="169" cy="183" r="11" stroke="currentColor" stroke-width=".8" /><svg viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
            x="161" y="175" width="16" height="16">
            <path d="M5 12l5 5L20 6" />
        </svg>
    </g>
</svg>` }} />
              </figure>
              <figure
                className="world-object kabri-inspection"
                data-thread-anchor="project.kabri.inspection"
                data-thread-label="KABRI · inspection document"
              >
                <span dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 370 225" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="AI inspection compares move-in and move-out records and detects wall damage with 94 percent confidence">
    <g stroke="currentColor" stroke-width=".85">
        <path d="M9 19 157 63V195L9 151Z M40 49l24 7v86l-24-7Z" fill="var(--world-bg)" fill-rule="evenodd"
            stroke="none" />
        <path d="M9 19 157 63M9 25l148 44M9 30l148 44M17 15v141m8-139v141M10 145l146 44M10 151l146 44M133 51v132"
            opacity=".45" />
        <path
            d="m31 37 42 13v106l-42-13zM35 43l34 10v96l-34-10zM40 49l24 7v86l-24-7zM48 52v85M31 144l-5 6 48 14 5-6M29 32v117" />
        <path d="m85 67 64 19M84 99l65 19M84 131l65 19M101 73v25m17 6v27m-17 6v25" opacity=".13" />
        <path class="kabri-crack" d="m119 70-6 19 5 11-13 16 3 13-13 22m10-35-12-8-3-13m18 34 13 8 4 15" />
        <path class="kabri-detection" d="M92 75h-8v8m47-8h8v8m0 62v8h-8m-39 0h-8v-8" stroke="var(--signal)"
            stroke-width="1.3" />
    </g>
    <g transform="translate(200 0)">
        <g stroke="currentColor" stroke-width=".85">
            <path d="M9 19 157 63V195L9 151Z M40 49l24 7v86l-24-7Z" fill="var(--world-bg)" fill-rule="evenodd"
                stroke="none" />
            <path d="M9 19 157 63M9 25l148 44M9 30l148 44M17 15v141m8-139v141M10 145l146 44M10 151l146 44M133 51v132"
                opacity=".45" />
            <path
                d="m31 37 42 13v106l-42-13zM35 43l34 10v96l-34-10zM40 49l24 7v86l-24-7zM48 52v85M31 144l-5 6 48 14 5-6M29 32v117" />
            <path d="m85 67 64 19M84 99l65 19M84 131l65 19M101 73v25m17 6v27m-17 6v25" opacity=".13" />
        </g>

    </g>
    <g fill="currentColor" font-size="11"><text x="22" y="218">BEFORE</text><text x="222" y="218">AFTER</text></g>
</svg>` }} />
              </figure>
              <ProjectTitle
                id="kabri-title"
                threadAnchor="project.kabri.title"
                threadLabel="KABRI · title"
              >
                KABRI
              </ProjectTitle>
              <figure
                className="world-object kabri-repair"
                data-thread-anchor="project.kabri.repair"
                data-thread-label="KABRI · repair document"
              >
                <span dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 400 275" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="Cabin lumber order completed; C$4,800 becomes an expense in the company ledger">
    <g class="kabri-wrench" stroke="currentColor" stroke-width="1" stroke-linejoin="round"
        transform="translate(-9 5) rotate(-12 180 100)">
        <path
            d="M40 169 204 49C201 22 224 4 253 9L235 39 248 62 274 62 292 32C308 59 297 87 270 95C259 98 249 97 239 93L62 215C31 231 10 187 40 169Z"
            fill="var(--world-bg)" />
        <circle cx="49" cy="193" r="10" />
        <path d="M69 185 215 76M72 193 219 84M227 32l-6 9 20 34h39l6-10" opacity=".45" />
    </g>
    <g class="kabri-repair-desktop">
        <g fill="currentColor" font-size="11"><text x="186" y="198">LUMBER ORDER</text><text x="186"
                y="233">C$4,800</text><text class="kabri-assigned" x="186" y="252">ORDERED</text><text <path
                d="M186 211h143" stroke="currentColor" stroke-width=".6" opacity=".4" />
        </g>
</svg>` }} />
              </figure>
              <figure
                className="world-object kabri-book"
                data-thread-anchor="project.kabri.book"
                data-thread-label="KABRI · handbook"
              >
                <span dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 720 270" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="Cabin Company Ledger. Sales C$32,000, Lumber C$4,800, Other Expenses C$1,250, Net Profit C$25,950. Lumber expense record linked to corporate tax form.">
    <g stroke="currentColor" stroke-width=".85" fill="var(--world-bg)">
        <path d="M7 15 342 6Q358 7 365 14Q374 8 393 10L712 13 719 265 377 265Q362 260 349 264L1 263Z" />
        <path d="m12 9 332-5q13 0 21 10q13-8 28-8l315 2 6 251-337 1q-15-6-28 0L6 257Z" />
        <path d="M18 1 342 1Q357 2 365 12Q378 3 393 3L703 3 707 252 382 253Q371 251 365 257Q356 251 343 252L12 250Z" />
        <path d="M365 12v245m-5-239v231m11-235v234" opacity=".45" />
    </g>
    <g stroke="currentColor" stroke-width=".6" opacity=".5">
        <path d="M43 58h283M43 189h283M402 58h270M402 189h270" />
    </g>
    <g fill="currentColor" font-size="12"><text x="43" y="37">Q2 / CABIN SALES</text><text x="402" y="37">TAX / T2
            CORP</text>
    </g>
    <g data-kabri="ledger" data-thread-scrub="true" fill="currentColor" font-size="13" style="--kabri-progress: 0;"
        data-thread-progress="0.0000">
        <g class="kabri-rent-row"><text x="43" y="98">REVENUE</text><text x="326" y="98" text-anchor="end">+
                C$32,000
            </text></g>
        <g class="kabri-expense-row"><text x="43" y="133">LUMBER</text><text x="326" y="133" text-anchor="end">−
                C$4,800
            </text></g>
        <g class="kabri-other-row"><text x="43" y="168">HARDWARE</text><text x="326" y="168" text-anchor="end">−
                C$1,250
            </text></g>
        <g class="kabri-net-row" font-size="18"><text x="43" y="222">NET</text><text x="326" y="222"
                text-anchor="end">C$25,950</text></g>
    </g>
    <g data-kabri="tax" data-thread-scrub="true" fill="currentColor" font-size="13" style="--kabri-progress: 0;"
        data-thread-progress="0.0000">
        <g class="kabri-tax-record"><text x="402" y="98">RAW MATERIALS</text><text x="672" y="98"
                text-anchor="end">C$4,800</text><text x="402" y="133">INVOICE</text><text x="672" y="133"
                text-anchor="end">MATCHED</text><text x="402" y="168">SCHEDULE</text><text class="kabri-tax-form"
                x="672" y="168" text-anchor="end" font-size="11">CRA / SCHEDULE 125</text><text class="kabri-tax-status"
                x="402" y="222" font-size="18">FILED</text>
            <circle cx="657" cy="216" r="13" fill="none" stroke="currentColor" stroke-width=".8" /><svg
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"
                stroke-linejoin="round" aria-hidden="true" x="648" y="207" width="18" height="18">
                <path d="M5 12l5 5L20 6" />
            </svg>
        </g>
    </g>
    <g stroke="currentColor" stroke-width=".8" fill="var(--world-bg)">
        <ellipse cx="356" cy="39" rx="3" ry="5" />
        <ellipse cx="375" cy="39" rx="3" ry="5" />
        <path d="M356 39c-7-10 25-10 19 0m-19 0c-4-5 22-5 19 0" />
    </g>
    <g stroke="currentColor" stroke-width=".8" fill="var(--world-bg)">
        <ellipse cx="356" cy="123" rx="3" ry="5" />
        <ellipse cx="375" cy="123" rx="3" ry="5" />
        <path d="M356 123c-7-10 25-10 19 0m-19 0c-4-5 22-5 19 0" />
    </g>
    <g stroke="currentColor" stroke-width=".8" fill="var(--world-bg)">
        <ellipse cx="356" cy="210" rx="3" ry="5" />
        <ellipse cx="375" cy="210" rx="3" ry="5" />
        <path d="M356 210c-7-10 25-10 19 0m-19 0c-4-5 22-5 19 0" />
    </g>
</svg>` }} />
              </figure>
            </div>
            <ProjectLink />
          </article>
          <article
            className="project-world norma-scan"
            id="norma"
            aria-labelledby="norma-title"
            data-thread-anchor="project.norma"
            data-thread-label="NORMA · section"
          >
            <ProjectHeader
              number="02"
              category="REAL ESTATE DATA INTELLIGENCE & ANALYTICS"
              description="A real estate intelligence platform unifying property data, analytics, and business insights."
            />
            <div className="world-composition">
              <figure
                className="scan-ledger scan-ledger-top"
                data-thread-anchor="project.norma.ledger-top"
                data-thread-label="NORMA · top ledger"
              >
                <span dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 760 420" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="currentColor" stroke-width=".8">
        <path d="M1 1h758v418H1zM1 63h758M1 105h758M485 1v62M398 63v356M461 63v356M548 63v356M688 63v356" />
        <path d="M1 150h758" />
        <path d="M1 193h758" />
        <path d="M1 236h758" />
        <path d="M1 279h758" />
        <path d="M1 322h758" />
        <path d="M1 365h758" />
    </g>
    <g fill="currentColor" font-size="14"><text x="24" y="38" font-size="20">TRANSACTION</text><text x="575"
            y="38">No.</text><text x="28" y="89">PROPERTY CHARACTERISTICS</text><text x="416" y="89">QTY</text><text
            x="480" y="89">SELL</text><text x="597" y="89">BUY</text></g>
</svg>` }} />
              </figure>
              <figure
                className="scan-ledger scan-ledger-bottom"
                data-thread-anchor="project.norma.ledger-bottom"
                data-thread-label="NORMA · bottom ledger"
              >
                <span dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 700 250" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke="currentColor" stroke-width=".8"><path d="M1 1h698v248H1zM1 50h698M1 95h698M1 140h698M395 1v248M443 1v248M680 1v248"/></g><g fill="currentColor" font-size="14"><text x="20" y="32">SUBTOTAL</text><text x="20" y="78">TAX</text><text x="20" y="124">TOTAL</text><text x="501" y="32">1,280.00</text><text x="534" y="78">0.00</text><text x="501" y="124">1,280.00</text></g></svg>` }} />
              </figure>
              <ProjectTitle
                id="norma-title"
                threadAnchor="project.norma.title"
                threadLabel="NORMA · title"
              >
                NORMA
              </ProjectTitle>
              <figure
                className="scan-paper scan-paper-acme"
                data-thread-anchor="project.norma.paper-acme"
                data-thread-label="NORMA · ACME document"
              >
                <InlineReferenceSvg name="acme-invoice" />
              </figure>
              <figure
                className="scan-paper scan-paper-river"
                data-thread-anchor="project.norma.paper-river"
                data-thread-label="NORMA · River document"
              >
                <InlineReferenceSvg name="river-invoice" />
              </figure>
              <figure
                className="scan-paper scan-paper-river scan-paper-river-cover"
                data-thread-anchor="project.norma.paper-river-cover"
                data-thread-label="NORMA · River document cover"
              >
                <InlineReferenceSvg name="river-invoice" />
              </figure>
              <figure
                className="scan-paper scan-paper-front"
                data-thread-anchor="project.norma.paper-front"
                data-thread-label="NORMA · front document"
              >
                <InlineReferenceSvg name="northridge-invoice-verified" />
              </figure>
              <figure
                className="scan-paper scan-paper-main"
                data-thread-anchor="project.norma.paper-main"
                data-thread-label="NORMA · main document"
              >
                <InlineReferenceSvg name="northridge-invoice-verified" />
              </figure>
              <figure
                className="scan-paper scan-paper-rejected"
                data-thread-anchor="project.norma.paper-rejected"
                data-thread-label="NORMA · rejected document"
              >
                <InlineReferenceSvg name="harbor-invoice-rejected" />
              </figure>
              <InlineReferenceElement
                label="Extracted invoice values"
                className="scan-extracted"
              />
            </div>
            <ProjectLink />
          </article>

          <article
            className="project-world world-mesa world-light"
            id="mesa"
            aria-labelledby="mesa-title"
            data-thread-anchor="project.shopops"
            data-thread-label="SHOPOPS · section"
          >
            <ProjectHeader
              number="03"
              category="E-COMMERCE AND ASSISTIVE HEALTHCARE EQUIPMENT"
              description="Modernized assistive equipment e-commerce with product discovery, filtering, and integrated product data."
            />
            <div className="world-composition">
              <figure
                className="world-object mesa-plate"
                data-thread-anchor="project.shopops.plate"
                data-thread-label="SHOPOPS · plate"
              >
                <span dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="A wheelchair drawn in fine architectural lines">
    <!-- Frame: backrest, push handle, armrest, seat, leg rest, footplate, caster -->
    <g stroke="currentColor" stroke-width="1" stroke-linejoin="round" stroke-linecap="round">
        <!-- Backrest panel -->
        <path d="M118 96 L146 96 L158 224 L132 224 Z" fill="var(--world-bg)"></path>
        <!-- Push handle -->
        <path d="M118 96 L100 90 H78 a6 6 0 0 0 0 12 H112"></path>
        <!-- Armrest pad and post -->
        <rect x="136" y="156" width="130" height="10" rx="5" fill="var(--world-bg)"></rect>
        <path d="M250 166 V224"></path>
        <path d="M246 166 V224"></path>
        <!-- Seat cushion -->
        <rect x="128" y="224" width="198" height="16" rx="7" fill="var(--world-bg)"></rect>
        <!-- Leg rest hanger -->
        <path d="M318 240 L360 392"></path>
        <path d="M326 238 L368 390"></path>
        <!-- Footplate -->
        <path d="M350 392 H410 a4 4 0 0 1 0 12 H356 a6 6 0 0 1 -6 -12Z" fill="var(--world-bg)"></path>
        <!-- Caster tube, fork and wheel -->
        <path d="M300 240 V420"></path>
        <path d="M308 240 V420"></path>
        <rect x="293" y="416" width="22" height="12" rx="3" fill="var(--world-bg)"></rect>
        <circle cx="304" cy="448" r="22" fill="var(--world-bg)"></circle>
        <circle cx="304" cy="448" r="15"></circle>
        <circle cx="304" cy="448" r="4"></circle>
    </g>

    <!-- Rear wheel: tire and push rim -->
    <g stroke="currentColor" stroke-width="1">
        <circle cx="205" cy="355" r="115" fill="var(--world-bg)"></circle>
        <circle cx="205" cy="355" r="109"></circle>
        <circle cx="205" cy="355" r="88"></circle>
        <circle cx="205" cy="355" r="84"></circle>
        <circle cx="205" cy="355" r="12"></circle>
        <circle cx="205" cy="355" r="5"></circle>
    </g>

    <!-- Tire tread -->
    <circle cx="205" cy="355" r="112" stroke="currentColor" stroke-width="5" stroke-dasharray="1.5 4" opacity=".22">
    </circle>

    <!-- Spokes -->
    <g stroke="currentColor" stroke-width=".5" opacity=".22">
        <path d="M205 343v-255" transform="translate(0 0) scale(1)" style="display:none"></path>
        <path d="M205 343V271" transform="rotate(0 205 355)"></path>
        <path d="M205 343V271" transform="rotate(15 205 355)"></path>
        <path d="M205 343V271" transform="rotate(30 205 355)"></path>
        <path d="M205 343V271" transform="rotate(45 205 355)"></path>
        <path d="M205 343V271" transform="rotate(60 205 355)"></path>
        <path d="M205 343V271" transform="rotate(75 205 355)"></path>
        <path d="M205 343V271" transform="rotate(90 205 355)"></path>
        <path d="M205 343V271" transform="rotate(105 205 355)"></path>
        <path d="M205 343V271" transform="rotate(120 205 355)"></path>
        <path d="M205 343V271" transform="rotate(135 205 355)"></path>
        <path d="M205 343V271" transform="rotate(150 205 355)"></path>
        <path d="M205 343V271" transform="rotate(165 205 355)"></path>
        <path d="M205 343V271" transform="rotate(180 205 355)"></path>
        <path d="M205 343V271" transform="rotate(195 205 355)"></path>
        <path d="M205 343V271" transform="rotate(210 205 355)"></path>
        <path d="M205 343V271" transform="rotate(225 205 355)"></path>
        <path d="M205 343V271" transform="rotate(240 205 355)"></path>
        <path d="M205 343V271" transform="rotate(255 205 355)"></path>
        <path d="M205 343V271" transform="rotate(270 205 355)"></path>
        <path d="M205 343V271" transform="rotate(285 205 355)"></path>
        <path d="M205 343V271" transform="rotate(300 205 355)"></path>
        <path d="M205 343V271" transform="rotate(315 205 355)"></path>
        <path d="M205 343V271" transform="rotate(330 205 355)"></path>
        <path d="M205 343V271" transform="rotate(345 205 355)"></path>
    </g>
</svg>` }} />
              </figure>
              <figure
                className="world-object mesa-fork"
                data-thread-anchor="project.shopops.fork"
                data-thread-label="SHOPOPS · fork"
              >
                <span dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 90 490" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="A medical walking cane in flat linework">
    <!-- Upper tube -->
    <rect x="56" y="100" width="12" height="150" fill="var(--world-bg)" stroke="currentColor" stroke-width="1.2"></rect>
    <!-- Lower adjustable tube -->
    <rect x="58" y="258" width="8" height="182" fill="var(--world-bg)" stroke="currentColor" stroke-width="1.2"></rect>
    <!-- Handle crook -->
    <path d="M68 52A30 30 0 0 0 8 52V74A6 6 0 0 0 20 74V52A18 18 0 0 1 56 52V96H68Z" fill="var(--world-bg)"
        stroke="currentColor" stroke-width="1.2"></path>
    <!-- Comfort grip -->
    <rect x="5" y="54" width="18" height="34" rx="7" fill="var(--world-bg)" stroke="currentColor" stroke-width="1.2">
    </rect>
    <!-- Collars -->
    <rect x="53" y="96" width="18" height="8" rx="2" fill="var(--world-bg)" stroke="currentColor" stroke-width="1.2">
    </rect>
    <rect x="53" y="244" width="18" height="14" rx="2" fill="var(--world-bg)" stroke="currentColor" stroke-width="1.2">
    </rect>
    <!-- Rubber tip -->
    <path d="M58 438H66L70 472Q70 482 62 482Q54 482 54 472Z" fill="var(--world-bg)" stroke="currentColor"
        stroke-width="1.2"></path>
    <!-- Details: grip ridges, height-adjust holes, lock button, tip ring -->
    <path d="M9 64h10M9 72h10M9 80h10M56 214h12M62 112v120M56 452h12" stroke="currentColor" stroke-width=".7"
        opacity=".5"></path>
    <g stroke="currentColor" stroke-width=".7" opacity=".5">
        <circle cx="62" cy="290" r="1.8"></circle>
        <circle cx="62" cy="314" r="1.8"></circle>
        <circle cx="62" cy="338" r="1.8"></circle>
        <circle cx="62" cy="362" r="1.8"></circle>
        <circle cx="62" cy="386" r="1.8"></circle>
        <circle cx="62" cy="251" r="2.4"></circle>
    </g>
</svg>` }} />
              </figure>
              <figure
                className="world-object mesa-message"
                data-thread-anchor="project.shopops.message"
                data-thread-label="SHOPOPS · black message SVG"
              >
                <InlineReferenceSvg name="bowlstory-order-message" />
              </figure>
              <ProjectTitle
                id="mesa-title"
                threadAnchor="project.shopops.title"
                threadLabel="SHOPOPS · title"
              >
                SHOPOPS
              </ProjectTitle>
              <figure
                className="world-object mesa-ticket"
                data-thread-anchor="project.shopops.ticket"
                data-thread-label="SHOPOPS · ticket"
              >
                <InlineReferenceSvg name="bowlstory-order-confirmation" />
              </figure>
              <figure
                className="world-object mesa-reply"
                data-thread-anchor="project.shopops.reply"
                data-thread-label="SHOPOPS · reply bubble"
              >
                <span dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 330 84" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="e-ops replies: Order placed. Your rice bowl is on its way.">
    <path d="M14 2h302q12 0 12 12v48q0 12-12 12H34L16 82l3-8h-5Q2 74 2 62V14Q2 2 14 2Z" fill="var(--world-bg)"
        stroke="currentColor" />
    <g fill="currentColor" font-size="15"><text x="21" y="30">Order placed.</text><text x="21" y="54">We will call you
            shortly.</text></g>
</svg>` }} />
              </figure>
              <figure
                className="world-object mesa-bag"
                data-thread-anchor="project.shopops.bag"
                data-thread-label="SHOPOPS · bag"
              >
                <span dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 250 310" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="Mobility equipment rental bag">
    <g stroke="currentColor" stroke-width="1.2" fill="var(--world-bg)" stroke-linejoin="round">
        <path d="M88 84V54a37 37 0 0 1 74 0v30h-9V54a28 28 0 0 0-56 0v30Z" />
        <path d="M38 78h174l14 215H24Z" />
    </g>
    <g stroke="currentColor" stroke-width=".75" opacity=".5">
        <path d="M43 88h164M32 280h186M48 98l-9 171M202 98l9 171" />
        <circle cx="91" cy="84" r="3" />
        <circle cx="159" cy="84" r="3" />
    </g>
    <g stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="125" cy="144" r="29" />
        <circle cx="125" cy="144" r="23" opacity=".45" />
        <path d="M112 155v-21l13-9 13 9v21M108 155h34" />
        <path d="M117 155v-13h16v13" />
        <path d="M125 125v-9m-4 4h8" />
    </g>
    <g fill="currentColor" text-anchor="middle">
        <text x="125" y="205" font-size="10" letter-spacing="1.1">READY TO USE</text>
        <path d="M86 217h78" stroke="currentColor" stroke-width=".6" opacity=".5" />
        <text x="125" y="235" font-size="8" opacity=".6" letter-spacing=".6">RECYCLABLE</text>
    </g>
</svg>` }} />
              </figure>
              <InlineReferenceElement
                label="Company wallet"
                className="world-object mesa-wallet"
                role="group"
                threadAnchor="project.shopops.wallet"
                threadLabel="SHOPOPS · wallet"
              />
              <InlineReferenceElement
                label="Company meal statistics"
                className="world-object mesa-dashboard"
                role="group"
                threadAnchor="project.shopops.dashboard"
                threadLabel="SHOPOPS · dashboard"
              />
            </div>
            <ProjectLink />
          </article>

          <article
            className="project-world creditflow-world"
            id="creditflow"
            aria-labelledby="creditflow-title"
            data-thread-anchor="project.legalexy"
            data-thread-label="LEGALEXY · section"
          >
            <ProjectHeader
              number="04"
              category="LegalTech"
              description="Digitized corporate legal workflows, simplifying business incorporation, compliance, and document management for entrepreneurs."
            />
            <div className="world-composition">
              <figure
                className="world-object credit-document credit-pan"
                data-thread-anchor="project.legalexy.pan"
                data-thread-label="LEGALEXY · PAN document"
              >
                <span dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 300 160" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PAN identity card with masked personal details"><rect x="1" y="1" width="298" height="158" rx="5" class="credit-paper"/><g fill="currentColor"><text class="credit-paper-heading" x="20" y="39" font-size="30">PAN</text><g font-size="8" text-anchor="end"><text x="280" y="25">PERMANENT ACCOUNT</text><text x="280" y="38">NUMBER</text></g><text x="90" y="77" font-size="7" opacity=".55">ACCOUNT HOLDER</text><text x="90" y="93" font-size="11">NAME WITHHELD</text><text x="90" y="119" font-size="16" letter-spacing="1">•••••1234•</text><text x="90" y="140" font-size="7" opacity=".55">IDENTITY RECORD</text></g><path d="M20 53h260" class="credit-paper-rule"/><rect x="20" y="69" width="51" height="71" rx="1" fill="currentColor" opacity=".06"/><g fill="currentColor" opacity=".24"><circle cx="45.5" cy="92" r="11"/><path d="M27 127v-7a18.5 18.5 0 0 1 37 0v7z"/></g><g class="credit-scan" aria-hidden="true" style="translate: none; rotate: none; scale: none; transform-origin: 0px 0px; opacity: 0; visibility: hidden;" data-svg-origin="0 6" transform="matrix(1,0,0,1,2,0)"><path d="M0 6v148" stroke="var(--signal)" stroke-width="1.5"/></g></svg>` }} />
              </figure>
              <figure
                className="world-object credit-document credit-gst"
                data-thread-anchor="project.legalexy.gst"
                data-thread-label="LEGALEXY · GST document"
              >
                <span dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 270 390" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="GST return with filing period, masked GSTIN and tax summary"><rect x="1" y="1" width="268" height="388" class="credit-paper"/><g fill="currentColor"><text class="credit-paper-heading" x="24" y="54" font-size="40">GST</text><g font-size="9" text-anchor="end"><text x="246" y="30">TAX RETURN</text><text x="246" y="46">GSTR 3B</text></g><g font-size="8" opacity=".55"><text x="24" y="99">RETURN PERIOD</text><text x="246" y="99" text-anchor="end">FILING STATUS</text><text x="24" y="162">GSTIN</text></g><g font-size="13"><text x="24" y="119">FY 2024/25</text><text x="246" y="119" text-anchor="end">FILED</text><text x="24" y="184" letter-spacing="2">•••••••••••••••</text></g><text x="24" y="222" font-size="11" font-weight="500">RETURN SUMMARY</text><g font-size="8" opacity=".55"><text x="24" y="247">PARTICULARS</text><text x="246" y="247" text-anchor="end">AMOUNT</text></g><g font-size="11"><text x="24" y="272">Outward supplies</text><text x="246" y="272" text-anchor="end">•••</text></g><g font-size="11"><text x="24" y="299">Input tax credit</text><text x="246" y="299" text-anchor="end">•••</text></g><g font-size="11"><text x="24" y="326">Tax paid</text><text x="246" y="326" text-anchor="end">•••</text></g><text x="24" y="370" font-size="8" opacity=".55">MONTHLY RETURN</text><text x="246" y="370" font-size="8" text-anchor="end" opacity=".55">01 / 01</text></g><path d="M24 72h222M24 139h222M24 233h222M24 348h222" class="credit-paper-rule"/><g class="credit-scan" aria-hidden="true" style="translate: none; rotate: none; scale: none; transform-origin: 0px 0px; opacity: 0; visibility: hidden;" data-svg-origin="0 10" transform="matrix(1,0,0,1,2,0)"><path d="M0 10v378" stroke="var(--signal)" stroke-width="1.5"/></g></svg>` }} />
              </figure>
              <ProjectTitle
                id="creditflow-title"
                className="world-title credit-title"
                threadAnchor="project.legalexy.title"
                threadLabel="LEGALEXY · title"
              >
                LEGALEXY
              </ProjectTitle>
              <figure
                className="world-object credit-document credit-bank"
                data-thread-anchor="project.legalexy.bank"
                data-thread-label="LEGALEXY · bank document"
              >
                <span dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 680 390" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Six months of business bank statements"><rect x="1" y="9" width="670" height="380" transform="translate(-14 -14) rotate(5 336 199)" class="credit-paper-back"/><rect x="1" y="9" width="670" height="380" transform="translate(-6 -7) rotate(2.5 336 199)" class="credit-paper-middle"/><rect x="1" y="9" width="670" height="380" class="credit-paper"/><g fill="currentColor"><text class="credit-paper-heading" x="33" y="70" font-size="27">BANK STATEMENT</text><g font-size="9"><text x="465" y="69">BUSINESS ACCOUNT STATEMENT</text><text x="33" y="108">ACCOUNT TYPE</text><text x="348" y="108">PERIOD</text><text x="33" y="128" font-size="11">Current Account</text><text x="348" y="128" font-size="11">Last 6 Months</text><text x="33" y="173">DATE</text><text x="119" y="173">DESCRIPTION</text><text x="358" y="173">DEBIT</text><text x="468" y="173">CREDIT</text><text x="562" y="173">BALANCE</text></g></g><path d="M33 84h607M33 150h607M33 185h607M331 96v40M104 150v205M345 150v205M454 150v205M549 150v205" class="credit-paper-rule"/><g fill="currentColor" opacity=".16"><path d="M33 201h607" stroke="currentColor" stroke-width=".6"/><rect x="33" y="194" width="37" height="8"/><rect x="119" y="194" width="128" height="8"/><rect x="365" y="194" width="37" height="8"/><rect x="470" y="194" width="37" height="8"/><rect x="566" y="194" width="37" height="8"/></g><g fill="currentColor" opacity=".16"><path d="M33 221h607" stroke="currentColor" stroke-width=".6"/><rect x="33" y="214" width="47" height="8"/><rect x="119" y="214" width="153" height="8"/><rect x="365" y="214" width="47" height="8"/><rect x="470" y="214" width="47" height="8"/><rect x="566" y="214" width="47" height="8"/></g><g fill="currentColor" opacity=".16"><path d="M33 241h607" stroke="currentColor" stroke-width=".6"/><rect x="33" y="234" width="37" height="8"/><rect x="119" y="234" width="178" height="8"/><rect x="365" y="234" width="37" height="8"/><rect x="470" y="234" width="37" height="8"/><rect x="566" y="234" width="37" height="8"/></g><g fill="currentColor" opacity=".16"><path d="M33 261h607" stroke="currentColor" stroke-width=".6"/><rect x="33" y="254" width="47" height="8"/><rect x="119" y="254" width="128" height="8"/><rect x="365" y="254" width="47" height="8"/><rect x="470" y="254" width="47" height="8"/><rect x="566" y="254" width="47" height="8"/></g><g fill="currentColor" opacity=".16"><path d="M33 281h607" stroke="currentColor" stroke-width=".6"/><rect x="33" y="274" width="37" height="8"/><rect x="119" y="274" width="153" height="8"/><rect x="365" y="274" width="37" height="8"/><rect x="470" y="274" width="37" height="8"/><rect x="566" y="274" width="37" height="8"/></g><g fill="currentColor" opacity=".16"><path d="M33 301h607" stroke="currentColor" stroke-width=".6"/><rect x="33" y="294" width="47" height="8"/><rect x="119" y="294" width="178" height="8"/><rect x="365" y="294" width="47" height="8"/><rect x="470" y="294" width="47" height="8"/><rect x="566" y="294" width="47" height="8"/></g><g fill="currentColor" opacity=".16"><path d="M33 321h607" stroke="currentColor" stroke-width=".6"/><rect x="33" y="314" width="37" height="8"/><rect x="119" y="314" width="128" height="8"/><rect x="365" y="314" width="37" height="8"/><rect x="470" y="314" width="37" height="8"/><rect x="566" y="314" width="37" height="8"/></g><g fill="currentColor" opacity=".16"><path d="M33 341h607" stroke="currentColor" stroke-width=".6"/><rect x="33" y="334" width="47" height="8"/><rect x="119" y="334" width="153" height="8"/><rect x="365" y="334" width="47" height="8"/><rect x="470" y="334" width="47" height="8"/><rect x="566" y="334" width="47" height="8"/></g><g class="credit-scan" aria-hidden="true" style="translate: none; rotate: none; scale: none; transform-origin: 0px 0px; opacity: 0; visibility: hidden;" data-svg-origin="0 10" transform="matrix(1,0,0,1,2,0)"><path d="M0 10v378" stroke="var(--signal)" stroke-width="1.5"/></g></svg>` }} />
              </figure>
              <figure
                className="world-object credit-document credit-itr"
                data-thread-anchor="project.legalexy.itr"
                data-thread-label="LEGALEXY · ITR document"
              >
                <span dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 420 310" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Three years of income tax returns"><g transform="translate(-10 -20) rotate(-6 210 165)"><path d="M1 23H168V8q0-7 7-7h65q7 0 7 7v15H419V309H1Z" class="credit-paper-back"/><text x="181" y="17" fill="currentColor" font-size="9">AY <!-- -->22/23</text></g><g transform="translate(-2 -10) rotate(-3 210 165)"><path d="M1 23H247V8q0-7 7-7h65q7 0 7 7v15H419V309H1Z" class="credit-paper-middle"/><text x="260" y="17" fill="currentColor" font-size="9">AY <!-- -->23/24</text></g><g><path d="M1 23H326V8q0-7 7-7h65q7 0 7 7v15H419V309H1Z" class="credit-paper"/><text x="339" y="17" fill="currentColor" font-size="9">AY <!-- -->24/25</text></g><g fill="currentColor"><text class="credit-paper-heading" x="32" y="73" font-size="31">ITR</text><g font-size="9"><text x="283" y="59">INCOME TAX RETURN</text><text x="320" y="76">3 YEARS</text><text x="32" y="126">ASSESSEE</text><text x="32" y="157">ITR TYPE</text><text x="32" y="188">STATUS</text><text x="139" y="188">FILED</text></g></g><path d="M32 93h360M124 128h190M124 159h112m12 0h112M32 204h360" class="credit-paper-rule"/><rect x="32" y="221" width="290" height="6" fill="currentColor" opacity=".16"/><rect x="32" y="234" width="328" height="6" fill="currentColor" opacity=".16"/><rect x="32" y="247" width="317" height="6" fill="currentColor" opacity=".16"/><rect x="32" y="260" width="245" height="6" fill="currentColor" opacity=".16"/><rect x="32" y="273" width="167" height="6" fill="currentColor" opacity=".16"/><g class="credit-scan" aria-hidden="true" style="translate: none; rotate: none; scale: none; transform-origin: 0px 0px; opacity: 0; visibility: hidden;" data-svg-origin="0 28" transform="matrix(1,0,0,1,2,0)"><path d="M0 28v272" stroke="var(--signal)" stroke-width="1.5"/></g></svg>` }} />
              </figure>
              <section
                className="world-object credit-application"
                data-thread-anchor="project.legalexy.application"
                data-thread-label="LEGALEXY · application panel"
              >
                <p>APPLICATION / 0248</p>
                <div>
                  <span>REQUESTED AMOUNT</span>
                  <strong>C$25L</strong>
                </div>
              </section>
              <section
                className="world-object credit-assessment"
                data-thread-anchor="project.legalexy.assessment"
                data-thread-label="LEGALEXY · assessment panel"
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
                data-thread-anchor="project.legalexy.outcome"
                data-thread-label="LEGALEXY · outcome panel"
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
          data-thread-anchor="why.section"
          data-thread-label="Why Me · section"
        >
          <div className="why-me-inner">
            <p className="why-me-eyebrow">
              <span className="why-me-eyebrow-dot" aria-hidden="true" />
              WHY ME
            </p>

            <h2
              className="why-me-title"
              id="why-me-title"
              data-thread-anchor="why.title"
              data-thread-label="Why Me · title box"
            >
              <span>The risk</span>
              <span>you’re weighing</span>
              <span>is smaller</span>
              <span>than it looks.</span>
            </h2>
            <p
              className="why-me-intro"
              data-thread-anchor="why.intro"
              data-thread-label="Why Me · intro"
            >
              You’ve seen the work. Here’s what it means for your team.
            </p>

            <div className="why-me-points">
              <article className="why-me-point">
                <span
                  className="why-me-node"
                  aria-hidden="true"
                  data-thread-anchor="why.point.1"
                  data-thread-label="Why Me · outcome node"
                  data-thread-anchor-mode="center"
                />
                <div
                  className="why-me-point-copy"
                  data-thread-anchor="why.copy.1"
                  data-thread-label="Why Me · outcome copy"
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

              <article className="why-me-point">
                <span
                  className="why-me-node"
                  aria-hidden="true"
                  data-thread-anchor="why.point.2"
                  data-thread-label="Why Me · proof node"
                  data-thread-anchor-mode="center"
                />
                <div
                  className="why-me-point-copy"
                  data-thread-anchor="why.copy.2"
                  data-thread-label="Why Me · proof copy"
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

              <article className="why-me-point">
                <span
                  className="why-me-node"
                  aria-hidden="true"
                  data-thread-anchor="why.point.3"
                  data-thread-label="Why Me · AI judgement node"
                  data-thread-anchor-mode="center"
                />
                <div
                  className="why-me-point-copy"
                  data-thread-anchor="why.copy.3"
                  data-thread-label="Why Me · AI judgement copy"
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

              <article className="why-me-point">
                <span
                  className="why-me-node"
                  aria-hidden="true"
                  data-thread-anchor="why.point.4"
                  data-thread-label="Why Me · ramp-up node"
                  data-thread-anchor-mode="center"
                />
                <div
                  className="why-me-point-copy"
                  data-thread-anchor="why.copy.4"
                  data-thread-label="Why Me · ramp-up copy"
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

              <article className="why-me-point">
                <span
                  className="why-me-node"
                  aria-hidden="true"
                  data-thread-anchor="why.point.5"
                  data-thread-label="Why Me · long-game node"
                  data-thread-anchor-mode="center"
                />
                <div
                  className="why-me-point-copy"
                  data-thread-anchor="why.copy.5"
                  data-thread-label="Why Me · long-game copy"
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
          data-thread-anchor="about.section"
          data-thread-label="About · section"
        >
          <div className="about-stage">
            <div
              className="about-profile"
              data-thread-anchor="about.profile"
              data-thread-label="About · profile block"
            >
              <div className="about-intro">
                <h2
                  className="about-heading"
                  id="about-title"
                  data-thread-anchor="about.heading"
                  data-thread-label="About · heading"
                >
                  <span>ONE THREAD,</span>
                  <span>FROM PROBLEMA</span>
                  <span>TO PRODUCTION.</span>
                </h2>
                <p className="about-personal">
                  I stay with an idea through every stage: understanding it,
                  designing it, building it, and keeping it alive after launch.
                </p>
              </div>
              <div
                className="about-byline"
                data-thread-anchor="about.byline"
                data-thread-label="About · byline"
              >
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
          data-thread-anchor="contact.section"
          data-thread-label="Contact · section"
        >
          <div className="contact-stage">
            <div className="contact-copy">
              <h2
                className="contact-statement"
                id="contact-title"
                data-thread-anchor="contact.statement"
                data-thread-label="Contact · statement"
              >
                <span>JUDGE ME</span>
                <span>IN CONVERSATION.</span>
              </h2>
              <span
                className="contact-pull"
                data-thread-anchor="contact.pull"
                data-thread-label="Contact · pull quote"
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
              data-thread-anchor="contact.back"
              data-thread-label="Contact · back to top"
            >
              BACK TO TOP <span aria-hidden="true">↑</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
