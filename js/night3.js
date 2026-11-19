/* Night Three: The Jar Room. For book owners. From Chapters Three to Five. */
(function () {
  'use strict';
  var S = window.STORY, A = window.HotelAudio, f = S.f, fl = S.fl, say = S.say, look = S.look, tag = S.tag;
  var night3 = {
    title: 'The Jar Room', games: ['sneak', 'grab', 'jars'], start: 1380, end: 1830, startScene: 'desk', inv: ['pen', 'pencil', 'shoe'], curios: 3,
    meals: [{ room: 'linen', at: 1450 }, { room: 'office', at: 1505 }, { room: 'laundry', at: 1640 }, { room: 'r402', at: 1700 }, { room: 'tamarack', at: 1765 }],
    objectives: [
      { text: 'Take the drawer from Tobias, then check the folio note on 309 on Innkeeper 7.', done: function () { return f('folio3'); } },
      { text: 'Find Marisol in the housekeeping office, down in the basement.', done: function () { return f('marisol'); } },
      { text: 'Be by the mirror in the lobby at 2:51.', done: function () { return f('belch3'); } },
      { text: 'Look up R.T.L. in the books. Ledger, front desk.', done: function () { return f('rtl'); } },
      { text: 'Follow Aarne down to the Jar Room.', done: function () { return f('inJar'); } },
      { text: 'Help Aarne jar tonight\'s leftovers and shelve the strays.', done: function () { return f('sorted'); } },
      { text: 'Read the brown paper tags at the very back.', done: function () { return f('crocks'); } },
      { text: 'Keep 309 in the book past eleven o\'clock checkout. Innkeeper 7.', done: function () { return f('extended'); } },
      { text: 'Write down the question nobody asks. Steno pad, front desk.', done: function () { return f('why'); } }
    ],
    setup: function () { ['r419', 'r402', 'r407', 'r528', 'tamarack'].forEach(function (r) { G.s.rec[r] = true; }); fl('door309'); },
    wrist: function () { return 'CONSTANCE PELL 309. LODESTAR. AFTER 2:51. BASEMENT. JARS.' + (f('extended') ? '<br>$1,112.26. WORTH IT?' : ''); },
    intro: async function () {
      await G.talk(['You slept four hours in your apartment over the bait shop on Third Street, and dreamed you were checking in a woman in a gray felt hat who kept saying she would only need the one key.', 'When you woke, the dream was already going soft. But your wrist says:', '<strong>CONSTANCE PELL 309. LODESTAR. AFTER 2:51. BASEMENT. JARS.</strong>', 'You do not remember writing the last line. You remember why you would have.', 'Teddy has sold the hotel to Lodestar Hospitality Group. Brynn, their Director of Transitions, says the ledgers will be securely destroyed, and you will get a certificate.']);
      say('Eleven o\'clock. Tobias, the evening clerk, is waiting to hand over the drawer.');
    },
    blockExit: function (to) {
      if (to === 'jarroom' && !f('followAarne')) return 'A steel door painted the green of an old hospital, with a padlock the size of a hymnal. Only Aarne has the key.';
      if (to !== 'desk' && !f('tobias')) return 'Tobias is still hovering with the drawer. Take it from him first.';
      return null;
    },
    events: [{ id: 'belch3', at: 1611, run: function () { return belch3(); } }],
    onEnter: async function (to) {
      if ((to === 'lobby' || to === 'mirror') && f('belch3missed') && !f('belch3')) await aarne3(true);
      if (to === 'basement' && f('followAarne') && !f('gSneak')) {
        fl('gSneak');
        await G.talk(['The basement lights are off. Aarne\'s flashlight bobs away down the passage toward the green door. Every gauge, every puddle and every jar on the way is glass, and the mirror looks out of all of it.', ['aarne', 'When it looks, hold still. It sees movement. Like a frog.']]);
        await G.playGame('sneak');
      }
      if (to === 'jarroom' && !f('inJar')) {
        fl('inJar'); A.sfx('click');
        await G.talk(['Aarne takes a long iron key from his pocket, the kind that comes with a castle, opens the padlock, reaches inside for a string, and the light comes on.', 'You see where the leftovers go.', ['aarne', 'Alphabetical by decade. Mostly. I got behind in the sixties.'], ['agnes', 'Mostly, these are people.'], ['aarne', 'Were. It eats what the hotel stops keeping track of. Room nobody\'s booked. Guest under a fake name. Anybody the book doesn\'t have, the building forgets it\'s holding, and what the building forgets, it eats.']]);
        say('Aarne\'s table is in the middle of the aisle. Tonight\'s leftovers are waiting.');
      }
    },
    hotspots: {
      desk: [
        { id: 'tobias', label: 'Tobias, the evening clerk', r: [26, 26, 20, 34], when: function () { return !f('tobias'); }, goal: function () { return true; }, act: async function () {
          await G.talk(['Tobias is a nervous boy who has heard about the sale.', '"Does Lodestar give dental?" he asks. "Brynn said they\'re going fully paperless. Do paperless people get dental?"', 'You count the drawer. Twelve dollars over, as it always is on a Tuesday. You tell him to go home and floss.']);
          fl('tobias'); say('The drawer is yours. Check 309 on Innkeeper 7.'); await G.spend(5);
        } },
        { id: 'innkeeper', label: 'Innkeeper 7, the front desk computer', r: [0, 22, 26, 54], goal: function () { return (f('tobias') && !f('folio3')) || (f('crocks') && !f('extended')); }, act: innkeeper3 },
        { id: 'ledger', label: 'The ledger', r: [25.6, 64, 36.5, 25], goal: function () { return f('belch3') && !f('rtl'); }, act: async function () {
          var k = await S.ledger(f('belch3') && !f('rtl') ? [{ k: 'rtl', t: 'Search the books for R.T.L.' }] : []);
          if (k === 'rtl') await rtl3();
        } },
        { id: 'steno', label: 'Steno pad', r: [72.5, 68, 18, 12], goal: function () { return f('extended') && !f('why'); }, act: why3 },
        { id: 'phone', label: 'The house telephone', r: [48, 50.5, 18, 19], act: look('The house line. Quiet. The display shows extension zero, as if the basement has been thinking about calling.') },
        { id: 'cabinet', label: 'Glass cabinet of ledgers', r: [66.5, 0, 33.5, 62], act: look('122 years of oxblood. Brynn from Lodestar loves the house rule so much she sent it to the brand team. She thinks it could be a tote.') }
      ],
      lobby: [
        { id: 'bellstand', label: 'The bell stand', r: [10, 46, 11, 41], act: look('Dash came on at eleven in a good mood, remembering nothing about the morning\'s walls except that there had been kringle. He is asleep under the bell stand.') }
      ],
      mirror: [
        { id: 'glass', label: 'The glass', r: [22.5, 0, 57.6, 60], cls: 'glassy', act: look('In the reflected lobby, the other front desk is not empty. A small dark-haired woman in a navy blazer stands behind it, writing. She does not look up.') }
      ],
      corridor: [
        { id: 'wall309', label: 'The door of 309', r: [33.7, 8, 18, 74], act: look('The door of 309 is still there between 307 and 311, dry now. Someone has laid a folded white towel on the floor inside, and a mint.') }
      ],
      room309: [
        { id: 'towel309', label: 'Towel and mint on the floor', r: [36, 55, 26, 35], act: look('A towel and a mint in the middle of the floor. Marisol sent herself with the mop, not a new girl.') }
      ],
      linen: [
        { id: 'towels', label: 'Count the towels (account for the closet)', r: [11, 52, 26, 46], goal: function () { return !G.s.rec.linen; }, act: function () { return S.account('linen', 'Forty-one and forty-one. Every towel in this building is on an inventory.'); } },
        { id: 'mints', label: 'Bowl of gold mints', r: [27, 37, 11.5, 16], act: async function () { if (!f('marisol')) { say('Marisol\'s mints. You would not take one without asking. Nobody would.'); return; } if (f('linenMints')) { say('You have taken your share. Marisol counts these too.'); return; } fl('linenMints'); G.giveMints(2); A.sfx('pickup'); say('Marisol said to take what you need. Two more gold mints.'); await G.spend(1); } }
      ],
      office: [
        { id: 'augustin', label: 'Portrait of Augustin Brandt (account for the office)', r: [35.6, 2.6, 28.3, 65], goal: function () { return !G.s.rec.office; }, act: function () { return S.account('office', 'Augustin, one hand on a ledger. When you asked Teddy about 1912, he looked at this portrait, and then, for a fraction of a second, at Ottilie.'); } },
        { id: 'ottilie', label: 'Oval portrait of Ottilie Brandt', r: [73.7, 19, 13.2, 34], act: look('Ottilie in her oval, looking past the painter at something she did not care for.') }
      ],
      laundry: [
        { id: 'marisol', label: 'Marisol Ocampo, head of housekeeping', r: [28, 40, 22, 45], goal: function () { return !f('marisol'); }, act: marisol3 },
        { id: 'locker', label: 'The steel locker', r: [69, 15, 10, 80], curio: true, act: look(function () { return 'The inside of the locker door is covered in names in green felt-tip, a dozen different hands, each with a date.' + (f('marisol') ? ' "Nobody is ever the last one out of a room," Marisol says. "That is the rule. Not in this hotel. Not ever."' : ''); }) },
        { id: 'sheets', label: 'Housekeeping inventory (account for the office)', r: [9.8, 70, 16, 17.5], goal: function () { return !G.s.rec.laundry; }, act: function () { return S.account('laundry', 'Marisol\'s inventory, every towel counted in and counted out. The office checks out against it, which is to say, perfectly.'); } },
        { id: 'bowl', label: 'Bowl of gold mints', r: [52, 66, 9, 12], act: look(function () { return f('marisol') ? 'A glass bowl with AURELIAN in gold script on the side.' : 'Marisol\'s mints. Ask her first.'; }) }
      ],
      jarroom: [
        { id: 'table', label: 'Aarne\'s table: jar, label maker, notebook', r: [33, 64, 36, 32], goal: function () { return !f('sorted'); }, act: sort3 },
        { id: 'crocks', label: 'Stoneware crocks at the very back', r: [39, 20, 22.5, 47.7], goal: function () { return f('sorted') && !f('crocks'); }, act: crocks3 }
      ]
    },
    decor: {
      laundry: function () { return !f('marisol') ? '<img class="figure-por" src="img/por/marisol.jpg" alt="" aria-hidden="true" style="left:31%;top:40%">' : ''; },
      jarroom: function () { return f('crocks') ? '' : '<img class="figure-por" src="img/por/aarne.jpg" alt="" aria-hidden="true" style="left:74%;top:56%">'; }
    }
  };
  async function innkeeper3() {
    if (!f('tobias')) { say('Tobias is standing in front of it, holding the drawer like a baby he did not ask for.'); return; }
    if (!f('folio3')) {
      await S.terminal(['INNKEEPER 7', '309  PELL, CONSTANCE  DEP 3/12', 'FOLIO NOTE: GUEST IN HOUSE. DO NOT CHECK OUT.', '            DO NOT VOID. A.S.', 'SYSTEM: AUTO C/O 3/12 11:00?'], [{ t: 'Close' }]);
      fl('folio3'); G.note('autoco', 'Innkeeper is waiting, with the patience of a mule, to check her out at 11:00.', 'pencil'); say('Nobody has answered the question. Innkeeper is waiting, with the patience of a mule, for eleven o\'clock. Marisol is working late in the housekeeping office in the basement.'); await G.spend(3); return;
    }
    if (!f('crocks')) { say('Innkeeper is waiting for eleven o\'clock. You need to know more before you fight it. Your wrist says: basement, jars.'); await G.spend(1); return; }
    if (f('extended')) { say('309: extended through the nineteenth. APPROVED.'); return; }
    await G.panelP('Change departure: Room 309', '<form id="depForm" autocomplete="off"><label for="depDay">New departure date in March (day of the month)</label><input id="depDay" type="number" min="13" max="31" inputmode="numeric" autofocus><p class="small">If the book lets go of her at checkout, buy her a week.</p><p class="small" id="depMsg" role="status"></p><button type="submit" class="btn primary">Change departure</button></form>', function (p) {
      p.el.querySelector('#depForm').onsubmit = function (e) { e.preventDefault(); var v = +p.el.querySelector('#depDay').value; if (v === 19) p.close(19); else { A.sfx('bad'); p.el.querySelector('#depMsg').textContent = v > 19 ? 'That is more than you can afford. A week will do: the nineteenth.' : 'A week, Agnes. The twelfth plus seven.'; } };
    }, { noClose: true });
    var pay = await S.terminal(['AUTHORIZE 7 ADDITIONAL NIGHTS AT POSTED RATE?', '7 x $139.00 + COUNTY LODGING TAX', 'TOTAL: $1,112.26', 'METHOD OF PAYMENT?'], [{ t: 'Card on file, Visa ending 4417' }, { t: 'Your own card' }]);
    if (pay === 0) { A.sfx('bad'); await S.terminal(['VISA ENDING 4417: DECLINED', 'BILLING ADDRESS: 309 LAKE AVENUE'], [{ t: 'Take out your own wallet' }]); }
    A.sfx('whirr'); await S.sleep(700); A.sfx('good');
    await S.terminal(['APPROVED', '309  PELL, CONSTANCE  DEP 3/19'], [{ t: 'Write it in the ledger' }]);
    A.sfx('scratch'); A.sfx('hiccup'); fl('extended');
    await G.talk(['Seven nights at a hundred and thirty-nine dollars, plus tax. Three weeks of your take-home, and the most money you have ever spent on anybody but your mother.', 'You open the ledger and write it again, in ink, where it counts: <em>309. Pell, C. One guest. Extended through the nineteenth. In house.</em>', 'Across the lobby, the mirror gives a small, surprised hiccup, like a diner who has been handed a bill.', 'You push up your cuff and, under the rest, add one more line, in ink: <strong>$1,112.26. WORTH IT?</strong> You will have to read it tomorrow to find out what you meant.']);
    G.note('ext', '309 extended through 3/19 on my own card. $1,112.26.', 'ink'); say('One last thing. The steno pad.'); await G.spend(6);
  }
  async function marisol3() {
    await G.talk(['Marisol Ocampo looks at you over her reading glasses with deep brown eyes that have been head of housekeeping for thirty-four years and have seen everything a guest can leave in a room, including, once, a live goose.', ['agnes', 'The towel. The mints at the mirror. Why?'], ['marisol', 'Manners. Mints go on the pillow for guests. Turndown. It\'s what you give a guest. So we give it a mint and it knows it is a guest here, not a thief.'], ['marisol', 'It takes one sometimes. Never both. It has better manners than the guests. And it sends the paper back. Always. Folded.'], ['agnes', 'You left 309 off the sheet.'], ['marisol', 'I left it off because I forgot it. Same as everyone. That is how it goes. It doesn\'t feel like forgetting.'], ['marisol', 'A room that comes back is not sure it is a room. It has been inside that thing, being chewed, and it has forgotten how to be a room. So you make it up.']]);
    var k = await G.choose('Marisol turns the glass bowl so the gold script faces out: AURELIAN.', ['"And it won\'t eat Aarne."', '"Can I have some of those?"'], 'marisol');
    if (k === 0) await G.talk([['marisol', 'No. Never Aarne.'], ['agnes', 'Why not?'], 'Marisol opens her mouth to answer, and then she does not answer. You have watched her tell a mining executive that his wife\'s dog ate a bath mat and would be billed for it. You have never once seen her hunt for a word.', ['marisol', 'Because... It just doesn\'t. It never has.'], ['marisol', 'Thirty-four years. I never once thought about it.']]);
    G.giveMints(3); fl('marisol');
    await G.talk([['marisol', 'Take these. When it gets greedy tonight, put one on its towel. There are more in the linen closet on three if you run out.'], 'Then, above the first floor on tomorrow\'s sheet, where the day\'s crew is listed by name, she writes <em>Agnes S.</em> at the end of the line, among the housekeepers.', ['marisol', 'You\'re asking our questions. You can be on our sheet.']]);
    G.note('mints', 'Mints are manners. A mint on the mirror\'s towel calms it for half an hour.', 'pencil'); say('Three gold mints. Select one in your pockets, then tap the mirror or its towel, to push its next meal back.'); await G.spend(10);
  }
  async function belch3() {
    var here = G.s.scene === 'lobby' || G.s.scene === 'mirror';
    if (!here) { G.belchFx(0.8); fl('belch3missed'); G.toast('2:51. A small belch, by the standards of the week: a gulp and a grunt. Go to the lobby.', 'big'); return; }
    if (G.s.scene !== 'mirror') { G.s.scene = 'mirror'; G.render(); }
    G.belchFx(1); await S.sleep(700);
    G.spit([tag('a brass thimble'), tag('one molar'), { img: 'ring' }]);
    await G.talk(['2:51. It is a small belch, by the standards of the week: a gulp and a grunt, a man agreeing with something he has not really heard.', 'Three things skitter across the marble. A brass thimble. A single molar, brown at the root. And a ring, which rolls in a slow circle and comes to rest against your shoe.']);
    await aarne3(false);
  }
  async function aarne3(late) {
    fl('belch3');
    if (!f('gGrab')) { fl('gGrab'); await G.playGame('grab', late ? { lead: 'The mirror is still grabby. Silvery hands slap at the marble, feeling for something to eat. Dodge between three lanes, and catch the thimble, the molar and the ring as they skitter out.' } : {}); }
    G.give('ring');
    await G.talk([late ? 'A brass thimble, a molar, and a ring wait on the marble where the mirror left them. You pick up the ring.' : 'You pick up the ring.', 'It is warm. Engraved inside, in worn script: <em>R.T.L. to M.J.L. 6-20-87.</em>', 'The service door opens. Aarne comes through with his bucket and his dustpan and his label maker, kneels, and sweeps up the thimble and the tooth.', ['agnes', 'Who\'s R.T.L.?'], ['aarne', 'You tell me. You\'ve got the book.']]);
    say('Search the books. The ledger is at the front desk.'); await G.spend(2);
  }
  async function rtl3() {
    var pr = G.panel('Searching the books', '<p>Innkeeper first, then the ledger, every room on every floor, then the last six months of ledgers, running your finger down the columns until your eyes water.</p><div class="scan" aria-hidden="true"><span></span></div><p role="status">Searching...</p>', { noClose: true });
    A.sfx('page'); await S.sleep(1300); A.sfx('page'); await S.sleep(900); pr.close();
    A.sfx('whirr');
    await G.talk(['There is no guest with those initials. There was no guest with those initials.', ['agnes', 'Nobody.'], ['aarne', 'Then nobody.'], 'The label maker whirs. He holds up the strip: <em>UNK / RING, THIMBLE, MOLAR / 3-12.</em> He holds out his gloved hand for the ring.', ['aarne', 'Come on. You wrote yourself a note.'], 'You look at your wrist. BASEMENT. JARS. He is already at the service door.']);
    G.take('ring'); fl('rtl'); fl('followAarne'); G.note('rtl', 'R.T.L.: nobody in the books. UNK.', 'pencil'); say('Follow Aarne: lobby, service door, basement, the green steel door.'); await G.spend(12);
  }
  async function sort3() {
    if (f('sorted')) { say('Tonight\'s half-pint sits at the end of the UNK row. Somewhere, possibly, M.J.L. is making coffee for one and could not tell you why the kitchen feels so large.'); await G.spend(1); return; }
    await G.talk(['Aarne transfers tonight\'s leftovers into a clean half-pint with tweezers, screws the lid down, and slides it onto the table. Then he slides another one. And another.', ['aarne', 'I got behind. Alphabetical by decade. The ones nobody wrote down go on UNK. Go.']]);
    await G.playGame('jars');
    G.toast('Tonight\'s half-pint goes at the end of the UNK row. Hundreds of them. Only a date and a room on each, or not even the room.', 'good');
    fl('sorted');
    await G.talk([['aarne', 'Because people forget. Something goes in the glass, by the next day nobody remembers it was ever up here. Unless it\'s written. Name on a page, the name holds. That\'s why the old man wrote his rule on the front of every book.'], ['aarne', 'There\'s more of them lately. More every year. Hotel keeps less. More falls through.'], ['agnes', 'And when it\'s paperless?'], 'He does not answer. He does not need to.']);
    say('The aisle runs back under the hotel farther than you can see. At the very back, under a single bulb, the oldest jars are not jars at all.'); await G.spend(8);
  }
  async function crocks3() {
    if (!f('sorted')) { say('Stoneware crocks, salt-glazed, tagged in brown paper. Help Aarne with tonight\'s jar first.'); return; }
    if (f('crocks')) { await G.talk(['At the end of the shelf, one small crock the size of a sugar bowl, its tag turned to face the wall.', ['aarne', 'Leave that one.']]); await G.spend(1); return; }
    await G.panelP('The oldest shelf', '<p>Crocks, not jars, labeled on tags of heavy brown paper tied with twine, in a brown ink gone the color of a scab. It is not Augustin\'s hand. The writing is backward.</p><p class="mirrortext" role="img" aria-label="A tag written backward, as if in a mirror. It reads BUNKROOM A, 22">BUNKROOM A: 22</p><p>Read it the way you read a guest\'s signature upside down across the desk. What does it say?</p><div class="col">' +
      ['22 A MOORKNUB', 'BUNKROOM A: 22', 'BOHEMIA ROOM: 1'].map(function (o, k) { return '<button type="button" class="btn opt2" data-k="' + k + '">' + o + '</button>'; }).join('') + '</div><p class="small" id="crMsg" role="status"></p>', function (p) {
        p.el.querySelectorAll('.opt2').forEach(function (b) { b.onclick = function () { if (b.dataset.k === '1') p.close(true); else { A.sfx('bad'); p.el.querySelector('#crMsg').textContent = 'Not quite. Flip it in your head, right to left.'; } }; });
      }, { noClose: true });
    A.sfx('good'); fl('crocks');
    await G.talk(['<em>BUNKROOM A: 22.</em> You know that from the voice on the telephone. Twenty-two men, scrip. Beside it, <em>BUNKROOM B: 19.</em> And a smaller crock: <em>COOK\'S BOY: 1.</em>', 'At the very end of the shelf, pushed into the corner, there is one more crock, small, the size of a sugar bowl, with its tag turned to face the wall. You reach for it.', ['aarne', 'Leave that one.'], 'He is right behind you. You did not hear him come. He only reaches past you, gently, and turns the little crock a quarter-turn farther into the corner.', ['agnes', 'Who wrote these?'], ['aarne', 'Fella before me. Terrible speller. Couldn\'t keep his letters straight. Finnish.'], ['agnes', 'If Innkeeper checks her out at eleven, what happens?'], ['aarne', 'Then the book lets go of her. And she\'s not a guest anymore. She\'s just food.'], ['aarne', 'Go do your audit, Agnes.'], 'He turns off the light.']);
    G.note('crocks', 'Backward tags: BUNKROOM A, 22. BUNKROOM B, 19. COOK\'S BOY, 1. One small crock, tag to the wall. "Leave that one."', 'pencil');
    say('Back up to the front desk. Innkeeper 7 is waiting for eleven o\'clock. Do not let it have her.'); await G.spend(10);
  }
  async function why3() {
    if (!f('extended')) { G.openNotes(); return; }
    await G.talk(['Aarne comes up to check a radiator that does not need checking. You ask him why nobody ever wonders about him.', ['aarne', 'I\'m very boring. Finns are. Scientific fact. We are the beige of Europe.'], 'You take the steno pad out of the drawer, uncap your pen, and write, in ink, in your little fence posts:', '<em>Why won\'t it eat Aarne? Why has nobody ever asked?</em>', 'Even as you write it, you can feel the question trying to slide away from you, politely, the way a guest slides toward the revolving door without stopping at the desk.']);
    var k = await G.choose('The question is sliding.', ['Underline it twice', 'Let it go']);
    while (k !== 0) { A.sfx('bad'); k = await G.choose('Let it go and it will be gone by breakfast, like Dash\'s walls. The question is sliding.', ['Underline it twice', 'Let it go']); }
    A.sfx('scratch'); fl('why');
    await G.talk(['You underline it twice.', 'It stays.']);
    await G.completeNight();
  }
  night3.outro = async function () { await G.talk(['Dawn comes up over Superior, reluctantly, like someone called in to cover a shift. The night is in the book. Most of it.', 'What is in the small crock with its tag to the wall? What happened in 1912? Why won\'t it eat Aarne? Agnes Szabo\'s story continues in <em>The Mirror That Ate the Hotel</em>.']); };
  window.NIGHTS = window.NIGHTS || {}; window.NIGHTS[3] = night3;
})();
