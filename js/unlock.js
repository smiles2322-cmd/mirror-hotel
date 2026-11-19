/* Unlock logic. Honest note: everything here runs on the visitor's phone, so this is a
   light honor-system lock. Codes are stored only as salted SHA-256 hashes. */
(function () {
  var KEY = 'mirrorHotel.unlock.v1';
  var C = window.MIRROR_CODES, H = window.MirrorHash;
  function sig(method) { return H.sha256(C.salt + '|unlocked|' + method); }
  function isUnlocked() {
    try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); return !!(s && s.method && s.sig === sig(s.method)); } catch (e) { return false; }
  }
  function save(method) {
    try { localStorage.setItem(KEY, JSON.stringify({ method: method, at: new Date().toISOString(), sig: sig(method) })); } catch (e) {}
  }
  function tryCode(code) {
    if (!H.normalize(code)) return null;
    if (C.bookCodeHashes.indexOf(H.codeHash(C.salt, 'book', code)) >= 0) { save('book-code'); return 'book-code'; }
    if (C.purchaseCodeHashes.indexOf(H.codeHash(C.salt, 'paid', code)) >= 0) { save('purchase'); return 'purchase'; }
    return null;
  }
  function pickChallenge(exceptIndex) {
    var list = C.pageWords; if (!list.length) return null;
    var i, tries = 0;
    do { i = Math.floor(Math.random() * list.length); tries++; } while (list.length > 1 && i === exceptIndex && tries < 10);
    return { index: i, page: list[i].page, n: list[i].n };
  }
  function tryPageWord(index, word) {
    var e = C.pageWords[index]; if (!e) return false;
    if (H.codeHash(C.salt, 'p' + e.page + 'w' + e.n, word) === e.h) { save('page-word'); return true; }
    return false;
  }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} }
  window.HotelUnlock = { isUnlocked: isUnlocked, tryCode: tryCode, pickChallenge: pickChallenge, tryPageWord: tryPageWord, reset: reset };
})();
