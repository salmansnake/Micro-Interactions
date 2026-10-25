Build a "Tone Thermometer" for a message composer in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Passive-aggressive phrases lower the temperature of your message. Frost creeps in from the corners, and one button warms it back up with friendlier wording.

BEHAVIOR
1. Header: "To: Sam" and a thermometer pill (thermometer icon, "3°", "Chilly"). Below it, a 14px message field prefilled with "Per my last email, the files are in the shared folder. Going forward, please check there first." Then phrase chips (+ As previously mentioned, + Friendly reminder, + Noted.) and a Send button.
2. Start at 22°. Each phrase costs degrees and has a warmer swap:
   - per my last email −14 → in case it got buried
   - as previously mentioned −10 → as a quick recap
   - as I said −8 → like I mentioned
   - friendly reminder −7 → just a nudge
   - noted. −6 → Got it, thank you.
   - going forward −5 → next time
   - thanks in advance −4 → thank you so much
   - please advise −4 → let me know what you think
   - just to clarify −3 → to make sure we're aligned
   - kindly −3 → please
3. Words: Warm (18+), Mild (10+), Chilly (1+), Freezing (−9 to 0), Arctic (below −10). The button color blends in sRGB from Orange through gray to Aqua as it cools, and it shivers by 1.5px whenever the temperature drops.
4. Coldness = (12 − temperature) ÷ 30, clamped 0–1. It drives a light Aqua tint, an icy inner border and glow, and a frost layer of white radial gradients in the corners with fine radial streaks, masked to stay out of the middle. In dark mode the frost is at half strength.
5. When any phrase is found, a neutral inset panel (Soft ground, no tint, so the Orange button is the only color in it) says "3 phrases are making this freezing." with an Orange "Warm It Up" button with black text. It swaps every phrase (keeping capitalization), thaws everything and says "Thawed. Same message, fewer enemies."
6. Send: "Sent at 22°. Sam will reply today." or, when cold, "…will reply in three to five business days."
Reduced motion: no shiver; frost changes in 100ms.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the frost is the only texture; chips are 30px fill pills.

DELIVER
The component with the phrase list (pattern, cost, replacement) as data, the demo, and short usage notes.
