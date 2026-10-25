Build an "Elastic Range" date-range picker in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Picking a stay feels physical: the selection band stretches like a rubber band from check-in toward wherever you point, and if a booked night is in the way it strains against it and stops, instead of letting you pick an impossible range.

BEHAVIOR
1. A month grid (demo: November 2026, Sunday first) of 40px round day buttons. Booked days (demo: 20 and 21) are struck through and not selectable.
2. First click sets check-in: a solid black circle (Aqua in dark mode) sits on that day and the summary says "Check-in Nov 12." with "Now choose check-out." on a second line
3. While choosing check-out, hovering or focusing a later day previews the range: an Aqua-tinted band per week row, from the check-in circle to the end circle. Band edges (left, width) and the end circle (left, top) move with a pop spring, so the band visibly stretches and settles.
4. A dark pill bubble rides above the end circle: "3 nights · $540".
5. If the pointed day is on or after a booked night, clamp the end to the night before it, color the booked day red, play a strain animation on the end circle (stretch to scaleX 1.25, overshoot back), and say "Nov 20 is booked," with "so your stay ends Nov 19." on a second line (red)
6. Second click confirms. The summary reads "Nov 12 – Nov 15" (bold) with "3 nights · $540 total." always on a second line below it, same small muted text. The summary is at most 30 characters wide with balanced wrapping, keeps clear of the Clear button, and never splits a hyphenated word (check-in, check-out). A Clear button resets. Clicking a day before check-in starts over from that day.
7. Arrow keys move focus by day and week (roving tabindex); Enter selects.
Reduced motion: band and circle move in 100ms with no bounce or strain.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the band is Aqua at 16%; selected ends are solid black circles with white numbers (Aqua with black numbers in dark mode); the bubble is a dark pill.

DELIVER
The component with month, booked days and nightly rate as inputs, the demo, and short usage notes.
