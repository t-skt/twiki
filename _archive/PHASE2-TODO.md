# Phase 2 — twiki Docusaurus 이전

> Phase 1 (레포 부트스트랩) 완료 후 다음 작업.

## 사전 조건
- `_data/site-source/` snapshot 준비 완료 ✅
- `~/git/touhouwiki-kr/` 기존 Docusaurus 프로젝트 존재
- snapshot의 `games.json` 등이 존재해야 파생물 빌드 가능
  - 단순 Docusaurus 스캐폴딩만 먼저 끝내고 generate는 나중에 해도 OK

## 작업 목록

### A. touhouwiki-kr 복사 + 정리
- [ ] `rsync -av --exclude='node_modules' --exclude='.git' --exclude='build' ~/git/touhouwiki-kr/ ./`
- [ ] 장난감 컴포넌트 제거:
  ```bash
  rm -rf src/components/CirnoDonation \
         src/components/DanmakuDodge \
         src/components/GachaGame \
         src/components/Shisensho \
         src/components/CharacterTool \
         src/components/ReplayScoreboard \
         src/components/IntroduceForm \
         src/components/TouhouVoteChart \
         src/components/TouhouFavoritesChart \
         src/components/HomepageFeatures
  ```
- [ ] 데이터/스크립트 제거: `rm -rf data/ scripts/`
- [ ] `docs/` 비우기 (클린 슬레이트): `rm -rf docs/* && mkdir -p docs`
- [ ] v3 컴포넌트 루트로 승격: `mv src/components/v3/*.tsx src/components/v3/*.ts src/components/ && rmdir src/components/v3`

### B. 설정 정리
- [ ] `docusaurus.config.ts`에서 toy/v3 sidebar 항목 제거
- [ ] `docusaurus.config.ts`의 `editUrl` → `https://github.com/t-skt/twiki/tree/main/`
- [ ] `docusaurus.config.ts`의 `url` → `https://t-skt.github.io`, `baseUrl` → `/twiki/`
- [ ] `docusaurus.config.ts`의 `organizationName` → `t-skt`, `projectName` → `twiki`
- [ ] `sidebars.ts` 재작성 (새 docs/ 구조에 맞게)
- [ ] `package.json`의 `name`, `repository` 갱신

### C. 첫 파생물 빌드 (snapshot 의존)
- [ ] `_data/site-source/` snapshot 확인 후 `yarn build:site-data`
- [ ] 결과: `docs/characters/**`, `static/site-data.json`, `data.lock` 갱신됨
- [ ] `yarn install && yarn build` 0 errors 확인
- [ ] `yarn start`로 th06 페이지 정상 렌더 확인

### D. CI / 배포
- [ ] `.github/workflows/deploy.yml` 작성 (node 22 + yarn build + GitHub Pages, Python 0줄)
- [ ] `.pre-commit-config.yaml` 작성 (data.lock + docs 동시 커밋 강제)
- [ ] GitHub Pages 설정 (Settings → Pages → Source: GitHub Actions)

## 수용 기준 (Step 2 완료)
- `yarn build` 0 errors, 0 broken links
- th06 페이지 GitHub Pages 정상 배포
- CI 빌드 시간 < 기존 touhouwiki-kr 평균

## 다음 세션 시작 프롬프트 (참고)
```
PHASE2-TODO.md 의 A-D 순서로 작업해줘.
docs/는 직접 편집 금지 (upstream 큐레이션 + build:site-data가 owner).
편집은 src/components/, docusaurus.config.ts, sidebars.ts, package.json 위주.
```
