(function () {
'use strict';

/* ── constants ─────────────────────────────────────── */
var W = 1920, H = 1080;
var PANEL_W = 360; /* notes panel width in px */

/* ── state ─────────────────────────────────────────── */
var stage, slides, total, current = 0, busy = false;
var jumpEl = null;
var jumpOpen = false;
var notesOpen = false;

/* ── scale-to-fit ──────────────────────────────────── */
function rescale() {
  var availW = innerWidth - (notesOpen ? PANEL_W : 0);
  var s = Math.min(availW / W, innerHeight / H);
  var x = Math.round((availW - W * s) / 2);
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

/* ── sync counter + notes on slide change ───────────── */
function syncUI() {
  var ctr = document.getElementById('pb-ctr');
  if (ctr) ctr.textContent = pad2(current + 1) + ' / ' + pad2(total);
  updateNotes();
}

function pad2(n) { return n < 10 ? '0' + n : '' + n; }

/* ── notes panel ───────────────────────────────────── */
function toggleNotes() {
  notesOpen = !notesOpen;
  var panel = document.getElementById('prs-notes');
  var btn   = document.getElementById('pb-notes');
  if (panel) panel.classList.toggle('prs-notes-open', notesOpen);
  if (btn)   btn.style.opacity = notesOpen ? '1' : '';

  /* animate the deck-stage shrink/grow */
  stage.style.transition = 'transform .35s cubic-bezier(.4,0,.2,1)';
  rescale();
  stage.addEventListener('transitionend', function h() {
    stage.style.transition = '';
    stage.removeEventListener('transitionend', h);
  });

  if (notesOpen) updateNotes();
}

function updateNotes() {
  var body = document.getElementById('prs-notes-body');
  var title = document.getElementById('prs-notes-title');
  if (!body || !title) return;
  var label = slides[current] ? (slides[current].dataset.label || String(current + 1)) : '';
  title.textContent = 'Dia ' + (current + 1) + ' / ' + total;
  var notes = (window.DECK_NOTES && window.DECK_NOTES[label]) || '';
  if (notes) {
    body.innerHTML = notes;
  } else {
    body.innerHTML = '<span style="opacity:.35;font-style:italic">Ehhez a diához nincs megjegyzés.</span>';
  }
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
    case 'n': case 'N': toggleNotes(); break;
  }
}

/* ── touch / swipe ─────────────────────────────────── */
var _tx = 0;
function onTouchStart(e) { _tx = e.touches[0].clientX; }
function onTouchEnd(e) {
  var dx = e.changedTouches[0].clientX - _tx;
  if (Math.abs(dx) > 48) { dx < 0 ? go(current + 1) : go(current - 1); }
}

/* ── jump overlay ──────────────────────────────────── */
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
    '@media print{#prs-ui,#prs-notes{display:none!important}}' +
    /* nav bar */
    '#prs-ui{position:fixed;bottom:0;left:0;right:0;z-index:99999;' +
      'display:flex;justify-content:space-between;align-items:flex-end;' +
      'padding:0 0 14px 0;pointer-events:none}' +
    '.prs-side{display:flex;gap:8px;padding:0 20px;pointer-events:auto}' +
    '.pb{background:rgba(10,10,14,.55);border:1px solid rgba(255,255,255,.15);color:#fff;' +
      'border-radius:8px;padding:7px 18px;cursor:pointer;' +
      'font:600 13px/1.4 Outfit,sans-serif;letter-spacing:.1em;' +
      'transition:background .15s,opacity .15s;opacity:.55}' +
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
    /* footer pg */
    '.ftr .pg{cursor:pointer;user-select:none;transition:color .15s}' +
    '.ftr .pg:hover{color:var(--red)!important}' +
    /* notes panel */
    '#prs-notes{position:fixed;right:0;top:0;bottom:0;width:' + PANEL_W + 'px;' +
      'background:rgba(12,12,18,.96);border-left:1px solid rgba(255,255,255,.1);' +
      'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);' +
      'transform:translateX(100%);transition:transform .35s cubic-bezier(.4,0,.2,1);' +
      'z-index:99998;display:flex;flex-direction:column;overflow:hidden;pointer-events:auto}' +
    '#prs-notes.prs-notes-open{transform:translateX(0)}' +
    '#prs-notes-hdr{padding:18px 18px 14px;' +
      'border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0;' +
      'display:flex;justify-content:space-between;align-items:center}' +
    '#prs-notes-title{font:700 11px/1 Outfit,sans-serif;letter-spacing:.14em;' +
      'text-transform:uppercase;color:rgba(255,255,255,.4)}' +
    '#prs-notes-close{background:none;border:none;color:rgba(255,255,255,.4);' +
      'cursor:pointer;font-size:18px;line-height:1;padding:2px 4px;' +
      'transition:color .15s}' +
    '#prs-notes-close:hover{color:#fff}' +
    '#prs-notes-body{flex:1;overflow-y:auto;padding:20px 18px;' +
      'font:400 14px/1.7 Outfit,sans-serif;color:rgba(255,255,255,.82);' +
      'word-break:break-word}' +
    '#prs-notes-body::-webkit-scrollbar{width:3px}' +
    '#prs-notes-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:2px}' +
    '#prs-notes-body h3{font:700 13px/1.3 Outfit,sans-serif;color:rgba(212,32,54,.9);' +
      'text-transform:uppercase;letter-spacing:.1em;margin:0 0 10px}' +
    '#prs-notes-body ul{margin:6px 0 12px;padding-left:18px}' +
    '#prs-notes-body li{margin:4px 0}' +
    '#prs-notes-body p{margin:0 0 10px}' +
    '#prs-notes-body strong{color:#fff;font-weight:600}';
  document.head.appendChild(s);

  /* ── notes panel DOM ── */
  var notesPanel = document.createElement('div');
  notesPanel.id = 'prs-notes';
  notesPanel.innerHTML =
    '<div id="prs-notes-hdr">' +
      '<span id="prs-notes-title">Dia 1 / ' + total + '</span>' +
      '<button id="prs-notes-close" title="Bezárás">&#x2715;</button>' +
    '</div>' +
    '<div id="prs-notes-body"></div>';
  document.body.appendChild(notesPanel);
  document.getElementById('prs-notes-close').addEventListener('click', toggleNotes);

  /* ── left: notes + prev ── */
  var left = document.createElement('div');
  left.className = 'prs-side';
  left.innerHTML =
    '<button class="pb" id="pb-notes" title="Megjegyzések (N)">' +
      '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="vertical-align:middle;margin-right:5px">' +
        '<rect x="1" y="1" width="12" height="9" rx="2" stroke="currentColor" stroke-width="1.4"/>' +
        '<path d="M4 11.5 L4 13 L6.5 11.5" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" fill="none"/>' +
        '<line x1="3.5" y1="4.5" x2="10.5" y2="4.5" stroke="currentColor" stroke-width="1.2"/>' +
        '<line x1="3.5" y1="6.5" x2="8.5" y2="6.5" stroke="currentColor" stroke-width="1.2"/>' +
      '</svg>' +
      'Notes' +
    '</button>' +
    '<button class="pb" id="pb-prev">&#8592; El&#337;z&#337;</button>';

  /* ── center: clickable counter ── */
  var mid = document.createElement('div');
  mid.className = 'prs-side';
  mid.innerHTML = '<button class="pb" id="pb-ctr" title="Ugrás diára">01 / ' + total + '</button>';

  /* ── right: next + fullscreen ── */
  var right = document.createElement('div');
  right.className = 'prs-side';
  right.innerHTML =
    '<button class="pb" id="pb-next">K&#246;vetkez&#337; &#8594;</button>' +
    '<button class="pb" id="pb-fs">&#x26F6;</button>';

  var ui = document.createElement('div');
  ui.id = 'prs-ui';
  ui.appendChild(left);
  ui.appendChild(mid);
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
  document.addEventListener('click', function (e) {
    if (jumpEl.style.display !== 'none' && !jumpEl.contains(e.target)) closeJump();
  }, true);

  /* ── footer .pg click → jump ── */
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
  document.getElementById('pb-notes').addEventListener('click', toggleNotes);
  document.getElementById('pb-ctr').addEventListener('click', function () {
    var rect = this.getBoundingClientRect();
    openJump(rect);
  });
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
