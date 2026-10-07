import{mount}from'../../core/mount.js';
import{KTC_DATE}from'../../config.js';
import{sec,today,current}from'../../data/curriculum.js';
import{loadCalendar,CATS}from'../../data/calendar.js';

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const c=(t,d,l)=>`<a class="card tool" href="${l}"><h3>${t}</h3><p class="muted">${d}</p><span class="arrow">→</span></a>`;
const dd=d=>Math.round((new Date(d+'T00:00')-new Date(today()+'T00:00'))/864e5);
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');

export function renderDashboard(){
  const cur=current(),s=sec(cur.s),left=dd(KTC_DATE),dl=dd(cur.date);
  const app=mount();
  app.innerHTML=`
    <div class="hero">
      <img class="hero-logo" src="assets/images/maximo-tango.png" alt="MAXIMO TANGO">
      <span class="eyebrow">MAXIMO TANGO LAB v0.5</span>
      <h1>Dance is<br><span class="gold">Musicality.</span></h1>
      <p class="muted">Dance · Music · Practice · Competition</p>
    </div>
    <section class="section">
      <a class="card next" href="#/competition">
        <span class="eyebrow">${left>0?`KTC 대회 D-${left}`:'KTC'} · 다음 수업</span>
        <h2 style="margin:6px 0 4px">${cur.n}회 · ${esc(s.focus)}</h2>
        <p class="muted" style="margin:0">${esc(s.tech)}${dl>=0?` · ${dl===0?'오늘':dl+'일 후'}`:''}${cur.check?` · ${esc(cur.check)}`:''}</p>
      </a>
    </section>
    <section class="section"><div class="card" id="week"><h3 style="margin:0 0 8px">이번 주 일정</h3><p class="muted" style="margin:0">불러오는 중…</p></div></section>
    <section class="section">
      <h2>Maximo Tango Lab</h2>
      <div class="grid">
        ${c('수업 캘린더','월간 달력으로 수업·공연 일정 확인','#/calendar')}
        ${c('Music Lab','파형 위에 프레이즈·쉼·마무리를 표시하며 음악 구조 학습','#/music')}
        ${c('Practice Lab','수업 회차별 연습 루틴 · 타이머 · 연습 기록','#/practice')}
        ${c('Rhythm Lab','밀롱가·발스 박자 트레이너 · 완급 전환 드릴','#/rhythm')}
        ${c('KTC 대회준비반','5구간 13회 커리큘럼 · 중간 점검 일정','#/competition')}
        ${c('커플 평가','점수 입력 · 추이 비교 · 학생 공유 링크','#/competition-score')}
      </div>
    </section>`;
  loadCalendar().then(ev=>{
    const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()+i);return ymd(d)});
    const rows=ev.filter(e=>days.includes(e.date)).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
    app.querySelector('#week').innerHTML=`<h3 style="margin:0 0 8px">이번 주 일정</h3>`+(rows.length?rows.slice(0,8).map(e=>{const d=new Date(e.date+'T00:00');return `<div class="evrow"><span class="dot ${e.cat}"></span><span class="evt">${d.getMonth()+1}/${d.getDate()} (${'일월화수목금토'[d.getDay()]}) ${e.cont?'':e.time}</span><span>${esc(e.title)}</span><span class="tag">${CATS[e.cat]}</span></div>`}).join('')+(rows.length>8?`<p class="muted" style="margin:8px 0 0">외 ${rows.length-8}개 · <a href="#/calendar" style="color:var(--gold)">캘린더에서 보기</a></p>`:''):'<p class="muted" style="margin:0">앞으로 7일 안에 일정이 없어요.</p>');
  }).catch(()=>{app.querySelector('#week').innerHTML='<h3 style="margin:0 0 8px">이번 주 일정</h3><p class="muted" style="margin:0">일정 파일을 불러오지 못했어요.</p>'});
}
