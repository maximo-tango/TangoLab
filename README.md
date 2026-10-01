# Maximo Tango Lab

아르헨티나 탱고 강습과 대회 준비를 돕는 정적 웹앱입니다.

이 프로젝트는 GitHub Pages에서 바로 사용할 수 있는 정적 SPA 구조로 구성되어 있으며, 수업 일정, 음악/파형 학습, 대회 준비 커리큘럼을 한 곳에서 관리할 수 있게 설계했습니다.

## 프로젝트 목적

- Google Calendar 기반 수업 일정 확인
- 음악 감상 및 파형 분석을 통한 탱고 청취 학습
- 리더/팔로워 연결, 축, 방향, 회전, 공간 활용 학습
- KTC 대회 준비 커리큘럼과 체크리스트 관리

## 주요 기능

### 1. 수업 캘린더
오늘 날짜로 열리는 월간 달력입니다. 구글 캘린더 일정을 Calendar API로 읽어 표시하고(`js/config.js`의 `API_KEY` 필요), 키가 없으면 `js/data/classes.js`의 저장된 일정을 보여줍니다. 카테고리 필터, 날짜별 상세, KTC 회차 연동을 지원합니다.

### 2. Music Lab
곡 파형 위에 프레이즈 · 쉼 · 마무리를 표시하는 학습 도구입니다. 자동 분석으로 쉼/프레이즈 후보를 먼저 표시해 줍니다.

### 3. Practice Lab
KTC 회차(구간)의 훈련 포인트로 연습 루틴을 만들고, 블록별 타이머와 연습 시간 기록(최근 14일, 연속 일수)을 제공합니다.

### 4. Rhythm Lab
밀롱가 · 발스 · 탱고 박자 메트로놈과, 정박 ↔ 반박 ↔ 4박 빠우사 완급 전환 드릴을 제공합니다.

### 5. KTC 대회준비반
`js/data/curriculum.js`(엑셀 원본 기준) 5구간 13회 커리큘럼, 회차별 체크리스트, 중간 점검 자가평가, 메모를 관리합니다.

## 구글 캘린더 연동 설정

1. Google Cloud Console에서 Calendar API를 사용 설정하고 API 키를 발급합니다 (HTTP 리퍼러를 배포 주소로 제한 권장).
2. 캘린더를 공개로 설정합니다.
3. `js/config.js`의 `API_KEY`에 키를 넣습니다.

## 전체 구조

```text
TangoLab/
├─ index.html              # 앱 진입점
├─ README.md               # 프로젝트 설명
├─ assets/                 # 로고/이미지 자산
├─ css/
│  └─ style.css            # 공통 스타일
├─ js/
│  ├─ app.js               # 앱 초기화 및 라우팅
│  ├─ core/
│  │  ├─ router.js         # hash 기반 라우터
│  │  └─ storage.js       # localStorage 저장
│  ├─ modules/
│  │  ├─ calendar/
│  │  │  └─ calendar.js    # Google Calendar 임베드
│  │  ├─ competition/
│  │  │  └─ competition.js # KTC 대비 커리큘럼
│  │  ├─ dashboard/
│  │  │  └─ dashboard.js   # 메인 대시보드
│  │  ├─ music/
│  │  │  └─ music.js       # Music Lab (파형 분석)
│  │  ├─ practice/
│  │  │  └─ practice.js    # Practice Lab
│  │  └─ rhythm/
│  │     └─ rhythm.js      # Rhythm Lab
│  └─ ui/
│     └─ nav.js            # 네비게이션
└─ ...
```

## 실행 방법

```bash
cd c:\mywork\TangoLab
python -m http.server 8000
```

브라우저에서:

```text
http://localhost:8000/
```

으로 접속하면 앱을 확인할 수 있습니다.

## GitHub Pages 배포

1. 이 폴더를 저장소 루트에 업로드
2. GitHub에 푸시
3. 저장소 설정 → Pages
4. 정적 사이트 제공 설정

## 요약

이 프로젝트는 단순한 도구 모음이 아니라, 아르헨티나 탱고 강습 현장에서 바로 쓰기 좋은 학습 보조 웹앱을 목표로 구성되었습니다.

핵심은 다음과 같습니다.

- 일정 확인이 쉬움
- 음악/파형을 시각적으로 학습 가능
- 탱고의 실제 강습 요소를 반영한 Step Lab 구성
- 대회 준비를 체크리스트로 관리 가능
