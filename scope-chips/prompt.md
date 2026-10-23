Build "Scope Chips" for advanced search in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Power-user search syntax becomes friendly: typing from:mira, in:billing or is:unread morphs the token into a colored chip, and backspacing into a chip melts it back into editable text.

BEHAVIOR
1. A search field holds chips and a text input. Filter keys (demo): from (people, Pink), in (channels, Aqua), is (status, green), each with a list of valid values.
2. A token becomes a chip when it's followed by a space, picked from suggestions, or Enter is pressed. Partial values autocomplete to the first match ("from:mi" → From Mira). A new chip grows from the left with a pop spring (scaleX 0.6 → 1) and shows the key label small and the value in semibold, plus a remove button.
3. Typing a key prefix suggests keys ("f" → from:); typing "key:" suggests values. Suggestions appear in a small popover under the field; Arrow keys move, Enter or Tab picks, Escape closes. Use role listbox and aria-activedescendant.
4. Backspace in an empty input melts the last chip (scaleX shrink and fade, 0.24s) and puts its raw text ("from:mira") back in the input for editing.
5. Only one value per key except is:, which can stack.
6. Results update live: all filters must match, and any free text matches titles and previews. Results slide in, 30ms apart. "No messages match these filters." when empty.
7. A hint line explains the syntax with inline code chips.
Reduced motion: chips appear and disappear without springs.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the field is an 8px rounded white box with a 1px Line border with a search icon; chips are 30px pills tinted with their key color at 14%.

DELIVER
The component with keys, values and data as configuration, the demo inbox, and short usage notes.
