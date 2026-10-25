Build a "Dusty Doc" for documents nobody has opened in years in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
A document untouched for years opens covered in dust, with a cobweb in the corner. Scrolling or swiping blows the dust away, and the page regains its color.

BEHAVIOR
1. A file header ("Q3 2022 Strategy (Draft)", "Last opened 3 years ago by you") and a 230px page on Soft ground with headings and secondary text. A canvas over the page holds about 520 dust specks, 0.5–3px in warm grays at 35–85% opacity. A thin cobweb SVG sits in the top-right corner.
2. Age (stuck specks ÷ total) drives the content: sepia(0.55 × age), lower contrast and opacity, and a faint warm overlay.
3. Scrolling releases a share of the stuck specks (1.2% per pixel scrolled, up to 50% per event). They fly in the scroll direction with random spread, slow with drag, drift down slightly and fade.
4. Swiping across the page faster than 0.6 px/ms blows away the specks within 46px of the pointer in its direction of travel.
5. Below 45% dust, the cobweb tumbles off (falls 60px, rotates 40°, fades). Below 4%, everything clears and the status says "Good as new. It still says "Q3 2022" though." A Let It Gather Dust link lets three more years pass, with dust settling back over a second.
Only show it for files untouched for a long time. Reduced motion: dust settles back instantly.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the dust and cobweb are drawn, not photographic, and stay subtle enough to read through.

DELIVER
The component with speck count and the age threshold as inputs, the demo, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #646A66  (dark: #A3A8A4)
--black: #000000
--border: #DCDED9  (dark: #313432)
--brand-strong: #0B7573  (dark: #79EEEC)
--card: #FFFFFF  (dark: #161817)
--duration-reduced: 120ms
--duration-slower: 480ms
--ease-in: cubic-bezier(0.5, 0, 0.78, 0.24)
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F3F2EE)
--leading-body: 22px
--leading-small: 18px
--line: #DCDED9  (dark: #313432)
--mist: #ECEBE6  (dark: #2B2E2D)
--muted: #ECEBE6  (dark: #2B2E2D)
--muted-foreground: #646A66  (dark: #A3A8A4)
--olive: #AA9856
--paper: #F3F1EA  (dark: #0D0E0C)
--primary: #000000  (dark: #79EEEC)
--radius-lg: 12px
--radius-md: 8px
--radius-sm: 6px
--radius-xl: 16px
--ring: #0B7573  (dark: #79EEEC)
--shadow-sm: 0 1px 2px rgba(17, 17, 16, 0.04), 0 1px 3px rgba(17, 17, 16, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--soft-ground: #F3F2EE  (dark: #0C0D0C)
--stone: #8A908C  (dark: #7C827E)
--subtle: #F3F2EE  (dark: #0C0D0C)
--text-body: 15px
--text-small: 13px
--white: #FFFFFF  (dark: #161817)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
