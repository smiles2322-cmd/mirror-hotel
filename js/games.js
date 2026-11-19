/* Hotel Aurelian action games. Each night has its own, plus the tug of war on every night. */
(function () {
  'use strict';
  var AR = window.Arcade, D = AR.D, img = AR.img, A = window.HotelAudio;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function R(a, b) { return a + Math.random() * (b - a); }
  function RI(a, b) { return Math.floor(R(a, b + 1)); }
  function pickArr(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function bg(n) { return img('img/bg/' + n + '.jpg'); }
  function rarePick(pool) { var c = AR.col, fresh = pool.filter(function (x) { return !c.items[x]; }); return pickArr(fresh.length && Math.random() < 0.75 ? fresh : pool); }
  function txt(c, s, x, y, size, color, align, weight) { c.font = (weight || 600) + ' ' + Math.round(size) + 'px "EB Garamond", Georgia, serif'; c.textAlign = align || 'center'; c.lineWidth = Math.max(3, size / 5); c.strokeStyle = 'rgba(15,5,7,0.85)'; c.strokeText(s, x, y); c.fillStyle = color || '#f6e6c0'; c.fillText(s, x, y); }
  var LEFT = ['ArrowLeft', 'a', 'A'], RIGHT = ['ArrowRight', 'd', 'D'];

  /* =====================================================================
     CATCH: leftovers out of the mirror (Night 1) or the coughing walls (Night 2)
     ===================================================================== */
  function makeCatch(cfg) {
    var def = {
      id: cfg.id, night: cfg.night, title: cfg.title, kicker: cfg.kicker, intro: cfg.intro, how: cfg.how, dur: cfg.dur, hearts: 3, tempo: cfg.tempo || 132, stars: cfg.stars,
      keys: LEFT.concat(RIGHT), aria: 'Move the bucket left and right to catch what falls. Avoid the bad things.',
      winTitle: cfg.winTitle, failTitle: cfg.failTitle, winLines: cfg.winLines, failLines: cfg.failLines,
      geo: function (g) {
        var mw = Math.min(g.W * 0.34, 210), mh = Math.min(g.H * 0.34, mw * 1.45);
        return { mx: g.W / 2 - mw / 2, my: g.H * 0.03, mw: mw, mh: mh, mouthX: g.W / 2, mouthY: g.H * 0.03 + mh * 0.82, by: g.H - Math.max(58, g.H * 0.12), bw: Math.min(g.W * 0.27, 140) };
      },
      init: function (g) { g.bx = g.W / 2; g.tx = g.W / 2; g.items = []; g.next = 1.0; g.guar = cfg.guaranteed.slice(); g.rareLeft = 2; g.belchT = 0; g.caught = 0; g.slimed = false; },
      resize: function (g) { g.bx = Math.min(g.bx, g.W); g.tx = Math.min(g.tx, g.W); },
      down: function (g, x) { g.tx = x; }, move: function (g, x, y, down) { if (down || g.mouseFollow) g.tx = x; },
      volley: function (g) {
        var geo = def.geo(g), n = cfg.base + Math.floor(g.t / 9) + (Math.random() < 0.5 ? 1 : 0);
        g.belchT = 0.55; g.shakeIt(cfg.source === 'mirror' ? 8 : 12);
        if (cfg.source === 'mirror') { A.sfx('burp', 0.5 + Math.random() * 0.6); g.burst(geo.mouthX, geo.mouthY, ['rgba(170,230,180,0.7)', 'rgba(220,255,220,0.5)'], 14, 140, { gr: -40, r: 6, life: 0.9 }); }
        else { A.sfx('cough1'); g.burst(g.W / 2, 4, ['#e8e2d6', '#cfc6b4'], 30, 260, { gr: 400, r: 3 }); }
        var badP = Math.min(0.42, cfg.bad0 + g.t * cfg.badRamp);
        for (var i = 0; i < n; i++) {
          var it = { done: false, vr: R(-5, 5), rot: R(0, 6) };
          if (g.guar.length && g.t > 2.5 && i === 0 && Math.random() < 0.6) { it.kind = 'story'; it.img = g.guar.shift(); it.pts = 120; }
          else if (g.rareLeft && g.t > 6 && Math.random() < 0.09) { it.kind = 'rare'; it.img = rarePick(cfg.rare); it.pts = 100; g.rareLeft--; }
          else if (Math.random() < badP) { it.kind = 'bad'; it.img = pickArr(cfg.bads); }
          else { var gd = pickArr(cfg.goods); it.kind = 'good'; it.img = gd[0]; it.pts = gd[1]; }
          if (cfg.source === 'mirror') { it.x = geo.mouthX + R(-10, 10); it.y = geo.mouthY; it.vx = R(-1, 1) * g.W * 0.42; it.vy = -g.H * R(0.25, 0.6); it.delay = i * 0.12; }
          else { it.x = R(g.W * 0.08, g.W * 0.92); it.y = -30 - i * R(30, 90); it.vx = R(-20, 20); it.vy = g.H * (0.18 + Math.min(0.25, g.t * 0.008)); it.delay = 0; }
          g.items.push(it);
        }
      },
      update: function (g, dt) {
        var geo = def.geo(g), sp = g.W * 1.35;
        if (LEFT.some(function (k) { return g.keys[k]; })) g.tx -= sp * dt;
        if (RIGHT.some(function (k) { return g.keys[k]; })) g.tx += sp * dt;
        g.tx = Math.max(geo.bw / 2, Math.min(g.W - geo.bw / 2, g.tx));
        g.bx += (g.tx - g.bx) * Math.min(1, dt * 16);
        g.belchT = Math.max(0, g.belchT - dt);
        g.next -= dt; if (g.next <= 0) { def.volley(g); g.next = Math.max(cfg.minGap, cfg.gap - g.t * cfg.ramp); }
        var grav = g.H * (cfg.source === 'mirror' ? 0.95 : 0.35);
        g.items = g.items.filter(function (it) {
          if (it.delay > 0) { it.delay -= dt; return true; }
          it.vy += grav * dt * (cfg.source === 'mirror' ? 1 : 0.35); it.x += it.vx * dt; it.y += it.vy * dt; it.rot += it.vr * dt;
          if (it.x < 16) { it.x = 16; it.vx = Math.abs(it.vx) * 0.7; } if (it.x > g.W - 16) { it.x = g.W - 16; it.vx = -Math.abs(it.vx) * 0.7; }
          if (!it.done && it.vy > 0 && it.y >= geo.by - 14 && it.y <= geo.by + 22 && Math.abs(it.x - g.bx) < geo.bw * 0.52) {
            it.done = true;
            if (it.kind === 'bad') { g.bad(it.x, geo.by - 30, cfg.badLabel(it.img)); g.burst(it.x, geo.by, it.img === 'goo' ? ['#7fae55', '#a8d47a', '#4e7a33'] : ['#eee8dc', '#cfc6b4'], 22, 200, { r: 4 }); if (it.img === 'goo') { g.slimed = true; A.sfx('splat'); } else A.sfx('thud'); }
            else {
              A.sfx('catch', g.combo);
              g.good(it.pts, it.x, geo.by - 30, it.kind === 'story' ? AR.leftovers.filter(function (l) { return l[0] === it.img; })[0][1] : null);
              g.burst(it.x, geo.by - 4, ['#ffe08a', '#fff4d6'], 10, 140, { gr: 200 });
              if (it.kind === 'story' || it.kind === 'rare') g.collect(it.img, it.x, geo.by - 40);
              g.caught++;
            }
            return false;
          }
          if (it.y > g.H + 40) {
            if (it.kind !== 'bad' && !it.done) { g.miss(Math.max(30, Math.min(g.W - 30, it.x)), g.H - 20, 'Missed'); if (it.kind === 'story') g.guar.push(it.img); }
            return false;
          }
          return true;
        });
      },
      timeUp: function (g) {
        if (g.guar.length) { g.dur += 4; g.left = 4; g.next = 0; return; }
        g.end(true);
      },
      draw: function (g, c) {
        var geo = def.geo(g);
        D.cover(c, bg(cfg.bg), g.W, g.H, 0.45);
        if (cfg.source === 'mirror') D.mirror(c, geo.mx, geo.my, geo.mw, geo.mh, g.t, { bulge: g.belchT > 0 ? Math.sin(g.belchT / 0.55 * Math.PI) : 0, glow: g.belchT > 0 ? 1 : 0.15, mouth: g.belchT > 0 ? 1 : 0.15, eye: g.belchT > 0 ? 0.2 : 0.8, look: (g.bx - g.W / 2) / g.W * 2 });
        else { c.strokeStyle = 'rgba(240,230,210,0.35)'; c.lineWidth = 2; for (var k = 0; k < 6; k++) { c.beginPath(); var x0 = g.W * (0.1 + k * 0.16); c.moveTo(x0, 0); c.lineTo(x0 + 12, 18); c.lineTo(x0 - 6, 34); c.stroke(); } if (g.belchT > 0) { c.fillStyle = 'rgba(230,220,200,' + (g.belchT * 0.5) + ')'; c.fillRect(0, 0, g.W, g.H * 0.2); } }
        var sz = Math.max(40, Math.min(66, g.W * 0.12));
        g.items.forEach(function (it) {
          if (it.delay > 0) return;
          var glow = it.kind === 'rare' ? '#ffd36a' : (it.kind === 'story' ? '#fff4d6' : (it.kind === 'bad' ? (it.img === 'goo' ? '#7fae55' : null) : null));
          if (it.kind === 'rare') { c.save(); c.globalAlpha = 0.5 + 0.3 * Math.sin(g.t * 10); c.fillStyle = '#ffd36a'; c.beginPath(); c.arc(it.x, it.y, sz * 0.62, 0, 6.283); c.fill(); c.restore(); }
          D.sprite(c, it.img, it.x, it.y, it.kind === 'story' ? sz * 1.15 : sz, it.rot, 1, glow);
        });
        D.bucket(c, g.bx, geo.by, geo.bw);
        if (g.t < 3 && !g.over) txt(c, 'Drag or use arrow keys', g.W / 2, geo.by - 40, 16, '#f6e6c0');
      },
      awards: function (g, won, stars, award) { if (g.slimed) award('slimed'); }
    };
    return def;
  }
  AR.register(makeCatch({
    id: 'catch', night: 1, title: 'Leftover Catch', kicker: 'Night One · 2:51 AM', bg: 'lobby', source: 'mirror', dur: 35,
    intro: 'The mirror is belching up what it could not digest. Aarne needs every scrap in the bucket so it can go in a jar. Catch the leftovers, dodge the goo.',
    how: ['<strong>Drag</strong> anywhere, or use the <strong>arrow keys</strong>, to slide Aarne\'s bucket.', 'Bones, pearls, crowns and key tags score. Catch several in a row for a combo.', '<strong>Green goo</strong> puts out one of your three lamps.', 'Glowing gold leftovers go to your Jar Shelf forever.'],
    goods: [['jaw', 30], ['pearls', 25], ['lens', 20], ['crown', 20], ['vertebra', 15], ['bone', 15]], bads: ['goo'], guaranteed: ['keytag'], rare: ['jaw', 'pearls', 'lens', 'crown', 'vertebra', 'bone', 'watch'],
    base: 2, gap: 2.6, minGap: 1.25, ramp: 0.045, bad0: 0.14, badRamp: 0.007, stars: [0, 700, 1300],
    badLabel: function () { return 'Goo!'; },
    winTitle: 'Bucket full', failTitle: 'Slimed',
    winLines: ['Aarne looks in the bucket and nods, which from Aarne is a standing ovation.', 'The mirror coughs politely into its napkin. Every scrap is accounted for.', 'In the book, in the jar. Otherwise nobody remembers. Nicely caught.'],
    failLines: ['You caught the goo. Aarne hands you a towel and does not make eye contact.', 'Three blobs of goo. The trout, you would swear, looks away.', 'The mirror is laughing. You can tell because the radiators are knocking in rhythm.']
  }));
  AR.register(makeCatch({
    id: 'cough', night: 2, title: 'Cough Catch', kicker: 'Night Two · Room 309', bg: 'room309', source: 'ceiling', dur: 32,
    intro: 'Room 309 is back, and it is coughing up what the mirror could not keep down. Catch the guest\'s things before they hit the wet floor. Dodge the falling plaster.',
    how: ['<strong>Drag</strong>, or use the <strong>arrow keys</strong>, to slide the bucket.', 'Catch the <strong>glove</strong> and the <strong>hatpin</strong>. They belong to the guest.', '<strong>Plaster chunks</strong> and <strong>goo</strong> put out a lamp.', 'Glowing gold things go to your Jar Shelf.'],
    goods: [['bone', 15], ['vertebra', 15], ['lens', 20], ['pearls', 25], ['crown', 20]], bads: ['plaster', 'plaster', 'goo'], guaranteed: ['glove', 'hatpin'], rare: ['sachet', 'monocle', 'roomkey', 'watch'],
    base: 3, gap: 2.4, minGap: 1.1, ramp: 0.05, bad0: 0.18, badRamp: 0.007, stars: [0, 650, 1200], tempo: 140,
    badLabel: function (k) { return k === 'goo' ? 'Goo!' : 'Plaster!'; },
    winTitle: 'Room 309, accounted for', failTitle: 'Plastered',
    winLines: ['Dash filmed the whole thing. He will not remember it, but the video is very good.', 'The ribs in the wall go flat, the way a dog pretends it was not just on the sofa.'],
    failLines: ['A chunk of ceiling lands on you with a sound like a polite cough. You are fine. Your dignity is in a jar.', 'Aarne mops around you. He has seen worse. He has jarred worse.']
  }));

  /* =====================================================================
     LEDGER: Balance the Books (Night 1)
     ===================================================================== */
  var LABELS = ['Room 301', 'Room 305', 'Room 311', 'Minibar', 'Valet', 'Room service', 'Lost towel', 'Trout dusting', 'House call', 'Laundry', 'Late checkout', 'Gold mints', 'Bait shop tab', 'Firewood', 'Wedding cake', 'Radiator repair'];
  AR.register({
    id: 'ledger', night: 1, title: 'Balance the Books', kicker: 'Night One · The audit', dur: 60, hearts: 3, tempo: 112,
    intro: 'Innkeeper 7 prints the night\'s charges. A good auditor makes the books balance to the penny before the mirror gets hungry. Tick off slips until they add up exactly to the total.',
    how: ['Tap charge slips to tick them. Ticked slips must add up to <strong>exactly</strong> the target.', 'Go over the target and you blot the page. Three blots and the audit is ruined.', 'Each balanced page scores more the faster you are. Pages get trickier.'],
    aria: 'Charge slips are buttons below the target.', stars: [0, 900, 1600],
    winTitle: 'Trial balance at zero', failTitle: 'Blotted',
    winLines: ['You feel the small bright click of it in your chest. The books balance.', 'Every room, every guest, every night. In ink. Balanced.'],
    failLines: ['Three blots. The page looks like a map of Lake Superior drawn by a frightened duck.', 'Innkeeper 7 hums its note below B-flat, which is how a computer sighs.'],
    init: function (g) { g.round = 0; g.blots = 0; g.slips = []; g.sel = []; },
    begin: function (g) { this.newRound(g); },
    newRound: function (g) {
      var spec = [[4, 2], [5, 2], [5, 3], [6, 3], [6, 3], [7, 3], [8, 4], [8, 4]][Math.min(7, g.round)];
      var max = 18 + g.round * 14, vals = [], used = {};
      function v() { var x; do { x = RI(3, max); } while (used[x]); used[x] = 1; return x; }
      for (var i = 0; i < spec[0]; i++) vals.push(v());
      var sol = shuffle(vals.slice()).slice(0, spec[1]), target = sol.reduce(function (a, b) { return a + b; }, 0);
      var labs = shuffle(LABELS.slice());
      g.slips = shuffle(vals.map(function (x, k) { return { v: x, l: labs[k] }; })); g.target = target; g.sel = []; g.roundT = g.t;
      this.render(g);
    },
    render: function (g) {
      var sum = g.sel.reduce(function (a, i) { return a + g.slips[i].v; }, 0);
      g.dom.innerHTML = '<div class="lg"><p class="lg-target">Page ' + (g.round + 1) + ': balance to <b>$' + g.target + '</b></p><p class="lg-sum" role="status">Ticked: <b>$' + sum + '</b></p><div class="lg-slips">' +
        g.slips.map(function (s, i) { var on = g.sel.indexOf(i) >= 0; return '<button type="button" class="slip' + (on ? ' on' : '') + '" data-i="' + i + '" aria-pressed="' + on + '"><span class="sl">' + esc(s.l) + '</span><span class="sv">$' + s.v + '</span></button>'; }).join('') + '</div></div>';
      var self = this;
      g.dom.querySelectorAll('.slip').forEach(function (b) { b.onclick = function () { self.tap(g, +b.dataset.i, b); }; });
    },
    tap: function (g, i, b) {
      if (g.over || !window.__arc.running) return;
      var k = g.sel.indexOf(i); if (k >= 0) g.sel.splice(k, 1); else g.sel.push(i);
      A.sfx('click');
      var sum = g.sel.reduce(function (a, j) { return a + g.slips[j].v; }, 0), self = this;
      var r = b.getBoundingClientRect(), fr = g.dom.getBoundingClientRect(), x = r.left - fr.left + r.width / 2, y = r.top - fr.top;
      if (sum === g.target) {
        var bonus = Math.max(0, Math.round(80 - (g.t - g.roundT) * 8));
        A.sfx('scratch'); g.good(100 + g.round * 25 + bonus, g.W / 2, g.H * 0.25, 'Balanced!'); g.burst(g.W / 2, g.H * 0.3, ['#ffe08a', '#fff'], 30, 260, { gr: 120 });
        g.round++; g.sel = []; this.render(g); g.dom.querySelector('.lg').classList.add('flash');
        if (g.round >= 8) { g.add(Math.round(g.left * 10), g.W / 2, g.H * 0.4); g.end(true); return; }
        setTimeout(function () { if (!g.over) { self.newRound(g); var f = g.dom.querySelector('.slip'); if (f) f.focus(); } }, 380);
      } else if (sum > g.target) {
        g.blots++; g.bad(x, y, 'Blot!'); g.burst(x, y + 20, ['#1d2c6b', '#2f45a0', '#0d1640'], 26, 200, { r: 5 }); A.sfx('splat');
        g.sel = []; if (!g.over) { this.render(g); var nb = g.dom.querySelector('.slip[data-i="' + i + '"]'); if (nb) nb.focus(); }
      } else { this.render(g); var nb2 = g.dom.querySelector('.slip[data-i="' + i + '"]'); if (nb2) nb2.focus(); }
    },
    timeUp: function (g) { g.end(g.round >= 2); },
    draw: function (g, c) { D.cover(c, bg('desk'), g.W, g.H, 0.62); },
    awards: function (g, won, stars, award) { if (won && g.blots === 0 && g.round >= 4) award('ledger'); }
  });

  /* =====================================================================
     TONGUE CROSSING (Night 1)
     ===================================================================== */
  var CARRY = [['hksheet', 'the housekeeping sheet'], ['pen', 'your fountain pen'], ['shoe', 'the shoe']];
  AR.register({
    id: 'tongue', night: 1, title: 'Tongue Crossing', kicker: 'Night One · 3:30 AM', dur: 50, hearts: 3, tempo: 138,
    intro: 'The mirror is smacking its lips. You need to carry three things from the mirror back to the front desk, and its tongue is lashing across the lobby floor. Step when it is safe.',
    how: ['Tap <strong>Step</strong> (or the top of the picture, or <strong>Up</strong> / <strong>Space</strong>) to move forward one row.', 'Tap <strong>Back</strong> (or <strong>Down</strong>) to retreat.', 'A row <strong>glows red</strong> just before the tongue lashes across it. Get out of that row.', 'Three deliveries and you win. Faster is better.'],
    keys: ['ArrowUp', 'ArrowDown', 'w', 's', 'W', 'S', ' '], aria: 'Rows of floor between the mirror and the desk.', stars: [0, 800, 1150],
    winTitle: 'Delivered to the desk', failTitle: 'Licked',
    winLines: ['Not a single lick. Well, maybe one. The mirror would like you to know you taste of pencil shavings.', 'Everything is at the desk. The mirror sulks like a dog that was not given the crust.'],
    failLines: ['Licked. The mirror spits you out onto the marble. Apparently you are still not to its taste.', 'Three licks. Your blazer will need dry cleaning, and the dry cleaner will have questions.'],
    rows: 5,
    lay: function (g) { var hz = g.H * 0.13, rh = (g.H - hz * 2) / this.rows, mw = Math.max(54, Math.min(g.W * 0.2, 150)); return { hz: hz, rh: rh, mx: g.W * 0.02, mw: mw, x0: g.W * 0.02 + mw - 6, px: Math.max(g.W * 0.62, g.W * 0.02 + mw + 60) }; },
    rowY: function (g, i) { var L = this.lay(g); if (i < 0) return g.H - L.hz / 2; if (i >= this.rows) return L.hz / 2; return g.H - L.hz - L.rh * (i + 0.5); },
    init: function (g) {
      g.p = -1; g.py = null; g.trips = 0; g.inv = 0; g.tripT = 0; g.licks = 0; g.lane = [];
      for (var i = 0; i < this.rows; i++) g.lane.push({ st: 'idle', tm: R(0.6, 2.4) + i * 0.2, ext: 0 });
      this.placeGem(g);
    },
    placeGem: function (g) { g.gem = Math.random() < 0.55 ? { row: RI(1, this.rows - 1), img: rarePick(['watch', 'monocle', 'crown', 'roomkey']) } : null; },
    ctrl: function () { return '<div class="row center"><button type="button" class="btn big ctl" id="tBack" aria-label="Step back">▼ Back</button><button type="button" class="btn primary big ctl" id="tStep" aria-label="Step forward">▲ Step</button></div>'; },
    bind: function (g) { var self = this; g.ctrl.querySelector('#tStep').onclick = function () { self.step(g, 1); }; g.ctrl.querySelector('#tBack').onclick = function () { self.step(g, -1); }; },
    down: function (g, x, y) { this.step(g, y < this.rowY(g, g.p) ? 1 : -1); },
    key: function (g, k, down) { if (!down) return; if (k === 'ArrowUp' || k === 'w' || k === 'W' || k === ' ') this.step(g, 1); if (k === 'ArrowDown' || k === 's' || k === 'S') this.step(g, -1); },
    step: function (g, d) {
      if (g.over || !window.__arc.running || g.stun > 0) return;
      if (g.t - (g.lastHop == null ? -9 : g.lastHop) < 0.16) return; g.lastHop = g.t;
      var np = Math.max(-1, Math.min(this.rows, g.p + d)); if (np === g.p) return;
      g.p = np; A.sfx('hop');
      if (d > 0 && np < this.rows) g.add(10);
      if (g.gem && g.gem.row === np) { g.collect(g.gem.img, this.lay(g).px, this.rowY(g, np)); g.good(100, this.lay(g).px, this.rowY(g, np)); g.gem = null; }
      if (np === this.rows) {
        var bonus = Math.max(0, Math.round(120 - (g.t - g.tripT) * 12));
        g.trips++; A.sfx('ding'); g.good(200 + bonus, this.lay(g).px, this.rowY(g, np) + 30, 'Delivered!'); g.burst(this.lay(g).px, this.rowY(g, np), ['#ffe08a', '#fff'], 24, 220, { gr: 100 });
        if (g.trips >= 3) { g.add(Math.round(g.left * 8), g.W / 2, g.H / 2); g.end(true); return; }
        g.stun = 0.35; var self = this; setTimeout(function () { g.p = -1; g.tripT = g.t; self.placeGem(g); }, 300);
      }
    },
    update: function (g, dt) {
      var L = this.lay(g), self = this, speed = 1 + g.trips * 0.35 + g.t * 0.006;
      g.stun = Math.max(0, (g.stun || 0) - dt); g.inv = Math.max(0, g.inv - dt);
      var ty = this.rowY(g, g.p); g.py = g.py == null ? ty : g.py + (ty - g.py) * Math.min(1, dt * 20);
      g.lane.forEach(function (ln, i) {
        ln.tm -= dt * speed;
        if (ln.st === 'idle' && ln.tm <= 0) { ln.st = 'warn'; ln.tm = 0.7; if (i === g.p) A.sfx('slurp'); }
        else if (ln.st === 'warn' && ln.tm <= 0) { ln.st = 'out'; ln.tm = 0.22; A.sfx('lick'); }
        else if (ln.st === 'out') { ln.ext = Math.min(1, 1 - ln.tm / 0.22); if (ln.tm <= 0) { ln.st = 'hold'; ln.tm = 0.3; ln.ext = 1; } }
        else if (ln.st === 'hold' && ln.tm <= 0) { ln.st = 'back'; ln.tm = 0.35; }
        else if (ln.st === 'back') { ln.ext = Math.max(0, ln.tm / 0.35); if (ln.tm <= 0) { ln.st = 'idle'; ln.ext = 0; ln.tm = R(0.9, 2.8); } }
        var tip = L.x0 + ln.ext * (g.W - L.x0 + 30);
        if (g.p === i && g.inv <= 0 && (ln.st === 'out' || ln.st === 'hold' || ln.st === 'back') && tip >= L.px - 18) {
          g.licks++; g.inv = 1.2; g.stun = 0.5; g.bad(L.px, self.rowY(g, i) - 20, 'Licked!'); A.sfx('lick');
          g.burst(L.px, self.rowY(g, i), ['#f28aa0', '#ffd0da', '#fff'], 22, 220, { r: 4 }); g.p = -1; g.tripT = g.t;
        }
      });
    },
    timeUp: function (g) { g.end(g.trips >= 1); },
    draw: function (g, c) {
      var L = this.lay(g), self = this;
      D.cover(c, bg('lobby'), g.W, g.H, 0.5);
      c.fillStyle = 'rgba(40,20,10,0.5)'; c.fillRect(0, 0, g.W, L.hz); c.fillStyle = 'rgba(20,10,10,0.35)'; c.fillRect(0, g.H - L.hz, g.W, L.hz);
      txt(c, 'The front desk', L.px, L.hz * 0.62, Math.min(20, L.hz * 0.35), '#ffe08a');
      txt(c, 'Start here', L.px, g.H - L.hz * 0.38, Math.min(16, L.hz * 0.3), '#e9d8b4');
      for (var i = 0; i < this.rows; i++) {
        var y = this.rowY(g, i), ln = g.lane[i];
        c.fillStyle = i % 2 ? 'rgba(240,235,225,0.07)' : 'rgba(0,0,0,0.12)'; c.fillRect(L.x0, y - L.rh / 2, g.W - L.x0, L.rh);
        if (ln.st === 'warn') { c.fillStyle = 'rgba(255,50,80,' + (0.2 + 0.18 * Math.sin(g.t * 30)) + ')'; c.fillRect(L.x0, y - L.rh / 2, g.W - L.x0, L.rh); txt(c, '!', g.W - 26, y + 8, 26, '#ff7a8c', 'center', 800); }
      }
      if (g.gem) { var gy = this.rowY(g, g.gem.row); c.save(); c.globalAlpha = 0.5 + 0.3 * Math.sin(g.t * 8); c.fillStyle = '#ffd36a'; c.beginPath(); c.arc(L.px, gy, L.rh * 0.36, 0, 6.283); c.fill(); c.restore(); D.sprite(c, g.gem.img, L.px, gy, L.rh * 0.6, 0, 1, '#ffd36a'); }
      var anyOut = g.lane.some(function (l) { return l.st !== 'idle'; });
      D.mirror(c, L.mx, L.hz * 0.5, L.mw, g.H - L.hz, g.t, { glow: anyOut ? 0.8 : 0.2, eye: 0.9, look: 0.8 });
      g.lane.forEach(function (ln, i) { if (ln.ext > 0) D.tongue(c, L.x0 - 10, self.rowY(g, i), L.x0 + ln.ext * (g.W - L.x0 + 30), self.rowY(g, i), Math.min(L.rh * 0.32, 22), g.t); });
      var r = Math.max(16, Math.min(L.rh * 0.36, 30)), blink = g.inv > 0 && Math.floor(g.t * 12) % 2;
      if (!blink) { D.face(c, 'agnes', L.px, g.py, r); var cr = CARRY[Math.min(2, g.trips)]; D.sprite(c, cr[0], L.px + r * 1.3, g.py + r * 0.3, r * 1.3); }
      for (var k = 0; k < 3; k++) D.sprite(c, CARRY[k][0], g.W - 24 - k * 30, g.H - 18, 24, 0, k < g.trips ? 1 : 0.25);
    },
    awards: function (g, won, stars, award) { if (won && g.licks === 0 && g.trips >= 3) award('nolick'); }
  });

  /* =====================================================================
     THE OTHER LINE (Night 2): ink or pencil, against the clock
     ===================================================================== */
  var LINES = [
    ['301, Haugen.', 1], ['530. Lindqvist, party of four.', 0], ['305, Oyelaran, two guests.', 1], ['601, Augustin. Suite.', 0], ['309. Pell, C. One guest.', 1], ['Bunkroom A, twenty-two men. Scrip.', 0],
    ['402, Kowalczyk.', 1], ['607. Occupied.', 0], ['407, the Hibbing bride and groom. Do not disturb.', 1], ['529. Vacant.', 0], ['412. The man who asked about the lake.', 1], ['The Bohemia Room, one mirror.', 0],
    ['220. Bat situation, resolved.', 1], ['611. The roof ballroom.', 0], ['528. Vacant.', 1], ['Cellar. Kivi. One guest. Waiting.', 0]
  ];
  AR.register({
    id: 'otherline', night: 2, title: 'The Other Line', kicker: 'Night Two · 4:14 AM', hearts: 3, tempo: 120,
    intro: 'Room 309 is calling, in your own voice, reading the rooms. Real rooms go in the ledger in ink. Rooms the Aurelian does not have go in pencil. The hotel has five floors and nothing numbered past 528.',
    how: ['<strong>In ink</strong> (left, or the Left key) for real rooms.', '<strong>In pencil</strong> (right, or the Right key) for rooms the hotel does not have. Swiping the card works too.', 'Each line has a timer. It gets faster. Three wrong lines and the call goes cold.'],
    keys: LEFT.concat(RIGHT).concat(['i', 'I', 'p', 'P']), aria: 'A line of the call is shown with two buttons.', stars: [0, 1050, 1450],
    winTitle: 'Every line accounted for', failTitle: 'Wrong ink',
    winLines: ['"Night desk. Szabo, A." A pause, the way you consider a card on file. "Due out." Then the line clicks.', 'Correct in every particular. Your voice on the line sounds almost proud of you.'],
    failLines: ['Too much wrong ink. Somewhere far below, boots shuffle on stone. You hang up, fast.', 'The receiver is colder than the room. Try again, and remember: nothing past 528.'],
    progress: function (g) { return 1 - g.i / LINES.length; },
    init: function (g) { g.i = 0; g.mistakes = 0; g.cardT = 0; g.lim = 7; },
    begin: function (g) { this.show(g); },
    ctrl: function () { return '<div class="row center"><button type="button" class="btn big ctl ink-b" id="oInk">✒️ In ink</button><button type="button" class="btn big ctl pencil-b" id="oPen">✏️ In pencil</button></div>'; },
    bind: function (g) { var self = this; g.ctrl.querySelector('#oInk').onclick = function () { self.pick(g, true); }; g.ctrl.querySelector('#oPen').onclick = function () { self.pick(g, false); }; },
    show: function (g) {
      if (g.i >= LINES.length) { g.add(200, g.W / 2, g.H * 0.4); g.end(true); return; }
      g.lim = Math.max(2.8, 7 - g.i * 0.3); g.cardT = g.lim;
      g.dom.innerHTML = '<div class="ol"><p class="ol-hint">Five floors. Nothing past 528.</p><div class="ol-card" id="olCard"><p class="ol-n">Line ' + (g.i + 1) + ' of ' + LINES.length + '</p><p class="ol-voice" role="status">"' + esc(LINES[g.i][0]) + '"</p><span class="ol-bar"><span id="olBar"></span></span></div></div>';
      var card = g.dom.querySelector('#olCard'), self = this, sx = null;
      card.addEventListener('pointerdown', function (e) { sx = e.clientX; try { card.setPointerCapture(e.pointerId); } catch (x) {} });
      card.addEventListener('pointermove', function (e) { if (sx != null) card.style.transform = 'translateX(' + (e.clientX - sx) + 'px) rotate(' + ((e.clientX - sx) / 20) + 'deg)'; });
      card.addEventListener('pointerup', function (e) { if (sx == null) return; var dx = e.clientX - sx; sx = null; card.style.transform = ''; if (Math.abs(dx) > 60) self.pick(g, dx < 0); });
    },
    key: function (g, k, down) { if (!down) return; if (LEFT.indexOf(k) >= 0 || k === 'i' || k === 'I') this.pick(g, true); if (RIGHT.indexOf(k) >= 0 || k === 'p' || k === 'P') this.pick(g, false); },
    pick: function (g, ink) {
      if (g.over || !window.__arc.running || g.lock) return;
      var real = LINES[g.i][1] === 1, card = g.dom.querySelector('#olCard'), self = this;
      if (ink === real) { A.sfx('scratch'); g.good(50 + Math.round(g.cardT * 18), g.W / 2, g.H * 0.3, real ? 'In ink' : 'In pencil'); }
      else { g.mistakes++; g.bad(g.W / 2, g.H * 0.3, ink ? 'Not our room!' : 'That one is real!'); if (ink) { A.sfx('stomach'); } }
      if (card) card.classList.add(ink ? 'fly-l' : 'fly-r');
      g.lock = true; setTimeout(function () { g.lock = false; if (g.over) return; g.i++; self.show(g); }, 260);
    },
    update: function (g, dt) {
      if (g.lock || g.i >= LINES.length) return;
      g.cardT -= dt; var b = g.dom.querySelector('#olBar'); if (b) b.style.width = Math.max(0, g.cardT / g.lim * 100) + '%';
      if (g.cardT <= 0) { var self = this; g.mistakes++; g.bad(g.W / 2, g.H * 0.3, 'Too slow!'); g.lock = true; setTimeout(function () { g.lock = false; if (g.over) return; g.i++; self.show(g); }, 260); }
    },
    draw: function (g, c) {
      D.cover(c, bg('desk'), g.W, g.H, 0.6);
      c.strokeStyle = 'rgba(160,230,190,0.25)'; c.lineWidth = 3;
      for (var k = 0; k < 4; k++) { var rr = ((g.t * 60 + k * 50) % 200) + 20; c.globalAlpha = Math.max(0, 1 - rr / 220); c.beginPath(); c.arc(g.W / 2, g.H * 0.12, rr, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
      c.globalAlpha = 1; D.sprite(c, 'phone', g.W / 2, g.H * 0.1, Math.min(70, g.H * 0.12));
    }
  });

  /* =====================================================================
     SWITCHBOARD SCRAMBLE (Night 2)
     ===================================================================== */
  var REAL = ['301', '305', '311', '402', '407', '419', '214', '220', '412', '528', '101', '118', '303', '307'], GHOST = ['530', '601', '607', '611', '529', '000', '1912'];
  AR.register({
    id: 'switchboard', night: 2, title: 'Switchboard Scramble', kicker: 'Night Two · Extension zero', dur: 40, hearts: 3, tempo: 150,
    intro: 'You called the basement, and now every house line in the Aurelian is lighting up at once. Answer the real rooms before the fourth ring. Four rings is a failure of service.',
    how: ['Tap a <strong>ringing</strong> line to answer it. The sooner, the more points.', 'Some lines are the <strong>other line</strong>: rooms the hotel does not have, written backward in green. Let those ring out.', 'A real room left to ring four times, or answering the other line, puts out a lamp.', 'On a keyboard, keys 1 to 9 answer the lines.'],
    aria: 'A grid of house telephone lines.', stars: [0, 1000, 1600],
    winTitle: 'Every guest answered', failTitle: 'Four rings',
    winLines: ['Eleven years, and you have never let it ring four times. Tonight is no exception.', 'The switchboard goes quiet. Somewhere below, Aarne sets down his receiver very gently.'],
    failLines: ['Four rings is a failure of service. The man in 412 would like to know if the lake is the big one.', 'You answered the other line. It said your name, politely, the way you consider a card on file.'],
    init: function (g) { g.jacks = []; for (var i = 0; i < 9; i++) g.jacks.push({ st: 'idle', label: '', ghost: false, rings: 0, tm: 0 }); g.next = 0.6; g.four = false; g.answered = 0; },
    begin: function (g) { this.render(g); },
    render: function (g) {
      g.dom.innerHTML = '<div class="sb"><div class="sb-grid">' + g.jacks.map(function (j, i) {
        var ring = j.st === 'ring', lab = ring ? j.label : '·';
        var al = ring ? (j.ghost ? 'Line ' + (i + 1) + ', ringing, ' + j.label + ', written backward' : 'Line ' + (i + 1) + ', ringing, room ' + j.label + ', ' + j.rings + ' rings') : 'Line ' + (i + 1) + ', quiet';
        return '<button type="button" class="jack' + (ring ? ' ring' : '') + (ring && j.ghost ? ' ghost' : '') + '" data-i="' + i + '" aria-label="' + esc(al) + '"><span class="jl">' + esc(lab) + '</span><span class="jd">' + (ring ? '●●●●'.slice(0, j.rings) + '<span class="dim">' + '●●●●'.slice(j.rings) + '</span>' : '') + '</span><span class="jk">' + (i + 1) + '</span></button>';
      }).join('') + '</div></div>';
      var self = this; g.dom.querySelectorAll('.jack').forEach(function (b) { b.onclick = function () { self.tap(g, +b.dataset.i); }; });
    },
    key: function (g, k, down) { if (down && /^[1-9]$/.test(k)) this.tap(g, +k - 1); },
    pos: function (g, i) { var b = g.dom.querySelector('.jack[data-i="' + i + '"]'); if (!b) return [g.W / 2, g.H / 2]; var r = b.getBoundingClientRect(), fr = g.dom.getBoundingClientRect(); return [r.left - fr.left + r.width / 2, r.top - fr.top + r.height / 2]; },
    tap: function (g, i) {
      if (g.over || !window.__arc.running) return; var j = g.jacks[i]; if (!j) return; var p = this.pos(g, i);
      if (j.st !== 'ring') { A.sfx('click'); return; }
      if (j.ghost) { g.bad(p[0], p[1], 'The other line!'); A.sfx('stomach'); }
      else { A.sfx('ding'); g.answered++; g.good(40 + (4 - j.rings) * 20, p[0], p[1], 'Front desk!'); g.burst(p[0], p[1], ['#ffe08a', '#fff'], 12, 160, { gr: 80 }); }
      j.st = 'idle'; j.rings = 0; this.render(g); var nb = g.dom.querySelector('.jack[data-i="' + i + '"]'); if (nb && document.activeElement && document.activeElement.classList && document.activeElement.classList.contains('jack')) nb.focus();
    },
    update: function (g, dt) {
      var changed = false, ringInt = Math.max(0.62, 0.95 - g.t * 0.008), self = this;
      g.next -= dt;
      if (g.next <= 0) {
        var idle = g.jacks.map(function (j, i) { return j.st === 'idle' ? i : -1; }).filter(function (i) { return i >= 0; });
        if (idle.length) { var i = pickArr(idle), j = g.jacks[i]; j.st = 'ring'; j.ghost = Math.random() < Math.min(0.42, 0.22 + g.t * 0.006); j.label = j.ghost ? pickArr(GHOST) : pickArr(REAL); j.rings = 1; j.tm = ringInt; A.sfx('ring1'); changed = true; }
        g.next = Math.max(0.5, 1.35 - g.t * 0.022) * R(0.7, 1.2);
      }
      g.jacks.forEach(function (j, i) {
        if (j.st !== 'ring') return; j.tm -= dt;
        if (j.tm <= 0) {
          j.rings++; j.tm = ringInt; changed = true;
          if (j.rings >= 4) {
            var p = self.pos(g, i);
            if (j.ghost) { g.add(25, p[0], p[1], '#9fe0b5'); A.sfx('hiccup'); }
            else { g.four = true; g.bad(p[0], p[1], 'Four rings!'); }
            j.st = 'idle'; j.rings = 0;
          } else if (!j.ghost) A.sfx('ring1');
        }
      });
      if (changed && !g.over) this.render(g);
    },
    timeUp: function (g) { g.end(true); },
    finish: function (g, won) { if (won && !g.four && g.answered >= 8) g.collect('bell', g.W / 2, g.H / 2); },
    draw: function (g, c) { D.cover(c, bg('desk'), g.W, g.H, 0.66); },
    awards: function (g, won, stars, award) { if (won && !g.four) award('rings'); }
  });

  /* =====================================================================
     DARK HALLWAY SNEAK (Night 3)
     ===================================================================== */
  AR.register({
    id: 'sneak', night: 3, title: 'The Dark Hallway', kicker: 'Night Three · The basement', hearts: 3, tempo: 96, keyRepeat: false,
    intro: 'Aarne has gone ahead to the green steel door. Between you and it is a long dark passage full of glass: boiler gauges, puddles, a hundred jars. The mirror looks out of every one of them. When the glass looks, freeze.',
    how: ['<strong>Hold</strong> the walk button (or hold anywhere on the picture, or hold <strong>Space</strong> / <strong>Right</strong>) to walk.', 'When the glass <strong>shimmers</strong>, let go. If you are moving while its eye is open, it sees you.', 'Your lamp burns oil. Walk over <strong>oil lamps</strong> to refill it. Mints score.', 'Reach the green door before the lamp goes out.'],
    keys: [' ', 'ArrowRight', 'd', 'D'], aria: 'A dark corridor with a mirror eye that opens and closes.', stars: [0, 1500, 2100],
    winTitle: 'Through the dark', failTitle: 'Lamp out',
    winLines: ['Aarne is waiting at the green door with a long iron key. "Took your time," he says, which from Aarne is concern.', 'The eye closes, sulking. It saw nothing. You are, officially, as boring as a Finn.'],
    failLines: ['The lamp sputters out. You find the green door by feel, and it finds your nose first.', 'The glass saw you. It waved. You did not wave back, which was rude, but understandable.'],
    DIST: 100,
    progress: function (g) { return g.oil / 100; },
    init: function (g) {
      g.d = 0; g.oil = 100; g.walk = false; g.held = false; g.eye = { st: 'closed', tm: 2.2, open: 0 }; g.inv = 0; g.seen = 0; g.bob = 0;
      g.props = [[22, 'lamp'], [48, 'lamp'], [74, 'lamp'], [12, 'mint'], [35, 'mint'], [60, 'mint'], [88, 'mint']].map(function (p) { return { d: p[0], k: p[1], got: false }; });
      g.props.push({ d: RI(18, 84), k: 'rare', img: rarePick(['roomkey', 'bell', 'sachet', 'watch']), got: false });
    },
    ctrl: function () { return '<div class="row center"><button type="button" class="btn primary big ctl holdbtn" id="sWalk" aria-label="Hold to walk">Hold to walk</button></div>'; },
    bind: function (g) {
      var b = g.ctrl.querySelector('#sWalk');
      var on = function (e) { e.preventDefault(); g.held = true; b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch (x) {} };
      var off = function () { g.held = false; b.classList.remove('on'); };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); g.held = true; b.classList.add('on'); } });
      b.addEventListener('keyup', function (e) { if (e.key === 'Enter') off(); });
    },
    update: function (g, dt) {
      var kw = g.keys[' '] || g.keys.ArrowRight || g.keys.d || g.keys.D, pd = g.pointer && g.pointer.down;
      g.walk = !!(g.held || kw || pd) && g.inv <= 0.6;
      var e = g.eye, spd = 1 + g.d / 160;
      e.tm -= dt;
      if (e.st === 'closed' && e.tm <= 0) { e.st = 'warn'; e.tm = Math.max(0.5, 0.75 - g.d / 600); A.sfx('shimmer'); }
      else if (e.st === 'warn' && e.tm <= 0) { e.st = 'open'; e.tm = R(1.0, 1.7); A.sfx('eye'); }
      else if (e.st === 'open' && e.tm <= 0) { e.st = 'closed'; e.tm = R(1.3, 3.0) / spd; }
      var target = e.st === 'open' ? 1 : (e.st === 'warn' ? 0.25 : 0); e.open += (target - e.open) * Math.min(1, dt * 14);
      g.inv = Math.max(0, g.inv - dt);
      g.oil -= dt * (2.3 + (g.walk ? 1.6 : 0));
      if (g.walk) {
        g.d += dt * 10; g.bob += dt * 12; g.acc = (g.acc || 0) + dt * 20; if (g.acc >= 1) { g.score += Math.floor(g.acc); g.acc -= Math.floor(g.acc); }
        if (e.st === 'open' && e.open > 0.6 && g.inv <= 0) { g.seen++; g.inv = 1.3; g.d = Math.max(0, g.d - 9); g.bad(g.W * 0.3, g.H * 0.55, 'Seen!'); }
      }
      var self = this;
      g.props.forEach(function (p) {
        if (p.got || Math.abs(p.d - g.d) > 1.2) return; p.got = true; var x = g.W * 0.3, y = g.H * 0.7;
        if (p.k === 'lamp') { g.oil = Math.min(100, g.oil + 35); A.sfx('pickup'); g.good(40, x, y - 40, 'Oil!'); g.burst(x, y, ['#ffd36a', '#fff'], 16, 160, { gr: -40 }); }
        else if (p.k === 'mint') { A.sfx('catch', g.combo); g.good(60, x, y - 40); }
        else { g.good(100, x, y - 40); g.collect(p.img, x, y - 20); }
      });
      if (g.d >= this.DIST) { g.add(Math.round(g.oil * 6) + g.hearts * 150 + (g.seen === 0 ? 500 : 0), g.W / 2, g.H * 0.4); g.end(true); return; }
      if (g.oil <= 0) { g.oil = 0; g.end(false); }
    },
    draw: function (g, c) {
      var im = bg('basement'), W = g.W, H = g.H, px = W * 0.3, py = H * 0.72, ppu = Math.max(W / 22, 22);
      if (im.naturalWidth) { var s = Math.max(W / im.naturalWidth, H / im.naturalHeight) * 1.5, iw = im.naturalWidth * s, ih = im.naturalHeight * s; var ox = -((g.d / this.DIST) * (iw - W)); c.drawImage(im, ox, (H - ih) / 2, iw, ih); }
      c.fillStyle = 'rgba(10,4,6,0.35)'; c.fillRect(0, 0, W, H);
      var self = this;
      g.props.forEach(function (p) {
        if (p.got) return; var x = px + (p.d - g.d) * ppu; if (x < -40 || x > W + 40) return;
        if (p.k === 'rare') { c.save(); c.globalAlpha = 0.5 + 0.3 * Math.sin(g.t * 8); c.fillStyle = '#ffd36a'; c.beginPath(); c.arc(x, py, 26, 0, 6.283); c.fill(); c.restore(); }
        D.sprite(c, p.k === 'rare' ? p.img : (p.k === 'lamp' ? 'lamp' : 'mint'), x, py + 8, p.k === 'lamp' ? 44 : 36, 0, 1, p.k === 'rare' ? '#ffd36a' : null);
      });
      var dx = px + (this.DIST - g.d) * ppu; if (dx < W + 80) { c.save(); c.fillStyle = '#2f5a3c'; c.fillRect(dx, py - 120, 70, 150); c.strokeStyle = '#1b3222'; c.lineWidth = 3; c.strokeRect(dx + 8, py - 110, 54, 130); c.fillStyle = '#c9a54a'; c.fillRect(dx + 25, py - 40, 20, 24); c.restore(); txt(c, 'Green door', dx + 35, py - 130, 16, '#bfe6c8'); }
      var lr = 70 + g.oil * 2.4 + Math.sin(g.t * 17) * 4;
      var rg = c.createRadialGradient(px, py - 10, lr * 0.25, px, py - 10, lr); rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(0.6, 'rgba(5,2,3,0.55)'); rg.addColorStop(1, 'rgba(5,2,3,0.94)');
      c.fillStyle = rg; c.fillRect(0, 0, W, H);
      var e = g.eye, mw = Math.min(W * 0.36, 170), mh = mw * 0.75;
      if (e.st !== 'closed') { c.fillStyle = 'rgba(140,255,180,' + (0.12 * e.open) + ')'; c.beginPath(); c.moveTo(W / 2 - mw * 0.2, mh + 10); c.lineTo(W / 2 + mw * 0.2, mh + 10); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill(); }
      D.mirror(c, W / 2 - mw / 2, 8, mw, mh, g.t, { eye: e.open, glow: e.st === 'warn' ? 0.7 : (e.st === 'open' ? 1 : 0), look: -0.6 });
      if (e.st === 'warn') txt(c, 'Freeze!', W / 2, mh + 40, 26, '#ffb0b0', 'center', 800);
      var bob = g.walk ? Math.sin(g.bob) * 4 : 0, blink = g.inv > 0 && Math.floor(g.t * 12) % 2;
      if (!blink) { D.face(c, 'agnes', px, py - 34 + bob, 26); D.sprite(c, 'lamp', px + 30, py - 12 + bob, 34, 0, 1, '#ffd36a'); }
      c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(16, H - 18, W - 32, 6); c.fillStyle = '#bfe6c8'; c.fillRect(16, H - 18, (W - 32) * Math.min(1, g.d / this.DIST), 6);
      txt(c, 'Lamp oil ' + Math.round(g.oil) + '%', 16, H - 26, 14, g.oil < 25 ? '#ffb0b0' : '#ffe08a', 'left');
      if (g.t < 3 && !g.over) txt(c, 'Hold to walk. Let go when it looks.', W / 2, H * 0.48, 17);
    },
    awards: function (g, won, stars, award) { if (won && g.seen === 0) award('statue'); }
  });

  /* =====================================================================
     GRAB DODGE (Night 3): the 2:51 belch, lane dodging
     ===================================================================== */
  AR.register({
    id: 'grab', night: 3, title: 'Grab Dodge', kicker: 'Night Three · 2:51 AM', dur: 35, hearts: 3, tempo: 146,
    intro: 'Tonight the belch is small, but the mirror is grabby. Silvery hands slap down at the marble, feeling for something to eat. Dodge between three lanes, and catch the thimble, the molar and the ring as they skitter out.',
    how: ['Tap <strong>◀</strong> or <strong>▶</strong>, tap either side of the picture, or use the <strong>arrow keys</strong>, to change lanes.', 'A <strong>shadow</strong> on a lane means a hand is coming down there. Move.', 'Catch the falling leftovers for points. Glowing ones go to the Jar Shelf.'],
    keys: LEFT.concat(RIGHT), aria: 'Three lanes. Hands come down from above.', stars: [0, 900, 1400],
    winTitle: 'Not a finger on you', failTitle: 'Grabbed',
    winLines: ['The mirror gives up and pretends it was only stretching. A ring rolls in a slow circle and comes to rest against your shoe.', 'Three things skitter across the marble, and every one of them is in your pocket.'],
    failLines: ['Grabbed. The mirror holds you a moment, sniffs, and puts you back like a library book.', 'The hand pats you on the head, which is somehow worse.'],
    lane: function (g, i) { var lw = Math.min(g.W * 0.3, 170); return g.W / 2 + (i - 1) * lw; },
    init: function (g) { g.p = 1; g.px = this.lane(g, 1); g.hands = []; g.drops = []; g.next = 1.2; g.dnext = 0.8; g.guar = [[4, 'thimble'], [13, 'molar'], [22, 'ring']]; g.rareLeft = 1; g.inv = 0; },
    ctrl: function () { return '<div class="row center"><button type="button" class="btn big ctl" id="gL" aria-label="Move left">◀</button><button type="button" class="btn big ctl" id="gR" aria-label="Move right">▶</button></div>'; },
    bind: function (g) { var self = this; g.ctrl.querySelector('#gL').onclick = function () { self.mv(g, -1); }; g.ctrl.querySelector('#gR').onclick = function () { self.mv(g, 1); }; },
    down: function (g, x) { this.mv(g, x < g.px ? -1 : 1); },
    key: function (g, k, down) { if (!down) return; if (LEFT.indexOf(k) >= 0) this.mv(g, -1); if (RIGHT.indexOf(k) >= 0) this.mv(g, 1); },
    mv: function (g, d) { if (g.over || !window.__arc.running) return; var np = Math.max(0, Math.min(2, g.p + d)); if (np !== g.p) { g.p = np; A.sfx('hop'); } },
    update: function (g, dt) {
      var py = g.H - Math.max(70, g.H * 0.15), self = this;
      g.px += (this.lane(g, g.p) - g.px) * Math.min(1, dt * 22); g.inv = Math.max(0, g.inv - dt);
      g.next -= dt;
      if (g.next <= 0) {
        var lanes = shuffle([0, 1, 2]), n = g.t > 12 && Math.random() < Math.min(0.55, (g.t - 12) * 0.03) ? 2 : 1;
        for (var k = 0; k < n; k++) g.hands.push({ lane: lanes[k], st: 'warn', tm: Math.max(0.5, 0.85 - g.t * 0.008), y: 0 });
        A.sfx('whoosh'); g.next = Math.max(0.65, 1.6 - g.t * 0.03);
      }
      g.dnext -= dt;
      if (g.guar.length && g.t >= g.guar[0][0]) { var gg = g.guar.shift(); g.drops.push({ lane: RI(0, 2), y: -30, img: gg[1], kind: 'story' }); }
      if (g.dnext <= 0) { var rare = g.rareLeft && g.t > 8 && Math.random() < 0.12; if (rare) g.rareLeft--; g.drops.push({ lane: RI(0, 2), y: -30, img: rare ? rarePick(['watch', 'roomkey', 'monocle']) : pickArr(['mint', 'bone', 'crown', 'pearls']), kind: rare ? 'rare' : 'good' }); g.dnext = R(0.7, 1.3); }
      g.hands = g.hands.filter(function (h) {
        h.tm -= dt;
        if (h.st === 'warn' && h.tm <= 0) { h.st = 'down'; h.tm = 0.14; }
        else if (h.st === 'down') { h.y = 1 - h.tm / 0.14; if (h.tm <= 0) { h.st = 'slam'; h.tm = 0.35; h.y = 1; g.shakeIt(9); A.sfx('thud'); g.burst(self.lane(g, h.lane), py + 20, ['#cfd8dc', '#fff'], 10, 180, { r: 3 }); if (h.lane === g.p && g.inv <= 0) { g.inv = 1; g.bad(g.px, py - 50, 'Grabbed!'); } } }
        else if (h.st === 'slam' && h.tm <= 0) { h.st = 'up'; h.tm = 0.3; }
        else if (h.st === 'up') { h.y = h.tm / 0.3; if (h.tm <= 0) return false; }
        return true;
      });
      var sp = g.H * (0.42 + g.t * 0.006);
      g.drops = g.drops.filter(function (d) {
        d.y += sp * dt;
        if (d.y >= py - 30 && d.y <= py + 20 && d.lane === g.p) {
          A.sfx('catch', g.combo);
          if (d.kind === 'story' || d.kind === 'rare') { g.good(120, g.px, py - 60, d.kind === 'story' ? AR.leftovers.filter(function (l) { return l[0] === d.img; })[0][1] : null); g.collect(d.img, g.px, py - 70); }
          else g.good(d.img === 'mint' ? 25 : 20, g.px, py - 50);
          return false;
        }
        if (d.y > g.H + 30) { g.miss(); if (d.kind === 'story') g.guar.push([g.t + 1.5, d.img]); return false; }
        return true;
      });
    },
    timeUp: function (g) { if (g.guar.length) { g.dur += 3; g.left = 3; return; } g.end(true); },
    draw: function (g, c) {
      var py = g.H - Math.max(70, g.H * 0.15), lw = Math.min(g.W * 0.3, 170), self = this;
      D.cover(c, bg('mirror'), g.W, g.H, 0.5);
      for (var i = 0; i < 3; i++) { c.fillStyle = i % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.12)'; c.fillRect(this.lane(g, i) - lw / 2, 0, lw, g.H); }
      g.hands.forEach(function (h) {
        var x = self.lane(g, h.lane);
        if (h.st === 'warn') { var k = 1 - h.tm / 0.85; c.fillStyle = 'rgba(255,60,80,' + (0.12 + 0.12 * Math.sin(g.t * 30)) + ')'; c.fillRect(x - lw / 2, 0, lw, g.H); c.fillStyle = 'rgba(0,0,0,0.5)'; c.beginPath(); c.ellipse(x, py + 22, lw * 0.4 * (0.4 + k * 0.6), 12, 0, 0, 6.283); c.fill(); }
        else {
          var hy = -lw + h.y * (py + lw * 0.2);
          c.fillStyle = 'rgba(190,210,220,0.85)'; c.fillRect(x - lw * 0.16, -10, lw * 0.32, hy + 10);
          D.sprite(c, 'glove', x, hy, lw * 0.95, Math.PI, 1, '#bfe6ff');
        }
      });
      var sz = Math.min(lw * 0.5, 56);
      g.drops.forEach(function (d) { var x = self.lane(g, d.lane); if (d.kind === 'rare') { c.save(); c.globalAlpha = 0.5 + 0.3 * Math.sin(g.t * 9); c.fillStyle = '#ffd36a'; c.beginPath(); c.arc(x, d.y, sz * 0.6, 0, 6.283); c.fill(); c.restore(); } D.sprite(c, d.img, x, d.y, d.kind === 'story' ? sz * 1.2 : sz, Math.sin(g.t * 6 + d.y * 0.02) * 0.4, 1, d.kind === 'story' ? '#fff4d6' : (d.kind === 'rare' ? '#ffd36a' : null)); });
      var blink = g.inv > 0 && Math.floor(g.t * 12) % 2; if (!blink) D.face(c, 'agnes', g.px, py, Math.min(30, lw * 0.22));
    }
  });

  /* =====================================================================
     JAR RUSH (Night 3)
     ===================================================================== */
  var SHELVES = [['1930', '1930s'], ['1950', '1950s'], ['1970', '1970s'], ['unk', 'UNK']];
  var NAMES = ['HAGSTROM E', 'BEAUCHAMP A', 'OLSON K', 'NIEMI T', 'PEDERSEN O', 'LAFRAMBOISE J', 'KOSKI V', 'DULUTH SALESMAN', 'MRS. TWO-HATS', 'BRASS BAND (3)', 'NORDQUIST H', 'THE PIANO TUNER'];
  var UNKS = ['UNK / BUTTON, ONE / 3-12', 'UNK / SPECTACLES / 2-9', 'UNK / ONE SKATE / 1-4', 'UNK / HATBOX / 11-30', 'UNK / FALSE TEETH / 6-6'];
  function jarList() {
    var L = [{ l: 'UNK / RING, THIMBLE, MOLAR / 3-12', a: 'unk', y: 'UNK' }, { l: 'HAGSTROM E / 214 / 11-3-1979', a: '1970', y: '1979' }, { l: 'BEAUCHAMP, MRS. A. / 501 / 7-4-1951', a: '1950', y: '1951' }, { l: 'DULUTH SALESMAN (NAME?) / 318 / 1-1938', a: '1930', y: '1938' }];
    for (var i = 0; i < 14; i++) {
      var r = Math.random();
      if (r < 0.22) { L.push({ l: pickArr(UNKS), a: 'unk', y: 'UNK' }); continue; }
      var dec = pickArr([1930, 1950, 1970]), yr = dec + RI(0, 9);
      L.push({ l: pickArr(NAMES) + ' / ' + RI(2, 5) + '0' + RI(1, 9) + ' / ' + RI(1, 12) + '-' + RI(1, 28) + '-' + yr, a: String(dec), y: String(yr) });
    }
    return L;
  }
  AR.register({
    id: 'jars', night: 3, title: 'Jar Rush', kicker: 'Night Three · The Jar Room', hearts: 3, tempo: 140,
    intro: 'Aarne is behind on the shelving. He got behind in the sixties. Jars slide down his table: read each label and send it to the right decade before it falls off the end. The ones nobody wrote down go on UNK.',
    how: ['Read the <strong>year</strong> at the end of the label on the jar at the front (it glows).', 'Tap its shelf: <strong>1930s</strong>, <strong>1950s</strong>, <strong>1970s</strong>, or <strong>UNK</strong> for no name. Keys 1 to 4 work too.', 'A wrong shelf or a jar off the end of the table puts out a lamp. The table speeds up.'],
    aria: 'Jars slide along a table. Shelf buttons are below.', stars: [0, 1200, 1700],
    winTitle: 'Alphabetical by decade', failTitle: 'Smashed',
    winLines: ['Aarne runs a gloved finger along the shelf. "Mostly," he says, which is the highest praise in the Jar Room.', 'Every half-pint labeled and shelved. Somewhere, possibly, somebody remembers something.'],
    failLines: ['Three jars on the floor. Aarne gets the dustpan. "I got behind in the sixties too," he says, kindly.', 'A jar rolls under the shelf. Aarne says to leave that one. He says that about a lot of things.'],
    progress: function (g) { return 1 - g.done / g.list.length; },
    init: function (g) { g.list = jarList(); g.spawned = 0; g.done = 0; g.jars = []; g.next = 0.2; g.counts = [0, 0, 0, 0]; },
    ctrl: function () { return '<p class="jr-now" id="jrNow" role="status">Get ready...</p><div class="jr-shelves">' + SHELVES.map(function (s, i) { return '<button type="button" class="btn ctl shelf" data-sh="' + i + '"><span class="k">' + (i + 1) + '</span> ' + s[1] + '</button>'; }).join('') + '</div>'; },
    bind: function (g) { var self = this; g.ctrl.querySelectorAll('.shelf').forEach(function (b) { b.onclick = function () { self.send(g, +b.dataset.sh); }; }); },
    key: function (g, k, down) { if (down && /^[1-4]$/.test(k)) this.send(g, +k - 1); },
    geo: function (g) { var js = Math.min(g.W * 0.17, 84); return { js: js, belt: g.H * 0.72, shelfY: g.H * 0.16 }; },
    front: function (g) { var f = null; g.jars.forEach(function (j) { if (j.st === 'belt' && (!f || j.x > f.x)) f = j; }); return f; },
    send: function (g, si) {
      if (g.over || !window.__arc.running) return; var j = this.front(g); if (!j) return;
      var ok2 = SHELVES[si][0] === j.a, geo = this.geo(g);
      j.st = 'fly'; j.t0 = 0; j.fx = j.x; j.fy = geo.belt; j.tx = g.W * (0.125 + si * 0.25); j.ty = geo.shelfY; j.ok = ok2; j.si = si;
      A.sfx('whoosh');
      if (ok2) { g.good(60 + Math.round(Math.max(0, (g.W - j.x) / g.W) * 40), j.tx, j.ty + 50, null); }
      else { g.bad(j.tx, j.ty + 60, 'Wrong decade!'); }
      this.label(g);
    },
    label: function (g) { var f = this.front(g), el = g.ctrl.querySelector('#jrNow'); if (el) el.textContent = f ? 'Front jar: ' + f.l : 'Waiting for the next jar...'; },
    update: function (g, dt) {
      var geo = this.geo(g), speed = g.W * (0.07 + Math.min(0.13, g.t * 0.003)), self = this;
      g.next -= dt;
      if (g.next <= 0 && g.spawned < g.list.length) { var L = g.list[g.spawned++]; g.jars.push({ x: -geo.js, l: L.l, a: L.a, y: L.y, st: 'belt', wob: R(0, 6) }); g.next = Math.max(1.0, 2.5 - g.t * 0.03); this.label(g); }
      g.jars = g.jars.filter(function (j) {
        if (j.st === 'belt') {
          j.x += speed * dt; j.wob += dt * 8;
          if (j.x > g.W - geo.js * 0.3) { j.st = 'fall'; j.vy = 0; j.vx = speed; g.bad(g.W - 30, geo.belt - 40, 'Smash!'); self.label(g); }
        } else if (j.st === 'fly') {
          j.t0 += dt / 0.35; var k = Math.min(1, j.t0); j.x = j.fx + (j.tx - j.fx) * k; j.yy = j.fy + (j.ty - j.fy) * k - Math.sin(k * Math.PI) * g.H * 0.15;
          if (k >= 1) {
            if (j.ok) { g.counts[j.si]++; g.done++; A.sfx('clink'); g.burst(j.tx, j.ty, ['#ffe08a', '#cfe6ee'], 10, 120, { gr: 100 }); return false; }
            j.st = 'fall'; j.vy = -60; j.vx = R(-40, 40); j.yy = j.ty;
          }
        } else if (j.st === 'fall') {
          j.vy += 900 * dt; j.x += j.vx * dt; j.yy = (j.yy == null ? geo.belt : j.yy) + j.vy * dt;
          if (j.yy > g.H - 10) { A.sfx('smash'); g.burst(j.x, g.H - 12, ['#cfe6ee', '#ffffff', '#9fb8c0'], 20, 240, { r: 3, gr: 500 }); g.done++; return false; }
        }
        return true;
      });
      if (g.done >= g.list.length && !g.over) { g.add(300, g.W / 2, g.H * 0.4); g.end(true); }
    },
    draw: function (g, c) {
      var geo = this.geo(g), js = geo.js, self = this;
      D.cover(c, bg('jarroom'), g.W, g.H, 0.5);
      SHELVES.forEach(function (s, i) {
        var x = g.W * (0.125 + i * 0.25), w = g.W * 0.22;
        c.fillStyle = '#5a3418'; c.fillRect(x - w / 2, geo.shelfY + js * 0.45, w, 8); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x - w / 2, geo.shelfY + js * 0.45 + 8, w, 4);
        for (var k = 0; k < Math.min(5, g.counts[i]); k++) D.sprite(c, 'jar', x - w / 2 + 12 + k * (w - 24) / 5 + 6, geo.shelfY + js * 0.25, js * 0.45);
        txt(c, s[1], x, geo.shelfY - js * 0.2, Math.min(20, g.W * 0.045), '#ffe08a');
      });
      c.fillStyle = '#4a2a12'; c.fillRect(0, geo.belt + js * 0.42, g.W, 14); c.fillStyle = '#2b170a'; c.fillRect(0, geo.belt + js * 0.42 + 14, g.W, 6);
      c.fillStyle = 'rgba(255,80,80,0.35)'; c.fillRect(g.W - 10, geo.belt - js * 0.5, 10, js);
      var f = this.front(g);
      g.jars.forEach(function (j) {
        var y = j.st === 'belt' ? geo.belt + Math.sin(j.wob) * 1.5 : j.yy;
        if (j === f) { c.save(); c.globalAlpha = 0.45 + 0.25 * Math.sin(g.t * 9); c.fillStyle = '#ffd36a'; c.beginPath(); c.arc(j.x, y, js * 0.62, 0, 6.283); c.fill(); c.restore(); }
        D.sprite(c, 'jar', j.x, y, js, j.st === 'fall' ? g.t * 8 : 0);
        if (j.st !== 'fall') { c.fillStyle = '#efe2c4'; c.fillRect(j.x - js * 0.3, y - js * 0.02, js * 0.6, js * 0.24); txt(c, j.y, j.x, y + js * 0.17, js * 0.2, '#2a1414', 'center', 700); }
      });
    }
  });

  /* =====================================================================
     TUG OF WAR (every night): the mirror is eating a room
     ===================================================================== */
  AR.register({
    id: 'tug', night: 0, title: 'Pull It Back!', kicker: 'The mirror is eating a room', dur: 7, hearts: 1, tempo: 168, quick: true, noRetry: true, skipWin: false, carryLabel: 'Continue', goWord: 'PULL!',
    intro: 'The mirror has its tongue around a door. Grab the doorknob and pull.',
    how: ['<strong>Tap PULL</strong> as fast as you can (or tap the picture, or mash <strong>Space</strong>).', 'Drag the door all the way back before the mirror swallows it.'],
    keys: [' ', 'Enter', 'ArrowUp'], aria: 'A tug of war between you and the mirror over a door.', stars: [0, 330, 400],
    winTitle: 'Pulled it back!', failTitle: 'BURRRRP',
    winLines: ['The mirror lets go with a hiccup. The door swings back into its wall, a little damp and very embarrassed.', 'You win the tug. The mirror pretends it was only tasting.'],
    failLines: ['The mirror wins the tug and swallows it whole. Ink brings things back, if you have the record.', 'Gulp. Where the door was, the wallpaper is warm. Write it back in the ledger if you checked it.'],
    init: function (g) { g.p = 0; g.rate = 0.24 + (Math.max(1, g.night) - 1) * 0.05; g.room = g.opts.room || 'the Linen Closet'; g.taps = 0; },
    ctrl: function () { return '<div class="row center"><button type="button" class="btn primary big ctl pullbtn" id="tPull">PULL!</button></div>'; },
    bind: function (g) { var self = this; g.ctrl.querySelector('#tPull').addEventListener('pointerdown', function (e) { e.preventDefault(); self.pull(g); }); g.ctrl.querySelector('#tPull').addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.repeat) { e.preventDefault(); self.pull(g); } }); },
    down: function (g) { this.pull(g); },
    key: function (g, k, down) { if (down && (k === ' ' || k === 'ArrowUp')) this.pull(g); },
    pull: function (g) { if (g.over || !window.__arc.running) return; g.p = Math.min(1, g.p + 0.09); g.taps++; A.sfx('pull', g.p); g.burst(g.W * 0.72, g.H * 0.55, ['#ffe08a', '#fff'], 4, 120, { gr: 200 }); if (g.p >= 1) { g.add(300 + Math.round(g.left * 25), g.W / 2, g.H * 0.4); g.end(true); } },
    update: function (g, dt) { g.p -= g.rate * dt * (1 + g.t * 0.06); if (g.p <= -1) { g.p = -1; A.sfx('burp', 1.4); g.shakeIt(20); g.end(false); } },
    timeUp: function (g) { if (g.p > 0) { g.add(300, g.W / 2, g.H * 0.4); g.end(true); } else { A.sfx('burp', 1.4); g.end(false); } },
    draw: function (g, c) {
      D.cover(c, bg('lobby'), g.W, g.H, 0.55);
      var mw = Math.min(g.W * 0.28, 170), mh = Math.min(g.H * 0.75, mw * 1.8), mx = g.W * 0.03, my = g.H * 0.12;
      var dw = Math.min(g.W * 0.2, 110), dh = dw * 1.8, k = (g.p + 1) / 2, dx = mx + mw * 0.6 + k * (g.W * 0.72 - mx - mw * 0.6 - dw * 0.3), dy = g.H * 0.58 - dh / 2;
      D.mirror(c, mx, my, mw, mh, g.t, { bulge: 0.3 + 0.3 * Math.sin(g.t * 12), glow: 1, mouth: 1, eye: 0.7, look: 1 });
      D.tongue(c, mx + mw * 0.5, my + mh * 0.8, dx + dw * 0.2, dy + dh * 0.55, Math.min(18, dw * 0.15), g.t);
      D.door(c, dx, dy, dw, dh, g.room.replace(/^the /, ''));
      var ax = Math.min(g.W - 40, dx + dw + 60), ay = dy + dh * 0.5;
      c.strokeStyle = '#d9b46a'; c.lineWidth = 4; c.beginPath(); c.moveTo(dx + dw * 0.85, dy + dh * 0.55); c.lineTo(ax - 20, ay); c.stroke();
      D.face(c, 'agnes', ax, ay, 28);
      var bw = g.W * 0.7, bx = (g.W - bw) / 2, by = 14; c.fillStyle = 'rgba(0,0,0,0.5)'; D.rr(c, bx, by, bw, 16, 8); c.fill();
      c.fillStyle = g.p >= 0 ? '#9fd9b3' : '#e06a80'; var cx = bx + bw / 2; c.fillRect(Math.min(cx, cx + g.p * bw / 2), by + 2, Math.abs(g.p * bw / 2), 12);
      c.fillStyle = '#fff'; c.fillRect(cx - 1, by - 2, 2, 20);
      txt(c, 'Mirror', bx, by + 34, 14, '#e9a3a3', 'left'); txt(c, 'Saved', bx + bw, by + 34, 14, '#bfe6c8', 'right');
      if (!g.over) txt(c, 'PULL!', g.W / 2, g.H * 0.95, 24 + Math.sin(g.t * 14) * 3, '#ffe08a', 'center', 800);
    },
    awards: function (g, won, stars, award) { if (won) { AR.col.tugs = (AR.col.tugs || 0) + 1; AR.saveCol(); award('tug'); if (AR.col.tugs >= 5) award('tug5'); } }
  });
})();
