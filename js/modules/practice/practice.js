import{save,load}from'../../core/storage.js';
import{mount,onLeave}from'../../core/mount.js';
import{sessions,sec,current,today}from'../../data/curriculum.js';

const K='practice-log',esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const mmss=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
let timer=null,ac=null;
const beep=(f=880,d=.18)=>{try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.15;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}};

export function renderPractice(){
  let log=load(K,{}),si=sessions.indexOf(current()),blocks=[],idx=0,rem=0,run=false,last=0,pending=0;
  const app=mount();
  app.innerHTML=`<section class="page"><div class="hero" style="padding:35px 0 20px"><span class="eyebrow">PRACTICE LAB</span>
  <h1 style="font-size:clamp(2.4rem,6vw,4.8rem)">오늘의 연습</h1>
  <p class="muted">KTC 회차의 훈련 포인트로 연습 루틴을 만들고, 타이머로 진행하며 연습 시간을 기록합니다.</p></div>
  <div class="grid2"><div class="card"><div class="row" style="justify-content:space-between"><button class="btn alt" id="ps" aria-label="이전 회차">◀</button><div style="text-align:center"><strong id="pt" style="font-size:18px"></strong><div class="muted" id="pf"></div></div><button class="btn alt" id="pn" aria-label="다음 회차">▶</button></div>
   <div id="plan" style="margin-top:14px"></div><p class="muted" style="margin:10px 0 0;font-size:13px" id="tot"></p>
   <p class="muted" style="font-size:13px" id="rl"></p></div>
  <div class="card" style="text-align:center"><div class="muted" id="bn">준비</div><div class="bigtime" id="clk">0:00</div><div class="progress"><div class="bar" id="bb"></div></div>
   <div class="row" style="justify-content:center;margin-top:16px"><button class="btn" id="go">시작</button><button class="btn alt" id="sk">다음 블록</button><button class="btn alt" id="rs">처음으로</button></div>
   <p class="muted" id="nx" style="margin:12px 0 0;font-size:13px"></p></div></div>
  <div class="card" style="margin-top:14px"><h3 style="margin:0 0 4px">연습 기록</h3><p class="muted" id="sum" style="margin:0 0 12px"></p><div class="plog" id="plog"></div></div></section>`;
  const $=s=>app.querySelector(s);

  function build(){
    const s=sessions[si],c=sec(s.s);
    $('#pt').textContent=`${s.n}회 · ${+s.date.slice(5,7)}/${+s.date.slice(8)}`;$('#pf').textContent=c.focus;
    blocks=[{t:'워밍업',m:5},...c.drills.map(x=>({t:x,m:8})),{t:'정리 · 복습',m:5}];
    idx=0;rem=blocks[0].m*6e4;run=false;
    $('#plan').innerHTML=blocks.map((b,i)=>`<div class="pblk" data-i="${i}"><span class="pn">${i+1}</span><span class="pnm">${esc(b.t)}</span><input class="input pmin" type="number" min="1" max="60" value="${b.m}" data-i="${i}" aria-label="분"><span class="muted">분</span></div>`).join('');
    $('#rl').innerHTML=s.s<=3?'<a href="#/rhythm" style="color:var(--gold)">리듬 랩에서 박자 감각 먼저 잡기 →</a>':'';
    sync();
  }
  function sync(){
    const tot=blocks.reduce((a,b)=>a+b.m,0);$('#tot').textContent=`총 ${tot}분 · 블록 ${blocks.length}개`;
    const b=blocks[idx];$('#bn').textContent=b?`${idx+1}/${blocks.length} · ${b.t}`:'완료';
    $('#clk').textContent=b?mmss(rem):'0:00';$('#bb').style.width=b?(100-rem/(b.m*6e4)*100)+'%':'100%';
    $('#nx').textContent=blocks[idx+1]?'다음: '+blocks[idx+1].t:b?'마지막 블록':'';
    $('#go').textContent=run?'일시정지':b?'시작':'완료';
    app.querySelectorAll('.pblk').forEach((e,i)=>e.classList.toggle('on',i===idx));
  }
  function flush(draw=true){if(pending>0){const k=today();log[k]=(log[k]||0)+pending;pending=0;save(K,log);if(draw)chart()}}
  function tick(){
    if(!run)return;const n=Date.now(),dt=n-last;last=n;rem-=dt;pending+=dt;
    if(rem<=0){beep(660,.3);idx++;if(idx>=blocks.length){run=false;flush();beep(990,.5);sync();return}rem=blocks[idx].m*6e4;flush()}
    sync();
  }
  function chart(){
    const days=[...Array(14)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-13+i);return ymd(d)});
    const mins=days.map(k=>Math.round((log[k]||0)/6e4)),mx=Math.max(30,...mins);
    $('#plog').innerHTML=days.map((k,i)=>`<div class="pcol" title="${k} ${mins[i]}분"><div class="pbar" style="height:${mins[i]/mx*100}%"></div><small>${+k.slice(8)}</small></div>`).join('');
    let streak=0;const d=new Date();if(!log[ymd(d)])d.setDate(d.getDate()-1);while(log[ymd(d)]>=6e4){streak++;d.setDate(d.getDate()-1)}
    $('#sum').textContent=`최근 7일 ${mins.slice(7).reduce((a,b)=>a+b,0)}분 · 연속 ${streak}일 · 오늘 ${mins[13]}분`;
  }
  $('#go').onclick=()=>{if(!blocks[idx])return;run=!run;last=Date.now();if(run)beep(880,.1);else flush();sync()};
  $('#sk').onclick=()=>{if(idx<blocks.length){flush();idx++;rem=blocks[idx]?blocks[idx].m*6e4:0;if(!blocks[idx])run=false;sync()}};
  $('#rs').onclick=()=>{flush();idx=0;rem=blocks[0].m*6e4;run=false;sync()};
  $('#ps').onclick=()=>{flush();si=Math.max(0,si-1);build()};$('#pn').onclick=()=>{flush();si=Math.min(sessions.length-1,si+1);build()};
  app.addEventListener('input',e=>{const i=e.target.dataset.i;if(e.target.classList.contains('pmin')&&i!=null){blocks[i].m=Math.max(1,Math.min(60,+e.target.value||1));if(+i===idx&&!run)rem=blocks[idx].m*6e4;sync()}});
  timer=setInterval(tick,250);
  onLeave(()=>{flush(false);clearInterval(timer)});
  build();chart();
}
