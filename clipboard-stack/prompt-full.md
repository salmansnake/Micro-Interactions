Build a "Clipboard Stack" for copy buttons in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Copying usually gives a tiny "Copied" and nothing else. Here, the copied value visibly flies into a clipboard in the corner, which keeps the last five copies so people can grab an earlier one again.

BEHAVIOR
1. Any [data-copy] button copies its value with navigator.clipboard.writeText (ignore failures) and switches its label to "Copied" for 1.4s (black with white text in light mode, off-white with dark text in dark mode; it never moves or resizes).
2. A small slip showing the value (monospace, max 180px, ellipsis) flies from the button to the clipboard on an arc 60px high: it scales from 0.8 up to 1, tilts a little mid-flight, shrinks to 0.2 near the end and fades in the last 10%. 620ms.
3. On landing, the clipboard bounces (scale 1.14 and back, pop spring), a count badge pops in, and paper slips fan out behind the clipboard icon: one per copy, up to three, each rotated differently.
4. Clicking the clipboard opens a compact popover (scales in from its top-right corner, small enough to stay inside the card) with a "Recent Copies" title and a Clear All button in its top-right corner. It lists recent copies, newest first: the value in small monospace plus its label and how long ago, each with a small × button at the end. Clicking a copy copies it again and moves it to the top. Copying the same value twice never duplicates it.
5. × removes that one copy (it slides out to the right): the badge count drops by one and the paper slips behind the clipboard update. Clear All empties the list at once: the badge and slips disappear, the popover shows "Things you copy here stay for this session.", and Clear All hides until something is copied again. Removed values can be copied again from their rows at any time. A polite live region announces "API Key removed" or "All copies cleared".
6. Escape or clicking outside closes the popover and returns focus to the clipboard.
Demo rows: API key, invite link, brand color with a swatch, webhook secret.
Reduced motion: no flight; the badge and list still update.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the clipboard is a 44px Soft ground circle with a clipboard icon and a black badge (Aqua in dark mode); the popover is a 280px card with 16px corners, 10px padding and a soft elevation shadow.

DELIVER
The component, the demo rows, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #646A66  (dark: #A3A8A4)
--background: #FAFAF8  (dark: #0B0C0B)
--black: #000000
--border: #DCDED9  (dark: #313432)
--canvas: #FAFAF8  (dark: #0B0C0B)
--card: #FFFFFF  (dark: #161817)
--duration-base: 200ms
--duration-fast: 140ms
--ease-in: cubic-bezier(0.5, 0, 0.78, 0.24)
--font-mono: "Geist Mono", ui-monospace, "Cascadia Code", Menlo, Consolas, monospace
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F3F2EE)
--green-11: #218358  (dark: #3dd68c)
--leading-body: 22px
--leading-caption: 16px
--leading-small: 18px
--leading-title-sm: 24px
--leading-ui: 20px
--line: #DCDED9  (dark: #313432)
--mist: #ECEBE6  (dark: #2B2E2D)
--muted: #ECEBE6  (dark: #2B2E2D)
--muted-foreground: #646A66  (dark: #A3A8A4)
--press-scale: 0.97
--press-scale-sm: 0.94
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-full: 9999px
--radius-lg: 12px
--radius-md: 8px
--radius-sm: 6px
--radius-xl: 16px
--radius-xs: 4px
--ring: #0B7573  (dark: #79EEEC)
--shadow-md: 0 2px 4px -1px rgba(17, 17, 16, 0.05), 0 6px 14px -3px rgba(17, 17, 16, 0.09)  (dark: 0 2px 4px -1px rgba(0, 0, 0, 0.45), 0 6px 14px -3px rgba(0, 0, 0, 0.45))
--shadow-sm: 0 1px 2px rgba(17, 17, 16, 0.04), 0 1px 3px rgba(17, 17, 16, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--shadow-xl: 0 8px 16px -4px rgba(17, 17, 16, 0.08), 0 28px 56px -12px rgba(17, 17, 16, 0.22)  (dark: 0 8px 16px -4px rgba(0, 0, 0, 0.55), 0 28px 56px -12px rgba(0, 0, 0, 0.65))
--shadow-xs: 0 1px 2px rgba(17, 17, 16, 0.05)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4))
--soft-ground: #F3F2EE  (dark: #0C0D0C)
--spring-pop: linear(0, 0.0413, 0.1464, 0.2895, 0.4487, 0.6073, 0.7529, 0.8776, 0.9776, 1.0517, 1.1013, 1.1292, 1.1394, 1.1357, 1.1225, 1.1033, 1.0813, 1.059, 1.0382, 1.0202, 1.0055, 0.9945, 0.9869, 0.9825, 0.9807, 0.9808, 0.9825, 0.985, 0.9881, 0.9912, 0.9941, 0.9967, 0.9989, 1.0005, 1.0017, 1.0024, 1.0027, 1.0027, 1.0025, 1.0022, 1)
--spring-pop-duration: 680ms
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--spring-ui: linear(0, 0.0237, 0.0849, 0.1704, 0.2697, 0.3746, 0.4788, 0.5777, 0.6685, 0.7491, 0.8189, 0.8776, 0.9257, 0.9639, 0.9931, 1.0147, 1.0296, 1.0391, 1.0442, 1.046, 1.0451, 1.0425, 1.0387, 1.0342, 1.0294, 1.0246, 1.02, 1.0158, 1.012, 1.0087, 1.0059, 1.0037, 1.0019, 1.0005, 0.9994, 0.9987, 0.9982, 0.998, 0.9979, 0.9979, 1)
--spring-ui-duration: 460ms
--subtle: #F3F2EE  (dark: #0C0D0C)
--success-text: #1f7b53  (dark: #3dd68c)
--text-body: 15px
--text-caption: 12px
--text-small: 13px
--text-title-sm: 17px
--text-ui: 14px
--tracking-title: -0.015em
--white: #FFFFFF  (dark: #161817)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
