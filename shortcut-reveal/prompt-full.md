Build a "Shortcut Reveal" toolbar in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Holding Ctrl (⌘ on Mac keyboards) shows every keyboard shortcut on the toolbar at once, as keycaps that ripple out from the pointer. It teaches shortcuts at the moment people need them.

BEHAVIOR
1. Each action button declares its shortcut, e.g. data-shortcut="mod+shift+s". Render the keycap per platform: "⇧⌘S" on Mac, "Ctrl ⇧ S" elsewhere. Set aria-keyshortcuts.
2. Reveal only when the modifier is held on its own for 320ms. If another key is pressed within that time, it was a normal shortcut, so don't flash the keycaps.
3. Keycaps appear below each button with a springy scale and lift (scale 0.7 to 1 on the pop spring). Delay each by its distance from the pointer × 0.6ms, capped at 260ms. Without a pointer, ripple from the first button. If a keycap would overlap its neighbour on small icon buttons, drop it to a second row about 26px lower with a thin leader line up to its button.
4. While revealed, dim and slightly blur the content area so the toolbar stands out.
5. Pressing a matching key while holding the modifier runs the action, flashes the button with a ring, and marks that shortcut as learned (its keycap turns the success color).
6. Release the modifier to hide. Also hide on window blur and when the tab is hidden, so keycaps never get stuck after Cmd+Tab.
7. Clicking a button runs the action and shows a toast that teaches the shortcut: "Bold on · ⌘B next time".
8. A footer hint tracks progress: "Hold ⌘ to see every shortcut" → "Keep holding ⌘ and press a letter" → "Learned 2 of 7 shortcuts".
9. Touch: a "Hold to show shortcuts" button reveals the keycaps while pressed.

SAFETY
- Ignore everything while the person is typing in an input, textarea, select or editable field outside the toolbar.
- Only listen while the toolbar is on screen (IntersectionObserver), and only preventDefault for shortcuts you handle.
- Avoid shortcuts browsers reserve (⌘N, ⌘T, ⌘W, ⌘L).

prefers-reduced-motion: no ripple or spring; keycaps simply fade in.
Theme with CSS variables: accent, on-accent, success, on-success, surface, sunken, text, muted, line.


APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: toolbar actions are grouped into Frost pills (Search | Bold, Italic, Comment, Undo | Share) whose buttons are capsules (circles when icon-only), so their hover and on states match the pill's shape; a Black Publish button (Aqua in dark mode). Every button's label or icon is exactly centered: the hidden keycap is positioned absolutely and must not take a flex gap, so space the icon and label with a margin, not gap. Keycaps are small dark pills in Geist Mono; learned ones turn green.

DELIVER
The component, a demo editor toolbar (Search ⌘K, Bold ⌘B, Italic ⌘I, Comment ⇧⌘M, Undo ⌘Z, Share ⇧⌘S, Publish ⌘↵) above a short document whose selected phrase Bold and Italic actually change, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #646A66  (dark: #A3A8A4)
--black: #000000
--blur-md: 16px
--border: #DCDED9  (dark: #313432)
--brand-foreground: #000000
--card: #FFFFFF  (dark: #161817)
--duration-base: 200ms
--duration-fast: 140ms
--duration-slower: 480ms
--ease-out: cubic-bezier(0.22, 0.9, 0.24, 1)
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F3F2EE)
--frost: rgba(255, 255, 255, 0.74)  (dark: rgba(21, 23, 22, 0.74))
--frost-border: rgba(0, 0, 0, 0.08)  (dark: rgba(243, 242, 238, 0.1))
--frost-saturate: 160%
--green-11: #218358  (dark: #3dd68c)
--highlight: #79EEEC
--leading-body: 22px
--leading-caption: 16px
--leading-small: 18px
--leading-title: 28px
--leading-title-sm: 24px
--line: #DCDED9  (dark: #313432)
--mist: #ECEBE6  (dark: #2B2E2D)
--muted: #ECEBE6  (dark: #2B2E2D)
--muted-foreground: #646A66  (dark: #A3A8A4)
--press-scale: 0.97
--press-scale-sm: 0.94
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-full: 9999px
--radius-md: 8px
--radius-sm: 6px
--radius-xl: 16px
--radius-xs: 4px
--ring: #0B7573  (dark: #79EEEC)
--shadow-lg: 0 4px 8px -2px rgba(17, 17, 16, 0.06), 0 16px 32px -8px rgba(17, 17, 16, 0.14)  (dark: 0 4px 8px -2px rgba(0, 0, 0, 0.5), 0 16px 32px -8px rgba(0, 0, 0, 0.55))
--shadow-md: 0 2px 4px -1px rgba(17, 17, 16, 0.05), 0 6px 14px -3px rgba(17, 17, 16, 0.09)  (dark: 0 2px 4px -1px rgba(0, 0, 0, 0.45), 0 6px 14px -3px rgba(0, 0, 0, 0.45))
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--spring-ui: linear(0, 0.0237, 0.0849, 0.1704, 0.2697, 0.3746, 0.4788, 0.5777, 0.6685, 0.7491, 0.8189, 0.8776, 0.9257, 0.9639, 0.9931, 1.0147, 1.0296, 1.0391, 1.0442, 1.046, 1.0451, 1.0425, 1.0387, 1.0342, 1.0294, 1.0246, 1.02, 1.0158, 1.012, 1.0087, 1.0059, 1.0037, 1.0019, 1.0005, 0.9994, 0.9987, 0.9982, 0.998, 0.9979, 0.9979, 1)
--spring-ui-duration: 460ms
--success: #218358
--success-foreground: #ffffff
--text-body: 15px
--text-body-lg: 16px
--text-caption: 12px
--text-small: 13px
--text-title: 20px
--text-title-sm: 17px
--tracking-title: -0.015em
--white: #FFFFFF  (dark: #161817)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
