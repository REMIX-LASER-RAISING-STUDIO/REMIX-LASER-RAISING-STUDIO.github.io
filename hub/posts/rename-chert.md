# 改名比想象中难：从 MCLCS 到 Chert

一个启动器叫什么名字，听起来是运营问题，做起来全是工程问题。

从 9 月 10 日到 9 月 13 日，四天，改名这件事分了五步才落地。

## 第一步：先只改展示名，然后回退

9 月 10 日深夜 23:50，第一次尝试——只改中文展示名，软件里叫「朗希夏」，内部标识一个都不动。

第二天凌晨 01:19 就回退了：窗口标题退回去，只有解释性文字里保留「朗希夏」。

原因很简单：**外部标识改了、内部没改，会造出一堆「同一件事两个名字」的地方**。标题写朗希夏、进程名写 MCLCS、日志文件叫 `mclcs_crash.log`，用户报问题时自己都说不清在讲哪个。

半改不如不改。

## 第二步：一次全量，内部也改

9 月 12 日凌晨 01:44。这次按验收结论一次做透：

- 核心常量：`LauncherName` 从 `MCLCS` 改 `Chert`，展示名从「朗希夏」改「燧石启动器」
- 多语言：`app.title` / `app.launcher` / `settings.about.desc` 的简繁英三套一起改
- 界面：主窗口标题与 Logo、托盘提示、`UIService` 标题、崩溃文案
- 日志文件名：`mclcs_crash.log` → `chert_crash.log`
- User-Agent：`LauncherService` / `MicrosoftAuthenticator` / AI 助手三处
- 临时目录：`IconCache` / `UpdateDialog` / AI 助手的 Temp 子目录
- 自检：两处 `app.title` 断言同步，否则自检自己会失败

exe 产物名单独处理：csproj 里加 `RenameLauncherToChert` 目标，把 `MCLCS.App.exe` 复制成 `Chert Launcher.exe`，同时清理旧名。

## 第三步：命名空间和程序集

9 月 13 日凌晨 00:25。上一步只改了用户能看见的，代码里的 `MCLCS.App` / `MCLCS.Core` / `MCLCS.Cli` / `MCLCS.SelfCheck` 还都在。

这次用 `git mv` 加内容替换，**动了 305 个文件**：命名空间、程序集名、工程文件、`Resources/MCLCS.ico` → `Chert.ico`、`MCLCS.sln` → `Chert.sln`。

有两个坑值得写下来：

**`.sln` 文件是 UTF-16 的，重建时首行不能有空行**，否则 MSBuild 直接抛 `MSB5010`。

**AssemblyName 故意保持不变**，仍然是 `Chert.App`，只让产物文件叫 `chert launcher.exe`。因为改 AssemblyName 会带出两个连锁问题：WPF 的资源路径与 `ApplicationIcon` 失效，以及和 CLI 的 NuGet 包撞名。这条后来一路沿用到发布脚本里。

## 第四步：补繁中，三语齐平

9 月 13 日 16:54。改名之后顺手把本地化做全：繁中字典用 OpenCC 从简体生成，简繁英三套各 **795 键**，逐键 parity。

技术上是换了一个自定义 MarkupExtension：所有页面和弹窗换成 `theme:Loc`，订阅 `LocaleChanged`，切语言即时刷新，不用重启。

同一笔还统一了弹窗动画：`AnimationHelper.PlayModalEnter`，淡入加上移 24px 缓出，受全局「动画开关」门控——关掉时直接落终态，不做半截动画。

## 第五步：一个 Run.Text 把启动搞崩了

17:32，40 分钟后。

启动即崩，`InvalidOperationException`。

根因是本地化时把「共 N 项」这句改成了：

```xml
<Run Text="{Binding Queue.Count}" />
```

`Run.Text` 的默认绑定模式是 **TwoWay**。绑定源是只读的 `Count` 属性，WPF 尝试写回时直接抛异常。

只读源属性必须显式写 `Mode=OneWay`。全项目扫了一遍，只有 `DownloadPageView:513` 和 `ServerPackView:86` 两处命中——其余 `.Count` 绑定都落在 `Visibility` / `TextBlock.Text` / `DataTrigger` 这些 OneWay 目标上，没受影响。

## 四天五步之后

| 时间 | 动作 | 结果 |
| --- | --- | --- |
| 09-10 23:50 | 只改中文展示名 | 次日回退 |
| 09-12 01:44 | 全量改用户可见部分 | 采用 |
| 09-13 00:25 | 命名空间 + 程序集（305 文件） | 采用 |
| 09-13 16:54 | 三语齐平 795 键 | 采用 |
| 09-13 17:32 | `Run.Text` TwoWay 崩溃 | 修掉 |

回头看，第一次的失败反而是最有价值的：它证明了「展示名和内部名可以分开改」这个直觉是错的。用户遇到问题时描述的是现象，不是分层——你让他看到两个名字，他就没法描述清楚了。

改名这件事没有「低成本方案」，只有「做一半，然后被一半的状态折磨」。
