/* 골드제이 블로그 서포터 — 로컬 MVP (빌드·서버 없이 index.html 더블클릭으로 실행) */
(function () {
  "use strict";

  const SEED = window.GJ_SEED;
  const KEY = "goldj-blog-supporter-v1";
  const STATUSES = ["아이디어", "기획", "초안 작성", "초안 검수", "원장님 검수", "발행 완료"];
  /* 글 유형(무엇을 어떤 순서로 쓰는가) — 섹션별 목표 분량 합계 약 2,700자 (공백 제외) */
  const TYPES = {
    "원인 감별형": {
      d: "고민 → 원인 구분 → 원인별 처방. 골드제이 기본형 (예: 다크서클, 땅콩형 얼굴)",
      sec: (k, b, P) => [
        [`${k},\n왜 생기는 걸까요?`, 550, "원인·구조 설명. 전문용어는 영문 병기 후 쉬운 말·비유로", "해부·원리 그림 (캡션: 저자 (연도). 저널, 권(호), 쪽.)"],
        [b.myth || "흔히 하는 오해,\n정말일까요?", 350, "“결론부터 말씀드리면 ~”으로 오해를 바로잡기"],
        ["원인이 다르면\n치료도 달라집니다", 650, "CAUSES"],
        ["시술로\n안 되는 경우도 있을까요?", 250, "수술 등이 더 맞는 경우를 솔직하게"],
        [`골드제이 ${P}는\n어떻게 접근할까요?`, 400, "진단·디자인 기준. 원장님 경험은 제공받은 사실만", `전후 사례 (캡션: 골드제이의원 ${P} 전후 · 게시 동의 확인)`],
      ],
    },
    "오해 바로잡기형": {
      d: "많이 퍼진 오해 2~3개를 하나씩 반박 (예: 눈밑필러 1cc·비침)",
      sec: (k, b, P) => [
        [b.myth || `${k},\n정말 그럴까요? (오해 ①)`, 600, "오해 ① 소개 → “결론부터 말씀드리면” → 근거와 비유", "근거 그림·논문 (캡션 형식 지키기)"],
        ["오해 ②\n✍️ 정말일까요?", 600, "오해 ② 소개 → 바로잡기 → 근거"],
        ["그렇다면\n무엇을 먼저 봐야 할까요?", 450, "원인·층·상태 등 판단 기준. 수술이 맞는 경우도"],
        [`골드제이 ${P}는\n어떻게 접근할까요?`, 450, "골드제이의 진단 기준과 설계", `전후 사례 (캡션: 골드제이의원 ${P} 전후 · 게시 동의 확인)`],
      ],
    },
    "원리 해설형": {
      d: "시술·장비·성분의 원리를 비유로 풀어 설명 (예: 써마지 원리, 필러 유지기간)",
      sec: (k, b, P) => [
        [`${k},\n어떤 시술일까요?`, 400, "한 문단 정의 + 누가 많이 찾는지"],
        ["어떤 원리로\n효과가 생길까요?", 650, "원리를 비유로(토마토 지지대·콜라겐 적금 등). 논문 그림 활용", "원리 도식·논문 그림 (캡션 형식 지키기)"],
        ["효과는 언제,\n얼마나 갈까요?", 400, "효과 시점·유지기간은 출처 있는 수치만"],
        ["많이 묻는 질문", 450, "통증·다운타임·횟수 등 2~3개 Q&A (출처·제공 정보만)"],
        [`골드제이 ${P}는\n무엇이 다를까요?`, 400, "골드제이만의 설계·조합", `시술 장면 또는 전후 (캡션: 골드제이의원 ${P})`],
      ],
    },
    "비교·선택형": {
      d: "A vs B, 어떤 경우에 무엇이 맞는지 기준 제시 (예: 울쎄라 vs 써마지, 관자필러 vs 쥬베룩)",
      sec: (k, b, P) => [
        ["두 시술은\n무엇이 다를까요?", 500, "작용 층·원리·느낌 차이를 한눈에"],
        ["이런 분께는\nA가 맞습니다", 500, "A가 맞는 피부·고민 유형"],
        ["이런 분께는\nB가 맞습니다", 500, "B가 맞는 피부·고민 유형", "비교 도식 (AI 이미지면 표시)"],
        ["같이 해도 될까요?\n순서와 간격은?", 400, "조합 시 고려할 점 (근거 있는 범위만)"],
        [`골드제이는\n어떻게 고를까요?`, 350, "진단 기준. 원장님 상담 후 결정"],
      ],
    },
    "총정리형": {
      d: "종류·부작용·주의사항을 번호 소제목으로 정리 (예: 입술필러 부작용 총정리)",
      sec: (k, b, P) => [1, 2, 3, 4, 5].map((n) => [`${n}. ✍️ 항목 ${n}`, 380, "증상·원인·대처를 짧게. 겁주지 않는 톤", n === 2 ? "항목 설명 그림" : null])
        .concat([["이런 경우엔\n바로 내원하세요", 250, "주의 신호와 대처"]]),
    },
    "시기·시즌형": {
      d: "시기에 맞춰 무엇을 언제 할지 (예: 결혼식 D-day, 수능 후 여드름 흉터)",
      sec: (k, b, P) => [
        ["왜 지금\n시작하는 게 좋을까요?", 450, "시기와 피부 회복 기간의 관계"],
        ["D-기간별로\n무엇을 하면 좋을까요?", 750, "기간별 계획 (예: 3개월 전·1개월 전·2주 전). 근거 있는 범위만", "타임라인 이미지"],
        ["이 시기에\n피해야 할 것은?", 400, "직전에 피할 시술·관리"],
        [`골드제이에서는\n어떻게 계획할까요?`, 450, `${P} 등 조합과 상담 방식`],
      ],
    },
    "진료실 칼럼": {
      d: "원장의 진료 철학·시리즈 칼럼 (예: 의료는 기술이 아니라 진단입니다)",
      sec: (k, b, P) => [
        ["진료실에서\n자주 마주하는 장면", 500, "문제 제기. 제공받은 에피소드만"],
        ["의학적으로는\n어떻게 봐야 할까요?", 650, "배경 지식·근거", "관련 자료 이미지"],
        ["제가\n이렇게 생각하는 이유", 650, "원장의 견해와 진료 기준"],
        ["환자분께\n드리고 싶은 말", 350, "선택 기준과 당부"],
      ],
    },
  };
  const TYPE_NAMES = Object.keys(TYPES);
  const FORMATS = TYPE_NAMES;
  const TONES = ["차분한 진료 설명", "친근한 말투"];
  const TONE_D = {
    "차분한 진료 설명": "2026년 기본. “안녕하세요. 금손닥터 이현주원장입니다.” 이모티콘 거의 없음",
    "친근한 말투": "기존 스타일. “안녕하세요 :) 티 안나게 예뻐지게 하는 금손닥터…” ^^ :) 가벼운 유머 허용",
  };
  const LEN_MIN = 2500, LEN_MAX = 3000;
  const CATEGORIES = ["보톡스 필러", "리프팅", "스킨부스터", "여드름 흉터", "피부질환", "피부관리 수액", "진료실 이야기", "비만", "기타 의학정보", "시술전후", "색소"];
  const RISKS = ["낮음", "중간", "높음"];
  const PROGRAMS = ["브라이트 아이즈", "터치업키스", "웜업 써마지", "트리플 글로우", "앵커 리프팅", "스캔 울쎄라"];
  const DOW = ["일", "월", "화", "수", "목", "금", "토"];
  const MANUAL = [
    ["title", "제목과 본문이 같은 질문에 답하고 있다"],
    ["intent", "검색자가 궁금한 핵심 질문 1~3개에 답했다"],
    ["dup", "기존 글과 검색 의도가 겹치지 않는다 (겹치면 본문에서 기존 글 링크)"],
    ["facts", "원장 경험·후기·수치는 제공받은 사실만 썼다 (출처 확인)"],
    ["photo", "전후사진은 게시 동의를 확인했고, 사진에서 보이는 변화만 설명했다"],
    ["limit", "필러·시술로 안 되는 경우(수술 등)도 솔직하게 적었다"],
    ["map", "마무리에 진료 철학 + 지도(테헤란로 408 대치빌딩 8층)를 넣었다"],
    ["doctor", "원장님 검수를 받았다"],
  ];

  /* ---------------- State ---------------- */
  let state = load();
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  const ui = { calY: null, calM: null, guideQ: "", reviewFree: { title: "", body: "" } };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return migrate(JSON.parse(raw));
    } catch (e) { /* ignore */ }
    return migrate(seedState());
  }
  // v2: 발행 주기 없음(미리 정한 발행일 제거), 검수 → 초안 검수, 블로그 글 목록(인용글) 추가
  function migrate(s) {
    if (!s.v || s.v < 2) {
      const seedDates = {};
      SEED.items.forEach((i) => { seedDates[i.id] = i.date; });
      s.items.forEach((i) => {
        if (i.status === "검수") i.status = "초안 검수";
        if (seedDates[i.id] && i.date === seedDates[i.id]) i.date = "";
      });
      s.v = 2;
    }
    if (s.v < 3) {
      const map = { "A 최근 스타일": "원인 감별형", "B 기존 스타일": "원리 해설형", "시리즈 칼럼": "진료실 칼럼", "A + 시즌": "시기·시즌형", "시즌 가이드": "시기·시즌형", "후기형": "진료실 칼럼" };
      const special = { p1: "오해 바로잡기형", t1: "비교·선택형", t2: "비교·선택형", t3: "비교·선택형" };
      s.items.forEach((i) => {
        if (!TYPES[i.format]) { i.tone = i.format === "B 기존 스타일" ? TONES[1] : TONES[0]; i.format = special[i.id] || map[i.format] || TYPE_NAMES[0]; }
      });
      s.v = 3;
    }
    s.items.forEach((i) => { if (!TONES.includes(i.tone)) i.tone = TONES[0]; if (!TYPES[i.format]) i.format = TYPE_NAMES[0]; });
    if (!Array.isArray(s.posts)) s.posts = SEED.existing.map((p) => Object.assign({}, p));
    if (!s.v || s.v < 4) {
      const fresh = SEED.existing.map((p) => Object.assign({}, p));
      const byId = {}; fresh.forEach((p) => { byId[p.id] = p.title; });
      const norm = (t) => (t || "").replace(/[\s"“”]/g, "");
      const have = new Set(fresh.map((p) => norm(p.title)));
      const oldTitles = new Set(Object.keys(SEED.oldPostMap || {}));
      // 직접 붙여넣어 추가한 글 중 실제 목록에 없는 것만 남김
      const mine = s.posts.filter((p) => !/^b\d+$/.test(p.id || "") && !/^n\d+$/.test(p.id || "") && !oldTitles.has(p.title) && !have.has(norm(p.title)));
      s.posts = fresh.concat(mine);
      s.items.forEach((i) => {
        if (i.brief && Array.isArray(i.brief.related)) i.brief.related = i.brief.related.map((t) => (SEED.oldPostMap && byId[SEED.oldPostMap[t]]) || t);
      });
      s.v = 4;
    }
    if (!s.v || s.v < 5) {
      s.items.forEach((i) => {
        if (i.prep && i.prep.trim()) {
          i.brief = i.brief || {};
          const n = i.brief.notes || "";
          if (!n.includes(i.prep.trim())) i.brief.notes = (n ? n.trim() + "\n" : "") + i.prep.trim();
        }
        delete i.prep;
      });
      s.v = 5;
    }
    s.items.forEach((i) => { if (i.brief && typeof i.brief.related === "string") i.brief.related = i.brief.related ? [i.brief.related] : []; });
    return s;
  }
  const STOP = new Set(["그리고", "하면", "정말", "있을까", "이유", "효과", "골드제이", "골드제이의원", "feat", "네이버", "블로그", "까요"]);
  function postKeywords(p) {
    if (p.keywords && p.keywords.length) return p.keywords;
    return p.title.split(/[^가-힣A-Za-z0-9]+/).filter((w) => w.length >= 3 && !STOP.has(w)).slice(0, 6);
  }
  const postsNewest = () => state.posts.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  function downloadFile(name, text, type) {
    const blob = new Blob([text], { type: type || "text/markdown;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const fileSafe = (t) => (t || "원고").replace(/[\\/:*?"<>|#]/g, "").replace(/\s+/g, "_").slice(0, 40);
  function seedState() {
    return { items: JSON.parse(JSON.stringify(SEED.items)), updatedAt: new Date().toISOString() };
  }
  function save() {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(state));
  }
  const byId = (id) => state.items.find((i) => i.id === id);
  const uid = () => "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  /* ---------------- Utils ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const diffDays = (a, b) => Math.round((a - b) / 86400000);
  const fmtMD = (s) => { const d = parse(s); return `${d.getMonth() + 1}/${d.getDate()}(${DOW[d.getDay()]})`; };
  const stClass = (s) => "st-" + s.replace(/\s/g, "");
  const chip = (s) => `<span class="chip chip-dot ${stClass(s)}">${esc(s)}</span>`;
  const riskChip = (r) => `<span class="chip risk-${esc(r)}">겹침 ${esc(r)}</span>`;
  const plainLen = (t) => t.replace(/\r/g, "").replace(/^[ \t]*📷[^\n]*(?:\n[^\n]*\S[^\n]*)*/gm, "").replace(/^\[(가운데|캡션)\] /gm, "").replace(/&nbsp;/g, "").replace(/[*#>]/g, "").replace(/\s/g, "").length;

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); ta.remove();
    }
  }
  /* 네이버 에디터용 복사: &nbsp;·** 같은 표시를 서식으로 바꿔서 복사 */
  function plainForNaver(body) {
    return body.replace(/\r/g, "").split("\n").map((l) => {
      l = l.replace(/\s+$/, "");
      if (l.trim() === "&nbsp;") return "";
      return l.replace(/^#\s/, "").replace(/^\s*>\s?/, "").replace(/^\[(가운데|캡션)\] /, "").replace(/\*\*/g, "");
    }).join("\n").replace(/\n{3,}/g, "\n\n");
  }
  async function copyForNaver(title, body) {
    const html = preview(title, body)
      .replace(/<div class="sp"><\/div>/g, "<p><br></p>")
      .replace(/<blockquote>/g, '<blockquote style="border-left:4px solid #00f0a0;padding:8px 16px;font-weight:700">')
      .replace(/<div class="photo">/g, '<p style="color:#00a070">').replace(/<\/div>/g, "</p>");
    const text = title ? title + "\n\n" + plainForNaver(body.replace(/^\s*#\s.*\n?/, "")).replace(/^\n+/, "") : plainForNaver(body);
    try {
      await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([text], { type: "text/plain" }) })]);
    } catch (e) { await copy(text); }
  }

  /* ---------------- Duplicate check ---------------- */
  function dupCheck(text, selfId) {
    const norm = (text || "").replace(/\s/g, "");
    if (norm.length < 2) return [];
    const res = [];
    state.posts.forEach((p) => {
      const hits = postKeywords(p).filter((k) => norm.includes(k.replace(/\s/g, "")));
      if (hits.length) res.push({ kind: "발행 글", title: p.title, date: p.date, hits });
    });
    state.items.forEach((it) => {
      if (it.id === selfId) return;
      const kws = (it.keywords || "").split(",").map((s) => s.trim()).filter(Boolean);
      const hits = kws.filter((k) => k.length >= 2 && norm.includes(k.replace(/\s/g, "")));
      if (hits.length) res.push({ kind: "계획 글", title: it.title, date: it.date, hits });
    });
    return res.sort((a, b) => b.hits.length - a.hits.length);
  }
  const dupRisk = (res) => (!res.length ? "낮음" : res[0].hits.length >= 2 ? "높음" : "중간");

  /* ---------------- Review engine ---------------- */
  function review(title, body) {
    const lines = body.split("\n");
    const checks = [];
    const findHits = (re, filter) => {
      const out = [];
      lines.forEach((ln, i) => {
        const g = new RegExp(re.source, "g");
        let m; let html = ""; let last = 0;
        while ((m = g.exec(ln))) {
          if (!m[0]) { g.lastIndex++; continue; }
          if (filter && !filter(ln, m)) continue;
          html += esc(ln.slice(last, m.index)) + `<em>${esc(m[0])}</em>`;
          last = m.index + m[0].length;
        }
        if (last) out.push({ n: i + 1, html: html + esc(ln.slice(last)) });
      });
      return out;
    };
    const add = (o) => checks.push(o);

    // 1. 금지 표현
    const banned = /(완벽하게|완벽한|100%|확실하게|확실히|부작용\s?없|부작용이\s?없|한 번에 해결|한번에 해결|영구적|실패 없는|실패없는|누구나 효과)/;
    const bHits = findHits(banned);
    const mujo = findHits(/무조건/, (ln, m) => !/(것은|건|필요는|필요가)\s*(아닙|없)/.test(ln.slice(m.index, m.index + 30)));
    const allBanned = bHits.concat(mujo);
    add({ group: "의료 표현", t: "결과 보장·과장 표현", d: "무조건(부정형 제외)·완벽·100%·확실·부작용 없음·영구적 등", s: allBanned.length ? "fail" : "pass", hits: allBanned });

    const sup = findHits(/(최고|최초|유일|1위|최상|가장 효과)/);
    add({ group: "의료 표현", t: "최상급·비교 우위 표현", d: "의료광고 심의에서 문제 될 수 있어 보수적으로 바꾸는 걸 권장", s: sup.length ? "warn" : "pass", hits: sup });

    const derm = findHits(/피부과/);
    add({ group: "브랜드", t: "'피부과' 표현 미사용", d: "골드제이·골드제이의원·의료진·클리닉 등으로 대체", s: derm.length ? "fail" : "pass", hits: derm });

    const quoteMark = findHits(/[가-힣]['’][가-힣]/);
    add({ group: "브랜드", t: "작은따옴표 끼운 표기 (시'술 등) 없음", d: "2026년 원고 기준 사용하지 않음", s: quoteMark.length ? "fail" : "pass", hits: quoteMark });

    // 분량
    const len = plainLen(body.replace(/^#\s.*$/m, ""));
    let ls = "pass";
    if (len < 2100 || len > 4500) ls = "fail"; else if (len < LEN_MIN || len > LEN_MAX) ls = "warn";
    add({ group: "구성", t: `분량 ${len.toLocaleString()}자 (공백 제외)`, d: `목표 ${LEN_MIN.toLocaleString()}~${LEN_MAX.toLocaleString()}자 (평소 작성 분량)${len < LEN_MIN ? ` · ${(LEN_MIN - len).toLocaleString()}자 더 필요` : ""}`, s: ls });

    // 도입
    const firstLines = lines.filter((l) => l.trim() && l.trim() !== "&nbsp;" && !/^#\s/.test(l.trim())).slice(0, 3).join(" ");
    const greet = /안녕하세요/.test(firstLines);
    const hook = /^["“]/.test(firstLines.trim());
    add({ group: "구성", t: "도입: 인사 또는 환자 질문으로 시작", d: greet ? "인사로 시작 (기본값)" : hook ? "환자 질문으로 바로 시작 (2026년 글 절반이 이 형식)" : "첫 줄이 인사도 질문도 아님", s: greet || hook ? "pass" : "warn" });

    const quotes = lines.filter((l) => /^\s*["“]/.test(l)).length;
    add({ group: "구성", t: `환자 질문 인용 ${quotes}개`, d: "도입에 따옴표 질문 2~3개 연속 인용", s: quotes >= 2 ? "pass" : quotes === 1 ? "warn" : "fail" });

    // 소제목
    const heads = []; let inQ = false;
    lines.forEach((l) => { const q = /^\s*>/.test(l); if (q && !inQ) heads.push(l); else if (q && inQ) heads[heads.length - 1] += l; inQ = q; });
    const qHeads = heads.filter((h) => /[?？]|까요|일까|이유는/.test(h)).length;
    add({ group: "구성", t: `인용구 소제목 ${heads.length}개 (질문형 ${qHeads}개)`, d: "인용구(>) + 굵게, 대부분 질문형. 3개 이상 권장", s: heads.length >= 3 ? (qHeads >= Math.ceil(heads.length / 2) ? "pass" : "warn") : heads.length ? "warn" : "fail" });

    const bolds = (body.match(/\*\*[^*]+\*\*/g) || []).filter((b) => !/사진 넣기|추천 이미지|^\*\*>/.test(b)).length;
    add({ group: "구성", t: `굵은 핵심 문장 ${bolds}개`, d: "“즉,”, “결론부터 말씀드리면” 뒤 핵심 문장을 굵게", s: bolds >= 3 ? "pass" : "warn" });

    const photos = lines.filter((l) => /📷|\[추천 이미지|\[사진/.test(l)).length;
    add({ group: "구성", t: `사진 넣기 좋은 구간 ${photos}곳`, d: "도입·원리 설명 직후·전후 사례·정리 위치에 표시", s: photos >= 3 ? "pass" : photos >= 1 ? "warn" : "fail" });

    // 모바일 줄 길이
    const content = lines.map((l) => l.replace(/\*\*/g, "").trim()).filter((l) => l && l !== "&nbsp;" && !/^[>#]/.test(l) && !/📷/.test(l));
    const long = content.map((l, i) => ({ l, i })).filter((x) => x.l.length > 32);
    const ratio = content.length ? long.length / content.length : 0;
    add({ group: "가독성", t: `긴 줄 ${long.length}개 / ${content.length}줄`, d: "한 줄 15~25자 안팎에서 의미 단위로 줄바꿈 (32자 초과 줄 비율 " + Math.round(ratio * 100) + "%)", s: ratio <= 0.1 ? "pass" : ratio <= 0.3 ? "warn" : "fail",
      hits: lines.map((l, i) => ({ l: l.replace(/\*\*/g, "").trim(), n: i + 1 })).filter((x) => x.l.length > 32 && !/^[>#]/.test(x.l) && !/📷/.test(x.l)).slice(0, 6).map((x) => ({ n: x.n, html: esc(x.l) })) });

    // 브랜드 노출
    const gj = (body.match(/골드제이/g) || []).length;
    const prog = PROGRAMS.filter((p) => body.replace(/\s/g, "").includes(p.replace(/\s/g, "")));
    add({ group: "브랜드", t: `골드제이 노출 ${gj}회${prog.length ? " · 프로그램: " + prog.join(", ") : ""}`, d: "중후반에 골드제이의 접근·시그니처 프로그램명 노출", s: gj >= 1 ? (prog.length ? "pass" : "warn") : "fail" });

    const tail = lines.slice(-25).join(" ");
    add({ group: "구성", t: "마무리: 진단·상담 안내", d: "“원장님 진단·상담 후 결정하세요” + 진료 철학 한 문장", s: /(상담|진단)/.test(tail) ? "pass" : "warn" });

    const tags = findHits(/(^|\s)#[가-힣A-Za-z]/);
    add({ group: "브랜드", t: "해시태그", d: "요청 시에만 원고에 붙임", s: tags.length ? "warn" : "pass", hits: tags });

    // 제목
    const tl = title.trim();
    let ts = "pass"; const tnotes = [];
    if (!tl) { ts = "fail"; tnotes.push("제목이 비어 있음"); }
    else {
      if (tl.length < 25) { ts = "warn"; tnotes.push(`${tl.length}자로 짧음 (길고 키워드 많은 형식 권장)`); }
      if (!/[?？]/.test(tl)) { ts = "warn"; tnotes.push("질문형이 아님"); }
      if (/잘하는\s?곳/.test(tl)) { ts = "warn"; tnotes.push("‘잘하는 곳’ 자기평가형 표현"); }
      if (/(강남|선릉|대치)/.test(tl)) tnotes.push("지역 키워드 포함 (2026년 글은 지역 대신 질문형+프로그램명)");
      if (!tnotes.length) tnotes.push(`${tl.length}자 · 질문형`);
    }
    add({ group: "제목", t: "제목: 질문 + 답 + 프로그램명", d: tnotes.join(" · "), s: ts });

    // 수동 확인 정보
    const nums = findHits(/\d+(\.\d+)?\s?(%|개월|년|cc|샷|주|회|분|도|mm|℃)/);
    add({ group: "사실 확인", t: `수치 ${nums.length}곳`, d: "유지기간·용량·온도 등은 논문·공식 자료 근거가 있는지 확인", s: "info", hits: nums.slice(0, 8) });
    const exp = findHits(/(후기|제가 실제로|저도 직접|제 경험|가족|직원)/);
    add({ group: "사실 확인", t: `경험·후기 서술 ${exp.length}곳`, d: "제공받은 원장 경험·환자 사례인지 확인", s: "info", hits: exp.slice(0, 8) });

    const scored = checks.filter((c) => c.s !== "info");
    const pts = scored.reduce((a, c) => a + (c.s === "pass" ? 1 : c.s === "warn" ? 0.5 : 0), 0);
    const score = scored.length ? Math.round((pts / scored.length) * 100) : 0;
    return { checks, score, len, fails: scored.filter((c) => c.s === "fail").length, warns: scored.filter((c) => c.s === "warn").length };
  }

  /* ---------------- Naver mobile preview ---------------- */
  function preview(title, body) {
    const inline = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
    const out = [];
    if (title) out.push(`<h1>${esc(title)}</h1>`);
    const lines = body.replace(/\r/g, "").split("\n");
    let quote = null, photo = null;
    const flush = () => {
      if (quote) { out.push(`<blockquote>${quote.join("<br>")}</blockquote>`); quote = null; }
      if (photo) { out.push(`<div class="photo">${photo.join("<br>")}</div>`); photo = null; }
    };
    lines.forEach((raw, i) => {
      const l = raw.replace(/\s+$/, "");
      if (i === 0 && /^#\s/.test(l) && title) return;
      if (/^#\s/.test(l)) { flush(); out.push(`<h1>${inline(l.replace(/^#\s/, ""))}</h1>`); return; }
      if (!l.trim() || l.trim() === "&nbsp;") { flush(); if (out[out.length - 1] !== '<div class="sp"></div>') out.push('<div class="sp"></div>'); return; }
      if (/^\s*>/.test(l)) { if (photo) flush(); (quote = quote || []).push(inline(l.replace(/^\s*>\s?/, ""))); return; }
      if (/📷/.test(l)) { flush(); photo = [inline(l)]; return; }
      if (photo) { photo.push(inline(l)); return; }
      flush();
      if (/^\[가운데\] /.test(l)) { out.push(`<p style="text-align:center">${inline(l.slice(6))}</p>`); return; }
      if (/^\[캡션\] /.test(l)) { out.push(`<p style="text-align:center;color:#868b94;font-size:13px">${inline(l.slice(5))}</p>`); return; }
      out.push(`<p>${inline(l)}</p>`);
    });
    flush();
    return out.join("");
  }

  /* ---------------- Draft skeleton & prompt ---------------- */
  function sections(it) {
    const b = it.brief || {};
    const k = (it.keywords || "").split(",")[0].trim() || it.title;
    const P = b.program || "○○ 프로그램";
    return (TYPES[it.format] || TYPES[TYPE_NAMES[0]]).sec(k, b, P);
  }
  function skeleton(it) {
    const b = it.brief || {};
    const qs = (b.questions || "").split("\n").map((x) => x.trim()).filter(Boolean);
    const causes = (b.causes || "").split("\n").map((x) => x.trim()).filter(Boolean);
    const friendly = it.tone === "친근한 말투";
    const greet = friendly ? "안녕하세요 :) 티 안나게 예뻐지게 하는 금손닥터,  \n골드제이의원 이현주 원장입니다." : "안녕하세요. 금손닥터 이현주원장입니다.";
    const S = "\n&nbsp;\n";
    const quoteHead = (h) => h.split("\n").map((l) => `> **${l}**`).join("  \n");
    const p = [];
    let photo = 1;
    const circled = "①②③④⑤⑥⑦⑧";
    p.push(`# ${it.draftTitle || it.title}`, S, greet, S);
    (qs.length ? qs : ["원장님, ✍️ 환자 질문 1", "✍️ 환자 질문 2", "✍️ 환자 질문 3"]).slice(0, 3).forEach((q) => { p.push(`"${q.replace(/^["“]|["”]$/g, "")}"`, ""); });
    p.push("진료실에서 정말 자주 듣는 질문입니다.", S);
    p.push("✍️ **[도입 · 약 250자]** 이 고민이 생기는 상황, 많이 오해하는 지점, 오늘 다룰 내용을 예고합니다.", S);
    p.push(`📷 **[사진 넣기 좋은 구간 ${circled[0]}｜도입 대표 이미지]**  \n고민이 보이는 정면 이미지 (실제 사진이 없으면 AI 이미지, 캡션에 표시)`, S);
    sections(it).forEach(([h, n, guide, ph]) => {
      p.push(quoteHead(h), S);
      if (guide === "CAUSES") {
        (causes.length ? causes : ["원인 A → 처방 X", "원인 B → 처방 Y", "원인 C → 처방 Z"]).forEach((c) => {
          const [a, x] = c.split(/→|->/).map((v) => (v || "").trim());
          p.push(`**${a}라면**  \n${x ? x + "을(를) 먼저 고려합니다." : ""}  \n✍️ **[약 ${Math.round(n / Math.max(causes.length || 3, 1) / 10) * 10}자]** 이 원인을 어떻게 구분하는지, 왜 이 처방이 맞는지`, "");
        });
        p.push(S);
      } else {
        p.push(`✍️ **[약 ${n}자]** ${guide}`, S);
      }
      if (ph) { photo++; p.push(`📷 **[사진 넣기 좋은 구간 ${circled[photo - 1]}｜${ph.split(" (")[0]}]**  \n${ph}`, S); }
    });
    const rel = Array.isArray(b.related) ? b.related : [];
    if (rel.length) p.push("관련해서 더 궁금하신 분들은  \n아래 글도 함께 읽어보세요.", "", ...rel.map((t) => `📎 인용글: ${t}`), S);
    p.push("✍️ **[굵은 요약 · 약 200자]** **즉, ~** 로 시작해 오늘 내용을 2~3줄로 정리합니다.", S);
    p.push("원인을 분석하고  \n필요한 곳에 필요한 치료를 하는 것,  \n그것이 제가 생각하는  \n치료의 시작입니다.", S);
    p.push("원장님 진단·상담 후  \n신중히 결정하시길 바랍니다.", S);
    if (friendly) p.push("지금까지 금손닥터 이현주원장이었습니다.  \n감사합니다 :)", S);
    p.push("📷 **[골드제이의원 지도｜테헤란로 408 대치빌딩 8층]**");
    return p.join("\n");
  }

  const TITLE_RULE = "각 제목에 메인 키워드 중 첫 번째 키워드를 그대로, 되도록 앞쪽에 넣는다. 골드제이 제목 형식인 질문 + 답 + 프로그램명, 공백 포함 30~60자, 세 개는 서로 다른 각도로";
  function parseTitles(out) {
    const titles = []; let body = out;
    const cut = out.search(/^\s*---\s*$/m);
    const head = cut >= 0 ? out.slice(0, cut) : out.split("\n").slice(0, 6).join("\n");
    head.split("\n").forEach((l) => { const m = l.match(/^\s*(?:\*\*)?제목\s*\d\s*[:：]\s*(?:\*\*)?\s*(.+?)\s*(?:\*\*)?\s*$/); if (m) titles.push(m[1].replace(/^["“]|["”]$/g, "").trim()); });
    if (cut >= 0 && titles.length) body = out.slice(cut).replace(/^\s*---\s*\n?/, "");
    else if (titles.length) body = out.split("\n").filter((l) => !/^\s*(?:\*\*)?제목\s*\d\s*[:：]/.test(l)).join("\n");
    return { titles: titles.slice(0, 3), body: body.replace(/^\s*#\s.*\n?/, "").trim() };
  }
  function titlePrompt(it, body) {
    const b = it.brief || {};
    return [
      "골드제이의원 네이버 블로그 글의 제목 후보 3개를 만들어 줘.",
      `- 메인 키워드: ${it.keywords || it.title}`,
      `- 주제: ${it.title}`,
      `- 연결할 골드제이 프로그램: ${b.program || "(없음)"}`,
      `- 규칙: ${TITLE_RULE}. '피부과' 표현과 과장 표현(100%, 완벽, 확실, 부작용 없음 등)은 쓰지 않는다.`,
      "- 참고할 실제 골드제이 제목: 다크서클 시술, 눈밑필러 하면 좋아질까요? 원인에 따라 치료가 달라집니다 골드제이 브라이트 아이즈 / 광대가 커서 땅콩형 얼굴이 된 걸까요? 노화로 인한 볼륨 감소와 탄력 저하, 쥬베룩으로 개선하기",
      body ? `- 본문 앞부분: ${body.replace(/\s+/g, " ").slice(0, 1200)}` : "",
      "- 출력: `제목1: …` `제목2: …` `제목3: …` 세 줄만. 다른 말은 쓰지 않는다.",
    ].filter(Boolean).join("\n");
  }

  const PDFS = {}; // 글 id → { name, data(base64) } · 용량이 커서 브라우저 저장소에는 넣지 않음
  function sourceBlock(it) {
    const src = it.source || {};
    const pdf = PDFS[it.id];
    if (!(src.text || "").trim() && !pdf) return [];
    const dir = (it.directions || [])[it.direction];
    return [
      "",
      "[원자료 — 이 글의 바탕]",
      src.url ? `- 유튜브 영상: ${src.url} (원장님 영상. 글 끝부분 지도 앞에 📷 **[유튜브 영상 넣기｜영상 제목]** 자리를 표시한다)` : "",
      pdf ? `- 첨부 PDF: ${pdf.name}` : "",
      "- 원자료에 나온 설명·사실·수치·원장 경험만 쓴다. 원자료에 없는 경험·수치·후기는 만들지 않는다.",
      "- 자동 자막의 오탈자는 문맥으로 바로잡되, 확실하지 않은 고유명사·수치·이력은 빼거나 [확인 필요]로 표시한다.",
      "- 영상·자료의 흐름을 그대로 옮기지 말고, 아래 방향과 골드제이 글 구성에 맞게 다시 짠다.",
      dir ? `- 이번 글 방향: ${dir.label} ${dir.angle} — ${dir.summary}${dir.overlap ? " / 기존 글과의 관계: " + dir.overlap : ""}` : "",
      (src.text || "").trim() ? "\n<원자료_텍스트>\n" + src.text.trim().slice(0, 60000) + "\n</원자료_텍스트>" : "",
    ].filter(Boolean);
  }
  function directionPrompt(it) {
    const src = it.source || {};
    return [
      "너는 골드제이의원 공식 네이버 블로그(blog.naver.com/dr_ponym) 원고 기획 파트너다.",
      "첨부 PDF 또는 아래 원자료(원장님 유튜브 자막·요약본)로 블로그 글을 한 편 쓰려고 한다. 글의 방향 3가지(A안·B안·C안)를 제안해 줘.",
      "- 이미 발행한 글과 내용이 겹치지 않는 방향을 우선한다. 겹치는 안이 있으면 솔직히 적는다.",
      "- 원자료에 실제로 나온 내용만 근거로 삼는다.",
      `- 메인 키워드(있으면 반영): ${it.keywords || "(미정)"}`,
      `- 주제(가제): ${it.title}`,
      "",
      "[이미 발행한 글 제목]",
      state.posts.map((p) => "- " + p.title).join("\n"),
      "",
      "[출력] 아래 형식의 JSON 배열만 출력한다. 다른 말은 쓰지 않는다.",
      '[{"label":"A안","angle":"한 줄 방향(15자 안팎)","title":"제목 예시","summary":"어떤 질문에 답하고 무엇을 중심으로 쓰는지 1~2문장","overlap":"기존 글과의 관계 한 줄"}, …3개]',
      "- 추천하는 안을 맨 앞(A안)에 둔다.",
      (src.text || "").trim() ? "\n<원자료_텍스트>\n" + src.text.trim().slice(0, 60000) + "\n</원자료_텍스트>" : "",
    ].join("\n");
  }
  function parseDirections(out) {
    const m = out.match(/\[[\s\S]*\]/); if (!m) return [];
    try { return JSON.parse(m[0]).filter((d) => d && d.label).slice(0, 3); } catch (e) { return []; }
  }

  function buildPrompt(it, mode) {
    const b = it.brief || {};
    const secs = sections(it).map(([h, n, g], i) => `  ${i + 1}) 소제목 “${h.replace(/\n/g, " ")}” — 약 ${n}자: ${g === "CAUSES" ? "원인별 처방 매칭(브리프의 원인 → 처방을 하나씩)" : g}`).join("\n");
    return [
      "너는 골드제이의원 공식 네이버 블로그(blog.naver.com/dr_ponym) 원고 작성 파트너다.",
      "아래 [스타일 프로필]은 실제 골드제이 원고에서 뽑은 것이고, 어떤 일반 블로그 작성법보다 우선한다.",
      "",
      "[이번 글 브리프]",
      `- 가제: ${it.draftTitle || it.title}`,
      `- 글 유형: ${it.format} — ${(TYPES[it.format] || {}).d || ""}`,
      `- 말투: ${it.tone} — ${TONE_D[it.tone] || ""}`,
      `- 카테고리: ${it.category}`,
      `- 메인 키워드: ${it.keywords || "(미정)"}`,
      `- 환자 질문(도입 인용): ${(b.questions || "(미정)").replace(/\n/g, " / ")}`,
      `- 원인 → 처방: ${(b.causes || "(미정)").replace(/\n/g, " / ")}`,
      `- 바로잡을 오해: ${b.myth || "(미정)"}`,
      `- 연결할 골드제이 프로그램: ${b.program || "(미정)"}`,
      `- 인용글(본문에서 안내할 우리 블로그 글): ${(Array.isArray(b.related) && b.related.length) ? b.related.join(" / ") : "(없음)"}`,
      `- 키워드가 비슷한 기존 글(내용이 겹치지 않게 차별화): ${it.overlap || "(없음)"}`,
      `- 메모(원장님께 받은 사실·수치): ${b.notes || "(없음)"}`,
      "",
      ...sourceBlock(it),
      "",
      "[분량 — 가장 중요]",
      `- 본문은 공백 제외 ${LEN_MIN.toLocaleString()}~${LEN_MAX.toLocaleString()}자. ${LEN_MIN.toLocaleString()}자보다 짧으면 안 된다. 사진 자리 표시·제목·소제목은 분량에 넣지 않고 계산한다.`,
      "- 아래 구성과 섹션별 목표 분량을 지킨다. 다 쓴 뒤 분량이 모자라면 원인·원리 설명, 비유, 판단 기준을 보강한다. 없는 경험·수치를 지어내서 채우지 않는다.",
      "  0) 도입 — 인사 + 환자 질문 2~3개 인용 + 오늘 다룰 내용 예고 (약 250자)",
      secs,
      "  마지막) 굵은 요약 문단 (약 200자) → 진료 철학 한 문장 → 원장님 진단·상담 안내 → 지도 자리",
      "",
      "[지켜야 할 것]",
      "- 이현주 대표원장 1인칭. 제공받지 않은 원장 경험·환자 후기·수치는 만들지 않는다.",
      "- '피부과' 표현 금지. 시'술 같은 작은따옴표 표기 금지.",
      "- 무조건(부정형 제외)·완벽하게·100%·확실하게·부작용 없음·한 번에 해결·영구적·실패 없는·누구나 효과 금지.",
      "- 한 줄 15~25자, 줄 끝 공백 두 칸으로 줄바꿈, 2~4줄마다 빈 줄은 &nbsp; 한 줄.",
      "- 소제목은 인용구(>) + 굵게, 길면 두 줄. 핵심 문장은 굵게.",
      "- 사진 넣기 좋은 구간을 📷 **[사진 넣기 좋은 구간 ①｜용도]** 형식으로 3곳 이상 표시.",
      "- 수술이 더 맞는 경우 등 한계도 솔직하게. 해시태그는 넣지 않는다.",
      mode === "api"
        ? "- 출력: 맨 앞에 제목 후보 3개를 `제목1: …` `제목2: …` `제목3: …` 세 줄로 쓰고(" + TITLE_RULE + "), 다음 줄에 `---` 한 줄, 그다음 원고 본문만 쓴다. 본문 첫 줄에 # 제목은 쓰지 않는다. 설명·분량 보고는 붙이지 않는다."
        : "- 제목 후보 3개(" + TITLE_RULE + ", 추천 1개 표시) 뒤에 완성 원고를 마크다운으로 준다.",
      "",
      "[스타일 프로필]",
      SEED.styleProfile,
    ].join("\n");
  }

  /* ---------------- Claude API (선택: 키가 있으면 앱 안에서 초안 작성) ---------------- */
  const AI_KEY = "goldj-anthropic";
  const AI_MODELS = [["claude-sonnet-5-5", "Sonnet 5.5 · 빠르고 저렴 (추천)"], ["claude-opus-5-5", "Opus 5.5 · 가장 정교함"]];
  const AI_PRICE = { "claude-sonnet-5-5": [2, 10], "claude-opus-5-5": [4, 20] }; // USD / 100만 토큰 (입력, 출력)
  function aiCfg() { try { return JSON.parse(localStorage.getItem(AI_KEY)) || {}; } catch (e) { return {}; } }
  /* 잔액: Anthropic API에는 일반 키로 잔액을 조회하는 기능이 없어서, 충전액 − 이 앱에서 쓴 금액으로 계산 */
  // 업리카 연동 제거(V9): 예전에 저장된 업리카 키가 있으면 지움
  try { localStorage.removeItem("goldj-uplika"); } catch (e) {}

  function aiUsageLog() { try { return JSON.parse(localStorage.getItem("goldj-ai-usage") || "[]"); } catch (e) { return []; } }
  function balanceInfo() {
    const cfg = aiCfg();
    if (!(cfg.credit > 0)) return null;
    const since = cfg.creditAt || "";
    const used = aiUsageLog().filter((x) => x.at >= since).reduce((a, x) => a + (x.usd || 0), 0);
    return { credit: cfg.credit, used, left: cfg.credit - used, since };
  }
  function renderBalance() {
    const el = $("#ai-balance"); if (!el) return;
    const b = balanceInfo();
    if (!aiCfg().key) { el.textContent = "Claude 미연결"; return; }
    el.innerHTML = b
      ? `잔액 약 <b>$${b.left.toFixed(2)}</b> <span class="muted">(충전 $${b.credit.toFixed(2)} − 사용 $${b.used.toFixed(2)})</span>`
      : `잔액: 설정에서 충전액을 입력하세요`;
  }
  function openAiModal(after) {
    const cfg = aiCfg();
    $("#modal-root").innerHTML = `
      <div class="modal-bg" id="mbg"><div class="modal" role="dialog" aria-modal="true">
        <div class="modal-head"><h2 class="t-h4">Claude 연결 (API 키)</h2><button class="x" id="mx" aria-label="닫기">×</button></div>
        <p class="t-body-sm" style="margin-top:0">키를 넣으면 “Claude로 초안 쓰기”가 이 화면에서 바로 원고를 써요. 키는 <b>이 브라우저에만</b> 저장되고 데이터 백업 파일에는 들어가지 않아요. 키는 console.anthropic.com에서 만들 수 있고, 쓴 만큼 요금이 나가요.</p>
        <div class="stack">
          <div class="field"><label>API 키</label><input class="input" id="ai-key" type="password" value="${esc(cfg.key || "")}" placeholder="sk-ant-..."></div>
          <div class="field"><label>충전한 크레딧 (USD) <span class="hint">console에서 확인한 현재 잔액을 넣으면, 이후 이 앱에서 쓴 만큼 빼서 보여줘요</span></label><input class="input" id="ai-credit" type="number" step="0.01" min="0" value="${cfg.credit || ""}" placeholder="예: 10"></div>
          <div class="field"><label>모델</label><select class="select" id="ai-model">${AI_MODELS.map(([v, l]) => `<option value="${v}" ${v === (cfg.model || AI_MODELS[0][0]) ? "selected" : ""}>${l}</option>`).join("")}</select></div>
        </div>
        <div class="btn-row mt-lg" style="justify-content:space-between"><button class="btn-link btn-danger" id="ai-clear">키 지우기</button><button class="btn btn-primary" id="ai-save">저장</button></div>
      </div></div>`;
    const close = () => { $("#modal-root").innerHTML = ""; };
    $("#mx").onclick = close;
    $("#mbg").addEventListener("click", (e) => { if (e.target.id === "mbg") close(); });
    $("#ai-clear").onclick = () => { localStorage.removeItem(AI_KEY); close(); renderBalance(); toast("키를 지웠어요"); };
    $("#ai-save").onclick = () => {
      const key = $("#ai-key").value.trim(); if (!key) { $("#ai-key").focus(); return; }
      const credit = parseFloat($("#ai-credit").value) || 0;
      const creditAt = credit !== (cfg.credit || 0) ? new Date().toISOString() : (cfg.creditAt || new Date().toISOString());
      localStorage.setItem(AI_KEY, JSON.stringify({ key, model: $("#ai-model").value, credit, creditAt })); close(); renderBalance(); toast("저장했어요");
      if (after) after();
    };
  }
  async function aiWrite(prompt, onText, pdf) {
    const cfg = aiCfg();
    const content = pdf ? [{ type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf.data }, title: pdf.name }, { type: "text", text: prompt }] : prompt;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": cfg.key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({ model: cfg.model || AI_MODELS[0][0], max_tokens: 16000, stream: true, messages: [{ role: "user", content }] }),
    });
    if (!res.ok) {
      let msg = await res.text();
      try { msg = JSON.parse(msg).error.message; } catch (e) { /* keep raw */ }
      throw new Error(`${res.status} ${msg}`.slice(0, 300));
    }
    const reader = res.body.getReader(); const dec = new TextDecoder();
    let buf = "", out = ""; const usage = { in: 0, out: 0 };
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
        if (!line.startsWith("data:")) continue;
        let ev; try { ev = JSON.parse(line.slice(5).trim()); } catch (e) { continue; }
        if (ev.type === "message_start" && ev.message && ev.message.usage) usage.in = ev.message.usage.input_tokens || 0;
        if (ev.type === "message_delta" && ev.usage) usage.out = ev.usage.output_tokens || usage.out;
        if (ev.type === "content_block_delta" && ev.delta && ev.delta.type === "text_delta") { out += ev.delta.text; onText(out); }
        if (ev.type === "error") throw new Error(ev.error && ev.error.message || "API 오류");
      }
    }
    const pr = AI_PRICE[cfg.model || AI_MODELS[0][0]] || AI_PRICE[AI_MODELS[0][0]];
    usage.usd = (usage.in * pr[0] + usage.out * pr[1]) / 1e6;
    const log = JSON.parse(localStorage.getItem("goldj-ai-usage") || "[]");
    log.push({ at: new Date().toISOString(), model: cfg.model || AI_MODELS[0][0], in: usage.in, out: usage.out, usd: usage.usd });
    localStorage.setItem("goldj-ai-usage", JSON.stringify(log.slice(-200)));
    return { out, usage };
  }

  /* ---------------- Modal ---------------- */
  function openItemModal(item, preset) {
    const isNew = !item;
    const it = item || Object.assign({ id: uid(), title: "", date: "", format: FORMATS[0], tone: TONES[0], status: "아이디어", category: CATEGORIES[0], risk: "낮음", overlap: "", keywords: "", draft: "", draftTitle: "" }, preset || {});
    const opt = (arr, v) => arr.map((x) => `<option ${x === v ? "selected" : ""}>${esc(x)}</option>`).join("");
    $("#modal-root").innerHTML = `
      <div class="modal-bg" id="mbg"><div class="modal" role="dialog" aria-modal="true">
        <div class="modal-head"><h2 class="t-h4">${isNew ? "새 글 추가" : "글 정보 수정"}</h2><button class="x" id="mx" aria-label="닫기">×</button></div>
        <div class="form-grid">
          <div class="field full"><label>주제 (가제) <span class="hint">제목은 초안 작성에서 정해요</span></label><input class="input" id="f-title" value="${esc(it.title)}" placeholder="예: 목주름, 왜 얼굴보다 먼저 나이를 말할까?"></div>
          <div class="field full"><label>메인 키워드 <span class="hint">쉼표로 구분 · 제목 추천에 쓰여요</span></label><input class="input" id="f-kw" value="${esc(it.keywords)}" placeholder="예: 목주름, 목주름 필러"></div>
          <div class="field"><label>발행일 <span class="hint">비우면 주제 뱅크</span></label><input class="input" type="date" id="f-date" value="${esc(it.date)}"></div>
          <div class="field"><label>카테고리</label><select class="select" id="f-cat">${opt(CATEGORIES, it.category)}</select></div>
          <div class="field"><label>글 유형</label><select class="select" id="f-format">${opt(FORMATS, it.format)}</select><span class="hint" id="f-fd">${esc(TYPES[it.format] ? TYPES[it.format].d : "")}</span></div>
          <div class="field"><label>말투</label><select class="select" id="f-tone">${opt(TONES, it.tone)}</select><span class="hint" id="f-td">${esc(TONE_D[it.tone] || "")}</span></div>
          ${isNew ? "" : `<div class="field"><label>진행 상태</label><select class="select" id="f-status">${opt(STATUSES, it.status)}</select></div>`}
          <div class="field full dup-box" id="f-dup"></div>
        </div>
        <div class="btn-row mt-lg" style="justify-content:space-between">
          <div>${isNew ? "" : '<button class="btn-link btn-danger" id="f-del">삭제</button>'}</div>
          <div class="btn-row">${isNew ? `<button class="btn btn-ghost" id="f-save-go">저장하고 초안 쓰기 →</button>` : `<a class="btn btn-ghost" href="#/draft/${it.id}" id="f-go">초안 열기 →</a>`}<button class="btn btn-primary" id="f-save">저장</button></div>
        </div>
      </div></div>`;
    const close = () => ($("#modal-root").innerHTML = "");
    const renderDup = () => {
      const res = dupCheck($("#f-title").value + " " + $("#f-kw").value, it.id);
      const r = dupRisk(res);
      $("#f-dup").innerHTML = res.length
        ? `<div class="t-caption" style="color:#3b4148;font-weight:700">참고: 키워드가 비슷한 글이 있어요 ${riskChip(r)} <span class="muted" style="font-weight:500">· 자동 확인이라 직접 고를 필요 없어요</span></div>` + res.slice(0, 4).map((x) => `<div class="dup-item"><span class="kbd">${x.kind}</span><span style="flex:1">${esc(x.title)}${x.date ? ` <span class="muted">(${esc(x.date)})</span>` : ""}</span><span class="muted">${x.hits.map(esc).join(", ")}</span></div>`).join("")
        : `<div class="t-caption">주제·키워드를 쓰면 비슷한 기존 글이 있는지 자동으로 확인해요.</div>`;
      return { r, res };
    };
    renderDup();
    ["#f-title", "#f-kw"].forEach((s) => $(s).addEventListener("input", renderDup));
    $("#mx").onclick = close;
    $("#mbg").addEventListener("click", (e) => { if (e.target.id === "mbg") close(); });
    $("#f-format").onchange = () => { $("#f-fd").textContent = TYPES[$("#f-format").value].d; };
    $("#f-tone").onchange = () => { $("#f-td").textContent = TONE_D[$("#f-tone").value]; };
    if ($("#f-go")) $("#f-go").onclick = close;
    if ($("#f-del")) $("#f-del").onclick = () => {
      if (!confirm("이 글을 삭제할까요? 초안도 함께 지워집니다.")) return;
      state.items = state.items.filter((x) => x.id !== it.id); save(); close(); render(); toast("삭제했어요");
    };
    const doSave = (go) => {
      const title = $("#f-title").value.trim();
      if (!title) { $("#f-title").focus(); return; }
      const { r, res } = renderDup();
      Object.assign(it, {
        title, keywords: $("#f-kw").value.trim(), date: $("#f-date").value, status: $("#f-status") ? $("#f-status").value : it.status,
        format: $("#f-format").value, tone: $("#f-tone").value, category: $("#f-cat").value,
        risk: r, overlap: res.filter((x) => x.kind === "발행 글").slice(0, 2).map((x) => x.title).join(" / "),
      });
      if (isNew) state.items.push(it);
      save(); close();
      if (go) location.hash = "#/draft/" + it.id; else render();
      toast(isNew ? "추가했어요" : "저장했어요");
    };
    $("#f-save").onclick = () => doSave(false);
    if ($("#f-save-go")) $("#f-save-go").onclick = () => doSave(true);
    setTimeout(() => $("#f-title").focus(), 30);
  }

  function dirOpts(it) {
    const ds = it.directions || [];
    if (!ds.length) return "";
    return ds.map((d, k) => `<button type="button" class="dir-opt ${it.direction === k ? "on" : ""}" data-dir="${k}"><div class="dl"><span class="n">${esc(d.label)}</span><b>${esc(d.angle || "")}</b>${k === 0 ? '<span class="rec">추천</span>' : ""}</div>${d.title ? `<div class="dt">${esc(d.title)}</div>` : ""}<div class="ds">${esc(d.summary || "")}</div>${d.overlap ? `<div class="do">기존 글: ${esc(d.overlap)}</div>` : ""}</button>`).join("");
  }
  function titleOpts(it) {
    const ts = it.titleOptions || [];
    if (!ts.length) return "";
    return `<div class="t-caption" style="font-weight:700;color:#3b4148">추천 제목 · 눌러서 고르세요</div>` + ts.map((t, k) => `<button type="button" class="title-opt ${t === it.draftTitle ? "on" : ""}" data-topt="${k}"><span class="n">${k + 1}</span><span class="tt">${esc(t)}</span><span class="tl">${t.replace(/\s/g, "").length}자</span></button>`).join("");
  }

  function openPostsModal() {
    $("#modal-root").innerHTML = `
      <div class="modal-bg" id="mbg"><div class="modal" role="dialog" aria-modal="true">
        <div class="modal-head"><h2 class="t-h4">블로그 글 목록 추가</h2><button class="x" id="mx" aria-label="닫기">×</button></div>
        <p class="t-body-sm" style="margin-top:0">블로그 “전체보기” 목록에서 제목과 날짜를 복사해 붙여넣으세요. 한 줄에 글 하나예요. 날짜(2026. 9. 2. 또는 2026-09-02)가 있으면 자동으로 읽고, 이미 있는 제목은 건너뛰어요.</p>
        <textarea class="textarea" id="pm-text" style="min-height:220px" placeholder="앵커 리프팅이란? 다운타임은 적게 자연스러운 변화가 가능한 이유  2026. 9. 2.&#10;입가 잔주름 | 2026-08-18"></textarea>
        <div class="btn-row mt-lg" style="justify-content:flex-end"><button class="btn btn-primary" id="pm-add">추가</button></div>
      </div></div>`;
    const close = () => { $("#modal-root").innerHTML = ""; };
    $("#mx").onclick = close;
    $("#mbg").addEventListener("click", (e) => { if (e.target.id === "mbg") close(); });
    $("#pm-add").onclick = () => {
      const have = new Set(state.posts.map((p) => p.title.replace(/\s/g, "")));
      let n = 0;
      $("#pm-text").value.split("\n").forEach((line) => {
        let l = line.trim(); if (!l) return;
        let date = "";
        const m = l.match(/(20\d{2})[.\-/]\s?(\d{1,2})[.\-/]\s?(\d{1,2})\.?/);
        if (m) { date = `${m[1]}-${pad(m[2])}-${pad(m[3])}`; l = l.replace(m[0], ""); }
        const title = l.split(/\t|\s\|\s|\|/)[0].trim();
        if (title.length < 2 || have.has(title.replace(/\s/g, ""))) return;
        have.add(title.replace(/\s/g, ""));
        state.posts.push({ id: uid(), title, date, category: "", keywords: [] }); n++;
      });
      save(); close(); render(); toast(`${n}편을 추가했어요`);
    };
  }

  /* ---------------- Views ---------------- */
  const NAV = [
    ["home", "◎", "홈"],
    ["calendar", "▦", "발행 캘린더"],
    ["topics", "✦", "주제 뱅크"],
    ["draft", "✎", "초안 작성"],
    ["review", "✓", "초안 검수"],
    // 스타일 가이드는 메뉴에서만 숨김 (규칙은 검수·골격·프롬프트에 그대로 적용, #/guide 로 열림)
  ];

  function renderNav(route) {
    const counts = {
      topics: state.items.filter((i) => !i.date).length,
      review: state.items.filter((i) => i.status === "초안 검수").length,
    };
    $("#nav").innerHTML = NAV.map(([k, ico, label]) =>
      `<a class="nav-row ${route === k ? "active" : ""}" href="#/${k}"><span class="ico">${ico}</span>${label}${counts[k] ? `<span class="count">${counts[k]}</span>` : ""}</a>`).join("");
  }

  function upcoming() {
    const t = ymd(today());
    return state.items.filter((i) => i.date && i.date >= t && i.status !== "발행 완료").sort((a, b) => a.date.localeCompare(b.date));
  }

  function scoreRing(score, sm) {
    return `<div class="score-ring ${sm ? "sm" : ""}" style="background:conic-gradient(var(--primary) ${score * 3.6}deg, #2a2d31 0)"><div class="inner"><div><b>${score}</b>${sm ? "" : "<span>검수 점수</span>"}</div></div></div>`;
  }

  function reviewedList() {
    const out = [];
    state.items.forEach((it) => (it.reviews || []).forEach((r, k) => out.push({ it, r, k })));
    return out.sort((a, b) => b.r.at.localeCompare(a.r.at));
  }

  function viewHome() {
    const up = upcoming();
    const next = up[0];
    const t = today();
    const dated = state.items.filter((i) => i.date);
    const stats = [
      [up.length, "편", "예정된 글"],
      [state.items.filter((i) => ["초안 작성", "초안 검수"].includes(i.status)).length, "편", "초안 작성·검수 중"],
      [state.items.filter((i) => i.status === "원장님 검수").length, "편", "원장님 검수 대기"],
      [state.items.filter((i) => !i.date).length, "개", "주제 뱅크"],
    ];
    let hero = `<div class="empty">발행일이 정해진 글이 없어요. 캘린더에서 날짜 칸을 누르거나, 글 정보에서 발행일을 정해 주세요.</div>`;
    if (next) {
      const d = parse(next.date); const dd = diffDays(d, t);
      const r = next.draft ? review(next.draftTitle || next.title, next.draft) : null;
      hero = `
        <div class="hero">
          <div>
            <span class="dday">${dd === 0 ? "D-DAY" : "D-" + dd} · ${fmtMD(next.date)} 발행</span>
            <h1 class="t-h1 mt-lg">${esc(next.title)}</h1>
            <p class="t-body-lg lead">${esc(next.keywords ? "메인 키워드 · " + next.keywords : "")}</p>
            <div class="btn-row">
              <a class="btn btn-primary" href="#/draft/${next.id}">초안 열기</a>
              <a class="btn btn-green" href="#/review/${next.id}">초안 검수</a>
            </div>
          </div>
          <div class="card-feature">
            <div class="t-eyebrow muted">이번 글 상태</div>
            <div style="display:flex;gap:24px;align-items:center;margin-top:16px">
              ${r ? scoreRing(r.score) : scoreRing(0)}
              <div class="stack" style="flex:1">
                <div>${chip(next.status)} ${riskChip(next.risk)}</div>
                <div class="t-body-sm">${r ? `분량 <b>${r.len.toLocaleString()}자</b> · 수정 필요 <b>${r.fails}</b> · 확인 <b>${r.warns}</b>` : "아직 초안이 없어요."}</div>
                <div class="t-caption">${esc(next.format)} · ${esc(next.category)}</div>
              </div>
            </div>
          </div>
        </div>`;
    }
    const tick = (up.length ? up : dated).slice(0, 8).map((i) => `<span class="ticker-item"><b>${fmtMD(i.date)}</b>${esc(i.title)} · ${esc(i.status)}</span>`).join("");
    const soon = state.items.filter((i) => i.date && i.status !== "발행 완료" && !["원장님 검수"].includes(i.status))
      .map((i) => ({ i, dl: parse(i.date) })).filter((x) => diffDays(x.dl, t) <= 14).sort((a, b) => a.dl - b.dl);
    return `
      <section class="band band-mint"><div class="container">${hero}</div></section>
      <section class="band band-mint" style="padding-top:0"><div class="container grid g-4">
        ${stats.map(([n, u, l]) => `<div class="stat"><div class="num">${n}<small>${u}</small></div><div class="lbl">${l}</div></div>`).join("")}
      </div></section>
      ${tick ? `<div class="ticker" aria-label="다가오는 발행"><div class="ticker-track">${tick}${tick}</div></div>` : ""}
      <section class="band"><div class="container">
        <div class="page-head"><div><div class="t-eyebrow mint-text">Pipeline</div><h2 class="t-h3">진행 보드</h2></div><button class="btn btn-ghost" data-new>＋ 새 글</button></div>
        <div class="pipeline mt-lg">
          ${STATUSES.map((s) => { const xs = state.items.filter((i) => i.status === s).sort((a, b) => (a.date || "9").localeCompare(b.date || "9"));
            return `<div class="pipe-col"><h4><span>${s}</span><span class="muted">${xs.length}</span></h4>${xs.map((i) => `<div class="pipe-card" data-edit="${i.id}">${esc(i.title)}<div class="t-caption">${i.date ? fmtMD(i.date) : "날짜 미정"}</div></div>`).join("")}</div>`; }).join("")}
        </div>
      </div></section>
      <section class="band band-soft"><div class="container grid g-main">
        <div class="card">
          <h3 class="t-h4">다가오는 발행 (2주 안)</h3>
          <p class="t-caption" style="margin:4px 0 8px">직접 정한 발행일 기준 · 원장님 검수 대기 글은 제외</p>
          ${soon.length ? soon.map(({ i, dl }) => { const n = diffDays(dl, t); return `
            <div class="list-row clickable" data-edit="${i.id}">
              <div class="date-badge"><div class="d">${dl.getDate()}</div><div class="w">${dl.getMonth() + 1}월 ${DOW[dl.getDay()]}</div></div>
              <div class="body"><div class="ttl">${esc(i.title)}</div><div class="t-caption">${esc(i.format || "")} · ${n < 0 ? `<b style="color:var(--danger)">발행일 ${-n}일 지남</b>` : n === 0 ? "<b>오늘 발행</b>" : `D-${n}`}</div></div>
              ${chip(i.status)}
            </div>`; }).join("") : '<div class="empty">2주 안에 발행할 글이 없어요.</div>'}
        </div>
        <div class="card-dark">
          <div class="t-eyebrow" style="color:var(--primary)">검수 완료 원고</div>
          <p class="t-h4" style="margin:12px 0">${reviewedList().length}편 보관 중</p>
          ${reviewedList().slice(0, 3).map(({ it, r }) => `<p class="t-body-sm" style="color:#c3c8ce;margin:6px 0">${esc(r.at.slice(5, 10).replace("-", "/"))} · ${esc(r.title || it.title)} · ${r.score}점</p>`).join("") || '<p class="t-body-sm" style="color:#c3c8ce;margin:0">초안 검수에서 “검수 완료 · 저장”을 누르면 여기에 쌓여요.</p>'}
          <a class="btn btn-green btn-sm" style="margin-top:20px" href="#/review">보관함 보기</a>
        </div>
      </div></section>`;
  }

  function viewCalendar() {
    const t = today();
    if (ui.calY == null) {
      const up = upcoming()[0];
      const base = up ? parse(up.date) : t;
      ui.calY = base.getFullYear(); ui.calM = base.getMonth();
    }
    const first = new Date(ui.calY, ui.calM, 1);
    const start = addDays(first, -first.getDay());
    let cells = DOW.map((d) => `<div class="cal-dow">${d}</div>`).join("");
    for (let k = 0; k < 42; k++) {
      const d = addDays(start, k); const key = ymd(d);
      const evs = state.items.filter((i) => i.date === key);
      cells += `<div class="cal-cell ${d.getMonth() !== ui.calM ? "out" : ""} ${key === ymd(t) ? "today" : ""}" data-day="${key}">
        <div class="dn">${d.getDate()}</div>
        ${evs.map((i) => `<span class="cal-ev ${stClass(i.status)}" data-edit="${i.id}" title="${esc(i.title)}">${esc(i.title)}</span>`).join("")}
      </div>`;
    }
    const list = state.items.filter((i) => i.date && parse(i.date).getMonth() === ui.calM && parse(i.date).getFullYear() === ui.calY).sort((a, b) => a.date.localeCompare(b.date));
    return `
      <section class="band band-mint"><div class="container page-head">
        <div><div class="t-eyebrow mint-text">Schedule</div><h1 class="t-h2">발행 캘린더</h1><p class="t-body-lg">발행일은 직접 정해요. 날짜 칸을 누르면 그날을 발행일로 새 글을 추가해요.</p></div>
        <button class="btn btn-primary" data-new>＋ 새 글 추가</button>
      </div></section>
      <section class="band"><div class="container">
        <div class="page-head">
          <div class="cal-head"><button class="btn btn-ghost" id="cal-prev" aria-label="이전 달">‹</button><span class="t-h3">${ui.calY}. ${ui.calM + 1}</span><button class="btn btn-ghost" id="cal-next" aria-label="다음 달">›</button><button class="btn-link" id="cal-today">오늘</button></div>
          <div class="btn-row">${STATUSES.map(chip).join("")}</div>
        </div>
        <div class="cal mt-lg">${cells}</div>
        <div class="card mt-xl">
          <h3 class="t-h4">${ui.calM + 1}월 발행 목록</h3>
          ${list.length ? `<div class="table-wrap"><table class="data mt-lg"><thead><tr><th>날짜</th><th>주제</th><th>글 유형</th><th>겹치는 기존 글 / 차별점</th><th>상태</th></tr></thead><tbody>
            ${list.map((i) => `<tr class="clickable" data-edit="${i.id}"><td><b>${fmtMD(i.date)}</b></td><td><b>${esc(i.title)}</b><div class="t-caption">${esc(i.keywords || "")}</div></td><td>${esc(i.format)}</td><td>${esc(i.overlap)}</td><td>${chip(i.status)}</td></tr>`).join("")}
          </tbody></table></div>` : '<div class="empty mt-lg">이 달에는 예정된 글이 없어요.</div>'}
        </div>
      </div></section>`;
  }

  function viewTopics() {
    const all = state.items.filter((i) => !i.date);
    const f = ui.topicSt && all.some((i) => i.status === ui.topicSt) ? ui.topicSt : "";
    const bank = f ? all.filter((i) => i.status === f) : all;
    const fchip = (v, label, n) => `<button type="button" class="fchip ${f === v ? "on" : ""}" data-tf="${esc(v)}" ${n ? "" : "disabled"}>${esc(label)} <b>${n}</b></button>`;
    return `
      <section class="band band-mint"><div class="container">
        <div class="t-eyebrow mint-text">Topic bank</div><h1 class="t-h2">주제 뱅크</h1>
        <p class="t-body-lg" style="max-width:40em">주제를 입력하면 이미 발행한 글·계획된 글과 키워드가 겹치는지 바로 보여줘요. 같은 검색 의도는 새 세부 질문으로 좁히세요.</p>
        <div class="card-feature mt-lg">
          <div class="form-grid">
            <div class="field full"><label>새 주제</label><input class="input" id="q-title" placeholder="예: 관자놀이 꺼짐, 필러일까 쥬베룩일까?"></div>
            <div class="field"><label>메인 키워드 <span class="hint">쉼표로 구분</span></label><input class="input" id="q-kw" placeholder="관자놀이 꺼짐, 관자필러"></div>
            <div class="field"><label>카테고리</label><select class="select" id="q-cat">${CATEGORIES.map((c) => `<option>${c}</option>`).join("")}</select></div>
            <div class="field full" id="q-dup"><div class="t-caption">주제를 입력하면 겹침 여부를 확인해요.</div></div>
          </div>
          <div class="btn-row mt-lg"><button class="btn btn-primary" id="q-add">주제 뱅크에 추가</button></div>
        </div>
      </div></section>
      <section class="band"><div class="container">
        <div class="page-head"><h2 class="t-h3">대기 중인 주제 <span class="muted t-thin" id="tb-n">${bank.length}</span></h2></div>
        <div class="fchips">${fchip("", "전체", all.length)}${STATUSES.map((st) => fchip(st, st, all.filter((i) => i.status === st).length)).join("")}</div>
        <div class="grid g-3 mt-lg">
          ${bank.length ? all.map((i) => `
            <div class="card stack" data-st="${esc(i.status)}" ${f && i.status !== f ? "hidden" : ""}>
              <div class="btn-row">${chip(i.status)} ${riskChip(i.risk)} <span class="t-caption">${esc(i.category)}</span></div>
              <div class="t-h4" style="font-size:18px">${esc(i.title)}</div>
              ${i.overlap ? `<div class="t-body-sm muted">비슷한 기존 글: ${esc(i.overlap)}</div>` : ""}
              ${i.keywords ? `<div class="t-caption">메인 키워드 · ${esc(i.keywords)}</div>` : ""}
              <div class="btn-row even" style="margin-top:auto"><button class="btn btn-ghost btn-sm" data-edit="${i.id}">발행일·정보 수정</button><a class="btn btn-dark-square btn-sm" href="#/draft/${i.id}">초안 쓰기 →</a></div>
            </div>`).join("") : '<div class="empty">대기 중인 주제가 없어요.</div>'}
        </div>
      </div></section>`;
  }

  function itemPicker(id, route) {
    // 초안 검수에는 초안 작성 단계 이후 글만 (아이디어·기획은 숨김)
    const xs = state.items.filter((i) => route !== "review" || !["아이디어", "기획"].includes(i.status) || i.id === id)
      .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
    return `<select class="select" id="pick" data-route="${route}" style="max-width:520px">
      ${route === "review" ? `<option value="" ${!id ? "selected" : ""}>✎ 직접 붙여넣어 검수 (글 미선택)</option>` : ""}
      ${xs.map((i) => `<option value="${i.id}" ${i.id === id ? "selected" : ""}>${route === "review" ? "[" + i.status + "] " : ""}${i.date ? fmtMD(i.date) : "미정"} · ${esc(i.title)}</option>`).join("")}</select>`;
  }

  function viewDraft(id) {
    let it = id && byId(id);
    if (!it) { it = upcoming()[0] || state.items[0]; if (it) { location.replace("#/draft/" + it.id); return ""; } }
    const b = it.brief || {};
    return `
      <section class="band band-mint"><div class="container page-head">
        <div><div class="t-eyebrow mint-text">Draft</div><h1 class="t-h2">초안 작성</h1><p class="t-body-lg">브리프를 채우고 <b>골격 생성</b>으로 골드제이 형식의 뼈대를 만들거나, <b>Claude 프롬프트 복사</b>로 지침이 담긴 요청문을 붙여넣어 쓰세요.</p></div>
        ${itemPicker(it.id, "draft")}
      </div></section>
      <section class="band"><div class="container wide grid g-draft" style="align-items:start">
        <div class="stack-lg">
          <div class="field"><label style="display:flex;justify-content:space-between;align-items:center"><span>원고 <span class="hint">제목과 본문을 아래 편집 화면에서 바로 고쳐요</span></span><button type="button" class="btn-link" id="d-tsug" style="font-size:13px">✦ 메인 키워드로 제목 3개 추천</button></label><input class="input" id="d-title" value="${esc(it.draftTitle || "")}" placeholder="질문 + 답 + 프로그램명 (예: 다크서클 시술, 눈밑필러 하면 좋아질까요? 원인에 따라 치료가 달라집니다 골드제이 브라이트 아이즈)">
            <div class="title-opts" id="d-topts">${titleOpts(it)}</div></div>
          <div class="field">
            <label style="display:flex;justify-content:space-between"><span class="hint">드래그해서 굵게·인용구·가운데 · 텍스트 버튼으로 네이버 형식 원문 보기</span><span class="hint" id="d-count"></span></label>
            <textarea class="textarea editor mono" id="d-body" placeholder="골격 생성을 누르거나 원고를 붙여넣으세요.">${esc(it.draft || "")}</textarea>
          </div>
          <div class="btn-row even">
            <button class="btn btn-primary" id="d-save">저장</button>
            <button class="btn btn-ghost" id="d-copy">네이버에 붙여넣기용 복사</button>
            <a class="btn btn-green" href="#/review/${it.id}" id="d-review">초안 검수 →</a>
          </div>
        </div>
        <div class="card stack">
          <div class="btn-row">${chip(it.status)} ${riskChip(it.risk)} <button class="btn-link" data-edit="${it.id}">글 정보 수정</button></div>
          <div class="t-h4" style="font-size:18px">${esc(it.title)}</div>
          <div class="t-caption">${esc(it.format)} · ${esc(it.tone)} · ${esc(it.category)} ${it.date ? "· " + fmtMD(it.date) + " 발행" : ""}</div>
          <div class="t-caption" style="color:#3b4148">${esc((TYPES[it.format] || {}).d || "")} <button class="btn-link" data-edit="${it.id}" style="font-size:12px">유형·말투 바꾸기</button></div>
          <hr class="sep" style="margin:8px 0">
          <details class="src-box" ${(it.source && (it.source.text || it.source.url)) || PDFS[it.id] ? "open" : ""}>
            <summary><span>📎 자료로 초안 쓰기</span><span class="hint">유튜브 자막 · 요약본 PDF</span></summary>
            <div class="stack" style="margin-top:12px">
              <div class="field"><label>유튜브 링크 <span class="hint">출처로 저장 · 글 끝에 영상 자리 표시</span></label><input class="input" id="s-url" value="${esc((it.source || {}).url || "")}" placeholder="https://youtu.be/…"></div>
              <div class="field"><label>자막 · 요약 텍스트 <span class="hint" id="s-len"></span></label><textarea class="textarea" id="s-text" style="min-height:110px" placeholder="유튜브 영상 아래 ⋯ 더보기 → 스크립트 표시 → 자막 전체를 복사해 붙여넣으세요.">${esc((it.source || {}).text || "")}</textarea></div>
              <div class="field"><label>요약본 PDF <span class="hint">32MB · 100쪽 이하</span></label>
                <div class="btn-row"><label class="btn btn-ghost btn-sm" style="cursor:pointer">PDF 선택<input type="file" id="s-pdf" accept="application/pdf" hidden></label><span class="t-caption" id="s-pdfname">${PDFS[it.id] ? esc(PDFS[it.id].name) : (it.source && it.source.pdfName ? `${esc(it.source.pdfName)} · 새로고침해서 다시 선택이 필요해요` : "선택한 파일 없음")}</span>${PDFS[it.id] ? '<button type="button" class="btn-link btn-danger" id="s-pdfx" style="font-size:12px">빼기</button>' : ""}</div></div>
              <button type="button" class="btn btn-dark-square" id="s-dir">✦ 기존 글과 안 겹치는 방향 3가지 받기</button>
              <div class="dir-opts" id="s-dirs">${dirOpts(it)}</div>
              <p class="t-caption" style="margin:0">방향을 고른 뒤 아래 <b>Claude로 초안 쓰기</b>를 누르면 이 자료와 고른 방향으로 원고를 써요. 방향을 고르지 않아도 자료는 반영돼요.</p>
            </div>
          </details>
          <div class="field"><label>메인 키워드</label><input class="input" id="b-kw" value="${esc(it.keywords || "")}"></div>
          <div class="field"><label>환자 질문 <span class="hint">한 줄에 하나, 2~3개</span></label><textarea class="textarea" id="b-q" style="min-height:90px" placeholder="원장님, 저는 광대가 너무 튀어나와 보여요.">${esc(b.questions || "")}</textarea></div>
          <div class="field"><label>원인 → 처방 <span class="hint">한 줄에 하나</span></label><textarea class="textarea" id="b-c" style="min-height:90px" placeholder="깊은 지방 꺼짐 → 깊은 층 필러&#10;지방 돌출이 뚜렷함 → 눈밑지방재배치 수술">${esc(b.causes || "")}</textarea></div>
          <div class="field"><label>바로잡을 오해</label><input class="input" id="b-m" value="${esc(b.myth || "")}" placeholder="눈밑필러, 1cc 넘으면 안 될까?"></div>
          <div class="field"><label>골드제이 프로그램 <span class="hint">직접 입력 · 아래는 빠른 선택</span></label><input class="input" id="b-p" value="${esc(b.program || "")}" placeholder="예: 브라이트 아이즈, 또는 새 프로그램명"><div class="btn-row" style="gap:6px">${PROGRAMS.map((p) => `<button type="button" class="chip st-아이디어" style="border:0;cursor:pointer" data-prog="${esc(p)}">${esc(p)}</button>`).join("")}</div></div>
          <div class="field"><label style="display:flex;justify-content:space-between"><span>인용글 <span class="hint">제목에 들어간 단어로 찾아 고르기 · 최신순</span></span><span class="hint" id="b-rc"></span></label>
            <label class="search" style="min-width:0">⌕<input id="b-rq" placeholder="글 제목으로 찾기"></label>
            <div class="post-pick" id="b-r">${postsNewest().map((pp) => `<label class="pp" data-t="${esc(pp.title.replace(/\s/g, "").toLowerCase())}" ${(b.related || []).includes(pp.title) ? "" : "hidden"}><input type="checkbox" value="${esc(pp.title)}" ${(b.related || []).includes(pp.title) ? "checked" : ""}><span class="pt">${esc(pp.title)}</span><span class="pd">${esc(pp.date || "날짜 미상")}</span></label>`).join("")}<div class="pp-empty t-caption" id="b-rempty"></div></div>
            <button type="button" class="btn-link" id="b-addposts" style="align-self:flex-start">＋ 블로그 글 목록 붙여넣어 추가 (현재 ${state.posts.length}편)</button></div>
          <div class="field"><label>추가 메모 <span class="hint">원장님께 받은 사실·수치·사진 정보</span></label><textarea class="textarea" id="b-n" style="min-height:72px">${esc(b.notes || "")}</textarea></div>
          <div class="side-actions">
            <button class="btn btn-green full" id="d-ai">✦ Claude로 초안 쓰기</button>
            <button class="btn btn-ghost" id="d-skel">골격 생성</button>
            <button class="btn btn-ghost" id="d-prompt">프롬프트 복사</button>
          </div>
          <button class="btn-link" id="d-aikey" style="align-self:flex-start;font-size:13px">${aiCfg().key ? "Claude API 키 설정됨 · 변경" : "Claude API 키 설정"}</button>
          <p class="t-caption" id="d-cost" style="margin:0;color:#00a070;font-weight:700"></p>
          <p class="t-caption" style="margin:0">골격은 유형별 소제목과 섹션별 목표 분량(합계 약 ${LEN_MIN.toLocaleString()}~${LEN_MAX.toLocaleString()}자)만 잡아줘요. ✍️ 자리를 채워야 분량이 나와요. 완성 원고는 “Claude로 초안 쓰기”(API 키 필요)나 프롬프트 복사로 받으세요.</p>
        </div>
      </div></section>`;
  }

  function viewReview(id) {
    const it = id ? byId(id) : null;
    const title = it ? it.draftTitle || "" : ui.reviewFree.title;
    const body = it ? it.draft || "" : ui.reviewFree.body;
    return `
      <section class="band band-mint"><div class="container page-head">
        <div><div class="t-eyebrow mint-text">Draft review</div><h1 class="t-h2">초안 검수</h1><p class="t-body-lg">원고를 고치면 바로 다시 검사해요. 자동 검사는 규칙 기반이라, 아래 수동 체크리스트로 사실성·중복을 꼭 함께 확인하세요.</p></div>
        ${itemPicker(it ? it.id : "", "review")}
      </div></section>
      <section class="band"><div class="container wide grid g-review" style="align-items:start">
        <div class="stack-lg review-side">
          <div class="card-dark" style="display:flex;gap:24px;align-items:center" id="r-summary"></div>
          <div class="card"><div id="r-checks"></div></div>
          ${it ? `<div class="card manual"><h3 class="t-h4">게시 전 수동 체크리스트</h3><div class="mt-lg">${MANUAL.map(([k, l]) => `<label><input type="checkbox" data-man="${k}" ${(it.manual || {})[k] ? "checked" : ""}>${l}</label>`).join("")}</div>
            <div class="btn-row mt-lg"><button class="btn btn-primary" id="r-pass">검수 완료 · 저장</button><button class="btn btn-ghost" id="r-done">발행 완료로 표시</button></div></div>` : ""}
        </div>
        <div class="stack-lg">
          <div class="seg" id="r-tab" hidden><button class="on" data-tab="edit">원고 편집</button><button data-tab="prev">모바일 미리보기</button></div>
          <div id="r-edit" class="stack">
            <input class="input" id="r-title" value="${esc(title)}" placeholder="제목">
            <textarea class="textarea editor mono" id="r-body" placeholder="원고를 붙여넣으세요.">${esc(body)}</textarea>
            <div class="btn-row">${it ? '<button class="btn btn-primary" id="r-save">수정 내용 저장</button>' : ""}<button class="btn btn-ghost" id="r-copy">네이버에 붙여넣기용 복사</button></div>
          </div>
          <div id="r-prev" hidden><div class="phone" id="r-phone"></div></div>
        </div>
      </div></section>
      <section class="band band-soft"><div class="container">
        <div class="page-head"><div><div class="t-eyebrow mint-text">Archive</div><h2 class="t-h3">검수 완료 원고 <span class="muted t-thin">${reviewedList().length}</span></h2>
          <p class="t-caption">“검수 완료 · 저장”을 누른 시점의 제목·본문·점수가 그대로 보관돼요. 같은 글을 다시 검수하면 버전이 하나 더 쌓여요. 데이터 백업(JSON)에도 포함돼요.</p></div></div>
        <div class="card mt-lg">${reviewedList().length ? reviewedList().map(({ it, r, k }) => `
          <div class="list-row">
            ${scoreRing(r.score, true)}
            <div class="body"><div class="ttl">${esc(r.title || it.title)}</div><div class="t-caption">${esc(r.at.slice(0, 16).replace("T", " "))} 검수 완료 · ${plainLen(r.body).toLocaleString()}자 · v${k + 1} · ${chip(it.status)}</div></div>
            <div class="btn-row"><button class="btn btn-ghost" data-dl="${it.id}:${k}">md 받기</button><button class="btn btn-ghost" data-ncopy="${it.id}:${k}">네이버용 복사</button></div>
          </div>`).join("") : '<div class="empty">아직 검수 완료한 원고가 없어요.</div>'}</div>
      </div></section>`;
  }

  function viewGuide() {
    const q = ui.guideQ.trim();
    const ex = postsNewest().filter((p) => !q || (p.title + postKeywords(p).join(" ") + (p.category || "")).replace(/\s/g, "").includes(q.replace(/\s/g, "")));
    const W = [[300, "Light"], [400, "Regular"], [500, "Medium"], [600, "SemiBold"], [700, "Bold"], [800, "ExtraBold"], [900, "Black"]];
    return `
      <section class="band band-mint"><div class="container">
        <div class="t-eyebrow mint-text">Style guide</div>
        <h1 class="t-display">원인을 먼저 <span class="hl">구분</span>합니다</h1>
        <p class="t-body-lg" style="max-width:40em">실제 골드제이 원고 13편과 블로그 공개 목록(245편)에서 뽑은 규칙이에요. 지침과 다르면 이 스타일 프로필이 우선합니다.</p>
      </div></section>
      <section class="band"><div class="container grid g-2">
        <div class="card-feature stack">
          <div class="t-eyebrow mint-text">기본값</div><h3 class="t-h4">A. 최근 스타일</h3>
          <div class="quote-card">안녕하세요. 금손닥터 이현주원장입니다.</div>
          <ul class="rule-list"><li>인사 다음 환자 질문 2~3개를 따옴표로 연속 인용 (질문으로 바로 시작하는 형식도 절반)</li><li>차분한 진료 설명 톤, 이모티콘 거의 없음</li><li>핵심: 무엇을 할지보다 <b>왜 그런지</b>를 먼저 구분</li><li>마무리: 진료 철학 한 문장 → 지도 → 서명</li></ul>
        </div>
        <div class="card-feature stack">
          <div class="t-eyebrow muted">원리 해설·제품 비교에 섞어서</div><h3 class="t-h4">B. 기존 스타일</h3>
          <div class="quote-card">안녕하세요 :) 티 안나게 예뻐지게 하는 금손닥터, 골드제이의원 이현주 원장입니다.</div>
          <ul class="rule-list"><li>^^, :), ㅎㅎ 허용, 가벼운 유머</li><li>한 줄 15~25자로 짧게 줄바꿈</li><li>끝: “지금까지 금손닥터 이현주원장이었습니다. 감사합니다 :)”</li></ul>
        </div>
      </div></section>
      <section class="band band-soft"><div class="container grid g-3">
        <div class="card"><h3 class="t-h4">전개 순서</h3><ol class="rule-list mt-lg"><li>고민·질문·오해로 도입</li><li>오늘 다룰 내용 예고</li><li>원리·원인 설명 (논문 그림 + 캡션)</li><li>흔한 오해 바로잡기</li><li>원인별 처방 매칭, 수술이 맞는 경우도</li><li>골드제이의 접근 (프로그램명)</li><li>굵은 요약 문단</li><li>진단·상담 안내 + 지도</li></ol></div>
        <div class="card"><h3 class="t-h4">제목 · 소제목</h3><ul class="rule-list mt-lg"><li>길고 키워드 많은 <b>질문 + 답 + 프로그램명</b></li><li>2026년엔 지역 키워드 대신 질문형</li><li>질문 안에 고민 키워드를 직접 (“기미 레이저 후 진해짐”)</li><li>소제목은 인용구 + 굵게, 대부분 질문형, 길면 두 줄</li></ul></div>
        <div class="card"><h3 class="t-h4">쓰지 않는 표현</h3><div class="btn-row mt-lg">${["피부과", "시'술 표기", "무조건(부정형 제외)", "완벽하게", "100%", "확실하게", "부작용 없음", "한 번에 해결", "영구적", "실패 없는", "누구나 효과"].map((x) => `<span class="chip risk-높음">${x}</span>`).join("")}</div>
          <p class="t-caption mt-lg">후기·전후 결과·수치·원장 경험은 제공받은 것만.</p></div>
      </div></section>
      <section class="band"><div class="container">
        <div class="page-head"><div><h2 class="t-h3">기존 발행 글 <span class="muted t-thin">${state.posts.length}</span></h2><p class="t-caption">중복 확인용 · 블로그(dr_ponym) 실제 발행 글 기준</p></div>
          <label class="search">⌕<input id="g-q" value="${esc(q)}" placeholder="키워드로 찾기 (예: 써마지)"></label></div>
        <div class="table-wrap mt-lg"><table class="data"><thead><tr><th>글</th><th>시기</th><th>카테고리</th><th>키워드</th></tr></thead><tbody>
          ${ex.map((p) => `<tr><td><b>${esc(p.title)}</b></td><td>${esc(p.date || "-")}</td><td>${esc(p.category || "-")}</td><td class="t-caption">${postKeywords(p).map(esc).join(", ")}</td></tr>`).join("") || '<tr><td colspan="4" class="muted">찾는 글이 없어요.</td></tr>'}
        </tbody></table></div>
        <details class="card mt-xl"><summary style="cursor:pointer;font-weight:700">스타일 프로필 전문 보기</summary><pre style="white-space:pre-wrap;font-family:var(--font);font-size:14px;font-weight:400;line-height:1.7">${esc(SEED.styleProfile)}</pre></details>
      </div></section>
      <section class="band band-dark"><div class="container">
        <div class="t-eyebrow" style="color:var(--primary)">Typeface · Pretendard</div>
        <div class="weights mt-lg">${W.map(([w, n]) => `<span style="font-weight:${w}">금손닥터<small>${w} ${n}</small></span>`).join("")}</div>
      </div></section>`;
  }

  /* ---------------- Router & bindings ---------------- */
  function route() {
    const [, name = "home", id] = (location.hash || "#/home").split("/");
    return { name, id };
  }

  let lastViewKey = "";
  function render() {
    const r = route();
    renderNav(r.name);
    document.body.classList.remove("nav-open");
    const views = { home: viewHome, calendar: viewCalendar, topics: viewTopics, draft: () => viewDraft(r.id), review: () => viewReview(r.id), guide: viewGuide };
    const html = (views[r.name] || viewHome)();
    if (html === "") return;
    const key = r.name + "/" + (r.id || "");
    const same = key === lastViewKey; lastViewKey = key;
    const y = window.scrollY;
    $("#view").innerHTML = `<div class="view${same ? " still" : ""}">${html}</div>`;
    if (same) window.scrollTo(0, y);
    bind(r);
  }

  function bind(r) {
    $$("[data-edit]").forEach((el) => el.addEventListener("click", (e) => { e.stopPropagation(); openItemModal(byId(el.dataset.edit)); }));
    $$("[data-new]").forEach((el) => el.addEventListener("click", () => openItemModal(null)));
    const pick = $("#pick");
    if (pick) pick.onchange = () => { location.hash = `#/${pick.dataset.route}/${pick.value}`; };

    if (r.name === "calendar") {
      $("#cal-prev").onclick = () => { ui.calM--; if (ui.calM < 0) { ui.calM = 11; ui.calY--; } render(); };
      $("#cal-next").onclick = () => { ui.calM++; if (ui.calM > 11) { ui.calM = 0; ui.calY++; } render(); };
      $("#cal-today").onclick = () => { const t = today(); ui.calY = t.getFullYear(); ui.calM = t.getMonth(); render(); };
      $$(".cal-cell").forEach((c) => c.addEventListener("click", () => openItemModal(null, { date: c.dataset.day, status: "기획" })));
    }

    if (r.name === "topics") {
      $$("[data-tf]").forEach((b2) => b2.onclick = () => {
        ui.topicSt = b2.dataset.tf; let n = 0;
        $$("[data-tf]").forEach((x) => x.classList.toggle("on", x === b2));
        $$("[data-st]").forEach((c) => { const on = !ui.topicSt || c.dataset.st === ui.topicSt; c.hidden = !on; if (on) n++; });
        $("#tb-n").textContent = n;
      });
      const upd = () => {
        const res = dupCheck($("#q-title").value + " " + $("#q-kw").value);
        $("#q-dup").innerHTML = !$("#q-title").value.trim() ? '<div class="t-caption">주제를 입력하면 겹침 여부를 확인해요.</div>'
          : res.length ? `<div class="t-body-sm" style="font-weight:700">겹칠 수 있는 글 ${riskChip(dupRisk(res))}</div>` + res.slice(0, 5).map((x) => `<div class="dup-item"><span class="kbd">${x.kind}</span><span style="flex:1">${esc(x.title)}${x.date ? ` <span class="muted">(${esc(x.date)})</span>` : ""}</span><span class="muted">${x.hits.map(esc).join(", ")}</span></div>`).join("")
          : `<div class="t-body-sm" style="font-weight:700">겹치는 글이 보이지 않아요 ${riskChip("낮음")}</div>`;
      };
      $("#q-title").addEventListener("input", upd); $("#q-kw").addEventListener("input", upd);
      const add = () => {
        const title = $("#q-title").value.trim(); if (!title) { $("#q-title").focus(); return; }
        const kw = $("#q-kw").value.trim();
        const res = dupCheck(title + " " + kw);
        state.items.push({ id: uid(), title, keywords: kw, category: $("#q-cat").value, date: "", format: FORMATS[0], tone: TONES[0], status: "아이디어", risk: dupRisk(res), overlap: res.slice(0, 2).map((x) => x.title).join(" / "), draft: "", draftTitle: "" });
        save(); render(); toast("주제 뱅크에 추가했어요");
      };
      $("#q-add").onclick = add;
    }

    const edAsk = () => (aiCfg().key ? (prompt, onText) => aiWrite(prompt, onText).then((x) => { renderBalance(); return x; }) : null);
    if (r.name === "draft" && r.id) {
      const it = byId(r.id); if (!it) return;
      window.GJEditor.mount({ body: $("#d-body"), title: $("#d-title"), titlePlaceholder: "제목 (질문 + 답 + 프로그램명)", ask: edAsk(), matchHeight: () => $(".g-draft > .card") });
      const count = () => { const n = plainLen($("#d-body").value); const el = $("#d-count"); el.textContent = `공백 제외 ${n.toLocaleString()}자 · 목표 ${LEN_MIN.toLocaleString()}~${LEN_MAX.toLocaleString()}자${n && n < LEN_MIN ? ` (${(LEN_MIN - n).toLocaleString()}자 더 필요)` : ""}`; el.style.color = n >= LEN_MIN && n <= LEN_MAX ? "#00a070" : n ? "#b4232a" : ""; el.style.fontWeight = "700"; };
      count(); $("#d-body").addEventListener("input", count);
      const collect = () => {
        it.draftTitle = $("#d-title").value; it.draft = $("#d-body").value; it.keywords = $("#b-kw").value;
        it.source = Object.assign({}, it.source, { url: $("#s-url").value.trim(), text: $("#s-text").value });
        it.brief = { questions: $("#b-q").value, causes: $("#b-c").value, myth: $("#b-m").value, program: $("#b-p").value, related: $$("#b-r input:checked").map((c) => c.value), notes: $("#b-n").value };
        if (it.draft.trim() && ["아이디어", "기획"].includes(it.status)) it.status = "초안 작성";
      };
      $("#d-save").onclick = () => { collect(); save(); renderNav("draft"); toast("저장했어요"); };
      $("#d-review").onclick = () => { collect(); save(); };
      $("#d-copy").onclick = () => { copyForNaver($("#d-title").value, $("#d-body").value); toast("복사했어요. 네이버 에디터에 붙여넣으세요"); };
      $("#d-skel").onclick = () => {
        if ($("#d-body").value.trim() && !confirm("지금 본문을 골격으로 바꿀까요? (기존 본문은 사라져요)")) return;
        collect(); if (!it.draftTitle) { it.draftTitle = it.title; $("#d-title").value = it.title; }
        $("#d-body").value = skeleton(it); count(); collect(); save(); toast("골격을 만들었어요. ✍️ 표시를 채워주세요");
      };
      $("#d-prompt").onclick = () => { collect(); save(); copy(buildPrompt(it)); toast(PDFS[it.id] ? "복사했어요. Claude에 붙여넣을 때 PDF도 같이 첨부하세요" : "프롬프트를 복사했어요. Claude에 붙여넣으세요"); };
      $("#d-aikey").onclick = () => openAiModal(() => render());
      $("#d-ai").onclick = async () => {
        if (!aiCfg().key) { openAiModal(() => $("#d-ai").click()); return; }
        if ($("#d-body").value.trim() && !confirm("지금 본문을 Claude가 새로 쓴 원고로 바꿀까요? (기존 본문은 사라져요)")) return;
        collect(); save();
        const btn = $("#d-ai"); btn.disabled = true; const label = btn.textContent;
        try {
          const { out, usage } = await aiWrite(buildPrompt(it, "api"), (txt) => { const pt = parseTitles(txt); $("#d-body").value = pt.body; btn.textContent = `작성 중… ${plainLen(pt.body).toLocaleString()}자`; count(); }, PDFS[it.id]);
          const pt = parseTitles(out);
          if (pt.titles.length) { it.titleOptions = pt.titles; $("#d-title").value = pt.titles[0]; }
          else { const mt = out.match(/^\s*#\s+(.+)$/m); if (mt) $("#d-title").value = mt[1].trim(); }
          $("#d-body").value = pt.body; count(); collect(); save(); paintTitles();
          const n = plainLen(pt.body);
          const cost = `입력 ${usage.in.toLocaleString()} · 출력 ${usage.out.toLocaleString()} 토큰 ≈ $${usage.usd.toFixed(3)}`;
          $("#d-cost").textContent = `이번 초안 비용: ${cost}`; renderBalance();
          toast(n < LEN_MIN ? `${n.toLocaleString()}자예요. 목표보다 짧아서 한 번 더 써보길 권해요` : `초안을 썼어요 (${n.toLocaleString()}자 · ≈ $${usage.usd.toFixed(3)})`);
        } catch (err) { alert("Claude 호출에 실패했어요: " + err.message); }
        finally { btn.disabled = false; btn.textContent = label; }
      };
      const slen = () => { const n = $("#s-text").value.replace(/\s/g, "").length; $("#s-len").textContent = n ? `${n.toLocaleString()}자` : ""; };
      slen(); $("#s-text").addEventListener("input", slen);
      $("#s-pdf").onchange = (e) => {
        const f = e.target.files[0]; if (!f) return;
        if (f.size > 32 * 1024 * 1024) { alert("PDF가 32MB보다 커요. 나눠서 올려 주세요."); return; }
        const fr = new FileReader();
        fr.onload = () => { PDFS[it.id] = { name: f.name, data: String(fr.result).split(",")[1] }; collect(); it.source.pdfName = f.name; save(); render(); toast("PDF를 붙였어요"); };
        fr.readAsDataURL(f);
      };
      if ($("#s-pdfx")) $("#s-pdfx").onclick = () => { delete PDFS[it.id]; collect(); it.source.pdfName = ""; save(); render(); };
      const paintDirs = () => {
        $("#s-dirs").innerHTML = dirOpts(it);
        $$("[data-dir]").forEach((b2) => b2.onclick = () => { it.direction = it.direction === +b2.dataset.dir ? null : +b2.dataset.dir; const d = it.directions[it.direction]; if (d && d.title && !$("#d-title").value.trim()) $("#d-title").value = d.title; collect(); save(); paintDirs(); });
      };
      paintDirs();
      $("#s-dir").onclick = async () => {
        if (!aiCfg().key) { openAiModal(() => $("#s-dir").click()); return; }
        collect();
        if (!(it.source.text || "").trim() && !PDFS[it.id]) { toast("자막을 붙여넣거나 PDF를 먼저 올려 주세요"); $("#s-text").focus(); return; }
        const sb = $("#s-dir"); const lb = sb.textContent; sb.disabled = true; sb.textContent = "방향 잡는 중…";
        try {
          const { out, usage } = await aiWrite(directionPrompt(it), () => {}, PDFS[it.id]);
          const ds = parseDirections(out);
          if (!ds.length) throw new Error("응답을 읽지 못했어요: " + out.slice(0, 120));
          it.directions = ds; it.direction = 0; save(); paintDirs(); renderBalance();
          toast(`방향 3가지를 받았어요 (≈ $${usage.usd.toFixed(3)}). A안이 추천이에요`);
        } catch (err) { alert("방향 받기에 실패했어요: " + err.message); }
        finally { sb.disabled = false; sb.textContent = lb; }
      };
      const paintTitles = () => {
        $("#d-topts").innerHTML = titleOpts(it);
        $$("[data-topt]").forEach((b2) => b2.onclick = () => { $("#d-title").value = it.titleOptions[+b2.dataset.topt]; collect(); save(); paintTitles(); });
      };
      paintTitles();
      $("#d-title").addEventListener("input", () => { $$(".title-opt").forEach((x) => x.classList.toggle("on", it.titleOptions && it.titleOptions[+x.dataset.topt] === $("#d-title").value)); });
      $("#d-tsug").onclick = async () => {
        if (!aiCfg().key) { openAiModal(() => $("#d-tsug").click()); return; }
        collect();
        if (!(it.keywords || "").trim()) { toast("메인 키워드를 먼저 넣어 주세요"); $("#b-kw").focus(); return; }
        const tb = $("#d-tsug"); const lb = tb.textContent; tb.disabled = true; tb.textContent = "추천 중…";
        try {
          const { out, usage } = await aiWrite(titlePrompt(it, $("#d-body").value.replace(/&nbsp;/g, "")), () => {});
          const pt = parseTitles(out + "\n---\n");
          if (!pt.titles.length) throw new Error("제목을 읽지 못했어요: " + out.slice(0, 120));
          it.titleOptions = pt.titles; save(); paintTitles(); renderBalance();
          toast(`제목 3개를 추천했어요 (≈ $${usage.usd.toFixed(3)})`);
        } catch (err) { alert("제목 추천에 실패했어요: " + err.message); }
        finally { tb.disabled = false; tb.textContent = lb; }
      };
      $$("[data-prog]").forEach((c) => c.onclick = () => { $("#b-p").value = c.dataset.prog; });
      const rc = () => { $("#b-rc").textContent = `${$$("#b-r input:checked").length}개 선택`; };
      rc(); $("#b-r").addEventListener("change", rc);
      const rfilter = () => {
        const q = $("#b-rq").value.replace(/\s/g, "").toLowerCase(); let shown = 0;
        $$("#b-r .pp").forEach((l) => { const on = l.querySelector("input").checked || (q && l.dataset.t.includes(q)); l.hidden = !on; if (on) shown++; });
        const hit = q ? $$("#b-r .pp").filter((l) => !l.hidden && l.dataset.t.includes(q)).length : 0;
        $("#b-rempty").textContent = !q ? (shown ? "" : `제목에 들어간 단어를 입력하면 해당 글만 보여드려요. (전체 ${state.posts.length}편)`) : hit ? "" : `“${$("#b-rq").value.trim()}”이(가) 제목에 들어간 글이 없어요.`;
        $("#b-rempty").hidden = !$("#b-rempty").textContent;
      };
      rfilter(); $("#b-rq").addEventListener("input", rfilter); $("#b-r").addEventListener("change", rfilter);
      $("#b-addposts").onclick = () => { collect(); save(); openPostsModal(); };
    }

    if (r.name === "review") {
      const it = r.id ? byId(r.id) : null;
      window.GJEditor.mount({ body: $("#r-body"), title: $("#r-title"), titlePlaceholder: "제목", ask: edAsk(), matchHeight: () => $(".review-side"), sameAsDraft: true });
      const run = () => {
        const title = $("#r-title").value, body = $("#r-body").value;
        if (!it) ui.reviewFree = { title, body };
        if (!body.trim()) {
          $("#r-summary").innerHTML = `${scoreRing(0)}<div><div class="t-h4">원고를 붙여넣으세요</div><div class="t-body-sm" style="color:#c3c8ce">제목과 본문을 넣으면 바로 검사해요.</div></div>`;
          $("#r-checks").innerHTML = '<div class="empty">검사할 원고가 없어요.</div>'; $("#r-phone").innerHTML = ""; return;
        }
        const res = review(title, body);
        $("#r-summary").innerHTML = `${scoreRing(res.score)}<div class="stack" style="flex:1"><div class="t-h4">${res.fails ? `수정 필요 ${res.fails}건` : res.warns ? "거의 다 됐어요" : "자동 검사 통과"}</div>
          <div class="t-body-sm" style="color:#c3c8ce">분량 ${res.len.toLocaleString()}자 · 수정 필요 ${res.fails} · 확인 ${res.warns}</div></div>`;
        const icon = { pass: "✓", warn: "!", fail: "✕", info: "i" };
        const groups = [...new Set(res.checks.map((c) => c.group))];
        $("#r-checks").innerHTML = groups.map((g) => `<div class="t-eyebrow muted" style="margin-top:12px">${g}</div>` + res.checks.filter((c) => c.group === g).map((c) => `
          <div class="check"><div class="mark ${c.s}">${icon[c.s]}</div><div style="flex:1;min-width:0"><div class="ct">${esc(c.t)}</div><div class="cd">${esc(c.d)}</div>
          ${c.hits && c.hits.length ? `<div class="hits">${c.hits.slice(0, 6).map((h) => `<div class="hit"><span class="ln">${h.n}행</span>${h.html}</div>`).join("")}</div>` : ""}</div></div>`).join("")).join("");
        $("#r-phone").innerHTML = preview(title, body);
      };
      let tmr; const deb = () => { clearTimeout(tmr); tmr = setTimeout(run, 250); };
      $("#r-title").addEventListener("input", deb); $("#r-body").addEventListener("input", deb); run();
      $("#r-copy").onclick = () => { copyForNaver($("#r-title").value, $("#r-body").value); toast("복사했어요. 네이버 에디터에 붙여넣으세요"); };
      $$("#r-tab button").forEach((b) => b.onclick = () => {
        $$("#r-tab button").forEach((x) => x.classList.toggle("on", x === b));
        $("#r-edit").hidden = b.dataset.tab !== "edit"; $("#r-prev").hidden = b.dataset.tab !== "prev";
      });
      if (it) {
        $("#r-save").onclick = () => { it.draftTitle = $("#r-title").value; it.draft = $("#r-body").value; save(); toast("저장했어요"); };
        $$("[data-man]").forEach((c) => c.onchange = () => { it.manual = it.manual || {}; it.manual[c.dataset.man] = c.checked; save(); });
        $("#r-pass").onclick = () => {
          it.draftTitle = $("#r-title").value; it.draft = $("#r-body").value;
          const res = review(it.draftTitle, it.draft);
          const snap = { at: new Date().toISOString(), title: it.draftTitle, body: it.draft, score: res.score };
          it.reviews = (it.reviews || []).concat([snap]);
          if (!["원장님 검수", "발행 완료"].includes(it.status)) it.status = "원장님 검수";
          save(); downloadFile(`검수완료_${ymd(new Date())}_${fileSafe(it.draftTitle || it.title)}.md`, (it.draftTitle ? "# " + it.draftTitle + "\n\n" : "") + it.draft.replace(/^\s*#\s.*\n?/, ""));
          render(); toast("검수 완료 원고로 저장했어요 (md 파일도 내려받았어요)");
        };
        $("#r-done").onclick = () => { it.status = "발행 완료"; save(); renderNav("review"); toast("발행 완료로 표시했어요"); };
      }
    }

    $$("[data-dl]").forEach((b) => b.onclick = () => { const [id, k] = b.dataset.dl.split(":"); const it = byId(id); const v = it.reviews[+k];
      downloadFile(`검수완료_${v.at.slice(0, 10)}_${fileSafe(v.title || it.title)}.md`, (v.title ? "# " + v.title + "\n\n" : "") + v.body.replace(/^\s*#\s.*\n?/, "")); });
    $$("[data-ncopy]").forEach((b) => b.onclick = () => { const [id, k] = b.dataset.ncopy.split(":"); const v = byId(id).reviews[+k]; copyForNaver(v.title, v.body); toast("복사했어요. 네이버 에디터에 붙여넣으세요"); });

    if (r.name === "guide") {
      const g = $("#g-q");
      g.addEventListener("input", () => { ui.guideQ = g.value; const pos = g.selectionStart; render(); const n = $("#g-q"); n.focus(); n.setSelectionRange(pos, pos); });
    }
  }

  /* ---------------- Global ---------------- */
  $("#hamburger").onclick = () => document.body.classList.toggle("nav-open");
  $("#scrim").onclick = () => document.body.classList.remove("nav-open");
  $("#btn-export").onclick = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `goldj-blog-backup-${ymd(new Date())}.json`; a.click(); URL.revokeObjectURL(a.href);
    toast("백업 파일을 내려받았어요");
  };
  $("#btn-ai").onclick = () => openAiModal(() => render());
  renderBalance();
  $("#btn-import").onclick = () => $("#file-import").click();
  $("#file-import").onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!Array.isArray(data.items)) throw new Error("형식 오류");
      if (!confirm(`백업(${data.items.length}개 글)으로 지금 데이터를 바꿀까요?`)) return;
      state = migrate(data); save(); render(); toast("백업을 불러왔어요");
    } catch (err) { alert("백업 파일을 읽지 못했어요: " + err.message); }
    e.target.value = "";
  };
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("#modal-root").innerHTML = ""; });
  window.addEventListener("hashchange", render);
  render();
})();
