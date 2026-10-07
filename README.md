# Maximo Tango Lab

아르헨티나 탱고 수업 준비와 연습, 평가를 한 곳에서 관리하는 정적 웹앱입니다. GitHub Pages에서 그대로 동작하고, 홈 화면에 설치(PWA)해 앱처럼 쓸 수 있습니다.

## 화면

| 주소 | 화면 | 대상 |
|---|---|---|
| `#/` | 대시보드 (다음 수업, D-day, 이번 주 일정) | 모두 |
| `#/calendar` | 수업 캘린더 (월간, 분류 필터, KTC 회차 연동) | 모두 |
| `#/music` | Music Lab — 파형 위에 프레이즈·쉼·마무리 표시, 자동 분석 | 모두 |
| `#/practice` | Practice Lab — 회차별 연습 루틴, 타이머, 연습 기록 | 모두 |
| `#/rhythm` | Rhythm Lab — 박자 메트로놈, 완급 전환(빠우사) 드릴 | 모두 |
| `#/competition` | KTC 대회준비반 — 5구간 13회 커리큘럼 | 모두 |
| `#/competition-score` (`#/evaluation`) | 커플별 평가 — 점수 입력, 추이·비교, 학생 링크 만들기 | 선생님 (저장 시 Google 로그인) |
| `#/my?d=…` | 내 결과 — 읽기 전용 | 학생 (로그인 없음, 링크로만) |

## 일정 수정: `js/data/calendar.md`

수업 일정은 이 파일 한 곳에서만 관리합니다. 한 줄에 일정 하나입니다.

```
- 2026-11-15 | 💥막시모 KTC 대회준비반1 | 16:30 - 18:30 | competition
```

- 시간: `14:00 - 16:00` (비우면 종일). 여러 날은 `11:00 - 20:00 (+1일)`
- 분류: `competition technique essential tanguera training practica show off other` (비우면 제목으로 자동 분류)
- 이 저장소가 공개라면 **개인 일정은 넣지 마세요.** 파일 전체가 공개됩니다.

## 커플 평가 (Google Sheets)

설정은 `js/config.js` (`SHEETS_CLIENT_ID`, `SHEETS_SPREADSHEET_ID`)에 있습니다.

- 스프레드시트에 `수강생` 탭(커플 이름 열)이 있어야 하고, `커플 평가 데이터` 탭은 첫 저장 때 자동으로 만들어집니다.
- 열 구성(10열): 일자, 이름, 4개 항목 점수, 4개 항목 피드백. 이전 22열 형식도 읽습니다.
- 점수를 하나 이상 입력한 커플만 저장하고, 같은 날짜·이름은 수정합니다. 커플 수 제한은 없습니다.
- **추이 · 공유** 탭에서 커플별 점수 추이, 두 날짜 비교(반 평균 포함), 보완 연습 추천을 봅니다. 평가 항목과 추천 문구는 `js/data/rubric.js`에서 수정합니다.

### 시트 공개 여부에 따른 동작

| 시트 공유 설정 | 조회 | 저장 | 학생 |
|---|---|---|---|
| **링크가 있는 사용자 읽기(공개)** | 로그인 없이 | Google 로그인 | 평가 화면에서 직접 조회 가능 |
| **비공개(권장)** | 선생님만 로그인해서 | Google 로그인 | `내 결과` 링크로만 (아래) |

공개로 두면 UI에서 한 커플만 보여줘도 시트의 모든 탭(수강생 이름, 전 커플의 점수·피드백)을 링크를 아는 사람이 읽을 수 있습니다. 이 저장소가 공개면 시트 ID도 공개이므로 사실상 누구나 읽을 수 있다고 보세요. 비공개로 바꾸면 앱이 자동으로 로그인 방식으로 읽습니다. (평가 조회 때 한 번 로그인)

### 학생에게 결과 보내기

선생님 화면에서 `이 커플 링크 복사`를 눌러 메신저로 보냅니다. 학생은 로그인 없이 링크만 열면 됩니다.

- 링크 안에 해당 커플의 점수가 담겨 있어 서버나 공개 시트가 필요 없고, 다른 커플의 데이터는 들어 있지 않습니다. (반 평균만 포함)
- 링크를 받은 사람은 누구나 볼 수 있으니 단체방에는 올리지 마세요. 이미 보낸 링크를 무효로 만들 수는 없습니다.
- 새 평가를 입력하면 새 링크를 다시 보내야 합니다. 피드백은 최근 3회분만 담깁니다.

## 구조

```text
index.html · manifest.webmanifest · sw.js   # 진입점, 홈 화면 설치, 오프라인 지원 (온라인이면 항상 최신 파일)
css/style.css · competition.css
js/
├─ app.js · config.js
├─ core/       router · mount · storage · sheets(Google) · share(학생 링크)
├─ data/       calendar.md(일정) · calendar.js · curriculum.js(KTC 커리큘럼) · rubric.js(평가 항목)
├─ ui/         nav · charts
└─ modules/    calendar · dashboard · music · practice · rhythm · competition(커리큘럼·평가·내 결과)
```

## 실행 · 배포

```bash
python -m http.server 8000   # http://localhost:8000/
```

`main`에 푸시하면 GitHub Actions(`.github/workflows/pages.yml`)가 Pages로 배포합니다.
