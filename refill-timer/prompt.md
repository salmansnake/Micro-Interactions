Build a "Refill Timer" for rate-limited actions in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
When someone runs out of generations, the button doesn't go dead. It becomes the timer: it fills up as the next credit returns, and each credit dot refills like a small tank, so people can see exactly when they can act again.

STATE
- max credits (demo: 5) and a refill time per credit (demo: 3s; in production, minutes). Credits are a fractional number that rises over time with requestAnimationFrame while below max, and the loop stops when full.

CREDIT DOTS
- One 12px circle per credit with a 1.5px Aqua 700 ring at 40%. Each fills from the bottom: fill = clamp(credits − i, 0, 1), so the dot that is refilling shows a partial level.
- Spending a credit squeezes that dot (scale 0.6 and back, press spring). A dot that finishes refilling pops (scale 1.5 and back, pop spring).
- Text above: "3 of 5 generations left", with the count in semibold tabular numbers.

THE BUTTON
- With credits: a filled primary button (Aqua in dark mode), "Generate". Each press spends one credit and adds a result to the top of a list (keep the newest 3; each slides in with a ui spring).
- With none: it turns gray (Soft ground), sets aria-disabled, and a soft Aqua fill sweeps left to right inside it, tracking the next credit's progress. The label counts down: "Next in 2s".
- When a credit returns, the button bumps (scale 1.06 and back) and reads "Generate" again.

Also: a footnote explaining the refill rate, an empty state ("Your ideas appear here.") in a dashed 12px box, and a polite live region on the results list.
Reduced motion: no pops, bumps or slide-ins; the fill and countdown still update.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: results are 12px rounded rows in Soft ground. The timer state reuses the same pill, so the button never changes size.

DELIVER
The component with configurable max credits and refill time, a demo generator, and short usage notes.
