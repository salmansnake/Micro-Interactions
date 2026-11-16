Build "Source Receipts" for an AI answer in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Every sentence of the AI's answer shows where it came from. Point at a source number and the sentence and its source light up together. A sentence with nothing behind it doesn't pretend: it's marked "My guess", in plain sight.

BEHAVIOR
1. A card. Your question at the right: "How much would yearly billing save us?" (a primary-color bubble, 16px corners, bottom right 4px).
2. The answer: a 28px Orange circle with a black Lucide `sparkles` (14px), then the text (14px on 24px lines, text-wrap: pretty), three sentences, each ending in a small chip (14px capsule, 9px semibold, sitting inside the sentence's highlight box with the same 2px of highlight above, below and to its right, its top anchored to the highlight):
   - "Pro is $24 per seat each month, or $20 when you pay yearly." [1]
   - "With your 18 seats, yearly saves $864 a year." [2]
   - "Most teams your size switch within three months." [My guess]: an Amber-tint chip with amber text, and the sentence has the dotted amber "unsure" underline (2px, 4px offset).
3. Sources under the answer, as gray inset rows (8px corners): a 22px round number, the name (13/18 semibold) and detail (12px): "1 · Atlas pricing page · atlas.io/pricing · checked today", "2 · Your billing settings · 18 seats on Pro, billed monthly".
4. Pointing at a number chip lights its sentence (a Blue highlight tint behind it) and its source row (a Blue tint, the number turning solid Blue with white). Pressing pins it (aria-expanded) and says "From Atlas pricing page: atlas.io/pricing · checked today." Pressing "My guess": "No source for that one. It’s a guess, and it says so."
5. "Hide Guesses" (gray, a toggle) fades every unsourced sentence to 35% and strikes it through: "Showing only what has a source. 1 guess struck out for now." It becomes "Show Guesses" (same width): "Guesses are back, and each one is still marked as a guess." ("2 guesses" for more.)
6. The status takes no space until it has text and is a polite live region.
Reduced motion: highlights change in 120ms.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: neutral grounds (Canvas #EBEBEB page, White #FFFFFF cards on it, Soft ground #F7F7F7 for insets inside a card; in dark the inset sits a step lighter than the card, so a panel that holds white cards, tiles or buttons takes the page ground there and they stay raised), Black #000 headlines, Slate #4E4E4E body text, Line #DDDDDD borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Text wraps the standard way: it runs to the padding, or to the standard gap before a button, then breaks onto the next line; nothing narrows or balances it, and the last line is never a lone word. A row with a title and a detail line under it sets each line at its own size and line height (detail 13/18 or 12/16, not the body's 22px), 2px apart, with equal space above and below (at least 8px), so the text never presses against a divider. A card's padding is measured to what you see: text at the top edge trims to its capitals (text-box: trim-start cap alphabetic) and text at the bottom edge to its baseline (text-box: trim-end cap alphabetic), so the space above matches the space below. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders. A letter, initials or a number in a tile, avatar or count badge is centered on its capital height, not its line box (display: block; align-content: center; text-align: center; text-box: trim-both cap alphabetic), at a size whose capitals leave equal space above and below: 14px bold in tiles from 26 to 40px.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji. Every count uses the singular for one ("1 file", "1 second", "1 person"), including counts set by data attributes.
- This one: Orange for the AI, Blue for sourced, Amber for guesses.

DELIVER
The component with the answer's sentences (each with a source or none) and the sources as inputs, the demo, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--ai: #FE8C5F
--ai-foreground: #000000
--amber-11: #ab6400  (dark: #ffca16)
--amber-9: #ffc53d
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #686868  (dark: #A6A6A6)
--black: #000000
--blue-11: #0d74ce  (dark: #70b8ff)
--body: #4E4E4E  (dark: #CCCCCC)
--border: #DDDDDD  (dark: #333333)
--card: #FFFFFF  (dark: #171717)
--duration-base: 200ms
--duration-fast: 140ms
--duration-reduced: 120ms
--fill-on-subtle: color-mix(in oklab, #EBEBEB 95%, #000000)  (dark: #2D2D2D)
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F2F2F2)
--info: #0d74ce
--leading-body: 22px
--leading-caption: 16px
--leading-small: 18px
--leading-ui: 20px
--line: #DDDDDD  (dark: #333333)
--mark-ink: #ffc53d  (dark: #ffca16)
--mark-l-strong: 0.56  (dark: 0.87)
--mark-offset: 4px
--mark-thickness: 2px
--mist: #EBEBEB  (dark: #2D2D2D)
--mist-strong: #E2E2E2  (dark: #363636)
--muted: #EBEBEB  (dark: #2D2D2D)
--muted-foreground: #686868  (dark: #A6A6A6)
--muted-hover: #E2E2E2  (dark: #363636)
--muted-on-tint: #4E4E4E  (dark: #A6A6A6)
--on-color: #ffffff
--orange: #FE8C5F
--press-scale: 0.97
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-full: 9999px
--radius-md: 8px
--radius-xl: 16px
--radius-xs: 4px
--ring: #0B7573  (dark: #79EEEC)
--shadow-sm: 0 1px 2px rgba(17, 17, 17, 0.04), 0 1px 3px rgba(17, 17, 17, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--slate: #4E4E4E  (dark: #CCCCCC)
--soft-ground: #F7F7F7  (dark: #1F1F1F)
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--subtle: #F7F7F7  (dark: #1F1F1F)
--text-body: 15px
--text-caption: 12px
--text-small: 13px
--text-ui: 14px
--tint-c: 0.4  (dark: 0.45)
--tint-ink-l: 0.48  (dark: 1)
--tint-ink-min: 0  (dark: 0.75)
--tint-l: 0.92  (dark: 0.32)
--tint-mark-l: 0.88  (dark: 0.32)
--warning: #ffc53d
--warning-foreground: #000000
--warning-text: #a15e00  (dark: #ffca16)
--white: #FFFFFF  (dark: #171717)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
