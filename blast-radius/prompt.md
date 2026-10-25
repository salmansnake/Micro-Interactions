Build a "Blast Radius" delete button in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Before someone deletes something, show them exactly what goes with it. Hovering or focusing the delete button marks every element on the page that will be removed, and every related element that will be kept.

MARKUP CONTRACT
- The trigger has data-blast-trigger="<key>".
- Anything that will be deleted has data-blast-member="<key>". These can live anywhere on the page: sidebar, lists, headers.
- Anything related that survives has data-blast-keep="<key>".

BEHAVIOR
1. Preview (hover or keyboard focus): each member gets a 1.5px dashed danger outline with a 2px offset, a faint danger tint, its name struck through, scale 0.985, and a small "Deletes" pill that expands at the end of the row. Kept items get a success outline and a "Stays" pill.
2. Stagger the preview as a ripple from the button: delay = distance in px × 0.35ms, capped at 320ms. Kept items start 60ms later. Leaving the button clears everything at once with no delay.
3. The button fills with the danger color and shows a count chip ("5 items").
4. First click arms it: the label becomes "Delete 5 Items", the footnote beside it says "Click again within 3 seconds to confirm.", and a lighter fill drains across the button over 3 seconds. It disarms when time runs out, when the button loses focus, or on Escape.
5. Second click deletes: each member fades and scales to 0.92, then collapses its height, padding and margins to 0 (about 460ms, same ripple delays), then is hidden. A section whose rows are all deleted collapses as a whole, heading included (280ms), so no empty headings or lines are left behind.
6. The page says what happened: the title turns muted and the line beside it changes to "Deleted just now · Workspace items kept" (any element with data-blast-after="<text>" swaps to that text). Counts of things that stay, like members, don't change.
7. The danger zone's box, text and button give way to an Undo banner that rises into the same spot: "<Name> deleted" with an Undo button, so it never covers other content. Undo restores every section and member with a short fade-in, and puts the header text back.

DETAILS
- No confirm() dialogs. The armed state is the confirmation.
- Touch: the first tap previews and arms in one step.
- Recount members each time the preview opens so dynamic lists stay correct.
- prefers-reduced-motion: no ripple and no collapse animation, instant state changes. Keep the countdown fill.
- Theme through CSS variables: danger, on-danger, danger-soft, success, success-soft, surface, sunken, text, muted, line, radius. Must work in light and dark.


APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: rows sit in white bordered lists (12px corners) on the Soft ground; the delete button is a soft red button (8px corners, label exactly centered: the hidden count chip takes no space until it shows) that fills solid red with white text on preview; while armed, a lighter fill drains across it and the footnote reads "Click again within 3 seconds to confirm." The Undo banner is a Frost pill centered in the danger zone's place.

DELIVER
The component, a small demo (a project page with a sidebar entry, two environments, two files, and two workspace items that stay), and short usage notes.
