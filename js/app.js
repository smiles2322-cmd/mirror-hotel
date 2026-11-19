/* Title screen, routing, and boot. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); }, esc = function (s) { return G.esc(s); };
  var C = window.MIRROR_CONFIG, A = window.HotelAudio;
  window.renderTitle = function () {
    var st = G.store, run = st.run, un = G.unlocked();
    var nights = [1, 2, 3].map(function (n) {
      var N = window.NIGHTS[n], d = st.progress.done[n], locked = !N.free && !un;
      return '<li><button type="button" class="night-card' + (locked ? ' locked' : '') + '" data-night="' + n + '"><span class="nn">Night ' + ['One', 'Two', 'Three'][n - 1] + '</span><span class="nt">' + esc(N.title) + '</span><span class="ns">' +
        (locked ? '<span aria-hidden="true">🔒</span> For book owners' : (d ? '<span aria-label="' + d.stars + ' of 3 stars">' + '★★★'.slice(0, d.stars) + '<span class="dim">' + '★★★'.slice(d.stars) + '</span></span>' : (N.free ? 'Free' : 'Unlocked'))) + '</span></button></li>';
    }).join('');
    $('#titleMenu').innerHTML =
      (run ? '<button type="button" class="btn primary big" id="tContinue">Continue Night ' + run.night + ' <span class="small">(' + esc(G.fmt(run.t)) + ')</span></button>' : '<button type="button" class="btn primary big" id="tBegin">Begin your shift</button>') +
      '<h2 class="sr-only">Nights</h2><ul class="nights">' + nights + '</ul>' +
      '<div class="row center">' + (un ? '' : '<button type="button" class="btn" id="tUnlock">🗝️ Unlock with your book</button>') +
      '<button type="button" class="btn" id="tTrophy">🏆 Trophy Room</button><button type="button" class="btn" id="tHelp">How to play</button><button type="button" class="btn" id="tSettings">Settings</button>' +
      '<a class="btn" href="' + esc(C.amazon.shortLink) + '" target="_blank" rel="noopener">📚 Get the book</a></div>';
    var b = $('#tBegin'); if (b) b.onclick = function () { A.unlock(); G.startNight(1); };
    var c = $('#tContinue'); if (c) c.onclick = function () { A.unlock(); G.resume(); };
    document.querySelectorAll('.night-card').forEach(function (x) { x.onclick = async function () { A.unlock(); var n = +x.dataset.night; if (st.run && st.run.night === n) { G.resume(); return; } if (st.run) { var k = await G.choose('You have a shift in progress (Night ' + st.run.night + '). Start Night ' + n + ' instead?', ['Start Night ' + n, 'Keep my shift']); if (k !== 0) return; } G.tryNight(n); }; });
    var u = $('#tUnlock'); if (u) u.onclick = function () { window.UnlockUI.open({}); };
    $('#tHelp').onclick = function () { G.help(); };
    $('#tTrophy').onclick = function () { A.unlock(); window.Arcade.trophyRoom(); };
    $('#tSettings').onclick = function () { G.settings(); };
  };
  function handleReturn() {
    var q = location.search, h = location.hash, code = null, m;
    if ((m = /[?&]code=([^&#]+)/.exec(q))) code = decodeURIComponent(m[1]);
    if ((m = /#\/thanks\?code=([^&]+)/.exec(h))) code = decodeURIComponent(m[1]);
    if (code !== null) {
      try { history.replaceState(null, '', location.pathname + (/[?&]nosw/.test(q) ? '?nosw' : '')); } catch (e) {}
      var how = window.HotelUnlock.tryCode(code);
      if (how) { window.renderTitle(); G.panel('The hotel is unlocked', '<p class="lead">Thank you. Every night is open on this device.</p><p class="small">Your code has been removed from the address bar.</p>'); }
      else G.panel('Almost there', '<p>We could not read an unlock code from that link. Enter the code from your receipt on the unlock screen.</p><button type="button" class="btn primary" id="toUnlock">Unlock screen</button>'), document.getElementById('toUnlock').onclick = function () { G.closeAllPanels(); window.UnlockUI.open({}); };
      return true;
    }
    if (/[?&]from=book/.test(q) || /#\/unlock/.test(h)) {
      if (!G.unlocked()) window.UnlockUI.open({ reason: 'book' });
      else G.panel('Welcome back, book owner', '<p>The whole hotel is already open on this device. Pick a night.</p>');
      return true;
    }
    return false;
  }
  function boot() {
    G.boot(); window.renderTitle(); A.ambient('title');
    handleReturn();
    if ('serviceWorker' in navigator && !/[?&]nosw/.test(location.search) && location.protocol !== 'file:') {
      window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
    }
    window.__aurelian = { G: G, unlocked: function () { return G.unlocked(); } };
  }
  boot();
})();
