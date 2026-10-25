Build "Cancel, Eventually", a subscription cancel card in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Every product makes canceling hard. This one is honest about it: reach for Cancel and it swaps places with Keep My Plan, so your cursor lands on Keep instead. Five times. Then Cancel gets tired, everything walks home, and it lets you leave.

BEHAVIOR
1. A card: a small Aqua pill "Pro · $24/mo" (text vertically centered), the title "Cancel your subscription?", a guilt-trip line ("You'll lose 14 projects, your custom domain, and the 3 teammates who quietly depend on you."), a status line that starts as "No rush. We'll be right here." (in Outcraft Orange text: color-mix of Orange 20% with Orange 700, about #C25521 on light (4.6:1 on white), plain Orange #FE8C5F on dark; space reserved so nothing jumps), then two equal-width buttons on one line: a primary "Keep My Plan" on the left and a soft red "Cancel Subscription" on the right (danger-soft fill, danger-soft-foreground text, no border). On very narrow cards (under 340px) the label shortens to "Cancel".
2. The moment a mouse or pen pointer enters Cancel Subscription, the two buttons swap places on --spring-ui: Cancel runs left, Keep My Plan runs right, each leaning 5° into the run with a slight squash. Reach Cancel again and they swap back. Five swaps in total.
3. While they're moving, neither button responds: no hover, and clicks do nothing.
4. Each swap sets the status line, rising in on --spring-pop ("Whoa. Careful.", "Are you sure sure?", "We can talk about this.", "Think of the 3 teammates.", "Last chance to stay…") and Keep My Plan gives a tiny 3% pleading pulse.
5. After the fifth swap the status says "Fine. It's tired.", both buttons walk slowly back to their own places (twice the panel spring duration, ease-in-out, still unclickable), Cancel pants three times (a small vertical squash), and the status reads "Okay. It's all yours." From now on Cancel is a normal button: hover deepens its tint, and pressing it turns it solid red (danger fill, white text).
6. Clicking it then swaps the card to "Subscription canceled." with "Your Pro plan ends on November 23. Your 14 projects will be fine. Probably." and a Resubscribe button, which resets everything and says "Welcome back. We knew you would."
7. Keep My Plan, when it isn't moving: "Great choice. It was the only choice."
8. Touch: each tap on Cancel counts as an attempt and is swallowed until the fifth. Keyboard: Enter or Space counts as an attempt too, and focus travels with the button.
Reduced motion: no travel; both buttons blink out (120ms fade) and reappear swapped. No lean, pant or pulse.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: Cancel is a soft red, never a loud solid red until it's finally pressed. The joke is the running, not the styling.

DELIVER
The component with the number of escapes and the status lines as inputs, the demo, and short usage notes.
