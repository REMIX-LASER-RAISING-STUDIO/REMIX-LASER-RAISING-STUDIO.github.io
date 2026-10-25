/*!
 * md-renderer.js — 轻量通用 Markdown 渲染器（无外部依赖，约 8KB）
 * 支持：ATX 标题 / 围栏代码块（``` 与 ~~~）/ 表格（含对齐）/ 引用 /
 *       有序无序列表（可嵌套）/ 分割线 / 图片 / 链接 / 自动链接 /
 *       粗体 / 斜体 / 删除线 / 行内代码
 * 用法：MD.render(markdownText) -> HTML 字符串
 * 安全：正文与属性一律转义，原文中的 HTML 标签不会被执行
 */
(function (global) {
  "use strict";

  var PH_OPEN = "\u0001", PH_CLOSE = "\u0001";

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slugId(txt) {
    return String(txt)
      .replace(/[`*_~]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "h";
  }

  /* ---------------- 行内渲染 ---------------- */
  function inline(src) {
    var store = [];
    function put(html) {
      store.push(html);
      return PH_OPEN + (store.length - 1) + PH_CLOSE;
    }

    var s = String(src);

    // 1) 行内代码优先（避免其中的 * _ 被当作强调）
    s = s.replace(/`([^`\n]+)`/g, function (m, code) {
      return put("<code>" + esc(code) + "</code>");
    });

    // 2) 图片
    s = s.replace(/!\[([^\]]*)\]\(\s*([^\s)]+)(?:\s+["']([^"']*)["'])?\s*\)/g, function (m, alt, url, title) {
      return put('<img src="' + esc(url) + '" alt="' + esc(alt) + '"' +
        (title ? ' title="' + esc(title) + '"' : "") + ' loading="lazy">');
    });

    // 3) 链接（外链新窗口）
    s = s.replace(/\[([^\]]*)\]\(\s*([^\s)]+)(?:\s+["']([^"']*)["'])?\s*\)/g, function (m, txt, url, title) {
      var ext = /^(https?:)?\/\//i.test(url) || /^mailto:/i.test(url);
      return put('<a href="' + esc(url) + '"' +
        (title ? ' title="' + esc(title) + '"' : "") +
        (ext ? ' target="_blank" rel="noopener"' : "") + ">" + inline(txt) + "</a>");
    });

    // 4) 裸链接
    s = s.replace(/(^|[\s(（])(https?:\/\/[^\s<)）]+)/g, function (m, pre, url) {
      return pre + put('<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(url) + "</a>");
    });

    // 5) 剩余文本整体转义
    s = esc(s);

    // 6) 强调（此时文本已安全，可输出标签）
    s = s.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");

    // 7) 还原占位
    return s.replace(/\u0001(\d+)\u0001/g, function (m, i) {
      return store[+i] !== undefined ? store[+i] : m;
    });
  }

  /* ---------------- 表格 ---------------- */
  function splitRow(row) {
    var s = String(row).trim().replace(/^\|/, "").replace(/\|$/, "");
    var cells = [], cur = "", escaped = false;
    for (var k = 0; k < s.length; k++) {
      var ch = s[k];
      if (escaped) { cur += ch; escaped = false; continue; }
      if (ch === "\\") { cur += ch; escaped = true; continue; }
      if (ch === "|") { cells.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cells.push(cur.trim());
    return cells.map(function (c) { return c.replace(/\\\|/g, "|"); });
  }

  function parseTable(lines, start) {
    var head = splitRow(lines[start]);
    var sep = splitRow(lines[start + 1]);
    var align = sep.map(function (c) {
      var l = /^\s*:/.test(c), r = /:\s*$/.test(c);
      return (l && r) ? "center" : (r ? "right" : (l ? "left" : ""));
    });
    var i = start + 2, rows = [];
    while (i < lines.length && lines[i].trim() && lines[i].indexOf("|") > -1) {
      rows.push(splitRow(lines[i])); i++;
    }
    var h = '<div class="md-table-wrap"><table><thead><tr>';
    head.forEach(function (c, j) {
      h += "<th" + (align[j] ? ' style="text-align:' + align[j] + '"' : "") + ">" + inline(c) + "</th>";
    });
    h += "</tr></thead><tbody>";
    rows.forEach(function (r) {
      h += "<tr>";
      for (var j = 0; j < head.length; j++) {
        h += "<td" + (align[j] ? ' style="text-align:' + align[j] + '"' : "") + ">" + inline(r[j] || "") + "</td>";
      }
      h += "</tr>";
    });
    h += "</tbody></table></div>";
    return { html: h, next: i };
  }

  /* ---------------- 列表（支持嵌套） ---------------- */
  function parseList(lines, start) {
    var m0 = /^(\s*)([-*+]|\d+[.)])\s+/.exec(lines[start]);
    var baseIndent = m0[1].replace(/\t/g, "    ").length;
    var ordered = /\d/.test(m0[2]);
    var items = [], i = start, n = lines.length;

    while (i < n) {
      var m = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(lines[i]);
      var indent = m ? m[1].replace(/\t/g, "    ").length : -1;

      if (m && indent === baseIndent) {
        items.push({ text: m[3], sub: [] });
        i++;
      } else if (m && indent > baseIndent && items.length) {
        var sub = parseList(lines, i);
        items[items.length - 1].sub.push(sub.html);
        i = sub.next;
      } else if (!m && lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length) {
        // 列表项续行
        items[items.length - 1].text += " " + lines[i].trim();
        i++;
      } else {
        break;
      }
    }

    var html = items.map(function (it) {
      var inner = inline(it.text);
      if (it.sub.length) inner += it.sub.join("");
      return "<li>" + inner + "</li>";
    }).join("");

    var tag = ordered ? "ol" : "ul";
    return { html: "<" + tag + ">" + html + "</" + tag + ">", next: i };
  }

  /* ---------------- 块级渲染 ---------------- */
  function renderBlocks(lines) {
    var out = [], i = 0, n = lines.length;

    while (i < n) {
      var line = lines[i];

      // 围栏代码块
      var fence = /^\s{0,3}(`{3,}|~{3,})\s*([\w+#.-]*)\s*$/.exec(line);
      if (fence) {
        var mark = fence[1][0], lang = fence[2], buf = [];
        var closeRe = new RegExp("^\\s{0,3}" + (mark === "`" ? "`" : "~") + "{3,}\\s*$");
        i++;
        while (i < n && !closeRe.test(lines[i])) { buf.push(lines[i]); i++; }
        i++; // 跳过结束围栏
        out.push('<pre class="md-pre"><code' +
          (lang ? ' class="language-' + esc(lang) + '"' : "") + ">" +
          esc(buf.join("\n")) + "</code></pre>");
        continue;
      }

      // 空行
      if (!line.trim()) { i++; continue; }

      // 分割线
      if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push("<hr>"); i++; continue; }

      // 标题
      var h = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
      if (h) {
        var lv = h[1].length;
        out.push('<h' + lv + ' id="' + slugId(h[2]) + '">' + inline(h[2]) + "</h" + lv + ">");
        i++; continue;
      }

      // 引用
      if (/^\s{0,3}>/.test(line)) {
        var qb = [];
        while (i < n && (/^\s{0,3}>/.test(lines[i]) || (qb.length && lines[i].trim()))) {
          qb.push(lines[i].replace(/^\s{0,3}>\s?/, ""));
          i++;
        }
        out.push("<blockquote>" + renderBlocks(qb).join("\n") + "</blockquote>");
        continue;
      }

      // 表格
      if (line.indexOf("|") > -1 && i + 1 < n &&
          /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1]) &&
          lines[i + 1].indexOf("-") > -1) {
        var tb = parseTable(lines, i);
        out.push(tb.html); i = tb.next; continue;
      }

      // 列表
      if (/^\s{0,3}([-*+]|\d+[.)])\s+/.test(line)) {
        var ls = parseList(lines, i);
        out.push(ls.html); i = ls.next; continue;
      }

      // 段落
      var pb = [], moved = false;
      while (i < n && lines[i].trim() &&
             !/^\s{0,3}(`{3,}|~{3,}|#{1,6}\s|>|([-*+]|\d+[.)])\s)/.test(lines[i]) &&
             !/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(lines[i])) {
        pb.push(lines[i]); i++; moved = true;
      }
      if (moved) {
        out.push("<p>" + inline(pb.join("\n")).replace(/\n/g, "<br>") + "</p>");
      } else {
        i++; // 兜底，避免死循环
      }
    }

    return out;
  }

  function render(md) {
    var text = String(md || "").replace(/\r\n?/g, "\n").replace(/\t/g, "    ");
    return renderBlocks(text.split("\n")).join("\n");
  }

  global.MD = { render: render, escape: esc };

})(window);
