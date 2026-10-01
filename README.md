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
Google Calendar 임베드를 사용해 강습 일정과 대회 준비 일정을 바로 확인할 수 있습니다.

### 2. Music Lab
브라우저에서 음악 파일을 재생하며 탱고의 리듬과 Phrase를 살펴보는 도구입니다.

### 3. Waveform Lab
파형을 통해 쉼, 프레이즈, 마무리 지점을 시각적으로 확인하고 분석하는 기능입니다.

### 4. Step Lab
아르헨티나 탱고에서 가장 중요한 축, 연결, 턴, 공간 활용을 실습하는 실험실입니다.

### 5. Musicality Trainer
Walk, Pause, Texture, Phrase, Rhythm 같은 음악적 요소를 점검하는 훈련 기능입니다.

### 6. Competition Planner
13주 KTC 대비 커리큘럼을 기준으로 개인 체크리스트를 관리합니다.

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
│  │  │  └─ music.js       # Music Lab
│  │  ├─ musicality/
│  │  │  └─ musicality.js  # Musicality Trainer
│  │  ├─ step-lab/
│  │  │  └─ stepLab.js     # Step Lab
│  │  └─ waveform/
│  │     └─ waveform.js    # 파형 분석 모듈
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

## 변경 사항 반영 포인트

- 수업 일정: Google Calendar 임베드 연결
- Step Lab: 축/연결/턴/공간 활용 중심으로 재설계
- Competition Planner: 13주 KTC 대비 커리큘럼 기반
- TRAINING / PRACTICA 기능은 현재 구조에서 제외

## 요약

이 프로젝트는 단순한 도구 모음이 아니라, 아르헨티나 탱고 강습 현장에서 바로 쓰기 좋은 학습 보조 웹앱을 목표로 구성되었습니다.

핵심은 다음과 같습니다.

- 일정 확인이 쉬움
- 음악/파형을 시각적으로 학습 가능
- 탱고의 실제 강습 요소를 반영한 Step Lab 구성
- 대회 준비를 체크리스트로 관리 가능
