# BUILD AGENT PROMPT — Implement the Case Study Content Redesign

Read `plan.md` completely. It is the detailed implementation contract and source of truth for this task.

## Context and scope

We are redesigning **only the case-study content section** in `components/case-studies/shared`. The existing case-study hero and MDX content system already work. Do not redesign the hero, replace MDX, or refactor unrelated parts of the site.

The shared content exports include:
- `CaseStudyChapter`
- `CaseStudySection`
- `CodeExcerpt`
- `DecisionNote`
- `ImpactLedger`
- `ProcessFlow`
- `ProjectTimeline`
- `PullStatement`
- `SystemMap`
- `TechnologyStack`

A case-study page currently composes the hero and MDX content (for example, `KabriPage` imports `KabriContext` and `KabriEngineering` and renders them inside `CaseStudyChapter`). Preserve the existing authoring model and component behavior wherever possible.

## Visual references

Inspect the attached:
- `Group 8.png`: initial introductory state, Item 0.
- `Group 7.png`: active navigation item with expanded/open area, Item 1 onward.
- Current localhost case-study screenshot: existing appearance being replaced.

Use the Group screenshots for composition and interaction only. **Do not copy their styling literally.** The finished result must use the portfolio's actual design system.

## Inspect before deciding

Before editing:
1. Inspect shared case-study components and styles.
2. Trace MDX rendering and how top-level sections, titles, IDs, and nested content are represented.
3. Inspect actual design tokens: colors/themes, typography, spacing, surfaces, borders, buttons, icons, breakpoints, and motion conventions.
4. Inspect `.agents`; read relevant design, taste (if present), frontend, animation, and accessibility skills. Do not assume a skill exists.
5. Inspect installed GSAP version, ScrollTrigger availability, registration, initialization, and cleanup conventions.
6. Inspect relevant page layout and ancestor CSS for sticky/overflow/transform constraints.
7. Inspect `package.json` and identify actual lint, typecheck, test, and build commands.

Do not guess where the repository contains the answer. Record actual findings in `plan.md`.

## Required experience

### Desktop

Create a pinned, full-viewport content scene that starts when the content region reaches the top after the existing hero. Split it into two equal columns:

- **Left 50%:** actual active case-study content, using portfolio light-theme tokens.
- **Right 50%:** navigation and active-section presentation, using portfolio dark-theme tokens.

Use existing typography, color, spacing, border, surface, and control conventions. Make the panels feel like one intentional composition.

### Item 0 — introduction

Follow `Group 8.png`'s composition:
- Right side: introductory title and paragraph.
- Left side: photograph/visual.
- Prefer existing relevant case-study assets and metadata.
- If suitable content/assets do not exist, use clearly identified temporary placeholders only. Never invent case-study facts or use unrelated imagery.
- Item 0 belongs to the shared presentation layer. It is not an MDX chapter and must not require a fake MDX chapter.

### Item 1 onward — actual MDX sections

As the user scrolls forward, transition to Item 1, the first actual top-level MDX content section, then continue in MDX order.

- Generate navigation from the existing MDX section/component structure.
- Use existing titles and IDs/conventions.
- Never hardcode Kabri-specific titles, IDs, section counts, or nav arrays.
- Do not duplicate MDX content into a manually maintained data structure.
- Left side renders the actual active section content.
- Right side shows its navigation item and expanded active presentation.

Use `Group 7.png` as the reference for the active item expanding to reveal an inset/open area. Inactive items remain compact. Supplemental details or a centered diagram are allowed only when supported by existing content. Never fabricate diagrams, metrics, or claims.

### Stable navigation and controls

Navigation items keep stable positions; the whole list must not drift continuously with small scroll changes. Active state changes discretely as progression advances. If the active item is outside the visible navigation area, adjust the list only enough to reveal it; otherwise do not move the list.

The active item, expanded detail area, and left-side content must always be synchronized.

- Enter at Item 0.
- Forward scroll advances one item at a time through all MDX sections.
- Reverse scroll returns through the same items.
- Prevent skipped items and threshold oscillation.
- Show **Go Up** and **Go Down** starting at Item 1; hide them at Item 0.
- Go Down advances one item; Go Up returns one item.
- Clearly disable/represent unavailable directions at sequence boundaries.
- Button navigation and scroll navigation share one progression/state model.
- Pin duration is derived from the actual item count.
- Release the pin after the final item; never trap page scrolling.
- At Item 0, reverse scrolling leaves the scene naturally toward the hero.

Use existing GSAP/ScrollTrigger setup. Do not add another smooth-scroll library, competing wheel handlers, or a second scrolling system. Scope animations to the component, clean up triggers/timelines/listeners, handle React Strict Mode, and rebuild cleanly on resize/breakpoint changes.

### MDX and automatic behavior

Each actual top-level MDX section maps to one item after Item 0. Preserve document order and use existing titles/IDs. Nested content stays within its parent unless the existing MDX architecture explicitly marks it as top-level. Render existing MDX output rather than duplicating it. Dynamic item count, navigation, and pin duration must work for any case study and any section count. Missing optional metadata must not crash rendering.

### Mobile

Do not use the desktop split-screen or pinned interaction on mobile. Use normal vertical flow for each section:

1. Navigation item/section heading.
2. Its expanded detail area directly underneath.
3. Actual section content directly underneath.
4. Then the next section.

No fixed half-screen navigation panel, no pinning, and no requirement for Go Up/Go Down controls. Normal touch scrolling must work. Use the repository's established mobile breakpoint and design tokens.

### Accessibility and resilience

Preserve semantic headings and document order. Use accessible buttons, meaningful names, visible focus states, keyboard support, sufficient contrast, and active-state cues beyond color alone. Respect `prefers-reduced-motion`. Do not rely on hover alone. Prevent horizontal overflow. Keep long content readable and never clip it. If GSAP fails to initialize, content remains available in a readable flow. Preserve browser navigation and ordinary scrolling.

## Quota-efficient execution without quality compromise

Work efficiently, but do not reduce implementation, testing, accessibility, or visual quality.

- Do one focused reconnaissance pass; inspect relevant files and follow dependencies only when needed.
- Read `plan.md` and applicable `.agents` skills carefully once; do not repeatedly reread them.
- Record a concise, evidence-based implementation checklist in `plan.md`, then proceed. Do not spend multiple turns narrating plans.
- Reuse existing components, tokens, utilities, and patterns.
- Make cohesive edits rather than many speculative micro-edits or repeated rewrites.
- Avoid broad repository scans after the architecture is understood; use targeted searches.
- Do not ask for routine confirmation. Resolve non-blocking details from code and references.
- Do not add dependencies or abstractions without a demonstrated need.
- Do not add speculative features or unrelated polish.
- Use targeted checks during development; run the relevant final validation suite after implementation is coherent.
- Do not skip final validation or visual inspection to save quota.
- Open and inspect the rendered result at desktop and mobile sizes before claiming visual verification.
- Distinguish pre-existing failures from failures introduced by your changes.
- Keep `plan.md` updated with real findings/status, not a diary of trivial actions.

**Efficiency means fewer redundant searches, explanations, and retries — never a weaker solution.**

## Required implementation order

1. Inspect architecture, MDX, design system, `.agents` skills, GSAP, and validation scripts.
2. Record actual findings/constraints in `plan.md`.
3. Define MDX-to-section mapping without duplicated content.
4. Implement semantic/static structure.
5. Implement desktop split composition and Item 0.
6. Implement active navigation expansion and left content.
7. Implement dynamic GSAP pinning/progression.
8. Implement synchronized Go Up/Go Down controls.
9. Implement mobile stacked flow without pinning.
10. Implement accessibility, reduced-motion, and fallback behavior.
11. Test Kabri and another case study if available.
12. Run final checks and inspect the rendered result.

## Definition of done

Do not stop at a plan, mockup, or partial implementation. The task is complete only when the desktop pinned scene works from Item 0 through the final MDX section and releases correctly; scroll and buttons stay synchronized; navigation is generated dynamically; existing MDX components still render; mobile is stacked and unpinned; design matches the portfolio system; GSAP cleanup/accessibility/fallbacks are addressed; and relevant checks have actually been run.

## Final report

Report what was implemented, files changed, MDX mapping, desktop behavior, mobile behavior, design tokens/skills used, validation commands and actual results, and any genuine remaining limitations. Be concise in the report; make the implementation complete and thoroughly checked.
