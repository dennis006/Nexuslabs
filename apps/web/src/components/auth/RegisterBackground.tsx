import { motion } from "framer-motion";

type OrbConfig = {
  top: string;
  left: string;
  size: string;
  gradient: string;
  duration: number;
  delay?: number;
};

type CometConfig = {
  top: string;
  delay: number;
  duration: number;
  direction: "left" | "right";
};

type GlyphConfig = {
  symbol: string;
  top: string;
  left: string;
  delay: number;
};

const orbs: OrbConfig[] = [
  {
    top: "-10%",
    left: "-18%",
    size: "26rem",
    gradient:
      "bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.45),_rgba(12,17,33,0))]",
    duration: 32,
  },
  {
    top: "18%",
    left: "55%",
    size: "32rem",
    gradient:
      "bg-[radial-gradient(circle_at_center,_rgba(244,114,182,0.4),_rgba(12,17,33,0))]",
    duration: 28,
    delay: 1.2,
  },
  {
    top: "58%",
    left: "-12%",
    size: "30rem",
    gradient:
      "bg-[radial-gradient(circle_at_center,_rgba(34,197,94,0.35),_rgba(12,17,33,0))]",
    duration: 36,
    delay: 2.4,
  },
];

const comets: CometConfig[] = [
  { top: "24%", delay: 0, duration: 14, direction: "right" },
  { top: "62%", delay: 4.5, duration: 16, direction: "left" },
  { top: "78%", delay: 2.5, duration: 18, direction: "right" },
];

const glyphs: GlyphConfig[] = [
  { symbol: "✶", top: "16%", left: "18%", delay: 0.6 },
  { symbol: "☉", top: "42%", left: "72%", delay: 1.4 },
  { symbol: "✧", top: "68%", left: "48%", delay: 0.9 },
  { symbol: "☾", top: "32%", left: "38%", delay: 1.8 },
  { symbol: "⚚", top: "58%", left: "14%", delay: 2.4 },
];

const RegisterBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <motion.span
      className="absolute inset-x-0 top-1/2 h-[42rem] -translate-y-1/2 rounded-[999px] bg-[radial-gradient(circle_at_center,_rgba(15,118,110,0.12),_rgba(12,17,33,0))] blur-[140px]"
      animate={{ rotate: [0, 15, -8, 0] }}
      transition={{ duration: 42, repeat: Infinity, ease: "easeInOut" }}
    />

    {orbs.map((orb, index) => (
      <motion.span
        key={`orb-${index}`}
        className={`absolute ${orb.gradient} blur-3xl`}
        style={{
          top: orb.top,
          left: orb.left,
          width: orb.size,
          height: orb.size,
        }}
        animate={{
          x: ["0%", "12%", "-8%", "6%", "0%"],
          y: ["0%", "-10%", "6%", "-4%", "0%"],
          scale: [1, 1.12, 0.95, 1.08, 1],
        }}
        transition={{
          duration: orb.duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: orb.delay ?? 0,
        }}
      />
    ))}

    {comets.map((comet, index) => (
      <motion.span
        key={`comet-${index}`}
        className="absolute h-px w-48 rounded-full bg-gradient-to-r from-transparent via-cyan-200/70 to-cyan-400/0"
        style={{ top: comet.top }}
        initial={{
          x: comet.direction === "right" ? "-20%" : "120%",
          y: 0,
          opacity: 0,
        }}
        animate={{
          x: comet.direction === "right" ? ["-20%", "120%"] : ["120%", "-20%"],
          y: comet.direction === "right" ? ["0%", "-30%"] : ["0%", "30%"],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: comet.duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: comet.delay,
        }}
      />
    ))}

    {glyphs.map((glyph, index) => (
      <motion.span
        key={`glyph-${glyph.symbol}-${index}`}
        className="absolute text-4xl font-light text-cyan-100/40 mix-blend-screen"
        style={{ top: glyph.top, left: glyph.left }}
        animate={{
          y: ["-6%", "6%", "-4%"],
          rotate: [0, 12, -10, 0],
          opacity: [0.2, 0.6, 0.35],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: glyph.delay }}
      >
        {glyph.symbol}
      </motion.span>
    ))}

    <motion.span
      className="absolute right-[-18%] top-[-22%] h-[38rem] w-[38rem] rounded-full bg-[conic-gradient(from_120deg_at_50%_50%,_rgba(56,189,248,0.4),_rgba(244,114,182,0.4),_rgba(34,197,94,0.35),_rgba(56,189,248,0.4))] opacity-70 blur-[130px]"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 68, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

export default RegisterBackground;
