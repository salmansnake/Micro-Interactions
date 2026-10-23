Build an "Overtime Fuse" for a meeting timer in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Once a meeting runs past its end time, the progress bar turns into a burning fuse, with a spark eating it from right to left and a running count of person-minutes.

BEHAVIOR
1. Header: "Design Review" and "3:00–3:30 PM · 6 people", with a large elapsed clock on the right (m:ss, red when over). Below it: a 10px track, a status line, a "Move Time Forward" slider for the demo and an End Meeting for All button.
2. Before the end: a normal progress bar (Black, Aqua in dark mode). "On time. 3 minutes left."
3. After the end:
   - The bar becomes a braided rope (repeating diagonal tan and brown) whose length = 1 − minutes over ÷ 15.
   - A glowing spark sits at its right tip: a radial gradient from white to yellow to orange that flickers and throws four tiny embers up and out.
   - The burnt part is a thin dark line, and the spark grows as the fuse shortens.
   - The status reads "6 minutes over · 6 people · 36 person-minutes".
4. Five or more minutes over: End Meeting for All turns solid red and gives a small pulse every 2.4s.
5. Fuse out (15 min over): "17 minutes over. The fuse is out. Everyone is still here, physically." Ending: "Meeting ended. 6 people just got their afternoon back."
Reduced motion: no flicker, embers or pulse.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the rope and spark are the only textures; everything else is plain pills and type.

DELIVER
The component with length, people and fuse minutes as inputs and a setMinutes(n) method, the demo, and short usage notes.
