Build "Line Clear" for a day calendar in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Accepted meetings drop into your day like falling blocks. Fill every gap and the whole day flashes like a cleared line, then offers to protect your lunch.

BEHAVIOR
1. "Thursday" with "3 hours free" on the right. A day column from 9 to 5: 8 hour slots, 28px each with 2px gaps and hour labels. Five slots are already booked with colored blocks in the brand palette (black text, a light top bevel and a darker bottom edge for a slight falling-block feel).
2. An Invites grouped list: Budget Check 12:00, Vendor Call 1:00, Quick Sync 3:00, each with an Accept button.
3. Accept drops the block into its slot from above the column on a pop spring and removes the invite. The free count updates.
4. When no slots are left: "No time free" turns red. Every block flashes white in turn from top to bottom (60ms apart), like a cleared row. Then a green panel appears: "Line clear. No gaps from 9 to 5. Not even for lunch." with "Protect 12:00 for Lunch".
5. Protect lunch: the 12:00 meeting slides out to the right and a striped green "Lunch (Protected)" block with a lock drops in. "Lunch protected. Budget Check moved to tomorrow, where it will also be fine."
Reduced motion: blocks appear without falling or flashing.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: blocks are 6px-radius rounded rectangles inside a 14px Soft ground day panel.

DELIVER
The component with slots, existing blocks and invites as data, the demo, and short usage notes.
