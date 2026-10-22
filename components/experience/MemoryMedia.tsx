import type { ReactNode } from "react";

type MemoryMediaProps = {
  src?: string;
  poster?: string;
  alt: string;
  caption?: string;
  className?: string;
  children: ReactNode;
};

export function MemoryMedia({
  src,
  poster,
  alt,
  caption,
  className = "",
  children,
}: MemoryMediaProps) {
  const isVideo = src?.endsWith(".mp4") || src?.endsWith(".webm");

  return (
    <figure className={`memory-media ${className}`}>
      {src && isVideo ? (
        <>
          <video
            className="memory-media__asset"
            src={src}
            poster={poster}
            muted
            loop
            autoPlay
            playsInline
            preload="none"
            aria-label={alt}
          />
          <div className="memory-media__overlay" aria-hidden="true" />
          <div className="memory-media__content" aria-hidden="true">
            {children}
          </div>
        </>
      ) : src ? (
        <>
          <img
            className="memory-media__asset memory-media__asset--cinematic"
            src={src}
            alt={alt}
            loading="lazy"
          />
          <div className="memory-media__overlay" aria-hidden="true" />
          <div className="memory-media__content" aria-hidden="true">
            {children}
          </div>
        </>
      ) : (
        <div className="memory-media__fallback" role="img" aria-label={alt}>
          {children}
        </div>
      )}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
