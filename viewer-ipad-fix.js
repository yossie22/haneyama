/* 万年山 iPad: 画面固定オーバーレイ（ipadm6）の再生補助 */
(function() {
  if (window.__viewerIpadFixLoaded) return;
  window.__viewerIpadFixLoaded = true;

  function isIosSafari() {
    var ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/i.test(ua)) return true;
    if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;
    if (/CriOS|FxiOS|EdgiOS/i.test(ua)) return true;
    if (/Safari/i.test(ua) && !/Chrome|Chromium|Edg\//i.test(ua)) return true;
    return false;
  }

  if (!isIosSafari()) return;

  function kick() {
    document.querySelectorAll('#guideIosOverlayRoot video, video.scene-video-2d').forEach(function(vid) {
      vid.muted = true;
      vid.playsInline = true;
      vid.setAttribute('playsinline', '');
      var p = vid.play();
      if (p && p.catch) p.catch(function() {});
    });
  }

  document.body.addEventListener('touchstart', kick, { passive: true });
  setInterval(kick, 2000);
  window.addEventListener('load', kick);
})();
