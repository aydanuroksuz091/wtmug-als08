// Gerekli kütüphaneleri yükle: QR üretimi, QR okuma ve Metin Sıkıştırma
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

// 1. QR KODU ÜRETME FONKSİYONU (Sıkıştırmalı)
window.makeQR = function (text, size = 320) {
  return new Promise((resolve, reject) => {
    const tryIt = () => {
      // Kütüphanelerin yüklenmesini bekle
      if (typeof qrcode === 'undefined' || typeof LZString === 'undefined') {
        return setTimeout(tryIt, 50);
      }
      try {
        // Hata düzeltme seviyesini 'L' (Low) yapıyoruz ki kareler büyüsün ve telefon rahat okusun
        const qr = qrcode(0, 'L'); 
        
        // Metni sıkıştır (Böylece QR koduna çok daha az veri girer, QR ferahlar)
        const compressed = LZString.compressToEncodedURIComponent(text);
        qr.addData(compressed, 'Byte');
        qr.make();

        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        const cells = qr.getModuleCount();
        const cell = Math.floor(size / cells);
        const offset = Math.floor((size - cells * cell) / 2);
        
        // Arka plan beyaz
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
        // Kareler siyah
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

// 2. QR KODU OKUMA FONKSİYONU (Kamera ile)
window.scanQR = function (videoEl, onResult) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let stopped = false;

  const loop = () => {
    if (stopped) return;
    
    // Video akışı hazır mı ve boyutları geçerli mi kontrol et
    if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA && videoEl.videoWidth > 0) {
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      ctx.drawImage(videoEl, 0, 0);
      
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // attemptBoth: Ters renkli (beyaz zemin siyah kare) QR'ları da okumayı dener
      const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'attemptBoth' });
      
      if (code && code.data) {
        stopped = true;
        onResult(code.data);
        return;
      }
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  return { stop: () => { stopped = true; } };
};
