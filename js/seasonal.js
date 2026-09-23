(function(){
  // 读 /launcher/config.json → body 季节 class + 换火星颜色 + 显示横幅
  const EMBER={"mid_autumn":"255,190,90","national_day":"255,110,80","anniversary":"255,215,0"};
  function pick(cfg,now){
    if(cfg.active_override) return cfg.active_override;
    const m=String(now.getMonth()+1).padStart(2,"0"), d=String(now.getDate()).padStart(2,"0");
    const today=`${m}-${d}`;
    let best=null;
    for(const s of cfg.seasons||[]){
      if(s.start<=s.end ? (today>=s.start&&today<=s.end) : (today>=s.start||today<=s.end))
        if(!best||(s.priority||0)>(best.priority||0)) best=s;
    }
    return best?best.key:null;
  }
  function apply(key){
    if(!key) return;
    document.body.classList.add("season-"+key);
    if(window.setEmberColor&&EMBER[key]) setEmberColor(EMBER[key]);
    window.dispatchEvent(new CustomEvent("seasonchange",{detail:key}));
  }
  fetch("/launcher/config.json",{cache:"no-cache"})
    .then(r=>r.ok?r.json():null)
    .then(j=>{ if(j&&j.version) apply(pick(j,new Date())); })
    .catch(()=>{});
})();
