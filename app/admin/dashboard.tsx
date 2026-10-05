"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, LogOut, Maximize2, Minimize2, Pause, Play, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { Sentence } from "@/components/BlankItem";
import { GROUPS, ITEMS, STEPS, WORKSHOP, filledCount, type PersonalAnswer, type TeamAnswer } from "@/lib/workshop";

type View = "share" | "personal" | "status";
const btn = "rounded-xl border-2 font-bold shadow-sm transition";
const btnOn = "border-blue-700 bg-blue-700 text-white";
const btnOff = "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700";

function csvCell(v: unknown) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function joinAnswer(values?: string[]) {
  return (values ?? []).map((v) => v.trim() || "—").join(" / ");
}
function hasAnswer(values?: string[]) {
  return (values ?? []).some((v) => v.trim());
}

export default function Dashboard() {
  const [personal, setPersonal] = useState<PersonalAnswer[]>([]);
  const [teams, setTeams] = useState<TeamAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [auto, setAuto] = useState(true);
  const [view, setView] = useState<View>("share");
  const [item, setItem] = useState<number | null>(0);
  const [big, setBig] = useState(false);
  const [group, setGroup] = useState(GROUPS[0]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/data", { cache: "no-store" });
    if (res.status === 401) return window.location.reload();
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || "불러오지 못했습니다.");
    else {
      setError("");
      setPersonal(data.personal);
      setTeams(data.teams);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [auto, load]);

  const teamByGroup = useMemo(() => Object.fromEntries(teams.map((t) => [t.group, t])), [teams]);
  const activeGroups = GROUPS.filter((g) => teamByGroup[g] || personal.some((p) => p.group === g));

  async function remove(kind: "personal" | "team", value: string, label: string) {
    if (!window.confirm(`${label}을(를) 삭제할까요? 되돌릴 수 없습니다.`)) return;
    const res = await fetch(`/api/admin/data?${kind}=${encodeURIComponent(value)}`, { method: "DELETE" });
    if (res.ok) load();
    else window.alert("삭제하지 못했습니다.");
  }

  function downloadCsv() {
    const header = ["구분", "조", "이름", "저장 시각", ...ITEMS.map((_, i) => `${i + 1}번`)];
    const rows = [
      ...GROUPS.filter((g) => teamByGroup[g]).map((g) => {
        const t = teamByGroup[g];
        return ["팀 답안", g, t.editor, new Date(t.updatedAt).toLocaleString("ko-KR"), ...ITEMS.map((it) => joinAnswer(t.answers[it.id]))];
      }),
      ...[...personal]
        .sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group) || a.name.localeCompare(b.name, "ko"))
        .map((p) => ["개인", p.group, p.name, new Date(p.updatedAt).toLocaleString("ko-KR"), ...ITEMS.map((it) => joinAnswer(p.answers[it.id]))]),
    ];
    const csv = "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `고객지향성실습_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.reload();
  }

  const shownItems = item === null ? ITEMS.map((_, i) => i) : [item];

  return (
    <main className={`mx-auto w-full px-4 py-6 ${big ? "max-w-none sm:px-10" : "max-w-6xl"}`}>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-blue-700">강사 화면 · {WORKSHOP.courseTitle}</div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{WORKSHOP.title}</h1>
          <div className="mt-1 text-sm text-slate-500">{WORKSHOP.scenario}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-600">
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> 10초 자동 새로고침
          </label>
          <button onClick={load} className={`${btn} ${btnOff} flex items-center gap-1 px-3 py-2 text-sm`}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> 새로고침
          </button>
          <button onClick={downloadCsv} className={`${btn} ${btnOff} flex items-center gap-1 px-3 py-2 text-sm`}>
            <Download className="h-4 w-4" /> 엑셀(CSV)
          </button>
          <button onClick={logout} className={`${btn} ${btnOff} flex items-center gap-1 px-3 py-2 text-sm`}>
            <LogOut className="h-4 w-4" /> 로그아웃
          </button>
        </div>
      </header>

      <Timer />

      {error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</div>}

      <nav className="mt-5 flex flex-wrap gap-2">
        {(
          [
            ["share", "팀 답안 공유"],
            ["personal", "개인 답안"],
            ["status", `제출 현황 (개인 ${personal.length} · 팀 ${teams.length})`],
          ] as const
        ).map(([id, label]) => (
          <button key={id} onClick={() => setView(id)} className={`${btn} px-4 py-2.5 text-sm ${view === id ? btnOn : btnOff}`}>
            {label}
          </button>
        ))}
      </nav>

      {view !== "status" && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {view === "personal" && (
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="mr-2 rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm font-bold"
            >
              {GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g} ({personal.filter((p) => p.group === g).length}명)
                </option>
              ))}
            </select>
          )}
          <button onClick={() => setItem(null)} className={`${btn} px-3 py-1.5 text-sm ${item === null ? btnOn : btnOff}`}>
            전체
          </button>
          {ITEMS.map((_, i) => (
            <button key={i} onClick={() => setItem(i)} className={`${btn} h-9 w-9 text-sm ${item === i ? btnOn : btnOff}`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setBig(!big)} className={`${btn} ${btnOff} ml-auto flex items-center gap-1 px-3 py-1.5 text-sm`}>
            {big ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {big ? "보통 글씨" : "크게 보기"}
          </button>
        </div>
      )}

      {view === "share" && (
        <div className="mt-4 space-y-4">
          {shownItems.map((i) => {
            const it = ITEMS[i];
            return (
              <section key={it.id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className={`flex gap-2 font-bold ${big ? "text-2xl sm:text-3xl" : "text-lg"}`}>
                  <span className="text-blue-700">{i + 1}.</span>
                  <Sentence text={it.text} />
                </div>
                <ul className="mt-4 space-y-2">
                  {activeGroups.map((g) => {
                    const t = teamByGroup[g];
                    return (
                      <li key={g} className={`flex gap-3 rounded-xl bg-slate-50 px-4 py-3 ${big ? "text-xl sm:text-2xl" : ""}`}>
                        <span className="w-14 shrink-0 font-extrabold text-blue-700">{g}</span>
                        {t && hasAnswer(t.answers[it.id]) ? (
                          <Sentence text={it.text} values={t.answers[it.id]} />
                        ) : (
                          <span className="text-slate-400">팀 답안 없음</span>
                        )}
                      </li>
                    );
                  })}
                  {!activeGroups.length && <li className="text-slate-400">아직 제출한 조가 없어요.</li>}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {view === "personal" && (
        <div className="mt-4 space-y-4">
          {shownItems.map((i) => {
            const it = ITEMS[i];
            const members = personal.filter((p) => p.group === group).sort((a, b) => a.name.localeCompare(b.name, "ko"));
            return (
              <section key={it.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className={`flex gap-2 font-bold ${big ? "text-2xl" : ""}`}>
                  <span className="text-blue-700">{i + 1}.</span>
                  <Sentence text={it.text} />
                </div>
                <ul className="mt-3 space-y-1.5">
                  {members.map((m) => (
                    <li key={m.id} className={`flex gap-3 rounded-lg bg-slate-50 px-3 py-2 ${big ? "text-xl" : "text-sm"}`}>
                      <span className="w-20 shrink-0 font-bold text-slate-600">{m.name}</span>
                      <span>{hasAnswer(m.answers[it.id]) ? joinAnswer(m.answers[it.id]) : <span className="text-slate-400">미작성</span>}</span>
                    </li>
                  ))}
                  {!members.length && <li className="text-sm text-slate-400">이 조에 저장한 교육생이 없어요.</li>}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {view === "status" && (
        <section className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3">조</th>
                <th className="px-2 py-3">조원 (작성 문항 수)</th>
                <th className="px-2 py-3">팀 답안</th>
              </tr>
            </thead>
            <tbody>
              {GROUPS.map((g) => {
                const members = personal.filter((p) => p.group === g);
                const t = teamByGroup[g];
                if (!members.length && !t) return null;
                return (
                  <tr key={g} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3 font-extrabold text-blue-700">{g}</td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {members.map((m) => (
                          <span key={m.id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 py-1 pl-3 pr-1">
                            {m.name} ({filledCount(m.answers)}/{ITEMS.length})
                            <button onClick={() => remove("personal", m.id, `${m.name}님의 답안`)} className="rounded-full p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600" aria-label="삭제">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      {t ? (
                        <span className="inline-flex items-center gap-1">
                          {filledCount(t.answers)}/{ITEMS.length} · {t.editor} · {new Date(t.updatedAt).toLocaleTimeString("ko-KR")}
                          <button onClick={() => remove("team", g, `${g} 팀 답안`)} className="rounded-full p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600" aria-label="삭제">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ) : (
                        <span className="text-slate-400">미제출</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!activeGroups.length && !loading && <p className="py-8 text-center text-sm text-slate-400">아직 제출된 답안이 없어요.</p>}
        </section>
      )}
    </main>
  );
}

function Timer() {
  const presets = STEPS.filter((s) => s.minutes > 0);
  const [total, setTotal] = useState(presets[0]?.minutes * 60 || 300);
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);
  useEffect(() => {
    if (left === 0) setRunning(false);
  }, [left]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <section className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-bold text-slate-500">실습 타이머</div>
      <div className={`font-mono text-4xl font-extrabold tabular-nums ${left === 0 ? "text-rose-600" : "text-slate-900"}`}>
        {mm}:{ss}
      </div>
      <div className="flex flex-wrap gap-2">
        {[3, 5, 10].map((m) => (
          <button
            key={m}
            onClick={() => {
              setTotal(m * 60);
              setLeft(m * 60);
              setRunning(false);
            }}
            className={`${btn} px-3 py-1.5 text-sm ${total === m * 60 ? btnOn : btnOff}`}
          >
            {m}분
          </button>
        ))}
        <button onClick={() => setRunning(!running)} className={`${btn} ${btnOff} flex items-center gap-1 px-3 py-1.5 text-sm`}>
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "일시정지" : "시작"}
        </button>
        <button
          onClick={() => {
            setLeft(total);
            setRunning(false);
          }}
          className={`${btn} ${btnOff} flex items-center gap-1 px-3 py-1.5 text-sm`}
        >
          <RotateCcw className="h-4 w-4" /> 처음으로
        </button>
      </div>
    </section>
  );
}
