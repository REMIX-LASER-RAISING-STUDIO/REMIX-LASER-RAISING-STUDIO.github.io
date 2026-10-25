# 4 个包变成 6 个包：发布流水线里的三次翻车

启动器本身的 bug 至少在本地能复现。发布脚本的 bug 只在你以为万事俱备、准备发版的时候才现形，而且往往发现不了——因为没人会去下载每一个包解压检查。

10 月 11 日这一天，我们把这些坑挨个踩了一遍。

## 起点：GUI 和 CLI 得分开

10 月 3 日 17:14，第一版分离发布：GUI 一个包、CLI 一个包，更新弹窗给两个选项。同一天 18:29 定下四包结构和「签名暂停点」——构建自动化跑到签名前停下，由人手动签，签完再继续压缩。

四包的设计意图是「自包含 / 轻量」乘「合体 / 单独」：

| 包 | 内容 |
| --- | --- |
| `Chert-Launcher-{ver}-win-x64.zip` | GUI + CLI 合体·自包含 |
| `Chert-Light-{ver}-win-x64.zip` | GUI + CLI 合体·轻量 |
| `Chert-Launcher-{ver}-win-x64-gui.zip` | 仅 GUI·自包含 |
| `chert-cli-{ver}-win-x64.zip` | 仅 CLI·自包含 |

看起来对称，其实漏洞在「轻量」那一半：只有合体轻量，没有单独的轻量 GUI 和轻量 CLI。

## 第一次翻车：Chert-Light 里其实是两个 exe

13:37 发现 `Chert-Light` 名义上是「GUI + CLI 合体轻量」，实际组装逻辑对不上——它缺少真正的 `both-light` 构建步骤。

改法是让 `both-light` 由 `gui-light` 和 `cli-light` **合并产出**，新增 `cli-light` 构建步骤。这样四个包才严格对应「合并自包含 / 合并轻量 / GUI 自包含 / CLI 自包含」四种组合。

## 第二次翻车：exe 名字和 AssemblyName 绑在一起

13:53。GUI 主程序的交付名要统一成小写的 `chert launcher.exe`。

问题在于这个项目里有两个「名字」：`AssemblyName` 和产物文件名。之前的做法是直接改 `AssemblyName`，但这会带出两个连锁问题——WPF 的资源路径和 `ApplicationIcon` 失效，以及和 CLI 的 NuGet 包撞名。

正确做法是保持 `AssemblyName = Chert.App` 不变，用 csproj 里的 `RenameLauncherToChert` 目标**复制**成 `chert launcher.exe`。发布脚本负责后续所有引用。

同一笔还踩了 `NETSDK1151`：`cli-light` 必须改成 framework-dependent 多文件构建。合体包的 CLI 还要改名并扩展包含 `runtimeconfig` / `deps`，同时清理 `Chert.App.*` 残留。

还有个很扫兴但必须做的事：还原两个 `.cs` 文件被误归一化的畸形 `\r\r\n` 行尾。否则整个文件会被算成重写，diff 噪音大到没法 review。

## 第三次翻车：轻量包缺了半个运行时

13:59，最要命的一个。

`both-light` 组装时用的是「**仅复制 cli-light 里的 `chert.*`**」。而依赖是 `Chert.Core.dll`、`NAudio`、`QRCode` 这些——名字不以 `chert.` 开头，一个都没进去。

结果：`both-light` 只有 8 个文件，`chert-cli.exe` 一启动就崩。

如果没做「下载每一个包解压检查」这一步，这个包会带着「能下载、不能运行」的状态直接发出去。

改法是把「仅复制 `chert.*`」换成「复制整个 `cli-light` 目录」，然后清理循环补齐删除 `Chert.App.exe` / `.dll` / `.deps.json` 残留。重新构建验证：包含全部 CLI 依赖，`Chert.App.*` 已清理。

这类 bug 的共性是**通配符看起来像在「选你要的」，实际是在「悄悄丢你不要的」**。凡是靠 glob 复制依赖目录的地方，都该改成整目录复制再加排除。

## 15:30 — 换图标

`Claw/design/chert.ico` 覆盖到 `src/Chert.App/Resources/Chert.ico`，GUI 产物用新版品牌图标重新发布。

这件事本身不复杂，但它串起了更新源：同一天 01:00，`UpdateInfoUrl` 从旧的工作室站点迁到启动器专属的 `https://chert-launcher.github.io/latest.json`，WPF / Linux / Android 三端共用同一份。

一个必须注意的兼容性事实：**2.6.0 之前已发布的旧版二进制仍然读旧地址**。所以旧地址不能立刻下线。

## 16:16 — 补成六个包

按最终约定，补上两个缺失的轻量分离包：

| # | 包名 | 类型 |
| --- | --- | --- |
| 1 | `Chert-Launcher-{ver}-win-x64.zip` | 合体·自包含 |
| 2 | `Chert-Light-{ver}-win-x64.zip` | 合体·轻量 |
| 3 | `Chert-Launcher-{ver}-win-x64-gui.zip` | 仅 GUI·自包含 |
| 4 | `chert-cli-{ver}-win-x64.zip` | 仅 CLI·自包含 |
| 5 | `Chert-Light-{ver}-win-x64-gui.zip` | 仅 GUI·轻量（新增） |
| 6 | `chert-cli-light-{ver}-win-x64.zip` | 仅 CLI·轻量（新增） |

`zip_all` 增加 `gui-light` / `cli-light` 两个压缩目标，同步更新 `latest.json` 的 `cliLight*` / `guiLightAvailable` 字段。

有个细节：6 个源目录和 8 个 exe 其实早就构建好了，**只是压缩步骤漏了这两个目标**。所以这个「功能」的完整实现只有 24 行 shell。

## 一天的账

| 时间 | 事件 |
| --- | --- |
| 01:00 | 更新源迁到专属站点，三端共用 |
| 13:37 | `Chert-Light` 缺 `both-light` 构建步骤 |
| 13:53 | exe 命名与 `AssemblyName` 解耦 + `NETSDK1151` |
| 13:59 | 轻量包缺 `Chert.Core.dll`（glob 陷阱） |
| 15:30 | 官方图标替换 |
| 16:16 | 四包 → 六包 |

三次翻车全在同一天下午的 22 分钟里，而且都是「构建成功、包也在、就是不能用」。

发布脚本最大的特点是**沉默**。它不会告诉你「这个包少了依赖」，只会安静地产出一个坏 zip，然后等你发出去。所以现在每次发版前固定做一件事：把六个包全下下来、全解压、把每个 exe 都跑一次 `--version`。

这一步看起来笨，但它是唯一能拦住上面第三类 bug 的办法。
