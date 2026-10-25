Build an "Unsure Underline" for AI-generated text in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
AI output usually reads as equally confident everywhere. Here, words the model is unsure of carry a dotted underline that gets darker and thicker the less sure it is, and a tap shows how sure it is with one-tap alternatives.

BEHAVIOR
1. Mark uncertain words as spans with a confidence (0–1) and alternatives. Set --u = 1 − confidence.
2. Underline: dotted, thickness 1px + 2px × u, offset 4px, amber mixed at 35% + 65% × u. Hover and focus give the word a light amber background. Each word is a focusable button labeled "annual, 42% sure. Show alternatives."
3. Clicking or pressing Enter opens a popover above the word (below if there's no room), springing in: "42% sure" with a small amber meter, a soft Aqua "Keep “annual”" button (focused), and an outline button per alternative.
4. Choosing swaps the word (fades in from 6px above and blur(3px)), then it flashes green and scales 1.06 → 1 to confirm. The underline disappears for good, the word stops being a button, and focus moves to the next uncertain word.
5. A status line counts what's left: "3 words to check. Darker underlines are less certain." then "Every word checked. Ready to send."
6. A "Show Confidence" switch hides and shows every underline. Escape closes the popover and returns focus to the word.
Reduced motion: no swap or flash animation.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the text sits in a 12px rounded Soft ground box at 17/28; the popover is a 220px white card with 16px corners.

DELIVER
The component with the marked-up text as input, the demo reply, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--amber-9: #ffc53d
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #646A66  (dark: #A3A8A4)
--black: #000000
--border: #DCDED9  (dark: #313432)
--brand: #79EEEC
--card: #FFFFFF  (dark: #161817)
--duration-base: 200ms
--duration-slower: 480ms
--ease-out: cubic-bezier(0.22, 0.9, 0.24, 1)
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F3F2EE)
--green-11: #218358  (dark: #3dd68c)
--input: #C6C9C3  (dark: #434744)
--leading-body: 22px
--leading-small: 18px
--leading-title-sm: 24px
--lift: #FFFFFF  (dark: #3F4341)
--line: #DCDED9  (dark: #313432)
--line-strong: #C6C9C3  (dark: #434744)
--mist: #ECEBE6  (dark: #2B2E2D)
--muted: #ECEBE6  (dark: #2B2E2D)
--muted-foreground: #646A66  (dark: #A3A8A4)
--press-scale: 0.97
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-full: 9999px
--radius-lg: 12px
--radius-sm: 6px
--radius-xl: 16px
--radius-xs: 4px
--raised: #FFFFFF  (dark: #3F4341)
--ring: #0B7573  (dark: #79EEEC)
--shadow-sm: 0 1px 2px rgba(17, 17, 16, 0.04), 0 1px 3px rgba(17, 17, 16, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--shadow-xl: 0 8px 16px -4px rgba(17, 17, 16, 0.08), 0 28px 56px -12px rgba(17, 17, 16, 0.22)  (dark: 0 8px 16px -4px rgba(0, 0, 0, 0.55), 0 28px 56px -12px rgba(0, 0, 0, 0.65))
--soft-ground: #F3F2EE  (dark: #0C0D0C)
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--spring-ui: linear(0, 0.0237, 0.0849, 0.1704, 0.2697, 0.3746, 0.4788, 0.5777, 0.6685, 0.7491, 0.8189, 0.8776, 0.9257, 0.9639, 0.9931, 1.0147, 1.0296, 1.0391, 1.0442, 1.046, 1.0451, 1.0425, 1.0387, 1.0342, 1.0294, 1.0246, 1.02, 1.0158, 1.012, 1.0087, 1.0059, 1.0037, 1.0019, 1.0005, 0.9994, 0.9987, 0.9982, 0.998, 0.9979, 0.9979, 1)
--spring-ui-duration: 460ms
--subtle: #F3F2EE  (dark: #0C0D0C)
--success: #218358
--switch-on: #000000  (dark: #79EEEC)
--text-body: 15px
--text-caption: 12px
--text-small: 13px
--text-title-sm: 17px
--tint-c: 0.4  (dark: 0.45)
--tint-l: 0.92  (dark: 0.32)
--tracking-title: -0.015em
--warning: #ffc53d
--white: #FFFFFF  (dark: #161817)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
