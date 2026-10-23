Build a "File-Aware Dropzone" in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
The dropzone recognizes a file's type while it is still being dragged, tells people what will happen, and then previews each type the way that file wants to be seen.

WHILE DRAGGING
- On dragenter, read dataTransfer.items[0].type (available before the drop). Map it to csv, image, pdf or file.
- Swap the idle content for a type-aware state: an icon tile in the type's color (CSV green, image Aqua 700, PDF red, other black) that gently bobs, and a title: "Drop to preview rows", "Drop to develop the photo", "Drop to fan out the pages", or "Drop to upload".
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
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the zone is a 20px rounded area in Soft ground with a 1.5px dashed separator-colored border; previews sit in the same 20px shape.

DELIVER
The component, sample-file buttons for the demo, and short usage notes.
