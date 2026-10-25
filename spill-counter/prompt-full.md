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
- Trim: a soft red button, "Trim 7 Characters", shown only when over. Pressing it makes the excess characters fall (top → 34px, fade, 0.42s, staggered 14ms from the last character backwards, capped at 320ms), then cuts the value to the limit and puts the caret at the end.
- Post: a filled primary button, disabled when empty or over the limit.
- Demo: a "Keep Typing for Me" button that types a long phrase at 40ms per character.

Reduced motion: no drop, fall or drip animations; colors and counts still change.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the field is a white 8px rounded text area with a 1px Line border, an Aqua 700 ring on focus and a red ring when over. The status message ("208 characters over the limit.", "Trimmed to 80 characters.") sits on its own line right under the field and takes no space when empty; below it, one right-aligned row holds the ring with its number, Trim and Post.

DELIVER
The component with a configurable limit (default 80), a demo headline field, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--amber-9: #ffc53d
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #646A66  (dark: #A3A8A4)
--black: #000000
--border: #DCDED9  (dark: #313432)
--brand: #79EEEC
--card: #FFFFFF  (dark: #161817)
--danger: #ce2c31  (dark: #d4373c)
--danger-soft: color-mix(in srgb, #ce2c31 16%, transparent)  (dark: color-mix(in srgb, #d4373c 30%, transparent))
--danger-soft-foreground: #AC2529  (dark: #ff9592)
--danger-text: #ca2b30  (dark: #ff9592)
--duration-base: 200ms
--duration-reduced: 120ms
--duration-slower: 480ms
--ease-out: cubic-bezier(0.22, 0.9, 0.24, 1)
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F3F2EE)
--input: #C6C9C3  (dark: #434744)
--leading-body: 22px
--leading-small: 18px
--leading-title-sm: 24px
--line: #DCDED9  (dark: #313432)
--line-strong: #C6C9C3  (dark: #434744)
--mist: #ECEBE6  (dark: #2B2E2D)
--muted: #ECEBE6  (dark: #2B2E2D)
--muted-foreground: #646A66  (dark: #A3A8A4)
--press-scale: 0.97
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-lg: 12px
--radius-sm: 6px
--radius-xl: 16px
--radius-xs: 4px
--red-11: #ce2c31  (dark: #ff9592)
--ring: #0B7573  (dark: #79EEEC)
--shadow-sm: 0 1px 2px rgba(17, 17, 16, 0.04), 0 1px 3px rgba(17, 17, 16, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--soft-ground: #F3F2EE  (dark: #0C0D0C)
--spring-pop: linear(0, 0.0413, 0.1464, 0.2895, 0.4487, 0.6073, 0.7529, 0.8776, 0.9776, 1.0517, 1.1013, 1.1292, 1.1394, 1.1357, 1.1225, 1.1033, 1.0813, 1.059, 1.0382, 1.0202, 1.0055, 0.9945, 0.9869, 0.9825, 0.9807, 0.9808, 0.9825, 0.985, 0.9881, 0.9912, 0.9941, 0.9967, 0.9989, 1.0005, 1.0017, 1.0024, 1.0027, 1.0027, 1.0025, 1.0022, 1)
--spring-pop-duration: 680ms
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--subtle: #F3F2EE  (dark: #0C0D0C)
--text-body: 15px
--text-small: 13px
--text-title-sm: 17px
--tint-c: 0.4  (dark: 0.45)
--tint-l: 0.92  (dark: 0.32)
--tracking-title: -0.015em
--warning: #ffc53d
--white: #FFFFFF  (dark: #161817)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
