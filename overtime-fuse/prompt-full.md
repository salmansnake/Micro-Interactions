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

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--ai: #FE8C5F
--amber-9: #ffc53d
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #646A66  (dark: #A3A8A4)
--black: #000000
--border: #DCDED9  (dark: #313432)
--card: #FFFFFF  (dark: #161817)
--danger: #ce2c31  (dark: #d4373c)
--danger-foreground: #ffffff
--danger-text: #ca2b30  (dark: #ff9592)
--duration-base: 200ms
--duration-fast: 140ms
--duration-slow: 320ms
--duration-slower: 480ms
--ease-in-out: cubic-bezier(0.62, 0, 0.32, 1)
--ease-out: cubic-bezier(0.22, 0.9, 0.24, 1)
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F3F2EE)
--input: #C6C9C3  (dark: #434744)
--leading-body: 22px
--leading-small: 18px
--leading-title-sm: 24px
--line: #DCDED9  (dark: #313432)
--line-strong: #C6C9C3  (dark: #434744)
--mist: #ECEBE6  (dark: #2B2E2D)
--muted: #ECEBE6  (dark: #2B2E2D)
--muted-foreground: #646A66  (dark: #A3A8A4)
--olive: #AA9856
--olive-100: #F1EEE0  (dark: #2C2816)
--olive-700: #6F6228  (dark: #CBBB7E)
--orange: #FE8C5F
--press-scale: 0.97
--primary: #000000  (dark: #79EEEC)
--radius-md: 8px
--radius-xl: 16px
--radius-xs: 4px
--red-11: #ce2c31  (dark: #ff9592)
--ring: #0B7573  (dark: #79EEEC)
--shadow-sm: 0 1px 2px rgba(17, 17, 16, 0.04), 0 1px 3px rgba(17, 17, 16, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--soft-ground: #F3F2EE  (dark: #0C0D0C)
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--stone: #8A908C  (dark: #7C827E)
--subtle: #F3F2EE  (dark: #0C0D0C)
--text-body: 15px
--text-h3: 24px
--text-small: 13px
--text-title-sm: 17px
--tracking-title: -0.015em
--warning: #ffc53d
--white: #FFFFFF  (dark: #161817)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
