import { useMemo } from "react";

export function ParticleBg({ density = 28 }: { density?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: density }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 5,
        delay: Math.random() * 6,
        duration: 8 + Math.random() * 10,
        hue: Math.random() > 0.5 ? "var(--emerald)" : "var(--aqua)",
      })),
    [density],
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-hero">
      <div className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, oklch(0.30 0.12 155 / 0.45), transparent 40%), radial-gradient(circle at 80% 70%, oklch(0.30 0.12 210 / 0.35), transparent 45%)",
        }}
      />
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full blur-[1px]"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: p.hue,
            opacity: 0.5,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite, drift ${p.duration * 1.4}s linear ${p.delay}s infinite`,
            boxShadow: `0 0 12px ${p.hue}`,
          }}
        />
      ))}
      {/* leaf accents */}
      {["🌿","🍃","✨","🌱","🍃","✨"].map((e, i) => (
        <span key={i} className="absolute text-2xl opacity-30 animate-float"
          style={{ left: `${(i*17+5)%95}%`, top: `${(i*23+10)%85}%`, animationDelay: `${i*0.8}s` }}>
          {e}
        </span>
      ))}
    </div>
  );
}
