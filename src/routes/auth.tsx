import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "@/components/game/Logo";
import { ParticleBg } from "@/components/game/ParticleBg";
import { Watermark } from "@/components/game/Watermark";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk — DichoLife Explorer" },
      { name: "description", content: "Masuk ke DichoLife Explorer untuk menyimpan skor dan tampil di leaderboard global." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/profile" });
    });
  }, [navigate]);

  async function signInGoogle() {
    setLoading(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/profile",
    });
    if (result.error) {
      setError(result.error.message || "Gagal masuk dengan Google");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/profile" });
  }

  return (
    <div className="relative min-h-screen">
      <ParticleBg density={18} />
      <Watermark />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-8">
        <Link to="/"><Logo size="sm" /></Link>
        <Link to="/menu" className="glass rounded-full px-4 py-2 text-sm">← Dashboard</Link>
      </header>
      <main className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-6">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          className="glass-strong w-full rounded-3xl p-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-emerald-grad text-3xl shadow-glow animate-float">🌿</div>
          <h1 className="font-display text-3xl font-black">Masuk untuk Mulai</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Masuk dengan Google untuk menyimpan progresmu, mengunggah foto profil, dan
            tampil di leaderboard global.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
            onClick={signInGoogle} disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-3 font-display font-bold text-slate-900 shadow-glow disabled:opacity-60">
            <GoogleIcon />
            {loading ? "Menghubungkan…" : "Masuk dengan Google"}
          </motion.button>
          {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}
          <p className="mt-4 text-[11px] text-muted-foreground">
            Dengan masuk, kamu setuju skor dan nama tampilanmu dapat dilihat di leaderboard publik.
          </p>
          <Link to="/menu" className="mt-4 inline-block text-xs text-muted-foreground underline">
            Lanjut sebagai tamu
          </Link>
        </motion.div>
      </main>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.45 2.1 14.96 1 12 1 7.69 1 3.99 3.48 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}