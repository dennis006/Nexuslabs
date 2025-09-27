import type { Variants } from "framer-motion";

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.995,
    transition: { duration: 0.2 }
  }
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

export const hoverLift: Variants = {
  rest: { y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
  hover: { y: -4, scale: 1.01 }
};
