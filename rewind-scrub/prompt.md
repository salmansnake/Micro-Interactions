Build a "Rewind Scrub" version history in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Instead of a list of timestamps, drag a scrubber back through a document's history and watch each edit undo itself in place, with who made it and when.

BEHAVIOR
1. Versions are an ordered list: text, author (name and color), time ago, and a short description ("added the pricing line").
2. A slider (range input) with one tick per version sits under the document. The thumb is a white 22px knob with a Line border that grows while dragged; ticks before it turn Aqua 700, the current one grows. A dark pill above the thumb shows the time ago.
3. The document shows the selected version with that version's change highlighted against the one before it, using a word-level diff (longest common subsequence on words and spaces): added words in green, removed words struck through in red, each on a highlight that steps clearly away from the document in both themes (about OKLCH L 0.88 in light and 0.32 in dark). Highlights fade in.
4. Below the document: the author's avatar and "Mira added the pricing line · 48 minutes ago".
5. The header badge reads "Live" in green at the latest version and "Viewing Version 4" in amber anywhere else; in the past the document background turns warm amber while staying an inset (a little below the card's lightness in both themes, about OKLCH L 0.955 in light and 0.15 in dark); never mix amber into it by a percentage, which lifts the dark inset to the card's own shade so it disappears.
6. In the past, a "Restore This Version" button pops in. Restoring adds a new latest version ("You restored version 4 · Just now") instead of deleting history, and returns to Live.
7. Give the slider aria-valuetext like "Version 4 of 8, Mira added the pricing line, 48 minutes ago".
Reduced motion: no fades.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the document is a 14px rounded Soft ground block at 17/26 with the first line as a 20px bold title.

DELIVER
The component with a versions array as input, the diff function, the demo history, and short usage notes.
