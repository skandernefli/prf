# Scroll-driven motion system — implementation plan

**Project:** Skander Nefli portfolio  
**Phase:** post-static-layout animation  
**Scope:** scroll-driven motion only  
**Status:** planning complete; no application files changed  
**Planned destination:** repository-root `plan.md` (this Plan-mode copy lives at `/home/dev/.opencode/plan/plan.md`)

---

## 0. Executive summary

Add a single client-side motion layer to the existing Next.js portfolio. The layer starts only after the site preloader has completed, uses the already-installed GSAP + ScrollTrigger + Lenis stack, and animates existing DOM without changing copy, CSS tokens, layouts, SVGs, section heights, navigation, contact behavior, the thread layer, or the preloader.

The design has five structural rules:

1. **No pinning, no scroll geometry changes.** Every trigger is a normal viewport-relative ScrollTrigger. No `pin`, `pinSpacing`, `snap`, or scroller proxy. Document height must remain byte-for-byte equivalent at every tested viewport.
2. **Thread anchors are read-only geometry.** Never transform, scale, rotate, translate, or resize an element carrying `data-thread-anchor`, or an ancestor of one. Animate inner children, or use opacity / clip-path / filter on the anchored element. This keeps the thread's per-frame anchor measurements stable.
3. **Hero lines are never wrapped or moved.** The hero line spans and glyph spans are thread anchors measured with `Range`. They receive only clip-path + blur + opacity. Other headings may use a runtime inner wrapper for a masked line reveal.
4. **Why Me points are anchored to their real nodes.** Each point reveal is a separate ScrollTrigger on its own `why.point.N` node. No `thread:anchor` events and no thread path-distance progress. This preserves non-uniform spacing and reverse-scroll behavior.
5. **Case studies are four independent scene controllers.** Each controller is scoped to its own `<article>`. No ScrollTrigger on the `.case-studys` parent. A controller owns per-element entrance triggers plus a scene-level exit trigger; no cross-scene timeline.

The result is a restrained, editorial motion system: titles wipe up from masked lines, artwork settles into place, thread labels fade with the drawing, case artwork advances as it enters, Why Me copy appears exactly when its node crosses the reveal line, and the footer resolves into the contact links.

---

## 1. Forensic baseline

### 1.1 Stack and runtime facts

- Next.js `16.4.3`, App Router, React `19.3.0`.
- GSAP `3.15.0`; installed plugins include `ScrollTrigger`, `DrawSVGPlugin`, `SplitText`, `Flip`, `Observer`.
- Lenis `1.3.27`, already mounted once by `components/smooth-scroll/smooth-scroll.tsx` through `ReactLenis root`.
- Existing Lenis integration:
  - `gsap.ticker.add(lenis.raf)` in `LenisRuntime`.
  - `gsap.ticker.lagSmoothing(0)` while mounted.
  - `lenis.start()` / `lenis.stop()` driven by `usePreloader()`.
  - In-page anchor scrolling and popstate handling already exist. Do not duplicate.
- No existing `ScrollTrigger` registration anywhere in the app.
- Existing CSS transitions exist only on footer hover/focus controls (`globals.css` lines 1688, 1728, 1763, 1821, 1859). There are no `@keyframes` or content animations. Preserve those footer transitions exactly.
- The thread layer listens for `site:ready` and also starts immediately when `[data-site-preloader]` is absent. The motion layer can use the same readiness contract without reading or importing preloader code.

### 1.2 Measured page geometry (audit sample)

At `1440 × 900`, with fonts loaded and preloader gone:

| Element | Document top | Height |
|---|---:|---:|
| `.hero` | `0` | `900` |
| `.work-flow` | `900` | `900` |
| `.capabilities` | `1800` | `1461.97` |
| `.case-studys` | `3261.97` | `4098.81` |
| `#kabri` | `3261.97` | `1024.70` |
| `#norma` | `4286.67` | `1024.70` |
| `#shop-ops` | `5311.38` | `1024.70` |
| `#lega-lexy` | `6336.08` | `1024.70` |
| `.why-me` | `7360.78` | `3059.03` |
| `.conclusion-story` | `10419.81` | `900` |
| `.footer-finale` | `11319.81` | `900` |

Document height `12220`; max scroll `11320`.

At `1024 × 768`: scroll height `9922`; work-flow top `860`; capabilities top `1132`; case root top `3040`; each case height `760`; Why Me height `2534`; conclusion `768`; footer `820`.

Also audited at `768 × 1024`, `425 × 850`, `375 × 812`, and `320 × 640`. The plan's trigger percentages are viewport-relative so they survive these reflows; no absolute document positions are used in code.

### 1.3 Why Me anchor forensics

Sample document tops at `1440 × 900`:

| Anchor | Top | Gap from previous |
|---|---:|---:|
| `why.point.1` / `why.copy.1` | `8342.80` / `8340.80` | — |
| `why.point.2` | `8727.61` | `384.81` |
| `why.point.3` | `9088.47` | `360.86` |
| `why.point.4` | `9520.78` | `432.31` |
| `why.point.5` | `9953.09` | `432.31` |

Sample at `375 × 812`: node tops approximately `7921`, `8260`, `8554`, `8894`, `9235`; gaps `339`, `294`, `340`, `341`. These are deliberately non-uniform.

The thread's path distance and the DOM anchor positions do not align reliably:

- Measured thread path length was `27477.68` while the navigation track length was `41815.54`.
- Values shifted between loads because fonts and layout settled at different times.
- A sample `why.point.1` progress of `0.628812` mapped to a path-head Y of `6129.3`, while its DOM top was `8342.8`.

Therefore **do not** use `thread:anchor` custom events, `data-thread-progress`, `--kabri-progress`, `window.__threadDebug`, or thread path-distance progress to drive Why Me or any other content reveal. Use each real node's viewport position.

### 1.4 Verified motion-safety facts

The following were verified in the live DOM during the audit:

- Applying `clip-path: inset(-30% 100% -30% -12%)`, `filter: blur(10px)`, and `opacity: 0.2` to a hero title line left the hero glyph `Range` rect and the line rect unchanged. Hero clip/blur/opacity is safe.
- Translating `.kabri-flat > span` by `50px, 30px` moved `case.study.kabri.door.north` by exactly `50px, 30px`. The floor-plan inner span must never be transformed, because door anchors live inside it.
- Wrapping the work-flow heading line contents in an inner block span left the `work.flow.heading` h2 rect unchanged in position and size.
- Translating `.case-study-title > span` by `translateY(110%)` left the `case.study.kabri.title` h3 rect unchanged.
- Translating `.why-me-point-title` and `.why-me-point-description` left both `why.copy.1` and `why.point.1` rects unchanged.
- Changing `.case-study-composition` opacity left the `case.study.kabri.lease` rect unchanged.

These facts define the safety matrix below.

### 1.5 Existing thread contract (read-only)

Do not modify anything under `components/portfolio/thread`, and do not import its runtime helpers into the motion layer. The thread layer:

- Measures `[data-thread-anchor]` elements on every GSAP tick.
- Rebuilds its model whenever the measured signature changes.
- Measures `rect` anchors with `getBoundingClientRect()` and `range` anchors with `Range.getBoundingClientRect()`.
- Uses `site:ready` / absence of `[data-site-preloader]` to start.
- Has no pin-aware behavior and cannot tolerate document-height changes.

Because measurements run every frame, an animation that changes an anchored element's rect would force repeated thread rebuilds and visible drift. Geometry-safe animation is not optional.

### 1.6 What must not be used

- The abandoned thread-animation approach.
- Any old per-case runtime hooks such as `data-kabri`, `data-thread-scrub`, `data-thread-progress`, or `--kabri-progress`.
- The preloader module, its context, its internals, or any preloader file.
- `SplitText` for hero or anchor-bearing lines. Existing direct line spans are already the correct line units.
- `ScrollTrigger` pinning, snapping, scroller proxies, `normalizeScroll`, or a second Lenis instance.
- CSS `@keyframes`, new CSS transitions, or CSS-driven content animation.
- Changing copy, SVG markup, z-indexes, section heights, `overflow`, or design tokens.

---

## 2. Motion architecture

### 2.1 Files

Add:

```text
components/portfolio/motion/
  portfolio-motion.tsx          # client entry, readiness, Lenis bridge, matchMedia, scene orchestration
  motion-utils.ts               # line masks, safe target helpers, trigger factories, cleanup registry
  scenes/
    hero.ts
    work-flow.ts
    capabilities.ts
    case-scene.ts               # shared case helpers only; no parent ScrollTrigger
    case-kabri.ts
    case-norma.ts
    case-shopops.ts
    case-legalexy.ts
    why-me.ts
    conclusion.ts
    footer.ts
```

Modify only:

```text
app/page.tsx                    # import PortfolioMotion and render it once inside .portfolio
```

Do **not** modify `app/globals.css`. All mask/clip/display styles are set by GSAP/JS and restored on cleanup. This keeps the static CSS, tokens, breakpoints, and footer transitions untouched.

### 2.2 Mount point

`app/page.tsx` remains a server component. Add the client component once:

```tsx
import { PortfolioMotion } from "@/components/portfolio/motion/portfolio-motion";

// inside .portfolio, after <ThreadLayer />:
<PortfolioMotion />
```

`PortfolioMotion` renders `null`. It is inside `PreloaderProvider` and `ReactLenis` because it is inside the page tree.

### 2.3 Boot sequence

`portfolio-motion.tsx`:

1. At module scope:
   - `gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin)` once (verified SSR-safe; no window guard required).
   - Guard only the ScrollTrigger config with `typeof window !== "undefined"`: `ScrollTrigger.config({ ignoreMobileResize: true })`.
   - Do not register plugins in individual scene files.
2. On mount, capture `root = document.querySelector(".portfolio")`; bail if missing.
3. Wait for both:
   - `document.fonts.ready` (or immediate if unsupported).
   - Preloader completion: listen once for `site:ready`; if `[data-site-preloader]` is absent, resolve immediately; otherwise observe for its removal with one `MutationObserver` as a fallback. This mirrors the thread layer's public behavior without reading preloader code.
4. After readiness, create one `gsap.matchMedia(root)` with conditions:
   ```ts
   {
     motion: "(prefers-reduced-motion: no-preference)",
     mobile: "(max-width: 700px)"
   }
   ```
   Inside the callback, return immediately when `!context.conditions?.motion`.
5. Build all scene controllers inside that matchMedia context so every tween, ScrollTrigger, inline style, and wrapper is reverted automatically when reduced motion or the mobile breakpoint changes.
6. After building, call `requestAnimationFrame(() => ScrollTrigger.refresh())`.
7. Cleanup on unmount:
   - Remove readiness listeners and the observer.
   - `mm.revert()`.
   - Restore every runtime line wrapper via the motion utility registry.
   - Remove the Lenis scroll listener.
   - Do not call `ScrollTrigger.getAll().forEach(kill)` manually; the matchMedia context owns the triggers.
   - Do not reset scroll position or Lenis state.

Use an idempotent `started` flag and a `disposed` flag so StrictMode's double effect cannot build scenes twice.

### 2.4 Lenis ↔ ScrollTrigger bridge

Use the existing Lenis instance exactly once through `useLenis()`:

```ts
const lenis = useLenis();

useEffect(() => {
  if (!lenis) return;
  const update = () => ScrollTrigger.update();
  lenis.on("scroll", update);
  ScrollTrigger.update();
  return () => lenis.off("scroll", update);
}, [lenis]);
```

Rules:

- Do not create another `ReactLenis`, `new Lenis()`, RAF loop, ticker callback, or scroller proxy.
- Do not change `SmoothScroll` or its `lerp`, `gsap.ticker` update, reduced-motion handling, or anchor click behavior.
- Do not call `lenis.resize()`, `lenis.stop()`, or `lenis.scrollTo()`.
- The existing `SmoothScroll` ticker remains the only Lenis RAF driver.

### 2.5 MatchMedia and responsive lifecycle

`gsap.matchMedia(root).add({ motion, mobile }, callback)` intentionally re-runs when the `700px` breakpoint changes. Each run recreates wrappers, timelines, and triggers; the previous context reverts. This is the only responsive rebuild mechanism.

Inside scene builders, `context.conditions.mobile` changes only distance/scale values:

- Mobile `y` distances are roughly `0.65×` desktop.
- Mobile x-motion is roughly `0.55×` desktop.
- Trigger start/end percentages stay the same; natural document flow produces the correct vertical sequence.
- No scene has a separate mobile timeline with different targets.

### 2.6 Line-mask utility

`motion-utils.ts` exports a per-context wrapper registry.

`maskLine(line)`:

- Return `null` for non-HTMLElements, empty lines, elements carrying `data-thread-anchor`, or elements containing a descendant with `data-thread-anchor`. This skips every hero line.
- Reuse an existing direct `[data-motion-inner]` child if present.
- Create `<span data-motion-inner>`; move all original child nodes into it; append it.
- Set `inner.style.display = "block"` in JS.
- Set the outer line's inline `clipPath` to:
  ```css
  inset(-0.35em -0.15em -0.35em -0.15em)
  ```
  This is a static mask with generous overscan. The inner content starts at `yPercent: 112`; because the clip extends only `0.35em` below the line box, the translated content is fully outside the mask until it rises.
- Save the wrapper and original inline style so cleanup restores the DOM exactly.

`maskExistingTitle(h3, innerSpan)`:

- Used only for `.case-study-title`.
- The h3 carries `data-thread-anchor`; do not wrap it.
- Add the same static clip-path to the h3.
- Mark the existing direct `> span` as the motion inner target. It already has `display: block`.
- Animate that span with `yPercent`, never the h3.

Never use `SplitText`. Do not wrap hero lines. Do not wrap an element that contains a thread anchor.

### 2.7 Safe-target rules and selector matrix

| Target | Anchor status | Allowed motion |
|---|---|---|
| `.hero-title > span` | direct `hero.from` / `hero.concept` / `hero.launch` anchors | clip-path + filter + opacity only; **no transform, no wrapper** |
| `.hero-title .thread-glyph` | range anchors | do not touch directly; inherits line clip/blur |
| `.hero-copy` | ancestor of anchors | opacity only |
| `.hero-support p` | no anchor | y + opacity |
| `.scroll-cue` | own `hero.scroll-cue` anchor | opacity only |
| `.work-flow-copy h2 > span` | child of `work.flow.heading` anchor | wrap contents; animate inner `yPercent` |
| `.work-flow-label` | own `work.flow.step.*` anchors | opacity + filter only; **no transform** |
| `.work-flow-description` | no anchor | y + opacity |
| `.capability-heading h2 > span` | child of `capabilities.heading` anchor | wrap contents; animate inner `yPercent` |
| `.capability-product h3`, `.capability-ai h3` | own anchors | opacity + filter/clip only |
| `.capability-discipline li` | own center anchors | do not transform; animate `li > span` |
| `.case-study-kicker`, `.case-study-description` | no anchors | y + opacity |
| `.case-study-title` | own anchor | clip-path on h3; animate existing `> span` |
| `.kabri-flat` | own anchor **and internal door anchors** | opacity + clip-path/filter only; **never transform inner span** |
| `.kabri-lease`, `.kabri-inspection`, `.kabri-repair`, `.kabri-book` | own anchor; no internal anchors | animate direct `> span`; never the figure |
| `.scan-ledger > span`, `.scan-paper > span` | figure anchors; no internal anchors | animate the direct child span; never the figure. `InlineReferenceSvg` renders `figure > span > svg`, so there is no direct `svg` child. |
| `.scan-paper-river-cover` | own anchor + static CSS clip-path | preserve the figure clip-path; animate only its direct `> span` |
| `.shop-ops-plate > span`, `.shop-ops-fork > span`, `.shop-ops-bag > span` | figure anchors | animate inner span only |
| `.shop-ops-message > span`, `.shop-ops-ticket > span`, `.shop-ops-reply > span` | figure anchors | animate direct child only (`InlineReferenceSvg` renders `figure > span > svg`) |
| `.shop-ops-wallet`, `.shop-ops-dashboard` | own anchors | animate direct children only; no panel transform |
| `.credit-pan > span`, `.credit-gst > span`, `.credit-bank > span`, `.credit-itr > span` | figure anchors | animate inner span only |
| `.credit-application`, `.credit-assessment`, `.credit-outcome` | own anchors | clip-path on panel; animate direct children only |
| `.why-me-title > span` | child of `why.title` anchor | wrap contents; animate inner `yPercent` |
| `.why-me-intro` | own anchor | opacity only |
| `.why-me-node` | own center anchor | opacity + box-shadow only; **no transform** |
| `.why-me-point-copy` | own anchor | do not animate the wrapper |
| `.why-me-number`, `.why-me-point-title`, `.why-me-point-description` | children of copy anchor | y + opacity |
| `.conclusion-heading > span` | child of heading anchor | wrap contents; animate inner `yPercent` |
| `.conclusion-personal` | no anchor | y + opacity |
| `.conclusion-name`, `.conclusion-role` | children of byline anchor | y + opacity |
| `.footer-statement > span` | child of statement anchor | wrap contents; animate inner `yPercent` |
| `.footer-pull` | own anchor | clip-path + opacity only; no transform |
| `.footer-item` | descendants of `footer.links` anchor | y + opacity; parent anchor rect unaffected |
| `.footer-top` | own anchor | opacity only |

Add a dev-only guard in `motion-utils.ts` for transform tweens:

```ts
function assertTransformSafe(target: Element) {
  if (target.hasAttribute("data-thread-anchor") ||
      target.querySelector("[data-thread-anchor]")) {
    throw new Error("Unsafe transform target contains a thread anchor");
  }
}
```

Use it only for `x/y/scale/rotate/yPercent` tweens. Opacity, clip-path, and filter tweens do not need the guard.

### 2.8 Motion tokens

| Token | Desktop | Mobile ≤700 |
|---|---:|---:|
| line reveal distance | `yPercent: 112` | `yPercent: 112` |
| text rise | `28px` | `18px` |
| art rise | `48px` | `30px` |
| art side offset | `44px` | `24px` |
| art scale start | `0.96` | `0.97` |
| text blur start | `8px` | `6px` |
| label blur start | `4px` | `3px` |
| heading line duration | `0.85` | `0.75` |
| art duration | `0.55` | `0.5` |
| micro duration | `0.35` | `0.3` |
| scene exit duration | `0.3` | `0.25` |

Eases:

- `expo.out` — masked title lines, hero load lines.
- `power3.out` — text, cards, artwork entrance.
- `power2.out` — labels, small details, node pulses.
- `power1.in` — scene exit dimming.
- `none` — Legalexy scan-line sweeps only.

Scrub values:

- `0.45` — small link/label entrances.
- `0.55` — body text, Why Me nodes, artwork details.
- `0.65` — title lines, case artwork.
- `0.75` — case scene exits.
- `0.55` — hero scroll exit.

Durations inside scrubbed timelines are timeline units, not wall-clock seconds. `scrub` is the catch-up smoothing. All scroll-triggered animations are reversible; no `toggleActions`, no `once`, no one-shot reveals.

---

## 3. Choreography

### 3.1 Hero

#### A. Load entrance (time-based, starts after readiness + `0.15s` delay)

No scroll trigger. One `gsap.timeline`.

| Position | Target | From | To | Duration | Ease |
|---|---|---|---|---|---|
| `0` | `.hero-title > span` (3 lines, stagger `0.12`) | `opacity: 0`, `filter: blur(10px)`, `clipPath: inset(-0.3em 100% -0.3em -0.12em)` | `opacity: 1`, `filter: blur(0px)`, `clipPath: inset(-0.3em -0.12em -0.3em -0.12em)` | `0.9` | `expo.out` |
| `0.55` | `.hero-support p` | `opacity: 0`, `y: 18` | `opacity: 1`, `y: 0` | `0.6` | `power3.out` |
| `0.7` | `.scroll-cue` | `opacity: 0` | `opacity: 1` | `0.45` | `power2.out` |

Rules:

- Never tween `x`, `y`, `scale`, `rotate`, or `yPercent` on a hero line. Its glyph ranges must not move.
- Clip-path final is expanded beyond the line box so no glyph overhang is cut.
- Leave the final inline state in place; the timeline is not reversed. The hero scroll exit is separate and acts on a different element.

#### B. Hero scroll exit

| Trigger | Start | End | Scrub | Target | From → To | Ease |
|---|---|---|---|---:|---|---|---|
| `.hero` | `top top` | `bottom top` | `0.55` | `.hero-copy` | `opacity: 1 → 0.62` | `none` |

Opacity only. No transform, so the title glyph rects and scroll cue anchor remain fixed while the section leaves.

### 3.2 Work Flow

All triggers are scoped to `.work-flow`.

| Target | Trigger | Start | End | Scrub | From → To | Duration / Stagger | Ease |
|---|---|---|---|---|---:|---|---|
| `.work-flow-copy h2 > span` (wrapped inner) | `.work-flow-copy` | `top 86%` | `top 44%` | `0.65` | `yPercent: 112, opacity: 0 → yPercent: 0, opacity: 1` | `0.85` / `0.1` | `expo.out` |
| `.work-flow-description` | itself | `top 92%` | `top 68%` | `0.5` | `y: 18, opacity: 0 → y: 0, opacity: 1` | `0.65` | `power3.out` |
| each `.work-flow-label` | itself | `top 88%` | `top 68%` | `0.45` | `opacity: 0, filter: blur(4px) → opacity: 1, filter: blur(0px)` | `0.45` | `power2.out` |

Notes:

- The labels are thread anchors. They fade individually in document order as each label enters; no shared stagger that would decouple them from their real vertical positions.
- The work-flow drawing itself is not moved. The thread draws the bulb and waves.
- No exit. Capabilities enters over the last part of the work-flow passage.

### 3.3 Capabilities

| Target | Trigger | Start | End | Scrub | From → To | Duration / Stagger | Ease |
|---|---|---|---|---|---:|---|---|
| `.capability-heading h2 > span` (wrapped inner) | `.capability-heading` | `top 86%` | `top 40%` | `0.65` | `yPercent: 112, opacity: 0 → yPercent: 0, opacity: 1` | `0.8` / `0.1` | `expo.out` |
| each `.capability-discipline h3` | itself | `top 90%` | `top 64%` | `0.45` | `opacity: 0, filter: blur(5px) → opacity: 1, filter: blur(0px)` | `0.55` | `power2.out` |
| each `li > span` | its `li` (anchor) | `top 90%` | `top 70%` | `0.55` | `y: 14, opacity: 0 → y: 0, opacity: 1` | `0.45` | `power3.out` |

Notes:

- The h3 and li elements are thread anchors; only their descendants move.
- The product and AI dots reveal as their real vertical positions cross the viewport line, not in a forced 1→5/1→5 stagger.
- The orbit remains static so the thread's orbit geometry stays intact.
- No exit.

### 3.4 Case Studies — common scene contract

Parent `.case-studys` must have **no ScrollTrigger**.

Each case controller is created by its own file and is scoped to one article:

```text
#kabri       -> case-kabri.ts
#norma       -> case-norma.ts
#shop-ops    -> case-shopops.ts
#lega-lexy   -> case-legalexy.ts
```

Each controller:

1. Queries only inside its article.
2. Creates independent per-element entrance triggers.
3. Creates one scene-level exit trigger on the article.
4. Returns nothing; GSAP context cleanup handles all tweens/triggers.

#### Common entrance conventions

| Element class | Trigger start | Trigger end | Scrub | Typical motion |
|---|---|---|---:|---|
| Kicker / description | `top 92%` | `top 70%` | `0.5` | `y: -10 → 0`, `opacity: 0 → 1` |
| Title inner span | `top 86%` | `top 58%` | `0.65` | `yPercent: 112 → 0`, `opacity: 0 → 1` |
| Top artwork | `top 88%` | `top 64%` | `0.6` | `y: 40 → 0`, `opacity: 0 → 1`, optional scale |
| Mid artwork | `top 88%` | `top 64%` | `0.6` | same, smaller offsets |
| Lower artwork | `top 90%` | `top 68%` | `0.55` | same |
| Explore link | `top 96%` | `top 78%` | `0.45` | `y: 8 → 0`, `opacity: 0 → 1` |

All entrance tweens use `power3.out` unless the target is a title (`expo.out`) or a micro-detail (`power2.out`). All are reversible via scrub.

#### Common scene exit

| Trigger | Start | End | Scrub | Targets | From → To | Ease |
|---|---|---|---|---:|---|---|---|
| case `<article>` | `bottom 38%` | `bottom 8%` | `0.75` | kicker, description, `.case-study-composition`, `.case-study-link` | `opacity: 1 → 0.86` | `power1.in` |

The composition opacity is safe for anchors; the figures themselves are not transformed. The background band remains fully opaque. This is a subtle handoff, not a fade to blank.

#### Handoff behavior

Because the case articles are adjacent and there is no parent trigger:

- When the next case top reaches `78%` of the viewport, the previous case is roughly two-thirds through its own passage because of the stacked geometry.
- The previous case's exit (`bottom 38% → 8%`) overlaps the next case's first art entrances.
- No global timeline coordinates the four scenes; the overlap is a natural consequence of independent viewport-relative triggers.

### 3.4.1 Kabri

Scope: `#kabri`. Background is light; do not animate the article background.

| Position/order | Target | Trigger | Start → End | From → To | Duration | Ease |
|---|---|---|---|---|---|---|
| 1 | `.case-study-kicker`, `.case-study-description` | `.case-study-kicker` (shared header trigger) | `top 92% → 70%` | `opacity: 0, y: -10 → 1, 0` | `0.45`, stagger `0.04` | `power2.out` |
| 2 | `.case-study-title > span` | `#kabri-title` h3 | `top 86% → 58%` | `opacity: 0, yPercent: 112 → 1, 0` | `0.85` | `expo.out` |
| 3 | `.kabri-flat` (figure) | itself | `top 88% → 62%` | `opacity: 0`, `clipPath: inset(0 100% 0 0) → 1`, `clipPath: inset(-4% -2% -4% 0)` | `0.6` | `power3.out` |
| 4 | `.kabri-lease > span` | `.kabri-lease` | `top 88% → 64%` | `opacity: 0, y: 56, rotate: -2, scale: 0.96 → 1, 0, 0, 1` | `0.55` | `power3.out` |
| 5 | `.kabri-inspection > span` | `.kabri-inspection` | `top 86% → 62%` | `opacity: 0, y: 38, scale: 0.97 → 1, 0, 1` | `0.55` | `power3.out` |
| 5a | `.kabri-crack` | same inspection trigger | same | `drawSVG: 0% → 100%` | `0.45` | `power2.inOut` |
| 5b | `.kabri-detection` | same | same | `opacity: 0 → 1` | `0.3` | `power2.out` |
| 6 | `.kabri-repair > span` | `.kabri-repair` | `top 90% → 66%` | `opacity: 0, y: 48, rotate: 2 → 1, 0, 0` | `0.55` | `power3.out` |
| 6a | `.kabri-wrench` | same | same | `opacity: 0.4 → 1` | `0.45` | `power2.out` |
| 6b | `.kabri-assigned` | same | same | `opacity: 0 → 1` | `0.35` | `power2.out` |
| 7 | `.kabri-book > span` | `.kabri-book` | `top 90% → 68%` | `opacity: 0, y: 64, scale: 0.97 → 1, 0, 1` | `0.6` | `power3.out` |
| 7a | `.kabri-rent-row`, `.kabri-expense-row`, `.kabri-other-row`, `.kabri-net-row`, `.kabri-tax-record` | same | same | `opacity: 0.3 → 1` | `0.35`, stagger `0.05` | `power2.out` |
| 7b | `.kabri-tax-status` | same | same | `opacity: 0.3, filter: blur(3px) → 1, blur(0)` | `0.35` | `power2.out` |
| 8 | `.case-study-link` | itself | `top 96% → 78%` | `opacity: 0, y: 8 → 1, 0` | `0.4` | `power2.out` |
| 9 | scene exit | `#kabri` | `bottom 38% → 8%` | composition/header/link opacity `1 → 0.86` | `0.3` | `power1.in` |

Critical constraint: **do not animate `.kabri-flat > span`**. It contains the north and east door anchor circles. Only the figure's opacity and clip-path may animate.

### 3.4.2 Norma

Scope: `#norma`. Background is dark; the static ledger/paper opacity values (`0.16`, `0.36`) must remain on the figures. Animate their inner spans/SVGs, not figure opacity.

| Position/order | Target | Trigger | Start → End | From → To | Duration | Ease |
|---|---|---|---|---|---|---|
| 1 | `.case-study-kicker`, `.case-study-description` | `.case-study-kicker` (shared header trigger) | `top 92% → 70%` | `opacity: 0, y: -10 → 1, 0` | `0.45`, stagger `0.04` | `power2.out` |
| 2 | `.case-study-title > span` | `#norma-title` | `top 86% → 58%` | `opacity: 0, yPercent: 112 → 1, 0` | `0.85` | `expo.out` |
| 3 | `.scan-ledger-top > span` | `.scan-ledger-top` | `top 88% → 64%` | `opacity: 0`, `clipPath: inset(0 100% 0 0) → 1`, `clipPath: inset(-2% -2% -2% 0)` | `0.55` | `power3.out` |
| 4 | `.scan-paper-acme > span` | `.scan-paper-acme` | `top 88% → 64%` | `opacity: 0, x: -40, rotate: -3 → 1, 0, 0` | `0.55` | `power3.out` |
| 5 | `.scan-paper-river > span` | `.scan-paper-river` | `top 88% → 64%` | `opacity: 0, x: -32, rotate: -2 → 1, 0, 0` | `0.5` | `power3.out` |
| 6 | `.scan-paper-river-cover > span` | `.scan-paper-river-cover` | `top 88% → 64%` | `opacity: 0, x: 10 → 1, 0` | `0.5` | `power3.out` |
| 7 | `.scan-paper-front > span` | `.scan-paper-front` | `top 88% → 64%` | `opacity: 0, x: -64, y: 24, rotate: -4 → 1, 0, 0, 0` | `0.6` | `power3.out` |
| 8 | `.scan-paper-main > span` | `.scan-paper-main` | `top 88% → 62%` | `opacity: 0, y: 48, scale: 0.94 → 1, 0, 1` | `0.55` | `power3.out` |
| 9 | `.scan-paper-rejected > span` | `.scan-paper-rejected` | `top 90% → 66%` | `opacity: 0, x: 36, rotate: 4 → 1, 0, 0` | `0.5` | `power3.out` |
| 10 | `.scan-ledger-bottom > span` | `.scan-ledger-bottom` | `top 90% → 68%` | `opacity: 0`, `clipPath: inset(0 0 0 100%) → 1`, `clipPath: inset(-2% -2% -2% 0)` | `0.55` | `power3.out` |
| 11 | `.scan-extracted > p`, `.scan-extracted dl > div` | `.scan-extracted` | `top 92% → 68%` | `opacity: 0, y: 12 → 1, 0` | `0.4`, stagger `0.05` | `power2.out` |
| 12 | `.case-study-link` | itself | `top 96% → 78%` | `opacity: 0, y: 8 → 1, 0` | `0.4` | `power2.out` |
| 13 | scene exit | `#norma` | `bottom 38% → 8%` | composition/header/link opacity `1 → 0.86` | `0.3` | `power1.in` |

Critical constraint: preserve `.scan-paper-river-cover`'s static `clip-path: inset(0 0 40%)`. Never tween clip-path on that figure; only its direct child span.

### 3.4.3 ShopOps

Scope: `#shop-ops`. Keep `.shop-ops-plate` at its static `opacity: 0.32`; animate its inner span only. Keep the wallet/dashboard wrappers fixed because they carry anchors; reveal their children.

| Position/order | Target | Trigger | Start → End | From → To | Duration | Ease |
|---|---|---|---|---|---|---|
| 1 | `.case-study-kicker`, `.case-study-description` | `.case-study-kicker` (shared header trigger) | `top 92% → 70%` | `opacity: 0, y: -10 → 1, 0` | `0.45`, stagger `0.04` | `power2.out` |
| 2 | `.case-study-title > span` | `#shop-ops-title` | `top 86% → 58%` | `opacity: 0, yPercent: 112 → 1, 0` | `0.85` | `expo.out` |
| 3 | `.shop-ops-plate > span` | `.shop-ops-plate` | `top 88% → 64%` | `opacity: 0, x: -28, scale: 1.04 → 1, 0, 1` | `0.65` | `power3.out` |
| 4 | `.shop-ops-fork > span` | `.shop-ops-fork` | `top 88% → 64%` | `opacity: 0, y: -22 → 1, 0` | `0.5` | `power3.out` |
| 5 | `.shop-ops-message > span` | `.shop-ops-message` | `top 86% → 62%` | `opacity: 0, y: -18, scale: 0.97 → 1, 0, 1` | `0.5` | `power3.out` |
| 6 | `.shop-ops-reply > span` | `.shop-ops-reply` | `top 88% → 64%` | `opacity: 0, x: -30 → 1, 0` | `0.5` | `power3.out` |
| 7 | `.shop-ops-ticket > span` | `.shop-ops-ticket` | `top 88% → 64%` | `opacity: 0, y: 28, rotate: 4 → 1, 0, 0` | `0.5` | `power3.out` |
| 8 | `.shop-ops-bag > span` | `.shop-ops-bag` | `top 90% → 66%` | `opacity: 0, y: 32, scale: 0.96 → 1, 0, 1` | `0.55` | `power3.out` |
| 9 | `.shop-ops-wallet-brand`, `.shop-ops-wallet-amount`, `.shop-ops-wallet-status` | `.shop-ops-wallet` | `top 90% → 68%` | `opacity: 0, y: 10 → 1, 0` | `0.4`, stagger `0.04` | `power2.out` |
| 9a | `.shop-ops-paid-check` | same | same | `opacity: 0, scale: 0.6 → 1, 1` | `0.35` | `power2.out` |
| 9b | `.shop-ops-wallet-after` | same | same | `opacity: 0.3 → 1` | `0.3` | `power2.out` |
| 10 | `.shop-ops-dashboard > p`, `.shop-ops-dashboard-summary > div` | `.shop-ops-dashboard` | `top 90% → 68%` | `opacity: 0, y: 12 → 1, 0` | `0.4`, stagger `0.05` | `power2.out` |
| 10a | `.shop-ops-chart rect` | same | same | `opacity: 0 → 1` | `0.3`, stagger `0.03` | `power2.out` |
| 11 | `.case-study-link` | itself | `top 96% → 78%` | `opacity: 0, y: 8 → 1, 0` | `0.4` | `power2.out` |
| 12 | scene exit | `#shop-ops` | `bottom 38% → 8%` | composition/header/link opacity `1 → 0.86` | `0.3` | `power1.in` |

Critical constraint: never transform `.shop-ops-wallet`, `.shop-ops-dashboard`, or their ancestors. Only direct children move.

### 3.4.4 Legalexy

Scope: `#lega-lexy`. The inline `visibility: hidden; opacity: 0` scan-line groups are decorative and `aria-hidden`; they may be animated as part of this scene. Do not use any `data-thread-*` runtime hooks on the SVGs.

| Position/order | Target | Trigger | Start → End | From → To | Duration | Ease |
|---|---|---|---|---|---|---|
| 1 | `.case-study-kicker`, `.case-study-description` | `.case-study-kicker` (shared header trigger) | `top 92% → 70%` | `opacity: 0, y: -10 → 1, 0` | `0.45`, stagger `0.04` | `power2.out` |
| 2 | `.case-study-title > span` | `#lega-lexy-title` | `top 86% → 58%` | `opacity: 0, yPercent: 112 → 1, 0` | `0.85` | `expo.out` |
| 3 | `.credit-pan > span` | `.credit-pan` | `top 88% → 64%` | `opacity: 0, y: -28, scale: 0.96 → 1, 0, 1` | `0.55` | `power3.out` |
| 3a | `.credit-pan .credit-scan` | same | same | `visibility: visible`, `opacity: 0 → 1`, `x: 2 → 276` | `0.35` | `none` |
| 3b | `.credit-pan .credit-scan` | same | same, later | `opacity: 1 → 0` | `0.15` | `none` |
| 4 | `.credit-gst > span` | `.credit-gst` | `top 88% → 64%` | `opacity: 0, y: -32, scale: 0.97 → 1, 0, 1` | `0.55` | `power3.out` |
| 4a | `.credit-gst .credit-scan` | same | same | `visibility: visible`, `opacity: 0 → 1`, `x: 2 → 250` | `0.35` | `none` |
| 4b | `.credit-gst .credit-scan` | same | same, later | `opacity: 1 → 0` | `0.15` | `none` |
| 5 | `.credit-bank > span` | `.credit-bank` | `top 90% → 66%` | `opacity: 0, y: 44, rotate: 2 → 1, 0, 0` | `0.6` | `power3.out` |
| 6 | `.credit-itr > span` | `.credit-itr` | `top 90% → 66%` | `opacity: 0, y: 40, rotate: 2 → 1, 0, 0` | `0.55` | `power3.out` |
| 6a | `.credit-itr .credit-scan` | same | same | `visibility: visible`, `opacity: 0 → 1`, `x: 2 → 400` | `0.4` | `none` |
| 6b | `.credit-itr .credit-scan` | same | same, later | `opacity: 1 → 0` | `0.15` | `none` |
| 7 | `.credit-application` panel + `> p`, `> div` | `.credit-application` | `top 90% → 66%` | panel `clipPath: inset(0 100% 0 0) → inset(-2% -2% -2% 0)`; children `y: 8, opacity: 0 → 0, 1` | `0.5` / `0.3` | `power3.out` |
| 8 | `.credit-assessment` panel + `> p`, `dl > div` | `.credit-assessment` | `top 90% → 66%` | panel clip-path wipe; children `y: 8, opacity: 0 → 0, 1` | `0.5` / `0.3`, stagger `0.04` | `power3.out` |
| 9 | `.credit-outcome` panel + `> p`, `.credit-up-to`, `> strong`, `.credit-approval` | `.credit-outcome` | `top 90% → 68%` | panel clip-path wipe; children `y: 16, opacity: 0 → 0, 1`; strong `scale: 0.96 → 1` | `0.55` / `0.35`, stagger `0.04` | `power3.out` |
| 10 | `.case-study-link` | itself | `top 96% → 78%` | `opacity: 0, y: 8 → 1, 0` | `0.4` | `power2.out` |
| 11 | scene exit | `#lega-lexy` | `bottom 38% → 8%` | composition/header/link opacity `1 → 0.86` | `0.3` | `power1.in` |

Critical constraints:

- Animate the panel itself only with clip-path; animate its direct children with y/opacity/scale.
- Do not transform `.credit-application`, `.credit-assessment`, or `.credit-outcome`.
- Do not transform `.credit-pan`, `.credit-gst`, `.credit-bank`, or `.credit-itr`; only their inner spans and internal decorative groups.
- If GSAP's `x` on an SVG `<g>` does not map cleanly to the viewBox in practice, use `attr: { transform: "translate(...)" }` for the scan-line sweep; do not move the document figure.

### 3.5 Why Me

Scope: `.why-me`.

#### Header

| Target | Trigger | Start | End | Scrub | From → To | Duration / Stagger | Ease |
|---|---|---|---|---|---:|---|---|
| `.why-me-eyebrow` | itself | `top 92%` | `top 72%` | `0.45` | `opacity: 0, y: -8 → 1, 0` | `0.4` | `power2.out` |
| `.why-me-title > span` (wrapped inner) | `.why-me-title` | `top 86%` | `top 42%` | `0.65` | `yPercent: 112, opacity: 0 → 0, 1` | `0.8` / `0.09` | `expo.out` |
| `.why-me-intro` | itself | `top 92%` | `top 70%` | `0.45` | `opacity: 0 → 1` | `0.4` | `power2.out` |

#### Five anchor-locked point reveals

For each pair `N = 1..5`:

```ts
const node = root.querySelector(`[data-thread-anchor="why.point.${N}"]`);
const copy = root.querySelector(`[data-thread-anchor="why.copy.${N}"]`);
```

Create one timeline per point:

```ts
gsap.timeline({
  scrollTrigger: {
    trigger: node,
    start: "center 76%",
    end: "center 54%",
    scrub: 0.55
  }
});
```

| Position | Target | From → To | Duration | Ease |
|---|---|---|---|---|
| `0` | `node` | `opacity: 0`, `boxShadow: 0 0 0 0 rgba(255,59,18,0)` → `opacity: 1`, `boxShadow: 0 0 0 10px rgba(255,59,18,0)` | `0.3` | `power2.out` |
| `0.02` | `why-me-number` | `opacity: 0, y: 10 → 1, 0` | `0.25` | `power2.out` |
| `0.05` | `why-me-point-title` | `opacity: 0, y: 26 → 1, 0` | `0.45` | `power3.out` |
| `0.1` | `why-me-point-description` | `opacity: 0, y: 18 → 1, 0` | `0.4` | `power2.out` |

Why this is correct:

- The trigger is the actual `why.point.N` span in `center` mode. The node's real document position determines the reveal; no hardcoded progress or equal spacing.
- The copy block's thread anchor shares the same top; animating only `.why-me-number`, `.why-me-point-title`, and `.why-me-point-description` leaves `why.copy.N` and `why.point.N` rects stable.
- The node itself receives no transform. Its opacity/box-shadow changes do not alter its rect.
- The five triggers have different start scroll positions because the points are non-uniformly spaced. Scrolling back up reverses each timeline naturally.
- Do not use `thread:anchor`. Do not use a global point stagger. Do not trigger all five from the section.

No section-level exit. The conclusion begins below the last point.

### 3.6 Conclusion

| Target | Trigger | Start | End | Scrub | From → To | Duration / Stagger | Ease |
|---|---|---|---|---|---:|---|---|
| `.conclusion-heading > span` (wrapped inner) | `.conclusion-heading` | `top 86%` | `top 40%` | `0.65` | `yPercent: 112, opacity: 0 → 0, 1` | `0.8` / `0.1` | `expo.out` |
| `.conclusion-personal` | itself | `top 92%` | `top 68%` | `0.5` | `opacity: 0, y: 18 → 1, 0` | `0.55` | `power3.out` |
| `.conclusion-name` | `.conclusion-byline` | `top 92%` | `top 70%` | `0.45` | `opacity: 0, y: 14 → 1, 0` | `0.4` | `power2.out` |
| `.conclusion-role` | `.conclusion-byline` | `top 92%` | `top 70%` | `0.45` | `opacity: 0, y: 10 → 1, 0` | `0.4`, position `0.06` | `power2.out` |

Do not transform `.conclusion-profile` or `.conclusion-byline`; both carry anchors. Only descendants move.

### 3.7 Footer

| Target | Trigger | Start | End | Scrub | From → To | Duration / Stagger | Ease |
|---|---|---|---|---|---:|---|---|
| `.footer-statement > span` (wrapped inner) | `.footer-statement` | `top 90%` | `top 48%` | `0.65` | `yPercent: 112, opacity: 0 → 0, 1` | `0.8` / `0.1` | `expo.out` |
| `.footer-pull` | itself | `top 92%` | `top 68%` | `0.5` | `opacity: 0`, `clipPath: inset(0 100% 0 0) → 1`, `clipPath: inset(-0.2em -0.1em -0.2em -0.1em)` | `0.55` | `power3.out` |
| `.footer-item` | `.footer-links` | `top 92%` | `top 68%` | `0.5` | `opacity: 0, y: 24 → 1, 0` | `0.5`, stagger `0.08` | `power3.out` |
| `.footer-status` | `.footer-links` | `top 92%` | `top 68%` | `0.5` | `opacity: 0 → 1` | `0.35`, position `0.2` | `power2.out` |
| `.footer-top` | itself | `top 100%` | `top 94%` | `0.4` | `opacity: 0 → 1` | `0.35` | `power2.out` |

> Trigger feasibility note: `.footer-top` sits near the final document edge. `top 96% → 82%` can never complete before max scroll at any audited viewport. The `top 100% → 94%` window completes at all six viewports (tightest slack: about 6px at `768×1024`), so the back-to-top link reaches full opacity before the page stops. Do not widen this window without re-measuring.

Notes:

- `.footer-pull` is an anchor; clip-path and opacity only.
- `.footer-top` is an anchor; opacity only.
- `.footer-item` is a descendant of the `footer.links` anchor; transforms on the item do not change the parent section rect.
- Existing `.footer-link` hover/focus transitions remain untouched. Our item-level transform composes with the existing link hover transform.
- Use opacity, never `autoAlpha`, on focusable elements. No visibility hidden on contact links.

### 3.8 Handoff map

| Boundary | Behavior |
|---|---|
| Hero → Work Flow | Hero copy fades to `0.62` over `top top → bottom top`; Work Flow heading enters at `top 86%`. Overlap is intentional. |
| Work Flow → Capabilities | No work-flow exit; capabilities heading enters at `top 86%`. |
| Capabilities → Kabri | No capabilities exit; Kabri kicker enters at `top 92%`, title at `top 86%`. |
| Kabri → Norma | Norma enters while Kabri is still in its last third; Kabri exit starts at `bottom 38%`. |
| Norma → ShopOps | Same independent overlap. |
| ShopOps → Legalexy | Same independent overlap. |
| Legalexy → Why Me | Why Me eyebrow/title enter while Legalexy exits at `bottom 38%`. |
| Why Me → Conclusion | Last point reveal ends at `center 54%`; conclusion heading starts at `top 86%`. No forced overlap. |
| Conclusion → Footer | Footer statement enters at `top 90%`; conclusion has no exit. |

---

## 4. Responsive behavior

### 4.1 Breakpoint behavior

Use the existing CSS breakpoints; do not add new ones.

| Range | Behavior |
|---|---|
| `> 1199px` | Full desktop distances and scrub values from the tables. |
| `701–1199px` | Same targets/percentages; shorter case sections (`760px` min) naturally compress the sequence. Mobile distance multipliers do not apply. |
| `≤ 700px` | `context.conditions.mobile === true`; use mobile distance/scale values. All triggers keep the same viewport-relative start/end percentages. |
| `≤ 450px`, `≤ 360px` | No target changes. Existing CSS stacks and repositions artwork; the per-element triggers follow those positions automatically. |

### 4.2 Mobile distances

Apply only these reductions inside builder calls:

- Text rise `18px` instead of `28px`.
- Art rise `30px` instead of `48px`.
- Art side offset `24px` instead of `44px`.
- Art scale start `0.97` instead of `0.96`.
- Text blur `6px` instead of `8px`.
- Heading line duration `0.75` instead of `0.85`.
- Art duration `0.5` instead of `0.55`.
- Scene exit duration `0.25` instead of `0.3`.

Do not change trigger start/end percentages on mobile. The actual element positions do the work.

### 4.3 Mobile-specific risks and required checks

- `#kabri` becomes a tall vertical stack. `.kabri-flat` is still anchor-bearing and contains door anchors; never transform its inner span on mobile either. The clip-path wipe is the only entrance.
- ShopOps wallet/dashboard panels are large on mobile; only children move.
- Legalexy panels use transparent backgrounds on mobile; clip-path wipes still work.
- Footer on mobile has `min-height: 0`; the footer triggers are element-based, so they do not rely on the footer filling a viewport.
- Conclusion stage is `height: auto` on mobile; heading/personal/byline triggers are element-based.
- `svh` viewport changes (mobile browser chrome) must not trigger scene rebuilds. `ScrollTrigger.config({ ignoreMobileResize: true })` plus per-element triggers handles this.
- No horizontal overflow at `425`, `375`, or `320`. Transforms must stay within the composition; clip-path masks must not be used on elements with visible focus outlines.

---

## 5. Accessibility and reduced motion

### 5.1 Reduced motion

- All motion exists only inside the `(prefers-reduced-motion: no-preference)` matchMedia.
- When reduce is active:
  - No wrappers are created.
  - No initial hidden states are set.
  - No ScrollTriggers are created.
  - No clip-paths, filters, transforms, or opacities are applied.
  - All content is fully visible and static.
- If the preference changes at runtime, `mm.revert()` restores the DOM; the cleanup returned by the matchMedia callback restores wrappers. Switching back rebuilds cleanly.
- The existing footer transition disable and thread-head hide rules under `prefers-reduced-motion` remain untouched.

### 5.2 Keyboard and focus

- Use only `opacity`, never `autoAlpha` or `visibility: hidden`, on interactive elements (footer links, copy buttons, back-to-top).
- The wrapper spans are presentational; no new tab stops.
- Avoid `pointer-events: none` on content during reveal.
- Do not animate `display` or `visibility` on focusable controls.
- Contact links remain focusable at their initial opacity. If focus enters the footer before the scrub catches up, the browser's focus scroll causes the footer triggers to advance; the existing focus-visible outlines remain.
- Do not apply clip-path to focusable elements or their parents. Clip-path is used only on headings, figures, panels, and the non-focusable `.footer-pull` span.
- Do not change `aria-hidden`, labels, roles, heading levels, or tab order.

### 5.3 Reading and content

- Text remains selectable; wrappers keep the same text nodes.
- No copy is split by characters, words, or `SplitText`.
- No heading line reflow: wrappers are inside existing `display: block` line spans.
- Content is only hidden after JS readiness, and only on no-preference. A JS failure leaves the static page visible.
- The thread layer remains `aria-hidden` and pointer-events none.

---

## 6. Performance and cleanup

### 6.1 Performance rules

- Animate only `opacity`, `transform` (`x`, `y`, `scale`, `rotate`, `yPercent`), `clip-path`, `filter`, `box-shadow`, and `drawSVG`.
- Do not animate layout properties: `width`, `height`, `top`, `left`, `margin`, `padding`, `font-size`, `letter-spacing`, `line-height`.
- Do not add `will-change` permanently. GSAP's inline transforms are sufficient.
- Do not use blur/filter on large composite wrappers. Blur is limited to:
  - hero title lines (load only),
  - work-flow labels,
  - capability h3s,
  - small text details.
- The case compositions remain static; only inner artwork moves.
- No image decoding, canvas, or new assets.
- `ScrollTrigger.config({ ignoreMobileResize: true })` is the only global config change.
- No `ScrollTrigger.refresh()` inside scroll callbacks. Refresh once after build and once after fonts are ready if fonts resolve later.

### 6.2 Cleanup contract

On unmount or matchMedia revert:

- `mm.revert()` kills all tweens, timelines, and ScrollTriggers in the context.
- The wrapper registry:
  - Moves original child nodes back out of each `data-motion-inner` span.
  - Removes the inner span.
  - Restores the outer line's original inline `clipPath` (usually removing it).
  - Removes `data-motion-inner` / `data-motion-line` attributes.
- Remove the readiness listeners, `site:ready` listener, and MutationObserver.
- Remove the Lenis `scroll` listener with the same function reference.
- Do not touch Lenis, Lenis options, `gsap.ticker`, ScrollTrigger scroll memory, thread state, or preloader state.
- No timers, intervals, RAF loops, or ResizeObservers remain.

### 6.3 No duplicate infrastructure

- No second Lenis.
- No new GSAP ticker callbacks.
- No new global scroll listener.
- No `ScrollTrigger.scrollerProxy`.
- No duplicate `ScrollTrigger.update` listener; the `useLenis` effect is the only one.
- No `ScrollTrigger` on `.case-studys`.
- No plugin registration in scene files.

---

## 7. Verification protocol and acceptance criteria

Run every check after the relevant implementation task and again at the end. Use the existing dev server; no new test dependency is required.

### 7.1 Baseline and regression

1. `git status --short` before work is clean.
2. After implementation, the diff contains only:
   - `app/page.tsx`
   - new files under `components/portfolio/motion/`
   - no changes under `components/portfolio/thread/`
   - no changes under `components/preloader/`
   - no `app/globals.css` changes
   - no changes to section components, SVGs, tokens, copy, or contact behavior
3. `pnpm lint` passes.
4. `pnpm build` passes.
5. Dev server has no hydration errors, no missing selector errors, and no ScrollTrigger warnings.
6. No application code imports `window.__threadDebug` or `thread:anchor`.

### 7.2 Geometry invariance

Capture document-coordinate rects of every `[data-thread-anchor]` before and after motion initialization at `1440×900`, `1024×768`, `768×1024`, `425×850`, `375×812`, and `320×640`.

Pass criteria:

- Max top/left/width/height delta `< 0.5px` for every anchor.
- `Range` anchors (`hero.from.o`, `hero.concept.c`, `hero.launch.ch`) unchanged.
- No duplicate or missing anchor IDs.
- Document `scrollHeight` unchanged within `1px` versus the static baseline.
- No `.pin-spacer` element exists.
- No `body`/`html` overflow change introduced by motion.
- The thread's rebuild count does not increase continuously. One refresh rebuild is acceptable; a rebuild every frame is a failure.

DevTools console helper:

```js
(() => {
  const root = document.querySelector(".portfolio");
  return [...root.querySelectorAll("[data-thread-anchor]")].map((el) => {
    const r = el.getBoundingClientRect();
    return {
      id: el.dataset.threadAnchor,
      top: +(r.top + scrollY).toFixed(2),
      left: +r.left.toFixed(2),
      width: +r.width.toFixed(2),
      height: +r.height.toFixed(2)
    };
  });
})();
```

Run with reduced motion enabled to get the static baseline, then with no-preference.

### 7.3 Motion behavior

For each scene, verify at least these scroll positions:

- Before the trigger starts: target is at its `from` state and the rest of the page is unaffected.
- Mid-trigger: target is partially revealed; no jump or snap at start.
- After the trigger ends: target is at its final state.
- Reverse scroll from below to above: all properties return smoothly to the `from` state; no stuck opacity, clip, or transform.
- Fast scroll and scroll while the preloader exit is finishing: no double init, no flicker, no duplicated wrappers.

Specific checks:

- Hero load runs once after preloader; title lines wipe left-to-right; thread glyph ranges do not move.
- Hero scroll exit dims `.hero-copy` only; no title translation.
- Work-flow labels reveal individually, not as one block.
- Capability h3 and li text move only inside static anchors.
- Kabri floor plan wipes without moving door anchors.
- Norma river-cover keeps its static `clip-path` and its SVG enters without overriding it.
- ShopOps plate stays at `0.32` figure opacity while its inner span enters.
- Legalexy panels clip-wipe while their anchors stay fixed; scan lines sweep inside the documents and disappear.
- Why Me point N appears when its node crosses `center 76%`; gaps are visibly non-uniform; scrolling up reverses.
- Footer links are focusable and become visible as they enter; no `visibility: hidden`.

### 7.4 Reduced motion

Enable `prefers-reduced-motion: reduce` in DevTools, reload.

Pass criteria:

- No `[data-motion-inner]` or `[data-motion-line]` elements exist.
- No inline transform/opacity/filter/clip-path from the motion layer remains.
- All sections, headings, artwork, and contact links are fully visible.
- The page scrolls normally with Lenis (its own reduced-motion option) and no ScrollTrigger scene motion.
- The thread still draws its static finished state per its own reduced-motion behavior.

### 7.5 Keyboard

1. Tab from the top before scrolling to the footer. Confirm focus never lands on a `visibility: hidden` element and focus outlines are visible.
2. Tab through footer email, LinkedIn, phone, copy buttons, call, WhatsApp, and back-to-top. Confirm order and activation unchanged.
3. Trigger focus-visible on footer links while the footer animation is in progress. Confirm no outline clipping from our wrappers/clip paths.
4. Confirm no heading text is removed from the accessibility tree.

### 7.6 Responsive

At `1440×900`, `1024×768`, `768×1024`, `425×850`, `375×812`, and `320×640`:

- No horizontal scrollbar.
- No element overflows its section because of motion.
- Every scene completes before its section leaves the viewport.
- Why Me points still reveal at their real node positions with non-uniform gaps.
- Footer links and back-to-top are visible by max scroll.
- Case artwork remains inside its article; no clipped title descenders.
- `svh` changes on mobile do not rebuild scenes or jump the page.

### 7.7 No CSS motion regression

- Search `app/globals.css` for `@keyframes` and new `transition` declarations; none added.
- Existing footer hover/focus transitions at the five known locations still work.
- No CSS `animation` property is added.
- No `overflow: hidden` added to a focusable ancestor.

---

## 8. Implementation sequence — tiny executable tasks

Each task is independently testable. Do not batch tasks. Stop and verify after each.

### T1 — Mount the motion skeleton

- Add `components/portfolio/motion/portfolio-motion.tsx` as a client component returning `null`.
- Import/render once in `app/page.tsx` inside `.portfolio`.
- At module scope on the client, register `ScrollTrigger` and `DrawSVGPlugin` once; configure `ignoreMobileResize`.
- Add the `useLenis` scroll bridge with cleanup.
- Add readiness gating (fonts + `site:ready`/preloader absence) and an empty matchMedia context.
- **Acceptance:** page renders identically, no console errors, no ScrollTrigger instances yet, no Lenis duplicate, dev server hot reload clean.

### T2 — Add motion utilities

- Create `motion-utils.ts` with:
  - wrapper registry and cleanup,
  - `maskLine`,
  - `maskExistingTitle`,
  - transform-safe guard,
  - small helpers for `fromTo` and trigger defaults.
- Do not call the utilities from any scene yet.
- **Acceptance:** no visual change, no DOM wrappers created, TypeScript/lint passes.

### T3 — Hero load entrance

- Build `scenes/hero.ts`.
- Add the hero load timeline exactly as §3.1A.
- No scroll exit yet.
- **Acceptance:** after preloader, lines wipe/blur/fade once; glyph anchors unchanged; reduced motion shows static hero; no wrapper on hero lines.

### T4 — Hero scroll exit + Work Flow heading/description

- Add hero `.hero-copy` opacity exit.
- Build `scenes/work-flow.ts` heading line wrapper reveal and description reveal.
- **Acceptance:** hero dims while leaving without moving anchors; work-flow h2 lines reveal individually; h2 anchor rect unchanged; reverse works.

### T5 — Work Flow labels

- Add per-label opacity/filter reveals.
- **Acceptance:** seven labels fade in as their own positions enter; no label transform; label anchor rects unchanged; reverse works.

### T6 — Capabilities

- Build `scenes/capabilities.ts`.
- Add heading line wrapper reveal, h3 fades, and per-`li` inner-span reveals.
- **Acceptance:** heading lines mask-reveal; h3/li anchors static; orbit and thread geometry unchanged; reverse works.

### T7 — Case scene helper + Kabri

- Build `case-scene.ts` with common trigger helpers and one scene exit helper.
- Build `case-kabri.ts` with all Kabri entrance/exit triggers.
- **Acceptance:** Kabri title/art/ledger reveal; floor-plan door anchors static; composition exit opacity only; no ScrollTrigger on `.case-studys`.

### T8 — Norma

- Build `case-norma.ts`.
- Preserve `.scan-paper-river-cover` static clip-path.
- **Acceptance:** ledger/paper sequence reveals; static figure opacities preserved; no anchor geometry changes; reverse works.

### T9 — ShopOps

- Build `case-shopops.ts`.
- Animate only inner spans/direct SVG/direct panel children.
- **Acceptance:** plate stays visually at `0.32` figure opacity; wallet/dashboard anchors static; paid-check detail works; reverse works.

### T10 — Legalexy

- Build `case-legalexy.ts`.
- Add document entrances, panel clip-wipes, direct-child staggers, and optional scan-line sweeps.
- **Acceptance:** all panel/document anchors static; scan lines stay inside their SVGs; reverse works; reduced motion leaves scan lines hidden as static.

### T11 — Why Me

- Build `scenes/why-me.ts`.
- Add header reveal and five independent node-anchored timelines.
- Use `center 76% → center 54%`, no global stagger, no thread events.
- **Acceptance:** each point reveals at its real node; gaps non-uniform; copy anchors static; reverse works.

### T12 — Conclusion + Footer

- Build `scenes/conclusion.ts` and `scenes/footer.ts`.
- Add heading line wrappers, personal/byline, statement/pull, item stagger, status/back-top.
- **Acceptance:** no anchor transforms; footer interactive elements remain focusable; back-to-top visible by page end; reverse works.

### T13 — Full verification and cleanup pass

- Run §7 at all viewports.
- Verify no thread/preloader/CSS/content diff.
- Verify `pnpm lint` and `pnpm build`.
- Verify no timers, RAF loops, duplicate listeners, or lingering wrappers after HMR/unmount.
- **Acceptance:** all §7 criteria pass; diff limited to the motion layer and page mount.

---

## 9. Definition of done

The work is complete only when all of the following are true:

- `app/page.tsx` mounts `PortfolioMotion` exactly once.
- All motion is inside `components/portfolio/motion`; no thread/preloader files changed.
- No CSS file changed; no keyframes/transitions added.
- No new dependencies, no second Lenis, no pinning, no scroller proxy, no duplicate ticker.
- Every scroll animation is scrubbed and reversible; hero load is the only time-based entrance.
- All thread anchor rects are unchanged within `0.5px` at every audited viewport.
- Document heights are unchanged; no `.pin-spacer`.
- Why Me points use their real nodes with non-uniform spacing; no `thread:anchor`.
- Reduced motion results in a fully static, fully visible page.
- Footer contact interactions, keyboard focus, and link behavior are unchanged.
- Lint and build pass.
- The final diff contains no content, SVG, design-token, section-layout, thread, or preloader changes.

---

## 10. Final build-agent instruction

Read this entire plan before touching the repository. Then read the repository `AGENTS.md` and the Next.js client-component guide (`node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` and `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`). Implement T1 through T13 in order, one task at a time. After each task, run its acceptance checks and stop if an anchor rect, document height, thread file, preloader file, or CSS rule changed unexpectedly.

Never inspect or modify `components/preloader/**` or `components/portfolio/thread/**`. Never transform an element carrying `data-thread-anchor` or an ancestor of one. Never use `thread:anchor`, `data-thread-progress`, `--kabri-progress`, `window.__threadDebug`, or the abandoned thread animation. Never add a second Lenis, a pin, a scroller proxy, a CSS keyframe, a transition, or a dependency. If a selector or layout assumption in this plan disagrees with the live DOM, preserve the invariants in §1.6 and §2.7 and adapt the selector rather than changing content or geometry.
