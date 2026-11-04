import { ProjectHeader, ProjectLink, ProjectTitle } from "../shared";

export function LegalLexy() {
  return (
    <article
      className="case-study lega-lexy-study"
      id="lega-lexy"
      aria-labelledby="lega-lexy-title"
      data-thread-anchor="case.study.legalexy"
      data-thread-label="LEGALEXY · section"
    >
      <ProjectHeader
        number="04"
        category="LegalTech"
        description="Digitized corporate legal workflows, simplifying business incorporation, compliance, and document management for entrepreneurs."
      />
      <div className="case-study-composition">
        <figure
          className="case-study-object credit-document credit-pan"
          data-thread-anchor="case.study.legalexy.pan"
          data-thread-label="LEGALEXY · PAN document"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 300 160" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PAN identity card with masked personal details"><rect x="1" y="1" width="298" height="158" rx="5" class="credit-paper"/><g fill="currentColor"><text class="credit-paper-heading" x="20" y="39" font-size="30">PAN</text><g font-size="8" text-anchor="end"><text x="280" y="25">PERMANENT ACCOUNT</text><text x="280" y="38">NUMBER</text></g><text x="90" y="77" font-size="7" opacity=".55">ACCOUNT HOLDER</text><text x="90" y="93" font-size="11">NAME WITHHELD</text><text x="90" y="119" font-size="16" letter-spacing="1">•••••1234•</text><text x="90" y="140" font-size="7" opacity=".55">IDENTITY RECORD</text></g><path d="M20 53h260" class="credit-paper-rule"/><rect x="20" y="69" width="51" height="71" rx="1" fill="currentColor" opacity=".06"/><g fill="currentColor" opacity=".24"><circle cx="45.5" cy="92" r="11"/><path d="M27 127v-7a18.5 18.5 0 0 1 37 0v7z"/></g><g class="credit-scan" aria-hidden="true" style="translate: none; rotate: none; scale: none; transform-origin: 0px 0px; opacity: 0; visibility: hidden;" data-svg-origin="0 6" transform="matrix(1,0,0,1,2,0)"><path d="M0 6v148" stroke="var(--signal)" stroke-width="1.5"/></g></svg>`,
            }}
          />
        </figure>
        <figure
          className="case-study-object credit-document credit-gst"
          data-thread-anchor="case.study.legalexy.gst"
          data-thread-label="LEGALEXY · GST document"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 270 390" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="GST return with filing period, masked GSTIN and tax summary"><rect x="1" y="1" width="268" height="388" class="credit-paper"/><g fill="currentColor"><text class="credit-paper-heading" x="24" y="54" font-size="40">GST</text><g font-size="9" text-anchor="end"><text x="246" y="30">TAX RETURN</text><text x="246" y="46">GSTR 3B</text></g><g font-size="8" opacity=".55"><text x="24" y="99">RETURN PERIOD</text><text x="246" y="99" text-anchor="end">FILING STATUS</text><text x="24" y="162">GSTIN</text></g><g font-size="13"><text x="24" y="119">FY 2024/25</text><text x="246" y="119" text-anchor="end">FILED</text><text x="24" y="184" letter-spacing="2">•••••••••••••••</text></g><text x="24" y="222" font-size="11" font-weight="500">RETURN SUMMARY</text><g font-size="8" opacity=".55"><text x="24" y="247">PARTICULARS</text><text x="246" y="247" text-anchor="end">AMOUNT</text></g><g font-size="11"><text x="24" y="272">Outward supplies</text><text x="246" y="272" text-anchor="end">•••</text></g><g font-size="11"><text x="24" y="299">Input tax credit</text><text x="246" y="299" text-anchor="end">•••</text></g><g font-size="11"><text x="24" y="326">Tax paid</text><text x="246" y="326" text-anchor="end">•••</text></g><text x="24" y="370" font-size="8" opacity=".55">MONTHLY RETURN</text><text x="246" y="370" font-size="8" text-anchor="end" opacity=".55">01 / 01</text></g><path d="M24 72h222M24 139h222M24 233h222M24 348h222" class="credit-paper-rule"/><g class="credit-scan" aria-hidden="true" style="translate: none; rotate: none; scale: none; transform-origin: 0px 0px; opacity: 0; visibility: hidden;" data-svg-origin="0 10" transform="matrix(1,0,0,1,2,0)"><path d="M0 10v378" stroke="var(--signal)" stroke-width="1.5"/></g></svg>`,
            }}
          />
        </figure>
        <ProjectTitle
          id="lega-lexy-title"
          className="case-study-title credit-title"
          threadAnchor="case.study.legalexy.title"
          threadLabel="LEGALEXY · title"
        >
          LEGALEXY
        </ProjectTitle>
        <figure
          className="case-study-object credit-document credit-bank"
          data-thread-anchor="case.study.legalexy.bank"
          data-thread-label="LEGALEXY · bank document"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 680 390" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Six months of business bank statements"><rect x="1" y="9" width="670" height="380" transform="translate(-14 -14) rotate(5 336 199)" class="credit-paper-back"/><rect x="1" y="9" width="670" height="380" transform="translate(-6 -7) rotate(2.5 336 199)" class="credit-paper-middle"/><rect x="1" y="9" width="670" height="380" class="credit-paper"/><g fill="currentColor"><text class="credit-paper-heading" x="33" y="70" font-size="27">BANK STATEMENT</text><g font-size="9"><text x="465" y="69">BUSINESS ACCOUNT STATEMENT</text><text x="33" y="108">ACCOUNT TYPE</text><text x="348" y="108">PERIOD</text><text x="33" y="128" font-size="11">Current Account</text><text x="348" y="128" font-size="11">Last 6 Months</text><text x="33" y="173">DATE</text><text x="119" y="173">DESCRIPTION</text><text x="358" y="173">DEBIT</text><text x="468" y="173">CREDIT</text><text x="562" y="173">BALANCE</text></g></g><path d="M33 84h607M33 150h607M33 185h607M331 96v40M104 150v205M345 150v205M454 150v205M549 150v205" class="credit-paper-rule"/><g fill="currentColor" opacity=".16"><path d="M33 201h607" stroke="currentColor" stroke-width=".6"/><rect x="33" y="194" width="37" height="8"/><rect x="119" y="194" width="128" height="8"/><rect x="365" y="194" width="37" height="8"/><rect x="470" y="194" width="37" height="8"/><rect x="566" y="194" width="37" height="8"/></g><g fill="currentColor" opacity=".16"><path d="M33 221h607" stroke="currentColor" stroke-width=".6"/><rect x="33" y="214" width="47" height="8"/><rect x="119" y="214" width="153" height="8"/><rect x="365" y="214" width="47" height="8"/><rect x="470" y="214" width="47" height="8"/><rect x="566" y="214" width="47" height="8"/></g><g fill="currentColor" opacity=".16"><path d="M33 241h607" stroke="currentColor" stroke-width=".6"/><rect x="33" y="234" width="37" height="8"/><rect x="119" y="234" width="178" height="8"/><rect x="365" y="234" width="37" height="8"/><rect x="470" y="234" width="37" height="8"/><rect x="566" y="234" width="37" height="8"/></g><g fill="currentColor" opacity=".16"><path d="M33 261h607" stroke="currentColor" stroke-width=".6"/><rect x="33" y="254" width="47" height="8"/><rect x="119" y="254" width="128" height="8"/><rect x="365" y="254" width="47" height="8"/><rect x="470" y="254" width="47" height="8"/><rect x="566" y="254" width="47" height="8"/></g><g fill="currentColor" opacity=".16"><path d="M33 281h607" stroke="currentColor" stroke-width=".6"/><rect x="33" y="274" width="37" height="8"/><rect x="119" y="274" width="153" height="8"/><rect x="365" y="274" width="37" height="8"/><rect x="470" y="274" width="37" height="8"/><rect x="566" y="274" width="37" height="8"/></g><g fill="currentColor" opacity=".16"><path d="M33 301h607" stroke="currentColor" stroke-width=".6"/><rect x="33" y="294" width="47" height="8"/><rect x="119" y="294" width="178" height="8"/><rect x="365" y="294" width="47" height="8"/><rect x="470" y="294" width="47" height="8"/><rect x="566" y="294" width="47" height="8"/></g><g fill="currentColor" opacity=".16"><path d="M33 321h607" stroke="currentColor" stroke-width=".6"/><rect x="33" y="314" width="37" height="8"/><rect x="119" y="314" width="128" height="8"/><rect x="365" y="314" width="37" height="8"/><rect x="470" y="314" width="37" height="8"/><rect x="566" y="314" width="37" height="8"/></g><g fill="currentColor" opacity=".16"><path d="M33 341h607" stroke="currentColor" stroke-width=".6"/><rect x="33" y="334" width="47" height="8"/><rect x="119" y="334" width="153" height="8"/><rect x="365" y="334" width="47" height="8"/><rect x="470" y="334" width="47" height="8"/><rect x="566" y="334" width="47" height="8"/></g><g class="credit-scan" aria-hidden="true" style="translate: none; rotate: none; scale: none; transform-origin: 0px 0px; opacity: 0; visibility: hidden;" data-svg-origin="0 10" transform="matrix(1,0,0,1,2,0)"><path d="M0 10v378" stroke="var(--signal)" stroke-width="1.5"/></g></svg>`,
            }}
          />
        </figure>
        <figure
          className="case-study-object credit-document credit-itr"
          data-thread-anchor="case.study.legalexy.itr"
          data-thread-label="LEGALEXY · ITR document"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 420 310" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Three years of income tax returns"><g transform="translate(-10 -20) rotate(-6 210 165)"><path d="M1 23H168V8q0-7 7-7h65q7 0 7 7v15H419V309H1Z" class="credit-paper-back"/><text x="181" y="17" fill="currentColor" font-size="9">AY <!-- -->22/23</text></g><g transform="translate(-2 -10) rotate(-3 210 165)"><path d="M1 23H247V8q0-7 7-7h65q7 0 7 7v15H419V309H1Z" class="credit-paper-middle"/><text x="260" y="17" fill="currentColor" font-size="9">AY <!-- -->23/24</text></g><g><path d="M1 23H326V8q0-7 7-7h65q7 0 7 7v15H419V309H1Z" class="credit-paper"/><text x="339" y="17" fill="currentColor" font-size="9">AY <!-- -->24/25</text></g><g fill="currentColor"><text class="credit-paper-heading" x="32" y="73" font-size="31">ITR</text><g font-size="9"><text x="283" y="59">INCOME TAX RETURN</text><text x="320" y="76">3 YEARS</text><text x="32" y="126">ASSESSEE</text><text x="32" y="157">ITR TYPE</text><text x="32" y="188">STATUS</text><text x="139" y="188">FILED</text></g></g><path d="M32 93h360M124 128h190M124 159h112m12 0h112M32 204h360" class="credit-paper-rule"/><rect x="32" y="221" width="290" height="6" fill="currentColor" opacity=".16"/><rect x="32" y="234" width="328" height="6" fill="currentColor" opacity=".16"/><rect x="32" y="247" width="317" height="6" fill="currentColor" opacity=".16"/><rect x="32" y="260" width="245" height="6" fill="currentColor" opacity=".16"/><rect x="32" y="273" width="167" height="6" fill="currentColor" opacity=".16"/><g class="credit-scan" aria-hidden="true" style="translate: none; rotate: none; scale: none; transform-origin: 0px 0px; opacity: 0; visibility: hidden;" data-svg-origin="0 28" transform="matrix(1,0,0,1,2,0)"><path d="M0 28v272" stroke="var(--signal)" stroke-width="1.5"/></g></svg>`,
            }}
          />
        </figure>
        <section
          className="case-study-object credit-application"
          data-thread-anchor="case.study.legalexy.application"
          data-thread-label="LEGALEXY · application panel"
        >
          <p>APPLICATION / 0248</p>
          <div>
            <span>REQUESTED AMOUNT</span>
            <strong>C$25L</strong>
          </div>
        </section>
        <section
          className="case-study-object credit-assessment"
          data-thread-anchor="case.study.legalexy.assessment"
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
          className="case-study-object credit-outcome"
          data-thread-anchor="case.study.legalexy.outcome"
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
      <ProjectLink />{" "}
    </article>
  );
}
