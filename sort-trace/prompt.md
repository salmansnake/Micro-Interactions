Build a "Sort Trace" table in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
When a table re-sorts, rows normally jump and you lose track of them. Here every row glides to its new place, leaves a fading trail from where it was, and briefly shows how many places it moved.

BEHAVIOR
1. Column headers are buttons with aria-sort. Clicking one sorts by it (numbers start highest first, text A to Z) and clicking again flips direction. The active header turns Aqua 700 and shows a chevron that rotates 180° for ascending.
2. Measure each row's position before sorting, reorder the DOM, then FLIP each moved row from its old position (520ms, slight overshoot).
3. In a 26px gutter to the left of the rows, draw an SVG curve for each moved row from its old vertical center to its new one, bowing outward. Green for rows that moved up, amber for rows that moved down, with a small dot at the destination. Draw the line on (stroke-dashoffset), then fade it over 2.6s.
4. After the move lands, a small badge in the gutter shows "↑3" or "↓2" in the same color, springing in and clearing with the trails.
5. Moved rows flash a faint Aqua background that fades over 1.6s.
6. A status line reads "Sorted by MRR, highest first."
Reduced motion: no FLIP or trails; badges still appear.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the table is a 14px rounded Soft ground group with hairline row separators and tabular numbers; avatars are 22px rounded squares.

DELIVER
The component with rows and columns as data, the demo table, and short usage notes.
