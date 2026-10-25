Build a "Lock Builder" password field in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Password rules usually sit in a gray list. Here each rule you satisfy slides a bolt into a padlock, and when every rule is met the shackle snaps shut and the lock turns green.

BEHAVIOR
1. Rules: 10 or more characters; upper and lowercase letters; at least one number; at least one symbol.
2. A 56px padlock drawn in SVG: a shackle (open, raised 9px and tilted 14° from its right foot), a rounded body, and four vertical bolts inside the body.
3. As rules are met, bolts slide up into the body left to right (from 14px lower and scaled to 0.3, pop spring), one per rule.
4. Color follows the level: 0 gray, 1–2 amber, 3 black (Aqua in dark mode), 4 green. The body fills with the color at 18%, or solid green at 4.
5. All four met: the shackle drops and closes with a pop spring, the lock does a small squash ("thunk"), the bolts turn white on the green body.
6. Under the title: "Each rule you meet adds a bolt." becomes "Fair. 2 rules to go." and finally "Strong. Locked." (the strength word in the level color), announced politely.
7. The rule list shows an empty circle per rule that fills green with a checkmark that springs in.
8. A Show/Hide text button toggles the field type and keeps focus in the field.
Reduced motion: state changes in 100ms with no bounce.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the field is a 44px filled field with the Show button inside its trailing edge; rule checks are 18px circles.

DELIVER
The component with the rules as a configurable list, the demo, and short usage notes.
