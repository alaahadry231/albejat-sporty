"use client";

import { useState } from "react";

const telegramBots = [
  {
    id: 1,
    name: "بوت التحليلات الرياضية",
    description: "تحليلات يومية لمباريات كرة القدم",
    image: "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=400",
    category: "تحليلات",
    botUrl: "https://t.me",
  },
  {
    id: 2,
    name: "بوت توقعات المباريات",
    description: "توقعات مباريات اليوم بدقة عالية",
    image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400",
    category: "توقعات",
    botUrl: "https://t.me",
  },
  {
    id: 3,
    name: "بوت الأخبار الرياضية",
    description: "أحدث الأخبار الرياضية أولاً بأول",
    image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400",
    category: "أخبار",
    botUrl: "https://t.me",
  },
  {
    id: 4,
    name: "بوت إحصائيات اللاعبين",
    description: "إحصائيات شاملة لكل اللاعبين",
    image: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=400",
    category: "إحصائيات",
    botUrl: "https://t.me",
  },
];

export default function BotsPage() {
  const [search, setSearch] = useState("");

  const filtered = telegramBots.filter((b) => b.name.includes(search));

  return (
    <main className="min-h-screen">
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-slate-900 text-xl">
              ⚽
            </div>
            <h1 className="text-xl font-bold">البكجات الرياضية</h1>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/" className="text-slate-300 hover:text-emerald-400 transition">الرئيسية</a>
            <a href="/pages" className="text-slate-300 hover:text-emerald-400 transition">البكجات الرياضية</a>
            <a href="/bots" className="text-emerald-400 font-semibold">بوتات تيليجرام</a>
            <a href="/contact" className="text-slate-300 hover:text-emerald-400 transition">اتصل بنا</a>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            بوتات <span className="text-emerald-400">تيليجرام</span>
          </h2>
          <p className="text-slate-400">أفضل البوتات الرياضية على تيليجرام</p>
        </div>

        <div className="mb-8 max-w-md mx-auto">
          <input
            type="text"
            placeholder="ابحث باسم البوت..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white placeholder:text-slate-500 transition"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            لا توجد نتائج مطابقة
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((bot) => (
              <div
                key={bot.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-emerald-500/50 transition group"
              >
                <a
                  href={bot.botUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative h-44 overflow-hidden"
                >
                  <img
                    src={bot.image}
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
                    href={bot.botUrl}
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
          © 2025 البكجات الرياضية — جميع الحقوق محفوظة
        </div>
      </footer>
    </main>
  );
}