/* 골드제이 원고 편집기 — 네이버 스마트에디터처럼 보이는 편집 화면
   저장 형식은 그대로 '네이버 형식 텍스트'(줄 끝 공백 두 칸, &nbsp; 빈 줄, **굵게**, > 인용구, 📷 사진 자리)라서
   검수·글자 수·복사 기능은 바뀌지 않는다. 숨겨둔 textarea / input 과 양방향으로 맞춘다. */
(function () {
  "use strict";
  const ICON = {
    photo: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/></svg>',
    quote: '<svg viewBox="0 0 24 24"><path d="M5 17c0-4 1-7 5-9M14 17c0-4 1-7 5-9"/><path d="M5 17h4v-4H5zM14 17h4v-4h-4z"/></svg>',
    line: '<svg viewBox="0 0 24 24"><path d="M3 12h18"/><path d="M8 8h8M8 16h8" stroke-dasharray="1 2.5"/></svg>',
    bold: '<svg viewBox="0 0 24 24"><path d="M7 5h6a3.5 3.5 0 010 7H7zM7 12h7a3.5 3.5 0 010 7H7z"/></svg>',
    center: '<svg viewBox="0 0 24 24"><path d="M4 6h16M7 10h10M4 14h16M7 18h10"/></svg>',
    caption: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="10" rx="1.5"/><path d="M7 18h10M9 21h6"/></svg>',
    plain: '<svg viewBox="0 0 24 24"><path d="M5 6h14M12 6v13M9 19h6"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/></svg>',
    code: '<svg viewBox="0 0 24 24"><path d="M9 8l-4 4 4 4M15 8l4 4-4 4"/></svg>',
  };
  const MARK = { center: "[가운데] ", caption: "[캡션] " };
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* ---------- 텍스트 → 편집 화면 ---------- */
  function linesToPs(lines) {
    let open = false;
    return lines.map((raw) => {
      let l = raw.replace(/\s+$/, "");
      if (l.trim() === "&nbsp;" || !l.trim()) { return "<p><br></p>"; }
      let cls = "";
      for (const k in MARK) if (l.startsWith(MARK[k])) { cls = k; l = l.slice(MARK[k].length); }
      const parts = esc(l).split("**");
      let h = open ? "<b>" : "";
      parts.forEach((p, i) => { if (i > 0) { open = !open; h += open ? "<b>" : "</b>"; } h += p; });
      if (open) h += "</b>";
      h = h.replace(/<b><\/b>/g, "");
      return `<p${cls ? ` class="${cls}"` : ""}>${h || "<br>"}</p>`;
    }).join("");
  }
  function photoHtml(lines) {
    const head = lines[0].trim().replace(/^📷\s*/, "").replace(/^\*\*/, "").replace(/\*\*$/, "").replace(/^\[/, "").replace(/\]$/, "");
    const rest = lines.slice(1).map((l) => `<p>${esc(l.replace(/\s+$/, "").replace(/\*\*/g, "")) || "<br>"}</p>`).join("");
    return `<div class="photo" contenteditable="false"><div class="photo-in" contenteditable="true"><p class="photo-h">${esc(head)}</p>${rest}</div></div>`;
  }
  function mdToHtml(md) {
    const lines = (md || "").replace(/\r/g, "").split("\n");
    while (lines.length && !lines[0].trim()) lines.shift();
    if (lines.length && /^\s*#\s/.test(lines[0])) lines.shift();
    const blocks = []; let cur = [];
    lines.forEach((l) => { if (!l.trim()) { if (cur.length) blocks.push(cur); cur = []; } else cur.push(l); });
    if (cur.length) blocks.push(cur);
    let html = "";
    blocks.forEach((b) => {
      let i = 0;
      while (i < b.length) {
        const l = b[i];
        if (/^\s*>/.test(l)) {
          const q = []; while (i < b.length && /^\s*>/.test(b[i])) { q.push(b[i].replace(/^\s*>\s?/, "").replace(/\s+$/, "").replace(/\*\*/g, "")); i++; }
          html += `<blockquote class="quote">${q.map((x) => `<p>${esc(x) || "<br>"}</p>`).join("")}</blockquote>`;
        } else if (/^\s*📷/.test(l)) {
          html += photoHtml(b.slice(i)); i = b.length;
        } else if (/^\s*-{3,}\s*$/.test(l)) {
          html += "<hr>"; i++;
        } else {
          const ps = []; while (i < b.length && !/^\s*(>|📷|-{3,}\s*$)/.test(b[i])) { ps.push(b[i]); i++; }
          html += linesToPs(ps);
        }
      }
    });
    return html || "<p><br></p>";
  }

  /* ---------- 편집 화면 → 텍스트 ---------- */
  function inlineMd(node) {
    let s = "";
    node.childNodes.forEach((n) => {
      if (n.nodeType === 3) s += n.nodeValue.replace(/ /g, " ").replace(/\n/g, " ");
      else if (n.nodeType === 1) {
        if (n.tagName === "BR" || n.classList.contains("del")) return;
        const bold = n.tagName === "B" || n.tagName === "STRONG" || /font-weight:\s*(bold|[6-9]00)/.test(n.getAttribute("style") || "");
        const inner = inlineMd(n);
        s += bold && inner.trim() ? `**${inner}**` : inner;
      }
    });
    return s.replace(/\*\*\*\*/g, "");
  }
  function itemsOf(ed) {
    const items = [];
    const para = (el) => {
      const t = inlineMd(el).replace(/\s+$/, "");
      if (!t.replace(/\*\*/g, "").trim()) { items.push({ k: "empty" }); return; }
      const cls = Object.keys(MARK).find((k) => el.classList && el.classList.contains(k));
      items.push({ k: "line", t: (cls ? MARK[cls] : "") + t.replace(/^\s+/, "") });
    };
    ed.childNodes.forEach((n) => {
      if (n.nodeType === 3) { if (n.nodeValue.trim()) items.push({ k: "line", t: n.nodeValue.trim() }); return; }
      if (n.nodeType !== 1) return;
      const t = n.tagName;
      if (t === "HR") { items.push({ k: "hr" }); return; }
      if (n.classList.contains("photo")) {
        const ps = [...(n.querySelector(".photo-in") || n).querySelectorAll("p")].map((p) => inlineMd(p).replace(/\*\*/g, "").trim()).filter(Boolean);
        if (ps.length) items.push({ k: "photo", lines: ps });
        return;
      }
      if (t === "BLOCKQUOTE") {
        const ls = [...n.querySelectorAll("p, div")].filter((p) => !p.querySelector("p, div"));
        const lines = (ls.length ? ls.map((p) => inlineMd(p)) : [inlineMd(n)]).map((x) => x.replace(/\*\*/g, "").trim()).filter(Boolean);
        if (lines.length) items.push({ k: "quote", lines });
        return;
      }
      if (t === "UL" || t === "OL") { [...n.children].forEach(para); return; }
      if (t === "DIV" && n.querySelector("p, div")) { [...n.children].forEach(para); return; }
      para(n);
    });
    return items;
  }
  function htmlToMd(ed) {
    const out = []; let group = [];
    const flush = () => { if (group.length) { out.push(group.join("  \n")); group = []; } };
    itemsOf(ed).forEach((it) => {
      if (it.k === "line") { group.push(it.t); return; }
      flush();
      if (it.k === "empty") out.push("&nbsp;");
      else if (it.k === "hr") out.push("---");
      else if (it.k === "quote") out.push(it.lines.map((l) => `> **${l}**`).join("  \n"));
      else if (it.k === "photo") out.push([`📷 **[${it.lines[0]}]**`].concat(it.lines.slice(1)).join("  \n"));
    });
    flush();
    return out.join("\n\n");
  }

  /* ---------- 붙이기 ---------- */
  function hookValue(el, onSet) {
    const proto = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value");
    let quiet = false;
    Object.defineProperty(el, "value", {
      configurable: true,
      get() { return proto.get.call(el); },
      set(v) { proto.set.call(el, v); if (!quiet) onSet(v); },
    });
    return (v) => { quiet = true; proto.set.call(el, v); quiet = false; };
  }

  function mount(opts) {
    const ta = opts.body, ti = opts.title;
    const host = document.createElement("div");
    host.className = "ne";
    host.innerHTML = `
      <div class="ne-tools" role="toolbar" aria-label="편집 도구">
        <button type="button" class="ne-tool" data-act="photo" title="사진 자리 넣기">${ICON.photo}<span>사진 자리</span></button>
        <button type="button" class="ne-tool" data-act="quote" title="인용구(소제목)">${ICON.quote}<span>인용구</span></button>
        <button type="button" class="ne-tool" data-act="line" title="구분선">${ICON.line}<span>구분선</span></button>
        <span class="ne-sep"></span>
        <button type="button" class="ne-tool" data-act="bold" title="굵게 (Ctrl+B)">${ICON.bold}<span>굵게</span></button>
        <button type="button" class="ne-tool" data-act="center" title="가운데 정렬">${ICON.center}<span>가운데</span></button>
        <button type="button" class="ne-tool" data-act="caption" title="사진 캡션">${ICON.caption}<span>캡션</span></button>
        <button type="button" class="ne-tool" data-act="plain" title="일반 문단으로">${ICON.plain}<span>본문</span></button>
        <span class="ne-sep"></span>
        <button type="button" class="ne-tool research" data-act="research" title="선택한 구간 자료탐색">${ICON.search}<span>자료탐색</span></button>
        <span class="ne-grow"></span>
        <button type="button" class="ne-tool" data-act="mobile" aria-pressed="false" title="모바일 폭으로 보기">${ICON.phone}<span>모바일 보기</span></button>
        <button type="button" class="ne-tool" data-act="raw" aria-pressed="false" title="네이버 형식 텍스트로 보기·고치기">${ICON.code}<span>텍스트</span></button>
      </div>
      <div class="ne-main">
        <div class="ne-wrap">
          <article class="ne-paper">
            <h1 class="ne-title" contenteditable="true" spellcheck="false" data-ph="${esc(opts.titlePlaceholder || "제목")}"></h1>
            <div class="ne-ed" contenteditable="true" spellcheck="false"></div>
          </article>
          <div class="ne-foot"></div>
        </div>
        <aside class="ne-panel" hidden aria-label="자료탐색">
          <div class="ne-panel-h">자료탐색 <button type="button" class="ne-x" aria-label="닫기">×</button></div>
          <div class="ne-panel-b">
            <div class="ne-hint">본문에서 문장을 드래그한 뒤 찾을 내용을 고르세요.</div>
            <div class="ne-excerpt" hidden></div>
            <div class="ne-modes">
              <button type="button" data-mode="evidence">근거 논문·자료</button>
              <button type="button" data-mode="explain">쉬운 설명·비유</button>
              <button type="button" data-mode="check">의학적 표현 점검</button>
              <button type="button" data-mode="photo">어울리는 사진·그림</button>
            </div>
            <textarea class="ne-extra" placeholder="추가로 궁금한 점 (선택)"></textarea>
            <div class="ne-hint">Claude가 아는 범위에서 답해요. 논문 제목·저자는 게시 전에 꼭 원문을 확인하세요.</div>
            <div class="ne-answer"></div>
            <button type="button" class="ne-copy" hidden>답변 복사</button>
          </div>
        </aside>
      </div>`;
    ta.parentNode.insertBefore(host, ta);
    ta.classList.add("ne-raw"); ta.hidden = true;
    if (ti) ti.hidden = true;
    const $ = (s) => host.querySelector(s);
    const ed = $(".ne-ed"), titleEl = $(".ne-title"), foot = $(".ne-foot");
    try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch (e) { /* 지원 안 함 */ }

    const setTa = hookValue(ta, (v) => { if (!rawMode) load(v); });
    const setTi = ti ? hookValue(ti, (v) => { titleEl.textContent = v; }) : null;
    let rawMode = false;

    function decorate() {
      ed.querySelectorAll(".photo").forEach((ph) => {
        if (ph.querySelector(".del")) return;
        const b = document.createElement("button");
        b.className = "del"; b.type = "button"; b.title = "사진 자리 삭제"; b.textContent = "×"; b.contentEditable = "false";
        b.addEventListener("click", () => { ph.remove(); sync(); });
        ph.appendChild(b);
      });
    }
    function counts() {
      const t = [...ed.querySelectorAll("p")].filter((p) => !p.closest(".photo")).map((p) => p.textContent).join("\n");
      foot.textContent = `사진 자리 ${ed.querySelectorAll(".photo").length}곳 · 분량은 사진 설명을 빼고 세요`;
    }
    function load(md) { ed.innerHTML = mdToHtml(md); decorate(); counts(); }
    let tmr = null;
    function sync() {
      clearTimeout(tmr);
      tmr = setTimeout(() => {
        setTa(htmlToMd(ed));
        ta.dispatchEvent(new Event("input", { bubbles: true }));
        counts();
      }, 120);
    }
    titleEl.textContent = ti ? ti.value : "";
    load(ta.value);

    ed.addEventListener("input", sync);
    titleEl.addEventListener("input", () => { if (!ti) return; setTi(titleEl.textContent.replace(/\n/g, " ")); ti.dispatchEvent(new Event("input", { bubbles: true })); });
    titleEl.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); ed.focus(); } });
    titleEl.addEventListener("paste", (e) => { e.preventDefault(); document.execCommand("insertText", false, (e.clipboardData.getData("text/plain") || "").replace(/\s*\n\s*/g, " ")); });
    ed.addEventListener("paste", (e) => {
      const t = e.clipboardData && e.clipboardData.getData("text/plain");
      if (t == null) return;
      e.preventDefault();
      if (/\n/.test(t)) document.execCommand("insertHTML", false, mdToHtml(t));
      else document.execCommand("insertText", false, t);
      decorate();
    });

    /* 선택 · 블록 도구 */
    let lastRange = null;
    const onSel = () => {
      if (!document.body.contains(host)) { document.removeEventListener("selectionchange", onSel); return; }
      const s = getSelection(); if (!s.rangeCount) return;
      const r = s.getRangeAt(0); if (ed.contains(r.commonAncestorContainer)) lastRange = r.cloneRange();
    };
    document.addEventListener("selectionchange", onSel);
    const restore = () => { if (lastRange) { const s = getSelection(); s.removeAllRanges(); s.addRange(lastRange); } };
    const topBlock = (n) => { while (n && n.parentNode !== ed) n = n.parentNode; return n && n.nodeType === 1 ? n : null; };
    function selectedTops() {
      if (!lastRange) return [];
      const a = topBlock(lastRange.startContainer), b = topBlock(lastRange.endContainer);
      if (!a) return [];
      const out = []; let n = a;
      while (n) { if (n.nodeType === 1) out.push(n); if (n === b) break; n = n.nextSibling; }
      return out;
    }
    function selectedParas() {
      if (!lastRange) return [];
      const ps = [...ed.querySelectorAll("p")].filter((p) => lastRange.intersectsNode(p) && !p.closest(".photo") && !p.closest("blockquote"));
      return ps;
    }
    function act(kind) {
      if (kind === "research") { openPanel(); return; }
      if (kind === "mobile") { const on = host.classList.toggle("mobile"); $('[data-act="mobile"]').setAttribute("aria-pressed", on); return; }
      if (kind === "raw") {
        rawMode = !rawMode;
        $('[data-act="raw"]').setAttribute("aria-pressed", rawMode);
        host.classList.toggle("raw", rawMode);
        ta.hidden = !rawMode;
        if (rawMode) { clearTimeout(tmr); setTa(htmlToMd(ed)); ta.focus(); }
        else load(ta.value);
        return;
      }
      if (rawMode) return;
      ed.focus(); restore();
      if (kind === "bold") { document.execCommand("bold"); sync(); return; }
      const tops = selectedTops();
      const after = tops[tops.length - 1];
      if (kind === "photo") {
        const ph = document.createElement("div"); ph.className = "photo"; ph.contentEditable = "false";
        ph.innerHTML = '<div class="photo-in" contenteditable="true"><p class="photo-h">사진 넣기 좋은 구간｜용도</p><p>어떤 사진인지 적어주세요</p></div>';
        const sp = document.createElement("p"); sp.innerHTML = "<br>";
        if (after) { after.after(ph); ph.after(sp); } else { ed.append(ph); ed.append(sp); }
        decorate(); sync(); return;
      }
      if (kind === "line") { const hr = document.createElement("hr"); after ? after.after(hr) : ed.append(hr); sync(); return; }
      if (kind === "quote") {
        if (tops.length === 1 && tops[0].tagName === "BLOCKQUOTE") { const q = tops[0]; [...q.querySelectorAll("p")].forEach((p) => q.before(p)); q.remove(); sync(); return; }
        const blocks = tops.filter((n) => n.tagName === "P" && n.textContent.trim());
        if (!blocks.length) return;
        const q = document.createElement("blockquote"); q.className = "quote";
        blocks[0].before(q); blocks.forEach((p) => { p.className = ""; q.append(p); });
        q.querySelectorAll("b, strong").forEach((b) => b.replaceWith(...b.childNodes));
        sync(); return;
      }
      const ps = selectedParas(); if (!ps.length) return;
      if (kind === "plain") ps.forEach((p) => { p.className = ""; });
      else { const on = !ps.every((p) => p.classList.contains(kind)); ps.forEach((p) => { p.className = on ? kind : ""; }); }
      sync();
    }
    host.querySelectorAll(".ne-tool").forEach((b) => {
      b.addEventListener("mousedown", (e) => e.preventDefault());
      b.addEventListener("click", () => act(b.dataset.act));
    });
    ed.addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") { e.preventDefault(); act("bold"); } });

    /* 자료탐색 */
    let researchRange = null, busy = false;
    const MODES = {
      evidence: "이 내용을 뒷받침할 수 있는 근거 자료(논문, 학회 가이드라인, 해부학 교과서 등)를 3개 이내로 알려주세요. 각 자료마다 저자, 연도, 저널(또는 출처)과 이 문단에서 어떻게 인용하면 좋은지를 한 줄로 적어주세요. 서지 정보가 확실하지 않으면 반드시 \"확인 필요\"라고 표시하고, 지어내지 마세요.",
      explain: "환자가 이해하기 쉬운 설명과 비유를 2~3개 제안해주세요. 골드제이 원고처럼 부드러운 존댓말, 한 줄 15~25자로 짧게 끊은 문장 예시도 함께 주세요.",
      check: "의료광고 관점에서 과장, 단정, 효과 보장으로 읽힐 수 있는 표현이 있는지 점검하고, 고친 문장을 제안해주세요. 사실관계가 의심스러운 부분도 짚어주세요.",
      photo: "이 구간 바로 아래에 넣기 좋은 사진·그림을 2~3개 제안해주세요. 각각 어떤 사진인지, 캡션 예시(전후 사진은 \"골드제이의원 ○○ 전후\" 형식), 직접 찍을지/논문 그림/AI 이미지 중 무엇이 좋은지 적어주세요.",
    };
    function openPanel() {
      researchRange = lastRange ? lastRange.cloneRange() : null;
      const t = researchRange ? researchRange.toString().trim() : "";
      $(".ne-panel").hidden = false; host.classList.add("with-panel");
      const ex = $(".ne-excerpt"); ex.hidden = !t; ex.textContent = t;
    }
    $(".ne-x").onclick = () => { $(".ne-panel").hidden = true; host.classList.remove("with-panel"); };
    function contextAround() {
      if (!researchRange) return "";
      const ps = [...ed.querySelectorAll("p")]; const idx = ps.findIndex((p) => researchRange.intersectsNode(p));
      return idx < 0 ? "" : ps.slice(Math.max(0, idx - 6), idx + 7).map((p) => p.textContent).join("\n");
    }
    host.querySelectorAll(".ne-modes button").forEach((b) => b.onclick = async () => {
      if (busy) return;
      const t = researchRange ? researchRange.toString().trim() : "";
      const ans = $(".ne-answer");
      if (!t) { ans.textContent = "먼저 본문에서 찾아볼 문장을 드래그한 뒤 자료탐색을 다시 눌러주세요."; return; }
      if (!opts.ask) { ans.textContent = "Claude API 키를 설정하면 쓸 수 있어요."; return; }
      busy = true; ans.textContent = "찾는 중이에요…"; $(".ne-copy").hidden = true;
      host.querySelectorAll(".ne-modes button").forEach((x) => { x.disabled = true; });
      const extra = $(".ne-extra").value.trim();
      const prompt = `당신은 골드제이의원(이현주 원장) 네이버 블로그 원고 작성을 돕는 의학 자료 리서처입니다. 한국어로, 짧은 소제목과 목록을 써서 답하세요. 마크다운 기호(#, **)는 쓰지 마세요.\n\n[글 제목]\n${titleEl.textContent}\n\n[주변 문맥]\n${contextAround()}\n\n[선택한 구간]\n${t}\n\n[요청]\n${MODES[b.dataset.mode]}${extra ? "\n추가 질문: " + extra : ""}`;
      try { await opts.ask(prompt, (txt) => { ans.textContent = txt; }); $(".ne-copy").hidden = false; }
      catch (err) { ans.textContent = "답변을 받지 못했어요: " + err.message; }
      finally { busy = false; host.querySelectorAll(".ne-modes button").forEach((x) => { x.disabled = false; }); }
    });
    $(".ne-copy").onclick = async () => { try { await navigator.clipboard.writeText($(".ne-answer").textContent); $(".ne-copy").textContent = "복사했어요"; setTimeout(() => { $(".ne-copy").textContent = "답변 복사"; }, 1500); } catch (e) { /* 무시 */ } };

    /* 높이 맞추기: 옆 칸(글 정보 / 검수지) 아래 끝에 맞춰 고정하고, 원고는 칸 안에서 스크롤 */
    const main = $(".ne-main");
    function fit() {
      if (!document.body.contains(host)) { window.removeEventListener("resize", fit); if (ro) ro.disconnect(); return; }
      const side = opts.matchHeight && opts.matchHeight();
      const col = host.closest(".stack-lg") || host.parentNode;
      if (!side || window.innerWidth < 1200) { main.style.height = Math.max(480, Math.round(window.innerHeight * 0.72)) + "px"; return; }
      const below = col.getBoundingClientRect().bottom - host.getBoundingClientRect().bottom;
      let h = side.getBoundingClientRect().bottom - main.getBoundingClientRect().top - below;
      if (opts.sameAsDraft) {
        // 초안 검수: 초안 작성 화면의 원고 칸과 같은 높이
        h = Number(localStorage.getItem("goldj-ed-h")) || 1190;
      } else {
        try { localStorage.setItem("goldj-ed-h", String(Math.max(520, Math.round(h)))); } catch (e) {}
      }
      main.style.height = Math.max(520, Math.round(h)) + "px";
    }
    let ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(() => fit()); const side = opts.matchHeight && opts.matchHeight(); if (side) ro.observe(side); }
    window.addEventListener("resize", fit);
    requestAnimationFrame(fit); setTimeout(fit, 300);

    return { el: host, refresh: () => load(ta.value), fit };
  }

  window.GJEditor = { mount, mdToHtml, htmlToMd };
})();
