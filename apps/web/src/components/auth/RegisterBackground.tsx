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


const gradientOrbs = [
  {
    className:
      "absolute -left-24 -top-20 h-[30rem] w-[30rem] rounded-[46%] bg-[radial-gradient(circle_at_35%_35%,_rgba(59,130,246,0.55),_rgba(15,23,42,0))] blur-[120px]",
    animate: {
      x: [0, 28, -12, 20, 0],
      y: [0, -18, 12, -8, 0],
      rotate: [0, 16, -10, 12, 0],
      scale: [1, 1.08, 0.92, 1.05, 1],
    },
    duration: 32,
  },
  {
    className:
      "absolute -right-28 bottom-[-10rem] h-[34rem] w-[34rem] rounded-[50%] bg-[radial-gradient(circle_at_65%_75%,_rgba(236,72,153,0.55),_rgba(15,23,42,0))] blur-[130px]",
    animate: {
      x: [0, -24, 18, -16, 0],
      y: [0, 16, -18, 10, 0],
      rotate: [0, -18, 14, -12, 0],
      scale: [1, 0.94, 1.06, 0.98, 1],
    },
    duration: 36,
  },
  {
    className:
      "absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_160deg,_rgba(14,165,233,0.6),_rgba(244,114,182,0.45),_rgba(14,165,233,0.6))] opacity-80",
    animate: {
      rotate: [0, 360],
    },
    duration: 50,
  },
];

const glyphStrokes = [
  "M10 20 Q25 4 40 20 T70 20",
  "M16 24 Q30 6 54 24 T98 24",
  "M12 22 Q34 10 56 22 T90 22",
];

const haloRings = [
  {
    size: "h-[32rem] w-[32rem]",
    border: "border-cyan-300/20",
    duration: 44,
  },
  {
    size: "h-[26rem] w-[26rem]",
    border: "border-pink-400/20",
    duration: 58,
    reverse: true,
  },
  {
    size: "h-[20rem] w-[20rem]",
    border: "border-indigo-400/20",
    duration: 68,
  },
];

const cometTrails = [
  {
    top: "28%",
    left: "18%",
    delay: 0,
  },
  {
    top: "64%",
    left: "14%",
    delay: 2.8,
  },
  {
    top: "38%",
    left: "74%",
    delay: 1.6,
  },
];

const latticeColumns = ["left-[12%]", "left-[50%]", "left-[82%]"];



const constellations = [
  { top: "18%", left: "16%", delay: 0 },
  { top: "72%", left: "22%", delay: 1.8 },
  { top: "28%", left: "74%", delay: 2.6 },
  { top: "64%", left: "70%", delay: 0.9 },
  { top: "44%", left: "50%", delay: 3.2 },
  { top: "82%", left: "54%", delay: 4.1 },
];

const RegisterBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">

    {gradientOrbs.map((orb, index) => (
      <motion.div
        key={`orb-${index}`}
        className={orb.className}
        animate={orb.animate}
        transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}

    <motion.div
      className="absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_50%_45%,_rgba(148,163,184,0.35),_rgba(15,23,42,0))]"
      animate={{ scale: [0.9, 1.08, 0.92, 1.04, 0.9], opacity: [0.4, 0.75, 0.45, 0.7, 0.4] }}
      transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
    />

    <motion.div
      className="absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2"
      animate={{ rotate: [0, 12, -12, 18, 0] }}
      transition={{ duration: 60, repeat: Infinity, ease: "easeInOut" }}
    >
      {haloRings.map((ring, index) => (
        <motion.div
          key={`ring-${index}`}
          className={`absolute left-1/2 top-1/2 ${ring.size} -translate-x-1/2 -translate-y-1/2 rounded-full border ${ring.border}`}
          animate={{ rotate: ring.reverse ? [0, -360] : [0, 360] }}
          transition={{ duration: ring.duration, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </motion.div>

    <motion.svg
      width="420"
      height="240"
      viewBox="0 0 110 32"
      className="absolute left-1/2 top-[28%] -translate-x-1/2 opacity-70"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: [0.2, 0.85, 0.2], y: [18, 0, 18] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id="register-glyph" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(56,189,248,0.1)" />
          <stop offset="35%" stopColor="rgba(56,189,248,0.75)" />
          <stop offset="100%" stopColor="rgba(244,114,182,0.65)" />
        </linearGradient>
      </defs>
      {glyphStrokes.map((path, index) => (
        <motion.path
          key={`glyph-${index}`}
          d={path}
          fill="none"
          stroke="url(#register-glyph)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 0] }}
          transition={{ duration: 18 + index * 2, repeat: Infinity, ease: "easeInOut", delay: index * 1.3 }}
        />
      ))}
    </motion.svg>

    {latticeColumns.map((position, index) => (
      <motion.div
        key={`lattice-${index}`}
        className={`absolute ${position} h-full w-px bg-gradient-to-b from-transparent via-cyan-200/20 to-transparent`}
        animate={{ opacity: [0.2, 0.55, 0.2] }}
        transition={{ duration: 26 + index * 4, repeat: Infinity, ease: "easeInOut", delay: index * 2 }}
      />
    ))}

    {cometTrails.map((comet, index) => (
      <motion.span
        key={`comet-${index}`}
        className="absolute h-1.5 w-1.5 rounded-full bg-sky-200/90 shadow-[0_0_25px_rgba(125,211,252,0.7)]"
        style={{ top: comet.top, left: comet.left }}
        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.6, 0.8] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: comet.delay }}
      >
        <motion.span
          className="absolute left-1/2 top-1/2 h-20 w-px -translate-x-1/2 -translate-y-full bg-gradient-to-t from-sky-200/60 via-transparent to-transparent"
          animate={{ scaleY: [0.4, 1, 0.5], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: comet.delay + 0.6 }}
        />
      </motion.span>
    ))}

    <motion.span
      className="absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.5),_rgba(12,17,33,0))] blur-3xl"
      animate={{
        x: ["0%", "12%", "-18%", "4%", "0%"],
        y: ["0%", "-10%", "8%", "-6%", "0%"],
        scale: [1, 1.08, 0.96, 1.05, 1],
      }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
    />


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


    {constellations.map((constellation, index) => (

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


    <motion.div
      className="absolute inset-0"
      animate={{ opacity: [0.3, 0.55, 0.3] }}
      transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.08),_transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,_rgba(14,165,233,0.12),_transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_78%,_rgba(236,72,153,0.14),_transparent_50%)]" />
    </motion.div>



  </div>
);

export default RegisterBackground;
