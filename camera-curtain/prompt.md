Build a "Camera-Off Curtain" for a video call tile in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Turning your camera off draws red velvet theater curtains across your tile, with an Intermission sign. Turning it back on opens the show with a spotlight.

BEHAVIOR
1. A 230px tile showing a soft camera scene: one light warm wall, a lamp glow, and a simple head-and-shoulders silhouette in one dark warm tone (a round 76px head resting directly on rounded shoulders, no neck, one color) that breathes (2px over 4s). A dark translucent name chip sits in the corner, its text vertically centered, and an outline button below toggles the camera.
2. Camera off:
   - Two curtains slide in from the sides on a pop spring. They're velvet made of repeating vertical red folds with top and bottom shading, rounded where they meet at the bottom.
   - A scalloped red valance with a gold line sits on top.
   - After 0.9s, a small black "Intermission" plaque with a gold inner border drops in, tilted −3°, centered horizontally and vertically in the tile.
   - The chip reads "Mira · Camera Off" and the status says "Camera off. The show will resume shortly."
3. Camera on: the curtains spring open and a warm spotlight sweeps across (1.8s). "And now, presenting… Mira" fades in at the top and out again (2s). Status: "Camera on. The audience is delighted."
Reduced motion: the curtains open and close in 100ms; no spotlight or announcement.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the tile is the only colorful area; the control row is plain.

DELIVER
The component with name and a setCamera(on) method, the demo, and short usage notes.
