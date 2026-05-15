"use client";

import { useRef, useState } from "react";

const CASINO_COLORS = [
  "#c0392b", // red
  "#1a1a1a", // black
  "#8e1a0e", // dark red
  "#2c2c2c", // dark grey
  "#e74c3c", // bright red
  "#111111", // deeper black
  "#a93226", // medium red
  "#222222", // charcoal
];

const GOLD = "#f1c40f";
const SPIN_DURATION = 5000; // ms

interface RouletteWheelProps {
  sections: number;
  labels: string[];
  onResult: (label: string, index: number) => void;
  isSpinning: boolean;
  setIsSpinning: (v: boolean) => void;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function sectorPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

export default function RouletteWheel({
  sections,
  labels,
  onResult,
  isSpinning,
  setIsSpinning,
}: RouletteWheelProps) {
  const [rotation, setRotation] = useState(0);
  const currentRotation = useRef(0);
  const wheelRef = useRef<SVGGElement>(null);

  const cx = 200;
  const cy = 200;
  const r = 180;
  const innerR = 32;
  const anglePerSection = 360 / sections;

  function spin() {
    if (isSpinning) return;
    setIsSpinning(true);

    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const randomAngle = Math.random() * 360;
    const totalRotation = currentRotation.current + extraSpins * 360 + randomAngle;

    currentRotation.current = totalRotation;
    setRotation(totalRotation);

    setTimeout(() => {
      // pointer is at top (0°), wheel rotates clockwise
      // effective angle of top pointer on wheel = totalRotation % 360
      const normalized = ((totalRotation % 360) + 360) % 360;
      // pointer points at angle 0 (top); sector index under pointer
      const pointerAngle = (360 - normalized + 360) % 360;
      const idx = Math.floor(pointerAngle / anglePerSection) % sections;
      setIsSpinning(false);
      onResult(labels[idx] ?? `섹션 ${idx + 1}`, idx);
    }, SPIN_DURATION + 100);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Pointer triangle */}
      <div className="relative">
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-1 z-10"
          style={{ filter: "drop-shadow(0 0 6px #f1c40f)" }}
        >
          <svg width="28" height="32" viewBox="0 0 28 32">
            <polygon
              points="14,30 2,2 26,2"
              fill={GOLD}
              stroke="#b8860b"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Wheel SVG */}
        <svg
          width="400"
          height="400"
          viewBox="0 0 400 400"
          style={{ display: "block" }}
        >
          {/* Outer glow ring */}
          <circle cx={cx} cy={cy} r={r + 14} fill="none" stroke="#b8860b" strokeWidth="6" opacity="0.5" />
          <circle cx={cx} cy={cy} r={r + 10} fill="none" stroke={GOLD} strokeWidth="3" />

          {/* Rotating group */}
          <g
            ref={wheelRef}
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning
                ? `transform ${SPIN_DURATION}ms cubic-bezier(0.17, 0.67, 0.12, 1.0)`
                : "none",
            }}
          >
            {Array.from({ length: sections }).map((_, i) => {
              const startAngle = i * anglePerSection;
              const endAngle = (i + 1) * anglePerSection;
              const midAngle = startAngle + anglePerSection / 2;
              const color = CASINO_COLORS[i % CASINO_COLORS.length];

              const textR = r * 0.62;
              const textPos = polarToCartesian(cx, cy, textR, midAngle);
              const fontSize = sections <= 8 ? 15 : sections <= 12 ? 12 : 10;

              return (
                <g key={i}>
                  <path
                    d={sectorPath(cx, cy, r, startAngle, endAngle)}
                    fill={color}
                    stroke={GOLD}
                    strokeWidth="1.5"
                  />
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={GOLD}
                    fontSize={fontSize}
                    fontWeight="bold"
                    fontFamily="serif"
                    style={{
                      transform: `rotate(${midAngle}deg)`,
                      transformOrigin: `${textPos.x}px ${textPos.y}px`,
                    }}
                  >
                    {labels[i] ?? `${i + 1}`}
                  </text>
                </g>
              );
            })}

            {/* Decorative dots on rim */}
            {Array.from({ length: sections }).map((_, i) => {
              const angle = i * anglePerSection;
              const pos = polarToCartesian(cx, cy, r - 10, angle);
              return (
                <circle key={`dot-${i}`} cx={pos.x} cy={pos.y} r={5} fill={GOLD} opacity="0.9" />
              );
            })}
          </g>

          {/* Center boss */}
          <circle cx={cx} cy={cy} r={innerR + 6} fill="#111" stroke={GOLD} strokeWidth="3" />
          <circle cx={cx} cy={cy} r={innerR} fill="#1a1a1a" />
          <circle cx={cx} cy={cy} r={innerR - 8} fill="#c0392b" />
          <circle cx={cx} cy={cy} r={8} fill={GOLD} />
        </svg>
      </div>

      {/* SPIN button */}
      <button
        onClick={spin}
        disabled={isSpinning}
        className="relative px-12 py-3 text-xl font-bold tracking-widest rounded-full transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: isSpinning
            ? "linear-gradient(135deg, #7d6608, #b8860b)"
            : "linear-gradient(135deg, #f1c40f, #e67e22, #f1c40f)",
          color: "#1a1a1a",
          boxShadow: isSpinning
            ? "none"
            : "0 0 20px #f1c40f88, 0 4px 16px rgba(0,0,0,0.5)",
          fontFamily: "serif",
          border: "2px solid #b8860b",
        }}
      >
        {isSpinning ? "SPINNING..." : "SPIN"}
      </button>
    </div>
  );
}
