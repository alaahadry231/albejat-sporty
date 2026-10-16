"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  created_at: string;
};

export default function NotificationsBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<number[]>([]);

  useEffect(() => {
    // نقرأ الإشعارات المخفية من localStorage
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

              <div className="flex items-start gap-3">
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
            </div>
          );
        })}
      </div>
    </section>
  );
}