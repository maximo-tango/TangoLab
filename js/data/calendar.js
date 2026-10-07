// 수업 일정은 calendar.md 한 곳에서만 관리합니다.
export const CATS={competition:'KTC·대회',technique:'실전테크닉',essential:'에센셜',tanguera:'땅게라',training:'트레이닝·연습',practica:'쁘락',show:'공연·모임',off:'휴강',other:'기타'};
export const inferCategory=t=>/휴강/.test(t)?'off':/KTC|대회/.test(t)?'competition':/실전테크닉|테크닉/.test(t)?'technique':/에센셜|Essential/i.test(t)?'essential':/쁘락|프락|practica/i.test(t)?'practica':/땅게라|Tanguera/i.test(t)?'tanguera':/트레이닝|솔로|연습|Training/i.test(t)?'training':/공연|파티|정모/.test(t)?'show':'other';
const addDays=(d,n)=>{const x=new Date(d+'T00:00');x.setDate(x.getDate()+n);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};

// "- 2026-11-15 | 제목 | 14:00 - 16:00 (+1일) | 분류" 형식 → [{date,title,time,end,cat,cont}]
export function parseCalendarMarkdown(md){
  const out=[];
  for(const raw of String(md).split(/\r?\n/)){
    const line=raw.trim();if(!line||line.startsWith('#'))continue;
    const [date,title,time='',cat='']=line.replace(/^[-*]\s*/,'').split('|').map(s=>s.trim());
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!title)continue;
    const m=time.match(/^(\d{1,2}:\d{2})(?:\s*-\s*(\d{1,2}:\d{2}))?(?:\s*\(\+(\d+)일\))?$/);
    const c=CATS[cat]&&cat!=='other'?cat:inferCategory(title);
    out.push({date,title,time:m?m[1]:'',end:m&&m[2]||'',cat:c});
    for(let i=1;i<=(m&&m[3]?+m[3]:0);i++)out.push({date:addDays(date,i),title,time:'',end:'',cat:c,cont:true});
  }
  return out;
}
let cache=null;
export async function loadCalendar(){
  if(cache)return cache;
  const r=await fetch(new URL('./calendar.md',import.meta.url),{cache:'no-cache'});
  if(!r.ok)throw new Error('calendar.md '+r.status);
  return cache=parseCalendarMarkdown(await r.text());
}
