export function renderWaveform(){
  document.querySelector('#app').innerHTML = `
    <style>
      .waveform-shell{max-width:1180px;margin:0 auto;padding:0 22px 32px}
      .waveform-hero{background:#000;color:#fff;padding:28px 0 46px;clip-path:polygon(0 0,100% 0,100% 100%,0 calc(100% - 36px));margin-bottom:18px}
      .waveform-hero-inner{max-width:1180px;margin:0 auto;padding:0 22px;display:flex;align-items:center;gap:22px;flex-wrap:wrap}
      .waveform-hero img{height:92px;width:auto;filter:invert(1)}
      .waveform-hero h1{font-size:30px;font-style:italic;font-weight:600;margin:0;letter-spacing:-.02em}
      .waveform-hero p{margin:4px 0 0;color:#b9bcc6;max-width:48ch;font-size:14px}
      .waveform-panel{background:#15171b;border:1px solid #30343b;border-radius:12px;padding:14px;margin-bottom:14px;color:#f5f3ed}
      .waveform-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
      .waveform-drop{border:2px dashed #ff4d38;border-radius:10px;padding:26px;text-align:center;color:#b9bcc6;background:#0b0b0e}
      .waveform-drop.on{border-color:#fff;color:#fff}
      .waveform-drop input{color:#fff}
      button,select,input[type=file]{font:inherit;color:#f5f3ed}
      button{background:#15171b;border:1px solid #30343b;border-radius:8px;padding:8px 12px;cursor:pointer;min-height:40px}
      button:hover{border-color:#9da1a8}
      button:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid #9aa6ff;outline-offset:2px}
      button.primary{background:#ff4d38;border-color:#ff4d38;color:#000;font-weight:600;font-size:16px;min-height:46px;padding:8px 24px;transform:skewX(-10deg)}
      button.btnmk{background:#0b0b0e;color:#fff;border:1px solid #2a2a33;border-left:6px solid var(--c);font-weight:600;transform:skewX(-10deg)}
      .waveform-drop p,.waveform-drop input{color:#fff}
      #waveform-scroll{overflow-x:auto;border:1px solid #000;border-radius:8px;background:#09090c}
      #waveform-inner{position:relative;height:190px}
      #waveform-cv{display:block;height:190px}
      #waveform-bands,#waveform-marks{position:absolute;inset:0;pointer-events:none}
      .waveform-band{position:absolute;top:0;bottom:22px;background:rgba(255,77,56,.22)}
      .waveform-mk{position:absolute;top:0;bottom:22px;width:0;border-left:2px solid var(--c);pointer-events:auto;cursor:pointer}
      .waveform-mk span{position:absolute;top:2px;left:3px;background:var(--c);color:#fff;font-size:11px;line-height:1;padding:3px 5px;border-radius:3px;white-space:nowrap}
      #waveform-head{position:absolute;top:0;bottom:0;width:2px;background:#fff;pointer-events:none;box-shadow:0 0 10px #fff}
      .waveform-now{display:flex;gap:16px;flex-wrap:wrap;align-items:baseline;margin:10px 0 2px}
      #waveform-clock{font-variant-numeric:tabular-nums;font-size:36px;font-style:italic;font-weight:600;line-height:1}
      #waveform-next{font-size:22px;font-style:italic;font-weight:600}
      .waveform-dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;background:var(--c)}
      .t-phrase{--c:#2ee6d0}.t-break{--c:#ff4d38}.t-end{--c:#ffc23d}
      table{width:100%;border-collapse:collapse}
      td{padding:6px 4px;border-top:1px solid #30343b;vertical-align:middle}
      td input{font:inherit;color:inherit;background:transparent;border:1px solid transparent;border-radius:6px;padding:4px;width:100%}
      td input:focus{border-color:#30343b}
      .waveform-tm{font-variant-numeric:tabular-nums;white-space:nowrap}
      textarea{width:100%;min-height:90px;font:12px/1.4 ui-monospace,monospace;background:#09090c;color:#f5f3ed;border:1px solid #30343b;border-radius:8px;padding:8px}
      small,.waveform-hint{color:#9da1a8}
      [hidden]{display:none!important}
      @media (max-width: 520px){
        .waveform-shell{padding-left:15px;padding-right:15px}
        .waveform-hero-inner{padding:0 15px}
      }
    </style>

    <div class="waveform-hero">
      <div class="waveform-hero-inner">
        <img alt="MAXIMO TANGO" src="assets/images/maximo-tango.png">
        <div>
          <h1>탱고 파형 학습</h1>
          <p>곡을 불러오면 파형이 그려지고, 재생하면서 프레이즈·쉼·마무리 지점을 찍을 수 있어요. 음악 파일은 이 기기 안에서만 열리고 어디에도 올라가지 않아요.</p>
        </div>
      </div>
    </div>

    <div class="waveform-shell">
      <div id="waveform-drop" class="waveform-drop waveform-panel">
        <p style="margin:0 0 10px">음악 파일(mp3, wav, m4a)을 여기에 끌어놓거나 선택하세요</p>
        <input id="waveform-file" type="file" accept="audio/*">
      </div>

      <section id="waveform-app" hidden>
        <div class="waveform-panel">
          <div class="waveform-row" style="margin-bottom:10px">
            <button id="waveform-play" class="primary" style="min-width:84px">재생</button>
            <select id="waveform-rate" aria-label="재생 속도">
              <option value="0.5">0.5배속</option>
              <option value="0.75">0.75배속</option>
              <option value="1" selected>1배속</option>
            </select>
            <label class="waveform-hint">확대 <input id="waveform-zoom" type="range" min="10" max="140" value="40"></label>
            <label class="waveform-hint"><input id="waveform-cand" type="checkbox"> 쉼 후보 보기</label>
          </div>
          <div id="waveform-scroll"><div id="waveform-inner"><canvas id="waveform-cv"></canvas><div id="waveform-bands"></div><div id="waveform-marks"></div><div id="waveform-head"></div></div></div>
          <div class="waveform-now"><span id="waveform-clock">0:00.0</span><span id="waveform-next" class="waveform-hint">다음 쉼까지 -</span></div>
          <p class="waveform-hint" style="margin:0">파형을 누르면 그 위치로 이동해요. 재생 중 단축키: P 프레이즈, B 쉼, E 마무리, 스페이스 재생/정지.</p>
        </div>

        <div class="waveform-panel">
          <div class="waveform-row">
            <button class="btnmk t-phrase" data-type="phrase">프레이즈 찍기 (P)</button>
            <button class="btnmk t-break" data-type="break">쉼 찍기 (B)</button>
            <button class="btnmk t-end" data-type="end">마무리 찍기 (E)</button>
          </div>
          <div class="waveform-row" style="margin-top:10px">
            <button id="waveform-auto">자동 분석으로 표시</button>
            <label class="waveform-hint">민감도 <select id="waveform-sens"><option value="0.7">낮음</option><option value="1" selected>보통</option><option value="1.4">높음</option></select></label>
            <button id="waveform-clr">자동 표시 지우기</button>
          </div>
          <p id="waveform-amsg" class="waveform-hint" style="margin:8px 0 0"></p>
          <table id="waveform-list" aria-label="표시한 지점"></table>
          <p id="waveform-empty" class="waveform-hint" style="margin:8px 0 0">아직 찍은 지점이 없어요. 재생하다가 버튼이나 단축키로 표시해 보세요.</p>
        </div>

        <div class="waveform-panel">
          <div class="waveform-row" style="margin-bottom:8px">
            <button id="waveform-exp">지점 복사하기</button>
            <button id="waveform-imp">붙여넣은 지점 불러오기</button>
            <small id="waveform-msg"></small>
          </div>
          <textarea id="waveform-io" placeholder="복사한 지점 데이터가 여기에 나타나요. 학생에게 보낼 때는 이 내용을 전달하고, 받은 사람은 여기에 붙여넣어 불러오세요." spellcheck="false"></textarea>
        </div>
      </section>
    </div>
  `;

  initWaveformApp();
}

function initWaveformApp(){
  const $ = (id) => document.getElementById(id);
  const TYPES = { phrase: '프레이즈', break: '쉼', end: '마무리' };
  const audio = new Audio();
  let buf = null;
  let peaks = null;
  let dur = 0;
  let pps = 40;
  let marks = [];
  let cands = [];
  let key = '';
  let rms = null;

  const cv = $('waveform-cv');
  const ctx = cv.getContext('2d');
  const inner = $('waveform-inner');
  const scroll = $('waveform-scroll');

  const fmt = (t) => {
    const m = Math.floor(t / 60);
    const s = t - m * 60;
    return `${m}:${(s < 10 ? '0' : '') + s.toFixed(1)}`;
  };

  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  function loadFile(file){
    if (!file) return;
    const url = URL.createObjectURL(file);
    audio.src = url;
    audio.preservesPitch = true;

    const reader = new FileReader();
    reader.onload = function(){
      const AC = window.AudioContext || window.webkitAudioContext;
      const ac = new AC();
      ac.decodeAudioData(reader.result, function(buffer){
        buf = buffer;
        dur = buffer.duration;
        analyze();
        key = 'tw:' + file.name + ':' + Math.round(dur);
        try { marks = JSON.parse(localStorage.getItem(key) || '[]'); }
        catch (e) { marks = []; }
        $('waveform-drop').hidden = true;
        $('waveform-app').hidden = false;
        fit();
        if (!marks.length) autoRun();
        draw();
        renderMarks();
        tick();
        ac.close();
      }, function(){
        alert('이 파일은 열 수 없어요. mp3, wav, m4a 파일로 다시 시도해 보세요.');
      });
    };
    reader.readAsArrayBuffer(file);
  }

  function analyze(){
    const n = buf.length;
    const ch = buf.numberOfChannels;
    const sr = buf.sampleRate;
    const data = [];
    for (let c = 0; c < ch; c++) data.push(buf.getChannelData(c));

    const blk = Math.floor(sr / 100);
    const cnt = Math.floor(n / blk);
    peaks = new Float32Array(cnt * 2);
    rms = new Float32Array(cnt);

    for (let i = 0; i < cnt; i++) {
      let mn = 1;
      let mx = -1;
      let sum = 0;
      for (let j = i * blk; j < (i + 1) * blk; j += 2) {
        let v = 0;
        for (let c2 = 0; c2 < ch; c2++) v += data[c2][j];
        v /= ch;
        if (v < mn) mn = v;
        if (v > mx) mx = v;
        sum += v * v;
      }
      peaks[i * 2] = mn;
      peaks[i * 2 + 1] = mx;
      rms[i] = Math.sqrt(sum / (blk / 2));
    }

    const w = 5;
    const arr = [];
    let total = 0;
    for (let k = 0; k + w <= cnt; k += w) {
      let s = 0;
      for (let q = 0; q < w; q++) s += rms[k + q];
      const avg = s / w;
      arr.push(avg);
      total += avg;
    }

    const th = total / arr.length * 0.2;
    cands = [];
    let st = -1;
    for (let a = 0; a <= arr.length; a++) {
      const low = a < arr.length && arr[a] < th;
      if (low && st < 0) st = a;
      if (!low && st >= 0) {
        const len = (a - st) * 0.05;
        if (len >= 0.15 && st * 0.05 > 1) cands.push([st * 0.05, a * 0.05]);
        st = -1;
      }
    }
  }

  function fit(){
    const want = Math.max(10, Math.min(140, Math.floor((scroll.clientWidth - 2) / dur)));
    $('waveform-zoom').value = Math.max(want, Number($('waveform-zoom').min));
    pps = Number($('waveform-zoom').value);
  }

  function draw(){
    if (!buf) return;
    const W = Math.ceil(dur * pps);
    const H = 190;
    const wh = H - 22;
    cv.width = W;
    cv.height = H;
    cv.style.width = `${W}px`;
    inner.style.width = `${W}px`;
    const wave = css('--wave');
    const wave2 = css('--wave2');
    const line = '#3a3a44';
    const sub = '#9a9aa6';

    ctx.clearRect(0, 0, W, H);
    const mid = wh / 2;
    ctx.fillStyle = wave;
    for (let x = 0; x < W; x++) {
      const a = Math.floor(x / pps * 100);
      const b = Math.max(a + 1, Math.floor((x + 1) / pps * 100));
      let mn = 1;
      let mx = -1;
      for (let i = a; i < b && i * 2 + 1 < peaks.length; i++) {
        if (peaks[i * 2] < mn) mn = peaks[i * 2];
        if (peaks[i * 2 + 1] > mx) mx = peaks[i * 2 + 1];
      }
      if (mn > mx) continue;
      const y1 = mid - mx * mid * 0.95;
      const y2 = mid - mn * mid * 0.95;
      ctx.fillRect(x, y1, 1, Math.max(1, y2 - y1));
    }
    ctx.fillStyle = line;
    ctx.fillRect(0, wh, W, 1);
    ctx.fillStyle = sub;
    ctx.font = '11px sans-serif';
    const step = pps >= 80 ? 2 : pps >= 40 ? 5 : 10;
    for (let t = 0; t <= dur; t += step) {
      const px = t * pps;
      ctx.fillRect(px, wh, 1, 5);
      ctx.fillText(`${Math.floor(t / 60)}:${('0' + (t % 60)).slice(-2)}`, px + 3, H - 6);
    }
    drawBands();
    renderMarks();
  }

  function drawBands(){
    let html = '';
    if ($('waveform-cand').checked) {
      cands.forEach((c) => {
        html += `<div class="waveform-band" style="left:${c[0] * pps}px;width:${Math.max(2, (c[1] - c[0]) * pps)}px"></div>`;
      });
    }
    $('waveform-bands').innerHTML = html;
  }

  function save(){
    try { localStorage.setItem(key, JSON.stringify(marks)); }
    catch (e) { /* no-op */ }
  }

  function esc(s){
    return String(s).replace(/[&<>\"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function renderMarks(){
    marks.sort((a, b) => a.t - b.t);
    let htmlMarks = '';
    let htmlList = '';

    marks.forEach((item, i) => {
      htmlMarks += `<div class="waveform-mk t-${item.type}${item.auto ? ' auto' : ''}" data-i="${i}" style="left:${item.t * pps}px"><span>${esc(item.label)}</span></div>`;
      htmlList += `<tr class="t-${item.type}"><td style="width:20px"><span class="waveform-dot"></span></td><td class="waveform-tm"><button data-go="${i}" aria-label="이 지점으로 이동">${fmt(item.t)}</button></td><td>${TYPES[item.type]}${item.auto ? ' (자동)' : ''}</td><td><input data-lb="${i}" value="${esc(item.label)}" aria-label="이름"></td><td style="width:60px"><button data-del="${i}" aria-label="삭제">삭제</button></td></tr>`;
    });

    $('waveform-marks').innerHTML = htmlMarks;
    $('waveform-list').innerHTML = htmlList;
    $('waveform-empty').hidden = marks.length > 0;
    save();
  }

  function addMark(type){
    if (!buf) return;
    const n = marks.filter((item) => item.type === type).length + 1;
    marks.push({ t: Math.round(audio.currentTime * 10) / 10, type, label: `${TYPES[type]} ${n}` });
    renderMarks();
  }

  function tick(){
    const t = audio.currentTime;
    $('waveform-clock').textContent = `${fmt(t)} / ${fmt(dur)}`;
    $('waveform-head').style.left = `${t * pps}px`;
    const nextBreak = marks.filter((item) => item.type === 'break' && item.t > t + 0.05)[0];
    const nextEl = $('waveform-next');
    nextEl.textContent = nextBreak ? `다음 쉼까지 ${(nextBreak.t - t).toFixed(1)}초` : '다음 쉼 없음';
    nextEl.style.color = nextBreak && nextBreak.t - t < 2 ? '#ff4d38' : '';
    if (!audio.paused) {
      const x = t * pps;
      if (x < scroll.scrollLeft || x > scroll.scrollLeft + scroll.clientWidth - 40) {
        scroll.scrollLeft = Math.max(0, x - 60);
      }
    }
    requestAnimationFrame(tick);
  }

  function findBreaks(sens){
    const out = [];
    const n = rms.length;
    const w = 5;
    let ag = 0;
    for (let i = 0; i < n; i++) ag += rms[i];
    ag /= n;

    const th = ag * 0.2 * sens;
    let st = -1;
    const m = Math.floor(n / w);
    for (let a = 0; a <= m; a++) {
      let s = 0;
      const ended = a < m;
      if (ended) {
        for (let q = 0; q < w; q++) s += rms[a * w + q];
        s /= w;
      }
      const low = ended && s < th;
      if (low && st < 0) st = a;
      if (!low && st >= 0) {
        const t0 = st * 0.05;
        const len = (a - st) * 0.05;
        if (ended && len >= 0.15 && t0 > 1) {
          let ps = 0;
          let ds = 0;
          let c = 0;
          const p1 = Math.round(t0 * 100);
          const p0 = Math.max(0, p1 - 100);
          for (let k = p0; k < p1; k++) ps += rms[k];
          ps /= Math.max(1, p1 - p0);
          for (let k = st * w; k < a * w; k++) {
            ds += rms[k];
            c++;
          }
          if (ds / c < 0.35 * ps) out.push(t0);
        }
        st = -1;
      }
    }
    return out;
  }

  function findPhrases(sens){
    const d = buf.getChannelData(0);
    const sr = buf.sampleRate;
    const hop = Math.floor(sr / 20);
    const N = Math.floor(d.length / hop);
    const F = [[], [], []];
    let l1 = 0;
    let l2 = 0;
    const a1 = Math.exp(-2 * Math.PI * 200 / sr);
    const a2 = Math.exp(-2 * Math.PI * 2000 / sr);

    for (let i = 0; i < N; i++) {
      const sq = [0, 0, 0];
      for (let j = i * hop; j < (i + 1) * hop; j++) {
        const x = d[j];
        l1 = a1 * l1 + (1 - a1) * x;
        l2 = a2 * l2 + (1 - a2) * x;
        const mi = l2 - l1;
        const hi = x - l2;
        sq[0] += l1 * l1;
        sq[1] += mi * mi;
        sq[2] += hi * hi;
      }
      for (let b = 0; b < 3; b++) F[b].push(Math.log(1e-4 + Math.sqrt(sq[b] / hop)));
    }

    const n = rms.length;
    const o = new Float32Array(n);
    for (let i = 1; i < n; i++) o[i] = Math.max(0, rms[i] - rms[i - 1]);

    let bl = 50;
    let bv = -1;
    for (let L = 30; L <= 100; L++) {
      let v = 0;
      for (let k = L; k < n; k++) v += o[k] * o[k - L];
      v /= n - L;
      if (v > bv) { bv = v; bl = L; }
    }

    const U = bl * 4;
    let ph = 0;
    let pv = -1;
    for (let p = 0; p < U; p++) {
      let v2 = 0;
      for (let k = p + 1; k < n - 1; k += U) v2 += o[k - 1] + o[k] + o[k + 1];
      if (v2 > pv) { pv = v2; ph = p; }
    }

    const P = F.map((f) => {
      const c = [0];
      for (let q = 0; q < f.length; q++) c.push(c[q] + f[q]);
      return c;
    });

    function mean(bd, a, z) {
      a = Math.max(0, a);
      z = Math.min(N, z);
      return z > a ? (P[bd][z] - P[bd][a]) / (z - a) : 0;
    }

    const W = Math.max(40, Math.round(U * 0.4));
    const cand = [];
    for (let t = ph; t * 0.01 < dur - 4; t += U) {
      if (t * 0.01 < 4) continue;
      const fr = Math.round(t * 0.01 / 0.05);
      let nv = 0;
      for (let b = 0; b < 3; b++) {
        const df = mean(b, fr - W, fr) - mean(b, fr, fr + W);
        nv += df * df;
      }
      cand.push({ t: t * 0.01, v: Math.sqrt(nv) });
    }

    if (!cand.length) return [];
    let mu = 0;
    let sd = 0;
    cand.forEach((c) => { mu += c.v; });
    mu /= cand.length;
    cand.forEach((c) => { sd += (c.v - mu) * (c.v - mu); });
    sd = Math.sqrt(sd / cand.length);
    const th = mu + 0.5 * sd / sens;
    const gap = Math.max(6, U * 0.03);
    const pick = [];
    cand.slice().sort((a, b) => b.v - a.v).forEach((c) => {
      if (c.v <= th) return;
      if (pick.every((q) => Math.abs(q - c.t) >= gap)) pick.push(c.t);
    });
    return pick.sort((a, b) => a - b);
  }

  function autoRun(){
    if (!buf) return;
    const sens = Number($('waveform-sens').value);
    let nb = 0;
    let np = 0;
    marks = marks.filter((k) => !k.auto);
    findBreaks(sens).forEach((t) => {
      nb++;
      marks.push({ t: Math.round(t * 10) / 10, type: 'break', label: `쉼 ${nb}`, auto: true });
    });
    findPhrases(sens).forEach((t) => {
      np++;
      marks.push({ t: Math.round(t * 10) / 10, type: 'phrase', label: `프레이즈 ${np}`, auto: true });
    });
    renderMarks();
    $('waveform-amsg').textContent = `자동으로 쉼 ${nb}개, 프레이즈 ${np}곳을 표시했어요(점선). 틀린 곳은 지우고, 이름을 고치면 확정돼서 다시 분석해도 남아요.`;
  }

  function seek(t){
    audio.currentTime = Math.max(0, Math.min(dur, t));
  }

  $('waveform-file').onchange = function(e) { loadFile(e.target.files[0]); };

  const dz = $('waveform-drop');
  ['dragover', 'dragenter'].forEach((ev) => {
    dz.addEventListener(ev, (e) => {
      e.preventDefault();
      dz.classList.add('on');
    });
  });
  ['dragleave', 'drop'].forEach((ev) => {
    dz.addEventListener(ev, (e) => {
      e.preventDefault();
      dz.classList.remove('on');
    });
  });
  dz.addEventListener('drop', (e) => { loadFile(e.dataTransfer.files[0]); });

  $('waveform-play').onclick = function(){
    if (audio.paused) audio.play();
    else audio.pause();
  };
  audio.onplay = function(){ $('waveform-play').textContent = '정지'; };
  audio.onpause = function(){ $('waveform-play').textContent = '재생'; };
  audio.onended = function(){ $('waveform-play').textContent = '재생'; };
  $('waveform-rate').onchange = function(){ audio.playbackRate = Number(this.value); };
  $('waveform-zoom').oninput = function(){
    pps = Number(this.value);
    const t = audio.currentTime;
    draw();
    scroll.scrollLeft = Math.max(0, t * pps - scroll.clientWidth / 2);
  };
  $('waveform-cand').onchange = drawBands;

  inner.addEventListener('click', function(e){
    const mk = e.target.closest('.waveform-mk');
    if (mk) {
      seek(marks[Number(mk.dataset.i)].t);
      return;
    }
    seek((e.clientX - inner.getBoundingClientRect().left) / pps);
  });

  document.querySelectorAll('[data-type]').forEach((btn) => {
    btn.onclick = function(){ addMark(btn.dataset.type); };
  });

  $('waveform-list').addEventListener('click', function(e){
    const go = e.target.closest('[data-go]');
    const del = e.target.closest('[data-del]');
    if (go) seek(marks[Number(go.dataset.go)].t);
    if (del) {
      marks.splice(Number(del.dataset.del), 1);
      renderMarks();
    }
  });

  $('waveform-list').addEventListener('change', function(e){
    const lb = e.target.dataset.lb;
    if (lb != null) {
      marks[Number(lb)].label = e.target.value || TYPES[marks[Number(lb)].type];
      delete marks[Number(lb)].auto;
      renderMarks();
    }
  });

  document.addEventListener('keydown', function(e){
    if (!buf || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (k === ' ') {
      e.preventDefault();
      $('waveform-play').click();
    }
    else if (k === 'p') addMark('phrase');
    else if (k === 'b') addMark('break');
    else if (k === 'e') addMark('end');
  });

  $('waveform-exp').onclick = function(){
    const ta = $('waveform-io');
    ta.value = JSON.stringify({ v: 1, marks });
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); }
    catch (e) {}
    if (!ok && navigator.clipboard) {
      navigator.clipboard.writeText(ta.value).then(
        () => { $('waveform-msg').textContent = '복사했어요'; },
        () => {}
      );
    }
    $('waveform-msg').textContent = ok ? '복사했어요' : '위 내용을 직접 복사해 주세요';
  };

  $('waveform-imp').onclick = function(){
    try {
      const o = JSON.parse($('waveform-io').value);
      if (!o || !Array.isArray(o.marks)) throw 0;
      marks = o.marks
        .filter((k) => typeof k.t === 'number' && TYPES[k.type])
        .map((k) => ({
          t: k.t,
          type: k.type,
          label: String(k.label || TYPES[k.type]),
          auto: k.auto ? true : undefined,
        }));
      renderMarks();
      $('waveform-msg').textContent = `${marks.length}개 지점을 불러왔어요`;
    } catch (e) {
      $('waveform-msg').textContent = '형식이 맞지 않아요. 복사한 내용을 그대로 붙여넣어 주세요';
    }
  };

  $('waveform-auto').onclick = autoRun;
  $('waveform-clr').onclick = function(){
    marks = marks.filter((k) => !k.auto);
    renderMarks();
    $('waveform-amsg').textContent = '자동 표시를 지웠어요';
  };
  window.addEventListener('resize', function(){ if (buf) draw(); });
}
