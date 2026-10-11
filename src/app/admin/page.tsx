"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("تعذر الاتصال بالخادم");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-900 text-3xl mx-auto mb-4">
            🔒
          </div>
          <h1 className="text-2xl font-bold mb-2">لوحة الإدارة</h1>
          <p className="text-slate-400 text-sm">سجّل دخولك للمتابعة</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4"
        >
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition"
              placeholder="admin"
              required
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition"
              placeholder="••••••••"
              required
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold transition"
          >
            {loading ? "جاري التحقق..." : "تسجيل الدخول"}
          </button>

          <div className="text-center pt-2">
            <a
              href="/"
              className="text-slate-500 hover:text-emerald-400 text-sm transition"
            >
              ← العودة للموقع
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}