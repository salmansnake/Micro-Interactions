/* Point-at-Error — vanilla JS. Auto-initializes every [data-mi="point-at-error"].
   Call window.initPointAtError(el) for elements added later.
   window.checkEmail(value) is exported so you can reuse the rules. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var PAUSE = 800;

  var NAMES = {
    ',': 'comma', ';': 'semicolon', ':': 'colon', '<': '“<”', '>': '“>”',
    '(': 'bracket', ')': 'bracket', '[': 'bracket', ']': 'bracket', '\\': 'backslash', '"': 'quote mark'
  };
  var TYPOS = {
    'gmial.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmail.co': 'gmail.com',
    'gnail.com': 'gmail.com', 'gmaill.com': 'gmail.com', 'hotmial.com': 'hotmail.com', 'hotmal.com': 'hotmail.com',
    'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'outlok.com': 'outlook.com', 'outlook.co': 'outlook.com',
    'iclod.com': 'icloud.com', 'icoud.com': 'icloud.com'
  };

  function cut(v, i, len) { return v.slice(0, i) + v.slice(i + len); }

  // Returns null when valid, otherwise { i, len, gap?, soft?, msg, fix?, fixLabel? }
  function checkEmail(v) {
    var sp = v.search(/\s/);
    if (sp > -1) return { i: sp, len: 1, msg: 'Remove the space. Email addresses can’t contain spaces.', fix: v.replace(/\s+/g, ''), fixLabel: 'Remove spaces' };
    var bad = v.search(/[,;:<>()\[\]\\"]/);
    if (bad > -1) return { i: bad, len: 1, msg: 'Remove the ' + (NAMES[v[bad]] || v[bad]) + '. It isn’t allowed in an email.', fix: cut(v, bad, 1), fixLabel: 'Remove it' };
    var at = v.indexOf('@');
    if (at === -1) return { i: v.length, len: 0, gap: true, msg: 'Add an @ and your company domain, like @company.com.' };
    if (at === 0) return { i: 0, len: 1, msg: 'Add your name before the @.' };
    var at2 = v.indexOf('@', at + 1);
    if (at2 > -1) return { i: at2, len: 1, msg: 'An email can only have one @.', fix: cut(v, at2, 1), fixLabel: 'Remove it' };
    var dd = v.indexOf('..');
    if (dd > -1) return { i: dd, len: 2, msg: 'Two dots in a row aren’t allowed.', fix: v.replace(/\.{2,}/g, '.'), fixLabel: 'Use one dot' };
    var local = v.slice(0, at);
    var domain = v.slice(at + 1);
    if (local[0] === '.') return { i: 0, len: 1, msg: 'An email can’t start with a dot.', fix: v.slice(1), fixLabel: 'Remove it' };
    if (local[local.length - 1] === '.') return { i: at - 1, len: 1, msg: 'Remove the dot right before the @.', fix: cut(v, at - 1, 1), fixLabel: 'Remove it' };
    if (!domain) return { i: v.length, len: 0, gap: true, msg: 'Add the domain after the @, like company.com.' };
    if (domain[0] === '.') return { i: at + 1, len: 1, msg: 'The domain can’t start with a dot.', fix: cut(v, at + 1, 1), fixLabel: 'Remove it' };
    if (domain.indexOf('.') === -1) return { i: v.length, len: 0, gap: true, msg: 'Add the ending to ' + domain + ', like ' + domain + '.com.', fix: v + '.com', fixLabel: 'Add .com' };
    if (domain[domain.length - 1] === '.') return { i: v.length, len: 0, gap: true, msg: 'Finish the ending after the dot, like .com.' };
    var right = TYPOS[domain.toLowerCase()];
    if (right) {
      var d = domain.toLowerCase();
      var s = 0;
      while (s < d.length && d[s] === right[s]) s++;
      var e = 0;
      while (e < d.length - s && d[d.length - 1 - e] === right[right.length - 1 - e]) e++;
      var len = Math.max(1, d.length - e - s);
      return { i: at + 1 + Math.min(s, d.length - 1), len: len, soft: true, msg: 'Did you mean ' + right + '?', fix: local + '@' + right, fixLabel: 'Use ' + right };
    }
    return null;
  }

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

  function initPointAtError(root) {
    if (!root || root.__miPoint) return;
    root.__miPoint = true;
    evenLines(root);

    var input = root.querySelector('.pe-input');
    var field = root.querySelector('.pe-field');
    var mark = root.querySelector('.pe-mark');
    var msg = root.querySelector('.pe-msg');
    var text = root.querySelector('.pe-msg-text');
    var fixBtn = root.querySelector('.pe-fix');
    var ctx = document.createElement('canvas').getContext('2d');
    var current = null;
    var timer = 0;

    function measure(str) {
      var s = getComputedStyle(input);
      ctx.font = [s.fontStyle, s.fontWeight, s.fontSize, s.fontFamily].join(' ');
      return ctx.measureText(str).width;
    }

    // Box of the problem characters, in the field's coordinates.
    function charBox(err) {
      var s = getComputedStyle(input);
      var padL = parseFloat(s.paddingLeft);
      var padR = parseFloat(s.paddingRight);
      var v = input.value;
      var x = padL + measure(v.slice(0, err.i)) - input.scrollLeft;
      var w = err.gap ? 12 : measure(v.slice(err.i, err.i + err.len));
      if (err.gap) x += 2;
      else { x -= 2; w += 4; }
      var maxX = input.clientWidth - padR - w + 4;
      x = Math.max(padL - 4, Math.min(x, maxX));
      return { x: x, w: Math.max(w, 6) };
    }

    function layout(animate) {
      if (!current) return;
      var b = charBox(current);
      mark.style.left = b.x + 'px';
      mark.style.width = b.w + 'px';
      mark.classList.toggle('is-gap', !!current.gap);

      // The bubble's pointer sits right under the problem characters, kept clear of its rounded corners.
      var fr = field.getBoundingClientRect();
      msg.style.minWidth = '';
      var mr = msg.getBoundingClientRect();
      var px = fr.left + field.clientLeft + b.x + b.w / 2 - mr.left;
      if (px + 18 > mr.width) { msg.style.minWidth = Math.ceil(px + 18) + 'px'; mr = msg.getBoundingClientRect(); }
      msg.style.setProperty('--pe-x', Math.max(18, Math.min(px, mr.width - 18)) + 'px');
      if (animate && !reduce.matches && msg.animate) {
        msg.animate([{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.3,.7,.3,1)' });
      }
    }

    function setState(err, ok) {
      current = err;
      root.classList.toggle('has-error', !!err);
      root.classList.toggle('is-soft', !!(err && err.soft));
      root.classList.toggle('is-ok', !!ok);
      if (err) {
        text.textContent = err.msg;
        fixBtn.hidden = !err.fix;
        fixBtn.textContent = err.fixLabel || 'Fix it';
        input.setAttribute('aria-invalid', 'true');
        requestAnimationFrame(function () { layout(true); });
      } else {
        text.textContent = ok ? 'Looks good.' : '';
        fixBtn.hidden = true;
        msg.style.minWidth = '';
        input.removeAttribute('aria-invalid');
      }
    }

    function validate() {
      clearTimeout(timer);
      var v = input.value;
      if (!v) { setState(null, false); return; }
      var err = checkEmail(v);
      setState(err, !err);
    }

    input.addEventListener('input', function () {
      clearTimeout(timer);
      setState(null, false); // stay quiet while typing
      timer = setTimeout(validate, PAUSE);
    });
    input.addEventListener('blur', validate);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') validate(); });
    ['scroll', 'keyup', 'click', 'select'].forEach(function (t) {
      input.addEventListener(t, function () { layout(false); });
    });
    if (window.ResizeObserver) new ResizeObserver(function () { layout(false); }).observe(root);

    fixBtn.addEventListener('click', function () {
      if (!current || !current.fix) return;
      input.value = current.fix;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
      validate();
    });

    root.querySelectorAll('[data-try]').forEach(function (b) {
      b.addEventListener('click', function () {
        input.value = b.getAttribute('data-try');
        input.scrollLeft = 0;
        validate();
      });
    });
  }

  window.checkEmail = checkEmail;
  window.initPointAtError = initPointAtError;
  function boot() { document.querySelectorAll('[data-mi="point-at-error"]').forEach(initPointAtError); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
