export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Ichancy Bet"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <h1 className="text-xl font-bold">Ichancy Bet</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/" className="text-emerald-400 font-semibold">الرئيسية</a>
            <a href="/pages" className="text-slate-300 hover:text-emerald-400 transition">البكجات الرياضية</a>
            <a href="/bots" className="text-slate-300 hover:text-emerald-400 transition">بوتات تيليجرام</a>
            <a href="/contact" className="text-slate-300 hover:text-emerald-400 transition">اتصل بنا</a>
          </nav>
        </div>
      </header>

      {/* Hero with Background Image */}
      <section className="relative overflow-hidden min-h-[600px] md:min-h-[700px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-main.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-slate-950/70"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-slate-950"></div>

        <div className="relative w-full max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm mb-6 backdrop-blur">
            🚀 منصة عربية رياضية
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            اكتشف أفضل <span className="text-emerald-400">البكجات الرياضية</span>
            <br />
            وبوتات تيليجرام
          </h2>
          <p className="text-slate-200 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            منصة عربية تجمع لك أفضل البكجات الرياضية مع أكواد جاهزة للنسخ، وبوتات تيليجرام موثوقة.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/pages"
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold transition shadow-lg shadow-emerald-500/25"
            >
              تصفح البكجات
            </a>
            <a
              href="/bots"
              className="px-8 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold transition border border-slate-700 backdrop-blur"
            >
              بوتات تيليجرام
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900 rounded-2xl p-6 text-center border border-slate-800">
            <div className="text-3xl font-bold text-emerald-400 mb-1">+50</div>
            <div className="text-slate-400 text-sm">بكج رياضي</div>
          </div>
          <div className="bg-slate-900 rounded-2xl p-6 text-center border border-slate-800">
            <div className="text-3xl font-bold text-emerald-400 mb-1">+30</div>
            <div className="text-slate-400 text-sm">بوت تيليجرام</div>
          </div>
          <div className="bg-slate-900 rounded-2xl p-6 text-center border border-slate-800">
            <div className="text-3xl font-bold text-emerald-400 mb-1">+10K</div>
            <div className="text-slate-400 text-sm">مستخدم</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
          © 2025 Ichancy Bet — جميع الحقوق محفوظة
        </div>
      </footer>
    </main>
  );
}