import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/game/Logo";
import { ParticleBg } from "@/components/game/ParticleBg";
import { Watermark } from "@/components/game/Watermark";
import { getOrganism } from "@/data/organisms";
import { ALL_CHIPS, classify, rootKey, type DichotomousNode } from "@/game/dichotomousKey";
import { addResult, gradeFor, loadProfile } from "@/game/profile";
import { Timer } from "@/components/game/Timer";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";

export const Route = createFileRoute("/play/$id")({
  head: () => ({ meta: [{ title: "Investigasi Organisme — DichoLife Explorer" }, { name: "description", content: "Investigasi organisme dengan kunci dikotom interaktif." }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    room: typeof s.room === "string" ? s.room : undefined,
  }),
  component: Play,
});

type Phase = "investigate" | "key" | "result";

function Play() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const organism = getOrganism(id);
  const { user } = useAuthUser();

  const [phase, setPhase] = useState<Phase>("investigate");
  const [chips, setChips] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState("");
  const [cursor, setCursor] = useState<DichotomousNode>(rootKey);
  const [path, setPath] = useState<{ q: string; ans: "yes" | "no"; correct: boolean; node: DichotomousNode }[]>([]);
  const [wrong, setWrong] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Room mode state
  const roomCode = search.room;
  const [roomMeta, setRoomMeta] = useState<{
    id: string;
    started_at: string | null;
    time_limit_sec: number;
    code: string;
  } | null>(null);
  const reportedRef = useRef(false);

  useEffect(() => {
    if (!roomCode) return;
    let mounted = true;
    supabase
      .from("rooms")
      .select("id, started_at, time_limit_sec, code")
      .eq("code", roomCode)
      .maybeSingle()
      .then(({ data }) => {
        if (mounted && data) setRoomMeta(data as never);
      });
    return () => { mounted = false; };
  }, [roomCode]);

  if (!organism) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="glass rounded-2xl p-8 text-center">
          <p>Organisme tidak ditemukan.</p>
          <Link to="/gallery" className="mt-4 inline-block rounded-full bg-emerald-grad px-5 py-2 text-primary-foreground">Ke Galeri</Link>
        </div>
      </div>
    );
  }

  const truth = useMemo(() => classify(organism), [organism]);
  const matchedChips = chips.filter((c) =>
    organism.karakteristik.some((k) => k.toLowerCase().includes(c.toLowerCase()))
  );
  const noteHits = customNote
    .toLowerCase()
    .split(/[,\n;.]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => organism.karakteristik.some((k) => k.toLowerCase().includes(s)));

  function toggleChip(c: string) {
    setChips((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  }

  function answer(ans: "yes" | "no") {
    if (!organism) return;
    const correctAns: "yes" | "no" = cursor.test(organism) ? "yes" : "no";
    const correct = ans === correctAns;
    if (!correct) setWrong((w) => w + 1);
    setPath((p) => [...p, { q: cursor.question, ans, correct, node: cursor }]);
    const next = ans === "yes" ? cursor.yes : cursor.no;
    if (typeof next === "string") {
      // finished
      const truthLeaf = truth.result;
      const finalLeaf = correct ? next : truthLeaf; // if user wrong at last, still show truth as result
      finishGame(finalLeaf, correct ? wrong : wrong + 1);
    } else {
      setCursor(next);
    }
  }

  function goBackStep() {
    if (path.length === 0) return;
    const prev = path[path.length - 1];
    setPath((p) => p.slice(0, -1));
    if (!prev.correct) setWrong((w) => Math.max(0, w - 1));
    setCursor(prev.node);
  }

  function finishGame(leaf: string, totalWrong: number) {
    setResult(leaf);
    const base = 1000;
    const stepsTaken = path.length + 1;
    const chipBonus = Math.min(150, matchedChips.length * 25 + noteHits.length * 15);
    const penalty = totalWrong * 220 + Math.max(0, stepsTaken - 5) * 10;
    let score = Math.max(50, base + chipBonus - penalty);
    // Speed bonus for room mode
    if (roomMeta?.started_at && roomMeta.time_limit_sec) {
      const elapsed = Math.max(0, (Date.now() - new Date(roomMeta.started_at).getTime()) / 1000);
      const remaining = Math.max(0, roomMeta.time_limit_sec - elapsed);
      const speedBonus = Math.round((remaining / roomMeta.time_limit_sec) * 300);
      score += speedBonus;
    }
    const g = gradeFor(score);
    addResult(loadProfile(), { id: organism!.id, result: leaf, score, grade: g.grade });
    // Report to room
    if (roomMeta?.id && user && !reportedRef.current) {
      reportedRef.current = true;
      supabase
        .from("room_players")
        .update({
          finished_at: new Date().toISOString(),
          score,
          result_leaf: leaf,
        })
        .eq("room_id", roomMeta.id)
        .eq("user_id", user.id)
        .then(() => {});
    }
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3500);
    setPhase("result");
  }

  function timeExpired() {
    if (phase === "result") return;
    finishGame(truth.result, wrong + 1);
  }

  return (
    <div className="relative min-h-screen pb-20">
      <ParticleBg density={16} />
      <Watermark />
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-6 sm:px-6 sm:pt-8">
        <Link to="/menu"><Logo size="sm" /></Link>
        {roomCode ? (
          <Link to="/rooms/$code" params={{ code: roomCode }} className="glass rounded-full px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">
            ← Room {roomCode}
          </Link>
        ) : (
          <Link to="/gallery" className="glass rounded-full px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">← Galeri</Link>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {roomMeta?.started_at && phase !== "result" && (
          <div className="mb-4">
            <Timer
              startedAt={new Date(roomMeta.started_at).getTime()}
              limitSec={roomMeta.time_limit_sec}
              onExpire={timeExpired}
            />
          </div>
        )}
        {/* Subject card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-strong relative grid items-center gap-5 overflow-hidden rounded-3xl p-5 sm:p-6 md:grid-cols-[220px_1fr] md:gap-6 md:p-8 lg:grid-cols-[260px_1fr]"
        >
          <div className="relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-3xl shadow-glow sm:max-w-[240px] md:max-w-none"
            style={{ background: `radial-gradient(circle at 50% 35%, ${organism.warna}, transparent 70%), linear-gradient(160deg, oklch(0.20 0.04 255), oklch(0.10 0.04 250))` }}>
            <motion.div className="absolute inset-0 grid place-items-center text-[100px] sm:text-[120px] md:text-[140px]"
              animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              {organism.emoji}
            </motion.div>
          </div>
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.3em] text-emerald">Subjek Investigasi · {organism.difficulty}</div>
            <h1 className="mt-1 break-words font-display text-3xl font-black sm:text-4xl">{organism.nama}</h1>
            <p className="italic text-muted-foreground">{organism.namaIlmiah}</p>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">{organism.deskripsi}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="glass rounded-full px-3 py-1">🌍 {organism.habitat}</span>
              <span className="glass rounded-full px-3 py-1">🍽 {organism.makanan}</span>
              <span className="glass rounded-full px-3 py-1">🧬 {organism.reproduksi}</span>
            </div>
          </div>
        </motion.section>

        {/* Phase progress */}
        <div className="mt-6 flex items-center gap-1.5 text-[11px] sm:gap-2 sm:text-xs">
          {(["investigate","key","result"] as Phase[]).map((ph, i) => (
            <div key={ph} className={`flex-1 rounded-full px-2 py-2 text-center font-medium sm:px-3 ${
              phase === ph ? "bg-emerald-grad text-primary-foreground shadow-glow" : "glass text-muted-foreground"
            }`}>
              {i+1}. {ph === "investigate" ? "Investigasi" : ph === "key" ? "Kunci Dikotom" : "Hasil"}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
        {phase === "investigate" && (
          <motion.section key="inv" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-6 grid gap-6">
            <div className="glass rounded-3xl p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold sm:text-xl">🔬 Pilih Karakteristik Organisme</h2>
              <p className="text-sm text-muted-foreground">Tap chip yang menurutmu sesuai. Kamu boleh memilih lebih dari satu.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {ALL_CHIPS.map((c) => {
                  const active = chips.includes(c);
                  return (
                    <motion.button key={c} whileTap={{ scale: 0.93 }} onClick={() => toggleChip(c)}
                      className={`relative overflow-hidden rounded-full border px-4 py-2 text-sm transition ${
                        active ? "bg-emerald-grad text-primary-foreground border-transparent shadow-glow"
                               : "glass border-border hover:border-emerald/40"
                      }`}>
                      <span className="mr-1">{active ? "🟢" : "⚪"}</span>{c}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="glass rounded-3xl p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold sm:text-xl">✍️ Tulis Ciri Tambahan</h2>
              <p className="text-sm text-muted-foreground">Pisahkan dengan koma. Contoh: <i>melahirkan, hidup di savana, memiliki rambut</i></p>
              <textarea value={customNote} onChange={(e) => setCustomNote(e.target.value)}
                rows={3}
                className="mt-3 w-full resize-none rounded-2xl bg-input px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald" />
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Cocok dengan database: <b className="text-emerald">{matchedChips.length + noteHits.length}</b> ciri</span>
                <span className="text-muted-foreground">Bonus skor untuk akurasi ciri</span>
              </div>
            </div>

            <div className="flex justify-stretch sm:justify-end">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setPhase("key")}
                className="w-full rounded-2xl bg-emerald-grad px-6 py-4 font-display font-bold text-primary-foreground shadow-glow sm:w-auto sm:px-8">
                Lanjut ke Kunci Dikotom →
              </motion.button>
            </div>
          </motion.section>
        )}

        {phase === "key" && (
          <motion.section key="key" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-6 grid gap-6">
            {/* path so far */}
            <div className="glass rounded-3xl p-5 sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold sm:text-xl">🌳 Pohon Klasifikasi</h2>
                <span className="text-xs text-muted-foreground">Langkah {path.length + 1} · Salah {wrong}</span>
              </div>
              <div className="flex flex-col gap-2">
                {path.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${p.correct ? "bg-emerald-grad text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>
                      {p.correct ? "✓" : "✗"}
                    </span>
                    <span className="truncate text-muted-foreground">{p.q}</span>
                    <span className="ml-auto rounded-full glass px-2 py-0.5 text-[10px] uppercase">{p.ans}</span>
                  </div>
                ))}
              </div>

              <motion.div key={cursor.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-5 rounded-2xl bg-gradient-to-br from-emerald/15 to-transparent p-4 ring-1 ring-emerald/30 sm:p-5">
                <div className="text-3xl">{cursor.emoji ?? "❓"}</div>
                <div className="mt-2 font-display text-lg font-bold sm:text-xl">{cursor.question}</div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {(["yes","no"] as const).map((side) => (
                    <motion.button key={side}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                      onClick={() => answer(side)}
                      className={`group relative overflow-hidden rounded-2xl p-4 text-left transition sm:p-5 ${
                        side === "yes"
                          ? "bg-emerald-grad text-primary-foreground shadow-glow"
                          : "glass hover:border-emerald/40"
                      }`}>
                      <div className="text-xs uppercase tracking-widest opacity-80">
                        {side === "yes" ? "✅ Ya" : "🚫 Tidak"}
                      </div>
                      <div className="mt-1 font-display text-lg font-bold">
                        {side === "yes" ? "Memiliki ciri tersebut" : "Tidak memiliki ciri itu"}
                      </div>
                      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 animate-shimmer" />
                    </motion.button>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                    onClick={() => (path.length === 0 ? setPhase("investigate") : goBackStep())}
                    className="glass rounded-full px-4 py-2 font-medium hover:text-emerald">
                    ← Kembali {path.length === 0 ? "ke Investigasi" : "& ubah jawaban"}
                  </motion.button>
                  <span className="text-muted-foreground">
                    Ragu? Kamu boleh mundur dan mencoba jawaban lain.
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}

        {phase === "result" && result && (
          <motion.section key="res" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="mt-6 grid gap-6">
            <ResultCard organism={organism} leaf={result} wrong={wrong} steps={path.length}
              chipBonus={matchedChips.length + noteHits.length} truth={truth.result} />
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => { setPhase("investigate"); setChips([]); setCustomNote(""); setCursor(rootKey); setPath([]); setWrong(0); setResult(null); }}
                className="glass rounded-2xl px-6 py-3 font-medium hover:text-emerald">🔁 Coba Lagi</button>
              <button onClick={() => navigate({ to: "/gallery" })}
                className="rounded-2xl bg-emerald-grad px-6 py-3 font-display font-bold text-primary-foreground shadow-glow">
                Pilih Organisme Lain →
              </button>
            </div>
          </motion.section>
        )}
        </AnimatePresence>

        {showConfetti && <Confetti />}
      </main>
    </div>
  );
}

function ResultCard({ organism, leaf, wrong, steps, chipBonus, truth }: {
  organism: NonNullable<ReturnType<typeof getOrganism>>; leaf: string; wrong: number; steps: number; chipBonus: number; truth: string;
}) {
  const base = 1000;
  const score = Math.max(50, base + Math.min(150, chipBonus * 20) - wrong * 220 - Math.max(0, steps - 5) * 10);
  const g = gradeFor(score);
  const success = leaf === truth;

  return (
    <motion.div initial={{ rotateX: -10, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }}
      className="glass-strong relative overflow-hidden rounded-3xl p-6 md:p-8">
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-grad opacity-25 blur-3xl" />
      <div className="text-xs uppercase tracking-[0.3em] text-emerald">{success ? "Klasifikasi Berhasil" : "Hampir! Lihat jawaban benar"}</div>
      <h2 className="mt-1 font-display text-4xl font-black">🎉 {leaf}</h2>
      <p className="mt-2 text-muted-foreground">Organisme ini termasuk dalam kelompok <b className="text-emerald">{leaf}</b>.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Skor" value={score.toString()} tone="emerald" />
        <Stat label="Grade" value={`${g.icon} ${g.grade}`} tone="gold" />
        <Stat label="Langkah" value={steps.toString()} />
        <Stat label="Salah" value={wrong.toString()} tone={wrong ? "rose" : "emerald"} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="glass rounded-2xl p-4">
          <div className="mb-2 font-display text-lg font-bold">🧬 Taksonomi Lengkap</div>
          <ul className="space-y-1 text-sm">
            {[
              ["Kingdom", organism.kingdom],["Filum", organism.filum],["Kelas", organism.kelas],
              ["Ordo", organism.ordo],["Famili", organism.famili],["Genus", organism.genus],["Spesies", organism.spesies],
            ].map(([k,v]) => (
              <li key={k} className="flex justify-between gap-3">
                <span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="mb-2 font-display text-lg font-bold">📖 Profil Organisme</div>
          <ul className="space-y-2 text-sm">
            <li><b>Habitat:</b> <span className="text-muted-foreground">{organism.habitat}</span></li>
            <li><b>Makanan:</b> <span className="text-muted-foreground">{organism.makanan}</span></li>
            <li><b>Reproduksi:</b> <span className="text-muted-foreground">{organism.reproduksi}</span></li>
            <li><b>Status Konservasi:</b> <span className="text-muted-foreground">{organism.statusKonservasi}</span></li>
            <li><b>Peran Ekosistem:</b> <span className="text-muted-foreground">{organism.peranEkosistem}</span></li>
            <li className="pt-2"><b>✨ Fakta Unik:</b> <span className="text-emerald">{organism.faktaUnik}</span></li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "emerald" | "gold" | "rose" }) {
  const colors: Record<string,string> = {
    emerald: "from-emerald-400/30 to-emerald-700/10 text-emerald",
    gold: "from-amber-300/30 to-amber-700/10 text-gold",
    rose: "from-rose-400/30 to-rose-700/10 text-rose-300",
  };
  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 glass`}>
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${tone ? colors[tone] : "from-emerald-500/10 to-transparent"} opacity-50`} />
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-black">{value}</div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 40 });
  const colors = ["#10B981","#22C55E","#F8FAFC","#FBBF24","#38BDF8"];
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const c = colors[i % colors.length];
        return (
          <motion.span key={i}
            initial={{ y: -20, x: `${left}vw`, opacity: 1, rotate: 0 }}
            animate={{ y: "110vh", rotate: 720, opacity: 0 }}
            transition={{ duration: 2.5 + Math.random() * 1.5, delay, ease: "easeIn" }}
            className="absolute h-3 w-2 rounded-sm"
            style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
        );
      })}
    </div>
  );
}
