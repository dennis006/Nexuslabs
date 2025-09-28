import { animate, motion, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils/cn";

type HandwritingTextProps = {
  text: string;
  className?: string;
  delay?: number;
};

const HandwritingText = ({ text, className, delay = 0.4 }: HandwritingTextProps) => {
  const progress = useMotionValue(0);
  const backgroundSize = useMotionTemplate`${progress}% 100%`;
  const penLeft = useMotionTemplate`calc(${progress}% - 0.75rem)`;
  const glowOpacity = useTransform(progress, [0, 35, 100], [0.85, 0.4, 0]);
  const glowFilter = useMotionTemplate`drop-shadow(0 0 18px rgba(0, 224, 255, ${glowOpacity}))`;
  const penOpacity = useTransform(progress, [0, 5, 92, 100], [0, 1, 1, 0]);

  useEffect(() => {
    const controls = animate(progress, 100, {
      duration: 3.6,
      ease: [0.35, 0, 0.15, 1],
      delay
    });

    return () => {
      controls.stop();
    };
  }, [delay, progress]);

  return (
    <span className={cn("handwriting relative inline-flex", className)}>
      <motion.span
        aria-hidden
        className="handwriting__text"
        style={{
          backgroundSize,
          filter: glowFilter
        }}
      >
        {text}
      </motion.span>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        className="handwriting__pen"
        style={{ left: penLeft, opacity: penOpacity }}
      />
    </span>
  );
};

export default HandwritingText;
