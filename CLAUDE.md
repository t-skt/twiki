# twiki — Touhou Wiki (한국어, Public)

## 레포 목적
- Docusaurus 3.x 기반 위키. 한국어 동방 프로젝트 정보 정리.
- **콘텐츠는 `../tdata/db/`에서 생성된다.** 이 레포에서 데이터를 만들지 않는다.
  - **예외 (twiki-owned 파생 생성물):** `docs/characters/**`, `static/site-data.json`, 그리고 각 `docs/<cat>/<slug>/intro.mdx`의 `{/* fusion-toc:start */}`…`{/* fusion-toc:end */}` 블록은 **twiki측 `scripts/build-site-data.mjs`가 생성·소유**한다. `yarn build:site-data`로 재생성하며, generate.py 대상이 아니다.

- ❌ `docs/**/*.mdx`를 손으로 편집하지 마라. **tdata/scripts/generate.py가 덮어쓴다.**
  - **⚠️ generate.py는 현재 렌더러 드리프트 상태 — 실행 금지.** `_render_intro`가 스텁(31행)만 생성해, 실행 시 260개 큐레이션 파일 + fusion-toc 블록 + `docs/characters/**`를 파괴한다. tdata SSOT 통합 트랙 완료 전까지 `generate.py`는 실행·수정 **양쪽 모두 금지**.
  - 예외: 별도 편집이 필요하면 `docs/_manual/` 디렉토리(generate 대상 외)에 두고 sidebar에 명시.
- ❌ `src/components/`에 장난감/인터랙티브 게임 추가하지 마라. 그건 `t-skt/tvirus`다.
- ❌ Python 의존성을 CI(`.github/workflows/`)에 넣지 마라. 빌드는 node만.

## 새 게임/캐릭터 추가 절차
1. `t-skt/tdata` 레포에서 데이터 추가 (별도 PR).
2. ~~tdata main에 머지 후 `python scripts/generate.py --game th21`~~ — **generate.py 실행 금지(렌더러 드리프트, 상단 참고).** SSOT 통합 트랙 완료 전까지는 새 게임 추가 시 `docs/<cat>/<slug>/`를 수동으로 만들고, `docs/characters/**`·`static/site-data.json`은 `yarn build:site-data`로 갱신한다.
3. `git diff ../twiki/docs/` 확인. 의도와 다르면 generate.py 또는 tdata 수정.
4. twiki로 이동: `cd ~/git/twiki && yarn build` 로컬 검증.
5. PR 본문에 "Generated from tdata@<commit_sha>" 명시.

## 컴포넌트 사용 패턴
- 모든 데이터는 props로 전달. MDX에서 fetch/import JSON 금지.
- `<CharacterProfile nameKr=... nameJp=... image=... />` 같은 stable interface 유지.
- 새 컴포넌트 추가 시: `src/components/<Name>.tsx` + `src/components/index.ts` re-export.

## 배포 방법
- main 브랜치 push → GitHub Actions가 `yarn build` → GitHub Pages.
- 수동 배포 비상시: `yarn deploy` (GIT_USER 환경변수 필요).
- 도메인: `t-skt.github.io/twiki/` (또는 custom domain).

## 로컬 워크플로
```bash
# tdata 변경 반영
cd ~/git/tdata && git pull
# ⚠️ generate.py 실행 금지 (렌더러 드리프트). twiki-owned 파생물은 아래로 갱신:
yarn build:site-data          # docs/characters/** + static/site-data.json + intro.mdx fusion-toc

cd ~/git/twiki
yarn start                    # 미리보기
git add docs/ tdata.lock && git commit -m "regen: th21 added" && git push
```

## MDX 재생성
- MDX 재생성은 **generate.py 실행 금지** (렌더러 드리프트 — 260개 큐레이션 파일 파괴). twiki-owned 파생물(`docs/characters/**`, `static/site-data.json`, intro.mdx fusion-toc)은 `yarn build:site-data`로만 갱신.
- 새 게임/캐릭터 추가 → tdata에서 데이터 추가(PR) 후, twiki측 `docs/<cat>/<slug>/`를 수동으로 만들고 `yarn build:site-data`로 파생물 갱신 → `docs/` + `static/site-data.json` 커밋. (generate.py 실행 전제 아님)

## 의존성 (CI에서 보장)
- node 22.x, yarn 1.22.x
- Python은 **로컬 개발용**. CI/CD 경로에서는 절대 사용하지 않는다.

## docs/는 생성 파일
- `docs/` 직접 편집 금지. `tdata/scripts/generate.py`로만 갱신.

## tdata.lock
- `generate.py` 실행 시 `tdata.lock` 자동 갱신. 반드시 같이 커밋.
- `tdata.lock` 없이 `docs/` 변경만 커밋 시 pre-commit hook이 차단.

## 롤백 절차
1. `git revert <bad-commit>` **단독**. (generate.py --all 재실행은 **금지** — 렌더러 드리프트로 260개 큐레이션 파일을 스텁으로 대체해 데이터 손실을 유발한다. 27c9820 전례.) revert 후 twiki-owned 파생물이 필요하면 `yarn build:site-data`로만 재생성.

## 하네스: twiki-structure

**목표:** twiki 정보 구조(IA) 진단 → 5개 후보 설계 → 리뷰 → HTML 프로토타입 파이프라인

**트리거:** "구조 바꿔줘", "IA 리디자인", "위키 구조 분석", "navigation 설계", "구조 프로토타입", "후보 비교" 요청 시 `twiki-structure` 스킬을 사용하라.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-08-22 | 초기 구성 | 전체 | IA 리디자인 요청 |
