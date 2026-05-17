# twiki

**Touhou Korean Wiki** — 한국어 동방 위키 (Docusaurus 기반)

[`t-skt/tdata`](https://github.com/t-skt/tdata)의 SSOT 데이터를 기반으로 생성되는 정적 사이트.

## 빠른 시작

```bash
# 사전: ~/git/tdata/ 와 ~/git/twiki/ 가 sibling 경로에 클론되어 있어야 함
cd ~/git/twiki
yarn install
yarn start                    # 로컬 미리보기
```

## MDX 재생성 (콘텐츠 갱신)

```bash
cd ~/git/tdata
python scripts/generate.py --game th06   # ../twiki/docs/ 갱신
cd ~/git/twiki
yarn build                                # 빌드 검증
git add docs/ tdata.lock && git commit -m "regen: ..."
```

## 구조

```
twiki/
├── docs/                # 생성 파일 (직접 편집 금지)
├── src/components/      # 위키 전용 컴포넌트
├── static/img/          # 이미지 에셋 (twiki가 owner)
├── tdata.lock           # tdata commit SHA + schema version
└── .github/workflows/   # node 22 + yarn build + Pages 배포
```

## 운영 가이드

- 운영 매뉴얼은 [`CLAUDE.md`](./CLAUDE.md) 참조
- `docs/**/*.mdx` 직접 편집 금지 — `tdata/scripts/generate.py`가 덮어쓴다
- 인터랙티브 장난감/게임은 [`t-skt/tvirus`](https://github.com/t-skt/tvirus)에 있음

## 라이선스

Copyleft @ Team SKT
