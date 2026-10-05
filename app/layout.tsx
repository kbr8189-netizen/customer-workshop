import type { Metadata, Viewport } from "next";
import "./globals.css";
import { WORKSHOP } from "@/lib/workshop";

export const metadata: Metadata = {
  title: `${WORKSHOP.title} · ${WORKSHOP.courseTitle}`,
  description: `${WORKSHOP.scenario} 빈칸 채우기 실습`,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <div className="grow">{children}</div>
        <footer className="no-print border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
          {WORKSHOP.instructor}의 {WORKSHOP.courseTitle} · {WORKSHOP.title}
        </footer>
      </body>
    </html>
  );
}
