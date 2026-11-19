/* Hotel Aurelian: the nights. Story details come from Tammy Michelli's novel, Chapters 1 to 5. */
(function () {
  'use strict';
  var A = window.HotelAudio, $ = function (s) { return document.querySelector(s); };
  var f = function (k) { return G.f(k); }, fl = function (k, v) { G.flag(k, v); };
  var say = function (t) { G.say(t); };
  function n() { return G.s.night; }
  function look(text, min) { return async function () { say(typeof text === 'function' ? text() : text); await G.spend(min || 1); }; }
  function tag(label) { return { label: label }; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ---------- Shared panels ---------- */
  function terminal(lines, buttons) {
    return G.panelP('Innkeeper 7', '<div class="term" role="log">' + lines.map(function (l) { return '<p>' + G.esc(l) + '</p>'; }).join('') + '</div>' +
      '<div class="col">' + buttons.map(function (b, k) { return '<button type="button" class="btn term-btn" data-k="' + k + '">' + G.esc(b.t) + '</button>'; }).join('') + '</div>', function (p) {
        p.el.querySelectorAll('.term-btn').forEach(function (b) { b.onclick = function () { A.sfx('click'); p.close(+b.dataset.k); }; });
      }, { cls: 'term-panel' });
  }
  function ledgerRows() {
    var s = G.s;
    var rows = Object.keys(G.SPACES).filter(function (k) { return s.meals.some(function (m) { return m.room === k; }); }).map(function (k) {
      var sp = G.SPACES[k], st, btn = '';
      if (s.inked[k] && !s.eaten[k]) st = '<span class="ink">In ink</span>';
      else if (!s.rec[k]) st = '<span class="dim">' + (sp.scene ? 'Not checked yet. Go and account for it first.' : 'Not on tonight\'s report yet.') + '</span>';
      else { st = s.eaten[k] ? '<span class="lost">Eaten</span>' : '<span class="dim">Checked, in pencil</span>'; btn = '<button type="button" class="btn small inkbtn" data-sp="' + k + '">' + (s.eaten[k] ? 'Write it back in ink' : 'Write in ink') + '</button>'; }
      return '<li><span class="lname">' + G.esc(G.cap(sp.name)) + '</span>' + st + btn + '</li>';
    });
    return '<ul class="lrows">' + rows.join('') + '</ul>';
  }
  /* The ledger. extra: [{k, t}] story buttons. Resolves with a story key or null. */
  function ledger(extra) {
    extra = extra || [];
    return new Promise(function (done) {
      var chosen = null;
      var p = G.panel('The ledger', '', { cls: 'ledger-panel', onClose: function () { done(chosen); } });
      function draw() {
        p.el.innerHTML = '<p class="flyleaf">Every room, every guest, every night. In ink.</p>' +
          (extra.length ? '<div class="col">' + extra.map(function (e) { return '<button type="button" class="btn primary story" data-k="' + e.k + '">' + G.esc(e.t) + '</button>'; }).join('') + '</div>' : '') +
          '<h3>Tonight\'s page</h3>' + ledgerRows() + '<p class="small">Writing a line takes 2 minutes. A room in ink is safe from the mirror tonight.</p>';
        p.el.querySelectorAll('.inkbtn').forEach(function (b) { b.onclick = async function () { if (G.busy2) return; G.busy2 = true; await G.inkSpace(b.dataset.sp); G.busy2 = false; if (p.root.isConnected) draw(); G.renderHud(); }; });
        p.el.querySelectorAll('.story').forEach(function (b) { b.onclick = function () { chosen = b.dataset.k; p.close(chosen); }; });
      }
      draw();
    });
  }
  G.ledger = ledger;
  async function account(sp, text) {
    if (G.s.rec[sp]) { say('Already accounted for. ' + text); await G.spend(1); return; }
    G.s.rec[sp] = true; A.sfx('scratch'); say(text + ' <strong>Accounted for.</strong> Now it can go in the ledger in ink.'); G.note('rec-' + sp, G.cap(G.SPACES[sp].name) + ': checked. Ink it at the desk.', 'pencil'); await G.spend(2);
  }
  var S = window.STORY = { f: f, fl: fl, say: say, n: n, look: look, tag: tag, sleep: sleep, terminal: terminal, ledger: ledger, account: account };

  /* ---------- Things that are the same every night ---------- */
  window.COMMON_HOTSPOTS = {
    lobby: [
      { id: 'mirrorGo', label: 'The mirror', r: [27, 5, 19.5, 76], go: 'mirror', cls: 'glassy' },
      { id: 'stairs', label: 'Grand staircase to the third floor', r: [51, 15, 15, 58], go: 'corridor' },
      { id: 'deskGo', label: 'The front desk', r: [66, 65, 34, 35], go: 'desk' },
      { id: 'trout', label: 'Stuffed lake trout', r: [75, 26, 13.5, 14], curio: true, act: look(function () { return n() === 2 && f('cough') ? 'Plaster dust has settled on the trout, who has taken it personally.' : 'A stuffed lake trout above the fireplace, wearing an expression of lifelong grievance. A wedding guest once asked if it was real or decorative. You said, "Both."'; }) },
      { id: 'window', label: 'Front windows', r: [0, 8, 12.5, 56], act: look('The lake is frozen out to the breakwater. The harbor light goes around and around over the ice like someone looking for their keys.') },
      { id: 'fire', label: 'Fireplace', r: [71, 43, 22, 23], act: look('A fireplace of pale stone, banked low. Four brass tulip lamps light the lobby. Three of them work, on this side.') }
    ],
    mirror: [
      { id: 'button', label: 'The worn acorn on the frame', r: [9.8, 62, 9.5, 19], act: async function () {
        var k = await G.choose('One acorn, lower left, knee height, is worn pale from a century of nervous thumbs. The staff call it the Button. You do not touch the Button.', ['Leave it alone', 'Touch it anyway']);
        if (k === 0) { say('Wise. Eleven years ago a new valet pressed it on a dare. The mirror took his index finger to the second knuckle, neat as a ticket punch, and returned it three nights later, still wearing his class ring.'); }
        else { A.sfx('stomach'); G.ripple(12, 900); say('Your thumb stops a hair from the wood. The air around the acorn shimmers, like a road in August. You think about nine fingers and a blackjack table in Carlton, and you put your hand in your pocket. Good choice.'); }
        if (n() === 3 && !G.s.curios.button3) { G.s.curios.button3 = 1; G.toast('Curiosity noticed (' + Object.keys(G.s.curios).length + ' of 3)', 'good'); }
        await G.spend(1);
      } },
      { id: 'towel', label: 'Folded towel with a gold mint', r: [38, 66, 33, 29], cls: 'glassy', act: look(function () { return n() === 3 && f('marisol') ? 'Marisol\'s towel, squared to the frame. You give it a mint and it knows it is a guest, not a thief. Select a gold mint and tap here to calm it.' : 'A folded white hand towel squared to the frame, with a gold-wrapped mint on top. Marisol does this. You have seen it a thousand times and never asked.'; }) },
      { id: 'backLobby', label: 'Step back into the lobby', r: [82, 70, 18, 30], go: 'lobby' }
    ],
    desk: [
      { id: 'bell', label: 'Service bell', r: [65, 63, 7.5, 12], act: async function () { A.sfx('chime'); say(n() === 3 ? 'Ding. Dash, under the bell stand across the lobby, says "Present" in his sleep.' : 'Ding. Across the lobby, from under the bell stand, comes a noise like a sleeping bag with opinions.'); await G.spend(1); } },
      { id: 'painting', label: 'Painting of the mirror', r: [28.5, 0, 23, 29], act: look('Teddy had the mirror painted for the brochure. The painter gave it a swirl in the middle. The staff agree he was being generous.') }
    ],
    corridor: [
      { id: 'd307', label: 'Room 307', r: [10, 3, 22, 90], act: look('Room 307. Vacant. Locked, tidy, and twelve feet from 311, the same as every pair of doors on three.') },
      { id: 'd311', label: 'Room 311', r: [52, 12, 12.9, 68], act: look('Room 311. A Do Not Disturb sign and the sound of someone sleeping the sleep of a person who paid the rack rate.') },
      { id: 'radiator', label: 'Radiator', r: [66.5, 53, 9.5, 22], act: async function () { A.sfx('rumble', 1); say('The radiator knocks, a long rolling clank that runs down through the floors like a rumor.'); await G.spend(1); } },
      { id: 'linenGo', label: 'Linen closet door', r: [75.5, 22.6, 6.3, 44], go: 'linen' }
    ],
    linen: [
      { id: 'bulb', label: 'Pull chain on the bulb', r: [63.5, 0, 3, 28], act: async function () { $('#stage').classList.add('flicker'); setTimeout(function () { var s = $('#stage'); if (s) s.classList.remove('flicker'); }, 900); say('Click. Click. The bulb flickers and decides to stay on. Marisol would want you to leave it the way you found it.'); await G.spend(1); } },
      { id: 'sachets', label: 'Lavender sachets', r: [11, 24, 16, 26], act: look('Marisol\'s lavender sachets, tucked between the towels. The whole third floor smells of them, and of radiator dust.') },
      { id: 'mop', label: 'Mop and bucket', r: [70, 30, 10, 65], act: look('A galvanized bucket and a mop. Not Aarne\'s. Aarne\'s bucket has seen things.') }
    ],
    office: [
      { id: 'window', label: 'Window', r: [10, 5, 12, 66], act: look('Snow coming sideways off the lake. Across the street the bait shop is dark.') },
      { id: 'bottle', label: 'Bottle of bourbon', r: [37.9, 68, 4.9, 18.8], act: look('Old Crow, slightly less full than last week. Teddy\'s creditors open at nine.') }
    ],
    basement: [
      { id: 'boilers', label: 'The boilers', r: [0, 0, 39, 94], act: look('Two great iron boilers squat in the dark like a pair of sleeping bulls, breathing. Somebody has to keep them company.') },
      { id: 'cot', label: 'The little room with the cot', r: [41, 15, 18.7, 66.8], curio: true, act: look('A narrow room with a cot, a hot plate, a transistor radio, and a row of wool shirts on nails. "How do you shave?" you asked once. "By feel," said Aarne. "Finns have very simple faces. Two directions. Up and down."') }
    ],
    jarroom: [
      { id: 'shelvesL', label: 'Shelves of jars', r: [0, 0, 23, 88], act: look('Ball and Kerr and Atlas, blue glass and clear. Some so full the bones inside have settled like cereal. Some hold one thing only: a key, a thimble, a dog tag.') },
      { id: 'shelvesR', label: 'More shelves of jars', r: [78, 0, 22, 55], act: look('The labels go from label-maker tape to typing to fountain pen to pencil on manila tags, the years running backward. 1988. 1971. 1950. 1933.') }
    ],
    laundry: [
      { id: 'washers', label: 'The front-loaders', r: [14, 2, 40, 54], act: look('The big front-loaders churn the Aurelian\'s sheets in gray water. One has a bad bearing and knocks, softly, once every revolution, like someone at a door who does not expect to be let in.') }
    ],
    room309: []
  };
  window.COMMON_DECOR = {
    corridor: function () {
      var h = '<span class="plate" style="left:19%;top:24.3%;width:4.1%;height:4.7%" aria-hidden="true">307</span><span class="plate" style="left:56.4%;top:31.2%;width:2.6%;height:3%" aria-hidden="true">311</span><span class="plate sm" style="left:77.3%;top:35%;width:2.8%;height:2.6%" aria-hidden="true">LINEN</span>';
      if (G.s.night >= 2 && f('door309')) h += '<span class="door309" aria-hidden="true"><span class="plate" style="left:36%;top:17%;width:28%;height:6%">309</span></span>';
      else h += '<span class="warmwall" aria-hidden="true"></span>';
      return h;
    },
    desk: function () { return f('ringing') ? '<span class="amber ring" aria-hidden="true">309</span>' : '<span class="amber" aria-hidden="true">' + (G.s.night === 3 ? '000' : '---') + '</span>'; }
  };
  G.COMMON_USE = function (h, sel) {
    if ((sel === 'shoe' || sel === 'mint') && /glassy/.test(h.cls || '')) return async function () { await G.feedMirror(sel); await G.spend(1); };
    return null;
  };
})();
