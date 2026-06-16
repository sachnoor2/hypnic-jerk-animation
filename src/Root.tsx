import React from 'react';
import { Composition } from 'remotion';
import { AnimationScene } from './HypnicJerk';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id='HypnicJerk'
        component={AnimationScene}
        durationInFrames={2700}
        fps={60}
        width={1080}
        height={1920}
      />
    </>
  );
};
