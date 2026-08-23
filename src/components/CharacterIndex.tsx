import React, { useMemo } from "react";
import Link from "@docusaurus/Link";
import siteData from "@site/static/site-data.json";

type Char = (typeof siteData.characters)[number];

function azLetter(c: Char): string {
  const src = c.en || c.ko || "?";
  const ch = src.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(ch) ? ch : "#";
}

const CharacterIndex: React.FC = () => {
  const groups = useMemo(() => {
    const g: Record<string, Char[]> = {};
    for (const c of siteData.characters) {
      const L = azLetter(c);
      (g[L] = g[L] || []).push(c);
    }
    return g;
  }, []);

  const letters = useMemo(() => Object.keys(groups).sort(), [groups]);

  return (
    <>
      {letters.map((L) => (
        <div key={L} className="az-group">
          <span className="az-letter">{L}</span>
          <span className="az-chips">
            {groups[L]
              .slice()
              .sort((a, b) => (a.en || "").localeCompare(b.en || ""))
              .map((c) => (
                <Link
                  key={c.slug}
                  to={`/docs/characters/${c.slug}`}
                  className="az-chip"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {c.ko}
                </Link>
              ))}
          </span>
        </div>
      ))}
    </>
  );
};

export default CharacterIndex;
