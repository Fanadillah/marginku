import React from 'react';
import { Composition } from 'remotion';
import voManifest from './data/voManifest.json';
import { MarginKuPromoVideo } from './Video';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MarginKuPromo"
      component={MarginKuPromoVideo}
      durationInFrames={voManifest.totalDurationInFrames}
      fps={voManifest.fps}
      width={1080}
      height={1920}
    />
  );
};
