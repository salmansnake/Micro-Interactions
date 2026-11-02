#!/usr/bin/env python3
"""Rendered contrast check (RULES 14a step 4). The build checks tokens, not what ends up painted; this renders every
page in light and dark and measures it.

    python3 tools/contrast_check.py --out before.json                      measure, save, print failures
    python3 tools/contrast_check.py --out after.json --baseline before.json   also list failures the baseline didn't have
    python3 tools/contrast_check.py --root some/build --slugs a,b --no-site   another build folder, some pages only

For every page, in light and dark, at rest and again with hidden parts shown (opacity and visibility forced on):
  - text: the text color against what is painted behind it, found by walking up the elements until the layers are
    opaque (opacity included). At least 4.5:1, or 3:1 at 24px and up, or 18.66px bold and up.
  - fills (anything with its own background, 6px and up): the OKLCH lightness step to the surface it sits on (its
    parent) and to whatever is painted just past each of its four edges. At least 0.035 against every one of them.
    A fill with its own border on that side or a box-shadow is marked "edged": it may separate by its stroke instead.
    One painted the same as its parent (a background reset, not a fill) is marked "flush" and left out of the plain
    listing; against a baseline it is listed only if it used to separate, which is how a fill that vanishes shows up.
Pseudo-elements and background images are not measured; a pair over a background image is marked "img".

Needs Playwright (pip install playwright; python3 -m playwright install chromium). Not part of the build.
"""
import argparse, functools, http.server, json, os, socketserver, sys, threading

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEXT_MIN, LARGE_MIN, FILL_MIN = 4.5, 3.0, 0.035

# Runs in the page on everything inside scope. Returns the worst instance of each selector's text and fill pairs.
SCAN = r"""(scope) => {
  const css = new Map(); const st = e => { let s = css.get(e); if (!s) { s = getComputedStyle(e); css.set(e, s); } return s; };
  const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true });
  const lin = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const enc = c => { c = Math.min(1, Math.max(0, c)); return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; };
  const fromLab = (L, a, b) => { const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
    return [enc(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s), enc(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s), enc(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)]; };
  const okL = c => { const r = lin(c[0]), g = lin(c[1]), b = lin(c[2]);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s; };
  const lum = c => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const hex = c => '#' + c.slice(0, 3).map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
  const num = (v, pct) => v === 'none' ? 0 : v.endsWith('%') ? parseFloat(v) / 100 * pct : parseFloat(v);
  const parsed = new Map();
  function parse(str) {                                   // any computed color -> [r, g, b, a], 0..1, sRGB
    if (parsed.has(str)) return parsed.get(str);
    let out, m = str.match(/^(rgba?|color|oklch|oklab)\((.*)\)$/);
    if (m) {
      let [body, alpha] = m[2].split('/'); let p = body.replace(/,/g, ' ').trim().split(/\s+/);
      let a = alpha !== undefined ? num(alpha.trim(), 1) : (m[1] === 'rgba' && p.length === 4 ? parseFloat(p.pop()) : 1);
      if (m[1].startsWith('rgb')) out = [...p.slice(0, 3).map(v => num(v, 255) / 255), a];
      else if (m[1] === 'color' && p[0] === 'srgb') out = [...p.slice(1, 4).map(v => num(v, 1)), a];
      else if (m[1] === 'oklab') out = [...fromLab(num(p[0], 1), num(p[1], 0.4), num(p[2], 0.4)), a];
      else if (m[1] === 'oklch') { const L = num(p[0], 1), C = num(p[1], 0.4), H = num(p[2], 1) * Math.PI / 180; out = [...fromLab(L, C * Math.cos(H), C * Math.sin(H)), a]; }
    }
    if (!out) { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = str; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; out = [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255]; }
    parsed.set(str, out); return out;
  }
  const over = (f, b) => { const a = f[3] + b[3] * (1 - f[3]); if (a <= 0) return [0, 0, 0, 0];
    return [0, 1, 2].map(i => (f[i] * f[3] + b[i] * b[3] * (1 - f[3])) / a).concat(a); };
  const dark = st(document.documentElement).colorScheme.includes('dark') && matchMedia('(prefers-color-scheme: dark)').matches;
  const CANVAS = dark ? [18 / 255, 18 / 255, 18 / 255, 1] : [1, 1, 1, 1];
  // x painted inside el, above el's own background: what reaches the screen
  function paint(el, x) {
    let img = false, op = 1;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const s = st(e); x = over(x, parse(s.backgroundColor));
      if (s.backgroundImage !== 'none' && x[3] < 0.999) img = true;
      const o = parseFloat(s.opacity); if (o < 1) { x = [x[0], x[1], x[2], x[3] * o]; op *= o; }
    }
    return { c: over(x, CANVAS), img, op };
  }
  const behind = el => paint(el, [0, 0, 0, 0]);
  const skip = el => el.closest('svg, script, style, template, noscript, head');
  function shown(el) {
    if (skip(el) || !el.checkVisibility({ visibilityProperty: true })) return false;
    const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1;
  }
  function sel(el) {
    const parts = []; for (let e = el; e && e !== document.body && parts.length < 4; e = e.parentElement) {
      const c = [...e.classList].filter(k => !/^(is|has)-/.test(k)).slice(0, 2); parts.unshift(e.tagName.toLowerCase() + (c.length ? '.' + c.join('.') : ''));
    } return parts.join('>');
  }
  const worst = new Map(); const keep = (k, rec, v) => { const w = worst.get(k); if (!w || v < w.v) worst.set(k, Object.assign(rec, { v })); };
  for (const el of document.querySelector(scope).querySelectorAll('*')) {
    if (!shown(el)) continue;
    const s = st(el), bg = behind(el); if (bg.op < 0.1) continue;
    const own = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
    const field = (el.tagName === 'INPUT' && !/^(checkbox|radio|range|color|hidden)$/.test(el.type)) || el.tagName === 'TEXTAREA';
    const texts = [];
    if (own) texts.push(['text', s.color, own]);
    if (field && el.value) texts.push(['text', s.color, el.value]);
    if (field && !el.value && el.placeholder) texts.push(['placeholder', getComputedStyle(el, '::placeholder').color, el.placeholder]);
    const size = parseFloat(s.fontSize), large = size >= 24 || (size >= 18.66 && parseInt(s.fontWeight) >= 700);
    for (const [kind, color, words] of texts) {
      const fg = paint(el, parse(color)).c, r = ratio(fg, bg.c);
      keep(kind + '|' + sel(el), { kind, sel: sel(el), fg: hex(fg), bg: hex(bg.c), need: large ? 3 : 4.5, img: bg.img, words: words.slice(0, 40) }, r);
    }
    if (parse(s.backgroundColor)[3] < 0.02) continue;
    const r = el.getBoundingClientRect(); if (r.width < 6 || r.height < 6) continue;
    const F = bg.c, ring = s.boxShadow !== 'none', flush = !!el.parentElement && hex(F) === hex(behind(el.parentElement).c);
    const sides = [['under', null, null], ['top', r.left + r.width / 2, r.top - 3], ['right', r.right + 2, r.top + r.height / 2], ['bottom', r.left + r.width / 2, r.bottom + 2], ['left', r.left - 3, r.top + r.height / 2]];
    for (const [side, x, y] of sides) {
      let n;
      if (side === 'under') n = el.parentElement;
      else { if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue; n = document.elementsFromPoint(x, y).find(e => e !== el && !el.contains(e)); }
      if (!n) continue;
      const N = behind(n), edge = ring || (side !== 'under' && parseFloat(s['border' + side[0].toUpperCase() + side.slice(1) + 'Width']) >= 1 && parse(s['border' + side[0].toUpperCase() + side.slice(1) + 'Color'])[3] > 0.1);
      keep('fill|' + sel(el) + '|' + side, { kind: 'fill', sel: sel(el), side, fg: hex(F), bg: hex(N.c), against: sel(n), edged: !!edge, flush, img: N.img }, Math.abs(okL(F) - okL(N.c)));
    }
  }
  return [...worst.values()].map(w => Object.assign(w, { v: Math.round(w.v * 1000) / 1000 }));
}"""

QUIET = "*, *::before, *::after { transition: none !important; caret-color: transparent !important; } * { pointer-events: auto !important; }"
REVEAL = "*, *::before, *::after { opacity: 1 !important; visibility: visible !important; }"
FREEZE = "() => document.getAnimations().forEach(a => { try { a.finish(); } catch (e) { a.pause(); a.currentTime = 0; } })"


def fails(r):
    return r['v'] < (r['need'] if r['kind'] != 'fill' else FILL_MIN)


def key(r):
    return '|'.join([r['page'], r['theme'], r['state'], r['kind'], r['sel'], r.get('side', '')])


def serve(root):
    handler = functools.partial(type('Q', (http.server.SimpleHTTPRequestHandler,), {'log_message': lambda *a: None}), directory=root)
    httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), handler); httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def scan(page, url, name, theme, rows, errors, log, before=None, scope='body'):
    page.goto('about:blank'); n = len(log)
    page.goto(url, wait_until='networkidle')
    page.add_style_tag(content=QUIET)
    if before: before(page)
    page.wait_for_timeout(400); page.evaluate(FREEZE)
    for state in ('rest', 'shown'):
        if state == 'shown': page.add_style_tag(content=REVEAL); page.evaluate(FREEZE)
        for r in page.evaluate(SCAN, scope): rows.append(dict(r, page=name, theme=theme, state=state))
    errors.extend(f'{name} ({theme}): {e}' for e in log[n:])


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--root', default=ROOT, help='folder holding interactions.json and the built pages')
    ap.add_argument('--slugs', help='comma-separated slugs (default: every interaction in interactions.json)')
    ap.add_argument('--no-site', action='store_true', help='skip the site shell')
    ap.add_argument('--out', help='save every measurement here as JSON')
    ap.add_argument('--baseline', help='a saved --out file: list failures it did not have, and exit 1 if there are any')
    a = ap.parse_args()
    from playwright.sync_api import sync_playwright
    root = os.path.abspath(a.root)
    slugs = a.slugs.split(',') if a.slugs else [it['slug'] for it in json.load(open(os.path.join(root, 'interactions.json'), encoding='utf-8'))['interactions']]
    httpd = serve(root); base = f'http://127.0.0.1:{httpd.server_address[1]}/'
    rows, errors = [], []
    site = [] if a.no_site else [
        ('site:home', '', None, 'body'), ('site:explore', '#/' + slugs[0], None, 'body'),
        # an open modal's backdrop covers the page, so only the dialog itself is measured
        ('site:code', '#/' + slugs[0], lambda p: p.click('[data-open-code]'), 'dialog[open]'),
        ('site:idea', '', lambda p: p.click('[data-idea-open] >> nth=0'), 'dialog[open]')]
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for theme in ('light', 'dark'):
            ctx = browser.new_context(viewport={'width': 1440, 'height': 900}, color_scheme=theme)
            page, log = ctx.new_page(), []
            page.on('console', lambda m: m.type == 'error' and log.append(m.text))
            page.on('pageerror', lambda e: log.append(str(e)))
            for name, hash_, before, scope in site:
                scan(page, base + hash_, name, theme, rows, errors, log, before, scope)
            for i, s in enumerate(slugs):
                scan(page, base + s + '/', s, theme, rows, errors, log)
                print(f'\r{theme}: {i + 1}/{len(slugs)}', end='', file=sys.stderr, flush=True)
            print(file=sys.stderr); ctx.close()
        browser.close()
    httpd.shutdown()
    if a.out:
        with open(a.out, 'w', encoding='utf-8') as f: json.dump({'rows': rows, 'console': errors}, f, indent=0)
    bad = [r for r in rows if fails(r)]
    print(f'{len(rows)} measurements, {len(bad)} below the floor ({sum(r.get("flush", False) for r in bad)} flush, not listed), {len(errors)} console errors')
    show = [r for r in bad if not r.get('flush')]
    if a.baseline:
        old = {key(r): r for r in json.load(open(a.baseline, encoding='utf-8'))['rows']}
        show = [r for r in bad if key(r) not in old or not fails(old[key(r)])]
        gone = [r for r in old.values() if fails(r)]
        now = {key(r) for r in bad}
        print(f'baseline had {len(gone)} below the floor; {len([r for r in gone if key(r) not in now])} of those now pass; {len(show)} are new:')
    for r in sorted(show, key=lambda r: (r['page'], r['theme'], r['state'], r['kind'], r['sel'])):
        was = ''
        if a.baseline and key(r) in old: was = f'  (was {old[key(r)]["v"]})'
        what = f'{r["side"]:6} vs {r["against"]}' if r['kind'] == 'fill' else f'"{r["words"]}"  needs {r["need"]}'
        flags = ' '.join(f for f in ('edged', 'flush', 'img') if r.get(f))
        print(f'{r["page"]:28} {r["theme"]:5} {r["state"]:5} {r["kind"]:11} {r["v"]:<6} {r["fg"]} on {r["bg"]}  {r["sel"]}  {what}{was}  {flags}')
    for e in errors: print('console:', e)
    sys.exit(1 if a.baseline and show else 0)


if __name__ == '__main__':
    main()
