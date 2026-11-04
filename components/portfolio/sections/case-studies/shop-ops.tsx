import { InlineReferenceElement } from "../../inline-reference-element";
import { InlineReferenceSvg } from "../../inline-reference-svg";
import { ProjectHeader, ProjectLink, ProjectTitle } from "../shared";

export function ShopOps() {
  return (
    <article
      className="case-study case-study-shop-ops case-study-light"
      id="shop-ops"
      aria-labelledby="shop-ops-title"
      data-thread-anchor="case.study.shopops"
      data-thread-label="SHOPOPS · section"
    >
      <ProjectHeader
        number="03"
        category="E-COMMERCE AND ASSISTIVE HEALTHCARE EQUIPMENT"
        description="Modernized assistive equipment e-commerce with product discovery, filtering, and integrated product data."
      />
      <div className="case-study-composition">
        <figure
          className="case-study-object shop-ops-plate"
          data-thread-anchor="case.study.shopops.plate"
          data-thread-label="SHOPOPS · plate"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="A wheelchair drawn in fine architectural lines">
    <!-- Frame: backrest, push handle, armrest, seat, leg rest, footplate, caster -->
    <g stroke="currentColor" stroke-width="1" stroke-linejoin="round" stroke-linecap="round">
        <!-- Backrest panel -->
        <path d="M118 96 L146 96 L158 224 L132 224 Z" fill="var(--case-study-bg)"></path>
        <!-- Push handle -->
        <path d="M118 96 L100 90 H78 a6 6 0 0 0 0 12 H112"></path>
        <!-- Armrest pad and post -->
        <rect x="136" y="156" width="130" height="10" rx="5" fill="var(--case-study-bg)"></rect>
        <path d="M250 166 V224"></path>
        <path d="M246 166 V224"></path>
        <!-- Seat cushion -->
        <rect x="128" y="224" width="198" height="16" rx="7" fill="var(--case-study-bg)"></rect>
        <!-- Leg rest hanger -->
        <path d="M318 240 L360 392"></path>
        <path d="M326 238 L368 390"></path>
        <!-- Footplate -->
        <path d="M350 392 H410 a4 4 0 0 1 0 12 H356 a6 6 0 0 1 -6 -12Z" fill="var(--case-study-bg)"></path>
        <!-- Caster tube, fork and wheel -->
        <path d="M300 240 V420"></path>
        <path d="M308 240 V420"></path>
        <rect x="293" y="416" width="22" height="12" rx="3" fill="var(--case-study-bg)"></rect>
        <circle cx="304" cy="448" r="22" fill="var(--case-study-bg)"></circle>
        <circle cx="304" cy="448" r="15"></circle>
        <circle cx="304" cy="448" r="4"></circle>
    </g>

    <!-- Rear wheel: tire and push rim -->
    <g stroke="currentColor" stroke-width="1">
        <circle cx="205" cy="355" r="115" fill="var(--case-study-bg)"></circle>
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
</svg>`,
            }}
          />
        </figure>
        <figure
          className="case-study-object shop-ops-fork"
          data-thread-anchor="case.study.shopops.fork"
          data-thread-label="SHOPOPS · fork"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 90 490" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="A medical walking cane in flat linework">
    <!-- Upper tube -->
    <rect x="56" y="100" width="12" height="150" fill="var(--case-study-bg)" stroke="currentColor" stroke-width="1.2"></rect>
    <!-- Lower adjustable tube -->
    <rect x="58" y="258" width="8" height="182" fill="var(--case-study-bg)" stroke="currentColor" stroke-width="1.2"></rect>
    <!-- Handle crook -->
    <path d="M68 52A30 30 0 0 0 8 52V74A6 6 0 0 0 20 74V52A18 18 0 0 1 56 52V96H68Z" fill="var(--case-study-bg)"
        stroke="currentColor" stroke-width="1.2"></path>
    <!-- Comfort grip -->
    <rect x="5" y="54" width="18" height="34" rx="7" fill="var(--case-study-bg)" stroke="currentColor" stroke-width="1.2">
    </rect>
    <!-- Collars -->
    <rect x="53" y="96" width="18" height="8" rx="2" fill="var(--case-study-bg)" stroke="currentColor" stroke-width="1.2">
    </rect>
    <rect x="53" y="244" width="18" height="14" rx="2" fill="var(--case-study-bg)" stroke="currentColor" stroke-width="1.2">
    </rect>
    <!-- Rubber tip -->
    <path d="M58 438H66L70 472Q70 482 62 482Q54 482 54 472Z" fill="var(--case-study-bg)" stroke="currentColor"
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
</svg>`,
            }}
          />
        </figure>
        <figure
          className="case-study-object shop-ops-message"
          data-thread-anchor="case.study.shopops.message"
          data-thread-label="SHOPOPS · black message SVG"
        >
          <InlineReferenceSvg name="bowlstory-order-message" />
        </figure>
        <ProjectTitle
          id="shop-ops-title"
          threadAnchor="case.study.shopops.title"
          threadLabel="SHOPOPS · title"
        >
          SHOPOPS
        </ProjectTitle>
        <figure
          className="case-study-object shop-ops-ticket"
          data-thread-anchor="case.study.shopops.ticket"
          data-thread-label="SHOPOPS · ticket"
        >
          <InlineReferenceSvg name="bowlstory-order-confirmation" />
        </figure>
        <figure
          className="case-study-object shop-ops-reply"
          data-thread-anchor="case.study.shopops.reply"
          data-thread-label="SHOPOPS · reply bubble"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 330 84" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="e-ops replies: Order placed. Your rice bowl is on its way.">
    <path d="M14 2h302q12 0 12 12v48q0 12-12 12H34L16 82l3-8h-5Q2 74 2 62V14Q2 2 14 2Z" fill="var(--case-study-bg)"
        stroke="currentColor" />
    <g fill="currentColor" font-size="15"><text x="21" y="30">Order placed.</text><text x="21" y="54">We will call you
            shortly.</text></g>
</svg>`,
            }}
          />
        </figure>
        <figure
          className="case-study-object shop-ops-bag"
          data-thread-anchor="case.study.shopops.bag"
          data-thread-label="SHOPOPS · bag"
        >
          <span
            dangerouslySetInnerHTML={{
              __html: `<svg viewBox="0 0 250 310" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="Mobility equipment rental bag">
    <g stroke="currentColor" stroke-width="1.2" fill="var(--case-study-bg)" stroke-linejoin="round">
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
</svg>`,
            }}
          />
        </figure>
        <InlineReferenceElement
          label="Company wallet"
          className="case-study-object shop-ops-wallet"
          role="group"
          threadAnchor="case.study.shopops.wallet"
          threadLabel="SHOPOPS · wallet"
        />
        <InlineReferenceElement
          label="Company meal statistics"
          className="case-study-object shop-ops-dashboard"
          role="group"
          threadAnchor="case.study.shopops.dashboard"
          threadLabel="SHOPOPS · dashboard"
        />
      </div>
      <ProjectLink />{" "}
    </article>
  );
}
