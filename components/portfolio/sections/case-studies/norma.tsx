import { InlineReferenceElement } from "../../inline-reference-element";
import { InlineReferenceSvg } from "../../inline-reference-svg";
import { ProjectHeader, ProjectLink, ProjectTitle } from "../shared";

export function Norma() {
  return (
    <article
      className="case-study norma-scan"
      id="norma"
      aria-labelledby="norma-title"
      data-thread-anchor="case.study.norma"
      data-thread-label="NORMA · section"
    >
      <ProjectHeader
        number="02"
        category="REAL ESTATE DATA INTELLIGENCE & ANALYTICS"
        description="A real estate intelligence platform unifying property data, analytics, and business insights."
      />
      <div className="case-study-composition">
        <figure
          className="scan-ledger scan-ledger-top"
          data-thread-anchor="case.study.norma.ledger-top"
          data-thread-label="NORMA · top ledger"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 760 420" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
</svg>`,
            }}
          />
        </figure>
        <figure
          className="scan-ledger scan-ledger-bottom"
          data-thread-anchor="case.study.norma.ledger-bottom"
          data-thread-label="NORMA · bottom ledger"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 700 250" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke="currentColor" stroke-width=".8"><path d="M1 1h698v248H1zM1 50h698M1 95h698M1 140h698M395 1v248M443 1v248M680 1v248"/></g><g fill="currentColor" font-size="14"><text x="20" y="32">SUBTOTAL</text><text x="20" y="78">TAX</text><text x="20" y="124">TOTAL</text><text x="501" y="32">1,280.00</text><text x="534" y="78">0.00</text><text x="501" y="124">1,280.00</text></g></svg>`,
            }}
          />
        </figure>
        <ProjectTitle
          id="norma-title"
          threadAnchor="case.study.norma.title"
          threadLabel="NORMA · title"
        >
          NORMA
        </ProjectTitle>
        <figure
          className="scan-paper scan-paper-acme"
          data-thread-anchor="case.study.norma.paper-acme"
          data-thread-label="NORMA · ACME document"
        >
          <InlineReferenceSvg name="acme-invoice" />
        </figure>
        <figure
          className="scan-paper scan-paper-river"
          data-thread-anchor="case.study.norma.paper-river"
          data-thread-label="NORMA · River document"
        >
          <InlineReferenceSvg name="river-invoice" />
        </figure>
        <figure
          className="scan-paper scan-paper-river scan-paper-river-cover"
          data-thread-anchor="case.study.norma.paper-river-cover"
          data-thread-label="NORMA · River document cover"
        >
          <InlineReferenceSvg name="river-invoice" />
        </figure>
        <figure
          className="scan-paper scan-paper-front"
          data-thread-anchor="case.study.norma.paper-front"
          data-thread-label="NORMA · front document"
        >
          <InlineReferenceSvg name="northridge-invoice-verified" />
        </figure>
        <figure
          className="scan-paper scan-paper-main"
          data-thread-anchor="case.study.norma.paper-main"
          data-thread-label="NORMA · main document"
        >
          <InlineReferenceSvg name="northridge-invoice-verified" />
        </figure>
        <figure
          className="scan-paper scan-paper-rejected"
          data-thread-anchor="case.study.norma.paper-rejected"
          data-thread-label="NORMA · rejected document"
        >
          <InlineReferenceSvg name="harbor-invoice-rejected" />
        </figure>
        <InlineReferenceElement
          label="Extracted invoice values"
          className="scan-extracted"
        />
      </div>
      <ProjectLink />{" "}
    </article>
  );
}
