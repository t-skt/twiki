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

const MetaItem: React.FC<{ label: string; value?: string | null }> = ({ label, value }) =>
  value ? (
    <div className="cm-meta__item">
      <span className="cm-meta__label">{label}</span>
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
    <div className="cm-header">
      {image && <img src={image} alt={nameKo ?? ""} className="cm-image" />}
      <div className="cm-header__info">
        <h2 className="cm-name">{nameKo}</h2>
        <div className="cm-names">{[nameJa, nameEn].filter(Boolean).join(" · ")}</div>
        {title && <div className="cm-title">{title}</div>}
        <div className="cm-meta">
          <MetaItem label="능력" value={ability} />
          <MetaItem label="종족" value={species} />
          <MetaItem label="거처" value={location} />
        </div>
        {personality && <p className="cm-personality">{personality}</p>}
      </div>
    </div>

    {/* 첫 등장 */}
    {firstAppearance && (
      <p className="cm-first-appearance">
        <strong>첫 등장:</strong>{" "}
        <Link to={`${BASE}/docs/${firstAppearance.category}/${firstAppearance.slug}/intro`}>
          {firstAppearance.nameKo ?? firstAppearance.slug}
          {firstAppearance.code ? ` (${firstAppearance.code.toUpperCase()})` : ""}
        </Link>
      </p>
    )}

    {/* 출연작 */}
    <div className="cm-appearances">
      <h3>
        출연작 <span>({appearances.length}작, 연도순)</span>
      </h3>
      <ul className="cm-appear-list">
        {appearances.map((a) => (
          <li key={a.gameSlug} className="cm-appear-row">
            <span className="cm-appear-year">{a.year ?? "-"}</span>
            <span className="cm-appear-th">{a.gameCode?.toUpperCase() ?? ""}</span>
            <Link className="cm-appear-title" to={`${BASE}/docs/${a.category}/${a.gameSlug}/intro`}>
              {a.gameKo}
            </Link>
            <span className="cm-appear-links">
              <Link to={`${BASE}/docs/${a.category}/${a.gameSlug}/intro`}>시나리오</Link>
              {a.hasProfile && a.profileSlug && (
                <Link to={`${BASE}/docs/${a.category}/${a.gameSlug}/characters/${a.profileSlug}`}>
                  프로필
                </Link>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default CharacterMaster;
