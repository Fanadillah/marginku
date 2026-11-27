import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface FloatingBadgeProps {
  label: string;
  sublabel?: string;
  variant?: 'danger' | 'success' | 'dark';
  delayFrames?: number;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

export const FloatingBadge: React.FC<FloatingBadgeProps> = ({
  label,
  sublabel,
  variant = 'dark',
  delayFrames = 0,
  icon,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - delayFrames;
  const pop = spring({
    frame: Math.max(0, localFrame),
    fps,
    config: { damping: 12, stiffness: 170, mass: 0.7 },
  });

  if (localFrame < 0) return null;

  const bob = Math.sin(localFrame / 14) * 5;

  const palette =
    variant === 'danger'
      ? {
          bg: 'rgba(136, 19, 55, 0.92)',
          border: 'rgba(244, 63, 94, 0.7)',
          text: '#fff1f2',
          sub: '#fda4af',
          shadow: '0 14px 34px rgba(244, 63, 94, 0.28)',
        }
      : variant === 'success'
        ? {
            bg: 'rgba(163, 230, 53, 0.96)',
            border: 'rgba(217, 249, 157, 0.9)',
            text: '#09090b',
            sub: '#1a2e05',
            shadow: '0 14px 34px rgba(163, 230, 53, 0.28)',
          }
        : {
            bg: 'rgba(24, 24, 27, 0.94)',
            border: 'rgba(63, 63, 70, 0.9)',
            text: '#fafafa',
            sub: '#a1a1aa',
            shadow: '0 14px 34px rgba(0, 0, 0, 0.5)',
          };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 22px',
        borderRadius: 20,
        backgroundColor: palette.bg,
        border: `1.5px solid ${palette.border}`,
        boxShadow: palette.shadow,
        transform: `translateY(${bob}px) scale(${pop})`,
        opacity: Math.min(1, pop * 1.3),
        ...style,
      }}
    >
      {icon && <div style={{ display: 'flex', alignItems: 'center', color: palette.text }}>{icon}</div>}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: palette.text,
            lineHeight: 1.15,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
        {sublabel && (
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: palette.sub,
              lineHeight: 1.2,
              marginTop: 2,
              whiteSpace: 'nowrap',
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
