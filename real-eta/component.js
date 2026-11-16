/* Real ETA — vanilla JS. Auto-initializes every [data-mi="real-eta"].
   Each stage of the delivery has a chance for each day. The bars show it, the tallest is "most likely", and the
   odds line says how likely it is by a given day. Move Time Forward moves to the next stage, and the range narrows.
   Call window.initRealEta(el) for elements added later. */
(function () {
  'use strict';
  var DAYS = ['Wed', 'Thu', 'Fri', 'Sat', 'Mon'], DATES = ['Wed, Nov 11', 'Thu, Nov 12', 'Fri, Nov 13', 'Sat, Nov 14', 'Mon, Nov 16'];
  var STAGES = [
    { where: 'Ordered · Austin, TX', p: [10, 35, 30, 15, 10], say: 'A range, because we don’t know yet. It narrows as we learn more along the way.' },
    { where: 'Shipped from Dallas', p: [15, 50, 25, 10, 0], say: 'Left Dallas this morning. Monday is off the table, and Thursday is now the best\u00a0bet.' },
    { where: 'At the Austin hub', p: [0, 85, 15, 0, 0], say: 'In Austin at the local hub. Thursday it is, unless the trucks are full that day.' },
    { where: 'Out for delivery', p: [0, 100, 0, 0, 0], say: 'On the truck and a few stops away. Between 2 and 4 PM today, so keep an eye out.' }
  ];

  function initRealEta(root) {
    if (!root || root.__miEta) return;
    root.__miEta = true;
    var list = root.querySelector('.eta-days'), when = root.querySelector('.eta-when'), odds = root.querySelector('.eta-odds');
    var where = root.querySelector('.eta-where'), steps = root.querySelectorAll('.eta-steps li'), btn = root.querySelector('.eta-btn'), status = root.querySelector('.eta-status');
    var s = 0;
    DAYS.forEach(function (d) {
      var li = document.createElement('li'); li.className = 'eta-day';
      li.innerHTML = '<span class="eta-pct"></span><span class="eta-bar"></span><span class="eta-lab"></span>';
      li.querySelector('.eta-lab').textContent = d; list.appendChild(li);
    });
    var days = list.children;

    // Reserve the height of the longest message at the current width, so stepping through never moves the card
    function reserve() {
      var keep = status.textContent, h = 0;
      status.style.minHeight = '';
      STAGES.forEach(function (st) { status.textContent = st.say; h = Math.max(h, status.getBoundingClientRect().height); });
      status.textContent = keep; status.style.minHeight = Math.ceil(h) + 'px';
    }

    function render() {
      var st = STAGES[s], top = st.p.indexOf(Math.max.apply(null, st.p)), sum = 0, by = -1;
      Array.prototype.forEach.call(days, function (li, i) {
        li.style.setProperty('--p', (st.p[i] / 100).toFixed(2));
        li.querySelector('.eta-pct').textContent = st.p[i] ? st.p[i] + '%' : '';
        li.classList.toggle('is-top', i === top);
        li.setAttribute('aria-label', DATES[i] + ': ' + st.p[i] + '% chance');
      });
      // The first day by which it's at least 80% likely
      st.p.some(function (x, i) { sum += x; if (sum >= 80) { by = i; return true; } return false; });
      when.textContent = s === STAGES.length - 1 ? 'Today, 2–4 PM' : 'Most likely ' + DATES[top];
      odds.textContent = s === STAGES.length - 1 ? 'It’s on the truck' : (by === top ? sum + '% chance on ' + DAYS[top] : '80% chance by ' + DAYS[by]);
      where.textContent = st.where;
      steps.forEach(function (li, i) { li.classList.toggle('is-done', i <= s); });
      status.textContent = st.say;
      btn.disabled = s === STAGES.length - 1;
    }
    btn.addEventListener('click', function () { if (s < STAGES.length - 1) { s++; render(); } });
    render();
    reserve();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(reserve);
    var lastW = 0;
    if (window.ResizeObserver) new ResizeObserver(function () { var w = root.getBoundingClientRect().width; if (Math.abs(w - lastW) > 0.5) { lastW = w; reserve(); } }).observe(root);
  }

  window.initRealEta = initRealEta;
  function boot() { document.querySelectorAll('[data-mi="real-eta"]').forEach(initRealEta); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
