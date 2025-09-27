import { AnimatePresence, motion } from "framer-motion";
import type { PropsWithChildren } from "react";
import type { Location } from "react-router-dom";

interface AnimatedRoutesProps extends PropsWithChildren {
  location: Location;
}

const AnimatedRoutes = ({ children, location }: AnimatedRoutesProps) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={location.pathname}>{children}</motion.div>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
