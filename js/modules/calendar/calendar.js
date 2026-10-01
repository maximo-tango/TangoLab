import{mount}from'../../core/mount.js';
import{CALENDAR_ID,API_KEY,TZ}from'../../config.js';
import{loadCalendarMarkdown}from'../../data/classes.js';
import{sessions,sec,today}from'../../data/curriculum.js';

const CATS={competition:'KTC·대회',technique:'실전테크닉',essential:'에센셜',tanguera:'땅게라',training:'트레이닝·연습',practica:'쁘락',show:'공연·모임',off:'휴강',other:'기타'};
const classify=t=>/휴강/.test(t)?'off':/KTC|대회/.test(t)?'competition':/실전테크닉|테크닉/.test(t)?'technique':/에센셜|Essential/i.test(t)?'essential':/쁘락|프락|practica/i.test(t)?'practica':/땅게라|Tanguera/i.test(t)?'tanguera':/트레이닝|솔로|연습|Training/i.test(t)?'training':/공연|파티|정모/.test(t)?'show':'other';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const fallback=async()=>{
  const events=await loadCalendarMarkdown();
  return events.map(([date,title,time,cat])=>({date,time,title,cat:classify(title)==='other'?cat:classify(title)}));
};

const cache={};
async function load(from,to){
  const k=from+to;if(cache[k])return cache[k];
  if(!API_KEY)return cache[k]={ev:await fallback(),src:'local'};
  try{
    const u=`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&singleEvents=true&orderBy=startTime&maxResults=2500&timeZone=${encodeURIComponent(TZ)}&timeMin=${from}T00:00:00%2B09:00&timeMax=${to}T23:59:59%2B09:00`;
    const r=await fetch(u);if(!r.ok)throw new Error(r.status);
    const j=await r.json(),ev=[];
    (j.items||[]).forEach(e=>{
      if(e.status==='cancelled')return;
      const t=e.summary||'(제목 없음)',cat=classify(t);
      if(e.start.date){ // 종일 일정
        for(let d=new Date(e.start.date+'T00:00');ymd(d)<e.end.date;d.setDate(d.getDate()+1))ev.push({date:ymd(d),time:'',title:t,cat});
      }else ev.push({date:e.start.dateTime.slice(0,10),time:e.start.dateTime.slice(11,16),end:e.end.dateTime.slice(11,16),title:t,cat,link:e.htmlLink});
    });
    return cache[k]={ev,src:'google'};
  }catch(e){return cache[k]={ev:await fallback(),src:'error'}}
}

export function renderCalendar(){
  const now=new Date(),T=today();
  let y=now.getFullYear(),m=now.getMonth(),sel=T,hidden=new Set(),data={ev:[],src:''};
  const app=mount();
  app.innerHTML=`<section class="page"><div class="hero" style="padding:35px 0 14px"><span class="eyebrow">MAXIMO TANGO</span><h1 style="font-size:clamp(2.4rem,6vw,4.8rem)">수업 캘린더</h1><p class="muted" id="cal-src"></p></div>
  <div class="card"><div class="calhead"><div class="row"><button class="btn alt" id="prev" aria-label="이전 달">◀</button><strong id="ttl" style="font-size:20px;min-width:128px;text-align:center"></strong><button class="btn alt" id="next" aria-label="다음 달">▶</button></div><button class="btn" id="tod">오늘</button></div>
  <div class="filters" id="flt"></div><div class="calendar" id="grid"></div></div>
  <div class="card" id="detail" style="margin-top:14px"></div>
  <div class="notice"><a href="https://calendar.google.com/calendar/u/0?cid=${encodeURIComponent(btoa(CALENDAR_ID).replace(/=+$/,''))}" target="_blank" rel="noopener" style="color:var(--gold)">구글 캘린더에서 열기 ↗</a></div></section>`;
  const $=s=>app.querySelector(s);

  async function draw(){
    const first=new Date(y,m,1),start=new Date(y,m,1-first.getDay()),end=new Date(start);end.setDate(start.getDate()+41);
    $('#ttl').textContent=`${y}년 ${m+1}월`;
    data=await load(ymd(start),ymd(end));
    $('#cal-src').textContent=data.src==='google'?'구글 캘린더 일정이 실시간으로 반영됩니다.':data.src==='error'?'구글 캘린더를 불러오지 못해 저장된 수업 일정을 표시합니다.':'저장된 수업 일정을 표시합니다. (js/config.js에 API 키를 넣으면 구글 캘린더와 실시간 연동)';
    const used=[...new Set(data.ev.map(e=>e.cat))];
    $('#flt').innerHTML=used.map(c=>`<button class="filter ${hidden.has(c)?'':'active'}" data-c="${c}">${CATS[c]}</button>`).join('');
    const vis=data.ev.filter(e=>!hidden.has(e.cat)),by={};vis.forEach(e=>(by[e.date]=by[e.date]||[]).push(e));
    let h='<div class="wd">일</div><div class="wd">월</div><div class="wd">화</div><div class="wd">수</div><div class="wd">목</div><div class="wd">금</div><div class="wd">토</div>';
    for(let i=0;i<42;i++){
      const d=new Date(start);d.setDate(start.getDate()+i);const k=ymd(d),es=(by[k]||[]).sort((a,b)=>a.time.localeCompare(b.time));
      h+=`<div class="day ${d.getMonth()!==m?'other':''} ${k===T?'today':''} ${k===sel?'sel':''}" data-d="${k}" tabindex="0" role="button" aria-label="${k} 일정 ${es.length}개"><div class="num">${d.getDate()}</div>${es.slice(0,3).map(e=>`<div class="event ${e.cat}">${e.time?e.time+' ':''}${esc(e.title)}</div>`).join('')}${es.length>3?`<div class="more">+${es.length-3}</div>`:''}</div>`;
    }
    $('#grid').innerHTML=h;detail();
  }
  function detail(){
    const es=data.ev.filter(e=>e.date===sel&&!hidden.has(e.cat)).sort((a,b)=>a.time.localeCompare(b.time));
    const d=new Date(sel+'T00:00'),s=sessions.find(x=>x.date===sel);
    const wd='일월화수목금토'[d.getDay()];
    let h=`<h3 style="margin:0 0 10px">${d.getMonth()+1}월 ${d.getDate()}일 (${wd})${sel===T?' · 오늘':''}</h3>`;
    h+=es.length?es.map(e=>`<div class="evrow"><span class="dot ${e.cat}"></span><span class="evt">${e.time?e.time+(e.end?'–'+e.end:''):'종일'}</span><span>${e.link?`<a href="${e.link}" target="_blank" rel="noopener">${esc(e.title)}</a>`:esc(e.title)}</span><span class="tag">${CATS[e.cat]}</span></div>`).join(''):'<p class="muted" style="margin:0">이 날은 일정이 없어요.</p>';
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
}
