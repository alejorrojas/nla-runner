"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export const spring = {
  type: "spring" as const,
  stiffness: 320,
  damping: 28,
};

function hardwareIsLimited(): boolean {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency || 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const saveData = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection?.saveData;
  return cores <= 4 || (memory != null && memory <= 4) || Boolean(saveData);
}

export function useLimitedMotion(): boolean {
  const reduce = useReducedMotion();
  const [lowPower, setLowPower] = useState(false);
  useEffect(() => {
    setLowPower(hardwareIsLimited());
  }, []);
  return Boolean(reduce) || lowPower;
}

/** Skip shaders until we know the machine can take them. */
export function useSkipHeavyEffects(): boolean {
  const reduce = useReducedMotion();
  const [skip, setSkip] = useState(true);
  useEffect(() => {
    setSkip(Boolean(reduce) || hardwareIsLimited());
  }, [reduce]);
  return skip;
}

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const limited = useLimitedMotion();
  if (limited) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay }}
    >
      {children}
    </motion.div>
  );
}

export const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: spring },
};

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const limited = useLimitedMotion();
  if (limited) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...spring, delay }}
    >
      {children}
    </motion.div>
  );
}

export function RevealGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const limited = useLimitedMotion();
  if (limited) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={listVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article";
}) {
  const limited = useLimitedMotion();
  if (limited) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }
  const MotionTag = as === "article" ? motion.article : motion.div;
  return (
    <MotionTag className={className} variants={itemVariants}>
      {children}
    </MotionTag>
  );
}
