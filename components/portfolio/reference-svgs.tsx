import type { SVGProps } from "react";

export function AcmeInvoiceSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 540"
      fill="none"
      role="img"
      aria-label="ACME SUPPLY invoice"
    >
      <path
        d="M1 1h398v538H1z"
        fill="var(--sheet)"
        stroke="var(--sheet-edge)"
        strokeWidth=".8"
      />
      <g fill="var(--black)">
        <text x="36" y="39" fontSize="14" fontWeight="500">
          ACME SUPPLY
        </text>
        <text x="36" y="49" fontSize="5.5" letterSpacing="1" opacity=".6">
          TRADING CO.
        </text>
        <g fontSize="6.5">
          <text x="313" y="41">
            SUPPLIES
          </text>
          <text x="313" y="51">
            EQUIPMENT
          </text>
          <text x="313" y="61">
            SOLUTIONS
          </text>
        </g>
        <text
          x="36"
          y="108"
          fontSize="26"
          fontFamily="var(--font-display)"
          fontWeight="650"
          letterSpacing="1.4"
        >
          INVOICE
        </text>
      </g>
      <g stroke="var(--black)" strokeWidth=".6" opacity=".65">
        <path d="M36 77h328M36 125h328M36 190h328v103H36zM36 210h328M172 190v103M211 190v103M278 190v103" />
      </g>
      <g fill="var(--black)" opacity=".28">
        <path d="M36 139h73v5H36z M36 150h46v5H36z M36 161h54v5H36z" />
        <path d="M253 140h110v4H253z M253 151h97v4H253z M253 162h83v4H253z" />
        <path d="M40 221h88v5H40z M181 221h16v5h-16z M225 221h28v5h-28z M302 221h30v5H302z M40 239h62v5H40z M181 239h16v5h-16z M225 239h28v5h-28z M302 239h43v5H302z M40 257h88v5H40z M181 257h16v5h-16z M225 257h28v5h-28z M302 257h30v5H302z M40 275h62v5H40z M181 275h16v5h-16z M225 275h28v5h-28z M302 275h43v5H302z" />
        <path d="M176 376h93v4H176z M176 387h80v4H176z M176 398h67v4H176z" />
      </g>
      <g fill="var(--black)" fontSize="7.5" letterSpacing=".5">
        <text x="39" y="204">
          DESCRIPTION
        </text>
        <text x="181" y="204">
          QTY
        </text>
        <text x="227" y="204">
          UNIT
        </text>
        <text x="303" y="204">
          AMOUNT
        </text>
      </g>
      <g fill="var(--black)" opacity=".25">
        <path d="M36 330h126v5H36z M36 350h97v5H36z M36 370h97v5H36z M36 390h126v5H36z M36 410h97v5H36z M36 430h97v5H36z M200 330h126v5H200z M200 350h97v5H200z M200 370h97v5H200z M200 390h126v5H200z M200 410h97v5H200z M200 430h97v5H200z" />
      </g>
    </svg>
  );
}

export function RiverInvoiceSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 540"
      fill="none"
      role="img"
      aria-label="RIVER &amp; CO. invoice"
    >
      <path
        d="M1 1h398v538H1z"
        fill="var(--sheet)"
        stroke="var(--sheet-edge)"
        strokeWidth=".8"
      />
      <g fill="var(--black)">
        <text x="36" y="39" fontSize="14" fontWeight="500">
          RIVER &amp; CO.
        </text>
        <text x="36" y="49" fontSize="5.5" letterSpacing="1" opacity=".6">
          TRADING CO.
        </text>
        <g fontSize="6.5">
          <text x="313" y="41">
            SUPPLIES
          </text>
          <text x="313" y="51">
            EQUIPMENT
          </text>
          <text x="313" y="61">
            SOLUTIONS
          </text>
        </g>
        <text
          x="36"
          y="108"
          fontSize="26"
          fontFamily="var(--font-display)"
          fontWeight="650"
          letterSpacing="1.4"
        >
          INVOICE
        </text>
      </g>
      <g stroke="var(--black)" strokeWidth=".6" opacity=".65">
        <path d="M36 77h328M36 125h328M36 190h328v103H36zM36 210h328M172 190v103M211 190v103M278 190v103" />
      </g>
      <g fill="var(--black)" opacity=".28">
        <path d="M36 139h73v5H36z M36 150h46v5H36z M36 161h54v5H36z" />
        <path d="M253 140h110v4H253z M253 151h97v4H253z M253 162h83v4H253z" />
        <path d="M40 221h88v5H40z M181 221h16v5h-16z M225 221h28v5h-28z M302 221h30v5H302z M40 239h62v5H40z M181 239h16v5h-16z M225 239h28v5h-28z M302 239h43v5H302z M40 257h88v5H40z M181 257h16v5h-16z M225 257h28v5h-28z M302 257h30v5H302z M40 275h62v5H40z M181 275h16v5h-16z M225 275h28v5h-28z M302 275h43v5H302z" />
        <path d="M176 376h93v4H176z M176 387h80v4H176z M176 398h67v4H176z" />
      </g>
      <g fill="var(--black)" fontSize="7.5" letterSpacing=".5">
        <text x="39" y="204">
          DESCRIPTION
        </text>
        <text x="181" y="204">
          QTY
        </text>
        <text x="227" y="204">
          UNIT
        </text>
        <text x="303" y="204">
          AMOUNT
        </text>
      </g>
      <g fill="var(--black)" opacity=".25">
        <path d="M36 330h126v5H36z M36 350h97v5H36z M36 370h97v5H36z M36 390h126v5H36z M36 410h97v5H36z M36 430h97v5H36z M200 330h126v5H200z M200 350h97v5H200z M200 370h97v5H200z M200 390h126v5H200z M200 410h97v5H200z M200 430h97v5H200z" />
      </g>
    </svg>
  );
}

export function NorthridgeInvoiceVerifiedSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 455"
      fill="none"
      role="img"
      aria-label="Northridge invoice INV-1042, total 1,280.00, verified"
    >
      <path
        d="M1 1h398v453H1z"
        fill="var(--sheet)"
        stroke="var(--sheet-edge)"
        strokeWidth=".8"
      />
      <g fill="var(--black)">
        <text x="36" y="39" fontSize="14" fontWeight="500">
          NORTHRIDGE
        </text>
        <text x="36" y="49" fontSize="5.5" letterSpacing="1" opacity=".6">
          TRADING CO.
        </text>
        <g fontSize="6.5">
          <text x="313" y="41">
            SUPPLIES
          </text>
          <text x="313" y="51">
            EQUIPMENT
          </text>
          <text x="313" y="61">
            SOLUTIONS
          </text>
        </g>
        <text
          x="36"
          y="108"
          fontSize="26"
          fontFamily="var(--font-display)"
          fontWeight="650"
          letterSpacing="1.4"
        >
          INVOICE
        </text>
      </g>
      <g stroke="var(--black)" strokeWidth=".6" opacity=".65">
        <path d="M36 77h328M36 125h328M36 190h328v103H36zM36 210h328M172 190v103M211 190v103M278 190v103" />
      </g>
      <g fill="var(--black)" opacity=".28">
        <path d="M36 139h73v5H36z M36 150h46v5H36z M36 161h54v5H36z" />
        <path d="M253 140h110v4H253z M253 151h97v4H253z M253 162h83v4H253z" />
        <path d="M40 221h88v5H40z M181 221h16v5h-16z M225 221h28v5h-28z M302 221h30v5H302z M40 239h62v5H40z M181 239h16v5h-16z M225 239h28v5h-28z M302 239h43v5H302z M40 257h88v5H40z M181 257h16v5h-16z M225 257h28v5h-28z M302 257h30v5H302z M40 275h62v5H40z M181 275h16v5h-16z M225 275h28v5h-28z M302 275h43v5H302z" />
        <path d="M176 376h93v4H176z M176 387h80v4H176z M176 398h67v4H176z" />
      </g>
      <g fill="var(--black)" fontSize="7.5" letterSpacing=".5">
        <text x="39" y="204">
          DESCRIPTION
        </text>
        <text x="181" y="204">
          QTY
        </text>
        <text x="227" y="204">
          UNIT
        </text>
        <text x="303" y="204">
          AMOUNT
        </text>
      </g>
      <g className="scan-fields" fill="var(--black)">
        <text x="132" y="142" fontSize="9">
          Invoice ID
        </text>
        <text x="132" y="166" fontSize="16">
          INV-1042
        </text>
        <text x="292" y="311" fontSize="9">
          Total
        </text>
        <text x="292" y="333" fontSize="14">
          1,280.00
        </text>
        <text x="36" y="374" fontSize="9">
          Status
        </text>
        <text x="36" y="399" fontSize="14">
          Verified
        </text>
      </g>
      <g
        className="scan-field-boxes"
        fill="none"
        stroke="var(--signal)"
        strokeWidth="1.4"
      >
        <path
          pathLength="1"
          data-scan-field="invoice"
          d="M124 146h128v30H124z"
          style={{
            strokeDashoffset: "0px",
            strokeDasharray: "1",
            opacity: "1",
          }}
        />
        <path
          pathLength="1"
          data-scan-field="total"
          d="M287 297h90v45h-90z"
          style={{
            strokeDashoffset: "0px",
            strokeDasharray: "1",
            opacity: "1",
          }}
        />
        <path
          pathLength="1"
          data-scan-field="status"
          d="M31 381h88v27H31z"
          style={{
            strokeDashoffset: "0px",
            strokeDasharray: "1",
            opacity: "1",
          }}
        />
      </g>
      <g
        className="scan-invoice-beam"
        aria-hidden="true"
        style={{
          translate: "none",
          rotate: "none",
          scale: "none",
          opacity: "0",
          visibility: "hidden",
        }}
        data-svg-origin="0 2"
        transform="matrix(1,0,0,1,398,0)"
      >
        <path d="M0 2v451" stroke="var(--signal)" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

export function HarborInvoiceRejectedSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 540"
      fill="none"
      role="img"
      aria-label="HARBOR LTD. invoice, rejected"
    >
      <path
        d="M1 1h398v538H1z"
        fill="var(--sheet)"
        stroke="var(--sheet-edge)"
        strokeWidth=".8"
      />
      <g fill="var(--black)">
        <text x="36" y="39" fontSize="14" fontWeight="500">
          HARBOR LTD.
        </text>
        <text x="36" y="49" fontSize="5.5" letterSpacing="1" opacity=".6">
          TRADING CO.
        </text>
        <g fontSize="6.5">
          <text x="313" y="41">
            SUPPLIES
          </text>
          <text x="313" y="51">
            EQUIPMENT
          </text>
          <text x="313" y="61">
            SOLUTIONS
          </text>
        </g>
        <text
          x="36"
          y="108"
          fontSize="26"
          fontFamily="var(--font-display)"
          fontWeight="650"
          letterSpacing="1.4"
        >
          INVOICE
        </text>
      </g>
      <g stroke="var(--black)" strokeWidth=".6" opacity=".65">
        <path d="M36 77h328M36 125h328M36 190h328v103H36zM36 210h328M172 190v103M211 190v103M278 190v103" />
      </g>
      <g fill="var(--black)" opacity=".28">
        <path d="M36 139h73v5H36z M36 150h46v5H36z M36 161h54v5H36z" />
        <path d="M253 140h110v4H253z M253 151h97v4H253z M253 162h83v4H253z" />
        <path d="M40 221h88v5H40z M181 221h16v5h-16z M225 221h28v5h-28z M302 221h30v5H302z M40 239h62v5H40z M181 239h16v5h-16z M225 239h28v5h-28z M302 239h43v5H302z M40 257h88v5H40z M181 257h16v5h-16z M225 257h28v5h-28z M302 257h30v5H302z M40 275h62v5H40z M181 275h16v5h-16z M225 275h28v5h-28z M302 275h43v5H302z" />
        <path d="M176 376h93v4H176z M176 387h80v4H176z M176 398h67v4H176z" />
      </g>
      <g fill="var(--black)" fontSize="7.5" letterSpacing=".5">
        <text x="39" y="204">
          DESCRIPTION
        </text>
        <text x="181" y="204">
          QTY
        </text>
        <text x="227" y="204">
          UNIT
        </text>
        <text x="303" y="204">
          AMOUNT
        </text>
      </g>
      <g fill="var(--black)" opacity=".25">
        <path d="M36 330h126v5H36z M36 350h97v5H36z M36 370h97v5H36z M36 390h126v5H36z M36 410h97v5H36z M36 430h97v5H36z M200 330h126v5H200z M200 350h97v5H200z M200 370h97v5H200z M200 390h126v5H200z M200 410h97v5H200z M200 430h97v5H200z" />
      </g>
      <g
        transform="translate(97 343) rotate(-12)"
        stroke="var(--signal)"
        fill="none"
      >
        <rect x="0" y="0" width="208" height="55" rx="2" strokeWidth="2" />
        <rect x="5" y="5" width="198" height="45" rx="1" strokeWidth=".6" />
        <text
          x="104"
          y="36"
          textAnchor="middle"
          fill="var(--signal)"
          stroke="none"
          fontFamily="var(--font-display)"
          fontSize="28"
          fontWeight="700"
        >
          REJECTED
        </text>
      </g>
    </svg>
  );
}

export function BowlstoryOrderMessageSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 270 108"
      fill="none"
      role="img"
      aria-label="Employee in Teams or Slack: Order a rice bowl from Bowlstory."
    >
      <text x="12" y="12" fill="currentColor" fontSize="10">
        TEAMS / SLACK
      </text>
      <path
        d="M14 22h242q12 0 12 12v52q0 12-12 12h-20l-16 9 3-9H14Q2 98 2 86V34Q2 22 14 22Z"
        fill="var(--world-fg)"
      />
      <g fill="var(--world-bg)" fontSize="16">
        <text x="21" y="52">
          Order a rice bowl
        </text>
        <text x="21" y="77">
          from Bowlstory.
        </text>
      </g>
    </svg>
  );
}

export function BowlstoryOrderConfirmationSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 310"
      fill="none"
      role="img"
      aria-label="Bowlstory order confirmed: one rice bowl, total 240 rupees"
    >
      <path
        d="M0 8L5 2L10 8L15 2L20 8L25 2L30 8L35 2L40 8L45 2L50 8L55 2L60 8L65 2L70 8L75 2L80 8L85 2L90 8L95 2L100 8L105 2L110 8L115 2L120 8L125 2L130 8L135 2L140 8L145 2L150 8L155 2L160 8L165 2L170 8L175 2L180 8L185 2L190 8L195 2L200 8L205 2L210 8L215 2L220 8L225 2L230 8L235 2L240 8V302L235 308L230 302L225 308L220 302L215 308L210 302L205 308L200 302L195 308L190 302L185 308L180 302L175 308L170 302L165 308L160 302L155 308L150 302L145 308L140 302L135 308L130 302L125 308L120 302L115 308L110 302L105 308L100 302L95 308L90 302L85 308L80 302L75 308L70 302L65 308L60 302L55 308L50 302L45 308L40 302L35 308L30 302L25 308L20 302L15 308L10 302L5 308L0 302Z"
        fill="var(--world-bg)"
        stroke="color-mix(in srgb, var(--world-fg) 12%, var(--world-bg))"
        strokeWidth=".6"
      />
      <g fill="var(--world-fg)" fontSize="12">
        <text x="23" y="47" fontWeight="500">
          ORDER CONFIRMED
        </text>
        <text x="23" y="97">
          Bowlstory
        </text>
        <text x="23" y="137">
          Rice bowl
        </text>
        <text x="204" y="137">
          1
        </text>
        <text x="23" y="163">
          Total
        </text>
        <text x="217" y="163" textAnchor="end">
          ₹240
        </text>
        <text x="23" y="249">
          Enjoy lunch.
        </text>
      </g>
      <path
        d="M23 67h23M23 188h194"
        stroke="var(--world-fg)"
        strokeWidth=".7"
      />
    </svg>
  );
}
