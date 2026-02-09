import { useEffect, useRef } from "react";

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process(): void;
      };
    };
  }
}

interface InstagramEmbedProps {
  /** The full URL of the Instagram post/reel to embed */
  url: string;
  /** Hide the caption below the embed */
  hidecaption?: boolean;
  /** Max width in pixels (min 326, default 540) */
  maxWidth?: number;
}

/**
 * Embeds an Instagram post that works correctly with client-side routing.
 *
 * Handles loading the embed.js script and re-processing embeds on route changes,
 * which is the core issue with Instagram embeds in React SPAs.
 */
export default function InstagramEmbed({
  url,
  hidecaption = false,
  maxWidth = 540,
}: InstagramEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If embed.js is already loaded, just re-process
    if (window.instgrm) {
      window.instgrm.Embeds.process();
      return;
    }

    // Load embed.js for the first time
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    // embed.js will auto-process on load, no need for an onload handler
  }, [url]);

  // Normalize URL: strip query params and ensure trailing slash
  const permalink = url.split("?")[0].replace(/\/?$/, "/");

  return (
    <div ref={containerRef}>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={permalink}
        data-instgrm-version="14"
        {...(hidecaption ? { "data-instgrm-captioned": undefined } : {})}
        style={{
          background: "#FFF",
          border: 0,
          borderRadius: "3px",
          boxShadow: "0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)",
          margin: "1px",
          maxWidth: `${maxWidth}px`,
          minWidth: "326px",
          padding: 0,
          width: "calc(100% - 2px)",
        }}
      >
        <a href={permalink} target="_blank" rel="noopener noreferrer">
          View this post on Instagram
        </a>
      </blockquote>
    </div>
  );
}
