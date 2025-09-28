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
  loop?: boolean;
  loopDelay?: number;
};

export default function TypewriterTitle({
  text,
  className,
  startDelay = 250,
  minSpeed = 18,
  maxSpeed = 45,
  underline = true,
  loop = true,
  loopDelay = 1800
}: Props) {
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState<Array<{ char: string; id: number }>>(() =>
    reduce ? text.split("").map((char, index) => ({ char, id: index })) : []
  );
  const iRef = useRef(0);
  const [iteration, setIteration] = useState(0);
  const done = iRef.current >= text.length;

  const extraPause = useMemo(() => new Set([",", ".", "!", "?", ":", ";"]), []);
  const spaces = useMemo(() => new Set([" ", "\n", "\t"]), []);

  useEffect(() => {
    if (reduce) {
      setTyped(text.split("").map((char, index) => ({ char, id: index })));
      iRef.current = text.length;
      return;
    }
    let t: number | undefined;
    let cancelled = false;

    setTyped([]);
    iRef.current = 0;

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
        setTyped((prev) => [...prev, { char: ch, id: iRef.current }]);
        iRef.current += 1;
        tick();
      }, delay);
    };

    tick(true);
    return () => {
      cancelled = true;
      if (t) clearTimeout(t);
    };
  }, [text, minSpeed, maxSpeed, startDelay, extraPause, spaces, reduce, iteration]);

  useEffect(() => {
    if (reduce || !loop) return;
    if (!done) return;

    const timeout = window.setTimeout(() => {
      setIteration((prev) => prev + 1);
    }, Math.max(0, loopDelay));

    return () => {
      clearTimeout(timeout);
    };
  }, [done, loop, loopDelay, reduce]);

  const progress = text.length ? (typed.length / text.length) * 100 : 100;

  return (
    <div className={clsx("relative inline-block", className)}>
      <h1
        className={clsx(
          "relative z-10 font-extrabold tracking-tight",
          "text-[clamp(32px,6vw,72px)] leading-[1.05]",
          "text-foreground drop-shadow-[0_1px_12px_rgba(56,189,248,0.18)]",
          "dark:text-[#E7F9FF] dark:drop-shadow-[0_2px_20px_rgba(0,200,255,0.15)]"
        )}
      >
        <span className="pointer-events-none select-none text-transparent whitespace-pre-wrap">
          {text}
        </span>
        <span className="absolute inset-0">
          <span className="whitespace-pre-wrap text-foreground dark:text-[#E7F9FF]">
            {reduce
              ? text
              : typed.map(({ char }, index) => (
                  <motion.span
                    key={`${iteration}-${index}`}
                    initial={{ y: "-0.25em", opacity: 0, filter: "blur(6px)" }}
                    animate={{ y: "0em", opacity: 1, filter: "blur(0px)" }}
                    transition={{
                      duration: 0.18,
                      ease: [0.12, 0.85, 0.23, 1.02]
                    }}
                  >
                    {char === " " ? " " : char}
                  </motion.span>
                ))}
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

