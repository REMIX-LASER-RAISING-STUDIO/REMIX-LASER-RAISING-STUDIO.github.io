(function() {
      'use strict';

      // ==================== 知识库 ====================
// 键为正则/字符串片段（不区分大小写），值为预设回答
const KnowledgeBase = {
  // ==================== 1. 品牌与工作室 ====================
  'rlrs': `RLRS Studio（REMIX 激越工作室）是一个独立极客工作室。\n\n我们的理念是 **LOCAL-FIRST（本地优先）** 与 **SERVERLESS（无服务端依赖）**。\n\n我们不信任臃肿的 Electron 套壳，也不喜欢强制登录的云端绑架。我们只写纯粹的代码，把数据控制权还给用户。`,
  '工作室': `RLRS Studio 致力于开发纯粹、本地优先的极客桌面软件。\n\n目前有 8 条核心产品线（含内测与规划中），涵盖游戏启动器、系统底层工具、安全分析器与化学模拟等。\n\n我们非官方项目，与 Mojang / Microsoft 无关。`,
  '技术栈': `RLRS Studio 的技术栈选择极其硬核：\n\n• **C# / .NET 8+ / WPF**：用于绝大多数桌面端工具（Chert, Basalt, Breccia, Aether）。\n• **MAUI**：用于移动端跨平台（Pebble）。\n• **Rust**：用于极简浏览器内核（Geode）。\n• **C/C++**：底层 PE 解析与 P2P 网络打洞模块。\n\n拒绝 PHP，拒绝为了 KPI 引入的过度封装。`,
  '开发': `我们的软件大都采用本地优先架构。\n\n例如 Chert 启动器，所有的配置、缓存、存档都在本地；P2P 联机也是通过 UDP 打洞直连，不经过我们的中转服务器。\n\n我们相信：最好的云端服务，就是不需要云端。`,

  // ==================== 2. Chert 燧石启动器 ====================
  'chert': `Chert（燧石）是 RLRS Studio 的旗舰产品，一个硬核的 Minecraft 启动终端。\n\n核心特性：\n• P2P UDP 打洞联机，无需中心服务器\n• 自愈 HUD 覆盖层\n• 四套 UI 设计语言（终端、极简、现代等）\n• 内置 Mod 冲突检测与 Java 运行时管理\n\n当前版本：2.6.0-beta（内测中）。完全本地优先，不依赖任何云端服务。`,
  '燧石': `燧石启动器（Chert）是我们的主打产品。\n\n你可以把它看作一个「终端风」的 Minecraft 启动器，内置 P2P 联机、自愈 HUD 和高度可定制的界面。\n\n版本：2.6.0-beta，目前正在内测。\n下载：请访问燧石官网（首页「前往燧石官网」按钮）。`,
  'hud': `Chert 的“自愈 HUD”是一个特色功能。\n\n它会在游戏画面顶层叠加一个极简的监控面板，显示实时帧率、内存占用和网络延迟。如果检测到内存泄漏或掉帧，HUD 会自动触发清理逻辑，并尝试修复启动器核心文件。`,
  'p2p': `RLRS Studio 的 P2P 能力主要来自两项技术：\n\n1. **Chert 内置联机**：基于自研 UDP 打洞技术，房主创建房间后，其他人直连 IP，无中心服务器中转。\n2. **Pumice 网关**：脱离启动器限制，任何 TCP/UDP 端口一键映射。\n\n它们的目标都是：没有云端服务器，只有点对点。`,
  'minecraft': `是的，我们是一群 Minecraft 老玩家。\n\nChert 和 Granite 都是围绕 MC 生态开发的工具，但我们与 Mojang 没有任何官方关联。\n\nMinecraft 是 Mojang Synergies AB 的商标。`,

  // ==================== 3. Basalt 虚拟磁盘 ====================
  'basalt': `Basalt（玄武岩）是一个现代虚拟磁盘管理器。\n\n目标特性：\n• 完美支持 VHDX / VMDK 格式\n• 原生只读挂载\n• 安全快照与差分盘管理\n• 纯内存流解析，不产生临时垃圾文件\n\n当前状态：核心开发中，尚未发布。`,
  '虚拟磁盘': `Basalt 虚拟磁盘是产品矩阵中的一员。\n\n它专注于 VHDX / VMDK 格式，提供原生只读挂载和安全快照能力，底层追求极致稳定。\n\n它还将深度联动 Chert 启动器，支持将 7z 压缩包直接流式封装为 VHD。`,

  // ==================== 4. Granite 极客开服器 ====================
  'granite': `Granite（花岗岩）是面向 Minecraft 服务端的极客开服器。\n\n定位：坚如磐石的服务端管理面板。\n功能：一键拉取核心（Paper/Fabric/Forge）、可视化编辑 server.properties、崩溃自动重启。\n\n当前状态：核心开发中，尚未开放下载。`,
  '开服器': `Granite 极客开服器正在开发中。\n\n它旨在简化 Minecraft 服务端的部署与管理，提供可视化配置和自动恢复能力。\n\n如果你想第一时间体验，可以关注「极客基地」加入内测。`,

  // ==================== 5. Breccia (原 Obsidian) 安全透视 ====================
  'breccia': `Breccia（角砾岩）是极客级 PE（可执行文件）结构分析与安全透视工具。\n\n核心特性：\n• 拖拽 EXE/DLL 即时解析（基于 PeNet）\n• 基础信息提取（架构/编译时间/入口点/SHA256）\n• 查壳警报（自动识别 UPX0/UPX1/VMP 等）\n• 导入表透视与敏感 API 高亮（如 CreateRemoteThread、VirtualAllocEx 等注入常用 API）\n\n当前状态：核心开发中。`,
  '角砾岩': `Breccia（角砾岩）是我们的安全分析工具。它原名叫 Obsidian（黑曜石），现已改名并加入核心产品矩阵。\n\n它专注于底层 PE 结构分析，支持拖拽文件解析、查壳和监控敏感注入 API，是逆向工程和恶意软件分析的利器。`,
  'obsidian': `Obsidian（黑曜石）项目已经正式更名为 **Breccia（角砾岩）**。\n\n它在产品矩阵中的定位是「极客级 PE 结构分析与安全透视工具」，目前正在核心开发中。\n\n（顺便一提，我们的命名体系均来自岩石/矿物。）`,
  '查壳': `Breccia 的查壳逻辑非常简单粗暴：读取 PE 的节区表（Sections）。\n\n如果发现名为 \`UPX0\`、\`UPX1\`、\`.vmp\`、\`.themida\` 等节区，直接在 UI 顶部标红提示“检测到加壳”。\n\n这对快速判断恶意软件或破解程序非常有效。`,
  '敏感api': `在 Breccia 中，我们会遍历导入表（Import Directory）。\n\n如果发现目标程序调用了以下 API，会使用红色字体高亮警告：\n• \`CreateRemoteThread\`\n• \`VirtualAllocEx\`\n• \`WriteProcessMemory\`\n• \`NtCreateThreadEx\`\n\n这通常意味着该程序具有进程注入或内存马行为。`,

  // ==================== 6. Aether 以太跨端枢纽 ====================
  'aether': `Aether（以太）是 RLRS Studio 的跨端数据同步枢纽。\n\n它是一个基于 WPF 的本地后台守护程序，内置了智能 Git 引擎（防抖提交）和基于 HttpListener 的局域网双端文件透视服务。\n\n状态：概念规划中。`,
  '以太': `Aether（以太）负责打通 PC 与移动端（Pebble）的数据流转。\n\n它采用“防抖提交策略”（Immediate / Delay30M / Delay1H）来自动处理本地仓库的 Git Commit，避免频繁修改导致的提交风暴。`,

  // ==================== 7. 其他产品线 ====================
  'pumice': `Pumice（浮石）是 P2P 联机网关项目。\n\n基于自研 UDP 打洞技术，目标是让任何 TCP/UDP 端口都能一键映射，脱离特定启动器的限制。\n\n状态：概念规划中。`,
  'cobalt': `Cobalt（钴）是化学实验室模拟工具。\n\n灵感来自深邃钴蓝，提供可视化反应过程与试剂操作，让实验安全且可反复进行。\n\n状态：核心开发中。`,
  'pebble': `Pebble（卵石）是移动端文件管理器，深度集成 Git 能力。\n\n你可以在手机上直接浏览、修改并提交仓库，不必回到电脑前。它还支持动态 Web 服务器和内置的 Diff 视图。\n\n状态：开发中。`,
  '卵石': `Pebble（卵石）是我们的移动端效率工具。\n\n它结合了 Git 引擎和文件管理，让你能在 Android 设备上直接进行代码审阅、Diff 查看和提交。完全契合我们“随时随地极客”的理念。`,
  'geode': `Geode（晶洞）是一款基于 Rust 的极简开发者浏览器。\n\n规划中的特性：本地预览服务器、开发网站纯净模式（自动去广告与追踪脚本）。\n\n状态：概念规划中。`,

  // ==================== 8. 历史与社区 ====================
  'microdos': `MicroDOS 是 RLRS Studio 的最初起点——一个用 Windows 批处理脚本（.bat）构建的 DOS 命令行模拟器。\n\n没有现代框架，没有面向对象，只有最底层的逻辑堆砌。它简陋但纯粹，是一切极客魔法的原点。`,
  '开源': `RLRS Studio 拥抱开源，部分组件已在 GitHub 与 CNB 仓库公开。\n\n• GitHub: REMIX-LASER-RAISING-STUDIO\n• CNB: RLRS-Studio\n\n你可以通过页脚链接访问，欢迎提交 PR 或 Issue。`,
  '文档': `开发者文档涵盖：\n\n• Chert CLI 命令指南\n• 节日特效接入指引\n• Basalt CLI 自动化接口\n• 开源组件白皮书\n\n导航栏「开发者文档」入口正在建设中，会持续更新。`,
  '加入': `想加入 RLRS Studio？\n\n我们正在寻找内测玩家（需要提供 Bug 反馈）与开源开发者（熟悉 C# / Rust 或底层逆向）。\n\n入口：导航栏「加入我们」→ 极客基地。\n或者直接发邮件到页脚的联系邮箱。`,

  // ==================== 9. Git 深度集成 ====================
  'git': `Git 不仅仅是工具，更是极客的底层基建。\n\n在 RLRS Studio 的生态中，Git 被深度集成到了各个终端：\n\n• **Pebble（卵石）**：在手机端直接浏览代码、查看 Diff 差异并提交（底层基于 LibGit2Sharp）。\n• **Aether（以太）**：内置智能防抖引擎，连续修改代码时只触发一次自动 Commit。\n• **Breccia（角砾岩）**：虽然不直接操作仓库，但支持解析与 Git 相关的底层二进制。\n\n告别命令行繁琐，但保留 Git 的灵魂。`,
  '仓库': `我们对待代码仓库的态度极其严肃。\n\n在移动端 **Pebble** 中，我们甚至做了深度的防呆设计：禁止多选操作或覆盖 \`.git\` 文件夹及系统级隐藏目录，直接拦截并弹窗提示。\n\n毕竟，没有什么比误删 .git 目录更让人心肺骤停的了。`,
  '版本控制': `RLRS Studio 的跨端枢纽 **Aether（以太）** 正在打造一套智能 Git 推送策略。\n\n它支持 Immediate（立即）、Delay30M（延迟30分）、Delay1H（延迟1小时）以及 NotifyOnly（仅通知）等防抖逻辑，确保你的代码在云端和本地之间无缝流转。`,
  'commit': `Aether（以太）的智能 Commit 机制非常人性化。\n\n一旦触发自动提交，底层的 \`PushStrategyManager\` 会生成统一的 Commit Message：\n\`Aether Auto-Sync\`\n\n配合文件系统监听（FileSystemWatcher），即使你连续保存 100 次，也只会产生一次干净的提交记录。`,

  // ==================== 10. 基础闲聊与兜底 ====================
  '下载': `下载渠道汇总：\n\n• Chert 燧石启动器 → 首页「前往燧石官网」\n• 开发者文档 → 导航栏「开发者文档」\n• 其他工具（Breccia/Basalt/Granite 等）多数仍在开发中，暂未开放下载。\n\n注：本站为静态站点，不直接托管二进制文件。`,
  '你好': `你好，极客。\n\n我是 RLRS Studio 的伪 AI 助手——纯本地逻辑，零 API 调用。\n\n你可以问我关于 Chert、Breccia、Basalt、Granite、Aether 等产品线的问题，或者试试「技术栈」「查壳」「开源」。`,
  'hello': `Hello, geek.\n\n我是 RLRS Studio 的伪 AI 助手。纯本地知识库，不联网。\n\n试试问：Chert、Breccia、Basalt、Granite、技术栈、查壳、开源……`,
  '帮助': `你可以问我这些关键词：\n\n• **产品**：Chert / Breccia / Basalt / Granite / Aether / Pumice / Cobalt / Pebble / Geode\n• **技术**：技术栈 / P2P / 查壳 / 敏感 API / HUD / Git / 仓库\n• **其他**：下载 / 开源 / 文档 / 加入 / MicroDOS / 你好\n\n或者随便问，我会尽力用极客幽默回应。`,
  'help': `Try these keywords:\n\n• **Products**: Chert / Breccia / Basalt / Granite / Aether / Pumice / Cobalt / Pebble / Geode\n• **Tech**: tech stack / P2P / packer detection / sensitive API / HUD / Git / repo\n• **Misc**: download / open source / docs / join / MicroDOS / hello\n\nOr just ask — local logic will do its best.`
};

      // 预处理：把 KnowledgeBase 的键构建为可匹配的数组
const kbKeys = Object.keys(KnowledgeBase);

      // 兜底回复：单文件预览版漏了定义，未命中知识库时会抛 ReferenceError
      const FallbackResponses = [
        `嗯……这个问题超出了我的本地知识库。\n\n我是纯本地伪 AI，不联网、不调 API。\n\n试试问我：Chert、Breccia、Basalt、Granite、Aether、Pumice、Cobalt、Pebble、Geode，或者输入「帮助」查看全部关键词。`,
        `知识库里没找到对应条目。\n\n不如换个关键词？比如「技术栈」「P2P」「查壳」「敏感 API」「Git」「开源」「下载」。\n\n（提示：输入「帮助」可以看到完整清单。）`,
        `抱歉，本地词典暂未收录该问题。\n\n我可以聊产品线、底层技术、Git 集成与工作室历史。输入「帮助」看看能问什么。`
      ];



// ==================== 匹配逻辑 (支持模糊拆分与深度同义词映射) ====================
function findAnswer(query) {
  const lower = query.toLowerCase().trim();
  if (!lower) return null;

  // 1. 直接包含匹配（全词匹配）
  for (const key of kbKeys) {
    if (lower.includes(key.toLowerCase())) {
      return KnowledgeBase[key];
    }
  }

  // 2. 深度同义词/极客黑话映射字典
  const synonyms = {
    '硬盘': '虚拟磁盘', // 直接映射到完整产品名
    '虚拟硬盘': '虚拟磁盘',
    'vhdx': '虚拟磁盘',
    'vmdk': '虚拟磁盘',
    '快照': '虚拟磁盘',
    'vhd': '虚拟磁盘',
    '可执行文件': 'pe',
    'exe': 'pe',
    'dll': 'pe',
    '二进制': 'pe',
    '逆向': 'breccia',
    '恶意软件': 'breccia',
    '安全分析': 'breccia',
    '查毒': '查壳',
    '加壳': '查壳',
    '脱壳': '查壳',
    '注入': '敏感api',
    '内存马': '敏感api',
    '版本管理': '版本控制',
    '代码仓库': '仓库',
    '代码库': '仓库',
    'repo': '仓库',
    '提交': 'commit',
    '联机': 'p2p',
    '局域网': 'p2p',
    '内网穿透': 'p2p',
    '打洞': 'p2p',
    '端口映射': 'pumice',
    '启动器': 'chert',
    'mc': 'minecraft',
    '我的世界': 'minecraft',
    '服务器': 'granite',
    '开服': 'granite',
    '手机': 'pebble',
    '移动端': 'pebble',
    '安卓': 'pebble',
    'android': 'pebble',
    '浏览器': 'geode',
    '化学': 'cobalt',
    '实验': 'cobalt',
    'dos': 'microdos',
    'gui': '技术栈',
    'c#': '技术栈',
    'rust': '技术栈',
    '怎么下载': '下载',
    '哪里下载': '下载',
    '获取': '下载',
    '招人': '加入',
    '内测': '加入',
    '源码': '开源',
    'github': '开源'
  };

  let normalizedQuery = lower;
  for (const [alias, target] of Object.entries(synonyms)) {
    if (normalizedQuery.includes(alias)) {
      normalizedQuery = normalizedQuery.split(alias).join(target);
    }
  }

  // 3. 再次尝试匹配替换同义词后的字符串
  for (const key of kbKeys) {
    if (normalizedQuery.includes(key.toLowerCase())) {
      return KnowledgeBase[key];
    }
  }

  // 4. 【终极兜底】如果还没命中，把用户输入拆成单字/词，暴力尝试匹配所有 key
  // 比如 "硬盘相关的是什么" 会被拆解，尝试去匹配 "hard"、"disk" 等（这里靠上面映射处理）
  // 真正的手段是：如果包含了某些特定字眼，直接给一个友好的指引
  if (lower.includes('硬盘') || lower.includes('磁盘') || lower.includes('vhd')) {
      return KnowledgeBase['虚拟磁盘'];
  }
  if (lower.includes('下载') || lower.includes('获取') || lower.includes('安装')) {
      return KnowledgeBase['下载'];
  }

  return null;
}

      function getFallback() {
        return FallbackResponses[Math.floor(Math.random() * FallbackResponses.length)];
      }

      // ==================== 打字机效果 ====================
      let typingTimer = null;
      let isTyping = false;

      function typeWriter(element, text, speed = 18) {
        return new Promise((resolve) => {
          let i = 0;
          element.textContent = '';
          const cursor = document.createElement('span');
          cursor.className = 'ai-typing-cursor';
          element.appendChild(cursor);

          function step() {
            if (i < text.length) {
              // 处理换行：逐个字符插入
              const char = text[i];
              if (char === '\n') {
                element.insertBefore(document.createElement('br'), cursor);
              } else {
                element.insertBefore(document.createTextNode(char), cursor);
              }
              i++;
              // 滚动到底部
              const body = document.getElementById('aiBody');
              if (body) body.scrollTop = body.scrollHeight;
              typingTimer = setTimeout(step, speed + Math.random() * 12);
            } else {
              if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
              isTyping = false;
              typingTimer = null;
              resolve();
            }
          }
          isTyping = true;
          step();
        });
      }

      // ==================== 消息渲染 ====================
      const aiBody = document.getElementById('aiBody');

      function addMessage(role, text) {
        const msg = document.createElement('div');
        msg.className = 'ai-msg ' + role;

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.textContent = role === 'user' ? '你' : 'AI';

        const bubble = document.createElement('div');
        bubble.className = 'bubble';

        if (role === 'user') {
          bubble.textContent = text;
        } else {
          // bot 消息由打字机填充
          bubble.textContent = '';
        }

        msg.appendChild(avatar);
        msg.appendChild(bubble);
        aiBody.appendChild(msg);
        aiBody.scrollTop = aiBody.scrollHeight;

        return bubble;
      }

      // ==================== 发送逻辑 ====================
      const input = document.getElementById('aiInput');
      const sendBtn = document.getElementById('aiSend');

      async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;
        if (isTyping) return;

        // 显示用户消息
        addMessage('user', text);
        input.value = '';
        input.focus();

        // 匹配答案
        let answer = findAnswer(text);
        if (!answer) {
          answer = getFallback();
        }

        // 模拟思考延迟
        await new Promise((r) => setTimeout(r, 180 + Math.random() * 240));

        // 创建 bot 气泡并打字
        const bubble = addMessage('bot', '');
        await typeWriter(bubble, answer, 16);

        // 完成后自动滚动
        aiBody.scrollTop = aiBody.scrollHeight;
      }

      // ==================== 打开/关闭对话框 ====================
      const fab = document.getElementById('aiFab');
      const dialog = document.getElementById('aiDialog');
      const closeBtn = document.getElementById('aiClose');

      let hasGreeted = false;

      function openDialog() {
        dialog.classList.add('open');
        // 首次打开时显示欢迎消息
        if (!hasGreeted) {
          hasGreeted = true;
          setTimeout(async () => {
            const welcomeText = (window.SI18N && SI18N.t('ai.welcome'))
              || `$ ./mock-ai --interactive\n\n你好，极客。我是 RLRS Studio 的纯本地伪 AI。\n不联网、不请求 API，只靠本地知识库工作。\n\n试试问我：Chert、Breccia、Basalt、Granite、下载、开源……\n或者输入「帮助」查看关键词。`;
            const bubble = addMessage('bot', '');
            await typeWriter(bubble, welcomeText, 14);
          }, 300);
        }
        setTimeout(() => input.focus(), 200);
      }

      function closeDialog() {
        dialog.classList.remove('open');
        // 停止打字
        if (typingTimer) {
          clearTimeout(typingTimer);
          typingTimer = null;
          isTyping = false;
        }
      }

      fab.addEventListener('click', () => {
        if (dialog.classList.contains('open')) {
          closeDialog();
        } else {
          openDialog();
        }
      });

      closeBtn.addEventListener('click', closeDialog);

      // ESC 关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dialog.classList.contains('open')) {
          closeDialog();
        }
      });

      // 输入框回车发送
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendMessage();
        }
      });

      sendBtn.addEventListener('click', sendMessage);

      // 站点 i18n 的 apply() 只处理 [data-t] 的文本，placeholder/aria/title 需自行同步
      function applyAiI18n() {
        if (!window.SI18N) return;
        const t = SI18N.t.bind(SI18N);
        input.placeholder = t('ai.ph');
        input.setAttribute('aria-label', t('ai.ph'));
        fab.setAttribute('aria-label', t('ai.fab'));
        fab.title = t('ai.fab');
        dialog.setAttribute('aria-label', t('ai.fab'));
        closeBtn.setAttribute('aria-label', t('ai.close'));
        closeBtn.title = t('ai.close');
        sendBtn.setAttribute('aria-label', t('ai.send'));
        sendBtn.title = t('ai.send');
      }
      document.addEventListener('change', function (e) {
        if (e.target && e.target.classList && e.target.classList.contains('lang-select')) applyAiI18n();
      });
      applyAiI18n();

    })();
