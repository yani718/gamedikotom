import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/game/Logo";
import { ParticleBg } from "@/components/game/ParticleBg";
import { Watermark } from "@/components/game/Watermark";
import { loadProfile, saveProfile, xpForLevel, type Profile } from "@/game/profile";
import { organisms } from "@/data/organisms";
import { useAuthUser, upsertMyScore } from "@/hooks/useAuthUser";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profil Pemain — DichoLife Explorer" }, { name: "description", content: "Profil, badge, dan riwayat permainan." }] }),
  component: ProfilePage,
});

const AVATARS = ["🦊","🦁","🦉","🐬","🦋","🐢","🦜","🐺","🦦","🐼","🦥","🦄"];

interface LeaderRow {
  user_id: string;
  total_score: number;
  level: number;
  display_name: string;
  avatar_emoji: string;
  avatar_url: string | null;
}

function ProfilePage() {
  const [p, setP] = useState<Profile>(() => loadProfile());
  const { user, profile, signOut, refreshProfile } = useAuthUser();
  const [savingName, setSavingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(p.name);
  const [uploading, setUploading] = useState(false);
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const [leadersLoading, setLeadersLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const refresh = () => setP(loadProfile());
    window.addEventListener("profile-update", refresh);
    return () => window.removeEventListener("profile-update", refresh);
  }, []);

  // Sync DB profile -> local
  useEffect(() => {
    if (profile) {
      const np: Profile = {
        ...p,
        name: profile.display_name,
        avatar: profile.avatar_emoji || p.avatar,
        avatarUrl: profile.avatar_url ?? null,
      };
      setP(np); saveProfile(np);
      setNameDraft(profile.display_name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  // Push local stats to scores table when signed in
  useEffect(() => {
    if (!user) return;
    upsertMyScore({
      userId: user.id,
      total_score: p.totalScore,
      level: p.level,
      organisms_played: p.played.length,
    });
  }, [user, p.totalScore, p.level, p.played.length]);

  // Load leaderboard
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLeadersLoading(true);
      const { data: scores } = await supabase
        .from("scores")
        .select("user_id, total_score, level")
        .order("total_score", { ascending: false })
        .limit(20);
      if (!scores || scores.length === 0) {
        if (!cancelled) { setLeaders([]); setLeadersLoading(false); }
        return;
      }
      const ids = scores.map((s) => s.user_id);
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_emoji, avatar_url")
        .in("id", ids);
      const byId = new Map((profs ?? []).map((x) => [x.id, x]));
      const rows: LeaderRow[] = scores.map((s) => {
        const pr = byId.get(s.user_id);
        return {
          user_id: s.user_id,
          total_score: s.total_score,
          level: s.level,
          display_name: pr?.display_name ?? "Pemain",
          avatar_emoji: pr?.avatar_emoji ?? "🦊",
          avatar_url: pr?.avatar_url ?? null,
        };
      });
      if (!cancelled) { setLeaders(rows); setLeadersLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [user, p.totalScore]);

  function update(patch: Partial<Profile>) {
    const np = { ...p, ...patch };
    setP(np); saveProfile(np);
  }

  async function saveName() {
    const trimmed = nameDraft.trim();
    if (trimmed.length < 2 || trimmed.length > 24) return;
    setSavingName(true);
    update({ name: trimmed });
    if (user) {
      await supabase.from("profiles").update({ display_name: trimmed }).eq("id", user.id);
      await refreshProfile(user.id);
    }
    setSavingName(false);
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("Foto terlalu besar (maks 4 MB).");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await compressToDataUrl(file, 256, 0.82);
      update({ avatarUrl: dataUrl });
      if (user) {
        await supabase.from("profiles").update({ avatar_url: dataUrl }).eq("id", user.id);
        await refreshProfile(user.id);
      }
    } finally {
      setUploading(false);
    }
  }

  function removePhoto() {
    update({ avatarUrl: null });
    if (user) {
      supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id).then(() => refreshProfile(user.id));
    }
  }

  const myRank = user ? leaders.findIndex((l) => l.user_id === user.id) + 1 : 0;

  return (
    <div className="relative min-h-screen">
      <ParticleBg density={14} />
      <Watermark />
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 pt-8">
        <Link to="/menu"><Logo size="sm" /></Link>
        <div className="flex items-center gap-2">
          {user ? (
            <button onClick={signOut} className="glass rounded-full px-4 py-2 text-sm hover:text-rose-300">
              Keluar
            </button>
          ) : (
            <Link to="/auth" className="rounded-full bg-emerald-grad px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow">
              Masuk dengan Google
            </Link>
          )}
          <Link to="/menu" className="glass rounded-full px-4 py-2 text-sm">← Dashboard</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <motion.section initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
          className="glass-strong rounded-3xl p-6 md:p-8">
          <div className="grid items-center gap-6 md:grid-cols-[auto_1fr]">
            <div className="relative grid h-28 w-28 place-items-center overflow-hidden rounded-3xl bg-emerald-grad text-6xl shadow-glow animate-float">
              {p.avatarUrl ? (
                <img src={p.avatarUrl} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <span>{p.avatar}</span>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value.slice(0, 24))}
                  maxLength={24}
                  placeholder="Nama tampilan"
                  className="min-w-0 flex-1 bg-transparent font-display text-3xl font-black focus:outline-none"
                />
                {nameDraft.trim() !== p.name && (
                  <button
                    onClick={saveName}
                    disabled={savingName || nameDraft.trim().length < 2}
                    className="rounded-full bg-emerald-grad px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-glow disabled:opacity-50">
                    {savingName ? "Menyimpan…" : "💾 Simpan Nama"}
                  </button>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Level {p.level} · {p.totalScore} skor · {p.badges.length} badge
                {user && <span className="ml-2 text-emerald">· Tersinkron ke Cloud</span>}
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-emerald-grad" style={{ width: `${Math.min(100, (p.xp / xpForLevel(p.level)) * 100)}%` }} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">XP {p.xp}/{xpForLevel(p.level)}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-full bg-emerald-grad px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow disabled:opacity-60">
                  {uploading ? "Mengunggah…" : (p.avatarUrl ? "🔄 Ganti Foto" : "📷 Unggah Foto")}
                </button>
                {p.avatarUrl && (
                  <button onClick={removePhoto}
                    className="glass rounded-full px-4 py-2 text-xs hover:text-rose-300">
                    🗑 Hapus Foto
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Atau Pilih Avatar Emoji</div>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button key={a} onClick={async () => {
                  update({ avatar: a, avatarUrl: null });
                  if (user) { await supabase.from("profiles").update({ avatar_emoji: a, avatar_url: null }).eq("id", user.id); refreshProfile(user.id); }
                }}
                  className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl transition ${
                    !p.avatarUrl && p.avatar === a ? "bg-emerald-grad shadow-glow scale-110" : "glass hover:scale-105"
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
            {!user ? (
              <div className="rounded-2xl bg-emerald/10 p-4 text-sm">
                <p className="text-muted-foreground">
                  Masuk dengan Google untuk melihat leaderboard global dan menyimpan skormu.
                </p>
                <Link to="/auth" className="mt-3 inline-block rounded-full bg-emerald-grad px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow">
                  Masuk Sekarang →
                </Link>
              </div>
            ) : leadersLoading ? (
              <p className="text-sm text-muted-foreground">Memuat peringkat…</p>
            ) : leaders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada skor. Jadilah yang pertama!</p>
            ) : (
              <>
                {myRank > 0 && (
                  <div className="mb-3 text-xs text-emerald">
                    Peringkatmu saat ini: <b>#{myRank}</b> dari {leaders.length}
                  </div>
                )}
                <ol className="space-y-2">
                  {leaders.map((l, i) => {
                    const me = l.user_id === user.id;
                    return (
                      <li key={l.user_id}
                        className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${me ? "bg-emerald-grad text-primary-foreground shadow-glow" : "glass"}`}>
                        <span className="w-6 font-display font-bold">{i+1}</span>
                        <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-black/20 text-xl">
                          {l.avatar_url
                            ? <img src={l.avatar_url} alt="" className="h-full w-full object-cover" />
                            : <span>{l.avatar_emoji}</span>}
                        </span>
                        <span className="flex-1 truncate font-medium">
                          {l.display_name} {me && <span className="text-[10px] opacity-80">(kamu)</span>}
                        </span>
                        <span className="text-xs opacity-80">Lv {l.level}</span>
                        <span className="font-display font-bold">{l.total_score}</span>
                      </li>
                    );
                  })}
                </ol>
              </>
            )}
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

async function compressToDataUrl(file: File, maxDim: number, quality: number): Promise<string> {
  const img = new Image();
  const url = URL.createObjectURL(file);
  try {
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error("img")); img.src = url; });
    const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.round(img.width * ratio);
    const h = Math.round(img.height * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}
