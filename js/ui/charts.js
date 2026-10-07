const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const day=d=>Math.round(new Date(d+'T00:00Z')/864e5);
export const dayNo=day;
// xs: 날짜(YYYY-MM-DD) 배열, series:[{name,color,values:[num|null]}], marks:[{date,label}]
export function lineChart({xs,series,marks=[],max=10,h=240}){
  const W=480,L=32,R=16,T=18,B=30,w=W-L-R,hh=h-T-B,n=xs.map(day),lo=Math.min(...n),hi=Math.max(...n),span=hi-lo;
  const X=v=>L+(span?(v-lo)/span*w:w/2),Y=v=>T+hh-(v/max)*hh;
  let s=`<svg class="chart" viewBox="0 0 ${W} ${h}" role="img" aria-label="점수 추이 그래프 (${xs.length}회 평가)">`;
  [0,max/2,max].forEach(v=>{s+=`<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" class="cg"/><text x="${L-6}" y="${Y(v)+4}" class="ct" text-anchor="end">${v}</text>`});
  marks.filter(m=>{const k=day(m.date);return span&&k>=lo&&k<=hi}).forEach(m=>{const x=X(day(m.date));const end=x>W-R-70;s+=`<line x1="${x}" x2="${x}" y1="${T}" y2="${T+hh}" class="cm"/><text x="${end?x-3:x+3}" y="${T+10}" class="cl" text-anchor="${end?'end':'start'}">${esc(m.label)}</text>`});
  series.forEach(se=>{
    let pts=[],segs=[];se.values.forEach((v,i)=>{if(v==null||v===''){if(pts.length)segs.push(pts);pts=[]}else pts.push([X(n[i]),Y(Number(v))])});if(pts.length)segs.push(pts);
    segs.forEach(p=>{if(p.length>1)s+=`<polyline points="${p.map(q=>q.join(',')).join(' ')}" fill="none" style="stroke:${se.color}" stroke-width="2.5" stroke-linejoin="round"/>`;p.forEach(q=>s+=`<circle cx="${q[0]}" cy="${q[1]}" r="4" style="fill:${se.color}"/>`)});
  });
  const step=xs.length>8?2:1;
  xs.forEach((d,i)=>{if(i%step===0||i===xs.length-1)s+=`<text x="${X(n[i])}" y="${h-10}" class="ct" text-anchor="middle">${+d.slice(5,7)}/${+d.slice(8)}</text>`});
  return s+'</svg>';
}
export const legend=series=>`<div class="legend">${series.map(s=>`<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>`;
