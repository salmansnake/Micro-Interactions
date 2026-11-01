/* Address Unpack — vanilla JS. Auto-initializes every [data-mi="address-unpack"].
   On paste (or Paste Example), the text is split at commas and the state and ZIP are found at the end. Each piece
   flies from where it sits in the paste field to its own field, then lands. Call window.initAddressUnpack(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var STATES = 'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ');

  // Even line breaks: text that wraps to two or three lines is narrowed until its lines are close in length,
  // with the first line the longest, so no line runs long while the next holds a word or two.
  function evenLines(root) {
    var SEL = 'p, li, dd, dt, small, label, figcaption, h1, h2, h3, h4';
    function widths(el) {
      var range = document.createRange(), rows = [];
      range.selectNodeContents(el);
      Array.prototype.forEach.call(range.getClientRects(), function (b) {
        if (!b.width) return;
        var row = rows.filter(function (x) { return Math.abs(x.t - b.top) < b.height / 2; })[0];
        if (row) { row.l = Math.min(row.l, b.left); row.r = Math.max(row.r, b.right); } else rows.push({ t: b.top, l: b.left, r: b.right });
      });
      return rows.sort(function (a, b) { return a.t - b.t; }).map(function (x) { return x.r - x.l; });
    }
    function fit(el) {
      el.style.maxWidth = ''; el.style.textWrap = '';
      // A filled box marked data-fill spans the card from edge to edge, and its text fills it
      if (el.hasAttribute('data-fill')) return;
      var cs = getComputedStyle(el), full = el.getBoundingClientRect().width;
      if (!full || cs.whiteSpace === 'nowrap' || /flex|grid/.test(cs.display)) return;
      if (Array.prototype.some.call(el.children, function (c) { return !/^inline/.test(getComputedStyle(c).display); })) return;
      el.style.textWrap = 'wrap';
      var n = widths(el).length, lo = 0, hi = full, w, L;
      if (n < 2 || n > 3) { el.style.textWrap = ''; return; }
      while (hi - lo > 1) { w = (lo + hi) / 2; el.style.maxWidth = w + 'px'; if (widths(el).length > n) lo = w; else hi = w; }
      var best = 0, gap = Infinity;
      for (w = Math.ceil(hi); w <= full; w += 2) {
        el.style.maxWidth = w + 'px'; L = widths(el);
        // Each line no longer than the one above (within 10%, which reads as equal). Keep the most even width,
        // and prefer the first line longer: a last line longer than the first costs three times its overhang
        var score = Math.max.apply(null, L) - Math.min.apply(null, L) + Math.max(0, L[n - 1] - L[0]) * 3;
        if (L.length === n && L.every(function (x, i) { return !i || x <= L[i - 1] * 1.1 + 1; }) && score < gap) { gap = score; best = w; }
      }
      if (!best) { el.style.maxWidth = ''; el.style.textWrap = ''; return; }
      el.style.maxWidth = best + 'px';
      if (cs.textAlign === 'center' && cs.display === 'block') { el.style.marginLeft = 'auto'; el.style.marginRight = 'auto'; }
    }
    var queued = false, lastW = 0;
    function run() { queued = false; Array.prototype.forEach.call(root.querySelectorAll(SEL), fit); }
    function later() { if (!queued) { queued = true; requestAnimationFrame(run); } }
    later();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
    if (window.ResizeObserver) new ResizeObserver(function () { var w = root.getBoundingClientRect().width; if (Math.abs(w - lastW) > 0.5) { lastW = w; later(); } }).observe(root);
    if (window.MutationObserver) new MutationObserver(later).observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden'] });
  }

  // Split "street, [apt,] city, ST 12345" into its parts; anything missing stays empty
  function parse(s) {
    var out = { street: '', apt: '', city: '', state: '', zip: '' }, parts = s.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    if (!parts.length) return out;
    var last = parts[parts.length - 1], m = /^([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)$/.exec(last);
    if (m && STATES.indexOf(m[1].toUpperCase()) >= 0) { out.state = m[1].toUpperCase(); out.zip = m[2]; parts.pop(); }
    else if (/^\d{5}$/.test(last)) { out.zip = last; parts.pop(); }
    out.street = parts.shift() || '';
    if (parts.length && /^(apt|suite|ste|unit|#|floor|fl)\b/i.test(parts[0])) out.apt = parts.shift();
    out.city = parts.join(', ');
    return out;
  }

  function initAddressUnpack(root) {
    if (!root || root.__miAdu) return;
    root.__miAdu = true;
    evenLines(root);
    var all = root.querySelector('.adu-all'), tryBtn = root.querySelector('.adu-try'), status = root.querySelector('.adu-status');
    var fields = {}; root.querySelectorAll('.adu-f').forEach(function (f) { fields[f.getAttribute('data-k')] = f; });
    var example = root.getAttribute('data-example') || '';
    var cv = document.createElement('canvas').getContext('2d');

    // Where a piece of text starts inside the paste field, so its copy can take off from there
    function offsetOf(text, i) {
      var cs = getComputedStyle(all); cv.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      return parseFloat(cs.paddingLeft) + cv.measureText(text.slice(0, i)).width - all.scrollLeft;
    }

    function unpack(text) {
      var p = parse(text), rb = root.getBoundingClientRect(), ib = all.getBoundingClientRect(), n = 0, missing = [];
      Object.keys(fields).forEach(function (k, idx) {
        var f = fields[k], input = f.querySelector('input'), v = p[k];
        f.classList.remove('is-filled', 'is-missing'); input.value = '';
        if (!v) { if (k !== 'apt') { f.classList.add('is-missing'); missing.push(f.querySelector('span').textContent.toLowerCase()); } return; }
        n++;
        var land = function () { input.value = v; f.classList.add('is-filled'); };
        if (reduce.matches) return land();
        var g = document.createElement('span'), at = text.indexOf(v), tb = input.getBoundingClientRect();
        g.className = 'adu-ghost'; g.textContent = v; g.setAttribute('aria-hidden', 'true');
        root.appendChild(g);
        var sx = ib.left - rb.left + Math.max(0, Math.min(ib.width - 40, offsetOf(text, Math.max(0, at)))), sy = ib.top - rb.top + 9;
        g.style.transform = 'translate(' + sx + 'px, ' + sy + 'px)';
        void g.offsetWidth;
        setTimeout(function () {
          g.style.transform = 'translate(' + (tb.left - rb.left + 6) + 'px, ' + (tb.top - rb.top + 9) + 'px)';
          g.style.opacity = '0';
        }, idx * 70);
        setTimeout(function () { land(); g.remove(); }, idx * 70 + 520);
      });
      if (!text.trim()) status.textContent = '';
      else if (!p.zip) status.textContent = 'Couldn’t find a ZIP code. The rest is sorted; add it by hand.';
      else status.textContent = 'Split into ' + n + (n === 1 ? ' field' : ' fields') + '.' + (missing.length ? ' Still needed: ' + missing.join(', ') + '.' : p.apt ? ' Give the apartment a quick look.' : ''); // the apartment is the likeliest wrong guess; with none found, nothing to look at
    }

    all.addEventListener('paste', function () { setTimeout(function () { unpack(all.value); }, 0); });
    all.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); unpack(all.value); } });
    tryBtn.addEventListener('click', function () { all.value = example; unpack(example); });
  }

  window.initAddressUnpack = initAddressUnpack;
  function boot() { document.querySelectorAll('[data-mi="address-unpack"]').forEach(initAddressUnpack); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
