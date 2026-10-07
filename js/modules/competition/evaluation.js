// 선생님 화면: 점수 입력 · 커플별 추이 · 학생 공유 링크 (Google 로그인 필요)
import{mount}from'../../core/mount.js';
import*as S from'../../core/sheets.js';
import{categories,checkpoints,weakest,COLORS}from'../../data/rubric.js';
import{sessions}from'../../data/curriculum.js';
import{lineChart,legend}from'../../ui/charts.js';
import{linkFor,copy}from'../../core/share.js';

const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const key=S.normalizeName;
const localDate=()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const f1=v=>Number(Number(v).toFixed(2)).toString();
const blank=name=>({name,scores:['','','',''],feedback:['','','',''],sheetRow:null});
const hasScore=c=>c.scores.some(v=>v!==''),full=c=>c.scores.every(v=>v!=='');
const totalOf=c=>full(c)?c.scores.reduce((a,v)=>a+Number(v),0):null;
const sum=a=>a.every(v=>v!=null)?a.reduce((x,y)=>x+y,0):null;

export function renderCompetitionScore(){
  const app=mount(),cps=checkpoints(),$=s=>app.querySelector(s);
  let date=localDate(),note='';
  if(!sessions.some(s=>s.date===date)&&cps.length){
    const n=cps.reduce((b,c)=>Math.abs(new Date(c.date)-new Date(date))<Math.abs(new Date(b.date)-new Date(date))?c:b);
    date=n.date;note=`가장 가까운 점검일(${n.short})로 맞췄어요. 다른 날을 평가하려면 날짜를 바꿔 주세요.`;
  }
  let couples=[],students=[],all=[],loaded=false,busy=false,saved='',sel='',cmpA='',cmpB='',touched=false,curLink='',seq=0;

  app.innerHTML=`<section class="page score-page">
   <a class="score-back" href="#/competition">← 대회준비반</a>
   <header class="score-heading"><span class="eyebrow">KTC SIMULATION</span><h1>커플별 평가</h1><p class="muted">점수 입력, 커플별 추이 확인, 학생에게 읽기 전용 링크 보내기를 한 곳에서 해요.</p></header>
   <div class="tabs" role="tablist"><button class="tab on" role="tab" data-tab="input" aria-selected="true">점수 입력</button><button class="tab" role="tab" data-tab="trend" aria-selected="false">추이 · 공유</button></div>
   <div id="tab-input">
    <div class="score-meta"><label>평가 날짜<input id="date" type="date" value="${date}" required></label><button class="btn" id="load">평가 조회</button></div>
    <div class="chips" aria-label="점검일 바로가기"><span class="muted">점검일</span>${cps.map(c=>`<button class="chip" data-chip="${c.date}">${+c.date.slice(5,7)}/${+c.date.slice(8)} ${esc(c.short)}</button>`).join('')}</div>
    <p class="score-load-hint">${esc(note)||'수강생 시트의 이름과 선택한 날짜의 기록을 불러옵니다. 점수를 하나 이상 입력한 커플만 저장돼요.'}</p>
    <div class="score-table-scroll"><table class="score-matrix"><thead><tr><th class="matrix-couple">커플</th>${categories.map(c=>`<th><strong>${esc(c.name)} (10)</strong><small>참고: ${c.items.map(esc).join(' · ')}</small></th>`).join('')}</tr></thead><tbody id="rows"></tbody></table></div>
    <div class="row" style="margin-top:10px"><button class="btn alt" id="add">+ 커플 추가</button></div>
    <div class="score-submit"><div><span id="prog">평가 0 / 0커플</span><strong><output id="avg">—</output> <small>평균 / 40</small></strong></div><button class="btn" id="save">평가 결과 저장</button></div>
   </div>
   <div id="tab-trend" hidden><div id="trend-body"></div></div>
   <p class="score-status" id="st" role="status" aria-live="polite">시트가 ‘링크가 있는 사용자 읽기’로 공유돼 있으면 조회에는 로그인이 필요 없고, 저장할 때만 Google 로그인 창이 열려요. 공유돼 있지 않으면 조회할 때도 로그인해요.</p>
  </section>`;
  const HINT='수강생 시트의 이름과 선택한 날짜의 기록을 불러옵니다. 점수를 하나 이상 입력한 커플만 저장돼요.';
  const say=m=>{$('#st').textContent=m};
  S.preload(); // 구글 로그인 스크립트는 이 화면에서만 미리 불러온다

  // ---------- 입력 ----------
  const snap=()=>JSON.stringify([date,couples.map(c=>[c.name,c.scores,c.feedback])]);
  function sync(){app.querySelectorAll('#rows tr[data-i]').forEach(tr=>{const c=couples[+tr.dataset.i];if(!c)return;
    c.name=tr.querySelector('.matrix-name-input').value.trim()||c.name;
    tr.querySelectorAll('.matrix-score').forEach(x=>c.scores[+x.dataset.k]=x.value);
    tr.querySelectorAll('.matrix-feedback-input').forEach(x=>c.feedback[+x.dataset.k]=x.value)})}
  function ui(){
    const done=couples.filter(full),t=done.map(totalOf);
    $('#prog').textContent=`평가 ${done.length} / ${couples.length}커플`;
    $('#avg').textContent=t.length?f1(t.reduce((a,b)=>a+b,0)/t.length):'—';
    $('#save').disabled=busy||!couples.length||saved===snap();$('#load').disabled=busy;$('#add').disabled=busy;
  }
  function renderRows(){
    $('#rows').innerHTML=couples.length?couples.map((c,i)=>`<tr data-i="${i}"><th scope="row" class="matrix-couple"><div class="mc"><input class="matrix-name-input" value="${esc(c.name)}" maxlength="40" aria-label="커플 이름">${!c.sheetRow&&!hasScore(c)?`<button type="button" class="rm" data-rm="${i}" aria-label="${esc(c.name)} 삭제">×</button>`:''}</div></th>${categories.map((g,k)=>`<td><div class="matrix-cell"><input class="matrix-score" data-k="${k}" type="number" min="0" max="10" step="0.5" inputmode="decimal" value="${esc(c.scores[k])}" aria-label="${esc(c.name)} ${esc(g.name)} 점수"><details class="matrix-feedback"><summary>피드백</summary><textarea class="matrix-feedback-input" data-k="${k}" maxlength="1000" rows="3" placeholder="피드백" aria-label="피드백">${esc(c.feedback[k])}</textarea></details></div></td>`).join('')}</tr>`).join('')
      :`<tr><td colspan="5" class="muted" style="padding:22px;text-align:center">‘평가 조회’를 눌러 수강생과 기록을 불러오세요.</td></tr>`;
    ui();
  }
  function applyDate(){
    const recs=all.filter(r=>r.date===date),names=[...students];
    recs.forEach(r=>{if(!names.some(n=>key(n)===key(r.name)))names.push(r.name)});
    const base=names.length?names:'ABCDEFGHIJ'.split('').map(l=>l+' 커플');
    couples=base.map(n=>{const r=recs.find(x=>key(x.name)===key(n));
      return r?{name:n,scores:r.scores.map(v=>v==null?'':String(v)),feedback:r.feedback.slice(),sheetRow:r.sheetRow}:blank(n)});
    saved=snap();renderRows();renderTrend();
  }
  async function loadAll(){
    if(!S.configured()){say('Google Sheets 연결 설정이 필요합니다. (js/config.js)');return}
    if(busy)return;
    sync();
    if(loaded&&snap()!==saved&&!confirm('저장하지 않은 평가가 있습니다. 변경 내용을 버리고 다시 불러올까요?')){return}
    busy=true;ui();say('수강생과 평가 기록을 불러오는 중…');
    try{
      let nameErr='';
      const[names,res]=await Promise.all([S.readStudents().catch(e=>{nameErr=e.message;return[]}),S.readAll()]);
      students=names;all=res.records;loaded=true;
      applyDate();
      const n=all.filter(r=>r.date===date).length;
      say(`수강생 ${students.length}명 · ${date} 기록 ${n}건을 불러왔습니다. (${res.via==='public'?'공개 시트 · 로그인 없이 읽음':'Google 로그인으로 읽음'})`+(nameErr?` (수강생 이름은 읽지 못했어요: ${nameErr})`:'')+(res.missing?' 저장하면 평가 탭이 만들어져요.':''));
    }catch(e){say(`불러오지 못했습니다: ${e.message}`)}
    finally{busy=false;ui()}
  }
  async function saveAll(){
    sync();
    if(!S.configured()){say('Google Sheets 연결 설정이 필요합니다. (js/config.js)');return}
    const items=couples.filter(c=>hasScore(c)||c.sheetRow);
    const fbOnly=couples.filter(c=>!hasScore(c)&&!c.sheetRow&&c.feedback.some(v=>v.trim())).length;
    if(!items.length){say('저장할 평가가 없어요. 점수를 하나 이상 입력한 커플만 저장돼요.');return}
    if(app.querySelectorAll('.matrix-score:invalid').length){say('0~10 사이 점수(0.5 단위)로 입력해 주세요.');return}
    busy=true;ui();say(`${items.length}커플 평가를 저장하는 중…`);
    try{
      const r=await S.save(date,items);
      const res=await S.readAll({api:true});all=res.records;
      couples.forEach(c=>{const x=all.find(y=>y.date===date&&key(y.name)===key(c.name));c.sheetRow=x?x.sheetRow:null});
      saved=snap();renderRows();renderTrend();
      const partial=items.filter(c=>hasScore(c)&&!full(c)).length;
      say(`저장 완료 · ${items.length}커플 (수정 ${r.updated}, 추가 ${r.appended})`+(partial?` · 일부 항목만 입력한 ${partial}커플 포함`:'')+(fbOnly?` · 점수 없이 피드백만 있는 ${fbOnly}커플은 저장하지 않았어요`:''));
    }catch(e){say(`저장하지 못했습니다: ${e.message}`)}
    finally{busy=false;ui()}
  }
  function setDate(d){
    if(!d)return;sync();
    if(loaded&&snap()!==saved&&!confirm('저장하지 않은 평가가 있습니다. 변경 내용을 버리고 날짜를 바꿀까요?')){$('#date').value=date;return}
    date=d;$('#date').value=d;$('.score-load-hint').textContent=HINT;
    if(loaded){applyDate();say(`${d} 기록 ${all.filter(r=>r.date===d).length}건`)}else{saved='';ui()}
  }

  // ---------- 추이 · 공유 ----------
  const avgOn=d=>categories.map((_,k)=>{const v=all.filter(r=>r.date===d&&r.scores[k]!=null).map(r=>r.scores[k]);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null});
  const cpLabel=d=>{const c=cps.find(x=>x.date===d);return c?` (${c.short})`:''};
  function payloadFor(name,recs){
    const dates=[...new Set(recs.map(r=>r.date))],fb=new Set(dates.slice(-3)),a={};
    dates.forEach(d=>a[d]=avgOn(d).map(v=>v==null?null:+v.toFixed(2)));
    return{v:1,n:name,g:localDate(),r:recs.map(r=>({d:r.date,s:r.scores,...(fb.has(r.date)?{f:r.feedback}:{})})),a};
  }
  function renderTrend(){
    const el=$('#trend-body');
    if(!loaded){el.innerHTML=`<div class="card"><p class="muted" style="margin:0 0 12px">평가 기록을 불러오면 커플별 추이를 볼 수 있어요.</p><button class="btn" id="load2">기록 불러오기</button></div>`;return}
    const by=new Map();all.forEach(r=>{const k=key(r.name);if(!by.has(k))by.set(k,[]);by.get(k).push(r)});
    const names=[...new Map([...students,...all.map(r=>r.name)].map(n=>[key(n),n])).values()];
    if(!sel||!names.some(n=>key(n)===sel))sel=key(names.find(n=>by.has(key(n)))||names[0]||'');
    const list=names.map(n=>{const rs=by.get(key(n))||[],l=rs[rs.length-1],t=l&&sum(l.scores);
      return`<button class="tcouple ${key(n)===sel?'on':''} ${rs.length?'':'dim'}" data-sel="${esc(key(n))}"><span>${esc(n)}</span><small>${rs.length?(t!=null?f1(t)+'점':rs.length+'회'):'기록 없음'}</small></button>`}).join('');
    const name=names.find(n=>key(n)===sel),recs=by.get(sel)||[];
    let detail='<div class="card"><p class="muted" style="margin:0">선택한 커플의 평가 기록이 아직 없어요.</p></div>';
    curLink='';
    if(recs.length){
      const dates=[...new Set(recs.map(r=>r.date))],last=recs[recs.length-1],tot=sum(last.scores);
      if(!touched||!dates.includes(cmpA)||!dates.includes(cmpB)){cmpA=dates[0];cmpB=dates[dates.length-1]}
      const on=d=>recs.find(r=>r.date===d),A=on(cmpA),B=on(cmpB),aA=avgOn(cmpB);
      const series=categories.map((c,k)=>({name:c.name,color:COLORS[k],values:recs.map(r=>r.scores[k])}));
      const opt=v=>dates.map(d=>`<option value="${d}" ${d===v?'selected':''}>${d}${cpLabel(d)}</option>`).join('');
      const delta=(a,b)=>a==null||b==null?'—':`<span class="${b>a?'up':b<a?'down':''}">${b>a?'▲':b<a?'▼':'='} ${f1(Math.abs(b-a))}</span>`;
      const weak=weakest(B.scores,2);
      detail=`<div class="trend-head"><h2>${esc(name)}</h2><span class="muted">${dates.length}회 평가 · 최근 ${last.date}${tot!=null?` · ${f1(tot)} / 40`:''}</span></div>
       <div class="card">${dates.length?lineChart({xs:recs.map(r=>r.date),series,marks:cps.map(c=>({date:c.date,label:c.short.split(' ')[0]}))}):''}${legend(series)}</div>
       <div class="card"><div class="row cmp-pick"><label>기준일<select id="cmpA">${opt(cmpA)}</select></label><span aria-hidden="true">→</span><label>비교일<select id="cmpB">${opt(cmpB)}</select></label></div>
        <div class="table-scroll"><table class="cmp"><thead><tr><th>항목</th><th>기준일</th><th>비교일</th><th>변화</th><th>비교일 반 평균</th></tr></thead><tbody>${categories.map((c,k)=>`<tr><th>${esc(c.name)}</th><td>${A.scores[k]==null?'—':f1(A.scores[k])}</td><td>${B.scores[k]==null?'—':f1(B.scores[k])}</td><td>${delta(A.scores[k],B.scores[k])}</td><td>${aA[k]==null?'—':f1(aA[k])}</td></tr>`).join('')}<tr class="tot"><th>합계 / 40</th><td>${sum(A.scores)==null?'—':f1(sum(A.scores))}</td><td>${sum(B.scores)==null?'—':f1(sum(B.scores))}</td><td>${delta(sum(A.scores),sum(B.scores))}</td><td>${aA.every(v=>v!=null)?f1(aA.reduce((a,b)=>a+b,0)):'—'}</td></tr></tbody></table></div></div>
       ${weak.length?`<div class="card"><h3 style="margin:0 0 8px">보완이 필요한 항목 (${cmpB}${cpLabel(cmpB)} 기준)</h3>${weak.map(k=>`<div class="tip"><b>${esc(categories[k].name)} · ${f1(B.scores[k])}점</b><p class="muted">${esc(categories[k].tip)}</p><div class="row">${categories[k].links.map(l=>`<a class="btn alt" href="${l[1]}">${l[0]}</a>`).join('')}</div></div>`).join('')}</div>`:''}
       <div class="card share"><h3 style="margin:0 0 6px">학생에게 보내기</h3><p class="muted" style="margin:0 0 12px">로그인 없이 읽기만 가능한 링크예요. 링크 안에 이 커플의 점수만 담겨 있어서, 새 평가를 입력한 뒤에는 새 링크를 다시 보내야 해요.</p>
        <div class="row"><button class="btn" id="copy" disabled>이 커플 링크 복사</button><a class="btn alt" id="prev" target="_blank" rel="noopener" aria-disabled="true">미리보기</a><button class="btn alt" id="copyall">전체 링크 목록 복사</button></div><p class="muted" id="linkinfo" style="margin:10px 0 0;font-size:13px">링크를 만드는 중…</p><textarea id="allbox" class="input" rows="6" hidden readonly></textarea></div>`;
      const my=++seq;
      linkFor(payloadFor(name,recs)).then(l=>{if(my!==seq||!$('#copy'))return;curLink=l;$('#copy').disabled=false;$('#prev').href=l;$('#prev').removeAttribute('aria-disabled');$('#linkinfo').textContent=l.length>6000?`링크 길이 ${l.length}자 — 메신저에서 잘릴 수 있어요. 피드백을 줄여 보세요.`:`링크 길이 ${l.length}자`}).catch(()=>{if($('#linkinfo'))$('#linkinfo').textContent='링크를 만들지 못했어요.'});
    }
    el.innerHTML=`<div class="trend"><nav class="trend-list" aria-label="커플 목록">${list}</nav><div class="trend-detail">${detail}</div></div>`;
  }

  // ---------- 이벤트 ----------
  app.addEventListener('click',async e=>{
    const t=e.target.closest('button,a');if(!t)return;
    if(t.dataset.tab){app.querySelectorAll('.tab').forEach(b=>{const on=b===t;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});$('#tab-input').hidden=t.dataset.tab!=='input';$('#tab-trend').hidden=t.dataset.tab!=='trend';if(t.dataset.tab==='trend'){sync();renderTrend()}return}
    if(t.dataset.chip)return setDate(t.dataset.chip);
    if(t.dataset.rm!=null){sync();couples.splice(+t.dataset.rm,1);renderRows();return}
    if(t.dataset.sel){sel=t.dataset.sel;touched=false;renderTrend();return}
    if(t.id==='load'||t.id==='load2')return loadAll();
    if(t.id==='add'){sync();couples.push(blank(`새 커플 ${couples.length+1}`));renderRows();const r=app.querySelectorAll('.matrix-name-input');r[r.length-1]?.select();return}
    if(t.id==='save')return saveAll();
    if(t.id==='copy'){say(await copy(curLink)?'이 커플의 학생용 링크를 복사했어요.':'복사하지 못했어요. 미리보기를 열어 주소창의 링크를 복사해 주세요.');return}
    if(t.id==='copyall'){
      const by=new Map();all.forEach(r=>{const k=key(r.name);if(!by.has(k))by.set(k,[]);by.get(k).push(r)});
      const names=[...new Map([...students,...all.map(r=>r.name)].map(n=>[key(n),n])).values()].filter(n=>by.has(key(n)));
      const lines=await Promise.all(names.map(async n=>`${n}\n${await linkFor(payloadFor(n,by.get(key(n))))}`));
      const text=lines.join('\n\n'),ok=await copy(text),box=$('#allbox');
      box.value=text;box.hidden=ok;if(!ok){box.select();say('자동 복사가 막혀서 아래 상자에 목록을 띄웠어요. 직접 복사해 주세요.')}else say(`${names.length}커플의 링크 목록을 복사했어요.`);
    }
  });
  app.addEventListener('input',e=>{if(e.target.closest('#rows')){sync();ui()}});
  app.addEventListener('change',e=>{
    if(e.target.id==='date')setDate(e.target.value);
    else if(e.target.id==='cmpA'){cmpA=e.target.value;touched=true;renderTrend()}
    else if(e.target.id==='cmpB'){cmpB=e.target.value;touched=true;renderTrend()}
  });
  renderRows();renderTrend();
}
