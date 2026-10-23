Build a "Tone Thermometer" for a message composer in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Passive-aggressive phrases lower the temperature of your message. Frost creeps in from the corners, and one button warms it back up with friendlier wording.

BEHAVIOR
1. Header: "To: Sam" and a thermometer pill (thermometer icon, "3°", "Chilly"). Below it, a 14px message field prefilled with "Per my last email, the files are in the shared folder. Going forward, please check there first." Then phrase chips (+ As previously mentioned, + Friendly reminder, + Noted.) and a Send button.
2. Start at 22°. Each phrase costs degrees and has a warmer swap:
   - per my last email −14 → in case it got buried
   - as previously mentioned −10 → as a quick recap
   - as I said −8 → like I mentioned
   - friendly reminder −7 → just a nudge
   - noted. −6 → Got it, thank you.
   - going forward −5 → next time
   - thanks in advance −4 → thank you so much
   - please advise −4 → let me know what you think
   - just to clarify −3 → to make sure we're aligned
   - kindly −3 → please
3. Words: Warm (18+), Mild (10+), Chilly (1+), Freezing (−9 to 0), Arctic (below −10). The button color blends in sRGB from Orange through gray to Aqua as it cools, and it shivers by 1.5px whenever the temperature drops.
4. Coldness = (12 − temperature) ÷ 30, clamped 0–1. It drives a light Aqua tint, an icy inner border and glow, and a frost layer of white radial gradients in the corners with fine radial streaks, masked to stay out of the middle. In dark mode the frost is at half strength.
5. When any phrase is found, an Aqua-tinted panel says "3 phrases are making this freezing." with an Orange "Warm It Up" button with black text. It swaps every phrase (keeping capitalization), thaws everything and says "Thawed. Same message, fewer enemies."
6. Send: "Sent at 22°. Sam will reply today." or, when cold, "…will reply in three to five business days."
Reduced motion: no shiver; frost changes in 100ms.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the frost is the only texture; chips are 30px fill pills.

DELIVER
The component with the phrase list (pattern, cost, replacement) as data, the demo, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--ai: #FE8C5F
--ai-foreground: #000000
--ai-text: #B5481A  (dark: #FE8C5F)
--amber-9: #ffc53d
--aqua: #79EEEC
--aqua-100: #CFF8F6  (dark: #0E2E2D)
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #646A66  (dark: #A3A8A4)
--black: #000000
--border: #DCDED9  (dark: #313432)
--brand-strong: #0B7573  (dark: #79EEEC)
--card: #FFFFFF  (dark: #161817)
--chart-1: #79EEEC
--duration-reduced: 120ms
--duration-slower: 480ms
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F3F2EE)
--input: #C6C9C3  (dark: #434744)
--leading-body: 22px
--leading-small: 18px
--line: #DCDED9  (dark: #313432)
--line-strong: #C6C9C3  (dark: #434744)
--mist: #ECEBE6  (dark: #2B2E2D)
--muted: #ECEBE6  (dark: #2B2E2D)
--muted-foreground: #646A66  (dark: #A3A8A4)
--on-color: #ffffff
--orange: #FE8C5F
--orange-700: #B5481A  (dark: #FE8C5F)
--press-scale: 0.97
--press-scale-sm: 0.94
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-full: 9999px
--radius-lg: 12px
--radius-md: 8px
--radius-sm: 6px
--radius-xl: 16px
--ring: #0B7573  (dark: #79EEEC)
--shadow-sm: 0 1px 2px rgba(17, 17, 16, 0.04), 0 1px 3px rgba(17, 17, 16, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--soft-ground: #F3F2EE  (dark: #0C0D0C)
--spring-press: linear(0, 0.0189, 0.0676, 0.1361, 0.2164, 0.3025, 0.3896, 0.4743, 0.5543, 0.628, 0.6945, 0.7535, 0.8049, 0.849, 0.8863, 0.9172, 0.9425, 0.9629, 0.9789, 0.9912, 1.0004, 1.0071, 1.0116, 1.0145, 1.016, 1.0166, 1.0164, 1.0156, 1.0146, 1.0133, 1.0118, 1.0104, 1.009, 1.0076, 1.0064, 1.0053, 1.0043, 1.0034, 1.0026, 1.002, 1)
--spring-press-duration: 310ms
--spring-ui: linear(0, 0.0237, 0.0849, 0.1704, 0.2697, 0.3746, 0.4788, 0.5777, 0.6685, 0.7491, 0.8189, 0.8776, 0.9257, 0.9639, 0.9931, 1.0147, 1.0296, 1.0391, 1.0442, 1.046, 1.0451, 1.0425, 1.0387, 1.0342, 1.0294, 1.0246, 1.02, 1.0158, 1.012, 1.0087, 1.0059, 1.0037, 1.0019, 1.0005, 0.9994, 0.9987, 0.9982, 0.998, 0.9979, 0.9979, 1)
--spring-ui-duration: 460ms
--subtle: #F3F2EE  (dark: #0C0D0C)
--text-body: 15px
--text-small: 13px
--warning: #ffc53d
--white: #FFFFFF  (dark: #161817)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
