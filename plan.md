# Static portfolio layout phase

This session artifact contains both the implementation plan and the standalone build-agent prompt. The repository has not been changed.

## Plan

### Goal

Reproduce the complete static homepage layout of `https://dakshgajjar.com/` in the existing Next.js app before any post-preloader animation work. Treat the supplied full-page screenshots as the pixel-visual source of truth, the saved HTML as the source for exact content and SVG structure, and the live site as a cross-check. Do not make the builder infer missing copy, project order, palette, breakpoints, or visual scope.

### Inputs and current project

- Screenshots:
  - `references/screenshots/website_screenshot_laptop_L_1440px.png` — 1440 CSS px wide.
  - `references/screenshots/website_screenshot_laptop_1024px.png` — 1024 CSS px wide.
  - `references/screenshots/website_screenshot_mobile_tablet_768px.png` — 768 CSS px wide.
  - `references/screenshots/website_screenshot_mobile_l.png` — 850 px image width / 425 CSS px at 2x.
  - `references/screenshots/website_screenshot_mobile_m.png` — 750 px image width / 375 CSS px at 2x.
  - `references/screenshots/website_screenshot_mobile_sm.png` — 640 px image width / 320 CSS px at 2x.
- `references/reference_html.html` contains the reference page's content, section order, semantic labels, and inline SVG composition. Use it as reference material; do not copy its animation/runtime logic.
- `public/assets/` contains the vector source artwork for the project scenes.
- Current UI is a placeholder in `app/page.tsx`; the existing palette and preloader integration are in `app/globals.css` and `app/layout.tsx`.
- Installed stack: Next.js 16, React, TypeScript, Tailwind CSS 4, GSAP and Lenis. No new dependency is required for this phase.
- Before writing code, read the relevant Next.js 16 guide under `node_modules/next/dist/docs/` as required by the repository `AGENTS.md`.

### Scope and non-negotiable boundaries

In scope:

- The entire homepage, from the fixed header and hero through all six project scenes, the about section, and the contact ending.
- Accurate typography, colors, line breaks, content, spacing, section backgrounds/heights, artwork placement, and responsive reflow at every supplied screenshot width.
- Semantic page structure and the in-page navigation anchors listed below.
- Static SVG artwork that is independent of the continuous thread.

Out of scope:

- Do not add any animation, scroll reveal, timeline, parallax, smooth scrolling, cursor effect, hover motion, or GSAP/Lenis behavior to the homepage.
- Do not draw, approximate, reserve space for, or leave any part of the continuous orange thread. It is the site-wide `.thread-layer` / `.thread-path` and hero-thread system. Remove that entire connected visual route, including its hero crossings, bulb outline, capability orbit/frame/circle, project-to-project connectors, endpoints/dots/rings, and footer scribble/grip. The static text labels `INTENT`, `INTERACTION`, and `SYSTEM` are separate from that path and must remain in their screenshot positions.
- Do preserve independent static artwork and red details inside project illustrations. Do not remove the red `BEHIND IT.` heading treatment. The exclusion is the connected thread only, not every use of vermilion.
- Preserve the already completed preloader exactly. Do not edit its animation, timing, SVG, provider, accessibility, or ready behavior. “No animations” means no new homepage animation after the existing preloader.
- Do not implement the mobile menu drawer, contact dialog/form, project detail routes, or interaction states. Show the same closed/default controls as the screenshots. Only the in-page navigation, scroll cue, and back-to-top anchors need work.
- Do not add/remove packages, rewrite project configuration, or alter unrelated files.

### Visual system

- Full-bleed, stacked bands; no enclosing page card or horizontal gutters around the sections.
- Colors:
  - Near-black page background: `#050505`.
  - Warm ivory background/primary light text: `#F1EEE6`.
  - Near-black text on the work-intro panel: `#11100F`.
  - Vermilion accent: `#FF3B12`.
  - Muted about copy: approximately `#66625B`.
  - Avoid substituting pure white or pure white backgrounds.
- Fonts:
  - `Archivo` variable for display headings and general sans text.
  - `IBM Plex Mono` for navigation, project numbers/kickers, compact descriptions/labels, and small interface copy.
  - Do not leave the current Geist font as the homepage font. Keep the existing preloader visually/behaviorally intact.
- Typography is predominantly uppercase and tightly tracked. Display headings use very heavy weights (roughly 790–850), compressed line-height and negative tracking; body and project copy stays small and restrained. The reference uses a desktop edge gutter around 2.7vw (about 31px at 1140px) and a mobile gutter around 18px; use the screenshots to tune the fluid rule.
- The site header is fixed at the top. Desktop: `DG` at the left edge gutter and four small, letter-spaced mono links aligned right. Narrow layouts: `DG` left and `MENU` right; the menu remains closed and nonfunctional in this phase.
- At desktop, the hero fills one viewport height. At mobile, it also fills the first viewport. Place the very large three-line hero title close to the left gutter; place supporting copy at lower left and the small scroll cue at the lower edge (right on desktop, left under the copy on mobile).
- Match the source's full-width compositions and text/image layering. Do not use rasterized screenshots as backgrounds. Avoid horizontal overflow at any target width.

### Exact page content and order

1. **Fixed header**
   - Wordmark: `DG`.
   - Desktop nav, in order: `CAPABILITIES`, `PROJECTS`, `ABOUT`, `CONTACT`.
   - Mobile header shows `DG` and `MENU`.
   - Anchor targets: `#capabilities`, `#projects`, `#about`, and `#contact`; the wordmark returns to the page top.

2. **Hero — near-black**
   - H1, three lines: `I DESIGN` / `PRODUCTS` / `THAT THINK.`
   - Supporting copy: `Product designer working across digital experiences, AI products and intelligent systems.`
   - Keep the static cue `SCROLL TO FOLLOW THE THREAD` with its small down arrow; link it to `#work`. It is only a label/anchor, not an instruction to add a thread.
   - No hero thread SVG, path, dots, or endpoint.

3. **Practice introduction — warm ivory**
   - Large four-line heading: `FROM WHAT` / `PEOPLE NEED` / `TO WHAT` / `FEELS RIGHT.`
   - Keep the three separate mono labels `INTENT`, `INTERACTION`, `SYSTEM` in their reference positions, despite omitting the thread-drawn bulb outline.
   - Supporting copy: `I connect human intent, product behavior and the systems underneath.`
   - Do not replace the omitted thread/bulb with a newly invented drawing.

4. **Capabilities — near-black**
   - Heading: `I DESIGN THE EXPERIENCE.` / `AND THE INTELLIGENCE` / `BEHIND IT.` The final phrase is vermilion; other heading text is warm ivory.
   - Two discipline groups, preserving list order and wording:
     - `PRODUCT DESIGN`
       - `Product Strategy` — `Find the right problem to solve.`
       - `UX Research` — `Understand people before shaping solutions.`
       - `Interaction Design` — `Make every action feel clear and natural.`
       - `Design Systems` — `Build consistency that grows with the product.`
       - `Prototyping` — `Make ideas tangible. Test what matters.`
     - `AI SYSTEMS`
       - `AI Products` — `Turn intelligence into useful experiences.`
       - `Agentic Systems` — `Multi agent orchestration with clear roles and handoffs.`
       - `MCP` — `Connect models to the tools they need.`
       - `RAG` — `Ground responses in relevant knowledge.`
       - `Automation` — `Turn repeated work into reliable workflows.`
   - Match desktop side-by-side placement and the narrow-screen vertically arranged layout. No thread circle/orbit or junction decoration.

5. **Project collection** — six consecutive full-width scenes, in this exact order. Keep each kicker, description, visual composition, large project wordmark, and `EXPLORE PROJECT` label from the HTML/reference. The project label is visual-only in this phase; do not link to nonexistent local project routes.
   1. **Eigna** — warm ivory. Kicker `01 / PROPERTY MANAGEMENT`. Description: `Manage properties, tenants, rent, maintenance and finances from one place.` Large dark `EIGNA` title. Show the occupied two-bedroom flat, signed lease, inspection, completed wall repair, and property ledger/tax record as a connected product-story composition. Use the existing vectors:
      - `unit-03-occupied-two-bedroom-flat-with-living-room-kitchen-and-bathroom-mvv7k1zy.svg`
      - `unit-03-lease-signed-monthly-rent-32000-mvv7k5ze.svg`
      - `ai-inspection-compares-move-in-and-move-out-records-and-detects-wall-damage-with-94-percent-confidence-mvv7k4eb.svg` (use one of the duplicate `...mvv7m350.svg` files only if it is the matching variant in the reference)
      - `wall-repair-completed-4800-becomes-an-expense-in-the-property-ledger-mvv7k3he.svg`
      - `property-03-ledger-rent-32000-repair-4800-other-expenses-1250-net-25950-the-same-repair-record-carries-into-itr--schedule-hp-mvv7k7e4.svg`
   2. **Orbit** — near-black. Kicker `02 / AGENTIC AI`. Description: `Ask for what you need and Orbit works across the right tools to get it done.` Large warm-ivory `ORBIT` title, central agent conversation/product panel, and surrounding compact system/status panels. Match the screenshots and source inline SVG composition; use the supplied `svg-19`, `svg-20`, `svg-22`, both `svg-24` variants, `svg-26`, `svg-37`, and `svg-38` only where their actual vector contents match the reference. Do not use these by filename alone or invent a panel.
   3. **MealOPS** — warm ivory. Kicker `03 / WORKPLACE MEALS`. Description: `A workplace meal platform for ordering food, managing benefits and running meal programs.` Large dark `MEALOPS` title. Show the architectural plate/fork line art, food selection/order UI, order confirmation, delivery bag, and summary dashboard. Use:
      - `a-fork-in-flat-linework-mvv7kqxu.svg`
      - `a-plate-drawn-in-fine-architectural-lines-mvv7kq9l.svg`
      - `mealops-replies-order-placed-your-rice-bowl-is-on-its-way-mvv7kwbt.svg`
      - `meal-delivery-bag-on-the-way-arrives-at-1245-mvv7kzo8.svg`
   4. **Papertrail** — near-black. Kicker `04 / DOCUMENT AUTOMATION`. Description: `Upload accounting documents and turn them into reviewed, structured data ready to use.` Large warm-ivory `PAPERTRAIL` title. Show the tilted invoice/document stack and extracted-values panel as in the HTML/screenshots; use the matching inline SVG composition from the saved HTML and supplied vectors, not a generic replacement.
   5. **Scribe** — warm ivory. Kicker `05 / MEETING INTELLIGENCE`. Description: `Turn meetings into structured documents such as BRDs, SOPs and project charters.` Large dark `SCRIBE` title. Show recording playback, AI analysis/summary, generated project charter, and reply/status UI. Use:
      - `meeting-recording-playback-kickoffmp4-24-minutes-16-seconds-mvv7l774.svg`
      - `ai-analyzes-the-meeting-to-identify-goals-owners-and-decisions-mvv7l7uu.svg`
      - `generated-project-charter-goal-owners-and-key-decisions-a-revision-adds-the-approval-requirement-mvv7lan7.svg` (use the `...mvv7laz9.svg` duplicate only if it is the matching reference variant)
      - `scribe-replies-updated-in-version-2-mvv7lbwl.svg`
   6. **Crediflow** — near-black. Kicker `06 / DIGITAL LENDING`. Description: `Apply for a business loan, submit financial documents and move from eligibility to disbursement.` Large warm-ivory `CREDIFLOW` title. Show the PAN card, GST return, business bank statements, income-tax returns, financial assessment, eligibility/outcome, and loan amount as in the screenshot/HTML. Use:
      - `pan-identity-card-with-masked-personal-details-mvv7le41.svg`
      - `gst-return-with-filing-period-masked-gstin-and-tax-summary-mvv7lf08.svg`
      - `six-months-of-business-bank-statements-mvv7lkll.svg`
      - `three-years-of-income-tax-returns-mvv7lih1.svg`

6. **About — warm ivory**
   - Heading, three lines: `EVERY PRODUCT` / `CARRIES A` / `HUMAN IMPRINT.`
   - Body: `Mine comes from understanding people, shaping how things feel, and building the systems that make them work.`
   - Name: `DAKSH GAJJAR.`
   - Role: `Product designer. Curious builder.`
   - Keep the spare left-aligned text composition and extensive negative space from the screenshots; no thread overlay.

7. **Contact ending — near-black**
   - Large stacked heading: `HAVE A` / `PROBLEM` / `WORTH` / `UNTANGLING?` (line wrapping follows the reference at each width).
   - Show `LET'S TALK.` and `BACK TO TOP` with the reference underline/arrow treatments.
   - Contact action is visual-only; no form/dialog. Back-to-top is an in-page anchor.
   - Omit the contact thread scribble, thread grip, and all other connected route elements. Do not fill the cleared area with new artwork.

### SVG implementation constraint

SVGs are required for later path-based phases, so their vector DOM must remain available. Inline each used SVG into the React-rendered DOM (or use an existing inline-SVG project convention if one exists); do not use raster images, CSS backgrounds, or plain external `<img src="/assets/...">` for artwork that must expose its paths. Preserve each SVG's original `viewBox`, path geometry/order, `currentColor` behavior, `var(--world-bg)` / `var(--world-fg)` usage, and accessible `role`/`aria-label`. Do not add SVGR or another package in this phase. Keep the source files in `public/assets/` unchanged. The opaque `svg-*` assets must be inspected and matched by their actual contents before use.

### Responsive and interaction rules

- Compare at 1440, 1024, 768, 425, 375, and 320 CSS px widths, using the correspondingly named screenshots.
- Desktop: header links horizontal; hero title very large and three lines; practice and capabilities compositions use the desktop spatial relationship; project scenes are broad layered compositions with kicker/description at top corners and project title integrated with artwork.
- Tablet/mobile: header reduces to `DG` plus `MENU`; hero retains the three headline lines and puts copy/cue into the mobile positions; practice heading stays four lines; capabilities group becomes the narrow layout shown; each project scene becomes a tall, carefully layered/stacked composition without clipping or horizontal scroll; about/contact headings wrap as shown.
- Do not infer the mobile layouts by merely shrinking desktop. Match the different asset sizing/order and intentional whitespace in each supplied screenshot.
- Internal anchors only: `DG` -> page top, `SCROLL TO FOLLOW THE THREAD` -> `#work`, header links -> their section IDs, `BACK TO TOP` -> page top. No smooth-scroll CSS or JS.
- `MENU`, project `EXPLORE PROJECT`, and `LET'S TALK.` remain visible, closed/default, and do not open anything or navigate externally in this phase.

### Implementation sequence and acceptance checks

1. Read `AGENTS.md` and the relevant Next.js 16 documentation, then inspect the existing preloader and component conventions. Preserve the preloader.
2. Replace the homepage placeholder with semantic, static sections and exact copy; add only small reusable components where the project pattern benefits.
3. Load Archivo and IBM Plex Mono using the repository-compatible font approach. Apply scoped font variables so the homepage gets the reference fonts without disturbing the preloader.
4. Inline the matching SVG artwork and implement layout/styles in the existing app structure. Remove the continuous thread layer entirely; add no animation/runtime code.
5. Capture the finished page at all six screenshot widths and compare top-to-bottom against the corresponding references. Iterate sizes, placement, line breaks, wrapping, and spacing until the layout matches. Check no horizontal overflow at every width.
6. Verify all content/sections and SVGs are present; confirm the fixed desktop header and compact mobile header, that only in-page anchors navigate, and that no project/contact/menu behavior was added.
7. Run `pnpm lint` and `pnpm build`. Confirm there are no runtime/console errors and the existing preloader still behaves as before.

## Standalone build-agent prompt

Implement the static homepage replication described below in this repository. Do not implement post-preloader animations. This is the visual-layout phase only.

### Read first

Read `AGENTS.md`, the relevant Next.js 16 guide under `node_modules/next/dist/docs/`, `app/page.tsx`, `app/globals.css`, `app/layout.tsx`, and the existing preloader components before editing. The repo uses Next.js 16, React, TypeScript, Tailwind CSS 4, GSAP and Lenis. The existing preloader is complete: leave its behavior and files untouched.

### Source-of-truth files

- `references/reference_html.html` for exact section order, copy, labels, and SVG structure.
- `references/screenshots/website_screenshot_laptop_L_1440px.png`
- `references/screenshots/website_screenshot_laptop_1024px.png`
- `references/screenshots/website_screenshot_mobile_tablet_768px.png`
- `references/screenshots/website_screenshot_mobile_l.png` (425 CSS px)
- `references/screenshots/website_screenshot_mobile_m.png` (375 CSS px)
- `references/screenshots/website_screenshot_mobile_sm.png` (320 CSS px)
- `public/assets/` for the supplied SVG source artwork.

Build the complete home page, not just the first viewport: fixed header; hero; practice intro; capabilities; all six project sections (Eigna, Orbit, MealOPS, Papertrail, Scribe, Crediflow); about; contact ending. Use all exact headings, body copy, project kickers, project ordering, and named assets from the “Exact page content and order” section of this plan. The screenshots are the visual authority for composition and responsive placements; the saved HTML is the authority for exact text and SVG contents.

### Visual requirements

- Colors: `#050505` near-black, `#F1EEE6` warm ivory, `#11100F` dark text on ivory, `#FF3B12` vermilion, and muted about text near `#66625B`.
- Fonts: `Archivo` variable for sans/display text, `IBM Plex Mono` for nav/kickers/labels/compact descriptions. Do not use Geist for the homepage.
- Preserve the alternating bands: dark hero; ivory practice intro; dark capabilities; six projects alternating ivory/dark/ivory/dark/ivory/dark; ivory about; dark contact.
- Keep the reference's large heavy uppercase headlines, tight leading/tracking, full-width layouts, desktop edge spacing, deliberate negative space, and exact wraps as seen in each screenshot.
- Header: fixed at top; `DG` at left. Desktop has `CAPABILITIES`, `PROJECTS`, `ABOUT`, `CONTACT` at the right. Narrow sizes show `MENU` at the right, but it does not open a drawer.
- Hero: viewport-height dark panel; heading lines `I DESIGN`, `PRODUCTS`, `THAT THINK.`; exact support copy; static `SCROLL TO FOLLOW THE THREAD` and down arrow in reference position.
- Practice intro: ivory; four-line heading; retain `INTENT`, `INTERACTION`, `SYSTEM` labels in their reference positions.
- Capabilities: dark; final `BEHIND IT.` phrase is vermilion; two groups with five exact name/description pairs each.
- Projects: preserve each exact project kicker and description, alternating background, layered vector compositions, large title and `EXPLORE PROJECT` label. Use the matching assets specified in the plan; inspect every opaque `svg-*` asset's contents before choosing it. For Papertrail use the matching SVG composition embedded in the reference HTML and/or matching supplied artwork, not generic cards.
- About and contact: reproduce exact text and sparse composition, including the stacked contact heading, `LET'S TALK.`, and `BACK TO TOP`.

### Thread/animation exclusion

Do not include the connected orange thread route anywhere: no `.thread-layer`, `.thread-path`, `.hero-thread-*`, continuous connector paths, bulb outline, capability orbit/frame/circle, route dots/rings/endpoints, footer scribble, or contact thread-grip. Do not leave reserved space for it. Keep the separate practice labels, static vermilion heading text, and unrelated red details that are part of project artwork. Do not add replacement illustrations.

Do not add GSAP or Lenis behavior, CSS keyframes/transitions, scroll reveals, parallax, smooth scrolling, cursor effects, or hover animation. The existing preloader is the sole animation and must remain unchanged.

### SVG rule for future phases

The supplied vectors must remain path-accessible for later path animation. Inline every used SVG into the React DOM (or follow an existing inline-SVG convention); do not rasterize it or reference the vector as an external `<img>`/CSS background. Preserve original `viewBox`, path geometry and ordering, `currentColor`, CSS custom-property fills, and accessible labels. Do not add SVG tooling/dependencies. Leave the source assets unchanged.

### Interactions and accessibility

Only in-page anchors work: wordmark to top, scroll cue to `#work`, header nav to `#capabilities`, `#projects`, `#about`, `#contact`, and `BACK TO TOP` to top. `MENU`, project labels, and `LET'S TALK.` are static closed/default visuals; do not create project pages, drawers, modals, or contact forms. Keep semantic heading hierarchy, meaningful SVG labels, and the reference skip-link behavior.

### Responsive verification and completion

Implement genuinely responsive compositions; do not scale desktop artwork down as the sole mobile treatment. Compare screenshots at 1440 / 1024 / 768 / 425 / 375 / 320 CSS px, including the complete page. Fix line wrapping, section heights, asset positions/sizes, whitespace, and any horizontal overflow until each supplied image is closely matched. Ensure there are no new animations and no console/runtime errors. Run `pnpm lint` and `pnpm build`; report any remaining visual mismatch instead of claiming pixel-perfect completion without checking.
