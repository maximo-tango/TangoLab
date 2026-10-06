import { router } from './core/router.js';
import { initNav } from './ui/nav.js';
import { renderDashboard } from './modules/dashboard/dashboard.js';
import { renderCalendar } from './modules/calendar/calendar.js';
import { renderCompetition } from './modules/competition/competition.js';
import { renderCompetitionScore } from './modules/competition/evaluation.js';
import { renderMusicLab } from './modules/music/music.js';
import { renderPractice } from './modules/practice/practice.js';
import { renderRhythm } from './modules/rhythm/rhythm.js';

initNav();

router({
  '/': renderDashboard,
  '/calendar': renderCalendar,
  '/music': renderMusicLab,
  '/practice': renderPractice,
  '/rhythm': renderRhythm,
  '/competition': renderCompetition,
  '/competition-score': renderCompetitionScore,
  '/evaluation': renderCompetitionScore,
  // 이전 주소 호환
  '/waveform': renderMusicLab,
  '/step-lab': renderPractice,
  '/musicality': renderRhythm
});
