export function initNav(){
  document.querySelector('#header').innerHTML=`
    <div class="nav">
      <div class="navin">
        <a class="brand" href="#/" aria-label="Maximo Tango Lab 홈">
          <img src="assets/images/maximo-tango.png" alt="MAXIMO TANGO">
        </a>
        <div class="links">
          <a href="#/calendar">수업 캘린더</a>
          <a href="#/music">Music Lab</a>
          <a href="waveform/">Waveform Lab</a>
          <a href="#/step-lab">Step Lab</a>
          <a href="#/musicality">Musicality</a>
          <a href="#/practica">Practica</a>
          <a href="#/training">Training</a>
          <a href="#/competition">Competition</a>
        </div>
      </div>
    </div>`;

  document.querySelector('#footer').innerHTML=`
    <div class="footer">
      <img src="assets/images/maximo-tango.png" alt="MAXIMO TANGO" class="footer-logo">
      <span>MAXIMO TANGO LAB · v0.3</span>
    </div>`;
}
