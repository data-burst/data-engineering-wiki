/* DataBurst lesson engine: step-through figures, same idea as the course decks.
   A figure (shortcode `fig`) contains:
     .f[data-step=N]        -> visible once step >= N
     ol.lx-caps > li        -> caption for step 0..N (optional)
     data-hook="name"       -> HOOKS[name](fig) returns {steps?, go(step, forward)}
*/
(function () {
  const HOOKS = {};
  const $ = (r, s) => r.querySelector(s), $$ = (r, s) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init(fig) {
    const frags = $$(fig, '.f');
    const capsEl = $(fig, 'ol.lx-caps');
    const caps = capsEl ? $$(capsEl, 'li').map(li => li.innerHTML) : [];
    if (capsEl) capsEl.hidden = true;
    const api = HOOKS[fig.dataset.hook] ? HOOKS[fig.dataset.hook](fig) || {} : {};
    const N = Math.max(caps.length - 1, api.steps || 0, ...frags.map(f => +f.dataset.step || 0), 0);
    const cap = $(fig, '.lx-cap'), stepno = $(fig, '.lx-stepno'), prog = $(fig, '.lx-prog');
    const bPrev = $(fig, '[data-do=prev]'), bNext = $(fig, '[data-do=next]');
    const bPlay = $(fig, '[data-do=play]'), bSpeed = $(fig, '[data-do=speed]');
    if (!N) fig.classList.add('nosteps');
    if (prog) prog.innerHTML = Array.from({ length: N }, (_, i) => `<i data-to="${i + 1}" title="Step ${i + 1}"></i>`).join('');
    const pad = n => String(n).padStart(2, '0');
    let pos = 0, timer = null, speed = 1;
    const stepMs = +(fig.dataset.ms || 3000);

    function go(p, fwd) {
      pos = Math.max(0, Math.min(N, p));
      frags.forEach(f => f.classList.toggle('on', pos >= (+f.dataset.step || 0)));
      if (cap) cap.innerHTML = caps[pos] || caps[caps.length - 1] || '';
      if (stepno) stepno.textContent = `STEP ${pad(pos)} / ${pad(N)}`;
      if (prog) $$(prog, 'i').forEach((s, i) => s.classList.toggle('on', i < pos));
      if (bPrev) bPrev.disabled = pos === 0;
      if (bNext) bNext.disabled = pos === N;
      api.go && api.go(pos, !!fwd && !reduce);
    }
    function stop() { clearTimeout(timer); timer = null; if (bPlay) bPlay.textContent = pos === N ? '↻ Replay' : '▶ Play'; }
    function tick() { go(pos + 1, true); if (pos >= N) return stop(); timer = setTimeout(tick, stepMs / speed); }
    function play() {
      if (timer) return stop();
      if (pos >= N) go(0);
      bPlay.textContent = '❚❚ Pause';
      timer = setTimeout(tick, pos === 0 ? 300 : 0);
    }
    const manual = fn => () => { stop(); fn(); stop(); };
    fig.lxGo = (p) => go(p === undefined ? pos : p, false);
    fig.addEventListener('click', e => {
      const seg = e.target.closest('.lx-prog i');
      if (seg) return manual(() => go(+seg.dataset.to))();
      const b = e.target.closest('[data-do]'); if (!b) return;
      ({
        next: manual(() => go(pos + 1, true)), prev: manual(() => go(pos - 1)), reset: manual(() => go(0)), play,
        speed: () => { speed = speed === 1 ? 2 : speed === 2 ? 0.5 : 1; b.textContent = (speed === 0.5 ? '½' : speed) + '×'; },
      })[b.dataset.do]();
    });
    fig.addEventListener('keydown', e => {
      if (e.target !== fig) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); manual(() => go(pos + 1, true))(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); manual(() => go(pos - 1))(); }
      if (e.key === ' ') { e.preventDefault(); play(); }
    });
    $$(fig, '.rise').forEach((el, i) => el.style.setProperty('--i', i));
    go(0);
  }

  // svg helpers
  const NS = 'http://www.w3.org/2000/svg';
  function packet(layer, from, to, cls, ms, blocked) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', 6); c.setAttribute('class', 'pkt ' + (cls || ''));
    layer.appendChild(c);
    const end = blocked ? [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2] : to;
    const kf = [{ transform: `translate(${from[0]}px,${from[1]}px)`, opacity: 1 },
                { transform: `translate(${end[0]}px,${end[1]}px)`, opacity: blocked ? .9 : 1 }];
    if (blocked) kf.push({ transform: `translate(${end[0] - 14}px,${end[1] - 6}px) scale(.3)`, opacity: 0 });
    const a = c.animate(kf, { duration: ms, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    a.onfinish = () => c.remove();
  }

  /* ================= CAP ================= */
  HOOKS.cap = function (fig) {
    const svg = $(fig, 'svg'), layer = $(svg, '.pkts');
    const P = { c: [95, 170], n1: [330, 70], n2: [330, 270], n3: [620, 170] };
    let mode = 'CP', run = 0, last = 0;
    fig.dataset.mode = mode;
    $$(fig, '[data-mode]').forEach(b => b.addEventListener('click', () => {
      mode = fig.dataset.mode = b.dataset.mode;
      $$(fig, '[data-mode]').forEach(x => x.classList.toggle('on', x === b));
      draw(last, false);
    }));
    const node = n => $(svg, `.node.${n}`);
    const setVal = (n, v) => { $(node(n), '.val').textContent = 'x = ' + v; };
    const setSt = (n, t) => { $(node(n), '.st').textContent = t; };

    function draw(k, fwd) {
      last = k; const my = ++run;
      layer.innerHTML = '';
      const cut = k >= 2 && k < 5, cp = mode === 'CP';
      $$(svg, '.link.x3').forEach(l => l.classList.toggle('cut', cut));
      $$(svg, '.scis').forEach(s => s.classList.toggle('on', cut));
      $(svg, '.partition-zone').classList.toggle('on', cut);
      const v12 = k >= 3 ? 3 : k >= 1 ? 2 : 1;
      const v3 = k >= 5 ? 3 : k >= 1 ? 2 : 1;
      const later = (ms, fn) => fwd ? setTimeout(() => my === run && fn(), ms) : fn();

      // values
      if (fwd && (k === 1 || k === 3)) {
        setVal('n1', k === 1 ? 1 : 2); setVal('n2', k === 1 ? 1 : 2); if (k === 1) setVal('n3', 1);
        packet(layer, P.c, P.n1, '', 600);
        later(600, () => {
          setVal('n1', v12);
          packet(layer, P.n1, P.n2, '', 700);
          packet(layer, P.n1, P.n3, '', 700, k === 3);
        });
        later(1300, () => { setVal('n2', v12); setVal('n3', v3); });
      } else if (fwd && k === 5) {
        setVal('n1', v12); setVal('n2', v12); setVal('n3', 2);
        later(300, () => packet(layer, P.n1, P.n3, '', 700));
        later(1000, () => setVal('n3', v3));
      } else { setVal('n1', v12); setVal('n2', v12); setVal('n3', v3); }

      // node 3 state
      const n3 = node('n3');
      n3.classList.toggle('iso', cut && !cp);
      n3.classList.toggle('down', cut && cp);
      n3.classList.toggle('stale', k >= 3 && k < 5 && !cp);
      setSt('n1', k === 3 || (k === 1) ? 'accepts write' : 'ok');
      setSt('n2', 'ok');
      setSt('n3', !cut ? (k >= 5 ? (cp ? 'back online' : 'caught up') : 'ok')
                       : cp ? 'minority · refuses' : 'alone · answers');

      // read at step 4
      const resp = $(svg, '.resp'), rt = $(resp, 'text'), rr = $(resp, 'rect');
      resp.classList.remove('on');
      if (k === 4) {
        if (fwd) packet(layer, P.c, P.n3, 'read', 700);
        later(700, () => {
          if (fwd) packet(layer, P.n3, P.c, 'read', 600);
        });
        later(fwd ? 1300 : 0, () => {
          rt.textContent = cp ? 'ERROR · no quorum' : 'x = 2 · stale';
          rt.style.fill = 'var(--bad)';
          rr.style.fill = '#fff';
          rr.style.stroke = 'var(--bad)';
          resp.classList.add('on');
        });
      }
    }
    return { steps: 5, go: draw };
  };

  /* ================= Batch vs Stream ================= */
  HOOKS.stream = function (fig) {
    const lanes = { s: $(fig, '.bs-lane.s'), b: $(fig, '.bs-lane.b') };
    const bucket = $(fig, '.bs-bucket'), bucketLbl = $(fig, '.bs-bucket-lbl');
    const out = k => $(lanes[k], '.num'), lag = k => $(lanes[k], '.lag');
    const proc = k => $(lanes[k], '.bs-proc');
    const truth = $(fig, '.bs-truth b');
    const colors = [''];
    let playing = false, visible = false, every = 8, total = 0, cs = 0, cb = 0, lastRun = performance.now(), nextEv = 0, raf;

    function bump(el, v) { el.textContent = v; el.classList.add('bump'); setTimeout(() => el.classList.remove('bump'), 180); }
    function spawn() {
      total++; truth.textContent = total;
      const col = colors[0];
      ['s', 'b'].forEach(k => {
        const tr = $(lanes[k], '.bs-track');
        const e = document.createElement('i'); e.className = 'ev ' + col; tr.appendChild(e);
        const stopAt = tr.clientWidth - (k === 's' ? 90 : 230);
        const a = e.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${stopAt}px)` }], { duration: 1100, easing: 'linear' });
        a.onfinish = () => {
          e.remove();
          if (k === 's') { cs++; bump(out('s'), cs); proc('s').classList.remove('run'); void proc('s').offsetWidth; proc('s').classList.add('run'); }
          else { const d = document.createElement('i'); d.className = 'ev ' + col; bucket.appendChild(d); bucketLbl.textContent = bucket.children.length + ' waiting'; }
        };
      });
    }
    function flush() {
      const n = bucket.children.length; lastRun = performance.now();
      proc('b').classList.remove('run'); void proc('b').offsetWidth; proc('b').classList.add('run');
      if (!n) return;
      [...bucket.children].forEach((d, i) => d.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateX(60px)' }], { duration: 400, delay: i * 10, fill: 'forwards' }));
      setTimeout(() => { bucket.innerHTML = ''; bucketLbl.textContent = '0 waiting'; cb += n; bump(out('b'), cb); }, 450);
    }
    function tick(t) {
      if (playing && visible) {
        if (t > nextEv) { spawn(); nextEv = t + 250 + Math.random() * 500; }
        if (t - lastRun > every * 1000) flush();
        lag('b').textContent = `behind by ${((t - lastRun) / 1000).toFixed(1)} s`;
      } else lastRun += 16; // freeze the batch clock while paused
      raf = requestAnimationFrame(tick);
    }
    $$(fig, '[data-every]').forEach(b => b.addEventListener('click', () => {
      every = +b.dataset.every;
      $$(fig, '[data-every]').forEach(x => x.classList.toggle('on', x === b));
      $(lanes.b, '.bs-name small').textContent = `every ${every} s`;
    }));
    const bp = $(fig, '[data-play]');
    bp.addEventListener('click', () => { playing = !playing; bp.textContent = playing ? '❚❚ Pause' : '▶ Play'; bp.classList.toggle('on', playing); });
    $(fig, '[data-burst]').addEventListener('click', () => { for (let i = 0; i < 8; i++) setTimeout(spawn, i * 70); });
    new IntersectionObserver(es => es.forEach(e => visible = e.isIntersecting)).observe(fig);
    raf = requestAnimationFrame(tick);
    return {};
  };

  /* ================= Row vs Column ================= */
  HOOKS.rowcol = function (fig) {
    const rows = [[1, 'amy', 'NYC', 250], [2, 'sam', 'NYC', 120], [3, 'ray', 'NYC', 450],
                  [4, 'max', 'TOR', 980], [5, 'eva', 'TOR', 600], [6, 'leo', 'CHI', 1200]];
    const R = $(fig, '.rc-strip.row'), C = $(fig, '.rc-strip.col');
    const mR = $(fig, '.rc-meter.row i'), mC = $(fig, '.rc-meter.col i');
    const tR = $(fig, '.rc-read.row'), tC = $(fig, '.rc-read.col');
    let run = 0;
    const cell = (v, c, i, anim) => `<span class="cell${c === 3 ? ' hot' : ''}${anim ? ' in' : ''}" data-c="${c}" style="animation-delay:${i * 45}ms">${v}</span>`;

    function rowStrip(anim) { let i = 0; R.innerHTML = rows.map(r => r.map((v, c) => cell(v, c, i++, anim)).join('')).join(''); }
    function colStrip(anim, rle) {
      let i = 0, h = '';
      for (let c = 0; c < 4; c++) {
        if (c) h += '<span class="gap"></span>';
        if (rle && c === 2) {
          const runs = [['NYC', 3], ['TOR', 2], ['CHI', 1]];
          h += runs.map(([v, n]) => `<span class="cell wide in">${v}×${n}</span>`).join('');
        } else h += rows.map(r => cell(r[c], c, i++, anim)).join('');
      }
      C.innerHTML = h;
    }
    function scan(strip, pick, meter, label, fwd, my) {
      const cells = $$(strip, '.cell');
      const read = cells.filter(pick);
      cells.forEach(c => { if (!pick(c)) c.classList.add('skip'); });
      read.forEach((c, i) => fwd ? setTimeout(() => my === run && c.classList.add('read'), i * 70) : c.classList.add('read'));
      const pct = Math.round(read.length / 24 * 100);
      meter.style.width = pct + '%';
      label.textContent = `read ${read.length} / 24 values · ${pct}%`;
    }
    function go(k, fwd) {
      const my = ++run;
      R.innerHTML = C.innerHTML = '';
      [mR, mC].forEach(m => m.style.width = 0); tR.textContent = tC.textContent = '';
      if (k >= 1) rowStrip(fwd && k === 1);
      if (k >= 2) colStrip(fwd && k === 2, k >= 5);
      if (k >= 3) scan(R, () => true, mR, tR, fwd && k === 3, my);
      if (k >= 4) scan(C, c => c.dataset.c === '3', mC, tC, fwd && k === 4, my);
      if (k >= 5) tC.textContent += ' · city: 6 values → 3 runs';
    }
    return { steps: 5, go };
  };

  // Smooth expand/collapse for collapsible menu sections (theme toggles display:none instantly).
  function menu() {
    $$(document, '.book-menu input.toggle').forEach(t => t.addEventListener('change', () => {
      const ul = t.nextElementSibling && t.nextElementSibling.nextElementSibling;
      if (!ul || ul.tagName !== 'UL' || reduce) return;
      const open = t.checked;
      ul.style.display = 'block'; ul.style.overflow = 'hidden';
      const h = ul.scrollHeight + 'px';
      ul.getAnimations().forEach(a => a.cancel());
      ul.animate([{ height: open ? '0px' : h, opacity: open ? 0 : 1 }, { height: open ? h : '0px', opacity: open ? 1 : 0 }],
        { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' })
        .onfinish = () => { ul.style.display = ''; ul.style.overflow = ''; };
    }));
  }

  function boot() {
    menu();
    $$(document, '.lx-fig').forEach(init);
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('lx-in'); io.unobserve(e.target); } }), { threshold: .2 });
    $$(document, '.lx-fig, .rise').forEach(el => io.observe(el));
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
