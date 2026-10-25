Build a "Ghost Caret" collaborative text field in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
A teammate's cursor lives inside the same field as a soft colored caret with their name. Words they just typed glow in their color and fade over 4 seconds. If you put your cursor near theirs, they stop typing and wait for you, and the field says so.

HOW IT'S BUILT
- A textarea (normal text, transparent background) over a mirror div with identical metrics (font, padding, line-height, letter-spacing, pre-wrap, break-word). The mirror's text is transparent; it only paints highlights and holds a zero-width marker at the teammate's caret position. The textarea auto-grows.
- Track an owners array with one entry per character: the time the teammate typed it, or 0.
- Render runs of characters with the same highlight strength (alpha = 1 − age / 4000ms, rounded to 0.1) as spans with background color-mix(teammate color × alpha × 26%).
- Position the teammate's caret (2px × 22px, their color) from the marker's offsetLeft/offsetTop, with a name flag above it (rounded pill with a square bottom-left corner).

KEEPING THINGS ATTACHED
- On every local input, diff old and new values (common prefix and suffix) and splice the owners array so highlights stay on the right characters. Shift the teammate's caret index if your edit was before it.
- Apply each remote keystroke at the teammate's index without moving your selection: if your selection is at or after that index, shift it by the inserted length.

POLITENESS
- Before each remote keystroke, if your caret is within 12 characters of theirs, they wait: the flag reads "Mira · Waiting", a soft halo pulses around their caret, and the status line says "Mira is waiting for you to finish here." They resume when you move away or leave the field.

DEMO SCRIPT
- When the field first scrolls into view, the teammate glides (ui spring, 0.58s) to three spots and types a phrase at each, 55–125ms per character, pausing between. Then they idle (caret blinks) and leave (avatar dims, caret fades). A "Replay" button resets everything.
- Presence avatars sit in the header: you in black (Aqua in dark mode), the teammate in their color.
Reduced motion: no glide, blink or halo; highlights still fade.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the teammate color is Pink (#FFC7F6) with black text. The field is a white 12px rounded area with a 1px Line border and a 2px Aqua 700 ring on focus.

DELIVER
The component, an applyRemote(text) function for your sync layer, the demo script, and short usage notes.
