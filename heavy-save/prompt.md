Build a "Heavy Save" button for a settings form in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
The Save button gains visible weight as unsaved changes pile up, so people feel what they'd lose before they leave.

BEHAVIOR
1. Count changes as the number of fields whose current value differs from the last saved value. Editing a field back to its saved value makes the button lighter again.
2. Clean state: a flat, muted button that reads "Saved". It is aria-disabled and ignores clicks.
3. Dirty state: the button uses the accent color and shows "Save" plus a count badge. For each change, capped at 5:
   - it sinks 1.6px further (translateY),
   - its drop shadow gets shorter and tighter, as if pressed into the surface,
   - its fill darkens about 5% (color-mix with black).
   Transition these on the ui spring (--spring-ui, 460ms).
4. When the count goes up, squash the button face (scale 1.04×0.9, then 0.99×1.03, then 1, over 380ms) and pop the badge (scale 1.35 and back). Use additive animation (composite: 'add') so it layers on the weight offset.
5. Each changed field shows a small accent dot beside its label.
6. Leave guard: when the person tries to navigate away with changes, stay put. Tug the button (left 7px with scale 1.06, overshoot right 3px, settle, 480ms) and show an inline note: "You have 3 unsaved changes." with a Discard button. Discard restores saved values and the weight lifts.
7. Save: show "Saving" briefly, then release. The weight drops to zero with a 7px upward overshoot, and a ghost copy of the badge floats up 28px and fades. The label becomes "Saved".

DETAILS
- Give the button an aria-label such as "Save 3 changes". Announce the leave-guard note politely.
- prefers-reduced-motion: keep the color and count changes, skip the squash, tug and overshoot.
- Theme with CSS variables: accent, on-accent, surface, sunken, text, muted, line, shadow, warn.


APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears. Icons are Lucide with round line ends and joins; every tick, cross, plus, minus and chevron is the Lucide check, x, plus, minus or chevron icon, never a typed character or a shape drawn with CSS borders.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the form is a white bordered list (label left, value right in muted text, 48px rows), the digest setting is the Outcraft switch (40×22, Black when on, Aqua in dark mode, knob stretches while held), and Save is a Black 8px button that turns into a quiet "Saved" button when clean.

DELIVER
The component, a demo form (workspace name, URL, time zone select, weekly-digest switch, and a "Go to Billing" link to test the leave guard), and short usage notes.
