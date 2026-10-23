Build a "Dizzy Refresh" pull-to-refresh in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Pull to refresh again and again and the spinner gets woozy, then dizzy, with spinning eyes. It finally offers to just tell you when something arrives.

BEHAVIOR
1. A large "Inbox" title with a round refresh button, and a 236px list area (four messages: name, subject, time) that you can drag down.
2. Pull: the list follows the pointer at 55% (max 110px). An arc spinner (eight 3×8px bars around a center) appears bar by bar up to 60px. Release past 60px to refresh; otherwise it springs back.
3. Refreshing holds the list at 60px and spins the indicator in 8 steps for 0.9s. Count refreshes within 20 seconds:
   - 1: "Nothing new. Last message arrived at 2:14 PM."
   - 2: "Still nothing new since 2:14 PM."
   - 3: "Nothing. The spinner is getting woozy." (from now on the spinner wobbles side to side while it spins)
   - 4: "Nothing. Again. The spinner needs a minute."
   - 5 or more: dizzy. The indicator fades, two googly eyes with pupils orbiting in opposite directions appear, and the whole thing sways ±8°. "Nothing new since 2:14 PM. I'll tell you when there is. Please stop." A grouped row appears: "Tell Me When Something Arrives" with a switch.
4. Turning the switch on calms it down: "Okay. You'll get a notification. You can stop pulling now." Eight quiet seconds also reset it.
Reduced motion: no wobble, sway or orbiting.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the list is a surface-colored sheet sliding over the Soft ground area where the indicator lives.

DELIVER
The component with the load function, thresholds and last-update time as inputs, the demo, and short usage notes.
