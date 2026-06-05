import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Logo } from "@/components/game/Logo";
import { ParticleBg } from "@/components/game/ParticleBg";
import { Watermark } from "@/components/game/Watermark";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DichoLife Explorer — Klasifikasi Makhluk Hidup" },
      { name: "description", content: "Game edukasi premium klasifikasi makhluk hidup dengan kunci dikotom digital interaktif." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const buttons = [
    { to: "/menu", icon: "▶", label: "Mulai Bermain", primary: true },
    { to: "/gallery", icon: "📚", label: "Panduan & Galeri" },
    { to: "/profile", icon: "🏆", label: "Profil & Peringkat" },
    { to: "/settings", icon: "⚙", label: "Pengaturan" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBg density={36} />
      <Watermark />

      <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Logo size="lg" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-10 font-display text-3xl font-black leading-tight sm:text-4xl md:text-6xl"
        >
          Selamat Datang di Dunia{" "}
          <span className="text-gradient-emerald">Klasifikasi</span>
          <br /> Makhluk Hidup
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg"
        >
          Temukan identitas organisme melalui petualangan ilmiah yang menyenangkan
          dengan <span className="text-emerald">kunci dikotom digital interaktif</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-12 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {buttons.map((b) => (
            <Link key={b.to} to={b.to}>
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`group relative overflow-hidden rounded-2xl px-6 py-5 text-left transition-all ${
                  b.primary
                    ? "bg-emerald-grad text-primary-foreground shadow-glow"
                    : "glass hover:border-emerald/40"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{b.icon}</div>
                  <div className="font-display text-lg font-bold">{b.label}</div>
                </div>
                <div className="animate-shimmer absolute inset-0 opacity-0 group-hover:opacity-100" />
              </motion.div>
            </Link>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.5 }}
          className="mt-12 text-xs uppercase tracking-[0.3em] text-muted-foreground"
        >
          Petualangan Ilmiah · Taksonomi · Biodiversitas
        </motion.p>
      </main>
    </div>
  );
}
