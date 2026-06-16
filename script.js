/**
 * Week11_Session3_Lab.js
 * Mini-Project: The Complete Landing Page
 */
(function(){
'use strict';

const PFX='wk11s3v2_';
const PHASES={
  1:{total:6,  bar:'p1-fill',lbl:'p1-label',dot:'dot-1',nc:'nc-1',bn:'banner-1'},
  2:{total:14, bar:'p2-fill',lbl:'p2-label',dot:'dot-2',nc:'nc-2',bn:'banner-2'},
  3:{total:6,  bar:'p3-fill',lbl:'p3-label',dot:'dot-3',nc:'nc-3',bn:'banner-3'},
  4:{total:4,  bar:'p4-fill',lbl:'p4-label',dot:'dot-4',nc:'nc-4',bn:'banner-4'},
};
const TOTAL=Object.values(PHASES).reduce((s,p)=>s+p.total,0);
const pkeys={1:[],2:[],3:[],4:[]};

/* ── localStorage ── */
const sv=(k,v)=>{try{v?localStorage.setItem(PFX+k,'1'):localStorage.removeItem(PFX+k);}catch(e){}};
const ld=k=>{try{return localStorage.getItem(PFX+k)==='1';}catch(e){return false;}};
function clrAll(){try{const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(PFX))ks.push(k);}ks.forEach(k=>localStorage.removeItem(k));}catch(e){}}

/* ── progress ── */
function cnt(ph){return pkeys[ph].filter(k=>{const e=document.getElementById(k);return e&&e.checked;}).length;}
function upd(){
  let tot=0;
  Object.keys(PHASES).forEach(n=>{
    const ph=+n,cfg=PHASES[ph],done=cnt(ph);
    tot+=done;
    const pct=cfg.total>0?Math.round(done/cfg.total*100):0;
    const b=document.getElementById(cfg.bar);if(b)b.style.width=pct+'%';
    const l=document.getElementById(cfg.lbl);if(l)l.textContent=done+' / '+cfg.total+' steps';
    const d=document.getElementById(cfg.dot);
    if(d){d.className='pdot';if(done===cfg.total&&cfg.total>0)d.classList.add('is-complete');else if(done>0)d.classList.add('is-partial');}
    const nc=document.getElementById(cfg.nc);if(nc)nc.textContent=done+'/'+cfg.total;
    banner(ph,done,cfg.total);
  });
  const opct=TOTAL>0?Math.round(tot/TOTAL*100):0;
  const ob=document.getElementById('overall-fill');if(ob)ob.style.width=opct+'%';
  const ot=document.getElementById('overall-track');if(ot)ot.setAttribute('aria-valuenow',opct);
  const oc=document.getElementById('overall-count');if(oc)oc.textContent=tot+' / '+TOTAL+' steps';
  updWireframe();
  if(tot===TOTAL&&TOTAL>0){const o=document.getElementById('session-overlay');if(o)o.hidden=false;}
}
function banner(ph,done,total){
  const b=document.getElementById('banner-'+ph);if(!b)return;
  if(done===total&&total>0&&b.hidden){b.hidden=false;b.scrollIntoView({behavior:'smooth',block:'nearest'});}
  else if(done<total)b.hidden=true;
}

/* ── wireframe highlights ── */
function updWireframe(){
  const active=new Set();
  document.querySelectorAll('.step-cb:checked').forEach(cb=>{
    const wf=cb.dataset.wf;if(wf)active.add(wf);
  });
  document.querySelectorAll('.wf-row').forEach(r=>r.classList.toggle('wf-active',active.has(r.id)));
}

/* ── checkboxes ── */
function initCbs(){
  document.querySelectorAll('.step-cb').forEach(cb=>{
    const key=cb.dataset.key,ph=+cb.dataset.phase;
    if(!key||!ph)return;
    if(pkeys[ph])pkeys[ph].push(key);
    cb.checked=ld(key);
    cb.addEventListener('change',function(){sv(key,this.checked);upd();});
  });
}

/* ── phase nav ── */
function initNav(){
  const secs=document.querySelectorAll('.phase-section');if(!secs.length)return;
  const btns=document.querySelectorAll('.pnav-btn');
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){const ph=e.target.dataset.phase;btns.forEach(b=>b.classList.toggle('is-active',b.dataset.phase===ph));}});
  },{rootMargin:'-30% 0px -60% 0px',threshold:0});
  secs.forEach(s=>obs.observe(s));
  // smooth scroll
  btns.forEach(btn=>btn.addEventListener('click',e=>{
    const t=document.querySelector(btn.getAttribute('href'));
    if(t){e.preventDefault();const nh=(document.getElementById('phase-nav')||{}).offsetHeight||0;
      window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-nh-12,behavior:'smooth'});}
  }));
}

/* ── hero demo ── */
window.setHeroBg=function(c){const p=document.querySelector('.hero-preview');if(p)p.style.background=c;};

/* ── hover demo tabs ── */
window.showTab=function(tab,btn){
  document.querySelectorAll('.hdr-tab').forEach(t=>t.classList.remove('hdr-tab--active'));
  btn.classList.add('hdr-tab--active');
  ['block','css'].forEach(t=>{const e=document.getElementById('hdc-'+t);if(e)e.hidden=(t!==tab);});
};

/* ── copy code ── */
window.copyCode=function(id){
  const el=document.getElementById(id);if(!el)return;
  const txt=el.textContent||el.innerText;
  navigator.clipboard.writeText(txt.trim()).then(()=>{
    const btn=el.parentElement?.querySelector('.copy-btn');
    if(btn){const o=btn.textContent;btn.textContent='Copied!';btn.style.background='#10B981';btn.style.color='#000';
      setTimeout(()=>{btn.textContent=o;btn.style.background='';btn.style.color='';},1500);}
  }).catch(()=>{
    const r=document.createRange();r.selectNode(el);
    window.getSelection()?.removeAllRanges();window.getSelection()?.addRange(r);
    document.execCommand('copy');window.getSelection()?.removeAllRanges();
  });
};

/* ── reset ── */
window.resetAll=function(){
  if(!confirm('Reset all progress?'))return;
  clrAll();
  document.querySelectorAll('.step-cb').forEach(cb=>cb.checked=false);
  document.querySelectorAll('.phase-banner').forEach(b=>b.hidden=true);
  const o=document.getElementById('session-overlay');if(o)o.hidden=true;
  document.querySelectorAll('.wf-row').forEach(r=>r.classList.remove('wf-active'));
  upd();
  window.scrollTo({top:0,behavior:'smooth'});
};

/* ── init ── */
document.addEventListener('DOMContentLoaded',()=>{
  initCbs();upd();initNav();
  // keyboard labels
  document.querySelectorAll('.step-lbl').forEach(l=>{
    l.setAttribute('tabindex','0');l.setAttribute('role','checkbox');
    l.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();const cb=l.querySelector('.step-cb');if(cb){cb.checked=!cb.checked;cb.dispatchEvent(new Event('change'));}}
    });
  });
  console.info('[Lab] Week 11 · Session 3 — Total steps:',TOTAL);
});
})();
