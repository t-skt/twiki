// 대사집 overview 카드용 hue 도우미.
// characterColors.ts의 CHARACTER_COLORS(hue,sat)를 재사용하되,
// overview의 h3 텍스트(한글 이름, 예: "마리사")로도 lookup 가능하도록
// 한글→slug 역매핑을 가진다. getCharacterTheme는 slug/avatar 기준이라
// 한글 이름만으로는 fallback hash에 떨어질 수 있기 때문.
import { CHARACTER_COLORS, hexFromHSL, FALLBACK_HUES } from "./characterColors";

// 한글 이름 → CHARACTER_COLORS slug. overview h3는 "마리사"/"레이무" 형태.
// th17 route별("마리사 (A)")은 괄호 앞 부분으로 매칭.
const KO_TO_SLUG: Record<string, string> = {
  // th06
  마리사: "marisa_kirisame",
  레이무: "reimu_hakurei",
  치르노: "cirno",
  루미아: "rumia",
  "홍 메이링": "hong_meiling",
  "파츄리 널릿지": "patchouli_knowledge",
  "이자요이 사쿠야": "sakuya_izayoi",
  "레밀리아 스칼렛": "remilia_scarlet",
  "플랑드르 스칼렛": "flandre_scarlet",
  대요정: "daiyousei",
  코아쿠마: "koakuma",
  // th18
  "코치야 사나에": "sanae_kochiya",
  사나에: "sanae_kochiya",
  사쿠야: "sakuya_izayoi",
  // th17
  "콘파쿠 요우무": "youmu_konpaku",
  요우무: "youmu_konpaku",
  // th20
  "미치가미 나루코": "nareko_michigami",
  나루코: "nareko_michigami",
  "와타츠키 토요히메": "watatsuki_toyohime",
  토요히메: "watatsuki_toyohime",
};

export interface CardTheme {
  hue: number;
  sat: number;
  text: string;
  border: string;
  soft: string;
  textDark: string;
  borderDark: string;
  softDark: string;
}

function hashHue(name: string): [number, number] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return [FALLBACK_HUES[Math.abs(hash) % FALLBACK_HUES.length], 50];
}

// "마리사 (A)" → "마리사" (route별 괄호 제거 후 매칭)
function baseName(name: string): string {
  return name.replace(/\s*\([A-Za-z0-9]+\)\s*$/, "").trim();
}

export function getCardTheme(name: string): CardTheme {
  const slug = KO_TO_SLUG[baseName(name)] ?? KO_TO_SLUG[name.trim()];
  const mapping = slug ? CHARACTER_COLORS[slug] : undefined;
  const [hue, sat] = mapping ?? hashHue(name);
  return {
    hue,
    sat,
    text: hexFromHSL(hue, sat, 30),
    border: hexFromHSL(hue, sat, 50),
    soft: hexFromHSL(hue, Math.min(sat + 10, 90), 95),
    textDark: hexFromHSL(hue, Math.min(sat, 70), 72),
    borderDark: hexFromHSL(hue, Math.min(sat, 65), 45),
    softDark: hexFromHSL(hue, Math.max(sat - 25, 10), 14),
  };
}

// 링크 파일명 → 대사 유형 라벨
export function dialogueTypeFromFile(file: string): string {
  const f = file.toLowerCase();
  if (f.includes("ending")) return "엔딩";
  if (f.includes("scenario")) return "시나리오";
  if (f.includes("extra")) return "엑스트라";
  if (f.includes("script")) return "스크립트";
  return "대사";
}
