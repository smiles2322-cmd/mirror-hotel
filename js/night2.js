/* Night Two: The Other Line. For book owners. From Chapter Two. */
(function () {
  'use strict';
  var S = window.STORY, A = window.HotelAudio, f = S.f, fl = S.fl, say = S.say, look = S.look;
  var night2 = {
    title: 'The Other Line', games: ['otherline', 'switchboard', 'cough'], start: 252, end: 480, startScene: 'desk', inv: ['pen', 'pencil', 'shoe'], curios: 3,
    meals: [{ room: 'linen', at: 300 }, { room: 'office', at: 340 }, { room: 'r528', at: 378 }, { room: 'r407', at: 425 }],
    objectives: [
      { text: 'Answer the house line. Room 309 is calling.', done: function () { return f('call'); } },
      { text: 'Call the basement on extension zero.', done: function () { return f('called0'); } },
      { text: 'Write down what happened, and write her name where you will see it. Steno pad, front desk.', done: function () { return f('wrist'); } },
      { text: 'Wait for dawn. Something will happen on three.', done: function () { return f('cough'); } },
      { text: 'Go up to Room 309 and pick up what the mirror could not keep down.', done: function () { return G.has('glove') && G.has('hatpin'); } },
      { text: 'Listen at the wall of 309, and tell Dash who is in there.', done: function () { return f('toldDash'); } },
      { text: 'Close out the night on Innkeeper 7 without letting her go.', done: function () { return f('noVoid'); } },
      { text: 'Write one last line in the ledger.', done: function () { return f('stillIn'); } },
      { text: 'Look in the mirror and count the shoes.', done: function () { return f('shoes'); } }
    ],
    setup: function () { fl('ringing'); ['r419', 'r402', 'r407', 'r528'].forEach(function (r) { G.s.rec[r] = true; }); },
    intro: async function () {
      A.sfx('ring', 2);
      await G.talk(['It rings a third time.', 'You have answered that telephone for eleven years. For a man in 412 who wanted to know whether the lake was "the big one." For a woman in 220 chasing a bat around the bathroom with a hair dryer. You have never let it ring four times. Four rings is a failure of service.', 'The amber display says 309.']);
      say('The house line is ringing. Pick up.');
    },
    wrist: function () { return f('wrist') ? 'CONSTANCE PELL 309' : '<span class="dim">Nothing yet.</span>'; },
    blockExit: function (to) {
      if (to === 'basement') return 'The service door is Aarne\'s, and Aarne is answering the phone when he feels like it. Not tonight.';
      if (to === 'room309' && !f('door309')) return 'hide';
      if (to === 'jarroom' || to === 'laundry') return 'hide';
      if (to !== 'desk' && !f('call')) return 'The house line is ringing. Four rings is a failure of service.';
      return null;
    },
    sceneGone: function (id) { if (id === 'jarroom' || id === 'laundry' || id === 'basement') return 'hide'; if (id === 'room309' && !f('door309')) return 'hide'; return null; },
    events: [{ id: 'cough', at: 405, run: async function () {
      fl('cough'); A.sfx('cough'); G.shake(true);
      await G.talk(['Dawn comes up over Superior the way it does in March, reluctantly, like someone called in to cover a shift.', 'The building coughs. It comes down through the radiators like the first cough of a man who has smoked since the Eisenhower administration. Every pipe on the lake side knocks twice. Plaster dust sifts down onto the trout, who takes it personally.',
        'The service door opens. Aarne comes through with his bucket and mop, already walking, as though he had been waiting on the stairs for his cue.', ['aarne', 'That\'ll be 309.'], 'Under the bell stand, Dash sits up, hits his head, and lies back down.', ['dash', 'Why do I have a video of a wall?']]);
      fl('door309'); G.note('door', '6:45. The building coughed. "That\'ll be 309."', 'pencil'); say('Third floor. Go.');
    } }],
    hotspots: {
      desk: [
        { id: 'phone', label: 'The house telephone', r: [48, 50.5, 18, 19], goal: function () { return !f('call') || !f('called0'); }, act: phone2 },
        { id: 'steno', label: 'Steno pad (incidents)', r: [72.5, 68, 18, 12], goal: function () { return f('called0') && !f('wrist'); }, act: steno2 },
        { id: 'innkeeper', label: 'Innkeeper 7, the front desk computer', r: [0, 22, 26, 54], goal: function () { return G.has('glove') && !f('noVoid'); }, act: innkeeper2 },
        { id: 'ledger', label: 'The ledger', r: [25.6, 64, 36.5, 25], goal: function () { return f('noVoid') && !f('stillIn'); }, act: async function () {
          var k = await S.ledger(f('noVoid') && !f('stillIn') ? [{ k: 'last', t: 'Write under the total line' }] : []);
          if (k === 'last') { A.sfx('scratch'); fl('stillIn'); await G.talk(['Under the blot, below the total line, where there is no line at all, you write in ink, in your little fence posts:', '<em>309. Pell, C. One guest. Still in house.</em>', 'Across the lobby, the mirror gives off its faint steady warmth, like a sleeping dog, or a stomach after a large meal.']); say('One more thing. The mirror. Look closely.'); await G.spend(2); }
        } },
        { id: 'cabinet', label: 'Glass cabinet of ledgers', r: [66.5, 0, 33.5, 62], act: look('The gap on the top shelf between 1911 and 1913 is still there, exactly the width of a book.') }
      ],
      lobby: [
        { id: 'bellstand', label: 'The bell stand', r: [10, 46, 11, 41], act: look(function () { return f('cough') ? 'Dash holds his phone over his face. "It is good," he says, troubled. "Why don\'t I remember making it? It\'s the best thing I\'ve ever made."' : 'Dash is asleep under the bell stand, with his phone on his chest.'; }) }
      ],
      mirror: [
        { id: 'glass', label: 'The glass', r: [22.5, 0, 57.6, 60], cls: 'glassy', goal: function () { return f('stillIn') && !f('shoes'); }, act: glass2 }
      ],
      corridor: [
        { id: 'wall309', label: function () { return f('door309') ? 'The door of 309' : 'The wall between 307 and 311'; }, r: [33.7, 8, 18, 74], act: async function () {
          if (!f('door309')) { A.sfx('stomach'); say('Warm wallpaper. Faintly, a stomach, working. Not yet. Dawn first. Use Wait.'); await G.spend(1); return; }
          say('The wallpaper between 307 and 311 has gone dark and swollen, and down the middle of the swelling runs a door: oak, six-paneled, brass numerals. <em>309</em>. Condensation beads on the numerals. It stands open a hand\'s width, as if its guest just stepped out for ice. Use the Room 309 button to go in.'); await G.spend(1);
        } },
        { id: 'photo', label: 'Framed photograph, 1912 staff picnic', r: [66.9, 24.3, 7.5, 18.4], act: look('The 1912 staff picnic. Sixty people squinting at the lake, and a boy at the back with a log pike.') }
      ],
      room309: [
        { id: 'hat', label: 'Dove-gray felt hat with a pearl hatpin', r: [39, 58, 15, 22], goal: function () { return !G.has('hatpin'); }, act: async function () {
          if (G.has('hatpin')) { say('The hat, without its pin. The kind your grandmother wore to funerals and to the bank.'); return; }
          G.give('hatpin'); await G.talk(['A small woman\'s hat of dove-gray felt, with a narrow brim and a grosgrain band, stuck through the crown with a long pin tipped by a pearl.', ['aarne', 'Pin\'s steel. Chokes on pins.']]); await G.spend(1);
        } },
        { id: 'glove', label: 'One gray kid glove', r: [52.5, 77, 11, 13], goal: function () { return !G.has('glove'); }, act: async function () {
          if (G.has('glove')) return;
          G.give('glove'); await G.talk(['One glove. Gray kid, left hand, the fingers curled a little, as though it had just let go of something. A key, say.', 'Aarne lifts it on two fingers and turns back the cuff. On the lining, someone long ago wrote a laundry mark in ink, faded to the brown of weak tea: <em>C. PELL</em>.', ['aarne', 'There\'s your why. Ink. Can\'t get it down.'], 'You put your hand in the glove before you can think about it. It is warm inside. Warm the way a glove is warm when a hand has just come out of it.']); await G.spend(2);
        } },
        { id: 'ribs', label: 'The ribbed wall facing the lake', r: [86, 0, 14, 75], goal: function () { return G.has('glove') && !f('toldDash'); }, act: ribs2 },
        { id: 'window309', label: 'The window', r: [59.4, 7, 15.3, 40], curio: true, act: look('Gray lake light. There is no framed print of the Split Rock lighthouse, which hangs in every other room in the building and which Marisol says she dusts in her sleep.') },
        { id: 'puddle', label: 'The water on the floor', r: [62, 58, 14, 36], act: look('In the wet square of window light on the floor, very faint, is a reflection of the room: the window, the doorway, Dash in it, filming, and you. Aarne is mopping right through it. He is not in it.') }
      ],
      office: [
        { id: 'augustin', label: 'Portrait of Augustin Brandt (account for the office)', r: [35.6, 2.6, 28.3, 65], goal: function () { return !G.s.rec.office; }, act: function () { return S.account('office', 'Augustin, one hand on a ledger. One portrait, one Ottilie, one desk, one bottle.'); } },
        { id: 'mug', label: 'Coffee mug', r: [32.2, 79.9, 5.9, 8.9], curio: true, act: look('A mug that says WORLD\'S OKAYEST BOSS, which Dash gave Teddy at Christmas. It has left a ring on a bank envelope.') },
        { id: 'ottilie', label: 'Oval portrait of Ottilie Brandt', r: [73.7, 19, 13.2, 34], act: look('Ottilie, still looking at something over the painter\'s left shoulder that she did not care for.') }
      ],
      linen: [
        { id: 'towels', label: 'Count the towels (account for the closet)', r: [11, 52, 26, 46], goal: function () { return !G.s.rec.linen; }, act: function () { return S.account('linen', 'Forty-one and forty-one. The sachets are where Marisol left them.'); } },
        { id: 'clip', label: 'Clipboard', r: [37.6, 68, 21.5, 19], act: look('Today\'s sheet still says 305, 307, 311.') }
      ]
    },
    decor: {
      mirror: function () { return f('stillIn') ? '<span class="reflshoes" aria-hidden="true"><img src="img/items/shoe.jpg" alt=""><img src="img/items/shoe.jpg" alt=""></span>' : ''; },
      room309: function () { return f('toldDash') ? '' : '<span class="ribs" aria-hidden="true"></span>'; }
    },
    onEnter: async function (to) {
      if (to === 'room309' && !f('in309')) {
        fl('in309');
        await G.talk(['The third floor smells like the bottom of the lake: old pennies, weed, cold mud, and under it the church.', 'Aarne pushes the door open with the end of his mop. Dash has his phone up.', ['dash', 'Was that there yesterday?'], ['agnes', 'No. Yes. Before yesterday.'], 'The plaster is ribbed: low, even ridges running floor to ceiling, like the roof of a mouth. As you watch, they soften and sink and go flat, slowly, the way a dog pretends it was not just on the sofa.', ['dash', 'Oh, I don\'t like that. Hold on, let me get it again.']]);
        await G.talk(['The ceiling coughs. Plaster dust sifts down, and then the room starts spitting up what the mirror could not keep down.', ['aarne', 'Bucket. Catch her things before they hit the wet.']]);
        await G.playGame('cough');
      }
    }
  };
  async function phone2() {
    if (!f('call')) { await callMinigame(); return; }
    if (!f('called0')) {
      A.sfx('ring', 1);
      await G.talk(['The house line to the boiler room is extension zero, which belonged to the switchboard operator back when there was a switchboard. Aarne answers it when he feels like it. It rings nine times.', ['aarne', 'Basement.'], ['agnes', 'It called me. It was my voice, Aarne. It read the rooms, all of them, right. Then it kept going. Rooms we don\'t have. And the cellar. It said Kivi.'], ['aarne', 'Kivi means stone. Throw a rock in Finland, you hit a Kivi. We\'re the national surplus. Did you write it down?'], ['agnes', 'Not yet.'], ['aarne', 'Write down what happened. Not the rooms. That\'s a list of what it\'s got in there, and you\'re the one with the pen. You write one of those in ink, it comes back up. If the book balances. It won\'t.'], ['agnes', 'It said I was due out.'], ['aarne', 'It\'s a mirror, Agnes. It only says what it sees.'], 'He sets the receiver down very gently, like someone who respects the equipment.']);
      if (!f('gSwitch')) { fl('gSwitch'); await G.talk(['You set the receiver down. Every lamp on the old house board lights up at once.', ['aarne', 'That\'s the building. Answer the real ones. Leave the other line alone.']]); await G.playGame('switchboard'); }
      fl('called0'); G.note('aarne0', 'Aarne: write down what happened. Not the rooms.', 'pencil'); say('Write it down. The steno pad is on the desk.'); await G.spend(5); return;
    }
    say('The house line is quiet. The amber display is dark.'); await G.spend(1);
  }
  async function callMinigame() {
    fl('ringing', false); G.render();
    await G.talk(['You pick up on the fourth. "Front desk. This is Agnes."', 'Nothing. Not the dead nothing of a dropped line, but a full, close nothing, like a seashell against your ear, with something moving slowly at the bottom of it. The receiver is colder than the room.', 'Then a voice says, "301, Haugen." It is your voice. Not like it. Yours. The voice you use for the audit, when you read the rooms under your breath.', 'Your hands open the ledger on their own. As it reads: real rooms go in ink. Rooms the Aurelian does not have go in pencil, on a separate page. The Aurelian has five floors, and nothing numbered past 528.']);
    var r = await G.playGame('otherline');
    var mistakes = r.skipped ? 0 : Math.min(3, r.hits || 0);
    await G.talk(['"Night desk. Szabo, A." A pause, the way you consider a card on file. "Due out."', 'Your pen has made a blot on the total line and is still making it, a slow blue bloom soaking into the page.']);
    fl('call'); G.s.callMistakes = mistakes;
    if (mistakes > 2) { var m = G.nextMeal(); if (m) { m.at = Math.max(G.s.t + 25, m.at - 15); m.warned = false; } G.toast('All that wrong ink has given the mirror an appetite. Its next meal is sooner.', 'warn'); }
    G.note('call', '4:14 a.m. House line from 309. Voice was mine. Read full room list, correct in every particular. Then rooms we do not have. Last line: Night desk, Szabo, A. Due out.', 'pencil');
    G.note('pell', 'The guest in 309 is Constance Pell.', 'pencil');
    await G.talk(['The line clicks. Not a hang-up. The sound of a receiver being set down very gently in its cradle by someone who respects the equipment.', 'In the mirror, the other Agnes lays her receiver down, writes one short line at the bottom of her page, and touches the pencil behind her own ear, twice, the way you\'d let a colleague know she had spinach in her teeth.']);
    say('Call the basement. Extension zero. Tap the phone again.');
    await G.spend(8);
  }
  async function steno2() {
    if (!f('called0') || f('wrist')) { G.openNotes(); return; }
    A.sfx('scratch');
    await G.talk(['You write it all in the steno pad, in ink, with the time, and the rooms that do not exist in pencil, on a separate page, small.', 'Then you go to write the guest\'s full name at the top of the page, and your hand stops after <em>Constance</em>. Already it has the soapy, sliding quality of a dream you tell someone at breakfast and cannot finish.']);
    G.s.notes.forEach(function (x) { if (x.id === 'pell') x.fade = true; });
    var tries = 0;
    await G.panelP('Write it on your wrist', '<p>Push back your left cuff and write it where you will see it every time you check the time.</p><form id="wristForm" autocomplete="off"><label for="wristIn">Full name of the guest in 309</label><input id="wristIn" type="text" autocomplete="off" spellcheck="false" autofocus><p class="small" id="wristMsg" role="status"></p><button type="submit" class="btn primary">Write it in ink</button></form>', function (p) {
      p.el.querySelector('#wristForm').onsubmit = function (e) {
        e.preventDefault(); var v = p.el.querySelector('#wristIn').value.toLowerCase().replace(/[^a-z]/g, '');
        if (v === 'constancepell' || v === 'pellconstance') { A.sfx('scratch'); p.close(true); return; }
        tries++; A.sfx('bad');
        p.el.querySelector('#wristMsg').textContent = tries < 2 ? 'That is not it. The name is sliding. Think of the ledger: Pell, C.' : 'Constance Pell. C-O-N-S-T-A-N-C-E, P-E-L-L.';
      };
    }, { noClose: true });
    fl('wrist'); G.s.notes.forEach(function (x) { if (x.id === 'pell') x.fade = false; });
    G.note('wristn', 'On my wrist: CONSTANCE PELL 309. It looks like a tattoo done by a prisoner. It is the most sensible thing I have done all night.', 'ink');
    say('The ink goes on blue and a little blurry over the veins. Now wait for dawn. Use Wait. The mirror is still hungry, so keep an eye on its menu.');
    await G.spend(4);
  }
  async function ribs2() {
    if (!G.has('glove')) { A.sfx('stomach'); say('The ridges are soft now, nearly flat. Look around the room first.'); await G.spend(1); return; }
    A.sfx('stomach'); await S.sleep(700); A.sfx('hum');
    await G.talk(['You lay your ear against the wet plaster and listen. The building, ticking. Under that, the stomach, working, patient as a glacier.', 'And under that, so faint you might have made it up, a woman humming. Not a sad song. Something off an old radio, hummed cheerfully and a little off-key, the way people hum when they are folding towels, or settling in somewhere for a good long stay.', ['agnes', 'She\'s still in there.'], ['aarne', 'Told you. Slow. Snake with a goat.'], ['dash', 'Who\'s in there? Who are we talking about?']]);
    if (!f('toldDash')) {
      var opts = f('wrist') ? ['Push back your cuff and read it off your wrist', 'Try to remember it'] : ['Try to remember it'];
      var k = await G.choose('Dash has the smooth, polite blankness of a man being introduced to someone for the second time.', opts, 'dash');
      if (f('wrist') && k === 0) {
        fl('toldDash'); A.sfx('good');
        await G.talk([['agnes', 'Constance Pell.'], ['dash', 'Right. Right. Her.'], 'He is relieved, the way you are relieved when someone tells you the word you were reaching for. A moment later, more quietly, filming the hat:', ['dash', 'Who?']]);
        say('Back to the front desk. Innkeeper 7 will want to check her out.');
      } else { A.sfx('bad'); await G.talk(['"Constance," you say, and then nothing. The rest of it slides away like soap. You need it written somewhere you will see it. The steno pad is at the front desk.']); }
    }
    await G.spend(3);
  }
  async function innkeeper2() {
    var k = await S.terminal(['INNKEEPER 7', 'DEPARTURES PRINTED 07:00', '309  PELL, CONSTANCE  2 NIGHTS', '     $139.00 + TAX  BALANCE DUE'], [{ t: 'Open 309' }, { t: 'Log off' }]);
    if (k !== 0) return;
    if (!G.has('glove')) { say('Before you decide anything about 309, go and see what it looks like this morning.'); return; }
    while (!f('noVoid')) {
      var c = await G.choose('Somewhere in the Aurelian, a woman is being slowly digested at the rack rate. You could void the second night. Guest not in room is a legitimate reason code.', ['Void the second night', 'Leave the charge. Add a folio note.']);
      if (c === 0) { A.sfx('bad'); await G.talk(['Your finger stops over the key. It would be correct. It would be the auditor\'s thing.', 'But a void is, precisely, a line taken out of the book.']); continue; }
      A.sfx('click');
      await G.panelP('Folio note, Room 309', '<p class="small">The note field only does capitals.</p><div class="term"><p id="typed">&nbsp;</p></div><button type="button" class="btn primary" id="typeGo">Type the note</button>', function (p) {
        var t = 'GUEST IN HOUSE. DO NOT CHECK OUT. DO NOT VOID. A.S.', i = 0, el = p.el.querySelector('#typed'), b = p.el.querySelector('#typeGo');
        b.onclick = function () { b.disabled = true; (function tick() { i += 2; el.textContent = t.slice(0, i); A.sfx('click'); if (i < t.length) setTimeout(tick, 40); else { b.disabled = false; b.textContent = 'Save the note'; b.onclick = function () { p.close(true); }; b.focus(); } })(); };
      }, { noClose: true });
      fl('noVoid'); G.note('folio', 'Folio 309: GUEST IN HOUSE. DO NOT CHECK OUT. DO NOT VOID.', 'ink');
      say('Departure: March twelfth. Checkout is at eleven. You do not know what becomes of a guest the book lets go of at eleven tomorrow morning, and you do not intend to find out by waiting. Now the ledger.');
    }
    await G.spend(4);
  }
  async function glass2() {
    if (!f('stillIn')) { say('In the glass, the other front desk stands empty in the gray light, the other ledger closed on the other blotter. The other Agnes has gone off shift. A boy is mopping the reflected marble in long patient strokes, never once looking up.'); await G.spend(1); return; }
    var a = await G.choose('At the foot of the reflected stairs, set neatly side by side as if left for a maid who is expected to know what to do with them: sensible black shoes. How many?', ['One', 'Two', 'Three']);
    if (a !== 1) { A.sfx('bad'); say('Look again. Count them twice. You are an auditor.'); await G.spend(1); return; }
    var b = await G.choose('Two. And in the real lobby, how many shoes did Aarne pull out of the mirror?', ['One', 'Two']);
    if (b !== 0) { A.sfx('bad'); say('Check your pockets. He pulled out one, and gave it to you.'); await G.spend(1); return; }
    fl('shoes'); A.sfx('good');
    await G.talk(['You count them twice. In the real lobby, Aarne pulled only one.', 'You write that down too.']);
    await G.completeNight();
  }
  window.NIGHTS = window.NIGHTS || {}; window.NIGHTS[2] = night2;
})();
