Build "Autosave Appreciation" for an editor that already autosaves in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Press ⌘S in an app that saves everything as you type and, instead of the browser's save dialog, it thanks you for the gesture. It gets more philosophical the more you press.

BEHAVIOR
1. A notes editor: title "Meeting Notes", a cloud "Saved" indicator (it shows "Saving…" and hides its check for 600ms after typing), a 14px text area, and a footer: "Everything saves as you type. Press ⌘S or Ctrl S anyway." beside a big ⌘ S keycap button for touch.
2. Catch ⌘S / Ctrl+S anywhere inside the component (preventDefault so the browser dialog never opens), and the keycap button too.
3. Each press drops a Frost toast onto the top of the field (pop spring) with a small pink heart. Messages by press count: 1 "Already saved. But I appreciate the gesture.", 2 "Still saved. Every keystroke, actually.", 3 "Saved. Again. It's fine.", 5 "We've got it. You can let go.", 8 "Muscle memory is a beautiful thing.", 12 "The file is now extremely safe.", 20 "At this point it's a ritual. Respect." From the second press, a "×3" counter appears, and the toast bumps on each repeat.
4. The toast hides 2.6s after the last press. Announce each message in a visually hidden live region.
Reduced motion: the toast fades in place.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the toast is the only Frost surface, floating over the text.

DELIVER
The component with the message ladder as data, the demo, and short usage notes.
