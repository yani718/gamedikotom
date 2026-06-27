import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "@/components/game/Logo";
import { ParticleBg } from "@/components/game/ParticleBg";
import { Watermark } from "@/components/game/Watermark";
import { useAuthUser } from "@/hooks/useAuthUser";
import { supabase } from "@/integrations/supabase/client";
import { getOrganism } from "@/data/organisms";

export const Route = createFileRoute("/rooms/$code")({
  head: () => ({ meta: [{ title: "Lobby Room — DichoLife Explorer" }] }),
  component: RoomLobby,
});

type Room = {
  id: string;
  code: string;
  host_id: string;
  organism_id: string;
  status: string;
  time_limit_sec: number;
  started_at: string | null;
  finished_at: string | null;
};

type PlayerRow = {
  user_id: string;
  joined_at: string;
  finished_at: string | null;
  score: number | null;
  result_leaf: string | null;
};

type ProfileRow = {
  id: string;
  display_name: string;
  avatar_emoji: string;
  avatar_url: string | null;
};

function RoomLobby() {
  const { code } = Route.useParams();
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [loading, setLoading] = useState(true);

  // Load room + players
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data: r } = await supabase.from("rooms").select("*").eq("code", code).maybeSingle();
      if (!mounted) return;
      if (!r) {
        setRoom(null);
        setLoading(false);
        return;
      }
      setRoom(r as Room);
      const { data: ps } = await supabase
        .from("room_players")
        .select("user_id, joined_at, finished_at, score, result_leaf")
        .eq("room_id", r.id)
        .order("joined_at", { ascending: true });
      if (!mounted) return;
      setPlayers((ps as PlayerRow[]) ?? []);
      const ids = (ps ?? []).map((p) => p.user_id);
      if (ids.length) {
        const { data: pr } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_emoji, avatar_url")
          .in("id", ids);
        if (mounted)
          setProfiles(
            Object.fromEntries(((pr as ProfileRow[]) ?? []).map((x) => [x.id, x])),
          );
      }
      setLoading(false);
    };
    load();

    const ch = supabase
      .channel(`room-${code}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "room_players" }, load)
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, [code]);

  // Auto-navigate to play when game starts
  useEffect(() => {
    if (room?.status === "playing" && user) {
      navigate({ to: "/play/$id", params: { id: room.organism_id }, search: { room: room.code } });
    }
  }, [room?.status, room?.organism_id, room?.code, user, navigate]);

  const isHost = !!user && room?.host_id === user.id;
  const inRoom = !!user && players.some((p) => p.user_id === user.id);
  const organism = room ? getOrganism(room.organism_id) : null;

  async function leave() {
    if (!user || !room) return;
    await supabase.from("room_players").delete().eq("room_id", room.id).eq("user_id", user.id);
    navigate({ to: "/rooms" });
  }

  async function start() {
    if (!room || !isHost) return;
    if (players.length < 2) {
      alert("Minimal 2 pemain untuk mulai!");
      return;
    }
    await supabase
      .from("rooms")
      .update({ status: "playing", started_at: new Date().toISOString() })
      .eq("id", room.id);
  }

  async function kick(uid: string) {
    if (!room || !isHost) return;
    await supabase.from("room_players").delete().eq("room_id", room.id).eq("user_id", uid);
  }

  async function joinNow() {
    if (!user || !room) {
      navigate({ to: "/auth" });
      return;
    }
    await supabase
      .from("room_players")
      .upsert({ room_id: room.id, user_id: user.id }, { onConflict: "room_id,user_id" });
  }

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Memuat room…</div>;
  }
  if (!room) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="glass rounded-2xl p-8 text-center">
          <p>Room dengan kode <b>{code}</b> tidak ditemukan.</p>
          <Link to="/rooms" className="mt-4 inline-block rounded-full bg-emerald-grad px-5 py-2 text-primary-foreground">
            ← Daftar Room
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20">
      <ParticleBg density={14} />
      <Watermark />
      <header className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 pt-6 sm:px-6 sm:pt-8">
        <Link to="/menu"><Logo size="sm" /></Link>
        <Link to="/rooms" className="glass rounded-full px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">
          ← Semua Room
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-5 sm:p-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-emerald">Kode Room</div>
              <div className="font-display text-4xl font-black tracking-[0.4em] sm:text-5xl">
                {room.code}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Bagikan kode ini ke teman-temanmu!
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(room.code);
              }}
              className="glass rounded-full px-4 py-2 text-sm hover:text-emerald"
            >
              📋 Salin Kode
            </button>
          </div>

          {organism && (
            <div className="mt-5 flex items-center gap-4 rounded-2xl bg-emerald/5 p-3 ring-1 ring-emerald/20">
              <div className="grid h-16 w-16 place-items-center rounded-2xl text-4xl" style={{ background: organism.warna }}>
                {organism.emoji}
              </div>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-widest text-emerald">Subjek</div>
                <div className="font-display text-lg font-bold">{organism.nama}</div>
                <div className="text-xs text-muted-foreground">⏱ {room.time_limit_sec} detik · {organism.difficulty}</div>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {!inRoom && room.status === "waiting" && (
              <button onClick={joinNow} className="rounded-2xl bg-emerald-grad px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow">
                Gabung Sekarang
              </button>
            )}
            {inRoom && !isHost && room.status === "waiting" && (
              <button onClick={leave} className="glass rounded-2xl px-5 py-2.5 text-sm hover:text-rose-300">
                Keluar
              </button>
            )}
            {isHost && room.status === "waiting" && (
              <>
                <button
                  onClick={start}
                  disabled={players.length < 2}
                  className="rounded-2xl bg-emerald-grad px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-glow disabled:opacity-50"
                >
                  ▶ Mulai Permainan ({players.length}/2+)
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Tutup room ini?")) {
                      await supabase.from("rooms").delete().eq("id", room.id);
                      navigate({ to: "/rooms" });
                    }
                  }}
                  className="glass rounded-2xl px-5 py-2.5 text-sm hover:text-rose-300"
                >
                  Tutup Room
                </button>
              </>
            )}
            {room.status === "playing" && (
              <div className="rounded-2xl bg-amber-500/20 px-4 py-2 text-sm text-amber-200 ring-1 ring-amber-500/30">
                🎮 Permainan sedang berlangsung…
              </div>
            )}
            {room.status === "finished" && (
              <div className="rounded-2xl bg-emerald/20 px-4 py-2 text-sm text-emerald ring-1 ring-emerald/30">
                ✅ Permainan selesai
              </div>
            )}
          </div>
        </motion.section>

        {/* Players */}
        <section className="mt-6">
          <h3 className="mb-3 font-display text-xl font-bold">👥 Peserta ({players.length})</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <AnimatePresence>
              {players.map((p) => {
                const pr = profiles[p.user_id];
                const isHostRow = p.user_id === room.host_id;
                const isYou = user?.id === p.user_id;
                return (
                  <motion.div
                    key={p.user_id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="glass flex items-center gap-3 rounded-2xl p-3"
                  >
                    <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-emerald-grad text-2xl shadow-glow">
                      {pr?.avatar_url ? (
                        <img src={pr.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span>{pr?.avatar_emoji ?? "🦊"}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 truncate font-display font-bold">
                        {pr?.display_name ?? "Penjelajah"}
                        {isHostRow && <span className="rounded-full bg-gold/30 px-2 py-0.5 text-[10px] text-gold">HOST</span>}
                        {isYou && <span className="text-xs text-emerald">(kamu)</span>}
                      </div>
                      {p.finished_at && (
                        <div className="text-xs text-muted-foreground">
                          Selesai · skor <b className="text-gold">{p.score}</b>
                        </div>
                      )}
                    </div>
                    {isHost && !isHostRow && room.status === "waiting" && (
                      <button onClick={() => kick(p.user_id)} className="text-xs text-rose-300 hover:underline">
                        Kick
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>

        {/* Result ranking when finished */}
        {(room.status === "finished" || players.every((p) => p.finished_at)) && players.length > 0 && (
          <section className="mt-8">
            <h3 className="mb-3 font-display text-xl font-bold">🏆 Hasil Akhir</h3>
            <div className="glass rounded-2xl p-4">
              {[...players]
                .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
                .map((p, i) => {
                  const pr = profiles[p.user_id];
                  return (
                    <div key={p.user_id} className="flex items-center gap-3 border-b border-border/40 py-2 last:border-0">
                      <div className="w-6 font-display font-black text-emerald">{i + 1}</div>
                      <div className="text-2xl">{pr?.avatar_emoji ?? "🦊"}</div>
                      <div className="flex-1 truncate">{pr?.display_name ?? "—"}</div>
                      <div className="font-display font-bold text-gold">{p.score ?? "—"}</div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}