/* Night One: Night Audit. Free to play. From Chapter One. */
(function () {
  'use strict';
  var S = window.STORY, A = window.HotelAudio, f = S.f, fl = S.fl, say = S.say, look = S.look, tag = S.tag;
  var night1 = {
    title: 'Night Audit', free: true, games: ['ledger', 'catch', 'tongue'], start: 100, end: 360, startScene: 'desk', inv: ['pen', 'pencil'], curios: 3,
    meals: [{ room: 'linen', at: 140 }, { room: 'office', at: 205 }, { room: 'r419', at: 250 }],
    objectives: [
      { text: 'Run the night audit report on Innkeeper 7.', done: function () { return f('report'); } },
      { text: 'Find the room that does not add up. Compare the books at the ledger. You need Marisol\'s housekeeping sheet from the third-floor linen closet.', done: function () { return f('found309'); } },
      { text: 'Go up to the third floor and look at where 309 should be.', done: function () { return f('wall309'); } },
      { text: 'Check the card on file for 309, and work out whose address it is.', done: function () { return f('address'); } },
      { text: 'Be by the mirror in the lobby at 2:51.', done: function () { return f('belch'); } },
      { text: 'Write the third floor into the ledger, in ink.', done: function () { return f('inked309'); } },
      { text: 'Put the ledger back in the glass cabinet.', done: function () { return f('shelved'); } }
    ],
    intro: async function () {
      await G.talk([
        'The mirror in the lobby of the Hotel Aurelian belches at 2:51 every morning, give or take a minute. You are Agnes Szabo, night auditor, and you long ago learned to schedule the audit around it.',
        ['agnes', 'Tonight there is a different problem. The Aurelian has one hundred and twelve rooms, and I can account for one hundred and eleven of them.'],
        'Tap the glowing spots to look and act. Walk with the doorway buttons under the picture. Every move costs minutes. The steno pad at the top keeps the plan.',
        'And mind the mirror. It eats what the hotel stops keeping track of.'
      ]);
      say('The front desk. Innkeeper 7 hums its note below B-flat. Start with the report.');
    },
    blockExit: function (to) { if (to === 'basement') return 'The service door is Aarne\'s. You have been down a dozen times in eleven years, always in daylight. Not tonight.'; if (to === 'room309' || to === 'jarroom' || to === 'laundry') return 'hide'; return null; },
    sceneGone: function (id) { if (id === 'room309' || id === 'jarroom' || id === 'laundry' || id === 'basement') return 'hide'; return null; },
    events: [{ id: 'belch', at: 171, run: function () { return belch1(); } }],
    onEnter: async function (to) {
      if ((to === 'lobby' || to === 'mirror') && f('belchMissed') && !f('belch')) await aarne1(true);
    },
    hotspots: {
      desk: [
        { id: 'innkeeper', label: 'Innkeeper 7, the front desk computer', r: [0, 22, 26, 54], goal: function () { return !f('report') || !f('sawCard') || (f('sawAddress') && !f('address')); }, act: innkeeper1 },
        { id: 'ledger', label: 'The ledger', r: [25.6, 64, 36.5, 25], goal: function () { return (!f('found309') && G.has('hksheet')) || (f('belch') && !f('inked309')); }, act: ledger1 },
        { id: 'phone', label: 'The house telephone', r: [48, 50.5, 18, 19], act: look('The house line. The little amber display is dark. It is quiet, for now.') },
        { id: 'cabinet', label: 'Glass cabinet of ledgers', r: [66.5, 0, 33.5, 62], goal: function () { return f('inked309') && !f('shelved'); }, act: cabinet1 },
        { id: 'steno', label: 'Steno pad', r: [72.5, 68, 18, 12], act: async function () { G.openNotes(); } }
      ],
      lobby: [
        { id: 'bellstand', label: 'The bell stand (Dash is under it)', r: [10, 46, 11, 41], act: dash1 }
      ],
      mirror: [
        { id: 'glass', label: 'The glass', r: [22.5, 0, 57.6, 60], cls: 'glassy', act: async function () {
          if (G.s.t >= 160 && G.s.t < 171 && !f('belch')) { say('The clock over the desk says ' + G.fmt(G.s.t) + '. The bottom corner of the frame sits flush against the newel post, as if the two had grown together. There used to be marble between them. Stay here. Use Wait.'); await G.spend(1); return; }
          say('In the other lobby, the other Agnes works too: a small dark-haired woman in a navy blazer with a pencil behind her ear. Even her brass badge is faithful to the last scratch, except over there it reads the wrong way round: <em>SENGA</em>. On slow nights you think it sounds like the name of a much more competent woman.'); await G.spend(1);
        } }
      ],
      corridor: [
        { id: 'wall309', label: 'The wall between 307 and 311', r: [33.7, 8, 18, 74], goal: function () { return !f('wall309'); }, act: wall1 },
        { id: 'photo', label: 'Framed photograph, 1912 staff picnic', r: [66.9, 24.3, 7.5, 18.4], curio: true, act: look('The 1912 staff picnic: sixty people squinting at the lake. In the back row, leaning on a log pike, a boy with ears like the handles of a sugar bowl.') },
        { id: 'evac', label: 'Fire evacuation map', r: [90.3, 32, 9.7, 13.4], act: async function () { fl('sawAddress'); say('Printed in 1994, laminated, bolted to the wall. Third floor, odd numbers, lake side: 305, 307, 311. No 309, and no gap. In the corner, in small type: <strong>Hotel Aurelian, 309 Lake Avenue, Iron Harbor.</strong>'); G.note('addr', 'The hotel\'s own address: 309 Lake Avenue.', 'pencil'); await G.spend(1); } }
      ],
      linen: [
        { id: 'clip', label: 'Clipboard with the housekeeping sheet', r: [37.6, 68, 21.5, 19], goal: function () { return !G.has('hksheet') && !f('found309'); }, act: async function () {
          if (G.has('hksheet') || f('found309')) { say('The clipboard is empty. You took the sheet.'); return; }
          G.give('hksheet'); say('Marisol\'s housekeeping sheet: every room with its letter in green felt-tip. C for clean, O for occupied, D for due out. Third floor: 305, 307, 311. Her hand has simply stepped over 309, as if over a puddle.'); await G.spend(1);
        } },
        { id: 'towels', label: 'Count the towels (account for the closet)', r: [11, 52, 26, 46], goal: function () { return !G.s.rec.linen; }, act: function () { return S.account('linen', 'Forty-one bath towels, forty-one hand towels, one lavender sachet that has seen better decades. It matches the inventory.'); } },
        { id: 'mints', label: 'Bowl of gold mints', r: [27, 37, 11.5, 16], act: look('A glass bowl of gold-foil mints. They are for the towel by the mirror. Marisol has never explained, and you have never asked.') }
      ],
      office: [
        { id: 'augustin', label: 'Portrait of Augustin Brandt (account for the office)', r: [35.6, 2.6, 28.3, 65], goal: function () { return !G.s.rec.office; }, act: function () { return S.account('office', 'Augustin Brandt built the hotel in 1904 on money made from turning most of the county\'s forest into other people\'s houses. One hand on a ledger. You straighten the frame and check the room against the inventory: one portrait, one Ottilie, one desk, one bottle.'); } },
        { id: 'ottilie', label: 'Oval portrait of Ottilie Brandt', r: [73.7, 19, 13.2, 34], curio: true, act: look('Ottilie Brandt, pale and narrow in high-necked black, looking not at the painter but slightly past him, at something over his left shoulder that she did not care for.') },
        { id: 'envelopes', label: 'Bank envelopes', r: [45.5, 80, 20.5, 10], act: async function () { fl('sawAddress'); say('Bank envelopes, several stamped FINAL NOTICE, all addressed to <strong>Hotel Aurelian, 309 Lake Avenue, Iron Harbor, Minnesota.</strong>'); G.note('addr', 'The hotel\'s own address: 309 Lake Avenue.', 'pencil'); await G.spend(1); } }
      ]
    }
  };
  async function innkeeper1() {
    var k = await S.terminal(['INNKEEPER 7  NIGHT AUDIT', 'PROPERTY: HOTEL AURELIAN', 'ROOMS: 112', 'TIME: ' + G.fmt(G.s.t)], [{ t: f('report') ? 'Print the report again' : 'Run the night audit report' }, { t: 'Card on file: Room 309' }, { t: 'Log off' }]);
    if (k === 0) {
      A.sfx('whirr');
      await S.terminal(['NIGHT AUDIT REPORT', '301  HAUGEN', '303  VACANT', '305  OYELARAN (2)', '307  VACANT', '309  PELL, CONSTANCE (1)  ARR 3/9  DEP 3/12', '311  OCC', '402  KOWALCZYK', '407  HIBBING WEDDING (DND)', '419  OUT OF ORDER (RADIATOR)', '528  VACANT', 'ROOMS ACCOUNTED: 111 OF 112'], [{ t: 'Tear off the printout' }]);
      if (!f('report')) { await G.playGame('ledger', { lead: 'The printout curls off Innkeeper 7 still warm. Before the rooms go in the book, the charges have to balance to the penny. Tick off slips until they add up exactly to the total.' }); fl('report'); ['r419', 'r402', 'r407', 'r528'].forEach(function (r) { G.s.rec[r] = true; }); G.note('report', 'Innkeeper: 111 of 112 rooms accounted. Room 309 says occupied: Pell, Constance.', 'pencil'); }
      say('One hundred and eleven of one hundred and twelve. Innkeeper does what it has always done, slowly, and it does not lie. Guest rooms on the report can now go in the ledger in ink.'); await G.spend(3);
    } else if (k === 1) {
      await S.terminal(['ROOM 309  PELL, CONSTANCE', 'RATE $139.00 + TAX', 'CARD ON FILE: VISA ENDING 4417', 'BILLING: 309 LAKE AVENUE', '         IRON HARBOR, MINNESOTA'], [{ t: 'Close' }]);
      fl('sawCard');
      if (!f('address')) {
        if (!f('sawAddress')) { G.note('card', 'Card on file for 309 bills to 309 Lake Avenue. That address is familiar. Find something with the hotel\'s own address on it.', 'pencil'); say('309 Lake Avenue. You know that address from somewhere. Find something with the hotel\'s street address printed on it: an envelope in the office, a map upstairs.'); }
        else {
          var a = await G.choose('Card on file for 309 bills to 309 Lake Avenue. Whose address is that?', ['A house in town, the guest\'s own', 'The bait shop on Third Street', 'The Aurelian\'s own address']);
          if (a === 2) { fl('address'); A.sfx('good'); G.note('addr2', 'Billing address for 309 is the hotel itself. The guest is billing the building.', 'ink'); say('The Aurelian\'s street address is 309 Lake Avenue. You can remember the evening she checked in, but not her. No face, no coat. Only a cold smell, like the inside of a church in winter, and a voice: <em>I\'ll only need the one key.</em>'); }
          else { A.sfx('bad'); say('No. Look again at what you found. The number on the envelope and the map is the same as the room.'); }
        }
      }
      await G.spend(2);
    }
  }
  async function ledger1() {
    var extra = [];
    if (!f('found309')) extra.push({ k: 'compare', t: 'Compare the books for the third floor' });
    if (f('belch') && !f('inked309')) extra.push({ k: 'ink309', t: 'Write the third floor in ink' });
    var k = await S.ledger(extra);
    if (k === 'compare') await compare1();
    if (k === 'ink309') await inkThird();
  }
  async function compare1() {
    if (!f('report')) { say('You need tonight\'s report from Innkeeper 7 in front of you first.'); return; }
    if (!G.has('hksheet')) { say('You need Marisol\'s housekeeping sheet to compare against. The copies live on her cart in the third-floor linen closet.'); G.note('needsheet', 'Get Marisol\'s housekeeping sheet from the linen closet on three.', 'pencil'); return; }
    var rows = [['301', 'HAUGEN', 'Haugen', 'O'], ['303', 'VACANT', 'vacant', 'C'], ['305', 'OYELARAN (2)', 'Oyelaran, 2', 'O'], ['307', 'VACANT', 'vacant', 'C'], ['309', 'PELL, C. (1)', 'Pell, C.', ''], ['311', 'OCC', 'occ.', 'O']];
    var k = await G.panelP('Compare the books', '<p>Tap the room where the three sources do not agree.</p><table class="cmp"><caption class="sr-only">Third floor, lake side</caption><thead><tr><th scope="col">Room</th><th scope="col">Innkeeper</th><th scope="col">Ledger</th><th scope="col">Housekeeping</th></tr></thead><tbody>' +
      rows.map(function (r) { return '<tr><th scope="row"><button type="button" class="btn small rowpick" data-room="' + r[0] + '">' + r[0] + '</button></th><td>' + r[1] + '</td><td class="hand">' + r[2] + '</td><td class="green">' + (r[3] || '<span class="sr-only">not listed</span>') + '</td></tr>'; }).join('') + '</tbody></table><p id="cmpMsg" class="small" role="status"></p>', function (p) {
        p.el.querySelectorAll('.rowpick').forEach(function (b) { b.onclick = function () { if (b.dataset.room === '309') { A.sfx('good'); p.close('309'); } else { A.sfx('bad'); p.el.querySelector('#cmpMsg').textContent = 'Room ' + b.dataset.room + ' agrees in all three. Look for a line one of them skips.'; } }; });
      });
    if (k === '309') {
      fl('found309'); G.take('hksheet');
      say('There it is. Innkeeper says 309 is occupied. Your ledger says <em>Pell, C. 309</em>, in your own little fence posts. Marisol\'s sheet goes 305, 307, 311, with no 309 and no gap. You write it down in pencil, because pencil is for questions: <em>309: HK sheet omits. Check.</em>');
      G.note('309', '309: HK sheet omits. Check.', 'pencil'); A.sfx('scratch'); await G.spend(3);
    }
  }
  async function wall1() {
    if (!f('found309') && !f('report')) { say('Green stripe, one sconce burning a little yellower than the others. Nothing wrong with it that you can name. Yet.'); await G.spend(1); return; }
    if (f('wall309')) { A.sfx('stomach'); say('Body-warm, faintly tacky, like the inside of a wrist. Under the ticking of the building, a stomach, somewhere, working.'); await G.spend(1); return; }
    var lines = ['301. 303. 305. 307. 311.', 'Between 307 and 311 there is wall: green stripe, one sconce, no seam, no patch. The sconce is burning a little yellower than the others.'];
    if (f('dashWith')) lines.push(['dash', 'Huh. It\'s... it\'s the next one.'], ['agnes', 'That\'s 311.'], ['dash', 'Yeah, but before that.'], 'Dash turns in a slow circle, filming. "Okay," he says. "Okay. This is actually good."');
    await G.talk(lines);
    var k = await G.choose('You lay your palm on the wallpaper.', ['Put your ear to it', 'Knock']);
    if (k === 1) { A.sfx('rumble', 0.5); await G.talk(['You knock. The wall does not knock back. It feels, absurdly, as if it would like to.', 'You put your ear to it instead, feeling foolish.']); }
    A.sfx('stomach'); G.shake();
    await G.talk(['It is warm. Not radiator-warm. Body-warm, and faintly tacky, like the inside of a wrist.', 'Under the ticking and settling of the building, very faint, a sound you know from every long meeting of your adult life: a stomach, somewhere, working.', 'You take your ear away and wipe it on your sleeve.']);
    fl('wall309'); G.note('wall', 'Third floor: where 309 should be there is warm wall. It is digesting.', 'pencil');
    if (f('dashWith') && !G.has('phone')) { G.give('phone'); await G.talk([['dash', 'Hold my phone, I need both hands to process this. Actually keep it. If someone\'s dead I\'m allowed to film it. It\'s in my contract.'], ['agnes', 'You don\'t have a contract.'], ['dash', 'It\'s implied.']]); }
    await G.spend(4);
  }
  async function dash1() {
    if (f('dashSick')) { say('Dash has fallen asleep under the bell stand with his phone on his chest and no memory, already, of the umbrella stand.'); return; }
    if (f('dashWith')) { say('Dash is with you, on what he insists is a union break.'); return; }
    await G.talk([['agnes', 'Dash.'], 'From under the bell stand comes a noise like a sleeping bag with opinions.', ['agnes', 'Dashiell.'], ['dash', 'I\'m on break.'], ['agnes', 'You\'ve been on break since midnight.'], ['dash', 'It\'s a union break.'], ['agnes', 'We don\'t have a union.'], ['dash', 'That\'s why it has to be so long.']]);
    var k = await G.choose('Dash Kopp unfolds himself from the floor. Nineteen, six-foot-three, and made mostly of wrists.', ['"Do you remember 309?"', '"Never mind. Go back to sleep."'], 'dash');
    if (k === 0) { await G.talk([['dash', 'Remember it how? It\'s on three. Between 307 and 311.'], ['agnes', 'Walk up with me.'], ['dash', 'Is someone dead? If someone\'s dead I\'m allowed to film it.']]); fl('dashWith'); say('Dash will come with you to the third floor.'); }
    else say('Dash folds back down like a deck chair.');
    await G.spend(2);
  }
  async function belch1() {
    var here = G.s.scene === 'lobby' || G.s.scene === 'mirror';
    if (!here) { G.belchFx(1.4); fl('belchMissed'); G.toast('2:51. From far off, a long, wet, baritone belch comes up through the radiators. The lobby. Aarne will be on his way with the bucket.', 'big'); G.note('missed', 'Missed the 2:51 belch. Get to the lobby.', 'pencil'); return; }
    if (G.s.scene !== 'mirror') { G.s.scene = 'mirror'; G.render(); }
    await G.talk(['2:51. It begins in the radiators. Every pipe in the building knocks at once. Then the glass moves. Not the frame. The glass. It bellies outward, very slightly, the way skin forms on hot milk.']);
    G.belchFx(2.2);
    await S.sleep(900);
    G.spit([{ img: 'keytag' }, tag('jawbone, three gold crowns'), tag('pearls on vertebrae'), tag('one lens')]);
    await G.talk(['Then the mirror belches. Long and wet and baritone, the belch of a man who has eaten an entire Thanksgiving by himself and would like the room to know. The tulip lamps shiver. The trout, you would swear, looks away.',
      'Out of the bottom of the glass at knee height skitters a brass key tag. Then, with a sound like someone spitting out a cherry stone, a human jawbone, which spins twice and comes to rest face-up beneath the trout. Then, almost delicately, a string of pearls threaded through a short run of vertebrae, like a necklace wearing a necklace.',
      'The mirror gives a final small cough, polite, into its napkin.']);
    if (f('dashWith')) { fl('dashSick'); await G.talk(['Dash throws up into the umbrella stand.']); }
    await aarne1(false);
  }
  async function aarne1(late) {
    fl('belch');
    var L = [];
    if (late) L.push('The leftovers are still on the marble: a brass key tag, a jawbone with three gold crowns, pearls threaded on vertebrae, one lens.');
    L.push('The service door beside the fireplace opens, and the caretaker comes through with a galvanized bucket, a long-handled dustpan, rubber gloves to the elbow, and a label maker hanging from a lanyard around his neck like a crucifix.');
    if (f('dashSick')) L.push(['aarne', 'Good. Better there than on the marble.']);
    L.push(['aarne', late ? 'Big one. You missed the show.' : 'Big one.'], ['agnes', 'It\'s 309.'], 'He crouches and lifts the jawbone and turns it under the lamp. Three gold crowns glint at the back.', ['aarne', 'Somebody paid a lot for these. Name?']);
    await G.talk(L);
    if (!f('gCatch')) {
      fl('gCatch');
      await G.talk([['aarne', 'Bucket. Quick. It\'s not done.'], 'The glass bellies out again. Something else is coming up.']);
      await G.playGame('catch', { lead: 'The mirror is not finished. It is belching up everything it could not digest, and Aarne is holding out the bucket. Catch every leftover. Dodge the green goo.' });
    }
    while (true) {
      var k = await G.choose('Aarne waits, label maker ready.', ['"Haugen. 301."', '"Pell. Constance. She\'s in the book."', '"I don\'t know her."'], 'aarne');
      if (k === 1) break;
      A.sfx('bad');
      if (k === 0) await G.talk([['aarne', 'Haugen\'s snoring in 301. I heard him on the stairs. Key tag says 309.']]);
      else await G.talk([['aarne', 'Then she goes on the shelf for nobody. Check the book. The book knows.'], 'The book does know. Your own handwriting: Pell, C. 309.']);
    }
    A.sfx('whirr');
    await G.talk([['aarne', 'Then she goes in a jar.'], 'The label maker whirs. He presses the strip onto a freezer bag with his thumb: PELL C / 309 / 3-11. The jaw goes in, then the pearls, then the lens, then the key tag.', ['aarne', 'In the book, in the jar. Otherwise nobody remembers.'], ['agnes', 'Aarne, where\'s the rest of her?'], ['aarne', 'Still in there. It\'s slow. Like a snake with a goat.'],
      'He kneels in front of the glass, pushes back his sleeve, and puts his arm into it. The mirror takes him to the elbow with a sound like a boot pulling out of mud. He feels around with the face of a plumber working a drain.',
      'Out comes a single sensible black shoe, laces still tied, dripping something that is not water. When he draws his hand free, the glass flinches away from his glove like a cat offered a pill.',
      ['aarne', 'Chokes on shoes. Always has. Here. Hang on to that. Set it at the glass and it\'ll gag on the next thing it tries to eat.'], ['agnes', 'Why won\'t it eat you?'], ['aarne', 'Doesn\'t like the taste.'], 'He peels off his gloves, not looking at you.', ['aarne', 'It knows where I\'ve been.']]);
    G.give('shoe'); G.note('jar', 'PELL C / 309 / 3-11. In the book, in the jar.', 'ink'); G.note('aarne', 'Why won\'t it eat Aarne? "It knows where I\'ve been."', 'pencil');
    if (!f('gTongue')) {
      fl('gTongue');
      await G.talk(['The mirror smacks its lips. Its tongue, long and pink and very interested, slides out across the marble between you and the front desk.', ['aarne', 'Don\'t let it lick you. Step when it\'s looking the other way.']]);
      await G.playGame('tongue');
    }
    say('At three-thirty you do the only thing you know how to do, which is the audit. Back to the ledger.');
  }
  async function inkThird() {
    if (!f('report')) { say('Run the report first so you have the night\'s guests in front of you.'); return; }
    var lines = [['301', 'Haugen'], ['303', 'vacant'], ['305', 'Oyelaran, two guests'], ['307', 'vacant']];
    var tokens = ['Oyelaran, two guests', 'vacant', 'Haugen', 'Pell, C. One guest.'];
    await G.panelP('Write the rooms, in ink', '<div class="page"><p class="flyleaf">Every room, every guest, every night. In ink.</p><ol class="inklines" id="inkLines"></ol><p class="small" id="inkPrompt" role="status"></p><div class="row" id="inkTokens"></div></div>', function (p) {
      var i = 0, ol = p.el.querySelector('#inkLines'), pr = p.el.querySelector('#inkPrompt'), tk = p.el.querySelector('#inkTokens');
      function draw() {
        ol.innerHTML = lines.map(function (l, k) { return '<li class="' + (k < i ? 'inked' : (k === i ? 'cur' : '')) + '"><span class="rn">' + l[0] + ',</span> ' + (k < i ? '<span class="hand">' + l[1] + '</span>' : '') + '</li>'; }).join('');
        if (i >= lines.length) { tk.innerHTML = ''; pr.textContent = ''; setTimeout(function () { p.close(true); }, 500); return; }
        pr.textContent = 'Room ' + lines[i][0] + ': what goes on the line?';
        tk.innerHTML = tokens.map(function (t) { return '<button type="button" class="btn tok">' + G.esc(t) + '</button>'; }).join('');
        tk.querySelectorAll('.tok').forEach(function (b) { b.onclick = function () { if (b.textContent === lines[i][1]) { A.sfx('scratch'); i++; draw(); } else { A.sfx('bad'); pr.textContent = 'That is not what Innkeeper says for ' + lines[i][0] + '. Your fence posts do not lie.'; } }; });
        var fb = tk.querySelector('.tok'); if (fb) fb.focus();
      }
      draw();
    }, { noClose: true });
    await G.spend(4);
    while (true) {
      var k = await G.choose('Your pen hovers. A thought comes in a calm, clear voice that sounds exactly like your own: you could leave it out. The simplest thing, the auditor\'s thing, would be to write 311 next and let the page close over the gap like water.', ['Write 311 next', 'Write 309. Pell, C. One guest.']);
      if (k === 1) break;
      A.sfx('gulp'); G.ripple(16, 1200);
      await G.talk(['The nib touches the paper. Across the lobby, very softly, something smacks its lips.', 'You think of the jawbone spinning on the marble. The three gold crowns. <em>Somebody paid a lot for these.</em> You lift the pen.']);
    }
    A.sfx('scratch');
    await G.talk(['<em>309,</em> you write. <em>Pell, C. One guest.</em>']);
    A.sfx('hiccup'); G.ripple(18, 1000);
    await G.talk(['Across the lobby, the mirror hiccups, small and startled, like someone caught with food in their teeth. A single pearl rolls out and comes to rest against Aarne\'s boot.', 'In the reflection, one of the tulip lamps flickers and steadies: the one that does not work on this side.', 'Aarne looks at the pearl, then at you, with an expression you have never seen on him and cannot read. He bags the pearl.', ['aarne', 'Good. Keep doing that.']]);
    fl('inked309'); G.note('ink309', '309. Pell, C. One guest. In ink. The mirror hiccuped. Ink brings things back.', 'ink');
    say('Ink brings things back. Remember that if the mirror eats a room you have checked. At ten past four, the ledger goes back in its cabinet.');
    await G.spend(3);
  }
  async function cabinet1() {
    if (!f('inked309')) { say('A hundred and twenty-two years of ledgers, oxblood leather with the years stamped in gold, growing cheaper down the shelves until the modern ones, which are, frankly, vinyl.'); await G.spend(1); return; }
    A.sfx('page');
    await G.talk(['You slide this year\'s ledger into place and are closing the glass when you notice the gap.', 'Top shelf. Between 1911 and 1913. Exactly the width of a book, and at the back of it a paler rectangle of wood where no light has fallen for a long time.', 'You have dusted this cabinet every Sunday for eleven years. You would have sworn there was never a gap on the top shelf.']);
    G.note('1912', 'What happened in 1912? The ledger is missing.', 'pencil');
    fl('shelved');
    await G.talk([['agnes', 'Aarne. What happened in 1912?'], 'He stops at the service door with his back to you.', ['aarne', 'Lot of things. Titanic.'], 'And he goes down the stairs to the basement, and the door sighs shut behind him.']);
    G.s.scene = 'mirror'; G.render();
    await G.talk(['The lobby is quiet. In the mirror, the other lobby lies quiet too, a little darker, a little deeper, all four lamps lit.', 'The other front desk is empty. You look at the place where you should be, and see the cabinet, and the glass, and no one.', 'Then the other Agnes comes up the stairs. Not down. Up: from below the bottom step, from a floor the Aurelian does not have. She carries an oxblood ledger under one arm, the gold on its spine still bright.']);
    G.s.scene = 'desk'; fl('ringing'); G.render(); A.sfx('ring', 2); G.shake();
    await G.talk(['Behind the real desk, the telephone rings. The old double burr of the house line. The little amber display lights up with the number of the room that is calling.', '<strong>309.</strong>', 'In the mirror, the other Agnes lifts her head, and smiles, and puts her own receiver to her ear, and waits for you to pick up.']);
    await G.completeNight();
  }
  window.NIGHTS = window.NIGHTS || {}; window.NIGHTS[1] = night1;
})();
