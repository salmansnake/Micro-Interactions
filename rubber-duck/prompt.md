Build a "Rubber Duck Gate" for a bug report form in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Before you file a bug, a rubber duck pops up and asks you to explain it first. It nods at every sentence. Half the time you solve it yourself.

BEHAVIOR
1. A grouped form: Title ("Export button does nothing") and a "What happens?" text area, then a File Bug button and the footnote "The duck has closed 37% of bugs before they were filed."
2. The first File Bug press doesn't file. A rubber duck (simple amber SVG: body, head, orange beak, eye) springs up from below beside a pale amber speech bubble: "Before you file it, explain it to me. Step by step." The field label becomes "Explain it to the duck" and focus moves to it.
3. Each finished sentence (". ", "? ", "! " or a new line) makes the duck nod (rotate 9° and back) and changes the bubble: "Mm-hm.", "Go on.", "And then what happens?", "Interesting.", "Wait. Say that part again."
4. After two sentences, two pills appear: "I Figured It Out" and "Still Broken, File It".
   - Figured it out: the duck does a happy backflip (jump and a full spin), says "Quack. Bug closed before it existed." and the percentage goes up by 1.
   - File it: "Filed as BUG-1042. The duck believes in you."
   Either way, the button becomes Report Another.
Reduced motion: no flip or nod animations.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the bubble is a 16px rounded rectangle with a squared bottom-left corner pointing at the duck.

DELIVER
The component with the duck lines, sentence threshold and success rate as inputs, the demo, and short usage notes.
