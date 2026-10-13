"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.message) {
      setError("الرجاء تعبئة جميع الحقول");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "فشل الإرسال");
        setLoading(false);
        return;
      }

      setSent(true);
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setSent(false), 5000);
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Ichancy Bet"
              className="              w-10 h-10 object-contain"
            />
            <h1 className="text-xl font-bold">Ichancy Bet</h1>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/" className="text-slate-300 hover:text-emerald-400 transition">الرئيسية</a>
            <a href="/pages" className="text-slate-300 hover:text-emerald-400 transition">البكجات الرياضية</a>
            <a href="/bots" className="text-slate-300 hover:text-emerald-400 transition">بوتات تيليجرام</a>
            <a href="/contact" className="text-emerald-400 font-semibold">اتصل بنا</a>
          </nav>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            تواصل <span className="text-emerald-400">معنا</span>
          </h2>
          <p className="text-slate-400">عندك سؤال أو اقتراح؟ ابعتلنا رسالة</p>
        </div>

        {sent && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center">
            ✓ تم إرسال رسالتك بنجاح، شكراً لتواصلك معنا
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">الاسم الكامل</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white placeholder:text-slate-500 transition"
              placeholder="اكتب اسمك"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white placeholder:text-slate-500 transition"
              placeholder="example@email.com"
              dir="ltr"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">الرسالة</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              className="w-full px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white placeholder:text-slate-500 transition resize-none"
              placeholder="اكتب رسالتك هنا..."
              maxLength={2000}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold transition shadow-lg shadow-emerald-500/25"
          >
            {loading ? "جاري الإرسال..." : "إرسال الرسالة"}
          </button>
        </form>
      </section>

      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
          © 2025 Ichancy Bet — جميع الحقوق محفوظة
        </div>
      </footer>
    </main>
  );
}