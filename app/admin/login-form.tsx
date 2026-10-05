"use client";

import { useState } from "react";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error || "로그인에 실패했습니다.");
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-extrabold">강사 화면 로그인</h1>
        <p className="mt-1 text-sm text-slate-500">교육생 답안을 보려면 비밀번호를 입력하세요.</p>
        <input
          className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-blue-500"
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <div className="mt-2 text-sm font-bold text-rose-600">{error}</div>}
        <button
          className="mt-4 w-full rounded-xl bg-blue-600 py-3 font-bold text-white disabled:opacity-40"
          disabled={!password || busy}
        >
          {busy ? "확인 중…" : "로그인"}
        </button>
      </form>
    </main>
  );
}
