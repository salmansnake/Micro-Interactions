Build a "Friday Deploy Hard Hat" deploy button in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
After 4 PM on a Friday, the Deploy button puts on a hard hat, wraps itself in caution tape and makes you hold it for two seconds. It offers Monday 10 AM instead.

BEHAVIOR
1. A card: "Deploy to Production", "api-gateway · v2.18.0 · 14 commits" in monospace, a "Pretend It's" segmented control (Tue 11 AM, Thu 3 PM, Fri 5 PM) for the demo, and a full-width 52px Deploy button. In production, decide "risky" from the real clock.
2. Calm days: one press fills the button over 0.7s and says "Deployed to production. Have a lovely Tuesday."
3. Risky (Friday 4 PM or later):
   - An amber hard hat drops onto the top of the button with a pop spring (from 40px above, −14° to −6°).
   - The button gets a 5px border of 45° amber and black caution stripes, turns black inside, and its label turns amber: "Hold to Deploy Anyway".
   - A warning in amber: "It's 5:00 PM on a Friday. Mira is on call this weekend, and has plans."
   - A secondary "Schedule for Monday 10:00 AM" button appears.
4. Press and hold (pointer, Space or Enter): a fill sweeps across in 2s and the label says "Keep Holding…". Letting go early drains it and says "Hold for 2 full seconds. That's how sure you need to be." Completing turns it green: "Deployed at 4:45 PM on a Friday. Mira has been notified. Mira is not happy."
5. Schedule for Monday: the hat flies off to the upper right and the status says "Scheduled for Monday 10:00 AM. Go enjoy your weekend."
Reduced motion: no hat flight; the hat just appears.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the caution tape is the only pattern on the card; everything else is plain pills and a grouped 14px control row.

DELIVER
The component with on-call name, hold duration and a risky check as inputs, the demo, and short usage notes.
