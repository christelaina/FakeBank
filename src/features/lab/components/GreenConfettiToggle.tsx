"use client";

import { Button } from "@/components/ui/button";
import { DancingSilhouette } from "@/features/lab/components/DancingSilhouette";
import { useState } from "react";

const PIECE_COUNT = 90;
const GREENS = ["#22c55e", "#16a34a", "#4ade80", "#86efac", "#15803d"];

export function GreenConfettiToggle() {
  const [on, setOn] = useState(false);
  const [pieces] = useState(() =>
    Array.from({ length: PIECE_COUNT }, (_, id) => ({
      id,
      left: Math.random() * 100,
      delay: -Math.random() * 6,
      duration: 3 + Math.random() * 4,
      size: 6 + Math.random() * 8,
      color: GREENS[id % GREENS.length],
    })),
  );

  return (
    <>
      <Button type="button" aria-pressed={on} onClick={() => setOn((value) => !value)}>
        Surprise
      </Button>

      {on ? (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          <style>{`@keyframes bc-confetti-fall {
            from { transform: translate3d(0, -10vh, 0) rotate(0deg); }
            to { transform: translate3d(0, 110vh, 0) rotate(720deg); }
          }`}</style>
          {pieces.map((piece) => (
            <span
              key={piece.id}
              className="absolute top-0 block rounded-sm"
              style={{
                left: `${piece.left}%`,
                width: piece.size,
                height: piece.size * 0.4,
                backgroundColor: piece.color,
                animation: `bc-confetti-fall ${piece.duration}s linear ${piece.delay}s infinite`,
              }}
            />
          ))}
        </div>
      ) : null}
      {on ? <DancingSilhouette /> : null}
    </>
  );
}
