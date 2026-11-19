/* Hotel Aurelian: the night-shift game engine. Scenes, time, inventory, the mirror's appetite, save. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var A = window.HotelAudio, SAVE = 'aurelian.game.v1', PREFS = 'aurelian.prefs.v1';
  var G = window.G = { esc: esc, busy: false };

  /* ---------- Static world ---------- */
  G.SCENES = {
    lobby: { name: 'The Lobby', floor: 'Ground floor', bg: 'lobby', amb: 'lobby', focus: 0.4, glass: [30.8, 18, 12.4, 55],
      lights: [[23.7, 22], [49.9, 29], [55.5, 13], [69, 38], [96.5, 33]],
      desc: 'Two stories of old-growth cherry, a marble floor like a chessboard, and the mirror: fourteen feet of it, at the foot of the grand staircase.' },
    desk: { name: 'The Front Desk', floor: 'Ground floor', bg: 'desk', amb: 'desk', focus: 0.45, lights: [[35, 43]],
      desc: 'Innkeeper 7 hums a note just below B-flat and smells faintly of toast. The ledger lies open under the green lamp.' },
    mirror: { name: 'The Mirror', floor: 'Ground floor', bg: 'mirror', amb: 'lobby', focus: 0.45, glass: [22.5, 0, 57.6, 60], lights: [],
      desc: 'Up close the silvering has gone dark at the edges, so the other lobby looks like the bright end of a tunnel. It gives off a faint, steady warmth, like a sleeping dog.' },
    corridor: { name: 'Third Floor, Lake Side', floor: 'Third floor', bg: 'corridor', amb: 'corridor', focus: 0.42, lights: [[6.5, 17], [43, 22], [86.5, 33]],
      desc: 'Radiator dust and lavender. Green stripe wallpaper that some long-dead decorator believed was restful.' },
    linen: { name: 'The Linen Closet', floor: 'Third floor', bg: 'linen', amb: 'corridor', focus: 0.4, lights: [[60.5, 12]],
      desc: 'Marisol\'s closet. Towels stacked like ledgers, lavender sachets tucked between them.' },
    room309: { name: 'Room 309', floor: 'Third floor', bg: 'room309', amb: 'room309', focus: 0.5, lights: [],
      desc: 'Not vacant. Empty. No bed, no nightstand, no Split Rock lighthouse print. Everything is wet.' },
    office: { name: 'Augustin\'s Office', floor: 'Ground floor', bg: 'office', amb: 'office', focus: 0.5, lights: [[29.5, 64]],
      desc: 'Augustin Brandt is still in here, in oils, with a lumber baron\'s beard and a lumber baron\'s eyes.' },
    basement: { name: 'The Basement', floor: 'Basement', bg: 'basement', amb: 'basement', focus: 0.55, lights: [[83.6, 17]],
      desc: 'The stairs go down farther than they have any right to. Two great iron boilers breathe in the dark like sleeping bulls.' },
    jarroom: { name: 'The Jar Room', floor: 'Basement', bg: 'jarroom', amb: 'basement', focus: 0.5, lights: [[50, 10]],
      desc: 'The old coal cellar. Every foot of wall is shelves, and every shelf is jars.' },
    laundry: { name: 'Housekeeping Office', floor: 'Basement', bg: 'laundry', amb: 'laundry', focus: 0.5, lights: [[45.8, 57]],
      desc: 'Beyond the glass the big front-loaders turn and turn. One has a bad bearing and knocks once every revolution.' }
  };
  G.EXITS = {
    lobby: [['desk', 1], ['mirror', 1], ['corridor', 5, 'Stairs to the third floor'], ['office', 2], ['basement', 4, 'Service door to the basement']],
    desk: [['lobby', 1], ['office', 2]],
    mirror: [['lobby', 1]],
    corridor: [['lobby', 5, 'Stairs down to the lobby'], ['linen', 1], ['room309', 1, 'Room 309']],
    linen: [['corridor', 1]],
    room309: [['corridor', 1]],
    office: [['lobby', 2], ['desk', 2]],
    basement: [['lobby', 4, 'Stairs up to the lobby'], ['jarroom', 1, 'The green steel door'], ['laundry', 2]],
    jarroom: [['basement', 1]],
    laundry: [['basement', 2]]
  };
  /* Spaces the mirror can eat. scene: where you account for it in person. */
  G.SPACES = {
    linen: { name: 'the Linen Closet', scene: 'linen' },
    office: { name: 'Augustin\'s Office', scene: 'office' },
    laundry: { name: 'the Housekeeping Office', scene: 'laundry' },
    r419: { name: 'Room 419 (out of order, radiator)' },
    r528: { name: 'Room 528 (vacant)' },
    r402: { name: 'Room 402 (Kowalczyk)' },
    r407: { name: 'Room 407 (Hibbing bride and groom)' },
    tamarack: { name: 'the Tamarack Room' }
  };
  G.ITEMS = {
    pen: { name: 'Fountain pen', img: 'pen', d: 'Ink is for the book.' },
    pencil: { name: 'Pencil', img: 'pencil', d: 'Pencil is for questions. There is always one behind your ear.' },
    hksheet: { name: 'Housekeeping sheet', img: 'hksheet', d: 'Marisol\'s sheet in green felt-tip. Third floor: 305, 307, 311. No 309, and no gap where it should be.' },
    shoe: { name: 'A sensible black shoe', img: 'shoe', d: 'Laces still tied. "Chokes on shoes," Aarne says. "Always has." Feed it to the mirror and it will gag on its next meal.' },
    keytag: { name: 'Brass key tag, 309', img: 'keytag', d: 'Stamped 309. It came out of the mirror at 2:51.' },
    mint: { name: 'Gold mint', img: 'mint', d: 'Turndown manners. Give the mirror one and it settles down for half an hour.' },
    glove: { name: 'Gray kid glove', img: 'glove', d: 'Left hand. The laundry mark inside the cuff says C. PELL, in ink gone the brown of weak tea. It is warm inside.' },
    hatpin: { name: 'Steel hatpin', img: 'hatpin', d: 'Long, pearl-tipped. Chokes on pins.' },
    ring: { name: 'Gold ring', img: 'ring', d: 'Engraved inside, in worn script: R.T.L. to M.J.L. 6-20-87.' },
    jar: { name: 'Clean half-pint jar', img: 'jar', d: 'In the book, in the jar. Otherwise nobody remembers.' },
    phone: { name: 'Dash\'s phone', img: 'phone', d: 'Eleven minutes of the third-floor corridor with a synthesizer over it.' },
    ironkey: { name: 'Long iron key', img: 'ironkey', d: 'The kind that comes with a castle. Aarne lent it to you. He would like it back.' }
  };
  G.PORTRAITS = { agnes: 'Agnes', dash: 'Dash', aarne: 'Aarne', marisol: 'Marisol', teddy: 'Teddy' };

  /* ---------- Prefs ---------- */
  var prefs = { sound: true, large: false, motion: false, hints: true, skipGames: false };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREFS) || '{}')); } catch (e) {}
  G.prefs = prefs;
  G.savePrefs = function () { try { localStorage.setItem(PREFS, JSON.stringify(prefs)); } catch (e) {} applyPrefs(); };
  function applyPrefs() {
    var h = document.documentElement; h.classList.toggle('large-text', !!prefs.large); h.classList.toggle('calm', !!prefs.motion); h.classList.toggle('hints', !!prefs.hints);
    A.setEnabled(prefs.sound); var b = $('#soundBtn'); if (b) { b.setAttribute('aria-pressed', prefs.sound ? 'true' : 'false'); b.setAttribute('aria-label', prefs.sound ? 'Sound on. Turn off' : 'Sound off. Turn on'); b.textContent = prefs.sound ? '🔊' : '🔇'; }
  }
  G.applyPrefs = applyPrefs;

  /* ---------- Save ---------- */
  var store = { progress: { done: {} }, run: null };
  try { var raw = JSON.parse(localStorage.getItem(SAVE) || 'null'); if (raw && raw.progress) store = raw; } catch (e) {}
  G.store = store;
  G.save = function () { try { localStorage.setItem(SAVE, JSON.stringify(store)); } catch (e) {} };
  G.unlocked = function () { return window.HotelUnlock.isUnlocked(); };

  /* ---------- Helpers on the run state ---------- */
  G.f = function (k) { return !!(G.s && G.s.flags[k]); };
  G.flag = function (k, v) { G.s.flags[k] = v === undefined ? true : v; };
  G.has = function (i) { return G.s.inv.indexOf(i) >= 0; };
  G.give = function (i, quiet) { if (!G.has(i)) { G.s.inv.push(i); if (!quiet) { A.sfx('pickup'); G.toast('Picked up: ' + G.ITEMS[i].name); } renderTray(); } };
  G.giveMints = function (n) { G.s.mints = (G.s.mints || 0) + n; G.give('mint', true); renderTray(); };
  G.take = function (i) { var k = G.s.inv.indexOf(i); if (k >= 0) G.s.inv.splice(k, 1); if (G.s.sel === i) G.s.sel = null; renderTray(); };
  G.note = function (id, text, kind) { if (!G.s.notes.some(function (n) { return n.id === id; })) G.s.notes.push({ id: id, text: text, kind: kind || 'pencil', t: G.s.t }); };
  G.fmt = function (t) { t = ((t % 1440) + 1440) % 1440; var h = Math.floor(t / 60), m = t % 60, ap = h < 12 ? 'AM' : 'PM', hh = h % 12 || 12; return hh + ':' + (m < 10 ? '0' : '') + m + ' ' + ap; };
  G.night = function () { return window.NIGHTS[G.s.night]; };
  G.addScore = function (n, label) {
    if (!G.s || !n) return; G.s.score = (G.s.score || 0) + n; var el = $('#scoreVal'); if (el) { el.textContent = G.s.score; var pill = $('#scorePill'); pill.classList.remove('bump'); void pill.offsetWidth; pill.classList.add('bump'); }
    if (label) { var f = document.createElement('span'); f.className = 'scorefloat'; f.setAttribute('aria-hidden', 'true'); f.textContent = '+' + n + ' ' + label; var pl = $('#scorePill'); if (pl) { pl.appendChild(f); setTimeout(function () { f.remove(); }, 1300); } }
  };
  /* Play an action game from the story. Records stars and score for the night. */
  G.playGame = async function (id, o) {
    o = Object.assign({}, o || {}); o.night = G.s ? G.s.night : 1;
    var r = await window.Arcade.play(id, o);
    if (G.s) { G.s.games = G.s.games || {}; if (id !== 'tug') { var prev = G.s.games[id]; if (prev == null || r.stars > prev) G.s.games[id] = r.stars; } if (r.score) G.addScore(r.score); G.save(); renderHud(); }
    return r;
  };

  /* ---------- Narration, toasts, dialogue ---------- */
  G.say = function (html, cls) {
    var n = $('#narr'); n.className = 'narr ' + (cls || ''); n.innerHTML = '<p>' + html + '</p>'; n.scrollTop = 0;
    var live = $('#live'); live.textContent = ''; setTimeout(function () { live.textContent = n.textContent; }, 30);
  };
  var toastT = null;
  G.toast = function (text, cls) {
    var box = $('#toasts'), el = document.createElement('div'); el.className = 'toast ' + (cls || ''); el.textContent = text; box.appendChild(el);
    setTimeout(function () { el.classList.add('out'); setTimeout(function () { el.remove(); }, 600); }, cls === 'big' ? 4200 : 3000);
    var live = $('#live2'); live.textContent = text;
  };
  /* lines: array of strings (narration) or [who, text]. Returns a promise. */
  G.talk = function (lines) {
    return new Promise(function (done) {
      var i = 0, dlg = $('#dialog');
      function show() {
        if (i >= lines.length) { dlg.hidden = true; document.body.classList.remove('talking'); done(); return; }
        var L = lines[i], who = Array.isArray(L) ? L[0] : null, text = Array.isArray(L) ? L[1] : L;
        dlg.hidden = false; document.body.classList.add('talking');
        dlg.className = 'dialog' + (who ? ' has-por' : ' narration');
        dlg.innerHTML = (who ? '<img class="por" src="img/por/' + who + '.jpg" alt="">' : '') +
          '<div class="dtext">' + (who ? '<p class="who">' + esc(G.PORTRAITS[who] || who) + '</p>' : '') + '<p>' + text + '</p>' +
          '<div class="drow">' + (lines.length - i > 1 ? '<button type="button" class="btn small dskip" id="dSkip">Skip</button>' : '') + '<button type="button" class="btn dnext" id="dNext">' + (i === lines.length - 1 ? 'Continue' : 'Next') + '</button></div></div>';
        var b = $('#dNext'); b.onclick = function () { A.sfx('click'); i++; show(); }; setTimeout(function () { b.focus(); }, 30);
        var sk = $('#dSkip'); if (sk) sk.onclick = function () { A.sfx('page'); i = lines.length; show(); };
      }
      show();
    });
  };
  /* A choice. opts: array of labels. Returns promise of index. */
  G.choose = function (prompt, opts, who) {
    return new Promise(function (done) {
      var dlg = $('#dialog'); dlg.hidden = false; document.body.classList.add('talking'); dlg.className = 'dialog choice' + (who ? ' has-por' : '');
      dlg.innerHTML = (who ? '<img class="por" src="img/por/' + who + '.jpg" alt="">' : '') + '<div class="dtext">' + (who ? '<p class="who">' + esc(G.PORTRAITS[who]) + '</p>' : '') + '<p>' + prompt + '</p><div class="opts">' +
        opts.map(function (o, k) { return '<button type="button" class="btn opt" data-k="' + k + '">' + o + '</button>'; }).join('') + '</div></div>';
      dlg.querySelectorAll('.opt').forEach(function (b) { b.onclick = function () { A.sfx('click'); dlg.hidden = true; document.body.classList.remove('talking'); done(+b.dataset.k); }; });
      setTimeout(function () { var b = dlg.querySelector('.opt'); if (b) b.focus(); }, 30);
    });
  };
  /* Modal panel. Returns {el, close}. onClose optional. */
  var panelStack = [];
  G.panel = function (title, html, opt) {
    opt = opt || {}; var wrap = document.createElement('div'); wrap.className = 'panel-wrap';
    wrap.innerHTML = '<div class="panel ' + (opt.cls || '') + '" role="dialog" aria-modal="true" aria-labelledby="pt' + panelStack.length + '"><div class="phead"><h2 id="pt' + panelStack.length + '">' + title + '</h2>' +
      (opt.noClose ? '' : '<button type="button" class="iconbtn pclose" aria-label="Close">✕</button>') + '</div><div class="pbody">' + html + '</div></div>';
    document.body.appendChild(wrap); var prevFocus = document.activeElement;
    var api = { el: wrap.querySelector('.pbody'), root: wrap, close: function (v) { if (!wrap.parentNode) return; wrap.remove(); panelStack.pop(); if (prevFocus && prevFocus.focus) try { prevFocus.focus(); } catch (e) {} if (opt.onClose) opt.onClose(v); } };
    panelStack.push(api);
    var c = wrap.querySelector('.pclose'); if (c) c.onclick = function () { A.sfx('click'); api.close(); };
    wrap.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !opt.noClose) api.close(); });
    setTimeout(function () { var f = wrap.querySelector('[autofocus]') || wrap.querySelector('h2'); if (f) { if (f.tagName === 'H2') f.setAttribute('tabindex', '-1'); f.focus(); } }, 30);
    return api;
  };
  /* Promise wrapper: resolves with the value passed to close(). */
  G.panelP = function (title, html, setup, opt) {
    return new Promise(function (done) { opt = Object.assign({}, opt || {}, { onClose: function (v) { done(v); } }); var p = G.panel(title, html, opt); if (setup) setup(p); });
  };
  G.closeAllPanels = function () { while (panelStack.length) panelStack[panelStack.length - 1].close(); };

  /* ---------- Visual effects ---------- */
  G.shake = function (big) { if (prefs.motion) return; var s = $('#viewport'); s.classList.remove('shake', 'shake-big'); void s.offsetWidth; s.classList.add(big ? 'shake-big' : 'shake'); };
  G.ripple = function (amount, ms) {
    var d = document.getElementById('rippleDisp'); if (!d) return; if (prefs.motion) amount = Math.min(amount, 6);
    var start = performance.now(); ms = ms || 1800;
    (function step(now) { var k = Math.min(1, (now - start) / ms), v = amount * Math.sin(k * Math.PI); d.setAttribute('scale', String(4 + v)); if (k < 1) requestAnimationFrame(step); else d.setAttribute('scale', '4'); })(start);
  };
  G.belchFx = function (size) { A.sfx('belch', size); G.shake(size > 1.2); G.ripple(30 * size, 1400 + size * 900); var g = $('.glass'); if (g) { g.classList.remove('bulge'); void g.offsetWidth; g.classList.add('bulge'); } };
  /* Leftovers skitter out of the glass at knee height. items: [{label, img?}] */
  G.spit = function (things) {
    var st = $('#stage'), sc = G.SCENES[G.s.scene], gl = sc.glass; if (!gl) return;
    things.forEach(function (th, k) {
      var el = document.createElement('div'); el.className = 'spat'; el.setAttribute('aria-hidden', 'true');
      el.innerHTML = th.img ? '<img src="img/items/' + th.img + '.jpg" alt="">' : '<span>' + esc(th.label) + '</span>';
      el.style.left = (gl[0] + gl[2] * 0.4) + '%'; el.style.top = (gl[1] + gl[3] * 0.92) + '%'; st.appendChild(el);
      setTimeout(function () { A.sfx('skitter'); el.style.transform = 'translate(' + (60 + k * 50) + 'px,' + (30 + k * 18) + 'px) rotate(' + (200 + k * 90) + 'deg)'; el.classList.add('go'); }, 300 + k * 450);
      setTimeout(function () { el.classList.add('fade'); }, 4200 + k * 300); setTimeout(function () { el.remove(); }, 5200 + k * 300);
    });
  };

  /* ---------- Time and the mirror's appetite ---------- */
  G.nextMeal = function () { var m = G.s.meals.filter(function (x) { return !x.done; }).sort(function (a, b) { return a.at - b.at; }); return m[0] || null; };
  G.spaceSafe = function (sp) { return !!G.s.inked[sp]; };
  /* Advance the clock, firing scheduled events and meals in order. */
  G.spend = async function (min) {
    var s = G.s, target = s.t + min;
    while (true) {
      var N = G.night(), nextEv = null;
      (N.events || []).forEach(function (ev) { if (!s.fired[ev.id] && ev.at <= target && (!ev.when || ev.when()) && (!nextEv || ev.at < nextEv.at)) nextEv = ev; });
      var meal = null; s.meals.forEach(function (m) { if (!m.done && m.at <= target && (!meal || m.at < meal.at)) meal = m; });
      var warn = null; s.meals.forEach(function (m) { if (!m.done && !m.warned && m.at - 20 <= target && (!warn || m.at < warn.at)) warn = m; });
      var cands = [nextEv && { t: nextEv.at, k: 'ev', v: nextEv }, meal && { t: meal.at, k: 'meal', v: meal }, warn && { t: warn.at - 20, k: 'warn', v: warn }].filter(Boolean).sort(function (a, b) { return a.t - b.t; });
      if (!cands.length) break;
      var c = cands[0]; s.t = Math.max(s.t, c.t); renderHud();
      if (c.k === 'ev') { s.fired[c.v.id] = true; await c.v.run(); }
      else if (c.k === 'warn') { c.v.warned = true; warnMeal(c.v); }
      else await eatMeal(c.v);
    }
    s.t = Math.max(s.t, target); renderHud(); G.save();
    var N2 = G.night(); if (s.t >= N2.end && !s.over) { s.over = true; await G.shiftOver(); }
  };
  function warnMeal(m) {
    var sp = G.SPACES[m.room]; if (G.spaceSafe(m.room) || G.s.eaten[m.room]) return;
    A.sfx('rumble', 1.2); G.toast('The radiators knock. The mirror is eyeing ' + sp.name + '. It will eat at ' + G.fmt(m.at) + ' unless that room is in the book in ink.', 'warn');
    G.note('warn-' + m.room + m.at, 'Hungry for ' + sp.name + ' at ' + G.fmt(m.at) + '. Account for it, then ink it in the ledger. Or feed the mirror something it can\'t swallow.', 'pencil');
  }
  async function eatMeal(m) {
    var s = G.s, sp = G.SPACES[m.room]; m.done = true;
    if (s.eaten[m.room]) return;
    if (G.spaceSafe(m.room)) { A.sfx('hiccup'); G.toast('The mirror sniffs at ' + sp.name + '. It is in the book, in ink. The mirror sulks.', 'good'); s.stats.fended++; G.addScore(100, 'Room kept'); return; }
    if (s.choke > 0) { s.choke--; A.sfx('cough'); G.shake(); G.toast('The mirror goes for ' + sp.name + ', gags on the shoe, and spends the next while coughing like a man at a wedding. ' + sp.name.charAt(0).toUpperCase() + sp.name.slice(1) + ' is spared.', 'good'); s.stats.fended++; G.addScore(100, 'Shoe!'); return; }
    G.belchFx(0.6);
    var tug = await G.playGame('tug', { room: sp.name, lead: 'It is ' + G.fmt(m.at) + '. The mirror has its tongue around ' + esc(sp.name) + ' and is pulling it into the glass. Grab the doorknob and pull!' });
    if (tug.won) { A.sfx('hiccup'); G.ripple(14, 900); G.toast('You pulled ' + sp.name + ' back out of the glass. The mirror hiccups, embarrassed.', 'good'); s.stats.fended++; s.stats.tugs = (s.stats.tugs || 0) + 1; G.note('tug-' + m.room + m.at, cap(sp.name) + ' pulled back from the mirror at ' + G.fmt(m.at) + '.', 'pencil'); renderHud(); return; }
    s.eaten[m.room] = true; s.stats.eaten++; G.belchFx(1.3);
    G.toast('BURRRRP. Somewhere in the hotel, ' + sp.name + ' is gone. Where its door was, the wallpaper is warm.', 'big');
    G.note('ate-' + m.room, sp.name.charAt(0).toUpperCase() + sp.name.slice(1) + ' eaten at ' + G.fmt(m.at) + '. Ink brings things back, if you have the record.', 'pencil');
    if (sp.scene && s.scene === sp.scene) {
      await G.talk(['The walls ribbed like the roof of a mouth. The floor tilted. There was a sound like a boot pulling out of mud.', 'Then the marble of the lobby, cold under your cheek. The mirror coughs politely into its napkin. It has spat you out. Apparently you are not to its taste.']);
      s.scene = 'lobby'; s.t += 10; render();
    }
    renderHud();
  }
  G.feedMirror = async function (item) {
    var s = G.s;
    if (item === 'shoe') { G.take('shoe'); s.choke = (s.choke || 0) + 1; A.sfx('gulp'); G.ripple(20, 1200); G.say('You set the shoe at the foot of the glass. The mirror takes it the way a dog takes a pill, then holds very still, as if it already regrets it. Its next meal is going to go badly.'); G.flag('fedShoe'); s.stats.fended += 0; return true; }
    if (item === 'mint') {
      if (!s.mints) return false; s.mints--; if (!s.mints) G.take('mint'); var m = G.nextMeal(); A.sfx('gulp'); G.ripple(10, 900);
      if (m) { m.at += 30; m.warned = false; G.say('You lay a gold mint on Marisol\'s towel. The foil vanishes. The mirror settles, like a guest after turndown. Its next meal is pushed back to ' + G.fmt(m.at) + '.'); }
      else G.say('You lay a gold mint on the towel. The mirror takes it, politely. It has better manners than the guests.');
      G.flag('fedMint'); renderTray(); return true;
    }
    return false;
  };
  /* Ink a space into tonight's page. Brings eaten spaces back. */
  G.inkSpace = async function (sp) {
    var s = G.s; A.sfx('scratch'); s.inked[sp] = true; G.addScore(50, 'In ink'); await G.spend(2);
    if (s.eaten[sp]) { s.eaten[sp] = false; s.stats.restored++; A.sfx('hiccup'); G.ripple(14, 900); G.toast('The mirror hiccups, small and startled. ' + cap(G.SPACES[sp].name) + ' is back, a little damp around the edges.', 'good'); }
    G.save();
  };
  function cap(x) { return x.charAt(0).toUpperCase() + x.slice(1); }
  G.cap = cap;

  /* ---------- Run lifecycle ---------- */
  G.startNight = function (n) {
    var N = window.NIGHTS[n];
    G.s = store.run = { night: n, t: N.start, scene: N.startScene, inv: N.inv.slice(), sel: null, flags: {}, fired: {}, notes: [], inked: {}, eaten: {}, rec: {}, mints: 0, choke: 0,
      meals: N.meals.map(function (m) { return { room: m.room, at: m.at, warned: false, done: false }; }), stats: { eaten: 0, fended: 0, restored: 0, curios: 0, tugs: 0 }, curios: {}, over: false, score: 0, games: {} };
    if (N.setup) N.setup();
    G.save(); showGame(); render();
    return N.intro ? N.intro() : null;
  };
  G.resume = function () { G.s = store.run; G.s.score = G.s.score || 0; G.s.games = G.s.games || {}; showGame(); render(); };
  G.completeNight = async function () {
    var s = G.s, N = G.night(); s.over = true;
    var lost = Object.keys(s.eaten).filter(function (k) { return s.eaten[k]; });
    var curios = Object.keys(s.curios).length, total = N.curios || 3;
    var gl = N.games || [], played = gl.filter(function (id) { return s.games && s.games[id] != null; }), gsum = played.reduce(function (a, id) { return a + s.games[id]; }, 0);
    var gStar = gl.length && played.length === gl.length && gsum >= gl.length * 2;
    if (!lost.length) G.addScore(250, 'No rooms lost');
    var stars = 1 + (lost.length === 0 ? 1 : 0) + (gStar ? 1 : 0);
    var prev = store.progress.done[s.night] || {};
    store.progress.done[s.night] = { stars: Math.max(stars, prev.stars || 0), score: Math.max(s.score || 0, prev.score || 0), at: new Date().toISOString() };
    var AR = window.Arcade; AR.award('n' + s.night); if (stars >= 3) AR.award('three');
    if ([1, 2, 3].every(function (n) { return store.progress.done[n] && store.progress.done[n].stars >= 3; })) AR.award('nine');
    if (N.outro) await N.outro();
    var rows = Object.keys(G.SPACES).filter(function (k) { return s.meals.some(function (m) { return m.room === k; }); }).map(function (k) {
      return '<li class="' + (s.eaten[k] ? 'lost' : 'kept') + '"><span>' + esc(cap(G.SPACES[k].name)) + '</span><span>' + (s.eaten[k] ? 'Eaten' : (s.inked[k] ? 'In ink' : 'Kept')) + '</span></li>';
    }).join('');
    var games = gl.map(function (id) { var g = AR.games[id], st = s.games && s.games[id] != null ? s.games[id] : 0; return '<li><span>' + esc(g.title) + '</span><span aria-label="' + st + ' of 3 stars">' + '★★★'.slice(0, st) + '<span class="dim">' + '★★★'.slice(st) + '</span></span></li>'; }).join('');
    var nextN = s.night + 1, hasNext = !!window.NIGHTS[nextN];
    store.run = null; G.save();
    var best = store.progress.done[s.night].score;
    var html = '<p class="audit-stars" aria-label="' + stars + ' of 3 stars">' + '★★★'.slice(0, stars) + '<span class="dim">' + '★★★'.slice(stars) + '</span></p>' +
      '<p class="audit-score">Shift score <b>' + (s.score || 0) + '</b>' + ((s.score || 0) >= best && best > 0 ? ' <span class="nb">Best yet!</span>' : ' <span class="small">Best ' + best + '</span>') + '</p>' +
      '<p class="lead">Trial balance at zero. You feel the small bright click of it in your chest.</p>' +
      '<h3 class="small-h">Action games</h3><ul class="audit">' + games + '</ul>' +
      '<h3 class="small-h">Rooms</h3><ul class="audit">' + rows + '</ul>' +
      '<p class="small">Rooms kept from the mirror: ' + s.stats.fended + '. Tugs won: ' + (s.stats.tugs || 0) + '. Rooms written back: ' + s.stats.restored + '. Curiosities noticed: ' + curios + ' of ' + total + '.</p>' +
      '<p class="small">Stars: one for finishing the shift, one for losing no rooms, one for averaging two stars in the action games.</p>' +
      '<div class="row">' + (hasNext ? '<button type="button" class="btn primary" id="auNext">Night ' + nextN + ': ' + esc(window.NIGHTS[nextN].title) + (G.unlocked() ? '' : ' 🔒') + '</button>' : '<a class="btn primary" href="' + esc(window.MIRROR_CONFIG.amazon.shortLink) + '" target="_blank" rel="noopener">Read what happens next</a>') +
      '<button type="button" class="btn" id="auReplay">Replay this night</button><button type="button" class="btn" id="auTrophy">Trophy Room</button><button type="button" class="btn" id="auTitle">Title screen</button></div>';
    var done = s.night;
    G.panel('Night ' + done + ' audit: ' + esc(N.title), html, { cls: 'audit-panel', noClose: true });
    A.sfx('win');
    var nb = $('#auNext'); if (nb) nb.onclick = function () { G.closeAllPanels(); G.tryNight(nextN); };
    $('#auReplay').onclick = function () { G.closeAllPanels(); G.tryNight(done); };
    $('#auTrophy').onclick = function () { G.showTitle(); window.Arcade.trophyRoom(); };
    $('#auTitle').onclick = function () { G.closeAllPanels(); G.showTitle(); };
  };
  G.shiftOver = async function () {
    await G.talk(['Seven o\'clock. The day manager comes in stamping snow off her boots and says good morning to you and to the trout, in that order.', 'The shift is over, and the night is not done. Some things are still not in the book.']);
    var k = await G.choose('Try this night again?', ['Start the night over', 'Back to the title screen']);
    store.run = null; G.save();
    if (k === 0) G.tryNight(G.s.night); else G.showTitle();
  };
  G.tryNight = function (n) {
    var N = window.NIGHTS[n]; if (!N) return;
    if (!N.free && !G.unlocked()) { window.UnlockUI.open({ reason: 'night', night: n }); return; }
    G.startNight(n);
  };

  /* ---------- Rendering ---------- */
  function showGame() { $('#title').hidden = true; $('#game').hidden = false; document.body.classList.add('in-game'); }
  G.showTitle = function () { G.closeAllPanels(); $('#dialog').hidden = true; $('#game').hidden = true; $('#title').hidden = false; document.body.classList.remove('in-game', 'talking'); A.ambient('title'); window.renderTitle && window.renderTitle(); };

  function renderHud() {
    var s = G.s; if (!s) return; var N = G.night();
    $('#clock').textContent = G.fmt(s.t);
    $('#nightName').textContent = 'Night ' + s.night + ': ' + N.title; var sv = $('#scoreVal'); if (sv) sv.textContent = s.score || 0;
    var m = G.nextMeal(), bar = $('#appetite'), lab = $('#appLabel');
    var ratio = 0, txt = 'The mirror is digesting.';
    if (m && !s.eaten[m.room]) { ratio = Math.max(0.05, Math.min(1, 1 - (m.at - s.t) / 60)); txt = (G.spaceSafe(m.room) ? 'Sniffing at ' : 'Hungry for ') + G.SPACES[m.room].name + ' at ' + G.fmt(m.at); }
    bar.style.setProperty('--fill', (ratio * 100).toFixed(0) + '%'); bar.classList.toggle('hot', ratio > 0.66);
    lab.textContent = txt; $('#appMeter').setAttribute('aria-label', 'Mirror appetite. ' + txt);
  }
  G.renderHud = renderHud;
  function renderTray() {
    var s = G.s; if (!s) return; var t = $('#tray');
    t.innerHTML = s.inv.length ? s.inv.map(function (i) {
      var it = G.ITEMS[i], cnt = i === 'mint' && s.mints > 1 ? '<span class="cnt">' + s.mints + '</span>' : '';
      return '<button type="button" class="item' + (s.sel === i ? ' sel' : '') + '" data-item="' + i + '" aria-pressed="' + (s.sel === i) + '" aria-label="' + esc(it.name) + (cnt ? ', ' + s.mints : '') + (s.sel === i ? ', selected. Tap something to use it there' : '') + '"><img src="img/items/' + it.img + '.jpg" alt="">' + cnt + '</button>';
    }).join('') : '<p class="small empty">Pockets empty.</p>';
    t.querySelectorAll('.item').forEach(function (b) {
      b.onclick = function () {
        if (G.busy) return; var i = b.dataset.item; A.sfx('click');
        if (s.sel === i) { s.sel = null; G.say(esc(G.ITEMS[i].name) + ' put away.'); }
        else { s.sel = i; G.say('<strong>' + esc(G.ITEMS[i].name) + '.</strong> ' + G.ITEMS[i].d + ' <em>Tap something in the room to use it there.</em>'); }
        renderTray(); var nb = t.querySelector('[data-item="' + i + '"]'); if (nb) nb.focus();
      };
    });
  }
  G.renderTray = renderTray;

  function hotspotsFor(scene) {
    var N = G.night(), list = [];
    [N.hotspots && N.hotspots[scene], window.COMMON_HOTSPOTS[scene]].forEach(function (arr) {
      (arr || []).forEach(function (h) { if (h.when && !h.when()) return; if (list.some(function (x) { return x.id === h.id; })) return; list.push(h); });
    });
    return list;
  }
  G.exitsFor = function (scene) {
    var N = G.night();
    return (G.EXITS[scene] || []).filter(function (e) { return !N.blockExit || !N.blockExit(e[0], scene, true); });
  };
  function render() {
    var s = G.s, sc = G.SCENES[s.scene], N = G.night();
    var st = $('#stage');
    var bgu = 'url("' + new URL('img/bg/' + sc.bg + '.jpg', location.href).href + '")'; st.style.setProperty('--bg', bgu); $('#viewport').style.setProperty('--bg', bgu);
    var hs = hotspotsFor(s.scene);
    var html = '<img class="bgimg" src="img/bg/' + sc.bg + '.jpg" alt="">';
    (sc.lights || []).forEach(function (l, k) { html += '<span class="lamp" style="left:' + l[0] + '%;top:' + l[1] + '%;animation-delay:-' + (k * 1.7) + 's" aria-hidden="true"></span>'; });
    if (sc.glass) html += '<div class="glass" aria-hidden="true" style="left:' + sc.glass[0] + '%;top:' + sc.glass[1] + '%;width:' + sc.glass[2] + '%;height:' + sc.glass[3] + '%;background-size:' + (10000 / sc.glass[2]).toFixed(2) + '% ' + (10000 / sc.glass[3]).toFixed(2) + '%;background-position:' + (sc.glass[0] / (100 - sc.glass[2]) * 100).toFixed(2) + '% ' + (sc.glass[3] >= 100 ? 0 : (sc.glass[1] / (100 - sc.glass[3]) * 100)).toFixed(2) + '%"></div>';
    if (N.decor && N.decor[s.scene]) html += N.decor[s.scene]();
    if (window.COMMON_DECOR[s.scene]) html += window.COMMON_DECOR[s.scene]();
    html += '<canvas class="dust" aria-hidden="true"></canvas><div class="vignette" aria-hidden="true"></div>';
    hs.forEach(function (h) {
      html += '<button type="button" class="hs' + (h.cls ? ' ' + h.cls : '') + (h.goal && h.goal() ? ' goal' : '') + '" data-hs="' + h.id + '" style="left:' + h.r[0] + '%;top:' + h.r[1] + '%;width:' + h.r[2] + '%;height:' + h.r[3] + '%" aria-label="' + esc(typeof h.label === 'function' ? h.label() : h.label) + '"><span class="dot" aria-hidden="true"></span><span class="tip" aria-hidden="true">' + esc(typeof h.label === 'function' ? h.label() : h.label) + '</span></button>';
    });
    st.innerHTML = html;
    st.setAttribute('aria-label', sc.name + '. ' + sc.desc);
    st.querySelectorAll('.hs').forEach(function (b) {
      b.onclick = function () { var h = hs.filter(function (x) { return x.id === b.dataset.hs; })[0]; act(h); };
    });
    $('#sceneName').textContent = sc.name; $('#sceneFloor').textContent = sc.floor;
    var ex = G.exitsFor(s.scene);
    $('#exits').innerHTML = ex.map(function (e) {
      var to = e[0], gone = N.sceneGone ? N.sceneGone(to) : null, sp = G.SPACES[to], eaten = sp && s.eaten[to];
      if (gone === 'hide') return '';
      return '<button type="button" class="btn exit' + (eaten ? ' eaten' : '') + '" data-to="' + to + '">' + esc(e[2] || G.SCENES[to].name) + (eaten ? ' <span class="tag">eaten</span>' : '') + ' <span class="cost">' + e[1] + ' min</span></button>';
    }).join('');
    $('#exits').querySelectorAll('.exit').forEach(function (b) { b.onclick = function () { move(b.dataset.to); }; });
    renderHud(); renderTray(); sizeStage(true); requestAnimationFrame(function () { sizeStage(true); }); startDust();
    A.ambient(sc.amb);
    var obj = currentObjective(); $('#objective').innerHTML = obj ? '<span class="olab">Now:</span> ' + esc(obj) : '';
  }
  G.render = render;
  function currentObjective() { var N = G.night(); var o = (N.objectives || []).filter(function (x) { return !x.done(); })[0]; return o ? o.text : null; }
  G.currentObjective = currentObjective;

  async function act(h) {
    if (G.busy || !h) return; G.busy = true; A.unlock(); A.sfx('click');
    try {
      var sel = G.s.sel;
      if (h.go && !sel) { G.busy = false; return move(h.go); }
      if (sel) {
        var fn = h.use && h.use[sel], cu = G.COMMON_USE ? G.COMMON_USE(h, sel) : null;
        if (fn) { await fn(); }
        else if (cu) { await cu(); }
        else { A.sfx('bad'); G.say('You hold up the ' + esc(G.ITEMS[sel].name.toLowerCase()) + ' to the ' + esc((typeof h.label === 'function' ? h.label() : h.label).toLowerCase()) + '. Nothing happens, which is the most common outcome at the Aurelian.'); }
        G.s.sel = null;
      } else if (h.act) { await h.act(); }
      else if (h.look) { G.say(typeof h.look === 'function' ? h.look() : h.look); await G.spend(1); }
      if (h.curio && !G.s.curios[h.id]) { G.s.curios[h.id] = 1; G.addScore(50, 'Curiosity'); var isNewArt = window.Arcade.artifact(h.id); G.toast('Curiosity noticed (' + Object.keys(G.s.curios).length + ' of ' + (G.night().curios || 3) + ')' + (isNewArt ? '. Added to your Trophy Room.' : ''), 'good'); }
    } catch (e) { console.warn(e); }
    G.busy = false; if (G.s && !G.s.over && !$('#game').hidden) { G.save(); refreshKeep(); }
  }
  G.act = act;
  function refreshKeep() { var f = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.hs : null; render(); if (f) { var b = document.querySelector('[data-hs="' + f + '"]'); if (b) b.focus({ preventScroll: true }); } }
  G.refresh = refreshKeep;

  async function move(to) {
    if (G.busy) return; G.busy = true; A.unlock();
    try {
      var s = G.s, N = G.night(), e = (G.EXITS[s.scene] || []).filter(function (x) { return x[0] === to; })[0], sp = G.SPACES[to];
      if (sp && s.eaten[to]) { A.sfx('stomach'); G.say('You go to where ' + sp.name + ' should be. There is no door, only wallpaper, warm and faintly tacky, like the inside of a wrist. ' + (s.rec[to] ? 'You have its record. Ink it back into the ledger at the front desk.' : 'You never accounted for it, so there is nothing to write it back from. Next time, check the room first.')); }
      else {
        var block = N.blockExit ? N.blockExit(to, s.scene) : null;
        if (block) { if (typeof block === 'function') await block(); else G.say(block); }
        else {
          A.sfx('step'); var from = s.scene; s.scene = to; s.sel = null;
          $('#viewport').classList.add('fade'); setTimeout(function () { $('#viewport').classList.remove('fade'); }, 400);
          render(); G.say(G.SCENES[to].desc);
          await G.spend(e ? e[1] : 2);
          if (N.onEnter) await N.onEnter(to, from);
        }
      }
    } catch (err) { console.warn(err); }
    G.busy = false; if (G.s && !G.s.over && !$('#game').hidden) { G.save(); refreshKeep(); var first = document.querySelector('#stage .hs'); }
  }
  G.move = move;
  G.wait = async function (min) { if (G.busy) return; G.busy = true; A.unlock(); try { G.say('You wait. The harbor light goes around over the ice like someone looking for their keys.'); await G.spend(min); } catch (e) { console.warn(e); } G.busy = false; if (G.s && !G.s.over && !$('#game').hidden) refreshKeep(); };

  /* ---------- Stage sizing: pan on narrow screens ---------- */
  function sizeStage(recenter) {
    var vp = $('#viewport'), st = $('#stage'); if (!vp || $('#game').hidden) return;
    var vw = vp.clientWidth, vh = vp.clientHeight, w, h;
    if (vw / vh >= 1.25 || vw >= 700) { w = Math.min(vw, vh * 16 / 9); h = w * 9 / 16; }
    else { h = vh; w = vh * 16 / 9; if (w < vw) { w = vw; h = vw * 9 / 16; } }
    st.style.width = w + 'px'; st.style.height = h + 'px';
    var pan = w > vw + 2; vp.classList.toggle('pans', pan); $('#panHint').hidden = !pan;
    if (recenter) { var f = G.SCENES[G.s.scene].focus || 0.5; vp.scrollLeft = Math.max(0, w * f - vw / 2); }
    var c = st.querySelector('canvas.dust'); if (c) { c.width = Math.round(w / 2); c.height = Math.round(h / 2); }
  }
  window.addEventListener('resize', function () { sizeStage(false); });
  var lastVP = '';
  if (window.ResizeObserver) document.addEventListener('DOMContentLoaded', function () {
    var vp = $('#viewport'); if (!vp) return;
    new ResizeObserver(function () { var k = vp.clientWidth + 'x' + vp.clientHeight; if (k === lastVP) return; var first = !lastVP || lastVP.indexOf('0x') === 0 || lastVP.slice(-2) === 'x0'; lastVP = k; sizeStage(first); }).observe(vp);
  });
  /* Dust motes drifting in the lamplight */
  var dustRAF = null;
  function startDust() {
    if (dustRAF) cancelAnimationFrame(dustRAF); var c = $('#stage canvas.dust'); if (!c || prefs.motion) return;
    var x = c.getContext('2d'), P = []; for (var i = 0; i < 46; i++) P.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + 0.3, vx: (Math.random() - 0.5) * 0.0003, vy: -Math.random() * 0.0004 - 0.00005, a: Math.random() * 0.5 + 0.15 });
    (function frame() {
      if (!c.isConnected) return; x.clearRect(0, 0, c.width, c.height);
      P.forEach(function (p) { p.x += p.vx; p.y += p.vy; if (p.y < 0) { p.y = 1; p.x = Math.random(); } if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0; x.globalAlpha = p.a; x.fillStyle = '#ffe2a8'; x.beginPath(); x.arc(p.x * c.width, p.y * c.height, p.r, 0, 6.283); x.fill(); });
      dustRAF = requestAnimationFrame(frame);
    })();
  }

  /* ---------- HUD panels: notes, map, menu ---------- */
  G.openNotes = function () {
    var s = G.s, N = G.night();
    var obj = (N.objectives || []).map(function (o) { var d = o.done(); return '<li class="' + (d ? 'done' : '') + '"><span aria-hidden="true">' + (d ? '✔' : '○') + '</span> ' + esc(o.text) + (d ? '<span class="sr-only"> (done)</span>' : '') + '</li>'; }).join('');
    var notes = s.notes.slice().reverse().map(function (n) { return '<li class="note-' + n.kind + (n.fade ? ' faded' : '') + '"><span class="nt">' + G.fmt(n.t) + '</span> ' + n.text + '</li>'; }).join('');
    var meals = s.meals.filter(function (m) { return m.warned || m.done; }).map(function (m) { return '<li>' + G.fmt(m.at) + ': ' + esc(cap(G.SPACES[m.room].name)) + ' (' + (s.eaten[m.room] ? 'eaten' : (G.spaceSafe(m.room) ? 'in ink, safe' : (m.done ? 'spared' : 'not safe yet'))) + ')</li>'; }).join('');
    G.panel('Steno pad', '<h3>Tonight</h3><ol class="objs">' + obj + '</ol>' + (meals ? '<h3>The mirror\'s menu</h3><ul class="meals">' + meals + '</ul>' : '') +
      '<h3>Notes</h3><ul class="notes">' + (notes || '<li>Nothing yet. Pencil is for questions.</li>') + '</ul>' + (N.wrist ? '<h3>Written on your wrist</h3><p class="wrist">' + N.wrist() + '</p>' : ''), { cls: 'steno' });
  };
  G.openMap = function () {
    var s = G.s, N = G.night();
    var floors = [['Third floor', ['corridor', 'linen', 'room309']], ['Ground floor', ['lobby', 'desk', 'mirror', 'office']], ['Basement', ['basement', 'jarroom', 'laundry']]];
    var html = '<p class="small">You are in <strong>' + esc(G.SCENES[s.scene].name) + '</strong>. Use the doorway buttons under the picture to walk. Stairs take longer.</p>' + floors.map(function (f) {
      return '<h3>' + f[0] + '</h3><ul class="mapl">' + f[1].map(function (id) {
        var g = N.sceneGone ? N.sceneGone(id) : null; if (g === 'hide') return '';
        var sp = G.SPACES[id], state = sp && s.eaten[id] ? 'eaten' : (sp && G.spaceSafe(id) ? 'in ink' : (g ? g : ''));
        return '<li class="' + (id === s.scene ? 'here' : '') + (sp && s.eaten[id] ? ' eaten' : '') + '">' + esc(G.SCENES[id].name) + (state ? ' <span class="tag">' + esc(state) + '</span>' : '') + (id === s.scene ? ' <span class="tag here">you</span>' : '') + '</li>';
      }).join('') + '</ul>';
    }).join('');
    var other = Object.keys(G.SPACES).filter(function (k) { return !G.SPACES[k].scene && s.meals.some(function (m) { return m.room === k; }); });
    if (other.length) html += '<h3>Guest rooms on the menu</h3><ul class="mapl">' + other.map(function (k) { return '<li class="' + (s.eaten[k] ? 'eaten' : '') + '">' + esc(cap(G.SPACES[k].name)) + ' <span class="tag">' + (s.eaten[k] ? 'eaten' : (G.spaceSafe(k) ? 'in ink' : (s.rec[k] ? 'on the report' : 'unknown'))) + '</span></li>'; }).join('') + '</ul>';
    G.panel('Hotel map', html, { cls: 'map' });
  };
  G.openMenu = function () {
    var p = G.panel('Menu', '<div class="col">' +
      '<button type="button" class="btn" id="mTrophy">Trophy Room</button>' +
      '<button type="button" class="btn" id="mHelp">How to play</button>' +
      '<button type="button" class="btn" id="mSettings">Settings</button>' +
      '<button type="button" class="btn" id="mRestart">Restart this night</button>' +
      '<button type="button" class="btn" id="mTitle">Save and go to title screen</button></div><p class="small">Your shift saves after every move, on this device only.</p>');
    $('#mHelp').onclick = function () { G.help(); };
    $('#mTrophy').onclick = function () { p.close(); window.Arcade.trophyRoom(); };
    $('#mSettings').onclick = function () { G.settings(); };
    $('#mRestart').onclick = async function () { p.close(); var k = await G.choose('Start Night ' + G.s.night + ' over from the beginning?', ['Yes, start over', 'No, keep going']); if (k === 0) G.startNight(G.s.night); };
    $('#mTitle').onclick = function () { G.save(); G.showTitle(); };
  };
  G.help = function () {
    G.panel('How to play', '<ul class="help">' +
      '<li><strong>Action games.</strong> Every night has its own action games: catching what the mirror spits out, dodging its tongue, racing the switchboard, sneaking past its eye. Earn up to three stars in each. Each game has a short how-to before it starts, and you can pause any time.</li>' +
      '<li><strong>Lamps are lives.</strong> In an action game you have three lamps. Lose them all and you can try again straight away, or carry on with the story.</li>' +
      '<li><strong>Pull it back!</strong> When the mirror tries to eat a room you have not inked, you get one tug of war to save it. Mash PULL.</li>' +
      '<li><strong>Collect.</strong> Glowing gold leftovers go to the Jar Shelf in your Trophy Room, with achievements and an arcade to replay any game you have reached.</li>' +
      '<li><strong>Look and use.</strong> Tap the glowing spots in the picture. On a phone, swipe the picture sideways to look around.</li>' +
      '<li><strong>Walk.</strong> The doorway buttons under the picture move you between rooms. Every move costs a few minutes. Stairs cost more.</li>' +
      '<li><strong>Items.</strong> Tap an item in your pockets to read it, then tap something in the room to use it there.</li>' +
      '<li><strong>The mirror is hungry.</strong> It eats rooms the hotel stops keeping track of. When it eyes a room, go and account for it, then write it in the ledger in ink. A shoe makes it gag on its next meal. A gold mint calms it for half an hour.</li>' +
      '<li><strong>Ink brings things back.</strong> If it eats a room you have checked, ink it into the ledger and it comes back.</li>' +
      '<li><strong>Time.</strong> The mirror belches at 2:51, give or take a minute. Use Wait to pass time. Finish the night before the day manager arrives.</li>' +
      '<li><strong>Steno pad</strong> keeps your goals and notes. The <strong>map</strong> shows what is still standing.</li>' +
      '<li><strong>Story mode.</strong> Prefer to read? Turn on story mode in Settings to skip the action games.</li></ul>');
  };
  G.settings = function () {
    var p = G.panel('Settings', '<div class="col">' +
      '<label class="chk"><input type="checkbox" id="sSound"' + (prefs.sound ? ' checked' : '') + '> Sound</label>' +
      '<label class="chk"><input type="checkbox" id="sHints"' + (prefs.hints ? ' checked' : '') + '> Show sparkles on things you can tap</label>' +
      '<label class="chk"><input type="checkbox" id="sLarge"' + (prefs.large ? ' checked' : '') + '> Larger text</label>' +
      '<label class="chk"><input type="checkbox" id="sMotion"' + (prefs.motion ? ' checked' : '') + '> Calm motion (less shaking and rippling)</label>' +
      '<label class="chk"><input type="checkbox" id="sSkip"' + (prefs.skipGames ? ' checked' : '') + '> Story mode: skip the action games</label></div>' +
      '<p class="small">' + (G.unlocked() ? 'The full hotel is unlocked on this device.' : 'Night One is free. Nights Two and Three unlock for book owners.') + '</p>' +
      (G.unlocked() ? '<button type="button" class="btn" id="sRelock">Lock again (for testing)</button>' : '') +
      '<button type="button" class="btn" id="sReset">Erase my saved game</button><button type="button" class="btn" id="sResetC">Erase my Trophy Room</button>');
    $('#sResetC').onclick = async function () { p.close(); var k = await G.choose('Erase your Jar Shelf, achievements and best scores on this device?', ['Erase', 'Keep']); if (k === 0) { window.Arcade.reset(); G.toast('Trophy Room cleared.'); } };
    ['Sound', 'Hints', 'Large', 'Motion'].forEach(function (k) { $('#s' + k).onchange = function (e) { prefs[k.toLowerCase()] = e.target.checked; G.savePrefs(); if (k === 'Sound' && e.target.checked) A.unlock(); }; });
    $('#sSkip').onchange = function (e) { prefs.skipGames = e.target.checked; G.savePrefs(); };
    var rl = $('#sRelock'); if (rl) rl.onclick = function () { window.HotelUnlock.reset(); p.close(); G.toast('Locked again on this device.'); window.renderTitle && window.renderTitle(); };
    $('#sReset').onclick = async function () { p.close(); var k = await G.choose('Erase your saved shift and stars on this device? Your unlock stays.', ['Erase', 'Keep']); if (k === 0) { store.progress = { done: {} }; store.run = null; G.save(); G.showTitle(); } };
  };

  /* ---------- Boot ---------- */
  G.boot = function () {
    applyPrefs();
    $('#btnNotes').onclick = function () { A.sfx('page'); G.openNotes(); };
    $('#btnMap').onclick = function () { A.sfx('page'); G.openMap(); };
    $('#btnWait').onclick = function () { G.wait(10); };
    $('#btnMenu').onclick = function () { G.openMenu(); };
    $('#btnLook').onclick = function () { A.sfx('click'); var st = $('#stage'); st.classList.remove('reveal'); void st.offsetWidth; st.classList.add('reveal'); var o = currentObjective(); G.say((o ? '<strong>Now:</strong> ' + esc(o) + ' ' : '') + 'The gold-ringed spots are worth a look.'); };
    $('#soundBtn').onclick = function () { prefs.sound = !prefs.sound; G.savePrefs(); if (prefs.sound) A.unlock(); };
    document.addEventListener('pointerdown', function () { A.unlock(); }, { once: true });
  };
})();
