Build a "Point-at-Error" email field in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
When an email is invalid, the field highlights the exact character that's wrong, and the message appears in a callout under the field whose small pointer sits right under that character, with a one-tap fix when the fix is certain.

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
- The message is a callout: a soft tint of the error's color (red, or amber for a soft warning) with 12px corners, flush with the field's left edge, hugging its content with equal 14px padding left and right (it widens only when the pointer must reach further right). The Fix button always sits on its own line under the message, whatever the message length. A 10px pointer (a rotated square in the same tint) on its top edge sits exactly under the center of the highlighted characters, kept at least 18px from the callout's corners, and glides when the character moves. The callout fades in from 4px above over 300ms. No line crosses any text. The Fix button inside is a lighter shade of the panel's own color (a 65% white wash in light mode, a 14% wash of the text color in dark mode, never solid white or gray), with colored text.
- Recalculate on input scroll, caret movement and resize.

TIMING
- Validate on blur, on Enter, and after an 800ms pause in typing. Hide the callout while the person types.
- Valid input shows a quiet "Looks good." in the success color.

ACCESSIBILITY
- aria-invalid on the input; the message is linked with aria-describedby and announced politely. The highlight is aria-hidden.
- prefers-reduced-motion: no fade or glide; the callout simply appears.

Theme with CSS variables: danger, danger-soft, warn, warn-soft, success, accent, surface, sunken, text, muted, line.


APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: a white 44px text field with a 1px input border (8px corners) that turns Aqua 700 with a soft halo on focus, red on error and amber for soft warnings. The fix button and example inputs are small outline or tinted buttons.

DELIVER
The component, a demo with example inputs to try (a space, a double @, a comma, a missing ending, a gmail typo), and short usage notes. Export the validation rules as a pure function.
