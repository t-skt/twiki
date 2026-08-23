#!/usr/bin/env node
// build-site-data.mjs — twiki-owned 파생 생성물 빌더 (Fusion IA)
//
// 역할 (D1): _data/site-source/ snapshot (읽기) + docs/ (읽기) 에서 site-data.json 을 도출.
//   - games:    category는 docs/{shooting,fighting,side}/<kebab> glob 으로 도출 (하드코딩 맵 금지, N4)
//   - albums:   docs/music/*.mdx frontmatter (index.mdx 제외)
//   - characters: dedupe(133) + appearances = db derivation ∪ 파일시스템 탐지 (N5)
//                 first_appearance = 최초 release_date 행, 프로필 = enrichment-max 행
//
// 쓰기 대상 (twiki-owned): static/site-data.json (Stage 1)
//   + docs/characters/*.mdx (Stage 2) + intro.mdx fusion-toc 블록 (Stage 3)
// generate.py 는 무수정·미실행. EMPOTENT: 2회 실행 → byte-identical.
//
// 실행: yarn build:site-data  (= node scripts/build-site-data.mjs)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITE_SOURCE = path.join(ROOT, "_data", "site-source");
const DOCS = path.join(ROOT, "docs");
const STATIC = path.join(ROOT, "static");

// ── 유틸 ────────────────────────────────────────────────────────────────
const val = (o) => (o == null ? null : typeof o === "object" ? o.value ?? null : o);
const norm = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const kebab = (id) => norm(id);

function fail(msg) {
  process.stderr.write(`[build-site-data] ERROR: ${msg}\n`);
  process.exit(1);
}

function readJson(rel) {
  const p = path.join(SITE_SOURCE, rel);
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    fail(`읽기 실패 ${p}: ${e.message}`);
  }
}

// docs/music/*.mdx frontmatter 파싱 (--- ... ---)
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[kv[1]] = v;
  }
  return out;
}

// ── games ───────────────────────────────────────────────────────────────
function buildGames() {
  const db = readJson("games.json").games;
  const cats = ["shooting", "fighting", "side"];
  const games = [];
  for (const g of db) {
    const slug = kebab(g.id);
    // category glob 도출 (N4): docs/<cat>/<slug> 존재 여부
    const cat = cats.find((c) => fs.existsSync(path.join(DOCS, c, slug)));
    if (!cat) fail(`category 미매칭: ${g.code} (${slug}) — docs/{shooting,fighting,side}/<slug> 없음`);
    const base = path.join(DOCS, cat, slug);
    const hasDialogue = fs.existsSync(path.join(base, "dialogue"));
    const hasSpellCards = fs.existsSync(path.join(base, "spell-cards.mdx"));
    const hasMusic = fs.existsSync(path.join(base, "music.mdx"));
    const charDir = path.join(base, "characters");
    const charCount = fs.existsSync(charDir)
      ? fs.readdirSync(charDir).filter((f) => f.endsWith(".mdx")).length
      : 0;
    const releaseDate = val(g.release_date);
    games.push({
      code: g.code,
      slug,
      category: cat,
      nameKo: val(g.name?.ko),
      nameEn: val(g.name?.en),
      nameJa: val(g.name?.ja),
      releaseDate,
      year: releaseDate ? Number(releaseDate.slice(0, 4)) : null,
      charCount,
      hasDialogue,
      hasSpellCards,
      hasMusic,
    });
  }
  // 28/28 매칭 어서션 (N4)
  if (games.length !== db.length) fail(`games 수 불일치: ${games.length}/${db.length}`);
  return games;
}

// ── albums ──────────────────────────────────────────────────────────────
function buildAlbums() {
  const dir = path.join(DOCS, "music");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx") && f !== "index.mdx");
  const albums = files.map((f) => {
    const fm = parseFrontmatter(fs.readFileSync(path.join(dir, f), "utf8"));
    const title = fm.title ?? "";
    // titleEn: frontmatter title 의 영문 부분 파싱 (m-6). "한글 ~ English" 형식
    const tilde = title.indexOf("~");
    let titleEn = null;
    let titleKo = title;
    if (tilde > -1) {
      titleKo = title.slice(0, tilde).trim();
      titleEn = title.slice(tilde + 1).trim() || null;
    }
    return {
      slug: fm.slug ?? kebab(f.replace(/\.mdx$/, "")),
      titleKo,
      titleEn,
      pos: Number(fm.sidebar_position ?? 0),
    };
  });
  albums.sort((a, b) => a.pos - b.pos);
  return albums;
}

// ── characters ──────────────────────────────────────────────────────────
function buildCharacters(games) {
  const dbChars = readJson("characters.json").characters;
  const gameBySlug = Object.fromEntries(games.map((g) => [g.slug, g]));

  // 파일시스템 프로필 스캔: docs/<cat>/<game>/characters/<slug>.mdx
  const cats = ["shooting", "fighting", "side"];
  const profiles = []; // {charSlug, gameSlug, category}
  for (const c of cats) {
    for (const gslug of fs.readdirSync(path.join(DOCS, c))) {
      const charDir = path.join(DOCS, c, gslug, "characters");
      if (!fs.existsSync(charDir)) continue;
      for (const f of fs.readdirSync(charDir)) {
        if (!f.endsWith(".mdx")) continue;
        profiles.push({ charSlug: kebab(f.replace(/\.mdx$/, "")), gameSlug: gslug, category: c });
      }
    }
  }

  // db dedupe: id 별로 그룹화
  const byId = new Map();
  for (const ch of dbChars) {
    const id = ch.id;
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(ch);
  }

  // db games 의 character_ids 역참조를 위해 한 번만 로드
  const dbGames = readJson("games.json").games;

  const characters = [];
  for (const [id, rows] of byId) {
    const slug = kebab(id);
    // 프로필(enrichment-max): 값이 가장 많은 행
    const enrich = (r) =>
      ["ability", "title", "species", "location", "personality"].filter((k) => val(r?.[k])).length;
    rows.sort((a, b) => enrich(b) - enrich(a));
    const prof = rows[0];

    // appearances: db derivation (games[].character_ids) ∪ 파일시스템 탐지 (N5)
    const dbRefs = new Set();
    for (const dg of dbGames) {
      const gslug = kebab(dg.id);
      const refIds = val(dg.character_ids) || [];
      if (refIds.includes(id)) dbRefs.add(gslug);
    }
    // 파일시스템 탐지
    const fsRefs = new Set();
    for (const p of profiles) if (p.charSlug === slug) fsRefs.add(p.gameSlug);

    const allGameSlugs = new Set([...dbRefs, ...fsRefs]);
    const appearances = [...allGameSlugs]
      .filter((gs) => gameBySlug[gs])
      .map((gs) => ({
        gameSlug: gs,
        category: gameBySlug[gs].category,
        year: gameBySlug[gs].year,
        hasProfile: fsRefs.has(gs),
      }))
      .sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999));

    const firstGameSlug = val(prof.first_appearance) ? kebab(val(prof.first_appearance)) : null;
    characters.push({
      id,
      slug,
      ko: val(prof.name?.ko),
      en: val(prof.name?.en),
      ja: val(prof.name?.ja),
      ability: val(prof.ability),
      title: val(prof.title),
      species: val(prof.species),
      location: val(prof.location),
      personality: val(prof.personality),
      image: val(prof.image),
      firstAppearanceSlug: firstGameSlug && gameBySlug[firstGameSlug] ? firstGameSlug : null,
      appearances,
      _profileSlug: slug,
    });
  }

  // 고유 133 어서션
  if (characters.length !== 133) fail(`characters dedupe 수: ${characters.length} (기대 133)`);
  return characters;
}

// ── Stage 2: docs/characters/*.mdx 출력 ─────────────────────────────────
function emitCharacterMasters(characters, games) {
  const gameBySlug = Object.fromEntries(games.map((g) => [g.slug, g]));
  const dir = path.join(DOCS, "characters");
  fs.mkdirSync(dir, { recursive: true });

  // 가나다순 (ko) rank — sidebar_position
  const sorted = [...characters].sort((a, b) =>
    String(a.ko ?? "").localeCompare(String(b.ko ?? ""), "ko")
  );
  const posOf = new Map(sorted.map((c, i) => [c.slug, i + 1]));

  let written = 0;
  for (const c of characters) {
    const fa = c.firstAppearanceSlug ? gameBySlug[c.firstAppearanceSlug] : null;
    const appearances = c.appearances.map((a) => ({
      gameSlug: a.gameSlug,
      category: a.category,
      year: a.year,
      hasProfile: a.hasProfile,
      profileSlug: a.hasProfile ? c._profileSlug : undefined,
      gameKo: gameBySlug[a.gameSlug]?.nameKo?.split("~")[0].trim(),
      gameCode: gameBySlug[a.gameSlug]?.code,
    }));

    const props = JSON.stringify({
      nameKo: c.ko ?? null,
      nameEn: c.en ?? null,
      nameJa: c.ja ?? null,
      title: c.title ?? null,
      ability: c.ability ?? null,
      species: c.species ?? null,
      location: c.location ?? null,
      personality: c.personality ?? null,
      image: c.image ?? null,
      firstAppearance: fa
        ? { slug: fa.slug, category: fa.category, nameKo: fa.nameKo?.split("~")[0].trim(), code: fa.code }
        : null,
      appearances,
    });

    const mdx = `---
title: "${(c.ko ?? c.slug).replace(/"/g, '\\"')}"
sidebar_position: ${posOf.get(c.slug)}
displayed_sidebar: charactersSidebar
layer: l1
---

import { CharacterMaster } from '@site/src/components';
export const CM_PROPS = ${props};

## 캐릭터 마스터

<CharacterMaster {...CM_PROPS} />
`;
    fs.writeFileSync(path.join(dir, `${c.slug}.mdx`), mdx);
    written++;
  }
  return written;
}

// ── Stage 3: intro.mdx fusion-toc 블록 삽입/교체 (EMPOTENT) ─────────────
const TOC_START = "{/* fusion-toc:start */}";
const TOC_END = "{/* fusion-toc:end */}";

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildTocBlock(g) {
  const base = `/twiki/docs/${g.category}/${g.slug}`;
  const charDir = path.join(DOCS, g.category, g.slug, "characters");
  const charSlugs = fs.existsSync(charDir)
    ? fs
        .readdirSync(charDir)
        .filter((f) => f.endsWith(".mdx"))
        .map((f) => f.replace(/\.mdx$/, ""))
        .sort((a, b) => a.localeCompare(b))
    : [];
  const charKo = (slug) =>
    escapeHtml(parseFrontmatter(fs.readFileSync(path.join(charDir, `${slug}.mdx`), "utf8")).title ?? slug);

  const cards = [];
  if (g.hasDialogue) {
    cards.push(
      `    <a class="fusion-toc__card" href="${base}/dialogue/overview"><span class="fusion-toc__card-icon">📖</span><span class="fusion-toc__card-title">스토리</span><span class="fusion-toc__card-desc">시나리오 · 대사</span></a>`
    );
  }
  if (g.hasSpellCards) {
    cards.push(
      `    <a class="fusion-toc__card" href="${base}/spell-cards"><span class="fusion-toc__card-icon">🎴</span><span class="fusion-toc__card-title">스펠카드</span><span class="fusion-toc__card-desc">보스별 스펠 목록</span></a>`
    );
  }
  if (g.hasMusic) {
    cards.push(
      `    <a class="fusion-toc__card" href="${base}/music"><span class="fusion-toc__card-icon">🎵</span><span class="fusion-toc__card-title">OST</span><span class="fusion-toc__card-desc">사운드트랙</span></a>`
    );
  }
  if (charSlugs.length > 0) {
    cards.push(
      `    <a class="fusion-toc__card" href="#gm-chars"><span class="fusion-toc__card-icon">👤</span><span class="fusion-toc__card-title">캐릭터</span><span class="fusion-toc__card-desc">출연 ${charSlugs.length}명</span></a>`
    );
  }

  const lines = [TOC_START];
  if (cards.length > 0) {
    lines.push(`<div class="fusion-toc">`, `  <div class="fusion-toc__cards">`, ...cards, `  </div>`);
  } else {
    lines.push(`<div class="fusion-toc">`);
  }


  if (charSlugs.length > 0) {
    const charCards = charSlugs.map((slug) => {
      const hasMaster = fs.existsSync(path.join(DOCS, "characters", `${slug}.mdx`));
      const links = [`<a href="${base}/characters/${slug}">게임 내 프로필</a>`];
      if (hasMaster) {
        links.push(`<a class="fusion-toc__primary" href="/twiki/docs/characters/${slug}">캐릭터 마스터 →</a>`);
      }
      return `      <div class="fusion-toc__char-card"><h4>${charKo(slug)}</h4><div class="fusion-toc__char-links">${links.join(
        ""
      )}</div></div>`;
    });
    lines.push(
      `  <div class="fusion-toc__section" id="gm-chars">`,
      `    <h3>캐릭터</h3>`,
      `    <div class="fusion-toc__char-grid">`,
      ...charCards,
      `    </div>`,
      `  </div>`
    );
  }

  lines.push(`</div>`, TOC_END);
  return lines.join("\n");
}

// frontmatter 에 layer 필드 삽입/교체 (EMPOTENT): 기존 layer 값 있으면 교체,
// 없으면 displayed_sidebar 줄 다음(없으면 frontmatter 끝)에 삽입.
function ensureLayerFrontmatter(text, layerValue) {
  const lines = text.split("\n");
  if (lines[0]?.trim() !== "---") return text;
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") { end = i; break; }
  }
  if (end === -1) return text;
  const fm = lines.slice(1, end);
  const layerIdx = fm.findIndex((l) => /^layer\s*:/.test(l.trim()));
  if (layerIdx !== -1) {
    fm[layerIdx] = `layer: ${layerValue}`;
  } else {
    const sidebarIdx = fm.findIndex((l) => /^displayed_sidebar\s*:/.test(l.trim()));
    const insertAt = sidebarIdx !== -1 ? sidebarIdx + 1 : fm.length;
    fm.splice(insertAt, 0, `layer: ${layerValue}`);
  }
  return [lines[0], ...fm, ...lines.slice(end)].join("\n");
}

function injectFusionToc(games) {
  let injected = 0;
  for (const g of games) {
    const file = path.join(DOCS, g.category, g.slug, "intro.mdx");
    if (!fs.existsSync(file)) continue;
    const orig = ensureLayerFrontmatter(fs.readFileSync(file, "utf8"), "l2");
    const block = buildTocBlock(g);

    let next;
    const startIdx = orig.indexOf(TOC_START);
    const endIdx = orig.indexOf(TOC_END);
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      // EMPOTENT: 기존 블록만 교체
      next = orig.slice(0, startIdx) + block + orig.slice(endIdx + TOC_END.length);
    } else {
      // 최초 삽입: frontmatter 직후 (2번째 --- 다음)
      const lines = orig.split("\n");
      let dash = 0, insertAt = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === "---") {
          dash++;
          if (dash === 2) { insertAt = i + 1; break; }
        }
      }
      lines.splice(insertAt, 0, "", block);
      next = lines.join("\n");
    }

    // 본문 보존 검증 (N6): 기존 마커가 있었으면 마커 종료 이후 바이트 동일
    if (startIdx !== -1 && endIdx !== -1) {
      const origAfter = orig.slice(endIdx + TOC_END.length);
      const nextAfter = next.slice(next.indexOf(TOC_END) + TOC_END.length);
      if (origAfter !== nextAfter) {
        fail(`본문 보존 실패: ${file} — fusion-toc:end 이후 내용이 변경됨`);
      }
    }

    fs.writeFileSync(file, next);
    injected++;
  }
  return injected;
}

// ── main ────────────────────────────────────────────────────────────────
function main() {
  // Data source is the committed _data/site-source/ snapshot (pushed by the
  // upstream data pipeline). Always present in the repo — no sibling lookup.
  const sourceAvailable = fs.existsSync(path.join(SITE_SOURCE, "games.json"));
  if (!sourceAvailable) {
    fail(
      "Missing _data/site-source/games.json. Push a fresh snapshot before building."
    );
  }

  const games = buildGames();
  const albums = buildAlbums();
  const characters = buildCharacters(games);

  const written = emitCharacterMasters(characters, games);
  const tocInjected = injectFusionToc(games);
  const publicChars = characters.map(({ _profileSlug, ...rest }) => rest);
  const siteData = { games, albums, characters: publicChars };
  const out = path.join(STATIC, "site-data.json");
  fs.mkdirSync(STATIC, { recursive: true });
  fs.writeFileSync(out, JSON.stringify(siteData, null, 2) + "\n");
  process.stdout.write(
    `[build-site-data] OK: games=${games.length} albums=${albums.length} characters=${characters.length} toc=${tocInjected} → ${path.relative(ROOT, out)}\n`
  );
}

main();
