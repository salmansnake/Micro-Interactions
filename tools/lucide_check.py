"""Every 24x24 icon in an interaction must be a Lucide icon (RULES 10c). tools/lucide-icons.json holds the exact Lucide
drawings the library uses; add a new icon there from lucide.dev (or the lucide-static package) before using it.
A drawing that is not an icon (a progress ring, a gauge) carries data-gauge on its <svg>."""
import json, os, re, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def norm(x):
    x = x.replace("'", '"')
    x = re.sub(r'\s+', ' ', x).strip(); x = re.sub(r'\s*/>', '/>', x); x = re.sub(r'>\s*<', '><', x)
    x = re.sub(r' (class|style|aria-hidden|stroke-width|fill|stroke|stroke-linecap|stroke-linejoin)="[^"]*"', '', x)
    x = re.sub(r'<(\w+)([^>]*)></\1>', r'<\1\2/>', x)
    return x

def icons_in(slug):
    src = ''
    for f in ('component.html', 'component.js', 'component.css'):
        t = open(os.path.join(ROOT, slug, f), encoding='utf-8').read().replace("\\'", "'")
        src += '\n'.join(urllib.parse.unquote(m) for m in re.findall(r'data:image/svg\+xml,([^")]+)', t)) + '\n' + t
    for m in re.finditer(r'<svg([^>]*viewBox=["\']0 0 24 24["\'][^>]*)>(.*?)</svg>', src, re.S):
        if 'data-gauge' in m.group(1) or "' +" in m.group(2): continue
        yield m.group(2)

def check(slugs):
    known = set(json.load(open(os.path.join(ROOT, 'tools', 'lucide-icons.json'), encoding='utf-8'))['icons'].values())
    errs = []
    for s in slugs:
        for inner in icons_in(s):
            if norm(inner) not in known:
                errs.append(f'{s}: an icon is not a Lucide icon ({inner.strip()[:60]}...). Use a Lucide icon and add it to tools/lucide-icons.json (RULES 10c)')
    return errs
