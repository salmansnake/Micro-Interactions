Build an "Approval Stamp" for approving requests in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Approving or declining a request lands an ink stamp on the card, carrying who decided and when. Approvals feel final and accountable, and an Undo lifts the stamp back off.

BEHAVIOR
1. The request card shows the requester, the amount in large tabular numbers, a description and line items.
2. Approve (filled green button) and Decline (soft red button) side by side.
3. Approve: a stamp appears on the card, rotated −9°, with a 3px rounded border in green, the word "Approved" in heavy type, and a small line "SH · Oct 22 · 3:14 PM". It slams in: from scale 2.2 and blur(4px) to scale 0.94 and back to 1 (0.42s, overshooting curve), settling at 90% opacity with a speckled mask for worn ink (multiply blend in light mode). As it lands, the card dips (scale 0.985, 2px lower) and springs back.
4. Decline: the first press reveals a reason field labelled "Why are you declining? Sam will see this." (placeholder "Over the team's monthly budget"); the button keeps the label "Decline" but turns solid red (danger fill, white text) to show the next press sends it. Pressing it again, or Enter in the field, stamps "Declined" in red. Escape cancels.
5. After stamping, both buttons disable and a status line explains the outcome ("Approved. Sam will be reimbursed in the next payout.") with an Undo button for 6 seconds. Undo lifts the stamp (scale 1.3, rises 20px, fades) and re-enables the buttons.
Reduced motion: the stamp simply appears and disappears.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the request sits in a 16px rounded Soft ground card; actions are 44px buttons in a two-column grid.

DELIVER
The component with requester, amount and approver as inputs, the demo, and short usage notes.
