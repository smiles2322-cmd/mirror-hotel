/* Unlock screens: page-word challenge, book code, and the (coming soon) buy button. */
(function () {
  'use strict';
  var U = window.HotelUnlock, C = window.MIRROR_CONFIG, A = window.HotelAudio, esc = function (s) { return G.esc(s); };
  function buyHtml() {
    var p = C.payment || {};
    if (p.provider === 'none' || !p.paymentUrl) return '<p><button type="button" class="btn" disabled aria-disabled="true">Buy the full game: coming soon</button></p><p class="small">The one-time purchase is not open yet. Book owners unlock free, right now, above.</p>';
    return '<p><a class="btn primary" href="' + esc(p.paymentUrl) + '" rel="noopener">Unlock the full game, ' + esc(C.price) + '</a></p><p class="small">One-time purchase. After paying you come back here with your unlock code.</p>';
  }
  function open(opts) {
    opts = opts || {};
    var ch = U.pickChallenge(-1), wrong = 0;
    var why = opts.reason === 'night' ? '<p class="lead">Night ' + opts.night + ', <em>' + esc(window.NIGHTS[opts.night].title) + '</em>, is for people who own the book.</p>' : '<p class="lead">Night One is free. Nights Two and Three open for anyone with the paperback or hardcover.</p>';
    var p = G.panel('Unlock the whole hotel', why +
      '<section class="unl"><h3>I have the paperback or hardcover</h3>' +
      '<form id="pwForm" autocomplete="off"><p id="pwAsk"></p><label for="pwWord">The word</label><input id="pwWord" type="text" autocapitalize="none" autocomplete="off" spellcheck="false"><p class="small">Count from the left on the first full line of story text at the top of the page. Skip the running header with the title or author name.</p><p id="pwMsg" class="small" role="status"></p><div class="row"><button type="submit" class="btn primary">Unlock with my book</button><button type="button" class="btn" id="pwOther">Ask a different page</button></div></form></section>' +
      '<section class="unl"><details><summary>My book has an unlock code printed in it</summary><form id="bookForm" autocomplete="off"><label for="bookCode">Code from the "Unlock the Hotel" page</label><input type="text" id="bookCode" autocapitalize="characters" spellcheck="false"><p id="bookMsg" class="small" role="status"></p><button type="submit" class="btn">Unlock with the code</button></form></details></section>' +
      '<section class="unl"><h3>No book yet?</h3>' + buyHtml() +
      '<p class="row"><a class="btn" href="' + esc(C.amazon.paperback) + '" target="_blank" rel="noopener">Paperback</a><a class="btn" href="' + esc(C.amazon.hardcover) + '" target="_blank" rel="noopener">Hardcover</a><a class="btn" href="' + esc(C.amazon.kindle) + '" target="_blank" rel="noopener">Kindle</a></p></section>' +
      '<p class="small">This unlock is saved on this device. No account, no email, nothing collected.</p>', { cls: 'unlock-panel' });
    var el = p.el;
    function ask() { var w = el.querySelector('#pwWord'); el.querySelector('#pwAsk').innerHTML = 'Turn to <strong>page ' + ch.page + '</strong>. What is word number <strong>' + ch.n + '</strong> on the first full line?'; w.setAttribute('data-page', ch.page); w.setAttribute('data-n', ch.n); w.value = ''; }
    ask();
    function success(how) {
      A.sfx('chime'); p.close();
      G.toast('The whole hotel is open. Welcome, book owner.', 'good');
      window.renderTitle && window.renderTitle();
      var msg = G.panel('The hotel is unlocked', '<p class="lead">Every night is open on this device.</p><p>' + (how === 'purchase' ? 'Thank you for your purchase.' : 'Thank you for reading the book.') + '</p><div class="row"><button type="button" class="btn primary" id="goN">' + (opts.night ? 'Start Night ' + opts.night : 'Play') + '</button></div>');
      document.getElementById('goN').onclick = function () { msg.close(); if (opts.night) G.startNight(opts.night); else if (G.store.run) G.resume(); else G.startNight(G.store.progress.done[1] ? 2 : 1); };
    }
    el.querySelector('#pwForm').onsubmit = function (e) {
      e.preventDefault(); var v = el.querySelector('#pwWord').value;
      if (!v.trim()) { el.querySelector('#pwMsg').textContent = 'Type the word from your book.'; return; }
      if (U.tryPageWord(ch.index, v)) { success('page-word'); return; }
      wrong++; A.sfx('bad');
      if (wrong >= 3) { ch = U.pickChallenge(ch.index); wrong = 0; ask(); el.querySelector('#pwMsg').textContent = 'That did not match three times, so here is a different page. Some printings differ by a line.'; }
      else el.querySelector('#pwMsg').textContent = 'That did not match. Check you are on the first full line of story text, not the header.';
    };
    el.querySelector('#pwOther').onclick = function () { ch = U.pickChallenge(ch.index); wrong = 0; ask(); el.querySelector('#pwMsg').textContent = ''; el.querySelector('#pwWord').focus(); };
    el.querySelector('#bookForm').onsubmit = function (e) {
      e.preventDefault(); var how = U.tryCode(el.querySelector('#bookCode').value);
      if (how) success(how); else { A.sfx('bad'); el.querySelector('#bookMsg').textContent = 'That code did not match. Codes ignore capitals, spaces, and dashes.'; }
    };
    return p;
  }
  window.UnlockUI = { open: open };
})();
