export interface Profile {
  name: string;
  avatar: string;
  avatarUrl?: string | null;
  level: number;
  xp: number;
  totalScore: number;
  played: string[]; // organism ids
  badges: string[];
  history: { id: string; result: string; score: number; grade: string; at: number }[];
}

const KEY = "dicholife.profile.v1";
const DEFAULT: Profile = {
  name: "Penjelajah",
  avatar: "🦊",
  avatarUrl: null,
  level: 1,
  xp: 0,
  totalScore: 0,
  played: [],
  badges: [],
  history: [],
};

export function loadProfile(): Profile {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

export function saveProfile(p: Profile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent("profile-update"));
}

export function xpForLevel(level: number) {
  return 100 + level * 50;
}

export function addResult(p: Profile, payload: { id: string; result: string; score: number; grade: string }) {
  const np: Profile = { ...p };
  np.totalScore += payload.score;
  np.xp += payload.score;
  if (!np.played.includes(payload.id)) np.played = [...np.played, payload.id];
  np.history = [{ ...payload, at: Date.now() }, ...np.history].slice(0, 50);
  while (np.xp >= xpForLevel(np.level)) {
    np.xp -= xpForLevel(np.level);
    np.level += 1;
  }
  // Badges
  const earn = (b: string) => { if (!np.badges.includes(b)) np.badges.push(b); };
  if (np.played.length >= 1) earn("🎯 Klasifikasi Pertama");
  if (np.played.length >= 10) earn("🏅 10 Organisme");
  if (np.played.length >= 25) earn("🏅 25 Organisme");
  if (np.played.length === 30) earn("👑 Master Taksonomi");
  if (payload.result.includes("Mamalia")) earn("🏅 Ahli Mamalia");
  if (payload.result.includes("Burung")) earn("🏅 Ahli Burung");
  if (payload.result.includes("Reptil")) earn("🏅 Ahli Reptil");
  if (payload.result.includes("Amfibi")) earn("🏅 Ahli Amfibi");
  if (payload.result.includes("Ikan")) earn("🏅 Ahli Pisces");
  if (payload.result.includes("Serangga")) earn("🏅 Ahli Insekta");
  if (payload.result.includes("Monokotil") || payload.result.includes("Dikotil") || payload.result.includes("Paku") || payload.result.includes("Lumut")) earn("🏅 Ahli Tumbuhan");
  if (payload.result.includes("Jamur")) earn("🏅 Ahli Jamur");
  saveProfile(np);
  return np;
}

export function gradeFor(score: number): { grade: string; icon: string; color: string } {
  if (score >= 950) return { grade: "Master Biologist", icon: "🌟", color: "from-fuchsia-400 to-amber-300" };
  if (score >= 850) return { grade: "Diamond", icon: "👑", color: "from-cyan-300 to-sky-400" };
  if (score >= 750) return { grade: "Platinum", icon: "💎", color: "from-emerald-300 to-cyan-300" };
  if (score >= 600) return { grade: "Gold", icon: "🥇", color: "from-amber-300 to-yellow-500" };
  if (score >= 400) return { grade: "Silver", icon: "🥈", color: "from-slate-200 to-slate-400" };
  return { grade: "Bronze", icon: "🥉", color: "from-amber-700 to-orange-500" };
}
