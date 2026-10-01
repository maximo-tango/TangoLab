import{save,load}from'../../core/storage.js';

const weeks=[
  ['Foundation','기초 자세 · 축 · 연결감',['Axis','Weight','Connection']],
  ['Walk & Embrace','보폭 · 리더/팔로워 연결 · 공감',['Walk','Frame','Embrace']],
  ['Musicality I','Phrase · Pause · Beat 감각',['Phrase','Pause','Beat']],
  ['Musicality II','Texture · Dynamics · Musicality',['Texture','Dynamics','Cadence']],
  ['Connection','타이밍 · 공간 · 리액션',['Timing','Space','Response']],
  ['Giro & Pivot','회전 구조와 축 유지',['Giro','Pivot','Axis']],
  ['Ochos & Turns','오초 · 회전 · 선회 표현',['Ochos','Turns','Balance']],
  ['Sacada & Crossing','십자 이동 · 공간 활용',['Sacada','Crossing','Direction']],
  ['Colgadas & Changes','리더 읽기 · 몸의 전환',['Colgada','Change','Control']],
  ['Ronda & Floorcraft','바닥 활용 · 주변 커플 배려',['Ronda','Floorcraft','Navigation']],
  ['Simulation I','실전 시나리오 연습',['Entrance','Dance','Exit']],
  ['Simulation II','피드백 수정 · 완성도 향상',['Feedback','Correction','Consistency']],
  ['Final Rehearsal','최종 리허설 · 컨디션 관리',['Final','Confidence','Ronda']]
];

export function renderCompetition(){
  const s=load('competition-checks',{});
  const total=39;
  const done=Object.values(s).filter(Boolean).length;
  const p=Math.round((done/total)*100);

  document.querySelector('#app').innerHTML=`
    <section class="page">
      <div class="hero" style="padding:35px 0 20px">
        <span class="eyebrow">COMPETITION PLANNER</span>
        <h1 style="font-size:clamp(2.4rem,6vw,4.8rem)">KTC Preparation</h1>
        <p class="muted">13주 커리큘럼 · 주차별 포커스 · 개인 체크리스트</p>
      </div>
      <div class="stats">
        <div class="stat"><span>주차</span><strong>13</strong></div>
        <div class="stat"><span>체크 완료</span><strong id="done">${done}</strong></div>
        <div class="stat"><span>진행률</span><strong id="pct">${p}%</strong></div>
        <div class="stat"><span>Final</span><strong>대회</strong></div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="progress"><div class="bar" id="bar" style="width:${p}%"></div></div>
      </div>
      <div>
        ${weeks.map((w,i)=>`<div class="week"><div class="wno">W${String(i+1).padStart(2,'0')}</div><div><h3>${w[0]}</h3><p class="muted">${w[1]}</p><div class="tags">${w[2].map(x=>`<span class="tag">${x}</span>`).join('')}</div><div class="checks">${w[2].map((x,j)=>{const k=`${i+1}-${j}`;return `<label class="check"><input type="checkbox" data-k="${k}" ${s[k]?'checked':''}>${x}</label>`}).join('')}</div></div></div>`).join('')}
      </div>
    </section>
  `;

  document.querySelectorAll('[data-k]').forEach(x=>x.onchange=()=>{
    const n=load('competition-checks',{});
    n[x.dataset.k]=x.checked;
    save('competition-checks',n);
    const d=Object.values(n).filter(Boolean).length;
    const q=Math.round((d/total)*100);
    document.querySelector('#done').textContent=d;
    document.querySelector('#pct').textContent=q+'%';
    document.querySelector('#bar').style.width=q+'%';
  });
}
