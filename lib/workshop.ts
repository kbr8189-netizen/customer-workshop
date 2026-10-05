// 실습 내용은 이 파일만 바꾸면 됩니다.
// 문장 속 "[]"가 빈칸입니다.

export const WORKSHOP = {
  title: "고객 지향성 실습",
  courseTitle: "민원응대 마인드셋",
  instructor: "보람 강사",
  scenario: "구청 민원응대 상황",
};

// 조 목록
export const GROUPS = Array.from({ length: 10 }, (_, i) => `${i + 1}조`);

export const STEPS = [
  { title: "개인이 빈칸을 먼저 작성해 봅니다.", minutes: 5 },
  { title: "팀원과 비교해 봅니다.", minutes: 5 },
  { title: "팀이 결정한 최선의 답안을 정리합니다.", minutes: 0 },
  { title: "함께 공유합니다.", minutes: 0 },
];

export type Item = { id: string; text: string };

export const ITEMS: Item[] = [
  { id: "q1", text: "청사를 들어서며 두리번거리는 민원인을 발견하면 [] 하고 [] 한다." },
  { id: "q2", text: "부재중인 동료의 의자가 돌아가 있거나 전화가 울리면 [], [] 한다." },
  { id: "q3", text: "민원인이 묻는 업무나 담당자의 자리를 모를 경우 [] 확인하고, [] 한다." },
  { id: "q4", text: "고령의 민원인이 업무처리 지연으로 대기 시 [] 한다." },
  { id: "q5", text: "자동민원발급기를 이용하는 고객이 재차 데스크를 바라보며 갸우뚱거리는 경우, [] 하고 [] 적절한 도움을 준다." },
  { id: "q6", text: "청사로 들어오는 민원인과 눈이 마주치면, [] 하고 [] 한다." },
  { id: "q7", text: "점심시간 교대근무로 대기가 길어진 민원인에게 [] 하고 [] 한다." },
  { id: "q8", text: "신분증이나 서류를 미비한 고객에게 [] 하고, [] 한다." },
  { id: "q9", text: "비치된 서류를 잘 찾지 못하는 고령의 민원인의 경우 [] 하고 [] 한다." },
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
