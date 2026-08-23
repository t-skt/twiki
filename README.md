# twiki

**Touhou Korean Wiki** — 한국어 동방 위키 (Docusaurus 3.x 기반 정적 사이트)

게임·캐릭터·음악 데이터를 구조화된 정적 페이지로 렌더링한다. 홈 허브(통합 검색 + 장르별/연도순 뷰), 캐릭터 마스터(출연작 크로스링크), 게임 지도(intro 목차)로 구성된다.

## 빠른 시작

```bash
yarn install
yarn start          # 로컬 미리보기 (http://localhost:3000/twiki/)
yarn build          # 프로덕션 빌드 → build/
```

## 파생 콘텐츠 재생성

홈·캐릭터 마스터·게임 지도 목차는 `scripts/build-site-data.mjs`가 상위 데이터 소스에서 도출해 생성한다.

```bash
yarn build:site-data   # static/site-data.json + docs/characters/** + intro.mdx 목차 블록 재생성
yarn build             # prebuild가 build:site-data를 자동 실행 후 빌드
```

생성 산출물은 전부 커밋되어 있어, 빌드만으로도 사이트가 재현된다. `yarn build`는 항상 성공한다.

## 구조

```
twiki/
├── docs/                     # 콘텐츠 (mdx)
│   ├── shooting|fighting|side/   # 게임별 (intro·dialogue·spell-cards·music·characters)
│   ├── characters/             # 캐릭터 마스터 (build:site-data 생성)
│   └── music/                  # 앨범
├── scripts/build-site-data.mjs   # 파생 콘텐츠 빌더
├── src/components/           # 위키 전용 컴포넌트
├── static/site-data.json     # 홈/마스터용 도출 데이터 (커밋)
├── sidebars.ts               # 게임별 + 캐릭터 sidebar
└── .github/workflows/        # node 22 + yarn build + Pages 배포
```

## 사이트 계층

| 층 | 내용 | 위치 |
|----|------|------|
| L0 | 홈 허브 — 통합 검색 + [장르별\|연도순] 토글 + 카드 | `/` |
| L1 | 캐릭터 마스터 — 출연작 크로스링크 | `/docs/characters/<id>` |
| L2 | 게임 지도 — intro 목차(스토리/스펠카드/OST/캐릭터) | `/docs/<장르>/<게임>/intro` |
| L3 | 심화 페이지 — 대사·스펠카드·음악·프로필 | `/docs/<장르>/<게임>/…` |
| L4 | 음악 — 앨범 | `/docs/music/<slug>` |

## 운영 가이드

- 상세 운영 매뉴얼(데이터 갱신 절차, 커밋 규칙, 훅 동작)은 [`CLAUDE.md`](./CLAUDE.md) 참조
- `docs/**/*.mdx` 직접 편집은 자제 — 대부분 파생 산출물
- 인터랙티브 장난감/게임은 [`t-skt/tvirus`](https://github.com/t-skt/tvirus)에 있음

## 라이선스

이미지: ZUN/Team Shanghai Alice ([LICENSE-IMAGES.md](LICENSE-IMAGES.md) 참조).

## 관련 레포

- 인터랙티브 장난감: [t-skt/tvirus](https://github.com/t-skt/tvirus)
