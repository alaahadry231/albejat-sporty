"use client";

import { useEffect, useState } from "react";
import { trackView } from "@/lib/tracking";

type UpcomingMatch = {
  id: number;
  team1: string;
  team2: string;
  match_date: string;
  predictions_open: boolean;
};

type FinishedMatch = {
  id: number;
  team1: string;
  team2: string;
  match_date: string;
  final_score1: number;
  final_score2: number;
};

type Winner = {
  name: string;
  telegram: string;
  score1: number;
  score2: number;
};

export default function PredictPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "finished">("upcoming");
  const [upcoming, setUpcoming] = useState<UpcomingMatch[]>([]);
  const [finished, setFinished] = useState<FinishedMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const [submittedMatches, setSubmittedMatches] = useState<number[]>([]);
  const [formData, setFormData] = useState<Record<number, {
    name: string;
    telegram: string;
    score1: string;
    score2: string;
    submitting: boolean;
    error: string;
    success: boolean;
  }>>({});

  const [winnersModal, setWinnersModal] = useState<{
    matchId: number | null;
    matchName: string;
    winners: Winner[];
    loading: boolean;
  }>({
    matchId: null,
    matchName: "",
    winners: [],
    loading: false,
  });

  useEffect(() => {
    trackView("/predict");

    // نقرأ التوقعات المحفوظة من localStorage
    const saved = localStorage.getItem("submitted_predictions");
    if (saved) {
      try {
        setSubmittedMatches(JSON.parse(saved));
      } catch {
        // نتجاهل
      }
    }

    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/predict");
        const json = await res.json();
        setUpcoming(json.upcoming || []);
        setFinished(json.finished || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const getFormState = (matchId: number) => {
    return formData[matchId] || {
      name: "",
      telegram: "",
      score1: "",
      score2: "",
      submitting: false,
      error: "",
      success: false,
    };
  };

  const updateForm = (matchId: number, updates: Partial<ReturnType<typeof getFormState>>) => {
    setFormData((prev) => ({
      ...prev,
      [matchId]: {
        ...getFormState(matchId),
        ...updates,
      },
    }));
  };

  const handleSubmit = async (matchId: number) => {
    const form = getFormState(matchId);

    if (!form.name || !form.telegram || !form.score1 || !form.score2) {
      updateForm(matchId, { error: "الرجاء تعبئة جميع الحقول" });
      return;
    }

    if (!form.telegram.startsWith("@")) {
      updateForm(matchId, { error: "معرّف تلغرام يجب أن يبدأ بـ @" });
      return;
    }

    updateForm(matchId, { submitting: true, error: "" });

    try {
      const res = await fetch("/api/predict/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_id: matchId,
          name: form.name.trim(),
          telegram: form.telegram.trim(),
          score1: parseInt(form.score1),
          score2: parseInt(form.score2),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        updateForm(matchId, { error: data.error || "فشل الإرسال", submitting: false });
        return;
      }

      // نحفظ المباراة في localStorage
      const updated = [...submittedMatches, matchId];
      setSubmittedMatches(updated);
      localStorage.setItem("submitted_predictions", JSON.stringify(updated));

      updateForm(matchId, { submitting: false, success: true });
    } catch {
      updateForm(matchId, { error: "تعذر الاتصال بالخادم", submitting: false });
    }
  };

  const showWinners = async (matchId: number, matchName: string) => {
    setWinnersModal({
      matchId,
      matchName,
      winners: [],
      loading: true,
    });

    try {
      const res = await fetch(`/api/predict/winners?match_id=${matchId}`);
      const data = await res.json();
      setWinnersModal((prev) => ({
        ...prev,
        winners: data.winners || [],
        loading: false,
      }));
    } catch {
      setWinnersModal((prev) => ({
        ...prev,
        winners: [],
        loading: false,
      }));
    }
  };

  const closeWinners = () => {
    setWinnersModal({
      matchId: null,
      matchName: "",
      winners: [],
      loading: false,
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <main className="min-h-screen">
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-3">
            🎯 توقع <span className="text-sky-400">واربح</span>
          </h2>
          <p className="text-slate-400 text-lg">
            توقّع نتائج المباريات واربح جوائز قيمة
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit mx-auto">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition ${
              activeTab === "upcoming"
                ? "bg-sky-500 text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🔥 المباريات القادمة
          </button>
          <button
            onClick={() => setActiveTab("finished")}
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition ${
              activeTab === "finished"
                ? "bg-sky-500 text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ✅ النتائج السابقة
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">جاري التحميل...</div>
        ) : activeTab === "upcoming" ? (
          // ============ المباريات القادمة ============
          upcoming.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <div className="text-6xl mb-4">⚽</div>
              <p>لا توجد مباريات متاحة حالياً</p>
              <p className="text-sm mt-2">تابعنا على تلغرام لمعرفة المواعيد</p>
            </div>
          ) : (
            <div className="space-y-6">
              {upcoming.map((match) => {
                const form = getFormState(match.id);
                const alreadySubmitted = submittedMatches.includes(match.id);
                const predictionsClosed = !match.predictions_open;

                return (
                  <div
                    key={match.id}
                    className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden"
                  >
                    {/* Match Header */}
                    <div className="bg-gradient-to-r from-sky-500/10 to-blue-500/10 border-b border-slate-800 p-5">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex-1 text-center">
                          <div className="text-xs text-slate-400 mb-1">📅 موعد المباراة</div>
                          <div className="text-sm text-slate-300">{formatDate(match.match_date)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Teams */}
                    <div className="p-5">
                      <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="flex-1 text-center">
                          <div className="text-xl md:text-2xl font-bold">{match.team1}</div>
                        </div>
                        <div className="text-slate-500 text-lg">×</div>
                        <div className="flex-1 text-center">
                          <div className="text-xl md:text-2xl font-bold">{match.team2}</div>
                        </div>
                      </div>

                      {/* Form or Status */}
                      {alreadySubmitted || form.success ? (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 text-center">
                          <div className="text-4xl mb-2">✅</div>
                          <div className="text-green-400 font-bold text-lg">
                            تم حفظ توقعك بالتوفيق الدائم
                          </div>
                        </div>
                      ) : predictionsClosed ? (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-center">
                          <div className="text-4xl mb-2">🔒</div>
                          <div className="text-red-400 font-bold text-lg">
                            التوقعات على هذي المباراة موقفة
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* User Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm text-slate-400 mb-2">
                                الاسم *
                              </label>
                              <input
                                type="text"
                                value={form.name}
                                onChange={(e) =>
                                  updateForm(match.id, { name: e.target.value })
                                }
                                placeholder="اكتب اسمك"
                                maxLength={50}
                                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white placeholder:text-slate-600 transition"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-slate-400 mb-2">
                                معرّف تلغرام *
                              </label>
                              <input
                                type="text"
                                value={form.telegram}
                                onChange={(e) =>
                                  updateForm(match.id, { telegram: e.target.value })
                                }
                                placeholder="@username"
                                dir="ltr"
                                maxLength={50}
                                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white placeholder:text-slate-600 transition font-mono"
                              />
                            </div>
                          </div>

                          {/* Score */}
                          <div>
                            <label className="block text-sm text-slate-400 mb-2 text-center">
                              توقعك للنتيجة *
                            </label>
                            <div className="flex items-center justify-center gap-4">
                              <div className="flex-1 text-center">
                                <div className="text-sm text-slate-400 mb-2">{match.team1}</div>
                                <input
                                  type="number"
                                  value={form.score1}
                                  onChange={(e) =>
                                    updateForm(match.id, { score1: e.target.value })
                                  }
                                  min="0"
                                  max="50"
                                  placeholder="0"
                                  className="w-20 h-20 mx-auto text-center text-3xl font-bold rounded-xl bg-slate-950 border-2 border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                                />
                              </div>
                              <div className="text-slate-500 text-2xl">-</div>
                              <div className="flex-1 text-center">
                                <div className="text-sm text-slate-400 mb-2">{match.team2}</div>
                                <input
                                  type="number"
                                  value={form.score2}
                                  onChange={(e) =>
                                    updateForm(match.id, { score2: e.target.value })
                                  }
                                  min="0"
                                  max="50"
                                  placeholder="0"
                                  className="w-20 h-20 mx-auto text-center text-3xl font-bold rounded-xl bg-slate-950 border-2 border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                                />
                              </div>
                            </div>
                          </div>

                          {form.error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                              {form.error}
                            </div>
                          )}

                          <button
                            onClick={() => handleSubmit(match.id)}
                            disabled={form.submitting}
                            className="w-full px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-900 font-bold transition shadow-lg shadow-sky-500/25"
                          >
                            {form.submitting ? "جاري الإرسال..." : "تأكيد التوقع"}
                          </button>

                          <p className="text-xs text-slate-500 text-center">
                            ⚠️ لا يمكن تعديل التوقع بعد الإرسال
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          // ============ النتائج السابقة ============
          finished.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <div className="text-6xl mb-4">📊</div>
              <p>لا توجد نتائج بعد</p>
            </div>
          ) : (
            <div className="space-y-4">
              {finished.map((match) => (
                <div
                  key={match.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 p-5"
                >
                  <div className="text-xs text-slate-500 mb-3 text-center">
                    {formatDate(match.match_date)}
                  </div>

                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="flex-1 text-center">
                      <div className="text-lg md:text-xl font-bold">{match.team1}</div>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-sky-500 text-slate-900 font-bold text-xl">
                      {match.final_score1} - {match.final_score2}
                    </div>
                    <div className="flex-1 text-center">
                      <div className="text-lg md:text-xl font-bold">{match.team2}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => showWinners(match.id, `${match.team1} × ${match.team2}`)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition border border-slate-700"
                  >
                    🏆 شاهد الفائزين
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </section>

      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
          © 2025 Ichancy Bet — جميع الحقوق محفوظة
        </div>
      </footer>

      {/* Winners Modal */}
      {winnersModal.matchId !== null && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeWinners}
        >
          <div
            className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold">🏆 الفائزون</h3>
                <p className="text-sm text-slate-400 mt-1">{winnersModal.matchName}</p>
              </div>
              <button
                onClick={closeWinners}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              {winnersModal.loading ? (
                <div className="text-center py-10 text-slate-500">جاري التحميل...</div>
              ) : winnersModal.winners.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <div className="text-5xl mb-3">😢</div>
                  <p>لا يوجد فائزون في هذي المباراة</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {winnersModal.winners.map((winner, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800"
                    >
                      <div className="w-10 h-10 rounded-full bg-sky-500 text-slate-900 font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">{winner.name}</div>
                        <a
                          href={`https://t.me/${winner.telegram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-sky-400 hover:underline font-mono"
                          dir="ltr"
                        >
                          {winner.telegram}
                        </a>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-400 font-bold text-sm shrink-0">
                        {winner.score1} - {winner.score2}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}