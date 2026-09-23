(function(){
  // 注入背景层 + 导航 + 页脚，全站单一来源，从此改导航只动这一个文件
  const bg = `<div class="bg-aurora" aria-hidden="true"><i></i><i></i><i></i></div>
              <div class="bg-grid" aria-hidden="true"></div>
              <canvas id="embers-canvas" data-color="255,215,0" data-count="42"></canvas>`;
  const nav = `<div class="season-banner" data-t="season.mid_autumn" hidden></div>
  <header class="nav"><div class="container nav-inner">
    <a href="/" class="brand" aria-label="RLRS Studio">
      <svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><path d="M15 49 L33 16 L42 16 L24 49 Z"/><path d="M30 49 L40 18 L49 18 L39 49 Z" opacity="0.6"/></svg>
      <span>RLRS Studio</span></a>
    <nav class="nav-links">
      <a href="/" data-nav="home" data-t="nav.home">首页</a>
      <a href="/chert/" data-nav="download" data-t="nav.download">下载</a>
      <a href="/changelog/" data-nav="changelog" data-t="nav.changelog">更新日志</a>
      <a href="https://github.com/BingJian-REMIX/Chert-WPF" target="_blank" rel="noopener" data-t="nav.github">GitHub</a>
    </nav>
    <div class="nav-right">
      <select class="lang-select" aria-label="语言切换">
        <option value="zh">简体中文</option>
        <option value="zh-TW">繁體中文</option>
        <option value="en">English</option>
        <option value="lzh">文言文</option>
      </select>
      <a href="/chert/" class="btn btn-primary" style="padding:7px 14px;font-size:13.5px" data-t="nav.get">⬇ 下载燧石</a>
    </div>
  </div></header>`;
  const foot = `<footer><div class="container">
    <div class="foot-grid">
      <div class="foot-brand">
        <a href="/" class="brand"><svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true" style="width:20px;height:20px"><path d="M15 49 L33 16 L42 16 L24 49 Z"/><path d="M30 49 L40 18 L49 18 L39 49 Z" opacity="0.6"/></svg><span>RLRS Studio</span></a>
        <p data-t="foot.tag"></p>
      </div>
      <nav><b data-t="foot.p"></b>
        <a href="/chert/" data-t="foot.p1"></a>
        <a href="/sr/" data-t="foot.p2"></a>
        <a href="/join/" data-t="foot.p3"></a>
      </nav>
      <nav><b data-t="foot.r"></b>
        <a href="/chert/" data-t="foot.r1"></a>
        <a href="/changelog/" data-t="foot.r2"></a>
        <a href="/chert/wpf/ui-preview.html" target="_blank" rel="noopener" data-t="foot.r3"></a>
        <a href="https://github.com/BingJian-REMIX/Chert-WPF/blob/main/LICENSE" target="_blank" rel="noopener" data-t="foot.r4"></a>
      </nav>
      <nav><b data-t="foot.c"></b>
        <a href="https://github.com/BingJian-REMIX/Chert-WPF" target="_blank" rel="noopener" data-t="foot.c1"></a>
        <a href="https://cnb.cool/RLRS-Studio/Chert-WPF" target="_blank" rel="noopener" data-t="foot.c2"></a>
        <a href="https://space.bilibili.com/2090624670" target="_blank" rel="noopener" data-t="foot.c3"></a>
        <a href="mailto:bingjianremix@outlook.com" data-t="foot.c4"></a>
      </nav>
    </div>
    <div class="foot-bottom">
      <span data-t="foot.rights"></span>
      <span class="mono">Powered by GitHub Pages + Cloudflare</span>
    </div>
  </div></footer>`;
  function mount(){
    document.body.insertAdjacentHTML("afterbegin", bg + nav);
    document.body.insertAdjacentHTML("beforeend", foot);
    const cur=document.body.dataset.nav;
    if(cur) document.querySelectorAll(`[data-nav="${cur}"]`).forEach(a=>a.classList.add("active"));
    // 季节横幅：seasonal.js 选中季节后填充文案并显示
    window.addEventListener("seasonchange",e=>{
      const key=e.detail; const el=document.querySelector(".season-banner");
      if(!key||!el){ if(el) el.hidden=true; return; }
      el.dataset.t="season."+key; el.hidden=false;
      if(window.SI18N) el.textContent=SI18N.t("season."+key);
    });
    if(window.SI18N) SI18N.apply();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",mount); else mount();
})();
