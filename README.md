# Micro Interactions

<!-- intro:start -->
**Micro interactions for the moments products get wrong.**

Serious interactions for real product moments, and funny ones that shouldn't exist (some secretly should). Copy the code or the AI prompt. New ones drop every week.

61 interactions so far (35 Useful, 14 Secretly Useful, 12 Pure Joke).
<!-- intro:end -->

Every interaction runs live on the site and ships with a prompt that rebuilds it in any stack. Designed by Outcraft©, built on the Outcraft Design System v2.

## Use an interaction

On the site, **View Code** opens Prompt, HTML, CSS, JS and One File tabs. Each tab's box names its file and has its own Copy button; One File also has Download. **Copy Prompt** copies the prompt. Everything you copy is self-contained: the CSS carries the exact Outcraft tokens and the Geist font it needs, so it works pasted into any page with nothing else installed.

In this repo, each folder is one interaction:

- `one-file.html`: the whole interaction in one file that works on its own. Open it, or paste it into a page.
- `index.html`: the demo page with a Reset button.
- `component.html`, `component.css`, `component.js`: the source parts. They use the Outcraft tokens in `outcraft-tokens.css`. On the site, the copied CSS already includes the tokens each component needs, so nothing else is required.
- `prompt-full.md`: a copy-ready prompt that rebuilds it in any stack, with the exact Outcraft values (`prompt.md` is its source).

Each script finds its own `[data-mi="…"]` element on load and exposes an init function for content added later, for example `initBlastRadius(el)`: `init` plus the name in PascalCase.

## Theming

Every value is an Outcraft token: color, type, radius, shadow, blur, spring and duration. Change the palette tokens in `outcraft-tokens.css` to re-brand everything at once. Light and dark both work, and Reduce Motion is respected everywhere.

## Work on the library

The design rules, the checklist for new interactions and the decision log live in `RULES.md`, with `CLAUDE.md` and `AGENTS.md` pointing AI assistants to it. Those three files are kept on the owner's machine and are not published in this repo. Assistants working on the project read `RULES.md` first. In short:

```
python3 tools/build.py --check   # check the rules
python3 tools/build.py           # check, then generate the site, every <slug>/ page and this README's catalogue
```

The build writes `index.html`, each `<slug>/index.html`, `one-file.html` and `prompt-full.md`, and refreshes the intro and catalogue in this README, so commit those generated files with every change.

Every icon is a Lucide icon. `tools/lucide-icons.json` holds the exact Lucide drawings in use, and the build fails any icon that isn't one of them: to use a new icon, copy its drawing from [lucide.dev](https://lucide.dev/icons) into that file first.

Deploy the repository as a static site (entry point `index.html`, no build command). On Vercel, import the repo and keep the defaults.

The site's **Submit an idea** form sends to the Formspree form set as `formEndpoint` in `site.json`; Formspree saves each idea and emails it on, so no address appears on the site. If you reuse this repo, put your own Formspree form there, or leave it empty and the form runs in preview mode and sends nothing.

## Interactions

<!-- catalogue:start -->
| No. | Name | Type | Topic | |
|---|---|---|---|---|
| 001 | [Blast Radius](blast-radius/) | Useful | Files and Data |  |
| 002 | [Heavy Save](heavy-save/) | Useful | Files and Data |  |
| 003 | [Point-at-Error](point-at-error/) | Useful | Forms and Input |  |
| 004 | [Coin Drop](coin-drop/) | Useful | Billing and Plans |  |
| 005 | [Shortcut Reveal](shortcut-reveal/) | Useful | Search and Navigation |  |
| 006 | [Spill Counter](spill-counter/) | Useful | Forms and Input |  |
| 007 | [Frosted Peek](frosted-peek/) | Useful | Billing and Plans |  |
| 008 | [Refill Timer](refill-timer/) | Useful | Loading and Status |  |
| 009 | [File-Aware Dropzone](file-dropzone/) | Useful | Files and Data |  |
| 010 | [Ghost Caret](ghost-caret/) | Useful | Teams and Sharing |  |
| 011 | [Honest Skeleton](honest-skeleton/) | Useful | Loading and Status |  |
| 012 | [Typo Morph](typo-morph/) | Useful | Search and Navigation |  |
| 013 | [Clipboard Stack](clipboard-stack/) | Useful | Files and Data |  |
| 014 | [Leaning Empty State](leaning-empty-state/) | Useful | Loading and Status |  |
| 015 | [Session Fade](session-fade/) | Useful | Loading and Status |  |
| 016 | [Lock Builder](lock-builder/) | Useful | Forms and Input |  |
| 017 | [Seat Stacker](seat-stacker/) | Useful | Billing and Plans |  |
| 018 | [Snooze Slide](snooze-slide/) | Useful | Messages and Email |  |
| 019 | [Setup Ring](setup-ring/) | Useful | Loading and Status |  |
| 020 | [Elastic Range](elastic-range/) | Useful | Forms and Input |  |
| 021 | [Offline Queue](offline-queue/) | Useful | Loading and Status |  |
| 022 | [Pocket Progress](pocket-progress/) | Useful | Loading and Status |  |
| 023 | [Unsure Underline](unsure-underline/) | Useful | AI |  |
| 024 | [Paper Invite](paper-invite/) | Useful | Teams and Sharing |  |
| 025 | [Preview Palette](preview-palette/) | Useful | Search and Navigation |  |
| 026 | [Token Taximeter](token-taximeter/) | Useful | Billing and Plans |  |
| 027 | [Approval Stamp](approval-stamp/) | Useful | Teams and Sharing |  |
| 028 | [Lasso Select](lasso-select/) | Useful | Files and Data |  |
| 029 | [Archive Drawer](archive-drawer/) | Useful | Files and Data |  |
| 030 | [Sort Trace](sort-trace/) | Useful | Search and Navigation |  |
| 031 | [Step Fold](step-fold/) | Useful | Forms and Input |  |
| 032 | [Rewind Scrub](rewind-scrub/) | Useful | Files and Data |  |
| 033 | [Due Heat](due-heat/) | Useful | Meetings and Calendar |  |
| 034 | [Scope Chips](scope-chips/) | Useful | Search and Navigation |  |
| 035 | [Access Ladder](access-ladder/) | Useful | Teams and Sharing |  |
| 036 | [Could've Been an Email](could-be-email/) | Secretly Useful | Meetings and Calendar | New |
| 037 | [Anxious Typing Dots](anxious-dots/) | Pure Joke | Messages and Email | New |
| 038 | [Rage Click Detector](rage-click/) | Secretly Useful | Loading and Status | New |
| 039 | [AI Flip-Flop](ai-flip-flop/) | Pure Joke | AI | New |
| 040 | [Terms Speedrun](terms-speedrun/) | Secretly Useful | Forms and Input | New |
| 041 | [LGTM (Didn't Look)](lgtm-stamp/) | Pure Joke | Developer Tools | New |
| 042 | [Friday Deploy Hard Hat](friday-deploy/) | Secretly Useful | Developer Tools | New |
| 043 | [Commit Mood Ring](commit-mood/) | Pure Joke | Developer Tools | New |
| 044 | [Rubber Duck Gate](rubber-duck/) | Secretly Useful | Developer Tools | New |
| 045 | [final_FINAL_v3](final-final/) | Pure Joke | Files and Data | New |
| 046 | [Tone Thermometer](tone-thermometer/) | Secretly Useful | Messages and Email | New |
| 047 | [Quick Question Stopwatch](quick-question/) | Pure Joke | Messages and Email | New |
| 048 | [Circle Back Boomerang](circle-back/) | Secretly Useful | Messages and Email | New |
| 049 | [Exclamation Budget](exclamation-budget/) | Pure Joke | Messages and Email | New |
| 050 | [Attachment Shrug](attachment-shrug/) | Secretly Useful | Messages and Email | New |
| 051 | [Mute Mime](mute-mime/) | Secretly Useful | Meetings and Calendar | New |
| 052 | [Camera-Off Curtain](camera-curtain/) | Pure Joke | Meetings and Calendar | New |
| 053 | [Overtime Fuse](overtime-fuse/) | Secretly Useful | Meetings and Calendar | New |
| 054 | [Line Clear](line-clear/) | Secretly Useful | Meetings and Calendar | New |
| 055 | [Over-the-Shoulder Cursor](shoulder-cursor/) | Pure Joke | Teams and Sharing | New |
| 056 | [Dusty Doc](dusty-doc/) | Pure Joke | Files and Data | New |
| 057 | [Autosave Appreciation](autosave-thanks/) | Secretly Useful | Files and Data | New |
| 058 | [Unsubscribe Comes to You](unsubscribe-eager/) | Pure Joke | Messages and Email | New |
| 059 | [Dizzy Refresh](dizzy-refresh/) | Secretly Useful | Loading and Status | New |
| 060 | [Aging Reminder](aging-reminder/) | Secretly Useful | Messages and Email | New |
| 061 | [Cancel, Eventually](cancel-dodge/) | Pure Joke | Billing and Plans | New |
<!-- catalogue:end -->

## Credits and license

- Type: Geist and Geist Mono (SIL Open Font License 1.1).
- Icons: Lucide (ISC). The exact drawings in use are in `tools/lucide-icons.json`.
- Status colors: Radix Colors (MIT).
- Patterns inspired by shadcn/ui (MIT). All code is original.

Released under the MIT license.
