Build a "Preview Palette" command palette in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Command palettes make you commit blind. This one previews each command live on the page while it's highlighted: the theme, accent, density or sort changes behind the palette, and Escape puts everything back.

BEHAVIOR
1. Open with ⌘K / Ctrl+K while focus is inside the app, or with a "Commands ⌘K" button. The palette is a Frost sheet: a search input, grouped options, and a help row ("↑ ↓ preview · ↵ apply · esc revert").
2. Demo commands: Appearance (Dark Mode, Light Mode), Accent (Aqua, Sage, Orange, Olive, each with a color swatch), Density (Compact, Comfortable), Sort Pages (By Name, By Most Recent). The current setting of each is marked "Current".
3. Highlighting an option by arrow key or hover applies it to the app immediately as a preview: colors cross-fade (0.39s), density springs paddings, and sorting reorders rows with FLIP. While previewing something different from the saved state, the app gets a 2px Aqua ring and a "Previewing" badge.
4. Moving the pointer off the list, pressing Escape, or clicking outside reverts to the saved state. Enter or click commits it, closes the palette, and announces "Accent set to Sage."
5. Typing filters options; the first match is highlighted and previewed. Use role listbox/option with aria-activedescendant.
Reduced motion: changes apply in 100ms without springs or FLIP.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the palette is a 340px Frost sheet with 16px corners over the app; the highlighted option is a solid primary row (Black with white text, Aqua with black text in dark mode).

DELIVER
The component with commands as data (key, value, label, group), the demo app, and short usage notes.
