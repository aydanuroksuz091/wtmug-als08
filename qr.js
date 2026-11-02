(function loadScripts() {
  const s1 = document.createElement('script');
  s1.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
  document.head.appendChild(s1);

  const s2 = document.createElement('script');
  s2.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
  document.head.appendChild(s2);

  const s3 = document.createElement('script');
  s3.src = 'https://cdn.jsdelivr.net/npm/lz-string@1.5.0/libs/lz-string.min.js';
  document.head.appendChild(s3);
})();

window.makeQR = function (text, size = 320) {
  return new Promise((resolve, reject) => {
    const tryIt = () => {
      if (typeof qrcode === 'undefined' || typeof LZString === 'undefined') {
        return setTimeout(tryIt, 50);
      }
      try {
        const qr = qrcode(0, 'L'); 
        // Sıkıştırma geri geldi (QR boş görünmesin diye)
        const compressed = LZString.compressToEncodedURIComponent(text);
        qr.addData(compressed, 'Byte');
        qr.make();

        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        const cells = qr.getModuleCount();
        const cell = Math.floor(size / cells);
        const offset = Math.floor((size - cells * cell) / 2);
        
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#000';
        for (let r = 0; r < cells; r++)
          for (let c = 0; c < cells; c++)
            if (qr.isDark(r, c)) ctx.fillRect(offset + c * cell, offset + r * cell, cell, cell);
            
        resolve(canvas);
      } catch (e) { reject(e); }
    };
    tryIt();
  });
};

window.scanQR = function (videoEl, onResult) {
  // ... (Kamera okuma kısmı aynı kalabilir, ihtiyacımız olmayacak)
};
