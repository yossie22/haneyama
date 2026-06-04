/* 万年山: iPad/Safari 用ガイド黒抜き（viewer.html が古い GitHub 版でも動く追加パッチ） */
(function() {
  if (window.__viewerIpadFixLoaded) return;
  window.__viewerIpadFixLoaded = true;

  function isAppleMobileOrTablet() {
    var ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/i.test(ua)) return true;
    try {
      if (navigator.userAgentData && navigator.userAgentData.platform === 'iOS') return true;
    } catch (e1) {}
    if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;
    if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 0 && 'ontouchstart' in window) return true;
    return false;
  }

  function needsFix() {
    try {
      if (new URLSearchParams(location.search).get('canvasMatte') === '1') return true;
    } catch (e0) {}
    if (isAppleMobileOrTablet()) return true;
    var ua = navigator.userAgent || '';
    if (/CriOS|FxiOS|EdgiOS/i.test(ua)) return true;
    if (/Safari/i.test(ua) && !/Chrome|Chromium|Edg\//i.test(ua)) return true;
    return false;
  }

  if (!needsFix()) return;

  function drawBlackKey(ctx, vid, cw, ch) {
    var vw = vid.videoWidth;
    var vh = vid.videoHeight;
    if (!vw || !vh || !ctx || cw < 1 || ch < 1) return;
    ctx.clearRect(0, 0, cw, ch);
    var scale = Math.min(cw / vw, ch / vh);
    var dw = vw * scale;
    var dh = vh * scale;
    var dx = (cw - dw) * 0.5;
    var dy = (ch - dh) * 0.5;
    ctx.drawImage(vid, 0, 0, vw, vh, dx, dy, dw, dh);
    var img = ctx.getImageData(0, 0, cw, ch);
    var d = img.data;
    var thr = 34;
    var soft = 55;
    for (var i = 0; i < d.length; i += 4) {
      var mx = d[i];
      if (d[i + 1] > mx) mx = d[i + 1];
      if (d[i + 2] > mx) mx = d[i + 2];
      if (mx <= thr) d[i + 3] = 0;
      else if (mx <= thr + soft) d[i + 3] = Math.min(255, (mx - thr) * 4);
    }
    ctx.putImageData(img, 0, 0);
  }

  function paint(entry) {
    if (!entry.ctx || !entry.vid || !entry.canvas) return;
    var wrap = entry.maskWrap;
    var w = (wrap && wrap.clientWidth) || 280;
    var h = (wrap && wrap.clientHeight) || 380;
    if (entry.canvas.width !== w) entry.canvas.width = w;
    if (entry.canvas.height !== h) entry.canvas.height = h;
    drawBlackKey(entry.ctx, entry.vid, entry.canvas.width, entry.canvas.height);
  }

  function loop(entry) {
    if (entry.raf) cancelAnimationFrame(entry.raf);
    function frame() {
      paint(entry);
      if (!entry.vid.paused && !entry.vid.ended) {
        entry.raf = requestAnimationFrame(frame);
      } else {
        entry.raf = 0;
      }
    }
    entry.raf = requestAnimationFrame(frame);
  }

  function patchVideo(vid) {
    if (!vid || vid.dataset.ipadFixDone === '1') return;
    if (!vid.classList || !vid.classList.contains('scene-video-2d')) return;
    var maskWrap = vid.parentElement;
    if (!maskWrap) return;
    vid.dataset.ipadFixDone = '1';
    maskWrap.classList.remove('guide-matte-lighten');
    maskWrap.classList.add('guide-canvas-matte');
    var canvas = document.createElement('canvas');
    canvas.className = 'guide-video-canvas';
    canvas.style.cssText = 'display:block;width:100%;height:100%;object-fit:contain;background:transparent';
    maskWrap.insertBefore(canvas, vid);
    vid.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;opacity:0;pointer-events:none';
    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    var entry = { vid: vid, canvas: canvas, ctx: ctx, maskWrap: maskWrap, raf: 0 };
    if (!window.__ipadFixEntries) window.__ipadFixEntries = [];
    window.__ipadFixEntries.push(entry);
    function onPaint() { paint(entry); }
    vid.addEventListener('loadeddata', onPaint);
    vid.addEventListener('seeked', onPaint);
    vid.addEventListener('play', function() { loop(entry); });
    vid.addEventListener('pause', function() { if (entry.raf) cancelAnimationFrame(entry.raf); onPaint(); });
    vid.addEventListener('ended', function() { if (entry.raf) cancelAnimationFrame(entry.raf); onPaint(); });
    onPaint();
    var n = 0;
    var timer = setInterval(function() {
      onPaint();
      n += 1;
      if (n >= 24) clearInterval(timer);
    }, 250);
    console.log('[viewer-ipad-fix] ガイドを黒抜き表示に切り替え');
  }

  function scan() {
    document.querySelectorAll('video.scene-video-2d').forEach(patchVideo);
  }

  function kick() {
    scan();
    (window.__ipadFixEntries || []).forEach(function(entry) {
      entry.vid.muted = true;
      var p = entry.vid.play();
      if (p && p.catch) p.catch(function() {});
      loop(entry);
    });
  }

  scan();
  var obs = new MutationObserver(scan);
  obs.observe(document.body, { childList: true, subtree: true });
  setInterval(scan, 1500);
  document.addEventListener('DOMContentLoaded', scan);
  window.addEventListener('load', scan);
  document.body.addEventListener('touchstart', kick, { passive: true, once: false });
  setTimeout(kick, 800);
  setTimeout(kick, 2500);
})();
