import React from 'react';
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { CheckCircle2, ChefHat, FileSpreadsheet, Sparkles, WifiOff } from 'lucide-react';
import { Background } from '../components/Background';
import { KineticCaptions, WordTimestamp } from '../components/KineticCaptions';

interface Scene05BenefitsProps {
  words: WordTimestamp[];
}

const FEATURES = [
  {
    icon: ChefHat,
    title: 'Kalkulator Resep & Bahan Baku',
    highlight: false,
    delay: 15,
  },
  {
    icon: FileSpreadsheet,
    title: 'Export Laporan ke Excel (CSV)',
    highlight: false,
    delay: 110,
  },
  {
    icon: WifiOff,
    title: '100% Offline di HP (PWA)',
    highlight: false,
    delay: 170,
  },
  {
    icon: Sparkles,
    title: 'Sekali Bayar — Tanpa Langganan!',
    highlight: true,
    delay: 288,
  },
];

export const Scene05Benefits: React.FC<Scene05BenefitsProps> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const switchFrame = Math.min(110, Math.round(durationInFrames * 0.35));
  const swapProgress = spring({
    frame: Math.max(0, frame - switchFrame),
    fps,
    config: { damping: 16, stiffness: 120 },
  });

  return (
    <AbsoluteFill>
      <Background variant="solution" />

      {/* Main Safe-Zone Layout */}
      <div
        style={{
          position: 'absolute',
          top: 185,
          left: 80,
          right: 150,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        {/* Section Pill */}
        <div
          style={{
            padding: '10px 24px',
            borderRadius: 999,
            backgroundColor: 'rgba(16, 185, 129, 0.16)',
            border: '1.5px solid rgba(16, 185, 129, 0.45)',
            color: '#6ee7b7',
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '0.06em',
          }}
        >
          KENAPA PILIH MARGINKU?
        </div>

        {/* Bento Preview Card switching 04_recipes_hpp.png -> 05_products_catalog.png */}
        <div
          style={{
            position: 'relative',
            width: 740,
            height: 520,
            borderRadius: 34,
            overflow: 'hidden',
            backgroundColor: '#18181b',
            border: '2px solid rgba(163, 230, 53, 0.28)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Card A: Recipes HPP */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: `translateX(${-swapProgress * 100}%)`,
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: '#09090b',
            }}
          >
            <Img
              src={staticFile('captures/04_recipes_hpp.png')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top center',
              }}
            />
          </div>

          {/* Card B: Products Catalog */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: `translateX(${(1 - swapProgress) * 100}%)`,
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: '#09090b',
            }}
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
          </div>
        </div>

        {/* 4 Feature Checklist Cards */}
        <div
          style={{
            width: 740,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            const localF = frame - feat.delay;
            const s = spring({
              frame: Math.max(0, localF),
              fps,
              config: { damping: 14, stiffness: 160 },
            });
            const visible = localF >= 0;
            return (
              <div
                key={feat.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 22px',
                  borderRadius: 20,
                  backgroundColor: feat.highlight
                    ? 'rgba(163, 230, 53, 0.96)'
                    : 'rgba(24, 24, 27, 0.92)',
                  border: feat.highlight
                    ? '2px solid #d9f99d'
                    : '1.5px solid rgba(63, 63, 70, 0.85)',
                  boxShadow: feat.highlight
                    ? '0 12px 32px rgba(163, 230, 53, 0.3)'
                    : '0 8px 24px rgba(0, 0, 0, 0.35)',
                  opacity: visible ? Math.min(1, s * 1.4) : 0,
                  transform: `translateX(${visible ? (1 - s) * -36 : -36}px) scale(${0.96 + s * 0.04})`,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: feat.highlight
                      ? 'rgba(9, 9, 11, 0.14)'
                      : 'rgba(163, 230, 53, 0.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: feat.highlight ? '#09090b' : '#a3e635',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={24} strokeWidth={2.4} />
                </div>
                <span
                  style={{
                    flex: 1,
                    fontSize: 26,
                    fontWeight: 800,
                    color: feat.highlight ? '#09090b' : '#fafafa',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {feat.title}
                </span>
                <CheckCircle2
                  size={26}
                  color={feat.highlight ? '#09090b' : '#10b981'}
                  strokeWidth={2.5}
                />
              </div>
            );
          })}
        </div>
      </div>

      <KineticCaptions words={words} accent="lime" bottomPx={365} />
    </AbsoluteFill>
  );
};
