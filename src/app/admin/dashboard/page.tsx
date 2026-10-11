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

const emptyForm = {
  name: "",
  description: "",
  code: "",
  image_url: "",
  category: "عام",
  rate: "×1",
  is_published: true,
};

export default function DashboardPage() {
  const router = useRouter();
  const [pages, setPages] = useState<SportsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/admin");
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEdit = (page: SportsPage) => {
    setEditingId(page.id);
    setForm({
      name: page.name,
      description: page.description,
      code: page.code,
      image_url: page.image_url,
      category: page.category,
      rate: page.rate,
      is_published: page.is_published,
    });
    setError("");
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "فشل رفع الصورة");
        return;
      }

      setForm({ ...form, image_url: data.url });
    } catch {
      setError("تعذر رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = editingId
      ? `/api/admin/pages/${editingId}`
      : "/api/admin/pages";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setSaving(false);
        return;
      }

      setShowModal(false);
      setForm(emptyForm);
      setEditingId(null);
      await fetchPages();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;

    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("فشل الحذف");
        return;
      }

      await fetchPages();
    } catch {
      alert("تعذر الاتصال بالخادم");
    }
  };

  return (
    <main className="min-h-screen">
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-slate-900 text-xl">
              🔒
            </div>
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
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-2xl font-bold">إدارة البكجات</h2>
          <button
            onClick={openAdd}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold transition"
          >
            + إضافة بكج جديد
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">جاري التحميل...</div>
        ) : pages.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            لا توجد بكجات بعد — اضغط &quot;إضافة بكج جديد&quot; للبدء
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
                      <span className="font-mono text-emerald-400 text-sm">
                        {p.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-emerald-400 font-semibold">
                        {p.rate}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs transition"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
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
      </section>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-xl font-bold">
                {editingId ? "تعديل بكج" : "إضافة بكج جديد"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">
                    اسم البكج *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">
                    الوصف
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">
                    الكود *
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white font-mono transition"
                    required
                    dir="ltr"
                  />
                </div>

                {/* ==================== قسم الصورة ==================== */}
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-2">
                    صورة البكج
                  </label>

                  <div className="space-y-3">
                    <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-slate-950 border-2 border-dashed border-slate-700 hover:border-emerald-500 cursor-pointer transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                      {uploading ? (
                        <span className="text-emerald-400 text-sm">
                          جاري رفع الصورة...
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">
                          📷 اختر صورة من جهازك
                        </span>
                      )}
                    </label>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-slate-800"></div>
                      <span className="text-xs text-slate-600">أو</span>
                      <div className="flex-1 h-px bg-slate-800"></div>
                    </div>

                    <input
                      type="url"
                      value={form.image_url}
                      onChange={(e) =>
                        setForm({ ...form, image_url: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition text-sm"
                      dir="ltr"
                      placeholder="ألصق رابط صورة مباشر..."
                    />

                    {form.image_url && (
                      <div className="relative rounded-xl overflow-hidden border border-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={form.image_url}
                          alt="معاينة"
                          className="w-full h-40 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, image_url: "" })}
                          className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-sm transition"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* ==================== نهاية قسم الصورة ==================== */}

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    التصنيف
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    الريت
                  </label>
                  <input
                    type="text"
                    value={form.rate}
                    onChange={(e) =>
                      setForm({ ...form, rate: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition"
                    placeholder="×1"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={form.is_published}
                    onChange={(e) =>
                      setForm({ ...form, is_published: e.target.checked })
                    }
                    className="w-5 h-5 rounded accent-emerald-500"
                  />
                  <label
                    htmlFor="is_published"
                    className="text-sm text-slate-300"
                  >
                    نشر البكج (يظهر للزوار)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 font-bold transition"
                >
                  {saving
                    ? "جاري الحفظ..."
                    : editingId
                    ? "حفظ التعديلات"
                    : "إضافة البكج"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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