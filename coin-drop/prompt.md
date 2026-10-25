Build a "Coin Drop" pricing toggle in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Switching from monthly to yearly billing throws coins from the toggle into each plan card. Each card's savings counter counts up as its coins land, so the discount feels like money kept.

LAYOUT
- Everything sits in one white card (16px corners, 20px padding, 1px border, small shadow) so the toggle and plans read as one pricing block.
- A segmented Monthly / Yearly toggle (role radiogroup, arrow keys switch) on a soft-ground track, with a sliding white thumb, and a "−20%" chip on Yearly.
- Plan cards inside it (12px corners, 1px border), for example Starter $12→$10, Pro $29→$23 (featured), Team $79→$63 per month. Each card has the price, a "Billed monthly" / "Billed yearly · $120" line, and a savings tray at the bottom with a small coin slot (a dark 18×5px slit).

SWITCHING TO YEARLY
1. For each plan, launch 3–8 coins. Bigger savings get more coins: round(yearlySaving / 24) + 2, clamped.
2. Each coin flies from the −20% chip to its card's slot on a parabolic arc (random lift 50–90px, slight sideways sway), spins 180–420°, and flips (scaleX oscillates between 0.35 and 1). Flight time 720–880ms. Stagger 85ms per coin and 120ms per card.
3. In the last 15% of the flight the coin shrinks to 0.35 and fades, as if dropping into the slot.
4. Each landing bumps the tray (scale 1.05), pulses an Olive ring around the slot, and steps the counter up: "You keep $24/yr" (short enough to stay on one line, so the cards never change height).
5. The price counts down to the yearly figure over 520ms with an ease-out curve.

SWITCHING BACK TO MONTHLY
- Coins fly out of each slot back to the chip (they start small, grow, and fade at the end). Prices count back up. The tray reads "Yearly saves $24".

DETAILS
- If the person toggles mid-animation, cancel coins in flight and tween from the price currently shown.
- Coins are decorative (aria-hidden). Announce the change in a polite live region.
- prefers-reduced-motion: no coins; prices and trays update instantly.
- Tabular numbers for prices. Theme with CSS variables: accent, success, success-subtle, olive, olive-700, surface, sunken, text, muted, line.


APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the Monthly/Yearly switch is a segmented tabs control (Mist track, white thumb with a 1px border and soft shadow, ui spring). Plans are white bordered cards (12px corners) on the Soft ground; the featured plan gets a 2px Black ring (Aqua in dark mode). Coins are Olive.

DELIVER
The component, a three-plan demo, and short usage notes.
