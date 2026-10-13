"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SportsPage = {
  id: number;
  name: string;
  description: string;
  code: string;
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

type Message = {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

const emptyPageForm = {
  name: "",
  description: "",
  code: "",
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

  const [activeTab, setActiveTab] = useState<"pages" | "bots" | "messages">("pages");

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

  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [viewingMessage, setViewingMessage] = useState<Message | null>(null);

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

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/messages");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const json = await res.json();
      setMessages(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const openMessage = async (msg: Message) => {
    setViewingMessage(msg);
    if (!msg.is_read) {
      try {
        await fetch(`/api/admin/messages/${msg.id}`, { method: "PUT" });
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف الرسالة؟")) return;
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("فشل الحذف");
        return;
      }
      setViewingMessage(null);
      await fetchMessages();
    } catch {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  useEffect(() => {
    fetchPages();
    fetchBots();
    fetchMessages();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/admin");
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
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center font-bold text-slate-900 text-xl">
              ⚽
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-xl font-bold">لوحة الإدارة</h1>
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
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/admin/stats"
              className="px-4 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-sm border border-sky-500/30 transition"
            >
              📊 الإحصائيات
            </a>
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
        <div className="flex gap-2 mb-6 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit flex-wrap">
          <button
            onClick={() => setActiveTab("pages")}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition ${
              activeTab === "pages"
                ? "bg-sky-500 text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🏆 البكجات
          </button>
          <button
            onClick={() => setActiveTab("bots")}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition ${
              activeTab === "bots"
                ? "bg-sky-500 text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🤖 البوتات
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
              activeTab === "messages"
                ? "bg-sky-500 text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            📬 الرسائل
            {unreadCount > 0 && (
              <span
                className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs flex items-center justify-center font-bold ${
                  activeTab === "messages"
                    ? "bg-slate-900 text-sky-400"
                    : "bg-red-500 text-white"
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {activeTab === "pages" && (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-2xl font-bold">إدارة البكجات</h2>
              <button
                onClick={openAddPage}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold transition"
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
                          <span className="font-mono text-sky-400 text-sm">{p.code}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sky-400 font-semibold">{p.rate}</span>
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
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold transition"
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
                          <span className="text-sky-400 text-sm">{b.category}</span>
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

        {activeTab === "messages" && (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-2xl font-bold">الرسائل</h2>
              <button
                onClick={fetchMessages}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition"
              >
                🔄 تحديث
              </button>
            </div>

            {loadingMessages ? (
              <div className="text-center py-20 text-slate-500">جاري التحميل...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20 text-slate-500">لا توجد رسائل بعد</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {messages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => openMessage(msg)}
                    className={`text-right bg-slate-900 rounded-2xl border p-5 hover:border-sky-500/50 transition ${
                      msg.is_read
                        ? "border-slate-800"
                        : "border-sky-500/50 bg-sky-500/5"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sky-400 shrink-0">
                          {msg.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold truncate">{msg.name}</div>
                          <div className="text-xs text-slate-500 truncate" dir="ltr">
                            {msg.email}
                          </div>
                        </div>
                      </div>
                      {!msg.is_read && (
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0 mt-1"></span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                      {msg.message}
                    </p>
                    <div className="text-xs text-slate-600">
                      {formatDate(msg.created_at)}
                    </div>
                  </button>
                ))}
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
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">الوصف</label>
                  <input
                    type="text"
                    value={pageForm.description}
                    onChange={(e) => setPageForm({ ...pageForm, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">الكود *</label>
                  <input
                    type="text"
                    value={pageForm.code}
                    onChange={(e) => setPageForm({ ...pageForm, code: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white font-mono transition"
                    required
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">التصنيف</label>
                  <input
                    type="text"
                    value={pageForm.category}
                    onChange={(e) => setPageForm({ ...pageForm, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">الريت</label>
                  <input
                    type="text"
                    value={pageForm.rate}
                    onChange={(e) => setPageForm({ ...pageForm, rate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                    placeholder="×1"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="page_is_published"
                    checked={pageForm.is_published}
                    onChange={(e) => setPageForm({ ...pageForm, is_published: e.target.checked })}
                    className="w-5 h-5 rounded accent-sky-500"
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
                  className="flex-1 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-900 font-bold transition"
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
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">الوصف</label>
                  <input
                    type="text"
                    value={botForm.description}
                    onChange={(e) => setBotForm({ ...botForm, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">رابط البوت *</label>
                  <input
                    type="url"
                    value={botForm.bot_url}
                    onChange={(e) => setBotForm({ ...botForm, bot_url: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
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
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
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
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="bot_is_published"
                    checked={botForm.is_published}
                    onChange={(e) => setBotForm({ ...botForm, is_published: e.target.checked })}
                    className="w-5 h-5 rounded accent-sky-500"
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
                  className="flex-1 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-900 font-bold transition"
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

      {viewingMessage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sky-400 text-xl">
                  {viewingMessage.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{viewingMessage.name}</h3>
                  <a
                    href={`mailto:${viewingMessage.email}`}
                    className="text-sm text-sky-400 hover:underline"
                    dir="ltr"
                  >
                    {viewingMessage.email}
                  </a>
                </div>
              </div>
              <button
                onClick={() => setViewingMessage(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              <div className="text-xs text-slate-500 mb-4">
                {formatDate(viewingMessage.created_at)}
              </div>

              <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 mb-5">
                <p className="text-white whitespace-pre-wrap leading-relaxed">
                  {viewingMessage.message}
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <a
                  href={`mailto:${viewingMessage.email}?subject=رد على رسالتك`}
                  className="flex-1 min-w-[140px] px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold text-center transition"
                >
                  ✉️ رد عبر الإيميل
                </a>
                <button
                  onClick={() => handleDeleteMessage(viewingMessage.id)}
                  className="px-5 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition"
                >
                  حذف
                </button>
                <button
                  onClick={() => setViewingMessage(null)}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}