import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/game/Logo";
import { ParticleBg } from "@/components/game/ParticleBg";
import { Watermark } from "@/components/game/Watermark";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Pengaturan — DichoLife Explorer" }, { name: "description", content: "Pengaturan tema, suara, dan akun." }] }),
  component: Settings,
});

function Settings() {
  const [theme, setTheme] = useState<"dark"|"light">("dark");
  const [vol, setVol] = useState(60);
  const [music, setMusic] = useState(true);
  const [sfx, setSfx] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  return (
    <div className="relative min-h-screen">
      <ParticleBg density={12} />
      <Watermark />
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 pt-8">
        <Link to="/menu"><Logo size="sm" /></Link>
        <Link to="/menu" className="glass rounded-full px-4 py-2 text-sm">← Dashboard</Link>
      </header>
      <main className="mx-auto max-w-3xl space-y-5 px-6 py-8">
        <h1 className="font-display text-3xl font-black">Pengaturan</h1>

        <section className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg font-bold">🎨 Tema</h2>
          <div className="mt-3 flex gap-2">
            {(["dark","light"] as const).map((t) => (
              <button key={t} onClick={() => setTheme(t)}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium ${
                  theme===t ? "bg-emerald-grad text-primary-foreground shadow-glow" : "glass"
                }`}>{t === "dark" ? "🌙 Gelap" : "☀️ Terang"}</button>
            ))}
          </div>
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg font-bold">🔊 Audio</h2>
          <label className="mt-3 block text-sm">
            Volume: <b className="text-emerald">{vol}%</b>
            <input type="range" min={0} max={100} value={vol} onChange={(e) => setVol(+e.target.value)}
              className="mt-1 w-full accent-emerald-500" />
          </label>
          <div className="mt-3 flex gap-2">
            <button onClick={() => setMusic(!music)}
              className={`flex-1 rounded-xl px-4 py-3 text-sm ${music ? "bg-emerald-grad text-primary-foreground" : "glass"}`}>
              🎵 Musik {music ? "ON" : "OFF"}
            </button>
            <button onClick={() => setSfx(!sfx)}
              className={`flex-1 rounded-xl px-4 py-3 text-sm ${sfx ? "bg-emerald-grad text-primary-foreground" : "glass"}`}>
              🔔 SFX {sfx ? "ON" : "OFF"}
            </button>
          </div>
        </section>

        <section className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg font-bold">💾 Data</h2>
          <p className="mt-1 text-sm text-muted-foreground">Data permainanmu tersimpan lokal di perangkat ini.</p>
          <button onClick={() => { if (confirm("Hapus seluruh data profil?")) { localStorage.removeItem("dicholife.profile.v1"); location.reload(); } }}
            className="mt-3 rounded-xl bg-destructive px-4 py-2 text-sm text-destructive-foreground">Reset Data</button>
        </section>
      </main>
    </div>
  );
}
