// 실습 내용은 이 파일만 바꾸면 됩니다.
// 문장 속 "[]"가 빈칸입니다.

export const WORKSHOP = {
  title: "고객 지향성 실습",
  courseTitle: "민원응대 마인드셋",
  instructor: "보람 강사",
  scenario: "인카금융 영업관리직 고객지향성 응대 상황",
};

// 조 목록
export const GROUPS = Array.from({ length: 10 }, (_, i) => `${i + 1}조`);

export const STEPS = [
  { title: "개인이 빈칸을 먼저 작성해 봅니다.", minutes: 5 },
  { title: "팀원과 비교해 봅니다.", minutes: 5 },
  { title: "팀이 결정한 최선의 답안을 정리합니다.", minutes: 0 },
  { title: "함께 공유합니다.", minutes: 0 },
];

export type ExampleItem = { text: string; answers?: string[] };

// 예시: 중국집에서 짜장면 시키기 (빨간 글씨 답안 포함)
export const EXAMPLE = {
  title: "중국집에서 짜장면 시키기",
  items: [
    { text: "주문대로 짜장면을 제공한다." },
    { text: "고춧가루가 뿌려진 짜장면, 계란 프라이를 추가한 짜장면 등 다양하고 복잡한 요구에 적절하게 대응한다." },
    { text: "고객 식사 중 [] 부족한가를 확인하여 [] 제공한다.", answers: ["반찬이 / 단무지가", "요청 전에 / 새 그릇에 담아"] },
    { text: "장거리 고객 주문 시에는 [].", answers: ["면이 불 것을 대비하여 다른 방법 / 다른 지점을 소개한다"] },
    { text: "인원수에 비해 많은 양을 주문하는 경우 [].", answers: ["주문 내용을 재확인 / 드셔 보신 후 추가할 것을 권유한다"] },
    { text: "단품 메뉴와 요리를 함께 주문하는 경우 [].", answers: ["세트 메뉴로 묶어 할인을 받도록 안내한다"] },
    { text: "요리 메뉴가 남은 경우 [], [].", answers: ["요청 전", "포장을 원하는지 물어본다"] },
  ] as ExampleItem[],
};

export type Item = { id: string; text: string };

export const ITEMS: Item[] = [
  { id: "q1", text: "새로 출근한 FA(설계사)가 사무실에 들어서며 두리번거리는 경우 [] 하고 [] 한다." },
  { id: "q2", text: "자리를 비운 담당자에게 FA의 전화가 오면 전화를 [] , [] 한다." },
  { id: "q3", text: "FA가 문의하는 시책이나 업무를 즉시 알 수 없는 경우 [] 확인하고, [] 한다." },
  { id: "q4", text: "디지털 기기에 익숙하지 않은 FA가 시스템 사용에 어려움을 겪을 경우, [] 한다." },
  { id: "q5", text: "인카 시스템(영업지원 포털 등) 이용 중 FA가 멈추거나 어려워하는 기색이 보이면, [] 하고 상황에 맞는 적절한 도움을 준다." },
  { id: "q6", text: "사무실에 들어오는 FA와 눈이 마주치면, [] 하지 않고 [] 한다." },
  { id: "q7", text: "점심시간이나 공백으로 응대가 지연될 경우, 회의 등으로 즉시 도움을 줄 수 없는 경우, 대기 중인 FA에게 [] 하고 [] 한다." },
  { id: "q8", text: "계약 서류나 시책 신청 서류를 누락한 FA에게 [] 하고, 바쁘다고 하는 경우 [] ." },
  { id: "q9", text: "조건을 충족하지 않았는데 자꾸만 DB를 요구하는 FA의 경우 [] , [] 한다." },
];

export const BLANK_MAX = 300;

// 문장을 글자 조각과 빈칸으로 나눔
export function splitBlanks(text: string) {
  return text.split("[]");
}
export function blankCount(text: string) {
  return splitBlanks(text).length - 1;
}

export type Answers = Record<string, string[]>; // 문항 id → 빈칸별 답

export type PersonalAnswer = {
  id: string;
  name: string;
  group: string;
  answers: Answers;
  updatedAt: string;
};

export type TeamAnswer = {
  group: string;
  answers: Answers;
  editor: string;
  updatedAt: string;
};

export function cleanAnswers(input: unknown): Answers {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const out: Answers = {};
  for (const item of ITEMS) {
    const arr = Array.isArray(src[item.id]) ? (src[item.id] as unknown[]) : [];
    out[item.id] = Array.from({ length: blankCount(item.text) }, (_, i) =>
      typeof arr[i] === "string" ? (arr[i] as string).trim().slice(0, BLANK_MAX) : "",
    );
  }
  return out;
}

export function filledCount(answers: Answers) {
  return ITEMS.filter((item) => (answers[item.id] ?? []).some((v) => v.trim())).length;
}

// 빈칸에 답을 넣은 완성 문장
export function fillSentence(text: string, values: string[] = []) {
  const parts = splitBlanks(text);
  return parts.map((p, i) => (i < parts.length - 1 ? `${p}${values[i]?.trim() ? `「${values[i].trim()}」` : "____"}` : p)).join("");
}
