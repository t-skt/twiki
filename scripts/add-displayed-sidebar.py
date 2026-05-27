#!/usr/bin/env python3
"""
Add `displayed_sidebar` frontmatter to every game/music mdx so that
opening any page within a game shows only that game's sidebar.

Idempotent — if `displayed_sidebar:` is already present, the file is skipped.
"""

import os
import re
import sys

ROOT = os.path.join(os.path.dirname(__file__), "..")
DOCS = os.path.abspath(os.path.join(ROOT, "docs"))

# game directory -> sidebar id (matches sidebars.ts keys)
GAME_SIDEBAR = {
    # 슈팅 14
    "shooting/embodiment-of-scarlet-devil": "th06Sidebar",
    "shooting/perfect-cherry-blossom": "th07Sidebar",
    "shooting/imperishable-night": "th08Sidebar",
    "shooting/phantasmagoria-of-flower-view": "th09Sidebar",
    "shooting/mountain-of-faith": "th10Sidebar",
    "shooting/subterranean-animism": "th11Sidebar",
    "shooting/undefined-fantastic-object": "th12Sidebar",
    "shooting/ten-desires": "th13Sidebar",
    "shooting/double-dealing-character": "th14Sidebar",
    "shooting/legacy-of-lunatic-kingdom": "th15Sidebar",
    "shooting/hidden-star-in-four-seasons": "th16Sidebar",
    "shooting/wily-beast-and-weakest-creature": "th17Sidebar",
    "shooting/unconnected-marketeers": "th18Sidebar",
    "shooting/fossilized-wonders": "th20Sidebar",
    # 격투 8
    "fighting/immaterial-and-missing-power": "th075Sidebar",
    "fighting/scarlet-weather-rhapsody": "th105Sidebar",
    "fighting/hisoutensoku": "th123Sidebar",
    "fighting/hopeless-masquerade": "th135Sidebar",
    "fighting/urban-legend-in-limbo": "th145Sidebar",
    "fighting/antinomy-of-common-flowers": "th155Sidebar",
    "fighting/touhou-gouyoku-ibun": "th175Sidebar",
    "fighting/unfinished-dream-of-all-living-ghost": "th19Sidebar",
    # 외전 6
    "side/shoot-the-bullet": "th095Sidebar",
    "side/double-spoiler": "th125Sidebar",
    "side/great-fairy-wars": "th128Sidebar",
    "side/impossible-spell-card": "th143Sidebar",
    "side/violet-detector": "th165Sidebar",
    "side/bullet-filia": "th185Sidebar",
    # 음악 (whole folder = one sidebar)
    "music": "musicSidebar",
}

FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)


def add_displayed_sidebar(path: str, sidebar_id: str) -> str:
    """Return 'added' | 'skipped' | 'no-frontmatter'."""
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    m = FRONTMATTER_RE.match(content)
    if not m:
        return "no-frontmatter"

    fm = m.group(1)
    if re.search(r"^displayed_sidebar\s*:", fm, re.MULTILINE):
        return "skipped"

    new_fm = fm.rstrip() + f"\ndisplayed_sidebar: {sidebar_id}"
    new_content = f"---\n{new_fm}\n---\n" + content[m.end():]

    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    return "added"


def main() -> int:
    totals = {"added": 0, "skipped": 0, "no-frontmatter": 0}
    no_fm_files: list[str] = []

    for rel_dir, sidebar_id in GAME_SIDEBAR.items():
        abs_dir = os.path.join(DOCS, rel_dir)
        if not os.path.isdir(abs_dir):
            print(f"WARN: missing dir {abs_dir}", file=sys.stderr)
            continue
        for root, _, files in os.walk(abs_dir):
            for name in files:
                if not name.endswith(".mdx"):
                    continue
                path = os.path.join(root, name)
                result = add_displayed_sidebar(path, sidebar_id)
                totals[result] += 1
                if result == "no-frontmatter":
                    no_fm_files.append(path)

    print(f"added: {totals['added']}")
    print(f"skipped (already had displayed_sidebar): {totals['skipped']}")
    print(f"no-frontmatter: {totals['no-frontmatter']}")
    for p in no_fm_files[:10]:
        print(f"  - {p}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
