"use client";

import { useState, useRef, useEffect } from "react";

type Prize = {
  label: string;
  value: string;
  color: string;
  type: "win" | "retry" | "lose";
  weight: number;
};

const prizes: Prize[] = [
  { label: "20.000", value: "20.000", color: "#0ea5e9", type: "win", weight: 30 },
  { label: "35.000", value: "35.000", color: "#1e293b", type: "win", weight: 30 },
  { label: "50.000", value: "50.000", color: "#0284c7", type: "win", weight: 10 },
  { label: "75.000", value: "75.000", color: "#1e293b", type: "win", weight: 2 },
  { label: "100.000", value: "100.000", color: "#0369a1", type: "win", weight: 1 },
  { label: "حظ أوفر", value: "حظ أوفر", color: "#1e293b", type: "lose", weight: 15 },
  { label: "محاولة أخرى", value: "محاولة أخرى", color: "#075985", type: "retry", weight: 12 },
];

const TELEGRAM_CONTACT = "https://t.me/Ichancy_bets";

function pickWeightedIndex(items: Prize[]): number {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    if (random < items[i].weight) {
      return i;
    }
    random -= items[i].weight;
  }

  return items.length - 1;
}

export default function SpinWheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);

  const [codeInput, setCodeInput] = useState("");
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState("");

  const segmentAngle = (Math.PI * 2) / prizes.length;

  const drawWheel = (rot: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;

    ctx.clearRect(0, 0, size, size);

    ctx.beginPath();
    ctx.arc(center, center, radius + 6, 0, Math.PI * 2);
    ctx.fillStyle = "#0ea5e9";
    ctx.fill();

    prizes.forEach((prize, i) => {
      const startAngle = i * segmentAngle + rot;
      const endAngle = startAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();

      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px Cairo, sans-serif";
      ctx.fillText(prize.label, radius - 20, 8);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(center, center, 40, 0, Math.PI * 2);
    ctx.fillStyle = "#0f172a";
    ctx.fill();
    ctx.strokeStyle = "#0ea5e9";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#0ea5e9";
    ctx.font = "bold 24px Cairo, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎯", center, center);
  };

  useEffect(() => {
    drawWheel(0);
  }, []);

  const verifyCode = async () => {
    const trimmed = codeInput.trim().toUpperCase();
    if (!trimmed) {
      setCodeError("الرجاء إدخال الكود");
      return;
    }

    setVerifying(true);
    setCodeError("");

    try {
      const res = await fetch("/api/spin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCodeError(data.error || "الكود غير صحيح");
        setVerifying(false);
        return;
      }

      setVerifiedCode(trimmed);
      setCodeInput("");
    } catch {
      setCodeError("تعذر الاتصال بالخادم");
    } finally {
      setVerifying(false);
    }
  };

  const spin = () => {
    if (spinning || !verifiedCode) return;
    if (result && result.type !== "retry") return;

    setResult(null);
    setSpinning(true);

    const randomIndex = pickWeightedIndex(prizes);

    const segmentCenter = randomIndex * segmentAngle + segmentAngle / 2;
    const targetRotation = -segmentCenter;

    const currentRotation = rotationRef.current;
    const fullTurns = 6 + Math.floor(Math.random() * 3);

    const currentMod =
      ((currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const targetMod =
      ((targetRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    let delta = targetMod - currentMod;
    delta = ((delta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    delta += fullTurns * Math.PI * 2;

    const startRotation = currentRotation;
    const endRotation = currentRotation + delta;

    const duration = 5000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 4);
      const current = startRotation + (endRotation - startRotation) * eased;

      rotationRef.current = current;
      drawWheel(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        rotationRef.current = endRotation;
        const finalPrize = prizes[randomIndex];
        setSpinning(false);
        setResult(finalPrize);

        if (finalPrize.type !== "retry") {
          fetch("/api/spin/result", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: verifiedCode,
              prize: finalPrize.value,
              prize_type: finalPrize.type,
            }),
          }).catch((err) => console.error("Save error:", err));
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const canSpin =
    verifiedCode && !spinning && (!result || result.type === "retry");

  const buttonText = spinning
    ? "جاري الدوران..."
    : result && result.type !== "retry"
    ? "انتهت اللعبة"
    : result && result.type === "retry"
    ? "🎯 جرّب مرة أخرى"
    : "🎯 دوّر العجلة";

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {!verifiedCode && !result && (
        <div className="w-full p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 text-sm text-center">
          👇 شاهد العجلة أدناه — لكن تحتاج كود للعب
        </div>
      )}

      <div className="relative">
        <div className="absolute top-1/2 -right-2 -translate-y-1/2 z-10 pointer-events-none">
          <div
            className="w-0 h-0"
            style={{
              borderTop: "15px solid transparent",
              borderBottom: "15px solid transparent",
              borderRight: "30px solid #0ea5e9",
              filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))",
            }}
          ></div>
        </div>

        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="max-w-full h-auto"
        />
      </div>

      {!verifiedCode && !result && (
        <div className="w-full bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="text-center mb-5">
            <div className="text-4xl mb-2">🔑</div>
            <h3 className="text-xl font-bold mb-1">أدخل كود العجلة</h3>
            <p className="text-slate-400 text-sm">
              اكتب الكود الذي حصلت عليه لتبدأ اللعب
            </p>
          </div>

          {codeError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {codeError}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="ABCD1234"
              maxLength={20}
              dir="ltr"
              className="flex-1 px-5 py-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-white placeholder:text-slate-600 font-mono text-lg tracking-widest text-center transition"
              onKeyDown={(e) => {
                if (e.key === "Enter") verifyCode();
              }}
            />
            <button
              onClick={verifyCode}
              disabled={verifying}
              className="px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-900 font-bold transition whitespace-nowrap"
            >
              {verifying ? "جاري التحقق..." : "تحقق"}
            </button>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-800">
            <p className="text-slate-400 text-sm text-center">
              ليس لديك كود؟{" "}
              <a
                href={TELEGRAM_CONTACT}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-4"
              >
                تواصل معنا عبر تلغرام
              </a>{" "}
              للحصول على الكود
            </p>
          </div>
        </div>
      )}

      {verifiedCode && (
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500/10 border border-green-500/40 text-green-400 text-sm font-semibold">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          ✓ تم التحقق من الكود:{" "}
          <span className="font-mono" dir="ltr">
            {verifiedCode}
          </span>
        </div>
      )}

      {verifiedCode && (
        <button
          onClick={spin}
          disabled={!canSpin}
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xl transition-all shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40"
        >
          {buttonText}
        </button>
      )}

      {result && (
        <div
          className={`w-full px-6 py-6 rounded-2xl border-2 text-center ${
            result.type === "win"
              ? "bg-sky-500/10 border-sky-500/50 text-sky-400"
              : result.type === "retry"
              ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-400"
              : "bg-slate-800 border-slate-700 text-slate-400"
          }`}
        >
          <div className="text-sm mb-2">
            {result.type === "win" && "🎉 مبروك! ربحت"}
            {result.type === "retry" && "🔄"}
            {result.type === "lose" && "😢"}
          </div>
          <div className="text-3xl font-bold mb-4">{result.value}</div>

          {result.type === "win" && (
            <div className="pt-4 border-t border-sky-500/30">
              <p className="text-white text-sm mb-4">
                للحصول على جائزتك، تواصل معنا عبر تلغرام مع إرسال الكود:
              </p>
              <div
                className="inline-block px-4 py-2 rounded-lg bg-slate-950 border border-sky-500/40 font-mono text-sky-400 mb-4"
                dir="ltr"
              >
                {verifiedCode}
              </div>
              <div>
                <a
                  href={TELEGRAM_CONTACT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white font-bold transition shadow-lg shadow-sky-500/25"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  <span>تواصل عبر تلغرام</span>
                </a>
              </div>
            </div>
          )}

          {result.type === "lose" && (
            <div className="pt-4 border-t border-slate-700">
              <p className="text-slate-400 text-sm">
                حظك أفضل في المرة القادمة! تواصل معنا للحصول على كود جديد.
              </p>
            </div>
          )}

          {result.type === "retry" && (
            <div className="pt-4 border-t border-yellow-500/30">
              <p className="text-yellow-300 text-base font-semibold mb-2">
                🎁 محاولة إضافية مجانية!
              </p>
              <p className="text-yellow-200/80 text-sm">
                اضغط &quot;جرّب مرة أخرى&quot; لتلف العجلة مرة ثانية
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}