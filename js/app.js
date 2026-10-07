import{router}from'./core/router.js';
import{initNav}from'./ui/nav.js';
import{renderDashboard}from'./modules/dashboard/dashboard.js';
import{renderCalendar}from'./modules/calendar/calendar.js';
import{renderCompetition}from'./modules/competition/competition.js';
import{renderCompetitionScore}from'./modules/competition/evaluation.js';
import{renderMy}from'./modules/competition/my.js';
import{renderMusicLab}from'./modules/music/music.js';
import{renderPractice}from'./modules/practice/practice.js';
import{renderRhythm}from'./modules/rhythm/rhythm.js';

initNav();

router({
  '/': renderDashboard,
  '/calendar': renderCalendar,
  '/music': renderMusicLab,
  '/practice': renderPractice,
  '/rhythm': renderRhythm,
  '/competition': renderCompetition,
  '/competition-score': renderCompetitionScore,   // 선생님용 (저장 시 Google 로그인)
  '/evaluation': renderCompetitionScore,
  '/my': renderMy,                                // 학생용 읽기 전용 링크 (로그인 없음)
  // 이전 주소 호환
  '/waveform': renderMusicLab,
  '/step-lab': renderPractice,
  '/musicality': renderRhythm
});

if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
