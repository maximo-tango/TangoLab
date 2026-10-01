const drills=[
  ['Axis & Balance','중심축을 유지하면서 몸의 무게를 안정적으로 옮기는 연습','Weight transfer','Balance','Leader frame'],
  ['Walking Path','보폭과 방향을 정리해 리더의 의도와 팔로워의 반응을 맞추기','Walk','Direction','Connection'],
  ['Pivot & Turn','회전 시 축을 잃지 않고 체중을 안정적으로 이동시키기','Pivot','Turn','Timing'],
  ['Cross & Change','교차 이동과 몸의 전환을 통해 공간을 바꾸기','Cross','Change','Direction'],
  ['Sacada & Space','공간을 활용해 센스를 살리고 파트너와 균형 잡기','Sacada','Space','Control'],
  ['Floorcraft','Ronda 안에서 상대 커플을 고려하며 움직임을 정리하기','Navigation','Respect','Connection']
];

export function renderStepLab(){
  document.querySelector('#app').innerHTML=`
    <section class="page">
      <div class="hero" style="padding:35px 0 20px">
        <span class="eyebrow">DANCE LAB</span>
        <h1 style="font-size:clamp(2.4rem,6vw,4.8rem)">Step Lab</h1>
        <p class="muted">아르헨티나 탱고에서 스텝은 기술이 아니라 축 · 연결 · 공간의 이해를 바탕으로 구성됩니다.</p>
      </div>
      <div class="grid2">
        <div class="card">
          <h3>핵심 활용 방식</h3>
          <p class="muted">매 수업 전 10~15분은 축과 체중 이동, 팔로워의 반응, 리더의 공간 감각을 점검하는 시간으로 활용하면 좋습니다.</p>
        </div>
        <div class="card">
          <h3>수업에서의 활용</h3>
          <p class="muted">Walk · Axis · Pivot · Sacada · Floorcraft 순으로 연습하면서, 한 가지 요소를 반복하고 음악과 연결해 점검하는 방식이 가장 효과적입니다.</p>
        </div>
      </div>
      <div class="grid" style="margin-top:18px">
        ${drills.map(d=>`<div class="card tool"><h3>${d[0]}</h3><p class="muted">${d[1]}</p><div class="tags">${d.slice(2).map(x=>`<span class="tag">${x}</span>`).join('')}</div></div>`).join('')}
      </div>
    </section>
  `;
}
