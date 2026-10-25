Build a "Circle Back Boomerang" for a message composer in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
"Let's circle back next week" turns into a boomerang. Send the message and it spins away. A week later it flies back and lands as a reminder of what you promised.

BEHAVIOR
1. "To: Sam Rivera", a 14px message field ("Love this idea. Let's circle back next week once the numbers are in."), and a Send button.
2. Detect promise phrases (circle back, follow up, touch base, loop back, revisit this, get back to you) and a rough time (tomorrow, a weekday, in a few days; otherwise next week). Under the field: a small orange boomerang that wiggles, then "Boomerang ready for "circle back". It comes back Thursday, Oct 29."
3. Send: an orange boomerang SVG flies from the button up in an arc and off the right edge, spinning five full turns (1.1s). Status: "Sent. Reminder set for Thursday, Oct 29. It'll come back." A "Skip Ahead a Week" button appears for the demo.
4. Skip ahead: the boomerang flies back in from the right, spinning the other way, and lands on a reminder card that springs in:
   - The card is tinted orange (the fixed-lightness tint) with an elevation shadow and no border. Open Thread is the main button, black with white text in light mode and off-white with dark text in dark mode (never Aqua on the orange tint); Circle Back Again is white in light mode and a light wash of the text color in dark, never the plain gray fill, which dissolves into the tint. It reads "A Week Later" and "You told Sam: "Let's circle back next week once the numbers are in."".
   - Its buttons are Open Thread and Circle Back Again ("Again? Bold. See you Thursday, Oct 29.").
5. No phrase found: "Sent. No boomerang, so you'll have to remember this one yourself."
Reduced motion: no flight; the reminder just appears.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the reminder is the only elevated card; the boomerang flies above everything inside the clipped card.

DELIVER
The component with phrases, the date parser and an onRemind callback as inputs, the demo, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--ai: #FE8C5F
--ai-text: #B5481A  (dark: #FE8C5F)
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #646A66  (dark: #A3A8A4)
--background: #FAFAF8  (dark: #0B0C0B)
--black: #000000
--border: #DCDED9  (dark: #313432)
--canvas: #FAFAF8  (dark: #0B0C0B)
--card: #FFFFFF  (dark: #161817)
--ease-in-out: cubic-bezier(0.62, 0, 0.32, 1)
--fill-on-tint: #FFFFFF  (dark: color-mix(in srgb, #F3F2EE 14%, transparent))
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F3F2EE)
--input: #C6C9C3  (dark: #434744)
--inverse: #000000  (dark: #F3F2EE)
--inverse-foreground: #ffffff  (dark: #0B0C0B)
--leading-body: 22px
--leading-caption: 16px
--leading-small: 18px
--lift: #FFFFFF  (dark: #3F4341)
--line: #DCDED9  (dark: #313432)
--line-strong: #C6C9C3  (dark: #434744)
--mist: #ECEBE6  (dark: #2B2E2D)
--muted: #ECEBE6  (dark: #2B2E2D)
--muted-foreground: #646A66  (dark: #A3A8A4)
--on-color: #ffffff
--orange: #FE8C5F
--orange-700: #B5481A  (dark: #FE8C5F)
--press-scale: 0.97
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-lg: 12px
--radius-md: 8px
--radius-xl: 16px
--raised: #FFFFFF  (dark: #3F4341)
--ring: #0B7573  (dark: #79EEEC)
--shadow-md: 0 2px 4px -1px rgba(17, 17, 16, 0.05), 0 6px 14px -3px rgba(17, 17, 16, 0.09)  (dark: 0 2px 4px -1px rgba(0, 0, 0, 0.45), 0 6px 14px -3px rgba(0, 0, 0, 0.45))
--shadow-sm: 0 1px 2px rgba(17, 17, 16, 0.04), 0 1px 3px rgba(17, 17, 16, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--shadow-xs: 0 1px 2px rgba(17, 17, 16, 0.05)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4))
--soft-ground: #F3F2EE  (dark: #0C0D0C)
--spring-pop: linear(0, 0.0413, 0.1464, 0.2895, 0.4487, 0.6073, 0.7529, 0.8776, 0.9776, 1.0517, 1.1013, 1.1292, 1.1394, 1.1357, 1.1225, 1.1033, 1.0813, 1.059, 1.0382, 1.0202, 1.0055, 0.9945, 0.9869, 0.9825, 0.9807, 0.9808, 0.9825, 0.985, 0.9881, 0.9912, 0.9941, 0.9967, 0.9989, 1.0005, 1.0017, 1.0024, 1.0027, 1.0027, 1.0025, 1.0022, 1)
--spring-pop-duration: 680ms
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--subtle: #F3F2EE  (dark: #0C0D0C)
--text-body: 15px
--text-caption: 12px
--text-small: 13px
--tint-c: 0.4  (dark: 0.45)
--tint-ink-l: 0.48  (dark: 1)
--tint-l: 0.92  (dark: 0.32)
--white: #FFFFFF  (dark: #161817)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
