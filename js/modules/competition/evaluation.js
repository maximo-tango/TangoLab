import { mount } from '../../core/mount.js';
import { SHEETS_CLIENT_ID, SHEETS_SPREADSHEET_ID } from '../../config.js';
import {
  evaluationSheet,
  sheetHeaders,
  legacySheetHeaders,
  sheetDate,
  normalizeName,
  readEvaluationSheet,
  readStudentNames,
  saveEvaluationRows
} from './sheets.js';

const categories = [
  { name: '자세와 축의 안정성', items: ['(기세)턱/시선 처리', '아브라소/자세', '피봇 & 턴 안정성'] },
  { name: '테크닉', items: ['걷기와 멈춤', '회전, (사까다)히로', '강약 조절'] },
  { name: '음악적 해석과 뉘앙스', items: ['프레이즈', '빠우사', '악단별 특징 표현'] },
  { name: '론다운용', items: ['간격유지', '공간운용(이탈)', '진행능력'] }
];
const coupleLabels = 'ABCDEFGHIJKL'.split('');
const checkpointDates = ['2026-12-06', '2026-12-20', '2027-01-17', '2027-02-21'];

const esc = s => String(s).replace(/[&<>\"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const newCouple = label => ({ label, scores: ['', '', '', ''], feedback: ['', '', '', ''], sheetRow: null });

export function renderCompetitionScore(){
  const app=mount();
  app.innerHTML=`<section class="page score-page">
    <a class="score-back" href="#/competition">← 대회준비반</a>
    <header class="score-heading"><span class="eyebrow">KTC SIMULATION</span><h1>커플별 평가</h1><p class="muted">커플별 행에서 네 분류 점수를 입력합니다. 세부 항목은 참고 내용입니다.</p></header>
    <form id="evaluation-form" class="score-form">
      <div class="score-meta">
        <label>평가 날짜<input name="date" type="date" value="${localDate()}" required></label>
        <input name="coupleCount" type="hidden" value="12">
        <button type="button" class="score-load" id="load-date">평가 조회</button>
      </div>
      <p class="score-load-hint">수강생 시트의 커플 이름과 선택 날짜의 평가 기록을 불러옵니다.</p>
      <section class="student-view" aria-label="커플별 평가 결과">
        <nav class="student-couple-list" id="student-couple-list" aria-label="평가 완료 커플"></nav>
        <div class="student-score-detail" id="student-score-detail" aria-live="polite"><p class="muted">평가 조회를 눌러 결과를 불러오세요.</p></div>
      </section>
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
  const studentCoupleList=app.querySelector('#student-couple-list');
  const studentScoreDetail=app.querySelector('#student-score-detail');
  const progress=app.querySelector('#batch-progress');
  const couples=coupleLabels.map(label=>newCouple(`${label} 커플`));
  let selectedStudentIndex=-1;
  let isSaving=false;
  let isLoading=false;
  let savedSnapshot='';
  let savedContentSnapshot='';
  let loadedDate=form.elements.date.value;
  let historyByCouple = {};
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
    coupleRows.innerHTML=couples.slice(0,count).map((couple,index)=>`<tr data-couple-index="${index}"><th scope="row" class="matrix-couple"><input id="couple-name-${index}" class="matrix-name-input" type="text" maxlength="40" value="${esc(couple.label)}" aria-labelledby="couple-column-heading"></th>${categories.map((category,categoryIndex)=>`<td><div class="matrix-cell"><input id="couple-${index}-score-${categoryIndex}" class="matrix-score" data-category-index="${categoryIndex}" type="number" min="0" max="10" step="0.5" inputmode="decimal" value="${esc(couple.scores[categoryIndex])}" aria-label="점수 입력"><details class="matrix-feedback"><summary>피드백</summary><textarea id="couple-${index}-feedback-${categoryIndex}" class="matrix-feedback-input" data-category-index="${categoryIndex}" maxlength="1000" rows="3" placeholder="피드백" aria-label="피드백 입력">${esc(couple.feedback[categoryIndex])}</textarea></details></div></td>`).join('')}</tr>`).join('');
  };
  const renderStudentView=()=>{
    const evaluated=couples.map((couple,index)=>({couple,index,total:coupleTotal(couple)})).filter(item=>item.total!==null);
    if(!evaluated.some(item=>item.index===selectedStudentIndex)){
      selectedStudentIndex = evaluated.length ? evaluated[0].index : -1;
    }
    studentCoupleList.innerHTML=evaluated.map(item=>`<button type="button" class="student-couple ${item.index===selectedStudentIndex?'is-active':''}" data-student-index="${item.index}" aria-pressed="${item.index===selectedStudentIndex}"><span>${esc(item.couple.label)}</span><small>${formatScore(item.total)}점</small></button>`).join('');
    studentCoupleList.querySelectorAll('[data-student-index]').forEach(button=>button.addEventListener('click',()=>{
      selectedStudentIndex=Number(button.dataset.studentIndex);
      renderStudentView();
    }));
    if(selectedStudentIndex<0){
      studentScoreDetail.innerHTML='<p class="muted">선택한 날짜에 평가된 커플이 없습니다.</p>';
      return;
    }
    const couple=couples[selectedStudentIndex];
    const history = historyByCouple[normalizeName(couple.label)] || [];
    const trendRows = categories.map((category, index) => {
      const values = history
        .map(entry => ({ date: entry.date, value: Number(entry.scores[index] !== undefined && entry.scores[index] !== null ? entry.scores[index] : 0) || 0 }))
        .filter(entry => entry.date && Number.isFinite(entry.value));
      const latest = values.length ? values[values.length - 1].value : Number(couple.scores[index] || 0) || 0;
      const previous = values.length > 1 ? values[values.length - 2].value : latest;
      const delta = latest - previous;
      const trace = values.length ? values.map(v => `<span class="trend-dot" style="--bar:${Math.max(12, (v.value / 10) * 100)}%" title="${v.date}: ${v.value}"></span>`).join('') : '<span class="trend-empty">기록 없음</span>';
      return `<div class="trend-row"><div><strong>${esc(category.name)}</strong><small>${latest.toFixed(1)}점 ${delta >= 0 ? '+' : ''}${delta.toFixed(1)}</small></div><div class="trend-bar-group">${trace}</div></div>`;
    }).join('');
    const checkpoint = checkpointDates.map(date => {
      const hit = history.find(entry => entry.date === date);
      return `<li class="checkpoint-item ${hit ? 'has-score' : ''}"><span>${date.slice(5)}</span><strong>${hit ? `${Number(hit.total || 0).toFixed(1)}점` : '—'}</strong></li>`;
    }).join('');
    studentScoreDetail.innerHTML=`<header class="student-score-heading"><h2>${esc(couple.label)}</h2><strong>${formatScore(coupleTotal(couple))} <small>/ 40</small></strong></header><div class="student-score-list">${categories.map((category,index)=>`<section class="student-score-row"><div><h3>${esc(category.name)}</h3><p>${category.items.map(esc).join(' · ')}</p></div><strong>${formatScore(Number(couple.scores[index]))}<small>/ 10</small></strong><p class="student-feedback">${esc(couple.feedback[index]||'피드백 없음')}</p></section>`).join('')}</div><div class="history-panel"><h3>추이와 점검일 비교</h3><div class="trend-list">${trendRows}</div><ul class="checkpoint-list">${checkpoint}</ul></div>`;
  };
  const readSheet = async (createIfMissing = false) => readEvaluationSheet(createIfMissing);
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
      const historyMap = {};
      values.slice(1).forEach((row,index)=>{
        const rowDate = sheetDate(row[0]);
        const scoreIndexes = mode === 'legacy' ? [5, 9, 13, 17] : [2, 3, 4, 5];
        const feedbackStart = mode === 'legacy' ? 18 : 6;
        const scores = scoreIndexes.map(column => row[column] == null || row[column] === '' ? '' : String(row[column]));
        const label = String(row[1] || `${coupleLabels[matches.length]} 커플`);
        if (rowDate) {
          const normalizedName = normalizeName(label);
          const record = {
            date: rowDate,
            label,
            scores: scores.map(value => value !== '' && Number(value) >= 0 && Number(value) <= 10 ? Number(value) : null),
            feedback: Array.from({ length: 4 }, (_, i) => String(row[feedbackStart + i] || '')),
            total: scores.reduce((sum, value) => sum + (value !== '' ? Number(value) : 0), 0)
          };
          if (!historyMap[normalizedName]) historyMap[normalizedName] = [];
          historyMap[normalizedName].push(record);
        }
        if (rowDate !== date) return;
        matches.push({ label, scores: scores.map(value => value !== '' && Number(value) >= 0 && Number(value) <= 10 ? value : ''), feedback: Array.from({ length: 4 }, (_, i) => String(row[feedbackStart + i] || '')), sheetRow: index + 2 });
      });
      historyByCouple = Object.fromEntries(Object.entries(historyMap).map(([name, entries]) => [name, entries.sort((a, b) => new Date(a.date) - new Date(b.date))]));
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
      renderStudentView();
      savedContentSnapshot=contentSnapshot();
      savedSnapshot=currentSnapshot();
      status.textContent=studentNames.length?`수강생 ${studentNames.length}명과 ${date} 평가 기록 ${matches.length}건을 불러왔습니다.`:matches.length?`${date} 기록 ${matches.length}커플을 불러왔습니다. 수강생 이름을 찾지 못해 저장된 이름을 사용합니다.`:`${date} 기록이 없고 수강생 이름도 찾지 못했습니다. 수강생 시트의 이름 열을 확인해 주세요.`;
      if(missing)status.textContent+=` 저장할 때 ${evaluationSheet} 탭을 만듭니다.`;
      if(matches.length>12)status.textContent+=` 처음 12커플만 표시했습니다.`;
    }catch(error){renderStudentView();status.textContent=loadedStudentCount?`수강생 ${loadedStudentCount}명은 불러왔지만 평가 기록을 읽지 못했습니다: ${error.message}`:`불러오지 못했습니다: ${error.message}`}
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
  renderStudentView();
  savedContentSnapshot=contentSnapshot();
  savedSnapshot=currentSnapshot();
  refreshSummary();
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    syncTableInputs();
    const count=Number(form.elements.coupleCount.value);
    if(!form.reportValidity())return;
    if(!SHEETS_CLIENT_ID||!SHEETS_SPREADSHEET_ID){status.textContent='Google Sheets 연결 설정이 필요합니다. README의 연결 절차를 확인해 주세요.';return}
    const snapshot=currentSnapshot();
    isSaving=true;
    saveButton.disabled=true;
    status.textContent=`${count}커플 평가를 저장할 준비 중…`;
    try{
      const data = new FormData(form);
      const rows = couples.slice(0, count).map(couple => ({
        date: String(data.get('date')),
        label: couple.label,
        scores: couple.scores.map(score => (score === '' ? '' : Number(score))),
        feedback: couple.feedback.slice(),
        sheetRow: couple.sheetRow
      }));
      const { created } = await saveEvaluationRows(rows);
      savedSnapshot = currentSnapshot();
      savedContentSnapshot = contentSnapshot();
      loadedDate = data.get('date');
      status.textContent = `저장 완료 · ${count}커플 평가를 Google Sheets에 기록했습니다.${created ? ` ${evaluationSheet} 탭을 만들었습니다.` : ''}`;
    }catch(error){status.textContent=`저장하지 못했습니다: ${error.message}`}
    finally{isSaving=false;refreshSummary()}
  });
}
