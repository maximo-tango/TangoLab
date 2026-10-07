// Google Sheets 연동 (선생님 화면 전용) — 로그인·API 호출·시트 읽기/쓰기
import{SHEETS_CLIENT_ID,SHEETS_SPREADSHEET_ID}from'../config.js';
export const configured=()=>!!(SHEETS_CLIENT_ID&&SHEETS_SPREADSHEET_ID);
const SHEET='커플 평가 데이터',STUDENTS='수강생';
const H=['일자','이름','자세와 축의 안정성','테크닉','음악적 해석과 뉘앙스','론다운용','자세와 축의 안정성 피드백','테크닉 피드백','뮤지컬리티 피드백','론다운용 피드백'];
const LEGACY=['일자','이름','(기세)턱/시선 처리','아브라소/자세','피봇 & 턴 안정성','합계','걷기와 멈춤','회전, (사까다)히로','강약 조절','합계','프레이즈','빠우사','악단별 특징 표현','합계','간격유지','공간운용(이탈)','진행능력','합계','자세와 축의 안정성 피드백','테크닉 피드백','뮤지컬리티 피드백','론다운용 피드백'];
export const normalizeName=v=>String(v??'').trim().replace(/\s+/g,' ').toLocaleLowerCase();
export const sheetDate=v=>{
  if(typeof v==='number'&&Number.isFinite(v))return new Date(Date.UTC(1899,11,30)+Math.floor(v)*864e5).toISOString().slice(0,10);
  const m=String(v??'').trim().match(/^(\d{4})[-/.]\s*(\d{1,2})[-/.]\s*(\d{1,2})/);
  return m?`${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`:String(v??'').trim();
};
const base=()=>`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(SHEETS_SPREADSHEET_ID)}`;
const rng=(tab,r)=>`${base()}/values/${encodeURIComponent(`'${tab}'!${r}`)}`;
const modeOf=h=>{const ok=e=>e.every((l,i)=>String(h[i]??'').trim()===l);return ok(H)?'simple':ok(LEGACY)?'legacy':null};

// ---- 로그인(토큰) ----
let gsi=null;
const loadGsi=()=>window.google?.accounts?.oauth2?Promise.resolve():gsi||(gsi=new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=ok;s.onerror=()=>{gsi=null;no(new Error('Google 로그인 서비스를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.'))};document.head.appendChild(s)}));
export const preload=()=>{if(configured())loadGsi().catch(()=>{})};
let token='',exp=0,client=null,pending=null,res=null,rej=null;
async function getToken(){
  if(token&&Date.now()<exp)return token;
  token='';
  await loadGsi();
  const oauth=window.google?.accounts?.oauth2;
  if(!oauth)throw new Error('Google 로그인 서비스를 불러오지 못했습니다. 페이지를 새로고침해 주세요.');
  const done=(f,v)=>{const g=f==='ok'?res:rej;res=rej=pending=null;g?.(v)};
  if(!client)client=oauth.initTokenClient({client_id:SHEETS_CLIENT_ID,scope:'https://www.googleapis.com/auth/spreadsheets',
    callback:r=>{if(r.error){done('no',new Error(r.error_description||r.error));return}token=r.access_token;exp=Date.now()+(Number(r.expires_in)||3600)*1000-60000;done('ok',token)},
    error_callback:e=>done('no',new Error(e.message||'Google 로그인을 완료하지 못했습니다.'))});
  if(pending)return pending;
  pending=new Promise((a,b)=>{res=a;rej=b});
  try{client.requestAccessToken({prompt:''})}catch(e){done('no',e)}
  return pending;
}
async function api(url,opt={}){
  const t=await getToken();
  const r=await fetch(url,{...opt,headers:{Authorization:`Bearer ${t}`,...opt.headers}});
  const j=await r.json().catch(()=>({}));
  if(!r.ok){if(r.status===401){token='';exp=0}throw new Error(`${j.error?.message||'Google Sheets API 오류'} (HTTP ${r.status})`)}
  return j;
}
const json=(method,body)=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});

// ---- 읽기 ---- 시트가 "링크가 있는 사용자 읽기"로 공개돼 있으면 로그인 없이, 아니면 Google 로그인으로 읽는다
export function parseCsv(text){
  const rows=[];let row=[],f='',q=false;const t=String(text||'').replace(/^\uFEFF/,'');
  for(let i=0;i<t.length;i++){const c=t[i];
    if(c==='"'){if(q&&t[i+1]==='"'){f+='"';i++}else q=!q}
    else if(!q&&c===','){row.push(f);f=''}
    else if(!q&&(c==='\n'||c==='\r')){if(c==='\r'&&t[i+1]==='\n')i++;row.push(f);rows.push(row);row=[];f=''}
    else f+=c}
  if(f!==''||row.length){row.push(f);rows.push(row)}
  return rows;
}
let publicOff=false; // 공개 읽기가 막혀 있으면 이후부터 바로 로그인 방식
async function readPublic(tab){
  const r=await fetch(`https://docs.google.com/spreadsheets/d/${encodeURIComponent(SHEETS_SPREADSHEET_ID)}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`,{credentials:'omit'});
  if(!r.ok)throw new Error('공개 시트 읽기 실패 ('+r.status+')');
  const t=await r.text();
  if(/^\s*<(!doctype|html)/i.test(t))throw new Error('비공개 시트');
  return parseCsv(t);
}
export function parseStudentNames(rows){
  if(!rows.length)return[];
  const hd=(rows[0]||[]).map(v=>String(v??'').trim().toLocaleLowerCase().replace(/\s+/g,''));
  const f=p=>hd.findIndex(v=>p.test(v));
  const cp=f(/^(커플명|커플이름|커플|팀명|팀)$/),ld=f(/리더|남자|남성|leader/),fl=f(/팔로워|여자|여성|follower/),nm=f(/이름|성명|수강생|학생|name/);
  const has=cp>=0||ld>=0||fl>=0||nm>=0;
  const names=rows.slice(has?1:0).map(r=>{const v=c=>String(r[c]??'').trim();
    if(cp>=0)return v(cp);if(ld>=0&&fl>=0)return[v(ld),v(fl)].filter(Boolean).join(' / ');if(nm>=0)return v(nm);return v(0)}).filter(Boolean);
  return[...new Set(names)];
}
export async function readStudents(){
  if(!publicOff)try{return parseStudentNames(await readPublic(STUDENTS))}catch{publicOff=true}
  const r=await api(`${rng(STUDENTS,'A1:Z500')}?valueRenderOption=UNFORMATTED_VALUE`);
  return parseStudentNames(r.values||[]);
}
const num=v=>v==null||v===''||!(Number(v)>=0&&Number(v)<=10)?null:Number(v);
function toRecords(v,mode){
  const si=mode==='legacy'?[5,9,13,17]:[2,3,4,5],fs=mode==='legacy'?18:6,records=[];
  v.slice(1).forEach((row,i)=>{
    const date=sheetDate(row[0]),name=String(row[1]??'').trim();
    if(!date||!name)return;
    records.push({date,name,scores:si.map(c=>num(row[c])),feedback:[0,1,2,3].map(k=>String(row[fs+k]??'')),sheetRow:i+2});
  });
  return records.sort((a,b)=>a.date.localeCompare(b.date));
}
// 전체 평가 기록 → {records:[{date,name,scores[4]|null,feedback[4],sheetRow}],mode,missing,via}
// api:true 이면 공개 읽기를 건너뛰고 로그인으로 읽는다 (저장 직후처럼 최신 값이 꼭 필요할 때)
export async function readAll({api:forceApi=false}={}){
  if(!forceApi&&!publicOff)try{
    const v=await readPublic(SHEET),mode=modeOf(v[0]||[]);
    if(mode)return{records:toRecords(v,mode),mode,missing:false,via:'public'};
  }catch{publicOff=true}
  const meta=await api(`${base()}?fields=${encodeURIComponent('sheets.properties.title')}`);
  if(!meta.sheets?.some(s=>s.properties?.title===SHEET))return{records:[],mode:'simple',missing:true,via:'login'};
  const r=await api(`${rng(SHEET,'A1:V')}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER`);
  const v=r.values||[],hd=v[0]||[];
  if(!hd.length)return{records:[],mode:'simple',missing:false,via:'login'};
  const mode=modeOf(hd);
  if(!mode)throw new Error(`'${SHEET}' 탭의 첫 행이 맞지 않습니다. 10열(새 형식) 또는 22열(이전 형식)인지 확인해 주세요.`);
  return{records:toRecords(v,mode),mode,missing:false,via:'login'};
}

// ---- 쓰기 ---- items:[{name,scores:['',..],feedback:[..],sheetRow}]
export async function save(date,items){
  const meta=await api(`${base()}?fields=${encodeURIComponent('sheets.properties.title')}`);
  let created=false;
  if(!meta.sheets?.some(s=>s.properties?.title===SHEET)){
    await api(`${base()}:batchUpdate`,json('POST',{requests:[{addSheet:{properties:{title:SHEET,gridProperties:{rowCount:1000,columnCount:10}}}}]}));created=true;
  }
  let r=await api(`${rng(SHEET,'A1:V')}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER`);
  let v=r.values||[];
  if(!(v[0]||[]).length){await api(`${rng(SHEET,'A1:J1')}?valueInputOption=RAW`,json('PUT',{majorDimension:'ROWS',values:[H]}));v=[H]}
  const mode=modeOf(v[0]);
  if(!mode)throw new Error(`'${SHEET}' 탭의 첫 행이 맞지 않습니다.`);
  const ex=v.slice(1).map((row,i)=>({date:sheetDate(row[0]),key:normalizeName(row[1]),row:i+2,used:false}));
  const sc=x=>x===''||x==null?'':Number(x),upd=[],app=[];
  items.forEach(c=>{
    const row=mode==='legacy'?[date,c.name,'','','',sc(c.scores[0]),'','','',sc(c.scores[1]),'','','',sc(c.scores[2]),'','','',sc(c.scores[3]),...c.feedback]:[date,c.name,...c.scores.map(sc),...c.feedback];
    const m=ex.find(e=>!e.used&&e.date===date&&e.row===c.sheetRow)||ex.find(e=>!e.used&&e.date===date&&e.key===normalizeName(c.name));
    if(m){m.used=true;upd.push({range:`'${SHEET}'!A${m.row}:${mode==='legacy'?'V':'J'}${m.row}`,majorDimension:'ROWS',values:[row]})}else app.push(row);
  });
  if(upd.length)await api(`${base()}/values:batchUpdate`,json('POST',{valueInputOption:'RAW',data:upd}));
  if(app.length)await api(`${rng(SHEET,mode==='legacy'?'A1:V':'A1:J')}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,json('POST',{majorDimension:'ROWS',values:app}));
  return{created,updated:upd.length,appended:app.length};
}
