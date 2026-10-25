Build "final_FINAL_v3", a file name that evolves with every save, in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Every save renames the file one step further down the road everyone knows: final, final_v2, FINAL, FINAL_final, FINAL_final_v3 (use this one)…

BEHAVIOR
1. A file card: a Pink 48px document icon, the name ("Pitch Deck" plus a gray ".pdf") and "24 pages · Saved just now". A full-width Save button with a "⌘S" keycap. ⌘S or Ctrl+S inside the component saves too.
2. Name stages: "", " final", " final_v2", " FINAL", " FINAL_final", " FINAL_final_v3", " FINAL_final_v3 (use this one)", " FINAL_final_v3 (use this one) (1)", " FINAL_final_v3 (use this one) (1) EDITED", then back to "".
3. Each save retypes the name: backspace to the shared prefix at 22ms per character, then type the new ending at 38ms per character with a blinking caret. The meta says "Saving…" while it types.
4. An "Also in This Folder" grouped list grows with every old name, newest first, showing 3 and then "and 4 more".
5. Notes under some stages: "Confident.", "Very confident.", "This is the one.", "This is also the one.", "Nine files. One deck. Nobody knows which is real." The last stage says "Full circle. It's just "Pitch Deck" again." and clears the folder.
Reduced motion: the name swaps without typing.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the file sits in a 16px Soft ground card; folder rows are a grouped list with small Orange file chips.

DELIVER
The component with base name, extension and stages as inputs, the demo, and short usage notes.
