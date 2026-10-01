// 구글 캘린더 연동 설정
// 1) Google Cloud Console에서 Calendar API 사용 설정 후 API 키 발급 (HTTP 리퍼러를 배포 주소로 제한 권장)
// 2) 해당 캘린더를 '공개'로 설정 (설정 및 공유 > 일반 액세스 권한)
export const CALENDAR_ID='fhksp10k3l8ilhhe2v43q4c734@group.calendar.google.com';
export const API_KEY='';           // 여기에 API 키를 넣으면 구글 캘린더 일정이 실시간으로 반영됩니다
export const TZ='Asia/Seoul';
export const KTC_DATE='2027-02-27'; // KTC 대회일
export const SHEETS_CLIENT_ID='876112729632-o6c5ngvuej3mt1vrmv43r4blobbqvu7n.apps.googleusercontent.com'; // Google OAuth 웹 클라이언트 ID
export const SHEETS_SPREADSHEET_ID='19URsx1O01sRxWsGHcYa27Z0mJIEAGN77c7AWQkYkB70'; // 평가 기록을 저장할 스프레드시트 ID
