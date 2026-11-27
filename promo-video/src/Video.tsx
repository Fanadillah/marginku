import React from 'react';
import { AbsoluteFill, Audio, Series, staticFile } from 'remotion';
import { loadFont } from '@remotion/google-fonts/PlusJakartaSans';
import voManifest from './data/voManifest.json';
import { Scene01Hook } from './scenes/Scene01Hook';
import { Scene02Problem } from './scenes/Scene02Problem';
import { Scene03Solution } from './scenes/Scene03Solution';
import { Scene04Demo } from './scenes/Scene04Demo';
import { Scene05Benefits } from './scenes/Scene05Benefits';
import { Scene06CTA } from './scenes/Scene06CTA';

const { fontFamily } = loadFont('normal', {
  weights: ['500', '600', '700', '800'],
  subsets: ['latin'],
});

export const MarginKuPromoVideo: React.FC = () => {
  const scenes = voManifest.scenes;

  const renderSceneContent = (sceneId: string, words: { word: string; start: number; end: number }[]) => {
    switch (sceneId) {
      case 'scene_01':
        return <Scene01Hook words={words} />;
      case 'scene_02':
        return <Scene02Problem words={words} />;
      case 'scene_03':
        return <Scene03Solution words={words} />;
      case 'scene_04':
        return <Scene04Demo words={words} />;
      case 'scene_05':
        return <Scene05Benefits words={words} />;
      case 'scene_06':
        return <Scene06CTA words={words} />;
      default:
        return null;
    }
  };

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        backgroundColor: '#09090b',
        color: '#fafafa',
      }}
    >
      <Series>
        {scenes.map((scene) => (
          <Series.Sequence key={scene.id} durationInFrames={scene.totalFrames}>
            {renderSceneContent(scene.id, scene.words)}
            {scene.hasAudio && <Audio src={staticFile(scene.audioFile)} volume={1.0} />}
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
