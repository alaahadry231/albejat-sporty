"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SportsPage = {
  id: number;
  name: string;
  description: string;
  code: string;
  image_url: string;
  category: string;
  rate: string;
  is_published: boolean;
};

type TelegramBot = {
  id: number;
  name: string;
  description: string;
  bot_url: string;
  image_url: string;
  category: string;
  is_published: boolean;
};

const emptyPageForm = {
  name: "",
  description: "",
  code: "",
  image_url: "",
  category: "عام",
  rate: "×1",
  is_published: true,
};

const emptyBotForm = {
  name: "",
  description: "",
  bot_url: "",
  image_url: "",
  category: "عام",
  is_published: true,
};

export default function DashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"pages" | "bots">("pages");

  const [pages, setPages] = useState<SportsPage[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [pageForm, setPageForm] = useState(emptyPageForm);
  const [savingPage, setSavingPage] = useState(false);
  const [pageError, setPageError] = useState("");

  const [bots, setBots] = useState<TelegramBot[]>([]);
  const [loadingBots, setLoadingBots] = useState(true);
  const [showBotModal, setShowBotModal] = useState(false);
  const [editingBotId, setEditingBotId] = useState<number | null>(null);
  const [botForm, setBotForm] = useState(emptyBotForm);
  const [savingBot, setSavingBot] = useState(false);
  const [botError, setBotError] = useState("");

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/admin/pages");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const json = await res.json();
      setPages(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPages(false);
    }
  };

  const openAddPage = () => {
    setEditingPageId(null);
    setPageForm(emptyPageForm);
    setPageError("");
    setShowPageModal(true);
  };

  const openEditPage = (page: SportsPage) => {
    setEditingPageId(page.id);
    setPageForm({
      name: page.name,
      description: page.description,
      code: page.code,
      image_url: page.image_url,
      category: page.category,
      rate: page.rate,
      is_published: page.is_published,
    });
    setPageError("");
    setShowPageModal(true);
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPage(true);
    setPageError("");

    const url = editingPageId
      ? `/api/admin/pages/${editingPageId}`
      : "/api/admin/pages";
    const method = editingPageId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setPageError(data.error || "حدث خطأ");
        setSavingPage(false);
        return;
      }

      setShowPageModal(false);
      setPageForm(emptyPageForm);
      setEditingPageId(null);
      await fetchPages();
    } catch {
      setPageError("تعذر الاتصال بالخادم");
    } finally {
      setSavingPage(false);
    }
  };

  const handleDeletePage = async (id: number, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("فشل الحذف");
        return;
      }
      await fetchPages();
    } catch {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const fetchBots = async () => {
    try {
      const res = await fetch("/api/admin/bots");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const json = await res.json();
      setBots(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBots(false);
    }
  };

  const openAddBot = () => {
    setEditingBotId(null);
    setBotForm(emptyBotForm);
    setBotError("");
    setShowBotModal(true);
  };

  const openEditBot = (bot: TelegramBot) => {
    setEditingBotId(bot.id);
    setBotForm({
      name: bot.name,
      description: bot.description,
      bot_url: bot.bot_url,
      image_url: bot.image_url,
      category: bot.category,
      is_published: bot.is_published,
    });
    setBotError("");
    setShowBotModal(true);
  };

  const handleSaveBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBot(true);
    setBotError("");

    const url = editingBotId
      ? `/api/admin/bots/${editingBotId}`
      : "/api/admin/bots";
    const method = editingBotId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(botForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setBotError(data.error || "حدث خطأ");
        setSavingBot(false);
        return;
      }

      setShowBotModal(false);
      setBotForm(emptyBotForm);
      setEditingBotId(null);
      await fetchBots();
    } catch {
      setBotError("تعذر الاتصال بالخادم");
    } finally {
      setSavingBot(false);
    }
  };

  const handleDeleteBot = async (id: number, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    try {
      const res = await fetch(`/api/admin/bots/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("فشل الحذف");
        return;
      }
      await fetchBots();
    } catch {
      alert("تعذر الاتصال بالخادم");
    }
  };

  useEffect(() => {
    fetchPages();
    fetchBots();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/admin");
  };

  return (
    <main className="min-h-screen">
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Ichancy Bet"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <h1 className="text-xl font-bold">لوحة الإدارة</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition"
            >
              عرض الموقع
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm border border-red-500/30 transition"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab("pages")}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition ${
              activeTab === "pages"
                ? "bg-emerald-500 text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🏆 البكجات
          </button>
          <button
            onClick={() => setActiveTab("bots")}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition ${
              activeTab === "bots"
                ? "bg-emerald-500 text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🤖 البوتات
          </button>
        </div>

        {activeTab === "pages" && (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-2xl font-bold">إدارة البكجات</h2>
              <button
                onClick={openAddPage}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold transition"
              >
                + إضافة بكج جديد
              </button>
            </div>

            {loadingPages ? (
              <div className="text-center py-20 text-slate-500">جاري التحميل...</div>
            ) : pages.length === 0 ? (
              <div className="text-center py-20 text-slate-500">لا توجد بكجات بعد</div>
            ) : (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-950 border-b border-slate-800">
                    <tr>
                      <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">الاسم</th>
                      <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold hidden md:table-cell">الكود</th>
                      <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold hidden md:table-cell">الريت</th>
                      <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((p) => (
                      <tr key={p.id} className="border-b border-slate-800 last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-xs text-slate-500 md:hidden">{p.code}</div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="font-mono text-emerald-400 text-sm">{p.code}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-emerald-400 font-semibold">{p.rate}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditPage(p)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs transition"
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => handleDeletePage(p.id, p.name)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs border border-red-500/30 transition"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === "bots" && (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-2xl font-bold">إدارة البوتات</h2>
              <button
                onClick={openAddBot}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold transition"
              >
                + إضافة بوت جديد
              </button>
            </div>

            {loadingBots ? (
              <div className="text-center py-20 text-slate-500">جاري التحميل...</div>
            ) : bots.length === 0 ? (
              <div className="text-center py-20 text-slate-500">لا توجد بوتات بعد</div>
            ) : (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-950 border-b border-slate-800">
                    <tr>
                      <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">الاسم</th>
                      <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold hidden md:table-cell">التصنيف</th>
                      <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bots.map((b) => (
                      <tr key={b.id} className="border-b border-slate-800 last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-semibold">{b.name}</div>
                          <div className="text-xs text-slate-500 md:hidden">{b.category}</div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-emerald-400 text-sm">{b.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditBot(b)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs transition"
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => handleDeleteBot(b.id, b.name)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs border border-red-500/30 transition"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      {showPageModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-xl font-bold">
                {editingPageId ? "تعديل بكج" : "إضافة بكج جديد"}
              </h3>
              <button
                onClick={() => setShowPageModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePage} className="p-5 space-y-4">
              {pageError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {pageError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">اسم البكج *</label>
                  <input
                    type="text"
                    value={pageForm.name}
                    onChange={(e) => setPageForm({ ...pageForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">الوصف</label>
                  <input
                    type="text"
                    value={pageForm.description}
                    onChange={(e) => setPageForm({ ...pageForm, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">الكود *</label>
                  <input
                    type="text"
                    value={pageForm.code}
                    onChange={(e) => setPageForm({ ...pageForm, code: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white font-mono transition"
                    required
                    dir="ltr"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">رابط الصورة</label>
                  <input
                    type="url"
                    value={pageForm.image_url}
                    onChange={(e) => setPageForm({ ...pageForm, image_url: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition"
                    dir="ltr"
                    placeholder="https://..."
                  />
                  {pageForm.image_url && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={pageForm.image_url} alt="معاينة" className="w-full h-40 object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">التصنيف</label>
                  <input
                    type="text"
                    value={pageForm.category}
                    onChange={(e) => setPageForm({ ...pageForm, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">الريت</label>
                  <input
                    type="text"
                    value={pageForm.rate}
                    onChange={(e) => setPageForm({ ...pageForm, rate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition"
                    placeholder="×1"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="page_is_published"
                    checked={pageForm.is_published}
                    onChange={(e) => setPageForm({ ...pageForm, is_published: e.target.checked })}
                    className="w-5 h-5 rounded accent-emerald-500"
                  />
                  <label htmlFor="page_is_published" className="text-sm text-slate-300">
                    نشر البكج (يظهر للزوار)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingPage}
                  className="flex-1 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 font-bold transition"
                >
                  {savingPage ? "جاري الحفظ..." : editingPageId ? "حفظ التعديلات" : "إضافة البكج"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPageModal(false)}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBotModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-xl font-bold">
                {editingBotId ? "تعديل بوت" : "إضافة بوت جديد"}
              </h3>
              <button
                onClick={() => setShowBotModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBot} className="p-5 space-y-4">
              {botError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {botError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">اسم البوت *</label>
                  <input
                    type="text"
                    value={botForm.name}
                    onChange={(e) => setBotForm({ ...botForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">الوصف</label>
                  <input
                    type="text"
                    value={botForm.description}
                    onChange={(e) => setBotForm({ ...botForm, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">رابط البوت *</label>
                  <input
                    type="url"
                    value={botForm.bot_url}
                    onChange={(e) => setBotForm({ ...botForm, bot_url: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition"
                    required
                    dir="ltr"
                    placeholder="https://t.me/username"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">رابط الصورة</label>
                  <input
                    type="url"
                    value={botForm.image_url}
                    onChange={(e) => setBotForm({ ...botForm, image_url: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition"
                    dir="ltr"
                    placeholder="https://..."
                  />
                  {botForm.image_url && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={botForm.image_url} alt="معاينة" className="w-full h-40 object-cover" />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">التصنيف</label>
                  <input
                    type="text"
                    value={botForm.category}
                    onChange={(e) => setBotForm({ ...botForm, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="bot_is_published"
                    checked={botForm.is_published}
                    onChange={(e) => setBotForm({ ...botForm, is_published: e.target.checked })}
                    className="w-5 h-5 rounded accent-emerald-500"
                  />
                  <label htmlFor="bot_is_published" className="text-sm text-slate-300">
                    نشر البوت (يظهر للزوار)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingBot}
                  className="flex-1 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 font-bold transition"
                >
                  {savingBot ? "جاري الحفظ..." : editingBotId ? "حفظ التعديلات" : "إضافة البوت"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBotModal(false)}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}