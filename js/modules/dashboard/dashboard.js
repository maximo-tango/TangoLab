import{KTC_DATE}from'../../config.js';
import{sessions,sec,today,current}from'../../data/curriculum.js';

const c=(t,d,l)=>`<a class="card tool" href="${l}"><h3>${t}</h3><p class="muted">${d}</p><span class="arrow">→</span></a>`;
const dd=d=>Math.round((new Date(d+'T00:00')-new Date(today()+'T00:00'))/864e5);

export function renderDashboard(){
  const cur=current(),s=sec(cur.s),started=today()>=sessions[0].date,left=dd(KTC_DATE);
  const dl=dd(cur.date);
  document.querySelector('#app').innerHTML=`
    <div class="hero">
      <img class="hero-logo" src="assets/images/maximo-tango.png" alt="MAXIMO TANGO">
      <span class="eyebrow">MAXIMO TANGO LAB v0.4</span>
      <h1>Dance is<br><span class="gold">Musicality.</span></h1>
      <p class="muted">Dance · Music · Practice · Competition</p>
    </div>
    <section class="section">
      <a class="card next" href="#/competition">
        <span class="eyebrow">${left>0?`KTC 대회 D-${left}`:'KTC'} · 다음 수업</span>
        <h2 style="margin:6px 0 4px">${cur.n}회 · ${s.focus}</h2>
        <p class="muted" style="margin:0">${s.tech}${dl>=0?` · ${dl===0?'오늘':dl+'일 후'}`:''}${cur.check?` · ${cur.check}`:''}</p>
      </a>
    </section>
    <section class="section">
      <h2>Maximo Tango Lab</h2>
      <div class="grid">
        ${c('수업 캘린더','구글 캘린더 일정을 한눈에 · 오늘 기준','#/calendar')}
        ${c('Music Lab','파형 위에 프레이즈·쉼·마무리를 표시하며 음악 구조 학습','#/music')}
        ${c('Practice Lab','수업 회차별 연습 루틴 · 타이머 · 연습 기록','#/practice')}
        ${c('Rhythm Lab','밀롱가·발스 박자 트레이너 · 완급 전환 드릴','#/rhythm')}
        ${c('KTC 대회준비반','5구간 13회 커리큘럼 · 체크리스트 · 중간 점검','#/competition')}
      </div>
    </section>`;
}
