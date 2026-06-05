import { motion } from "framer-motion";

export function Logo({ size = "lg" }: { size?: "sm" | "lg" }) {
  const big = size === "lg";
  return (
    <div className="flex items-center gap-3">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className={`relative grid place-items-center rounded-2xl bg-emerald-grad shadow-glow ${big ? "h-14 w-14" : "h-10 w-10"}`}
      >
        <span className={big ? "text-3xl" : "text-xl"}>🌿</span>
        <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
      </motion.div>
      <div className="leading-tight">
        <div className={`font-display font-black tracking-tight ${big ? "text-2xl" : "text-lg"}`}>
          <span className="text-gradient-emerald">DichoLife</span>{" "}
          <span className="text-foreground">Explorer</span>
        </div>
        {big && (
          <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Jelajahi Klasifikasi Hayati
          </div>
        )}
      </div>
    </div>
  );
}
