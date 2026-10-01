const c=(t,d,l,external=false)=>external
  ? `<a class="card tool" href="${l}"><h3>${t}</h3><p class="muted">${d}</p><span class="arrow">↗</span></a>`
  : `<a class="card tool" href="${l}"><h3>${t}</h3><p class="muted">${d}</p><span class="arrow">→</span></a>`;

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
        ${c('수업 캘린더','정규 수업 · 트레이닝 · KTC 준비 · 휴강','#/calendar')}
        ${c('Music Lab','음악을 듣고 분석하는 공간','#/music')}
        ${c('Tango Waveform Lab','파형 · 쉼 · 프레이즈를 직접 표시하고 학습','waveform/',true)}
        ${c('Step Lab','리더와 팔로워의 공간을 시각화','#/step-lab')}
        ${c('Musicality Trainer','Walk · Pause · Texture 미션','#/musicality')}
        ${c('Practica','Ronda Timer와 실전 연습','#/practica')}
        ${c('Competition Planner','13주 대회 준비를 관리','#/competition')}
        ${c('Training','개인 연습 기록과 루틴 관리','#/training')}
      </div>
    </section>`;
}
