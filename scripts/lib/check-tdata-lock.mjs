#!/usr/bin/env node
// pre-commit hook: tdata.lock + docs/ 동시 커밋 강제
// 6 케이스 (F2 + fusion-toc):
//   (a) docs/{shooting|fighting|side}/** 만 staged → 차단
//   (b) docs/_manual/** 만 staged → 통과 (화이트리스트)
//   (c) tdata.lock 만 staged → 차단
//   (d) generated docs + tdata.lock paired → 통과
//   (e) manual docs + tdata.lock → 통과
//   (f) intro.mdx fusion-toc 블록 한정 (tdata.lock 미동반) → 통과
//       — build-site-data.mjs 산출. fusion-toc는 frontmatter 직후 상단 영역에
//         고정 삽입되므로, 그 영역 밖 라인에 diff 발생 시 차단(본문 보호).
import { execSync } from "node:child_process";

const staged = execSync("git diff --cached --name-only", { encoding: "utf8" })
  .trim().split("\n").filter(Boolean);

const isGenDoc = (p) => /^docs\/(shooting|fighting|side)\//.test(p);
const isManualDoc = (p) => p.startsWith("docs/_manual/");
const isLock = (p) => p === "tdata.lock";
const isIntroMdx = (p) => /^docs\/(shooting|fighting|side)\/[^/]+\/intro\.mdx$/.test(p);

const generatedDocsChanged = staged.some(isGenDoc);
const manualDocsChanged = staged.some(isManualDoc);
const lockChanged = staged.some(isLock);
const introMdxStaged = staged.filter(isIntroMdx);

// 케이스 분기
if (generatedDocsChanged && !lockChanged) {
  // 케이스 (f): intro.mdx fusion-toc 블록 한정 diff는 tdata.lock 없이 허용.
  // fusion-toc는 frontmatter(`---` 종결) 직후 상단 영역에 고정 삽입된다.
  // 그 영역(FUSION_TOC_MAX_LINE)을 벗어난 라인에 diff가 있으면 본문 훼손 → 차단.
  const FUSION_TOC_MAX_LINE = 12;
  const nonIntroGen = staged.filter((p) => isGenDoc(p) && !isIntroMdx(p));
  if (nonIntroGen.length > 0) {
    process.stderr.write("[tdata-lock-coupling] ERROR: docs/{shooting,fighting,side}/ 변경 시 tdata.lock도 함께 커밋되어야 합니다 (regen 일관성)\n");
    process.exit(1);
  }
  for (const intro of introMdxStaged) {
    // frontmatter 종결 라인(staged/new 파일 기준) 계산: 2번째 `---`
    const newContent = execSync(`git show ":${intro}"`, { encoding: "utf8" });
    const nl = newContent.split("\n");
    let dashCount = 0;
    let fmEnd = 0;
    for (let i = 0; i < nl.length; i++) {
      if (nl[i].trim() === "---") {
        dashCount++;
        if (dashCount === 2) { fmEnd = i + 1; break; }
      }
    }
    const bound = fmEnd + FUSION_TOC_MAX_LINE;
    const diff = execSync(`git diff --cached -U0 -- "${intro}"`, { encoding: "utf8" });
    const hunks = diff.match(/^@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@/gm) || [];
    for (const h of hunks) {
      const m = h.match(/ \+(\d+)(?:,(\d+))? @@/);
      const start = parseInt(m[1], 10);
      const count = m[2] === undefined || m[2] === "0" ? 1 : parseInt(m[2], 10);
      for (let ln = start; ln < start + count; ln++) {
        if (ln > bound) {
          process.stderr.write(`[tdata-lock-coupling] ERROR: ${intro} 의 fusion-toc 영역(상단 ${bound}행) 밖(line ${ln}) 본문이 수정되었습니다. 본문 보호 — revert 필요\n`);
          process.exit(1);
        }
      }
    }
  }
  process.exit(0);
}

if (lockChanged && !generatedDocsChanged && !manualDocsChanged) {
  process.stderr.write("[tdata-lock-coupling] ERROR: tdata.lock만 staged. docs/ 변경 없이 lock만 갱신할 수 없습니다\n");
  process.exit(1);
}

// 통과 (b, d, e 케이스)
process.exit(0);
