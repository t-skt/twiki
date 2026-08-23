import React, { type ReactNode, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import { useLocation } from "@docusaurus/router";
import NavbarLayout from "@theme/Navbar/Layout";
import siteData from "@site/static/site-data.json";

type Game = (typeof siteData.games)[number];

const CATEGORIES: Array<{ key: Game["category"]; label: string }> = [
  { key: "shooting", label: "슈팅" },
  { key: "fighting", label: "격투" },
  { key: "side", label: "외전" },
];

function GameMegaDropdown(): ReactNode {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const gamesByCat = (cat: Game["category"]) =>
    siteData.games.filter((g) => g.category === cat);

  return (
    <li
      className={clsx("slimnav__item", "slimnav__item--dropdown", { "is-open": open })}
      ref={ref}>
      <button
        className="slimnav__link"
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}>
        <span>게임</span>
        <span className="slimnav__caret">▾</span>
      </button>
      <div className="slimnav__dropdown" role="menu" onMouseLeave={() => setOpen(false)}>
        {CATEGORIES.map((cat) => (
          <div className="dd-col" key={cat.key}>
            <h4>
              {cat.label} ({gamesByCat(cat.key).length})
            </h4>
            {gamesByCat(cat.key).map((g) => (
              <Link
                key={g.slug}
                to={`/docs/${g.category}/${g.slug}/intro`}
                className="dd-col__link"
                onClick={() => setOpen(false)}>
                {g.code.toUpperCase()} · {g.nameKo?.split("~")[0].trim()}
              </Link>
            ))}
          </div>
        ))}
        <Link to="/" className="dd-viewall" onClick={() => setOpen(false)}>
          홈에서 전체 보기 →
        </Link>
      </div>
    </li>
  );
}

export default function Navbar(): ReactNode {
  const location = useLocation();

  const isHome = location.pathname === "/" || location.pathname === "/twiki" || location.pathname === "/twiki/";

  return (
    <NavbarLayout>
      <div className="navbar__inner slimnav__inner">
        <Link to="/" className="slimnav__logo">
          <span className="slimnav__mark">東</span>
          <span>twiki</span>
        </Link>

        <ul className="slimnav__menu">
          <li className="slimnav__item">
            <Link to="/" className={clsx("slimnav__link", { "is-active": isHome })}>
              홈
            </Link>
          </li>
          <GameMegaDropdown />
          <li className="slimnav__item">
            <Link
              to="/docs/characters"
              className={clsx("slimnav__link", { "is-active": location.pathname.startsWith("/docs/characters") })}>
              캐릭터
            </Link>
          </li>
          <li className="slimnav__item">
            <Link
              to="/docs/music"
              className={clsx("slimnav__link", { "is-active": location.pathname.startsWith("/docs/music") })}>
              음악
            </Link>
          </li>
        </ul>

        <div className="slimnav__actions">
          <button
            className="slimnav__iconbtn"
            type="button"
            aria-label="검색"
            onClick={() => {
              window.location.href = "/twiki/?focus-search=1";
            }}>
            🔍
          </button>
          <a
            className="slimnav__iconbtn"
            href="https://github.com/t-skt/twiki"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub">
            <svg viewBox="0 0 16 16" width="17" height="17" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
          </a>
        </div>
      </div>
    </NavbarLayout>
  );
}
