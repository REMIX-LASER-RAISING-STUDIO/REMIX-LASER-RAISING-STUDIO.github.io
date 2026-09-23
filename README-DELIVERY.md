# 官网重构包 · 使用说明

## 覆盖关系
【覆盖】css/style.css、index.html、chert/index.html、chert/wpf/index.html、chert/android/index.html
【新增】changelog/、404.html、_headers、launcher/config.json、js/site-i18n.js、js/layout.js、js/embers.js、js/seasonal.js、js/release.js
【保留勿动】js/i18n.js（旧页面 /sr/ /join/ 仍在用）、js/download.js、js/particles.js、favicon.svg、robots.txt、sitemap.xml、BingSiteAuth.xml、chert-upgrade/、chert/wpf/ui-preview.html、join/、sr/

## 本次解决的问题
1. 版本号零硬编码：全部页面从 chert-upgrade/latest.json 注入（release.js / changelog 内联脚本）
2. .NET 8/10 不一致：统一输出 .NET 10（release.js 中 runtime 字段，唯一修改点）
3. 品牌统一：RLRS Studio · REMIX 激越工作室
4. 新增 changelog 页（download.js 注释里的待办）
5. 新增 404
6. 导航/页脚单源化：js/layout.js 注入，以后改导航只改一个文件
7. 节日系统上线：launcher/config.json + seasonal.js，自动换强调色、火星粒子色、顶部横幅

## 背景新样式
极光渐变光斑 + 点阵网格 + 上升金色火星粒子（尊重 prefers-reduced-motion）。
旧星座粒子 particles.js 保留未用，想换回把 canvas 的 id 换回去即可。

## 上线步骤
1. git tag before-redesign 备份
2. 本包内容覆盖到仓库根目录
3. git status 核对【保留勿动】列表未被修改
4. push → GitHub Pages 与 CF Pages 自动部署
5. 检查 /、/chert/、/changelog/、/chert/android/、404

## 已知事项
- 语言切换：新页面用 site-i18n.js（键 rlrs-site-lang），旧页面用 i18n.js，两者暂不同步，过渡期可接受
- /sr/、/join/ 仍是旧版式，视觉略不统一，下次迭代再重构
- sitemap.xml 建议加入 /changelog/
