import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import Dashboard from "./dashboard";
import LoginForm from "./login-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "강사 화면 · 고객 지향성 실습" };

export default async function AdminPage() {
  return (await isAdmin()) ? <Dashboard /> : <LoginForm />;
}
