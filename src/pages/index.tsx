import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

export default function Home(): ReactNode {
  return (
    <Layout
      title="동방 한국어 위키"
      description="동방 프로젝트 한국어 위키 — tdata SSOT 기반"
    >
      <main style={{ padding: "4rem 2rem", maxWidth: 760, margin: "0 auto" }}>
        <Heading as="h1" style={{ marginBottom: "1rem" }}>
          동방 한국어 위키
        </Heading>
        <p style={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
          동방 프로젝트의 게임·캐릭터·음악 정보를 모은 한국어 위키입니다.
          모든 데이터는 <a href="https://github.com/t-skt/tdata">t-skt/tdata</a>에서 생성됩니다.
        </p>
        <p style={{ marginTop: "2rem" }}>
          <Link
            className="button button--primary button--lg"
            to="/docs/shooting/embodiment-of-scarlet-devil/intro"
          >
            동방홍마향부터 시작 →
          </Link>
        </p>
        <p style={{ marginTop: "1.5rem", color: "#888", fontSize: "0.9rem" }}>
          장난감 갤러리: <a href="https://t-skt.github.io/tvirus/">tvirus</a>
        </p>
      </main>
    </Layout>
  );
}
