# Case Study Content Redesign — Implementation Plan

## 0. Purpose and non-negotiable rules

Redesign only the case-study content experience in `components/case-studies/shared`. Use `Group 7.png` and `Group 8.png` as references for composition and interaction, while preserving the portfolio's existing design system.

The case-study hero and existing MDX content architecture are already working. Preserve them unless repository inspection proves a narrowly scoped change is essential.

Rules:
1. Inspect relevant code, styles, MDX structure, app layout, package scripts, installed GSAP version/plugins, responsive breakpoints, and design tokens before editing.
2. Inspect `.agents` and read applicable design/frontend/animation/accessibility skills, including `taste` if it exists. Do not assume a skill exists.
3. Treat the screenshots as references for layout and behavior, not for copying their typography, colors, spacing, borders, radii, or brand styling.
4. Reuse existing components, tokens, utilities, MDX integration, GSAP setup, and conventions. Do not rebuild the architecture.
5. Do not rewrite the hero, unrelated website sections, or case-study narratives.
6. Do not invent project facts, metrics, diagrams, images, or technology details. Use existing assets/content or clearly identified placeholders where explicitly allowed.
7. Do not add dependencies when the installed stack can implement the requirement.
8. Do not guess where the repository provides an answer. Record actual findings and explain any necessary small extension.
9. Complete implementation, validation, and visual inspection; do not stop at a plan or static mockup.
10. Avoid routine clarification questions. Resolve non-blocking details from the repository and references.

## 1. Scope

### Included
- Shared case-study content under `components/case-studies/shared`.
- Existing content components as relevant: `CaseStudyChapter`, `CaseStudySection`, `CodeExcerpt`, `DecisionNote`, `ImpactLedger`, `ProcessFlow`, `ProjectTimeline`, `PullStatement`, `SystemMap`, and `TechnologyStack`.
- MDX-to-content/navigation composition.
- Desktop sticky/pinned split-screen experience.
- Active navigation expansion and Go Up / Go Down controls.
- Mobile stacked layout.
- Responsive styling, accessibility, reduced-motion behavior, GSAP lifecycle and cleanup.

### Excluded
- Redesigning the case-study hero/header, except for the hand-off into the content section.
- Replacing MDX or rewriting case-study content.
- Unrelated portfolio sections or broad refactors.
- New animation/smooth-scroll frameworks.

## 2. Required reconnaissance

Before implementation, inspect and record:

### Existing architecture
- Shared content component implementations and exports.
- How `KabriPage` and other case-study pages import and render MDX.
- How top-level sections, headings, IDs, nested sections, and component children are represented.
- Existing server/client component boundaries.
- Relevant page layout, ancestor overflow, transforms, and stacking contexts.

### Design system
Inspect actual tokens and conventions for:
- Color roles, light/dark surfaces, themes.
- Font families, type scale, weights, line heights, letter spacing.
- Spacing, grid/container rules, borders, dividers, radii, shadows.
- Buttons, icons, focus/hover/active states.
- Responsive breakpoints and motion conventions.

Read applicable `.agents` skills for design quality, visual judgment, frontend implementation, animation, and accessibility. Apply the actual `taste` skill if present.

The final result must feel native to this portfolio. Preserve the reference's split composition, intro state, active-row expansion, and controlled navigation concept, but translate them into the portfolio's own visual language.

### GSAP and tooling
- Confirm installed GSAP version and whether ScrollTrigger is available.
- Follow existing plugin registration and animation initialization patterns.
- Check for an existing smooth-scroll implementation or custom scroll container.
- Confirm sticky positioning is not broken by ancestor CSS.
- Identify actual lint, typecheck, test, and build scripts from `package.json`.

Record concrete findings in this plan before coding: relevant files, MDX section model, tokens, breakpoints, GSAP setup, validation commands, and discovered constraints.

## 3. Experience model

There are two responsive modes:

- Desktop/tablet: pinned full-viewport scene with two equal columns.
- Mobile: normal vertical document flow; no desktop pinning or split-screen navigation.

The existing hero remains above the new experience. When the user scrolls past the hero and the content region reaches the viewport top, the content scene takes over.

### Desktop layout
- Left 50%: actual content for the active item, using the portfolio's light-theme treatment.
- Right 50%: navigation and active-item presentation, using the portfolio's dark-theme treatment.
- Use viewport-aware sizing and existing site layout conventions.
- Avoid horizontal overflow, arbitrary fixed dimensions, or styling that conflicts with the design system.
- Make both sides read as one intentional composition.

### Pinned behavior
- Pin the scene at the top when it reaches the top after the hero.
- While pinned, scroll progression moves through the items in order.
- Release naturally after the final item; do not trap the user.
- Reverse scrolling moves back through the same sequence and returns naturally toward the hero.
- Pin duration is derived from the actual number of MDX-derived items, never a hardcoded chapter count.
- Use GSAP/ScrollTrigger where needed. Content must remain usable if animation initialization fails.

### Item sequence
- Item 0 is a shared introductory state.
- Items 1 onward are actual top-level MDX content sections, in document order.
- Item 0 is not an MDX chapter and must not require authors to add a fake chapter.
- Use existing intro metadata/assets if present. Otherwise use only clearly identified placeholders permitted by the brief; do not invent project facts or use unrelated imagery.

## 4. Item 0 — introductory state

Follow the composition of `Group 8.png`, adapted to the portfolio's design system.

Right side:
- Display an introductory title and paragraph.
- Treat this as navigation Item 0.
- Use the portfolio's typography, colors, spacing, and surfaces.
- Do not add unrelated marketing copy or features.

Left side:
- Display a photograph/visual.
- Prefer an existing relevant case-study asset.
- If none exists, use a clearly identified temporary placeholder, not unrelated imagery.
- Preserve aspect ratio and existing image treatment.

Forward scrolling transitions from Item 0 to Item 1. The transition should be controlled and deliberate; reverse scrolling must reverse it coherently.

## 5. Items 1 onward — MDX navigation

### Data and structure
- Derive items from the actual MDX top-level section structure.
- Preserve existing section order.
- Use existing titles and IDs wherever available.
- Do not hardcode Kabri-specific titles, IDs, counts, or navigation.
- Nested content remains inside its parent unless the current MDX architecture explicitly defines it as top-level.
- Follow the project's existing ID/slug convention if an ID is missing.
- Do not create a competing slug system.

### Stable navigation
- Navigation items remain in stable positions; the entire list must not continuously drift with small scroll changes.
- Active state changes discretely as progression advances.
- If the active item is outside the visible navigation area, adjust the list only enough to reveal it.
- Do not reposition the list unnecessarily when the active item is already visible.
- The active item, its expanded area, and the left content must always refer to the same section.

### Expanded active item
- The active navigation item expands to reveal an inset/open area associated with it, following `Group 7.png`.
- Inactive items remain compact.
- The expanded area may contain relevant section details or a centered explanatory diagram only when supported by existing content.
- Never fabricate diagrams, metrics, or claims.
- If no supplemental detail exists, use an intentional restrained treatment based on available section title/summary.
- Animate expansion/collapse using the site's motion conventions.
- Prevent expanded content from hiding the active item or controls.

### Left-side content
- Display the actual existing MDX-rendered content for the active section.
- Reuse the existing React content; do not duplicate it into a separate manually maintained data structure.
- Existing content components (timelines, process flows, ledgers, code excerpts, system maps, technology stacks, decision notes, pull statements, etc.) must continue to render.
- Preserve content meaning, order, and hierarchy.
- Keep long content readable and accessible. Never clip it or shrink text excessively to force it into one viewport.

## 6. Scroll and manual navigation

Implement one coherent progression model. Scroll and buttons must not create competing state systems.

### Scroll
- Enter at Item 0.
- Forward scroll advances through Item 1, Item 2, and subsequent sections in order.
- Reverse scroll returns through the same items.
- Prevent skipped items, threshold oscillation, and unpredictable active-state changes.
- Keep active navigation, expanded panel, and left content synchronized.
- Calculate pin duration from the actual item count.
- At the final item, release the pin and continue down the page.
- At Item 0, reverse scrolling leaves the pinned scene naturally toward the hero.

### Go Up / Go Down
- Show controls starting at Item 1; they are hidden in Item 0.
- Go Down advances one item; Go Up returns one item.
- Clearly disable or represent unavailable directions at sequence boundaries.
- Buttons use the same progression/state model as scrolling.
- Use accessible buttons with visible focus states and meaningful names.
- Do not obscure content or navigation.

### GSAP lifecycle and conflicts
- Use existing GSAP/ScrollTrigger registration conventions.
- Scope animations to the component/root.
- Clean up/revert triggers, timelines, and listeners on unmount and before rebuilding.
- Avoid duplicate triggers/listeners under React Strict Mode.
- Avoid state updates after unmount.
- Recalculate when content, fonts, images, or viewport changes affect measurements.
- Do not add another smooth-scrolling library, competing wheel listeners, or a scroll trap.
- Rebuild cleanly when crossing the desktop/mobile breakpoint.
- Preserve browser navigation, anchors, and ordinary scrolling.

## 7. MDX compatibility and automatic sizing

- Derive the number of navigation items from the existing MDX structure.
- Item 0 is supplied by the shared presentation layer.
- Each top-level MDX section becomes one item after Item 0.
- Navigation labels and IDs come from existing metadata/conventions.
- Render the existing MDX output; do not maintain duplicate content arrays.
- Pin duration and navigation adapt to the actual item count.
- Support case studies with few or many sections and unusually long sections.
- Missing optional metadata must not crash rendering.
- Do not assume Kabri's current chapter count or wording.
- Preserve current MDX authoring ergonomics; if metadata changes are essential, make the smallest change and document it.

## 8. Mobile layout

Do not use desktop split-screen or pinned scrolling on mobile.

Use normal vertical flow for each section:
1. Navigation item/section heading.
2. Its expanded detail area directly underneath.
3. Actual section content directly underneath.
4. Then the next section in document order.

Also:
- Keep the relationship between each heading, details, and content clear.
- Do not use a separate fixed half-screen navigation panel.
- Do not pin the content scene.
- Normal touch scrolling is sufficient; no Go Up/Go Down controls are required.
- Keep relevant detail/diagram directly under its corresponding item.
- Use existing mobile typography, spacing, and touch-target conventions.
- Prevent horizontal overflow.
- Do not depend on ScrollTrigger to reveal mobile content.
- Use the repository's established breakpoint.

## 9. Design-system mapping

Translate the references into the real design system:

| Reference concept | Required implementation |
|---|---|
| Two equal panels | Existing grid/layout conventions; preserve 50/50 desktop split |
| Light content side | Existing light-theme surface/text tokens |
| Dark navigation side | Existing dark-theme surface/text tokens |
| Introductory heading | Existing display/heading scale |
| Compact navigation rows | Existing typography, spacing, and divider conventions |
| Expanded active item | Existing surface, border, and motion language |
| Go Up / Go Down | Existing button and icon conventions |
| Photograph/visual | Existing image and asset conventions |
| Active/inactive states | Existing contrast and interaction conventions |

Do not introduce arbitrary colors, fonts, spacing, radii, or shadows when equivalent tokens exist. Do not copy the references' exact visual style.

## 10. Accessibility, motion, and resilience

- Preserve semantic headings and document order.
- Use buttons for actions and links only for destinations.
- Support keyboard operation and visible focus.
- Maintain sufficient contrast in both visual themes.
- Do not communicate active state through color alone.
- Respect `prefers-reduced-motion`; remove/minimize nonessential movement while keeping every section accessible.
- Do not rely on hover alone.
- Use meaningful alt text for informative images and empty alt for decorative images.
- Avoid layout shifts.
- If GSAP fails, content remains available in a readable non-hidden flow.
- Browser back/forward, normal scrolling, and keyboard navigation must remain usable.

## 11. Implementation sequence

1. Inspect architecture, MDX, design system, `.agents` skills, GSAP, and validation scripts.
2. Record actual findings and constraints in this plan.
3. Define MDX-to-section mapping without duplicating content.
4. Implement semantic/static structure first.
5. Implement desktop split composition and Item 0.
6. Implement active navigation expansion and left content.
7. Implement dynamic GSAP pinning/progression.
8. Implement synchronized Go Up/Go Down controls.
9. Implement mobile stacked flow without pinning.
10. Implement accessibility, reduced-motion, and fallback behavior.
11. Test Kabri and another case study if available.
12. Run checks and inspect the rendered result at desktop and mobile sizes.

## 12. Acceptance criteria

### Visual
- [ ] Content no longer looks like a conventional unstyled blog post.
- [ ] Desktop has equal-width columns.
- [ ] Left side uses portfolio light-theme tokens; right side uses portfolio dark-theme tokens.
- [ ] Item 0 follows Group 8's composition; active content items follow Group 7's expanded-row concept.
- [ ] Final styling is native to the portfolio design system.
- [ ] Active item expands; inactive items remain compact.
- [ ] MDX content is readable and not clipped.

### Interaction
- [ ] Scene pins when it reaches the viewport top after the hero.
- [ ] Initial state is Item 0.
- [ ] Forward/reverse scrolling traverses all items in order.
- [ ] Navigation and content remain synchronized.
- [ ] Navigation positions remain stable except to reveal an off-screen active item.
- [ ] Go Up/Go Down appear from Item 1 and work.
- [ ] Pin releases after the final item; no scroll trap.
- [ ] Resize does not leave stale triggers or broken state.

### MDX
- [ ] Items are generated from MDX.
- [ ] No case-study-specific navigation/count is hardcoded in shared components.
- [ ] Item 0 is shared presentation, not a fake MDX chapter.
- [ ] Existing MDX content components still render.
- [ ] Another case study with a different number of sections works without custom navigation code.

### Mobile
- [ ] Normal vertical flow.
- [ ] Heading, expanded details, then actual content.
- [ ] No desktop pinning or split-screen panel.
- [ ] Natural touch scrolling and no horizontal overflow.

### Quality
- [ ] GSAP cleanup is correct.
- [ ] Reduced-motion and keyboard/focus behavior are supported.
- [ ] Lint/typecheck/tests/build pass where available, or pre-existing failures are clearly distinguished.
- [ ] No unintended changes to the hero or unrelated sections.

## 13. Final report

Report:
1. What was implemented.
2. Files changed and why.
3. How MDX sections are discovered/mapped.
4. Desktop pinning, progression, and manual navigation behavior.
5. Mobile behavior.
6. Design tokens and `.agents` skills used.
7. Validation commands and actual results.
8. Remaining genuine limitations.

Never claim a check passed unless it was actually run.
