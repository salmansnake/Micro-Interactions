Build a "Seat Stacker" for per-seat pricing in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Choosing seats feels concrete: avatars stack up as you add people, prices roll like an odometer, and crossing into a cheaper volume tier is celebrated instead of hidden in a table.

BEHAVIOR
1. Tiers: 1–9 seats $12, 10–24 seats $10, 25+ seats $8 per seat per month (configurable).
2. A stepper: 44px round − and + buttons around a large editable number (40px bold, tabular). Arrow Up/Down in the number also step. Clamp 1–99.
3. An avatar stack in the header: overlapping 30px circles with initials and colors, each with a 2px ring in the card color, overlapping by only 4px so no face ever covers another's initials; up to 6 shown, then a "+n" circle that sits on top of its neighbor so its "+" is never covered. New avatars pop in with a pop spring; removed ones shrink away.
4. Price per seat and total each render as an odometer: one column of digits 0–9 per position, translated with a ui spring to the new digit.
5. A three-segment tier bar shows all tiers; the current one is a raised white thumb. On entering a new tier it bounces (scale 1.08) and a green chip says "Tier unlocked: you now pay $10 per seat" (or "Back to $12 per seat" going down).
6. When within 3 seats of the next tier, a chip nudges: "2 more seats unlocks $10 per seat."
Reduced motion: no pops or bounces; odometers move in 100ms.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the tier bar is a segmented-control-style track in Soft ground with a white thumb; price blocks are 12px rounded tiles.

DELIVER
The component with tiers passed in as data, the demo, and short usage notes.
