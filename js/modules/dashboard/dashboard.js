const c=(t,d,l)=>`<a class="card tool" href="${l}"><h3>${t}</h3><p class="muted">${d}</p><span class="arrow">→</span></a>`;

export function renderDashboard(){
  document.querySelector('#app').innerHTML=`
    <div class="hero">
      <img class="hero-logo" src="assets/images/maximo-tango.png" alt="MAXIMO TANGO">
      <span class="eyebrow">MAXIMO TANGO LAB v0.3</span>
      <h1>Dance is<br><span class="gold">Musicality.</span></h1>
      <p class="muted">Dance · Music · Practice · Competition</p>
    </div>
    <section class="section">
      <h2>Maximo Tango Lab</h2>
      <div class="grid">
        ${c('수업 캘린더','Google Calendar 기반 강습 일정','#/calendar')}
        ${c('Music Lab','음악을 듣고 감상하며 구조를 파악','#/music')}
        ${c('Tango Waveform Lab','파형과 프레이즈를 분석해 학습','#/waveform')}
        ${c('Step Lab','축 · 몸의 연결 · 전환을 실습하는 기초 실험실','#/step-lab')}
        ${c('Musicality Trainer','Walk · Pause · Texture · Phrase 연습','#/musicality')}
        ${c('Competition Planner','13주 KTC 준비 커리큘럼 관리','#/competition')}
      </div>
    </section>
  `;
}