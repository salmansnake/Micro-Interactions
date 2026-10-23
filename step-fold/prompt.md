Build a "Step Fold" multi-step form in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Each finished step folds up into a compact summary chip at the top, so the form stays short and people can still see and change every earlier answer with one tap.

BEHAVIOR
1. Steps (demo): Choose a Plan (three radio cards), How Many Seats? (a stepper), Billing Email (a field). Each is a 16px rounded section with a numbered title and a Continue button.
2. Steps not reached yet show only their title in a light outline. The current step is open.
3. Continue folds the step away: rotateX to −80° and scaleY 0.4 around its top edge with fading (0.42s, accelerating), then a chip pops into the row at the top (springs from below, scaled and tilted): a check, the step name ("Plan"), and the answer ("Pro").
4. The next unfinished step unfolds (rotateX −70° → 0, ui spring) and its first control gets focus.
5. Clicking a chip unfolds that step for editing; its chip disappears while it's open. Continue folds it back.
6. Validate before folding (for example, a malformed email gets a red ring and focus).
7. When all steps are done, a summary appears: "$145 per month after a 14-day trial. Billed to finance@northwind.co." with a Start Free Trial button.
Reduced motion: steps swap without folding.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: chips are Soft ground buttons with a 20px black check circle (Aqua in dark mode); plan cards use a 2px black ring when selected (Aqua in dark mode).

DELIVER
The component with steps as configuration, the demo checkout, and short usage notes.
