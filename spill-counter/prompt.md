Build a "Spill Counter" text field with a character limit in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Instead of a red number, characters typed past the limit visibly spill: they turn red and hang a little lower than the line, each one lower than the last, as if sliding off a ledge. A Trim button lets them fall away.

HOW IT'S BUILT
- A textarea with transparent text and a visible caret, layered over a "mirror" div that renders the same text with identical font, padding, line-height, letter-spacing, white-space: pre-wrap and overflow-wrap: break-word. The textarea auto-grows to its scrollHeight so nothing scrolls out of sync.
- The mirror renders characters up to the limit as plain text, and every character past it as its own inline span with position: relative and top = min(1 + i × 0.45, 9)px (relative offsets keep line breaks identical to the textarea).
- Newly typed excess characters drop in: animate top from −10px with a pop spring, opacity 0 → 1.

COUNTER
- A 24px ring (r = 9, stroke 2.5) fills black (Aqua in dark mode) as you type. With 10 or fewer left it turns amber; over the limit it turns red and a small drop drips from the bottom of the ring every 1.4s.
- A number appears beside the ring once 20 or fewer characters remain, and goes negative when over.
- A polite live region says "8 characters left." or "7 characters over the limit."

ACTIONS
- Trim: a soft red button, "Trim 7 Characters", shown only when over. Pressing it makes the excess characters fall (top → 34px, fade, 0.42s, staggered 14ms from the last character backwards, capped at 320ms), then cuts the value to the limit and puts the caret at the end.
- Post: a filled primary button, disabled when empty or over the limit.
- Demo: a "Keep Typing for Me" button that types a long phrase at 40ms per character.

Reduced motion: no drop, fall or drip animations; colors and counts still change.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the field is a white 8px rounded text area with a 1px Line border, an Aqua 700 ring on focus and a red ring when over. The ring sits beside Trim and Post in the footer.

DELIVER
The component with a configurable limit (default 80), a demo headline field, and short usage notes.
