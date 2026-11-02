Build a "Time Zone Sundial" meeting-time picker in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Drag a meeting time and every attendee's sun or moon rises or sets where they live. Times when someone would be asleep are easy to see, and one button finds the kindest time for everyone.

BEHAVIOR
1. A card: "Design review" (15px semibold) with "Thu, Nov 5 · Austin time" (13/18 gray) under it, and the chosen time at the top right ("10:00 AM", 20px semibold, tabular numbers).
2. A slider of half-hour slots from 6:00 AM to 10:00 PM Austin time (America/Chicago), with "6:00 AM" and "10:00 PM" in 12px gray under its ends. Its 8px track is gray, with a green band (Green mixed 45% into the track) over every slot where nobody is asleep. The 24px round thumb uses the raised color with a 1px strong border ring.
3. Four people, each a row: a 32px round avatar with initials (Aqua, Pink, Orange, Sage, black 14px bold letters, centered on their capitals), the name (14/20 semibold) and "City · local time" (13/18 gray) under it, plus the weekday when their date differs ("Tokyo · 1:00 AM Fri"). Rows are 8px apart with a 1px divider that starts after the avatar. Mira Chen, Austin; Sam Rivera, London; Priya Shah, Bengaluru; Jordan Lee, Tokyo. Format every time with the 'en-US' locale and the person's IANA time zone, on the meeting's date (Nov 5, 2026), so daylight saving is right.
4. At the right of each row, a 64 × 32px capsule sky in the colors of a real sky, so anyone reads it at a glance. It is a small scene, so it stays the same in light and dark, with no ring: by day (8 AM to 6 PM) blue, #2F86D8 at the top to #8CCBF5 at the bottom; at dawn and dusk (6 to 8 AM, 6 to 9 PM) a glow from violet #5E62B0 at the top to orange #FFA66B at the horizon; at night (9 PM to 6 AM) deep navy, #0A1430 to #1F2C5A, with three tiny white stars. Each sky fades in over the day sky (320ms), since gradients can't animate. The sun is a Lucide `sun` in sun yellow #FFD23F with its circle filled; the moon is a Lucide `moon` in moon cream #F4EFD6, filled. The icon (16px) crosses the capsule as the hours pass: the sun from 6 AM to 9 PM, the moon from 9 PM to 6 AM, low at the ends and 8px higher in the middle, on the controls spring. Make these nature colors their own tokens (sky, sun, moon, star), the same in both themes, and use them only for the scene.
5. Someone is asleep before 7 AM or from 11 PM; their row adds " · asleep" in red text.
6. The status beside the button explains the time: "Jordan is asleep. It’s 1:00 AM there.", "Priya and Jordan are asleep.", "Everyone is awake. It’s early for Mira and late for Jordan.", or "Everyone is awake and at work."
7. "Find a Kind Time" (primary) slides the thumb, one slot per two frames, to the best slot: nobody asleep first, then the most people between 8 AM and 9 PM, then the slot nearest the current one. If it's already there: "This is already the kindest time."
8. The slider has an aria-valuetext like "10:00 AM in Austin"; the status is a polite live region.
Reduced motion: the thumb jumps straight to the kind time; sky changes take 120ms.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: neutral grounds (Canvas #EBEBEB page, Soft ground #F7F7F7 behind white cards), Black #000 headlines, Slate #4E4E4E body text, Line #DDDDDD borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is held between OKLCH L 0.48 (a cap in light) and 0.75 (a floor in dark), so it reads in both themes, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Text that wraps to two or three lines reads as one paragraph whose lines are close in length, with the first line the longest (narrow the text block until that holds; never a long line with one or two words below it). A row with a title and a detail line under it sets each line at its own size and line height (detail 13/18 or 12/16, not the body's 22px), 2px apart, with equal space above and below (at least 8px), so the text never presses against a divider. A card's padding is measured to what you see: text at the top edge trims to its capitals (text-box: trim-start cap alphabetic) and text at the bottom edge to its baseline (text-box: trim-end cap alphabetic), so the space above matches the space below. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders. A letter, initials or a number in a tile, avatar or count badge is centered on its capital height, not its line box (display: block; align-content: center; text-align: center; text-box: trim-both cap alphabetic), at a size whose capitals leave equal space above and below: 14px bold in tiles from 26 to 40px.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji. Every count uses the singular for one ("1 file", "1 second", "1 person"), including counts set by data attributes.
- This one: the skies are a small scene in natural colors (a blue day, a violet-to-orange dawn and dusk, a navy night, a yellow sun, a cream moon), not brand colors, because people already know what a sky at each hour looks like; the rest of the card stays in the brand palette and neutral, with green only on the slider's kind band.

DELIVER
The component with the date, home time zone and people (name, city, time zone) as inputs, the demo, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #686868  (dark: #A6A6A6)
--black: #000000
--body: #4E4E4E  (dark: #CCCCCC)
--border: #DDDDDD  (dark: #333333)
--border-strong: #C8C8C8  (dark: #464646)
--card: #FFFFFF  (dark: #171717)
--chart-1: #79EEEC
--chart-2: #FFC7F6
--chart-3: #FE8C5F
--chart-4: #99AD88
--danger-text: #ca2b30  (dark: #ff9592)
--duration-base: 200ms
--duration-reduced: 120ms
--duration-slow: 320ms
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F2F2F2)
--green-11: #218358  (dark: #3dd68c)
--input: #C8C8C8  (dark: #464646)
--leading-body: 22px
--leading-caption: 16px
--leading-small: 18px
--leading-title: 28px
--leading-ui: 20px
--lift: #FFFFFF  (dark: #424242)
--line: #DDDDDD  (dark: #333333)
--line-strong: #C8C8C8  (dark: #464646)
--mist: #EBEBEB  (dark: #2D2D2D)
--moon: #F4EFD6
--muted: #EBEBEB  (dark: #2D2D2D)
--muted-foreground: #686868  (dark: #A6A6A6)
--on-chart: #000000
--orange: #FE8C5F
--pink: #FFC7F6
--press-scale: 0.97
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-full: 9999px
--radius-md: 8px
--radius-xl: 16px
--raised: #FFFFFF  (dark: #424242)
--red-11: #ce2c31  (dark: #ff9592)
--ring: #0B7573  (dark: #79EEEC)
--sage: #99AD88
--shadow-sm: 0 1px 2px rgba(17, 17, 16, 0.04), 0 1px 3px rgba(17, 17, 16, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--sky-day-low: #8CCBF5
--sky-day-top: #2F86D8
--sky-dusk-low: #FFA66B
--sky-dusk-top: #5E62B0
--sky-night-low: #1F2C5A
--sky-night-top: #0A1430
--slate: #4E4E4E  (dark: #CCCCCC)
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--spring-ui: linear(0, 0.0237, 0.0849, 0.1704, 0.2697, 0.3746, 0.4788, 0.5777, 0.6685, 0.7491, 0.8189, 0.8776, 0.9257, 0.9639, 0.9931, 1.0147, 1.0296, 1.0391, 1.0442, 1.046, 1.0451, 1.0425, 1.0387, 1.0342, 1.0294, 1.0246, 1.02, 1.0158, 1.012, 1.0087, 1.0059, 1.0037, 1.0019, 1.0005, 0.9994, 0.9987, 0.9982, 0.998, 0.9979, 0.9979, 1)
--spring-ui-duration: 460ms
--star: #FFFFFF
--success: #218358
--sun: #FFD23F
--text-body: 15px
--text-caption: 12px
--text-small: 13px
--text-title: 20px
--text-ui: 14px
--tracking-title: -0.015em
--white: #FFFFFF  (dark: #171717)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
