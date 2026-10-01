# Maximo Tango Lab v0.3

GitHub Pages static web app for Maximo Tango.

## Added in v0.3
- Maximo Tango Lab dashboard
- 수업 캘린더: Tanguera / Essential / 땅게로 Solo Training / KTC Preparation / 휴강
- Competition Planner: 13주 KTC preparation checklist with local progress saving
- Music Lab, Step Lab, Musicality Trainer, Practica Timer, Training Log

## GitHub Pages
Upload the contents of this folder to the repository root, push to `main`, then set Settings → Pages → Source to **GitHub Actions**.

## Edit data
- Classes: `js/data/classes.js`
- Competition plan: `js/modules/competition/competition.js`

## v0.3 additions

- Attached **MAXIMO TANGO** logo applied as the site-wide brand asset.
- Favicon / Apple Touch Icon generated from the supplied logo.
- Added `waveform/` as **Tango Waveform Lab**, based on the supplied `탱고 파형 학습.html`.
- Dashboard and navigation now expose Waveform Lab directly.
- Shared logo asset: `assets/images/maximo-tango.png`.

### Waveform Lab
The original waveform-learning tool is kept as a standalone static page so it can run directly on GitHub Pages without changing its browser-side audio analysis behavior.
