import { isAdmin } from "@/lib/auth";
import { PERSONAL_PREFIX, TEAM_PREFIX, personalKey, teamKey } from "@/lib/keys";
import { listJson, removeJson } from "@/lib/store";
import type { PersonalAnswer, TeamAnswer } from "@/lib/workshop";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try {
    const [personal, teams] = await Promise.all([
      listJson<PersonalAnswer>(PERSONAL_PREFIX),
      listJson<TeamAnswer>(TEAM_PREFIX),
    ]);
    return Response.json({ personal, teams });
  } catch (e) {
    console.error("admin read failed", e);
    return Response.json({ error: "불러오지 못했습니다." }, { status: 500 });
  }
}

// ?personal=<id> 또는 ?team=<조>
export async function DELETE(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const sp = new URL(request.url).searchParams;
  const key = sp.has("personal") ? personalKey(sp.get("personal")!) : teamKey(sp.get("team") ?? "");
  if (!key) return Response.json({ error: "잘못된 요청입니다." }, { status: 400 });
  try {
    await removeJson(key);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("delete failed", e);
    return Response.json({ error: "삭제하지 못했습니다." }, { status: 500 });
  }
}
