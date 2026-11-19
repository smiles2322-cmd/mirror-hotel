/* Hotel Aurelian sound. Everything is synthesized live with Web Audio, no audio files. */
(function () {
  var ctx = null, master = null, bed = null, knockTimer = null, enabled = true, nb = null;
  function ensure() {
    if (!enabled) return null;
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
      master = ctx.createGain(); master.gain.value = 0.7; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function noise() {
    if (nb) return nb;
    nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); var d = nb.getChannelData(0), last = 0;
    for (var i = 0; i < d.length; i++) { var w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    return nb;
  }
  var wb = null;
  function white() {
    if (wb) return wb;
    var b = wb = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b;
  }
  function env(g, t, a, peak, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  function osc(type, f, t, dur, peak, dest) {
    var o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    env(g, t, 0.01, peak, dur); o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + dur + 0.05); return o;
  }
  function nz(t, dur, peak, type, freq, q, buf) {
    var s = ctx.createBufferSource(); s.buffer = buf || noise(); var f = ctx.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.value = freq || 800; f.Q.value = q || 1;
    var g = ctx.createGain(); env(g, t, 0.02, peak, dur); s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + dur + 0.05); return { s: s, f: f, g: g };
  }
  var PROFILES = {
    lobby: { hum: 229, humVol: 0.014, wind: 0.05, windFreq: 380, knocks: 9000 },
    desk: { hum: 229, humVol: 0.02, wind: 0.035, windFreq: 340, knocks: 11000 },
    corridor: { hum: 60, humVol: 0.012, wind: 0.03, windFreq: 300, knocks: 5000 },
    room309: { hum: 48, humVol: 0.02, wind: 0.06, windFreq: 200, knocks: 7000 },
    basement: { hum: 41, humVol: 0.05, wind: 0.06, windFreq: 140, knocks: 7000 },
    office: { hum: 0, humVol: 0, wind: 0.035, windFreq: 500, knocks: 15000 },
    laundry: { hum: 55, humVol: 0.04, wind: 0.05, windFreq: 260, knocks: 2600 },
    title: { hum: 110, humVol: 0.01, wind: 0.04, windFreq: 300, knocks: 14000 }
  };
  function stopBed() {
    if (knockTimer) { clearTimeout(knockTimer); knockTimer = null; }
    if (bed && ctx) { var b = bed; bed = null; try { b.out.gain.setTargetAtTime(0, ctx.currentTime, 0.4); setTimeout(function () { b.nodes.forEach(function (n) { try { n.stop(); } catch (e) {} }); }, 1500); } catch (e) {} }
  }
  var currentBed = null;
  function ambient(name) {
    currentBed = name; if (!ensure()) return; stopBed();
    var p = PROFILES[name] || PROFILES.lobby;
    var out = ctx.createGain(); out.gain.value = 0; out.connect(master); var nodes = [];
    if (p.humVol) { var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = p.hum; var g = ctx.createGain(); g.gain.value = p.humVol; o.connect(g); g.connect(out); o.start(); nodes.push(o); }
    var n = ctx.createBufferSource(); n.buffer = noise(); n.loop = true;
    var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = p.windFreq;
    var lfo = ctx.createOscillator(); lfo.frequency.value = 0.07; var lg = ctx.createGain(); lg.gain.value = p.windFreq * 0.4; lfo.connect(lg); lg.connect(f.frequency); lfo.start(); nodes.push(lfo);
    var ng = ctx.createGain(); ng.gain.value = p.wind; n.connect(f); f.connect(ng); ng.connect(out); n.start(); nodes.push(n);
    out.gain.setTargetAtTime(1, ctx.currentTime, 0.8);
    bed = { out: out, nodes: nodes };
    (function loop() { knockTimer = setTimeout(function () { if (enabled && ctx) knock(); loop(); }, p.knocks * (0.6 + Math.random() * 0.8)); })();
  }
  function knock() {
    var t = ctx.currentTime, n = 1 + Math.floor(Math.random() * 3);
    for (var i = 0; i < n; i++) { var tt = t + i * (0.18 + Math.random() * 0.1); osc('triangle', 140 + Math.random() * 60, tt, 0.12, 0.05); nz(tt, 0.08, 0.05, 'bandpass', 900, 3); }
  }
  var S = {
    belch: function (size) {
      if (!ensure()) return; size = size || 1; var t = ctx.currentTime + 0.05, dur = 1.2 + size * 1.1;
      var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(92, t); o.frequency.exponentialRampToValueAtTime(46, t + dur);
      var am = ctx.createOscillator(); am.frequency.setValueAtTime(18, t); am.frequency.linearRampToValueAtTime(9, t + dur); var amg = ctx.createGain(); amg.gain.value = 0.5;
      var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(420, t); bp.frequency.linearRampToValueAtTime(260, t + dur); bp.Q.value = 2.5;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
      var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5 * Math.min(1, 0.5 + size / 2), t + 0.12); g.gain.setValueAtTime(0.45, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      var mod = ctx.createGain(); mod.gain.value = 0.6; am.connect(amg); amg.connect(mod.gain);
      o.connect(bp); bp.connect(lp); lp.connect(mod); mod.connect(g); g.connect(master); o.start(t); am.start(t); o.stop(t + dur + 0.1); am.stop(t + dur + 0.1);
      var w = nz(t, dur, 0.18 * size, 'lowpass', 300, 4); w.f.frequency.linearRampToValueAtTime(140, t + dur);
      for (var i = 0; i < 5 * size; i++) { var tt = t + Math.random() * dur; osc('sine', 300 + Math.random() * 500, tt, 0.06, 0.05); }
      S.rumble(dur + 0.4);
    },
    hiccup: function () { if (!ensure()) return; var t = ctx.currentTime; var o = osc('square', 210, t, 0.16, 0.12); o.frequency.exponentialRampToValueAtTime(120, t + 0.15); nz(t, 0.1, 0.1, 'bandpass', 700, 2); },
    cough: function () { if (!ensure()) return; var t = ctx.currentTime; for (var i = 0; i < 4; i++) { nz(t + i * 0.32, 0.25, 0.3 - i * 0.05, 'lowpass', 500 - i * 60, 2); osc('sawtooth', 70, t + i * 0.32, 0.2, 0.06); } S.rumble(1.4); },
    rumble: function (dur) { if (!ensure()) return; var t = ctx.currentTime; for (var i = 0; i < 8; i++) { var tt = t + i * dur / 8; osc('triangle', 120 + Math.random() * 40, tt, 0.1, 0.04); } nz(t, dur, 0.12, 'lowpass', 90, 1); },
    ring: function (times) {
      if (!ensure()) return; times = times || 2; var t = ctx.currentTime;
      for (var r = 0; r < times; r++) for (var b = 0; b < 2; b++) {
        var tt = t + r * 2.2 + b * 0.5, g = ctx.createGain(); env(g, tt, 0.01, 0.12, 0.38); g.connect(master);
        var a = ctx.createOscillator(), c = ctx.createOscillator(); a.frequency.value = 400; c.frequency.value = 450;
        var tr = ctx.createOscillator(), trg = ctx.createGain(); tr.frequency.value = 20; trg.gain.value = 0.5; tr.connect(trg); var vca = ctx.createGain(); vca.gain.value = 0.5; trg.connect(vca.gain);
        a.connect(vca); c.connect(vca); vca.connect(g); [a, c, tr].forEach(function (x) { x.start(tt); x.stop(tt + 0.42); });
      }
    },
    scratch: function () { if (!ensure()) return; var t = ctx.currentTime; for (var i = 0; i < 7; i++) nz(t + i * 0.08 + Math.random() * 0.03, 0.06, 0.06, 'bandpass', 3000 + Math.random() * 2500, 6, white()); },
    pickup: function () { if (!ensure()) return; var t = ctx.currentTime; osc('sine', 880, t, 0.25, 0.08); osc('sine', 1320, t + 0.09, 0.35, 0.06); },
    good: function () { if (!ensure()) return; var t = ctx.currentTime; [523, 659, 784].forEach(function (f, i) { osc('triangle', f, t + i * 0.1, 0.5, 0.07); }); },
    bad: function () { if (!ensure()) return; var t = ctx.currentTime; osc('triangle', 196, t, 0.3, 0.08); osc('triangle', 185, t + 0.15, 0.4, 0.08); },
    step: function () { if (!ensure()) return; var t = ctx.currentTime; for (var i = 0; i < 4; i++) { nz(t + i * 0.28, 0.07, 0.09, 'lowpass', 400, 1); osc('sine', 80, t + i * 0.28, 0.06, 0.05); } },
    page: function () { if (!ensure()) return; var t = ctx.currentTime; var a = nz(t, 0.35, 0.09, 'highpass', 1800, 0.7, white()); a.f.frequency.linearRampToValueAtTime(600, t + 0.35); },
    click: function () { if (!ensure()) return; var t = ctx.currentTime; osc('square', 1600, t, 0.02, 0.025); },
    stomach: function () { if (!ensure()) return; var t = ctx.currentTime; var o = osc('sine', 60, t, 2.4, 0.12); o.frequency.linearRampToValueAtTime(95, t + 1.2); o.frequency.linearRampToValueAtTime(55, t + 2.3); var w = nz(t, 2.4, 0.1, 'lowpass', 220, 6); w.f.frequency.linearRampToValueAtTime(90, t + 2.4); },
    hum: function () {
      if (!ensure()) return; var t = ctx.currentTime, notes = [392, 440, 494, 440, 392, 330, 349, 392];
      notes.forEach(function (f, i) { var o = osc('sine', f * (1 + (Math.random() - 0.5) * 0.03), t + i * 0.42, 0.5, 0.025); });
    },
    whirr: function () { if (!ensure()) return; var t = ctx.currentTime; var o = osc('square', 900, t, 0.6, 0.03); o.frequency.linearRampToValueAtTime(1300, t + 0.6); },
    skitter: function () { if (!ensure()) return; var t = ctx.currentTime; for (var i = 0; i < 9; i++) osc('square', 2200 + Math.random() * 900, t + i * 0.07, 0.02, 0.03); },
    chime: function () { if (!ensure()) return; var t = ctx.currentTime; [392, 494, 587, 784].forEach(function (f, i) { osc('sine', f, t + i * 0.18, 1.2, 0.06); }); },

    /* ---- arcade sounds ---- */
    combo: function (n) { if (!ensure()) return; var sc = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760], f = sc[Math.min(sc.length - 1, (n || 1) - 1)], t = ctx.currentTime; osc('triangle', f, t, 0.18, 0.07); osc('sine', f * 2, t + 0.03, 0.12, 0.025); },
    catch: function () { if (!ensure()) return; var t = ctx.currentTime; var o = osc('sine', 420, t, 0.12, 0.12); o.frequency.exponentialRampToValueAtTime(900, t + 0.1); nz(t, 0.05, 0.05, 'bandpass', 2500, 4); },
    splat: function () { if (!ensure()) return; var t = ctx.currentTime; var w = nz(t, 0.35, 0.3, 'lowpass', 900, 3); w.f.frequency.exponentialRampToValueAtTime(150, t + 0.3); var o = osc('sine', 160, t, 0.3, 0.15); o.frequency.exponentialRampToValueAtTime(50, t + 0.3); },
    thud: function () { if (!ensure()) return; var t = ctx.currentTime; var o = osc('sine', 110, t, 0.25, 0.25); o.frequency.exponentialRampToValueAtTime(40, t + 0.22); nz(t, 0.12, 0.15, 'lowpass', 400, 1); },
    ouch: function () { if (!ensure()) return; var t = ctx.currentTime; var o = osc('square', 330, t, 0.22, 0.06); o.frequency.exponentialRampToValueAtTime(140, t + 0.2); nz(t, 0.15, 0.12, 'lowpass', 600, 2); },
    lick: function () { if (!ensure()) return; var t = ctx.currentTime; var w = nz(t, 0.35, 0.22, 'bandpass', 400, 5); w.f.frequency.exponentialRampToValueAtTime(2600, t + 0.3); var o = osc('sine', 300, t, 0.3, 0.06); o.frequency.exponentialRampToValueAtTime(900, t + 0.28); },
    slurp: function () { if (!ensure()) return; var t = ctx.currentTime; for (var i = 0; i < 3; i++) { var o = osc('sine', 200 + i * 60, t + i * 0.09, 0.08, 0.06); o.frequency.exponentialRampToValueAtTime(500 + i * 80, t + i * 0.09 + 0.07); } },
    burp: function (size) { if (!ensure()) return; size = size || 1; var t = ctx.currentTime, dur = 0.25 + size * 0.3; var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(130 + Math.random() * 40, t); o.frequency.exponentialRampToValueAtTime(60, t + dur); var am = ctx.createOscillator(); am.frequency.value = 24 + Math.random() * 10; var amg = ctx.createGain(); amg.gain.value = 0.5; var mod = ctx.createGain(); mod.gain.value = 0.5; am.connect(amg); amg.connect(mod.gain); var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 380; bp.Q.value = 2; var g = ctx.createGain(); env(g, t, 0.03, 0.4 * Math.min(1.2, size), dur); o.connect(bp); bp.connect(mod); mod.connect(g); g.connect(master); o.start(t); am.start(t); o.stop(t + dur + 0.05); am.stop(t + dur + 0.05); },
    cough1: function () { if (!ensure()) return; var t = ctx.currentTime; nz(t, 0.2, 0.3, 'lowpass', 500, 2); nz(t + 0.22, 0.18, 0.22, 'lowpass', 420, 2); osc('sawtooth', 75, t, 0.16, 0.05); },
    tick: function () { if (!ensure()) return; var t = ctx.currentTime; osc('square', 880, t, 0.05, 0.05); },
    go: function () { if (!ensure()) return; var t = ctx.currentTime; osc('triangle', 784, t, 0.15, 0.08); osc('triangle', 1175, t + 0.1, 0.3, 0.08); },
    hop: function () { if (!ensure()) return; var t = ctx.currentTime; var o = osc('sine', 300, t, 0.08, 0.06); o.frequency.exponentialRampToValueAtTime(600, t + 0.07); },
    ding: function () { if (!ensure()) return; var t = ctx.currentTime; osc('sine', 1975, t, 0.9, 0.06); osc('sine', 2960, t, 0.6, 0.025); osc('sine', 4100, t, 0.3, 0.01); },
    ring1: function () { if (!ensure()) return; var t = ctx.currentTime; for (var b = 0; b < 2; b++) { var tt = t + b * 0.14; osc('square', 900, tt, 0.09, 0.012); osc('square', 1080, tt, 0.09, 0.012); } },
    whoosh: function () { if (!ensure()) return; var t = ctx.currentTime; var w = nz(t, 0.3, 0.12, 'bandpass', 300, 1.5, white()); w.f.frequency.exponentialRampToValueAtTime(2200, t + 0.25); },
    clink: function () { if (!ensure()) return; var t = ctx.currentTime; osc('sine', 2400, t, 0.25, 0.05); osc('sine', 3150, t + 0.02, 0.2, 0.03); },
    smash: function () { if (!ensure()) return; var t = ctx.currentTime; nz(t, 0.3, 0.25, 'highpass', 2500, 0.8, white()); for (var i = 0; i < 6; i++) osc('sine', 2500 + Math.random() * 3000, t + Math.random() * 0.15, 0.12, 0.03); },
    shimmer: function () { if (!ensure()) return; var t = ctx.currentTime; for (var i = 0; i < 6; i++) osc('sine', 1400 + i * 180, t + i * 0.05, 0.25, 0.02); },
    eye: function () { if (!ensure()) return; var t = ctx.currentTime; var o = osc('sine', 90, t, 0.6, 0.12); o.frequency.linearRampToValueAtTime(70, t + 0.6); nz(t, 0.4, 0.06, 'bandpass', 1200, 8); },
    pull: function (p) { if (!ensure()) return; var t = ctx.currentTime, f = 300 + ((p || 0) + 1) * 220; var o = osc('triangle', f, t, 0.07, 0.06); o.frequency.exponentialRampToValueAtTime(f * 1.4, t + 0.06); },
    star: function () { if (!ensure()) return; var t = ctx.currentTime; osc('sine', 1568, t, 0.4, 0.05); osc('sine', 2093, t + 0.08, 0.5, 0.04); },
    fanfare: function () { if (!ensure()) return; var t = ctx.currentTime; [523, 659, 784, 1047].forEach(function (f, i) { osc('triangle', f, t + i * 0.09, 0.35, 0.06); }); osc('sine', 1568, t + 0.4, 0.8, 0.04); },
    win: function () { if (!ensure()) return; var t = ctx.currentTime; [392, 523, 659, 784, 1047].forEach(function (f, i) { osc('triangle', f, t + i * 0.11, 0.5, 0.07); osc('sine', f / 2, t + i * 0.11, 0.4, 0.04); }); osc('sine', 1319, t + 0.6, 1.2, 0.05); },
    fail: function () { if (!ensure()) return; var t = ctx.currentTime; [311, 294, 277, 262].forEach(function (f, i) { var tt = t + i * 0.38, d = i === 3 ? 1.0 : 0.34; var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, tt); if (i === 3) { var v = ctx.createOscillator(), vg = ctx.createGain(); v.frequency.value = 6; vg.gain.value = 8; v.connect(vg); vg.connect(o.frequency); v.start(tt); v.stop(tt + d + 0.05); } var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; var g = ctx.createGain(); env(g, tt, 0.04, 0.09, d); o.connect(lp); lp.connect(g); g.connect(master); o.start(tt); o.stop(tt + d + 0.05); }); },
    gulp: function () { if (!ensure()) return; var t = ctx.currentTime; var o = osc('sine', 180, t, 0.4, 0.2); o.frequency.exponentialRampToValueAtTime(60, t + 0.35); nz(t, 0.3, 0.15, 'lowpass', 400, 3); }
  };

  /* Arcade music: a jaunty minor-key hotel lounge loop, scheduled ahead. */
  var mus = { on: false, timer: null, step: 0, next: 0, tempo: 128, rate: 1, gain: null };
  var BASS = [45, 0, 52, 0, 48, 0, 52, 0, 43, 0, 50, 0, 47, 0, 50, 52], MEL = [69, 0, 72, 0, 76, 74, 72, 0, 71, 0, 74, 0, 72, 71, 69, 0, 69, 72, 76, 79, 77, 76, 74, 0, 72, 0, 71, 0, 69, 0, 0, 0];
  function mf(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  function music(on, tempo) {
    if (!on) { mus.on = false; if (mus.timer) { clearInterval(mus.timer); mus.timer = null; } if (mus.gain && ctx) { try { mus.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.1); } catch (e) {} } return; }
    if (!ensure()) return; if (mus.timer) clearInterval(mus.timer);
    mus.on = true; mus.tempo = tempo || 128; mus.rate = 1; mus.step = 0; mus.next = ctx.currentTime + 0.05;
    mus.gain = ctx.createGain(); mus.gain.gain.value = 0.55; mus.gain.connect(master);
    mus.timer = setInterval(function () {
      if (!mus.on || !ctx || !enabled) return;
      var spb = 60 / (mus.tempo * mus.rate) / 2;
      while (mus.next < ctx.currentTime + 0.2) {
        var s = mus.step, b = BASS[s % 16], m = MEL[s % 32], t = mus.next;
        if (b) osc('triangle', mf(b), t, spb * 1.6, 0.07, mus.gain);
        if (m && (s % 64) >= 32 || (m && s % 4 === 0)) osc('square', mf(m), t, spb * 0.8, 0.012, mus.gain);
        if (s % 4 === 2) nz(t, 0.04, 0.025, 'highpass', 6000, 1, white());
        if (s % 8 === 0) { var k = osc('sine', 110, t, 0.12, 0.08, mus.gain); k.frequency.exponentialRampToValueAtTime(45, t + 0.1); }
        mus.step++; mus.next += spb;
      }
    }, 60);
  }
  window.HotelAudio = {
    unlock: function () { ensure(); if (currentBed && !bed && enabled) ambient(currentBed); },
    ambient: ambient,
    sfx: function (name, a) { try { if (enabled && S[name]) S[name](a); } catch (e) {} },
    setEnabled: function (on) { enabled = !!on; if (!on) { stopBed(); music(false); } else if (currentBed) { ensure(); ambient(currentBed); } },
    enabled: function () { return enabled; },
    music: function (on, tempo) { try { music(on, tempo); } catch (e) {} },
    musicRate: function (r) { mus.rate = r || 1; }
  };
})();
