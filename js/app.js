import{router}from'./core/router.js';
import{initNav}from'./ui/nav.js';
import{renderDashboard}from'./modules/dashboard/dashboard.js';
import{renderCalendar}from'./modules/calendar/calendar.js';
import{renderCompetition}from'./modules/competition/competition.js';
import{renderMusicLab}from'./modules/music/music.js';
import{renderWaveform}from'./modules/waveform/waveform.js';
import{renderMusicality}from'./modules/musicality/musicality.js';
import{renderStepLab}from'./modules/step-lab/stepLab.js';

initNav();

router({
  '/': renderDashboard,
  '/calendar': renderCalendar,
  '/competition': renderCompetition,
  '/music': renderMusicLab,
  '/waveform': renderWaveform,
  '/musicality': renderMusicality,
  '/step-lab': renderStepLab
});

