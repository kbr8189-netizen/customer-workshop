import { PERSONAL_PREFIX, teamKey } from "@/lib/keys";
import { listJson, readJson, writeJson } from "@/lib/store";
import { cleanAnswers, type PersonalAnswer, type TeamAnswer } from "@/lib/workshop";

export const dynamic = "force-dynamic";

// 같은 조의 개인 답안과 팀 답안
export async function GET(request: Request) {
  const group = new URL(request.url).searchParams.get("group") ?? "";
  const key = teamKey(group);
  if (!key) return Response.json({ error: "조를 확인해주세요." }, { status: 400 });
  try {
    const [members, team] = await Promise.all([
      listJson<PersonalAnswer>(PERSONAL_PREFIX),
      readJson<TeamAnswer>(key),
    ]);
    return Response.json({
      members: members.filter((m) => m.group === group).sort((a, b) => a.name.localeCompare(b.name, "ko")),
      team,
    });
  } catch (e) {
    console.error("team read failed", e);
    return Response.json({ error: "불러오지 못했어요." }, { status: 500 });
  }
}

// 팀 최선 답안 저장 (조별 1개, 마지막 저장이 반영)
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    group?: unknown;
    editor?: unknown;
    answers?: unknown;
  } | null;
  const group = typeof body?.group === "string" ? body.group : "";
  const key = teamKey(group);
  if (!key) return Response.json({ error: "조를 확인해주세요." }, { status: 400 });
  const record: TeamAnswer = {
    group,
    editor: typeof body?.editor === "string" ? body.editor.trim().slice(0, 30) : "",
    answers: cleanAnswers(body?.answers),
    updatedAt: new Date().toISOString(),
  };
  try {
    await writeJson(key, record);
    return Response.json({ record });
  } catch (e) {
    console.error("team save failed", e);
    return Response.json({ error: "저장하지 못했어요." }, { status: 500 });
  }
}

