export function renderCalendar(){
  document.querySelector('#app').innerHTML = `
    <section class="page">
      <div class="hero" style="padding:35px 0 20px">
        <span class="eyebrow">MAXIMO TANGO</span>
        <h1 style="font-size:clamp(2.4rem,6vw,4.8rem)">수업 캘린더</h1>
        <p class="muted">정규 강습 · 워크샵 · 대회 준비 일정이 Google Calendar에 반영됩니다.</p>
      </div>
      <div class="card">
        <iframe
          src="https://calendar.google.com/calendar/embed?src=fhksp10k3l8ilhhe2v43q4c734%40group.calendar.google.com&ctz=Asia%2FSeoul"
          style="width:100%;height:760px;border:0;border-radius:12px;"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
      <div class="notice">일정 수정은 Google Calendar에서 관리되며, 이 페이지는 해당 캘린더를 바로 보여줍니다.</div>
    </section>
  `;
}
