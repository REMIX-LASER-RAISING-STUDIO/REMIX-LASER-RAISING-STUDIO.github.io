# 代码考古：从 MCLB 到 Chert，一个启动器的三次投胎

所有伟大的软件，最初可能都只是一个随时会崩溃的 `.bat` 脚本。

打开 CNB 仓库的 `history` 分支，有一个叫 **批处理原型** 的文件夹。里面五个代码文件：

| 文件 | 行数 | 干什么 |
| --- | --- | --- |
| `mclb.bat` | 627 | 主菜单、版本选择、安装调度、崩溃善后 |
| `crash_analyzer.bat` | 105 | 读 crash-report，猜崩溃原因 |
| `install_java.bat` | 139 | 检测 Java 版本，自动装 JDK 21 |
| `mclb_launcher.ps1` | 204 | 拼 JVM 参数、真正拉起游戏 |
| `mclb_downloader.ps1` | 123 | 从 Modrinth 搜 Mod / 光影 / 材质 |

旁边还有一份两行的 md，标题是「梦开始的地方」。全文就一句话：

> 本来只是想搓一个极轻量的启动器，但是原生 Windows 脚本实在太弱了……客观来看确实 batch 结合 powershell 的上限比较低，遂更名 MCLCS 启动了 C# 化计划。

这是我给那个文件夹留的墓志铭。现在把坟挖开看看。

## 第一次投胎：纯 BAT

MCLB，Minecraft Launcher Basic。名字里的 Basic 不是自谦，是纪实。

它没有 UI，只有一个 80 列的黑框。主菜单长这样，就是 `mclb.bat` 开头那二十行，一个字没改：

```bat
:main_menu
title MCLB Minecraft 启动器 v1.0
cls
echo ════════════════════════════════════════════════════════════════
echo                     MCLB Minecraft 启动器 v1.0
echo ════════════════════════════════════════════════════════════════
echo.
echo [1] 启动游戏
echo [2] 安装新版本 (Vanilla/Fabric/Forge)
echo [3] 下载 Mod / 光影 / 材质包
echo [Q] 退出
echo.
set /p choice=请选择:

if /i "%choice%"=="1" goto :launch_game
if /i "%choice%"=="2" goto :install_version
if /i "%choice%"=="3" goto :download_menu
if /i "%choice%"=="q" exit /b
goto :main_menu
```

`echo` 拼界面，`goto` 跳流程，`set /p` 收输入。现在回头看，这就是一个用字符串硬编码出来的状态机——只不过状态转移写在标签里，历史记录要靠 `cls` 清掉。

那时候最自豪的技巧是「用变量名当数组」。因为 BAT 没有数组，所以只能这么干：

```bat
set "ver_count=0"
for /d %%d in ("%VERSIONS_DIR%\*") do (
    set /a ver_count+=1
    set "ver_name_!ver_count!=%%~nxd"
    echo [!ver_count!] %%~nxd
)
...
set /p ver_choice=请选择版本编号:
call set "SELECTED_VER=%%ver_name_%ver_choice%%%"
```

`ver_name_1`、`ver_name_2`、`ver_name_3`……需要哪个就拼出变量名再 `call set` 二次展开。`%%ver_name_%ver_choice%%%` 这一串百分号，当年是查了三个论坛才写出来的。它不是炫技，是没有别的办法。

## 真正的地狱不是 JSON，是把 JSON 递给 PowerShell

所有讲这件事的人都爱说「BAT 解析不了 JSON」。这话对，但不够疼。

真正的疼在传递。

版本清单里的 `assetIndex.id` 得拿出来当参数用。BAT 自己读不了 JSON，只能请 PowerShell 读，但 PowerShell 的输出要回到 BAT 的变量里，中间必须过一个临时文件：

```bat
powershell -Command "$json = Get-Content '%VERSION_DIR%\*.json' -Raw | ConvertFrom-Json; if ($json.assetIndex) { Write-Host $json.assetIndex.id }" > "%TEMP%\asset_idx.txt" 2>nul
set /p ASSET_INDEX=<"%TEMP%\asset_idx.txt"
del "%TEMP%\asset_idx.txt" 2>nul
if "%ASSET_INDEX%"=="" set "ASSET_INDEX=legacy"
```

写一行，落盘，读回来，删掉。就为了取一个字符串。

如果逻辑不止一步，`-Command` 的单行就撑不住了——我量过，`install_vanilla` 里那条下载 version.json 的命令一整行 300 多字符，全在一行里，没有任何换行余地。所以后来学会了更土的办法：**用 BAT 逐行 echo 出一个 .ps1，再执行它。**

```bat
set "DL_LIBS_PS=%TEMP%\mclb_dl_libs.ps1"
>  "%DL_LIBS_PS%" echo $json = Get-Content '%VERSION_DIR%\%FULL%.json' -Raw ^| ConvertFrom-Json
>> "%DL_LIBS_PS%" echo $libDir = '%LIBRARIES_DIR%'
>> "%DL_LIBS_PS%" echo foreach ($lib in $json.libraries) {
>> "%DL_LIBS_PS%" echo     if ($lib.downloads.artifact.url) {
>> "%DL_LIBS_PS%" echo         $fullPath = Join-Path $libDir $lib.downloads.artifact.path
>> "%DL_LIBS_PS%" echo         if (-not (Test-Path $fullPath)) {
>> "%DL_LIBS_PS%" echo             try { Invoke-WebRequest -Uri $url -OutFile $fullPath -UseBasicParsing } catch { Write-Host "失败: $_" }
>> "%DL_LIBS_PS%" echo         }
>> "%DL_LIBS_PS%" echo     }
>> "%DL_LIBS_PS%" echo }
powershell -ExecutionPolicy Bypass -File "%DL_LIBS_PS%"
del "%DL_LIBS_PS%" 2>nul
```

注意那个 `^|`。PowerShell 的管道符在 BAT 里必须转义成 `^|`，否则 BAT 会先把这一行从管道处切开，把后半句当成另一个命令。整份 `mclb.bat` 里这样的 `echo` 有一百六十多行、二十个 `^|`，只要漏一个 `^`，生成出来的脚本就是坏的，而 BAT 不会告诉你哪里错了——它只会把那一行原样打进控制台，然后继续往下跑，你在后面几十行之后才发现报错。

这套「生成器写在生成器里」的写法，本质上是**用一个没有语法结构的语言，去承载另一个有语法结构的语言**。它能跑，但每加一个功能都是在往脖子上缠一圈线。

顺带一句，那段时间我顺手做了个软链接式的小优化：`unzip` 依赖和 natives 全部走 `Test-Path` 缓存判断，已存在就跳过。不是因为聪明，是因为 `Invoke-WebRequest` 一个文件要几秒，一次完整安装要下几百个库，中间断一次网就得从头再来。

## 第二次投胎：BAT 管脸，PowerShell 管手

所谓 MCLB P，并没有一次单独的改名。它长这样：`mclb.bat` 旁边多了两个 `.ps1`。

P 不是版本号，是分工。

| 层 | 文件 | 负责 |
| --- | --- | --- |
| 界面层 | `mclb.bat` | 菜单、版本选择、装配参数、崩溃善后 |
| 执行层 | `mclb_launcher.ps1` | 找 Java、读 JSON、拼 JVM 参数、拉起进程 |
| 网络层 | `mclb_downloader.ps1` | Modrinth 搜索、文件下载、塞进 mods |

分界点特别清晰，就是那句 `powershell -ExecutionPolicy Bypass -File`。BAT 负责问人，PowerShell 负责干活。

启动器的核心逻辑全在那个 ps1 里。它用 `param()` 接九个位置参数——版本目录、版本名、库目录、natives、游戏目录、资源目录、资源索引、内存、用户名——一个不能错，因为 BAT 传参是靠位置的，错一位就全乱。

里面最像「启动器」的一段是 Java 挑选。它不信任 `PATH`，会先去 `.minecraft\runtime` 里找 Minecraft 官方自带的那份 JRE：

```powershell
function Get-BestJava {
    $mcRuntime = Join-Path $env:APPDATA '.minecraft\runtime'
    if (Test-Path $mcRuntime) {
        Get-ChildItem $mcRuntime -Directory | Sort-Object Name -Descending | ForEach-Object {
            $java = Join-Path $_.FullName 'bin\java.exe'
            if (Test-Path $java) {
                $v = Get-JavaVersion $java
                if ($v -ge 21) { return $java }
            }
        }
    }
    $sysJava = (Get-Command java -ErrorAction SilentlyContinue).Source
    if ($sysJava) { return $sysJava }
    return 'java'
}
```

再往后是一张 `$vars` 替换表，把版本 JSON 里的 `${auth_player_name}`、`${assets_root}`、`${version_name}` 这些占位符换成实际值，最后拼成一条几百个字符的 `java -cp ... net.minecraft.client.main.Main --username ...` 命令。

一块一块看都不复杂。复杂的是这九块分在两个语言里，中间只靠九根位置参数连着——BAT 那边多传一个空格，PowerShell 这边就静默错位。

## 崩溃分析器：用 findstr 猜病

`crash_analyzer.bat` 是我当时最得意的东西，105 行，纯 `findstr`。

它先找到最新一份 crash-report（`dir /b /o-d *.txt` 取第一个），然后一条条匹配：

```bat
findstr /i "OutOfMemoryError" "%CRASH_FILE%" >nul
if %errorlevel% equ 0 echo [内存不足] 请增加分配给游戏的内存

findstr /i "UnsupportedClassVersionError" "%CRASH_FILE%" >nul
if %errorlevel% equ 0 echo [Java版本] 请使用 Java 17 或更高版本

findstr /i "GL error OpenGL" "%CRASH_FILE%" >nul
if %errorlevel% equ 0 echo [显卡问题] 请更新显卡驱动或关闭光影

for /f "delims=" %%e in ('findstr /i "Mod.*failed.*load" "%CRASH_FILE%" 2^>nul') do set "MOD_ERRORS=%%e"
if defined MOD_ERRORS echo [模组问题] 检测到模组加载失败

findstr /i "NoClassDefFoundError ClassNotFoundException" "%CRASH_FILE%" >nul
if %errorlevel% equ 0 echo [缺失依赖] 请检查是否缺少前置模组
```

一共六类：内存、Java 版本、显卡 / OpenGL、模组加载失败、缺失依赖。六条 if，覆盖了当时见过的绝大多数崩溃。粗糙得可笑，但它是有效的——大部分崩溃的日志特征就那么几种。

更值得说的是它怎么被叫起来。启动游戏后，BAT 会看两件事：

```bat
powershell -ExecutionPolicy Bypass -File "%MCLB_DIR%mclb_launcher.ps1" ...
set "EXIT_CODE=%errorlevel%"

dir /b "%VERSION_DIR%\crash-reports\crash-*.txt" 2>nul | findstr "." >nul
if %errorlevel% equ 0 (set "CRASH_EXISTS=1") else (set "CRASH_EXISTS=0")

if %EXIT_CODE% neq 0 (
    if !CRASH_EXISTS! equ 1 (
        echo 检测到崩溃报告，正在分析...
        call "%MCLB_DIR%crash_analyzer.bat" "%SELECTED_VER%"
    )
)
```

退出码非 0 **且** 目录里真躺着 crash-*.txt，才认定是崩溃。为什么不只看退出码？因为玩家点关闭窗口的按钮，退出码也是非 0。这个坑我踩过。

还有一处细节挺有人味：每次启动前，它会把上一轮的崩溃报告挪进 `archive_<日期>_<时间>` 子目录。

```bat
if exist "%VERSION_DIR%\crash-reports\*.txt" (
    set "archive_dir=%VERSION_DIR%\crash-reports\archive_!timestamp!"
    mkdir "!archive_dir!" 2>nul
    move "%VERSION_DIR%\crash-reports\*.txt" "!archive_dir!\" >nul
)
```

理由很朴素：如果不挪走，下次崩溃分析器会把上一次的旧报告当成这次的来分析，然后给你一个完全错误的结论。这是被误导过几次才加上的。

## Java 自举：装不上就换源

`install_java.bat` 是这批文件里唯一一个「用户体验」做得比功能复杂的。

先查有没有：`where java` 找到后跑 `java -version`，用 `tokens=3 delims=. ` 抠出主版本号，`GEQ 21` 就放过。没有的话开始装，两级回退：

1. Oracle JDK 21，请求里带 `oraclelicense=accept-securebackup-cookie` 那个著名的 Cookie；
2. 下载完先量体积，`%%~zA` 小于 1MB 就判定为下载不完整，删掉换源；
3. 换 Eclipse Temurin（Adoptium）的 MSI；
4. 装完再跑一遍 `:check_java_version 21` 验证，不通过就继续往下走。

这套东西现在看很笨，但当时它是必须的——启动器不会装 Java，用户就永远卡在第一步，而我收到的反馈全是「双击没反应」。

## 第三次投胎：C#

需求一直在膨胀：多版本隔离、Mod 管理、崩溃自愈、下载加速、HUD 覆盖层……脚本的极限彻底暴露。

问题不是「写不出来」，而是「写出来维护不了」。八百七十多行 BAT 加三百多行 PowerShell，改一个参数要想清楚它跨了几个语言边界，还要记住命令行转义规则。

于是彻底转向 C#。

从最初的 MCLCS 起步，中间经历了一场四天五步的改名危机——305 个文件的命名空间硬迁移，中途还把启动搞崩过一次（`Run.Text` 默认 TwoWay 绑定试图写回只读的 `Count`）。这些坑后来都写进了另一篇文章，这里只说结果：

它变成了今天的 Chert（燧石）。

原生多线程、P2P 打洞联机、游戏内 HUD 自愈、四套并行的 UI 设计语言……这些东西在 BAT 时代连想都不敢想，不是因为那时不想做，是因为那时**没有地方放这些想法**。

## 三代对照

| 代 | 技术栈 | 真实能做的事 | 死因 |
| --- | --- | --- | --- |
| MCLB | 纯 BAT | 菜单、版本选择、拼命令行 | 取不出 JSON 里任何一个字段 |
| MCLB P | BAT + 2 个 PS1 | 完整下载链路（原版 / Fabric / Forge）、崩溃粗判、Java 自举 | 九个位置参数、生成器写生成器、无法扩展 |
| Chert | C# / WPF | 多线程、联机、HUD、多语言、自更新 | 还活着 |

顺带一个时间线的旁证，是我自己写在 `history/README.md` 里的：

```
批处理 / PowerShell 原型（.bat / .ps1 手搓期，本仓库最早雏形）
  └─ UI 迭代原型（纯 HTML 探索期）
       └─ v0.1 – v1.1（WPF 起步 + 下载中心 + 崩溃修复）
            └─ v2.0 – v2.4（重写期）
```

`批处理原型` 是这条链的最底下一格，没有它就没有上面三格。

## 那些 .bat 还躺在分支里

它们跑不动 1.20 的复杂环境，连现在的 Java 版本都认不出来，`crash_analyzer.bat` 里那句「请使用 Java 17 或更高」现在也不算对。留着它们没有任何工程价值。

但还是留着。

因为每一次重构的底气，其实都来自上一次的失败。你看得见 Chert 现在的样子，看不见的是 `mclb.bat` 里那 55 个标签、45 次 `goto`、一百六十多行手写转义的 `echo`，和一堆「其实我知道这样写很丑但先让它跑起来」的决定。

> 附：[CNB `history` 分支源码](https://cnb.cool/RLRS-Studio/Chert-WPF/-/tree/history) —— `history/批处理原型` 文件夹就在里面，五个文件，欢迎考古。

三次投胎，三次都是被上一代的极限逼出来的。如果哪天 Chert 也被逼到要投第四次，我大概还是会照做。
