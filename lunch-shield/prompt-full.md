Build a "Lunch Shield" calendar in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Accept a meeting that lands on your lunch and a sandwich steps out in front of it like a bouncer, holding the meeting just above the slot and asking whether it's worth a sandwich.

BEHAVIOR
1. A card. Top: the invite, "Vendor sync" (15px semibold) with "Jordan Lee · 30 min · Thu, Nov 5" (13/18 gray; "30 min" and "Nov 5" never split across lines). At the bottom, the status line "Jordan Lee invited you for 12:00 PM." (13/18 body gray) over a primary "Accept 12:00 PM" button (44px) at the right.
2. Below, the day from 11 AM to 2 PM in a gray inset (12px corners): six 32px half-hour slots, hour labels ("11 AM", "12 PM", "1 PM", 12px gray) at the left, and a 1px line at each hour after the first. Events start 56px from the left and keep their text at the top (their height is their duration): "Standup" 11:00–11:30 (gray, the fill for gray panels) and "Lunch" 12:00–1:00 PM (a Sage tint, with "12:00 – 1:00 PM" under the name in 12px Sage 700 text, held readable on the tint). Event names are 13/18 semibold.
3. Accept: the meeting appears as an Aqua block (black text, a soft shadow) at 12:00 and drops in from 40px above on the panel spring. After 380ms a 36px Sage circle with a black Lucide `sandwich` (20px) springs out over the right side of lunch and bobs twice (up 4px, tilted −8°), and the meeting stops 30px above its slot (in the free half hour before lunch, so the word Lunch stays visible) with a small wobble. The Accept button is disabled.
4. A row appears under the day: "That’s lunch. Is Vendor sync worth a sandwich?" (13/18 medium) and two equal buttons, "Move to 1:00 PM" (primary, focused) and "Eat Later" (gray).
5. Move to 1:00 PM: the meeting slides down to 1:00–1:30 on the controls spring; status "Booked Vendor sync at 1:00 PM. Lunch survives."
6. Eat Later: the meeting lands at 12:00 and the two share the hour side by side (the meeting on the left, lunch moved to the right half and faded to 55%), and the sandwich shrinks and turns away; status "Booked over lunch. The sandwich will wait. It always does."
7. The bottom block is always one line of text over its buttons, so the card keeps one height: the invite over Accept, the question over its two answers, the outcome over a gray "Undo" at the right, which puts everything back. Each text line is kept as tall as the longest of the four at the current width. The status is a polite live region.
Reduced motion: no drop, bob or wobble; blocks move in 120ms.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: neutral grounds (Canvas #EBEBEB page, White #FFFFFF cards on it, Soft ground #F7F7F7 for insets inside a card; in dark the inset sits a step lighter than the card, so a panel that holds white cards, tiles or buttons takes the page ground there and they stay raised), Black #000 headlines, Slate #4E4E4E body text, Line #DDDDDD borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Text wraps the standard way: it runs to the padding, or to the standard gap before a button, then breaks onto the next line; nothing narrows or balances it, and the last line is never a lone word. A row with a title and a detail line under it sets each line at its own size and line height (detail 13/18 or 12/16, not the body's 22px), 2px apart, with equal space above and below (at least 8px), so the text never presses against a divider. A card's padding is measured to what you see: text at the top edge trims to its capitals (text-box: trim-start cap alphabetic) and text at the bottom edge to its baseline (text-box: trim-end cap alphabetic), so the space above matches the space below. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders. A letter, initials or a number in a tile, avatar or count badge is centered on its capital height, not its line box (display: block; align-content: center; text-align: center; text-box: trim-both cap alphabetic), at a size whose capitals leave equal space above and below: 14px bold in tiles from 26 to 40px.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji. Every count uses the singular for one ("1 file", "1 second", "1 person"), including counts set by data attributes.
- This one: Sage belongs to lunch and its sandwich, Aqua to the new meeting.

DELIVER
The component with the invite, the lunch hour and the day's events as inputs, the demo, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #686868  (dark: #A6A6A6)
--black: #000000
--body: #4E4E4E  (dark: #CCCCCC)
--border: #DDDDDD  (dark: #333333)
--brand: #79EEEC
--brand-foreground: #000000
--card: #FFFFFF  (dark: #171717)
--duration-fast: 140ms
--duration-reduced: 120ms
--duration-slow: 320ms
--ease-in-out: cubic-bezier(0.62, 0, 0.32, 1)
--fill-on-subtle: color-mix(in oklab, #EBEBEB 95%, #000000)  (dark: #2D2D2D)
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F2F2F2)
--leading-body: 22px
--leading-caption: 16px
--leading-small: 18px
--line: #DDDDDD  (dark: #333333)
--mist: #EBEBEB  (dark: #2D2D2D)
--mist-strong: #E2E2E2  (dark: #363636)
--muted: #EBEBEB  (dark: #2D2D2D)
--muted-foreground: #686868  (dark: #A6A6A6)
--muted-hover: #E2E2E2  (dark: #363636)
--on-chart: #000000
--press-scale: 0.97
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-lg: 12px
--radius-md: 8px
--radius-sm: 6px
--radius-xl: 16px
--ring: #0B7573  (dark: #79EEEC)
--sage: #99AD88
--sage-700: #4F6340  (dark: #B4C5A4)
--shadow-md: 0 2px 4px -1px rgba(17, 17, 17, 0.05), 0 6px 14px -3px rgba(17, 17, 17, 0.09)  (dark: 0 2px 4px -1px rgba(0, 0, 0, 0.45), 0 6px 14px -3px rgba(0, 0, 0, 0.45))
--shadow-sm: 0 1px 2px rgba(17, 17, 17, 0.04), 0 1px 3px rgba(17, 17, 17, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--slate: #4E4E4E  (dark: #CCCCCC)
--soft-ground: #F7F7F7  (dark: #1F1F1F)
--spring-panel: linear(0, 0.0198, 0.069, 0.1356, 0.211, 0.2893, 0.3667, 0.4407, 0.5096, 0.5727, 0.6297, 0.6805, 0.7255, 0.765, 0.7995, 0.8294, 0.8552, 0.8774, 0.8964, 0.9127, 0.9265, 0.9382, 0.9482, 0.9566, 0.9637, 0.9696, 0.9746, 0.9788, 0.9824, 0.9853, 0.9878, 0.9899, 0.9916, 0.993, 0.9942, 0.9952, 0.996, 0.9967, 0.9973, 0.9978, 1)
--spring-panel-duration: 530ms
--spring-pop: linear(0, 0.0413, 0.1464, 0.2895, 0.4487, 0.6073, 0.7529, 0.8776, 0.9776, 1.0517, 1.1013, 1.1292, 1.1394, 1.1357, 1.1225, 1.1033, 1.0813, 1.059, 1.0382, 1.0202, 1.0055, 0.9945, 0.9869, 0.9825, 0.9807, 0.9808, 0.9825, 0.985, 0.9881, 0.9912, 0.9941, 0.9967, 0.9989, 1.0005, 1.0017, 1.0024, 1.0027, 1.0027, 1.0025, 1.0022, 1)
--spring-pop-duration: 680ms
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--spring-ui: linear(0, 0.0237, 0.0849, 0.1704, 0.2697, 0.3746, 0.4788, 0.5777, 0.6685, 0.7491, 0.8189, 0.8776, 0.9257, 0.9639, 0.9931, 1.0147, 1.0296, 1.0391, 1.0442, 1.046, 1.0451, 1.0425, 1.0387, 1.0342, 1.0294, 1.0246, 1.02, 1.0158, 1.012, 1.0087, 1.0059, 1.0037, 1.0019, 1.0005, 0.9994, 0.9987, 0.9982, 0.998, 0.9979, 0.9979, 1)
--spring-ui-duration: 460ms
--subtle: #F7F7F7  (dark: #1F1F1F)
--text-body: 15px
--text-caption: 12px
--text-small: 13px
--text-ui: 14px
--tint-c: 0.4  (dark: 0.45)
--tint-ink-l: 0.48  (dark: 1)
--tint-ink-min: 0  (dark: 0.75)
--tint-l: 0.92  (dark: 0.32)
--white: #FFFFFF  (dark: #171717)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
