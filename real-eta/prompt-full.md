Build a "Real ETA" delivery tracker in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Instead of a promised date that quietly slips, delivery is shown as an honest range: a bar for each day, as tall as the chance it arrives that day. As the package moves, the range narrows until it's "Today, 2–4 PM".

BEHAVIOR
1. A card: a 40px gray tile with Lucide `package` (20px) beside "Standing desk" (15px semibold) and where it is ("Ordered · Austin, TX", 13/18 gray).
2. A chart box (12px corners, the soft neutral inset for charts: the gray inset): the headline "Most likely Thu, Nov 12" (17/24 semibold) over the odds ("80% chance by Sat", 13/18 gray), then five day columns (Wed, Thu, Fri, Sat, Mon; 8px gaps, 112px tall): the percentage (11px mono gray), a bar up to 72px tall scaled from its bottom by the chance (4px top corners, an Aqua highlight tint), and the day (12px gray). The most likely day's bar is Aqua 700 (Aqua in dark), its label and number in the text color, semibold.
3. Under the box, four steps on a rail (10px dots, a 2px line between them): Ordered, Shipped, In Austin, Delivering (one line each). Steps reached are filled Aqua 700 with semibold labels.
4. Under the steps, the status on its own full-width line (13/18 body gray), kept as tall as the longest of the four messages at the current width so the card never changes height; under it, a primary "Move Time Forward" (Lucide `clock`) on the right. Each press moves to the next stage; bars change height on the panel spring:
   - Ordered: 10, 35, 30, 15, 10%. "A range, because we don’t know yet. It narrows as we learn more along the way."
   - Shipped from Dallas: 15, 50, 25, 10, 0%. "Left Dallas this morning. Monday is off the table, and Thursday is now the best bet."
   - At the Austin hub: 0, 85, 15, 0, 0%. "In Austin at the local hub. Thursday it is, unless the trucks are full that day."
   - Delivering (subtitle "Out for delivery"): 0, 100, 0, 0, 0%. Headline "Today, 2–4 PM", odds "It’s on the truck", "On the truck and a few stops away. Between 2 and 4 PM today, so keep an eye out." The button is then disabled.
5. The odds line is the first day by which the chance adds up to 80% ("80% chance by Fri"), or "85% chance on Thu" when that day is the most likely one. A zero hides its percentage. Each day has a label like "Thu, Nov 12: 35% chance".
6. The status is a polite live region.
Reduced motion: bars change in 120ms.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: neutral grounds (Canvas #EBEBEB page, White #FFFFFF cards on it, Soft ground #F7F7F7 for insets inside a card; in dark the inset sits a step lighter than the card, so a panel that holds white cards, tiles or buttons takes the page ground there and they stay raised), Black #000 headlines, Slate #4E4E4E body text, Line #DDDDDD borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Text wraps the standard way: it runs to the padding, or to the standard gap before a button, then breaks onto the next line; nothing narrows or balances it, and the last line is never a lone word. A row with a title and a detail line under it sets each line at its own size and line height (detail 13/18 or 12/16, not the body's 22px), 2px apart, with equal space above and below (at least 8px), so the text never presses against a divider. A card's padding is measured to what you see: text at the top edge trims to its capitals (text-box: trim-start cap alphabetic) and text at the bottom edge to its baseline (text-box: trim-end cap alphabetic), so the space above matches the space below. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders. A letter, initials or a number in a tile, avatar or count badge is centered on its capital height, not its line box (display: block; align-content: center; text-align: center; text-box: trim-both cap alphabetic), at a size whose capitals leave equal space above and below: 14px bold in tiles from 26 to 40px.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji. Every count uses the singular for one ("1 file", "1 second", "1 person"), including counts set by data attributes.
- This one: the chart box is neutral; Aqua carries the bars and the progress.

DELIVER
The component with the days and each stage's chances as inputs, the demo, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #686868  (dark: #A6A6A6)
--black: #000000
--body: #4E4E4E  (dark: #CCCCCC)
--border: #DDDDDD  (dark: #333333)
--border-strong: #C8C8C8  (dark: #464646)
--brand-strong: #0B7573  (dark: #79EEEC)
--card: #FFFFFF  (dark: #171717)
--duration-base: 200ms
--duration-fast: 140ms
--duration-reduced: 120ms
--font-mono: "Geist Mono", ui-monospace, "Cascadia Code", Menlo, Consolas, monospace
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F2F2F2)
--leading-body: 22px
--leading-caption: 16px
--leading-small: 18px
--leading-title-sm: 24px
--line: #DDDDDD  (dark: #333333)
--line-strong: #C8C8C8  (dark: #464646)
--mist: #EBEBEB  (dark: #2D2D2D)
--mist-strong: #E2E2E2  (dark: #363636)
--muted: #EBEBEB  (dark: #2D2D2D)
--muted-foreground: #686868  (dark: #A6A6A6)
--muted-hover: #E2E2E2  (dark: #363636)
--press-scale: 0.97
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-lg: 12px
--radius-md: 8px
--radius-sm: 6px
--radius-xl: 16px
--ring: #0B7573  (dark: #79EEEC)
--shadow-sm: 0 1px 2px rgba(17, 17, 17, 0.04), 0 1px 3px rgba(17, 17, 17, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--slate: #4E4E4E  (dark: #CCCCCC)
--soft-ground: #F7F7F7  (dark: #1F1F1F)
--spring-panel: linear(0, 0.0198, 0.069, 0.1356, 0.211, 0.2893, 0.3667, 0.4407, 0.5096, 0.5727, 0.6297, 0.6805, 0.7255, 0.765, 0.7995, 0.8294, 0.8552, 0.8774, 0.8964, 0.9127, 0.9265, 0.9382, 0.9482, 0.9566, 0.9637, 0.9696, 0.9746, 0.9788, 0.9824, 0.9853, 0.9878, 0.9899, 0.9916, 0.993, 0.9942, 0.9952, 0.996, 0.9967, 0.9973, 0.9978, 1)
--spring-panel-duration: 530ms
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--subtle: #F7F7F7  (dark: #1F1F1F)
--text-body: 15px
--text-caption: 12px
--text-small: 13px
--text-title-sm: 17px
--text-ui: 14px
--tint-c: 0.4  (dark: 0.45)
--tint-mark-l: 0.88  (dark: 0.32)
--white: #FFFFFF  (dark: #171717)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
