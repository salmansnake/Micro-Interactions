Build an "Offline Queue" for optimistic edits in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
When the connection drops, changes keep working and visibly pile up in a queue, so people know nothing is lost. When the connection returns, each queued change flies up to the cloud and its row confirms with a checkmark.

BEHAVIOR
1. Header: title, a status line with a colored dot ("Online · All changes saved" in green, "Offline · Changes save on this device" in amber), and a cloud icon in a gray circle; going offline draws a slash through it.
2. In production listen to the online/offline events; in the demo, a switch labeled Online simulates it.
3. Editing while online (checking a task, adding one) flashes a small green check badge on the row for 1.4s.
4. Editing while offline puts an amber clock badge on the row and adds a paper chip to a queue pill below the list (an amber-tinted pill: stacked chips that drop in, plus "3 changes waiting to sync"). Changing the same row twice queues it once.
5. Back online: the status says "Back online · Syncing"; one by one (160ms apart) a chip flies from the pill to the cloud on an arc, tilting and shrinking; the cloud bounces; that row's clock badge turns into a green check; the count drops. When the queue is empty the pill disappears and the status returns to "All changes saved". Going offline mid-sync stops the flush.
6. Tasks: 22px round checkboxes that fill black (Aqua in dark mode) with a springy check, and an add field with an Add button.
Reduced motion: no flights or bounces; badges and counts still change.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the list is a 14px rounded group; badges are 18px circles; the switch is the Outcraft 40×22 switch.

DELIVER
The component, a sync adapter interface (queue, flush, onResult), the demo, and short usage notes.
