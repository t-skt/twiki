import React from "react";
import { useLocation } from "@docusaurus/router";

type Layer = "l0" | "l1" | "l2";

interface LayerBandProps {
  /** Force a specific layer (used on non-docs pages like home) */
  layer?: Layer;
  /** Override the page title shown in the band */
  title?: string;
  /** Override the hint text */
  hint?: string;
}

const LAYER_CONFIG: Record<Layer, { badge: string; label: string; hint: string; className: string }> = {
  l0: { badge: "L0", label: "홈", hint: "사이트 전체 진입점", className: "layerband--l0" },
  l1: { badge: "L1", label: "캐릭터 마스터", hint: "캐릭터별 출연작 크로스링크", className: "layerband--l1" },
  l2: { badge: "L2", label: "게임 지도", hint: "게임별 스토리·스펠카드·OST·캐릭터", className: "layerband--l2" },
};

/**
 * LayerBand renders a colored strip below the navbar showing the current IA layer.
 *
 * On docs pages: derives the layer from the URL path (character master vs. game intro).
 * On non-docs pages (home): pass `layer` explicitly.
 *
 * If no layer is detected (L3/L4 pages, or unrelated routes), renders nothing.
 * Uses `useLocation` (not `window.location`) so it stays SSR-safe.
 */
export default function LayerBand({ layer: forcedLayer, title: forcedTitle, hint: forcedHint }: LayerBandProps) {
  const location = useLocation();

  let layer: Layer | null = forcedLayer ?? null;

  if (!layer) {
    const path = location.pathname;
    if (path.includes("/docs/characters/")) {
      layer = "l1";
    } else if (/\/docs\/(shooting|fighting|side)\/[^/]+\/intro/.test(path)) {
      layer = "l2";
    }
  }

  if (!layer) return null;

  const config = LAYER_CONFIG[layer];

  return (
    <div className={`layerband ${config.className}`} role="navigation" aria-label={`현재 위치: ${config.label}`}>
      <div className="layerband__inner">
        <span className="layerband__badge">{config.badge}</span>
        <span className="layerband__crumb">{config.label}</span>
        <span className="layerband__sep">—</span>
        <span className="layerband__current">{forcedTitle || config.hint}</span>
        <span className="layerband__hint">{forcedHint || `현재: ${config.label}`}</span>
      </div>
    </div>
  );
}
