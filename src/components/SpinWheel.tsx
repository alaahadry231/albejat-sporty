"use client";

import { useState, useRef, useEffect } from "react";

type Prize = {
  label: string;
  value: string;
  color: string;
  type: "win" | "retry" | "lose";
};

const prizes: Prize[] = [
  { label: "20.000", value: "20.000", color: "#0ea5e9", type: "win" },
  { label: "35.000", value: "35.000", color: "#1e293b", type: "win" },
  { label: "50.000", value: "50.000", color: "#0284c7", type: "win" },
  { label: "75.000", value: "75.000", color: "#1e293b", type: "win" },
  { label: "100.000", value: "100.000", color: "#0369a1", type: "win" },
  { label: "حظ أوفر", value: "حظ أوفر", color: "#1e293b", type: "lose" },
  { label: "محاولة أخرى", value: "محاولة أخرى", color: "#075985", type: "retry" },
];

export default function SpinWheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Prize | null>(null);

  const segmentAngle = (Math.PI * 2) / prizes.length;

  useEffect(() => {
    drawWheel(rotation);
  }, [rotation]);

  const drawWheel = (currentRotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;

    ctx.clearRect(0, 0, size, size);

    // Outer ring
    ctx.beginPath();
    ctx.arc(center, center, radius + 6, 0, Math.PI * 2);
    ctx.fillStyle = "#0ea5e9";
    ctx.fill();

    // Wheel segments
    prizes.forEach((prize, i) => {
      const startAngle = i * segmentAngle + currentRotation - Math.PI / 2;
      const endAngle = startAngle + segmentAngle;

      // Segment
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();

      // Border
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px Cairo, sans-serif";
      ctx.fillText(prize.label, radius - 20, 8);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 40, 0, Math.PI * 2);
    ctx.fillStyle = "#0f172a";
    ctx.fill();
    ctx.strokeStyle = "#0ea5e9";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center text
    ctx.fillStyle = "#0ea5e9";
    ctx.font = "bold 18px Cairo, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎯", center, center);
  };

const spin = () => {
  if (spinning) return;
  setResult(null);
  setSpinning(true);

  const randomIndex = Math.floor(Math.random() * prizes.length);
  const spins = 5 + Math.random() * 3;

  // حساب الزاوية اللي لازم العجلة توصلها
  // المؤشر في الأعلى (زاوية -π/2)
  // كل قطاع بحجم segmentAngle
  // مركز القطاع رقم randomIndex = randomIndex * segmentAngle + segmentAngle/2
  // لازم القطاع يوقف بحيث مركزه تحت المؤشر
  // يعني: زاوية القطاع + دوران العجلة = -π/2 (mod 2π)
  // rotation + (randomIndex * segmentAngle + segmentAngle/2) = -π/2
  // rotation = -π/2 - (randomIndex * segmentAngle + segmentAngle/2)

  const centerOfSegment = randomIndex * segmentAngle + segmentAngle / 2;
  const targetRotation =
    spins * Math.PI * 2 -
    Math.PI / 2 -
    centerOfSegment;

  const startRotation = rotation;
  const duration = 5000;
  const startTime = performance.now();

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const eased = 1 - Math.pow(1 - progress, 3);
    const current = startRotation + (targetRotation - startRotation) * eased;

    setRotation(current);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      setSpinning(false);
      setResult(prizes[randomIndex]);
    }
  };

  requestAnimationFrame(animate);
};

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Pointer */}
      <div className="relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "15px solid transparent",
              borderRight: "15px solid transparent",
              borderTop: "30px solid #0ea5e9",
              transform: "translateY(-220px)",
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

      {/* Spin Button */}
      <button
        onClick={spin}
        disabled={spinning}
        className="px-10 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xl transition-all shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40"
      >
        {spinning ? "جاري الدوران..." : "🎯 دوّر العجلة"}
      </button>

      {/* Result */}
      {result && (
        <div
          className={`mt-4 px-6 py-4 rounded-2xl border-2 text-center animate-pulse ${
            result.type === "win"
              ? "bg-sky-500/10 border-sky-500/50 text-sky-400"
              : result.type === "retry"
              ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-400"
              : "bg-slate-800 border-slate-700 text-slate-400"
          }`}
        >
          <div className="text-sm mb-1">
            {result.type === "win" && "🎉 مبروك! ربحت"}
            {result.type === "retry" && "🔄"}
            {result.type === "lose" && "😢"}
          </div>
          <div className="text-2xl font-bold">{result.value}</div>
        </div>
      )}
    </div>
  );
}