"use client";

import { motion, useReducedMotion } from "motion/react";

type MemoryObjectProps = {
  stage: number;
};

export function MemoryObject({ stage }: MemoryObjectProps) {
  const reducedMotion = useReducedMotion();
  const depth = stage === 0 ? 0.35 : stage === 1 ? 0.7 : stage === 2 ? 1 : 1.08;

  return (
    <motion.div
      aria-hidden="true"
      className="memory-object"
      animate={
        reducedMotion
          ? undefined
          : {
              rotateX: stage === 3 ? 8 : 14,
              rotateY: stage === 3 ? -18 : -28,
              scale: depth,
            }
      }
      transition={{ duration: 1.1, ease: "easeInOut" }}
    >
      <span className="memory-object__plane memory-object__plane--back" />
      <span className="memory-object__plane memory-object__plane--middle" />
      <span className="memory-object__plane memory-object__plane--front">
        <span className="memory-object__point memory-object__point--one" />
        <span className="memory-object__point memory-object__point--two" />
        <span className="memory-object__point memory-object__point--three" />
      </span>
    </motion.div>
  );
}
