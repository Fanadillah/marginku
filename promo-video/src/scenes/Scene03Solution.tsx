import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ShieldCheck, TrendingUp } from 'lucide-react';
import { Background } from '../components/Background';
import { KineticCaptions, WordTimestamp } from '../components/KineticCaptions';

interface Scene03SolutionProps {
  words: WordTimestamp[];
}

export const Scene03Solution: React.FC<Scene03SolutionProps> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flashOpacity = interpolate(frame, [0, 14], [0.42, 0], {
    extrapolateRight: 'clamp',
  });

  const logoSpring = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 10, stiffness: 140, mass: 0.8 },
  });

  const textSpring = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { damping: 13, stiffness: 130 },
  });

  const tagSpring = spring({
    frame: Math.max(0, frame - 32),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <AbsoluteFill>
      <Background variant="solution" />

      {/* Center Logo Reveal */}
      <div
        style={{
          position: 'absolute',
          top: 340,
          left: 80,
          right: 140,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 28,
        }}
      >
        {/* Glowing Logo Box */}
        <div
          style={{
            width: 176,
            height: 176,
            borderRadius: 44,
            background: 'linear-gradient(135deg, #bef264 0%, #a3e635 55%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow:
              '0 24px 64px rgba(163, 230, 53, 0.36), 0 0 0 14px rgba(163, 230, 53, 0.12)',
            transform: `scale(${logoSpring}) rotate(${(1 - logoSpring) * -12}deg)`,
            opacity: Math.min(1, logoSpring * 1.4),
          }}
        >
          <TrendingUp size={92} color="#09090b" strokeWidth={2.7} />
        </div>

        {/* App Name */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#fafafa',
            lineHeight: 1.0,
            transform: `translateY(${(1 - textSpring) * 40}px)`,
            opacity: textSpring,
          }}
        >
          Margin<span style={{ color: '#a3e635' }}>Ku</span>
        </div>

        {/* Tagline Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 30px',
            borderRadius: 22,
            backgroundColor: 'rgba(163, 230, 53, 0.14)',
            border: '1.5px solid rgba(163, 230, 53, 0.45)',
            color: '#d9f99d',
            fontSize: 28,
            fontWeight: 800,
            transform: `translateY(${(1 - tagSpring) * 30}px) scale(${0.92 + tagSpring * 0.08})`,
            opacity: tagSpring,
          }}
        >
          <ShieldCheck size={30} color="#a3e635" />
          <span>Kalkulator HPP & Harga Jual Anti-Boncos</span>
        </div>

        {/* Marketplace Strip */}
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 12,
            opacity: tagSpring,
          }}
        >
          {['Shopee', 'TikTok Shop', 'GoFood / Grab', 'Offline / WA'].map((name) => (
            <span
              key={name}
              style={{
                padding: '10px 20px',
                borderRadius: 14,
                backgroundColor: 'rgba(24, 24, 27, 0.9)',
                border: '1px solid rgba(63, 63, 70, 0.85)',
                color: '#e4e4e7',
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Fresh lime wipe flash on entry */}
      <AbsoluteFill
        style={{
          backgroundColor: '#a3e635',
          opacity: flashOpacity,
          pointerEvents: 'none',
        }}
      />

      <KineticCaptions words={words} accent="lime" bottomPx={370} />
    </AbsoluteFill>
  );
};
