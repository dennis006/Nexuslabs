import { motion } from "framer-motion";

const constellations = [
  { top: "18%", left: "16%", delay: 0 },
  { top: "72%", left: "22%", delay: 1.8 },
  { top: "28%", left: "74%", delay: 2.6 },
  { top: "64%", left: "70%", delay: 0.9 },
  { top: "44%", left: "50%", delay: 3.2 },
  { top: "82%", left: "54%", delay: 4.1 },
];

const AuthBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
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
        <linearGradient id="auth-aurora-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(56,189,248,0.1)" />
          <stop offset="50%" stopColor="rgba(56,189,248,0.7)" />
          <stop offset="100%" stopColor="rgba(244,114,182,0.65)" />
        </linearGradient>
      </defs>

      <motion.path
        d="M120 340 Q200 160 320 220 T540 300"
        stroke="url(#auth-aurora-line)"
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
        stroke="url(#auth-aurora-line)"
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
  </div>
);

export default AuthBackground;
