Build a "Commit Mood Ring" for a commit history in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Your commit messages are read as feelings. As they slide from "Add invoice export" to "fix", "fix again" and "pls work", a mood ring turns from calm aqua to despair, then offers a break.

BEHAVIOR
1. Header: a 52px ring (a silver conic-gradient band around a glossy stone with a slow swirl highlight) beside the mood word in 20px bold, mixed 45% with the mood color, and "Your last few commits, read as feelings."
2. A grouped list of the last 5 commits (short hash, message in monospace, time), a commit field with a Commit button, and chips: fix, fix again, final fix, pls work, why.
3. Score each message: fix +1, again/another +2, final/actually +2, pls/please +3, why/how/wtf/?? +3, revert +2, !! +1, work +1, under 10 characters +1. A real sentence (4+ words, capitalized) is −2. Mood = the sum over the last 4 commits.
4. Moods: 0 Calm (Aqua), 2 Focused (Sage), 4 Concerned (Pink), 6 Frustrated (Orange), 8 Bargaining (red), 11 Acceptance (Stone). The stone color transitions over 1.2s, and the ring pulses (scale 1.12) when the mood changes.
5. At 8 or more, a card tinted with the mood color: "That's 3 "fix" commits in 9 minutes. The bug will still be there after a glass of water." with a Take a Break button. It adds a "10 minute break · water consumed" row to the log and resets the mood to Calm.
Reduced motion: no swirl or pulse.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: commit rows are a 14px grouped list with hairlines; the ring is the only glossy object.

DELIVER
The component with the scoring rules and moods as data, the demo, and short usage notes.
