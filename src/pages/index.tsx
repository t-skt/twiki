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

function GameCard({ g }: { g: Game }) {
  return (
    <Link
      to={`${BASE}/docs/${g.category}/${g.slug}/intro`}
      style={{
        display: "block",
        padding: "0.85rem",
        border: "1px solid var(--ifm-color-emphasis-300)",
        borderRadius: 6,
        textDecoration: "none",
        color: "inherit",
        background: "var(--ifm-card-background-color, #fff)",
      }}
    >
      <small style={{ color: "var(--ifm-color-emphasis-600)" }}>{g.code.toUpperCase()}</small>
      <div style={{ fontWeight: 600, marginTop: "0.25rem" }}>{g.nameKo?.split("~")[0].trim()}</div>
      <div style={{ fontSize: "0.8rem", color: "var(--ifm-color-emphasis-600)", marginTop: "0.25rem" }}>
        {g.year} · 캐릭터 {g.charCount}
      </div>
    </Link>
  );
}

function AlbumCard({ a }: { a: Album }) {
  return (
    <Link
      to={`${BASE}/docs/music/${a.slug}`}
      style={{
        display: "block",
        padding: "0.85rem",
        border: "1px solid var(--ifm-color-emphasis-300)",
        borderRadius: 6,
        textDecoration: "none",
        color: "inherit",
        background: "var(--ifm-card-background-color, #fff)",
      }}
    >
      <div style={{ fontWeight: 600 }}>{a.titleKo}</div>
      {a.titleEn && (
        <div style={{ fontSize: "0.8rem", color: "var(--ifm-color-emphasis-600)", marginTop: "0.25rem" }}>
          {a.titleEn}
        </div>
      )}
    </Link>
  );
}

function CharacterChip({ c }: { c: Character }) {
  return (
    <Link
      to={`${BASE}/docs/characters/${c.slug}`}
      style={{
        display: "inline-block",
        padding: "0.3rem 0.6rem",
        marginRight: "0.4rem",
        marginBottom: "0.4rem",
        border: "1px solid var(--ifm-color-emphasis-300)",
        borderRadius: 999,
        textDecoration: "none",
        color: "inherit",
        fontSize: "0.85rem",
        background: "var(--ifm-card-background-color, #fff)",
      }}
    >
      {c.ko}
    </Link>
  );
}

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: "0.75rem",
};

function GenreView({ games, albums, characters }: { games: Game[]; albums: Album[]; characters: Character[] }) {
  const byCat = (cat: string) => games.filter((g) => g.category === cat);
  return (
    <>
      {(["shooting", "fighting", "side"] as const).map((cat) => (
        <section key={cat}>
          <Heading as="h2" style={{ marginTop: "2rem" }}>
            {CATEGORY_LABEL[cat]} ({byCat(cat).length})
          </Heading>
          <div style={gridStyle}>{byCat(cat).map((g) => <GameCard key={g.slug} g={g} />)}</div>
        </section>
      ))}
      <section>
        <Heading as="h2" style={{ marginTop: "2rem" }}>
          음악 ({albums.length})
        </Heading>
        <div style={gridStyle}>{albums.map((a) => <AlbumCard key={a.slug} a={a} />)}</div>
      </section>
      <section>
        <Heading as="h2" style={{ marginTop: "2rem" }}>
          캐릭터 ({characters.length})
        </Heading>
        <div>{characters.map((c) => <CharacterChip key={c.slug} c={c} />)}</div>
      </section>
    </>
  );
}

function YearView({ games }: { games: Game[] }) {
  const years = useMemo(() => {
    const min = Math.min(...games.map((g) => g.year ?? 9999));
    const max = Math.max(...games.map((g) => g.year ?? 0));
    const out: number[] = [];
    for (let y = min; y <= max; y++) out.push(y);
    return out;
  }, [games]);

  return (
    <>
      {years.map((y) => {
        const yg = games.filter((g) => g.year === y);
        return (
          <section key={y}>
            <Heading as="h2" style={{ marginTop: "2rem" }}>
              {y}
              {yg.length === 0 && (
                <span style={{ marginLeft: "0.6rem", fontSize: "0.85rem", color: "var(--ifm-color-emphasis-600)" }}>
                  (출시 작품 없음)
                </span>
              )}
            </Heading>
            {yg.length > 0 ? (
              <div style={gridStyle}>{yg.map((g) => <GameCard key={g.slug} g={g} />)}</div>
            ) : (
              <p style={{ color: "var(--ifm-color-emphasis-600)" }}>이해에 출시된 동방 시리즈 작품이 없습니다.</p>
            )}
          </section>
        );
      })}
    </>
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

  const toggleBtn = (active: boolean): React.CSSProperties => ({
    padding: "0.4rem 1rem",
    border: "1px solid var(--ifm-color-emphasis-300)",
    background: active ? "var(--ifm-color-primary)" : "transparent",
    color: active ? "#fff" : "inherit",
    cursor: "pointer",
    fontSize: "0.9rem",
  });

  return (
    <Layout title="동방 한국어 위키" description="동방 프로젝트 한국어 위키 — tdata SSOT 기반">
      <main style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
        <Heading as="h1">동방 한국어 위키</Heading>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.7 }}>
          동방 프로젝트의 게임·캐릭터·음악 정보를 모은 한국어 위키입니다. 모든 데이터는{" "}
          <a href="https://github.com/t-skt/tdata">t-skt/tdata</a>에서 생성됩니다.
        </p>

        {/* 검색 + 뷰 토글 */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
            margin: "1.5rem 0",
          }}
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="게임·캐릭터·앨범 검색 (예: 레이무)"
            style={{
              flex: "1 1 260px",
              padding: "0.5rem 0.75rem",
              fontSize: "1rem",
              border: "1px solid var(--ifm-color-emphasis-400)",
              borderRadius: 6,
            }}
          />
          <button onClick={() => setView("genre")} style={toggleBtn(view === "genre")}>
            장르별
          </button>
          <button onClick={() => setView("year")} style={toggleBtn(view === "year")}>
            연도순
          </button>
        </div>

        {q && (
          <p style={{ color: "var(--ifm-color-emphasis-600)", marginTop: "0.5rem" }}>
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
