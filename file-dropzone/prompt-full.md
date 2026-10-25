Build a "File-Aware Dropzone" in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
The dropzone recognizes a file's type while it is still being dragged, tells people what will happen, and then previews each type the way that file wants to be seen.

WHILE DRAGGING
- On dragenter, read dataTransfer.items[0].type (available before the drop). Map it to csv, image, pdf or file.
- Swap the idle content for a type-aware state: an icon tile in the type's color (CSV green with Lucide `sheet`, image Aqua 700 with `image`, PDF red with `file-text`, other black with `upload`; the idle zone also shows `upload`) that gently bobs, and a title: "Drop to preview rows", "Drop to develop the photo", "Drop to fan out the pages", or "Drop to upload".
- The zone scales to 0.985, tints with the type color, and its dashed border (an SVG rect, dash 7/6) marches.
- Track dragenter/dragleave depth so child elements don't cause flicker.

AFTER THE DROP
- CSV: parse the first 256 KB (handle quoted cells), show the header and first 4 rows in a small table (up to 5 columns); rows slide up one after another (70ms apart). Info: "128 rows · 5 columns · 4.2 KB".
- Image: an instant-photo frame (white, 10px padding, 28px bottom, rotated −2°) drops in; the image starts blurred, desaturated and overexposed and develops to sharp over 1.8s. Info: "600 × 400 · 120 KB".
- PDF: three paper sheets fan out from a stack (−14°, 0°, 14°) with a pop spring. Count pages by matching /Type /Page in the first 2 MB. Info: "12 pages · 1.1 KB".
- Anything else: a file tile with its extension.
- Below the preview: file name, info line, a secondary "Replace" button and a red plain "Remove".

ALSO
- Click, Enter or Space opens the file picker. Files over the limit (default 10 MB) shake the zone and say "That file is 14 MB. The limit is 10 MB."
- Demo buttons generate sample files (a CSV, a canvas-drawn PNG, a small PDF) and play the drag state before showing them.
Reduced motion: no marching, bobbing, fanning or developing; content just appears.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Text that wraps to two or three lines reads as one paragraph whose lines are close in length, with the first line the longest (narrow the text block until that holds; never a long line with one or two words below it). A row with a title and a detail line under it sets each line at its own size and line height (detail 13/18 or 12/16, not the body's 22px), 2px apart, with equal space above and below (at least 8px), so the text never presses against a divider. A card's padding is measured to what you see: text at the top edge trims to its capitals (text-box: trim-start cap alphabetic) and text at the bottom edge to its baseline (text-box: trim-end cap alphabetic), so the space above matches the space below. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders. A letter, initials or a number in a tile, avatar or count badge is centered on its capital height, not its line box (display: block; align-content: center; text-align: center; text-box: trim-both cap alphabetic), at a size whose capitals leave equal space above and below: 14px bold in tiles from 26 to 40px.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji. Every count uses the singular for one ("1 file", "1 second", "1 person"), including counts set by data attributes.
- This one: the zone is a 16px rounded area in Soft ground with a 1.5px dashed separator-colored border drawn 1px inside it with a corner radius 1px smaller than the zone's (rx 15), so the dashes follow the zone's corners; previews sit in the same 16px shape.

DELIVER
The component, sample-file buttons for the demo, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--amber-9: #ffc53d
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #646A66  (dark: #A3A8A4)
--black: #000000
--border: #DCDED9  (dark: #313432)
--brand: #79EEEC
--canvas: #FAFAF8  (dark: #0B0C0B)
--card: #FFFFFF  (dark: #161817)
--chart-6: #0B7573  (dark: #79EEEC)
--danger: #ce2c31  (dark: #d4373c)
--danger-foreground: #ffffff
--danger-text: #ca2b30  (dark: #ff9592)
--duration-base: 200ms
--duration-fast: 140ms
--duration-instant: 80ms
--duration-reduced: 120ms
--duration-slower: 480ms
--ease-in-out: cubic-bezier(0.62, 0, 0.32, 1)
--ease-out: cubic-bezier(0.22, 0.9, 0.24, 1)
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F3F2EE)
--green-11: #218358  (dark: #3dd68c)
--leading-body: 22px
--leading-caption: 16px
--leading-small: 18px
--leading-title-sm: 24px
--line: #DCDED9  (dark: #313432)
--mist: #ECEBE6  (dark: #2B2E2D)
--muted: #ECEBE6  (dark: #2B2E2D)
--muted-foreground: #646A66  (dark: #A3A8A4)
--olive: #AA9856
--on-chart-strong: #ffffff  (dark: #000000)
--on-color: #ffffff
--orange: #FE8C5F
--pink: #FFC7F6
--press-scale: 0.97
--press-scale-sm: 0.94
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-lg: 12px
--radius-md: 8px
--radius-sm: 6px
--radius-xl: 16px
--radius-xs: 4px
--red-11: #ce2c31  (dark: #ff9592)
--ring: #0B7573  (dark: #79EEEC)
--sage: #99AD88
--shadow-lg: 0 4px 8px -2px rgba(17, 17, 16, 0.06), 0 16px 32px -8px rgba(17, 17, 16, 0.14)  (dark: 0 4px 8px -2px rgba(0, 0, 0, 0.5), 0 16px 32px -8px rgba(0, 0, 0, 0.55))
--shadow-md: 0 2px 4px -1px rgba(17, 17, 16, 0.05), 0 6px 14px -3px rgba(17, 17, 16, 0.09)  (dark: 0 2px 4px -1px rgba(0, 0, 0, 0.45), 0 6px 14px -3px rgba(0, 0, 0, 0.45))
--shadow-sm: 0 1px 2px rgba(17, 17, 16, 0.04), 0 1px 3px rgba(17, 17, 16, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--shadow-xs: 0 1px 2px rgba(17, 17, 16, 0.05)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4))
--soft-ground: #F3F2EE  (dark: #0C0D0C)
--spring-panel: linear(0, 0.0198, 0.069, 0.1356, 0.211, 0.2893, 0.3667, 0.4407, 0.5096, 0.5727, 0.6297, 0.6805, 0.7255, 0.765, 0.7995, 0.8294, 0.8552, 0.8774, 0.8964, 0.9127, 0.9265, 0.9382, 0.9482, 0.9566, 0.9637, 0.9696, 0.9746, 0.9788, 0.9824, 0.9853, 0.9878, 0.9899, 0.9916, 0.993, 0.9942, 0.9952, 0.996, 0.9967, 0.9973, 0.9978, 1)
--spring-panel-duration: 530ms
--spring-pop: linear(0, 0.0413, 0.1464, 0.2895, 0.4487, 0.6073, 0.7529, 0.8776, 0.9776, 1.0517, 1.1013, 1.1292, 1.1394, 1.1357, 1.1225, 1.1033, 1.0813, 1.059, 1.0382, 1.0202, 1.0055, 0.9945, 0.9869, 0.9825, 0.9807, 0.9808, 0.9825, 0.985, 0.9881, 0.9912, 0.9941, 0.9967, 0.9989, 1.0005, 1.0017, 1.0024, 1.0027, 1.0027, 1.0025, 1.0022, 1)
--spring-pop-duration: 680ms
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--spring-ui: linear(0, 0.0237, 0.0849, 0.1704, 0.2697, 0.3746, 0.4788, 0.5777, 0.6685, 0.7491, 0.8189, 0.8776, 0.9257, 0.9639, 0.9931, 1.0147, 1.0296, 1.0391, 1.0442, 1.046, 1.0451, 1.0425, 1.0387, 1.0342, 1.0294, 1.0246, 1.02, 1.0158, 1.012, 1.0087, 1.0059, 1.0037, 1.0019, 1.0005, 0.9994, 0.9987, 0.9982, 0.998, 0.9979, 0.9979, 1)
--spring-ui-duration: 460ms
--subtle: #F3F2EE  (dark: #0C0D0C)
--success: #218358
--success-foreground: #ffffff
--text-body: 15px
--text-caption: 12px
--text-small: 13px
--text-title-sm: 17px
--tint-c: 0.4  (dark: 0.45)
--tint-l: 0.92  (dark: 0.32)
--tracking-title: -0.015em
--white: #FFFFFF  (dark: #161817)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
