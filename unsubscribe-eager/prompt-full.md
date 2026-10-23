Build "Unsubscribe Comes to You", an email footer in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
The opposite of the unsubscribe button that runs away: this one eagerly slides toward your cursor, grows, and says "Yes, This One." One click, done, no survey.

BEHAVIOR
1. A newsletter card: gradient logo tile, "The Weekly Growth Digest", "Issue #212 · 9 tips you've definitely seen before", gray skeleton lines for the body, then a footer zone (108px tall, hairline on top) with "You're receiving this because you signed up in 2019 and forgot." and a small underlined "Unsubscribe" link.
2. With a mouse within 220px of the button's home position, the button moves toward the pointer by 62% of the distance (a bit less when far), kept 12px inside the card. It follows on a spring with slight overshoot and scales up to 1.18 as you get closer.
3. Within 150px it becomes a filled primary button (Aqua in dark mode) with a soft shadow, reading "Over Here". Within 70px: "Yes, This One", with a gentle 3° wag. Leaving the card springs it home as a plain link again.
4. Click: the button turns green, "Unsubscribed", the email fades to 40%, and the status says "Done. No survey, no "Are you sure?", no sad puppy. That's it." Resubscribe: "We'll pretend that didn't happen."
5. Touch and keyboard users get a normal, still button.
Reduced motion: no movement at all.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the button starts as a plain muted-text link and only becomes a button as it gets eager.

DELIVER
The component with range and pull strength as inputs, the demo, and short usage notes.

OUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)
--aqua: #79EEEC
--aqua-700: #0B7573  (dark: #79EEEC)
--ash: #646A66  (dark: #A3A8A4)
--black: #000000
--border: #DCDED9  (dark: #313432)
--brand-strong: #0B7573  (dark: #79EEEC)
--card: #FFFFFF  (dark: #161817)
--duration-base: 200ms
--duration-slower: 480ms
--ease-in-out: cubic-bezier(0.62, 0, 0.32, 1)
--font-sans: "Geist", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
--foreground: #000000  (dark: #F3F2EE)
--green-11: #218358  (dark: #3dd68c)
--leading-body: 22px
--leading-caption: 16px
--leading-small: 18px
--line: #DCDED9  (dark: #313432)
--mist: #ECEBE6  (dark: #2B2E2D)
--muted: #ECEBE6  (dark: #2B2E2D)
--muted-foreground: #646A66  (dark: #A3A8A4)
--on-chart: #000000
--orange: #FE8C5F
--pink: #FFC7F6
--primary: #000000  (dark: #79EEEC)
--primary-foreground: #ffffff  (dark: #000000)
--radius-lg: 12px
--radius-md: 8px
--radius-sm: 6px
--radius-xl: 16px
--radius-xs: 4px
--ring: #0B7573  (dark: #79EEEC)
--shadow-sm: 0 1px 2px rgba(17, 17, 16, 0.04), 0 1px 3px rgba(17, 17, 16, 0.07)  (dark: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3))
--soft-ground: #F3F2EE  (dark: #0C0D0C)
--subtle: #F3F2EE  (dark: #0C0D0C)
--success: #218358
--success-foreground: #ffffff
--text-body: 15px
--text-caption: 12px
--text-small: 13px
--white: #FFFFFF  (dark: #161817)
Fonts: Geist and Geist Mono from Google Fonts (fallback system-ui).
