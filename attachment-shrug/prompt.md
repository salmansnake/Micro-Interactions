Build an "Attachment Shrug" for an email composer in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Write "see the attached deck" with nothing attached and the Send button shrugs at you instead of sending.

BEHAVIOR
1. An email composer: To and Subject rows with hairlines, a borderless 17px body ("Hi team, please see the attached deck with the Q4 numbers."), a round paperclip button on the left and a Send button on the right.
2. While the body mentions an attachment (attached, attachment, enclosed, see the file, I've included) and nothing is attached, the paperclip's circle turns the same color as Send: black with a white icon in light mode, Aqua with a black icon in dark mode and glances left and right every 2.4s.
3. Send with nothing attached:
   - The button shrugs: it rises 6px twice, slightly narrower and taller, anchored at the bottom.
   - A dark speech bubble pops up above it with "¯\_(ツ)_/¯" on a pop spring.
   - An Aqua-tinted panel (no border) says "You wrote "attached", but nothing is attached." with Attach File (black primary) and Send Anyway (white in light, a light wash of the text color in dark, no border) buttons.
4. Attach File (or the paperclip) slides in a file chip (red PDF tile, "Q4 Numbers.pdf", "2.4 MB", a round remove button with the Lucide `x` icon, 16px) and calms everything down. Send then says "Sent, with the attachment. Nobody has to reply "I think you forgot the file.""
5. Send Anyway: "Sent without it. Expect a reply in about four minutes saying you forgot the file."
Reduced motion: no glancing or shrugging; the bubble fades in.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the shrug bubble uses the label color as its fill (inverted), with a small tail pointing at Send.

DELIVER
The component with the mention pattern and the demo file as inputs, the demo, and short usage notes.
