import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { Background } from '../components/Background';
import { FloatingBadge } from '../components/FloatingBadge';
import { KineticCaptions, WordTimestamp } from '../components/KineticCaptions';

interface Scene01HookProps {
  words: WordTimestamp[];
}

export const Scene01Hook: React.FC<Scene01HookProps> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line1Spring = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 150 },
  });

  const line2Spring = spring({
    frame: Math.max(0, frame - 22),
    fps,
    config: { damping: 11, stiffness: 180 },
  });

  const shakeX =
    frame >= 22 && frame <= 38 ? Math.sin((frame - 22) * 2.2) * (38 - frame) * 0.45 : 0;

  return (
    <AbsoluteFill>
      <Background variant="problem" />

      {/* Safe-zone main container (top >= 180px, left/right >= 120px) */}
      <div
        style={{
          position: 'absolute',
          top: 230,
          left: 80,
          right: 150,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 28,
        }}
      >
        {/* Eyebrow Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 24px',
            borderRadius: 999,
            backgroundColor: 'rgba(244, 63, 94, 0.14)',
            border: '1.5px solid rgba(244, 63, 94, 0.45)',
            color: '#fda4af',
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            opacity: Math.min(1, line1Spring * 1.5),
          }}
        >
          <AlertTriangle size={24} />
          <span>REALITA SELLER ONLINE</span>
        </div>

        {/* Kinetic Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: '#fafafa',
              transform: `translateY(${(1 - line1Spring) * 48}px) scale(${0.92 + line1Spring * 0.08})`,
              opacity: line1Spring,
            }}
          >
            ORDERAN RAMAI...
          </div>

          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: '#f43f5e',
              textShadow: '0 0 42px rgba(244, 63, 94, 0.45)',
              transform: `translateX(${shakeX}px) scale(${0.8 + line2Spring * 0.2})`,
              opacity: frame >= 22 ? Math.min(1, line2Spring * 1.4) : 0,
            }}
          >
            TAPI KOK BONCOS?!
          </div>
        </div>

        {/* Floating negative metric cards */}
        <div
          style={{
            marginTop: 56,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 20,
            maxWidth: 760,
          }}
        >
          <FloatingBadge
            variant="danger"
            delayFrames={30}
            icon={<TrendingDown size={28} />}
            label="-Rp 4.500 / pcs"
            sublabel="Rugi setiap orderan"
          />
          <FloatingBadge
            variant="danger"
            delayFrames={44}
            label="Margin -8%"
            sublabel="Tergerus potongan"
          />
          <FloatingBadge
            variant="danger"
            delayFrames={58}
            icon={<AlertTriangle size={26} />}
            label="Status: BONCOS!"
            sublabel="Rekening makin tipis"
          />
        </div>
      </div>

      <KineticCaptions words={words} accent="rose" bottomPx={365} />
    </AbsoluteFill>
  );
};
