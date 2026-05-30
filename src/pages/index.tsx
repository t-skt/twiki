import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

type Game = { slug: string; kr: string; code: string };

const shooting: Game[] = [
  { slug: "embodiment-of-scarlet-devil", kr: "동방홍마향", code: "Th06" },
  { slug: "perfect-cherry-blossom", kr: "동방요요몽", code: "Th07" },
  { slug: "imperishable-night", kr: "동방영야초", code: "Th08" },
  { slug: "phantasmagoria-of-flower-view", kr: "동방화영총", code: "Th09" },
  { slug: "mountain-of-faith", kr: "동방풍신록", code: "Th10" },
  { slug: "subterranean-animism", kr: "동방지령전", code: "Th11" },
  { slug: "undefined-fantastic-object", kr: "동방성련선", code: "Th12" },
  { slug: "ten-desires", kr: "동방신령묘", code: "Th13" },
  { slug: "double-dealing-character", kr: "동방휘침성", code: "Th14" },
  { slug: "legacy-of-lunatic-kingdom", kr: "동방감주전", code: "Th15" },
  { slug: "hidden-star-in-four-seasons", kr: "동방천공장", code: "Th16" },
  { slug: "wily-beast-and-weakest-creature", kr: "동방귀형수", code: "Th17" },
  { slug: "unconnected-marketeers", kr: "동방홍룡동", code: "Th18" },
  { slug: "unfinished-dream-of-all-living-ghost", kr: "동방수왕원", code: "Th19" },
  { slug: "fossilized-wonders", kr: "동방금상경", code: "Th20" },
];

const fighting: Game[] = [
  { slug: "immaterial-and-missing-power", kr: "동방췌몽상", code: "Th075" },
  { slug: "scarlet-weather-rhapsody", kr: "동방비상천", code: "Th105" },
  { slug: "hisoutensoku", kr: "동방비상천칙", code: "Th123" },
  { slug: "hopeless-masquerade", kr: "동방심기루", code: "Th135" },
  { slug: "urban-legend-in-limbo", kr: "동방심비록", code: "Th145" },
  { slug: "antinomy-of-common-flowers", kr: "동방빙의화", code: "Th155" },
  { slug: "touhou-gouyoku-ibun", kr: "동방강욕이문", code: "Th175" },
];

const side: Game[] = [
  { slug: "shoot-the-bullet", kr: "동방문화첩", code: "Th095" },
  { slug: "double-spoiler", kr: "더블 스포일러", code: "Th125" },
  { slug: "great-fairy-wars", kr: "요정대전쟁", code: "Th128" },
  { slug: "impossible-spell-card", kr: "탄막 아마노자쿠", code: "Th143" },
  { slug: "violet-detector", kr: "비봉 나이트메어 다이어리", code: "Th165" },
  { slug: "bullet-filia", kr: "불릿필리아들의 암시장", code: "Th185" },
];

function Card({
  category,
  slug,
  kr,
  code,
}: Game & { category: string }): ReactNode {
  return (
    <Link
      to={`/docs/${category}/${slug}/intro`}
      style={{
        display: "block",
        padding: "1rem",
        border: "1px solid var(--ifm-color-emphasis-300)",
        borderRadius: 6,
        textDecoration: "none",
        color: "inherit",
        background: "var(--ifm-card-background-color, #fff)",
      }}
    >
      <small style={{ color: "var(--ifm-color-emphasis-600)" }}>{code}</small>
      <div style={{ fontWeight: 600, marginTop: "0.25rem" }}>{kr}</div>
    </Link>
  );
}

function Section({
  title,
  category,
  games,
}: {
  title: string;
  category: string;
  games: Game[];
}): ReactNode {
  return (
    <>
      <Heading as="h2" style={{ marginTop: "2rem" }}>
        {title}
      </Heading>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {games.map((g) => (
          <Card key={g.slug} category={category} {...g} />
        ))}
      </div>
    </>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="동방 한국어 위키"
      description="동방 프로젝트 한국어 위키 — tdata SSOT 기반"
    >
      <main style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
        <Heading as="h1">동방 한국어 위키</Heading>
        <p style={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
          동방 프로젝트의 게임·캐릭터·음악 정보를 모은 한국어 위키입니다. 모든
          데이터는{" "}
          <a href="https://github.com/t-skt/tdata">t-skt/tdata</a>에서
          생성됩니다.
        </p>

        <Section title="슈팅" category="shooting" games={shooting} />
        <Section title="격투" category="fighting" games={fighting} />
        <Section title="외전" category="side" games={side} />

        <p
          style={{
            marginTop: "2rem",
            color: "var(--ifm-color-emphasis-600)",
            fontSize: "0.9rem",
          }}
        >
          장난감 갤러리:{" "}
          <a href="https://t-skt.github.io/tvirus/">tvirus</a>
        </p>
      </main>
    </Layout>
  );
}
