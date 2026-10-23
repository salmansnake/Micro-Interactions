Build a "Leaning Empty State" in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
An empty state whose illustration pays attention: as the pointer approaches the call to action, the little tiles in the illustration turn and drift toward the button, so the eye follows them to the one thing to do. Clicking gathers the tiles into the button and the first real item arrives.

BEHAVIOR
1. The illustration is four small "document" tiles (white cards with a colored title bar and two gray lines), scattered and slightly rotated above the title, body text and a 44px filled CTA, "New Project".
2. On pointer move inside the component (throttled with requestAnimationFrame), compute pull = clamp(1 − distance from pointer to the CTA center / 320px, 0, 1).
3. For each tile, take the unit vector from the tile's center to the CTA's center and set:
   rotateX = −dy × 22° × pull, rotateY = dx × 22° × pull, translate = (dx, dy) × 8px × pull,
   inside a 600px perspective, transitioned with a ui spring. The tiles look like they turn their faces to the button.
4. The CTA gets a soft Aqua ring that grows with pull (up to 6px). Keyboard focus on the CTA sets pull to 1. Leaving the component releases everything.
5. Clicking the CTA: each tile flies into the button center, scaling to 0.2, spinning ±40°, fading, 50ms apart; the button pulses; then the empty state is replaced by a list whose first row ("Untitled Project · Created just now") drops in with a pop spring. A "Reset Demo" button brings the empty state back.
Reduced motion: no leaning; clicking swaps states directly.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: tiles have 12px corners and soft shadows; the panel is a 16px white card with centered content, which suits a single-purpose empty state.

DELIVER
The component, the demo, and short usage notes.
