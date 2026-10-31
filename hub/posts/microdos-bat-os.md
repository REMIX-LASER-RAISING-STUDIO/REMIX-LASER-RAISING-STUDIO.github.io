# MicroDOS：用尽一生知识的纯 BAT 艺术

在拥有 C# 和 19 亿 Token 之前，我曾用一个 `.bat` 文件，硬生生敲出了一个「操作系统」。

整理旧硬盘时，翻出一个叫 **微数 v25.0 BETA.bat** 的文件。24997 字节，1170 行，修改日期停在 2023 年 8 月 10 日。

文件头第一段不是代码，是 Bat To Exe Converter 的配置块——十八行 `::YAwzoRdxOk+EWAjk` 这样的乱码。意思是：它后来被编译成 exe 了。

再往下是当年写的声明：

```bat
rem REMIX LASER RISING STUDIO 版权所有,严禁抄袭!!!
rem 如果您有意见,请联系作者qq:1980286392
rem B站:搜索REMIX
```

那个 QQ 号现在还能搜到我自己。当时我以为这就是「正式发布」该有的样子。

## 它不是一个文件，是一条产线

这是重看时最意外的事。我以为自己只写过一个小玩具，实际上硬盘里躺着一个完整的版本线，从 2022 年 12 月跑到 2023 年 8 月：

| 日期 | 产物 |
| --- | --- |
| 2022-12-03 | `SYSTEM TOOLS v1.0 / v5.0 / v6.0`，126–137 行，前身 |
| 2022-12-23 | `MICRODOS v10.0.exe` + `SETUP v1.0`，第一次编译成 exe |
| 2023-02-26 | 分叉出 `U盘版 v6.0`（2680 行）和 `精简版 v6.0` |
| 2023-05-14 | `微DOS v21.0.bat`，1116 行，第一次破千 |
| 2023-06-29 | `Version 24.0 22H2`，连命名都学 Windows |
| 2023-08-10 | `微数 v25.0 BETA.bat`，1170 行，最后一个版本 |

一共二十个 `.bat`（含安装程序）、十八个编译出的 exe、六个安装程序、四个 iso。最大的一份不是主程序，是 `微DOS 标准OFFICE 365 v24.0 版.bat`——9859 行，比主程序长八倍。

所以「一个 bat 写了个操作系统」这个说法，其实还低估了。真实情况是：一个初中生在八个月里，用一门没有函数、没有数组、没有作用域的语言，维护了一个有分支产线、有安装程序、有版本号的产品。

## 启动序列：三层门，全是假的

微数最「操作系统」的地方，是它假装自己是 cmd。

第一层，双击之后出现的是一个伪命令提示符，路径是当前目录：

```bat
:microdos2
set "a=x"
set /p a=%cd%^>
if /i "%a%" equ "MICRODOS" (
    cd /d %~dp0
    goto :password
)
goto :microdos2
```

输入 `MICRODOS`（大小写不敏感）才进得去。当年觉得这叫仪式感，现在知道这叫「把用户挡在门外」。

第二层是软件密码：

```bat
set /p a=Please enter the software password:
if "%a%"=="RS17G35-ED28H46-MF39J57-IG40K68-XH51L79" goto :crlogin
if /I "%a%"=="test" goto :dos
```

一串仿 Windows 产品密钥格式的自制序列号，五段、每段八位。输对之后，它把这串东西写进 `data\Proxy verification protocol.microdos` 这个文件——下次启动检测到文件就直接放过：

```bat
if exist "Proxy verification protocol.microdos" (
    echo You have used MICRODOS before, so this time we will help you skip the verification.
)
```

现在看这段会脸红：**密码是硬编码在源码里的明文，验证方式是自己往磁盘上写一个通行证文件，而 `test` 是一年后门**。三层「安全」里，没有一层是真的安全。

但它是同一个思路的雏形——后来 Chert 里的令牌校验、本地凭据缓存，无非是同一件事做对了版本。

第三层门又是一道伪提示符，这次伪装成 `C:\>`：

```bat
set /p a=C:\^>
if /I "%a%"=="win" goto :win
if /I "%a%"=="fill" goto :fill
if /I "%a%"=="disk" goto :hh
if /I "%a%"=="shutdown" goto :microdos
```

`win` 进系统、`fill` 进危险工具、`shutdown` 退回第一层。两个伪 cmd 套一个密码页，这就是当年的「引导程序」。

## 账号系统：用一行文本当数据库

用户表是一个叫 `urini.ini` 的文本文件。但它不是 ini——没有分段、没有键值对，**每个用户就是一行字符串**：

```
USER_NAME:remix_PASSWORD:123456
USER_NAME:guest_PASSWORD:guest
```

登录就是拼串比对，用 `findstr` 的 `/x` 做整行精确匹配：

```bat
set /p str1=Enter the USER NAME:
set /p str2=Enter the password:
findstr /x /c:"USER_NAME:!str1!_PASSWORD:!str2!" "urini.ini" 1>nul && (
    color 27
    echo Welcome To MICRODOS!
    goto :dos
) || (
    color 47
    echo ERROR!
    goto :login0
)
```

`/x` 是关键。不加它，`findstr` 是子串匹配，输个 `USER_NAME:r` 就能登进 `remix` 的账号。

这个格式有个致命缺陷：用户名和密码里都不能出现下划线和冒号，否则会串位。当年不懂，只觉得「一行搞定真省事」。

注册就是往文件尾部追加一行；删除用户是把不匹配的行重写一遍；管理员重置是把整个文件干掉重建——注意这一段的变量名拼错了，`urini.ini` 被写成了 `urni.ini`，所以 `del` 永远删不到东西，但下一句 `null>urini.ini` 又把文件清空了，于是它「碰巧能用」：

```bat
:reset3
del urni.ini
null>urini.ini
echo RESET COMPLETE!
```

一个靠 typo 和副作用互相抵消才能工作的重置功能。这就是没有测试的代码的样子。

## 两个后门，一个是我故意的，一个不是

`:users` 这个界面叫 **Indirect Caller**，看起来是个很正经的入口选择：

```bat
set /p a=What do you want to do:
if /I "%a%"=="bingjianremix" goto :host
if /I "%a%"=="other" goto :login
if /I "%a%"=="Administrator" goto :dos
```

输入 `bingjianremix`（我的 ID）直通管理员。这个是我故意的，算是自己的门钥匙。

输入 `Administrator` 直接进系统——这个**不是故意的**。当年写的时候脑子里想的是「管理员账号」，忘了它根本没查密码，等于给所有人开了后门。整个「账号系统」在这一行面前归零。

这两个入口我留了十几年没删。现在看，它比任何一段正经代码都更诚实：**当年的「安全」不是设计出来的，是运气没被撞破。**

## 插件系统：一个文件夹就是注册表

主菜单第 6 项叫 MICRODOS MODS MANAGEMENT SYSTEM。它的全部实现是：

```bat
cd "%~dp0\mod"
set /a n=0
for /f "delims=" %%i in ('dir /b /a-d "*.bat"') do (
    set /a n+=1
    set bat_!n!=%%i
)
for /l %%i in (1,1,!n!) do echo [%%i] !bat_%%i!
...
for %%a in (!a!) do (
    call "!bat_%%a!"
    endlocal
    cls
    goto :6
)
```

扫描目录、编号、列菜单、`call` 执行。丢一个 `.bat` 进 `mod` 文件夹，重启系统，它就成了系统的一部分——帮助页里那句话写得很直白：

> Add your script to the "mod" folder, and then your script will appear in MICRODOS.

今天这叫「约定大于配置的插件热发现」，当年叫「我懒得写安装程序」。

一个细节：这里用的是 `call` 而不是 `start`。`call` 在同一个 cmd 进程里执行，插件可以读写主程序的变量，跑完还能用 `endlocal` 干净退出；`start` 会开新窗口，看起来像另一个程序，但状态全断。当年选 `call` 纯粹是因为 `start` 会多弹一个黑框，「不好看」。

## 21 个快捷启动项，一个假的进度条

系统里最实用的是「Quick Start Item」，21 项，全是 `start` 一句：

| 编号 | 内容 | 命令 |
| --- | --- | --- |
| 1 | 命令提示符 | `start cmd.exe` |
| 2 | 注册表编辑器 | `start regedit.exe` |
| 3 | 任务管理器 | `start taskmgr.exe` |
| 4 | 屏幕键盘 | `start osk.exe` |
| 6 | 远程桌面 | `start mstsc.exe` |
| 9 | 控制台根节点 | `start mmc.exe` |
| 11 | 组策略 | `start gpedit.msc` |
| 13 | 控制面板 | `start control.exe` |
| 15 | 资源管理器 | `start explorer.exe` |
| 18 | Windows Terminal | `start wt.exe` |
| 20 | 任务计划程序 | `start taskschd.msc` |
| 21 | 系统准备工具 | `sysprep.exe` |

每一项之后都跟一句 `call :extra`，也就是统一回一句「Operation has been performed.」然后 `pause` 回菜单——因为 `start` 是异步的，不等程序关掉就返回，所以这句提示是必须的，不然屏幕会闪一下什么都没有。

但第 7 项「磁盘碎片整理」是假的：

```bat
:7a
start defrag.exe
cls
color 27
echo Operation has been performed.
echo Clean up completed.
```

`start defrag.exe` 打开的是碎片整理程序的主界面，什么也没做；后面那句「清理完成」是我自己 `echo` 出来的。当时我甚至不知道 `defrag C: /O` 才是真正干活的那个命令。

这一行是整个文件里最像骗子的地方。也是最少年的地方。

## 两个不敢再写的工具

### KillDisk：把磁盘灌满

主菜单第 5 项。实现比想象中笨，也比想象中狠：

```bat
set file=0
set bigger=10000000000000

:start
set /a file=%file%+1
echo Filling the %file% files  file size:%bigger% byte.
fsutil file createnew %disk%:\KillDisk\%file% %bigger%>nul
if not exist "%disk%:\KillDisk\%file%" (goto bigger)
goto start

:bigger
if /i "%bigger%"=="10000000000000" set bigger=1000000000000
...
if /i "%bigger%"=="10" set bigger=1
goto start
```

它先在目标盘建一个隐藏目录（`attrib +s +h`），然后开始 `fsutil file createnew`：先试 10 TB 一个文件，建不出来就降一档试 1 TB，再不行 100 GB……一直降到 1 字节。塞满之后提示：

```
The target disk is completely filled!
```

这不是「瞬间填满」，是**一个很聪明的降档循环**——用二分之外的线性退化，保证无论盘多大都能在有限次尝试内塞死。当年我为自己想到这个降档逻辑得意了很久。

现在我只觉得后怕：如果哪天真的有人把它跑在系统盘上，重启之后连修复环境都没有。

### KMS：逐行试 key

主菜单第 4 项是 Windows 激活工具。它读同目录的 `WindowsSerial.ini`，一行一个 key，逐个试：

```bat
for /F %%I in (WindowsSerial.ini) do (
    set pk=%%I
    cscript /nologo %slmgrPath% /upk     >>ActiveLog.log
    cscript /nologo %slmgrPath% /cpky    >>ActiveLog.log
    cscript /nologo %slmgrPath% /ckms    >>ActiveLog.log
    cscript /nologo %slmgrPath% /skms kms.xspace.in >>ActiveLog.log
    cscript /nologo %slmgrPath% /ipk !pk! >>ActiveLog.log
    cscript /nologo %slmgrPath% /ato     >>ActiveLog.log
)
```

`slmgr.vbs` 的六连：卸旧 key、清注册表里的 key（`/cpky`，注释还写了「防止泄露被攻击」）、清 KMS 主机名、指向 `kms.xspace.in`、装新 key、激活。全过程写进 `ActiveLog.log`，再用 `find "Successful"` 判断成功没有。

它甚至做了权限检测——`more ActiveLog.log | find "拒绝访问 所请求的操作需要提升特权"` 命中就提示「请以管理员身份运行」。用中文字符串匹配来判断权限错误，这在今天看来荒谬，但当时 UAC 没别的办法问。

这一整套东西，后来我再没写过第二遍。

## 备忘录与全盘搜索

备忘录（第 8 项）是最朴素的那种：扫描 `memorandum` 目录下的 `*.txt`，编号列出来，`[C]` 新建、`[D]` 删除、`[F]` 刷新。新建就是 `echo` 一段文字重定向进新文件，没有任何格式、没有编辑、没有保存按钮——写错一个就重来。

全盘搜索（第 7 项）是唯一一个会让人以为程序卡死的功能：

```bat
for %%i in (c d e f g h i j k l m n o p q r s t u v w x y z) do (
    if exist "%%i:\." (
        echo %%i:\
        dir /b /s "%%i:\*%keyword%*" 1>>find.log
    )
)
start find.log
```

从 C 盘撸到 Z 盘，`dir /b /s` 全递归，结果全部重定向进 `find.log`，跑完用记事本打开。

它不是慢，是**极慢**。在机械硬盘上搜一个常见词，足够泡一杯茶再回来。但我当时在界面上写了一句话：

> If the result doesn't appear for a long time, please wait patiently until "Please press any key to continue" appears.

这句提示比功能本身更有价值。它是我第一次意识到：**用户不知道程序在干什么的时候，你得告诉他「它在干什么」，哪怕它其实只是在等**。

## 假蓝屏

`bv` / `rv` 两个隐藏命令会调出一块假的 Windows 蓝屏：

```bat
:bv
color 17
goto :sc

:sc
mode con cols=80 lines=30
echo A problem has been detected and windows has been shut down to prevent damage
echo to your computer.
```

`color 17` 是蓝底白字，`color 47` 是白底红字（所谓的「红屏」），再配一段手抄的 STOP 屏文案。`mode con` 锁成 80×30 正是当年 640×480 时代的字符模式尺寸。

这东西的用途是吓同学。现在看，它是我写过的第一个「全屏 UI」——虽然只有文字。

## 彩蛋：114514 与一块字符画

在**快捷启动项**菜单（不是主菜单）里输入 `114514`，会跳到一个隐藏标签：

```bat
if "%a%"=="114514" goto :s114514
```

屏幕上刷出一个 68 列宽的框，里面是五行 `█` 拼的块字，拼出来是 **MICRODOS**，下面四行英文：

```text
Congratulations on discovering the egg.
This program has used up all my life's knowledge.
I hope it can help you. May you have a happy life.
-----by:REMIX
```

翻译过来：

> 恭喜你发现了彩蛋。
> 这个程序用尽了我一生的知识。
> 希望它能帮到你，祝你生活愉快。
> —— REMIX

「用尽了一生的知识」这句话，当时写下去是认真的。

那年我把自己能掌控的所有计算机底层知识——文件系统、进程、字符编码、批处理语法、文本解析、菜单状态机、注册表、`slmgr`——毫无保留地塞进了这个简陋的黑框里。那不是修辞，那是一个少年当时能力的全部库存。

而现在，我坐在一台能跑 C# 的机器前面，身后还站着一个能替我写 C# 的模型。这中间隔着的不是天赋，是工具终于追上了想法。

## 那个打错 `@echo off` 的少年

第一次写批处理的时候，我把 `@echo off` 打成了 `@//echo/ off`。

屏幕上满屏的命令回显，我还以为这就是「程序在运行」。

从那个错误开始，到能写出一门带账号、插件、搜索、彩蛋的「操作系统」，中间隔着的不是天赋，是无数个「为什么它不按我想的跑」。

微数没有 bug 修复机制，没有现代化 UI，输入错误会直接闪退，重置功能靠一个拼错的文件名歪打正着。它的所有缺陷，都是那个年纪的真实水平。

但它证明了一件比技术更重要的事：**一个人在没有工具的时候，愿不愿意用最笨的方式把想法做出来。**

## 它没进任何仓库

写这篇文章的时候我去找过——它不在 CNB 的 `history` 分支里。那个分支只归档了燧石启动器的祖先 MCLB，五个文件，没有微数。

微数只在本机 D 盘一个叫 `DOS计划` 的文件夹里，跟它二十多个兄弟躺在一起，其中一个还叫 `null`。

它跑不动了，也没必要再跑。现在的 Windows 已经不太欢迎这种往系统目录写文件、调 `slmgr`、`fsutil` 灌盘的东西了，大部分命令在新系统上会直接被拦。

而当年驱动它的那点东西——想让机器做一件本来做不到的事——一直没变。它现在驱动的是 C# 里的多线程、P2P 打洞、HUD 自愈，也许某天会是别的东西。

工具会换，语言会换，那股劲不能换。

> 极客的魔法，从来不是技术本身，是在没有魔杖的时候，非要用一根木棍把火点起来的那股倔。

---

*本文提到的 `微数 v25.0 BETA.bat`（1170 行 / 24997 字节 / 2023-08-10）未公开归档，仅存于作者本机。文中提到的 KillDisk 与 KMS 功能**已不建议任何人实际执行**，其中 `fsutil` 灌盘与 `slmgr` 改激活状态均不可逆。*
