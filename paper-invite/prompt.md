Build a "Paper Invite" email invite field in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Sending invites is satisfying and honest: each address folds into a paper plane and flies away, while any address that can't be invited flies out, loops and boomerangs back as a red chip with the reason.

BEHAVIOR
1. A chip input: typing an address and pressing Enter, comma, space or Tab (or pasting a list) turns each address into a white button chip with a remove button. Backspace in an empty field removes the last chip. Duplicates are ignored.
2. "Send Invites" (filled button, disabled with no chips). On send, chips go one after another, 140ms apart:
   - Each chip folds (squashes to scale 0.2 × 0.6, rotates −12°, fades, 260ms) as a paper-plane icon appears in its place.
   - Valid addresses fly up and off the top-right with an accelerating curve, fading at the end (800ms).
   - Invalid ones (bad format, or already a member) fly out 150px, loop, and come back (1050ms). They return as red-tinted chips with a pop spring, each with a reason underneath: "jo@northwind: This address is missing its ending, like .com." or "mira@northwind.co: Already a member of this workspace."
3. Status: "2 invites sent. 2 need attention." (green when everything was sent).
4. Demo: "Fill Sample Emails" adds two good addresses, one existing member and one malformed one.
Reduced motion: chips are removed or marked without flights.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the chip field is an 8px rounded white box with a 1px Line border; chips are 32px white buttons with a hairline; invalid chips use the soft red with a red ring.

DELIVER
The component with a validate(email) hook, the demo, and short usage notes.
