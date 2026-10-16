"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";

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

type TopMatch = {
  id: number;
  team1: string;
  team2: string;
  predictions_count: number;
};

type TopPrize = {
  prize_won: string;
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
  totalPredictions: number;
  totalWinners: number;
  topMatchByPredictions: TopMatch | null;
  totalMatches: number;
  finishedMatches: number;
  totalSpinCodes: number;
  usedSpinCodes: number;
  topPrize: TopPrize | null;
  totalPrizes: number;
};

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPredictionsImage, setSavingPredictionsImage] = useState(false);
  const [savingWheelImage, setSavingWheelImage] = useState(false);

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

  const handleSavePredictionsImage = async () => {
    const el = document.getElementById("predictions-stats-card");
    if (!el) return;

    setSavingPredictionsImage(true);
    try {
      const dataUrl = await toPng(el, {
        backgroundColor: "#0a0e1a",
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `predictions-stats-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Screenshot error:", err);
      alert("تعذر حفظ الصورة، جرّب مرة أخرى");
    } finally {
      setSavingPredictionsImage(false);
    }
  };

  const handleSaveWheelImage = async () => {
    const el = document.getElementById("wheel-stats-card");
    if (!el) return;

    setSavingWheelImage(true);
    try {
      const dataUrl = await toPng(el, {
        backgroundColor: "#0a0e1a",
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `wheel-stats-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Screenshot error:", err);
      alert("تعذر حفظ الصورة، جرّب مرة أخرى");
    } finally {
      setSavingWheelImage(false);
    }
  };

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

  const maxDailyViews = Math.max(
    ...stats.viewsLast7Days.map((d) => d.count),
    1
  );

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

  const formatNumber = (num: number) => num.toLocaleString("ar-EG");

  const formatDate = () => {
    return new Date().toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen">
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center font-bold text-slate-900 text-xl">
              ⚽
            </div>
            <h1 className="text-xl font-bold">الإحصائيات</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
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
              {formatNumber(stats.totalViews)}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
            <div className="text-slate-400 text-sm mb-2">👥 زوار فريدين</div>
            <div className="text-3xl font-bold text-sky-400">
              {formatNumber(stats.uniqueVisitors)}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
            <div className="text-slate-400 text-sm mb-2">🖱️ إجمالي النقرات</div>
            <div className="text-3xl font-bold text-sky-400">
              {formatNumber(stats.totalClicks)}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
            <div className="text-slate-400 text-sm mb-2">📬 الرسائل</div>
            <div className="text-3xl font-bold text-sky-400">
              {formatNumber(stats.totalMessages)}
            </div>
            {stats.unreadMessages > 0 && (
              <div className="text-xs text-red-400 mt-1">
                {stats.unreadMessages} غير مقروءة
              </div>
            )}
          </div>
        </div>

        {/* ============ Predictions Stats Card (with screenshot) ============ */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-bold">🎯 إحصائيات التوقعات</h2>
          <button
            onClick={handleSavePredictionsImage}
            disabled={savingPredictionsImage}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 disabled:opacity-50 text-white font-bold transition shadow-lg shadow-sky-500/25 flex items-center gap-2"
          >
            {savingPredictionsImage ? (
              <>
                <span>⏳</span>
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <span>📸</span>
                <span>حفظ كصورة</span>
              </>
            )}
          </button>
        </div>

        <div
          id="predictions-stats-card"
          className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-3xl border-2 border-sky-500/30 p-6 md:p-8 mb-8"
        >
          {/* Header */}
          <div className="text-center mb-6 pb-6 border-b border-slate-800">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-sky-400 font-bold text-2xl mb-1">
              Ichancy Bet
            </div>
            <div className="text-sm text-slate-400">إحصائيات توقع واربح</div>
            <div className="text-xs text-slate-500 mt-1">{formatDate()}</div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 text-center">
              <div className="text-slate-400 text-sm mb-2">
                📊 إجمالي التوقعات
              </div>
              <div className="text-4xl font-bold text-sky-400">
                {formatNumber(stats.totalPredictions)}
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 text-center">
              <div className="text-slate-400 text-sm mb-2">
                🏆 عدد الرابحين
              </div>
              <div className="text-4xl font-bold text-green-400">
                {formatNumber(stats.totalWinners)}
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 text-center">
              <div className="text-slate-400 text-sm mb-2">
                🔥 أكثر مباراة فيها توقعات
              </div>
              {stats.topMatchByPredictions ? (
                <>
                  <div className="text-lg font-bold text-white mb-1 truncate">
                    {stats.topMatchByPredictions.team1} ×{" "}
                    {stats.topMatchByPredictions.team2}
                  </div>
                  <div className="text-2xl font-bold text-sky-400">
                    {formatNumber(
                      stats.topMatchByPredictions.predictions_count
                    )}{" "}
                    <span className="text-sm text-slate-400">توقع</span>
                  </div>
                </>
              ) : (
                <div className="text-slate-500 text-sm mt-2">
                  لا توجد بيانات بعد
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-6 border-t border-slate-800">
            <div className="text-xs text-slate-500">
              📢 قناتنا على تلغرام:{" "}
              <span className="text-sky-400 font-mono" dir="ltr">
                @ichancy_bets1
              </span>
            </div>
          </div>
        </div>

        {/* ============ Wheel Stats Card (with screenshot) ============ */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-bold">🎡 إحصائيات العجلة</h2>
          <button
            onClick={handleSaveWheelImage}
            disabled={savingWheelImage}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 disabled:opacity-50 text-white font-bold transition shadow-lg shadow-sky-500/25 flex items-center gap-2"
          >
            {savingWheelImage ? (
              <>
                <span>⏳</span>
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <span>📸</span>
                <span>حفظ كصورة</span>
              </>
            )}
          </button>
        </div>

        <div
          id="wheel-stats-card"
          className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-3xl border-2 border-sky-500/30 p-6 md:p-8 mb-8"
        >
          {/* Header */}
          <div className="text-center mb-6 pb-6 border-b border-slate-800">
            <div className="text-4xl mb-2">🎡</div>
            <div className="text-sky-400 font-bold text-2xl mb-1">
              Ichancy Bet
            </div>
            <div className="text-sm text-slate-400">إحصائيات عجلة الفرص</div>
            <div className="text-xs text-slate-500 mt-1">{formatDate()}</div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 text-center">
              <div className="text-slate-400 text-sm mb-2">
                🎟️ الأكواد المستخدمة
              </div>
              <div className="text-4xl font-bold text-sky-400">
                {formatNumber(stats.usedSpinCodes)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                من أصل {formatNumber(stats.totalSpinCodes)}
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 text-center">
              <div className="text-slate-400 text-sm mb-2">
                🎁 أكثر جائزة طلعت
              </div>
              {stats.topPrize ? (
                <>
                  <div className="text-3xl font-bold text-sky-400">
                    {stats.topPrize.prize_won}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    طلعت {formatNumber(stats.topPrize.count)} مرة
                  </div>
                </>
              ) : (
                <div className="text-slate-500 text-sm mt-2">
                  لا توجد بيانات بعد
                </div>
              )}
            </div>

            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 text-center">
              <div className="text-slate-400 text-sm mb-2">
                💰 إجمالي الجوائز المصروفة
              </div>
              <div className="text-3xl font-bold text-green-400">
                {formatNumber(stats.totalPrizes)}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-6 border-t border-slate-800">
            <div className="text-xs text-slate-500">
              📢 قناتنا على تلغرام:{" "}
              <span className="text-sky-400 font-mono" dir="ltr">
                @ichancy_bets1
              </span>
            </div>
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
                {formatNumber(stats.totalSportsPages)}
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
                {formatNumber(stats.totalBots)}
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
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
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

        {/* Views By Page & Clicks By Type */}
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
                    <div
                      className="font-mono text-sky-400 text-sm"
                      dir="ltr"
                    >
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
                      <div className="font-semibold truncate">
                        {p.item_name}
                      </div>
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
                      <div className="font-semibold truncate">
                        {b.item_name}
                      </div>
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