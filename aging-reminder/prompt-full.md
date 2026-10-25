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

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--amber-11: #ab6400  (dark: #ffca16)
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #646A66  (dark: #A3A8A4)
--black: #000000
--border: #DCDED9  (dark: #313432)
--card: #FFFFFF  (dark: #161817)
--duration-reduced: 120ms
--duration-slower: 480ms
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F3F2EE)
--leading-body: 22px
--leading-caption: 16px
--leading-small: 18px
--leading-title-sm: 24px
--line: #DCDED9  (dark: #313432)
--mist: #ECEBE6  (dark: #2B2E2D)
--muted: #ECEBE6  (dark: #2B2E2D)
--muted-foreground: #646A66  (dark: #A3A8A4)
--olive: #AA9856
--olive-700: #6F6228  (dark: #CBBB7E)
--on-color: #ffffff
--press-scale: 0.97
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-lg: 12px
--radius-md: 8px
--radius-xl: 16px
--ring: #0B7573  (dark: #79EEEC)
--shadow-sm: 0 1px 2px rgba(17, 17, 16, 0.04), 0 1px 3px rgba(17, 17, 16, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--shadow-xs: 0 1px 2px rgba(17, 17, 16, 0.05)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4))
--soft-ground: #F3F2EE  (dark: #0C0D0C)
--spring-pop: linear(0, 0.0413, 0.1464, 0.2895, 0.4487, 0.6073, 0.7529, 0.8776, 0.9776, 1.0517, 1.1013, 1.1292, 1.1394, 1.1357, 1.1225, 1.1033, 1.0813, 1.059, 1.0382, 1.0202, 1.0055, 0.9945, 0.9869, 0.9825, 0.9807, 0.9808, 0.9825, 0.985, 0.9881, 0.9912, 0.9941, 0.9967, 0.9989, 1.0005, 1.0017, 1.0024, 1.0027, 1.0027, 1.0025, 1.0022, 1)
--spring-pop-duration: 680ms
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--spring-ui: linear(0, 0.0237, 0.0849, 0.1704, 0.2697, 0.3746, 0.4788, 0.5777, 0.6685, 0.7491, 0.8189, 0.8776, 0.9257, 0.9639, 0.9931, 1.0147, 1.0296, 1.0391, 1.0442, 1.046, 1.0451, 1.0425, 1.0387, 1.0342, 1.0294, 1.0246, 1.02, 1.0158, 1.012, 1.0087, 1.0059, 1.0037, 1.0019, 1.0005, 0.9994, 0.9987, 0.9982, 0.998, 0.9979, 0.9979, 1)
--spring-ui-duration: 460ms
--subtle: #F3F2EE  (dark: #0C0D0C)
--text-body: 15px
--text-caption: 12px
--text-small: 13px
--text-title-sm: 17px
--tracking-title: -0.015em
--warning-text: #a15e00  (dark: #ffca16)
--white: #FFFFFF  (dark: #161817)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
