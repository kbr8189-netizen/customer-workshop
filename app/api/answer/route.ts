import { randomUUID } from "node:crypto";
import { personalKey } from "@/lib/keys";
import { readJson, writeJson } from "@/lib/store";
import { GROUPS, cleanAnswers, type PersonalAnswer } from "@/lib/workshop";

// 개인 답안 저장 (처음이면 id 발급, 이후 같은 id로 덮어쓰기)
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    id?: unknown;
    name?: unknown;
    group?: unknown;
    answers?: unknown;
  } | null;
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 30) : "";
  const group = typeof body?.group === "string" ? body.group : "";
  if (!name || !GROUPS.includes(group)) {
    return Response.json({ error: "이름과 조를 확인해주세요." }, { status: 400 });
  }

  let id = typeof body?.id === "string" ? body.id : "";
  if (id && !personalKey(id)) id = "";
  if (!id) id = randomUUID();

  const record: PersonalAnswer = {
    id,
    name,
    group,
    answers: cleanAnswers(body?.answers),
    updatedAt: new Date().toISOString(),
  };
  try {
    await writeJson(personalKey(id)!, record);
    return Response.json({ record });
  } catch (e) {
    console.error("save personal failed", e);
    return Response.json({ error: "저장 중 문제가 생겼어요. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const key = personalKey(new URL(request.url).searchParams.get("id") ?? "");
  if (!key) return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  const record = await readJson<PersonalAnswer>(key);
  return record ? Response.json({ record }) : Response.json({ error: "없음" }, { status: 404 });
}
