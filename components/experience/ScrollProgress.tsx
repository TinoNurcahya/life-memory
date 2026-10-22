"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const current = (window.scrollY / totalHeight) * 100;
        setProgress(Math.min(100, Math.max(0, current)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[2px] z-40 pointer-events-none bg-border-hairline/20">
      <div
        className="w-full bg-brand transition-all duration-150 ease-out origin-top"
        style={{ height: `${progress}%` }}
      />
    </div>
  );
}
