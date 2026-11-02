Build a "404 Search Party" in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
On a missing page, three little cursors with flashlights sweep a dark room looking for it. Your pointer carries a flashlight too. After a few seconds one of them finds the clue, the typo in the address, and the page suggests where you meant to go.

BEHAVIOR
1. A card: "404 · We can’t find that page" (15px semibold) with "A search party is out looking. Move your pointer to help." (13/18 gray).
2. The room: a 180px dark inset (12px corners). It's a scene, so its colors are fixed in light and dark: a dark Sage-tinted black. In it, faint mono words lie around ("/old-blog", "/careers-2019", "/beta") and the clue in Aqua ("/pricng", 14px mono).
3. The night is a darker layer over the room with a round hole for each flashlight: a mask of radial gradients (44px circles, soft edges) intersected together, so light shows only where the flashlights are. The pointer's own light is 52px; it hides while the pointer is outside. The room hides the system cursor.
4. Three searchers: white Lucide `mouse-pointer-2` icons (20px, a small shadow), each looping its own figure-eight across the room (sine paths with different speeds and phases), their flashlights following them.
5. The status starts as "Searching…". After 5 seconds it says "Wait, something over here…" and the first searcher walks to the clue over 1.2s (smooth step). Then: the clue grows to 1.25× on the pop spring, the night lifts to 55%, and a row appears under the room: "Found it. You typed /pricng. You probably meant /pricing." (the paths in small gray code chips) with two equal buttons, "Go to Pricing" (primary) and "Home"; the status clears. In the demo the buttons don't leave the page: they say "In a real app this would take you to /pricing." (or "/" for Home).
6. Clue and fix are inputs. The status is a polite live region.
Reduced motion: the searchers stand still and the answer shows at once.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: neutral grounds (Canvas #EBEBEB page, White #FFFFFF cards on it, Soft ground #F7F7F7 for insets inside a card; in dark the inset sits a step lighter than the card, so a panel that holds white cards, tiles or buttons takes the page ground there and they stay raised), Black #000 headlines, Slate #4E4E4E body text, Line #DDDDDD borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Text that wraps to two or three lines reads as one paragraph whose lines are close in length, with the first line the longest (narrow the text block until that holds; never a long line with one or two words below it). A row with a title and a detail line under it sets each line at its own size and line height (detail 13/18 or 12/16, not the body's 22px), 2px apart, with equal space above and below (at least 8px), so the text never presses against a divider. A card's padding is measured to what you see: text at the top edge trims to its capitals (text-box: trim-start cap alphabetic) and text at the bottom edge to its baseline (text-box: trim-end cap alphabetic), so the space above matches the space below. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders. A letter, initials or a number in a tile, avatar or count badge is centered on its capital height, not its line box (display: block; align-content: center; text-align: center; text-box: trim-both cap alphabetic), at a size whose capitals leave equal space above and below: 14px bold in tiles from 26 to 40px.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji. Every count uses the singular for one ("1 file", "1 second", "1 person"), including counts set by data attributes.
- This one: the room is a fixed dark scene with an Aqua clue; the card around it follows the theme.

DELIVER
The component with the address typed and the suggested fix as inputs, the demo, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #686868  (dark: #A6A6A6)
--black: #000000
--body: #4E4E4E  (dark: #CCCCCC)
--border: #DDDDDD  (dark: #333333)
--card: #FFFFFF  (dark: #171717)
--duration-fast: 140ms
--duration-slower: 480ms
--font-mono: "Geist Mono", ui-monospace, "Cascadia Code", Menlo, Consolas, monospace
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F2F2F2)
--leading-body: 22px
--leading-small: 18px
--line: #DDDDDD  (dark: #333333)
--mist: #EBEBEB  (dark: #2D2D2D)
--mist-strong: #E2E2E2  (dark: #363636)
--muted: #EBEBEB  (dark: #2D2D2D)
--muted-foreground: #686868  (dark: #A6A6A6)
--muted-hover: #E2E2E2  (dark: #363636)
--on-color: #ffffff
--press-scale: 0.97
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-lg: 12px
--radius-md: 8px
--radius-xl: 16px
--radius-xs: 4px
--ring: #0B7573  (dark: #79EEEC)
--sage: #99AD88
--shadow-sm: 0 1px 2px rgba(17, 17, 17, 0.04), 0 1px 3px rgba(17, 17, 17, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--slate: #4E4E4E  (dark: #CCCCCC)
--soft-ground: #F7F7F7  (dark: #1F1F1F)
--spring-panel: linear(0, 0.0198, 0.069, 0.1356, 0.211, 0.2893, 0.3667, 0.4407, 0.5096, 0.5727, 0.6297, 0.6805, 0.7255, 0.765, 0.7995, 0.8294, 0.8552, 0.8774, 0.8964, 0.9127, 0.9265, 0.9382, 0.9482, 0.9566, 0.9637, 0.9696, 0.9746, 0.9788, 0.9824, 0.9853, 0.9878, 0.9899, 0.9916, 0.993, 0.9942, 0.9952, 0.996, 0.9967, 0.9973, 0.9978, 1)
--spring-panel-duration: 530ms
--spring-pop: linear(0, 0.0413, 0.1464, 0.2895, 0.4487, 0.6073, 0.7529, 0.8776, 0.9776, 1.0517, 1.1013, 1.1292, 1.1394, 1.1357, 1.1225, 1.1033, 1.0813, 1.059, 1.0382, 1.0202, 1.0055, 0.9945, 0.9869, 0.9825, 0.9807, 0.9808, 0.9825, 0.985, 0.9881, 0.9912, 0.9941, 0.9967, 0.9989, 1.0005, 1.0017, 1.0024, 1.0027, 1.0027, 1.0025, 1.0022, 1)
--spring-pop-duration: 680ms
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--subtle: #F7F7F7  (dark: #1F1F1F)
--text-body: 15px
--text-caption: 12px
--text-small: 13px
--text-ui: 14px
--white: #FFFFFF  (dark: #171717)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
