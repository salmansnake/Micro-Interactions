Build a "Terms Speedrun" terms-of-service checkbox in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
It measures how fast you scroll through the terms. Reach the end at an impossible speed and the checkbox admits what really happened, then gives you the short version you actually needed.

BEHAVIOR
1. A title "Terms of Service" with a live meter pill on the right: "0 words/sec". Below it, a 210px scrolling box of real-looking terms in 13px secondary text with bold section headings (hide a joke clause in the middle, such as "If you have read this far, you are entitled to one high five from our support team").
2. Count the words once. On scroll, words read = scroll progress × total; live speed = words passed in the last 400ms ÷ time. The meter eases toward it each frame and decays to 0 when scrolling stops. Over 25 words/sec it turns amber and adds "· Skimming"; over 120 it turns red, adds "· Speedrunning" and buzzes by half a pixel. A 3px progress line under the box fills in the same color.
3. The round checkbox, "I have read and agree to the Terms of Service", stays disabled until the end.
4. At the end, average speed = total words ÷ seconds since the first scroll. If it's over 12 words per second (about 720 a minute):
   - The label swaps (rising out of a 2px blur) to "I have not read this, and we both know it."
   - A soft red record line says "You read 455 words in 1.3 seconds. That's 350 words per second."
   - A "Since You're in a Hurry" card lists the three things that matter, such as "You own your content, and we don't sell it.", "Cancel any time in Settings, in two clicks." and "We'll email a readable summary when these change."
5. If they read at a human pace, a green line says "You actually read all 455 words. Section 8 says you're owed a high five."
6. Checking the box enables a 50px Continue button.
Reduced motion: no buzz or label animation.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the terms sit in a 12px Soft ground scroll box; the checkbox is a 24px circle that fills black (Aqua in dark mode) and draws a checkmark on a pop spring.

DELIVER
The component with the terms text, honest speed threshold and summary points as inputs, the demo, and short usage notes.
