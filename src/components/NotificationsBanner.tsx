"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  created_at: string;
};

const TELEGRAM_CONTACT = "https://t.me/Ichancy_bets";

export default function NotificationsBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("dismissed_notifications");
    if (saved) {
      try {
        setDismissed(JSON.parse(saved));
      } catch {
        // نتجاهل
      }
    }

    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const json = await res.json();
        setNotifications(json.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const dismiss = (id: number) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    localStorage.setItem("dismissed_notifications", JSON.stringify(updated));
  };

  const visibleNotifications = notifications.filter(
    (n) => !dismissed.includes(n.id)
  );

  if (loading || visibleNotifications.length === 0) {
    return null;
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-500/10",
          border: "border-green-500/40",
          text: "text-green-400",
          icon: "🎉",
        };
      case "warning":
        return {
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/40",
          text: "text-yellow-400",
          icon: "⚠️",
        };
      case "error":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/40",
          text: "text-red-400",
          icon: "🚨",
        };
      default:
        return {
          bg: "bg-sky-500/10",
          border: "border-sky-500/40",
          text: "text-sky-400",
          icon: "📢",
        };
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 pt-6">
      <div className="space-y-3">
        {visibleNotifications.map((n) => {
          const style = getTypeStyle(n.type);
          return (
            <div
              key={n.id}
              className={`relative rounded-2xl border-2 ${style.border} ${style.bg} p-5 pr-12 backdrop-blur`}
            >
              <button
                onClick={() => dismiss(n.id)}
                className="absolute top-3 left-3 w-7 h-7 rounded-lg bg-slate-900/60 hover:bg-slate-900/90 text-slate-400 hover:text-white transition flex items-center justify-center text-sm"
                aria-label="إغلاق"
              >
                ✕
              </button>

              <div className="flex items-start gap-3 mb-4">
                <div className="text-3xl shrink-0">{style.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-lg mb-1 ${style.text}`}>
                    {n.title}
                  </h3>
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                    {n.message}
                  </p>
                </div>
              </div>

              {/* زر التواصل على تلغرام - ثابت لكل الإشعارات */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <a
                  href={TELEGRAM_CONTACT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white text-sm font-bold transition shadow-lg shadow-sky-500/25"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="currentColor"
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  <span>تواصل معنا عبر تلغرام</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}