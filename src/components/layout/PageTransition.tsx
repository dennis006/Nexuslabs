import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";
import { pageTransition } from "@/lib/animations/framer";

const PageTransition = ({ children }: PropsWithChildren) => (
  <motion.main
    variants={pageTransition}
    initial="initial"
    animate="animate"
    exit="exit"
    className="min-h-[calc(100vh-6rem)]"
  >
    {children}
  </motion.main>
);

export default PageTransition;
