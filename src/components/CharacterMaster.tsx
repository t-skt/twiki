import React from "react";
import Link from "@docusaurus/Link";

export interface Appearance {
  gameSlug: string;
  category: string;
  year: number | null;
  hasProfile: boolean;
  profileSlug?: string;
  gameKo?: string;
  gameCode?: string;
}

interface CharacterMasterProps {
  nameKo?: string;
  nameEn?: string;
  nameJa?: string;
  title?: string;
  ability?: string;
  species?: string;
  location?: string;
  personality?: string;
  image?: string;
  firstAppearance?: { slug: string; category: string; nameKo?: string; code?: string } | null;
  appearances?: Appearance[];
}
const BASE = "/twiki";

const InfoRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) =>
  value ? (
    <div style={{ display: "flex", gap: "0.5rem", margin: "0.2rem 0", fontSize: "0.95rem" }}>
      <span style={{ color: "var(--ifm-color-emphasis-600)", minWidth: "4.5rem" }}>{label}</span>
      <span>{value}</span>
    </div>
  ) : null;

const CharacterMaster: React.FC<CharacterMasterProps> = ({
  nameKo,
  nameEn,
  nameJa,
  title,
  ability,
  species,
  location,
  personality,
  image,
  firstAppearance,
  appearances = [],
}) => (
  <div>
    {/* 헤더 */}
    <div
      style={{
        display: "flex",
        gap: "1.25rem",
        alignItems: "flex-start",
        flexWrap: "wrap",
        marginBottom: "1.5rem",
      }}
    >
      {image && (
        <img
          src={image}
          alt={nameKo ?? ""}
          style={{
            width: 160,
            height: "auto",
            borderRadius: 8,
            border: "1px solid var(--ifm-color-emphasis-300)",
          }}
        />
      )}
      <div style={{ flex: "1 1 280px" }}>
        <h2 style={{ margin: "0 0 0.25rem" }}>{nameKo}</h2>
        <div style={{ color: "var(--ifm-color-emphasis-600)" }}>
          {[nameJa, nameEn].filter(Boolean).join(" · ")}
        </div>
        {title && <div style={{ fontStyle: "italic", margin: "0.5rem 0 0.75rem" }}>{title}</div>}
        <InfoRow label="능력" value={ability} />
        <InfoRow label="종족" value={species} />
        <InfoRow label="거처" value={location} />
        {personality && (
          <p style={{ marginTop: "0.75rem", lineHeight: 1.7 }}>{personality}</p>
        )}
      </div>
    </div>

    {/* 첫 등장 */}
    {firstAppearance && (
      <p style={{ marginBottom: "1rem" }}>
        <strong>첫 등장:</strong>{" "}
        <Link to={`${BASE}/docs/${firstAppearance.category}/${firstAppearance.slug}/intro`}>
          {firstAppearance.nameKo ?? firstAppearance.slug}
          {firstAppearance.code ? ` (${firstAppearance.code.toUpperCase()})` : ""}
        </Link>
      </p>
    )}

    {/* 출연작 */}
    <h3>출연작 ({appearances.length})</h3>
    <ul style={{ listStyle: "none", paddingLeft: 0, columns: 2, columnGap: "2rem" }}>
      {appearances.map((a) => (
        <li key={a.gameSlug} style={{ marginBottom: "0.4rem", breakInside: "avoid" }}>
          <Link to={`${BASE}/docs/${a.category}/${a.gameSlug}/intro`}>
            {a.gameCode?.toUpperCase()} {a.gameKo}
          </Link>
          {a.hasProfile && a.profileSlug && (
            <>
              {" · "}
              <Link to={`${BASE}/docs/${a.category}/${a.gameSlug}/characters/${a.profileSlug}`}>
                프로필
              </Link>
            </>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export default CharacterMaster;
