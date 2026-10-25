Build a "Point-at-Error" email field in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
When an email is invalid, the message under the field draws a thin line up to the exact character that's wrong, highlights that character, and offers a one-tap fix when the fix is certain.

VALIDATION (return the index and length of the problem)
- A space anywhere: point at the first space. "Remove the space. Email addresses can't contain spaces." Fix: remove all spaces.
- Disallowed characters , ; : < > ( ) [ ] \ " : point at it and name it ("Remove the comma."). Fix: remove it.
- No @: point at the end of the text with a dashed "missing" box. "Add an @ and your company domain, like @company.com."
- @ at the start: point at it. "Add your name before the @."
- A second @: point at the second one. "An email can only have one @." Fix: remove it.
- Two dots in a row, a dot at the start, or a dot right before the @: point at them.
- Nothing after the @, or a domain with no dot: point at the end. "Add the ending to acme, like acme.com." Fix: add .com.
- Common domain typos (gmial.com, gamil.com, hotmial.com, yaho.com, outlok.com and similar): point at the swapped letters and use the warning color instead of the error color. "Did you mean gmail.com?" Fix button: "Use gmail.com".

DRAWING
- Measure character positions with canvas measureText using the input's computed font, minus the input's scrollLeft. Clamp the mark inside the visible text area.
- The highlight sits behind the text: a transparent input over a red-3 box with a 2px red underline.
- An SVG overlay draws a cubic curve from just left of the message text to the bottom center of the highlighted characters, ending in a 2.5px dot. Animate the stroke (dash offset) over 420ms so it travels up to the character.
- Recalculate on input scroll, caret movement and resize.

TIMING
- Validate on blur, on Enter, and after an 800ms pause in typing. Hide the line while the person types.
- Valid input shows a quiet "Looks good." in the success color.

ACCESSIBILITY
- aria-invalid on the input; the message is linked with aria-describedby and announced politely. The line and highlight are aria-hidden.
- prefers-reduced-motion: no stroke animation.

Theme with CSS variables: danger, danger-soft, warn, warn-soft, success, accent, surface, sunken, text, muted, line.


APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: a white 44px text field with a 1px input border (8px corners) that turns Aqua 700 with a soft halo on focus, red on error and amber for soft warnings. The fix button and example inputs are small outline or tinted buttons.

DELIVER
The component, a demo with example inputs to try (a space, a double @, a comma, a missing ending, a gmail typo), and short usage notes. Export the validation rules as a pure function.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--amber-11: #ab6400  (dark: #ffca16)
--amber-9: #ffc53d
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #646A66  (dark: #A3A8A4)
--black: #000000
--border: #DCDED9  (dark: #313432)
--canvas: #FAFAF8  (dark: #0B0C0B)
--card: #FFFFFF  (dark: #161817)
--danger: #ce2c31  (dark: #d4373c)
--danger-soft: color-mix(in srgb, #ce2c31 16%, transparent)  (dark: color-mix(in srgb, #d4373c 30%, transparent))
--danger-soft-foreground: #AC2529  (dark: #ff9592)
--danger-text: #ca2b30  (dark: #ff9592)
--duration-base: 200ms
--duration-reduced: 120ms
--ease-out: cubic-bezier(0.22, 0.9, 0.24, 1)
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F3F2EE)
--green-11: #218358  (dark: #3dd68c)
--input: #C6C9C3  (dark: #434744)
--leading-body: 22px
--leading-small: 18px
--line: #DCDED9  (dark: #313432)
--line-strong: #C6C9C3  (dark: #434744)
--mist: #ECEBE6  (dark: #2B2E2D)
--muted: #ECEBE6  (dark: #2B2E2D)
--muted-foreground: #646A66  (dark: #A3A8A4)
--press-scale: 0.97
--primary: #000000  (dark: #79EEEC)
--radius-md: 8px
--radius-sm: 6px
--radius-xl: 16px
--radius-xs: 4px
--red-11: #ce2c31  (dark: #ff9592)
--ring: #0B7573  (dark: #79EEEC)
--shadow-sm: 0 1px 2px rgba(17, 17, 16, 0.04), 0 1px 3px rgba(17, 17, 16, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--shadow-xs: 0 1px 2px rgba(17, 17, 16, 0.05)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4))
--soft-ground: #F3F2EE  (dark: #0C0D0C)
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--subtle: #F3F2EE  (dark: #0C0D0C)
--success-text: #1f7b53  (dark: #3dd68c)
--text-body: 15px
--text-small: 13px
--tint-c: 0.4  (dark: 0.45)
--tint-l: 0.92  (dark: 0.32)
--warning: #ffc53d
--warning-text: #a15e00  (dark: #ffca16)
--white: #FFFFFF  (dark: #161817)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
