Build a "Preview Palette" command palette in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Command palettes make you commit blind. This one previews each command live on the page while it's highlighted: the theme, accent, density or sort changes behind the palette, and Escape puts everything back.

BEHAVIOR
1. Open with ⌘K / Ctrl+K while focus is inside the app, or with a "Commands ⌘K" button. The palette is a Frost sheet: a search input, grouped options, and a help row ("↑ ↓ preview · ↵ apply · esc revert").
2. Demo commands: Appearance (Dark Mode, Light Mode), Accent (Aqua, Sage, Orange, Olive, each with a color swatch), Density (Compact, Comfortable), Sort Pages (By Name, By Most Recent). The current setting of each is marked "Current".
3. Highlighting an option by arrow key or hover applies it to the app immediately as a preview: colors cross-fade (0.39s), density springs paddings, and sorting reorders rows with FLIP. While previewing something different from the saved state, the app gets a 2px Aqua ring and a "Previewing" badge.
4. Moving the pointer off the list, pressing Escape, or clicking outside reverts to the saved state. Enter or click commits it, closes the palette, and announces "Accent set to Sage."
5. Typing filters options; the first match is highlighted and previewed. Use role listbox/option with aria-activedescendant.
Reduced motion: changes apply in 100ms without springs or FLIP.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the palette is a 340px Frost sheet with 16px corners over the app; the highlighted option is a solid primary row (Black with white text, Aqua with black text in dark mode). The whole component is one 16px white card: the demo app sits inside it as a 12px rounded window, and the status line ("Density set to Compact.") appears under the app, inside the same card.

DELIVER
The component with commands as data (key, value, label, group), the demo app, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--accent: #ECEBE6  (dark: #2B2E2D)
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #646A66  (dark: #A3A8A4)
--black: #000000
--blur-md: 16px
--border: #DCDED9  (dark: #313432)
--brand: #79EEEC
--card: #FFFFFF  (dark: #161817)
--duration-base: 200ms
--duration-reduced: 120ms
--duration-slow: 320ms
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F3F2EE)
--frost: rgba(255, 255, 255, 0.74)  (dark: rgba(21, 23, 22, 0.74))
--frost-border: rgba(0, 0, 0, 0.08)  (dark: rgba(243, 242, 238, 0.1))
--frost-saturate: 160%
--input: #C6C9C3  (dark: #434744)
--leading-body: 22px
--leading-small: 18px
--line: #DCDED9  (dark: #313432)
--line-strong: #C6C9C3  (dark: #434744)
--mist: #ECEBE6  (dark: #2B2E2D)
--muted: #ECEBE6  (dark: #2B2E2D)
--muted-foreground: #646A66  (dark: #A3A8A4)
--olive: #AA9856
--on-color: #ffffff
--orange: #FE8C5F
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-full: 9999px
--radius-lg: 12px
--radius-md: 8px
--radius-sm: 6px
--radius-xl: 16px
--ring: #0B7573  (dark: #79EEEC)
--sage: #99AD88
--shadow-sm: 0 1px 2px rgba(17, 17, 16, 0.04), 0 1px 3px rgba(17, 17, 16, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--shadow-xl: 0 8px 16px -4px rgba(17, 17, 16, 0.08), 0 28px 56px -12px rgba(17, 17, 16, 0.22)  (dark: 0 8px 16px -4px rgba(0, 0, 0, 0.55), 0 28px 56px -12px rgba(0, 0, 0, 0.65))
--soft-ground: #F3F2EE  (dark: #0C0D0C)
--spring-pop: linear(0, 0.0413, 0.1464, 0.2895, 0.4487, 0.6073, 0.7529, 0.8776, 0.9776, 1.0517, 1.1013, 1.1292, 1.1394, 1.1357, 1.1225, 1.1033, 1.0813, 1.059, 1.0382, 1.0202, 1.0055, 0.9945, 0.9869, 0.9825, 0.9807, 0.9808, 0.9825, 0.985, 0.9881, 0.9912, 0.9941, 0.9967, 0.9989, 1.0005, 1.0017, 1.0024, 1.0027, 1.0027, 1.0025, 1.0022, 1)
--spring-pop-duration: 680ms
--spring-press-duration: 310ms
--spring-ui: linear(0, 0.0237, 0.0849, 0.1704, 0.2697, 0.3746, 0.4788, 0.5777, 0.6685, 0.7491, 0.8189, 0.8776, 0.9257, 0.9639, 0.9931, 1.0147, 1.0296, 1.0391, 1.0442, 1.046, 1.0451, 1.0425, 1.0387, 1.0342, 1.0294, 1.0246, 1.02, 1.0158, 1.012, 1.0087, 1.0059, 1.0037, 1.0019, 1.0005, 0.9994, 0.9987, 0.9982, 0.998, 0.9979, 0.9979, 1)
--spring-ui-duration: 460ms
--subtle: #F3F2EE  (dark: #0C0D0C)
--text-body: 15px
--text-caption: 12px
--text-small: 13px
--text-title-sm: 17px
--tint-c: 0.4  (dark: 0.45)
--tint-l: 0.92  (dark: 0.32)
--white: #FFFFFF  (dark: #161817)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
