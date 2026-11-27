import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface KineticCaptionsProps {
  words: WordTimestamp[];
  accent?: 'lime' | 'rose';
  bottomPx?: number;
}

const WORDS_PER_CHUNK = 4;

export const KineticCaptions: React.FC<KineticCaptionsProps> = ({
  words,
  accent = 'lime',
  bottomPx = 370,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;

  const chunks = useMemo(() => {
    const result: WordTimestamp[][] = [];
    for (let i = 0; i < words.length; i += WORDS_PER_CHUNK) {
      result.push(words.slice(i, i + WORDS_PER_CHUNK));
    }
    return result;
  }, [words]);

  if (chunks.length === 0) return null;

  let activeChunk = chunks[0];
  for (const chunk of chunks) {
    const chunkStart = chunk[0].start;
    const chunkEnd = chunk[chunk.length - 1].end;
    if (currentSec >= chunkStart - 0.05) {
      activeChunk = chunk;
    }
    if (currentSec <= chunkEnd + 0.15) {
      break;
    }
  }

  const highlightColor = accent === 'rose' ? '#fb7185' : '#a3e635';
  const borderColor = accent === 'rose' ? 'rgba(244, 63, 94, 0.35)' : 'rgba(163, 230, 53, 0.3)';

  return (
    <div
      style={{
        position: 'absolute',
        bottom: bottomPx,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {/* Max width 780px centered -> 150px safe margin on both left & right (> 140px TikTok safe zone) */}
      <div
        style={{
          maxWidth: 780,
          padding: '16px 28px',
          borderRadius: 24,
          backgroundColor: 'rgba(9, 9, 11, 0.86)',
          border: `1.5px solid ${borderColor}`,
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px 12px',
          textAlign: 'center',
        }}
      >
        {activeChunk.map((w, idx) => {
          const isActive = currentSec >= w.start - 0.03 && currentSec <= w.end + 0.08;
          const isPast = currentSec > w.end + 0.08;
          return (
            <span
              key={`${w.word}-${idx}`}
              style={{
                fontSize: 40,
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                color: isActive ? highlightColor : isPast ? '#fafafa' : '#d4d4d8',
                transform: isActive ? 'scale(1.07)' : 'scale(1)',
                display: 'inline-block',
                textShadow: isActive ? `0 0 24px ${highlightColor}55` : '0 2px 8px rgba(0,0,0,0.6)',
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
