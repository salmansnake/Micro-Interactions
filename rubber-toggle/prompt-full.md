Build "Rubber Toggle" switches in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Settings switches whose knobs feel like rubber. Drag a knob and it follows your finger; pull past the end and it stretches instead of moving, then snaps back with a wobble when you let go. A tap squishes it before it flips.

BEHAVIOR
1. A card: "Notifications" (15px semibold) with "Tap a switch, or drag its knob past the end." (13/18 gray). Three rows, 10px above and below with 1px dividers: "Mentions" / "When someone tags you" (on), "Weekly digest" / "Every Monday at 9:00 AM", "Product news" / "A few times a year". Titles 14/20 semibold, details 13/18 gray, 2px apart.
2. Each switch: a 52 × 32px capsule track (gray off, the switch-on color when on: black in light, Aqua in dark) in a 44px-tall hit area, with a 26px round knob 3px inside it, so it travels 20px. The knob is the raised color when off and the card color when on, with a small shadow. role switch, aria-checked.
3. Dragging (after 3px of movement, with pointer capture) moves the knob with the pointer between the two ends, without any transition.
4. Past either end the knob stays at the end and stretches toward the pointer, from the end it's anchored to: scaleX = 1 + 0.5 × (1 − e^(−overshoot / 40px)), so it resists more the further you pull and never passes 1.5×.
5. Let go: it goes to the nearer side and snaps back to its normal size on the pop spring (680ms, a visible wobble).
6. A tap (or Enter or Space) flips the switch and squishes the knob as it goes (a separate scale, 1.25 × 0.88 at 30% of 320ms, on top of the move), landing on the pop spring.
Reduced motion: no squish; the knob moves in 120ms with no bounce.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: neutral grounds (Canvas #EBEBEB page, White #FFFFFF cards on it, Soft ground #F7F7F7 for insets inside a card; in dark the inset sits a step lighter than the card, so a panel that holds white cards, tiles or buttons takes the page ground there and they stay raised), Black #000 headlines, Slate #4E4E4E body text, Line #DDDDDD borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Text that wraps to two or three lines reads as one paragraph whose lines are close in length, with the first line the longest (narrow the text block until that holds; never a long line with one or two words below it). A row with a title and a detail line under it sets each line at its own size and line height (detail 13/18 or 12/16, not the body's 22px), 2px apart, with equal space above and below (at least 8px), so the text never presses against a divider. A card's padding is measured to what you see: text at the top edge trims to its capitals (text-box: trim-start cap alphabetic) and text at the bottom edge to its baseline (text-box: trim-end cap alphabetic), so the space above matches the space below. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders. A letter, initials or a number in a tile, avatar or count badge is centered on its capital height, not its line box (display: block; align-content: center; text-align: center; text-box: trim-both cap alphabetic), at a size whose capitals leave equal space above and below: 14px bold in tiles from 26 to 40px.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji. Every count uses the singular for one ("1 file", "1 second", "1 person"), including counts set by data attributes.
- This one: standard switch colors; the delight is all in the motion.

DELIVER
The component with the settings (name, detail, on or off) as input, the demo, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #686868  (dark: #A6A6A6)
--black: #000000
--border: #DDDDDD  (dark: #333333)
--card: #FFFFFF  (dark: #171717)
--duration-base: 200ms
--duration-reduced: 120ms
--duration-slow: 320ms
--ease-out: cubic-bezier(0.22, 0.9, 0.24, 1)
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F2F2F2)
--leading-body: 22px
--leading-small: 18px
--leading-ui: 20px
--lift: #FFFFFF  (dark: #424242)
--line: #DDDDDD  (dark: #333333)
--mist: #EBEBEB  (dark: #2D2D2D)
--muted: #EBEBEB  (dark: #2D2D2D)
--muted-foreground: #686868  (dark: #A6A6A6)
--radius-full: 9999px
--radius-xl: 16px
--raised: #FFFFFF  (dark: #424242)
--ring: #0B7573  (dark: #79EEEC)
--shadow-sm: 0 1px 2px rgba(17, 17, 17, 0.04), 0 1px 3px rgba(17, 17, 17, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--spring-pop: linear(0, 0.0413, 0.1464, 0.2895, 0.4487, 0.6073, 0.7529, 0.8776, 0.9776, 1.0517, 1.1013, 1.1292, 1.1394, 1.1357, 1.1225, 1.1033, 1.0813, 1.059, 1.0382, 1.0202, 1.0055, 0.9945, 0.9869, 0.9825, 0.9807, 0.9808, 0.9825, 0.985, 0.9881, 0.9912, 0.9941, 0.9967, 0.9989, 1.0005, 1.0017, 1.0024, 1.0027, 1.0027, 1.0025, 1.0022, 1)
--spring-pop-duration: 680ms
--switch-on: #000000  (dark: #79EEEC)
--text-body: 15px
--text-small: 13px
--text-ui: 14px
--white: #FFFFFF  (dark: #171717)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
