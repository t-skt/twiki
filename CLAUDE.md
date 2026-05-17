# twiki — Touhou Wiki (한국어, Public)

## 레포 목적
- Docusaurus 3.x 기반 위키. 한국어 동방 프로젝트 정보 정리.
- **콘텐츠는 `../tdata/db/`에서 생성된다.** 이 레포에서 데이터를 만들지 않는다.

## 절대 금지 사항
- ❌ `docs/**/*.mdx`를 손으로 편집하지 마라. **tdata/scripts/generate.py가 덮어쓴다.**
  - 예외: 별도 편집이 필요하면 `docs/_manual/` 디렉토리(generate 대상 외)에 두고 sidebar에 명시.
- ❌ `src/components/`에 장난감/인터랙티브 게임 추가하지 마라. 그건 `t-skt/tvirus`다.
- ❌ Python 의존성을 CI(`.github/workflows/`)에 넣지 마라. 빌드는 node만.

## 새 게임/캐릭터 추가 절차
1. `t-skt/tdata` 레포에서 데이터 추가 (별도 PR).
2. tdata main에 머지 후, 로컬에서 `cd ~/git/tdata && python scripts/generate.py --game th21`.
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
python scripts/generate.py   # ../twiki/docs/ 갱신

cd ~/git/twiki
yarn start                    # 미리보기
git add docs/ tdata.lock && git commit -m "regen: th21 added" && git push
```

## MDX 재생성
- MDX 재생성은 `cd ~/git/tdata && python scripts/generate.py --game <th번호>`
- 새 게임 추가 → tdata에서 작업 후 generate.py 실행 → 이 레포로 돌아와 `docs/` + `tdata.lock` 커밋.

## 의존성 (CI에서 보장)
- node 22.x, yarn 1.22.x
- Python은 **로컬 개발용**. CI/CD 경로에서는 절대 사용하지 않는다.

## docs/는 생성 파일
- `docs/` 직접 편집 금지. `tdata/scripts/generate.py`로만 갱신.

## tdata.lock
- `generate.py` 실행 시 `tdata.lock` 자동 갱신. 반드시 같이 커밋.
- `tdata.lock` 없이 `docs/` 변경만 커밋 시 pre-commit hook이 차단.

## 롤백 절차
1. `git revert <bad-commit>` 후 tdata에서 `python scripts/generate.py --all` 재실행 → twiki docs/ 갱신.
