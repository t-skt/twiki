import React, { useMemo, useState } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import siteData from "@site/static/site-data.json";

type Game = (typeof siteData.games)[number];
type Album = (typeof siteData.albums)[number];
type Character = (typeof siteData.characters)[number];

const CATEGORY_LABEL: Record<string, string> = {
  shooting: "슈팅",
  fighting: "격투",
  side: "외전",
};

const BASE = "/twiki";

// Full year range across every game, independent of the active search filter,
// so the timeline's shape stays stable while a query only hides non-matching rows.
const ALL_YEARS: number[] = (() => {
  const years = siteData.games.map((g) => g.year);
  const min = Math.min(...years);
  const max = Math.max(...years);
  const out: number[] = [];
  for (let y = min; y <= max; y++) out.push(y);
  return out;
})();

function GameCard({ g }: { g: Game }) {
  return (
    <Link to={`${BASE}/docs/${g.category}/${g.slug}/intro`} className="home-card">
      <div className={`home-card__thumb home-card__thumb--${g.category}`}>{g.code.toUpperCase()}</div>
      <div className="home-card__title">{g.nameKo?.split("~")[0].trim()}</div>
      <div className="home-card__meta">
        {CATEGORY_LABEL[g.category]} · {g.year}
      </div>
    </Link>
  );
}

function AlbumCard({ a }: { a: Album }) {
  return (
    <Link to={`${BASE}/docs/music/${a.slug}`} className="home-card">
      <div className="home-card__thumb home-card__thumb--music">Album {a.pos}</div>
      <div className="home-card__title">{a.titleKo}</div>
      {a.titleEn && <div className="home-card__meta">{a.titleEn}</div>}
    </Link>
  );
}

function CharacterChip({ c }: { c: Character }) {
  return (
    <Link to={`${BASE}/docs/characters/${c.slug}`} className="az-chip">
      {c.ko}
    </Link>
  );
}

function azLetter(c: Character): string {
  const src = c.en || c.ko || "?";
  const ch = src.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(ch) ? ch : "#";
}

function AzIndex({ characters }: { characters: Character[] }) {
  const groups = useMemo(() => {
    const byLetter = new Map<string, Character[]>();
    for (const c of characters) {
      const letter = azLetter(c);
      const list = byLetter.get(letter);
      if (list) list.push(c);
      else byLetter.set(letter, [c]);
    }
    return Array.from(byLetter.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([letter, list]) => [letter, list.slice().sort((a, b) => (a.en || "").localeCompare(b.en || ""))] as const);
  }, [characters]);

  return (
    <div className="az-index">
      <Heading as="h2" className="az-index__title">
        캐릭터 A-Z 인덱스 ({characters.length}명)
      </Heading>
      {groups.map(([letter, list]) => (
        <div className="az-group" key={letter}>
          <span className="az-letter">{letter}</span>
          <span className="az-chips">
            {list.map((c) => (
              <CharacterChip key={c.slug} c={c} />
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

function GenreView({ games, albums, characters }: { games: Game[]; albums: Album[]; characters: Character[] }) {
  const byCat = (cat: string) => games.filter((g) => g.category === cat);
  return (
    <>
      {(["shooting", "fighting", "side"] as const).map((cat) => (
        <section className="home-section" key={cat}>
          <div className="home-section__head">
            <span className="home-section__title">{CATEGORY_LABEL[cat]}</span>
            <span className="home-section__count">({byCat(cat).length})</span>
          </div>
          <div className="home-grid">
            {byCat(cat).map((g) => (
              <GameCard key={g.slug} g={g} />
            ))}
          </div>
        </section>
      ))}
      <section className="home-section">
        <div className="home-section__head">
          <span className="home-section__title">음악</span>
          <span className="home-section__count">({albums.length})</span>
        </div>
        <div className="home-grid">
          {albums.map((a) => (
            <AlbumCard key={a.slug} a={a} />
          ))}
        </div>
      </section>
      <AzIndex characters={characters} />
    </>
  );
}

function YearView({ games }: { games: Game[] }) {
  return (
    <div className="timeline">
      {ALL_YEARS.map((y) => {
        const yg = games.filter((g) => g.year === y);
        return (
          <div className={`tl-row${yg.length === 0 ? " tl-row--empty" : ""}`} key={y}>
            <div className="tl-year">{y}</div>
            <div className="tl-track">
              <span className="tl-dot" />
            </div>
            {yg.length > 0 ? (
              <div className="tl-games">
                {yg.map((g) => (
                  <Link key={g.slug} to={`${BASE}/docs/${g.category}/${g.slug}/intro`} className="tl-game">
                    {g.code.toUpperCase()} · {g.nameKo?.split("~")[0].trim()}
                    <small>{CATEGORY_LABEL[g.category]}</small>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="tl-games tl-games--empty">출시 없음</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<"genre" | "year">("genre");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const hasQ = q.length > 0;
  const inMatch = (fields: (string | null | undefined)[]) =>
    !hasQ || fields.some((f) => f != null && String(f).toLowerCase().includes(q));
  const games = siteData.games.filter((g) => inMatch([g.nameKo, g.nameEn, g.nameJa, g.code, g.slug]));
  const albums = siteData.albums.filter((a) => inMatch([a.titleKo, a.titleEn, a.slug]));
  const characters = siteData.characters.filter((c) => inMatch([c.ko, c.en, c.ja, c.id, c.slug]));

  return (
    <Layout title="동방 한국어 위키" description="동방 프로젝트 한국어 위키 — 게임·캐릭터·음악">
      <div className="home-hero">
        <Heading as="h1" className="home-hero__title">
          동방 한국어 위키
        </Heading>
        <p className="home-hero__sub">동방 프로젝트의 게임·캐릭터·음악 정보를 모은 한국어 위키입니다.</p>
        <input
          type="search"
          className="home-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="게임, 캐릭터, 음악 통합 검색... (예: 레이무, Th13, 신령묘)"
          aria-label="통합 검색"
        />
        <p className="home-search-hint">
          게임 {siteData.games.length} · 캐릭터 {siteData.characters.length}명 · 음악 {siteData.albums.length} — 검색은
          아래 섹션과 캐릭터 A-Z 인덱스를 동시에 필터링합니다.
        </p>
      </div>

      <main style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
        <div className="view-toggle" role="tablist" aria-label="홈 뷰 전환">
          <button
            type="button"
            role="tab"
            aria-selected={view === "genre"}
            className={`view-toggle__btn${view === "genre" ? " is-active" : ""}`}
            onClick={() => setView("genre")}
          >
            장르별
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "year"}
            className={`view-toggle__btn${view === "year" ? " is-active" : ""}`}
            onClick={() => setView("year")}
          >
            연도순
          </button>
        </div>

        {hasQ && (
          <p className="home-results">
            "{query}" 검색 결과: 게임 {games.length} · 캐릭터 {characters.length} · 앨범 {albums.length}
          </p>
        )}

        {view === "genre" ? (
          <GenreView games={games} albums={albums} characters={characters} />
        ) : (
          <YearView games={games} />
        )}

        <p style={{ marginTop: "2rem", color: "var(--ifm-color-emphasis-600)", fontSize: "0.9rem" }}>
          장난감 갤러리: <a href="https://t-skt.github.io/tvirus/">tvirus</a>
        </p>
      </main>
    </Layout>
  );
}
