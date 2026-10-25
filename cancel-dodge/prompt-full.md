Build "Cancel, Eventually", a subscription cancel card in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Every product makes canceling hard. This one is honest about it: reach for Cancel and it swaps places with Keep My Plan, so your cursor lands on Keep instead. Five times. Then Cancel gets tired, everything walks home, and it lets you leave.

BEHAVIOR
1. A card: a small Aqua pill "Pro · $24/mo" (text vertically centered), the title "Cancel your subscription?", a guilt-trip line ("You'll lose 14 projects, your custom domain, and the 3 teammates who quietly depend on you."), a status line that starts as "No rush. We'll be right here." (in Outcraft Orange text: color-mix of Orange 20% with Orange 700, about #C25521 on light (4.6:1 on white), plain Orange #FE8C5F on dark; space reserved so nothing jumps), then two equal-width buttons on one line: a primary "Keep My Plan" on the left and a soft red "Cancel Subscription" on the right (danger-soft fill, danger-soft-foreground text, no border). On very narrow cards (under 340px) the label shortens to "Cancel".
2. The moment a mouse or pen pointer enters Cancel Subscription, the two buttons swap places on --spring-ui: Cancel runs left, Keep My Plan runs right, each leaning 5° into the run with a slight squash. Reach Cancel again and they swap back. Five swaps in total.
3. While they're moving, neither button responds: no hover, and clicks do nothing.
4. Each swap sets the status line, rising in on --spring-pop ("Whoa. Careful.", "Are you sure sure?", "We can talk about this.", "Think of the 3 teammates.", "Last chance to stay…") and Keep My Plan gives a tiny 3% pleading pulse.
5. After the fifth swap the status says "Fine. It's tired.", both buttons walk slowly back to their own places (twice the panel spring duration, ease-in-out, still unclickable), Cancel pants three times (a small vertical squash), and the status reads "Okay. It's all yours." From now on Cancel is a normal button: hover deepens its tint, and pressing it turns it solid red (danger fill, white text).
6. Clicking it then swaps the card to "Subscription canceled." with "Your Pro plan ends on November 23. Your 14 projects will be fine. Probably." and a Resubscribe button, which resets everything and says "Welcome back. We knew you would."
7. Keep My Plan, when it isn't moving: "Great choice. It was the only choice."
8. Touch: each tap on Cancel counts as an attempt and is swallowed until the fifth. Keyboard: Enter or Space counts as an attempt too, and focus travels with the button.
Reduced motion: no travel; both buttons blink out (120ms fade) and reappear swapped. No lean, pant or pulse.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Text that wraps to two or three lines reads as one paragraph whose lines are close in length, with the first line the longest (narrow the text block until that holds; never a long line with one or two words below it). A row with a title and a detail line under it sets each line at its own size and line height (detail 13/18 or 12/16, not the body's 22px), 2px apart, with equal space above and below (at least 8px), so the text never presses against a divider. A card's padding is measured to what you see: text at the top edge trims to its capitals (text-box: trim-start cap alphabetic) and text at the bottom edge to its baseline (text-box: trim-end cap alphabetic), so the space above matches the space below. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders. A letter, initials or a number in a tile, avatar or count badge is centered on its capital height, not its line box (display: block; align-content: center; text-align: center; text-box: trim-both cap alphabetic), at a size whose capitals leave equal space above and below: 14px bold in tiles from 26 to 40px.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji. Every count uses the singular for one ("1 file", "1 second", "1 person"), including counts set by data attributes.
- This one: Cancel is a soft red, never a loud solid red until it's finally pressed. The joke is the running, not the styling.

DELIVER
The component with the number of escapes and the status lines as inputs, the demo, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--aqua: #79EEEC
--aqua-100: #CFF8F6  (dark: #0E2E2D)
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #646A66  (dark: #A3A8A4)
--background: #FAFAF8  (dark: #0B0C0B)
--black: #000000
--border: #DCDED9  (dark: #313432)
--brand-subtle: #CFF8F6  (dark: #0E2E2D)
--brand-text: #0B7573  (dark: #79EEEC)
--canvas: #FAFAF8  (dark: #0B0C0B)
--card: #FFFFFF  (dark: #161817)
--danger: #ce2c31  (dark: #d4373c)
--danger-foreground: #ffffff
--danger-soft: color-mix(in srgb, #ce2c31 16%, transparent)  (dark: color-mix(in srgb, #d4373c 30%, transparent))
--danger-soft-foreground: #AC2529  (dark: #ff9592)
--danger-soft-hover: color-mix(in srgb, #ce2c31 22%, transparent)  (dark: color-mix(in srgb, #d4373c 38%, transparent))
--duration-fast: 140ms
--duration-instant: 80ms
--duration-reduced: 120ms
--duration-slower: 480ms
--ease-in-out: cubic-bezier(0.62, 0, 0.32, 1)
--ease-out: cubic-bezier(0.22, 0.9, 0.24, 1)
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F3F2EE)
--leading-body: 22px
--leading-small: 18px
--leading-title: 28px
--leading-ui: 20px
--line: #DCDED9  (dark: #313432)
--muted-foreground: #646A66  (dark: #A3A8A4)
--orange: #FE8C5F
--orange-700: #B5481A  (dark: #FE8C5F)
--press-scale: 0.97
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-full: 9999px
--radius-md: 8px
--radius-xl: 16px
--red-11: #ce2c31  (dark: #ff9592)
--ring: #0B7573  (dark: #79EEEC)
--shadow-sm: 0 1px 2px rgba(17, 17, 16, 0.04), 0 1px 3px rgba(17, 17, 16, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--soft-ground: #F3F2EE  (dark: #0C0D0C)
--spring-panel: linear(0, 0.0198, 0.069, 0.1356, 0.211, 0.2893, 0.3667, 0.4407, 0.5096, 0.5727, 0.6297, 0.6805, 0.7255, 0.765, 0.7995, 0.8294, 0.8552, 0.8774, 0.8964, 0.9127, 0.9265, 0.9382, 0.9482, 0.9566, 0.9637, 0.9696, 0.9746, 0.9788, 0.9824, 0.9853, 0.9878, 0.9899, 0.9916, 0.993, 0.9942, 0.9952, 0.996, 0.9967, 0.9973, 0.9978, 1)
--spring-panel-duration: 530ms
--spring-pop: linear(0, 0.0413, 0.1464, 0.2895, 0.4487, 0.6073, 0.7529, 0.8776, 0.9776, 1.0517, 1.1013, 1.1292, 1.1394, 1.1357, 1.1225, 1.1033, 1.0813, 1.059, 1.0382, 1.0202, 1.0055, 0.9945, 0.9869, 0.9825, 0.9807, 0.9808, 0.9825, 0.985, 0.9881, 0.9912, 0.9941, 0.9967, 0.9989, 1.0005, 1.0017, 1.0024, 1.0027, 1.0027, 1.0025, 1.0022, 1)
--spring-pop-duration: 680ms
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--spring-ui: linear(0, 0.0237, 0.0849, 0.1704, 0.2697, 0.3746, 0.4788, 0.5777, 0.6685, 0.7491, 0.8189, 0.8776, 0.9257, 0.9639, 0.9931, 1.0147, 1.0296, 1.0391, 1.0442, 1.046, 1.0451, 1.0425, 1.0387, 1.0342, 1.0294, 1.0246, 1.02, 1.0158, 1.012, 1.0087, 1.0059, 1.0037, 1.0019, 1.0005, 0.9994, 0.9987, 0.9982, 0.998, 0.9979, 0.9979, 1)
--spring-ui-duration: 460ms
--subtle: #F3F2EE  (dark: #0C0D0C)
--text-body: 15px
--text-caption: 12px
--text-small: 13px
--text-title: 20px
--text-ui: 14px
--tracking-title: -0.015em
--white: #FFFFFF  (dark: #161817)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
