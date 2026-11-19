/* Hotel Aurelian arcade layer: action minigames, juice, collection, achievements, trophy room. */
(function () {
  'use strict';
  var A = window.HotelAudio;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------- Images ---------- */
  var IM = {};
  function img(name) {
    if (IM[name]) return IM[name];
    var i = new Image(), p = name.indexOf('/') >= 0 ? name : 'img/sprites/' + name + '.png';
    i.src = p; IM[name] = i; return i;
  }
  function ok(i) { return i && i.complete && i.naturalWidth > 0; }

  /* ---------- Collection, achievements, bests ---------- */
  var KEY = 'aurelian.collect.v1';
  var col = { items: {}, art: {}, ach: {}, best: {}, stars: {}, played: {}, tugs: 0 };
  try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw) col = Object.assign(col, raw); } catch (e) {}
  function saveCol() { try { localStorage.setItem(KEY, JSON.stringify(col)); } catch (e) {} }
  var LEFTOVERS = [
    ['keytag', 'Brass key tag, 309', 'It came out of the mirror at 2:51. Stamped 309.'],
    ['jaw', 'Jawbone with gold crowns', 'Somebody paid a lot for these.'],
    ['pearls', 'String of pearls', 'Formerly worn on vertebrae. A necklace wearing a necklace.'],
    ['lens', 'One spectacle lens', 'The other one is still being chewed.'],
    ['crown', 'Gold crown', 'Aarne says label it. Do not bite it.'],
    ['vertebra', 'Vertebra', 'Pearls sold separately.'],
    ['bone', 'A bone', 'The mirror will not say whose. Rude.'],
    ['shoe', 'Sensible black shoe', 'Chokes on shoes. Always has.'],
    ['glove', 'Gray kid glove', 'C. PELL, in ink. Warm inside.'],
    ['hatpin', 'Pearl hatpin', 'Steel. Chokes on pins.'],
    ['thimble', 'Brass thimble', 'Somebody was sewing something. It was not finished.'],
    ['molar', 'One molar', 'Brown at the root. Smiling, somehow.'],
    ['ring', 'Ring, R.T.L. to M.J.L.', 'Engraved 6-20-87. Nobody in the books.'],
    ['watch', 'Pocket watch', 'Stopped at 2:51, give or take a minute.'],
    ['monocle', 'Monocle on a chain', 'The mirror prefers to see you with both eyes.'],
    ['sachet', 'Lavender sachet', 'Marisol will want this back.'],
    ['roomkey', 'Old room key', 'For a door the hotel does not have any more.'],
    ['bell', 'Desk bell', 'Four rings is a failure of service.']
  ];
  var ARTIFACTS = { trout: 'Stuffed lake trout', photo: '1912 staff picnic photograph', ottilie: 'Portrait of Ottilie Brandt', mug: 'WORLD\'S OKAYEST BOSS mug', window309: 'Window of 309', cot: 'Aarne\'s cot', locker: 'Marisol\'s locker of names', button3: 'The worn acorn (the Button)' };
  var ACH = [
    ['n1', 'Night Audit', 'Finish Night One.'],
    ['n2', 'The Other Line', 'Finish Night Two.'],
    ['n3', 'The Jar Room', 'Finish Night Three.'],
    ['three', 'Every Room, Every Guest', 'Earn three stars on any night.'],
    ['nine', 'Employee of the Century', 'Earn all nine stars.'],
    ['combo10', 'Fence Posts', 'Reach a 10 combo in any action game.'],
    ['combo25', 'In Ink', 'Reach a 25 combo in any action game.'],
    ['ledger', 'Trial Balance Zero', 'Balance the Books without a single blot.'],
    ['nolick', 'Not To Its Taste', 'Cross the lobby without getting licked.'],
    ['slimed', 'Slimed', 'Catch a blob of mirror goo. Aarne has a towel.'],
    ['tug', 'Pulled It Back', 'Win a tug of war with the mirror.'],
    ['tug5', 'Rope Burn', 'Win five tugs of war.'],
    ['rings', 'Never Four Rings', 'Clear the switchboard without letting a real line ring four times.'],
    ['statue', 'Still As The Trout', 'Sneak the dark hallway without being seen.'],
    ['jar10', 'Half-Pint Collector', 'Put 10 leftovers on the Jar Shelf.'],
    ['jarall', 'In the Book, in the Jar', 'Collect every leftover.'],
    ['gold', 'Night Auditor of the Year', 'Earn three stars in every action game.']
  ];
  function achName(id) { var a = ACH.filter(function (x) { return x[0] === id; })[0]; return a ? a[1] : id; }
  function award(id) {
    if (col.ach[id]) return false; col.ach[id] = Date.now(); saveCol();
    setTimeout(function () { A.sfx('fanfare'); if (window.G && G.toast) G.toast('Achievement: ' + achName(id), 'ach'); }, 300);
    return true;
  }
  function collect(id) {
    if (col.items[id]) return false; col.items[id] = Date.now(); saveCol();
    var n = Object.keys(col.items).length; if (n >= 10) award('jar10'); if (n >= LEFTOVERS.length) award('jarall');
    return true;
  }
  function artifact(id) { if (!ARTIFACTS[id] || col.art[id]) return false; col.art[id] = Date.now(); saveCol(); return true; }
  function leftoverName(id) { var l = LEFTOVERS.filter(function (x) { return x[0] === id; })[0]; return l ? l[1] : id; }

  /* ---------- Drawing helpers ---------- */
  var D = {
    cover: function (c, im, W, H, dark, ox) {
      if (ok(im)) { var s = Math.max(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s; c.drawImage(im, (W - w) / 2 + (ox || 0), (H - h) / 2, w, h); }
      else { c.fillStyle = '#1a0b0c'; c.fillRect(0, 0, W, H); }
      if (dark) { c.fillStyle = 'rgba(10,4,6,' + dark + ')'; c.fillRect(0, 0, W, H); }
    },
    sprite: function (c, name, x, y, size, rot, alpha, glow) {
      var im = img(name); if (!ok(im)) return;
      c.save(); c.translate(x, y); if (rot) c.rotate(rot); if (alpha != null) c.globalAlpha = alpha;
      if (glow) { c.shadowColor = glow; c.shadowBlur = size * 0.45; }
      c.drawImage(im, -size / 2, -size / 2, size, size); c.restore();
    },
    rr: function (c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); },
    face: function (c, who, x, y, r, ring) {
      var im = img('img/por/' + who + '.jpg');
      c.save(); c.beginPath(); c.arc(x, y, r, 0, 6.283); c.closePath();
      c.fillStyle = '#2a1414'; c.fill();
      if (ok(im)) { c.clip(); c.drawImage(im, x - r, y - r, r * 2, r * 2); }
      c.restore();
      c.save(); c.lineWidth = Math.max(2, r * 0.12); c.strokeStyle = ring || '#d9b46a'; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.stroke(); c.restore();
    },
    /* An ornate gilt mirror. mood: {bulge, glow, eye, mouth} */
    mirror: function (c, x, y, w, h, t, mood) {
      mood = mood || {}; var b = mood.bulge || 0;
      c.save(); c.translate(x + w / 2, y + h / 2); c.scale(1 + b * 0.06, 1 + b * 0.04); c.translate(-w / 2, -h / 2);
      var fr = Math.max(6, w * 0.07);
      var g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#f3d58a'); g.addColorStop(0.35, '#a87a2c'); g.addColorStop(0.6, '#f0cc78'); g.addColorStop(1, '#6e4a17');
      c.fillStyle = g; D.rr(c, 0, 0, w, h, fr * 1.4); c.fill();
      c.fillStyle = 'rgba(0,0,0,0.35)'; for (var k = 0; k < 6; k++) { c.beginPath(); c.arc(w * (0.15 + k * 0.14), fr * 0.5, fr * 0.22, 0, 6.283); c.fill(); }
      var gx = fr, gy = fr, gw = w - fr * 2, gh = h - fr * 2;
      var sg = c.createLinearGradient(0, gy, 0, gy + gh); sg.addColorStop(0, '#5a6a72'); sg.addColorStop(0.5, '#1d2a30'); sg.addColorStop(1, '#0c1214');
      c.fillStyle = sg; D.rr(c, gx, gy, gw, gh, fr); c.fill();
      c.save(); D.rr(c, gx, gy, gw, gh, fr); c.clip();
      c.globalAlpha = 0.18; c.strokeStyle = '#cfe6ee'; c.lineWidth = 2;
      for (var i = 0; i < 5; i++) { c.beginPath(); var yy = gy + gh * (0.15 + i * 0.18) + Math.sin(t * 1.3 + i) * 4; c.moveTo(gx, yy); c.bezierCurveTo(gx + gw * 0.3, yy - 10, gx + gw * 0.7, yy + 10, gx + gw, yy); c.stroke(); }
      c.globalAlpha = 0.22; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(gx + gw * 0.12, gy); c.lineTo(gx + gw * 0.3, gy); c.lineTo(gx + gw * 0.05, gy + gh * 0.6); c.lineTo(gx, gy + gh * 0.5); c.closePath(); c.fill();
      c.globalAlpha = 1;
      if (mood.glow) { var rg = c.createRadialGradient(gx + gw / 2, gy + gh / 2, 2, gx + gw / 2, gy + gh / 2, gw); rg.addColorStop(0, 'rgba(160,255,190,' + (0.45 * mood.glow) + ')'); rg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = rg; c.fillRect(gx, gy, gw, gh); }
      if (mood.eye != null) D.eye(c, gx + gw / 2, gy + gh * 0.42, gw * 0.32, mood.eye, t, mood.look || 0);
      if (mood.mouth) { var mw = gw * 0.5 * mood.mouth, mh = gh * 0.14 * mood.mouth; c.fillStyle = '#2b0d12'; c.beginPath(); c.ellipse(gx + gw / 2, gy + gh * 0.82, mw / 2 + 1, mh / 2 + 1, 0, 0, 6.283); c.fill(); c.fillStyle = '#c94b63'; c.beginPath(); c.ellipse(gx + gw / 2, gy + gh * 0.82 + mh * 0.2, mw * 0.3, mh * 0.25, 0, 0, 6.283); c.fill(); }
      c.restore(); c.restore();
    },
    eye: function (c, x, y, r, open, t, look) {
      if (open <= 0.02) { c.strokeStyle = 'rgba(220,240,240,0.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - r, y); c.quadraticCurveTo(x, y + r * 0.25, x + r, y); c.stroke(); return; }
      c.save(); c.beginPath(); c.moveTo(x - r, y); c.quadraticCurveTo(x, y - r * open * 1.1, x + r, y); c.quadraticCurveTo(x, y + r * open * 1.1, x - r, y); c.closePath();
      c.fillStyle = '#f4f1e6'; c.fill(); c.clip();
      var ix = x + (look || 0) * r * 0.4;
      var ig = c.createRadialGradient(ix, y, 1, ix, y, r * 0.5); ig.addColorStop(0, '#fff3b0'); ig.addColorStop(0.4, '#d9a52e'); ig.addColorStop(1, '#5b3a0a');
      c.fillStyle = ig; c.beginPath(); c.arc(ix, y, r * 0.48, 0, 6.283); c.fill();
      c.fillStyle = '#111'; c.beginPath(); c.arc(ix, y, r * 0.2, 0, 6.283); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(ix - r * 0.12, y - r * 0.12, r * 0.07, 0, 6.283); c.fill();
      c.restore();
      c.strokeStyle = '#3b2610'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - r, y); c.quadraticCurveTo(x, y - r * open * 1.1, x + r, y); c.stroke();
    },
    tongue: function (c, x0, y0, x1, y1, thick, t) {
      var dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy); if (L < 2) return;
      c.save(); c.translate(x0, y0); c.rotate(Math.atan2(dy, dx));
      var g = c.createLinearGradient(0, -thick, 0, thick); g.addColorStop(0, '#f28aa0'); g.addColorStop(0.5, '#d9516f'); g.addColorStop(1, '#8e2340');
      c.fillStyle = g; c.beginPath(); c.moveTo(0, -thick * 0.7);
      var wob = Math.sin(t * 20) * thick * 0.15;
      c.bezierCurveTo(L * 0.3, -thick + wob, L * 0.7, -thick - wob, L - thick, -thick * 0.9);
      c.arc(L - thick, 0, thick * 0.95, -Math.PI / 2, Math.PI / 2);
      c.bezierCurveTo(L * 0.7, thick + wob, L * 0.3, thick - wob, 0, thick * 0.7); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(120,20,40,0.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(thick, 0); c.lineTo(L - thick * 1.4, 0); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(L * 0.5, -thick * 0.45, L * 0.25, thick * 0.12, 0, 0, 6.283); c.fill();
      c.restore();
    },
    bucket: function (c, x, y, w) {
      var h = w * 0.62;
      var g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, '#6d7479'); g.addColorStop(0.3, '#d9dee0'); g.addColorStop(0.55, '#9aa2a7'); g.addColorStop(1, '#4b5256');
      c.fillStyle = g; c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x + w / 2, y); c.lineTo(x + w * 0.38, y + h); c.lineTo(x - w * 0.38, y + h); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1.5; for (var i = 1; i < 3; i++) { var yy = y + h * i / 3, k = 0.5 - 0.12 * i / 3; c.beginPath(); c.moveTo(x - w * k, yy); c.lineTo(x + w * k, yy); c.stroke(); }
      c.fillStyle = '#2b2f31'; c.beginPath(); c.ellipse(x, y, w / 2, w * 0.1, 0, 0, 6.283); c.fill();
      c.strokeStyle = '#e8ecee'; c.lineWidth = 3; c.beginPath(); c.ellipse(x, y, w / 2, w * 0.1, 0, 0, 6.283); c.stroke();
      c.strokeStyle = '#8a9196'; c.lineWidth = 2.5; c.beginPath(); c.arc(x, y + 2, w * 0.46, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
    },
    door: function (c, x, y, w, h, label) {
      var g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#5a3418'); g.addColorStop(0.5, '#8a5428'); g.addColorStop(1, '#4a2a12');
      c.fillStyle = '#d9b46a'; c.fillRect(x - 4, y - 4, w + 8, h + 4);
      c.fillStyle = g; c.fillRect(x, y, w, h);
      c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 2;
      for (var r = 0; r < 3; r++) for (var q = 0; q < 2; q++) c.strokeRect(x + w * (0.12 + q * 0.44), y + h * (0.06 + r * 0.31), w * 0.32, h * 0.25);
      c.fillStyle = '#f0cc78'; c.beginPath(); c.arc(x + w * 0.85, y + h * 0.55, Math.max(3, w * 0.05), 0, 6.283); c.fill();
      if (label) { c.fillStyle = '#f6e6c0'; c.font = '600 ' + Math.round(w * 0.16) + 'px "EB Garamond", Georgia, serif'; c.textAlign = 'center'; c.fillText(label, x + w / 2, y - 10); }
    }
  };

  /* ---------- Games registry and session ---------- */
  var GAMES = {}, ORDER = [];
  function register(def) { GAMES[def.id] = def; ORDER.push(def.id); }
  var active = null, queue = Promise.resolve();

  function play(id, opts) {
    var run = function () { return new Promise(function (done) { new Session(GAMES[id], opts || {}, done); }); };
    if (!GAMES[id]) return Promise.resolve({ won: true, stars: 0, score: 0, skipped: true });
    if (window.G && G.prefs && G.prefs.skipGames && !(opts && opts.arcade)) {
      var d = GAMES[id]; col.played[id] = 1; saveCol();
      return Promise.resolve({ skipped: true, won: d.skipWin !== false, stars: d.skipWin === false ? 0 : 1, score: 0 });
    }
    queue = queue.then(run, run); return queue;
  }

  function Session(def, opts, done) {
    var self = this; active = this; this.def = def; this.opts = opts; this.done = done; this.fails = 0;
    col.played[def.id] = 1; saveCol();
    var root = document.createElement('div'); root.className = 'arc arc-' + def.id; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'arcTitle');
    root.innerHTML = '<div class="arc-hud"><h2 class="arc-title" id="arcTitle">' + esc(def.title) + '</h2>' +
      '<p class="arc-score"><span class="lab">Score</span> <b id="arcScore">0</b></p><p class="arc-combo" id="arcCombo" aria-hidden="true"></p>' +
      '<p class="arc-hearts" id="arcHearts"></p><button type="button" class="iconbtn arc-pause" id="arcPause" aria-label="Pause"><span aria-hidden="true">⏸</span></button></div>' +
      '<div class="arc-timer" aria-hidden="true"><span id="arcTime"></span></div>' +
      '<div class="arc-field" id="arcField"><canvas class="arc-cv" id="arcCv" role="img" aria-label="' + esc(def.title + '. ' + (def.aria || '')) + '"></canvas><div class="arc-dom" id="arcDom"></div></div>' +
      '<div class="arc-ctrl" id="arcCtrl"></div><div class="arc-card" id="arcCard" hidden></div><div class="sr-only" aria-live="polite" id="arcLive"></div>';
    document.body.appendChild(root); document.body.classList.add('arcading');
    this.root = root; this.cv = root.querySelector('#arcCv'); this.c = this.cv.getContext('2d');
    this.prevFocus = document.activeElement;
    this.onKey = function (e) { self.key(e, true); }; this.onKeyUp = function (e) { self.key(e, false); };
    this.onVis = function () { if (document.hidden && self.g && !self.g.over && !self.paused) self.pause(); };
    this.onResize = function () { self.size(); };
    window.addEventListener('keydown', this.onKey); window.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('visibilitychange', this.onVis); window.addEventListener('resize', this.onResize);
    var cv = this.cv;
    function pt(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    cv.addEventListener('pointerdown', function (e) { if (!self.live()) return; e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} var p = pt(e); self.g.pointer = { x: p[0], y: p[1], down: true, sx: p[0], sy: p[1], t: self.g.t }; if (def.down) def.down(self.g, p[0], p[1]); });
    cv.addEventListener('pointermove', function (e) { if (!self.live()) return; var p = pt(e); var P = self.g.pointer || {}; P.x = p[0]; P.y = p[1]; self.g.pointer = P; if (def.move) def.move(self.g, p[0], p[1], !!P.down); });
    var up = function (e) { if (!self.live()) return; var p = pt(e); var P = self.g.pointer || {}; P.down = false; if (def.up) def.up(self.g, p[0], p[1], P); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    root.querySelector('#arcPause').onclick = function () { if (self.live()) self.pause(); };
    this.size();
    this.intro();
  }
  Session.prototype.live = function () { return this.g && !this.g.over && !this.paused && this.running; };
  Session.prototype.size = function () {
    var f = this.root.querySelector('#arcField'), W = Math.max(200, f.clientWidth), H = Math.max(200, f.clientHeight), dpr = Math.min(2, window.devicePixelRatio || 1);
    this.cv.width = Math.round(W * dpr); this.cv.height = Math.round(H * dpr); this.cv.style.width = W + 'px'; this.cv.style.height = H + 'px';
    this.c.setTransform(dpr, 0, 0, dpr, 0, 0); this.W = W; this.H = H;
    if (this.g) { this.g.W = W; this.g.H = H; if (this.def.resize) this.def.resize(this.g); if (!this.running) this.frame(true); }
  };
  Session.prototype.card = function (html, cls) {
    var card = this.root.querySelector('#arcCard'); card.className = 'arc-card ' + (cls || ''); card.innerHTML = '<div class="arc-cardin">' + html + '</div>'; card.hidden = false;
    setTimeout(function () { var b = card.querySelector('[autofocus]') || card.querySelector('button'); if (b) b.focus(); }, 40);
    return card;
  };
  Session.prototype.hideCard = function () { var card = this.root.querySelector('#arcCard'); card.hidden = true; card.innerHTML = ''; };
  Session.prototype.intro = function () {
    var self = this, def = this.def, o = this.opts;
    var best = col.best[def.id] ? '<p class="arc-best">Your best: ' + col.best[def.id] + ' ' + starStr(col.stars[def.id] || 0) + '</p>' : '';
    var lead = o.lead || def.intro;
    var card = this.card('<p class="arc-kicker">' + esc(def.kicker || 'Action') + '</p><h3>' + esc(def.title) + '</h3><p class="arc-lead">' + lead + '</p>' +
      '<ul class="arc-how">' + def.how.map(function (h) { return '<li>' + h + '</li>'; }).join('') + '</ul>' + best +
      '<div class="row center"><button type="button" class="btn primary big" id="arcGo" autofocus>' + esc(def.startLabel || 'Start') + '</button></div>' +
      (o.arcade || def.noSkip ? '' : '<p class="arc-skip"><button type="button" class="linkbtn" id="arcSkip">Skip this game (story mode)</button></p>') +
      (o.arcade ? '<p class="arc-skip"><button type="button" class="linkbtn" id="arcBack">Back</button></p>' : ''), 'intro');
    this.g = this.newState(); if (def.init) def.init(this.g); this.frame(true);
    card.querySelector('#arcGo').onclick = function () { A.unlock(); self.countdown(); };
    var sk = card.querySelector('#arcSkip'); if (sk) sk.onclick = function () { self.finish({ skipped: true, won: def.skipWin !== false, stars: def.skipWin === false ? 0 : 1, score: 0 }); };
    var bk = card.querySelector('#arcBack'); if (bk) bk.onclick = function () { self.finish({ quit: true, won: false, stars: 0, score: 0 }); };
  };
  Session.prototype.newState = function () {
    var self = this, def = this.def;
    var g = { W: this.W, H: this.H, t: 0, score: 0, combo: 0, maxCombo: 0, hearts: def.hearts || 3, maxHearts: def.hearts || 3, over: false, P: [], T: [], shake: 0, flashA: 0, flashC: '#fff',
      night: this.opts.night || def.night || 1, opts: this.opts, found: [], dur: def.dur || 0, left: def.dur || 0, hits: 0, D: D, img: img, pointer: null, keys: {},
      el: function (s) { return self.root.querySelector(s); }, dom: this.root.querySelector('#arcDom'), ctrl: this.root.querySelector('#arcCtrl') };
    g.mult = function () { return Math.min(3, 1 + Math.floor(g.combo / 5) * 0.5); };
    g.add = function (p, x, y, col2) { var pts = Math.round(p * g.mult()); g.score += pts; if (x != null) g.float('+' + pts, x, y, col2 || '#ffe08a'); return pts; };
    g.good = function (p, x, y, label) {
      g.combo++; if (g.combo > g.maxCombo) g.maxCombo = g.combo; A.sfx('combo', g.combo); var pts = g.add(p, x, y);
      if (label && x != null) g.float(label, x, y - 26, '#fff4d6', 15);
      if (g.combo > 0 && g.combo % 5 === 0) { g.float('Combo x' + g.mult(), g.W / 2, g.H * 0.3, '#ffd36a', 26); A.sfx('star'); live('Combo ' + g.combo); }
      return pts;
    };
    g.miss = function (x, y, label) { if (g.combo >= 5) g.float('Combo lost', g.W / 2, g.H * 0.32, '#e9a3a3', 18); g.combo = 0; if (label && x != null) g.float(label, x, y, '#e9b3b3', 14); };
    g.bad = function (x, y, label) {
      if (g.over) return; g.hits++; g.combo = 0; g.hearts--; g.shakeIt(14); g.flash('#ff3b3b', 0.35); A.sfx('ouch');
      if (label && x != null) g.float(label, x, y, '#ffb0b0', 18);
      live((label || 'Ouch') + '. ' + Math.max(0, g.hearts) + ' lamps left.');
      if (g.hearts <= 0) setTimeout(function () { g.end(false); }, 350);
    };
    g.burst = function (x, y, colr, n, spd, opt) {
      opt = opt || {}; if (window.G && G.prefs && G.prefs.motion) n = Math.ceil(n / 2);
      for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, s = (spd || 160) * (0.3 + Math.random()); g.P.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (opt.up || 0), life: 0, max: (opt.life || 0.7) * (0.6 + Math.random() * 0.6), c: Array.isArray(colr) ? colr[i % colr.length] : colr, r: (opt.r || 3) * (0.5 + Math.random()), gr: opt.gr == null ? 300 : opt.gr, img: opt.img }); }
    };
    g.float = function (txt, x, y, c2, size) { g.T.push({ txt: txt, x: x, y: y, c: c2 || '#fff', life: 0, size: size || 18 }); };
    g.shakeIt = function (m) { if (window.G && G.prefs && G.prefs.motion) m *= 0.25; g.shake = Math.max(g.shake, m); };
    g.flash = function (c2, a) { g.flashC = c2; g.flashA = a; };
    g.collect = function (id, x, y) {
      var isNew = collect(id); if (isNew) { g.found.push(id); g.float('NEW! ' + leftoverName(id), x, y - 30, '#ffe08a', 17); A.sfx('fanfare'); live('New leftover for the Jar Shelf: ' + leftoverName(id)); }
      g.burst(x, y, ['#ffe08a', '#fff', '#f0cc78'], 26, 220, { gr: 60 });
      return isNew;
    };
    g.end = function (won) { if (g.over) return; g.over = true; g.won = won; setTimeout(function () { self.result(won); }, won ? 500 : 700); };
    g.live = live;
    function live(t) { var l = self.root.querySelector('#arcLive'); if (l) { l.textContent = ''; setTimeout(function () { l.textContent = t; }, 20); } }
    return g;
  };
  Session.prototype.countdown = function () {
    var self = this, def = this.def, n = def.quick ? 2 : 3;
    this.hideCard(); this.g = this.newState(); if (def.init) def.init(this.g); if (def.ctrl) this.root.querySelector('#arcCtrl').innerHTML = def.ctrl(this.g); if (def.bind) def.bind(this.g);
    this.renderHud(true);
    var el = document.createElement('div'); el.className = 'arc-count'; el.setAttribute('aria-hidden', 'true'); this.root.querySelector('#arcField').appendChild(el);
    this.running = false; this.frame(true);
    var tick = function () {
      if (n > 0) { el.textContent = n; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); A.sfx('tick'); n--; setTimeout(tick, 600); }
      else { el.textContent = def.goWord || 'Go!'; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); A.sfx('go'); setTimeout(function () { el.remove(); }, 500); self.start(); }
    };
    tick();
  };
  Session.prototype.start = function () {
    var self = this; this.running = true; this.paused = false; this.last = performance.now();
    if (this.def.music !== false) A.music(true, this.def.tempo || 128);
    if (this.def.begin) this.def.begin(this.g);
    var f = this.root.querySelector('#arcCtrl button') || this.cv; if (f && f.focus) { if (f === this.cv) this.cv.setAttribute('tabindex', '0'); f.focus({ preventScroll: true }); }
    var loop = function (now) {
      if (!self.running) return;
      var dt = Math.min(0.05, (now - self.last) / 1000); self.last = now;
      if (!self.paused) self.step(dt);
      self.frame(false);
      self.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  };
  Session.prototype.step = function (dt) {
    var g = this.g, def = this.def; if (g.over) { this.particles(dt); return; }
    g.t += dt;
    if (g.dur) { g.left = Math.max(0, g.dur - g.t); if (g.left <= 10 && !g.hurry) { g.hurry = true; A.musicRate(1.25); } if (g.left <= 0) { if (def.timeUp) def.timeUp(g); else g.end(true); } }
    if (def.update && !g.over) def.update(g, dt);
    this.particles(dt);
    this.renderHud(false);
  };
  Session.prototype.particles = function (dt) {
    var g = this.g;
    g.P = g.P.filter(function (p) { p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.gr * dt; p.vx *= 0.99; return p.life < p.max; });
    g.T = g.T.filter(function (t) { t.life += dt; t.y -= 40 * dt; return t.life < 1.1; });
    g.shake *= Math.pow(0.02, dt); if (g.shake < 0.3) g.shake = 0;
    g.flashA = Math.max(0, g.flashA - dt * 1.6);
  };
  Session.prototype.frame = function () {
    var c = this.c, g = this.g, def = this.def; if (!g) return;
    c.save(); c.clearRect(0, 0, g.W, g.H);
    if (g.shake) c.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake);
    if (def.draw) def.draw(g, c);
    g.P.forEach(function (p) { var k = 1 - p.life / p.max; c.globalAlpha = Math.max(0, k); if (p.img) { D.sprite(c, p.img, p.x, p.y, p.r * 6, p.life * 6); } else { c.fillStyle = p.c; c.beginPath(); c.arc(p.x, p.y, p.r * (0.5 + k * 0.5), 0, 6.283); c.fill(); } });
    c.globalAlpha = 1;
    g.T.forEach(function (t) { var k = 1 - t.life / 1.1; c.globalAlpha = Math.min(1, k * 1.6); c.font = '700 ' + Math.round(t.size * (1 + (t.life < 0.12 ? (0.12 - t.life) * 3 : 0))) + 'px "EB Garamond", Georgia, serif'; c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = 'rgba(20,6,8,0.85)'; c.strokeText(t.txt, t.x, t.y); c.fillStyle = t.c; c.fillText(t.txt, t.x, t.y); });
    c.globalAlpha = 1;
    if (g.flashA > 0) { c.globalAlpha = g.flashA; c.fillStyle = g.flashC; c.fillRect(-20, -20, g.W + 40, g.H + 40); c.globalAlpha = 1; }
    c.restore();
  };
  Session.prototype.renderHud = function (force) {
    var g = this.g, r = this.root;
    if (force || g._s !== g.score) { g._s = g.score; r.querySelector('#arcScore').textContent = g.score; }
    var cm = g.combo >= 3 ? 'Combo ' + g.combo + (g.mult() > 1 ? ' x' + g.mult() : '') : '';
    if (force || g._c !== cm) { g._c = cm; var ce = r.querySelector('#arcCombo'); ce.textContent = cm; ce.classList.remove('bump'); void ce.offsetWidth; if (cm) ce.classList.add('bump'); }
    if (force || g._h !== g.hearts) {
      g._h = g.hearts; var h = r.querySelector('#arcHearts'), s = '';
      for (var i = 0; i < g.maxHearts; i++) s += '<span class="lampi' + (i < g.hearts ? '' : ' out') + '"></span>';
      h.innerHTML = s; h.setAttribute('aria-label', Math.max(0, g.hearts) + ' of ' + g.maxHearts + ' lamps left'); h.setAttribute('role', 'img');
    }
    var tb = r.querySelector('#arcTime');
    var frac = this.def.progress ? this.def.progress(g) : (g.dur ? g.left / g.dur : 1);
    tb.style.width = (Math.max(0, Math.min(1, frac)) * 100).toFixed(1) + '%'; tb.parentNode.classList.toggle('hot', !!g.dur && g.left < 10 && !this.def.progress);
  };
  Session.prototype.key = function (e, down) {
    if (!this.g) return;
    if (down && (e.key === 'Escape' || e.key === 'p' || e.key === 'P') && this.live()) { e.preventDefault(); this.pause(); return; }
    if (!this.live()) return;
    var k = e.key; if (this.def.keys && this.def.keys.indexOf(k) >= 0) { e.preventDefault(); }
    if (down && this.g.keys[k]) { if (this.def.keyRepeat !== true) return; }
    this.g.keys[k] = down;
    if (this.def.key) this.def.key(this.g, k, down, e);
  };
  Session.prototype.pause = function () {
    var self = this; this.paused = true; A.music(false);
    var card = this.card('<h3>Paused</h3><p class="arc-lead">The mirror waits. It is very good at waiting.</p><ul class="arc-how">' + this.def.how.map(function (h) { return '<li>' + h + '</li>'; }).join('') + '</ul><div class="row center"><button type="button" class="btn primary big" id="arcRes" autofocus>Resume</button>' +
      '<button type="button" class="btn" id="arcRestart">Start over</button></div>', 'pause');
    card.querySelector('#arcRes').onclick = function () { self.hideCard(); self.paused = false; self.last = performance.now(); if (self.def.music !== false) A.music(true, self.def.tempo || 128); var f = self.root.querySelector('#arcCtrl button'); if (f) f.focus({ preventScroll: true }); };
    card.querySelector('#arcRestart').onclick = function () { self.stopLoop(); self.countdown(); };
  };
  Session.prototype.stopLoop = function () { this.running = false; if (this.raf) cancelAnimationFrame(this.raf); A.music(false); };
  Session.prototype.result = function (won) {
    var self = this, def = this.def, g = this.g, o = this.opts; this.stopLoop();
    if (def.finish) def.finish(g, won);
    var st = def.stars || [0, 0, 0], stars = won ? 1 + (g.score >= st[1] ? 1 : 0) + (g.score >= st[2] ? 1 : 0) : 0;
    var newBest = g.score > (col.best[def.id] || 0); if (newBest) col.best[def.id] = g.score; if (stars > (col.stars[def.id] || 0)) col.stars[def.id] = stars; saveCol();
    if (g.maxCombo >= 10) award('combo10'); if (g.maxCombo >= 25) award('combo25');
    if (ORDER.filter(function (id) { return id !== 'tug'; }).every(function (id) { return (col.stars[id] || 0) >= 3; })) award('gold');
    if (def.awards) def.awards(g, won, stars, award);
    A.sfx(won ? 'win' : 'fail');
    var line = won ? pick(def.winLines || ['Well audited.']) : pick(def.failLines || ['The mirror wins this round.']);
    var foundH = g.found.length ? '<div class="arc-found"><p>New for the Jar Shelf:</p><div class="row center">' + g.found.map(function (id) { return '<span class="arc-fi"><img src="img/sprites/' + id + '.png" alt=""><span>' + esc(leftoverName(id)) + '</span></span>'; }).join('') + '</div></div>' : '';
    var story = !o.arcade, canRetry = def.noRetry !== true || o.arcade;
    var btns = won
      ? '<button type="button" class="btn primary big" id="arcCont" autofocus>' + (story ? 'Continue the shift' : 'Play again') + '</button>' + (story && canRetry ? '<button type="button" class="btn" id="arcAgain">Play again for more stars</button>' : (story ? '' : '<button type="button" class="btn" id="arcBack2">Back to the Trophy Room</button>'))
      : (canRetry ? '<button type="button" class="btn primary big" id="arcAgain" autofocus>Try again</button>' : '') + (story ? '<button type="button" class="btn' + (canRetry ? '' : ' primary big') + '" id="arcOn"' + (canRetry ? '' : ' autofocus') + '>' + esc(def.carryLabel || 'Carry on anyway') + '</button>' : '<button type="button" class="btn" id="arcBack2">Back to the Trophy Room</button>');
    var card = this.card('<p class="arc-kicker">' + (won ? 'Shift saved' : 'Oops') + '</p><h3>' + esc(won ? (def.winTitle || 'Well done!') : (def.failTitle || 'The mirror wins this round')) + '</h3>' +
      '<p class="arc-stars" aria-label="' + stars + ' of 3 stars">' + starStr(stars, true) + '</p>' +
      '<p class="arc-lead">' + line + '</p>' +
      '<p class="arc-sc">Score <b>' + g.score + '</b>' + (newBest && g.score > 0 ? ' <span class="nb">New best!</span>' : ' <span class="small">Best ' + (col.best[def.id] || 0) + '</span>') + (g.maxCombo >= 3 ? ' · Best combo ' + g.maxCombo : '') + '</p>' +
      foundH + '<div class="row center">' + btns + '</div>', won ? 'win' : 'fail');
    if (won) { this.confetti(stars); }
    var res = { won: won, stars: stars, score: g.score, maxCombo: g.maxCombo, hits: g.hits, found: g.found.slice(), g: g };
    var c1 = card.querySelector('#arcCont'); if (c1) c1.onclick = function () { if (story) self.finish(res); else self.countdown(); };
    var a1 = card.querySelector('#arcAgain'); if (a1) a1.onclick = function () { self.fails += won ? 0 : 1; self.best = self.bestOf(res); self.countdown(); };
    var o1 = card.querySelector('#arcOn'); if (o1) o1.onclick = function () { self.finish(self.bestOf(res)); };
    var b1 = card.querySelector('#arcBack2'); if (b1) b1.onclick = function () { self.finish(res); };
    this.lastRes = res;
  };
  Session.prototype.bestOf = function (res) { var b = this.best; if (!b) return res; if (res.won && !b.won) return res; if (b.won && !res.won) return b; return res.stars >= b.stars ? res : b; };
  Session.prototype.confetti = function (stars) {
    var g = this.g, self = this; if (window.G && G.prefs && G.prefs.motion) return;
    g.burst(g.W / 2, g.H * 0.35, ['#ffe08a', '#f0cc78', '#fff', '#d9516f', '#9fd9b3'], 40 + stars * 25, 420, { up: 200, life: 1.6, r: 4 });
    var t0 = performance.now(), run = function (now) { if (!self.root.isConnected || self.running) return; self.particles(Math.min(0.05, (now - (self._lt || now)) / 1000)); self._lt = now; self.frame(); if (now - t0 < 2200) requestAnimationFrame(run); };
    requestAnimationFrame(run);
  };
  Session.prototype.finish = function (res) {
    this.stopLoop(); window.removeEventListener('keydown', this.onKey); window.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('visibilitychange', this.onVis); window.removeEventListener('resize', this.onResize);
    this.root.remove(); document.body.classList.remove('arcading'); active = null;
    if (res && res.g) delete res.g;
    try { if (this.prevFocus && this.prevFocus.focus && this.prevFocus.isConnected) this.prevFocus.focus({ preventScroll: true }); } catch (e) {}
    this.done(res);
  };
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function starStr(n, big) { return '<span class="' + (big ? 'stbig' : '') + '">' + '★★★'.slice(0, n) + '<span class="dim">' + '★★★'.slice(n) + '</span></span>'; }

  /* ---------- Trophy room ---------- */
  function trophyRoom(tab) {
    tab = tab || 'jars';
    var tabs = [['jars', 'Jar Shelf'], ['art', 'Artifacts'], ['ach', 'Achievements'], ['arcade', 'Arcade']];
    var nItems = Object.keys(col.items).length, nAch = Object.keys(col.ach).length, nArt = Object.keys(col.art).length;
    var body = '';
    if (tab === 'jars') body = '<p class="small">Leftovers the mirror spat out, caught, labeled, and jarred. ' + nItems + ' of ' + LEFTOVERS.length + '. Catch rare golden ones in the action games.</p><ul class="jarshelf">' + LEFTOVERS.map(function (l) {
      var has = !!col.items[l[0]];
      return '<li class="' + (has ? 'has' : 'not') + '"><span class="jarimg"><img src="img/sprites/' + l[0] + '.png" alt=""></span><span class="jn">' + (has ? esc(l[1]) : 'Not yet jarred') + '</span>' + (has ? '<span class="jd">' + esc(l[2]) + '</span>' : '<span class="jd">Keep playing.</span>') + '</li>';
    }).join('') + '</ul>';
    if (tab === 'art') body = '<p class="small">Curiosities you noticed around the hotel. ' + nArt + ' of ' + Object.keys(ARTIFACTS).length + '.</p><ul class="achl">' + Object.keys(ARTIFACTS).map(function (k) { var h = !!col.art[k]; return '<li class="' + (h ? 'has' : 'not') + '"><span class="ai" aria-hidden="true">' + (h ? '🔍' : '?') + '</span><span>' + (h ? esc(ARTIFACTS[k]) : 'Not noticed yet') + '</span></li>'; }).join('') + '</ul>';
    if (tab === 'ach') body = '<p class="small">' + nAch + ' of ' + ACH.length + ' earned.</p><ul class="achl">' + ACH.map(function (a) { var h = !!col.ach[a[0]]; return '<li class="' + (h ? 'has' : 'not') + '"><span class="ai" aria-hidden="true">' + (h ? '🏆' : '🔒') + '</span><span><strong>' + esc(a[1]) + '</strong><br><span class="small">' + esc(a[2]) + '</span></span>' + (h ? '<span class="sr-only"> (earned)</span>' : '<span class="sr-only"> (not yet)</span>') + '</li>'; }).join('') + '</ul>';
    if (tab === 'arcade') body = '<p class="small">Replay any action game you have reached in the story. Beat your best score and hunt for rare leftovers.</p><ul class="arcl">' + ORDER.map(function (id) {
      var d = GAMES[id], reached = !!col.played[id], lock = d.night > 1 && !(window.G && G.unlocked());
      var can = reached && !lock;
      return '<li><span class="an"><strong>' + esc(d.title) + '</strong><span class="small">' + (d.night ? 'Night ' + d.night : 'Every night') + ' · Best ' + (col.best[id] || 0) + ' ' + starStr(col.stars[id] || 0) + '</span></span>' +
        (can ? '<button type="button" class="btn small arcplay" data-g="' + id + '">Play</button>' : '<span class="small dim">' + (lock ? '🔒 Book owners' : 'Reach it in the story') + '</span>') + '</li>';
    }).join('') + '</ul>';
    var html = '<div class="tabs" role="tablist">' + tabs.map(function (t) { return '<button type="button" role="tab" class="btn small tab' + (t[0] === tab ? ' on' : '') + '" aria-selected="' + (t[0] === tab) + '" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div><div role="tabpanel">' + body + '</div>';
    if (window.G && G.closeAllPanels) G.closeAllPanels();
    var p = G.panel('Trophy Room', html, { cls: 'trophy' });
    p.el.querySelectorAll('.tab').forEach(function (b) { b.onclick = function () { A.sfx('page'); trophyRoom(b.dataset.tab); var nb = document.querySelector('.trophy .tab[data-tab="' + b.dataset.tab + '"]'); if (nb) nb.focus(); }; });
    p.el.querySelectorAll('.arcplay').forEach(function (b) { b.onclick = function () { var id = b.dataset.g; p.close(); play(id, { arcade: true, night: GAMES[id].night || 1 }).then(function () { trophyRoom('arcade'); }); }; });
    return p;
  }

  window.Arcade = { register: register, play: play, games: GAMES, order: ORDER, D: D, img: img, col: col, award: award, collect: collect, artifact: artifact, trophyRoom: trophyRoom, leftovers: LEFTOVERS, ach: ACH, active: function () { return active; }, saveCol: saveCol,
    reset: function () { col.items = {}; col.art = {}; col.ach = {}; col.best = {}; col.stars = {}; col.played = {}; col.tugs = 0; saveCol(); } };
  /* Test hook: read-only view of the running game. */
  window.__arc = { get g() { return active && active.g; }, get id() { return active && active.def.id; }, get running() { return !!(active && active.running && !active.paused); } };
})();
