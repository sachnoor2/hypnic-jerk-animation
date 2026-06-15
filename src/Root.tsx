import React from 'react';
import { Composition } from 'remotion';
import { HypnicJerk } from './HypnicJerk';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="HypnicJerk"
      component={HypnicJerk}
      durationInFrames={2700}
      fps={60}
      width={1080}
      height={1920}
    />
  </>
);

