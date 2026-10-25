Build a "Snooze Slide" for notifications in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Drag a notification to the right to snooze it. The further you drag, the later it comes back, and the track behind the card tells you exactly when.

BEHAVIOR
1. Behind each card is a track in Aqua whose depth increases with each step (30% + 17% per step mixed into the background).
2. Options every 64px of drag, starting at 48px: "In 1 Hour", "This Evening" (6 PM, or "Tomorrow Evening" after 5 PM), "Tomorrow" (9 AM), "Next Week" (Monday 9 AM). Compute real dates from now. The track shows the option name (17px bold) and the exact time ("Tomorrow at 9:00 AM").
3. Crossing into a new option pops the label (scale 1.12 and back, pop spring) and, where supported, vibrates for 8ms. Before the first step it reads "Snooze · Keep dragging".
4. Past the last option, drag is rubber-banded to a quarter of the pointer's movement.
5. Releasing on an option: the card slides off to the right, the row collapses smoothly, and a pill appears: a clock icon, "Snoozed until Tomorrow at 9:00 AM", and an Undo button that restores the card. Releasing before the first step springs the card back.
6. Keyboard: the card is focusable; Right Arrow steps through options (the card slides open to match), Left Arrow steps back, Enter or Space snoozes, Escape cancels.
Reduced motion: no pop or collapse animation; the card still follows the pointer.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: cards are 64px tall with 16px corners and a hairline; the snoozed pill is an Aqua-tinted pill with a white Undo button.

DELIVER
The component with configurable options, the demo with two notifications, and short usage notes.
