/* Ghost Caret — vanilla JS. Auto-initializes every [data-mi="ghost-caret"].
   The demo script plays a teammate; in production, feed applyRemote() from your sync layer.
   Call window.initGhostCaret(el) for elements added later. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var FADE = 4000;   // ms a teammate's fresh text stays highlighted
  var NEAR = 12;     // characters: closer than this and the teammate waits

  function initGhostCaret(root) {
    if (!root || root.__miGhost) return;
    root.__miGhost = true;

    var peer = root.getAttribute('data-name') || 'Mira';
    var input = root.querySelector('.gc-input');
    var mirror = root.querySelector('.gc-mirror');
    var caret = root.querySelector('.gc-caret');
    var flag = root.querySelector('.gc-flag');
    var status = root.querySelector('.gc-status');
    var replay = root.querySelector('.gc-replay');
    var original = input.value;

    var prev = original;
    var owners = [];        // per character: time the teammate typed it, or 0
    var at = 0;             // teammate's caret index
    var gen = 0;            // cancels an old script on replay
    var fadeTimer = 0;
    var visible = false;
    var started = false;

    function zeros(n) { var a = []; for (var i = 0; i < n; i++) a.push(0); return a; }
    owners = zeros(prev.length);

    function say(state) {
      var b = document.createElement('b');
      b.textContent = peer;
      var rest = { typing: ' is typing.', waiting: ' is waiting for you to finish here.', viewing: ' is viewing.', away: ' left. Their edits are saved.' }[state];
      status.replaceChildren(b, document.createTextNode(rest));
      flag.textContent = state === 'waiting' ? peer + ' · Waiting' : peer;
      caret.classList.toggle('is-waiting', state === 'waiting');
      caret.classList.toggle('is-idle', state === 'viewing');
      root.classList.toggle('is-away', state === 'away');
    }

    function grow() {
      input.style.height = 'auto';
      input.style.height = input.scrollHeight + 'px';
    }

    function alpha(i, now) {
      var t = owners[i];
      if (!t) return 0;
      var a = 1 - (now - t) / FADE;
      return a <= 0 ? 0 : Math.ceil(a * 10) / 10;
    }

    // Mirror the text (transparent) with highlight runs and a marker at the teammate's caret.
    function render() {
      var v = input.value, now = performance.now(), live = false;
      var frag = document.createDocumentFragment();
      var marker = null;
      var i = 0;
      while (i <= v.length) {
        if (i === at) {
          marker = document.createElement('span');
          marker.className = 'gc-mark';
          marker.textContent = '​';
          frag.appendChild(marker);
        }
        if (i === v.length) break;
        var a = alpha(i, now), j = i + 1;
        while (j < v.length && j !== at && alpha(j, now) === a) j++;
        if (a > 0) {
          live = true;
          var s = document.createElement('span');
          s.className = 'gc-new';
          s.style.setProperty('--a', a);
          s.textContent = v.slice(i, j);
          frag.appendChild(s);
        } else frag.appendChild(document.createTextNode(v.slice(i, j)));
        i = j;
      }
      frag.appendChild(document.createTextNode('​'));
      mirror.replaceChildren(frag);
      grow();
      if (marker) {
        caret.style.left = (marker.offsetLeft - 1) + 'px';
        caret.style.top = (marker.offsetTop + 2) + 'px';
      }
      clearTimeout(fadeTimer);
      if (live) fadeTimer = setTimeout(render, 200);
    }

    // Keep the teammate's caret and highlights attached to the right characters as you edit.
    input.addEventListener('input', function () {
      var v = input.value;
      var p = 0;
      while (p < v.length && p < prev.length && v[p] === prev[p]) p++;
      var s = 0;
      while (s < v.length - p && s < prev.length - p && v[v.length - 1 - s] === prev[prev.length - 1 - s]) s++;
      var removed = prev.length - p - s, inserted = v.length - p - s;
      Array.prototype.splice.apply(owners, [p, removed].concat(zeros(inserted)));
      if (at > p) at = at >= p + removed ? at + inserted - removed : p + inserted;
      prev = v;
      render();
    });
    ['keyup', 'click', 'focus', 'blur', 'select'].forEach(function (t) { input.addEventListener(t, function () { setTimeout(render, 0); }); });

    // Apply one remote keystroke at the teammate's caret without moving yours.
    function applyRemote(ch) {
      var v = input.value;
      var focused = document.activeElement === input;
      var s = input.selectionStart, e = input.selectionEnd;
      input.value = v.slice(0, at) + ch + v.slice(at);
      owners.splice(at, 0, performance.now());
      if (focused) {
        if (s >= at) s += ch.length;
        if (e >= at) e += ch.length;
        input.setSelectionRange(s, e);
      }
      at += ch.length;
      prev = input.value;
      render();
    }

    function nearYou() {
      if (document.activeElement !== input) return false;
      return Math.abs(input.selectionStart - at) <= NEAR;
    }

    function wait(ms, token) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () { token === gen ? resolve() : reject(); }, ms);
      });
    }
    function whenVisible(token) {
      return new Promise(function (resolve, reject) {
        (function check() {
          if (token !== gen) return reject();
          if (visible) return resolve();
          setTimeout(check, 300);
        })();
      });
    }

    function moveTo(index, token) {
      caret.classList.add('is-gliding');
      at = Math.max(0, Math.min(input.value.length, index));
      render();
      return wait(reduce.matches ? 60 : 620, token).then(function () { caret.classList.remove('is-gliding'); });
    }

    function type(text, token) {
      var i = 0;
      say('typing');
      return new Promise(function (resolve, reject) {
        (function next() {
          if (token !== gen) return reject();
          if (i >= text.length) return resolve();
          if (!visible) return setTimeout(next, 300);
          if (nearYou()) { say('waiting'); return setTimeout(next, 300); }
          say('typing');
          applyRemote(text[i++]);
          var ch = text[i - 1];
          setTimeout(next, (ch === ' ' ? 110 : 55) + Math.random() * 70);
        })();
      });
    }

    function find(str, after) {
      var i = input.value.indexOf(str);
      return i < 0 ? input.value.length : i + (after ? str.length : 0);
    }

    function script() {
      var token = ++gen;
      say('viewing');
      whenVisible(token)
        .then(function () { return wait(900, token); })
        .then(function () { return moveTo(find('Monday.', true), token); })
        .then(function () { return type(' Pricing goes live in every region at once.', token); })
        .then(function () { say('viewing'); return wait(1400, token); })
        .then(function () { return moveTo(find('up front.', true), token); })
        .then(function () { return type(' Support has the FAQ ready.', token); })
        .then(function () { say('viewing'); return wait(1400, token); })
        .then(function () { return moveTo(find('Open questions', false), token); })
        .then(function () { return type('Reminder: ', token); })
        .then(function () { say('viewing'); return wait(6000, token); })
        .then(function () { say('away'); })
        .catch(function () {});
    }

    replay.addEventListener('click', function () {
      gen++;
      input.value = original;
      prev = original;
      owners = zeros(original.length);
      at = 0;
      render();
      script();
    });

    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && !started) { started = true; script(); }
      }, { threshold: 0.3 }).observe(root);
    } else { visible = true; started = true; script(); }
    if (window.ResizeObserver) new ResizeObserver(function () { render(); }).observe(input);

    render();
    root.applyRemote = applyRemote;
  }

  window.initGhostCaret = initGhostCaret;
  function boot() { document.querySelectorAll('[data-mi="ghost-caret"]').forEach(initGhostCaret); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
