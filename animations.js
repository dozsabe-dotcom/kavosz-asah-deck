(function(){
'use strict';

/* ── helpers ── */
function D(fn,ms){ return setTimeout(fn,ms); }
function clearAll(arr){ arr.forEach(function(id){ clearTimeout(id); }); arr.length=0; }

function _set(el,o,tx){
  el.style.opacity=o;
  el.style.transform=tx||'';
  el.style.transition='none';
}

function fadeUp(el,ms,ids){
  if(!el) return;
  _set(el,'0','translateY(16px)');
  ids.push(D(function(){
    el.style.transition='opacity .38s ease,transform .38s ease';
    el.style.opacity='1';
    el.style.transform='none';
  },ms));
}

function fadeIn(el,ms,ids){
  if(!el) return;
  _set(el,'0','');
  ids.push(D(function(){
    el.style.transition='opacity .38s ease';
    el.style.opacity='1';
  },ms));
}

function growLine(el,ms,ids){
  if(!el) return;
  el.style.transformOrigin='left';
  el.style.transform='scaleX(0)';
  el.style.transition='none';
  ids.push(D(function(){
    el.style.transition='transform .5s ease';
    el.style.transform='scaleX(1)';
  },ms));
}

function staggerUp(els,base,step,ids){
  Array.from(els).forEach(function(el,i){ fadeUp(el,base+i*(step||70),ids); });
}
function staggerIn(els,base,step,ids){
  Array.from(els).forEach(function(el,i){ fadeIn(el,base+i*(step||70),ids); });
}

function staggerChecks(s,base,ids){
  var items=Array.from(s.querySelectorAll('.checks li'));
  items.forEach(function(li,i){
    li.style.opacity='0';
    li.style.transform='translateX(-8px)';
    li.style.transition='none';
    ids.push(D(function(){
      li.style.transition='opacity .28s ease,transform .28s ease';
      li.style.opacity='1';
      li.style.transform='none';
      li.classList.add('chk-in');
    },base+i*60));
  });
}

function countUp(el,to,dur){
  if(!el) return;
  var suf=el.dataset.suffix||'';
  var t0=performance.now();
  (function tick(now){
    var p=Math.min((now-t0)/dur,1), e=1-Math.pow(1-p,3);
    el.textContent=(to*e).toFixed(1)+suf;
    if(p<1) requestAnimationFrame(tick);
  })(t0);
}

/* First child after h1 inside .stage that is a div/p but not body-wrap */
function findSub(s){
  var stage=s.querySelector('.stage');
  if(!stage) return null;
  var kids=Array.from(stage.children);
  var hi=kids.findIndex(function(k){ return k.tagName==='H1'; });
  if(hi<0||hi+1>=kids.length) return null;
  var n=kids[hi+1];
  return (n&&(n.tagName==='DIV'||n.tagName==='P')&&!n.classList.contains('body-wrap')&&!n.classList.contains('eyebrow'))?n:null;
}

/* Content header: eyebrow → h1 → subtitle. Returns next free ms. */
function hdr(s,base,ids){
  base=base||0;
  var ew=s.querySelector('.eyebrow');
  var h1=s.querySelector('h1');
  var sub=findSub(s);
  fadeUp(ew,base,ids);
  fadeUp(h1,base+80,ids);
  if(sub) fadeUp(sub,base+160,ids);
  return base+(sub?260:180);
}

/* Divider header: eyebrow → h1 → [year] → line → lead */
function divHdr(s,ids){
  var ew=s.querySelector('.eyebrow');
  var h1=s.querySelector('h1');
  var ln=s.querySelector('.divider-line');
  var ld=s.querySelector('.lead');
  var yr=s.querySelector('[style*=":31px"][style*="font-weight:600"][style*=",255,255"]');
  fadeUp(ew,0,ids);
  fadeUp(h1,100,ids);
  if(yr) fadeUp(yr,200,ids);
  growLine(ln,240,ids);
  if(ld) fadeUp(ld,380,ids);
}

/* Slide bar segments (proportional strip): find the row of colored bars */
function animBar(s,base,gap,ids){
  var bar=s.querySelector('[style*="align-items:flex-start"][style*="gap:1px"]');
  if(!bar) return;
  Array.from(bar.children).forEach(function(seg,i){
    seg.style.opacity='0';
    seg.style.transform='translateY(14px)';
    seg.style.transition='none';
    ids.push(D(function(){
      seg.style.transition='opacity .3s ease,transform .3s ease';
      seg.style.opacity='1';
      seg.style.transform='none';
    },base+i*(gap||35)));
  });
}

/* ── per-slide animation functions ── */
var A=[];

/* 01 – Cím / DIVIDER */
A[0]=function(s,ids){ divHdr(s,ids); };

/* 02 – Küldetésünk */
A[1]=function(s,ids){
  var t=hdr(s,0,ids);
  staggerUp(s.querySelectorAll('.glass-strong'),t,90,ids);
  fadeUp(s.querySelector('.quoteblk'),t+200,ids);
};

/* 03 – Agenda */
A[2]=function(s,ids){
  var t=hdr(s,0,ids);
  staggerUp(s.querySelectorAll('.glass-strong'),t+40,90,ids);
};

/* 04 – 1. FEJEZET */
A[3]=function(s,ids){ divHdr(s,ids); };

/* 05 – Rendszer korlátja */
A[4]=function(s,ids){
  var t=hdr(s,0,ids);
  fadeUp(s.querySelector('.quoteblk'),t,ids);
  staggerUp(s.querySelectorAll('.glass-strong'),t+80,80,ids);
};

/* 06 – Input → Szűrő → Output */
A[5]=function(s,ids){
  var t=hdr(s,0,ids);
  staggerIn(s.querySelectorAll('[style*="border-radius:30px"]'),t,60,ids);
  var bw=s.querySelector('.body-wrap');
  if(bw){
    var kids=Array.from(bw.children);
    if(kids[0]){
      kids[0].style.opacity='0'; kids[0].style.transform='translateX(-20px)'; kids[0].style.transition='none';
      ids.push(D(function(){ kids[0].style.transition='opacity .4s ease,transform .4s ease'; kids[0].style.opacity='1'; kids[0].style.transform='none'; },t+80));
    }
    fadeIn(kids[1],t+170,ids);
    if(kids[2]){
      kids[2].style.opacity='0'; kids[2].style.transform='translateX(20px)'; kids[2].style.transition='none';
      ids.push(D(function(){ kids[2].style.transition='opacity .4s ease,transform .4s ease'; kids[2].style.opacity='1'; kids[2].style.transform='none'; },t+210));
    }
  }
  fadeUp(s.querySelector('[style*="font-style:italic"]'),t+360,ids);
};

/* 07 – Következmény → Megoldás → Eredmény */
A[6]=function(s,ids){
  var t=hdr(s,0,ids);
  var cols=Array.from(s.querySelectorAll('.glass-strong'));
  var arrs=Array.from(s.querySelectorAll('[data-szuro]'));
  [cols[0],arrs[0],cols[1],arrs[1],cols[2]].forEach(function(el,i){
    if(!el) return;
    if(i%2===0) fadeUp(el,t+i*90,ids);
    else fadeIn(el,t+i*90,ids);
  });
};

/* 08 – Alap stratégia (2 top cards + 4 steps) */
A[7]=function(s,ids){
  var t=hdr(s,0,ids);
  var all=Array.from(s.querySelectorAll('.glass-strong'));
  var steps=all.slice(-4), tops=all.slice(0,all.length-4);
  staggerUp(tops,t,70,ids);
  var arrs=Array.from(s.querySelectorAll('[data-szuro]'));
  steps.forEach(function(el,i){
    fadeUp(el,t+160+i*90,ids);
    if(arrs[i]) fadeIn(arrs[i],t+210+i*90,ids);
  });
  fadeUp(s.querySelector('.quoteblk'),t+580,ids);
};

/* 09 – 2. FEJEZET */
A[8]=function(s,ids){ divHdr(s,ids); };

/* 10 – Munkaprofil elemzés */
A[9]=function(s,ids){
  var t=hdr(s,0,ids);
  staggerUp(s.querySelectorAll('.glass-strong'),t,80,ids);
};

/* 11 – Munkavállalói profilalkotás */
A[10]=function(s,ids){
  var t=hdr(s,0,ids);
  staggerUp(s.querySelectorAll('.glass-strong'),t,80,ids);
};

/* 12 – 3. FEJEZET */
A[11]=function(s,ids){ divHdr(s,ids); };

/* 13–16 – Chart slides */
function chartSlide(s,ids){
  var t=hdr(s,0,ids);
  staggerUp(s.querySelectorAll('.glass-strong'),t+80,70,ids);
}
A[12]=A[13]=A[14]=A[15]=chartSlide;

/* 17 – Elsődleges feladatok (prop bar + cards) */
A[16]=function(s,ids){
  var t=hdr(s,0,ids);
  animBar(s,t,35,ids);
  staggerUp(s.querySelectorAll('.glass-strong'),t+180,60,ids);
};

/* 18 – Operatív / Portfólió (prop bar + cards) */
A[17]=function(s,ids){
  var t=hdr(s,0,ids);
  animBar(s,t,45,ids);
  staggerUp(s.querySelectorAll('.glass-strong'),t+200,60,ids);
};

/* 19–20 – Chart slides */
A[18]=A[19]=chartSlide;

/* 21 – Kompetencia kritériumok */
A[20]=function(s,ids){
  var t=hdr(s,0,ids);
  fadeUp(s.querySelector('.glass-strong'),t,ids);
  var grid=s.querySelector('[style*="grid-template-columns:1fr 1fr"]');
  if(grid){
    Array.from(grid.children).forEach(function(el,i){
      el.style.opacity='0'; el.style.transform='translateY(12px)'; el.style.transition='none';
      ids.push(D(function(){ el.style.transition='opacity .3s ease,transform .3s ease'; el.style.opacity='1'; el.style.transform='none'; },t+80+i*40));
    });
  }
};

/* 22 – Kompetencia eredmények */
A[21]=function(s,ids){
  var t=hdr(s,0,ids);
  staggerUp(s.querySelectorAll('.glass-strong'),t,80,ids);
};

/* 23–24 – Hőtérképek */
function heatmap(s,ids){
  var t=hdr(s,0,ids);
  Array.from(s.querySelectorAll('.htable tbody tr')).forEach(function(el,i){
    el.style.opacity='0'; el.style.transition='none';
    ids.push(D(function(){ el.style.transition='opacity .32s ease'; el.style.opacity='1'; },t+60+i*55));
  });
  fadeUp(s.querySelector('[style*="rgba(212,32,54,.05)"][style*="border-radius:10px"]'),t+60,ids);
  staggerUp(s.querySelectorAll('.glass-strong'),t+400,70,ids);
}
A[22]=A[23]=heatmap;

/* 25 – 4. FEJEZET */
A[24]=function(s,ids){ divHdr(s,ids); };

/* 26 – Jövőkép (left red + separator + right blue) */
A[25]=function(s,ids){
  var t=hdr(s,0,ids);
  fadeIn(s.querySelector('[style*="margin-top:14px"][style*="margin-bottom:6px"]'),t,ids);
  var bw=s.querySelector('.body-wrap');
  if(bw){
    var kids=Array.from(bw.children);
    if(kids[0]){
      kids[0].style.opacity='0'; kids[0].style.transform='translateX(-20px)'; kids[0].style.transition='none';
      ids.push(D(function(){ kids[0].style.transition='opacity .4s ease,transform .4s ease'; kids[0].style.opacity='1'; kids[0].style.transform='none'; },t+80));
    }
    fadeIn(kids[1],t+160,ids);
    if(kids[2]){
      kids[2].style.opacity='0'; kids[2].style.transform='translateX(20px)'; kids[2].style.transition='none';
      ids.push(D(function(){ kids[2].style.transition='opacity .4s ease,transform .4s ease'; kids[2].style.opacity='1'; kids[2].style.transform='none'; },t+200));
    }
  }
  fadeUp(s.querySelector('.quoteblk'),t+380,ids);
};

/* 27 – Szervezeti struktúra */
A[26]=function(s,ids){
  var t=hdr(s,0,ids);
  var rel=s.querySelector('[style*="position:relative"][style*="min-height:0"]');
  if(rel) staggerIn(rel.children,t,70,ids);
  fadeUp(s.querySelector('.quoteblk'),t+600,ids);
};

/* 28 – Fő kihívások + timeline */
A[27]=function(s,ids){
  var t=hdr(s,0,ids);
  var cols=Array.from(s.querySelectorAll('.glass-strong'));
  fadeUp(cols[0],t,ids);
  fadeUp(cols[1],t+60,ids);
  if(cols[2]){
    fadeIn(cols[2],t+120,ids);
    var tl=cols[2].querySelector('[data-timeline]');
    if(tl){
      Array.from(tl.children).forEach(function(item,i){
        var circ=item.querySelector('[style*="border-radius:50%"]');
        var txt=item.querySelector('[style*="padding-top:8px"]');
        if(circ){
          circ.style.opacity='0'; circ.style.transform='scale(.6)'; circ.style.transition='none';
          ids.push(D(function(){ circ.style.transition='opacity .3s ease,transform .3s ease'; circ.style.opacity='1'; circ.style.transform='none'; },t+200+i*110));
        }
        if(txt){
          txt.style.opacity='0'; txt.style.transition='none';
          ids.push(D(function(){ txt.style.transition='opacity .3s ease'; txt.style.opacity='1'; },t+240+i*110));
        }
      });
    }
  }
};

/* 29–31 – Numbered cards */
function numCards(s,ids){
  var t=hdr(s,0,ids);
  fadeUp(s.querySelector('.quoteblk'),t,ids);
  var cards=s.querySelectorAll('.glass-strong');
  staggerUp(cards,t+80,80,ids);
  fadeUp(s.querySelector('[style*="font-style:italic"][style*="border-radius:8px"]'),t+80+cards.length*80+40,ids);
}
A[28]=A[29]=A[30]=numCards;

/* 32–34 – Roadmap tables */
function roadmap(s,ids){
  var t=hdr(s,0,ids);
  staggerUp(s.querySelectorAll('.glass-strong'),t,90,ids);
}
A[31]=A[32]=A[33]=roadmap;

/* 35 – SVG Életpálya (ring arcs → circles → lines → text) */
A[34]=function(s,ids){
  var t=hdr(s,0,ids);
  var svg=s.querySelector('svg');
  if(!svg) return;
  var ring=svg.querySelector('#ring');
  var paths=ring?Array.from(ring.querySelectorAll('path')):[];
  var circles=Array.from(svg.querySelectorAll('circle'));
  var lines=Array.from(svg.querySelectorAll('line'));
  var texts=Array.from(svg.querySelectorAll('text'));
  [].concat(paths,circles,lines,texts).forEach(function(el){ el.style.opacity='0'; el.style.transition='none'; });
  paths.forEach(function(el,i){ ids.push(D(function(){ el.style.transition='opacity .4s ease'; el.style.opacity='1'; },t+i*80)); });
  var off=t+paths.length*80+80;
  circles.forEach(function(el,i){ ids.push(D(function(){ el.style.transition='opacity .3s ease'; el.style.opacity='1'; },off+i*28)); });
  off+=circles.length*28+60;
  lines.forEach(function(el,i){ ids.push(D(function(){ el.style.transition='opacity .3s ease'; el.style.opacity='1'; },off+i*22)); });
  off+=lines.length*22+50;
  texts.forEach(function(el,i){ ids.push(D(function(){ el.style.transition='opacity .25s ease'; el.style.opacity='1'; },off+i*18)); });
};

/* 36 – Stratégiai ajánlások */
A[35]=function(s,ids){
  var t=hdr(s,0,ids);
  fadeUp(s.querySelector('table'),t,ids);
  fadeUp(s.querySelector('.quoteblk'),t+120,ids);
};

/* 37 – 5. FEJEZET */
A[36]=function(s,ids){ divHdr(s,ids); };

/* 38 – Összegzés (Venn + count-up + right column) */
A[37]=function(s,ids){
  var t=hdr(s,0,ids);
  var venn=s.querySelector('svg');
  if(venn){
    var ells=Array.from(venn.querySelectorAll('ellipse'));
    ells.forEach(function(el){ el.style.opacity='0'; el.style.transition='none'; });
    ells.forEach(function(el,i){ ids.push(D(function(){ el.style.transition='opacity .5s ease'; el.style.opacity='1'; },t+i*120)); });
  }
  var rc=s.querySelector('[style*="padding-top:4px"]');
  if(rc) staggerUp(rc.children,t+80,120,ids);
  var cu=s.querySelector('.anim-count');
  if(cu){
    var to=parseFloat(cu.dataset.to);
    ids.push(D(function(){ countUp(cu,to,1200); },t+180));
    ids.push(D(function(){
      cu.style.animation='lHeartbeat .6s ease';
      var hbId=D(function(){ cu.style.animation=''; },700);
      ids.push(hbId);
    },t+180+1200+50));
  }
  fadeUp(s.querySelector('blockquote'),t+380,ids);
};

/* 39 – Híd (step-row → glass-dark cards → quotes) */
A[38]=function(s,ids){
  var t=hdr(s,0,ids);
  var sr=s.querySelector('[data-step-row]');
  if(sr){
    Array.from(sr.children).forEach(function(el,i){
      el.style.opacity='0'; el.style.transform='translateY(14px)'; el.style.transition='none';
      ids.push(D(function(){ el.style.transition='opacity .35s ease,transform .35s ease'; el.style.opacity='1'; el.style.transform='none'; },t+i*70));
    });
  }
  staggerUp(s.querySelectorAll('.glass-dark'),t+300,70,ids);
  Array.from(s.querySelectorAll('.quoteblk')).forEach(function(el,i){ fadeUp(el,t+500+i*60,ids); });
};

/* 40 – Hozzáadott érték (top cols + bottom row + quote) */
A[39]=function(s,ids){
  var t=hdr(s,0,ids);
  staggerUp(s.querySelectorAll('[style*="flex:1;display:flex;flex-direction:column"]'),t,70,ids);
  var br=s.querySelector('[data-bottom-row]');
  if(br) staggerUp(br.querySelectorAll('.glass-dark'),t+240,80,ids);
  fadeUp(s.querySelector('.quoteblk'),t+420,ids);
};

/* 41 – Köszönjük */
A[40]=function(s,ids){
  fadeUp(s.querySelector('h1'),0,ids);
  fadeUp(s.querySelector('.anim-quote'),150,ids);
  fadeUp(s.querySelector('.glass-dark'),350,ids);
};

/* ── MutationObserver per slide ── */
var slides=Array.from(document.querySelectorAll('section.slide'));

slides.forEach(function(slide,idx){
  var ids=[];
  var wasOn=slide.classList.contains('prs-on');

  /* Slide 0 is already prs-on before this script runs */
  if(idx===0&&wasOn){
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        if(A[idx]) A[idx](slide,ids);
        staggerChecks(slide,380,ids);
      });
    });
  }

  new MutationObserver(function(){
    var isOn=slide.classList.contains('prs-on');
    if(isOn&&!wasOn){
      wasOn=true;
      ids.push(D(function(){
        if(A[idx]) A[idx](slide,ids);
        staggerChecks(slide,380,ids);
      },80));
    } else if(!isOn&&wasOn){
      wasOn=false;
      clearAll(ids);
      /* reset check animation classes */
      Array.from(slide.querySelectorAll('.checks li.chk-in')).forEach(function(li){
        li.classList.remove('chk-in');
      });
    }
  }).observe(slide,{attributes:true,attributeFilter:['class']});
});

})();
