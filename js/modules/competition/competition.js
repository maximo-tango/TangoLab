import{mount}from'../../core/mount.js';
import{KTC_DATE}from'../../config.js';
import{sections,sessions,sec,today,current}from'../../data/curriculum.js';

const esc=s=>String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=d=>{const x=new Date(d+'T00:00');return `${x.getMonth()+1}/${x.getDate()} (${'일월화수목금토'[x.getDay()]})`};
const dd=d=>Math.round((new Date(d+'T00:00')-new Date(today()+'T00:00'))/864e5);
const total=sessions.reduce((a,s)=>a+sec(s.s).drills.length,0);

export function renderCompetition(){
  const cur=current(),T=today();
  const isDone=s=>new Date(s.date+'T00:00') < new Date(T+'T00:00');
  const done=sessions.filter(isDone).reduce((a,s)=>a+sec(s.s).drills.length,0);
  const sdone=s=>isDone(s);
  const dday=dd(KTC_DATE);
  const app=mount();
  app.innerHTML=`<section class="page">
  <div class="hero" style="padding:35px 0 20px"><span class="eyebrow">COMPETITION PLANNER</span>
  <h1 style="font-size:clamp(2.4rem,6vw,4.8rem)">KTC 피스타<br><span class="gold">대회준비반</span></h1>
  <p class="muted">5구간 · 13회 · 중간 점검 3회 — 2026.11.15 ~ 2027.02.21</p>
  <a class="score-entry" href="#/competition-score">커플별 시뮬레이션 평가 <span aria-hidden="true">→</span></a></div>
  <div class="stats">
   <div class="stat"><span>KTC 대회까지</span><strong>${dday>0?'D-'+dday:dday===0?'D-DAY':'종료'}</strong></div>
   <div class="stat"><span>다음 수업</span><strong>${cur.n}회 · ${fmt(cur.date).split(' ')[0]}</strong></div>
   <div class="stat"><span>완료한 회차</span><strong id="sd">0 / 13</strong></div>
   <div class="stat"><span>체크 진행률</span><strong id="pct">0%</strong></div></div>
  <div class="card" style="margin-top:14px"><div class="progress"><div class="bar" id="bar"></div></div></div>
  ${sections.map(c=>{const ss=sessions.filter(s=>s.s===c.no);return `
  <div class="sechead"><span class="secno">${c.no}구간</span><div><h2>${esc(c.focus)}</h2><p class="muted" style="margin:2px 0 0">${esc(c.tech)}</p></div></div>
  ${ss.map(s=>{const past=s.date<T,isCur=s.n===cur.n;const complete=isDone(s);return `
  <div class="week ${isCur?'cur':''}" id="s${s.n}"><div class="wno">${String(s.n).padStart(2,'0')}<small>${s.label?'4시간':'회'}</small></div>
   <div><div class="row" style="justify-content:space-between"><h3 style="margin:0">${fmt(s.date)}${isCur?' <span class="badge">다음 수업</span>':past?' <span class="badge dim">지남</span>':''}</h3>${s.check?`<span class="chk">${esc(s.check)}</span>`:''}</div>
   <div class="checks">${c.drills.map((x,i)=>`<label class="check"><input type="checkbox" disabled ${complete?'checked':''}>${esc(x)}</label>`).join('')}</div>
  </div></div>`}).join('')}`}).join('')}
  </section>`;

  const p=Math.round(done/total*100);
  app.querySelector('#pct').textContent=p+'%';app.querySelector('#bar').style.width=p+'%';
  app.querySelector('#sd').textContent=sessions.filter(sdone).length+' / '+sessions.length;
  const el=app.querySelector('.week.cur');if(el&&T>=sessions[0].date)setTimeout(()=>el.scrollIntoView({block:'center',behavior:'smooth'}),150);
}
