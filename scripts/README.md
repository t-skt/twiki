# scripts/

## pre-commit hook: tdata.lock + docs/ 동시 커밋 강제

### 개요

`scripts/lib/check-tdata-lock.mjs`는 `.pre-commit-config.yaml`에 등록된 pre-commit hook으로,
생성된 docs와 `tdata.lock`이 항상 함께 커밋되도록 강제합니다.

### 5 케이스 동작 명세

| 케이스 | staged 파일 | 결과 | 설명 |
|--------|-------------|------|------|
| (a) | `docs/{shooting,fighting,side}/**` 만 | **차단** (exit 1) | generated docs 변경 시 tdata.lock 동반 필수 |
| (b) | `docs/_manual/**` 만 | **통과** (exit 0) | 수동 문서는 화이트리스트 |
| (c) | `tdata.lock` 만 | **차단** (exit 1) | lock 단독 갱신 금지 |
| (d) | `docs/{shooting,fighting,side}/**` + `tdata.lock` | **통과** (exit 0) | 정상 paired 커밋 |
| (e) | `docs/_manual/**` + `tdata.lock` | **통과** (exit 0) | manual + regen 동시 커밋 허용 |

### 에러 메시지

- 케이스 (a): `ERROR: docs/{shooting,fighting,side}/ 변경 시 tdata.lock도 함께 커밋되어야 합니다 (regen 일관성)`
- 케이스 (c): `ERROR: tdata.lock만 staged. docs/ 변경 없이 lock만 갱신할 수 없습니다`

### bypass 절차

hook을 건너뛰어야 하는 경우 (긴급 hotfix 등):

```bash
git commit --no-verify -m "message"
```

주의: `--no-verify`는 모든 pre-commit hook을 비활성화합니다. 가능하면 사용을 피하세요.

### hook 설치

[pre-commit](https://pre-commit.com/) 설치 후:

```bash
pre-commit install
```

또는 hook을 직접 실행:

```bash
node scripts/lib/check-tdata-lock.mjs
```
