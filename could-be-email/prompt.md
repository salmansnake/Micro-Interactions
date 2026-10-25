Build a "Could've Been an Email" meeting scheduler interaction in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
A short meeting with no real agenda quietly folds itself into an envelope and offers to be sent as an email instead. It's a joke everyone recognizes, and it actually gives people time back.

BEHAVIOR
1. A new-event form as one grouped list: Title (right-aligned text field), Duration (segmented tabs control: 15m, 30m, 45m, 1h), People (a stepper with Lucide minus and plus icons, minimum 2), and Agenda (a two-line text area, placeholder "What needs to be decided?").
2. Below it, a day view from 10 AM to 11 AM with hairline hour rules. The event is an Aqua 100 rounded block (Aqua 700 text, a 3px Aqua 700 bar on its left edge) showing the title and "10:00–10:30 · 6 people". Its height follows the duration.
3. When the form first scrolls into view and the agenda has fewer than 3 words, wait 1.1s, then fold the event into an envelope: the block springs to a centered 168×106 paper card with a shadow (ui spring), its text fades, a triangular flap rotates down from rotateX(178deg) to 0 (0.22s later), and a small dashed stamp, "To: 6 people" and "Re: Quick Sync" appear.
4. An Aqua-tinted panel appears under it: "This could have been an email." and "It would give 6 people 3 hours back." (people × minutes, written in hours and minutes). With exactly 2 people it says "message" instead of "email". Changing duration or people updates the numbers live.
5. Buttons: "Send as Email" (filled button) flies the envelope up and to the right (translate, rotate 16°, scale 0.6, fade), then shows "Free from 10:00 to 10:30" in the empty slot and "Sent. 6 people just got 3 hours back." with a Start Over link. "It Really Needs a Meeting" (outline button) unfolds it and says "Fine. Add an agenda so everyone knows why they're there.", moving focus to the agenda.
6. Typing an agenda of 3 or more words unfolds it immediately ("Now that's a meeting."). Clearing it refolds it after a 0.9s pause.
Reduced motion: the fold and fly-away become 100ms fades.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the form is a 14px grouped list on a 20px card; the day view is a 14px Soft ground panel; the envelope is the only thing with a shadow.

DELIVER
The component with start time, minimum agenda words and copy as inputs, a demo, and short usage notes.
