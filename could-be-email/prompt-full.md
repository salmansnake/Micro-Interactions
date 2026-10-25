Build a "Could've Been an Email" meeting scheduler interaction in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
A short meeting with no real agenda quietly folds itself into an envelope and offers to be sent as an email instead. It's a joke everyone recognizes, and it actually gives people time back.

BEHAVIOR
1. A new-event form as one grouped list: Title (right-aligned text field), Duration (segmented tabs control: 15m, 30m, 45m, 1h), People (a stepper with Lucide minus and plus icons, minimum 2), and Agenda (a two-line text area, placeholder "What needs to be decided?").
2. Below it, a day view from 10 AM to 11 AM with hairline hour rules. The event is an Aqua 100 rounded block (Aqua 700 text, a 3px Aqua 700 bar on its left edge) showing the title and "10:00–10:30 · 6 people". Its height follows the duration.
3. When the form first scrolls into view and the agenda has fewer than 3 words, wait 1.1s, then fold the event into an envelope: the block springs to a centered 168×106 paper card with a shadow (ui spring), its text fades, a triangular flap rotates down from rotateX(178deg) to 0 (0.22s later), and a small dashed stamp, "To: 6 people" and "Re: Quick Sync" appear.
4. An Aqua-tinted panel appears under it: "This could have been an email." and "It would give 6 people 3 hours back." (people × minutes, written in hours and minutes). With exactly 2 people it says "message" instead of "email". Changing duration or people updates the numbers live.
5. Buttons: "Send as Email" (filled button) flies the envelope up and to the right (translate, rotate 16°, scale 0.6, fade), then shows "Free from 10:00 to 10:30" in the empty slot and "Sent. 6 people just got 3 hours back." with a Start Over link. "It Really Needs a Meeting" (a secondary button that is a lighter shade of the panel's own color (a 65% white wash in light mode, a 14% wash of the text color in dark mode, never solid white or gray)) unfolds it and says "Fine. Add an agenda so everyone knows why they're there.", moving focus to the agenda.
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

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--aqua: #79EEEC
--aqua-100: #CFF8F6  (dark: #0E2E2D)
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #646A66  (dark: #A3A8A4)
--black: #000000
--body: #4A504D  (dark: #C9CDCA)
--border: #DCDED9  (dark: #313432)
--brand: #79EEEC
--brand-strong: #0B7573  (dark: #79EEEC)
--brand-subtle: #CFF8F6  (dark: #0E2E2D)
--brand-text: #0B7573  (dark: #79EEEC)
--card: #FFFFFF  (dark: #161817)
--duration-base: 200ms
--duration-fast: 140ms
--duration-reduced: 120ms
--duration-slow: 320ms
--duration-slower: 480ms
--fill-on-tint: color-mix(in srgb, #FFFFFF 65%, transparent)  (dark: color-mix(in srgb, #F3F2EE 14%, transparent))
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F3F2EE)
--input: #C6C9C3  (dark: #434744)
--leading-body: 22px
--leading-caption: 16px
--leading-small: 18px
--leading-title-sm: 24px
--lift: #FFFFFF  (dark: #3F4341)
--line: #DCDED9  (dark: #313432)
--line-strong: #C6C9C3  (dark: #434744)
--mist: #ECEBE6  (dark: #2B2E2D)
--muted: #ECEBE6  (dark: #2B2E2D)
--muted-foreground: #646A66  (dark: #A3A8A4)
--muted-on-tint: #4A504D  (dark: #A3A8A4)
--press-scale: 0.97
--press-scale-sm: 0.94
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-lg: 12px
--radius-md: 8px
--radius-sm: 6px
--radius-xl: 16px
--radius-xs: 4px
--raised: #FFFFFF  (dark: #3F4341)
--ring: #0B7573  (dark: #79EEEC)
--shadow-md: 0 2px 4px -1px rgba(17, 17, 16, 0.05), 0 6px 14px -3px rgba(17, 17, 16, 0.09)  (dark: 0 2px 4px -1px rgba(0, 0, 0, 0.45), 0 6px 14px -3px rgba(0, 0, 0, 0.45))
--shadow-sm: 0 1px 2px rgba(17, 17, 16, 0.04), 0 1px 3px rgba(17, 17, 16, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--shadow-xs: 0 1px 2px rgba(17, 17, 16, 0.05)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4))
--slate: #4A504D  (dark: #C9CDCA)
--soft-ground: #F3F2EE  (dark: #0C0D0C)
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--spring-ui: linear(0, 0.0237, 0.0849, 0.1704, 0.2697, 0.3746, 0.4788, 0.5777, 0.6685, 0.7491, 0.8189, 0.8776, 0.9257, 0.9639, 0.9931, 1.0147, 1.0296, 1.0391, 1.0442, 1.046, 1.0451, 1.0425, 1.0387, 1.0342, 1.0294, 1.0246, 1.02, 1.0158, 1.012, 1.0087, 1.0059, 1.0037, 1.0019, 1.0005, 0.9994, 0.9987, 0.9982, 0.998, 0.9979, 0.9979, 1)
--spring-ui-duration: 460ms
--subtle: #F3F2EE  (dark: #0C0D0C)
--text-body: 15px
--text-caption: 12px
--text-small: 13px
--text-title-sm: 17px
--tint-c: 0.4  (dark: 0.45)
--tint-l: 0.92  (dark: 0.32)
--tracking-title: -0.015em
--white: #FFFFFF  (dark: #161817)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
