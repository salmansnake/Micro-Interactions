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

  function initPointAtError(root) {
    if (!root || root.__miPoint) return;
    root.__miPoint = true;

    var input = root.querySelector('.pe-input');
    var field = root.querySelector('.pe-field');
    var mark = root.querySelector('.pe-mark');
    var svg = root.querySelector('.pe-line');
    var path = svg.querySelector('path');
    var dot = svg.querySelector('circle');
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

      var rr = root.getBoundingClientRect();
      var fr = field.getBoundingClientRect();
      var tr = text.getBoundingClientRect();
      var ox = rr.left + root.clientLeft;
      var oy = rr.top + root.clientTop;
      var markBottom = parseFloat(getComputedStyle(mark).bottom) || 7;
      var ex = fr.left + field.clientLeft + b.x + b.w / 2 - ox;
      var ey = fr.top + field.clientTop + field.clientHeight - markBottom + 2 - oy;
      var sx = tr.left - 6 - ox;
      var sy = tr.top + 10 - oy;
      path.setAttribute('d', 'M' + sx + ' ' + sy + ' C' + (sx - 12) + ' ' + sy + ' ' + ex + ' ' + (ey + 22) + ' ' + ex + ' ' + ey);
      dot.setAttribute('cx', ex);
      dot.setAttribute('cy', ey);

      if (animate && !reduce.matches && path.animate) {
        var L = path.getTotalLength();
        path.style.strokeDasharray = L + ' ' + L;
        path.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 420, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'both' });
        dot.animate([{ opacity: 0 }, { opacity: 0, offset: 0.8 }, { opacity: 1 }], { duration: 460, fill: 'both' });
      } else {
        path.style.strokeDasharray = 'none';
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
