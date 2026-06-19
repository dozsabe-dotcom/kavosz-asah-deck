(function () {
'use strict';

var DUR = 840, DELAY = 200, STAGGER = 70;
var EASE = 'cubic-bezier(.22,.61,.36,1)';

/* ── CSS animation string ──────────────────────────────── */
function animCSS(type, idx) {
  var d = DELAY + (idx || 0) * STAGGER;
  if (type === 'expand')   return 'aExpandX '  + DUR + 'ms ' + EASE + ' ' + d + 'ms both';
  if (type === 'scale-in') return 'aScaleIn '  + DUR + 'ms ' + EASE + ' ' + d + 'ms both';
  if (type === 'fade-in')  return 'aFadeIn '   + DUR + 'ms ' + EASE + ' ' + d + 'ms both';
  return 'aFadeUp ' + DUR + 'ms ' + EASE + ' ' + d + 'ms both';
}

/* ── Apply animation to single element ─────────────────── */
function anim(el, type, idx) {
  if (!el) return;
  el.classList.add('anim-el');
  if (type === 'expand') el.classList.add('anim-expand');
  el.style.animation = animCSS(type, idx || 0);
}

/* ── Stagger an array of elements ──────────────────────── */
function stagger(els, type) {
  (els || []).forEach(function (el, i) { anim(el, type || 'fade-up', i); });
}

/* ── Re-trigger a Chart.js chart animation ─────────────── */
function replayChart(id) {
  var canvas = document.getElementById(id);
  if (!canvas) return;
  var chart = typeof Chart !== 'undefined' && Chart.getChart ? Chart.getChart(canvas) : null;
  if (!chart) return;
  chart.reset();
  chart.update();
}

/* ── Count-up ───────────────────────────────────────────── */
function countUp(el) {
  if (!el) return;
  var to = parseFloat(el.dataset.to || '0');
  var suffix = el.dataset.suffix || '';
  var dur = DUR + DELAY;
  var start = performance.now();
  function tick(now) {
    var t = Math.min((now - start) / dur, 1);
    var v = to * (1 - Math.pow(1 - t, 3));
    el.textContent = (Number.isInteger(to) ? Math.round(v) : v.toFixed(1)) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ── Helpers ────────────────────────────────────────────── */
function qs(s, sel)  { return s.querySelector(sel); }
function qsa(s, sel) { return Array.from(s.querySelectorAll(sel)); }

/* ── Divider slide template ─────────────────────────────── */
function dividerSlide(s) {
  anim(qs(s, '.h-xl'), 'fade-up', 0);
  anim(qs(s, '.divider-line'), 'expand', 1);
}

/* ── Per-slide animation map ────────────────────────────── */
var SLIDES = {
  '01': dividerSlide,
  '02': function (s) { anim(qs(s, '.quoteblk'), 'fade-up', 0); },
  '03': function (s) { stagger(qsa(s, '.body-wrap > div > .glass-strong')); },
  '04': dividerSlide,
  '05': function (s) { stagger(qsa(s, '.glass-strong .dots li')); },
  '06': function (s) { anim(qs(s, '[data-panel="output"]'), 'fade-up', 0); },
  '07': function (s) { stagger(qsa(s, '.body-wrap > .glass-strong')); },
  '08': function (s) { stagger(qsa(s, '.body-wrap > .glass-strong')); },
  '09': dividerSlide,
  '10': function (s) { stagger(qsa(s, '.checks li')); },
  '11': function (s) { stagger(qsa(s, '.dtable tbody tr'), 'fade-in'); },
  '12': dividerSlide,
  '13': function (s) { setTimeout(function () { replayChart('c13'); }, DELAY); },
  '14': function (s) { setTimeout(function () { replayChart('c14'); }, DELAY); },
  '15': function (s) { setTimeout(function () { replayChart('c15a'); replayChart('c15b'); }, DELAY); },
  '16': function (s) { setTimeout(function () { replayChart('c16a'); replayChart('c16b'); }, DELAY); },
  '17': function (s) {
    var bar = qs(s, '[style*="align-items:flex-start"][style*="gap:1px"]');
    if (bar) stagger(Array.from(bar.children), 'fade-in');
  },
  '18': function (s) {
    var bar = qs(s, '[style*="align-items:flex-start"][style*="gap:1px"]');
    if (bar) stagger(Array.from(bar.children), 'fade-in');
  },
  '19': function (s) { setTimeout(function () { replayChart('c19'); }, DELAY); },
  '20': function (s) { setTimeout(function () { replayChart('c20'); }, DELAY); },
  '21': function (s) { anim(qs(s, '[style*="grid-template-columns:1fr 1fr"]'), 'fade-up', 0); },
  '22': function (s) { setTimeout(function () { replayChart('c22'); }, DELAY); },
  '23': function (s) { stagger(qsa(s, '.htable tbody tr'), 'fade-in'); },
  '24': function (s) { stagger(qsa(s, '.htable tbody tr'), 'fade-in'); },
  '25': dividerSlide,
  '26': function (s) { anim(qs(s, '[data-panel="future"]'), 'fade-up', 0); },
  '27': function (s) { anim(qs(s, '[style*="position:absolute;inset:0"]'), 'fade-up', 0); },
  '28': function (s) {
    var tl = qs(s, '[data-timeline]');
    if (tl) stagger(Array.from(tl.children));
  },
  '29': function (s) { stagger(qsa(s, '.body-wrap > div > .glass-strong')); },
  '30': function (s) { stagger(qsa(s, '.body-wrap > div > .glass-strong')); },
  '31': function (s) { stagger(qsa(s, '.body-wrap > div > .glass-strong')); },
  '32': function (s) {
    qsa(s, '.glass-strong').forEach(function (gs) {
      stagger(Array.from(gs.querySelectorAll('tbody tr')), 'fade-in');
    });
  },
  '33': function (s) {
    qsa(s, '.glass-strong').forEach(function (gs) {
      stagger(Array.from(gs.querySelectorAll('tbody tr')), 'fade-in');
    });
  },
  '34': function (s) {
    qsa(s, '.glass-strong').forEach(function (gs) {
      stagger(Array.from(gs.querySelectorAll('tbody tr')), 'fade-in');
    });
  },
  '35': function (s) { anim(qs(s, 'svg'), 'scale-in', 0); },
  '36': function (s) { stagger(qsa(s, 'table tbody tr'), 'fade-in'); },
  '37': dividerSlide,
  '38': function (s) {
    anim(qs(s, 'svg'), 'scale-in', 0);
    setTimeout(function () { countUp(qs(s, '.anim-count')); }, DELAY);
  },
  '39': function (s) {
    var row = qs(s, '[data-step-row]');
    if (!row) return;
    stagger(Array.from(row.children).filter(function (c) { return c.style.flex === '1'; }));
  },
  '40': function (s) {
    var br = qs(s, '[data-bottom-row]');
    if (br) stagger(Array.from(br.children));
  },
  '41': function (s) { anim(qs(s, '.anim-quote'), 'fade-up', 0); },
};

/* ── Play / reset ───────────────────────────────────────── */
function playSlide(slide) {
  var fn = SLIDES[slide.dataset.label];
  if (fn) fn(slide);
}

function resetSlide(slide) {
  slide.querySelectorAll('.anim-el').forEach(function (el) {
    el.classList.remove('anim-el', 'anim-expand');
    el.style.animation = '';
  });
  var ce = slide.querySelector('.anim-count[data-to]');
  if (ce) ce.textContent = ce.dataset.to.replace('.', ',') + (ce.dataset.suffix || '');
}

/* ── Init ───────────────────────────────────────────────── */
function init() {
  var first = document.querySelector('section.slide');
  if (!first || getComputedStyle(first).position !== 'absolute') return;

  document.body.classList.add('prs-mode');

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.attributeName !== 'class') return;
      var el = m.target;
      var had = (m.oldValue || '').indexOf('prs-on') !== -1;
      var has = el.classList.contains('prs-on');
      if (!had && has) requestAnimationFrame(function () { playSlide(el); });
      if (had && !has) resetSlide(el);
    });
  });

  document.querySelectorAll('section.slide').forEach(function (s) {
    observer.observe(s, { attributes: true, attributeOldValue: true });
  });

  var active = document.querySelector('section.slide.prs-on');
  if (active) requestAnimationFrame(function () { playSlide(active); });
}

if (document.readyState === 'complete') { init(); }
else { window.addEventListener('load', init); }

})();
