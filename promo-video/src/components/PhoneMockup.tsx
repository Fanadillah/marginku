import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface PhoneMockupProps {
  children: React.ReactNode;
  width?: number;
  delayFrames?: number;
  glowColor?: string;
  rotateYDeg?: number;
  rotateXDeg?: number;
  floatAmplitude?: number;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  children,
  width = 450,
  delayFrames = 0,
  glowColor = 'rgba(163, 230, 53, 0.25)',
  rotateYDeg = 0,
  rotateXDeg = 0,
  floatAmplitude = 6,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const height = Math.round((width * 844) / 390);
  const progress = spring({
    frame: Math.max(0, frame - delayFrames),
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.9 },
  });

  const translateY = (1 - progress) * 90 + Math.sin(frame / 22) * floatAmplitude;
  const scale = 0.88 + progress * 0.12;
  const opacity = Math.min(1, progress * 1.4);

  return (
    <div
      style={{
        opacity,
        transform: `perspective(1200px) translateY(${translateY}px) scale(${scale}) rotateY(${rotateYDeg}deg) rotateX(${rotateXDeg}deg)`,
        position: 'relative',
        width,
        height,
        borderRadius: 52,
        padding: 12,
        background: 'linear-gradient(145deg, #3f3f46 0%, #18181b 50%, #27272a 100%)',
        boxShadow: `0 30px 80px rgba(0, 0, 0, 0.72), 0 0 60px ${glowColor}, inset 0 0 0 1.5px rgba(255,255,255,0.16)`,
      }}
    >
      {/* Screen viewport */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 42,
          overflow: 'hidden',
          backgroundColor: '#09090b',
        }}
      >
        {children}

        {/* Subtle Dynamic Island */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: Math.round(width * 0.24),
            height: 20,
            borderRadius: 999,
            backgroundColor: '#000000',
            boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
            zIndex: 10,
          }}
        />
      </div>
    </div>
  );
};
