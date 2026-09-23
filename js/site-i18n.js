(function(){
  const DICT={
  zh:{ "nav.home":"首页","nav.download":"下载","nav.changelog":"更新日志","nav.github":"GitHub","nav.get":"⬇ 下载燧石",
    "season.mid_autumn":"🌕 中秋主题模式已上线","season.national_day":"🇨🇳 国庆主题模式已上线","season.anniversary":"🎉 周年庆主题模式已上线",
    "hero.eyebrow":"v{ver} {stage} · Windows","hero.title":"一个<span class='accent'>开箱即用</span>的 Minecraft 启动器",
    "hero.lead":"安装、崩溃修复、Mod 管理、下载加速——交给燧石。你的时间应该花在玩游戏上，而不是折腾启动器。",
    "hero.cta1":"下载 Chert v{ver}","hero.cta2":"查看源码","hero.preview":"在线体验 UI ➜",
    "hero.m1":"内置工具","hero.m1v":"15+","hero.m2":"运行环境","hero.m2v":"{runtime}","hero.m3":"界面语言","hero.m3v":"中文 / English",
    "feat.k":"特性","feat.t":"启动器该做的事，一次做全","feat.s":"燧石在三件事上做到了极致，剩下的你无需关心。",
    "feat.1t":"崩溃自愈","feat.1d":"游戏崩溃后自动读取日志、定位原因，自动补齐缺失依赖、修复错误配置。",
    "feat.2t":"15+ 工具箱","feat.2d":"Mod 管理、配置编辑、资源包修复、离线宏、游戏内 HUD、AI 助手……一个启动器全搞定。",
    "feat.3t":"极速下载","feat.3d":"版本文件、资源、依赖库从官方源或镜像拉取，支持断点续传与完整性校验。",
    "shot.cap":"真实启动器界面 · 可交互预览 — <a href='/chert/wpf/ui-preview.html' target='_blank' rel='noopener'>在新窗口打开 ➜</a>",
    "stat.1":"内置工具","stat.1v":"15+","stat.2":"运行环境","stat.2v":"{runtime}","stat.3":"界面语言","stat.3v":"中英双语","stat.4":"支持平台","stat.4v":"Windows",
    "chose.k":"选择版本","chose.t":"获取燧石启动器","chose.s":"两种 Windows 安装包按需选择。Linux 开发中，Android 规划中。",
    "dl.1t":"自包含版","dl.1tag":"推荐","dl.1d":"解压即玩，无需安装任何运行库。","dl.1m":"≈ 120 MB",
    "dl.2t":"轻量版","dl.2tag":"体积小","dl.2d":"需电脑已安装 {runtime} 桌面运行时。","dl.2m":"≈ 1 MB",
    "dl.3t":"Linux 版","dl.3tag":"开发中","dl.3d":"早期构建测试中，关注仓库获取通知。","dl.3m":"Chert-Linux 仓库 →",
    "dl.4t":"Android 版","dl.4tag":"规划中","dl.4d":"尚未开始，Star 仓库获取上线通知。","dl.4m":"Star 仓库 →",
    "sys.k":"系统要求","sys.t":"在装之前确认一下","sys.s":"燧石对硬件要求不高，普通办公机即可流畅运行。",
    "sys.1k":"操作系统","sys.1v":"Windows 10 / 11（64 位）","sys.2k":"运行库","sys.2v":"{runtime}（仅轻量版）","sys.3k":"内存","sys.3v":"4 GB+（推荐 8 GB）","sys.4k":"网络","sys.4v":"下载游戏时需要联网",
    "cta.t":"准备好开玩了吗？","cta.s":"下载不到一分钟。修复崩溃，比那更快。","cta.btn":"下载 v{ver}",
    "log.t":"更新日志","log.s":"燧石启动器的发布历史。",
    "foot.tag":"独立游戏工具工作室 · 燧石启动器开发者",
    "foot.p":"产品","foot.r":"资源","foot.c":"社区",
    "foot.p1":"燧石启动器","foot.p2":"速融 SR","foot.p3":"加入社群",
    "foot.r1":"下载","foot.r2":"更新日志","foot.r3":"UI 预览","foot.r4":"开源许可",
    "foot.c1":"GitHub（镜像）","foot.c2":"CNB（主仓库）","foot.c3":"Bilibili","foot.c4":"联系我们",
    "foot.rights":"© {year} RLRS Studio · REMIX 激越工作室。非官方项目，与 Mojang / Microsoft 无关。Minecraft 是 Mojang Synergies AB 的商标。"
  },
  en:{ "nav.home":"Home","nav.download":"Download","nav.changelog":"Changelog","nav.github":"GitHub","nav.get":"⬇ Get Chert",
    "season.mid_autumn":"🌕 Mid-Autumn theme is live","season.national_day":"🇨🇳 National Day theme is live","season.anniversary":"🎉 Anniversary theme is live",
    "hero.eyebrow":"v{ver} {stage} · Windows","hero.title":"A Minecraft launcher that <span class='accent'>just works</span>.",
    "hero.lead":"Installs, crash recovery, mods and fast downloads — Chert handles it all. Spend time playing, not fixing.",
    "hero.cta1":"Download Chert v{ver}","hero.cta2":"View source","hero.preview":"Try the UI online ➜",
    "hero.m1":"Built-in tools","hero.m1v":"15+","hero.m2":"Runtime","hero.m2v":"{runtime}","hero.m3":"Languages","hero.m3v":"中文 / English",
    "feat.k":"Features","feat.t":"Everything a launcher should do","feat.s":"Three things Chert obsesses over, so you don't have to.",
    "feat.1t":"Crash self-healing","feat.1d":"Crashed? Chert reads the log, finds the cause and fixes missing deps or bad configs automatically.",
    "feat.2t":"15+ toolbox","feat.2d":"Mods, config editor, resource-pack repair, macros, in-game HUD, AI assistant — all in one launcher.",
    "feat.3t":"Fast downloads","feat.3d":"Version files, assets and libraries from official sources or mirrors, with resume and integrity checks.",
    "shot.cap":"Real launcher UI · interactive preview — <a href='/chert/wpf/ui-preview.html' target='_blank' rel='noopener'>open in new tab ➜</a>",
    "stat.1":"Built-in tools","stat.1v":"15+","stat.2":"Runtime","stat.2v":"{runtime}","stat.3":"Languages","stat.3v":"中文 / EN","stat.4":"Platforms","stat.4v":"Windows",
    "chose.k":"Download","chose.t":"Get Chert Launcher","chose.s":"Two Windows builds. Linux in development, Android on the roadmap.",
    "dl.1t":"Full build","dl.1tag":"Recommended","dl.1d":"Unpack and run, no runtime needed.","dl.1m":"≈ 120 MB",
    "dl.2t":"Light build","dl.2tag":"Small","dl.2d":"Requires {runtime} Desktop Runtime.","dl.2m":"≈ 1 MB",
    "dl.3t":"Linux","dl.3tag":"In development","dl.3d":"Early builds in testing. Follow the repo.","dl.3m":"Chert-Linux repo →",
    "dl.4t":"Android","dl.4tag":"Planned","dl.4d":"Not started. Star the repo for updates.","dl.4m":"Star repo →",
    "sys.k":"System requirements","sys.t":"Check before installing","sys.s":"Chert is light — any modern office PC runs it fine.",
    "sys.1k":"OS","sys.1v":"Windows 10 / 11 (64-bit)","sys.2k":"Runtime","sys.2v":"{runtime} (light build only)","sys.3k":"RAM","sys.3v":"4 GB+ (8 GB recommended)","sys.4k":"Network","sys.4v":"Required for downloading the game",
    "cta.t":"Ready to play?","cta.s":"Download takes a minute. Fixing crashes takes less.","cta.btn":"Download v{ver}",
    "log.t":"Changelog","log.s":"Release history of Chert Launcher.",
    "foot.tag":"Indie game tools studio · makers of Chert Launcher",
    "foot.p":"Product","foot.r":"Resources","foot.c":"Community",
    "foot.p1":"Chert Launcher","foot.p2":"SR","foot.p3":"Join us",
    "foot.r1":"Download","foot.r2":"Changelog","foot.r3":"UI Preview","foot.r4":"License (Apache-2.0)",
    "foot.c1":"GitHub (mirror)","foot.c2":"CNB (main repo)","foot.c3":"Bilibili","foot.c4":"Contact",
    "foot.rights":"© {year} RLRS Studio · REMIX 激越工作室. Not affiliated with Mojang / Microsoft. Minecraft is a trademark of Mojang Synergies AB."
  },
  "zh-TW":{ "nav.home":"首頁","nav.download":"下載","nav.changelog":"更新日誌","nav.github":"GitHub","nav.get":"⬇ 下載燧石",
    "season.mid_autumn":"🌕 中秋主題模式已上線","season.national_day":"🇨🇳 國慶主題模式已上線","season.anniversary":"🎉 週年慶主題模式已上線",
    "hero.eyebrow":"v{ver} {stage} · Windows","hero.title":"一個<span class='accent'>開箱即用</span>的 Minecraft 啟動器",
    "hero.lead":"安裝、崩潰修復、Mod 管理、下載加速——交給燧石。你的時間應該花在玩遊戲上，而不是折騰啟動器。",
    "hero.cta1":"下載 Chert v{ver}","hero.cta2":"查看源碼","hero.preview":"線上體驗 UI ➜",
    "hero.m1":"內建工具","hero.m1v":"15+","hero.m2":"執行環境","hero.m2v":"{runtime}","hero.m3":"介面語言","hero.m3v":"中文 / English",
    "feat.k":"特性","feat.t":"啟動器該做的事，一次做全","feat.s":"燧石在三件事上做到了極致，剩下的你無需關心。",
    "feat.1t":"崩潰自愈","feat.1d":"遊戲崩潰後自動讀取日誌、定位原因，自動補齊缺失依賴、修復錯誤配置。",
    "feat.2t":"15+ 工具箱","feat.2d":"Mod 管理、配置編輯、資源包修復、離線宏、遊戲內 HUD、AI 助手……一個啟動器全搞定。",
    "feat.3t":"極速下載","feat.3d":"版本檔案、資源、依賴庫從官方源或鏡像拉取，支援斷點續傳與完整性校驗。",
    "shot.cap":"真實啟動器介面 · 可互動預覽 — <a href='/chert/wpf/ui-preview.html' target='_blank' rel='noopener'>在新視窗開啟 ➜</a>",
    "stat.1":"內建工具","stat.1v":"15+","stat.2":"執行環境","stat.2v":"{runtime}","stat.3":"介面語言","stat.3v":"中英雙語","stat.4":"支援平台","stat.4v":"Windows",
    "chose.k":"選擇版本","chose.t":"獲取燧石啟動器","chose.s":"兩種 Windows 安裝包按需選擇。Linux 開發中，Android 規劃中。",
    "dl.1t":"自包含版","dl.1tag":"推薦","dl.1d":"解壓即玩，無需安裝任何執行環境。","dl.1m":"≈ 120 MB",
    "dl.2t":"輕量版","dl.2tag":"體積小","dl.2d":"需電腦已安裝 {runtime} 桌面執行環境。","dl.2m":"≈ 1 MB",
    "dl.3t":"Linux 版","dl.3tag":"開發中","dl.3d":"早期構建測試中，關注倉庫獲取通知。","dl.3m":"Chert-Linux 倉庫 →",
    "dl.4t":"Android 版","dl.4tag":"規劃中","dl.4d":"尚未開始，Star 倉庫獲取上線通知。","dl.4m":"Star 倉庫 →",
    "sys.k":"系統需求","sys.t":"在裝之前確認一下","sys.s":"燧石對硬體要求不高，普通辦公機即可流暢運行。",
    "sys.1k":"作業系統","sys.1v":"Windows 10 / 11（64 位）","sys.2k":"執行環境","sys.2v":"{runtime}（僅輕量版）","sys.3k":"記憶體","sys.3v":"4 GB+（推薦 8 GB）","sys.4k":"網路","sys.4v":"下載遊戲時需要連網",
    "cta.t":"準備好開玩了嗎？","cta.s":"下載不到一分鐘。修復崩潰，比那更快。","cta.btn":"下載 v{ver}",
    "log.t":"更新日誌","log.s":"燧石啟動器的發布歷史。",
    "foot.tag":"獨立遊戲工具工作室 · 燧石啟動器開發者",
    "foot.p":"產品","foot.r":"資源","foot.c":"社群",
    "foot.p1":"燧石啟動器","foot.p2":"速融 SR","foot.p3":"加入社群",
    "foot.r1":"下載","foot.r2":"更新日誌","foot.r3":"UI 預覽","foot.r4":"開源許可",
    "foot.c1":"GitHub（鏡像）","foot.c2":"CNB（主倉庫）","foot.c3":"Bilibili","foot.c4":"聯絡我們",
    "foot.rights":"© {year} RLRS Studio · REMIX 激越工作室。非官方專案，與 Mojang / Microsoft 無關。Minecraft 是 Mojang Synergies AB 的商標。"
  },
  lzh:{ "nav.home":"首頁","nav.download":"下載","nav.changelog":"更迭錄","nav.github":"GitHub","nav.get":"⬇ 取燧石",
    "season.mid_autumn":"🌕 中秋之儀已啟","season.national_day":"🇨🇳 國慶之儀已啟","season.anniversary":"🎉 週年之儀已啟",
    "hero.eyebrow":"v{ver} {stage} · Windows","hero.title":"一<span class='accent'>開箱即用</span>之 Minecraft 啟動器",
    "hero.lead":"安裝、崩壞修復、Mod 之管、下載加速——盡付燧石。汝時當用於游戲，毋耗於調啟動器。",
    "hero.cta1":"取 Chert v{ver}","hero.cta2":"觀其源","hero.preview":"線上試其界面 ➜",
    "hero.m1":"內藏之器","hero.m1v":"十五有餘","hero.m2":"所賴之境","hero.m2v":"{runtime}","hero.m3":"界面之語","hero.m3v":"漢 / English",
    "feat.k":"其能","feat.t":"啟動器所當為，一舉悉備","feat.s":"燧石於三事臻於至善，其餘毋勞汝慮。",
    "feat.1t":"崩壞自癒","feat.1d":"戲崩則自讀其誌、究其因，自補所缺之依賴、正其誤設。",
    "feat.2t":"十五有餘之器","feat.2d":"Mod 之管、配置之編、資包之修、離線之宏、戲內之 HUD、AI 之佐……一器盡備。",
    "feat.3t":"極速之下載","feat.3d":"版本之檔、資源、所賴之庫，取自官源或鏡，可續傳而驗其全。",
    "shot.cap":"啟動器之真界面 · 可互動而預覽 — <a href='/chert/wpf/ui-preview.html' target='_blank' rel='noopener'>別窗啟之 ➜</a>",
    "stat.1":"內藏之器","stat.1v":"十五有餘","stat.2":"所賴之境","stat.2v":"{runtime}","stat.3":"界面之語","stat.3v":"漢英","stat.4":"所支之台","stat.4v":"Windows",
    "chose.k":"擇其版","chose.t":"取燧石啟動器","chose.s":"Windows 之二安包，隨需而擇。Linux 方作，Android 方規。",
    "dl.1t":"自備之版","dl.1tag":"薦","dl.1d":"解壓即戲，無需別裝所賴之境。","dl.1m":"約 120 MB",
    "dl.2t":"輕版","dl.2tag":"體小","dl.2d":"需機已裝 {runtime} 桌面之境。","dl.2m":"約 1 MB",
    "dl.3t":"Linux 版","dl.3tag":"方作","dl.3d":"初構試之，關倉庫以聞其訊。","dl.3m":"Chert-Linux 倉庫 →",
    "dl.4t":"Android 版","dl.4tag":"方規","dl.4d":"未始，Star 其倉庫以聞上線之訊。","dl.4m":"Star 倉庫 →",
    "sys.k":"所須之制","sys.t":"裝前先審","sys.s":"燧石於硬體無苛求，常機即可暢行。",
    "sys.1k":"作之系統","sys.1v":"Windows 10 / 11（64 位）","sys.2k":"所賴之境","sys.2v":"{runtime}（唯輕版）","sys.3k":"內存","sys.3v":"4 GB 以上（薦 8 GB）","sys.4k":"網","sys.4v":"下遊戲時需連網",
    "cta.t":"備戲乎？","cta.s":"下載不逾一分。修崩，速於此。","cta.btn":"下載 v{ver}",
    "log.t":"更迭錄","log.s":"燧石啟動器之頒布沿革。",
    "foot.tag":"獨立之遊戲器作室 · 燧石啟動器之作者",
    "foot.p":"產","foot.r":"資","foot.c":"社",
    "foot.p1":"燧石啟動器","foot.p2":"速融 SR","foot.p3":"入我輩",
    "foot.r1":"下載","foot.r2":"更迭錄","foot.r3":"UI 之預覽","foot.r4":"開源之許",
    "foot.c1":"GitHub（鏡）","foot.c2":"CNB（主倉）","foot.c3":"Bilibili","foot.c4":"聯於我",
    "foot.rights":"© {year} RLRS Studio · REMIX 激越工作室。非官所為，與 Mojang / Microsoft 無涉。Minecraft 乃 Mojang Synergies AB 之商標。"
  },
  };
  const KEY="rlrs-site-lang";
  const LANGS=["zh","zh-TW","en","lzh"];
  function detect(){
    const saved=localStorage.getItem(KEY);
    if(saved&&LANGS.includes(saved)) return saved;
    const n=(navigator.language||"zh").toLowerCase();
    if(n.startsWith("zh-tw")||n.startsWith("zh-hk")||n.startsWith("zh-mo")) return "zh-TW";
    if(n.startsWith("zh")) return "zh";
    if(n.startsWith("en")) return "en";
    return "zh";
  }
  let lang=detect();
  const vars={};  // {ver,stage,runtime,year} 由 release.js 注入
  function t(k){
    let v=(DICT[lang]&&DICT[lang][k])||DICT.zh[k]||k;
    return v.replace(/\{(\w+)\}/g,(_,n)=>vars[n]??`{${n}}`);
  }
  function apply(root){
    (root||document).querySelectorAll("[data-t]").forEach(el=>{
      const v=t(el.dataset.t); if(/</.test(v)) el.innerHTML=v; else el.textContent=v;
    });
    const sel=document.querySelector(".lang-select");
    if(sel) sel.value=lang;
    document.documentElement.lang=lang==="zh"?"zh-CN":lang==="zh-TW"?"zh-Hant":lang==="en"?"en":"lzh";
  }
  window.SI18N={t,apply,get lang(){return lang},set vars(o){Object.assign(vars,o)},get vars(){return vars}};
  document.addEventListener("change",e=>{
    const sel=e.target.closest(".lang-select");
    if(sel){lang=sel.value;localStorage.setItem(KEY,lang);apply();}
  });
  document.addEventListener("DOMContentLoaded",()=>apply());
})();
