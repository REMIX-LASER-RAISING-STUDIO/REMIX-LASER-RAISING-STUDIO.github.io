# 微软登录这三天：我们推翻了自己三次

微软账号登录是启动器的入场券，也是最容易劝退人的一关。这一段我们连改了三次，每次都是「上一版看着对、一跑就废」。

记下来，省得以后有人再走一遍。

## 第一次：授权码流 + 本地回环

9 月 1 日凌晨 1 点 13 分，第一版落地。

思路很标准：OAuth2 授权码流，生成 PKCE 的 `code_verifier` / `code_challenge`，起一个 `HttpListener` 监听 `http://localhost:{port}/`，打开浏览器登录，回跳时捕获 `code`，换 token。

client_id 用的是 `00000000402b5328`——微软官方那个已经在 XboxLive 白名单里的。为什么不用自己注册的 Azure 应用？因为**自建应用申请不到 XboxLive 作用域**，这条路从根上就断了。

## 第二次：改成粘贴回跳地址

7 分钟后就被打回。

`http://localhost/mclcs/` 报 `redirect_uri` 无效。查社区文档才确认：这个 client_id 注册的 `redirect_uri` 是**写死的** `https://login.live.com/oauth20_desktop.srf`。

改法是把端点退回到 live.com 的 v1 授权码流（`oauth20_authorize.srf` + `oauth20_token.srf`），scope 换成 `service::user.auth.xboxlive.com::MBI_SSL`，PKCE 保留。

代价很丑陋：回跳落在微软自己的页面上，本地 loopback 根本捕不到。只能打开系统浏览器，然后**让用户自己把地址栏里的完整 URL 复制粘贴回来**，启动器再解析出 `code`。

那版用的是 `Microsoft.VisualBasic.Interaction.InputBox` 弹一个输入框。现在回头看，这个交互堪称反人类——但它至少能跑通。

顺手还移除了设备流回退，因为当时判断「这个 client_id 的设备流已被微软限制」。

## 第三次：回到设备代码流

9 月 2 日晚上 23:53。上一个判断是**错的**。

真正的问题不是设备流被限制，而是**端点配错了**——旧实现把设备码端点指到了 `live.com/oauth20_token.srf`。同时 `desktop.srf` 回跳实测压根不带 `code`（截图确认过）。两条路都不通，被误判成了「设备流不可用」。

换回正确的设备代码流：

- 端点走 `login.microsoftonline.com/consumers` 的 v2.0
- scope 用 `XboxLive.signin offline_access`
- **完全不需要 `redirect_uri`**

流程变成：拿设备码 → 弹窗显示给用户 → 用户去网页输码 → 启动器后台轮询换 token。没有浏览器跳转，没有地址栏复制，没有 `InputBox`。

同一晚还补了一件事：`client_id` 改为用户在设置里可填，留空则用内置默认值。万一哪天官方那个 client_id 也失效，用户至少能自己申请一个顶上，不用等我们发版。

## 三次踩完之后剩下什么

| 尝试 | 端点 | 回跳方式 | 结果 |
| --- | --- | --- | --- |
| 授权码流 + loopback | v1 | localhost 自动捕获 | redirect_uri 无效 |
| 授权码流 + 手贴地址 | v1 live.com | 用户复制地址栏 | 能跑，交互恶劣 |
| 设备代码流 | v2.0 consumers | 无需回跳 | 采用 |

后端那三段（Xbox Live 认证 → XSTS 授权 → Minecraft 服务换取）从头到尾没动过，三轮折腾全在第一步。

有个教训值得单独说：**把「功能不可用」当成平台限制之前，先怀疑自己端点写错了。** 我们因为一次端点错配，写死了一个「设备流被限制」的结论，白白多绕了两天。
