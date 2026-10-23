Build a "Shortcut Reveal" toolbar in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Holding Ctrl (⌘ on Mac keyboards) shows every keyboard shortcut on the toolbar at once, as keycaps that ripple out from the pointer. It teaches shortcuts at the moment people need them.

BEHAVIOR
1. Each action button declares its shortcut, e.g. data-shortcut="mod+shift+s". Render the keycap per platform: "⇧⌘S" on Mac, "Ctrl ⇧ S" elsewhere. Set aria-keyshortcuts.
2. Reveal only when the modifier is held on its own for 320ms. If another key is pressed within that time, it was a normal shortcut, so don't flash the keycaps.
3. Keycaps appear below each button with a springy scale and lift (scale 0.7 to 1 on the pop spring). Delay each by its distance from the pointer × 0.6ms, capped at 260ms. Without a pointer, ripple from the first button. If a keycap would overlap its neighbour on small icon buttons, drop it to a second row about 26px lower with a thin leader line up to its button.
4. While revealed, dim and slightly blur the content area so the toolbar stands out.
5. Pressing a matching key while holding the modifier runs the action, flashes the button with a ring, and marks that shortcut as learned (its keycap turns the success color).
6. Release the modifier to hide. Also hide on window blur and when the tab is hidden, so keycaps never get stuck after Cmd+Tab.
7. Clicking a button runs the action and shows a toast that teaches the shortcut: "Bold on · ⌘B next time".
8. A footer hint tracks progress: "Hold ⌘ to see every shortcut" → "Keep holding ⌘ and press a letter" → "Learned 2 of 7 shortcuts".
9. Touch: a "Hold to show shortcuts" button reveals the keycaps while pressed.

SAFETY
- Ignore everything while the person is typing in an input, textarea, select or editable field outside the toolbar.
- Only listen while the toolbar is on screen (IntersectionObserver), and only preventDefault for shortcuts you handle.
- Avoid shortcuts browsers reserve (⌘N, ⌘T, ⌘W, ⌘L).

prefers-reduced-motion: no ripple or spring; keycaps simply fade in.
Theme with CSS variables: accent, on-accent, success, on-success, surface, sunken, text, muted, line.


APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: toolbar actions are grouped into Frost pills (Search | Bold, Italic, Comment, Undo | Share) with a Black Publish button (Aqua in dark mode). Keycaps are small dark pills in Geist Mono; learned ones turn green.

DELIVER
The component, a demo editor toolbar (Search ⌘K, Bold ⌘B, Italic ⌘I, Comment ⇧⌘M, Undo ⌘Z, Share ⇧⌘S, Publish ⌘↵) above a short document whose selected phrase Bold and Italic actually change, and short usage notes.
