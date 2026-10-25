Build a "Quick Question Stopwatch" for a team chat in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Start a message with "quick question" and a stopwatch starts too. It follows the thread that question causes, until it admits this is a meeting now.

BEHAVIOR
1. A channel header ("# launch-team"), a 214px scrolling thread on Soft ground, a field prefilled with "Quick question about the launch date" and a Send button.
2. Sending a message containing "quick question" posts it with a small "Quick question" tag, and a stopwatch pill pops into the header (pop spring).
3. The demo then plays a time-lapse at about 260ms per minute. Replies at minutes 2, 6, 13, 19, 31, 40 and 47:
   - "Depends. Which launch date?"
   - "The one we moved, or the one before that?"
   - "Wait, I thought we were launching in Q1"
   - "Looping in Priya"
   - "Can someone summarize the thread?"
   - "Is this the same launch as the other thread?"
   - "Quick question: what was the original question?"
   Each reply has a colored square avatar, a name and a time, and slides up 6px.
4. The stopwatch counts up in m:ss. A verdict under the thread changes with it: "Still quick." (Aqua 700), "Getting less quick." at 6 min (amber), "No longer quick." at 20, and "This is a meeting now." at 40 (red).
5. At the end: "Quick question: 47 minutes, 5 people, 0 answers." and a green "Turn It Into a Call" button (white text in light and dark mode), which says "Call started. Agenda: the quick question." Messages without the phrase just post: "Nice and direct. No stopwatch needed."
Reduced motion: faster time-lapse, no pop or slide.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the stopwatch and tag are tinted pills that change color with the verdict.

DELIVER
The component with the trigger phrase, levels and (for demos) a scripted thread as inputs, and short usage notes.
