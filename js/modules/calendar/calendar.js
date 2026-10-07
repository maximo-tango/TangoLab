import{mount}from'../../core/mount.js';
import{loadCalendar,CATS}from'../../data/calendar.js';
import{sessions,sec,today}from'../../data/curriculum.js';

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());

export function renderCalendar(){
  const now=new Date(),T=today();
  let y=now.getFullYear(),m=now.getMonth(),sel=T,hidden=new Set(),ev=[];
  const app=mount();
  app.innerHTML=`<section class="page"><div class="hero" style="padding:35px 0 14px"><span class="eyebrow">MAXIMO TANGO</span><h1 style="font-size:clamp(2.4rem,6vw,4.8rem)">수업 캘린더</h1><p class="muted" id="cal-src">일정을 불러오는 중…</p></div>
  <div class="card"><div class="calhead"><div class="row"><button class="btn alt" id="prev" aria-label="이전 달">◀</button><strong id="ttl" style="font-size:20px;min-width:128px;text-align:center"></strong><button class="btn alt" id="next" aria-label="다음 달">▶</button></div><button class="btn" id="tod">오늘</button></div>
  <div class="filters" id="flt"></div><div class="calendar" id="grid"></div></div>
  <div class="card" id="detail" style="margin-top:14px"></div></section>`;
  const $=s=>app.querySelector(s);

  function draw(){
    const first=new Date(y,m,1),start=new Date(y,m,1-first.getDay());
    $('#ttl').textContent=`${y}년 ${m+1}월`;
    const used=[...new Set(ev.map(e=>e.cat))];
    $('#flt').innerHTML=used.map(c=>`<button class="filter ${hidden.has(c)?'':'active'}" data-c="${c}">${CATS[c]}</button>`).join('');
    const by={};ev.filter(e=>!hidden.has(e.cat)).forEach(e=>(by[e.date]=by[e.date]||[]).push(e));
    let h='<div class="wd">일</div><div class="wd">월</div><div class="wd">화</div><div class="wd">수</div><div class="wd">목</div><div class="wd">금</div><div class="wd">토</div>';
    for(let i=0;i<42;i++){
      const d=new Date(start);d.setDate(start.getDate()+i);const k=ymd(d),es=(by[k]||[]).sort((a,b)=>a.time.localeCompare(b.time));
      h+=`<div class="day ${d.getMonth()!==m?'other':''} ${k===T?'today':''} ${k===sel?'sel':''}" data-d="${k}" tabindex="0" role="button" aria-label="${k} 일정 ${es.length}개"><div class="num">${d.getDate()}</div>${es.slice(0,3).map(e=>`<div class="event ${e.cat}">${e.time?e.time+' ':''}${esc(e.title)}</div>`).join('')}${es.length>3?`<div class="more">+${es.length-3}</div>`:''}<div class="dots">${es.slice(0,6).map(e=>`<i class="dot ${e.cat}"></i>`).join('')}</div></div>`;
    }
    $('#grid').innerHTML=h;detail();
  }
  function detail(){
    const es=ev.filter(e=>e.date===sel&&!hidden.has(e.cat)).sort((a,b)=>a.time.localeCompare(b.time));
    const d=new Date(sel+'T00:00'),s=sessions.find(x=>x.date===sel);
    let h=`<h3 style="margin:0 0 10px">${d.getMonth()+1}월 ${d.getDate()}일 (${'일월화수목금토'[d.getDay()]})${sel===T?' · 오늘':''}</h3>`;
    h+=es.length?es.map(e=>`<div class="evrow"><span class="dot ${e.cat}"></span><span class="evt">${e.cont?'이어짐':e.time?e.time+(e.end?'–'+e.end:''):'종일'}</span><span>${esc(e.title)}</span><span class="tag">${CATS[e.cat]}</span></div>`).join(''):'<p class="muted" style="margin:0">이 날은 일정이 없어요.</p>';
    if(s){const c=sec(s.s);h+=`<a class="ktc-link" href="#/competition"><b>KTC ${s.n}회</b> · ${esc(c.focus)}<br><span class="muted">${esc(c.tech)}${s.check?' · '+esc(s.check):''}</span></a>`}
    $('#detail').innerHTML=h;
  }
  const go=n=>{m+=n;if(m<0){m=11;y--}if(m>11){m=0;y++}draw()};
  $('#prev').onclick=()=>go(-1);$('#next').onclick=()=>go(1);
  $('#tod').onclick=()=>{y=now.getFullYear();m=now.getMonth();sel=T;draw()};
  app.addEventListener('click',e=>{
    const f=e.target.closest('[data-c]');if(f){hidden.has(f.dataset.c)?hidden.delete(f.dataset.c):hidden.add(f.dataset.c);draw();return}
    const d=e.target.closest('[data-d]');if(d){sel=d.dataset.d;app.querySelectorAll('.day').forEach(x=>x.classList.toggle('sel',x===d));detail()}
  });
  app.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset.d)e.target.click()});
  draw();
  loadCalendar().then(e=>{ev=e;$('#cal-src').textContent=`수업 일정 ${new Set(e.map(x=>x.date)).size}일 · 일정 파일(calendar.md) 기준`;draw()})
    .catch(()=>{$('#cal-src').textContent='일정 파일(calendar.md)을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.'});
}
