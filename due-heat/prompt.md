Build "Due Heat" deadline chips in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Instead of a sudden switch to red, due dates warm up continuously as they approach: calm gray days out, blue, then amber, then red, with a pulse that quickens in the final day.

BEHAVIOR
1. Each task row has a chip with a dot and a countdown ("in 9h", "in 2d", "45m overdue").
2. Heat = (1 − hours left / 72)^2.2, clamped 0–1, and 1 when overdue. Map it to a color by blending between stops in sRGB: 0 muted text, 0.3 info blue, 0.72 warning amber, 1 danger red (read the status text tokens, so dark mode gets the lighter versions). Never interpolate hue directly; that passes through green and reads as "fine".
   Chip background = the color at 14% (22% in dark mode); text = the color mixed 72% with black (70% with white in dark mode); dot = the color.
3. Inside the last 24 hours, the dot emits a soft ring pulse whose period shortens with time left: 0.6s + hours/24 × 1.8s.
4. When a task becomes overdue, the chip turns solid red-tinted, reads "2h overdue", and shakes once.
5. Update every 30 seconds in real time. Demo: a "Move time forward" slider (0–72 hours) drives a pretend clock and a "+12 hours" label so the full range can be seen.
6. Each chip has an aria-label like "Due in 9h".
Reduced motion: no pulse or shake; color still changes.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: chips are pills in a 14px rounded list with 52px rows; the heat colors are computed rather than picked from the system palette, so check contrast at both ends.

DELIVER
The component with due dates as inputs, the demo slider, and short usage notes.
