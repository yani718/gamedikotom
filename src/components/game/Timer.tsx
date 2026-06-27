import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Timer({
  startedAt,
  limitSec,
  onExpire,
  paused,
}: {
  startedAt: number; // ms epoch
  limitSec: number;
  onExpire?: () => void;
  paused?: boolean;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, [paused]);

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
  const remaining = Math.max(0, limitSec - elapsed);
  useEffect(() => {
    if (remaining === 0 && onExpire) onExpire();
  }, [remaining, onExpire]);

  const pct = Math.min(100, (remaining / limitSec) * 100);
  const tone =
    pct > 60 ? "from-emerald-500 to-emerald-400"
    : pct > 25 ? "from-amber-400 to-orange-500"
    : "from-rose-500 to-red-600";
  const m = Math.floor(remaining / 60).toString().padStart(2, "0");
  const s = (remaining % 60).toString().padStart(2, "0");

  return (
    <div className="glass-strong sticky top-2 z-30 mx-auto flex max-w-md items-center gap-3 rounded-full px-4 py-2 shadow-glow">
      <span className="text-lg">⏱</span>
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-lg font-black tabular-nums">{m}:{s}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            sisa waktu
          </span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${tone}`}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>
    </div>
  );
}