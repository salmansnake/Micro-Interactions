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
- prefers-reduced-motion: no ripple and no collapse animation; every state change is a 120ms linear fade. Keep the countdown fill.
- Theme through CSS variables: danger, on-danger, danger-soft, success, success-soft, surface, sunken, text, muted, line, radius. Must work in light and dark.


APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Text that wraps to two or three lines reads as one paragraph whose lines are close in length, with the first line the longest (narrow the text block until that holds; never a long line with one or two words below it). A row with a title and a detail line under it sets each line at its own size and line height (detail 13/18 or 12/16, not the body's 22px), 2px apart, with equal space above and below (at least 8px), so the text never presses against a divider. A card's padding is measured to what you see: text at the top edge trims to its capitals (text-box: trim-start cap alphabetic) and text at the bottom edge to its baseline (text-box: trim-end cap alphabetic), so the space above matches the space below. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders. A letter, initials or a number in a tile, avatar or count badge is centered on its capital height, not its line box (display: block; align-content: center; text-align: center; text-box: trim-both cap alphabetic), at a size whose capitals leave equal space above and below: 14px bold in tiles from 26 to 40px.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji. Every count uses the singular for one ("1 file", "1 second", "1 person"), including counts set by data attributes.
- This one: rows sit in white bordered lists (12px corners) on the Soft ground; the delete button is a soft red button (8px corners, label exactly centered: the hidden count chip takes no space until it shows) that fills solid red with white text on preview; while armed, a lighter fill drains across it and the footnote reads "Click again within 3 seconds to confirm." The Undo banner is a Frost pill centered in the danger zone's place.

DELIVER
The component, a small demo (a project page with a sidebar entry, two environments, two files, and two workspace items that stay), and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #646A66  (dark: #A3A8A4)
--black: #000000
--blur-md: 16px
--border: #DCDED9  (dark: #313432)
--card: #FFFFFF  (dark: #161817)
--danger: #ce2c31  (dark: #d4373c)
--danger-border: #f4a9aa  (dark: #8c333a)
--danger-foreground: #ffffff
--danger-soft: color-mix(in srgb, #ce2c31 16%, transparent)  (dark: color-mix(in srgb, #d4373c 30%, transparent))
--danger-soft-foreground: #AC2529  (dark: #ff9592)
--danger-subtle: #feebec  (dark: #3b1219)
--danger-text: #ca2b30  (dark: #ff9592)
--duration-base: 200ms
--duration-reduced: 120ms
--duration-slow: 320ms
--ease-out: cubic-bezier(0.22, 0.9, 0.24, 1)
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F3F2EE)
--frost: rgba(255, 255, 255, 0.74)  (dark: rgba(21, 23, 22, 0.74))
--frost-border: rgba(0, 0, 0, 0.08)  (dark: rgba(243, 242, 238, 0.1))
--frost-saturate: 160%
--green-11: #218358  (dark: #3dd68c)
--green-3: #e6f6eb  (dark: #132d21)
--leading-body: 22px
--leading-caption: 16px
--leading-small: 18px
--leading-title: 28px
--line: #DCDED9  (dark: #313432)
--mist: #ECEBE6  (dark: #2B2E2D)
--muted: #ECEBE6  (dark: #2B2E2D)
--muted-foreground: #646A66  (dark: #A3A8A4)
--press-scale: 0.97
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-full: 9999px
--radius-lg: 12px
--radius-md: 8px
--radius-xl: 16px
--red-11: #ce2c31  (dark: #ff9592)
--red-3: #feebec  (dark: #3b1219)
--red-7: #f4a9aa  (dark: #8c333a)
--ring: #0B7573  (dark: #79EEEC)
--shadow-lg: 0 4px 8px -2px rgba(17, 17, 16, 0.06), 0 16px 32px -8px rgba(17, 17, 16, 0.14)  (dark: 0 4px 8px -2px rgba(0, 0, 0, 0.5), 0 16px 32px -8px rgba(0, 0, 0, 0.55))
--soft-ground: #F3F2EE  (dark: #0C0D0C)
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--spring-ui: linear(0, 0.0237, 0.0849, 0.1704, 0.2697, 0.3746, 0.4788, 0.5777, 0.6685, 0.7491, 0.8189, 0.8776, 0.9257, 0.9639, 0.9931, 1.0147, 1.0296, 1.0391, 1.0442, 1.046, 1.0451, 1.0425, 1.0387, 1.0342, 1.0294, 1.0246, 1.02, 1.0158, 1.012, 1.0087, 1.0059, 1.0037, 1.0019, 1.0005, 0.9994, 0.9987, 0.9982, 0.998, 0.9979, 0.9979, 1)
--spring-ui-duration: 460ms
--subtle: #F3F2EE  (dark: #0C0D0C)
--success: #218358
--success-subtle: #e6f6eb  (dark: #132d21)
--success-text: #1f7b53  (dark: #3dd68c)
--text-body: 15px
--text-caption: 12px
--text-small: 13px
--text-title: 20px
--text-ui: 14px
--tracking-title: -0.015em
--white: #FFFFFF  (dark: #161817)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
