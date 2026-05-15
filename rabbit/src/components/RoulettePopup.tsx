"use client";

import { useState } from "react";
import RouletteWheel from "./RouletteWheel";

const DEFAULT_SECTIONS = 8;
const MIN_SECTIONS = 2;
const MAX_SECTIONS = 16;

function generateDefaultLabels(n: number): string[] {
  const pool = ["1등", "2등", "3등", "꽝", "5000P", "1000P", "재도전", "잭팟"];
  return Array.from({ length: n }, (_, i) => pool[i % pool.length]);
}

interface RoulettePopupProps {
  onClose: () => void;
}

export default function RoulettePopup({ onClose }: RoulettePopupProps) {
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [labels, setLabels] = useState<string[]>(generateDefaultLabels(DEFAULT_SECTIONS));
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ label: string; index: number } | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  function handleSectionChange(n: number) {
    const clamped = Math.max(MIN_SECTIONS, Math.min(MAX_SECTIONS, n));
    setSections(clamped);
    setLabels((prev) => {
      const next = [...prev];
      while (next.length < clamped) next.push(`섹션 ${next.length + 1}`);
      return next.slice(0, clamped);
    });
    setResult(null);
  }

  function handleLabelChange(i: number, value: string) {
    setLabels((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  }

  function handleResult(label: string, index: number) {
    setResult({ label, index });
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Popup card */}
      <div
        className="relative flex flex-col items-center gap-4 rounded-2xl p-6 w-full max-w-lg max-h-screen overflow-y-auto"
        style={{
          background: "linear-gradient(160deg, #0d2b1a 0%, #1a472a 60%, #0d2b1a 100%)",
          border: "3px solid",
          borderImage: "linear-gradient(135deg, #f1c40f, #b8860b, #f1c40f) 1",
          boxShadow: "0 0 60px #f1c40f44, 0 0 120px #00000088, inset 0 0 40px #00000044",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl font-bold transition-colors hover:text-yellow-300"
          style={{ color: GOLD, lineHeight: 1 }}
          aria-label="닫기"
        >
          ✕
        </button>

        {/* Title */}
        <h2
          className="text-3xl font-bold tracking-widest text-center"
          style={{
            fontFamily: "serif",
            color: GOLD,
            textShadow: "0 0 18px #f1c40f, 0 2px 4px #000",
            letterSpacing: "0.2em",
          }}
        >
          🎰 LUCKY ROULETTE 🎰
        </h2>

        {/* Config toggle */}
        <button
          onClick={() => setShowConfig((v) => !v)}
          className="text-sm px-4 py-1 rounded-full border transition-colors"
          style={{
            borderColor: GOLD,
            color: GOLD,
            background: showConfig ? "#f1c40f22" : "transparent",
          }}
        >
          {showConfig ? "▲ 설정 닫기" : "⚙ 설정"}
        </button>

        {/* Config panel */}
        {showConfig && (
          <div
            className="w-full rounded-xl p-4 flex flex-col gap-3"
            style={{ background: "#00000044", border: "1px solid #f1c40f44" }}
          >
            {/* Section count */}
            <div className="flex items-center gap-3 justify-center">
              <span style={{ color: GOLD, fontFamily: "serif" }}>섹션 수:</span>
              <button
                onClick={() => handleSectionChange(sections - 1)}
                disabled={sections <= MIN_SECTIONS}
                className="w-8 h-8 rounded-full font-bold text-lg disabled:opacity-40"
                style={{ background: GOLD, color: "#1a1a1a" }}
              >
                −
              </button>
              <span className="text-2xl font-bold w-8 text-center" style={{ color: GOLD }}>
                {sections}
              </span>
              <button
                onClick={() => handleSectionChange(sections + 1)}
                disabled={sections >= MAX_SECTIONS}
                className="w-8 h-8 rounded-full font-bold text-lg disabled:opacity-40"
                style={{ background: GOLD, color: "#1a1a1a" }}
              >
                +
              </button>
            </div>

            {/* Labels */}
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {labels.map((lbl, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-xs w-5 text-right" style={{ color: "#f1c40f99" }}>
                    {i + 1}.
                  </span>
                  <input
                    type="text"
                    value={lbl}
                    onChange={(e) => handleLabelChange(i, e.target.value)}
                    maxLength={6}
                    className="flex-1 rounded px-2 py-1 text-sm text-center font-bold outline-none"
                    style={{
                      background: "#1a1a1a",
                      border: "1px solid #f1c40f66",
                      color: GOLD,
                      fontFamily: "serif",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wheel */}
        <RouletteWheel
          sections={sections}
          labels={labels}
          onResult={handleResult}
          isSpinning={isSpinning}
          setIsSpinning={setIsSpinning}
        />

        {/* Result */}
        {result && !isSpinning && (
          <div
            className="w-full text-center py-4 px-6 rounded-xl animate-bounce-once"
            style={{
              background: "linear-gradient(135deg, #f1c40f22, #b8860b44)",
              border: "2px solid #f1c40f",
              boxShadow: "0 0 24px #f1c40f66",
            }}
          >
            <p className="text-sm mb-1" style={{ color: "#f1c40f99", fontFamily: "serif" }}>
              결과
            </p>
            <p
              className="text-4xl font-bold"
              style={{
                color: GOLD,
                fontFamily: "serif",
                textShadow: "0 0 24px #f1c40f",
              }}
            >
              {result.label}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const GOLD = "#f1c40f";
