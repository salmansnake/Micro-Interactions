Build a "Typo Morph" search field in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
When a search returns nothing, the field doesn't just say "No results". It finds the closest real term and morphs the typed word into it, letter by letter, so people see exactly what was wrong, then shows results for the corrected word.

BEHAVIOR
1. Search a list of items (demo: 20 settings pages such as Billing, Invoices, Members, Integrations, Webhooks, API Keys, Audit Log) by substring, debounced 280ms. Highlight the matching part of each result.
2. With zero results and at least 3 characters typed, compute the Levenshtein distance from the query to every item name. If the best normalized distance is 0.45 or less, use it.
3. Trace the edit path (keep, substitute, delete, insert) and render the corrected word as a row of letters inside an Aqua-tinted pill:
   - kept letters stay plain;
   - deleted letters appear red with a strike, then drop 10px, tilt and collapse to zero width;
   - inserted letters drop in green from 10px above with a pop spring, growing from zero width;
   - substituted letters flip in (rotateX 90° to 0) in green.
   Stagger each change 120ms after a 250ms pause, so the fix reads left to right.
4. Copy above: "No results for “biling”. Showing results for". Below: "Press Tab to search for it instead."
5. After the morph finishes, show results for the corrected word. Tab or clicking the pill puts the corrected name into the field.
6. If nothing is close enough, just say "No results for “…”."
Demo: example chips for "biling", "intergrations", "memebrs" and "webhoks".
Reduced motion: deleted letters disappear and others appear without movement.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the field is a 40px white search field with a 1px Line border and a magnifying-glass icon; results are 44px rows with 26px colored tiles holding the item's first letter (14px bold, black, exactly centered on its capital height: trim the letter's box to cap height with text-box: trim-both cap alphabetic) in a 12px rounded group.

DELIVER
The component with the index passed in as data, the edit-distance function, the demo, and short usage notes.
