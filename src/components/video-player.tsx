"use client";

import { useRef, useCallback, useEffect } from "react";

export default function VideoPlayer({ audioId }: { audioId: string }) {
  const playerRef = useRef<HTMLIFrameElement>(null);

  const handleSeek = useCallback((seconds: number) => {
    if (playerRef.current) {
      playerRef.current.contentWindow?.postMessage(
        JSON.stringify({
          event: "command",
          func: "seekTo",
          args: [seconds, true],
        }),
        "*"
      );
    }
  }, []);

  useEffect(() => {
    // Set up event listener for seek events from other components
    const handleSeekEvent = (event: CustomEvent) => {
      if (event.detail && typeof event.detail.seconds === "number") {
        handleSeek(event.detail.seconds);
      }
    };

    window.addEventListener("seek-video", handleSeekEvent as EventListener);

    return () => {
      window.removeEventListener(
        "seek-video",
        handleSeekEvent as EventListener
      );
    };
  }, [handleSeek]);

  return (
    <div className="aspect-video w-full mb-6 rounded-xl overflow-hidden shadow-lg">
      <iframe
        ref={playerRef}
        src={`https://www.youtube.com/embed/${audioId}?enablejsapi=1`}
        className="w-full h-full"
        allowFullScreen
        title="Youtube Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}
