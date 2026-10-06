import{mount,onLeave}from'../../core/mount.js';
const PRE={milonga:{n:'밀롱가 (빠른 템포)',meter:2,bpm:120},vals:{n:'발스 (3연음)',meter:3,bpm:165},tango:{n:'탱고',meter:4,bpm:120}};
const PH={norm:{n:'정박',c:'#78b68a'},half:{n:'반박',c:'#77a7d4'},pause:{n:'빠우사',c:'#c85c42'}};
let ac=null,sch=null,raf=null;

export function renderRhythm(){
  let bpm=120,meter=2,mode='basic',rand=false,run=false,q=[],next=0,pos=0,left=0,ph='norm',lastShown='';
  const app=mount();
  app.innerHTML=`<section class="page"><div class="hero" style="padding:35px 0 20px"><span class="eyebrow">RHYTHM LAB</span>
  <h1 style="font-size:clamp(2.4rem,6vw,4.8rem)">박자 트레이너</h1>
  <p class="muted">밀롱가·발스·탱고의 박을 몸에 익히고, 완급 전환(정박 ↔ 반박 ↔ 4박 빠우사)을 반복 훈련합니다.</p></div>
  <div class="grid2"><div class="card"><h3 style="margin:0 0 10px">설정</h3>
   <div class="filters" id="pre">${Object.entries(PRE).map(([k,p])=>`<button class="filter" data-p="${k}">${p.n}</button>`).join('')}</div>
   <div class="row" style="margin:6px 0"><span class="muted" style="min-width:48px">BPM</span><button class="btn alt" id="bm">−</button><strong id="bv" style="min-width:44px;text-align:center;font-size:22px"></strong><button class="btn alt" id="bp">+</button><input type="range" id="bs" min="40" max="220" style="flex:1;min-width:120px;accent-color:var(--gold)" aria-label="BPM"></div>
   <div class="row" style="margin:10px 0"><span class="muted" style="min-width:48px">박자</span>${[2,3,4].map(n=>`<button class="filter" data-m="${n}">${n}박</button>`).join('')}</div>
   <div class="row" style="margin:10px 0"><span class="muted" style="min-width:48px">모드</span><button class="filter" data-mode="basic">기본 메트로놈</button><button class="filter" data-mode="drill">완급 전환 드릴</button></div>
   <label class="check" id="rw" style="margin-top:8px"><input type="checkbox" id="rd">다음 구간을 무작위로 (실전처럼 예측 불가)</label>
   <p class="muted" style="font-size:13px;margin:12px 0 0" id="hint"></p></div>
  <div class="card" style="text-align:center"><div id="pl" class="rphase">준비</div><div class="rdots" id="dots"></div><div class="bigtime" id="rb" style="font-size:56px">♩</div>
   <div class="row" style="justify-content:center;margin-top:12px"><button class="btn" id="go">시작</button></div></div></div></section>`;
  const $=s=>app.querySelector(s);

  function ui(){
    $('#bv').textContent=bpm;$('#bs').value=bpm;
    app.querySelectorAll('[data-p]').forEach(b=>b.classList.toggle('active',PRE[b.dataset.p].meter===meter&&PRE[b.dataset.p].bpm===bpm));
    app.querySelectorAll('[data-m]').forEach(b=>b.classList.toggle('active',+b.dataset.m===meter));
    app.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
    $('#rw').style.display=mode==='drill'?'flex':'none';
    $('#hint').textContent=mode==='drill'?'정박 2마디 → 반박 2마디(박 사이에 보조 소리) → 빠우사 4박(소리 없음, 멈춤) 순서로 돌아요. 빠우사가 끝나는 첫 박은 강한 소리로 "폭발"을 알려줘요.':'프리셋은 시작값이에요. 연습할 곡의 BPM에 맞춰 조절하세요.';
    $('#dots').innerHTML=[...Array(meter)].map(()=>'<span class="rdot"></span>').join('');
  }
  const click=(t,f,v)=>{const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.07);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.08)};
  function pick(){
    if(mode!=='drill'){ph='norm';left=meter;return}
    const o=['norm','half','pause'].filter(x=>x!==ph);ph=rand?o[Math.random()*o.length|0]:({norm:'half',half:'pause',pause:'norm'})[ph];
    left=ph==='pause'?4:meter*2;pos=0;
  }
  function step(){
    const d=60/bpm;
    let boom = false;
    if(left<=0){const was=ph;pick();boom=was==='pause'&&ph!=='pause';}
    const acc=pos===0;
    if(ph!=='pause'){
      const freq = (acc || boom) ? 1100 : 760;
      const gain = (acc || boom) ? 0.35 : 0.22;
      click(next,freq,gain);
      if(ph==='half')click(next+d/2,520,.1)
    }
    q.push({t:next,pos,ph,acc});pos=(pos+1)%meter;left--;next+=d;
  }
  function frame(){
    const t=ac.currentTime;let cur=null;while(q.length&&q[0].t<=t)cur=q.shift();
    if(cur){$('#pl').textContent=mode==='drill'?PH[cur.ph].n:PRE_name();$('#pl').style.color=mode==='drill'?PH[cur.ph].c:'var(--gold)';
      app.querySelectorAll('.rdot').forEach((e,i)=>e.classList.toggle('on',i===cur.pos&&cur.ph!=='pause'));
      $('#rb').textContent=cur.ph==='pause'?'■':'♩';$('#rb').style.color=cur.ph==='pause'?'var(--red)':cur.acc?'var(--gold)':'var(--text)'}
    raf=requestAnimationFrame(frame);
  }
  const PRE_name=()=>meter+'박 · '+bpm+' BPM';
  function start(){
    ac=ac||new(window.AudioContext||window.webkitAudioContext)();ac.resume();
    q=[];pos=0;left=0;ph=mode==='drill'?'pause':'norm';next=ac.currentTime+.1;run=true;
    sch=setInterval(()=>{while(next<ac.currentTime+.12)step()},25);raf=requestAnimationFrame(frame);$('#go').textContent='정지';
  }
  function stop(){run=false;clearInterval(sch);cancelAnimationFrame(raf);q=[];$('#go').textContent='시작';$('#pl').textContent='준비';$('#pl').style.color='';app.querySelectorAll('.rdot').forEach(e=>e.classList.remove('on'));$('#rb').textContent='♩';$('#rb').style.color=''}
  const set=()=>{ui();if(run){stop();start()}};
  $('#go').onclick=()=>run?stop():start();
  $('#bm').onclick=()=>{bpm=Math.max(40,bpm-1);ui()};$('#bp').onclick=()=>{bpm=Math.min(220,bpm+1);ui()};
  $('#bs').oninput=e=>{bpm=+e.target.value;ui()};
  $('#rd').onchange=e=>{rand=e.target.checked};
  app.addEventListener('click',e=>{
    const p=e.target.closest('[data-p]'),m=e.target.closest('[data-m]'),d=e.target.closest('[data-mode]');
    if(p){meter=PRE[p.dataset.p].meter;bpm=PRE[p.dataset.p].bpm;set()}
    if(m){meter=+m.dataset.m;set()}if(d){mode=d.dataset.mode;set()}
  });
  onLeave(()=>{clearInterval(sch);cancelAnimationFrame(raf)});
  ui();
}
