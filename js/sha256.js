/* Small SHA-256 (public domain style implementation). Works offline and on file:// pages. */
(function (g) {
  var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  function utf8(s) { return new TextEncoder().encode(s); }
  function sha256(str) {
    var m = utf8(str), l = m.length, nb = ((l + 9 + 63) >> 6) << 6, b = new Uint8Array(nb);
    b.set(m); b[l] = 0x80; var bits = l * 8;
    b[nb - 4] = (bits >>> 24) & 255; b[nb - 3] = (bits >>> 16) & 255; b[nb - 2] = (bits >>> 8) & 255; b[nb - 1] = bits & 255;
    b[nb - 5] = Math.floor(bits / 4294967296) & 255;
    var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19], W = new Array(64);
    for (var o = 0; o < nb; o += 64) {
      for (var i = 0; i < 16; i++) W[i] = (b[o+i*4] << 24) | (b[o+i*4+1] << 16) | (b[o+i*4+2] << 8) | b[o+i*4+3];
      for (i = 16; i < 64; i++) {
        var x = W[i-15], y = W[i-2];
        var s0 = ((x>>>7)|(x<<25)) ^ ((x>>>18)|(x<<14)) ^ (x>>>3);
        var s1 = ((y>>>17)|(y<<15)) ^ ((y>>>19)|(y<<13)) ^ (y>>>10);
        W[i] = (W[i-16] + s0 + W[i-7] + s1) | 0;
      }
      var a=H[0],c=H[2],d=H[3],e=H[4],f=H[5],gg=H[6],h=H[7],bb=H[1];
      for (i = 0; i < 64; i++) {
        var S1 = ((e>>>6)|(e<<26)) ^ ((e>>>11)|(e<<21)) ^ ((e>>>25)|(e<<7));
        var ch = (e & f) ^ (~e & gg);
        var t1 = (h + S1 + ch + K[i] + W[i]) | 0;
        var S0 = ((a>>>2)|(a<<30)) ^ ((a>>>13)|(a<<19)) ^ ((a>>>22)|(a<<10));
        var mj = (a & bb) ^ (a & c) ^ (bb & c);
        var t2 = (S0 + mj) | 0;
        h = gg; gg = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
      }
      H[0]=(H[0]+a)|0;H[1]=(H[1]+bb)|0;H[2]=(H[2]+c)|0;H[3]=(H[3]+d)|0;H[4]=(H[4]+e)|0;H[5]=(H[5]+f)|0;H[6]=(H[6]+gg)|0;H[7]=(H[7]+h)|0;
    }
    return H.map(function (v) { return ('00000000' + (v >>> 0).toString(16)).slice(-8); }).join('');
  }
  /* Codes are compared after this cleanup, so "Mirror-251", "mirror 251" and "MIRROR251" all match. */
  function normalize(s) {
    return String(s || '').toLowerCase().replace(/[\u2018\u2019\u201c\u201d'"`]/g, '').replace(/[^a-z0-9]/g, '');
  }
  function codeHash(salt, kind, value) { return sha256(salt + '|' + kind + '|' + normalize(value)); }
  g.MirrorHash = { sha256: sha256, normalize: normalize, codeHash: codeHash };
  if (typeof module !== 'undefined') module.exports = g.MirrorHash;
})(typeof window !== 'undefined' ? window : globalThis);
