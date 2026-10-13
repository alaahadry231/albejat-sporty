"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DailyViews = {
  day: string;
  count: number;
};

type PageViews = {
  page: string;
  count: number;
};

type ClicksByType = {
  item_type: string;
  count: number;
};

type TopItem = {
  item_id: number;
  item_name: string;
  count: number;
};

type Stats = {
  totalViews: number;
  uniqueVisitors: number;
  viewsLast7Days: DailyViews[];
  viewsByPage: PageViews[];
  totalClicks: number;
  clicksByType: ClicksByType[];
  topPages: TopItem[];
  topBots: TopItem[];
  totalSportsPages: number;
  totalBots: number;
  totalMessages: number;
  unreadMessages: number;
};

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.status === 401) {
          router.push("/admin");
          return;
        }
        const json = await res.json();
        setStats(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">جاري التحميل...</div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">فشل تحميل الإحصائيات</div>
      </main>
    );
  }

  const maxDailyViews = Math.max(...stats.viewsLast7Days.map((d) => d.count), 1);

  const formatDay = (day: string) => {
    try {
      const date = new Date(day);
      return date.toLocaleDateString("ar-EG", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    } catch {
      return day;
    }
  };

  return (
    <main className="min-h-screen">
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center font-bold text-slate-900 text-xl">
              ⚽
            </div>
            <h1 className="text-xl font-bold">الإحصائيات</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/admin/dashboard"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition"
            >
              ← لوحة الإدارة
            </a>
            <a
              href="/"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition"
            >
              عرض الموقع
            </a>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
            <div className="text-slate-400 text-sm mb-2">👁️ إجمالي الزيارات</div>
            <div className="text-3xl font-bold text-sky-400">
              {stats.totalViews.toLocaleString("ar-EG")}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
            <div className="text-slate-400 text-sm mb-2">👥 زوار فريدين</div>
            <div className="text-3xl font-bold text-sky-400">
              {stats.uniqueVisitors.toLocaleString("ar-EG")}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
            <div className="text-slate-400 text-sm mb-2">🖱️ إجمالي النقرات</div>
            <div className="text-3xl font-bold text-sky-400">
              {stats.totalClicks.toLocaleString("ar-EG")}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
            <div className="text-slate-400 text-sm mb-2">📬 الرسائل</div>
            <div className="text-3xl font-bold text-sky-400">
              {stats.totalMessages.toLocaleString("ar-EG")}
            </div>
            {stats.unreadMessages > 0 && (
              <div className="text-xs text-red-400 mt-1">
                {stats.unreadMessages} غير مقروءة
              </div>
            )}
          </div>
        </div>

        {/* Content Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-2xl">
              🏆
            </div>
            <div>
              <div className="text-slate-400 text-sm">البكجات الرياضية</div>
              <div className="text-2xl font-bold text-white">
                {stats.totalSportsPages.toLocaleString("ar-EG")}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-2xl">
              🤖
            </div>
            <div>
              <div className="text-slate-400 text-sm">بوتات تيليجرام</div>
              <div className="text-2xl font-bold text-white">
                {stats.totalBots.toLocaleString("ar-EG")}
              </div>
            </div>
          </div>
        </div>

        {/* Daily Views Chart */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-8">
          <h2 className="text-xl font-bold mb-6">الزيارات - آخر 7 أيام</h2>
          {stats.viewsLast7Days.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              لا توجد بيانات بعد
            </div>
          ) : (
            <div className="flex items-end justify-between gap-2 h-48">
              {stats.viewsLast7Days.map((d, i) => {
                const height = (d.count / maxDailyViews) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs text-sky-400 font-bold">
                      {d.count}
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-sky-500 to-sky-400 rounded-t-lg min-h-[4px] transition-all"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    ></div>
                    <div className="text-xs text-slate-500 text-center whitespace-nowrap">
                      {formatDay(d.day)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Views By Page */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4">الزيارات حسب الصفحة</h2>
            {stats.viewsByPage.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                لا توجد بيانات بعد
              </div>
            ) : (
              <div className="space-y-3">
                {stats.viewsByPage.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800"
                  >
                    <div className="font-mono text-sky-400 text-sm" dir="ltr">
                      {v.page}
                    </div>
                    <div className="font-bold">{v.count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4">النقرات حسب النوع</h2>
            {stats.clicksByType.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                لا توجد بيانات بعد
              </div>
            ) : (
              <div className="space-y-3">
                {stats.clicksByType.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800"
                  >
                    <div className="text-slate-300">
                      {c.item_type === "page" ? "🏆 بكجات" : "🤖 بوتات"}
                    </div>
                    <div className="font-bold text-sky-400">{c.count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Pages & Top Bots */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4">🔥 أكثر البكجات نقراً</h2>
            {stats.topPages.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                لا توجد بيانات بعد
              </div>
            ) : (
              <div className="space-y-3">
                {stats.topPages.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-500 text-slate-900 font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{p.item_name}</div>
                    </div>
                    <div className="font-bold text-sky-400 shrink-0">
                      {p.count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4">🔥 أكثر البوتات نقراً</h2>
            {stats.topBots.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                لا توجد بيانات بعد
              </div>
            ) : (
              <div className="space-y-3">
                {stats.topBots.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-500 text-slate-900 font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{b.item_name}</div>
                    </div>
                    <div className="font-bold text-sky-400 shrink-0">
                      {b.count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
          © 2025 Ichancy Bet — جميع الحقوق محفوظة
        </div>
      </footer>
    </main>
  );
}