Build a "Mute Mime" for a video call tile in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Talk while you're muted and your voice bounces off an invisible glass box around your tile, like a mime trapped inside. Then it tells you you're on mute.

BEHAVIOR
1. A dark 220px video tile (radial gray gradient in both themes) with an 80px gradient avatar, and a dark translucent name chip in the corner with a red slashed mic. Below it: a Mute/Unmute button (tinted red while muted) and a "Hold to Talk" button for the demo. In a real call, drive it from voice activity.
2. While talking, spawn a ring every 420ms from the avatar (2px white border, 80px).
3. Muted:
   - Each ring grows until it meets the box's top and bottom edges (the box is inset 14px), holds, flattens slightly and fades.
   - As it hits, the box edge flashes: a 1.5px white inner border and a pale aqua inner glow fading over 0.5s.
   - Faint corner brackets show the box while you talk.
4. After 1.4s of muted talking, a red-tinted panel says "You're on mute. You've been talking for 2 seconds." (the count keeps rising) with an Unmute button.
5. Unmuted, the rings turn green and expand freely to 6× before fading, and the tile gets a 3px green speaking border. The avatar pulses gently while talking.
Reduced motion: rings appear and fade without growing; the flash stays.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the tile and name chip stay dark in both themes, like a real camera feed.

DELIVER
The component with talking(on) and setMuted(on) methods, the demo, and short usage notes.
