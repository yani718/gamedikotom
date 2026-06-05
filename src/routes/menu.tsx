import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "@/components/game/Logo";
import { ParticleBg } from "@/components/game/ParticleBg";
import { Watermark } from "@/components/game/Watermark";
import { loadProfile, xpForLevel, type Profile } from "@/game/profile";
import { organisms } from "@/data/organisms";
import { useAuthUser } from "@/hooks/useAuthUser";

export const Route = createFileRoute("/menu")({
  head: () => ({ meta: [{ title: "Dashboard — DichoLife Explorer" }, { name: "description", content: "Dashboard pemain DichoLife Explorer." }] }),
  component: Menu,
});

function useProfile() {
  const [p, setP] = useState<Profile>(() => loadProfile());
  useEffect(() => {
    const refresh = () => setP(loadProfile());
    refresh();
    window.addEventListener("profile-update", refresh);
    return () => window.removeEventListener("profile-update", refresh);
  }, []);
  return p;
}

function Menu() {
  const p = useProfile();
  const { user, signOut } = useAuthUser();
  const xpNeed = xpForLevel(p.level);
  const xpPct = Math.min(100, (p.xp / xpNeed) * 100);
  const totalDone = p.played.length;
  const totalProgress = Math.round((totalDone / organisms.length) * 100);

  // daily challenge: deterministic 3 organisms based on date
  const seed = Number(new Date().toISOString().slice(0, 10).replace(/-/g, ""));
  const daily = [...organisms].sort((a, b) => ((a.id + seed).length - (b.id + seed).length)).slice(0, 3);

  return (
    <div className="relative min-h-screen">
      <ParticleBg density={18} />
      <Watermark />
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 pt-6 sm:px-6 sm:pt-8">
        <Link to="/"><Logo size="sm" /></Link>
        <nav className="flex flex-wrap gap-2">
          {[["/gallery","Galeri"],["/profile","Profil"]].map(([to,label]) => (
            <Link key={to} to={to} className="glass rounded-full px-3 py-1.5 text-xs font-medium hover:text-emerald sm:px-4 sm:py-2 sm:text-sm">
              {label}
            </Link>
          ))}
          {user ? (
            <button onClick={signOut} className="glass rounded-full px-3 py-1.5 text-xs hover:text-rose-300 sm:px-4 sm:py-2 sm:text-sm">
              Keluar
            </button>
          ) : (
            <Link to="/auth" className="rounded-full bg-emerald-grad px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-glow sm:px-4 sm:py-2 sm:text-sm">
              Masuk
            </Link>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Player card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-strong relative overflow-hidden rounded-3xl p-5 sm:p-6 md:p-8"
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-grad opacity-20 blur-3xl" />
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-6">
            <motion.div whileHover={{ rotate: 8, scale: 1.05 }}
              className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-3xl bg-emerald-grad text-4xl shadow-glow animate-float sm:h-24 sm:w-24 sm:text-5xl">
              {p.avatarUrl
                ? <img src={p.avatarUrl} alt={p.name} className="h-full w-full object-cover" />
                : <span>{p.avatar}</span>}
            </motion.div>
            <div className="min-w-0 flex-1">
              <div className="text-sm uppercase tracking-widest text-emerald">Selamat Datang Kembali</div>
              <h2 className="break-words font-display text-2xl font-black sm:text-3xl">{p.name}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="glass rounded-full px-3 py-1">Level <b className="text-emerald">{p.level}</b></span>
                <span className="glass rounded-full px-3 py-1">Total Skor <b className="text-gold">{p.totalScore}</b></span>
                <span className="glass rounded-full px-3 py-1">Badge <b>{p.badges.length}</b></span>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>XP {p.xp} / {xpNeed}</span><span>Naik ke Level {p.level + 1}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-emerald-grad shadow-glow" />
                </div>
              </div>
            </div>
            <Link to="/gallery" className="self-start md:self-auto">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="rounded-2xl bg-emerald-grad px-6 py-4 font-display font-bold text-primary-foreground shadow-glow">
                ▶ Mulai Klasifikasi
              </motion.div>
            </Link>
          </div>
        </motion.section>

        {/* Stats grid */}
        <section className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Progress Belajar", value: `${totalProgress}%`, sub: `${totalDone}/${organisms.length} organisme`, icon: "📊" },
            { label: "Akurasi", value: p.history.length ? `${Math.round(p.history.reduce((s,h)=>s+h.score,0)/p.history.length)}` : "—", sub: "skor rata-rata", icon: "🎯" },
            { label: "Streak", value: `${Math.min(p.history.length, 7)}🔥`, sub: "permainan", icon: "⚡" },
            { label: "Badge Tertinggi", value: p.badges[p.badges.length-1]?.slice(0,2) ?? "—", sub: p.badges[p.badges.length-1]?.slice(2) ?? "Mulai bermain", icon: "🏆" },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass rounded-2xl p-4">
              <div className="text-2xl">{s.icon}</div>
              <div className="mt-2 font-display text-2xl font-bold text-gradient-emerald">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-[11px] text-muted-foreground/70">{s.sub}</div>
            </motion.div>
          ))}
        </section>

        {/* Mode permainan */}
        <section className="mt-8">
          <h3 className="mb-3 font-display text-xl font-bold">Mode Permainan</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { title: "Mode Belajar", desc: "Tanpa batas waktu. Cocok untuk pemula.", icon: "📖", color: "from-emerald-500/30 to-emerald-700/20" },
              { title: "Mode Tantangan", desc: "Waktu terbatas. Kejar bonus skor.", icon: "⏱️", color: "from-amber-400/30 to-orange-600/20" },
              { title: "Mode Survival", desc: "Tiga kesempatan salah. Bertahanlah!", icon: "💀", color: "from-rose-500/30 to-fuchsia-600/20" },
            ].map((m) => (
              <Link key={m.title} to="/gallery">
                <motion.div whileHover={{ y: -4, scale: 1.02 }}
                  className={`relative overflow-hidden rounded-2xl p-5 glass`}>
                  <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${m.color} opacity-70`} />
                  <div className="text-3xl">{m.icon}</div>
                  <div className="mt-3 font-display text-lg font-bold">{m.title}</div>
                  <div className="text-sm text-muted-foreground">{m.desc}</div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* Daily Challenge */}
        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between">
            <h3 className="font-display text-xl font-bold">🎯 Daily Challenge</h3>
            <span className="text-xs text-muted-foreground">Bonus XP hari ini</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {daily.map((o) => (
              <Link key={o.id} to="/play/$id" params={{ id: o.id }}>
                <motion.div whileHover={{ y: -4 }} className="glass overflow-hidden rounded-2xl">
                  <div className="relative aspect-[16/10]" style={{ background: o.warna }}>
                    <div className="absolute inset-0 grid place-items-center text-6xl">{o.emoji}</div>
                    <div className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] backdrop-blur">
                      {o.difficulty}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="font-display text-lg font-bold">{o.nama}</div>
                    <div className="text-xs italic text-muted-foreground">{o.namaIlmiah}</div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
