Build a "Point-at-Error" email field in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
When an email is invalid, the field highlights the exact character that's wrong, and the message appears in a callout under the field whose small pointer sits right under that character, with a one-tap fix when the fix is certain.

VALIDATION (return the index and length of the problem)
Checks run in this order; the first that fails is shown. The Fix button's label is given after each (no Fix button where none is listed).
- A space anywhere: point at the first space. "Remove the space. Email addresses can't contain spaces." Fix: "Remove spaces" (removes all of them).
- Disallowed characters , ; : < > ( ) [ ] \ " : point at it and name it: "Remove the comma. It isn't allowed in an email." Fix: "Remove it".
- No @: point at the end of the text with an empty dashed box. "Add an @ and your company domain, like @company.com."
- @ at the start: point at it. "Add your name before the @."
- A second @: point at the second one. "An email can only have one @." Fix: "Remove it".
- Two dots in a row: point at both. "Two dots in a row aren't allowed." Fix: "Use one dot".
- A dot at the start: "An email can't start with a dot." Fix: "Remove it". A dot right before the @: "Remove the dot right before the @." Fix: "Remove it".
- Nothing after the @: point at the end with the dashed box. "Add the domain after the @, like company.com."
- A domain that starts with a dot: "The domain can't start with a dot." Fix: "Remove it".
- A domain with no dot: point at the end. "Add the ending to acme, like acme.com." Fix: "Add .com". A domain ending in a dot: "Finish the ending after the dot, like .com."
- Common domain typos (gmial.com, gamil.com, hotmial.com, yaho.com, outlok.com and similar): point at the swapped letters and use the warning color instead of the error color. "Did you mean gmail.com?" Fix: "Use gmail.com".

DRAWING
- Measure character positions with canvas measureText using the input's computed font, minus the input's scrollLeft. Clamp the mark inside the visible text area.
- The highlight sits behind the text: a transparent input over a red-3 box with a 2px red underline.
- The message is a callout: a soft tint of the error's color (red, or amber for a soft warning) with 12px corners, flush with the field's left edge, hugging its content with equal 14px padding left and right (it widens only when the pointer must reach further right). The Fix button always sits on its own line under the message, whatever the message length. A 10px pointer (a rotated square in the same tint) on its top edge sits exactly under the center of the highlighted characters, kept at least 18px from the callout's corners, and glides when the character moves. The callout fades in from 4px above over 300ms. No line crosses any text. The Fix button inside is a lighter shade of the panel's own color (a 65% white wash in light mode, a 14% wash of the text color in dark mode, never solid white or gray), with colored text.
- Recalculate on input scroll, caret movement and resize.

TIMING
- Validate on blur, on Enter, and after an 800ms pause in typing. Hide the callout while the person types.
- Valid input shows a quiet "Looks good." in the success color, after a 14px Lucide check.

ACCESSIBILITY
- aria-invalid on the input; the message is linked with aria-describedby and announced politely. The highlight is aria-hidden.
- prefers-reduced-motion: no fade or glide; the callout simply appears.

Theme with CSS variables: danger, danger-soft, warn, warn-soft, success, accent, surface, sunken, text, muted, line.


APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Text that wraps to two or three lines reads as one paragraph whose lines are close in length, with the first line the longest (narrow the text block until that holds; never a long line with one or two words below it). A row with a title and a detail line under it sets each line at its own size and line height (detail 13/18 or 12/16, not the body's 22px), 2px apart, with equal space above and below (at least 8px), so the text never presses against a divider. A card's padding is measured to what you see: text at the top edge trims to its capitals (text-box: trim-start cap alphabetic) and text at the bottom edge to its baseline (text-box: trim-end cap alphabetic), so the space above matches the space below. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders. A letter, initials or a number in a tile, avatar or count badge is centered on its capital height, not its line box (display: block; align-content: center; text-align: center; text-box: trim-both cap alphabetic), at a size whose capitals leave equal space above and below: 14px bold in tiles from 26 to 40px.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji. Every count uses the singular for one ("1 file", "1 second", "1 person"), including counts set by data attributes.
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
--danger-soft-foreground: #AC2529  (dark: #ff9592)
--danger-text: #ca2b30  (dark: #ff9592)
--duration-base: 200ms
--duration-reduced: 120ms
--ease-out: cubic-bezier(0.22, 0.9, 0.24, 1)
--fill-on-tint: color-mix(in srgb, #FFFFFF 65%, transparent)  (dark: color-mix(in srgb, #F3F2EE 14%, transparent))
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F3F2EE)
--green-11: #218358  (dark: #3dd68c)
--input: #C6C9C3  (dark: #434744)
--leading-body: 22px
--leading-small: 18px
--lift: #FFFFFF  (dark: #3F4341)
--line: #DCDED9  (dark: #313432)
--line-strong: #C6C9C3  (dark: #434744)
--mist: #ECEBE6  (dark: #2B2E2D)
--muted: #ECEBE6  (dark: #2B2E2D)
--muted-foreground: #646A66  (dark: #A3A8A4)
--press-scale: 0.97
--primary: #000000  (dark: #79EEEC)
--radius-lg: 12px
--radius-md: 8px
--radius-sm: 6px
--radius-xl: 16px
--radius-xs: 4px
--raised: #FFFFFF  (dark: #3F4341)
--red-11: #ce2c31  (dark: #ff9592)
--ring: #0B7573  (dark: #79EEEC)
--shadow-sm: 0 1px 2px rgba(17, 17, 16, 0.04), 0 1px 3px rgba(17, 17, 16, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--shadow-xs: 0 1px 2px rgba(17, 17, 16, 0.05)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4))
--soft-ground: #F3F2EE  (dark: #0C0D0C)
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--spring-ui: linear(0, 0.0237, 0.0849, 0.1704, 0.2697, 0.3746, 0.4788, 0.5777, 0.6685, 0.7491, 0.8189, 0.8776, 0.9257, 0.9639, 0.9931, 1.0147, 1.0296, 1.0391, 1.0442, 1.046, 1.0451, 1.0425, 1.0387, 1.0342, 1.0294, 1.0246, 1.02, 1.0158, 1.012, 1.0087, 1.0059, 1.0037, 1.0019, 1.0005, 0.9994, 0.9987, 0.9982, 0.998, 0.9979, 0.9979, 1)
--spring-ui-duration: 460ms
--subtle: #F3F2EE  (dark: #0C0D0C)
--success-text: #1f7b53  (dark: #3dd68c)
--text-body: 15px
--text-small: 13px
--tint-c: 0.4  (dark: 0.45)
--tint-ink-l: 0.48  (dark: 1)
--tint-ink-min: 0  (dark: 0.75)
--tint-l: 0.92  (dark: 0.32)
--warning: #ffc53d
--warning-text: #a15e00  (dark: #ffca16)
--white: #FFFFFF  (dark: #161817)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
