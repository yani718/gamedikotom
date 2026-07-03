import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "@/components/game/Logo";
import { ParticleBg } from "@/components/game/ParticleBg";
import { Watermark } from "@/components/game/Watermark";
import { useAuthUser } from "@/hooks/useAuthUser";
import { supabase } from "@/integrations/supabase/client";
import { organisms } from "@/data/organisms";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Mode Berkelompok — DichoLife Explorer" },
      { name: "description", content: "Buat atau gabung room permainan berkelompok." },
    ],
  }),
  component: RoomsPage,
});

type Room = {
  id: string;
  code: string;
  host_id: string;
  organism_id: string;
  status: string;
  time_limit_sec: number;
  created_at: string;
};

function randomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function RoomsPage() {
  const { user, profile, loading: authLoading } = useAuthUser();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [organismId, setOrganismId] = useState(organisms[0].id);
  const [limit, setLimit] = useState(120);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // 🔒 Wajib login untuk mengakses mode berkelompok
  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("rooms")
        .select("*")
        .eq("status", "waiting")
        .order("created_at", { ascending: false })
        .limit(30);
      if (mounted && data) setRooms(data as Room[]);
    };
    load();
    const ch = supabase
      .channel("rooms-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, load)
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, []);

  async function createRoom() {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    setBusy(true);
    setErr(null);
    const code = randomCode();
    const { data, error } = await supabase
      .from("rooms")
      .insert({
        code,
        host_id: user.id,
        organism_id: organismId,
        status: "waiting",
        time_limit_sec: limit,
      })
      .select()
      .single();
    if (error || !data) {
      setErr(error?.message ?? "Gagal membuat room");
      setBusy(false);
      return;
    }
    await supabase.from("room_players").insert({ room_id: data.id, user_id: user.id });
    navigate({ to: "/rooms/$code", params: { code: data.code } });
  }

  async function joinRoom(code: string) {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    setBusy(true);
    setErr(null);
    const { data: room } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (!room) {
      setErr("Room tidak ditemukan");
      setBusy(false);
      return;
    }
    if (room.status === "finished") {
      setErr("Room sudah selesai");
      setBusy(false);
      return;
    }
    await supabase
      .from("room_players")
      .upsert({ room_id: room.id, user_id: user.id }, { onConflict: "room_id,user_id" });
    navigate({ to: "/rooms/$code", params: { code: room.code } });
  }

  const orgMap = Object.fromEntries(organisms.map((o) => [o.id, o]));

  if (authLoading) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Memuat…</div>;
  }
  if (!user) {
    return (
      <div className="relative min-h-screen">
        <ParticleBg density={10} />
        <div className="grid min-h-screen place-items-center px-4">
          <div className="glass-strong max-w-md rounded-3xl p-6 text-center sm:p-8">
            <div className="text-4xl">🔒</div>
            <h2 className="mt-2 font-display text-xl font-black sm:text-2xl">Login Dulu Ya!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Mode berkelompok hanya bisa dimainkan setelah kamu masuk ke akun.
            </p>
            <Link to="/auth" className="mt-4 inline-block rounded-2xl bg-emerald-grad px-6 py-3 font-bold text-primary-foreground shadow-glow">
              🔑 Masuk / Daftar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20">
      <ParticleBg density={14} />
      <Watermark />
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 pt-6 sm:px-6 sm:pt-8">
        <Link to="/menu"><Logo size="sm" /></Link>
        <Link to="/menu" className="glass rounded-full px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">
          ← Menu
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-5 sm:p-7"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-emerald">Multiplayer</div>
          <h1 className="mt-1 font-display text-2xl font-black sm:text-3xl">🎮 Bermain Berkelompok</h1>
          <p className="text-sm text-muted-foreground">
            Buat room dan bagikan <b>kode 6 digit</b> ke teman-temanmu. Minimal 2 pemain untuk mulai.
          </p>
        </motion.div>

        {/* 📖 Cara Bermain Kelompok */}
        <motion.section
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass mt-4 rounded-3xl p-5 sm:p-6"
        >
          <h2 className="font-display text-lg font-bold sm:text-xl">📖 Cara Bermain Kelompok</h2>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground sm:text-[15px]">
            <li><b className="text-foreground">1.</b> Satu pemain jadi <b>Host</b> → tekan <b>“Buat Room”</b>, pilih organisme & batas waktu.</li>
            <li><b className="text-foreground">2.</b> Host membagikan <b>kode 6 digit</b> ke teman-temannya (WA, chat, dsb).</li>
            <li><b className="text-foreground">3.</b> Teman-teman membuka menu → <b>Mode Berkelompok</b> → masukkan kode → <b>Gabung</b>.</li>
            <li><b className="text-foreground">4.</b> Setelah semua siap (minimal 2 pemain), Host menekan <b>▶ Mulai Permainan</b>.</li>
            <li><b className="text-foreground">5.</b> Semua pemain mengerjakan <b>kunci dikotom</b> bersamaan — timer berjalan.</li>
            <li><b className="text-foreground">6.</b> Selesai lebih cepat = <b>bonus skor</b>. Peringkat akhir tampil di lobby.</li>
          </ol>
          <div className="mt-3 rounded-xl bg-emerald/10 p-3 text-xs text-emerald ring-1 ring-emerald/30">
            💡 Tip: bisa dimainkan di HP! Cukup buka link permainan yang sama di browser masing-masing.
          </div>
        </motion.section>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Create */}
          <section className="glass rounded-3xl p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold sm:text-xl">➕ Buat Room Baru</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Organisme</label>
                <select
                  value={organismId}
                  onChange={(e) => setOrganismId(e.target.value)}
                  className="mt-1 w-full rounded-2xl bg-input px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald"
                >
                  {organisms.map((o) => (
                    <option key={o.id} value={o.id}>{o.emoji} {o.nama} ({o.difficulty})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Batas Waktu</label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {[60, 120, 300].map((s) => (
                    <button
                      key={s}
                      onClick={() => setLimit(s)}
                      className={`rounded-2xl px-3 py-2 text-sm transition ${
                        limit === s
                          ? "bg-emerald-grad text-primary-foreground shadow-glow"
                          : "glass hover:border-emerald/40"
                      }`}
                    >
                      {s < 60 ? `${s}d` : `${Math.floor(s / 60)} menit`}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={createRoom}
                disabled={busy}
                className="w-full rounded-2xl bg-emerald-grad px-6 py-3 font-display font-bold text-primary-foreground shadow-glow disabled:opacity-50"
              >
                {busy ? "Membuat..." : "🚀 Buat Room"}
              </button>
            </div>
          </section>

          {/* Join */}
          <section className="glass rounded-3xl p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold sm:text-xl">🔑 Gabung dengan Kode</h2>
            <div className="mt-4 space-y-3">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                className="w-full rounded-2xl bg-input px-4 py-4 text-center font-display text-2xl font-black tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-emerald"
              />
              <button
                onClick={() => joinCode.length === 6 && joinRoom(joinCode)}
                disabled={busy || joinCode.length !== 6}
                className="w-full rounded-2xl bg-emerald-grad px-6 py-3 font-display font-bold text-primary-foreground shadow-glow disabled:opacity-50"
              >
                {busy ? "Mencari..." : "Gabung Room"}
              </button>
            </div>
          </section>
        </div>

        {err && (
          <div className="mt-4 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-200 ring-1 ring-rose-500/30">
            {err}
          </div>
        )}

        {/* Open rooms */}
        <section className="mt-8">
          <h3 className="mb-3 font-display text-xl font-bold">🟢 Room Terbuka ({rooms.length})</h3>
          {rooms.length === 0 ? (
            <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">
              Belum ada room aktif. Buat yang pertama!
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((r) => {
                const o = orgMap[r.organism_id];
                return (
                  <motion.button
                    key={r.id}
                    whileHover={{ y: -3 }}
                    onClick={() => joinRoom(r.code)}
                    className="glass overflow-hidden rounded-2xl p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-14 w-14 place-items-center rounded-2xl text-3xl"
                        style={{ background: o?.warna ?? "#0d4f3c" }}>
                        {o?.emoji ?? "❓"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-display font-bold">{o?.nama ?? r.organism_id}</div>
                        <div className="text-xs text-muted-foreground">
                          Kode <b className="text-emerald tracking-widest">{r.code}</b> · ⏱ {r.time_limit_sec}s
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 inline-block rounded-full bg-emerald-grad px-3 py-1 text-xs font-bold text-primary-foreground">
                      Gabung →
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </section>

        {profile && (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Masuk sebagai <b>{profile.display_name}</b>
          </p>
        )}
      </main>
    </div>
  );
}