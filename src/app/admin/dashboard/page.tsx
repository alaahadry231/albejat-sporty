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

type SpinCode = {
  id: number;
  code: string;
  is_used: boolean;
  used_at: string | null;
  prize_won: string | null;
  prize_type: string | null;
  created_at: string;
};

type Match = {
  id: number;
  team1: string;
  team2: string;
  match_date: string;
  status: string;
  predictions_open: boolean;
  final_score1: number | null;
  final_score2: number | null;
  created_at: string;
  predictions_count: number;
};

type Prediction = {
  id: number;
  match_id: number;
  name: string;
  telegram: string;
  score1: number;
  score2: number;
  is_winner: boolean;
  created_at: string;
};

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  is_active: boolean;
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

const emptyMatchForm = {
  team1: "",
  team2: "",
  match_date_date: "",
  match_date_time: "",
};

const emptyNotificationForm = {
  title: "",
  message: "",
  type: "info",
};

export default function DashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "pages" | "bots" | "messages" | "spin-codes" | "matches" | "notifications"
  >("pages");

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

  const [spinCodes, setSpinCodes] = useState<SpinCode[]>([]);
  const [loadingSpinCodes, setLoadingSpinCodes] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateCount, setGenerateCount] = useState("1");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [filterUsed, setFilterUsed] = useState<"all" | "used" | "unused">(
    "all"
  );

  const [wheelEnabled, setWheelEnabled] = useState<boolean | null>(null);
  const [togglingWheel, setTogglingWheel] = useState(false);

  // Predict status
  const [predictEnabled, setPredictEnabled] = useState<boolean | null>(null);
  const [togglingPredict, setTogglingPredict] = useState(false);

  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchForm, setMatchForm] = useState(emptyMatchForm);
  const [savingMatch, setSavingMatch] = useState(false);
  const [matchError, setMatchError] = useState("");

  const [viewingPredictions, setViewingPredictions] = useState<{
    match: Match | null;
    predictions: Prediction[];
    loading: boolean;
  }>({
    match: null,
    predictions: [],
    loading: false,
  });

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishMatch, setFinishMatch] = useState<Match | null>(null);
  const [finishScore1, setFinishScore1] = useState("0");
  const [finishScore2, setFinishScore2] = useState("0");
  const [finishingMatch, setFinishingMatch] = useState(false);
  const [finishError, setFinishError] = useState("");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationForm, setNotificationForm] = useState(emptyNotificationForm);
  const [savingNotification, setSavingNotification] = useState(false);
  const [notificationError, setNotificationError] = useState("");

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
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
      });
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

  const fetchSpinCodes = async () => {
    try {
      const res = await fetch("/api/admin/spin-codes");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const json = await res.json();
      setSpinCodes(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSpinCodes(false);
    }
  };

  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setGenerateError("");

    const count = parseInt(generateCount) || 1;

    if (count < 1 || count > 100) {
      setGenerateError("العدد يجب أن يكون بين 1 و 100");
      setGenerating(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/spin-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGenerateError(data.error || "فشل التوليد");
        setGenerating(false);
        return;
      }

      setShowGenerateModal(false);
      setGenerateCount("1");
      await fetchSpinCodes();
    } catch {
      setGenerateError("تعذر الاتصال بالخادم");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteSpinCode = async (id: number, code: string) => {
    if (!confirm(`هل أنت متأكد من حذف الكود "${code}"؟`)) return;
    try {
      const res = await fetch(`/api/admin/spin-codes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("فشل الحذف");
        return;
      }
      await fetchSpinCodes();
    } catch {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`تم نسخ الكود: ${code}`);
  };

  const fetchWheelStatus = async () => {
    try {
      const res = await fetch("/api/admin/spin-status");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const json = await res.json();
      setWheelEnabled(json.enabled ?? true);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWheel = async () => {
    if (togglingWheel || wheelEnabled === null) return;

    const newState = !wheelEnabled;

    const confirmMessage = newState
      ? "هل أنت متأكد من تشغيل العجلة؟ سيراها الزوار ويمكنهم اللعب."
      : "هل أنت متأكد من إيقاف العجلة؟ سيراها الزوار كـ 'قريباً'.";

    if (!confirm(confirmMessage)) return;

    setTogglingWheel(true);

    try {
      const res = await fetch("/api/admin/spin-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newState }),
      });

      if (!res.ok) {
        alert("فشل التحديث");
        return;
      }

      setWheelEnabled(newState);
    } catch {
      alert("تعذر الاتصال بالخادم");
    } finally {
      setTogglingWheel(false);
    }
  };

  // Predict status
  const fetchPredictStatus = async () => {
    try {
      const res = await fetch("/api/admin/predict-status");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const json = await res.json();
      setPredictEnabled(json.enabled ?? true);
    } catch (err) {
      console.error(err);
    }
  };

  const togglePredict = async () => {
    if (togglingPredict || predictEnabled === null) return;

    const newState = !predictEnabled;

    const confirmMessage = newState
      ? "هل أنت متأكد من تشغيل صفحة توقع واربح؟ سيراها الزوار ويمكنهم التوقع."
      : "هل أنت متأكد من إيقاف صفحة توقع واربح؟ سيراها الزوار كـ 'قريباً'.";

    if (!confirm(confirmMessage)) return;

    setTogglingPredict(true);

    try {
      const res = await fetch("/api/admin/predict-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newState }),
      });

      if (!res.ok) {
        alert("فشل التحديث");
        return;
      }

      setPredictEnabled(newState);
    } catch {
      alert("تعذر الاتصال بالخادم");
    } finally {
      setTogglingPredict(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/admin/matches");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const json = await res.json();
      setMatches(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const openAddMatch = () => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timeStr = `${hours}:${minutes}`;

    setMatchForm({
      team1: "",
      team2: "",
      match_date_date: dateStr,
      match_date_time: timeStr,
    });
    setMatchError("");
    setShowMatchModal(true);
  };

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMatch(true);
    setMatchError("");

    if (!matchForm.team1 || !matchForm.team2) {
      setMatchError("أسماء الفريقين مطلوبة");
      setSavingMatch(false);
      return;
    }

    if (!matchForm.match_date_date || !matchForm.match_date_time) {
      setMatchError("التاريخ والوقت مطلوبين");
      setSavingMatch(false);
      return;
    }

    const matchDate = `${matchForm.match_date_date}T${matchForm.match_date_time}:00`;

    try {
      const res = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team1: matchForm.team1,
          team2: matchForm.team2,
          match_date: matchDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMatchError(data.error || "حدث خطأ");
        setSavingMatch(false);
        return;
      }

      setShowMatchModal(false);
      setMatchForm(emptyMatchForm);
      await fetchMatches();
    } catch {
      setMatchError("تعذر الاتصال بالخادم");
    } finally {
      setSavingMatch(false);
    }
  };

  const handleTogglePredictions = async (match: Match) => {
    const action = match.predictions_open ? "إيقاف" : "فتح";
    if (
      !confirm(
        `هل أنت متأكد من ${action} التوقعات على "${match.team1} × ${match.team2}"؟`
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_predictions" }),
      });

      if (!res.ok) {
        alert("فشل التحديث");
        return;
      }

      await fetchMatches();
    } catch {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const handleDeleteMatch = async (match: Match) => {
    if (
      !confirm(
        `هل أنت متأكد من حذف "${match.team1} × ${match.team2}"؟ سيتم حذف جميع التوقعات المرتبطة.`
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/matches/${match.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("فشل الحذف");
        return;
      }
      await fetchMatches();
    } catch {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const openFinishModal = (match: Match) => {
    setFinishMatch(match);
    setFinishScore1("0");
    setFinishScore2("0");
    setFinishError("");
    setShowFinishModal(true);
  };

  const handleFinishMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finishMatch) return;

    setFinishingMatch(true);
    setFinishError("");

    try {
      const res = await fetch(`/api/admin/matches/${finishMatch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "finish",
          final_score1: parseInt(finishScore1),
          final_score2: parseInt(finishScore2),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFinishError(data.error || "حدث خطأ");
        setFinishingMatch(false);
        return;
      }

      setShowFinishModal(false);
      setFinishMatch(null);
      await fetchMatches();
    } catch {
      setFinishError("تعذر الاتصال بالخادم");
    } finally {
      setFinishingMatch(false);
    }
  };

  const openPredictions = async (match: Match) => {
    setViewingPredictions({
      match,
      predictions: [],
      loading: true,
    });

    try {
      const res = await fetch(`/api/admin/predictions?match_id=${match.id}`);
      const json = await res.json();
      setViewingPredictions((prev) => ({
        ...prev,
        predictions: json.data || [],
        loading: false,
      }));
    } catch {
      setViewingPredictions((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  const handleToggleWinner = async (predictionId: number) => {
    try {
      const res = await fetch(`/api/admin/predictions/${predictionId}`, {
        method: "PUT",
      });

      if (!res.ok) {
        alert("فشل التحديث");
        return;
      }

      setViewingPredictions((prev) => ({
        ...prev,
        predictions: prev.predictions.map((p) =>
          p.id === predictionId ? { ...p, is_winner: !p.is_winner } : p
        ),
      }));
    } catch {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const json = await res.json();
      setNotifications(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const openAddNotification = () => {
    setNotificationForm(emptyNotificationForm);
    setNotificationError("");
    setShowNotificationModal(true);
  };

  const handleSaveNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotification(true);
    setNotificationError("");

    if (!notificationForm.title || !notificationForm.message) {
      setNotificationError("العنوان والرسالة مطلوبين");
      setSavingNotification(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setNotificationError(data.error || "حدث خطأ");
        setSavingNotification(false);
        return;
      }

      setShowNotificationModal(false);
      setNotificationForm(emptyNotificationForm);
      await fetchNotifications();
    } catch {
      setNotificationError("تعذر الاتصال بالخادم");
    } finally {
      setSavingNotification(false);
    }
  };

  const handleToggleNotification = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle" }),
      });

      if (!res.ok) {
        alert("فشل التحديث");
        return;
      }

      await fetchNotifications();
    } catch {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const handleDeleteNotification = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف الإشعار؟")) return;
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("فشل الحذف");
        return;
      }
      await fetchNotifications();
    } catch {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const filteredSpinCodes = spinCodes.filter((c) => {
    if (filterUsed === "used") return c.is_used;
    if (filterUsed === "unused") return !c.is_used;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;
  const unusedCodesCount = spinCodes.filter((c) => !c.is_used).length;
  const upcomingMatchesCount = matches.filter(
    (m) => m.status === "upcoming"
  ).length;
  const activeNotificationsCount = notifications.filter(
    (n) => n.is_active
  ).length;

  useEffect(() => {
    fetchPages();
    fetchBots();
    fetchMessages();
    fetchSpinCodes();
    fetchWheelStatus();
    fetchPredictStatus();
    fetchMatches();
    fetchNotifications();
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

  const getNotificationTypeStyle = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "warning":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-sky-500/20 text-sky-400 border-sky-500/30";
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "success":
        return "🎉 نجاح";
      case "warning":
        return "⚠️ تحذير";
      case "error":
        return "🚨 خطأ";
      default:
        return "📢 معلومة";
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
        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Wheel Control Card */}
          <div
            className={`rounded-2xl border-2 p-5 flex items-center justify-between flex-wrap gap-4 transition ${
              wheelEnabled
                ? "bg-green-500/5 border-green-500/30"
                : "bg-red-500/5 border-red-500/30"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                  wheelEnabled
                    ? "bg-green-500/20 border border-green-500/40"
                    : "bg-red-500/20 border border-red-500/40"
                }`}
              >
                {wheelEnabled ? "🎡" : "⏸️"}
              </div>
              <div>
                <div className="text-sm text-slate-400 mb-1">
                  حالة عجلة الفرص
                </div>
                <div
                  className={`text-base font-bold ${
                    wheelEnabled ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {wheelEnabled === null
                    ? "جاري التحميل..."
                    : wheelEnabled
                    ? "✅ مفعّلة"
                    : "⏸️ موقفة (قريباً)"}
                </div>
              </div>
            </div>

            <button
              onClick={toggleWheel}
              disabled={togglingWheel || wheelEnabled === null}
              className={`px-5 py-2.5 rounded-xl font-bold text-white transition whitespace-nowrap text-sm ${
                wheelEnabled
                  ? "bg-red-500 hover:bg-red-400"
                  : "bg-green-500 hover:bg-green-400"
              } disabled:opacity-50`}
            >
              {togglingWheel
                ? "..."
                : wheelEnabled
                ? "⏸️ إيقاف"
                : "▶️ تشغيل"}
            </button>
          </div>

          {/* Predict Control Card */}
          <div
            className={`rounded-2xl border-2 p-5 flex items-center justify-between flex-wrap gap-4 transition ${
              predictEnabled
                ? "bg-green-500/5 border-green-500/30"
                : "bg-red-500/5 border-red-500/30"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                  predictEnabled
                    ? "bg-green-500/20 border border-green-500/40"
                    : "bg-red-500/20 border border-red-500/40"
                }`}
              >
                {predictEnabled ? "🎯" : "⏸️"}
              </div>
              <div>
                <div className="text-sm text-slate-400 mb-1">
                  حالة توقع واربح
                </div>
                <div
                  className={`text-base font-bold ${
                    predictEnabled ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {predictEnabled === null
                    ? "جاري التحميل..."
                    : predictEnabled
                    ? "✅ مفعّلة"
                    : "⏸️ موقفة (قريباً)"}
                </div>
              </div>
            </div>

            <button
              onClick={togglePredict}
              disabled={togglingPredict || predictEnabled === null}
              className={`px-5 py-2.5 rounded-xl font-bold text-white transition whitespace-nowrap text-sm ${
                predictEnabled
                  ? "bg-red-500 hover:bg-red-400"
                  : "bg-green-500 hover:bg-green-400"
              } disabled:opacity-50`}
            >
              {togglingPredict
                ? "..."
                : predictEnabled
                ? "⏸️ إيقاف"
                : "▶️ تشغيل"}
            </button>
          </div>
        </div>

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
            onClick={() => setActiveTab("matches")}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
              activeTab === "matches"
                ? "bg-sky-500 text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🎯 توقع واربح
            {upcomingMatchesCount > 0 && (
              <span
                className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs flex items-center justify-center font-bold ${
                  activeTab === "matches"
                    ? "bg-slate-900 text-sky-400"
                    : "bg-sky-500 text-white"
                }`}
              >
                {upcomingMatchesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
              activeTab === "notifications"
                ? "bg-sky-500 text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            📢 الإشعارات
            {activeNotificationsCount > 0 && (
              <span
                className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs flex items-center justify-center font-bold ${
                  activeTab === "notifications"
                    ? "bg-slate-900 text-sky-400"
                    : "bg-green-500 text-white"
                }`}
              >
                {activeNotificationsCount}
              </span>
            )}
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
          <button
            onClick={() => setActiveTab("spin-codes")}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
              activeTab === "spin-codes"
                ? "bg-sky-500 text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🎟️ أكواد العجلة
            {unusedCodesCount > 0 && (
              <span
                className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs flex items-center justify-center font-bold ${
                  activeTab === "spin-codes"
                    ? "bg-slate-900 text-sky-400"
                    : "bg-green-500 text-white"
                }`}
              >
                {unusedCodesCount}
              </span>
            )}
          </button>
        </div>

        {activeTab === "notifications" && (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold">الإشعارات</h2>
                <p className="text-slate-400 text-sm mt-1">
                  إجمالي: {notifications.length} | مفعّلة: {activeNotificationsCount}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={fetchNotifications}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition"
                >
                  🔄 تحديث
                </button>
                <button
                  onClick={openAddNotification}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold transition"
                >
                  + إضافة إشعار
                </button>
              </div>
            </div>

            {loadingNotifications ? (
              <div className="text-center py-20 text-slate-500">
                جاري التحميل...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                لا توجد إشعارات بعد — اضغط &quot;إضافة إشعار&quot;
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`bg-slate-900 rounded-2xl border p-5 ${
                      n.is_active
                        ? "border-sky-500/30"
                        : "border-slate-800 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-lg">{n.title}</h3>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${getNotificationTypeStyle(
                              n.type
                            )}`}
                          >
                            {getNotificationTypeLabel(n.type)}
                          </span>
                          {n.is_active ? (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
                              ✅ مفعّل
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-xs font-semibold">
                              ⏸️ مخفي
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap">
                          {n.message}
                        </p>
                        <div className="text-xs text-slate-500 mt-2">
                          {formatDate(n.created_at)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleToggleNotification(n.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition border ${
                          n.is_active
                            ? "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/30"
                        }`}
                      >
                        {n.is_active ? "⏸️ إخفاء" : "▶️ تفعيل"}
                      </button>
                      <button
                        onClick={() => handleDeleteNotification(n.id)}
                        className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold border border-red-500/30 transition"
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

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
              <div className="text-center py-20 text-slate-500">
                جاري التحميل...
              </div>
            ) : pages.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                لا توجد بكجات بعد
              </div>
            ) : (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-950 border-b border-slate-800">
                    <tr>
                      <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">
                        الاسم
                      </th>
                      <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold hidden md:table-cell">
                        الكود
                      </th>
                      <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold hidden md:table-cell">
                        الريت
                      </th>
                      <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-slate-800 last:border-0"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-xs text-slate-500 md:hidden">
                            {p.code}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="font-mono text-sky-400 text-sm">
                            {p.code}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sky-400 font-semibold">
                            {p.rate}
                          </span>
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
              <div className="text-center py-20 text-slate-500">
                جاري التحميل...
              </div>
            ) : bots.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                لا توجد بوتات بعد
              </div>
            ) : (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-950 border-b border-slate-800">
                    <tr>
                      <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">
                        الاسم
                      </th>
                      <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold hidden md:table-cell">
                        التصنيف
                      </th>
                      <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bots.map((b) => (
                      <tr
                        key={b.id}
                        className="border-b border-slate-800 last:border-0"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold">{b.name}</div>
                          <div className="text-xs text-slate-500 md:hidden">
                            {b.category}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sky-400 text-sm">
                            {b.category}
                          </span>
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

        {activeTab === "matches" && (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold">إدارة المباريات</h2>
                <p className="text-slate-400 text-sm mt-1">
                  إجمالي: {matches.length} | قادمة: {upcomingMatchesCount}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={fetchMatches}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition"
                >
                  🔄 تحديث
                </button>
                <button
                  onClick={openAddMatch}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold transition"
                >
                  + إضافة مباراة
                </button>
              </div>
            </div>

            {loadingMatches ? (
              <div className="text-center py-20 text-slate-500">
                جاري التحميل...
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                لا توجد مباريات بعد — اضغط &quot;إضافة مباراة&quot;
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => (
                  <div
                    key={m.id}
                    className={`bg-slate-900 rounded-2xl border p-5 ${
                      m.status === "finished"
                        ? "border-slate-800 opacity-75"
                        : m.predictions_open
                        ? "border-sky-500/30"
                        : "border-yellow-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-bold mb-1">
                          {m.team1} <span className="text-slate-500">×</span>{" "}
                          {m.team2}
                        </div>
                        <div className="text-xs text-slate-400">
                          📅 {formatDate(m.match_date)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {m.status === "upcoming" ? (
                          m.predictions_open ? (
                            <span className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
                              ✅ التوقعات مفتوحة
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold border border-yellow-500/30">
                              🔒 التوقعات موقفة
                            </span>
                          )
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-xs font-semibold">
                            🏁 انتهت: {m.final_score1} - {m.final_score2}
                          </span>
                        )}

                        <span className="inline-block px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold border border-sky-500/30">
                          👥 {m.predictions_count} توقع
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => openPredictions(m)}
                        className="px-4 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-sm font-semibold border border-sky-500/30 transition"
                      >
                        👥 التوقعات ({m.predictions_count})
                      </button>

                      {m.status === "upcoming" && (
                        <>
                          <button
                            onClick={() => handleTogglePredictions(m)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition border ${
                              m.predictions_open
                                ? "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/30"
                            }`}
                          >
                            {m.predictions_open
                              ? "⏸️ إيقاف التوقعات"
                              : "▶️ فتح التوقعات"}
                          </button>

                          <button
                            onClick={() => openFinishModal(m)}
                            className="px-4 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-semibold border border-green-500/30 transition"
                          >
                            ✅ إنهاء المباراة
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDeleteMatch(m)}
                        className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold border border-red-500/30 transition"
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                ))}
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
              <div className="text-center py-20 text-slate-500">
                جاري التحميل...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                لا توجد رسائل بعد
              </div>
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
                          <div
                            className="text-xs text-slate-500 truncate"
                            dir="ltr"
                          >
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

        {activeTab === "spin-codes" && (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold">أكواد العجلة</h2>
                <p className="text-slate-400 text-sm mt-1">
                  إجمالي: {spinCodes.length} | مستخدمة:{" "}
                  {spinCodes.length - unusedCodesCount} | متاحة: {unusedCodesCount}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={fetchSpinCodes}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition"
                >
                  🔄 تحديث
                </button>
                <button
                  onClick={() => {
                    setShowGenerateModal(true);
                    setGenerateError("");
                    setGenerateCount("1");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold transition"
                >
                  + توليد أكواد جديدة
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setFilterUsed("all")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filterUsed === "all"
                    ? "bg-sky-500 text-slate-900"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                الكل ({spinCodes.length})
              </button>
              <button
                onClick={() => setFilterUsed("unused")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filterUsed === "unused"
                    ? "bg-green-500 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                ✅ متاحة ({unusedCodesCount})
              </button>
              <button
                onClick={() => setFilterUsed("used")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filterUsed === "used"
                    ? "bg-slate-700 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                🔒 مستخدمة ({spinCodes.length - unusedCodesCount})
              </button>
            </div>

            {loadingSpinCodes ? (
              <div className="text-center py-20 text-slate-500">
                جاري التحميل...
              </div>
            ) : filteredSpinCodes.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                {spinCodes.length === 0
                  ? 'لا توجد أكواد بعد — اضغط "توليد أكواد جديدة"'
                  : "لا توجد أكواد بهذا الفلتر"}
              </div>
            ) : (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-950 border-b border-slate-800">
                      <tr>
                        <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">
                          الكود
                        </th>
                        <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">
                          الحالة
                        </th>
                        <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">
                          الجائزة
                        </th>
                        <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold hidden md:table-cell">
                          التاريخ
                        </th>
                        <th className="text-right px-4 py-3 text-sm text-slate-400 font-semibold">
                          إجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSpinCodes.map((c) => (
                        <tr
                          key={c.id}
                          className="border-b border-slate-800 last:border-0"
                        >
                          <td className="px-4 py-3">
                            <button
                              onClick={() => copyCode(c.code)}
                              className="font-mono text-sky-400 hover:text-sky-300 text-sm font-bold hover:underline"
                              dir="ltr"
                              title="اضغط للنسخ"
                            >
                              {c.code}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            {c.is_used ? (
                              <span className="inline-block px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-xs font-semibold">
                                🔒 مستخدم
                              </span>
                            ) : (
                              <span className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
                                ✅ متاح
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {c.prize_won ? (
                              <span
                                className={`font-bold text-sm ${
                                  c.prize_type === "win"
                                    ? "text-sky-400"
                                    : c.prize_type === "retry"
                                    ? "text-yellow-400"
                                    : "text-slate-500"
                                }`}
                              >
                                {c.prize_type === "win" && "🎉 "}
                                {c.prize_type === "lose" && "😢 "}
                                {c.prize_type === "retry" && "🔄 "}
                                {c.prize_won}
                              </span>
                            ) : (
                              <span className="text-slate-600 text-sm">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="text-xs text-slate-500">
                              {c.used_at ? (
                                <>
                                  <div className="text-slate-400">
                                    استُخدم:
                                  </div>
                                  {formatDate(c.used_at)}
                                </>
                              ) : (
                                <>
                                  <div className="text-slate-400">
                                    أُنشئ:
                                  </div>
                                  {formatDate(c.created_at)}
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() =>
                                handleDeleteSpinCode(c.id, c.code)
                              }
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs border border-red-500/30 transition"
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-xl font-bold">إضافة إشعار جديد</h3>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNotification} className="p-5 space-y-4">
              {notificationError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {notificationError}
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  نوع الإشعار
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "info", label: "📢 معلومة" },
                    { value: "success", label: "🎉 نجاح" },
                    { value: "warning", label: "⚠️ تحذير" },
                    { value: "error", label: "🚨 خطأ" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() =>
                        setNotificationForm({
                          ...notificationForm,
                          type: t.value,
                        })
                      }
                      className={`px-4 py-3 rounded-xl text-sm font-semibold transition border ${
                        notificationForm.type === t.value
                          ? "bg-sky-500 text-slate-900 border-sky-500"
                          : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  العنوان *
                </label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                  placeholder="مثال: تم اختيار الرابحين!"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  الرسالة *
                </label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      message: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition resize-none"
                  placeholder="اكتب نص الإشعار..."
                  maxLength={500}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingNotification}
                  className="flex-1 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-900 font-bold transition"
                >
                  {savingNotification ? "جاري الحفظ..." : "إضافة الإشعار"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(false)}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-xl font-bold">توليد أكواد جديدة</h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateCodes} className="p-5 space-y-4">
              {generateError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {generateError}
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  عدد الأكواد (1-100)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={generateCount}
                  onChange={(e) => setGenerateCount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition text-center text-lg font-bold"
                  required
                />
              </div>

              <div className="flex gap-2">
                {[1, 5, 10, 25, 50].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setGenerateCount(String(n))}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                      generateCount === String(n)
                        ? "bg-sky-500 text-slate-900"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={generating}
                  className="flex-1 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-900 font-bold transition"
                >
                  {generating ? "جاري التوليد..." : "توليد"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMatchModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-xl font-bold">إضافة مباراة</h3>
              <button
                onClick={() => setShowMatchModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMatch} className="p-5 space-y-4">
              {matchError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {matchError}
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  الفريق الأول *
                </label>
                <input
                  type="text"
                  value={matchForm.team1}
                  onChange={(e) =>
                    setMatchForm({ ...matchForm, team1: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                  placeholder="مثال: ريال مدريد"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  الفريق الثاني *
                </label>
                <input
                  type="text"
                  value={matchForm.team2}
                  onChange={(e) =>
                    setMatchForm({ ...matchForm, team2: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                  placeholder="مثال: برشلونة"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    📅 التاريخ *
                  </label>
                  <input
                    type="date"
                    value={matchForm.match_date_date}
                    onChange={(e) =>
                      setMatchForm({
                        ...matchForm,
                        match_date_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                    required
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    🕐 الوقت *
                  </label>
                  <input
                    type="time"
                    value={matchForm.match_date_time}
                    onChange={(e) =>
                      setMatchForm({
                        ...matchForm,
                        match_date_time: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                    required
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingMatch}
                  className="flex-1 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-900 font-bold transition"
                >
                  {savingMatch ? "جاري الحفظ..." : "إضافة المباراة"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMatchModal(false)}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFinishModal && finishMatch && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold">✅ إنهاء المباراة</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {finishMatch.team1} × {finishMatch.team2}
                </p>
              </div>
              <button
                onClick={() => setShowFinishModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFinishMatch} className="p-5 space-y-4">
              {finishError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {finishError}
                </div>
              )}

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-yellow-400 text-sm text-center">
                ⚠️ بعد الإنهاء، ما رح يقدر الزوار يتوقعوا، ورح تظهر النتيجة في
                صفحة الزوار
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-3 text-center">
                  النتيجة النهائية
                </label>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex-1 text-center">
                    <div className="text-sm text-slate-400 mb-2 truncate">
                      {finishMatch.team1}
                    </div>
                    <input
                      type="number"
                      value={finishScore1}
                      onChange={(e) => setFinishScore1(e.target.value)}
                      min="0"
                      max="50"
                      className="w-20 h-20 mx-auto text-center text-3xl font-bold rounded-xl bg-slate-950 border-2 border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                    />
                  </div>
                  <div className="text-slate-500 text-2xl">-</div>
                  <div className="flex-1 text-center">
                    <div className="text-sm text-slate-400 mb-2 truncate">
                      {finishMatch.team2}
                    </div>
                    <input
                      type="number"
                      value={finishScore2}
                      onChange={(e) => setFinishScore2(e.target.value)}
                      min="0"
                      max="50"
                      className="w-20 h-20 mx-auto text-center text-3xl font-bold rounded-xl bg-slate-950 border-2 border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={finishingMatch}
                  className="flex-1 px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-bold transition"
                >
                  {finishingMatch ? "جاري الحفظ..." : "✅ تأكيد الإنهاء"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFinishModal(false)}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingPredictions.match !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-3xl my-8 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-bold">👥 التوقعات</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {viewingPredictions.match.team1} ×{" "}
                  {viewingPredictions.match.team2}
                </p>
              </div>
              <button
                onClick={() =>
                  setViewingPredictions({
                    match: null,
                    predictions: [],
                    loading: false,
                  })
                }
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              {viewingPredictions.loading ? (
                <div className="text-center py-10 text-slate-500">
                  جاري التحميل...
                </div>
              ) : viewingPredictions.predictions.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <div className="text-5xl mb-3">📭</div>
                  <p>لا توجد توقعات بعد</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {viewingPredictions.predictions.map((p) => (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition ${
                        p.is_winner
                          ? "bg-green-500/5 border-green-500/40"
                          : "bg-slate-950 border-slate-800"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="font-bold truncate">{p.name}</div>
                          {p.is_winner && (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-bold">
                              🏆 فائز
                            </span>
                          )}
                        </div>
                        <a
                          href={`https://t.me/${p.telegram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-sky-400 hover:underline font-mono"
                          dir="ltr"
                        >
                          {p.telegram}
                        </a>
                      </div>
                      <div className="px-4 py-2 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-400 font-bold text-lg shrink-0">
                        {p.score1} - {p.score2}
                      </div>
                      <button
                        onClick={() => handleToggleWinner(p.id)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition border shrink-0 ${
                          p.is_winner
                            ? "bg-green-500 text-white border-green-500 hover:bg-green-600"
                            : "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                        }`}
                        title={p.is_winner ? "إلغاء الفوز" : "تحديد كفائز"}
                      >
                        {p.is_winner ? "✅" : "🏆"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                  <label className="block text-sm text-slate-400 mb-2">
                    اسم البكج *
                  </label>
                  <input
                    type="text"
                    value={pageForm.name}
                    onChange={(e) =>
                      setPageForm({ ...pageForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">
                    الوصف
                  </label>
                  <input
                    type="text"
                    value={pageForm.description}
                    onChange={(e) =>
                      setPageForm({ ...pageForm, description: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">
                    الكود *
                  </label>
                  <input
                    type="text"
                    value={pageForm.code}
                    onChange={(e) =>
                      setPageForm({ ...pageForm, code: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white font-mono transition"
                    required
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    التصنيف
                  </label>
                  <input
                    type="text"
                    value={pageForm.category}
                    onChange={(e) =>
                      setPageForm({ ...pageForm, category: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    الريت
                  </label>
                  <input
                    type="text"
                    value={pageForm.rate}
                    onChange={(e) =>
                      setPageForm({ ...pageForm, rate: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                    placeholder="×1"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="page_is_published"
                    checked={pageForm.is_published}
                    onChange={(e) =>
                      setPageForm({
                        ...pageForm,
                        is_published: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded accent-sky-500"
                  />
                  <label
                    htmlFor="page_is_published"
                    className="text-sm text-slate-300"
                  >
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
                  {savingPage
                    ? "جاري الحفظ..."
                    : editingPageId
                    ? "حفظ التعديلات"
                    : "إضافة البكج"}
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
                  <label className="block text-sm text-slate-400 mb-2">
                    اسم البوت *
                  </label>
                  <input
                    type="text"
                    value={botForm.name}
                    onChange={(e) =>
                      setBotForm({ ...botForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">
                    الوصف
                  </label>
                  <input
                    type="text"
                    value={botForm.description}
                    onChange={(e) =>
                      setBotForm({ ...botForm, description: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">
                    رابط البوت *
                  </label>
                  <input
                    type="url"
                    value={botForm.bot_url}
                    onChange={(e) =>
                      setBotForm({ ...botForm, bot_url: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                    required
                    dir="ltr"
                    placeholder="https://t.me/username"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">
                    رابط الصورة
                  </label>
                  <input
                    type="url"
                    value={botForm.image_url}
                    onChange={(e) =>
                      setBotForm({ ...botForm, image_url: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                    dir="ltr"
                    placeholder="https://..."
                  />
                  {botForm.image_url && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={botForm.image_url}
                        alt="معاينة"
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">
                    التصنيف
                  </label>
                  <input
                    type="text"
                    value={botForm.category}
                    onChange={(e) =>
                      setBotForm({ ...botForm, category: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white transition"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="bot_is_published"
                    checked={botForm.is_published}
                    onChange={(e) =>
                      setBotForm({
                        ...botForm,
                        is_published: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded accent-sky-500"
                  />
                  <label
                    htmlFor="bot_is_published"
                    className="text-sm text-slate-300"
                  >
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
                  {savingBot
                    ? "جاري الحفظ..."
                    : editingBotId
                    ? "حفظ التعديلات"
                    : "إضافة البوت"}
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