"use client";

import { useState } from "react";
import RoulettePopup from "@/components/RoulettePopup";

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <main className="casino-bg min-h-screen flex flex-col items-center justify-center gap-8">
      <div className="text-center select-none">
        <h1 className="casino-title text-5xl font-bold tracking-widest mb-2">
          🎰 CASINO ROULETTE
        </h1>
        <p className="casino-subtitle text-lg tracking-wider">
          행운을 시험해 보세요
        </p>
      </div>

      <button
        onClick={() => setOpen(true)}
        className="open-btn text-2xl font-bold tracking-widest px-14 py-5 rounded-full transition-all duration-200"
      >
        🎡 룰렛 돌리기
      </button>

      {open && <RoulettePopup onClose={() => setOpen(false)} />}
    </main>
  );
}
