Build "Anxious Typing Dots", a chat typing indicator, in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
The "typing…" indicator gets more nervous the longer the other person types: it grows, speeds up and starts to shake. Then they delete it all and send "yes".

BEHAVIOR
1. A chat header (avatar, name, presence line), your black message (Aqua in dark mode) on the right ("Quick question. Are we still shipping on Friday?") with "Seen 4:12 PM" under it, and a gray typing bubble on the left with three 8px dots that bob in a wave.
2. Drive the bubble from a stage (1–7). In a real app, map it from how long they've been typing; in the demo, play a script once when it first scrolls into view:
   - 0.0s, stage 1: "Mira is typing…" (62×36 bubble, 1.2s bob).
   - 1.8s, stage 2: "Mira is typing a lot…" (96px wide, 0.9s bob).
   - 3.6s, stage 3: "This is a paragraph now." (168×58, faint gray ghost text lines fade in above the dots, 0.62s bob).
   - 5.4s, stage 4: "Mira is writing you a novel." (230×84, 0.4s bob, the dots jitter by half a pixel).
   - 7.4s, stage 5: "Mira stopped typing." (dots freeze at 35% opacity).
   - 8.6s, back to stage 4: "Mira is typing again…".
   - 9.9s, stage 6: "Mira deleted all of it." (the bubble springs down to scale 0 from its bottom-left corner).
   - 11.3s, stage 7: a gray "yes" bubble pops in (pop spring) and the caption reads "4 minutes of typing. 3 letters."
3. Size changes use a ui spring on width and height. The presence line says "Typing…" while they type.
4. A footer shows the caption (a polite live region) and a timer that races between the scripted values: "Typing for 0:41", "Typing for 2:58", "Paused at 3:20", "Deleted after 4:02", "Total: 4:09". A Replay button plays it again.
Reduced motion: no bobbing or jitter; size changes become 100ms.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: message bubbles have 16px corners (Black with white text for you, Aqua with black text in dark mode; Soft ground for them), with 1px Line borders above and below the thread.

DELIVER
The indicator as a component that takes a stage (or typing duration) and a name, the scripted demo, and short usage notes.
