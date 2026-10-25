Build "LGTM (Didn't Look)", a pull request approval stamp, in [YOUR STACK — e.g. React + Tailwind, Vue, or plain HTML/CSS/JS].

WHAT IT DOES
Approve a huge pull request a few seconds after opening it and the approval stamp tells the truth: "LGTM (Didn't Look)".

BEHAVIOR
1. A pull request card: merge icon, title ("Refactor billing service"), "#482 · Sam wants to merge 31 commits", stats (+2,114 in green, −1,387 in red, "0 of 48 files viewed"), a 150px scrolling diff with sticky file names and green/red line backgrounds, and a green "Approve" button.
2. A timer starts when the card scrolls into view: "Open for 3.2 seconds". Files viewed = scroll progress of the diff × total files, and it only goes up.
3. Approve: if under 80% of files were viewed and it's been under 20 seconds, stamp "LGTM" with "(Didn't Look)" in amber. Otherwise stamp "LGTM (Actually Looked)" in green.
4. The stamp is a rounded 3px-bordered box rotated −9°, heavy 44px type, slightly translucent fill and a speckled ink mask. It slams in over the diff in 0.42s (scale 2.2 and blur to 0.94, then 1) while the diff dips 2px.
5. Status line: "Approved in 1.9 seconds with 0 of 48 files viewed. Sam is thrilled." or "Approved after viewing 48 of 48 files. A rare and beautiful thing." An Undo link lifts it and restarts the timer.
Reduced motion: the stamp just appears.

APPEARANCE (Outcraft Design System)
- Use the Outcraft Design System tokens listed under OUTCRAFT TOKENS at the end of this prompt, defined as CSS variables on the component's root element (light values by default, dark values when the page is in dark mode). Never hardcode colors, fonts, radii, shadows or timings anywhere else.
- Type: Geist for interface text (controls 14/20, body 15/22, small 13/18, caption 12/16; headings tighten as they grow), Geist Mono for code, keys and numbers that change. Fallback: system-ui.
- Color: warm grounds (Canvas #FAFAF8 page, Soft ground #F3F2EE behind white cards), Black #000 headlines, Slate #4A504D body text, Line #DCDED9 borders. Primary buttons are Black (Aqua #79EEEC with black text in dark mode). Aqua is the signature: highlights, brand buttons, selected states on Aqua 100 #CFF8F6; Aqua 700 #0B7573 for links, focus rings and progress on light grounds. Status uses the universal colors (Radix Red, Green, Amber, Blue): red #CE2C31 for errors, green #218358 for success, amber #FFC53D (black text) for warnings, blue #0D74CE for info, each with a soft tint and darker text. Orange #FE8C5F is the AI pill; Pink #FFC7F6 marks accent badges and steps. A colored panel, chip or soft fill is a tint of its color at a fixed lightness (OKLCH L 0.92 in light, 0.32 in dark, keeping 40% / 45% of its chroma), so pale Aqua and strong red separate from the card equally; never outlined. Colored text on a tint is capped at OKLCH L 0.48 in light, and gray secondary text on it uses the body gray. A soft red button (Decline, Delete, Cancel) is red at 16% in light and 30% in dark with deep red text (#AC2529 in light, #FF9592 in dark), never outlined; it centers its label.
- Shape: 8px radius for buttons and inputs, 12px for cards, 16px for large surfaces; pills only for badges, switches and floating bars; concentric corners. 1px borders; soft layered shadows only for things that float. Components hug their content: a status line, footer or message that is empty takes no space, and the card grows when text appears.
- Motion: our springs. Press feedback --spring-press (310ms) scaling to 0.97, controls --spring-ui (460ms, slight overshoot), panels --spring-panel (530ms, no bounce), delight --spring-pop (680ms). Animate transform and opacity only. Reduce Motion: 120ms fades.
- Floating surfaces use Frost: a translucent fill, 16px backdrop blur, 160% saturation, a 1px border and a large soft shadow.
- Accessibility: a 2px focus ring in the ring color with a 2px offset, 44px touch targets, text at 4.5:1, polite live regions for status lines.
- Copy: title-case button labels, sentence-case body text, no emoji.
- This one: the diff is a 14px Soft ground box in a monospace font; the card clips the stamp so it never spills outside.

DELIVER
The component with file count and honesty thresholds as inputs, the demo, and short usage notes.
