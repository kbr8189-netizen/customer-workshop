"use client";

import { splitBlanks } from "@/lib/workshop";

const MARKS = ["①", "②", "③", "④", "⑤"];

// 빈칸 자리에 번호를 넣은 문장
export function Sentence({ text, values, highlight }: { text: string; values?: string[]; highlight?: string }) {
  const parts = splitBlanks(text);
  return (
    <p className="leading-relaxed text-slate-800">
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 &&
            (values?.[i]?.trim() ? (
              <span className={`mx-0.5 rounded px-1 font-bold ${highlight ?? "bg-blue-50 text-blue-800"}`}>{values[i].trim()}</span>
            ) : (
              <span className="mx-0.5 inline-block min-w-14 border-b-2 border-slate-400 text-center font-bold text-slate-400">
                {parts.length > 2 ? MARKS[i] : "　"}
              </span>
            ))}
        </span>
      ))}
    </p>
  );
}

export function BlankInputs({
  text,
  values,
  onChange,
  disabled,
}: {
  text: string;
  values: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const n = splitBlanks(text).length - 1;
  return (
    <div className="mt-3 space-y-2">
      {Array.from({ length: n }, (_, i) => (
        <label key={i} className="flex items-start gap-2">
          {n > 1 && <span className="mt-2.5 w-5 shrink-0 text-center font-bold text-blue-700">{MARKS[i]}</span>}
          <textarea
            rows={1}
            maxLength={300}
            disabled={disabled}
            value={values[i] ?? ""}
            placeholder="빈칸에 들어갈 말"
            onChange={(e) => {
              const next = [...values];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="field-sizing-content min-h-11 w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-[15px] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
          />
        </label>
      ))}
    </div>
  );
}
