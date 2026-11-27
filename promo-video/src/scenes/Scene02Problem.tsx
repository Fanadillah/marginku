import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Percent, Package, Tag, Users } from 'lucide-react';
import { Background } from '../components/Background';
import { FloatingBadge } from '../components/FloatingBadge';
import { KineticCaptions, WordTimestamp } from '../components/KineticCaptions';
import { PhoneMockup } from '../components/PhoneMockup';

interface Scene02ProblemProps {
  words: WordTimestamp[];
}

export const Scene02Problem: React.FC<Scene02ProblemProps> = ({ words }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const imgScale = interpolate(frame, [0, durationInFrames], [1.0, 1.18], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Background variant="problem" />

      {/* Top label inside safe zone */}
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
            padding: '12px 26px',
            borderRadius: 999,
            backgroundColor: 'rgba(244, 63, 94, 0.16)',
            border: '1.5px solid rgba(244, 63, 94, 0.5)',
            color: '#fda4af',
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: '0.06em',
          }}
        >
          POTONGAN YANG SERING TERLEWAT
        </div>
      </div>

      {/* Centered Phone Mockup showing 01_boncos.png */}
      <div
        style={{
          position: 'absolute',
          top: 270,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <PhoneMockup width={445} glowColor="rgba(244, 63, 94, 0.34)">
          <Img
            src={staticFile('captures/01_boncos.png')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
              transformOrigin: '50% 18%',
              transform: `scale(${imgScale})`,
            }}
          />
        </PhoneMockup>
      </div>

      {/* Floating fee pills synchronized with VO word timestamps */}
      <FloatingBadge
        variant="danger"
        delayFrames={112}
        icon={<Percent size={24} />}
        label="Admin 8%"
        style={{ position: 'absolute', top: 430, left: 68, zIndex: 30 }}
      />
      <FloatingBadge
        variant="danger"
        delayFrames={141}
        icon={<Tag size={24} />}
        label="Gratis Ongkir 4%"
        style={{ position: 'absolute', top: 560, right: 145, zIndex: 30 }}
      />
      <FloatingBadge
        variant="danger"
        delayFrames={194}
        icon={<Users size={24} />}
        label="Affiliate 5%"
        style={{ position: 'absolute', top: 760, left: 68, zIndex: 30 }}
      />
      <FloatingBadge
        variant="danger"
        delayFrames={246}
        icon={<Package size={24} />}
        label="Biaya Kemasan"
        style={{ position: 'absolute', top: 900, right: 145, zIndex: 30 }}
      />

      <KineticCaptions words={words} accent="rose" bottomPx={365} />
    </AbsoluteFill>
  );
};
