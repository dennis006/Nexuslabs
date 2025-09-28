import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";

type Props = {
  children: string;
  className?: string;
  duration?: number; // Sek.
  delay?: number; // Sek.
};

export default function HandwritingText({
  children,
  className,
  duration = 2.2,
  delay = 0.15
}: Props) {
  const reduce = useReducedMotion();

  return (
    <span className={clsx("relative inline-block leading-tight", className)}>
      {/* 1) Immer sichtbarer Basis-Text (keine Transparenz!) */}
      <span className="relative z-10 font-extrabold tracking-tight text-[clamp(28px,5vw,64px)] text-[#E7F9FF]">
        {children}
      </span>

      {/* 2) Overlay: animierte Handschrift/Wisch-Maske (nur wenn Motion erlaubt) */}
      {!reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 [--reveal:0%] handwriting-mask"
          initial={{ ["--reveal" as any]: "0%" }}
          animate={{ ["--reveal" as any]: "100%" }}
          transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* farbiges Overlay, das durch die Maske „schreibt“ */}
          <span className="block h-full w-full rounded-sm bg-gradient-to-r from-cyan-300 via-sky-300 to-teal-200 opacity-95" />
        </motion.span>
      )}
    </span>
  );
}
