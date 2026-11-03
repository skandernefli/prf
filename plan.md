# SVG Thread Refactor Plan

Status: approved and implemented. Static geometry, responsive audits, lint, and production build verified. The final report records checks and remaining differences.

Scope: the orange thread system only. All page copy, section order, typography, project mockups, contact controls, and behavior remain unchanged.

Reference: <https://dakshgajjar.com/>

Evidence used:

- `components/portfolio/thread-layer.tsx` — current implementation.
- `app/page.tsx` — section order, thread anchors, hero/project/about/contact markup.
- `app/globals.css` — thread styling, stacking contexts, responsive rules.
- `references/thread.html` — saved rendered reference DOM, including final route paths.
- `references/screenshots/*` — supplied reference captures.
- Live reference measured at 1440 × 900 and 375 × 812 through headless Chrome/CDP.
- Current page measured at 1440 × 900, 1024 × 768, and 375 × 812.

The reference source code is not available. `references/thread.html` is a saved rendered DOM, not the authored source. Exact coordinates are reliable; the original generation algorithms are not. This plan distinguishes measured evidence from reconstruction.

---

## 1. Existing implementation analysis

### 1.1 Integration points

| File | Role |
| --- | --- |
| `components/portfolio/thread-layer.tsx` | All thread geometry, SVG markup, measurement, and terminal nodes. |
| `app/page.tsx` | Renders `<ThreadLayer />` at line 182, then all page sections. Supplies `data-thread-anchor` hooks on sections, hero lines, practice rows, capability rows, project figures, why-me points, about, and contact. |
| `app/globals.css` | `.thread-layer` z-index 18 absolute overlay; `.thread-path` stroke; about node/label; terminal circles; mobile stroke width. |
| `app/layout.tsx` | Page shell and preloader. The preloader must be dismissed before visual verification. |

### 1.2 Current architecture

`ThreadLayer` is a single client component that renders:

- one absolutely positioned `<svg className="thread-layer">` at z-index 18;
- one giant `<path className="thread-path" d={geometry.path}>` containing all route subpaths;
- two about circles with `PROBLEM` / `PRODUCTION` labels;
- one terminal ring and core at the back-to-top link.

Geometry pipeline:

1. `anchorRect()` measures each `[data-thread-anchor]` relative to the portfolio root.
2. `buildGeometry()` derives section positions, hero points, bulb points, capability arms, project figure edges, why-me lanes, about nodes, and contact points.
3. `spline()` converts point lists into Catmull-Rom-style cubic segments.
4. `ResizeObserver`, window `resize`, window `load`, and `document.fonts.ready` rebuild the geometry.
5. The SVG uses `viewBox="0 0 width height"` and `preserveAspectRatio="none"`.

Key current behavior:

- Hero path begins at `{ x: width * 0.035, y: 0 }` — the literal top edge (`thread-layer.tsx` lines 378–390).
- The hero route is one diagonal spline through three line centers, then to `y = hero.bottom`.
- The mobile branch is only `width <= 700` (line 221); there is no distinct tablet route grammar.
- The work bulb is built from a hand-tuned outline array (`bulbOutline`, lines 267–282) and a filament path through the seven practice rows.
- Capability geometry builds a left arm and right arm from item bounds, then a giant rounded outer loop (lines 318–415).
- Each project is a spline through figure-edge points using rotating sides top/right/bottom/left (`buildProjectPoints`, lines 138–190 and calls at 417–508).
- Why-me is a lane-based spline through alternating node centers (lines 510–554).
- About draws invented `PROBLEM` / `PRODUCTION` nodes and a zigzag between them (lines 557–604 and 703–728).
- Contact is a spline through the CTA and alternating sides of the contact links, ending at back-to-top (lines 606–624).
- `spline()` uses uniform Catmull-Rom control points and clamps each coordinate independently to `[8, width-8]` / `[0, height-8]`. This causes cusps, overshoot, flat spots at clamp boundaries, and lopsided loops.

### 1.3 Current CSS and layering

From `app/globals.css`:

- `.thread-layer`: `position: absolute; z-index: 18; top: 0; left: 0; overflow: visible`.
- `.thread-path`: `fill: none; stroke: var(--signal); stroke-width: 2.2px; stroke-linecap: round; stroke-linejoin: round`.
- `.thread-about-node`: filled signal circle.
- `.thread-about-label`: black monospace label centered in the node.
- `.thread-terminal`: ring, 2.2px; `.thread-terminal-core`: filled dot.
- Mobile (`max-width: 700px`): thread and terminal stroke becomes `1.8px`.
- Hero: `.hero` z-index 2, `overflow: hidden`; `.hero-copy` z-index 4; `.hero-title` static.
- Site header: z-index 60.
- Project `.world-title`: z-index 20, so it hides the thread.
- Project figures: z-index 8 (behind thread) or 21/22/23/24 (above thread).
- `.about-profile` z-index 2; `.contact-statement` z-index 2.
- Why-me nodes have no z-index, so the thread at z-index 18 draws above the node rings.

This project-figure z-index relationship already matches the reference and must be preserved.

### 1.4 Current measured layout

At 1440 width (client width 1425 due to the scrollbar):

| Section | Top | Height |
| --- | ---: | ---: |
| hero | 0 | 900 |
| selected-work | 900 | 900 |
| capabilities | 1800 | 1462 |
| project-worlds | 3262 | 4098.8 |
| Kabri | 3262 | 1024.7 |
| Norma | 4286.7 | 1024.7 |
| Mesa | 5311.4 | 1024.7 |
| Creditflow | 6336.1 | 1024.7 |
| why-me | 7360.8 | 3059 |
| about | 10419.8 | 900 |
| contact | 11319.8 | 900 |

Hero character boxes at 1440:

| Line | Text | X range | Y range |
| --- | --- | --- | --- |
| 1 | FROM | F 23–140, R 140–281, O 281–434, M 434–610 | 169–399 |
| 2 | CONCEPT | C 23–164, O 164–317, N 317–466, C 466–607, E 607–737, P 737–864, T 864–989 | 334–564 |
| 3 | TO LAUNCH | T 34–153, O 153–306, L 328–442, A 442–579, U 579–727, N 727–875, C 875–1016, H 1016–1165 | 500–730 |

At 375 width (client width 360):

| Section | Top | Height |
| --- | ---: | ---: |
| hero | 0 | 812 |
| selected-work | 812 | 887.6 |
| capabilities | 1699.6 | 1119.3 |
| project-worlds | 2818.9 | 4500.3 |
| Kabri | 2818.9 | 1211.8 |
| Norma | 4030.7 | 1096.2 |
| Mesa | 5126.9 | 1096.2 |
| Creditflow | 6223.1 | 1096.2 |
| why-me | 7319.3 | 2360.9 |
| about | 9680.2 | 413.5 |
| contact | 10093.7 | 710.4 |

Mobile hero character boxes:

| Line | Text | X range | Y range |
| --- | --- | --- | --- |
| 1 | FROM | F 13–45, R 45–83, O 83–125, M 125–172 | 329–391 |
| 2 | CONCEPT | C 13–52, O 52–93, N 93–134, C 134–172, E 172–207, P 207–241, T 241–275 | 374–436 |
| 3 | TO LAUNCH | T 16–49, O 49–90, L 96–127, A 127–164, U 164–204, N 204–244, C 244–283, H 283–323 | 420–482 |

### 1.5 Current rendered failures confirmed by screenshot

- Line begins at the top edge, above the navigation.
- Hero route is a mostly straight diagonal cutting through FROM, CONCEPT, and TO LAUNCH.
- No hero back/front layering.
- Work bulb is lopsided and open; it does not read as the reference bulb.
- Capability route wraps the whole content in one giant rounded rectangle and clips at the viewport edge.
- Project routes cut through project compositions and titles instead of threading around them.
- Why-me is a wide sawtooth through alternating nodes.
- About adds invented labeled circles.
- Contact is a straight diagonal through the heading and links.
- Mobile routes overflow horizontally and wrap off-canvas.

---

## 2. Reference analysis

### 2.1 Reference architecture and stacking

The live reference uses:

- one page-wide `svg.thread-layer` at z-index 18 with multiple `.thread-path` route paths;
- separate hero SVG layers: `.hero-thread-back` at z-index 3 and `.hero-thread-front` at z-index 5;
- `.hero-copy` at z-index 4 between them;
- header z-index 60;
- `.world-title` z-index 20 over the thread;
- project figures at z-index 8 (under thread) or 21+ (over thread);
- `.thread-layer` with `overflow: hidden`.

Computed stroke: `#ff3b12`, width 2.2px, round caps and joins, fill none.

The main routes are separate paths with shared endpoints, not one continuous `d`. The reference keyed routes are:

`work-index`, `capabilities-entry`, `capabilities-product`, `capabilities-ai`, `capabilities-exit`, `world-eigna`, `world-orbit`, `world-mesa`, `world-papertrail`, `world-scribe`, `world-creditflow`, `about`, `contact`, plus `world-orbit-left` and `world-orbit-right`.

### 2.2 Reference measured page at 1440

| Section | Top | Height |
| --- | ---: | ---: |
| hero | 0 | 900 |
| selected-work | 900 | 2344 |
| project-worlds | 3244 | 6148.2 |
| Eigna | 3244 | 1024.7 |
| Orbit | 4268.7 | 1024.7 |
| Mesa | 5293.4 | 1024.7 |
| Papertrail | 6318.1 | 1024.7 |
| Scribe | 7342.8 | 1024.7 |
| Creditflow | 8367.5 | 1024.7 |
| about | 9392.2 | 900 |
| contact | 10292.2 | 900 |

Reference route endpoints and bounds at 1440:

| Route | Start | End | Bounds |
| --- | --- | --- | --- |
| work-index | 1046.52, 879.92 | 1003.32, 1800 | x 878.04–1215, y 879.92–1800 |
| capabilities-entry | 1003.32, 1800 | 719.99, 2351.17 | x 50.4–1414.8, y 1800–2351.17 |
| capabilities-product | 719.99, 2351.17 | 719.99, 3143.17 | x 351.8–720, y 2351.17–3143.17 |
| capabilities-ai | 719.99, 2351.17 | 719.99, 3143.17 | x 720–1088.2, y 2351.17–3143.17 |
| capabilities-exit | 719.99, 3143.17 | 719.99, 3243.97 | vertical 100.8 |
| world-eigna | 719.99, 3243.97 | 720, 4268.67 | x 158.4–1358.46 |
| world-orbit | 720, 4268.67 | 763.2, 5293.38 | x 689.73–1306.8 |
| world-mesa | 763.2, 5293.38 | 835.2, 6318.08 | x 489.6–1203.96 |
| world-papertrail | 835.2, 6318.08 | 345.6, 7342.78 | x 115.2–864 |
| world-scribe | 345.6, 7342.78 | 878.4, 8367.48 | x 345.6–1166.4 |
| world-creditflow | 878.4, 8367.48 | 878.4, 9392.19 | x 230.4–1182.97 |
| about | 878.4, 9392.19 | 878.4, 10292.19 | x 873.3–1301.07 |
| contact | 878.4, 10292.19 | 1141.17, 11055.27 | x 855.94–1411.37 |

### 2.3 Reference hero

Reference copy is `I DESIGN / PRODUCTS / THAT THINK.` at 1440 with the same y bands as the current page (169–399, 334–564, 500–730).

Measured hero geometry at 1440:

- Origin dot: `(90.72, 86)`, below the 60px header.
- Back segment 0: `(90.72, 86)` → `(453.57, 254.80)`, ending behind the `S` of `DESIGN`.
- Front hook: `(453.57, 254.80)` → `(427.35, 306.68)`.
- Back segment: `(427.35, 306.68)` → `(165.80, 400.21)`.
- Front segment: `(165.80, 400.21)` → `(95.27, 421.37)`.
- Back segment: `(95.27, 421.37)` → `(27.79, 489.06)`, reaching the left gutter.
- Front horizontal: `(27.79, 489.06)` → curve → `(107.45, 537.55)` → horizontal to `(943.92, 537.55)`, across the lower band of `PRODUCTS`.
- Back swing: `(943.92, 537.55)` → `(1161.46, 604.01)`.
- Front loop: `(1161.46, 604.01)` → `(1012.27, 606.93)`, looping around the end of the second line.
- Back hook: `(1012.27, 606.93)` → `(1086.05, 688.72)`.
- Back squiggle: `(1086.05, 688.72)` → `(1080.21, 712.09)` → `(1067.06, 735.46)` → `(1052.46, 763.21)`.
- Tail: `(1052.46, 763.21)` → `(1046.52, 879.92)`.
- Small ring at the tail around `(1052, 763)`.

The key behavior is not the literal shape alone. It is the back/front handoff: the thread is hidden by glyphs on the back layer and visibly loops over them on the front layer. The route never touches y=0.

At 375 the reference uses a dedicated mobile grammar:

- origin `(32, 86)`;
- back path to `(109.84, 352.22)` inside the first line;
- front hook to `(106.96, 366.34)`;
- back to `(72.50, 391.35)`;
- front to `(53.39, 397.93)`;
- back to `(35.10, 416.54)`;
- front horizontal at `y = 429.98` from x 57.25 to x 242.71;
- back swing to `(301.66, 447.99)`;
- front loop to `(261.23, 448.79)`;
- back vertical to `(281.22, 470.96)`;
- squiggle down to `(227.46, 590.14)`;
- quarter-turn tail to `(363, 671.73)`, then vertical to `(363, 798.90)`.

### 2.4 Reference work index (bulb)

At 1440 the reference route:

- enters at `(1046.52, 879.92)`;
- drops to `y = 1019.76`;
- forms a closed bulb-like loop bounded by `x 878.04–1215`, `y 1035.12–1344.62`;
- descends through a neck to `y 1436.78`;
- makes three rounded hairpin waves across `x 993.72–1171.32`, `y 1436.78–1621.10`;
- exits at `(1003.32, 1800)`.

The waves pass next to the practice labels, not through the text. The bulb is a continuous loop, not several tangent arcs.

### 2.5 Reference capabilities

At 1440:

- Entry from `(1003.32, 1800)` goes down, right to the page edge, down the right side to `y 2167.98`, left along a lower rail at `y 2199.98`, makes a 32px-radius left U-turn at `x 82.4`, returns right to `x 687.99`, then a 32px-radius turn down to the split junction at `(719.99, 2351.17)`.
- From the split junction, one elliptical arc with `rx 368.195`, `ry 396` goes to the bottom junction `(719.99, 3143.17)` on the left; a mirrored arc goes on the right.
- Each arc passes through 5 small ring dots at the capability rows.
- Split and merge junctions are 10px ring SVGs.
- Exit is vertical from `(719.99, 3143.17)` to the first project at `(719.99, 3243.97)`.

At 375 the capabilities use two narrow U-shaped arms instead of full ellipses:

- entry from `(363, 1763.56)` curves left to `(187.5, 2034.91)`;
- left arm bows to `x 136.53` and runs down to `y 2741.47`, then returns to center at `(187.5, 2802.91)`;
- right arm mirrors to `x 238.47`;
- exit curves to `(262.5, 2882.91)`.

### 2.6 Reference project routes

The project paths are intentionally irregular, but each follows a consistent grammar:

- enter from the section top at the previous endpoint;
- sweep into the composition around the largest figure;
- alternate over/under figures according to the z-index layering;
- make 2–5 large rounded direction changes;
- exit at the next section’s top at a shared point.

Measured reference project shapes were extracted exactly from the rendered DOM. The current page’s figures align closely with these reference compositions:

| Current section | Reference analogue | Alignment evidence |
| --- | --- | --- |
| Kabri | Eigna | Current object boxes are within ~1% of reference Eigna after the 1440→1425 width difference. |
| Norma | Papertrail | Current scan ledger/paper/extracted boxes align with reference Papertrail after x/y translation. |
| Mesa | Mesa | Figure anchors are nearly identical. |
| Creditflow | Creditflow | Documents and outcome panel align after translation; some x offsets differ by 30–90px and will be anchor-adjusted. |

### 2.7 Reference about and contact

About at 1440:

- route starts at `(878.4, 9392.19)` at the top of the about section;
- occupies the right half, bounds `x 873.3–1301.07`, `y 9392.19–10292.19`;
- draws a fingerprint made of nested open ridge curves;
- terminates in a small ring near the bottom of the fingerprint;
- the route is clipped to the about section.

Contact at 1440:

- route starts at `(878.4, 10292.19)`;
- forms a large tangle in the upper-right, bounds `x 855.94–1411.37`, `y 10292.19–11055.27`;
- ends at a ring/grip at `(1141.17, 11055.27)` with `PULL TO UNTANGLE`;
- the tangle is a continuous path of large overlapping loops, not a decorative scribble.

At 375 both compositions move below the copy:

- about fingerprint occupies `x ~84–348`, below the heading and byline;
- contact tangle sits below `LET'S TALK` and above the bottom controls;
- terminal ring remains at the bottom right.

This difference matters: the current mobile about/contact sections are much shorter and content-dense, so the reference’s below-copy space does not exist. Mobile requires a compact adaptation.

### 2.8 Phase 3 observation verification

| Observation | Verification |
| --- | --- |
| Starts below navigation, not at viewport top | Confirmed: reference origin `(90.72, 86)` at 1440 and `(32, 86)` at 375. Current starts at `y = 0`. |
| Hero follows a deliberate trajectory around the heading | Confirmed: reference alternates back/front segments with measured handoffs at `x 453.57`, `427.35`, `165.80`, `95.27`, `27.79`, `943.92`, `1161.46`, `1012.27`. |
| Passes behind the intended `R` and intersects the `O` from behind | The reference copy differs, so this cannot be copied literally. The equivalent is the back-layer pass behind the first-line glyph and the front hook emerging from it. In the current copy, map the back pass to `R` and the front hook to `O` using the measured current letter boxes. |
| Changes direction toward the top of the `C` in `CONCEPT` | The reference equivalent is the back diagonal to `(165.80, 400.21)` at the upper-left of its second line, then the front segment into the left gutter. For current `CONCEPT`, the corresponding target is the top-right of `C` at approximately `(140, 400)` and then the front segment through `(90, 421)`. |
| Follows the heading composition before turning toward `LAUNCH` and forming a loop | Confirmed: reference runs the front horizontal across the second line, loops at the right end, hooks behind, and squiggles into the third-line tail. The current route will reuse that sequence, with `LAUNCH` occupying the third line. |
| Work lightbulb and wave | Confirmed in the reference route: closed bulb loop plus neck plus three hairpin waves. Current bulb is open/lopsided. |
| Continues through remaining sections to the end | Confirmed: reference continues through capabilities, six project worlds, about fingerprint, and contact tangle. Current page has four projects and one custom why-me section, so the route must be re-sequenced without changing page content. |

---

## 3. Current-versus-reference discrepancy matrix

Each row states reference behavior, current behavior, required correction, implementation location, and verification.

| ID | Reference behavior | Current behavior | Required correction | Implementation location | Verification |
| --- | --- | --- | --- | --- | --- |
| D1 | Origin dot at `(90.72, 86)` desktop and `(32, 86)` mobile, below header. | Route starts at `(0.035W, 0)`, touching viewport top. | Remove hero from main layer; add separate hero layers with explicit origin. Clamp all route points below `y = 72`. | `thread-layer.tsx` hero builder; new hero back/front components; `page.tsx` hero markup. | Full-page screenshot: no orange pixel on top edge; origin dot visible below header at 1440/1024/768/375/320. |
| D2 | Hero thread alternates z3 back and z5 front around hero copy z4. | Single z18 path is always above all hero text. | Add `.hero-thread-back` and `.hero-thread-front` SVGs; split hero path at measured handoffs. | `page.tsx` hero; `globals.css`; new hero geometry. | Inspect stacking with DevTools and screenshot: back segments hidden by glyphs; front hooks visible. |
| D3 | Hero curves use explicit cubics with intentional loops and G1 handoffs. | Uniform Catmull-Rom spline through line centers; diagonal cuts; cusps. | Replace with explicit cubic/arc segments and measured letter-relative points. | `thread-layer.tsx` `spline()` removal; hero builder. | Tangent check at each handoff; visual comparison at 2× zoom. |
| D4 | Work route forms closed bulb at `x 878–1215`, `y 1035–1345`, then three hairpin waves to `y 1621`, exit `(1003, 1800)`. | Bulb is lopsided/open, oversized in places; route exits at `x ~0.53W`; wave geometry crosses labels. | Rebuild bulb as closed curve around practice drawing; use three rounded waves through label gaps; exit at `0.697W`. | `thread-layer.tsx` lines 243–298 and work route. | Compare crop of current work section with reference `ref1440_01_1200.png`; bulb symmetry measured against centerline; labels have ≥8px clearance. |
| D5 | Capabilities entry follows right edge, lower rail, left U-turn, returns to center split. | Entry forms a large irregular loop around heading; path clips at viewport on mobile. | Use measured perimeter: right edge `0.982W`, lower rail `y = heading.bottom + ~18`, left U at `0.058W`, center split `0.5W`. | `thread-layer.tsx` lines 300–415; capability route builder. | Screenshot and path BBox: entry stays within x 40–W−10; no off-canvas points; heading unobstructed. |
| D6 | Two elliptical arcs share top/bottom junctions; junction rings and 10 capability row dots. | One giant rounded rectangle around both lists; no junction dots or row dots. | Draw left/right elliptical arcs from split to merge; add 10px junction rings and 18px row rings (r7 + r2.5). | `thread-layer.tsx` capability SVG; `globals.css` marker classes. | Arc BBox matches `rx ≈ 0.256W`, `ry ≈ 396`; all 10 dots lie on arcs; no arc crosses list text. |
| D7 | Project routes are section-specific compositions with intentional over/under figure relationships. | Generic spline through rotating figure edges; cuts through mockups and composition. | Replace generic builder with one explicit route per project, each anchored to current figures and matching its reference analogue’s route grammar. | `thread-layer.tsx` `buildProjectPoints` removal; new project route builders. | Per-section screenshots; compare silhouette and figure crossings with reference crops; verify z-index behavior. |
| D8 | Project routes share exact endpoints at section top/bottom. | Project segments often start/end at arbitrary `x` values, causing kinks and continuity breaks. | Define one junction constant per section boundary and use it for both sides; add short top/bottom connectors where the reference analogue starts at a different `x`. | `thread-layer.tsx` project route constants; all project builders. | Measure start/end of every path in DOM; max gap ≤0.5px; no visible discontinuity at 4× zoom. |
| D9 | No why-me section; reference uses composed loops in other sections. | Why-me is a wide sawtooth through alternating nodes; cusps and copy crossings. | Replace with a custom serpentine “beaded thread” in the negative space; nodes sit above the thread at z19; desktop uses alternating lanes, mobile uses a compact beaded left chain. | `thread-layer.tsx` why-me builder; `globals.css` `.why-me-node`. | Node tangents vertical; no cusp; no route intersection with `.why-me-point-copy` rects; mobile route within x 16–56. |
| D10 | About uses a large right-side fingerprint plus terminal ring. | About uses two invented labeled circles (`PROBLEM`, `PRODUCTION`) and a zigzag. | Remove nodes/labels; add fingerprint generator in right half desktop, compact bottom-band ridge motif mobile; terminal ring. | `thread-layer.tsx` about builder; `globals.css` remove node/label styles if unused; mobile logic. | Desktop fingerprint readable with ≥8 nested ridges; no overlap with `.about-profile`; mobile no text overlap; ring visible. |
| D11 | Contact uses a large upper-right tangle and terminal grip. | Straight diagonal through heading, CTA, and links. | Build a continuous multi-loop tangle in right column; route around content; terminal at existing back-to-top ring (desktop) and bottom-right mobile ring/tail. | `thread-layer.tsx` contact builder; `globals.css` terminal. | Screenshot at 1440/375; no line through heading/CTA/link text; tangle has ≥4 loops; terminal ring intact. |
| D12 | Mobile hero has dedicated compact route and right-edge tail. | Mobile hero shares desktop diagonal, starts at top, ends at right edge without deliberate tail. | Implement measured mobile hero grammar from §2.3; use `W−12` right gutter rather than 375-specific x values. | `thread-layer.tsx` mobile hero builder; hero layers. | Mobile screenshots at 375/320; no horizontal overflow; origin at 32px; tail visible in right gutter. |
| D13 | Mobile capabilities use two narrow U arms at center gap. | Giant outer loop wraps off-viewport; branches at x≈8 and W−8. | Use U arms at `x ≈ 0.36W` and `0.64W` around the central orbit, from split to merge. | `thread-layer.tsx` mobile capability builder. | No point outside x 8–W−8; arms do not cross capability text; screenshot matches reference U shape. |
| D14 | Mobile project routes stay in margins and thread between stacked figures. | Mobile project paths cross compositions and detach from sections. | Build mobile variants from current stacked figure boxes; keep route in side margins/negative space; preserve over/under z-index. | `thread-layer.tsx` mobile project builders. | 375/320 screenshots; no text/logo collisions; route remains within section bounds. |
| D15 | Main thread layer clips to page bounds. | `overflow: visible`; mobile loops extend off-canvas. | Set `.thread-layer { overflow: hidden; }`; clamp all route control points to page and section bounds; add about clip path. | `globals.css`; `thread-layer.tsx` SVG and helpers. | `scrollWidth === clientWidth` at every tested width; no orange pixels outside page. |
| D16 | Consistent 2.2px stroke across reference desktop; mobile remains visually similar. | 2.2px desktop, 1.8px mobile; some loops look heavier due overlap. | Use 2.2px everywhere unless mobile screenshot shows excessive weight; do not vary by arbitrary breakpoint. | `globals.css` `.thread-path`, mobile media query. | Computed stroke width in CDP at 1440 and 375; compare line weight to reference crops. |
| D17 | Capability row dots and junction rings are visible, thread passes through them. | No markers; route is only a line. | Add marker circles at 10 row positions, plus split/merge junction rings, drawn after paths. | `thread-layer.tsx`; CSS marker classes. | Count 12 markers in DOM; positions within 1px of arc; visual inspection. |
| D18 | Route is a sequence of connected paths with shared endpoints. | Multiple independent subpaths sometimes start/end at unrelated points, producing gaps. | Make every path endpoint explicit; join route segments with shared constants; add continuity assertion in development. | `thread-layer.tsx` route builders and tests. | DOM path endpoints match previous endpoints; no visible gaps at 4× zoom. |

---

## 4. Complete route specification: hero to final section

### 4.1 Coordinate conventions

- `W` = portfolio root client width; `H` = portfolio root height.
- All main-layer coordinates are page CSS pixels relative to the portfolio root top-left.
- Hero-layer coordinates are page CSS pixels relative to the hero top-left; the hero SVGs have `viewBox="0 0 W heroHeight"`.
- `hero.bottom` is the shared handoff between hero and main layer.
- `x`/`y` values below are measured at 1440 with a 1425px client width unless marked relative. Implementation must derive them from anchors at runtime and use the ratios as fallback.
- Junctions are named constants and reused by both adjacent routes.

Shared junctions:

| Constant | Value / rule |
| --- | --- |
| `J_HERO` | `(0.734W, hero.bottom)` desktop; `(W − 12, hero.bottom)` mobile. |
| `J_WORK` | `(0.697W, capabilities.top)`. |
| `J_CAP_TOP` | `(0.5W, capabilityOrbit.top − 18)`. |
| `J_CAP_BOTTOM` | `(0.5W, J_CAP_TOP.y + capabilityOrbit.height)`. |
| `J_KABRI` | `(0.5W, projects.top)`. |
| `J_NORMA` | `(0.58W, kabri.bottom)`. |
| `J_MESA` | `(0.53W, norma.bottom)`. |
| `J_CREDIT` | `(0.58W, mesa.bottom)`. |
| `J_WHY` | `(0.61W, projects.bottom)`. |
| `J_ABOUT` | `(0.61W, whyMe.bottom)`. |
| `J_CONTACT` | `(0.61W, about.bottom)`. |

### 4.2 Desktop hero route (1440 measured, implementation anchor-relative)

Hero back layer (z3), then front layer (z5). Each row lists entry → exit and the intended curvature.

| ID | Landmark | Entry → exit | Coordinates | Layer | Curvature / next |
| --- | --- | --- | --- | --- | --- |
| H0 | Below header | origin dot | `(90.72, 86)` | back | Dot r4. First cubic begins downward-right. |
| H1 | FROM: behind R into O | top-left → behind O | `(90.72, 86)` → `(343.5, 254.8)`; handles `(124.6, 165.7)`, `(215.5, 216.8)` | back | Gentle downward-right sweep; passes behind R and ends hidden in O. |
| H2 | FROM: O front hook | behind O → lower-left of O | `(343.5, 254.8)` → `(309, 306.7)`; handles `(354, 256.5)`, `(378, 262)` | front | Small clockwise hook; emerges from behind O. |
| H3 | FROM→CONCEPT: top of C | O lower-left → top-right of C | `(309, 306.7)` → `(140, 400.2)`; handles `(260, 334)`, `(180, 366)` | back | Diagonal down-left; ends at the top band of the first C in CONCEPT. |
| H4 | CONCEPT: left front pass | top-right of C → left of C | `(140, 400.2)` → `(90.5, 421.4)`; handles `(115, 408)`, `(102, 414)` | front | Short visible segment over the C. |
| H5 | Left gutter | left of C → left gutter | `(90.5, 421.4)` → `(27.79, 489.1)`; handles `(52.3, 434.2)`, `(27.79, 463.2)` | back | Quarter turn; tangent becomes horizontal. |
| H6 | CONCEPT lower band | left gutter → right end of line 2 | `(27.79, 489.1)` → `(107.5, 537.6)` → `H 828`; handle `(27.79, 514.9)`, `(52.3, 537.6)` | front | Front horizontal across lower third of CONCEPT; passes over glyphs. |
| H7 | Right swing | end of horizontal → right of line 2 | `(828, 537.6)` → `(1019, 604.0)`; handles `(1020, 537.6)`, `(1060, 525)` | back | Sweeps right and down; disappears toward line 3. |
| H8 | TO LAUNCH: loop | right swing → left of line 3 | `(1019, 604.0)` → `(888, 606.9)`; handles `(1007, 682)`, `(870, 681)` | front | Clockwise loop around the end of CONCEPT/start of TO LAUNCH. |
| H9 | TO LAUNCH: back hook | loop → behind line 3 | `(888, 606.9)` → `(953, 688.7)`; handles `(888, 590.9)`, `(972, 586.5)`, `(953, 609.9)` | back | S-hook; disappears behind third-line glyphs. |
| H10 | TO LAUNCH: squiggle + tail | behind line 3 → hero bottom | `(953, 688.7)` → alternating `y` 712/735/763 with x 946/937/924 → `(1046.5, 900)` | back | Small alternating squiggle; ring at `(924, 763)`; tail curves into J_HERO. |

Hero terminal ring: ring r9 and core r3 centered at `(924, 763)`. It is decorative, not an endpoint; the path continues to `J_HERO`.

### 4.3 Desktop work and capabilities

| ID | Landmark | Entry → exit | Coordinates | Layer | Curvature / next |
| --- | --- | --- | --- | --- | --- |
| W1 | Work entry | J_HERO → bulb top | `(1046.5, 900)` → `(1046.5, 1019.8)` | main z18 | Vertical with slight easing; enters bulb. |
| W2 | Work bulb | bulb top → bulb lower right → bulb top | Closed loop bounded by `x 878–1215`, `y 1035–1345` | main | Use four cubic segments; circle center `(1046.5, 1189.9)`, rx 168.5, ry 154.8. |
| W3 | Bulb neck | bulb top/right → wave start | `(996.6, 1344.6)` → `(996.6, 1436.8)` | main | Vertical neck with 45° chamfer, matching reference. |
| W4 | Wave 1 | `(996.6, 1436.8)` → `(1035, 1459.8)` → `(1132.9, 1459.8)` → hairpin | main | Rounded hairpin; keep ≥8px from label text. |
| W5 | Wave 2 | `(1132.9, 1513.6)` → `(993.7, 1513.6)` → hairpin | main | Opposite-direction hairpin. |
| W6 | Wave 3 | `(993.7, 1567.3)` → `(1132.9, 1567.3)` → hairpin | main | Third hairpin. |
| W7 | Work exit | last wave → J_WORK | `(1051.3, 1621.1)` → `(1003.3, 1734)` → `(1003.3, 1800)` | main | Smooth curve; ends at capabilities entry. |
| C1 | Capabilities entry: right | J_WORK → right edge | `(1003.3, 1800)` → `(1003.3, 1818)` → arc → `(1021.3, 1836)` → `H 1396.8` | main | 18px radius quarter-turn. |
| C2 | Capabilities entry: lower rail | right edge → left edge | `(1414.8, 1854)` → `V 2168` → Q `(1414.8, 2200)` → `(1382.8, 2200)` → `H 82.4` | main | Rounded outer rail; stays inside page padding. |
| C3 | Capabilities entry: left U | left edge → center split | `(82.4, 2200)` → 32px U-turn → `(82.4, 2264)` → `H 688` → Q `(720, 2264)` → `(720, 2296)` → `V 2351.2` | main | U-turn radius 32; no overshoot. |
| C4 | Split junction | `J_CAP_TOP` | `(720, 2351.2)` | marker | 10px ring (r4) centered. |
| C5 | Left arc | split → merge | `A 368.2 396 0 0 0 720 3143.2` | main | Elliptical left half; bow inward toward lists. |
| C6 | Right arc | split → merge | `A 368.2 396 0 0 1 720 3143.2` | main | Mirrored right half. |
| C7 | Row dots | 5 left + 5 right | Arc point at each list item’s vertical midpoint | marker | Ring r7 + core r2.5; left/right computed from item center y. |
| C8 | Merge junction | `J_CAP_BOTTOM` | `(720, 3143.2)` | marker | 10px ring. |
| C9 | Capabilities exit | merge → project top | `(720, 3143.2)` → `(720, 3262)` | main | Vertical; ends at J_KABRI. |

### 4.4 Desktop project routes

The reference project path coordinates were measured from the rendered DOM. The current figure anchors align closely enough to reuse their route grammar. Implement using current anchors and reference-derived control ratios; do not hard-code desktop coordinates only.

| ID | Section / landmark | Entry → exit | Coordinates / bounds | Layer | Curvature / next |
| --- | --- | --- | --- | --- | --- |
| P1 | Kabri / Eigna analogue | `J_KABRI` → `J_NORMA` | Bounds x 158–1358, y 3262–4286.7; start `(720, 3262)`, end `(720, 4286.7)` | main z18; figures z8/z21 | Reference Eigna path scaled by `W/1440`, translated to current top. Large left sweep around flat, lease, inspection, repair, book; exits center. |
| P2 | Norma / Papertrail analogue | `J_KABRI` end → `J_MESA` | Start `(720, 4286.7)`; connector to `(835.2, 4286.7)`; use Papertrail ridge shape; end `(763.2, 5311.4)` | main | Small top connector, then Scan ledger/paper sweeps; three rounded direction changes; bottom connector to Mesa start. |
| P3 | Mesa / Mesa analogue | `J_MESA` → `J_CREDIT` | Start `(763.2, 5311.4)`, end `(835.2, 6336.1)` | main | Reuse Mesa’s plate/fork/message/ticket/wallet/bag/dashboard sequence; keep route behind z8 figures and in front of z21 figures. |
| P4 | Creditflow / Creditflow analogue | `J_CREDIT` → `J_WHY` | Start `(835.2, 6336.1)`; connector to `(878.4, 6336.1)`; end `(878.4, 7360.8)` | main | Reference Creditflow path translated; sweep around pan/gst/application/assessment/bank/itr/outcome; exit at why-me. |

Project route rules:

- Titles at z20 must cover the thread; never rely on path avoidance alone where the route intentionally passes behind a title.
- Figures at z21/22/23/24 must cover the thread; figures at z8 must be covered by it.
- No project route may enter a neighboring section.
- Connectors at section boundaries are allowed but must be short, shallow, and tangent to the adjacent route.
- If a reference path would cross a figure that is z8 in the current composition, adjust the control point to give at least 12px clearance from its visible content.

### 4.5 Why-me custom route (no reference analogue)

Desktop measured node centers at 1440:

| Node | Center | Copy side |
| --- | --- | --- |
| 1 | `(510.2, 8354.8)` | right |
| 2 | `(914.8, 8739.6)` | left |
| 3 | `(510.2, 9100.5)` | right |
| 4 | `(914.8, 9532.8)` | left |
| 5 | `(510.2, 9965.1)` | right |

Route:

1. From `J_WHY` `(878.4, 7360.8)` curve to the right gutter `(1400, 7440)`.
2. Run down the right gutter past the title to `y ≈ 8170` (below `.why-me-intro`).
3. Curve left through the inter-block gap to the left lane `x ≈ 430`, then approach node 1 from above.
4. Pass vertically through node 1 center; exit downward into the left lane.
5. In the gap between points 1 and 2 (`y ≈ 8640`), cross to the right lane `x ≈ 1000`; pass through node 2.
6. Continue down the right lane; cross in the gap between points 2 and 3 (`y ≈ 8980`) to the left lane; pass through node 3.
7. Repeat for nodes 4 and 5.
8. After node 5, run down the left lane to `y ≈ 10250`, then curve to `J_ABOUT` `(878.4, 10419.8)`.

Geometry/tangent rules:

- At each node the path has a vertical tangent before and after; no cusp.
- Lane transitions occur in inter-row gaps with horizontal tangents.
- Each node is drawn at z19 with ivory fill, so the z18 thread disappears through the ring and re-emerges: a threaded bead.
- The route stays at least 12px away from `.why-me-point-copy` bounding boxes.
- Desktop/tablet uses alternating nodes; mobile uses the compact chain described in §6.

### 4.6 Desktop about fingerprint

Section: `about` at y 10419.8–11319.8. Profile occupies x 38–751. Fingerprint region: x 800–1320, y 10470–11240.

| ID | Landmark | Entry → exit | Coordinates | Layer | Curvature / next |
| --- | --- | --- | --- | --- | --- |
| A1 | About entry | `J_ABOUT` → fingerprint top | `(878.4, 10419.8)` → `(960, 10470)` → `(1050, 10490)` | main | Down-right ease into the fingerprint. |
| A2 | Fingerprint ridges | top-left → nested whorl → bottom-right | Center `(1070, 10860)`, rx 210–300, ry 280–350, rotation −6°, 10–12 nested open ridges | main | Continuous boustrophedon of nested arcs connected at the upper-left seam; no closed circles; ridge gap 18–24px. |
| A3 | Fingerprint terminal | bottom of fingerprint | `(1180, 11220)` ring r9 + core r3 | main | Ring sits inside the fingerprint; path then eases to the contact junction. |
| A4 | Contact handoff | fingerprint → `J_CONTACT` | `(1180, 11220)` → `(878.4, 11319.8)` | main | Shallow left/down curve; ends exactly at contact top. |

Add a clip path:

```svg
<clipPath id="thread-about-clip" clipPathUnits="userSpaceOnUse">
  <rect x="0" y="{about.top}" width="{W}" height="{about.height}" />
</clipPath>
```

The about route and terminal are clipped to this rect. The fingerprint must not overlap `.about-profile`; minimum clearance 40px.

Fingerprint construction requirements:

- Deterministic, no random values between renders.
- Nested ridge curves with visible openings/seams, not concentric closed ellipses.
- One continuous path, with the terminal ring attached at the final ridge.
- Because the reference’s 93k-character about path is procedural-looking, reconstruct the visual grammar rather than copying the string.

### 4.7 Desktop contact tangle

Section: contact at y 11319.8–12219.8. Heading and links occupy the left 55%; tangle region: x 760–1410, y 11370–12020.

| ID | Landmark | Entry → exit | Coordinates | Layer | Curvature / next |
| --- | --- | --- | --- | --- | --- |
| T1 | Contact entry | `J_CONTACT` → tangle top | `(878.4, 11319.8)` → `(930, 11350)` → `(1050, 11380)` | main | Down-right entry. |
| T2 | Tangle upper loop | top-left → top-right | `(1050, 11380)` → loop bounding x 860–1410, y 11400–11660 | main | Large clockwise loop crossing itself once. |
| T3 | Tangle middle loops | top-right → lower-left | 3–4 overlapping loops in x 820–1400, y 11500–11850 | main | Continuous path; loop radii 120–220px; no sharp cusps. |
| T4 | Tangle lower loop | lower-left → lower-right | `y 11850–12020`, x 850–1320 | main | Counter-clockwise exit loop. |
| T5 | Terminal tail | tangle → back-to-top | `(1140, 12020)` → `(760, 12080)` → `(360, 12120)` → `(121, 12170)` | main | Follows the empty band below the contact links; ends at `.contact-back-to-top` with ring r11 + core r4. |

Reference terminal is a right-side grip at `(1141, 11055)`. The current page has no grip; the existing back-to-top link is the correct semantic terminal. The plan preserves that integration and documents the visual difference. No `PULL TO UNTANGLE` text is added because that would be new contact UI, not thread.

### 4.8 Mobile route specification (375/360 measured)

Mobile uses the reference mobile model, not a scaled desktop path.

| ID | Landmark | Entry → exit | Coordinates / relative | Layer | Curvature / next |
| --- | --- | --- | --- | --- | --- |
| M0 | Hero origin | dot | `(32, 86)` | back | r4 dot. |
| M1 | FROM behind | origin → inside line 1 | `(32, 86)` → `(≈0.43 of line1 width, 352)`; target x ≈ 81 | back | Long gentle downward curve; passes behind R/O. |
| M2 | FROM front hook | line 1 → front | `(109.8, 352.2)` → `(107, 366.3)` | front | Small loop. |
| M3 | FROM→CONCEPT back | front → left | `(107, 366.3)` → `(72.5, 391.4)` | back | Down-left. |
| M4 | CONCEPT front | left → near left edge | `(72.5, 391.4)` → `(53.4, 397.9)` | front | Short visible segment. |
| M5 | Left gutter | → `(35.1, 416.5)` | back | Quarter turn. |
| M6 | CONCEPT/TO LAUNCH horizontal | `(35.1, 416.5)` → `(57.3, 430)` → `H 242.7` | front | Horizontal across the compressed heading. |
| M7 | Right swing | `(242.7, 430)` → `(301.7, 448)` | back | Swing toward line 3 right edge. |
| M8 | TO LAUNCH loop | `(301.7, 448)` → `(261.2, 448.8)` | front | Clockwise loop. |
| M9 | Right hook | `(261.2, 448.8)` → `(281.2, 471)` | back | Small S. |
| M10 | Squiggle | `(281.2, 471)` → alternating `y` 508/546/590, x 272/251/227 | back | Compressed squiggle. |
| M11 | Tail | `(227.5, 590)` → `(348, 671.7)` → `(348, 812)` | back | Quarter-turn into right gutter; vertical to `J_HERO`. |
| M12 | Work bulb | `(348, 812)` → bulb center `(≈0.5W, 970)` → waves → `(348, 1699.6)` | main | Bulb rx ≈ 100–120, ry ≈ 90–110; three waves in the right drawing area; no off-canvas. |
| M13 | Capabilities U arms | `(348, 1699.6)` → `(187.5, 2035)`; left arm x ≈ 136.5, right arm x ≈ 238.5; exit `(262.5, 2882.9)` | main | Vertical U arms around the central orbit; dots at row midpoints. |
| M14 | Project routes | Kabri 2818.9 → 4030.7; Norma 4030.7 → 5126.9; Mesa 5126.9 → 6223.1; Creditflow 6223.1 → 7319.3 | main | Keep within x 12–W−12; use current stacked figure boxes; short connectors at section tops/bottoms. |
| M15 | Why-me entry | `J_WHY` `(348, 7319.3)` → right gutter `(348, 7700)` → `(49, 7810)` | main | Down right edge, then left below title. |
| M16 | Why-me beaded chain | Lane x ≈ 49; nodes at `(29.6, 7908.6)`, `(29.6, 8255.9)`, `(29.6, 8564.9)`, `(29.6, 8931.9)`, `(29.6, 9292.9)` | main | At each node, curve left to center and back to lane; node ring z19 hides the crossing. No copy overlap. |
| M17 | Why-me exit | `(49, 9500)` → `(292.5, 9680.2)` | main | Curve to about top. |
| M18 | About compact fingerprint | `(292.5, 9680.2)` → bottom band `(90–270, 10025–10080)` → `(228.75, 10093.7)` | main | 4–5 nested horizontal ridges in the only empty band; terminal ring. No text overlap. |
| M19 | Contact tangle | `(228.75, 10093.7)` → right gutter `(348, 10140)` → bottom-right tangle `x 120–340, y 10700–10780` | main | 3–4 compressed loops in the bottom band. |
| M20 | Terminal | `(340, 10780)` → `(93, 10763)` back-to-top ring | main | Short tail; terminal ring at existing back-to-top. |

Mobile constraints:

- Never use desktop component dimensions; measure mobile anchors.
- The about fingerprint and contact tangle are intentionally compressed because the current mobile sections are much shorter than the reference’s. Do not add section height or new content.
- At <=360 width, clamp route x to `[10, W−10]`; reduce fingerprint/tangle loop counts if needed.
- The right gutter is `W−12`; do not use 375-specific `x=363` on a 360px layout.

---

## 5. Recommended SVG architecture

### 5.1 Options

**A. One continuous SVG path across the page**

Pros: simplest mental model; one path.

Cons: cannot reproduce the reference’s hero back/front layering; one z-index means either all hero crossings are in front or all behind; one malformed curve contaminates the entire page; impossible to inspect/verify segments independently.

Verdict: reject.

**B. Coordinated multiple-path SVG page-wide layer + separate hero back/front layers**

Pros: matches the reference architecture; hero crossings can be layered around copy; each section route is independently inspectable and verifiable; shared endpoints preserve continuity; main layer keeps the project figure z-index relationship; responsive variants can be selected per route.

Cons: more code; endpoints must be managed carefully.

Verdict: choose B.

**C. Section-aware SVG segments aligned to each section**

Pros: natural clipping per section; easy to attach to section borders.

Cons: sections have different stacking contexts and `overflow` rules; a path crossing a section boundary needs two SVGs; the hero still needs back/front; shared endpoints become fragile; the reference itself uses one main layer, so C adds complexity without improving fidelity.

Verdict: reject as primary architecture; use section-aware coordinate builders inside B.

### 5.2 Chosen structure

```
components/portfolio/
  thread-layer.tsx        # React component + measurement + main/hero layers
  thread-geometry.ts      # pure path builders, markers, fingerprint, tangle
  hero-thread-layer.tsx   # optional small hero wrapper if it keeps page.tsx clean
```

Minimum required changes:

- `components/portfolio/thread-layer.tsx` — major rewrite of geometry and markup.
- `components/portfolio/thread-geometry.ts` — new pure helper module (allowed: internal SVG/path helpers needed by the implementation).
- `app/page.tsx` — render hero back/front layers around `.hero-copy`; no content changes.
- `app/globals.css` — hero thread layer classes, marker classes, clipping, node stacking, remove obsolete about-node styles if no longer used.
- `plan.md` — this plan copied to the project root after approval.

Do not modify project components, SVGs, copy, section order, or project mockups.

### 5.3 Coordinate system and measurement

- Main SVG: absolutely positioned at the portfolio root; `viewBox="0 0 W H"`; width/height equal measured root dimensions; `preserveAspectRatio="none"` is safe only while `W/H` exactly match. Prefer leaving the default aspect ratio after setting exact width/height; verify at fractional widths.
- Hero SVGs: absolute inset 0 within `.hero`; `viewBox="0 0 W heroHeight"`.
- Measure anchors with `getBoundingClientRect()` relative to the relevant root.
- Keep a `measure()` cache and rebuild only when the root or an anchor changes.
- Observe the root, hero, and all `[data-thread-anchor]` elements.
- Rebuild after `document.fonts.ready` and window `load`.
- Add a development-only continuity assertion: each path’s first point equals the previous path’s last point within 0.5px.

### 5.4 Path construction rules

- Remove `spline()` entirely. Do not use Catmull-Rom for page geometry.
- Add pure helpers:
  - `cubic(points)` / `segment(from, c1, c2, to)`;
  - `arc(rx, ry, sweep, to)`;
  - `hLine`, `vLine`, rounded corner helper;
  - `loop(center, rx, ry, fromAngle, toAngle)`;
  - `fingerprint(rect, options)`;
  - `tangle(rect, options)`.
- Prefer explicit control points derived from anchor fractions.
- For G1 continuity, make the incoming and outgoing handles collinear at shared junctions, or use vertical/horizontal tangents at node crossings and lane transitions.
- Never clamp control points independently after constructing a curve; clamp the source anchors before building, and assert all generated points are finite and inside the allowed clip.
- Keep stroke width 2.2px (mobile included unless visual verification proves too heavy), round caps, round joins.

### 5.5 Layering and clipping

- Hero: back layer z3; copy z4; front layer z5; header z60.
- Main: z18, page-wide.
- Project title z20 hides the thread; figure z21+ over the thread; z8 under.
- Why-me nodes: z19 above the thread.
- `.thread-layer { overflow: hidden; }`.
- About route clipped to its section with an explicit `clipPath`.
- All routes must stay inside the viewBox; no `overflow: visible` escape hatch.
- Do not create new stacking contexts that accidentally put the thread above the header or below the hero copy.

### 5.6 Static-only constraints

No GSAP, ScrollTrigger, Lenis, CSS animation, stroke drawing, dash animation, scroll-driven progress, or motion of any kind. The existing preloader is unrelated and remains untouched.

---

## 6. Geometry and layering at every major waypoint

### 6.1 Desktop/tablet waypoint table

| # | Section / landmark | Entry direction | Exit direction | Position | Layer | Curvature / relationship |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Header/origin | down-right | down-right | 6.3vw, 86 | hero back z3 | Dot; no top-edge contact. |
| 2 | FROM R/O | down-right | down-left | x 140–343, y 255 | back | Passes behind R, ends hidden in O; no visible line through glyph. |
| 3 | O hook | down-left | down-left | x 309–343, y 255–307 | front z5 | Small clockwise hook over O. |
| 4 | CONCEPT C top | down-left | down-left | x 140, y 400 | back | Ends at top band of first C; direction change. |
| 5 | C front/left gutter | down-left | horizontal | x 27–90, y 421–489 | front | Visible across C edge, then turns down left gutter. |
| 6 | CONCEPT lower band | horizontal | horizontal | y 537.6, x 27–828 | front | Crosses lower third of CONCEPT in front. |
| 7 | Right swing | horizontal | down-left | x 828–1019, y 538–604 | back | Sweeps around right end. |
| 8 | TO LAUNCH loop | down-left | up-left | x 888–1019, y 604–607 | front | Large visible loop at end of line 2/start of line 3. |
| 9 | TO LAUNCH hook | up-left | down | x 888–953, y 607–689 | back | S-hook hidden behind third line. |
| 10 | Squiggle/tail | down | down | x 924–953, y 689–900 | back | Ring at 924,763; tail to hero bottom. |
| 11 | Work entry | down | down | 1046.5, 900–1019.8 | main z18 | Vertical; work background. |
| 12 | Bulb | tangent | tangent | x 878–1215, y 1035–1345 | main | Closed loop; no cusp; stays right of practice heading. |
| 13 | Bulb neck/waves | down | down | x 994–1171, y 1437–1621 | main | Three hairpins between drawing labels; ≥8px label clearance. |
| 14 | Work exit/caps entry | down | right/left | 1003.3, 1800 | main | Shared endpoint; 18px corner. |
| 15 | Caps right/lower rail | right | left | x 1414.8, y 1854–2200; y 2200 x 82–1383 | main | Rounded rectangle arc around heading; no text collision. |
| 16 | Caps left U/split | left | down | x 82.4, y 2200–2264; x 720, y 2296–2351 | main | 32px U-turn; split junction ring. |
| 17 | Caps arcs | down | down | 720, 2351.2 → 3143.2 | main | Left and right elliptical halves; dots on arcs. |
| 18 | Caps merge/exit | down | down | 720, 3143.2–3262 | main | Merge ring; shared J_KABRI. |
| 19 | Kabri | right | right | 720, 3262 → 720, 4286.7 | main | Eigna-like sweep; figures z21 over, z8 under. |
| 20 | Norma | right | left | 720→835 top; 345→763 bottom | main | Papertrail-like scan stack; top/bottom connectors. |
| 21 | Mesa | down | down | 763, 5311 → 835, 6336 | main | Plate/fork/wallet sweeps; title z20 covers. |
| 22 | Creditflow | down | down | 878, 6336 → 878, 7361 | main | Document/outcome sweeps; figure crossings preserved. |
| 23 | Why entry/title bypass | down | down-left | 878, 7361 → 1400, 7440 → 8170 | main | Right gutter; avoids title and intro. |
| 24 | Why nodes 1–5 | vertical | vertical | 510/915 alternating, 8355–9965 | main; nodes z19 | Smooth serpentine; vertical tangents; no copy overlap. |
| 25 | About fingerprint | down-right | down-left | x 800–1320, y 10470–11240 | main; clipped | Nested ridges; no profile overlap. |
| 26 | About terminal/contact | down | down-left | 1180, 11220 → 878, 11320 | main | Ring; shared J_CONTACT. |
| 27 | Contact tangle | down-right | down-left | x 820–1410, y 11380–12020 | main | Large overlapping loops; no heading/link collision. |
| 28 | Contact tail/terminal | down-left | left | 1140, 12020 → 121, 12170 | main | Bottom empty band; back-to-top ring. |

### 6.2 Mobile waypoint table

| # | Section / landmark | Entry direction | Exit direction | Position | Layer | Curvature / relationship |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Origin | down | down | 32, 86 | hero back | Dot below header. |
| 2 | FROM back | down | down | 32,86 → 109.8,352 | back | Hidden behind R/O. |
| 3 | FROM front hook | down | down | 107,352–366 | front | Small loop. |
| 4 | CONCEPT left back/front | down-left | left | 107→72→53→35, 366–417 | mixed | Alternating handoffs. |
| 5 | Heading horizontal | right | right | 35,416 → 57,430 → 242,430 | front | Across compressed heading. |
| 6 | TO LAUNCH loop/squiggle | right | down | 242–302 → 261–281 → 227,449–590 | mixed | Loop then squiggle. |
| 7 | Right tail | down | down | 227,590 → 348,672 → 348,812 | back | Right gutter; no off-canvas. |
| 8 | Work bulb/waves | down | down | 348,812 → center ≈180,970 → 348,1699.6 | main | Compact bulb; waves fit drawing. |
| 9 | Caps U arms | down | down | 187,2035; arms x 136.5/238.5; exit 262,2883 | main | Center gap; dots on arms. |
| 10 | Project routes | down | down | 2818.9–7319.3 | main | Margins; stacked figures; no text crossing. |
| 11 | Why beaded chain | down | down | lane 49, nodes 29.6, 7909–9293 | main; nodes z19 | Left chain; lobes into node rings. |
| 12 | Why exit/about | down | down-right | 49,9500 → 292,9680 | main | Smooth. |
| 13 | About compact fingerprint | down | down | 90–270, 10025–10080 | main | Bottom band; 4–5 ridges; no text. |
| 14 | Contact compact tangle | down | down-left | 120–340, 10700–10780 | main | 3–4 loops; bottom-right only. |
| 15 | Terminal | left | left | 340,10780 → 93,10763 | main | Back-to-top ring. |

### 6.3 Layering summary

| Element | z-index | Relationship |
| --- | ---: | --- |
| `.hero-thread-back` | 3 | Behind hero copy/title. |
| `.hero-copy` | 4 | Above back layer, below front layer. |
| `.hero-thread-front` | 5 | Above hero copy, below header. |
| `.site-header` | 60 | Above all hero thread layers. |
| `.thread-layer` | 18 | Above section backgrounds and body; below project titles and high-z figures. |
| `.world-title` | 20 | Covers main thread. |
| Project figures | 8 or 21+ | z8 behind thread; z21+ above. |
| `.why-me-node` | 19 | Above thread; thread reads as passing through the bead. |
| About profile / contact statement | 2 | Thread should not overlap; route placed in empty area. |

Do not change the existing project figure z-index assignments unless a verified route/figure collision requires it. The reference already validates the 8/21 split.

---

## 7. Ordered implementation and refactoring sequence

Implementation must proceed in dependency order. Each step ends with a render check before the next.

1. **Baseline capture and guardrails**
   - Capture current full-page screenshots at 1440, 1024, 768, 425, 375, and 320.
   - Capture current hero, work, capabilities, each project, why-me, about, and contact crops.
   - Save the reference crops and measured route JSON already collected.
   - Record `git status`; confirm no unrelated work is present.

2. **Remove the old geometry core**
   - Delete `spline()` and the generic `buildProjectPoints()` side-rotation logic.
   - Keep the measurement helpers (`clamp`, `middle`, `at`, `anchorRect`, `figureEdge` where useful).
   - Add a pure `thread-geometry.ts` module with path-builder helpers and deterministic fingerprint/tangle functions.
   - Add a development-only finite/continuity assertion.

3. **Implement the hero split**
   - Add hero back/front SVG components and mount them around `.hero-copy` in `page.tsx`.
   - Add `globals.css` classes z3/z5 and the `overflow: hidden` rules.
   - Build the desktop hero path table from §4.2.
   - Build the mobile hero path table from §4.8.
   - Verify stacking: back segments hidden by glyphs, front hooks visible, origin below header.

4. **Implement work index**
   - Build the closed bulb, neck, three waves, and exit at `J_WORK`.
   - Anchor the bulb center to the practice drawing and cap the radius so it stays inside the section.
   - Verify label clearance and symmetry at 1440/1024/375.

5. **Implement capabilities**
   - Build the entry rail from `J_WORK` to `J_CAP_TOP`.
   - Add left/right arcs from split to merge.
   - Add split/merge rings and 10 row dots.
   - Build the mobile U-arm variant.
   - Verify no arc crosses a capability list text rect.

6. **Implement project routes in page order**
   - Kabri (Eigna grammar).
   - Norma (Papertrail grammar) with top/bottom connectors.
   - Mesa (Mesa grammar).
   - Creditflow (Creditflow grammar) with top connector.
   - Use shared boundary constants; add continuity assertions.
   - Verify per-section z-index behavior and title occlusion.

7. **Implement why-me**
   - Build the right-gutter title bypass.
   - Build the desktop alternating serpentine and the mobile beaded chain.
   - Set `.why-me-node { z-index: 19; }`.
   - Verify no copy intersections and no cusps.

8. **Implement about**
   - Remove the `PROBLEM`/`PRODUCTION` circles and labels.
   - Add the fingerprint generator, about clip path, and terminal ring.
   - Add the compact mobile fingerprint in the bottom band.
   - Verify desktop right-half isolation and mobile no-overlap.

9. **Implement contact**
   - Remove the straight diagonal.
   - Add the desktop tangle and the mobile compact tangle.
   - Route the tail to the existing back-to-top link.
   - Preserve the existing contact buttons, hover, copy-to-clipboard, and back-to-top behavior.

10. **Responsive pass**
    - Verify at 1440, 1024, 768, 425, 375, 320.
    - Re-measure anchors after font load and scrollbar changes.
    - Check `scrollWidth === clientWidth` and no off-canvas route points.
    - Tune the mobile about/contact compact motifs only if they collide or become unreadable.

11. **Cleanup and checks**
    - Remove unused about-node CSS and old route code.
    - Run `pnpm lint` and `pnpm build`.
    - Capture final screenshots.
    - Produce the final report: files changed, decisions, verification, remaining discrepancies, limitations.

---

## 8. Responsive behavior and verification procedures

### 8.1 Breakpoints

| Range | Behavior |
| --- | --- |
| `>= 1200px` | Full desktop route grammar; 1440 reference-derived ratios; full bulb, arcs, project compositions, fingerprint, contact tangle. |
| `701–1199px` | Same grammar computed from tablet anchors; arcs remain ellipses; project routes scale x/y; fingerprint ridge count reduced if needed; no fixed 1440 coordinates. |
| `<= 700px` | Dedicated mobile route grammar from §4.8; right-gutter hero tail; U-arm capabilities; compact why/ about/contact motifs; stroke verified against reference. |
| `<= 360px` | Additional clamp: route x in `[10, W−10]`; reduce ridge/loop counts; re-check text wrapping. |

### 8.2 Verification tooling

Available and already used:

- Headless Chrome at `/usr/bin/google-chrome`.
- CDP scripts in `/tmp/opencode/` (`cdp-shot.mjs`, `inspect-layout.mjs`, `inspect-routes.mjs`, `inspect-css.mjs`, `cdp-ref-scroll.mjs`).
- Node 24 global `WebSocket`.
- Dev server at `http://localhost:3000`.

Required verification sequence:

1. Dismiss the preloader via CDP (remove `[data-site-preloader]`, clear `data-preloading`, remove `inert`) before screenshots.
2. Capture full-page screenshots at each width with `Page.captureScreenshot` and `captureBeyondViewport: true`.
3. Capture viewport-size crops for hero, work, capabilities, each project, why-me, about, and contact.
4. Extract DOM path data:
   - `getTotalLength()`, first/last points, `getBBox()`, computed stroke, z-index.
   - Assert every path start equals the previous path end within 0.5px.
   - Assert every point lies inside `[0, W] × [0, H]`.
5. Extract text rectangles and run collision checks:
   - For each route, sample points every 8px along `getPointAtLength()`.
   - Flag any point inside a `.practice-copy`, `.capability-heading`, `.capability-discipline`, `.world-title`, `.why-me-point-copy`, `.about-profile`, `.contact-statement`, or contact-link rect.
   - Allow intentional z-index occlusion only where the reference also hides the line.
6. Check computed stacking:
   - Hero back < hero copy < hero front < header.
   - Main 18 < world title 20.
   - Figures with z8 under thread; figures with z21+ over thread.
   - Why nodes 19 above thread.
7. Compare screenshots at 100% and 2× zoom.
8. Run `pnpm lint` and `pnpm build`.

### 8.3 Specific visual checks

- **Origin:** no orange pixel in the first 72px of the page except header text; dot at 86px.
- **Hero:** at least two back segments visibly interrupted by glyphs and two front segments visible over glyphs. The line must not form a straight diagonal.
- **Work:** bulb closed; waves rounded; no label collision.
- **Capabilities:** entry follows the heading perimeter; arcs share top/bottom points; all row dots centered on arcs.
- **Projects:** each route starts/ends at the boundary; no route crosses a figure it should be behind and remains visible over z8 figures.
- **Why-me:** no cusp at any node; route stays in negative space; nodes above line.
- **About:** fingerprint occupies right half and does not overlap profile; terminal ring visible.
- **Contact:** tangle occupies right column; no line through heading/CTA/links; terminal ring at back-to-top.
- **Mobile:** no horizontal scroll; text wraps as before; compact motifs do not cover copy; hero tail stays in right gutter.

### 8.4 If verification tooling is unavailable

If Chrome/CDP cannot run, do not claim visual verification. Instead:

- run static geometry assertions;
- run `pnpm lint` and `pnpm build`;
- state explicitly that rendered screenshot verification was unavailable;
- list the unverified items and the exact widths that remain unchecked.

---

## 9. Objective acceptance criteria

A implementation is complete only if all of the following are true.

### 9.1 Global

- [ ] The thread has no animated or scroll-driven behavior; no GSAP/ScrollTrigger/Lenis/CSS animation/stroke drawing added.
- [ ] All routes use `#ff3b12`, 2.2px (or a verified mobile equivalent), round caps/joins.
- [ ] No route point or rendered stroke falls outside the page viewport; `scrollWidth === clientWidth` at every tested width.
- [ ] No console errors from the thread; `pnpm lint` and `pnpm build` pass.
- [ ] Existing page copy, sections, typography, mockups, links, and contact controls are unchanged.

### 9.2 Hero

- [ ] Origin dot is at approximately `(6.3vw, 86px)` desktop and `(32px, 86px)` mobile; no line touches `y = 0`.
- [ ] Back layer is behind `.hero-copy`; front layer is above it; header remains above both.
- [ ] At least one segment passes behind `R`, one front hook crosses `O`, one segment reaches the top band of `C` in `CONCEPT`, and one loop occurs near `TO LAUNCH`.
- [ ] Hero exit is continuous with the work route at `J_HERO`.
- [ ] Mobile hero follows the compact measured grammar and ends in the right gutter at `hero.bottom`.

### 9.3 Work

- [ ] Bulb is closed and roughly symmetric around its centerline; no open gap or cusp.
- [ ] Neck and three waves match the reference sequence.
- [ ] Bulb/waves do not overlap the `ENGINEERING PRODUCTS WITH IMPACT` heading or any practice label.
- [ ] Work route exits at `J_WORK` and enters capabilities without a gap.

### 9.4 Capabilities

- [ ] Entry follows the right edge, lower rail, left U-turn, and center split.
- [ ] Left and right arcs share the top and bottom junctions.
- [ ] 10 row dots and 2 junction rings are present and correctly positioned.
- [ ] No arc crosses capability list text.
- [ ] Mobile uses two narrow U arms and stays inside the viewport.

### 9.5 Projects

- [ ] Kabri, Norma, Mesa, and Creditflow each have a distinct route matching the reference analogue’s visual grammar.
- [ ] Every route starts/ends at a shared boundary within 0.5px.
- [ ] Titles at z20 hide the thread where they overlap.
- [ ] z21+ figures cover the thread; z8 figures are covered by it.
- [ ] No route cuts through a project mockup that should be above it.
- [ ] Mobile project routes remain in margins/negative space and do not cross text.

### 9.6 Why-me

- [ ] Desktop route alternates through all five nodes with vertical tangents and no cusp.
- [ ] Mobile route is a compact beaded chain in the left gap.
- [ ] Route does not intersect any `.why-me-point-copy` or `.why-me-title` rect.
- [ ] Nodes render above the thread (z19) and read as beads.

### 9.7 About

- [ ] Desktop fingerprint occupies the right half, has at least 8 nested ridges, and is visibly a fingerprint rather than a random loop.
- [ ] No overlap with `.about-profile`; no clipping outside the about section.
- [ ] Terminal ring is visible.
- [ ] Mobile compact fingerprint stays in the bottom band and does not cover text.

### 9.8 Contact

- [ ] Desktop tangle occupies the right column and has at least 4 overlapping loops.
- [ ] No line crosses the contact heading, `LET'S TALK`, or any contact link/copy button.
- [ ] Route ends at the existing back-to-top terminal with ring and core.
- [ ] Mobile compact tangle stays in the bottom band and does not cover controls.
- [ ] All existing contact interactions still work.

### 9.9 Visual match

- [ ] A side-by-side comparison at 1440 shows the same visual grammar as the reference: dot origin, hero back/front handoffs, bulb, capability arcs, project route language, fingerprint, tangle.
- [ ] A side-by-side comparison at 375/320 shows a deliberate compact adaptation with no broken loops, no off-canvas geometry, and no text collisions.
- [ ] Remaining differences from the reference are documented, not hidden.

---

## 10. Known uncertainties and resolution strategy

| Uncertainty | Why it exists | Resolution strategy |
| --- | --- | --- |
| Reference source algorithms are unavailable | Only saved rendered DOM and screenshots exist. | Treat measured coordinates as evidence; reconstruct visual grammar; document interpolation/approximation. |
| Reference scroll animation affects the final visible path | Reference paths are dash-animated/scroll-driven; static implementation must choose a final visible state. | Compare fully revealed screenshots; render all static paths fully visible. Do not copy runtime animation. |
| Reference hero copy differs from current copy | `I DESIGN / PRODUCTS / THAT THINK.` vs `FROM / CONCEPT / TO LAUNCH`. | Map the reference’s back/front grammar to measured current letter boxes; verify the intended R/O/C/Launch relationships visually. |
| Reference has six projects; current has four | Eigna/Orbit/Mesa/Papertrail/Scribe/Creditflow vs Kabri/Norma/Mesa/Creditflow. | Use Eigna→Kabri, Papertrail→Norma, Mesa→Mesa, Creditflow→Creditflow; omit Orbit/Scribe route shapes; keep the visual grammar. |
| Current why-me has no reference analogue | Reference has no why-me section. | Design a custom serpentine/beaded route in the reference’s visual language; verify no text collisions and smooth tangents. |
| Reference about fingerprint is a ~93k character path | Likely procedurally generated; copying it is unmaintainable and page-specific. | Build a deterministic ridge generator; compare visual density/readability rather than exact path string. |
| Current mobile about/contact sections are much shorter than reference | Current about is 413px and contact 710px at 375; reference about 741px and contact 880px, with more empty space. | Use compact bottom-band fingerprint/tangle motifs; preserve content and avoid overlap; document the responsive reduction. |
| Reference contact ends at a `PULL TO UNTANGLE` grip | Current page has no grip; adding one would be new contact UI. | End at the existing back-to-top control; document the endpoint difference. If approval explicitly allows a decorative thread-only label/ring, revisit. |
| Font metrics can shift hero/project anchors | Web fonts load after first paint. | Measure on `document.fonts.ready`; ResizeObserver on anchors; final screenshots after fonts settle. |
| Scrollbar changes client width | 1440 viewport measured 1425 content width; 375 viewport measured 360. | Use root client width, not `window.innerWidth`; verify with and without scrollbars. |
| Reference mobile uses x=363 at 375 while current content width may be 360 | Scrollbar and page padding differ. | Use `W−12` right gutter and clamp; do not hard-code 363. |
| Screenshot tooling may be unavailable in a future run | Chrome/CDP is environment-dependent. | Use the documented scripts; if unavailable, report the limitation and rely on static assertions plus lint/build. |

---

## 11. Scope guard

Allowed:

- `components/portfolio/thread-layer.tsx`
- new `components/portfolio/thread-geometry.ts` (pure path helpers only)
- `app/page.tsx` (only mount hero thread layers; no content changes)
- `app/globals.css` (only thread classes, layering, markers, clipping, responsive stroke)
- `plan.md` (project-root copy after approval)

Not allowed:

- new page sections or content
- changes to project mockups, SVGs, copy, typography, navigation, preloader, or contact interactions
- new dependencies
- animation or scroll behavior
- unrelated cleanup

---

## 12. Approval and delivery

Approved and implemented on 2026-11-03. Implementation followed §7 and delivered:

1. `plan.md` in the project root.
2. The refactored thread implementation.
3. A concise report covering files changed, architectural decisions, verification screenshots/assertions, remaining discrepancies, and limitations.
