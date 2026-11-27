import React from 'react';
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ArrowDown, ShoppingBag, TrendingUp } from 'lucide-react';
import { Background } from '../components/Background';
import { KineticCaptions, WordTimestamp } from '../components/KineticCaptions';
import { PhoneMockup } from '../components/PhoneMockup';

interface Scene06CTAProps {
  words: WordTimestamp[];
}

export const Scene06CTA: React.FC<Scene06CTAProps> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ctaSpring = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const pulseScale = 1 + Math.sin(frame / 8) * 0.035;
  const arrowBounce = Math.sin(frame / 6) * 8;

  return (
    <AbsoluteFill>
      <Background variant="cta" />

      {/* Top 3D Perspective Phone Mockup */}
      <div
        style={{
          position: 'absolute',
          top: 190,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <PhoneMockup
          width={345}
          rotateYDeg={-10}
          rotateXDeg={5}
          glowColor="rgba(163, 230, 53, 0.35)"
        >
          <Img
            src={staticFile('captures/05_products_catalog.png')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
            }}
          />
        </PhoneMockup>
      </div>

      {/* CTA Card safely positioned above caption & bottom safe zone */}
      <div
        style={{
          position: 'absolute',
          top: 990,
          left: 80,
          right: 150,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          opacity: ctaSpring,
          transform: `translateY(${(1 - ctaSpring) * 40}px)`,
        }}
      >
        {/* Brand mini badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            color: '#fafafa',
            fontSize: 30,
            fontWeight: 800,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: '#a3e635',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={24} color="#09090b" strokeWidth={2.8} />
          </div>
          <span>
            Margin<span style={{ color: '#a3e635' }}>Ku</span> · Sekali Bayar
          </span>
        </div>

        {/* Pulsing CTA Button */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            padding: '24px 40px',
            borderRadius: 26,
            background: 'linear-gradient(135deg, #bef264 0%, #a3e635 60%, #84cc16 100%)',
            color: '#09090b',
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: '-0.01em',
            boxShadow:
              '0 20px 50px rgba(163, 230, 53, 0.42), 0 0 0 6px rgba(163, 230, 53, 0.18)',
            transform: `scale(${pulseScale})`,
            textAlign: 'center',
          }}
        >
          <ShoppingBag size={32} strokeWidth={2.6} />
          <span>DAPATKAN MARGINKU SEKARANG</span>
        </div>

        {/* Arrow pointing toward Bio / Keranjang */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            color: '#d9f99d',
            fontSize: 26,
            fontWeight: 800,
            transform: `translateY(${arrowBounce}px)`,
          }}
        >
          <ArrowDown size={28} strokeWidth={2.8} />
          <span>Klik Link di Bio atau Keranjang</span>
          <ArrowDown size={28} strokeWidth={2.8} />
        </div>
      </div>

      <KineticCaptions words={words} accent="lime" bottomPx={365} />
    </AbsoluteFill>
  );
};
