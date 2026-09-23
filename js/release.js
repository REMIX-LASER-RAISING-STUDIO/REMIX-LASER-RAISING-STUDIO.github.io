/* 从 chert-upgrade/latest.json 注入版本号：消灭 HTML 硬编码 */
(function(){
  function fill(wpf){
    if(!wpf) return;
    SI18N.vars={ver:wpf.version,stage:SI18N.lang==="zh"?"公测":wpf.channel||"Beta",
                runtime:".NET 10",year:new Date().getFullYear()};
    SI18N.apply();
    document.querySelectorAll("[data-rel-date]").forEach(e=>e.textContent=wpf.releaseDate||"");
    document.querySelectorAll("[data-rel-changelog]").forEach(e=>{e.textContent=wpf.changelog||"";});
  }
  function boot(){
    SI18N.vars={ver:"2.5.6",stage:SI18N.lang==="zh"?"公测":"Beta",runtime:".NET 10",year:new Date().getFullYear()};
    SI18N.apply();
    fetch("/chert-upgrade/latest.json",{cache:"no-cache"})
      .then(r=>r.ok?r.json():null).then(j=>fill(j&&j.wpf)).catch(()=>{});
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
})();
