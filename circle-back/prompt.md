Build a "Circle Back Boomerang" for a message composer in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
"Let's circle back next week" turns into a boomerang. Send the message and it spins away. A week later it flies back and lands as a reminder of what you promised.

BEHAVIOR
1. "To: Sam Rivera", a 14px message field ("Love this idea. Let's circle back next week once the numbers are in."), and a Send button.
2. Detect promise phrases (circle back, follow up, touch base, loop back, revisit this, get back to you) and a rough time (tomorrow, a weekday, in a few days; otherwise next week). Under the field: a small orange boomerang that wiggles, then "Boomerang ready for "circle back". It comes back Thursday, Oct 29."
3. Send: an orange boomerang SVG flies from the button up in an arc and off the right edge, spinning five full turns (1.1s). Status: "Sent. Reminder set for Thursday, Oct 29. It'll come back." A "Skip Ahead a Week" button appears for the demo.
4. Skip ahead: the boomerang flies back in from the right, spinning the other way, and lands on a reminder card that springs in:
   - The card is tinted orange (the fixed-lightness tint) with an elevation shadow and no border. Open Thread is the main button, black with white text in light mode and off-white with dark text in dark mode (never Aqua on the orange tint); Circle Back Again is a lighter shade of the panel's own color (a 65% white wash in light mode, a 14% wash of the text color in dark mode, never solid white or gray), never the plain gray fill, which dissolves into the tint. It reads "A Week Later" and "You told Sam: "Let's circle back next week once the numbers are in."".
   - Its buttons are Open Thread and Circle Back Again ("Again? Bold. See you Thursday, Oct 29.").
5. No phrase found: "Sent. No boomerang, so you'll have to remember this one yourself."
Reduced motion: no flight; the reminder just appears.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the reminder is the only elevated card; the boomerang flies above everything inside the clipped card.

DELIVER
The component with phrases, the date parser and an onRemind callback as inputs, the demo, and short usage notes.
