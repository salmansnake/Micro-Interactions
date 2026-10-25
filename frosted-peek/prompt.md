Build a "Frosted Peek" locked-feature preview in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
A premium chart sits under frost. Hovering or dragging across it opens a clear window that follows the pointer, so people can read real numbers month by month before they upgrade. Upgrading clears the frost completely.

LAYOUT
- Header: eyebrow "Revenue Forecast", the 12-month total blurred (filter: blur(7px)), and an Aqua-tinted "Pro" badge.
- Chart: 200px tall, 12px corners, an area + line chart of 12 monthly values with month labels and three faint grid lines at a quarter, half and three quarters of the plot's height (four equal bands down to the baseline), each point centered over its month; the line, area and grid lines start at the first month's point and end at the last, never touching the chart's edges (the frost's blur repeats edge pixels, so a line reaching the edge would show through). The chart box is a soft neutral inset, just visible against the card, with no Aqua in it: the inset gray (Soft ground in light, the dark inset in dark) mixed 40% toward the card. The area under the line is a soft Aqua: the Aqua tint at OKLCH L 0.88 in light and 0.32 in dark (keeping 40% / 45% of Aqua's chroma), mixed 15% toward the box color, so it is a clear step from the box and quieter than the line; month labels use the muted gray.
- Footer: "Forecasts are part of Pro. Peek at any month for free." and a filled "Unlock Forecasts" button. The note is capped at about 30 characters wide, so each of its two-sentence messages reads as a short two-line paragraph beside the button, never one long line.

THE FROST
- An overlay with backdrop-filter: blur(8px) saturate(160%) and a 38% surface tint covers the chart.
- Cut a soft vertical window into it with a mask: linear-gradient(to right, black up to x − w − 14px, rgba(0,0,0,1 − o) from x − w to x + w, black from x + w + 14px).
- Register x (length), w (length) and o (number) with @property so they animate: o opens and closes the window with the ui spring (460ms), x follows the pointer over 140ms (the fast duration, linear), w is 40px and opens to the full width on unlock with the panel spring (530ms).

THE LENS
- A Frost frame marks the window: 12px radius (never rounder than the 12px chart it slides inside), a 1px bright inner edge and a soft shadow, fading and scaling in with o.
- Inside it: a pill label at the top in the text color (black with white text in light, off-white with dark text in dark; 12px semibold tabular numbers, "Mar · $48.2k"), a 10px dot in the primary color (black in light, Aqua in dark) with a 3px ring of the card color, riding the line at the current month and springing to each new value on the ui spring, and a small Frost grip at the bottom with a left-right chevrons icon.
- A Frost hint pill "Drag across to peek" sits in the middle while closed.

INPUT
- Mouse: open on enter, follow on move, close on leave. Touch: open on press, follow while dragging, close 900ms after release.
- The dot in the window sits on the hovered month's point on the line (not under the pointer), so it never floats off the line between months.
- Keyboard: the chart is role="slider" (0–11). Focus opens the window; arrow keys, Home and End snap it to months; Escape closes. aria-valuetext reads "March, $48.2k forecast".

UNLOCK
- "Unlock Forecasts" sets w to the full chart width so the frost wipes away with a panel spring, unblurs the total, keeps the Aqua "Pro" badge as it is (it never changes color), and changes the note to "Pro trial started. Every month is yours for 14 days." The button becomes "Reset Demo".

Reduced motion: 120ms linear transitions; the window still opens and moves.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Text that wraps to two or three lines reads as one paragraph whose lines are close in length, with the first line the longest (narrow the text block until that holds; never a long line with one or two words below it). A row with a title and a detail line under it sets each line at its own size and line height (detail 13/18 or 12/16, not the body's 22px), 2px apart, with equal space above and below (at least 8px), so the text never presses against a divider. A card's padding is measured to what you see: text at the top edge trims to its capitals (text-box: trim-start cap alphabetic) and text at the bottom edge to its baseline (text-box: trim-end cap alphabetic), so the space above matches the space below. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders. A letter, initials or a number in a tile, avatar or count badge is centered on its capital height, not its line box (display: block; align-content: center; text-align: center; text-box: trim-both cap alphabetic), at a size whose capitals leave equal space above and below: 14px bold in tiles from 26 to 40px.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji. Every count uses the singular for one ("1 file", "1 second", "1 person"), including counts set by data attributes.
- This one: the frost is a material (blur behind) over solid content; only the lens and its grip use Frost. The total and month labels use tabular numbers.

DELIVER
The component with values and month labels passed in as data, a demo chart, and short usage notes.
