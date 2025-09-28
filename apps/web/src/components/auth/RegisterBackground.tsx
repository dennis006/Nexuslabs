import { motion } from "framer-motion";

const orbitalNodes = [
  { top: "10%", left: "18%", delay: 0 },
  { top: "22%", right: "14%", delay: 1.4 },
  { bottom: "18%", left: "22%", delay: 2.1 },
  { bottom: "24%", right: "20%", delay: 3.3 },
];

const runeStrokes = [
  "M2 18 Q20 2 42 18 T82 18",
  "M12 22 Q26 4 52 22 T96 22",
  "M8 20 Q28 6 48 20 T88 20",
];

const RegisterBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <motion.div
      className="absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-[45%] bg-[radial-gradient(circle_at_30%_30%,_rgba(59,130,246,0.55),_rgba(15,23,42,0))] blur-3xl"
      animate={{
        x: [0, 30, -10, 24, 0],
        y: [0, -26, 12, -14, 0],
        rotate: [0, 12, -8, 18, 0],
        scale: [1, 1.08, 0.94, 1.04, 1],
      }}
      transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
    />

    <motion.div
      className="absolute -right-32 bottom-[-12rem] h-[32rem] w-[32rem] rounded-[50%] bg-[radial-gradient(circle_at_70%_70%,_rgba(236,72,153,0.5),_rgba(15,23,42,0))] blur-[120px]"
      animate={{
        x: [0, -24, 16, -18, 0],
        y: [0, 18, -20, 12, 0],
        rotate: [0, -16, 10, -12, 0],
        scale: [1, 0.92, 1.06, 0.98, 1],
      }}
      transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
    />

    <motion.div
      className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_180deg,_rgba(14,165,233,0.55),_rgba(14,165,233,0.05)_50%,_rgba(244,114,182,0.65),_rgba(14,165,233,0.55))] opacity-80"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
    />

    <motion.div
      className="absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/20"
      animate={{ rotate: [0, -360] }}
      transition={{ duration: 64, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute inset-0 rounded-full border border-white/10" />
    </motion.div>

    {orbitalNodes.map((node, index) => (
      <motion.span
        key={`orbital-${index}`}
        className="absolute h-2 w-2 rounded-full bg-cyan-200/90 shadow-[0_0_20px_rgba(103,232,249,0.7)]"
        style={node}
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.4, 0.8] }}
        transition={{ duration: 8 + index * 2, repeat: Infinity, ease: "easeInOut", delay: node.delay }}
      >
        <motion.span
          className="absolute left-1/2 top-1/2 h-16 w-px -translate-x-1/2 -translate-y-full bg-gradient-to-t from-cyan-200/60 via-transparent to-transparent"
          animate={{ scaleY: [0.3, 1, 0.5], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut", delay: node.delay + 0.4 }}
        />
      </motion.span>
    ))}

    <motion.div
      className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2"
      animate={{ rotate: [0, 12, -12, 16, 0] }}
      transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/10" />
      <div className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-400/10" />
      <div className="absolute left-1/2 top-1/2 h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink-500/10" />
    </motion.div>

    <motion.svg
      width="420"
      height="240"
      viewBox="0 0 120 32"
      className="absolute left-1/2 top-[30%] -translate-x-1/2 opacity-60"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: [0.2, 0.7, 0.2], y: [18, 0, 18] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id="register-rune" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(56,189,248,0.05)" />
          <stop offset="40%" stopColor="rgba(56,189,248,0.65)" />
          <stop offset="100%" stopColor="rgba(244,114,182,0.65)" />
        </linearGradient>
      </defs>
      {runeStrokes.map((path, index) => (
        <motion.path
          key={`rune-${index}`}
          d={path}
          fill="none"
          stroke="url(#register-rune)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 0] }}
          transition={{ duration: 16 + index * 2, repeat: Infinity, ease: "easeInOut", delay: index * 1.2 }}
        />
      ))}
    </motion.svg>

    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{ opacity: [0.35, 0.55, 0.35] }}
      transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.08),_transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,_rgba(14,165,233,0.1),_transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_80%,_rgba(236,72,153,0.12),_transparent_55%)]" />
    </motion.div>
  </div>
);

export default RegisterBackground;
