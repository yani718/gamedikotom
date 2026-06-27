import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "@/components/game/Logo";
import { ParticleBg } from "@/components/game/ParticleBg";
import { Watermark } from "@/components/game/Watermark";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import { getOrganism } from "@/data/organisms";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Panel Admin — DichoLife Explorer" }] }),
  component: AdminPage,
});

type ProfileRow = {
  id: string;
  display_name: string;
  avatar_emoji: string;
  avatar_url: string | null;
  created_at?: string;
};
type ScoreRow = {
  user_id: string;
  total_score: number;
  level: number;
  organisms_played: number;
  updated_at?: string;
};
type RoomRow = {
  id: string;
  code: string;
  host_id: string;
  organism_id: string;
  status: string;
  time_limit_sec: number;
  started_at: string | null;
  created_at: string;
};
type RoomPlayerRow = {
  room_id: string;
  user_id: string;
  score: number | null;
  finished_at: string | null;
};

function AdminPage() {
  const { user, loading: authLoading } = useAuthUser();
  const { isAdmin, loading: roleLoading } = useIsAdmin(user?.id);
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [scores, setScores] = useState<Record<string, ScoreRow>>({});
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayerRow[]>([]);
  const [tab, setTab] = useState<"overview" | "players" | "rooms">("overview");

  const refresh = async () => {
    const [{ data: pr }, { data: sc }, { data: rm }, { data: rp }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, avatar_emoji, avatar_url, created_at").order("created_at", { ascending: false }),
      supabase.from("scores").select("user_id, total_score, level, organisms_played, updated_at"),
      supabase.from("rooms").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("room_players").select("room_id, user_id, score, finished_at"),
    ]);
    setProfiles((pr as ProfileRow[]) ?? []);
    setScores(Object.fromEntries(((sc as ScoreRow[]) ?? []).map((x) => [x.user_id, x])));
    setRooms((rm as RoomRow[]) ?? []);
    setRoomPlayers((rp as RoomPlayerRow[]) ?? []);
  };

  useEffect(() => {
    if (!isAdmin) return;
    refresh();
    const ch = supabase
      .channel("admin-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "room_players" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "scores" }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isAdmin]);

  if (authLoading || roleLoading) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Memeriksa akses admin…</div>;
  }
  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="glass rounded-2xl p-8 text-center">
          <p>Kamu perlu masuk dulu.</p>
          <button onClick={() => navigate({ to: "/auth" })} className="mt-4 rounded-full bg-emerald-grad px-5 py-2 text-primary-foreground">Masuk</button>
        </div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="glass rounded-2xl p-8 text-center max-w-sm">
          <div className="text-5xl">🔒</div>
          <p className="mt-3 font-display text-xl font-bold">Akses Ditolak</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Halaman ini hanya untuk admin (pemilik game). Buka <Link to="/profile" className="text-emerald underline">Profil</Link> dan klik <b>"Klaim sebagai Admin"</b> jika kamu pemilik.
          </p>
        </div>
      </div>
    );
  }

  const totalPlayers = profiles.length;
  const activeRooms = rooms.filter((r) => r.status !== "finished").length;
  const totalGames = roomPlayers.filter((p) => p.finished_at).length;
  const playersByRoom: Record<string, RoomPlayerRow[]> = {};
  for (const rp of roomPlayers) {
    (playersByRoom[rp.room_id] ??= []).push(rp);
  }
  const profMap = Object.fromEntries(profiles.map((p) => [p.id, p]));

  async function closeRoom(id: string) {
    if (!confirm("Tutup room ini?")) return;
    await supabase.from("rooms").delete().eq("id", id);
  }

  return (
    <div className="relative min-h-screen pb-20">
      <ParticleBg density={10} />
      <Watermark />
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-6 sm:px-6 sm:pt-8">
        <Link to="/menu"><Logo size="sm" /></Link>
        <div className="flex gap-2">
          <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold ring-1 ring-gold/40">⚙️ ADMIN</span>
          <Link to="/menu" className="glass rounded-full px-3 py-1.5 text-xs sm:text-sm">← Menu</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-5 sm:p-7">
          <div className="text-xs uppercase tracking-[0.3em] text-emerald">Pemilik Game</div>
          <h1 className="mt-1 font-display text-2xl font-black sm:text-3xl">🛰️ Panel Kontrol</h1>
          <p className="text-sm text-muted-foreground">Pantau semua pemain dan room secara realtime.</p>
        </motion.div>

        {/* Stats */}
        <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Total Pemain", value: totalPlayers, icon: "👥" },
            { label: "Room Aktif", value: activeRooms, icon: "🟢" },
            { label: "Game Selesai", value: totalGames, icon: "🏁" },
            { label: "Total Room", value: rooms.length, icon: "🎮" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4">
              <div className="text-2xl">{s.icon}</div>
              <div className="mt-2 font-display text-3xl font-black text-gradient-emerald">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </section>

        {/* Tabs */}
        <div className="mt-6 flex gap-2">
          {(["overview", "players", "rooms"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                tab === t ? "bg-emerald-grad text-primary-foreground shadow-glow" : "glass hover:text-emerald"
              }`}
            >
              {t === "overview" ? "Ringkasan" : t === "players" ? "Pemain" : "Room"}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <section className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="glass rounded-2xl p-4">
              <h3 className="mb-3 font-display font-bold">🏆 Top 10 Pemain</h3>
              {[...profiles]
                .sort((a, b) => (scores[b.id]?.total_score ?? 0) - (scores[a.id]?.total_score ?? 0))
                .slice(0, 10)
                .map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 border-b border-border/40 py-2 last:border-0">
                    <div className="w-6 font-display font-black text-emerald">{i + 1}</div>
                    <div className="text-xl">{p.avatar_emoji}</div>
                    <div className="flex-1 truncate text-sm">{p.display_name}</div>
                    <div className="text-xs text-muted-foreground">Lv {scores[p.id]?.level ?? 1}</div>
                    <div className="font-display font-bold text-gold">{scores[p.id]?.total_score ?? 0}</div>
                  </div>
                ))}
            </div>
            <div className="glass rounded-2xl p-4">
              <h3 className="mb-3 font-display font-bold">🟢 Room Live</h3>
              {rooms.filter((r) => r.status !== "finished").length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">Tidak ada room aktif.</div>
              )}
              {rooms.filter((r) => r.status !== "finished").map((r) => {
                const o = getOrganism(r.organism_id);
                const ps = playersByRoom[r.id] ?? [];
                return (
                  <div key={r.id} className="flex items-center gap-3 border-b border-border/40 py-2 last:border-0">
                    <div className="text-2xl">{o?.emoji ?? "❓"}</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold">{o?.nama}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Kode <b className="text-emerald tracking-widest">{r.code}</b> · {ps.length} pemain · {r.status}
                      </div>
                    </div>
                    <button onClick={() => closeRoom(r.id)} className="text-xs text-rose-300 hover:underline">Tutup</button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {tab === "players" && (
          <section className="mt-4 glass overflow-hidden rounded-2xl">
            <div className="grid grid-cols-[1fr_60px_80px_80px] gap-2 border-b border-border/40 px-4 py-2 text-[10px] uppercase tracking-widest text-muted-foreground sm:grid-cols-[1fr_80px_80px_80px_120px]">
              <span>Pemain</span><span>Level</span><span>Skor</span><span>Played</span><span className="hidden sm:block">Gabung</span>
            </div>
            {profiles.map((p) => {
              const s = scores[p.id];
              return (
                <div key={p.id} className="grid grid-cols-[1fr_60px_80px_80px] items-center gap-2 border-b border-border/40 px-4 py-2 text-sm last:border-0 sm:grid-cols-[1fr_80px_80px_80px_120px]">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-emerald-grad text-sm">
                      {p.avatar_url ? <img src={p.avatar_url} alt="" className="h-full w-full object-cover" /> : <span>{p.avatar_emoji}</span>}
                    </div>
                    <span className="truncate">{p.display_name}</span>
                  </div>
                  <span className="text-emerald">Lv {s?.level ?? 1}</span>
                  <span className="font-bold text-gold">{s?.total_score ?? 0}</span>
                  <span className="text-muted-foreground">{s?.organisms_played ?? 0}</span>
                  <span className="hidden text-[11px] text-muted-foreground sm:block">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString("id-ID") : "—"}
                  </span>
                </div>
              );
            })}
          </section>
        )}

        {tab === "rooms" && (
          <section className="mt-4 grid gap-3">
            {rooms.map((r) => {
              const o = getOrganism(r.organism_id);
              const ps = playersByRoom[r.id] ?? [];
              const host = profMap[r.host_id];
              return (
                <div key={r.id} className="glass rounded-2xl p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl text-2xl" style={{ background: o?.warna }}>
                      {o?.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-bold">{o?.nama}</div>
                      <div className="text-xs text-muted-foreground">
                        Kode <b className="tracking-widest text-emerald">{r.code}</b> · host {host?.display_name ?? "—"} · status <b>{r.status}</b>
                      </div>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs">⏱ {r.time_limit_sec}s</span>
                    {r.status !== "finished" && (
                      <button onClick={() => closeRoom(r.id)} className="rounded-full bg-rose-500/20 px-3 py-1 text-xs text-rose-200 ring-1 ring-rose-500/30 hover:bg-rose-500/30">
                        Tutup
                      </button>
                    )}
                  </div>
                  {ps.length > 0 && (
                    <div className="mt-3 grid gap-1.5 border-t border-border/40 pt-3">
                      {ps.map((rp) => {
                        const pr = profMap[rp.user_id];
                        return (
                          <div key={rp.user_id} className="flex items-center gap-2 text-sm">
                            <span className="text-base">{pr?.avatar_emoji ?? "🦊"}</span>
                            <span className="flex-1 truncate">{pr?.display_name ?? rp.user_id.slice(0, 8)}</span>
                            {rp.finished_at ? (
                              <span className="text-xs text-emerald">✓ {rp.score}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">main…</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}