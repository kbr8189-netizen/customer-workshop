"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, ClipboardList, Eye, EyeOff, ListChecks, PencilLine, RefreshCw, Users } from "lucide-react";
import { BlankInputs, Sentence } from "@/components/BlankItem";
import {
  EXAMPLE,
  GROUPS,
  ITEMS,
  STEPS,
  WORKSHOP,
  filledCount,
  type Answers,
  type PersonalAnswer,
  type TeamAnswer,
} from "@/lib/workshop";

type Tab = "guide" | "example" | "mine" | "team";
const TABS: { id: Tab; label: string; icon: typeof BookOpen }[] = [
  { id: "guide", label: "진행 안내", icon: ListChecks },
  { id: "example", label: "예시", icon: BookOpen },
  { id: "mine", label: "개인 작성", icon: PencilLine },
  { id: "team", label: "팀 답안", icon: Users },
];

const KEY = "co_profile_v1";
type Profile = { id?: string; name: string; group: string; answers: Answers; savedAt?: string };

function emptyAnswers(): Answers {
  return Object.fromEntries(ITEMS.map((i) => [i.id, []]));
}
function load(): Profile | null {
  try {
    const v = localStorage.getItem(KEY);
    return v ? (JSON.parse(v) as Profile) : null;
  } catch {
    return null;
  }
}
function persist(p: Profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

const btn = "rounded-xl border-2 font-bold shadow-sm transition";
const btnOn = "border-blue-700 bg-blue-700 text-white";
const btnOff = "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700";

export default function Home() {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<Tab>("guide");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const p = load();
    setProfile(p);
    if (!p) setEditing(true);
    setReady(true);
  }, []);

  function update(p: Profile) {
    setProfile(p);
    persist(p);
  }

  if (!ready) return null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold tracking-wide text-blue-700">{WORKSHOP.courseTitle}</div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{WORKSHOP.title}</h1>
        </div>
        {profile && !editing && (
          <button onClick={() => setEditing(true)} className={`${btn} ${btnOff} shrink-0 px-3 py-2 text-sm`}>
            {profile.group} · {profile.name}
          </button>
        )}
      </header>

      {editing || !profile ? (
        <ProfileForm
          initial={profile}
          onSave={(name, group) => {
            update({ ...(profile ?? { answers: emptyAnswers() }), name, group });
            setEditing(false);
          }}
        />
      ) : (
        <>
          <nav className="mb-5 grid grid-cols-4 gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  window.scrollTo({ top: 0 });
                }}
                className={`${btn} flex flex-col items-center justify-center gap-1 px-1 py-2.5 text-xs sm:flex-row sm:text-sm ${tab === t.id ? btnOn : btnOff}`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </nav>

          {tab === "guide" && <Guide onStart={() => setTab("mine")} />}
          {tab === "example" && <Example />}
          {tab === "mine" && <Mine profile={profile} onChange={update} onDone={() => setTab("team")} />}
          {tab === "team" && <Team profile={profile} />}
        </>
      )}
    </main>
  );
}

function ProfileForm({ initial, onSave }: { initial: Profile | null; onSave: (name: string, group: string) => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [group, setGroup] = useState(initial?.group ?? "");
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-slate-700">이름과 조를 입력하면 실습을 시작할 수 있어요. 같은 조원끼리 답안을 비교하고 팀 답안을 함께 정리합니다.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-slate-700">이름</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-600"
            value={name}
            maxLength={30}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
          />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-700">조</span>
          <select
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-600"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="">선택하세요</option>
            {GROUPS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
      </div>
      <button
        disabled={!name.trim() || !group}
        onClick={() => onSave(name.trim(), group)}
        className="mt-5 w-full rounded-xl bg-blue-700 py-3.5 text-lg font-bold text-white hover:bg-blue-800 disabled:opacity-40"
      >
        시작하기
      </button>
    </section>
  );
}

function Guide({ onStart }: { onStart: () => void }) {
  return (
    <section className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-bold text-blue-700">오늘의 상황</div>
        <div className="mt-1 text-lg font-extrabold">{WORKSHOP.scenario}</div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          민원인의 요구를 먼저 알아차리고, 요청 전에 한 걸음 더 다가가는 행동을 내 말로 자유롭게 적어 봅니다.
        </p>
      </div>
      {STEPS.map((s, i) => (
        <div key={s.title} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-700 text-lg font-extrabold text-white">
            {i + 1}
          </span>
          <div className="font-bold text-slate-800">
            {s.title}
            {s.minutes > 0 && <span className="ml-2 text-sm font-medium text-slate-500">({s.minutes}분)</span>}
          </div>
        </div>
      ))}
      <button onClick={onStart} className="w-full rounded-xl bg-blue-700 py-3.5 font-bold text-white hover:bg-blue-800">
        개인 작성 시작하기
      </button>
    </section>
  );
}

function Example() {
  const [shown, setShown] = useState<Record<number, boolean>>({});
  const all = EXAMPLE.items.every((it, i) => !it.answers || shown[i]);
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="font-extrabold">예시 · {EXAMPLE.title}</div>
        <button
          onClick={() => setShown(all ? {} : Object.fromEntries(EXAMPLE.items.map((_, i) => [i, true])))}
          className={`${btn} ${btnOff} flex shrink-0 items-center gap-1 whitespace-nowrap px-3 py-2 text-sm`}
        >
          {all ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {all ? "정답 숨기기" : "정답 보기"}
        </button>
      </div>
      {EXAMPLE.items.map((it, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex gap-2">
            <span className="font-extrabold text-blue-700">{i + 1}.</span>
            <Sentence text={it.text} values={shown[i] ? it.answers : undefined} highlight="bg-rose-50 text-rose-700" />
          </div>
          {it.answers && (
            <button
              onClick={() => setShown({ ...shown, [i]: !shown[i] })}
              className="mt-2 text-sm font-bold text-blue-700 hover:underline"
            >
              {shown[i] ? "정답 숨기기" : "정답 보기"}
            </button>
          )}
        </div>
      ))}
    </section>
  );
}

function Mine({ profile, onChange, onDone }: { profile: Profile; onChange: (p: Profile) => void; onDone: () => void }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(profile.savedAt ? "saved" : "idle");
  const [error, setError] = useState("");

  async function save() {
    setStatus("saving");
    setError("");
    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: profile.id, name: profile.name, group: profile.group, answers: profile.answers }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "저장하지 못했어요.");
      const rec = data.record as PersonalAnswer;
      onChange({ ...profile, id: rec.id, savedAt: rec.updatedAt });
      setStatus("saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장하지 못했어요.");
      setStatus("error");
    }
  }

  return (
    <section className="space-y-3">
      <div className="rounded-2xl bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">
        <b>{WORKSHOP.scenario}</b>
        <br />
        정답은 없어요. 빈칸에 들어갈 행동을 내 생각대로 자유롭게 적어 보세요. 다 쓰면 아래 <b>내 답안 저장</b>을 눌러야 팀원에게 보입니다.
      </div>
      {ITEMS.map((item, i) => (
        <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex gap-2">
            <span className="font-extrabold text-blue-700">{i + 1}.</span>
            <Sentence text={item.text} />
          </div>
          <BlankInputs
            text={item.text}
            values={profile.answers[item.id] ?? []}
            onChange={(v) => {
              onChange({ ...profile, answers: { ...profile.answers, [item.id]: v } });
              setStatus("idle");
            }}
          />
        </div>
      ))}
      {error && <div className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</div>}
      <div className="sticky bottom-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
        <span className="text-sm font-bold text-slate-600">
          {filledCount(profile.answers)} / {ITEMS.length} 작성
        </span>
        <button
          onClick={save}
          disabled={status === "saving"}
          className="ml-auto rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {status === "saving" ? "저장 중…" : status === "saved" ? "저장됨 ✓" : "내 답안 저장"}
        </button>
        {status === "saved" && (
          <button onClick={onDone} className={`${btn} ${btnOff} px-4 py-2.5 text-sm`}>
            팀 답안으로
          </button>
        )}
      </div>
    </section>
  );
}

function Team({ profile }: { profile: Profile }) {
  const [members, setMembers] = useState<PersonalAnswer[]>([]);
  const [team, setTeam] = useState<TeamAnswer | null>(null);
  const [draft, setDraft] = useState<Answers>(emptyAnswers());
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const draftLoaded = useRef(false);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/team?group=${encodeURIComponent(profile.group)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMembers(data.members);
      setTeam(data.team);
      // 작성 중인 팀 답안을 덮어쓰지 않도록 처음 한 번만 불러옴
      if (data.team && !draftLoaded.current) setDraft(data.team.answers);
      draftLoaded.current = true;
    } catch {
      setError("조원 답안을 불러오지 못했어요. 새로고침을 눌러 주세요.");
    } finally {
      setLoading(false);
    }
  }, [profile.group]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  async function save() {
    setStatus("saving");
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group: profile.group, editor: profile.name, answers: draft }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error();
      setTeam(data.record);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">
        <div>
          <b>{profile.group}</b> 조원 {members.length}명의 답안입니다. 비교한 뒤 팀이 고른 최선의 답을 정리해 저장하세요.
          {team && (
            <div className="mt-1 text-xs text-blue-700">
              팀 답안 마지막 저장: {team.editor} · {new Date(team.updatedAt).toLocaleTimeString("ko-KR")}
            </div>
          )}
        </div>
        <button onClick={loadTeam} className={`${btn} ${btnOff} flex shrink-0 items-center gap-1 px-3 py-2 text-sm`}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> 새로고침
        </button>
      </div>
      {error && <div className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</div>}

      {ITEMS.map((item, i) => (
        <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex gap-2">
            <span className="font-extrabold text-blue-700">{i + 1}.</span>
            <Sentence text={item.text} />
          </div>
          <ul className="mt-3 space-y-1.5">
            {members.map((m) => (
              <li key={m.id} className="flex gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="w-16 shrink-0 font-bold text-slate-600">{m.name}</span>
                <span className="text-slate-800">
                  {(m.answers[item.id] ?? []).some((v) => v.trim())
                    ? (m.answers[item.id] ?? []).map((v) => v.trim() || "—").join(" / ")
                    : <span className="text-slate-400">미작성</span>}
                </span>
              </li>
            ))}
            {!members.length && !loading && <li className="text-sm text-slate-400">아직 저장한 조원이 없어요.</li>}
          </ul>
          <div className="mt-3 flex items-center gap-2 text-sm font-bold text-blue-800">
            <ClipboardList className="h-4 w-4" /> 팀 최선 답안
          </div>
          <BlankInputs text={item.text} values={draft[item.id] ?? []} onChange={(v) => { setDraft({ ...draft, [item.id]: v }); setStatus("idle"); }} />
        </div>
      ))}

      <div className="sticky bottom-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
        <span className="text-xs text-slate-500">팀 답안은 조마다 하나이며, 마지막에 저장한 내용이 반영돼요.</span>
        <button
          onClick={save}
          disabled={status === "saving"}
          className="ml-auto shrink-0 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {status === "saving" ? "저장 중…" : status === "saved" ? "저장됨 ✓" : "팀 답안 저장"}
        </button>
      </div>
      {status === "error" && <div className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">저장하지 못했어요. 다시 눌러 주세요.</div>}
    </section>
  );
}
