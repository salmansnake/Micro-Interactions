Build "Caps Lock Hats" in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Type a password with Caps Lock on and every dot in the field puts on a tiny party hat. It's impossible to miss, and it never nags. Turn Caps Lock off and the hats fly away.

BEHAVIOR
1. A card: "Sign in to Atlas" (15px semibold) with "Try typing with Caps Lock on." (13/18 gray). Two fields (13/18 medium labels over 44px inputs, 8px corners): Email ("mira@atlas.io") and Password ("lunchtime").
2. The password field draws its own dots: its real characters and caret are transparent, and a row of 8px dots in the text color (6px apart, 13px from the left) stands in, one per character, with a blinking 1.5px caret after the last one while focused.
3. Caps Lock is read from the keyboard with getModifierState('CapsLock') on every keydown and keyup anywhere on the page (not only in the password field) and on every pointerdown and click in the card, so turning it off while Sign In or the page has focus still takes the hats off. For touch screens there's a gray "Caps Lock" key button (Lucide `arrow-big-up`) beside the primary "Sign In" (Lucide `log-in`); while it's on it's Amber with black text, and letters typed come out capitalized. Pressing it turns its own Caps Lock on or off. It can't switch off the keyboard's Caps Lock, so when the keyboard's is on, pressing it says so instead of seeming broken: "Caps Lock is on at your keyboard. Press its Caps Lock key to turn it off."
4. With Caps Lock on, each dot gets a hat: a party hat that must never read as a pencil tip: a 7 × 12px cone, narrower than the 8px dot so the round head shows under it, sitting on top of the dot (its base 6px above the dot's bottom), in a party color (Pink, Orange, Aqua, Sage, Olive in turn) with diagonal stripes (−55°, 2.5px of the color, then 1.5px of a pale tint of it: OKLCH L 0.97 at 30% of its chroma), and a tuft of tinsel at the tip in the party color two steps on. Tinsel is too light to stand up straight, so its five thin strands (about 1px, round ends) rise only a little from the tip and arc over, falling to either side like a small fountain: the outer two fall back to the tip's height about 5px out, the inner two fall a little less, and the middle one curls over to one side. The tuft is about 10 × 8px, small enough to stay inside the field and clear of the next hat's tuft. Draw it as a small SVG used as a mask and color it with the party color, so no color is hard-coded. Each hat is tilted a little differently (−12° to 12°). Draw the cone as its own layer (a pseudo-element with the clip-path triangle) and the tinsel as another: clipping the whole hat to the triangle cuts its top down to a dark point, which looks like pencil lead. They spring on from 14px above on the pop spring, 35ms apart. The field's border turns amber. Status: "Caps Lock is on. Your dots are celebrating; your password won’t be."
5. Caps Lock off: the hats spring away; status "Caps Lock is off. Party’s over."
6. Sign In with Caps Lock on: "Signing in would fail: Caps Lock is on. Turn it off and try again." Otherwise: "Signed in. No hats were harmed."
7. The status takes no space until it has text and is a polite live region.
Reduced motion: hats appear and leave in 120ms without bouncing; the caret stays still.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Text that wraps to two or three lines reads as one paragraph whose lines are close in length, with the first line the longest (narrow the text block until that holds; never a long line with one or two words below it). A row with a title and a detail line under it sets each line at its own size and line height (detail 13/18 or 12/16, not the body's 22px), 2px apart, with equal space above and below (at least 8px), so the text never presses against a divider. A card's padding is measured to what you see: text at the top edge trims to its capitals (text-box: trim-start cap alphabetic) and text at the bottom edge to its baseline (text-box: trim-end cap alphabetic), so the space above matches the space below. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders. A letter, initials or a number in a tile, avatar or count badge is centered on its capital height, not its line box (display: block; align-content: center; text-align: center; text-box: trim-both cap alphabetic), at a size whose capitals leave equal space above and below: 14px bold in tiles from 26 to 40px.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji. Every count uses the singular for one ("1 file", "1 second", "1 person"), including counts set by data attributes.
- This one: the hats are the only color, apart from the amber warning on the field.

DELIVER
The component with the field labels as input, the demo, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--amber-7: #e9c162  (dark: #824e00)
--amber-9: #ffc53d
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #646A66  (dark: #A3A8A4)
--black: #000000
--body: #4A504D  (dark: #C9CDCA)
--border: #DCDED9  (dark: #313432)
--card: #FFFFFF  (dark: #161817)
--duration-fast: 140ms
--duration-reduced: 120ms
--ease-out: cubic-bezier(0.22, 0.9, 0.24, 1)
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F3F2EE)
--input: #C6C9C3  (dark: #434744)
--leading-body: 22px
--leading-small: 18px
--line: #DCDED9  (dark: #313432)
--line-strong: #C6C9C3  (dark: #434744)
--mist: #ECEBE6  (dark: #2B2E2D)
--mist-strong: #E3E2DC  (dark: #343735)
--muted: #ECEBE6  (dark: #2B2E2D)
--muted-foreground: #646A66  (dark: #A3A8A4)
--muted-hover: #E3E2DC  (dark: #343735)
--olive: #AA9856
--orange: #FE8C5F
--pink: #FFC7F6
--press-scale: 0.97
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-md: 8px
--radius-xl: 16px
--ring: #0B7573  (dark: #79EEEC)
--sage: #99AD88
--shadow-sm: 0 1px 2px rgba(17, 17, 16, 0.04), 0 1px 3px rgba(17, 17, 16, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--slate: #4A504D  (dark: #C9CDCA)
--soft-ground: #F3F2EE  (dark: #0C0D0C)
--spring-pop: linear(0, 0.0413, 0.1464, 0.2895, 0.4487, 0.6073, 0.7529, 0.8776, 0.9776, 1.0517, 1.1013, 1.1292, 1.1394, 1.1357, 1.1225, 1.1033, 1.0813, 1.059, 1.0382, 1.0202, 1.0055, 0.9945, 0.9869, 0.9825, 0.9807, 0.9808, 0.9825, 0.985, 0.9881, 0.9912, 0.9941, 0.9967, 0.9989, 1.0005, 1.0017, 1.0024, 1.0027, 1.0027, 1.0025, 1.0022, 1)
--spring-pop-duration: 680ms
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--subtle: #F3F2EE  (dark: #0C0D0C)
--text-body: 15px
--text-small: 13px
--text-ui: 14px
--warning: #ffc53d
--warning-border: #e9c162  (dark: #824e00)
--warning-foreground: #000000
--white: #FFFFFF  (dark: #161817)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
