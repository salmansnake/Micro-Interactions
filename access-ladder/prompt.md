Build an "Access Ladder" share setting in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Choosing who can open a link climbs a ladder from private to public, and a crowd beside it grows or shrinks to show exactly how many people that lets in, so sharing too widely is visible before it happens.

BEHAVIOR
1. Rungs from bottom to top: Only You (private), People You Invite (3 people), Outcraft Team (48 people), Anyone with the Link (no sign-in needed). It's a radiogroup; arrow keys climb and descend.
2. A vertical rail runs exactly through the center of every rung dot and fills from the bottom up to the selected rung with a ui spring. Rungs have 10px of padding on the left, so the selected dot and its ring never touch the edge of its card. Dots at or below it fill; the selected rung lifts onto a white raised card and its dot grows with a soft ring.
3. Beside the ladder, a crowd panel shows one small colored dot per person who can open it, with a larger "You" avatar first. The dots sit on a tight 14px grid with 4px gaps; "You" takes a 2×2 cell (32px), so the other dots pack around it with no empty gap. Moving up adds dots that pop in one after another (12ms apart); moving down shrinks the extra dots away. The top rung replaces the crowd with a large globe that springs in.
4. At the top rung, the color shifts from black (Aqua in dark mode) to amber (rail, dots, globe) and a warning appears: "Anyone who gets this link can open it, including people outside Outcraft."
5. A headline counts reach: "49 people can open it." / "Anyone with the link can open it."
6. Copy Link (filled button) copies the URL and says "Copied" with a Lucide `check` icon, keeping its own colors and width (it is as wide as its Copied state from the start); it's disabled at Only You.
Reduced motion: dots and globe appear without springs.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the ladder and crowd sit side by side in 16px rounded Soft ground panels and stack on narrow screens; the link shows in a monospace field.

DELIVER
The component with levels and counts as configuration, the demo, and short usage notes.
