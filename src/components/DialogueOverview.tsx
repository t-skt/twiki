import React, { useState, useRef, useLayoutEffect } from "react";
import { useLocation } from "@docusaurus/router";
import { getCardTheme, dialogueTypeFromFile, type CardTheme } from "./dialogueTheme";

// hybrid: 1인당 링크 ≥6 또는 전체 캐릭터 ≥12 → 기본 접힘
const PER_CHAR_COLLAPSE = 6;
const MANY_CHARS_COLLAPSE = 12;
function useCtx() {
  const { pathname } = useLocation();
  const active = /\/dialogue\/overview(?:[?/]|$)/.test(pathname);
  const baseHref = active ? pathname.replace(/\/overview.*$/, "") : "";
  return { active, baseHref };
}

function normalizeHref(rawHref: string, baseHref: string): string {
  if (!rawHref) return rawHref;
  if (rawHref.startsWith("http") || rawHref.startsWith("#")) return rawHref;
  if (rawHref.startsWith("./")) return baseHref + rawHref.slice(1);
  if (rawHref.startsWith("/")) return rawHref;
  return baseHref + "/" + rawHref;
}

function cssVars(t: CardTheme): React.CSSProperties {
  return {
    ["--char" as string]: t.border,
    ["--char-text" as string]: t.text,
    ["--char-soft" as string]: t.soft,
    ["--char-text-dark" as string]: t.textDark,
    ["--char-border-dark" as string]: t.borderDark,
    ["--char-soft-dark" as string]: t.softDark,
  };
}
function initial(name: string): string {
  return name.trim().charAt(0) || "?";
}
function textOf(node: React.ReactNode): string {
  return React.Children.toArray(node)
    .map((c) => (typeof c === "string" ? c : ""))
    .join("")
    .trim();
}

// 요소 트리에 href를 가진 anchor 탐색 (MDX가 a를 커스텀 컴포넌트로 래핑할 수 있음)
function findAnchor(
  el: React.ReactElement
): React.ReactElement<{ children?: React.ReactNode; href?: string }> | null {
  const props = el.props as { children?: React.ReactNode; href?: string };
  if (el.type === "a" || (props && "href" in props)) {
    return el as React.ReactElement<{ children?: React.ReactNode; href?: string }>;
  }
  for (const k of React.Children.toArray(props?.children ?? [])) {
    if (React.isValidElement(k)) {
      const found = findAnchor(k as React.ReactElement);
      if (found) return found;
    }
  }
  return null;
}

function extractLinks(
  children: React.ReactNode,
  baseHref: string
): { label: string; href: string; type: string }[] {
  const out: { label: string; href: string; type: string }[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const anchor = findAnchor(child as React.ReactElement);
    if (!anchor) return;
    const raw = anchor.props.href ?? "";
    out.push({
      label: textOf(anchor.props.children),
      href: normalizeHref(raw, baseHref),
      type: dialogueTypeFromFile(raw),
    });
  });
  return out;
}

// ── h3 래퍼: 캐릭터 컬러 헤더 (순수, SSG-safe) ──
export function DialogueH3({
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>): React.ReactElement {
  const { active } = useCtx();
  const name = textOf(children);
  if (!active || !name) return <h3 {...props}>{children}</h3>;

  const t = getCardTheme(name);
  return (
    <h3 className="dlg-head" style={cssVars(t)} {...props}>
      <span className="dlg-avatar">{initial(name)}</span>
      <span className="dlg-name">{name}</span>
    </h3>
  );
}

// ── ul 래퍼: 컬러 링크 몸체 + 자기 state 접기 (SSG-safe) ──
export function DialogueUl({
  children,
}: React.HTMLAttributes<HTMLUListElement>): React.ReactElement {
  const { active, baseHref } = useCtx();
  if (!active) return <ul>{children}</ul>;

  const items = extractLinks(children, baseHref);
  const [collapsed, setCollapsed] = useState(items.length >= PER_CHAR_COLLAPSE);
  const boxRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<CardTheme>(() => getCardTheme(""));

  // 클라이언트 1회: theme(이전 h3 이름) + many-chars(전체 캐릭터 ≥12면 접기)
  useLayoutEffect(() => {
    const prev = boxRef.current?.previousElementSibling;
    const name = prev?.querySelector(".dlg-name")?.textContent ?? "";
    if (name) setTheme(getCardTheme(name));
    const total = document.querySelectorAll(".dlg-head").length;
    if (total >= MANY_CHARS_COLLAPSE) setCollapsed(true);
  }, []);

  return (
    <div
      ref={boxRef}
      className={`dlg-links${collapsed ? " dlg-links--hidden" : ""}`}
      style={cssVars(theme)}
    >
      <button
        type="button"
        className="dlg-toggle"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((c) => !c)}
      >
        {collapsed ? "▸ 대사 펼치기" : "▾ 대사 접기"}
      </button>
      {!collapsed &&
        items.map((it, i) => (
          <a key={i} className="dlg-link" href={it.href}>
            <span className="dlg-chip">{it.type}</span>
            <span className="dlg-label">{it.label}</span>
            <span className="dlg-arrow">→</span>
          </a>
        ))}
    </div>
  );
}
