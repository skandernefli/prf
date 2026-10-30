Plan for the build agent
1. Signature color
- In components/preloader/preloader.module.css, add color: var(--accent); to .signature.
- --accent is already #ff3b12 in app/globals.css.
- Keep signature.tsx unchanged: its <g stroke="currentColor"> will inherit the new color.
- Keep the pen dot vermilion for now. Note that it will match the signature; if you want contrast, switch .penDot to var(--foreground).
2. Full-bleed left, vertically centered
- Change .overlay from display: grid; place-items: center; to:
- display: flex
- align-items: center
- justify-content: flex-start
- padding-right: var(--preloader-edge-gap)
- Define --preloader-edge-gap: clamp(16px, 2vw, 32px) on .overlay.
- Change .signature from width: min(78vw, 760px) to width: 100%; max-width: none;.
- Keep height: auto, opacity: 0, display: block, and overflow: visible.
- Result: the SVG starts at the left edge, fills the width minus the right gap, and stays vertically centered.
- No viewBox change is needed: measured visual bounds are roughly x = -0.15..1639.77 inside the 0..1642 viewBox, so the left is effectively flush and the right whitespace is only ~0.14% of the width.
3. Keep unchanged
- Do not change the drawing sequence, pen-dot tracking, readiness logic, exit animation, state machine, or accessibility behavior.
- Treat this as an override to the visual spec in PLAN.md; optionally update those lines so the plan stays accurate.
4. Verification
- Run pnpm lint and pnpm build.
- Check at desktop and mobile sizes:
- Signature computed color is rgb(255, 59, 18).
- SVG left edge is at 0; right edge is viewport width minus the gap.
- SVG vertical center matches viewport center.
- No horizontal overflow.
- Preloader still draws, exits, fires site:ready once, and logs no console errors.
- Recheck reduced motion and the JS-disabled fallback.
Defaults: keep the pen dot vermilion and use a responsive 16–32px right gap. Say if you want a different dot color or an exact gap value