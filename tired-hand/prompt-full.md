Build a "Tired Hand" video-call control in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Raise your hand in a call and nobody notices. Minute by minute the hand gets tired: it droops, switches arms, leans, props itself up on a stick, then waves wildly until someone finally asks if there was a question.

BEHAVIOR
1. A card with a 2 × 2 grid of video tiles (6px gaps, 16:11, 8px corners). The tiles stand in for camera pictures, so their colors stay fixed in light and dark: a very dark Sage-tinted black, a 40px avatar with initials in a light palette color (Aqua, Pink, Orange; Sage for "You", with 11px text) and a name pill at the bottom left (20px capsule, black at 62%, white 12px text). Mira Chen's tile has a 2px Aqua ring: she's speaking.
2. Below the grid: the status "Mira is presenting the roadmap." (13/18 body gray) and a primary "Raise Hand" button with Lucide `hand`.
3. Raise Hand: a 32px Amber circle with a black Lucide `hand` (18px) springs onto the top right of your tile, and a small mono clock pill ("0:00") appears at its bottom right, running at meeting speed (15 seconds every half second). The button becomes a gray "Lower Hand" and the status says "Hand raised. Mira is still talking."
4. Every 2 seconds is one meeting minute, and the hand tires (it rotates from its bottom on the controls spring):
   - 1 minute: tilts 18°: "1 minute. The arm is getting heavy."
   - 2 minutes: switches arms (mirrored) and tilts −8°: "2 minutes. Switched arms."
   - 3 minutes: leans 38°: "3 minutes. It’s more of a lean now."
   - 4 minutes: upright again, resting on a 4 × 22px Olive stick that grows under it: "4 minutes. Propped up on a stick."
   - 5 minutes: waves wildly (−24° to 24°, 0.35s, back and forth): "5 minutes. Waving now. Dignity optional."
5. After that it's noticed: the hand and clock go away and the status says "“Did someone have a question?” Noticed after 5 minutes. The question: forgotten." Its two short sentences each wrap as one piece (inline-block, "5" and "minutes" joined by a no-break space), so in the demo each sentence takes its own line, none reaching the button, and a line never ends on "after 5". The button is "Raise Hand" again.
6. Lower Hand at any time: "Hand lowered. The question lives on in your heart."
7. The button keeps one width for both labels. The status is a polite live region.
Reduced motion: no waving; the hand changes pose in 120ms.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: neutral grounds (Canvas #EBEBEB page, White #FFFFFF cards on it, Soft ground #F7F7F7 for insets inside a card; in dark the inset sits a step lighter than the card, so a panel that holds white cards, tiles or buttons takes the page ground there and they stay raised), Black #000 headlines, Slate #4E4E4E body text, Line #DDDDDD borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Text that wraps to two or three lines reads as one paragraph whose lines are close in length, with the first line the longest (narrow the text block until that holds; never a long line with one or two words below it). A row with a title and a detail line under it sets each line at its own size and line height (detail 13/18 or 12/16, not the body's 22px), 2px apart, with equal space above and below (at least 8px), so the text never presses against a divider. A card's padding is measured to what you see: text at the top edge trims to its capitals (text-box: trim-start cap alphabetic) and text at the bottom edge to its baseline (text-box: trim-end cap alphabetic), so the space above matches the space below. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders. A letter, initials or a number in a tile, avatar or count badge is centered on its capital height, not its line box (display: block; align-content: center; text-align: center; text-box: trim-both cap alphabetic), at a size whose capitals leave equal space above and below: 14px bold in tiles from 26 to 40px.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji. Every count uses the singular for one ("1 file", "1 second", "1 person"), including counts set by data attributes.
- This one: the call is a dark scene in fixed colors; Amber marks the hand and Olive its stick.

DELIVER
The component with the people in the call as input, the demo, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--amber-9: #ffc53d
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #686868  (dark: #A6A6A6)
--black: #000000
--body: #4E4E4E  (dark: #CCCCCC)
--border: #DDDDDD  (dark: #333333)
--card: #FFFFFF  (dark: #171717)
--duration-reduced: 120ms
--duration-slow: 320ms
--ease-in-out: cubic-bezier(0.62, 0, 0.32, 1)
--ease-out: cubic-bezier(0.22, 0.9, 0.24, 1)
--font-mono: "Geist Mono", ui-monospace, "Cascadia Code", Menlo, Consolas, monospace
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F2F2F2)
--leading-body: 22px
--leading-small: 18px
--line: #DDDDDD  (dark: #333333)
--mist: #EBEBEB  (dark: #2D2D2D)
--muted: #EBEBEB  (dark: #2D2D2D)
--muted-foreground: #686868  (dark: #A6A6A6)
--olive: #AA9856
--on-color: #ffffff
--orange: #FE8C5F
--pink: #FFC7F6
--press-scale: 0.97
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-full: 9999px
--radius-md: 8px
--radius-xl: 16px
--ring: #0B7573  (dark: #79EEEC)
--sage: #99AD88
--shadow-sm: 0 1px 2px rgba(17, 17, 17, 0.04), 0 1px 3px rgba(17, 17, 17, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--slate: #4E4E4E  (dark: #CCCCCC)
--spring-pop: linear(0, 0.0413, 0.1464, 0.2895, 0.4487, 0.6073, 0.7529, 0.8776, 0.9776, 1.0517, 1.1013, 1.1292, 1.1394, 1.1357, 1.1225, 1.1033, 1.0813, 1.059, 1.0382, 1.0202, 1.0055, 0.9945, 0.9869, 0.9825, 0.9807, 0.9808, 0.9825, 0.985, 0.9881, 0.9912, 0.9941, 0.9967, 0.9989, 1.0005, 1.0017, 1.0024, 1.0027, 1.0027, 1.0025, 1.0022, 1)
--spring-pop-duration: 680ms
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--spring-ui: linear(0, 0.0237, 0.0849, 0.1704, 0.2697, 0.3746, 0.4788, 0.5777, 0.6685, 0.7491, 0.8189, 0.8776, 0.9257, 0.9639, 0.9931, 1.0147, 1.0296, 1.0391, 1.0442, 1.046, 1.0451, 1.0425, 1.0387, 1.0342, 1.0294, 1.0246, 1.02, 1.0158, 1.012, 1.0087, 1.0059, 1.0037, 1.0019, 1.0005, 0.9994, 0.9987, 0.9982, 0.998, 0.9979, 0.9979, 1)
--spring-ui-duration: 460ms
--text-body: 15px
--text-caption: 12px
--text-small: 13px
--text-ui: 14px
--white: #FFFFFF  (dark: #171717)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
