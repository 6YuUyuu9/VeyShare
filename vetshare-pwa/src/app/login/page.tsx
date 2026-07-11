"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          return;
        }

        setMessage("เข้าสู่ระบบสำเร็จ กำลังไปยังหน้าตรวจสอบข้อมูล...");
        router.push("/test-pets");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          return;
        }

        setMessage(
          "สมัครสมาชิกเรียบร้อยแล้ว หากต้องยืนยันอีเมล โปรดตรวจสอบอีเมลทันที"
        );
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <div className="w-full max-w-lg rounded-3xl border border-black/5 bg-white p-10 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-zinc-950">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
            VetShare
          </p>
          <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
            {mode === "signin" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            ใช้อีเมลและรหัสผ่านเพื่อเข้าสู่ระบบหรือสร้างบัญชีใหม่
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-base outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-base outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-white"
            />
          </div>

          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-black px-5 py-3 text-base font-semibold text-white transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "กำลังประมวลผล..."
              : mode === "signin"
              ? "เข้าสู่ระบบ"
              : "สมัครสมาชิก"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            {mode === "signin"
              ? "ยังไม่มีบัญชี?"
              : "มีบัญชีแล้ว?"}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setMessage(null);
              }}
              className="ml-2 font-semibold text-black underline decoration-dotted underline-offset-4 dark:text-white"
            >
              {mode === "signin" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
            </button>
          </p>
          <p className="text-xs text-zinc-400">
            รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร
          </p>
        </div>
      </div>
    </div>
  );
}
