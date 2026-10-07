// 학생 화면: 로그인 없이 링크만으로 읽기 전용 결과 확인
import{mount}from'../../core/mount.js';
import{decode}from'../../core/share.js';
import{categories,checkpoints,weakest,COLORS,MAX}from'../../data/rubric.js';
import{lineChart,legend}from'../../ui/charts.js';

const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f1=v=>Number(Number(v).toFixed(2)).toString();
const sc=v=>v==null||v===''||!(Number(v)>=0&&Number(v)<=MAX)?null:Number(v);
const sum=a=>a.every(v=>v!=null)?a.reduce((x,y)=>x+y,0):null;

export async function renderMy(){
  const app=mount();
  app.innerHTML='<section class="page score-page"><p class="muted" style="padding:40px 0">결과를 불러오는 중…</p></section>';
  let p,rs;
  try{
    p=await decode(new URLSearchParams(location.hash.split('?')[1]||'').get('d'));
    rs=(p.r||[]).filter(r=>/^\d{4}-\d{2}-\d{2}$/.test(r.d)).map(r=>({d:r.d,s:[0,1,2,3].map(k=>sc((r.s||[])[k])),f:Array.isArray(r.f)?r.f.map(String):null}));
    if(p.v!==1||!rs.length)throw 0;
  }catch{
    app.innerHTML='<section class="page score-page"><a class="score-back" href="#/">← 홈</a><header class="score-heading"><h1>링크를 열 수 없어요</h1><p class="muted">링크가 끝까지 복사되지 않았거나 손상된 것 같아요. 선생님께 링크를 다시 받아 주세요.</p></header></section>';return;
  }
  const cps=checkpoints(),avg=p.a||{};
  let i=rs.length-1;
  const $=s=>app.querySelector(s);
  function draw(){
    const r=rs[i],prev=rs[i-1],tot=sum(r.s),ca=avg[r.d]||[],weak=weakest(r.s,2);
    const series=categories.map((c,k)=>({name:c.name,color:COLORS[k],values:rs.map(x=>x.s[k])}));
    const cp=cps.find(c=>c.date===r.d);
    app.querySelector('section').innerHTML=`
     <header class="score-heading"><span class="eyebrow">KTC SIMULATION · 내 결과</span><h1>${esc(p.n)}</h1><p class="muted">읽기 전용 · ${esc(p.g||'')} 기준 · 로그인 없이 볼 수 있어요</p></header>
     <div class="chips" aria-label="평가일 선택">${rs.map((x,j)=>`<button class="chip ${j===i?'on':''}" data-i="${j}">${+x.d.slice(5,7)}/${+x.d.slice(8)}</button>`).join('')}</div>
     <div class="my-total"><div><span class="muted">${r.d}${cp?` · ${esc(cp.short)}`:''}</span><strong>${tot!=null?f1(tot):'—'} <small>/ 40</small></strong></div>${tot!=null&&ca.length&&ca.every(v=>v!=null)?`<div><span class="muted">반 평균</span><strong>${f1(ca.reduce((a,b)=>a+b,0))}</strong></div>`:''}</div>
     <div class="my-rows">${categories.map((c,k)=>{const v=r.s[k],a=ca[k],pv=prev?prev.s[k]:null,d=v!=null&&pv!=null?v-pv:null;
       return`<section class="my-row"><div class="my-top"><h3>${esc(c.name)}</h3><strong>${v==null?'—':f1(v)}<small>/ ${MAX}</small></strong></div>
        <div class="bar2" role="img" aria-label="${esc(c.name)} ${v==null?'점수 없음':f1(v)}점${a!=null?', 반 평균 '+f1(a)+'점':''}"><i style="width:${v==null?0:v/MAX*100}%;background:${COLORS[k]}"></i>${a!=null?`<b style="left:${a/MAX*100}%" title="반 평균 ${f1(a)}"></b>`:''}</div>
        <p class="muted small">${c.items.map(esc).join(' · ')}${a!=null?` · 반 평균 ${f1(a)}`:''}${d!=null?` · 지난 평가 대비 <span class="${d>0?'up':d<0?'down':''}">${d>0?'▲':d<0?'▼':'='} ${f1(Math.abs(d))}</span>`:''}</p>
        <p class="student-feedback">${r.f?esc(r.f[k]||'피드백 없음'):'<span class="muted">이전 평가의 피드백은 링크에 담기지 않아요.</span>'}</p></section>`}).join('')}</div>
     ${new Set(rs.map(x=>x.d)).size>1?`<div class="card" style="margin-top:14px"><h3 style="margin:0 0 6px">점수 추이</h3>${lineChart({xs:rs.map(x=>x.d),series,marks:cps.map(c=>({date:c.date,label:c.short.split(' ')[0]}))})}${legend(series)}</div>`:''}
     ${weak.length?`<div class="card" style="margin-top:14px"><h3 style="margin:0 0 8px">다음 연습 포인트</h3>${weak.map(k=>`<div class="tip"><b>${esc(categories[k].name)}</b><p class="muted">${esc(categories[k].tip)}</p><div class="row">${categories[k].links.map(l=>`<a class="btn alt" href="${l[1]}">${l[0]}</a>`).join('')}</div></div>`).join('')}</div>`:''}
     <p class="notice">이 링크에는 ${esc(p.n)} 커플의 결과만 담겨 있어요. 새 평가가 있으면 선생님이 새 링크를 보내드려요.</p>`;
  }
  app.addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(b){i=+b.dataset.i;draw()}});
  draw();
}
