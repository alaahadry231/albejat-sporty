import SpinWheel from "@/components/SpinWheel";

export default function SpinPage() {
  return (
    <main className="min-h-screen">
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-3">
            🎡 عجلة <span className="text-sky-400">الفرص</span>
          </h2>
          <p className="text-slate-400 text-lg">
            جرّب حظك واربح جوائز قيمة!
          </p>
        </div>

        <SpinWheel />
      </section>

      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
          © 2025 Ichancy Bet — جميع الحقوق محفوظة
        </div>
      </footer>
    </main>
  );
}