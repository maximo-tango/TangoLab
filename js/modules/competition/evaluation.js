import{mount}from'../../core/mount.js';
import{SHEETS_CLIENT_ID,SHEETS_SPREADSHEET_ID}from'../../config.js';

const categories=[
  {name:'자세와 축의 안정성',items:['(기세)턱/시선 처리','아브라소/자세','피봇 & 턴 안정성']},
  {name:'테크닉',items:['걷기와 멈춤','회전, (사까다)히로','강약 조절']},
  {name:'음악적 해석과 뉘앙스',items:['프레이즈','빠우사','악단별 특징 표현']},
  {name:'론다운용',items:['간격유지','공간운용(이탈)','진행능력']}
];
const coupleLabels='ABCDEFGHIJKL'.split('');
const evaluationSheet='커플 평가 데이터';
const sheetHeaders=['일자','이름','자세와 축의 안정성','테크닉','음악적 해석과 뉘앙스','론다운용','자세와 축의 안정성 피드백','테크닉 피드백','뮤지컬리티 피드백','론다운용 피드백'];
const legacySheetHeaders=['일자','이름','(기세)턱/시선 처리','아브라소/자세','피봇 & 턴 안정성','합계','걷기와 멈춤','회전, (사까다)히로','강약 조절','합계','프레이즈','빠우사','악단별 특징 표현','합계','간격유지','공간운용(이탈)','진행능력','합계','자세와 축의 안정성 피드백','테크닉 피드백','뮤지컬리티 피드백','론다운용 피드백'];
let accessToken='';
let accessTokenExpiresAt=0;
let tokenClient=null;
let tokenRequest=null;
let tokenResolve=null;
let tokenReject=null;

const esc=s=>String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const localDate=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const newCouple=label=>({label,scores:['','','',''],feedback:['','','',''],sheetRow:null});
const sheetDate=value=>{
  if(typeof value==='number'&&Number.isFinite(value))return new Date(Date.UTC(1899,11,30)+Math.floor(value)*864e5).toISOString().slice(0,10);
  const match=String(value??'').trim().match(/^(\d{4})[-/.]\s*(\d{1,2})[-/.]\s*(\d{1,2})/);
  return match?`${match[1]}-${match[2].padStart(2,'0')}-${match[3].padStart(2,'0')}`:String(value??'').trim();
};
const spreadsheetUrl=()=>`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(SHEETS_SPREADSHEET_ID)}`;
const sheetUrl=(tab,range)=>`${spreadsheetUrl()}/values/${encodeURIComponent(`'${tab}'!${range}`)}`;
const normalizeName=value=>String(value??'').trim().replace(/\s+/g,' ').toLocaleLowerCase();

function parseStudentNames(rows){
  if(!rows.length)return[];
  const headers=(rows[0]||[]).map(value=>String(value??'').trim().toLocaleLowerCase().replace(/\s+/g,''));
  const find=pattern=>headers.findIndex(value=>pattern.test(value));
  const coupleColumn=find(/^(커플명|커플이름|커플|팀명|팀)$/);
  const leaderColumn=find(/리더|남자|남성|leader/);
  const followerColumn=find(/팔로워|여자|여성|follower/);
  const nameColumn=find(/이름|성명|수강생|학생|name/);
  const hasHeader=coupleColumn>=0||leaderColumn>=0||followerColumn>=0||nameColumn>=0;
  const data=rows.slice(hasHeader?1:0);
  const names=data.map(row=>{
    const value=column=>String(row[column]??'').trim();
    if(coupleColumn>=0)return value(coupleColumn);
    if(leaderColumn>=0&&followerColumn>=0)return [value(leaderColumn),value(followerColumn)].filter(Boolean).join(' / ');
    if(nameColumn>=0)return value(nameColumn);
    return value(0);
  }).filter(Boolean);
  return [...new Set(names)];
}

async function sheetsApi(url,options={}){
  const token=await getAccessToken();
  const response=await fetch(url,{...options,headers:{Authorization:`Bearer ${token}`,...options.headers}});
  const result=await response.json().catch(()=>({}));
  if(!response.ok){
    if(response.status===401){accessToken='';accessTokenExpiresAt=0}
    throw new Error(`${result.error?.message||`Google Sheets API 오류 (${response.status})`} (HTTP ${response.status})`);
  }
  return result;
}

function getAccessToken(){
  if(accessToken&&Date.now()<accessTokenExpiresAt)return Promise.resolve(accessToken);
  accessToken='';
  const oauth=window.google?.accounts?.oauth2;
  if(!oauth)return Promise.reject(new Error('Google 로그인 서비스를 불러오지 못했습니다. 페이지를 새로고침해 주세요.'));
  if(!tokenClient){
    tokenClient=oauth.initTokenClient({
      client_id:SHEETS_CLIENT_ID,
      scope:'https://www.googleapis.com/auth/spreadsheets',
      callback:response=>{
        const resolve=tokenResolve;
        const reject=tokenReject;
        tokenResolve=null;
        tokenReject=null;
        tokenRequest=null;
        if(response.error){reject?.(new Error(response.error_description||response.error));return}
        accessToken=response.access_token;
        accessTokenExpiresAt=Date.now()+(Number(response.expires_in)||3600)*1000-60000;
        resolve?.(accessToken);
      },
      error_callback:error=>{
        const reject=tokenReject;
        tokenResolve=null;
        tokenReject=null;
        tokenRequest=null;
        reject?.(new Error(error.message||'Google 로그인을 완료하지 못했습니다.'));
      }
    });
  }
  if(tokenRequest)return tokenRequest;
  const request=new Promise((resolve,reject)=>{
    tokenResolve=resolve;
    tokenReject=reject;
  });
  tokenRequest=request;
  try{tokenClient.requestAccessToken({prompt:''})}
  catch(error){const reject=tokenReject;tokenResolve=null;tokenReject=null;tokenRequest=null;reject?.(error)}
  return request;
}

export function renderCompetitionScore(){
  const app=mount();
  app.innerHTML=`<section class="page score-page">
    <a class="score-back" href="#/competition">← 대회준비반</a>
    <header class="score-heading"><span class="eyebrow">KTC SIMULATION</span><h1>커플별 평가</h1><p class="muted">커플별 행에서 네 분류 점수를 입력합니다. 세부 항목은 참고 내용입니다.</p></header>
    <form id="evaluation-form" class="score-form">
      <div class="score-meta">
        <label>평가 날짜<input name="date" type="date" value="${localDate()}" required></label>
        <input name="coupleCount" type="hidden" value="12">
        <button type="button" class="score-load" id="load-date">수강생·날짜 불러오기</button>
      </div>
      <p class="score-load-hint">수강생 시트의 커플 이름과 선택 날짜의 평가 기록을 불러옵니다.</p>
      <div class="score-table-scroll" id="score-table-scroll"><table class="score-matrix"><thead><tr><th id="couple-column-heading" class="matrix-couple">커플</th>${categories.map(category=>`<th><strong>${esc(category.name)} (10)</strong><small>참고: ${category.items.map(esc).join(' · ')}</small></th>`).join('')}</tr></thead><tbody id="couple-rows"></tbody></table></div>
      <div class="score-submit"><div><span id="batch-progress">완료 0 / 12커플</span><strong><output id="score-total">—</output> <small>평균 / 40</small></strong></div><button type="submit" id="score-save">평가 결과 한 번에 저장</button></div>
      <p class="score-status" id="score-status" role="status" aria-live="polite">저장하려면 Google 계정 로그인이 필요합니다.</p>
    </form>
  </section>`;

  const form=app.querySelector('#evaluation-form');
  const total=app.querySelector('#score-total');
  const status=app.querySelector('#score-status');
  const saveButton=app.querySelector('#score-save');
  const loadButton=app.querySelector('#load-date');
  const coupleRows=app.querySelector('#couple-rows');
  const scoreTable=app.querySelector('.score-matrix');
  const progress=app.querySelector('#batch-progress');
  const couples=coupleLabels.map(label=>newCouple(`${label} 커플`));
  let isSaving=false;
  let isLoading=false;
  let savedSnapshot='';
  let savedContentSnapshot='';
  let loadedDate=form.elements.date.value;
  const formatScore=value=>Number(value.toFixed(2)).toString();
  const coupleScores=couple=>couple.scores.map(score=>score===''?null:Number(score));
  const coupleTotal=couple=>{
    const scores=coupleScores(couple);
    return scores.some(score=>score===null)?null:scores.reduce((sum,score)=>sum+score,0);
  };
  const contentSnapshot=()=>JSON.stringify({count:form.elements.coupleCount.value,couples:couples.slice(0,Number(form.elements.coupleCount.value))});
  const currentSnapshot=()=>JSON.stringify({date:form.elements.date.value,content:contentSnapshot()});
  const refreshSummary=()=>{
    const count=Number(form.elements.coupleCount.value);
    const complete=couples.slice(0,count).filter(couple=>coupleTotal(couple)!==null).length;
    progress.textContent=`완료 ${complete} / ${count}커플`;
    const scores=couples.slice(0,count).map(coupleTotal).filter(score=>score!==null);
    total.textContent=scores.length?formatScore(scores.reduce((sum,score)=>sum+score,0)/scores.length):'—';
    saveButton.disabled=isSaving||isLoading||(savedSnapshot!==''&&savedSnapshot===currentSnapshot());
    loadButton.disabled=isLoading||isSaving;
  };
  const syncTableInputs=()=>{
    coupleRows.querySelectorAll('tr[data-couple-index]').forEach(row=>{
      const couple=couples[Number(row.dataset.coupleIndex)];
      const name=row.querySelector('.matrix-name-input');
      couple.label=name.value.trim()||`${coupleLabels[Number(row.dataset.coupleIndex)]} 커플`;
      row.querySelectorAll('.matrix-score').forEach(input=>{couple.scores[Number(input.dataset.categoryIndex)]=input.value});
      row.querySelectorAll('.matrix-feedback-input').forEach(input=>{couple.feedback[Number(input.dataset.categoryIndex)]=input.value});
    });
  };
  const renderTable=()=>{
    const count=Number(form.elements.coupleCount.value);
    coupleRows.innerHTML=couples.slice(0,count).map((couple,index)=>`<tr data-couple-index="${index}"><th scope="row" class="matrix-couple"><input id="couple-name-${index}" class="matrix-name-input" type="text" maxlength="40" value="${esc(couple.label)}" aria-labelledby="couple-column-heading"></th>${categories.map((category,categoryIndex)=>`<td><div class="matrix-cell"><input id="couple-${index}-score-${categoryIndex}" class="matrix-score" data-category-index="${categoryIndex}" type="number" min="0" max="10" step="0.5" inputmode="decimal" value="${esc(couple.scores[categoryIndex])}" aria-label="점수 입력" required><details class="matrix-feedback"><summary>피드백</summary><textarea id="couple-${index}-feedback-${categoryIndex}" class="matrix-feedback-input" data-category-index="${categoryIndex}" maxlength="1000" rows="3" placeholder="피드백" aria-label="피드백 입력">${esc(couple.feedback[categoryIndex])}</textarea></details></div></td>`).join('')}</tr>`).join('');
  };
  const readSheet=async(createIfMissing=false)=>{
    const metadata=await sheetsApi(`${spreadsheetUrl()}?fields=${encodeURIComponent('sheets.properties.title')}`);
    const exists=metadata.sheets?.some(sheet=>sheet.properties?.title===evaluationSheet);
    if(!exists&&!createIfMissing)return{values:[sheetHeaders],mode:'simple',missing:true};
    let created=false;
    if(!exists){
      await sheetsApi(`${spreadsheetUrl()}:batchUpdate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requests:[{addSheet:{properties:{title:evaluationSheet,gridProperties:{rowCount:1000,columnCount:10}}}}]})});
      created=true;
    }
    const result=await sheetsApi(`${sheetUrl(evaluationSheet,'A1:V')}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER`);
    const values=result.values||[];
    const header=values[0]||[];
    if(!header.length&&createIfMissing){
      const range=encodeURIComponent(`'${evaluationSheet}'!A1:J1`);
      await sheetsApi(`${spreadsheetUrl()}/values/${range}?valueInputOption=RAW`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({majorDimension:'ROWS',values:[sheetHeaders]})});
      return{values:[sheetHeaders],mode:'simple',created};
    }
    const matches=(expected)=>expected.every((label,index)=>String(header[index]??'').trim()===label);
    if(matches(sheetHeaders))return{values,mode:'simple',created};
    if(matches(legacySheetHeaders))return{values,mode:'legacy',created};
    throw new Error(`${evaluationSheet} 탭의 첫 행이 맞지 않습니다. README의 새 10열 형식 또는 이전 22열 형식인지 확인해 주세요.`);
  };
  const readStudentNames=async()=>{
    const result=await sheetsApi(`${sheetUrl('수강생','A1:Z500')}?valueRenderOption=UNFORMATTED_VALUE`);
    return parseStudentNames(result.values||[]);
  };
  const loadDateRecords=async()=>{
    if(!SHEETS_CLIENT_ID||!SHEETS_SPREADSHEET_ID){status.textContent='Google Sheets 연결 설정이 필요합니다.';return}
    syncTableInputs();
    if(contentSnapshot()!==savedContentSnapshot&&!window.confirm('저장하지 않은 평가가 있습니다. 변경 내용을 버리고 날짜별 기록을 불러올까요?')){
      form.elements.date.value=loadedDate;
      return;
    }
    isLoading=true;
    status.textContent=`${form.elements.date.value} 평가 기록을 불러오는 중…`;
    refreshSummary();
    let loadedStudentCount=0;
    try{
      const studentNames=await readStudentNames();
      loadedStudentCount=studentNames.length;
      if(studentNames.length){
        const initialNames=studentNames.slice(0,12);
        couples.splice(0,couples.length,...coupleLabels.map((label,index)=>newCouple(initialNames[index]||`${label} 커플`)));
        form.elements.coupleCount.value=String(Math.max(10,Math.min(12,studentNames.length)));
        renderTable();
      }
      const {values,mode,missing}=await readSheet();
      const date=form.elements.date.value;
      const matches=[];
      values.slice(1).forEach((row,index)=>{
        if(sheetDate(row[0])!==date)return;
        const scoreIndexes=mode==='legacy'?[5,9,13,17]:[2,3,4,5];
        const feedbackStart=mode==='legacy'?18:6;
        const scores=scoreIndexes.map(column=>row[column]==null||row[column]===''?'':String(row[column]));
        matches.push({label:String(row[1]||`${coupleLabels[matches.length]} 커플`),scores:scores.map(value=>value!==''&&Number(value)>=0&&Number(value)<=10?value:''),feedback:Array.from({length:4},(_,i)=>String(row[feedbackStart+i]||'')),sheetRow:index+2});
      });
      const names=[...new Set([...(studentNames.length?studentNames:matches.map(couple=>couple.label)),...matches.map(couple=>couple.label)])].slice(0,12);
      const nextCouples=coupleLabels.map((label,index)=>{
        const name=names[index]||`${label} 커플`;
        const saved=matches.find(couple=>normalizeName(couple.label)===normalizeName(name));
        return saved?{...saved,label:name}:newCouple(name);
      });
      couples.splice(0,couples.length,...nextCouples);
      form.elements.coupleCount.value=String(Math.max(10,Math.min(12,names.length||10)));
      loadedDate=date;
      renderTable();
      savedContentSnapshot=contentSnapshot();
      savedSnapshot=currentSnapshot();
      status.textContent=studentNames.length?`수강생 ${studentNames.length}명과 ${date} 평가 기록 ${matches.length}건을 불러왔습니다.`:matches.length?`${date} 기록 ${matches.length}커플을 불러왔습니다. 수강생 이름을 찾지 못해 저장된 이름을 사용합니다.`:`${date} 기록이 없고 수강생 이름도 찾지 못했습니다. 수강생 시트의 이름 열을 확인해 주세요.`;
      if(missing)status.textContent+=` 저장할 때 ${evaluationSheet} 탭을 만듭니다.`;
      if(matches.length>12)status.textContent+=` 처음 12커플만 표시했습니다.`;
    }catch(error){status.textContent=loadedStudentCount?`수강생 ${loadedStudentCount}명은 불러왔지만 평가 기록을 읽지 못했습니다: ${error.message}`:`불러오지 못했습니다: ${error.message}`}
    finally{isLoading=false;refreshSummary()}
  };
  form.elements.date.addEventListener('change',loadDateRecords);
  loadButton.addEventListener('click',loadDateRecords);
  scoreTable.addEventListener('input',()=>{syncTableInputs();refreshSummary()});
  scoreTable.addEventListener('change',()=>{syncTableInputs();refreshSummary()});
  form.elements.coupleCount.addEventListener('change',()=>{
    syncTableInputs();
    renderTable();
    refreshSummary();
  });
  form.addEventListener('input',refreshSummary);
  form.addEventListener('change',refreshSummary);
  renderTable();
  savedContentSnapshot=contentSnapshot();
  savedSnapshot=currentSnapshot();
  refreshSummary();
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    syncTableInputs();
    const count=Number(form.elements.coupleCount.value);
    const incompleteIndex=couples.slice(0,count).findIndex(couple=>coupleTotal(couple)===null||!couple.label.trim());
    if(incompleteIndex!==-1){
      status.textContent=`${incompleteIndex+1}번 ${couples[incompleteIndex].label}의 네 분류 점수를 모두 입력해 주세요.`;
      coupleRows.querySelector(`[data-couple-index="${incompleteIndex}"] .matrix-score`)?.focus();
      return;
    }
    if(!form.reportValidity())return;
    if(!SHEETS_CLIENT_ID||!SHEETS_SPREADSHEET_ID){status.textContent='Google Sheets 연결 설정이 필요합니다. README의 연결 절차를 확인해 주세요.';return}
    const snapshot=currentSnapshot();
    isSaving=true;
    saveButton.disabled=true;
    status.textContent=`${count}커플 평가를 저장할 준비 중…`;
    try{
      const data=new FormData(form);
      const {values,mode,created}=await readSheet(true);
      const existing=values.slice(1).map((row,index)=>({date:sheetDate(row[0]),name:String(row[1]||''),sheetRow:index+2,used:false}));
      const updates=[];
      const appends=[];
      const appendedCouples=[];
      couples.slice(0,count).forEach(couple=>{
        const row=mode==='legacy'
          ?[data.get('date'),couple.label,'','','',Number(couple.scores[0]),'','','',Number(couple.scores[1]),'','','',Number(couple.scores[2]),'','','',Number(couple.scores[3]),...couple.feedback]
          :[data.get('date'),couple.label,...couple.scores.map(Number),...couple.feedback];
        let match=existing.find(record=>!record.used&&record.sheetRow===couple.sheetRow&&record.date===data.get('date'));
        if(!match)match=existing.find(record=>!record.used&&record.date===data.get('date')&&record.name===couple.label);
        if(match){
          match.used=true;
          updates.push({range:`'${evaluationSheet}'!A${match.sheetRow}:${mode==='legacy'?'V':'J'}${match.sheetRow}`,majorDimension:'ROWS',values:[row]});
          couple.sheetRow=match.sheetRow;
        }else{
          appends.push(row);
          appendedCouples.push(couple);
        }
      });
      if(updates.length)await sheetsApi(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(SHEETS_SPREADSHEET_ID)}/values:batchUpdate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({valueInputOption:'RAW',data:updates})});
      if(appends.length){
        const range=encodeURIComponent(mode==='legacy'?`'${evaluationSheet}'!A1:V`:`'${evaluationSheet}'!A1:J`);
        const result=await sheetsApi(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(SHEETS_SPREADSHEET_ID)}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({majorDimension:'ROWS',values:appends})});
        const firstRow=Number(result.updates?.updatedRange?.match(/!A(\d+)/)?.[1]);
        if(firstRow)appendedCouples.forEach((couple,index)=>{couple.sheetRow=firstRow+index});
      }
      savedSnapshot=currentSnapshot();
      savedContentSnapshot=contentSnapshot();
      loadedDate=data.get('date');
      status.textContent=`저장 완료 · ${count}커플 평가를 Google Sheets에 기록했습니다.${created?` ${evaluationSheet} 탭을 만들었습니다.`:''}`;
    }catch(error){status.textContent=`저장하지 못했습니다: ${error.message}`}
    finally{isSaving=false;refreshSummary()}
  });
}
