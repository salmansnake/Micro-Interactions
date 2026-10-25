#!/usr/bin/env python3
"""Build the Micro Interactions site from interactions.json.

    python3 tools/build.py           check everything, then write index.html and every <slug>/index.html
    python3 tools/build.py --check   only run the checks (exit code 1 if anything is wrong)

No dependencies beyond Python 3.8+. Read RULES.md before changing anything.
"""
import html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'tools', 'site')
FILES = ('component.html', 'component.css', 'component.js', 'prompt.md')
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap">')

def rd(*p): return open(os.path.join(ROOT, *p), encoding='utf-8').read()
def esc(s): return html.escape(str(s), quote=True)
def js_json(o): return json.dumps(o, ensure_ascii=False).replace('</', '<\\/')

def ui_icon(slug, name):
    """{icon:Name} in site text: the icon of the control whose aria-label starts with Name, exactly as the interaction draws it."""
    h = rd(slug, 'component.html')
    m = re.search(r'<(\w+)\b[^>]*\baria-label="' + re.escape(name) + r'[^"]*"[^>]*>', h)
    if not m: return None
    svg = re.search(r'<svg\b.*?</svg>', h[m.end():h.find('</' + m.group(1) + '>', m.end())], re.S)
    return svg.group(0) if svg else None

def ref_icons(it):
    return {n: ui_icon(it['slug'], n) for t in [it.get('summary', ''), it.get('tryit', '')] + [sp.get('value', '') for sp in it.get('specs', [])]
            for n in re.findall(r'\{icon:([^{}]+)\}', t)}

SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{}</svg>'
ICON = {k: SVG.format(v) for k, v in {
    'linkedin': '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
    'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    'moon': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    'copy': '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    'code': '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    'arrow': '<path d="M5 12h14M12 5l7 7-7 7"/>',
    'hand': '<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
    'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'filter': '<path d="M3 6h18M7 12h10M10 18h4"/>',
    'x': '<path d="M18 6 6 18M6 6l12 12"/>',
    'list': '<path d="M3 12h18M3 6h18M3 18h18"/>',
    'home': '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    'reset': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
}.items()}

# The X logo is a filled mark (not a Lucide stroke icon), drawn at the same 16px size.
X_LOGO = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'

def reset_btn(name, extra=''):
    return (f'<button type="button" class="mi-reset{extra}" data-mi-reset aria-label="Reset {esc(name)}">{ICON["reset"]}'
            f'<span class="mi-reset-tip" aria-hidden="true">Reset</span></button>')

# ---------------------------------------------------------------- load + check
def load():
    reg = json.loads(rd('interactions.json'))
    site = json.loads(rd('site.json'))
    return reg, site

LEAKS = re.compile(r'outcraft-tokens\.css|outcraft-components\.css|RULES\.md|CLAUDE\.md|AGENTS\.md|\bartifact\b|\bApple\b', re.I)

def check(reg):
    errors, warns = [], []
    items = reg['interactions']
    tokens = rd('outcraft-tokens.css')
    defined = set(re.findall(r'(--[a-zA-Z0-9-]+)\s*:', tokens)) | set(re.findall(r'(--[a-zA-Z0-9-]+)\s*:', rd('outcraft-components.css')))
    nums = [it['number'] for it in items]
    for i, n in enumerate(nums, 1):
        if n != f'{i:03d}': errors.append(f'numbers must run 001, 002, … in order with no gaps; position {i} has {n}')
    slugs = [it['slug'] for it in items]
    if len(set(slugs)) != len(slugs): errors.append('duplicate slug in interactions.json')
    roots = {}
    banned = re.compile(r'\b(MI|NA)-\d{3}\b|\bBatch \d|\bVol\. \d')
    # US English, Austin locale, and the owner's name (RULES 12a, 12b)
    # Words that must never ship: British spellings and wrong forms of the owner's name. Extra private words
    # (places, names) can be listed one per line in tools/private-words.txt, which is ignored by Git (RULES 2a).
    words = [r'colours?', 'coloured', r'greys?', 'centred', r'centre[ds]?', r'behaviours?', 'licence', r'initialis\w*', r'cancell(?:ed|ing)', r'favourites?', r'organis\w*', 'humour', 'Salman Snake', 'SalmanSnake']
    pw = os.path.join(ROOT, 'tools', 'private-words.txt')
    if os.path.isfile(pw): words += [re.escape(w.strip()) for w in open(pw, encoding='utf-8') if w.strip() and not w.startswith('#')]
    locale = re.compile(r'\b(' + '|'.join(words) + r')\b', re.I)
    for it in items:
        s = it['slug']
        for k in ('number', 'slug', 'name', 'type', 'topic', 'new', 'summary', 'tryit', 'specs'):
            if k not in it: errors.append(f'{s}: missing "{k}"')
        if it.get('type') not in reg['types']: errors.append(f'{s}: type "{it.get("type")}" is not one of {reg["types"]}')
        if it.get('topic') not in reg['topics']: errors.append(f'{s}: topic "{it.get("topic")}" is not in the topic list')
        d = os.path.join(ROOT, s)
        missing = [f for f in FILES if not os.path.isfile(os.path.join(d, f))]
        if missing: errors.append(f'{s}: missing {", ".join(missing)}'); continue
        h, c, j, pr = (rd(s, f) for f in FILES)
        m = re.findall(r'<(\w+)[^>]*\bclass="([\w-]+)[^"]*"[^>]*\bdata-mi="([^"]+)"', h)
        if len(re.findall(r'data-mi="', h)) != 1: errors.append(f'{s}: component.html needs exactly one data-mi root')
        elif not m: errors.append(f'{s}: the data-mi element must have its prefix class first, e.g. class="xx" data-mi="{s}"')
        else:
            cls, mi = m[0][1], m[0][2]
            if mi != s: errors.append(f'{s}: data-mi="{mi}" must equal the folder name')
            if cls in roots: errors.append(f'{s}: class prefix "{cls}" is already used by {roots[cls]} (every component needs its own)')
            roots[cls] = s
            if f'.{cls} [hidden]' not in c: warns.append(f'{s}: add ".{cls} [hidden] {{ display: none !important; }}" at the end of component.css')
        if len(re.findall(r'window\.(init\w+)\s*=', j)) != 1: errors.append(f'{s}: component.js needs exactly one window.initXxx = … export')
        for fname, txt in (('component.html', h), ('component.css', c), ('component.js', j), ('prompt.md', pr)):
            if banned.search(txt): errors.append(f'{s}/{fname}: old MI-/NA- codes or batch/volume names are not allowed')
            for w in locale.findall(txt):
                errors.append(f'{s}/{fname}: "{w}" breaks the locale or name rules (RULES 12a, 12b)')
            # Copied code must stand alone: no mention of files, tools or notes the person won't have (RULES 8a).
            for w in LEAKS.findall(txt):
                errors.append(f'{s}/{fname}: "{w}" must not appear in code people copy (RULES 8a); copied code is self-contained')
        src = h + c + j
        local = set(re.findall(r'(--[a-zA-Z0-9-]+)\s*:', src)) | set(re.findall(r"setProperty\(\s*'(--[a-zA-Z0-9-]+)'", src))
        used = set(re.findall(r'var\((--[a-zA-Z0-9-]+)\s*\)', src))
        miss = sorted(u for u in used if u not in defined and u not in local)
        if miss: errors.append(f'{s}: uses undefined tokens {miss}')
        # Text on Primary or Brand (Aqua in dark mode) must use their -foreground tokens, never white.
        alias = dict(re.findall(r'(--[\w-]+)\s*:\s*var\((--[\w-]+)\)', c))
        def _res(v):
            for _ in range(6): v = alias.get(v, v)
            return v
        for sel, body in re.findall(r'([^{}]+)\{([^{}]*)\}', c):
            bg = re.search(r'background(?:-color)?\s*:\s*var\((--[\w-]+)\)\s*;', body)
            col = re.search(r'(?<![-\w])color\s*:\s*var\((--[\w-]+)\)', body)
            if bg and col and _res(bg.group(1)) in ('--primary', '--brand') and _res(col.group(1)) not in ('--primary-foreground', '--brand-foreground'):
                errors.append(f'{s}: "{sel.strip().splitlines()[-1]}" puts {col.group(1)} text on {bg.group(1)}; use --primary-foreground or --brand-foreground')
        # Detail rules (RULES.md 10b). Thumbs and knobs on a track use --raised, never a dark surface in dark mode.
        for name, target in alias.items():
            if re.search(r'thumb|knob', name) and _res(target) in ('--card', '--background', '--white', '--popover', '--canvas'):
                errors.append(f'{s}: {name} points at {target}; thumbs and knobs use --raised (RULES 10a)')
        # Hug the content (RULES 10b.2): a status line that starts empty must leave the layout until it has text.
        for tag, cls in re.findall(r'<(\w+)\b[^>]*\bclass="([\w-]+)[^"]*"[^>]*role="status"[^>]*>\s*</\1>', h) + re.findall(r'<(\w+)\b[^>]*role="status"[^>]*\bclass="([\w-]+)[^"]*"[^>]*>\s*</\1>', h):
            own = re.search(r'\.' + re.escape(cls) + r'\s*\{([^}]*)\}', c)
            if own and re.search(r'min-height\s*:\s*[1-9]', own.group(1)) and not re.search(r'\.' + re.escape(cls) + r':empty', c):
                errors.append(f'{s}: ".{cls}" is an empty status line that still takes space; add ".{cls}:empty" so it leaves the layout until text arrives (RULES 10b.2)')
        # Hug the content (RULES 10b.2): a text line is never held taller than one line for text or buttons that come later.
        for sel, body in re.findall(r'([^{}]+)\{([^{}]*)\}', c):
            sel1 = sel.strip().splitlines()[-1]
            mh = re.search(r'(?<![-\w])min-height\s*:\s*(\d+)px', body)
            if mh and int(mh.group(1)) > 24 and re.search(r'-(status|msg|message|note|hint|summary|caption|foot|after)\s*$', sel1.strip()) and 'mi-allow-hold' not in body:
                errors.append(f'{s}: "{sel1.strip()}" holds {mh.group(1)}px for content that comes later; let it hug its text and grow when more appears (RULES 10b.2)')
        # Icons are Lucide SVG (RULES 10c): a lone text glyph like a tick or a cross sits where the font puts it, not in the center.
        if re.search(r"textContent\s*=\s*'[\u2713\u2714\u2715\u2716\u2717\u00d7]'\s*[;,)]|>\s*[\u2713\u2714\u2715\u2716\u2717\u00d7]\s*<", h + j):
            errors.append(f'{s}: a tick or cross is drawn as a text character; use the Lucide check or x icon as inline SVG (RULES 10c)')
        # Locale (RULES 12b): dates, times and numbers are always US format, whatever the visitor's browser is set to.
        if re.search(r"toLocale(?:Date|Time)?String\(\s*(?:\)|\[\]|undefined)|Intl\.\w+\(\s*(?:\)|\[\]|undefined)", j):
            errors.append(f'{s}: dates or numbers are formatted in the visitor\'s locale; pass \'en-US\' (RULES 12b)')
        # Icons have round ends and are real Lucide shapes (RULES 10c): no ticks drawn with rotated borders, no typed + or minus as a control, no stroked SVG without round caps.
        if re.search(r'border-width\s*:\s*0\s+[\d.]+px\s+[\d.]+px\s+0[^;]*;[^}]*rotate\(45deg\)', c):
            errors.append(f'{s}: a tick is drawn with a rotated border (sharp corners); use the Lucide check (RULES 10c)')
        if re.search(r'<button[^>]*>\s*[\u2212+\u2013]\s*</button>', h + j):
            errors.append(f'{s}: a plus or minus button uses a typed character; use the Lucide plus or minus icon (RULES 10c)')
        for tag in re.findall(r'<svg\b[^>]*>', (h + j).replace('\\"', '"')):
            if 'stroke=' in tag and 'stroke="none"' not in tag and 'stroke-linecap="round"' not in tag:
                errors.append(f'{s}: an icon has square line ends; add stroke-linecap="round" stroke-linejoin="round" (RULES 10c)'); break
        # One bounded card (RULES 10b.1): the component's root element is the card, so nothing it shows can sit outside it.
        if m:
            rootrule = re.search(r'(?m)^\.' + re.escape(m[0][1]) + r'\s*\{([^}]*)\}', re.sub(r'/\*.*?\*/', '', c, flags=re.S))
            if not rootrule or not re.search(r'background(?:-color)?\s*:', rootrule.group(1)) or not re.search(r'border-radius\s*:', rootrule.group(1)):
                errors.append(f'{s}: the root .{m[0][1]} is not the card (no background or border-radius); make the root the one bounded card (RULES 10b.1)')
        # Green fills always carry white text (RULES 10b.14): never inherit a primary-foreground that turns black in dark mode.
        for sel, body in re.findall(r'([^{}]+)\{([^{}]*)\}', re.sub(r'/\*.*?\*/', '', c, flags=re.S)):
            if re.search(r'background(?:-color)?\s*:\s*var\(--success\)\s*;', body) and not re.search(r'(?<![-\w])color\s*:\s*var\(--(success-foreground|on-color)\)', body):
                errors.append(f'{s}: "{sel.strip().splitlines()[-1].strip()}" fills with green but does not set white text; add color: var(--success-foreground) (RULES 10b.14)')
        # No hard-coded colors hidden inside an SVG data URI (RULES 10): draw the shape through a mask and color it with a token.
        if re.search(r"data:image/svg\+xml[^)]*%23[0-9a-fA-F]{3,8}", c):
            errors.append(f'{s}: an SVG data URI in component.css has a hard-coded color; use it as a mask and color it with a token (RULES 10)')
        # Even line breaks (RULES 10b.29d): every interaction balances its multi-line text.
        if m and not re.search(r'\.' + re.escape(m[0][1]) + r' :is\(p, li[^)]*\) \{ text-wrap: balance; \}', c):
            errors.append(f'{s}: add ".{m[0][1]} :is(p, li, dd, dt, small, label, figcaption, h1, h2, h3, h4) {{ text-wrap: balance; }}" so text never ends on one or two lonely words (RULES 10b.29d)')
        # Even line breaks (RULES 10b.29d): the evenLines helper is present and called at init.
        if 'function evenLines(' not in j or not re.search(r'evenLines\((root|form)\);', j):
            errors.append(f'{s}: component.js needs the evenLines helper, called right after the init guard (RULES 10b.29d)')
        btn_cls = {k for cl in re.findall(r'<button[^>]*\bclass="([^"]+)"', h + j) for k in cl.split()}
        for sel, body in re.findall(r'([^{}]+)\{([^{}]*)\}', c):
            sel1 = sel.strip().splitlines()[-1]
            bg = re.search(r'background(?:-color)?\s*:\s*var\((--[\w-]+)\)', body)
            if bg and re.search(r'thumb|knob|switch::after', sel1) and not re.search(r':checked|aria-checked="true"|is-on|is-done', sel1) and _res(bg.group(1)) in ('--card', '--background', '--white', '--popover', '--canvas'):
                errors.append(f'{s}: "{sel1}" draws a thumb or knob in {bg.group(1)}; use --raised so it stays lighter than its track in dark mode (RULES 10a)')
            tint = re.search(r'background(?:-color)?\s*:[^;]*(color-mix\([^;]*--(ai|brand|aqua|orange|pink|danger|success|warning|info|sage|olive)[^;]*|--(brand|ai|pop|danger|success|warning|info)-subtle|--zone-)', body)
            stroke = re.search(r'(?<![-\w])border\s*:\s*1px|box-shadow\s*:[^;]*0 0 0 1px', body)
            if tint and stroke and re.search(r'border-radius\s*:\s*var\(--radius-(lg|xl)\)', body) and 'transparent' not in tint.group(0):
                warns.append(f'{s}: "{sel1}" is a tinted panel with a stroke; separate it with a stronger tint instead (RULES 10b.10)')
            if re.search(r'background\s*:\s*color-mix\(in srgb,\s*var\(--(?![\w-]*bg\b)[\w-]+\)\s+\d+%,\s*transparent\)', body) and re.search(r'border-radius\s*:\s*var\(--radius-lg\)', body) and re.search(r'padding\s*:\s*\d+px \d+px', body) and 'height:' not in body:
                warns.append(f'{s}: "{sel1}" looks like a tinted panel with a fixed tint percentage; use oklch(from var(--color) var(--tint-l) calc(c * var(--tint-c)) h) so every color separates from the card equally in light and dark (RULES 10b.10)')
            if 'cursor: pointer' in body or re.search(r'btn|button', sel1) or set(re.findall(r'\.([\w-]+)', sel1)) & btn_cls:
                if re.search(r'background(?:-color)?\s*:\s*(var\(--danger-subtle\)|color-mix\(in srgb,\s*var\(--danger\)\s*\d+%)', body):
                    errors.append(f'{s}: "{sel1}" is a soft red button; use background var(--danger-soft) and color var(--danger-soft-foreground) (RULES 11.8)')
                if re.search(r'border(?:-color)?\s*:[^;]*--danger-border', body):
                    errors.append(f'{s}: "{sel1}" outlines a red button; soft red buttons have no stroke (RULES 11.8)')
            if not re.match(r'(\d+%|from|to)(?![\w-])', sel1) and re.search(r'background(?:-color)?\s*:\s*color-mix\(in srgb,\s*var\(--(brand|aqua|pink|pop)\)\s*(1?\d)%,\s*transparent\)', body):
                warns.append(f'{s}: "{sel1}" tints with a pale color (Aqua or Pink) under 20%, which is near white in light mode; use oklch(from var(--color) var(--tint-l) calc(c * var(--tint-c)) h) (RULES 10b.10)')
            # A colored panel mixed faintly into a surface nearly vanishes (Frosted Peek's chart box was Aqua at 4% over the card)
            if not re.match(r'(\d+%|from|to)(?![\w-])', sel1) and re.search(r'background(?:-color)?\s*:\s*color-mix\(in (?:srgb|oklab),\s*var\(--(brand|aqua|pink|pop|ai|orange|success|danger|warning|info)[\w-]*\)\s*\d%,\s*var\(--[\w-]+\)\)', body):
                errors.append(f'{s}: "{sel1}" is a colored panel mixed under 10% into a surface, which nearly vanishes; use oklch(from var(--color) var(--tint-l) calc(c * var(--tint-c)) h) (RULES 10b.10)')
            # Marks keep one size and show a level by lightness only (RULES 10b.36, 10b.37)
            if re.search(r'text-decoration-thickness\s*:\s*calc\(', body):
                errors.append(f'{s}: "{sel1}" changes an underline\'s thickness with a value; use var(--mark-thickness) and show the level by color (RULES 10b.36)')
            if re.search(r'text-decoration-color\s*:\s*color-mix\([^;]*calc\([^;]*transparent', body):
                errors.append(f'{s}: "{sel1}" fades an underline toward transparent to show a level; use the --mark-l-weak/--mark-l-strong lightness scale (RULES 10b.37)')
        # text-box needs an over and an under edge; "trim-end alphabetic" is invalid and silently does nothing (RULES 10b.39)
        for _tb in re.findall(r'text-box:\s*([^;}]+)', c):
            if re.fullmatch(r'(trim-\w+\s+)?(alphabetic|ideographic)\s*', _tb.strip()):
                errors.append(f'{s}: "text-box: {_tb.strip()}" is invalid and does nothing; write both edges, such as "trim-end cap alphabetic" (RULES 10b.39)')
        # A blur behind a surface (a material or Frost) uses the blur tokens, never a typed size
        for _bf in re.findall(r'backdrop-filter:\s*[^;}]*blur\(\s*(\d+(?:\.\d+)?px)', c):
            errors.append(f'{s}: backdrop blur({_bf}) is hard-coded; use var(--blur-sm), var(--blur-md) or var(--blur-lg) (tokens only)')
        # A letter tile or avatar centers its letter on the capital height, not the line box (RULES 10b.5)
        _cc = re.sub(r'/\*.*?\*/', '', c, flags=re.S)
        for sel, body in re.findall(r'([^{}]+)\{([^{}]*)\}', _cc):
            # Square tiles and round count badges (width or min-width equal to height) that hold text; icon holders have a "<sel> svg" rule
            _w, _h = re.search(r'(?<![-\w])(?:min-)?width:\s*(\d+)px', body), re.search(r'(?<![-\w])height:\s*(\d+)px', body)
            if re.search(r'display:\s*(inline-)?(grid|flex)', body) and re.search(r'place-items:\s*center|justify-content:\s*center', body) \
                    and re.search(r'font-(size|weight)', body) and _w and _h and _w.group(1) == _h.group(1) and int(_h.group(1)) <= 48 \
                    and 'text-box' not in body and not re.search(re.escape(sel.strip()) + r' (span\s*\{[^}]*text-box|svg\s*\{)', _cc):
                errors.append(f'{s}: "{sel.strip()}" is a letter tile or count badge centered on its line box, so its text sits off center; use display: block; align-content: center; text-align: center; text-box: trim-both cap alphabetic, at a size that splits evenly (RULES 10b.5)')
        # A title stacked over a smaller detail line: the detail sets its own line height (RULES 10b.38)
        _rules = [(sel.strip().split(',')[-1].strip(), body) for sel, body in re.findall(r'([^{}]+)\{([^{}]*)\}', re.sub(r'/\*.*?\*/', '', c, flags=re.S))]
        _stacked = {sel[:-2] for sel, body in _rules if sel.endswith(' b') and re.search(r'display:\s*block', body)}
        for sel, body in _rules:
            m2 = re.match(r'(.+) (small|span)$', sel)
            if m2 and m2.group(1) in _stacked and re.search(r'font-size:\s*var\(--text-(small|caption)\)', body) and 'line-height' not in body:
                errors.append(f'{s}: "{sel}" is a detail line under a title but keeps the body line height; give it display: block, its own line-height and 2px margin-top (RULES 10b.38)')
        # A count before a plural word needs its singular for one (RULES 12d); mark a count that can never be 1 with "// never 1"
        for _ln in rd(s, 'component.js').splitlines():
            if re.search(r"[\w)\]] \+ '\s*(files|items|seconds|minutes|hours|days|weeks|tokens|steps|people|characters|seats|words|rows|columns|copies|messages|tasks|commits|replies|changes|versions|invites|projects|shortcuts|times|nights|months|years|points|credits|generations)\b", _ln) \
                    and not re.search(r'[!=]==? ?1\b|> ?1\b|toFixed\(|// never 1', _ln):
                errors.append(f'{s}: "{_ln.strip()[:70]}" shows a count with a plural word but no singular for 1 (RULES 12d)')
        hexes = re.findall(r'(?<![\w&])#[0-9a-fA-F]{3,8}\b', re.sub(r'/\*.*?\*/', '', c, flags=re.S))
        if hexes: warns.append(f'{s}: hard-coded colors in component.css {sorted(set(hexes))[:4]} (use tokens)')
    for it in items:
        # Prompts drift from the code: reduced motion is the 120ms token, and corner radii come from the radius scale
        _p = rd(it['slug'], 'prompt.md') if os.path.isfile(os.path.join(ROOT, it['slug'], 'prompt.md')) else ''
        for _l in _p.splitlines():
            if _l.startswith('Reduced motion') or 'prefers-reduced-motion' in _l:
                for _ms in re.findall(r'(\d+)ms', _l):
                    if _ms != '120': errors.append(f'{it["slug"]}/prompt.md: reduced motion says {_ms}ms; the reduced-motion token is 120ms')
        for _r in re.findall(r'(\d+)px (?:corners|rounded (?:box|card|group|list|area|panel|block|field|window|rectangle|text area|message field))', _p):
            if int(_r) not in (4, 6, 8, 12, 16): warns.append(f'{it["slug"]}/prompt.md: {_r}px corners is not on the radius scale (4, 6, 8, 12, 16); check it against the code')
        # {Label} marks something on screen (RULES 12c): it must match a label in the interaction, and braces must balance.
        _slug = it['slug']
        _src = html.unescape(rd(_slug, 'component.html') + rd(_slug, 'component.js')) if os.path.isdir(os.path.join(ROOT, _slug)) else ''
        for _t in [it.get('summary', ''), it.get('tryit', '')] + [sp.get('value', '') for sp in it.get('specs', [])]:
            if _t.count('{') != _t.count('}'):
                errors.append(f'{_slug}: unbalanced {{ }} in "{_t[:40]}"')
            for _lab in re.findall(r'\{([^{}]+)\}', _t):
                if _lab.startswith('icon:'):
                    if not ui_icon(_slug, _lab[5:]): errors.append(f'{_slug}: "{{{_lab}}}" needs a control whose aria-label starts with "{_lab[5:]}" and holds an svg (RULES 12c)')
                    continue
                if not _lab.isdigit() and _lab.replace(' n', '') not in _src:  # exact, capitals included; plain numbers (calendar days) are generated, not written
                    errors.append(f'{_slug}: "{{{_lab}}}" names something that is not on screen in this interaction (RULES 12c)')
        for k in ('name', 'summary', 'tryit'):
            for w in locale.findall(str(it.get(k, ''))): errors.append(f'{it["slug"]}: "{w}" in {k} breaks the locale rules')
        for sp in it.get('specs', []):
            for w in locale.findall(json.dumps(sp)): errors.append(f'{it["slug"]}: "{w}" in specs breaks the locale rules')
    for s in reg.get('hero', []):
        if s not in slugs: errors.append(f'hero: "{s}" is not an interaction')
    return errors, warns


# ---------------------------------------------------------------- self-contained code
# Copied code must work on its own: each component's CSS carries the Outcraft tokens it uses,
# scoped to its own root so it never overrides anything on the page it is pasted into.
FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap');"

def _blocks(css):
    """Split outcraft-tokens.css into {'light','dark','base'} dicts of name -> value."""
    out = {'light': {}, 'dark': {}, 'base': {}}
    i1 = css.index('[data-theme="dark"], .dark {'); i2 = css.index('@media (prefers-color-scheme: dark)'); i3 = css.rindex(':root {')
    for key, part in (('light', css[:i1]), ('dark', css[i1:i2]), ('base', css[i3:])):
        part = re.sub(r'/\*.*?\*/', '', part, flags=re.S)
        for name, val in re.findall(r'(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);', part):
            out[key][name] = ' '.join(val.split())
    return out

_TOKENS = None
def tokens():
    global _TOKENS
    if _TOKENS is None: _TOKENS = _blocks(rd('outcraft-tokens.css'))
    return _TOKENS

def used_tokens(src):
    t = tokens(); defined = set(t['light']) | set(t['dark']) | set(t['base'])
    names = set(re.findall(r'--[a-zA-Z0-9-]+', src)) & defined
    names |= {'--' + q for q in re.findall(r"""['"]([a-z][a-z0-9-]*)['"]""", src) if '--' + q in defined}
    # follow var() references until nothing new turns up
    todo = list(names)
    while todo:
        n = todo.pop()
        for blk in t.values():
            for ref in re.findall(r'var\((--[a-zA-Z0-9-]+)', blk.get(n, '')):
                if ref in defined and ref not in names: names.add(ref); todo.append(ref)
    return names

def resolve(name, mode):
    t = tokens(); v = t[mode].get(name) or t['light'].get(name) or t['base'].get(name) or ''
    for _ in range(8):
        m = re.search(r'var\((--[a-zA-Z0-9-]+)\)', v)
        if not m: break
        v = v.replace(m.group(0), t[mode].get(m.group(1)) or t['light'].get(m.group(1)) or t['base'].get(m.group(1)) or '')
    return v

def token_css(prefix, names):
    t = tokens()
    def decl(mode, keys, ind='  '):
        return '\n'.join(f'{ind}{k}: {t[mode][k]};' for k in sorted(keys))
    base = [k for k in names if k in t['base']]
    light = [k for k in names if k in t['light']]
    dark = [k for k in names if k in t['dark']]
    sel = f'.{prefix}'
    parts = [f'/* Outcraft Design System v2: the tokens this component uses, scoped to {sel} so they never affect the rest of your page. */',
             f'{sel} {{\n{decl("base", base)}\n{decl("light", light)}\n}}']
    if dark:
        parts.append(f'/* Dark mode: follows data-theme="dark" (or class "dark") on any ancestor, or the system setting. */\n'
                     f'[data-theme="dark"] {sel}, .dark {sel} {{\n{decl("dark", dark)}\n}}\n'
                     f'@media (prefers-color-scheme: dark) {{\n  :root:not([data-theme="light"]):not(.light) {sel} {{\n{decl("dark", dark, "    ")}\n  }}\n}}')
    return '\n'.join(parts)

def bundle(slug):
    """Self-contained pieces for one component: css (tokens + font + styles), html, js, one-file page, token list for the prompt."""
    h, c, j = rd(slug, 'component.html'), rd(slug, 'component.css'), rd(slug, 'component.js')
    prefix = re.search(r'class="([\w-]+)[^"]*"[^>]*data-mi=', h).group(1)
    names = used_tokens(h + c + j)
    tcss = token_css(prefix, names)
    css = f'{FONT_IMPORT}\n\n{tcss}\n\n{c}'
    one = one_page(slug, css, h, j)
    rows = []
    for k in sorted(names):
        lv, dv = resolve(k, 'light') if k not in tokens()['base'] else resolve(k, 'base'), resolve(k, 'dark') if k in tokens()['dark'] else None
        rows.append(f'{k}: {lv}' + (f'  (dark: {dv})' if dv and dv != lv else ''))
    return {'css': css, 'one': one, 'tokens': rows, 'tokens_css': tcss}

ONE_TPL = None
def one_template():
    global ONE_TPL
    if ONE_TPL is None:
        bg = (resolve('--subtle', 'light'), resolve('--subtle', 'dark'))
        ONE_TPL = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
                   '<title>__TITLE__</title>\n<style>\n/* Demo page only. Remove this block when pasting into your own page. */\n'
                   f'body {{ margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 48px 16px; box-sizing: border-box; background: {bg[0]}; }}\n'
                   f'@media (prefers-color-scheme: dark) {{ body {{ background: {bg[1]}; }} }}\n</style>\n<style>\n__CSS__\n</style>\n</head>\n<body>\n\n__HTML__\n\n<script>\n__JS__\n</script>\n</body>\n</html>\n')
    return ONE_TPL

def one_page(title, css, h, j):
    return one_template().replace('__TITLE__', html.escape(title)).replace('__CSS__', css).replace('__HTML__', h).replace('__JS__', j)

def full_prompt(slug):
    b = bundle(slug)
    return (rd(slug, 'prompt.md').rstrip() + '\n\nOUTCRAFT TOKENS (exact values this component uses; define them as CSS variables on the component root)\n'
            + '\n'.join(b['tokens']) + '\nFonts: Geist and Geist Mono from Google Fonts (fallback system-ui).\n')

# ---------------------------------------------------------------- site
def build_site(reg, site):
    items = reg['interactions']
    init = {}
    for it in items:
        init[it['slug']] = re.search(r'window\.(init\w+)\s*=', rd(it['slug'], 'component.js')).group(1)
    tokens, comps = rd('outcraft-tokens.css'), rd('outcraft-components.css')
    site_css = ''.join(rd('tools', 'site', f) + '\n' for f in ('site.css', 'reset.css', 'idea.css'))
    all_css = '\n'.join(rd(it['slug'], 'component.css') for it in items)
    all_js = '\n'.join(rd(it['slug'], 'component.js') for it in items)
    templates = '\n'.join(f'<template id="tpl-{it["slug"]}">{rd(it["slug"], "component.html")}</template>' for it in items)
    src = {}
    for it in items:
        b = bundle(it['slug'])
        src[it['slug']] = {'prompt': full_prompt(it['slug']), 'html': rd(it['slug'], 'component.html'), 'css': b['css'], 'js': rd(it['slug'], 'component.js')}
    data = {'oneTpl': one_template(), 'types': reg['types'], 'topics': reg['topics'], 'init': {k: v for k, v in init.items()},
            'icons': {'hand': ICON['hand']}, 'interactions': [dict(it, refIcons=ref_icons(it)) if ref_icons(it) else it for it in items]}
    by = {it['slug']: it for it in items}
    newest = [it for it in items if it['new']]
    pill_it = newest[-1] if newest else items[-1]
    alpha = sorted(items, key=lambda it: it['name'].casefold())
    first = alpha[0]['slug']
    # [[…]] in the intro becomes the animated highlight
    intro_html = re.sub(r'\[\[(.+?)\]\]', r'<mark class="hero-hl">\1</mark>', esc(site['intro']))
    n_new = sum(1 for it in items if it['new'])
    # Hero pill: opens the explorer with the New toggle on. Hidden when nothing is New.
    pill = (f'<a class="hero-pill" href="#/new"><span class="dot" aria-hidden="true"></span>Explore {n_new} New Interaction{"s" if n_new != 1 else ""}{ICON["arrow"]}</a>'
            if n_new else '')

    hero_cards = ''.join(
        f'<article class="hcard" data-slug="{s}"><div class="hcard-head"><b>{esc(by[s]["name"])}</b>'
        f'<a class="oc-btn oc-btn--ghost oc-btn--sm" href="#/{s}">Open {ICON["arrow"]}</a></div>'
        f'<div class="hcard-stage" data-slug="{s}"><div class="mi-host"></div></div></article>'
        for s in reg.get('hero', []))
    idea = rd('tools', 'site', 'idea-dialog.html')
    n = len(items)
    tabs = ''.join(f'<button type="button" role="tab" id="cb-tab-{k}" data-k="{k}" aria-selected="{"true" if i == 0 else "false"}" tabindex="{0 if i == 0 else -1}">{lab}</button>'
                   for i, (k, lab) in enumerate((('prompt', 'Prompt'), ('html', 'HTML'), ('css', 'CSS'), ('js', 'JS'), ('one', 'One File'))))

    page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(site['title'])}</title>
<link rel="icon" type="image/svg+xml" href="icons/outcraft-favicon-light.svg" media="(prefers-color-scheme: light)">
<link rel="icon" type="image/svg+xml" href="icons/outcraft-favicon-dark.svg" media="(prefers-color-scheme: dark)">
<link rel="apple-touch-icon" href="icons/outcraft-icon-180x180-light.png">
<meta name="description" content="{esc(site['intro'].replace('[[', '').replace(']]', ''))}">
{FONTS}
<script>try{{var t=localStorage.getItem('oc-theme');if(t)document.documentElement.setAttribute('data-theme',t);}}catch(e){{}}</script>
<style>
{tokens}
</style>
<style>
{comps}
</style>
<style>
{site_css}
</style>
<style>
{all_css}
</style>
</head>
<body>
<a class="sr-only" href="#main">Skip to content</a>
<header class="topbar"><div class="topbar-in">
  <a class="brand" href="#/">{esc(site['title'])}</a>
  <a class="oc-btn oc-btn--outline oc-btn--sm tb-home" href="#/" aria-label="Go to home" hidden>{ICON['home']}<span class="tb-home-label"><span class="tb-home-go">Go to </span>Home</span></a>
  <button type="button" class="oc-btn oc-btn--sm tb-idea" data-idea-open aria-label="Submit an idea"><span class="tb-idea-long">Submit an idea</span><span class="tb-idea-short">Submit</span></button>
  <a class="oc-btn oc-btn--secondary oc-btn--sm tb-li" href="{esc(site['linkedinUrl'])}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (opens in a new tab)">{ICON['linkedin']}<span class="tb-handle">{esc(site['linkedinHandle'])}</span></a>
  <a class="oc-btn oc-btn--secondary oc-btn--sm tb-li tb-x" href="{esc(site['xUrl'])}" target="_blank" rel="noopener noreferrer" aria-label="X (opens in a new tab)">{X_LOGO}<span class="tb-handle">{esc(site['xHandle'])}</span></a>
  <button type="button" class="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm theme-btn" aria-label="Switch theme"><span class="sun">{ICON['sun']}</span><span class="moon">{ICON['moon']}</span></button>
</div></header>

<main id="view-home" class="home">
  <section class="hero" id="main">
    {pill}
    <h1>{esc(site['headline'])}</h1>
    <p>{intro_html}</p>
    <div class="hero-cta">
      <a class="oc-btn hero-browse" href="#/all">Browse {n} Interactions{ICON['arrow']}</a>
      <button type="button" class="oc-btn oc-btn--secondary" data-idea-open>Submit an Idea</button>
    </div>
  </section>
  <section class="hero-cards" aria-label="Try a few">{hero_cards}</section>
  <footer class="home-foot">
    <p>Free to use under the MIT license · Type: Geist · Icons: Lucide · Built by <a href="{esc(site['linkedinUrl'])}" target="_blank" rel="noopener noreferrer">{esc(site['authorName'])}</a> at <a href="{esc(site['agencyUrl'])}" target="_blank" rel="noopener noreferrer">{esc(site['agencyName'])}</a>.</p>
  </footer>
</main>

<main id="view-explore" class="explore" hidden>
  <div class="mobile-browse"><button type="button" class="oc-btn oc-btn--outline oc-btn--sm" data-open-list>{ICON['list']}All Interactions</button></div>
  <aside class="side" aria-label="All interactions">
    <div class="side-top">
      <div class="oc-tabs scope" role="radiogroup" aria-label="Show" style="--n: 2">
        <button type="button" role="radio" aria-checked="true" data-scope="all">All</button>
        <button type="button" role="radio" aria-checked="false" data-scope="new" tabindex="-1">New</button>
      </div>
      <div class="search-row">
        <label class="search"><span class="sr-only">Search interactions</span>{ICON['search']}<input class="oc-input" id="mi-search" type="search" placeholder="Search" autocomplete="off" spellcheck="false"></label>
        <button type="button" class="oc-btn oc-btn--outline oc-btn--icon filter-btn" aria-haspopup="true" aria-expanded="false" aria-label="Filters">{ICON['filter']}<span class="filter-count" hidden>0</span></button>
      </div>
      <div class="chips"></div>
      <p class="list-meta" aria-live="polite"></p>
    </div>
    <div class="filter-pop" role="dialog" aria-label="Filters" hidden>
      <div class="filter-group"><h5>Type</h5><div class="opts" data-group="type"></div></div>
      <div class="filter-group"><h5>Topic</h5><div class="opts" data-group="topic"></div></div>
      <div class="filter-foot"><button type="button" class="oc-btn oc-btn--ghost oc-btn--sm" data-filter-clear>Clear</button><button type="button" class="oc-btn oc-btn--sm" data-filter-done>Done</button></div>
    </div>
    <ul class="list" role="list"></ul>
  </aside>
  <section class="center" aria-label="Preview">
    <div class="stage" data-mi-scope>{reset_btn('this interaction')}<div class="mi-host"></div></div>
    <div class="stage-nav">
      <button type="button" class="oc-btn oc-btn--ghost oc-btn--sm prev" aria-label="Previous interaction">{ICON['arrow']}Previous</button>
      <button type="button" class="oc-btn oc-btn--ghost oc-btn--sm next" aria-label="Next interaction">Next{ICON['arrow']}</button>
    </div>
  </section>
  <aside class="info" aria-label="About this interaction">
    <div class="info-scroll"></div>
    <div class="info-actions">
      <button type="button" class="oc-btn" data-copy-prompt>{ICON['copy']}Copy Prompt</button>
      <button type="button" class="oc-btn oc-btn--outline" data-open-code>{ICON['code']}View Code</button>
    </div>
  </aside>
</main>

<dialog class="codebox" id="codebox" aria-labelledby="cb-title">
  <div class="codebox-head"><h2 id="cb-title"></h2><button type="button" class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm x" data-close-code aria-label="Close">{ICON['x']}</button></div>
  <div class="codebox-bar"><div class="oc-tabs" role="tablist" aria-label="Code" style="--n: 5">{tabs}</div><p class="codebox-hint" aria-live="polite"></p></div>
  <div class="codebox-panel" role="tabpanel">
    <div class="codebox-file"><span class="codebox-name"></span><div class="codebox-actions"><button type="button" class="oc-btn oc-btn--outline oc-btn--sm" data-copy-code>{ICON['copy']}Copy</button><a class="oc-btn oc-btn--outline oc-btn--sm" data-download hidden>{ICON['download']}Download</a></div></div>
    <pre tabindex="0"></pre>
  </div>
</dialog>
{idea}
<p class="sr-only" id="mi-live" role="status" aria-live="polite"></p>
{templates}
<script type="application/json" id="mi-data">{js_json(data)}</script>
<script type="application/json" id="mi-src">{js_json(src)}</script>
<script>window.MI_CONFIG = {js_json({'formEndpoint': site.get('formEndpoint', '')})};</script>
<script>
{all_js}
</script>
<script>
{rd('tools', 'site', 'site.js')}
</script>
<script>
{rd('tools', 'site', 'idea.js')}
</script>
</body>
</html>
"""
    open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(page)
    return len(page)

STANDALONE_JS = r"""
(function () {
  var host = document.querySelector('.mi-host'), orig = host.innerHTML, fn = window[__INIT__];
  document.querySelector('[data-mi-reset]').addEventListener('click', function (e) {
    host.innerHTML = orig;
    host.querySelectorAll('[data-mi]').forEach(function (el) { if (typeof fn === 'function') fn(el); });
    var b = e.currentTarget; b.classList.remove('is-spin'); void b.offsetWidth; b.classList.add('is-spin');
    setTimeout(function () { b.classList.remove('is-spin'); }, 700);
  });
})();
"""

def build_pages(reg):
    reset_css = rd('tools', 'site', 'reset.css')
    for it in reg['interactions']:
        s = it['slug']
        h, c, j = rd(s, 'component.html'), rd(s, 'component.css'), rd(s, 'component.js')
        fn = re.search(r'window\.(init\w+)\s*=', j).group(1)
        page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(it['name'])} · Micro Interactions</title>
<link rel="icon" type="image/svg+xml" href="../icons/outcraft-favicon-light.svg" media="(prefers-color-scheme: light)">
<link rel="icon" type="image/svg+xml" href="../icons/outcraft-favicon-dark.svg" media="(prefers-color-scheme: dark)">
<link rel="apple-touch-icon" href="../icons/outcraft-icon-180x180-light.png">
{FONTS}
<link rel="stylesheet" href="../outcraft-tokens.css">
<style>
html, body {{ min-height: 100%; }}
body {{ margin: 0; display: grid; place-items: center; padding: 64px 16px 48px; box-sizing: border-box; background: var(--subtle); color: var(--body); font-family: var(--font-sans); }}
</style>
<style>
{c}
</style>
<style>
{reset_css}
</style>
</head>
<body>
{reset_btn(it['name'], ' mi-reset--page')}
<div class="mi-host">{h}</div>
<script>
{j}
</script>
<script>{STANDALONE_JS.replace('__INIT__', json.dumps(fn))}</script>
</body>
</html>
"""
        open(os.path.join(ROOT, s, 'index.html'), 'w', encoding='utf-8').write(page)
        b = bundle(s)
        open(os.path.join(ROOT, s, 'one-file.html'), 'w', encoding='utf-8').write(one_page(it['name'], b['css'], h, j))
        open(os.path.join(ROOT, s, 'prompt-full.md'), 'w', encoding='utf-8').write(full_prompt(s))

def build_readme(reg, site):
    items = reg['interactions']
    counts = ', '.join(f"{sum(1 for i in items if i['type'] == ty)} {ty}" for ty in reg['types'])
    intro = (f"**{site['headline']}**\n\n{site['intro'].replace('[[', '').replace(']]', '')}\n\n"
             f"{len(items)} interactions so far ({counts}).")
    rows = ['| No. | Name | Type | Topic | |', '|---|---|---|---|---|']
    for it in items:
        rows.append(f"| {it['number']} | [{it['name']}]({it['slug']}/) | {it['type']} | {it['topic']} | {'New' if it['new'] else ''} |")
    p = os.path.join(ROOT, 'README.md')
    txt = open(p, encoding='utf-8').read()
    for a, b, body in (('<!-- intro:start -->', '<!-- intro:end -->', intro), ('<!-- catalogue:start -->', '<!-- catalogue:end -->', '\n'.join(rows))):
        if a in txt and b in txt:
            txt = txt[:txt.index(a) + len(a)] + '\n' + body + '\n' + txt[txt.index(b):]
    open(p, 'w', encoding='utf-8').write(txt)

def main():
    reg, site = load()
    errors, warns = check(reg)
    for w in warns: print('warning:', w)
    for e in errors: print('ERROR:', e)
    if errors:
        print(f'{len(errors)} error(s). Fix them before building (see RULES.md).'); sys.exit(1)
    print(f'checks passed: {len(reg["interactions"])} interactions, {sum(1 for i in reg["interactions"] if i["new"])} marked New')
    if '--check' in sys.argv: return
    size = build_site(reg, site)
    build_pages(reg)
    build_readme(reg, site)
    print(f'wrote index.html ({size // 1024} KB) and {len(reg["interactions"])} standalone pages')

if __name__ == '__main__':
    main()
