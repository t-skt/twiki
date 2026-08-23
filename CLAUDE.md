# twiki — Touhou Wiki (한국어, Public)

## 레포 목적
- Docusaurus 3.x 기반 위키. 한국어 동방 프로젝트 정보 정리.
- **콘텐츠는 `_data/site-source/` snapshot에서 생성된다.** 이 레포에서 데이터를 만들지 않는다.
  - snapshot은 upstream 데이터 파이프라인이 push하는 tracked artifact.
  - **예외 (twiki-owned 파생 생성물):** `docs/characters/**`, `static/site-data.json`, 그리고 각 `docs/<cat>/<slug>/intro.mdx`의 `{/* fusion-toc:start */}`…`{/* fusion-toc:end */}` 블록은 **twiki측 `scripts/build-site-data.mjs`가 생성·소유**한다. `yarn build:site-data`로 재생성.

- ❌ `docs/**/*.mdx`를 손으로 편집하지 마라. 큐레이션된 콘텐츠는 upstream에서 관리.
  - 예외: 별도 편집이 필요하면 `docs/_manual/` 디렉토리(generate 대상 외)에 두고 sidebar에 명시.
- ❌ `src/components/`에 장난감/인터랙티브 게임 추가하지 마라. 그건 `t-skt/tvirus`다.
- ❌ Python 의존성을 CI(`.github/workflows/`)에 넣지 마라. 빌드는 node만.

## 데이터 공급 (push)
- upstream 데이터 파이프라인이 `_data/site-source/`(games.json, characters.json) + `data.lock`을 push.
- twiki는 이 snapshot을 **opaque data bundle**로만 소비. snapshot의 출처 레포를 참조하지 않는다.
- 새 데이터 반영: upstream이 push → twiki에 `_data/site-source/` + `data.lock` 변경이 도착 → `yarn build:site-data`로 파생물 재생성 → 커밋.

## 새 게임/캐릭터 추가 절차
1. upstream 데이터 파이프라인에서 데이터 추가 (별도 PR).
2. push 후 twiki에 `_data/site-source/` + `data.lock` 변경 확인.
3. `docs/<cat>/<slug>/`을 수동으로 만들고, `yarn build:site-data`로 `docs/characters/**`·`static/site-data.json`·fusion-toc 갱신.
4. `cd ~/git/twiki && yarn build` 로컬 검증.
5. `docs/` + `data.lock` + `static/site-data.json` 함께 커밋.

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
# upstream push 확인 후
cd ~/git/twiki && git pull
yarn build:site-data          # docs/characters/** + static/site-data.json + intro.mdx fusion-toc
yarn start                    # 미리보기
git add docs/ _data/site-source/data.lock static/site-data.json
git commit -m "regen: new data" && git push
```

## MDX 재생성
- twiki-owned 파생물(`docs/characters/**`, `static/site-data.json`, intro.mdx fusion-toc)은 `yarn build:site-data`로만 갱신.
- 큐레이션된 intro.mdx 본문(줄거리·스펠카드·대사)은 upstream에서 관리 — twiki에서 직접 수정하지 않는다.

## 의존성 (CI에서 보장)
- node 22.x, yarn 1.22.x
- Python은 **로컬 개발용**. CI/CD 경로에서는 절대 사용하지 않는다.

## docs/는 생성 파일
- `docs/` 직접 편집 금지. upstream 큐레이션 + `yarn build:site-data`로만 갱신.

## data.lock
- upstream push 시 `_data/site-source/data.lock` 자동 갱신. 반드시 같이 커밋.
- `_data/site-source/data.lock` 없이 `docs/` 변경만 커밋 시 pre-commit hook이 차단.

## 롤백 절차
1. `git revert <bad-commit>` **단독**. revert 후 twiki-owned 파생물이 필요하면 `yarn build:site-data`로만 재생성.

## 하네스: twiki-structure

**목표:** twiki 정보 구조(IA) 진단 → 5개 후보 설계 → 리뷰 → HTML 프로토타입 파이프라인

**트리거:** "구조 바꿔줘", "IA 리디자인", "위키 구조 분석", "navigation 설계", "구조 프로토타입", "후보 비교" 요청 시 `twiki-structure` 스킬을 사용하라.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-08-22 | 초기 구성 | 전체 | IA 리디자인 요청 |
| 2026-08-23 | push 전환 | 전체 | upstream coupling 제거, snapshot push |
