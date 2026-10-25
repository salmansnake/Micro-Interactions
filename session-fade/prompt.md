Build a "Session Fade" idle timeout in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Instead of a sudden "You've been signed out" modal, the page drains of color as the session nears its timeout, so people notice without being interrupted. Any activity floods the color back from where they moved.

BEHAVIOR
1. Settings: timeout (demo 20s) and warning window (demo last 10s). Track a deadline; any pointer move, press or key inside the app pushes it back to the full timeout.
2. During the warning window, a progress value p rises from 0 to 1. Drive it into CSS: grayscale(p), brightness(1 − 0.12p), contrast(1 − 0.15p) on the content, plus an inner vignette (inset shadow up to 80px blur at 35% black).
3. A Frost button slides up at the bottom: "Signing out in 0:07" (tabular numbers, updated each second) with a filled "Stay Signed In" button.
4. Activity during the warning: hide the banner, animate p back to 0 with a panel spring (register p with @property so it transitions), and play a soft Aqua ripple that expands from the pointer position (scale 1 → 40, fading).
5. At zero: show a lock screen over the content (a material with blur behind, a lock icon, "Signed Out", "We signed you out after 20 seconds without activity to keep Atlas safe.", and "Sign In Again"). Only move focus to it if focus was already inside the component or on the page body.
6. Pause the countdown while the component is off screen. A thin progress meter in the footer shows the remaining session.
Reduced motion: p changes without the spring; no ripple or banner slide.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the component is one 16px white card: inside it, the demo dashboard (three softly tinted stat tiles and an activity list) sits in a 12px bordered screen, so the color drain is easy to see, and the note and countdown bar sit under it, inside the same card.

DELIVER
The component with configurable timeout and warning times, the demo dashboard, and short usage notes.
