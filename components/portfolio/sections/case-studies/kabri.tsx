import { ProjectHeader, ProjectLink, ProjectTitle } from "../shared";

export function Kabri() {
  return (
    <article
      className="case-study case-study-kabri case-study-light"
      id="kabri"
      aria-labelledby="kabri-title"
      data-thread-anchor="case.study.kabri"
      data-thread-label="KABRI · section"
    >
      <ProjectHeader
        number="01"
        category="BUSINESS PROCESS AUTOMATION"
        description="Automated product configuration, quotation generation, and order management for a manufacturing business."
      />
      <div className="case-study-composition">
        <figure
          className="case-study-object kabri-flat"
          data-thread-anchor="case.study.kabri.flat"
          data-thread-label="KABRI · floor-plan drawing"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 620 345" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="Cab 03: blueprint waiting for approval">
    <defs>
        <mask id="kabri-flat-wall-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="620" height="345">
            <rect width="620" height="345" fill="white" />
            <rect x="234" y="6" width="48" height="14" fill="black" />
            <rect class="kabri-flat-side-opening" x="598" y="153" width="14" height="20" fill="black" />
        </mask>
    </defs>
    <g mask="url(#kabri-flat-wall-mask)" stroke="currentColor" stroke-width=".9" stroke-linejoin="round">
        <path d="M30 8H610V329H291v-10h309V18H40v210H16v91h226v10H6V218H30Z" fill="var(--case-study-bg)" />
        <path d="M35 13h570v311H291M242 324H11V223h24V13" opacity=".45" />
        <path
            d="M210 18h7v111h-7zM210 174h7v41h-7zM210 260h7v59h-7zM416 18h7v111h-7zM416 174h7v111h-7zM416 312h7v7h-7zM40 174h170v6H40zM423 174h177v6H423zM423 248h37v6h-37zM500 248h100v6H500zM510 180v68"
            fill="var(--case-study-bg)" />
        <g fill="var(--case-study-bg)">
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
    <circle data-thread-anchor="case.study.kabri.door.north"
        data-thread-label="KABRI · floor-plan north door"
        data-thread-anchor-mode="center" cx="258" cy="8" r="2"
        fill="none" stroke="none" pointer-events="none" />
    <circle data-thread-anchor="case.study.kabri.door.east"
        data-thread-label="KABRI · floor-plan east door"
        data-thread-anchor-mode="center" cx="605" cy="163" r="2"
        fill="none" stroke="none" pointer-events="none" />
</svg>`,
            }}
          />
        </figure>
        <figure
          className="case-study-object kabri-lease"
          data-thread-anchor="case.study.kabri.lease"
          data-thread-label="KABRI · lease document"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 205 218" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="Cabin Construction Estimate, Estimated Cost C$32,000">
    <path d="M1 1h203v216H1Z" fill="var(--case-study-bg)" stroke="currentColor" stroke-width=".85" />
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
</svg>`,
            }}
          />
        </figure>
        <figure
          className="case-study-object kabri-inspection"
          data-thread-anchor="case.study.kabri.inspection"
          data-thread-label="KABRI · inspection document"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 370 225" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="AI inspection compares move-in and move-out records and detects wall damage with 94 percent confidence">
    <g stroke="currentColor" stroke-width=".85">
        <path d="M9 19 157 63V195L9 151Z M40 49l24 7v86l-24-7Z" fill="var(--case-study-bg)" fill-rule="evenodd"
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
            <path d="M9 19 157 63V195L9 151Z M40 49l24 7v86l-24-7Z" fill="var(--case-study-bg)" fill-rule="evenodd"
                stroke="none" />
            <path d="M9 19 157 63M9 25l148 44M9 30l148 44M17 15v141m8-139v141M10 145l146 44M10 151l146 44M133 51v132"
                opacity=".45" />
            <path
                d="m31 37 42 13v106l-42-13zM35 43l34 10v96l-34-10zM40 49l24 7v86l-24-7zM48 52v85M31 144l-5 6 48 14 5-6M29 32v117" />
            <path d="m85 67 64 19M84 99l65 19M84 131l65 19M101 73v25m17 6v27m-17 6v25" opacity=".13" />
        </g>

    </g>
    <g fill="currentColor" font-size="11"><text x="22" y="218">BEFORE</text><text x="222" y="218">AFTER</text></g>
</svg>`,
            }}
          />
        </figure>{" "}
        <ProjectTitle
          id="kabri-title"
          threadAnchor="case.study.kabri.title"
          threadLabel="KABRI · title"
        >
          KABRI
        </ProjectTitle>
        <figure
          className="case-study-object kabri-repair"
          data-thread-anchor="case.study.kabri.repair"
          data-thread-label="KABRI · repair document"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 400 275" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="Cabin lumber order completed; C$4,800 becomes an expense in the company ledger">
    <g class="kabri-wrench" stroke="currentColor" stroke-width="1" stroke-linejoin="round"
        transform="translate(-9 5) rotate(-12 180 100)">
        <path
            d="M40 169 204 49C201 22 224 4 253 9L235 39 248 62 274 62 292 32C308 59 297 87 270 95C259 98 249 97 239 93L62 215C31 231 10 187 40 169Z"
            fill="var(--case-study-bg)" />
        <circle cx="49" cy="193" r="10" />
        <path d="M69 185 215 76M72 193 219 84M227 32l-6 9 20 34h39l6-10" opacity=".45" />
    </g>
    <g class="kabri-repair-desktop">
        <g fill="currentColor" font-size="11"><text x="186" y="198">LUMBER ORDER</text><text x="186"
                y="233">C$4,800</text><text class="kabri-assigned" x="186" y="252">ORDERED</text><text <path
                d="M186 211h143" stroke="currentColor" stroke-width=".6" opacity=".4" />
        </g>
</svg>`,
            }}
          />
        </figure>
        <figure
          className="case-study-object kabri-book"
          data-thread-anchor="case.study.kabri.book"
          data-thread-label="KABRI · handbook"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 720 270" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="Cabin Company Ledger. Sales C$32,000, Lumber C$4,800, Other Expenses C$1,250, Net Profit C$25,950. Lumber expense record linked to corporate tax form.">
    <g stroke="currentColor" stroke-width=".85" fill="var(--case-study-bg)">
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
    <g stroke="currentColor" stroke-width=".8" fill="var(--case-study-bg)">
        <ellipse cx="356" cy="39" rx="3" ry="5" />
        <ellipse cx="375" cy="39" rx="3" ry="5" />
        <path d="M356 39c-7-10 25-10 19 0m-19 0c-4-5 22-5 19 0" />
    </g>
    <g stroke="currentColor" stroke-width=".8" fill="var(--case-study-bg)">
        <ellipse cx="356" cy="123" rx="3" ry="5" />
        <ellipse cx="375" cy="123" rx="3" ry="5" />
        <path d="M356 123c-7-10 25-10 19 0m-19 0c-4-5 22-5 19 0" />
    </g>
    <g stroke="currentColor" stroke-width=".8" fill="var(--case-study-bg)">
        <ellipse cx="356" cy="210" rx="3" ry="5" />
        <ellipse cx="375" cy="210" rx="3" ry="5" />
        <path d="M356 210c-7-10 25-10 19 0m-19 0c-4-5 22-5 19 0" />
    </g>
</svg>`,
            }}
          />
        </figure>{" "}
      </div>
      <ProjectLink />
    </article>
  );
}
