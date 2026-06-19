(function () {
'use strict';

/* ── constants ─────────────────────────────────────── */
var W = 1920, H = 1080;

/* ── state ─────────────────────────────────────────── */
var stage, slides, total, current = 0, busy = false;
var jumpEl = null;
var jumpOpen = false; /* track jump overlay state explicitly */

/* ── scale-to-fit ──────────────────────────────────── */
function rescale() {
  var s = Math.min(innerWidth / W, innerHeight / H);
  var x = Math.round((innerWidth  - W * s) / 2);
  var y = Math.round((innerHeight - H * s) / 2);
  stage.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
}

/* ── slide transition ──────────────────────────────── */
function go(idx) {
  if (idx < 0 || idx >= total || busy) return;
  busy = true;
  var prev = slides[current];
  var next = slides[idx];
  prev.classList.remove('prs-on');
  prev.classList.add('prs-out');
  next.classList.add('prs-on');
  setTimeout(function () {
    prev.classList.remove('prs-out');
    current = idx;
    busy = false;
    syncUI();
  }, 420);
}

/* ── sync slide number in footer ───────────────────── */
function syncUI() {
  /* nothing extra needed — footer pg is part of each slide */
}

/* ── fullscreen toggle ─────────────────────────────── */
function toggleFS() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(function () {});
  } else {
    document.exitFullscreen();
  }
}

/* ── keyboard ──────────────────────────────────────── */
function onKey(e) {
  if (jumpOpen) {
    if (e.key === 'Escape') { closeJump(); e.preventDefault(); }
    return;
  }
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  switch (e.key) {
    case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown':
      e.preventDefault(); go(current + 1); break;
    case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
      e.preventDefault(); go(current - 1); break;
    case 'Home': e.preventDefault(); go(0); break;
    case 'End':  e.preventDefault(); go(total - 1); break;
    case 'f': case 'F': toggleFS(); break;
  }
}

/* ── touch / swipe ─────────────────────────────────── */
var _tx = 0;
function onTouchStart(e) { _tx = e.touches[0].clientX; }
function onTouchEnd(e) {
  var dx = e.changedTouches[0].clientX - _tx;
  if (Math.abs(dx) > 48) { dx < 0 ? go(current + 1) : go(current - 1); }
}

/* ── jump overlay (appears near .pg click) ─────────── */
function openJump(anchorRect) {
  if (!jumpEl) return;
  var inp = jumpEl.querySelector('input');
  inp.value = '';
  jumpEl.style.left = Math.round(anchorRect.left + anchorRect.width / 2 - 80) + 'px';
  jumpEl.style.top  = Math.round(Math.max(8, anchorRect.top - 56)) + 'px';
  jumpEl.style.display = 'flex';
  jumpOpen = true;
  inp.focus();
}

function closeJump() {
  if (jumpEl) jumpEl.style.display = 'none';
  jumpOpen = false;
}

/* ── nav UI ────────────────────────────────────────── */
function buildUI() {
  var s = document.createElement('style');
  s.textContent =
    '@media print{#prs-ui{display:none!important}}' +
    /* edge button strip — always visible */
    '#prs-ui{position:fixed;bottom:0;left:0;right:0;z-index:99999;' +
      'display:flex;justify-content:space-between;align-items:flex-end;' +
      'padding:0 0 14px 0;pointer-events:none}' +
    '.prs-side{display:flex;gap:8px;padding:0 20px;pointer-events:auto}' +
    '.pb{background:rgba(10,10,14,.55);border:1px solid rgba(255,255,255,.15);color:#fff;' +
      'border-radius:8px;padding:7px 18px;cursor:pointer;' +
      'font:600 13px/1.4 Outfit,sans-serif;letter-spacing:.1em;' +
      'transition:background .15s,opacity .15s;' +
      'opacity:.55}' +
    '.pb:hover{background:rgba(10,10,14,.88);opacity:1}' +
    /* jump overlay */
    '#prs-jump{position:fixed;z-index:100000;display:none;' +
      'background:rgba(10,10,14,.88);border:1px solid rgba(255,255,255,.18);' +
      'border-radius:10px;padding:8px 10px;gap:6px;align-items:center;' +
      'box-shadow:0 8px 32px rgba(0,0,0,.4)}' +
    '#prs-jump input{width:48px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);' +
      'border-radius:6px;color:#fff;font:700 15px/1 Outfit,sans-serif;' +
      'text-align:center;padding:5px 4px;outline:none}' +
    '#prs-jump span{color:rgba(255,255,255,.5);font:400 13px/1 Outfit,sans-serif}' +
    /* footer pg cursor — inside scaled slides */
    '.ftr .pg{cursor:pointer;user-select:none;' +
      'transition:color .15s}' +
    '.ftr .pg:hover{color:var(--red)!important}';
  document.head.appendChild(s);

  /* ── left: prev ── */
  var left = document.createElement('div');
  left.className = 'prs-side';
  left.innerHTML = '<button class="pb" id="pb-prev">&#8592; El&#337;z&#337;</button>';

  /* ── right: next + fullscreen ── */
  var right = document.createElement('div');
  right.className = 'prs-side';
  right.innerHTML =
    '<button class="pb" id="pb-next">K&#246;vetkez&#337; &#8594;</button>' +
    '<button class="pb" id="pb-fs">&#x26F6;</button>';

  var ui = document.createElement('div');
  ui.id = 'prs-ui';
  ui.appendChild(left);
  ui.appendChild(right);
  document.body.appendChild(ui);

  /* ── jump input overlay ── */
  jumpEl = document.createElement('div');
  jumpEl.id = 'prs-jump';
  jumpEl.innerHTML =
    '<input id="prs-jump-inp" type="number" min="1" max="' + total +
    '" placeholder="' + (current + 1) + '">' +
    '<span>/ ' + total + '</span>';
  document.body.appendChild(jumpEl);

  var jumpInp = document.getElementById('prs-jump-inp');
  jumpInp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var n = parseInt(jumpInp.value, 10);
      if (!isNaN(n) && n >= 1 && n <= total) go(n - 1);
      closeJump();
      e.preventDefault();
    }
    if (e.key === 'Escape') { closeJump(); e.preventDefault(); }
  });
  /* close on outside click */
  document.addEventListener('click', function (e) {
    if (jumpEl.style.display !== 'none' && !jumpEl.contains(e.target)) closeJump();
  }, true);

  /* ── wire footer .pg clicks ── */
  slides.forEach(function (slide) {
    var pg = slide.querySelector('.ftr .pg');
    if (!pg) return;
    pg.addEventListener('click', function (e) {
      e.stopPropagation();
      var rect = pg.getBoundingClientRect();
      openJump(rect);
    });
  });

  document.getElementById('pb-prev').addEventListener('click', function () { go(current - 1); });
  document.getElementById('pb-next').addEventListener('click', function () { go(current + 1); });
  document.getElementById('pb-fs').addEventListener('click', toggleFS);
}

/* ── init ──────────────────────────────────────────── */
function init() {
  stage  = document.querySelector('deck-stage');
  slides = Array.from(document.querySelectorAll('section.slide'));
  total  = slides.length;

  slides[0].classList.add('prs-on');

  rescale();
  window.addEventListener('resize', rescale);
  document.addEventListener('fullscreenchange', rescale);
  document.addEventListener('keydown', onKey);
  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchend',   onTouchEnd,   { passive: true });
  /* prevent native scroll; use wheel to navigate */
  document.addEventListener('wheel', function (e) {
    e.preventDefault();
    if (!jumpOpen) {
      if (e.deltaY > 0 || e.deltaX > 0) go(current + 1);
      else go(current - 1);
    }
  }, { passive: false });

  buildUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
