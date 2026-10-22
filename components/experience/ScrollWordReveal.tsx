"use client";

import React, { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

const START_OPACITY = 0.16;
const SPREAD = 0.85;
const WORD_DURATION = 0.22;

interface WordProgressRange {
  start: number;
  end: number;
}

function getWordProgressRange(index: number, count: number): WordProgressRange {
  const start = count <= 1 ? 0 : (index / (count - 1)) * SPREAD;
  return {
    start,
    end: Math.min(1, start + WORD_DURATION),
  };
}

function getWordOpacity(
  progress: number,
  { start, end }: WordProgressRange,
  startOpacity = START_OPACITY,
): number {
  if (progress <= start) return startOpacity;
  if (progress >= end) return 1;
  const wordProgress = (progress - start) / (end - start);
  return startOpacity + (1 - startOpacity) * wordProgress;
}

interface WordProps {
  children: React.ReactNode;
  progress: MotionValue<number>;
  index: number;
  count: number;
  reducedMotion: boolean;
}

function Word({ children, progress, index, count, reducedMotion }: WordProps) {
  const range = getWordProgressRange(index, count);
  const opacity = useTransform(progress, (latest) =>
    getWordOpacity(latest, range),
  );

  return (
    <span className="relative inline-block mr-[0.25em]">
      <motion.span style={reducedMotion ? undefined : { opacity }}>
        {children}
      </motion.span>
    </span>
  );
}

type Token =
  | { type: "word"; content: React.ReactNode; wordIndex: number }
  | { type: "break" };

interface ScrollWordRevealProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function ScrollWordReveal({
  children,
  className = "",
  as: Component = "p",
}: ScrollWordRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.88", "start 0.35"],
  });

  const tokens: Token[] = [];
  let wordCount = 0;

  const processNode = (node: React.ReactNode) => {
    if (typeof node === "string") {
      const parts = node.split(/\s+/).filter(Boolean);
      parts.forEach((part) => {
        tokens.push({
          type: "word",
          content: part,
          wordIndex: wordCount++,
        });
      });
    } else if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
      if (node.type === "br") {
        tokens.push({ type: "break" });
      } else if (typeof node.props.children === "string") {
        const parts = node.props.children.split(/\s+/).filter(Boolean);
        parts.forEach((part) => {
          tokens.push({
            type: "word",
            content: React.cloneElement(node, { key: undefined }, part),
            wordIndex: wordCount++,
          });
        });
      } else {
        React.Children.forEach(node.props.children, processNode);
      }
    }
  };

  React.Children.forEach(children, processNode);

  return (
    <Component ref={containerRef} className={className}>
      {tokens.map((token, i) => {
        if (token.type === "break") {
          return <br key={`br-${i}`} />;
        }
        return (
          <Word
            key={`w-${token.wordIndex}`}
            progress={scrollYProgress}
            index={token.wordIndex}
            count={wordCount}
            reducedMotion={Boolean(reducedMotion)}
          >
            {token.content}
          </Word>
        );
      })}
    </Component>
  );
}
