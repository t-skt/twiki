#!/usr/bin/env node
// pre-commit hook: tdata.lock + docs/ 동시 커밋 강제
// 5 케이스 (F2):
//   (a) docs/{shooting|fighting|side}/** 만 staged → 차단
//   (b) docs/_manual/** 만 staged → 통과 (화이트리스트)
//   (c) tdata.lock 만 staged → 차단
//   (d) generated docs + tdata.lock paired → 통과
//   (e) manual docs + tdata.lock → 통과

import { execSync } from "node:child_process";

const staged = execSync("git diff --cached --name-only", { encoding: "utf8" })
  .trim().split("\n").filter(Boolean);

const isGenDoc = (p) => /^docs\/(shooting|fighting|side)\//.test(p);
const isManualDoc = (p) => p.startsWith("docs/_manual/");
const isLock = (p) => p === "tdata.lock";

const generatedDocsChanged = staged.some(isGenDoc);
const manualDocsChanged = staged.some(isManualDoc);
const lockChanged = staged.some(isLock);

// 케이스 분기
if (generatedDocsChanged && !lockChanged) {
  console.error("[tdata-lock-coupling] ERROR: docs/{shooting,fighting,side}/ 변경에 tdata.lock 누락");
  console.error("  → cd ../tdata && python -m scripts.generate --game <game> 후 ../twiki에 tdata.lock도 함께 staged 필요");
  process.exit(1);
}

if (lockChanged && !generatedDocsChanged && !manualDocsChanged) {
  console.error("[tdata-lock-coupling] ERROR: tdata.lock만 staged");
  console.error("  → docs/ 변경 동반 필요. tdata.lock 단독 변경 금지.");
  process.exit(1);
}

// 통과 (b, d, e 케이스)
process.exit(0);
