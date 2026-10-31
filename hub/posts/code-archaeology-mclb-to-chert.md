# 代码考古：从 MCLB 到 Chert，一个启动器的三次投胎

所有伟大的软件，最初可能都只是一个随时会崩溃的 `.bat` 脚本。

如果你现在打开 CNB 仓库的 `history` 分支，会看到一个叫 **批处理原型** 的文件夹。那里藏着 Chert 真正的祖先——MCLB。它没有版本号，没有 README，甚至没有一个像样的文件名，但它确实是这一切的起点。

一个启动器要活下来，得投三次胎。

## 第一次投胎：MCLB，纯 BAT 的黑暗岁月

MCLB，Minecraft Launcher Basic。

名字里的 Basic 不是自谦，是纪实。它没有 UI，只有一个纯黑的控制台窗口：

```bat
@echo off
title MCLB - Minecraft Launcher Basic
:menu
cls
echo ================================
echo   1. 启动游戏
echo   2. 下载版本
echo   3. 设置
echo   4. 退出
echo ================================
set /p choice=请选择: 
if "%choice%"=="1" goto launch
if "%choice%"=="2" goto download
goto menu
```

菜单用 `echo` 一条一条拼出来，流程用 `goto` 跳转。那时候觉得挺酷——现在回头看，这就是一个用字符串硬编码出来的状态机。

真正的地狱在 JSON。

现代 Minecraft 的版本清单是嵌套极深的 JSON：`libraries` 里套 `downloads`，`downloads` 里套 `artifact`，还有 `rules` 数组要根据操作系统决定哪一条生效。用纯 BAT 去匹配大括号、冒号和转义符，等于用一把卷尺去拧螺丝。

那段时间的日志里最多的是两句话：**极不稳定** 和 **极严格**。BAT 的报错不会告诉你哪一行错了，它只会告诉你「此时不应有 xxx」。你得像考古一样，一层层 `echo` 出来定位。

在那个反复被报错教训的过程里，我明白了一件很朴素的事：

> 纯 BAT 写不了现代启动器。不是我不够努力，是这门语言的表达能力到顶了。

## 第二次投胎：MCLB P，BAT 与 PowerShell 混合双打

为了活命，我引入了 PowerShell。P 就是 PowerShell 版。

分工很清晰，因为当时我只会这么干：

| 层 | 负责 |
| --- | --- |
| BAT | 界面、菜单、流程跳转 |
| PowerShell | 网络请求、JSON 解析、文件校验 |

BAT 继续当那张脸，PowerShell 干脏活。`Invoke-WebRequest` 拉清单、`ConvertFrom-Json` 解析、`Get-FileHash` 校验完整性，这些在 BAT 里根本没法写的操作，换到 PowerShell 里几行就完事。

我甚至在 BAT 里用 `findstr` 硬写了一个「崩溃分析器」：

```bat
findstr /i /c:"java.lang.OutOfMemoryError" "%log%" >nul && set CRASH=内存不足
findstr /i /c:"Duplicate mods" "%log%" >nul && set CRASH=Mod 冲突
findstr /i /c:"Unsupported class file major version" "%log%" >nul && set CRASH=Java 版本过高
```

用字符串匹配去猜崩溃原因，粗糙得可笑，但它是有效的——大部分崩溃的日志特征就那么几种。

这个阶段，启动器终于能稳定地把游戏拉下来了。它不优雅，但它能跑。对一个工具来说，「能跑」是唯一重要的门槛。

## 第三次投胎：MCLCS 到 Chert，C# 的涅槃

需求一直在膨胀：多版本隔离、Mod 管理、崩溃自愈、下载加速、HUD 覆盖层……脚本的极限彻底暴露。

问题不是「写不出来」，而是「写出来维护不了」。一个两千行的 BAT，改一行要祈祷三分钟。

于是彻底转向 C#。

从最初的 MCLCS 起步，中间还经历了一场四天五步的改名危机——**305 个文件的命名空间硬迁移**，中途还把启动搞崩过一次（`Run.Text` 的默认 TwoWay 绑定试图写回只读的 `Count`）。这些坑后来都写进了另一篇文章，这里只说结果：

它变成了今天的 Chert（燧石）。

原生多线程、P2P 打洞联机、游戏内 HUD 自愈、四套并行的 UI 设计语言……这些东西在 BAT 时代连想都不敢想，不是因为那时不想做，是因为那时**没有地方放这些想法**。

## 三次投胎的对照

| 代 | 技术栈 | 能做的事 | 死因 |
| --- | --- | --- | --- |
| MCLB | 纯 BAT | 菜单、跳转、简单下载 | 解析不了 JSON |
| MCLB P | BAT + PowerShell | 完整下载链路、崩溃粗判 | 无法维护、无法扩展 |
| Chert | C# / WPF | 多线程、联机、HUD、多语言 | 还活着 |

## 那些 .bat 还躺在分支里

它们跑不动 1.20 的复杂环境，连现在的 Java 版本都认不出来。留着它们没有任何工程价值。

但还是留着。

因为每一次重构的底气，其实都来自上一次的失败。你看得见 Chert 现在的样子，看不见的是它背后大概有过几十个删掉的 `goto` 标签、几十次「此时不应有」的报错，和一个在网吧里反复按 F5 试脚本的人。

> 附：[CNB `history` 分支源码](https://cnb.cool/RLRS-Studio/Chert-WPF/-/tree/history) —— 批处理原型文件夹就在里面，欢迎考古。

三次投胎，三次都是被上一代的极限逼出来的。如果哪天 Chert 也被逼到要投第四次，我大概还是会照做。
