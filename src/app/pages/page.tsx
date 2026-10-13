"use client";

import { useEffect, useState } from "react";

type SportsPage = {
  id: number;
  name: string;
  description: string;
  code: string;
  image_url: string;
  category: string;
  rate: string;
};

export default function PagesPage() {
  const [pages, setPages] = useState<SportsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch("/api/pages");
        const json = await res.json();
        if (json.data) {
          setPages(json.data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  const filtered = pages.filter(
    (p) =>
      p.name.includes(search) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = async (code: string, id: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      alert("تعذر النسخ، جرّب يدوياً");
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
            <a href="/pages" className="text-emerald-400 font-semibold">البكجات الرياضية</a>
            <a href="/bots" className="text-slate-300 hover:text-emerald-400 transition">بوتات تيليجرام</a>
            <a href="/contact" className="text-slate-300 hover:text-emerald-400 transition">اتصل بنا</a>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden min-h-[400px] md:min-h-[500px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-pages.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-slate-950/75"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-slate-950"></div>

        <div className="relative w-full max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-3">
            البكجات <span className="text-emerald-400">الرياضية</span>
          </h2>
          <p className="text-slate-200 text-lg">اختر البكج المناسب وانسخ الكود واستخدمه مباشرة</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 max-w-md mx-auto">
          <input
            type="text"
            placeholder="ابحث باسم البكج أو الكود..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white placeholder:text-slate-500 transition"
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">لا توجد نتائج مطابقة</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-emerald-500/50 transition group"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/90 text-emerald-400 text-xs border border-emerald-500/30">
                    {item.category}
                  </div>
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-500 text-slate-900 text-xs font-bold">
                    ريت {item.rate}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{item.description}</p>

                  <div className="bg-slate-950 rounded-lg p-3 mb-4 border border-slate-800">
                    <div className="text-xs text-slate-500 mb-1">الكود:</div>
                    <div className="font-mono text-emerald-400 text-sm break-all">
                      {item.code}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(item.code, item.id)}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition border border-slate-700"
                    >
                      {copiedId === item.id ? "✓ تم النسخ" : "نسخ الكود"}
                    </button>
                    <a
                      href="https://www.ichancy.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-sm font-bold text-center transition"
                    >
                      iChancy
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
          © 2025 Ichancy Bet — جميع الحقوق محفوظة
        </div>
      </footer>
    </main>
  );
}