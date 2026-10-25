Build a "Setup Ring" onboarding checklist in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Each finished setup step sends its checkmark flying into a progress ring, filling that step's segment. When the ring completes it turns into a green badge and the checklist folds away.

BEHAVIOR
1. A 72px ring split into one arc per task (demo: 4), with a 7px gap between arcs and round caps, starting at 12 o'clock. The percentage sits in the middle and counts up with an ease-out over 500ms.
2. Each task row: a 22px circle, a title and subtitle, and a white "Done" button.
3. On Done: the circle fills black (Aqua in dark mode) with a springy Lucide check (14px, round ends), the title strikes through, focus moves to the next unfinished task's button, and a small black dot (Aqua in dark mode) flies from the circle to the middle of that task's arc on a 50px-high arc (560ms).
4. When the dot lands, that arc grows from nothing to its full length (animate stroke-dasharray with a ui spring), the ring bounces (scale 1.08), and the subtitle updates ("2 steps left").
5. At 100%: the arcs turn green, a filled green disc grows inside the ring with a pop spring, the percentage is replaced by a white Lucide check (28px, round ends), the checklist fades and folds, and a green-tinted row appears: "Atlas is live. Nice work." with Reset Demo.
Reduced motion: no flight; segments and states change directly.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the checklist is a 14px rounded group in Soft ground with hairline separators inset past the check circles.

DELIVER
The component with tasks passed in as data, the demo, and short usage notes.
