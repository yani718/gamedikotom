import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Logo } from "@/components/game/Logo";
import { ParticleBg } from "@/components/game/ParticleBg";
import { Watermark } from "@/components/game/Watermark";
import { organisms } from "@/data/organisms";
import { loadProfile } from "@/game/profile";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "Galeri Organisme — DichoLife Explorer" }, { name: "description", content: "Galeri kartu organisme premium untuk dijelajahi." }] }),
  component: Gallery,
});

const KINGDOMS = ["Semua", "Animalia", "Plantae", "Fungi"];

function Gallery() {
  const [q, setQ] = useState("");
  const [k, setK] = useState("Semua");
  const profile = loadProfile();
  const filtered = useMemo(
    () => organisms.filter((o) =>
      (k === "Semua" || o.kingdom === k) &&
      (o.nama.toLowerCase().includes(q.toLowerCase()) || o.namaIlmiah.toLowerCase().includes(q.toLowerCase()))),
    [q, k],
  );

  return (
    <div className="relative min-h-screen">
      <ParticleBg density={14} />
      <Watermark />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-8">
        <Link to="/menu"><Logo size="sm" /></Link>
        <Link to="/menu" className="glass rounded-full px-4 py-2 text-sm">← Dashboard</Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-black md:text-4xl">
            Galeri <span className="text-gradient-emerald">Organisme</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Pilih kartu organisme untuk memulai investigasi klasifikasi.</p>
        </motion.div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="🔍 Cari organisme atau nama ilmiah…"
            className="glass w-full rounded-2xl px-5 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald"
          />
          <div className="flex gap-2 overflow-x-auto">
            {KINGDOMS.map((opt) => (
              <button key={opt} onClick={() => setK(opt)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                  k === opt ? "bg-emerald-grad text-primary-foreground shadow-glow" : "glass hover:text-emerald"
                }`}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((o, i) => {
            const done = profile.played.includes(o.id);
            return (
              <Link key={o.id} to="/play/$id" params={{ id: o.id }}>
                <motion.div
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  whileHover={{ y: -6, rotateX: 4, rotateY: -4, scale: 1.03 }}
                  style={{ transformStyle: "preserve-3d", perspective: 800 }}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl glass"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <div className="absolute inset-0" style={{
                      background: `radial-gradient(circle at 50% 35%, ${o.warna}cc, transparent 70%), linear-gradient(160deg, oklch(0.20 0.04 255), oklch(0.10 0.04 250))`,
                    }} />
                    <motion.div className="absolute inset-0 grid place-items-center text-7xl drop-shadow-lg"
                      whileHover={{ scale: 1.1, rotate: -6 }}>
                      {o.emoji}
                    </motion.div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-shimmer" />
                    {done && (
                      <div className="absolute right-2 top-2 rounded-full bg-emerald-grad px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-glow">
                        ✓ Selesai
                      </div>
                    )}
                    <div className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] backdrop-blur">
                      {o.difficulty}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="font-display text-sm font-bold leading-tight">{o.nama}</div>
                    <div className="truncate text-[11px] italic text-muted-foreground">{o.namaIlmiah}</div>
                  </div>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-2 ring-emerald transition group-hover:opacity-100" />
                </motion.div>
              </Link>
            );
          })}
        </section>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">Tidak ada organisme yang cocok.</p>
        )}
      </main>
    </div>
  );
}
