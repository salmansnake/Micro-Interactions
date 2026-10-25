Build an "Aging Reminder" card in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Every snooze makes the reminder visibly older: the paper yellows, the corner curls, it gets taped back up and gains a coffee ring. Done snaps it fresh.

BEHAVIOR
1. A reminder card on a 16px Soft ground stage: "Reminder" in small amber bold, "Reply to Priya about the invoice" in 17px semibold, and "Due today at 10:00 AM". Below it, Snooze 1 Hour (outline button) and Done (primary button).
2. Age = snoozes ÷ 8:
   - The paper blends from the card color to old paper (Olive mixed into the card) and gains faint diagonal wrinkle lines and a slightly bigger, softer shadow.
   - Its saturation drops a little and the text fades a little.
   - The card tilts a bit more each time, alternating left and right (up to 3.5°).
   - The bottom-right corner curls up to 34px: a folded triangle in the stage's color over a darker paper back.
3. At 3 snoozes a strip of translucent tape springs onto the top edge ("It's been taped back up."). At 5, a coffee ring fades in ("This reminder has seen things."). At 7: "It's older than some of your projects." At 8: "It's now a historical document." The Snooze button becomes "Snooze (Seriously?)".
4. The due line counts the hours: "Snoozed 7 times. It's now 5:00 PM."
5. The status line under the buttons takes no space while it is empty; the card grows to fit it when a message appears. Button labels stay on one line: after 8 snoozes the snooze button reads "Snooze (Seriously?)", or just "Seriously?" on very narrow cards (under 260px), with smaller text under 320px.
6. Done: the card springs flat and fresh (scale 1.04 and back), the task gets struck through, and the status says "Done after 7 snoozes. Priya will be so relieved." (or "Done on time. Who are you?"). Done becomes Undo.
Reduced motion: aging changes in 100ms.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the card is deliberately paper-like; the controls around it stay crisp and plain.

DELIVER
The component with the task, person and start hour as inputs, the demo, and short usage notes.
