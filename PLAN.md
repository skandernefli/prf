# Phase 1 — Signature Preloader

## Goal

Implement the first phase of the portfolio clone: a full-screen signature preloader that draws the provided SVG signature, waits for critical page assets, and reveals the page with a curtain slide-up.

## Decisions

- Proceed without the `aesthetic-ui` skill.
- Do not add a dev-only replay button.
- Backdrop: `#050505`.
- Signature: `#f2efe6`.
- Pen dot: `#ff3b12`.
- Waiting cue: pulsing pen dot.
- Exit: overlay slides up like a curtain.
- Runs on full page loads only, not on client-side navigation.
- No replay API or replay control in Phase 1.

## Repo facts

- Next.js `16.4.3` App Router, React `19.3.0`, TypeScript strict, Tailwind v4, GSAP `3.15.0`, `@gsap/react` `2.1.2`, pnpm.
- `next.config.ts` has `cacheComponents: true` and `partialPrefetching: true`.
- `tsconfig.json` maps `@/*` to the repo root.
- `public/preloader-sig.svg`:
  - `viewBox="0 211 1642 493"`.
  - 10 `<path>` tags; the first has an empty `d` and invalid `stroke="##000"`.
  - 9 usable paths.
  - Keep the source file unchanged.
- Current `app/layout.tsx`, `app/page.tsx`, and `app/globals.css` are Next.js starter files and must be replaced/updated.

## Visual spec

- Full-screen fixed overlay, centered content.
- Signature width: `min(78vw, 760px)`.
- Signature color: `var(--foreground)` / `#f2efe6`.
- Pen dot: vermilion `#ff3b12`, radius approximately `8` SVG units, with a subtle glow.
- Overlay background: `#050505`.
- No extra text or branding in the overlay.
- Visually hidden status text: “Loading portfolio”.

## Architecture

- `PreloaderProvider` is a client component in the root layout.
- It owns the phase state: `"loading" | "exiting" | "ready"`.
- `PreloaderOverlay` is a client component that runs the GSAP drawing and exit animation.
- `usePageReady` waits for critical assets.
- `Signature` inlines the SVG paths for first-paint rendering.
- The overlay is present in the initial SSR HTML; do not dynamically import it client-only.
- Content stays behind the overlay. Scroll is locked and content is inert while loading.
- `site:ready` is dispatched after the exit completes.
- The context exposes `phase`, `isReady`, and `isExiting` for Phase 2.

## File-by-file

### 1. `components/preloader/signature.tsx`

Create a component that renders a `<g>` containing the 9 usable paths from `public/preloader-sig.svg`.

Requirements:

- Export `SIGNATURE_VIEWBOX = "0 211 1642 493"`.
- Export `Signature`.
- Omit the empty first path entirely.
- Preserve each path’s `d`, `strokeWidth`, `strokeLinecap`, and `strokeLinejoin`.
- Set `fill="none"` and `stroke="currentColor"` on the group.
- Add `data-signature-path` to every path.
- Do not include the pen dot here; the overlay owns it.
- Do not hand-copy the long path. Extract all paths with a temporary Node script in `/tmp`, filter out empty `d` values, and generate the JSX. The long path is truncated by normal file reads.

The overlay will render:

```tsx
<svg
  className={styles.signature}
  viewBox={SIGNATURE_VIEWBOX}
  aria-hidden="true"
  focusable="false"
>
  <Signature />
  <circle className={styles.penDot} data-signature-dot r="8" />
</svg>
2. components/preloader/preloader-context.tsx
Client context module.
export type PreloaderPhase = "loading" | "exiting" | "ready";

type PreloaderContextValue = {
  phase: PreloaderPhase;
  isReady: boolean;
  isExiting: boolean;
};
- Create the context and usePreloader().
- Throw a clear error if used outside the provider.
- No replay function.
3. components/preloader/use-page-ready.ts
Client hook used by the provider.
Wait for:
- window.load, or resolve immediately if document.readyState === "complete".
- document.fonts.ready when available.
- Critical images:
- img[data-preload]
- img[fetchpriority="high"]
- img[loading="eager"]
Rules:
- Use Promise.allSettled.
- Treat broken images as settled; do not block forever.
- Minimum visible time: 1200ms.
- Maximum wait: 10000ms.
- Do not wait for lazy below-the-fold images.
- Clean up all listeners and timers.
- Guard against setting state after unmount.
Return { ready }.
4. components/preloader/preloader-provider.tsx
Client component.
State:
- phase starts as "loading".
- mounted starts as false, then becomes true in an effect.
- assetsReady comes from usePageReady().
Callbacks:
- handleExitStart sets phase to "exiting"; use useCallback.
- handleExited sets phase to "ready" and dispatches new CustomEvent("site:ready"); use useCallback and guard against duplicate dispatch.
Render:
<PreloaderContext.Provider value={value}>
  {phase !== "ready" && (
    <PreloaderOverlay
      assetsReady={assetsReady}
      onExitStart={handleExitStart}
      onExited={handleExited}
    />
  )}
  <div
    style={{ display: "contents" }}
    inert={mounted && phase !== "ready" ? true : undefined}
    aria-busy={mounted && phase !== "ready"}
  >
    {children}
  </div>
</PreloaderContext.Provider>
Important:
- Do not SSR inert on the content. If inert is present in the initial HTML, no-JS users are locked out. Apply it only after mount.
- Scroll lock effect:
- Set document.documentElement.dataset.preloading = "true" while phase !== "ready".
- Remove it when phase === "ready" and on unmount.
- Memoize the context value.
- Keep callbacks stable.
5. components/preloader/preloader-overlay.tsx
Client component.
Props:
type Props = {
  assetsReady: boolean;
  onExitStart: () => void;
  onExited: () => void;
};
Setup:
- Register DrawSVGPlugin and useGSAP safely for SSR:
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, DrawSVGPlugin);
}
- Use useGSAP with scope: containerRef.
- Local state drawn starts false.
Drawing hook:
- Query [data-signature-path] and [data-signature-dot] inside the overlay.
- Set the SVG container visible with autoAlpha: 1.
- Use gsap.matchMedia():
- (prefers-reduced-motion: no-preference):
- Set paths to drawSVG: "0%".
- Set dot hidden initially.
- Measure each path with getTotalLength().
- Build a sequential timeline targeting total draw duration around 3.0s.
- Per-path duration proportional to length, minimum 0.12s.
- Ease power1.inOut.
- On each path tween update, compute path.getPointAtLength(progress * length) and set the dot’s cx/cy.
- Show the dot when drawing starts.
- On timeline complete, set drawn(true).
- (prefers-reduced-motion: reduce):
- Set paths to drawSVG: "100%".
- Place the dot at the end of the last path.
- Show the signature and dot.
- Set drawn(true) immediately.
- Return () => mm.revert().
Exit hook:
- Use a second useGSAP with dependencies [drawn, assetsReady].
- If !drawn, return.
- If !assetsReady:
- Skip pulsing when reduced motion is active.
- Otherwise start a yoyo/repeat pulse on the dot.
- Return a cleanup that kills the pulse.
- If assetsReady:
- Kill any pulse.
- Call onExitStart() once.
- Reduced motion: fade overlay out over 0.3s, then onExited().
- Normal motion:
- Fade the dot out over 0.25s.
- Slide the overlay with yPercent: -100, duration 0.9s, ease power3.inOut, delay 0.1s.
- Call onExited() on complete.
- Guard onExited so it cannot fire twice.
6. components/preloader/preloader.module.css
Include:
- .overlay: fixed inset, z-index, grid centering, dark background, cursor: progress, user-select: none, will-change: transform.
- .signature: width: min(78vw, 760px), height: auto, overflow: visible, opacity: 0 initially to prevent a full-signature flash before GSAP runs.
- .penDot: fill: var(--accent), opacity: 0, subtle drop shadow.
- .srOnly: visually hidden utility for the status text.
- Reduced-motion overrides if needed.
Do not rely on CSS animation for the main draw. GSAP owns it.
7. app/layout.tsx
- Keep LayoutProps<"/"> and the Geist font setup.
- Import PreloaderProvider.
- Wrap {children} in the provider.
- Add a <noscript> style block:
- Hide [data-site-preloader].
- Force html overflow back to auto.
- Update metadata:
- Title: Skander Nefli.
- Description: Portfolio of Skander Nefli.
- Keep the body layout classes.
8. app/globals.css
- Keep @import "tailwindcss"; and @theme inline.
- Switch to dark-only tokens:
:root {
  --background: #050505;
  --foreground: #f2efe6;
  --accent: #ff3b12;
  color-scheme: dark;
}
- Remove the prefers-color-scheme light/dark block.
- Set body background, foreground, and Geist font.
- Add:
html {
  scrollbar-gutter: stable;
}

html[data-preloading],
html:has([data-site-preloader]) {
  overflow: hidden;
}
- Add overscroll-behavior: none while locked if useful.
- Ensure the noscript override in layout.tsx wins over the :has scroll lock.
9. app/page.tsx
Replace the starter page with a minimal production-facing dark placeholder:
- Name: “Skander Nefli”.
- Short line: “Creative developer building immersive digital experiences.”
- Centered, full-height, no images.
- No replay button.
- Keep it simple so the preloader’s asset wait is dominated by fonts/window load and the signature animation.
Animation timeline
1. Overlay paints immediately with a dark background.
2. Signature paths are hidden by CSS until GSAP starts.
3. Paths draw sequentially, total around 3s.
4. Pen dot follows the active path tip.
5. If assets are not ready when drawing finishes, dot pulses.
6. When assets are ready and drawing is complete:
- Dot fades.
- Overlay slides up.
7. Overlay unmounts, scroll unlocks, content becomes interactive.
8. site:ready fires.
Readiness logic
- Start asset checks in parallel with the drawing.
- window.load + fonts + critical images.
- Min 1.2s, max 10s.
- Never block on lazy images.
- On timeout, proceed anyway.
Accessibility and no-JS
- Overlay: role="status" with visually hidden “Loading portfolio”.
- Inline SVG: aria-hidden="true".
- Content: inert and aria-busy only after hydration.
- Scroll lock via html[data-preloading] and html:has([data-site-preloader]).
- <noscript> hides the overlay and restores scrolling.
- Reduced motion: static signature, no pulse, short fade exit.
- No focusable elements inside the overlay.
Acceptance criteria
- On first full load, the overlay is visible immediately with no white flash and no full-signature flash.
- The 9 signature paths draw in sequence.
- The pen dot follows the path tip.
- The dot pulses only when assets outlast the drawing.
- The overlay slides up after both drawing and asset readiness complete.
- Content is not scrollable or interactive until the overlay exits.
- No hydration warnings.
- No scrollbar layout shift.
- Reduced-motion users see a static signature and a short fade.
- JS-disabled users see the page immediately and can scroll.
- site:ready fires once after exit.
- No replay button.
- pnpm lint passes.
- pnpm build passes.
Verification
Run:
pnpm lint
pnpm build
Manual checks if possible:
- Hard reload.
- Throttled network.
- Slow font/image.
- Reduced motion.
- JS disabled.
- Mobile viewport.
- Confirm no scroll during preload.
- Confirm no console errors.
- Confirm cleanup under React Strict Mode.
Out of scope
- Lenis smooth scrolling.
- ScrollTrigger.
- Hero entrance animation.
- Any Phase 2 sections.
- Dev replay control.
- Changes to public/preloader-sig.svg.