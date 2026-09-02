"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={reduce ? false : { opacity: 0, y: 16, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={reduce ? undefined : { opacity: 0, y: -10, filter: "blur(2px)" }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-[50vh]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
