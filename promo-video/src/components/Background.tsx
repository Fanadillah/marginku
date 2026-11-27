import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

interface BackgroundProps {
  variant?: 'problem' | 'solution' | 'cta';
}

export const Background: React.FC<BackgroundProps> = ({ variant = 'solution' }) => {
  const frame = useCurrentFrame();
  const pulse = 0.85 + Math.sin(frame / 18) * 0.15;
  const gridShiftY = (frame * 0.6) % 60;

  const primaryGlow =
    variant === 'problem'
      ? `rgba(244, 63, 94, ${0.22 * pulse})`
      : variant === 'cta'
        ? `rgba(163, 230, 53, ${0.22 * pulse})`
        : `rgba(163, 230, 53, ${0.16 * pulse})`;

  const secondaryGlow =
    variant === 'problem'
      ? `rgba(225, 29, 72, ${0.12 * pulse})`
      : `rgba(16, 185, 129, ${0.16 * pulse})`;

  return (
    <AbsoluteFill style={{ backgroundColor: '#09090b', overflow: 'hidden' }}>
      {/* Animated subtle grid */}
      <div
        style={{
          position: 'absolute',
          inset: -60,
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          transform: `translateY(${gridShiftY}px)`,
        }}
      />

      {/* Top radial glow */}
      <div
        style={{
          position: 'absolute',
          top: -180,
          left: '50%',
          width: 980,
          height: 980,
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${primaryGlow} 0%, rgba(9,9,11,0) 68%)`,
        }}
      />

      {/* Bottom-left secondary glow */}
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: -180,
          width: 780,
          height: 780,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${secondaryGlow} 0%, rgba(9,9,11,0) 70%)`,
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 45%, rgba(9,9,11,0) 45%, rgba(9,9,11,0.72) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
