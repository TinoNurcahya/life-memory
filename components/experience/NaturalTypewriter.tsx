"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  type ElementType,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";

export interface NaturalTypewriterProps {
  /** Single text to type (for backwards compatibility). */
  text?: string;
  /** Array of texts to cycle through with natural backspacing. */
  texts?: string[];
  as?: ElementType;
  className?: string;
  cursorClassName?: string;
  speedMultiplier?: number;
  deleteSpeedMultiplier?: number;
  /** Additional pause after each completed word, in milliseconds. */
  wordPauseDuration?: number;
  /** Pause after commas and other mid-sentence punctuation, in milliseconds. */
  punctuationPauseDuration?: number;
  /** Pause after question marks, in milliseconds. */
  questionPauseDuration?: number;
  /** Pause in ms after completing a text before backspacing begins (default 3800ms). */
  pauseDuration?: number;
  /** Whether to loop through texts continuously. Defaults to false. */
  loop?: boolean;
  startOnView?: boolean;
  /** Explicit start trigger (e.g. from an inView state) */
  start?: boolean;
  /** Delay in ms before typing begins after triggered */
  delay?: number;
  /** Delay in ms before cursor fades. Defaults to false (keeps breathing pulse indefinitely). */
  cursorFadeDelay?: number | false;
  onComplete?: () => void;
}

interface ParsedToken {
  type: "char" | "break";
  char: string;
  isItalic: boolean;
}

type TypewriterPhase = "typing" | "paused" | "deleting" | "switching";

export function NaturalTypewriter({
  text,
  texts,
  as: Component = "p",
  className = "",
  cursorClassName = "",
  speedMultiplier = 1,
  deleteSpeedMultiplier = 1,
  wordPauseDuration = 110,
  punctuationPauseDuration = 260,
  questionPauseDuration = 480,
  pauseDuration = 3800,
  loop = false,
  startOnView = true,
  start,
  delay = 0,
  cursorFadeDelay = false,
  onComplete,
}: NaturalTypewriterProps) {
  const containerRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const textsList = useMemo(() => {
    if (texts && texts.length > 0) return texts;
    if (text) return [text];
    return [];
  }, [texts, text]);

  const [textIndex, setTextIndex] = useState(0);
  const currentText = textsList[textIndex] ?? "";

  // Parse text into tokens respecting *italic* markers and \n linebreaks
  const tokens = useMemo<ParsedToken[]>(() => {
    const result: ParsedToken[] = [];
    let inItalic = false;

    for (let i = 0; i < currentText.length; i++) {
      const char = currentText[i];
      if (char === "*") {
        inItalic = !inItalic;
        continue;
      }
      if (char === "\n") {
        result.push({ type: "break", char: "\n", isItalic: inItalic });
      } else {
        result.push({ type: "char", char, isItalic: inItalic });
      }
    }
    return result;
  }, [currentText]);

  const totalTokens = tokens.length;
  const [phase, setPhase] = useState<TypewriterPhase>("typing");
  const [typedCount, setTypedCount] = useState(reducedMotion ? totalTokens : 0);
  const [isTriggered, setIsTriggered] = useState(
    reducedMotion ? true : (start !== undefined ? Boolean(start) : !startOnView)
  );
  const [isStarted, setIsStarted] = useState(Boolean(reducedMotion));
  const [isDone, setIsDone] = useState(Boolean(reducedMotion));
  const [cursorVisible, setCursorVisible] = useState(!reducedMotion);

  // Sync external start prop if provided
  useEffect(() => {
    if (reducedMotion) return;
    if (start !== undefined) {
      if (start) setIsTriggered(true);
    }
  }, [start, reducedMotion]);

  // Trigger when in viewport (if start is not explicitly controlled)
  useEffect(() => {
    if (reducedMotion || isTriggered || !startOnView || start !== undefined) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isTriggered, startOnView, start, reducedMotion]);

  // Initial delay before typing begins
  useEffect(() => {
    if (!isTriggered || isStarted || reducedMotion) return;
    if (delay <= 0) {
      setIsStarted(true);
      return;
    }
    const timer = setTimeout(() => {
      setIsStarted(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [isTriggered, isStarted, delay, reducedMotion]);

  // Natural Keystroke & Backspace Timing Engine
  useEffect(() => {
    if (!isStarted || reducedMotion || isDone) return;

    // --- PHASE 1: TYPING ---
    if (phase === "typing") {
      if (typedCount >= totalTokens) {
        const hasMore = textsList.length > 1 && (loop || textIndex < textsList.length - 1);
        if (hasMore) {
          setPhase("paused");
        } else {
          setIsDone(true);
          onComplete?.();

          if (typeof cursorFadeDelay === "number" && cursorFadeDelay > 0) {
            const fadeTimer = setTimeout(() => {
              setCursorVisible(false);
            }, cursorFadeDelay);
            return () => clearTimeout(fadeTimer);
          }
        }
        return;
      }

      const currentToken = tokens[typedCount];
      const prevToken = typedCount > 0 ? tokens[typedCount - 1] : null;

      let delayMs = 38; // Base letter delay (ms)
      const jitter = Math.random() * 26 - 11;
      delayMs += jitter;

      const char = currentToken.char;
      const prevChar = prevToken ? prevToken.char : "";

      // Punctuation Breathing Pauses
      if (
        char === "." ||
        char === "!" ||
        char === "?" ||
        char === "。" ||
        char === "？"
      ) {
        delayMs = (char === "?" || char === "？")
          ? questionPauseDuration + Math.random() * 80
          : 480 + Math.random() * 80;
      } else if (
        char === "," ||
        char === ";" ||
        char === ":" ||
        char === "—" ||
        char === "-" ||
        char === "、"
      ) {
        delayMs = punctuationPauseDuration + Math.random() * 50;
      } else if (currentToken.type === "break") {
        delayMs = 320 + Math.random() * 60;
      } else if (char === " ") {
        delayMs = wordPauseDuration + Math.random() * 25;
      } else if (prevChar === " ") {
        delayMs += 20;
      }

      const calculatedDelay = Math.max(14, delayMs / speedMultiplier);

      const timer = setTimeout(() => {
        setTypedCount((prev) => prev + 1);
      }, calculatedDelay);

      return () => clearTimeout(timer);
    }

    // --- PHASE 2: PAUSED (Reader absorption window) ---
    if (phase === "paused") {
      const timer = setTimeout(() => {
        setPhase("deleting");
      }, pauseDuration);
      return () => clearTimeout(timer);
    }

    // --- PHASE 3: DELETING (Natural typewriter backspacing) ---
    if (phase === "deleting") {
      if (typedCount <= 0) {
        setPhase("switching");
        setTextIndex((prev) => (prev + 1) % textsList.length);
        setTypedCount(0);
        return;
      }

      const tokenBeingDeleted = tokens[typedCount - 1];
      let deleteDelay = 18;
      if (tokenBeingDeleted?.type === "break") {
        deleteDelay = 32;
      } else if (tokenBeingDeleted?.char === " ") {
        deleteDelay = 14;
      }
      const calculatedDeleteDelay = Math.max(10, deleteDelay / deleteSpeedMultiplier);

      const timer = setTimeout(() => {
        setTypedCount((prev) => prev - 1);
      }, calculatedDeleteDelay);

      return () => clearTimeout(timer);
    }

    // --- PHASE 4: SWITCHING (Brief breath before typing next language) ---
    if (phase === "switching") {
      const timer = setTimeout(() => {
        setPhase("typing");
      }, 360);
      return () => clearTimeout(timer);
    }
  }, [
    isStarted,
    phase,
    typedCount,
    totalTokens,
    tokens,
    textIndex,
    textsList,
    loop,
    pauseDuration,
    speedMultiplier,
    deleteSpeedMultiplier,
    wordPauseDuration,
    punctuationPauseDuration,
    questionPauseDuration,
    cursorFadeDelay,
    reducedMotion,
    isDone,
    onComplete,
  ]);

  // Render typed content
  const renderedContent = useMemo(() => {
    if (reducedMotion) {
      return renderTokens(tokens);
    }
    return renderTokens(tokens.slice(0, typedCount));
  }, [tokens, typedCount, reducedMotion]);

  const isBlinkingSlowly = phase === "paused" || phase === "switching";

  return (
    <Component ref={containerRef} className={`relative inline ${className}`}>
      <span>{renderedContent}</span>

      {/* Monoline Smooth Breathing Pulse Cursor */}
      {cursorVisible && (
        <motion.span
          aria-hidden="true"
          className={`inline-block w-[2px] h-[1em] align-middle ml-[3px] bg-current rounded-full ${cursorClassName}`}
          animate={
            isBlinkingSlowly
              ? { opacity: [1, 0.25, 1] }
              : { opacity: 1 }
          }
          transition={
            isBlinkingSlowly
              ? {
                  duration: 1.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : { duration: 0.08 }
          }
        />
      )}
    </Component>
  );
}

function renderTokens(tokenList: ParsedToken[]): ReactNode {
  const nodes: ReactNode[] = [];
  let currentItalicBuffer: string[] = [];
  let currentPlainBuffer: string[] = [];

  const flushPlain = (key: string) => {
    if (currentPlainBuffer.length > 0) {
      nodes.push(<span key={key}>{currentPlainBuffer.join("")}</span>);
      currentPlainBuffer = [];
    }
  };

  const flushItalic = (key: string) => {
    if (currentItalicBuffer.length > 0) {
      nodes.push(
        <em key={key} className="italic font-light">
          {currentItalicBuffer.join("")}
        </em>
      );
      currentItalicBuffer = [];
    }
  };

  tokenList.forEach((token, index) => {
    if (token.type === "break") {
      if (token.isItalic) {
        flushItalic(`it-${index}`);
      } else {
        flushPlain(`pl-${index}`);
      }
      nodes.push(<br key={`br-${index}`} />);
      return;
    }

    if (token.isItalic) {
      flushPlain(`pl-${index}`);
      currentItalicBuffer.push(token.char);
    } else {
      flushItalic(`it-${index}`);
      currentPlainBuffer.push(token.char);
    }
  });

  flushPlain("pl-final");
  flushItalic("it-final");

  return nodes;
}
