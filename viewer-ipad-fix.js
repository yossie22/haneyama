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

  function mayPlayGuide(entry) {
    if (!entry || !entry.vid) return false;
    var vid = entry.vid;
    if (entry.guidePlaybackDone) return false;
    if (vid.loop !== true && vid.ended) return false;
    if (!vid.paused && vid.currentTime > 0.05) return false;
    return true;
  }

  function kick() {
    var list = window.sceneVideoEls || [];
    list.forEach(function(entry) {
      if (!mayPlayGuide(entry)) return;
      var vid = entry.vid;
      vid.muted = true;
      vid.playsInline = true;
      vid.setAttribute('playsinline', '');
      var p = vid.play();
      if (p && p.catch) p.catch(function() {});
    });
  }

  document.body.addEventListener('touchstart', kick, { passive: true });
  window.addEventListener('load', function() { setTimeout(kick, 400); });
})();
