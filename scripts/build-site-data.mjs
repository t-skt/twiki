#!/usr/bin/env node
// build-site-data.mjs — twiki-owned 파생 생성물 빌더 (Fusion IA)
//
// 역할 (D1): tdata db/ (읽기) + docs/ (읽기) 에서 site-data.json 을 도출.
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
const TDATA = path.resolve(ROOT, "..", "tdata");
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
  const p = path.join(TDATA, rel);
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
  const db = readJson("db/games.json").games;
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
  const dbChars = readJson("db/characters.json").characters;
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
  const dbGames = readJson("db/games.json").games;

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

// ── main ────────────────────────────────────────────────────────────────
function main() {
  const games = buildGames();
  const albums = buildAlbums();
  const characters = buildCharacters(games);

  const written = emitCharacterMasters(characters, games);

  const publicChars = characters.map(({ _profileSlug, ...rest }) => rest);
  const siteData = { games, albums, characters: publicChars };
  const out = path.join(STATIC, "site-data.json");
  fs.mkdirSync(STATIC, { recursive: true });
  fs.writeFileSync(out, JSON.stringify(siteData, null, 2) + "\n");
  process.stdout.write(
    `[build-site-data] OK: games=${games.length} albums=${albums.length} characters=${characters.length} → ${path.relative(ROOT, out)}\n`
  );
}

main();
