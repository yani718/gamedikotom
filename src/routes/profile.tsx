import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "@/components/game/Logo";
import { ParticleBg } from "@/components/game/ParticleBg";
import { Watermark } from "@/components/game/Watermark";
import { loadProfile, saveProfile, xpForLevel, type Profile } from "@/game/profile";
import { organisms } from "@/data/organisms";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profil Pemain — DichoLife Explorer" }, { name: "description", content: "Profil, badge, dan riwayat permainan." }] }),
  component: ProfilePage,
});

const AVATARS = ["🦊","🦁","🦉","🐬","🦋","🐢","🦜","🐺","🦦","🐼","🦥","🦄"];

function ProfilePage() {
  const [p, setP] = useState<Profile>(() => loadProfile());
  useEffect(() => {
    const refresh = () => setP(loadProfile());
    window.addEventListener("profile-update", refresh);
    return () => window.removeEventListener("profile-update", refresh);
  }, []);

  function update(patch: Partial<Profile>) {
    const np = { ...p, ...patch };
    setP(np); saveProfile(np);
  }

  // synthetic leaderboard
  const leaderboard = [
    { name: "Aria", score: 4820, level: 12, avatar: "🦜" },
    { name: "Bima", score: 4310, level: 11, avatar: "🦁" },
    { name: "Cinta", score: 3960, level: 10, avatar: "🦋" },
    { name: p.name || "Kamu", score: p.totalScore, level: p.level, avatar: p.avatar, me: true },
    { name: "Dewa", score: 2890, level: 8, avatar: "🐺" },
    { name: "Eka", score: 2410, level: 7, avatar: "🦦" },
  ].sort((a,b) => b.score - a.score);

  return (
    <div className="relative min-h-screen">
      <ParticleBg density={14} />
      <Watermark />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-8">
        <Link to="/menu"><Logo size="sm" /></Link>
        <Link to="/menu" className="glass rounded-full px-4 py-2 text-sm">← Dashboard</Link>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <motion.section initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
          className="glass-strong rounded-3xl p-6 md:p-8">
          <div className="grid items-center gap-6 md:grid-cols-[auto_1fr]">
            <div className="grid h-28 w-28 place-items-center rounded-3xl bg-emerald-grad text-6xl shadow-glow animate-float">
              {p.avatar}
            </div>
            <div>
              <input value={p.name} onChange={(e) => update({ name: e.target.value })}
                className="w-full bg-transparent font-display text-3xl font-black focus:outline-none" />
              <div className="text-sm text-muted-foreground">Level {p.level} · {p.totalScore} skor · {p.badges.length} badge</div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-emerald-grad" style={{ width: `${Math.min(100, (p.xp / xpForLevel(p.level)) * 100)}%` }} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">XP {p.xp}/{xpForLevel(p.level)}</div>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Pilih Avatar</div>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button key={a} onClick={() => update({ avatar: a })}
                  className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl transition ${
                    p.avatar === a ? "bg-emerald-grad shadow-glow scale-110" : "glass hover:scale-105"
                  }`}>{a}</button>
              ))}
            </div>
          </div>
        </motion.section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="glass rounded-3xl p-6">
            <h2 className="mb-3 font-display text-xl font-bold">🏅 Badge</h2>
            {p.badges.length === 0 ? (
              <p className="text-sm text-muted-foreground">Mainkan klasifikasi pertamamu untuk mendapatkan badge.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {p.badges.map((b) => (
                  <motion.span key={b} whileHover={{ scale: 1.05 }}
                    className="rounded-full bg-emerald-grad px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-glow">
                    {b}
                  </motion.span>
                ))}
              </div>
            )}
            <div className="mt-5">
              <div className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">Progress Koleksi</div>
              <div className="text-2xl font-display font-black text-gradient-emerald">{p.played.length}/{organisms.length}</div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-emerald-grad" style={{ width: `${(p.played.length/organisms.length)*100}%` }} />
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <h2 className="mb-3 font-display text-xl font-bold">🏆 Leaderboard</h2>
            <ol className="space-y-2">
              {leaderboard.map((l, i) => (
                <li key={l.name + i}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${l.me ? "bg-emerald-grad text-primary-foreground shadow-glow" : "glass"}`}>
                  <span className="w-6 font-display font-bold">{i+1}</span>
                  <span className="text-2xl">{l.avatar}</span>
                  <span className="flex-1 font-medium">{l.name} {l.me && <span className="text-[10px] opacity-80">(kamu)</span>}</span>
                  <span className="text-xs opacity-80">Lv {l.level}</span>
                  <span className="font-display font-bold">{l.score}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="glass rounded-3xl p-6">
          <h2 className="mb-3 font-display text-xl font-bold">📜 Riwayat Permainan</h2>
          {p.history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada permainan.</p>
          ) : (
            <ul className="divide-y divide-border">
              {p.history.slice(0, 10).map((h) => (
                <li key={h.at} className="flex items-center gap-3 py-2 text-sm">
                  <span className="rounded-full bg-emerald-grad px-2 py-0.5 text-[10px] text-primary-foreground">{h.grade}</span>
                  <span className="flex-1 truncate"><b>{organisms.find(o=>o.id===h.id)?.nama ?? h.id}</b> → {h.result}</span>
                  <span className="font-display font-bold text-gold">{h.score}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
