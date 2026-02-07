"use client";

import { useState, useRef, useEffect } from "react";

interface AudioPlayerProps {
  audioUrl: string;
  duration?: number;
  sent: boolean;
}

export default function AudioPlayer({ audioUrl, duration, sent }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 py-1">
      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
          sent
            ? 'bg-white/20 hover:bg-white/30 active:bg-white/40'
            : 'bg-[var(--wa-teal)]/10 hover:bg-[var(--wa-teal)]/20 active:bg-[var(--wa-teal)]/30'
        }`}
      >
        {isPlaying ? (
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
            className={sent ? 'text-white' : 'text-[var(--wa-teal)]'}
          >
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
            className={sent ? 'text-white' : 'text-[var(--wa-teal)]'}
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Waveform Visualization (static bars) */}
      <div className="flex flex-1 items-center gap-[2px] px-1">
        {[...Array(30)].map((_, i) => {
          const heights = [4, 8, 6, 10, 5, 12, 7, 9, 4, 11, 6, 8, 5, 10, 7, 9, 6, 12, 5, 8, 7, 10, 6, 9, 5, 11, 7, 8, 6, 10];
          const height = heights[i % heights.length];
          const isPassed = (i / 30) * 100 < progress;
          
          return (
            <div
              key={i}
              className={`w-[2px] rounded-full transition-colors ${
                sent
                  ? isPassed
                    ? 'bg-white'
                    : 'bg-white/30'
                  : isPassed
                  ? 'bg-[var(--wa-teal)]'
                  : 'bg-[var(--wa-teal)]/30'
              }`}
              style={{ height: `${height}px` }}
            />
          );
        })}
      </div>

      {/* Duration */}
      <span className="text-[11px] text-[var(--wa-text-muted)] min-w-[32px] text-right">
        {formatTime(isPlaying ? currentTime : audioDuration)}
      </span>
    </div>
  );
}
