/*
 * 燧石启动器 · 直链下载
 * 下载按钮点击后读取升级源 latest.json，直接拉取对应平台的发布包地址并下载，
 * 不再跳转到 releases 页面。升级源路径：/chert-upgrade/latest.json（同源，无跨域问题）。
 * 按钮写法：
 *   <a href="<回退直链>" data-download data-platform="wpf" data-variant="full">下载</a>
 *   data-variant="light" 走 lightDownloadUrl（轻量版）
 */
(function () {
  'use strict';
  var FEED = '/chert-upgrade/latest.json';
  var cache = null;
  var loaded = false;

  function load() {
    if (loaded) return Promise.resolve(cache);
    loaded = true;
    if (!window.fetch) return Promise.resolve(null);
    return fetch(FEED, { cache: 'no-cache' })
      .then(function (r) { return r && r.ok ? r.json() : null; })
      .then(function (j) { cache = j || null; return cache; })
      .catch(function () { return null; });
  }

  function urlFor(btn) {
    var plat = btn.getAttribute('data-platform') || 'wpf';
    var variant = btn.getAttribute('data-variant') || 'full';
    if (!cache || !cache[plat]) return null;
    var p = cache[plat];
    if (variant === 'light' && p.lightAvailable) return p.lightDownloadUrl || null;
    return p.downloadUrl || null;
  }

  function go(url) { if (url) window.location.href = url; }

  function wire() {
    load().then(function () {
      var btns = document.querySelectorAll('[data-download]');
      for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener('click', function (e) {
          e.preventDefault();
          var u = urlFor(this);
          if (u) go(u);
          else if (this.href) go(this.href); // 升级源不可用时回退到直链
        });
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
