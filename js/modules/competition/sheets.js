import { SHEETS_CLIENT_ID, SHEETS_SPREADSHEET_ID } from '../../config.js';

export const evaluationSheet = '커플 평가 데이터';
export const sheetHeaders = ['일자', '이름', '자세와 축의 안정성', '테크닉', '음악적 해석과 뉘앙스', '론다운용', '자세와 축의 안정성 피드백', '테크닉 피드백', '뮤지컬리티 피드백', '론다운용 피드백'];
export const legacySheetHeaders = ['일자', '이름', '(기세)턱/시선 처리', '아브라소/자세', '피봇 & 턴 안정성', '합계', '걷기와 멈춤', '회전, (사까다)히로', '강약 조절', '합계', '프레이즈', '빠우사', '악단별 특징 표현', '합계', '간격유지', '공간운용(이탈)', '진행능력', '합계', '자세와 축의 안정성 피드백', '테크닉 피드백', '뮤지컬리티 피드백', '론다운용 피드백'];

let accessToken = '';
let accessTokenExpiresAt = 0;
let tokenClient = null;
let tokenRequest = null;
let tokenResolve = null;
let tokenReject = null;

const spreadsheetUrl = () => `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(SHEETS_SPREADSHEET_ID)}`;
export const sheetUrl = (tab, range) => `${spreadsheetUrl()}/values/${encodeURIComponent(`'${tab}'!${range}`)}`;

export const sheetDate = value => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 864e5).toISOString().slice(0, 10);
  }
  const match = String(value ?? '').trim().match(/^(\d{4})[-/.]\s*(\d{1,2})[-/.]\s*(\d{1,2})/);
  return match ? `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}` : String(value ?? '').trim();
};

export function normalizeName(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

export function parseStudentNames(rows) {
  if (!rows.length) return [];
  const headers = (rows[0] || []).map(value => String(value ?? '').trim().toLocaleLowerCase().replace(/\s+/g, ''));
  const find = pattern => headers.findIndex(value => pattern.test(value));
  const coupleColumn = find(/^(커플명|커플이름|커플|팀명|팀)$/);
  const leaderColumn = find(/리더|남자|남성|leader/);
  const followerColumn = find(/팔로워|여자|여성|follower/);
  const nameColumn = find(/이름|성명|수강생|학생|name/);
  const hasHeader = coupleColumn >= 0 || leaderColumn >= 0 || followerColumn >= 0 || nameColumn >= 0;
  const data = rows.slice(hasHeader ? 1 : 0);
  const names = data.map(row => {
    const value = column => String(row[column] ?? '').trim();
    if (coupleColumn >= 0) return value(coupleColumn);
    if (leaderColumn >= 0 && followerColumn >= 0) return [value(leaderColumn), value(followerColumn)].filter(Boolean).join(' / ');
    if (nameColumn >= 0) return value(nameColumn);
    return value(0);
  }).filter(Boolean);

  return [...new Set(names)];
}

export const getAccessToken = () => {
  if (accessToken && Date.now() < accessTokenExpiresAt) return Promise.resolve(accessToken);
  accessToken = '';
  const oauth = window.google?.accounts?.oauth2;
  if (!oauth) return Promise.reject(new Error('Google 로그인 서비스를 불러오지 못했습니다. 페이지를 새로고침해 주세요.'));

  if (!tokenClient) {
    tokenClient = oauth.initTokenClient({
      client_id: SHEETS_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      callback: response => {
        const resolve = tokenResolve;
        const reject = tokenReject;
        tokenResolve = null;
        tokenReject = null;
        tokenRequest = null;
        if (response.error) {
          reject?.(new Error(response.error_description || response.error));
          return;
        }
        accessToken = response.access_token;
        accessTokenExpiresAt = Date.now() + (Number(response.expires_in) || 3600) * 1000 - 60000;
        resolve?.(accessToken);
      },
      error_callback: error => {
        const reject = tokenReject;
        tokenResolve = null;
        tokenReject = null;
        tokenRequest = null;
        reject?.(new Error(error.message || 'Google 로그인을 완료하지 못했습니다.'));
      }
    });
  }

  if (tokenRequest) return tokenRequest;

  const request = new Promise((resolve, reject) => {
    tokenResolve = resolve;
    tokenReject = reject;
  });

  tokenRequest = request;
  try {
    tokenClient.requestAccessToken({ prompt: '' });
  } catch (error) {
    const reject = tokenReject;
    tokenResolve = null;
    tokenReject = null;
    tokenRequest = null;
    reject?.(error);
  }

  return request;
};

export async function sheetsApi(url, options = {}) {
  const token = await getAccessToken();
  const response = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) }
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      accessToken = '';
      accessTokenExpiresAt = 0;
    }
    throw new Error(`${result.error?.message || `Google Sheets API 오류 (${response.status})`} (HTTP ${response.status})`);
  }

  return result;
}

export async function readEvaluationSheet(createIfMissing = false) {
  const metadata = await sheetsApi(`${spreadsheetUrl()}?fields=${encodeURIComponent('sheets.properties.title')}`);
  const exists = metadata.sheets?.some(sheet => sheet.properties?.title === evaluationSheet);

  if (!exists && !createIfMissing) return { values: [sheetHeaders], mode: 'simple', missing: true };

  let created = false;
  if (!exists) {
    await sheetsApi(`${spreadsheetUrl()}:batchUpdate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title: evaluationSheet, gridProperties: { rowCount: 1000, columnCount: 10 } } } }] })
    });
    created = true;
  }

  const result = await sheetsApi(`${sheetUrl(evaluationSheet, 'A1:V')}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER`);
  const values = result.values || [];
  const header = values[0] || [];

  if (!header.length && createIfMissing) {
    await sheetsApi(`${spreadsheetUrl()}/values/${encodeURIComponent(`'${evaluationSheet}'!A1:J1`)}?valueInputOption=RAW`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ majorDimension: 'ROWS', values: [sheetHeaders] })
    });
    return { values: [sheetHeaders], mode: 'simple', created };
  }

  const matches = expected => expected.every((label, index) => String(header[index] ?? '').trim() === label);
  if (matches(sheetHeaders)) return { values, mode: 'simple', created };
  if (matches(legacySheetHeaders)) return { values, mode: 'legacy', created };

  throw new Error(`${evaluationSheet} 탭의 첫 행이 맞지 않습니다. 새 10열 형식 또는 이전 22열 형식을 확인해 주세요.`);
}

export async function readStudentNames() {
  const result = await sheetsApi(`${sheetUrl('수강생', 'A1:Z500')}?valueRenderOption=UNFORMATTED_VALUE`);
  return parseStudentNames(result.values || []);
}

export async function saveEvaluationRows(rows) {
  const { values, mode, created } = await readEvaluationSheet(true);
  const existing = values.slice(1).map((row, index) => ({ date: sheetDate(row[0]), name: String(row[1] || ''), sheetRow: index + 2, used: false }));
  const updates = [];
  const appends = [];
  const appendedCouples = [];

  rows.forEach(couple => {
    const row = mode === 'legacy'
      ? [couple.date, couple.label, '', '', '', couple.scores[0] ?? '', '', '', '', couple.scores[1] ?? '', '', '', '', couple.scores[2] ?? '', '', '', '', couple.scores[3] ?? '', ...couple.feedback]
      : [couple.date, couple.label, ...(couple.scores || []).map(score => score ?? ''), ...(couple.feedback || [])];

    let match = existing.find(record => !record.used && record.sheetRow === couple.sheetRow && record.date === couple.date);
    if (!match) match = existing.find(record => !record.used && record.date === couple.date && normalizeName(record.name) === normalizeName(couple.label));

    if (match) {
      match.used = true;
      updates.push({ range: `'${evaluationSheet}'!A${match.sheetRow}:${mode === 'legacy' ? 'V' : 'J'}${match.sheetRow}`, majorDimension: 'ROWS', values: [row] });
      couple.sheetRow = match.sheetRow;
    } else {
      appends.push(row);
      appendedCouples.push(couple);
    }
  });

  if (updates.length) {
    await sheetsApi(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(SHEETS_SPREADSHEET_ID)}/values:batchUpdate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valueInputOption: 'RAW', data: updates })
    });
  }

  if (appends.length) {
    const range = encodeURIComponent(mode === 'legacy' ? `'${evaluationSheet}'!A1:V` : `'${evaluationSheet}'!A1:J`);
    const result = await sheetsApi(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(SHEETS_SPREADSHEET_ID)}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ majorDimension: 'ROWS', values: appends })
    });
    const firstRow = Number(result.updates?.updatedRange?.match(/!A(\d+)/)?.[1]);
    if (firstRow) appendedCouples.forEach((couple, index) => { couple.sheetRow = firstRow + index; });
  }

  return { created };
}
