Build a "Spill Counter" text field with a character limit in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Instead of a red number, characters typed past the limit visibly spill: they turn red and hang a little lower than the line, each one lower than the last, as if sliding off a ledge. A Trim button lets them fall away.

HOW IT'S BUILT
- A textarea with transparent text and a visible caret, layered over a "mirror" div that renders the same text with identical font, padding, line-height, letter-spacing, white-space: pre-wrap and overflow-wrap: break-word. The textarea auto-grows to its scrollHeight so nothing scrolls out of sync.
- The mirror renders characters up to the limit as plain text, and every character past it as its own inline span with position: relative. On every line of spilled characters, each sits lower than the one before: measure each span at top 0, group them by line, and set top from 1px where that line's spill starts to 9px at the field's right edge, so every line keeps sliding off, not just the first (relative offsets keep line breaks identical to the textarea).
- Newly typed excess characters drop in: animate top from −10px with a pop spring, opacity 0 → 1.

COUNTER
- A 24px ring (r = 9, stroke 2.5) fills black (Aqua in dark mode) as you type. With 10 or fewer left it turns amber; over the limit it turns red and a small drop drips from the bottom of the ring every 1.4s.
- A number appears beside the ring once 20 or fewer characters remain, and goes negative when over. The ring and its number are one tight pair (6px apart), with more space before the next button.
- A polite live region says "8 characters left." or "7 characters over the limit."

ACTIONS
- Trim: a soft red button, "Trim 7 Characters", shown only when over. Pressing it makes the excess characters fall (top → 34px, fade, 0.48s, the slower duration token, staggered 14ms from the last character backwards, capped at 320ms), then cuts the value to the limit and puts the caret at the end.
- Post: a filled primary button, disabled when empty or over the limit.
- Demo: a "Keep Typing for Me" button that types a long phrase at 40ms per character.

Reduced motion: no drop, fall or drip animations; colors and counts still change.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Text that wraps to two or three lines reads as one paragraph whose lines are close in length, with the first line the longest (narrow the text block until that holds; never a long line with one or two words below it). A row with a title and a detail line under it sets each line at its own size and line height (detail 13/18 or 12/16, not the body's 22px), 2px apart, with equal space above and below (at least 8px), so the text never presses against a divider. A card's padding is measured to what you see: text at the top edge trims to its capitals (text-box: trim-start cap alphabetic) and text at the bottom edge to its baseline (text-box: trim-end cap alphabetic), so the space above matches the space below. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders. A letter, initials or a number in a tile, avatar or count badge is centered on its capital height, not its line box (display: block; align-content: center; text-align: center; text-box: trim-both cap alphabetic), at a size whose capitals leave equal space above and below: 14px bold in tiles from 26 to 40px.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji. Every count uses the singular for one ("1 file", "1 second", "1 person"), including counts set by data attributes.
- This one: the field is a white 8px rounded text area with a 1px Line border, an Aqua 700 ring on focus and a red ring when over. The status message ("208 characters over the limit.", "Trimmed to 80 characters.") sits on its own line right under the field and takes no space when empty; below it, one right-aligned row holds the ring with its number, Trim and Post.

DELIVER
The component with a configurable limit (default 80), a demo headline field, and short usage notes.
