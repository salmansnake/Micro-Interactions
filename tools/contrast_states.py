#!/usr/bin/env python3
"""Contrast in every state, against another token file (RULES 14a step 4). contrast_check.py measures pages at rest;
this one uses each interaction the way a person would and measures after every step.

    python3 tools/contrast_states.py --against old-tokens.css --out states.json
    python3 tools/contrast_states.py --against old-tokens.css --slugs a,b --no-site --jobs 4

For each page, in light and dark: at rest, after resting a few seconds, with hidden parts shown, and for every control
(at most 3 that look alike): hovered, pressed, clicked (then again a moment later), any controls the click revealed
clicked in turn, and the control clicked a second time. Text fields are typed into and submitted with Enter; sliders
are moved with the arrow keys and End.

Every measurement is taken twice on the same frozen page: with the tokens the page ships with, then with --against
layered on top. A pair that passes with --against and fails with the shipped tokens is a regression the token change
caused; timing can't fake one, because both readings come from the same moment. Colors a script works out from the
tokens once and writes inline don't follow the swap, so check those by eye.

Needs Playwright (pip install playwright; python3 -m playwright install chromium). Not part of the build.
"""
import argparse, json, multiprocessing, os, re, sys, urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from contrast_check import ROOT, SCAN, FILL_MIN, serve  # noqa: E402

# Finite animations and transitions are finished, so a fade is read where it ends, not halfway; endless ones are paused
PAUSE = """() => { document.getAnimations().forEach(a => { const t = a.effect && a.effect.getComputedTiming(); if (t && isFinite(t.endTime)) { try { a.finish(); } catch (e) {} } });
  window.__ccPaused = document.getAnimations().filter(a => a.playState === 'running'); window.__ccPaused.forEach(a => a.pause()); }"""
RESUME = "() => { (window.__ccPaused || []).forEach(a => { try { a.play(); } catch (e) {} }); window.__ccPaused = []; }"
SWAP_IN = """(css) => { const t = document.createElement('style'); t.id = '__ccNoTrans'; t.textContent = '*, *::before, *::after { transition: none !important; }';
  const o = document.createElement('style'); o.id = '__ccOld'; o.textContent = css; document.documentElement.append(t, o); getComputedStyle(document.body).color; }"""
SWAP_OUT = """() => { document.getElementById('__ccOld').remove(); getComputedStyle(document.body).color; document.body.offsetWidth;
  document.getElementById('__ccNoTrans').remove(); getComputedStyle(document.body).color; }"""
REVEAL = "*, *::before, *::after { opacity: 1 !important; visibility: visible !important; transition: none !important; }"
# Every visible, enabled control in scope, numbered in document order; at most 3 per look-alike group
CONTROLS = r"""([scope, skip]) => {
  const root = document.querySelector(scope); if (!root) return [];
  const q = 'button, a[href], input:not([type=hidden]), textarea, select, summary, [role=button], [role=switch], [role=tab], [role=slider], [role=checkbox], [role=radio], [role=option], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
  const seen = new Map(), out = [];
  for (const el of root.querySelectorAll(q)) {
    if (el.hasAttribute('data-cc')) continue;
    if (skip && el.closest(skip)) continue;
    if (el.disabled || el.getAttribute('aria-disabled') === 'true' || !el.checkVisibility({ visibilityProperty: true, opacityProperty: true })) continue;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    const sig = el.tagName + '.' + [...el.classList].filter(k => !/^(is|has)-/.test(k)).join('.') + '|' + (el.getAttribute('role') || '') + '|' + (el.type || '');
    const n = seen.get(sig) || 0; seen.set(sig, n + 1); if (n >= 3) continue;
    const id = String(window.__ccN = (window.__ccN || 0) + 1); el.setAttribute('data-cc', id);
    const kind = (el.tagName === 'TEXTAREA' || el.isContentEditable || (el.tagName === 'INPUT' && /^(text|email|search|password|url|tel|number|)$/.test(el.type))) ? 'type'
      : ((el.tagName === 'INPUT' && el.type === 'range') || el.getAttribute('role') === 'slider') ? 'slide' : 'click';
    out.push({ id, kind, label: (el.getAttribute('aria-label') || el.textContent || el.placeholder || el.value || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 30) });
  }
  return out;
}"""
SAMPLE = {'email': 'sarah@acme', 'number': '42', 'url': 'atlas.app', 'tel': '5125550134'}


def fails(r):
    return r['v'] < (r['need'] if r['kind'] != 'fill' else FILL_MIN)


def scope_of(page):
    return page.evaluate("() => document.querySelector('dialog[open]') ? 'dialog[open]' : 'body'")


def measure(page, step, old_css, out):
    try:
        page.evaluate(PAUSE)
        scope = scope_of(page)
        new = page.evaluate(SCAN, scope)
        page.evaluate(SWAP_IN, old_css)
        old = {(r['kind'], r['sel'], r.get('side', '')): r for r in page.evaluate(SCAN, scope)}
        page.evaluate(SWAP_OUT)
        page.evaluate(RESUME)
    except Exception as e:  # the page navigated or closed mid-step
        out.append({'step': step, 'error': str(e)[:200]}); return
    for r in new:
        o = old.get((r['kind'], r['sel'], r.get('side', '')))
        if not o: continue
        nf, of = fails(r), fails(o)
        if nf and not of: status = 'new'
        elif nf and of and r['v'] < o['v'] - (0.005 if r['kind'] == 'fill' else 0.1): status = 'worse'
        elif of and not nf: status = 'fixed'
        elif nf: status = 'same'
        else: continue
        out.append(dict(r, step=step, status=status, was=o['v'], was_fg=o['fg'], was_bg=o['bg']))


def run_page(page, url, old_css, out, skip=None, scope='body'):
    def load():
        page.goto('about:blank'); page.goto(url, wait_until='load'); page.wait_for_timeout(500)
    load()
    measure(page, 'rest', old_css, out)
    page.wait_for_timeout(5000); measure(page, 'idle', old_css, out)
    page.add_style_tag(content=REVEAL); measure(page, 'shown', old_css, out)
    load()
    ctrls = page.evaluate(CONTROLS, [scope, skip])
    for c in ctrls:
        load(); page.evaluate(CONTROLS, [scope, skip])  # same numbering on a fresh page
        sel = f'[data-cc="{c["id"]}"]'
        tag = f'{c["id"]}:{c["label"]}'
        try:
            el = page.locator(sel)
            if c['kind'] == 'type':
                el.click(timeout=2000, force=True)
                t = page.evaluate(f"() => document.querySelector('{sel}').type || ''")
                page.keyboard.type(SAMPLE.get(t, 'Quick question about the launch!!!'), delay=10); page.wait_for_timeout(400)
                measure(page, f'type {tag}', old_css, out)
                page.keyboard.press('Enter'); page.wait_for_timeout(700)
                measure(page, f'enter {tag}', old_css, out)
                continue
            if c['kind'] == 'slide':
                el.focus(timeout=2000)
                for _ in range(5): page.keyboard.press('ArrowRight')
                page.wait_for_timeout(400); measure(page, f'slide {tag}', old_css, out)
                page.keyboard.press('End'); page.wait_for_timeout(600); measure(page, f'end {tag}', old_css, out)
                continue
            el.hover(timeout=2000, force=True); page.wait_for_timeout(250); measure(page, f'hover {tag}', old_css, out)
            page.mouse.down(); page.wait_for_timeout(120); measure(page, f'press {tag}', old_css, out)
            page.mouse.up(); page.wait_for_timeout(600); measure(page, f'click {tag}', old_css, out)
            page.wait_for_timeout(1600); measure(page, f'later {tag}', old_css, out)
            for n in page.evaluate(CONTROLS, [scope_of(page), skip])[:6]:  # what the click revealed
                try:
                    nl = page.locator(f'[data-cc="{n["id"]}"]')
                    if n['kind'] == 'type':
                        nl.click(timeout=1500, force=True); page.keyboard.type('Quick question', delay=10)
                    else:
                        nl.hover(timeout=1500, force=True); page.wait_for_timeout(200); measure(page, f'hover {tag} > {n["label"]}', old_css, out)
                        nl.click(timeout=1500, force=True)
                    page.wait_for_timeout(700); measure(page, f'click {tag} > {n["label"]}', old_css, out)
                except Exception: pass
            if page.locator(sel).count() and page.locator(sel).is_visible():
                page.locator(sel).click(timeout=1500, force=True); page.wait_for_timeout(700); measure(page, f'click2 {tag}', old_css, out)
        except Exception as e:
            out.append({'step': tag, 'error': str(e).splitlines()[0][:200]})


def worker(args):
    base, items, theme, old_css = args
    from playwright.sync_api import sync_playwright
    results = []
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        ctx = b.new_context(viewport={'width': 1440, 'height': 900}, color_scheme=theme, permissions=['clipboard-read', 'clipboard-write'])
        host = urllib.parse.urlparse(base).netloc
        # nothing leaves the machine (the idea form must never reach Formspree); fonts may load
        ctx.route('**/*', lambda r: r.continue_() if urllib.parse.urlparse(r.request.url).netloc in (host, 'fonts.googleapis.com', 'fonts.gstatic.com') or r.request.url.startswith('data:') else r.abort())
        ctx.on('page', lambda p: p.close() if len(ctx.pages) > 1 else None)
        page = ctx.new_page(); page.on('dialog', lambda d: d.dismiss())
        errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
        for name, url, skip in items:
            out, n = [], len(errors)
            run_page(page, base + url, old_css, out, skip=skip)
            for r in out: r.update(page=name, theme=theme)
            results += out + [{'page': name, 'theme': theme, 'step': 'pageerror', 'error': e} for e in errors[n:]]
            print(f'{theme} {name}: {sum(1 for r in out if r.get("status") in ("new", "worse"))} new or worse', file=sys.stderr, flush=True)
        b.close()
    return results


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--against', required=True, help='the token file to compare with (the old outcraft-tokens.css)')
    ap.add_argument('--root', default=ROOT, help='folder holding interactions.json and the built pages')
    ap.add_argument('--slugs', help='comma-separated slugs (default: every interaction in interactions.json)')
    ap.add_argument('--no-site', action='store_true', help='skip the site shell')
    ap.add_argument('--jobs', type=int, default=6)
    ap.add_argument('--out', help='save every finding here as JSON')
    a = ap.parse_args()
    root = os.path.abspath(a.root)
    old_css = open(a.against, encoding='utf-8').read()
    slugs = a.slugs.split(',') if a.slugs else [it['slug'] for it in json.load(open(os.path.join(root, 'interactions.json'), encoding='utf-8'))['interactions']]
    httpd = serve(root); base = f'http://127.0.0.1:{httpd.server_address[1]}/'
    # the site's own controls; the interactions inside it are measured on their own pages
    items = [] if a.no_site else [('site:home', '', '.mi-host'), ('site:explore', '#/' + slugs[0], '.mi-host')]
    items += [(s, s + '/', None) for s in slugs]
    jobs = []
    for theme in ('light', 'dark'):
        for i in range(a.jobs): jobs.append((base, items[i::a.jobs], theme, old_css))
    with multiprocessing.Pool(len(jobs)) as pool:
        rows = [r for part in pool.map(worker, jobs) for r in part]
    httpd.shutdown()
    if a.out:
        with open(a.out, 'w', encoding='utf-8') as f: json.dump(rows, f, indent=0)
    bad = [r for r in rows if r.get('status') in ('new', 'worse')]
    errs = [r for r in rows if 'error' in r]
    print(f'{len(rows)} findings: {len(bad)} new or worse with these tokens, {sum(r.get("status") == "fixed" for r in rows)} fixed, '
          f'{sum(r.get("status") == "same" for r in rows)} unchanged failures, {len(errs)} steps that could not run')
    seen = set()
    for r in sorted(bad, key=lambda r: (r['page'], r['theme'], r['kind'], r['sel'], r['step'])):
        k = (r['page'], r['theme'], r['kind'], r['sel'], r.get('side'), r['fg'], r['bg'])
        if k in seen: continue
        seen.add(k)
        what = f'{r["side"]:6} vs {r["against"]}' if r['kind'] == 'fill' else f'"{r["words"]}" needs {r["need"]}'
        flags = ' '.join(f for f in ('edged', 'flush', 'img') if r.get(f))
        print(f'{r["status"]:5} {r["page"]:24} {r["theme"]:5} {r["kind"]:11} {r["v"]:<6} was {r["was"]:<6} {r["fg"]} on {r["bg"]} (was {r["was_fg"]} on {r["was_bg"]})  {r["sel"]}  {what}  [{r["step"]}]  {flags}')


if __name__ == '__main__':
    main()
