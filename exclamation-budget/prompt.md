Build an "Exclamation Budget" for a message field in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
You get three exclamation marks per message. Spend them and any more quietly turn into periods, and the field shrugs.

BEHAVIOR
1. Header "Message Mira" and a wallet pill holding three 24px orange coins, each with a black "!". A 14px message field ("Congrats on the launch"), chips (Add "!", Add "!!!", Add Enthusiasm) and a Send button.
2. Keep the first three "!" in the text. Any after that become "." in place, with the caret kept where it was. Deleting one refunds it.
3. Spending a coin pops it (scale 1.4 and up 6px, then shrinks to an empty dashed outline at 0.82). Status: "2 exclamation marks left today.", then "No exclamation marks left. Choose your words carefully."
4. A conversion makes the field shrug (lifts 4px and back), says "Budget spent. That one's a period now." and shows an orange panel: "Need more enthusiasm?" with a "3 More for $0.99" button. That button replies "Just kidding. Try sounding excited with words."
5. Send: "Sent with all 3 exclamation marks. Mira can tell you mean it.", "Sent with 1 exclamation mark. Tasteful." or "Sent. Calm, measured, slightly suspicious."
Reduced motion: no pops or shrug.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the coins are the only colored objects; the field is a 17px-text Soft ground box.

DELIVER
The component with the budget and recipient as inputs, the demo, and short usage notes.
