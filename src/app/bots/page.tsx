"use client";

import { useEffect, useState } from "react";
import { trackView, trackClick } from "@/lib/tracking";

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
    trackView("/bots");

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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
          <a href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center font-bold text-slate-900 text-xl">
              ⚽
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-xl font-bold">Ichancy Bet</h1>
              <a
                href="https://t.me/ichancy_bets1"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-sky-500/20 to-blue-500/20 hover:from-sky-500/30 hover:to-blue-500/30 border border-sky-500/40 hover:border-sky-400 text-sky-400 hover:text-sky-300 text-xs font-semibold transition-all duration-300 w-fit"
              >
                <span className="relative flex items-center justify-center">
                  <span className="absolute w-2 h-2 rounded-full bg-sky-400 animate-ping opacity-75"></span>
                  <span className="relative w-2 h-2 rounded-full bg-sky-400"></span>
                </span>
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                <span>قناتنا على تلغرام</span>
              </a>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/" className="text-slate-300 hover:text-sky-400 transition">الرئيسية</a>
            <a href="/pages" className="text-slate-300 hover:text-sky-400 transition">البكجات الرياضية</a>
            <a href="/bots" className="text-sky-400 font-semibold">بوتات تيليجرام</a>
            <a href="/contact" className="text-slate-300 hover:text-sky-400 transition">اتصل بنا</a>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden min-h-[250px] md:min-h-[300px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bots.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-slate-950/75"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/10 via-transparent to-slate-950"></div>

        <div className="relative w-full max-w-6xl mx-auto px-4 py-12 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-3">
            بوتات <span className="text-sky-400">تيليجرام</span>
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
            className="w-full px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none text-white placeholder:text-slate-500 transition"
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
                className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-sky-500/50 transition group"
              >
                <a
                  href={bot.bot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackClick("bot", bot.id, bot.name)}
                  className="block relative h-44 overflow-hidden"
                >
                  <img
                    src={bot.image_url}
                    alt={bot.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/90 text-sky-400 text-xs border border-sky-500/30">
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
                    onClick={() => trackClick("bot", bot.id, bot.name)}
                    className="block w-full px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-900 text-sm font-bold text-center transition"
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