import React from 'react';
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Scale, Sparkles } from 'lucide-react';
import { Background } from '../components/Background';
import { KineticCaptions, WordTimestamp } from '../components/KineticCaptions';
import { PhoneMockup } from '../components/PhoneMockup';

interface Scene04DemoProps {
  words: WordTimestamp[];
}

export const Scene04Demo: React.FC<Scene04DemoProps> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const splitFrame = Math.min(320, Math.round(durationInFrames * 0.71));
  const slideProgress = spring({
    frame: Math.max(0, frame - splitFrame),
    fps,
    config: { damping: 16, stiffness: 120 },
  });

  const videoZoom = interpolate(frame, [0, splitFrame], [1.0, 1.07], {
    extrapolateRight: 'clamp',
  });

  const isComparePart = frame >= splitFrame;

  return (
    <AbsoluteFill>
      <Background variant="solution" />

      {/* Dynamic top label inside safe zone */}
      <div
        style={{
          position: 'absolute',
          top: 185,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 26px',
            borderRadius: 999,
            backgroundColor: 'rgba(163, 230, 53, 0.16)',
            border: '1.5px solid rgba(163, 230, 53, 0.5)',
            color: '#bef264',
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: '0.05em',
          }}
        >
          {isComparePart ? <Scale size={24} /> : <Sparkles size={24} />}
          <span>{isComparePart ? 'BANDINGKAN SEMUA PLATFORM' : 'MODE CARI HARGA JUAL'}</span>
        </div>
      </div>

      {/* Large Centered Phone Mockup */}
      <div
        style={{
          position: 'absolute',
          top: 265,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <PhoneMockup width={465} glowColor="rgba(163, 230, 53, 0.3)">
          {/* Part 1: Live screen recording (unmounted once slid off-screen) */}
          {frame < splitFrame + 20 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: `translateX(${-slideProgress * 100}%)`,
              }}
            >
              <OffthreadVideo
                src={staticFile('captures/02_reverse_demo.mp4')}
                muted
                delayRenderTimeoutInMilliseconds={90000}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transformOrigin: '50% 25%',
                  transform: `scale(${videoZoom})`,
                }}
              />
            </div>
          )}

          {/* Part 2: Platform comparison modal screenshot */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: `translateX(${(1 - slideProgress) * 100}%)`,
            }}
          >
            <Img
              src={staticFile('captures/03_compare_platforms.png')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top center',
              }}
            />
          </div>
        </PhoneMockup>
      </div>

      <KineticCaptions words={words} accent="lime" bottomPx={365} />
    </AbsoluteFill>
  );
};
