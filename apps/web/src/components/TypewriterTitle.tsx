import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";

type Props = {
  text: string;
  className?: string;
  startDelay?: number;
  minSpeed?: number;
  maxSpeed?: number;
  underline?: boolean;
};

export default function TypewriterTitle({
  text,
  className,
  startDelay = 250,
  minSpeed = 18,
  maxSpeed = 45,
  underline = true
}: Props) {
  const reduce = useReducedMotion();
  const [out, setOut] = useState(reduce ? text : "");
  const iRef = useRef(0);
  const done = iRef.current >= text.length;

  const extraPause = useMemo(() => new Set([",", ".", "!", "?", ":", ";"]), []);
  const spaces = useMemo(() => new Set([" ", "\n", "\t"]), []);

  useEffect(() => {
    if (reduce) return;
    let t: number | undefined;
    let cancelled = false;

    const tick = (first = false) => {
      if (cancelled) return;
      if (iRef.current >= text.length) return;

      const ch = text[iRef.current];
      const base = rand(minSpeed, maxSpeed);

      let delay = base;
      if (extraPause.has(ch)) delay += 160;
      if (spaces.has(ch)) delay -= 10;
      if (first) delay += startDelay;

      t = window.setTimeout(() => {
        if (cancelled) return;
        setOut((v) => v + ch);
        iRef.current += 1;
        tick();
      }, delay);
    };

    tick(true);
    return () => {
      cancelled = true;
      if (t) clearTimeout(t);
    };
  }, [text, minSpeed, maxSpeed, startDelay, extraPause, spaces, reduce]);

  const progress = text.length ? (out.length / text.length) * 100 : 100;

  return (
    <div className={clsx("relative inline-block", className)}>
      <h1
        className={clsx(
          "relative z-10 font-extrabold tracking-tight",
          "text-[clamp(32px,6vw,72px)] leading-[1.05]",
          "text-[#E7F9FF] drop-shadow-[0_2px_20px_rgba(0,200,255,0.15)]"
        )}
      >
        <span className="opacity-40 select-none">{text}</span>
        <span className="absolute inset-0">
          <span className="text-[#E7F9FF]">
            {out}
            {!reduce && !done && (
              <motion.span
                aria-hidden
                className="inline-block w-[0.6ch] -translate-y-[0.06em] ml-[0.02ch]
                           bg-gradient-to-b from-cyan-300 to-sky-500 rounded-[1px]
                           shadow-[0_0_8px_2px_rgba(56,189,248,0.45)]"
                initial={{ opacity: 1 }}
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </span>
        </span>
      </h1>

      {underline && (
        <div className="relative mt-3 h-[3px] rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-cyan-400/30" />
          {reduce ? (
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300"
              style={{ width: "100%" }}
            />
          ) : (
            <>
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "tween", ease: [0.22, 0.12, 0.18, 1], duration: 0.25 }}
              />
              <motion.span
                className="absolute top-1/2 -translate-y-1/2 h-[6px] w-[6px] rounded-full
                           bg-white/80 shadow-[0_0_10px_4px_rgba(56,189,248,0.35)]"
                initial={false}
                animate={{ left: `${Math.max(2, progress)}%` }}
                transition={{ type: "tween", duration: 0.25 }}
                aria-hidden
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function rand(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

