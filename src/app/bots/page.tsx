"use client";

import { useEffect, useState } from "react";

type TelegramBot = {
  id: number;
  name: string;
  description: string;
  bot_url: string;
  image_url: string;
  category: string;
};

export default function BotsPage() {
  const [bots, setBots] = useState<TelegramBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const res = await fetch("/api/bots");
        const json = await res.json();
        setBots(json.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBots();
  }, []);

  const filtered = bots.filter((b) => b.name.includes(search));

  return (
    <main className="min-h-screen">
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Ichancy Bet"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <h1 className="text-xl font-bold">Ichancy Bet</h1>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/" className="text-slate-300 hover:text-emerald-400 transition">الرئيسية</a>
            <a href="/pages" className="text-slate-300 hover:text-emerald-400 transition">البكجات الرياضية</a>
            <a href="/bots" className="text-emerald-400 font-semibold">بوتات تيليجرام</a>
            <a href="/contact" className="text-slate-300 hover:text-emerald-400 transition">اتصل بنا</a>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden min-h-[400px] md:min-h-[500px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bots.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-slate-950/75"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-slate-950"></div>

        <div className="relative w-full max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-3">
            بوتات <span className="text-emerald-400">تيليجرام</span>
          </h2>
          <p className="text-slate-200 text-lg">أفضل البوتات الرياضية على تيليجرام</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 max-w-md mx-auto">
          <input
            type="text"
            placeholder="ابحث باسم البوت..."
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
            {filtered.map((bot) => (
              <div
                key={bot.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-emerald-500/50 transition group"
              >
                <a
                  href={bot.bot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative h-44 overflow-hidden"
                >
                  <img
                    src={bot.image_url}
                    alt={bot.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/90 text-emerald-400 text-xs border border-emerald-500/30">
                    {bot.category}
                  </div>
                </a>

                <div className="p-5">
                  <h3 className="text-lg font-bold mb-2">{bot.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{bot.description}</p>

                  <a
                    href={bot.bot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-sm font-bold text-center transition"
                  >
                    الدخول إلى البوت
                  </a>
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