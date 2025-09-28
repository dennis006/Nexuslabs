import { motion } from "framer-motion";


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

=======

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
=======
    <motion.span
      className="absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.5),_rgba(12,17,33,0))] blur-3xl"
      animate={{
        x: ["0%", "12%", "-18%", "4%", "0%"],
        y: ["0%", "-10%", "8%", "-6%", "0%"],
        scale: [1, 1.08, 0.96, 1.05, 1],
      }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
    />

    <motion.span
      className="absolute -bottom-24 right-0 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(167,139,250,0.45),_rgba(12,17,33,0))] blur-3xl"
      animate={{
        x: ["0%", "-14%", "6%", "-10%", "0%"],
        y: ["0%", "10%", "-12%", "6%", "0%"],
        scale: [1, 0.94, 1.06, 0.97, 1],
      }}
      transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
    />

    <motion.span
      className="absolute left-1/3 top-[-12rem] h-[22rem] w-[22rem] rounded-full bg-[conic-gradient(from_140deg_at_50%_50%,_rgba(59,130,246,0.55),_rgba(244,114,182,0.35),_rgba(59,130,246,0.55))] opacity-80 blur-[120px]"
      animate={{ rotate: [0, 60, 0] }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
    />

    <motion.svg
      width="640"
      height="640"
      viewBox="0 0 640 640"
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70"
    >
      <defs>
        <linearGradient id="register-aurora-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(56,189,248,0.1)" />
          <stop offset="50%" stopColor="rgba(56,189,248,0.7)" />
          <stop offset="100%" stopColor="rgba(244,114,182,0.65)" />
        </linearGradient>
      </defs>

      <motion.path
        d="M120 340 Q200 160 320 220 T540 300"
        stroke="url(#register-aurora-line)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 1, 0.25], opacity: [0, 0.9, 0.25] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.path
        d="M160 420 Q260 520 360 460 T520 420"
        stroke="url(#register-aurora-line)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 0.65, 0], opacity: [0, 0.7, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2.4 }}
      />
    </motion.svg>


    {constellations.map((constellation, index) => (
      <motion.span
        key={`constellation-${index}`}
        className="absolute h-2 w-2 rounded-full bg-cyan-300/90 shadow-[0_0_18px_rgba(103,232,249,0.8)]"
        style={{ top: constellation.top, left: constellation.left }}
        animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.4, 0.8] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: constellation.delay }}
      >
        <motion.span
          className="absolute -top-8 left-1/2 h-8 w-px -translate-x-1/2 bg-gradient-to-t from-cyan-300/40 via-transparent to-transparent"
          animate={{ scaleY: [0.3, 1, 0.6], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: constellation.delay + 0.6 }}
        />
      </motion.span>
    ))}


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
