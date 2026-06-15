import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Audio, staticFile } from 'remotion';

// ════════════════════════════════════════════════════════════════════
//  HYPNIC JERK — "Why do you feel like you're falling in your sleep?"
//  Format : 1080 × 1920 portrait · 60 fps · 45 s (2700 frames)
//  Style  : Zack D. Films / Advanced Physics
// ════════════════════════════════════════════════════════════════════

const W = 1080, H = 1920, CX = 540, CY = 960, FPS = 60;

const BG    = '#0E1117';
const GOLD  = '#FDCB6E';
const TEAL  = '#00CEC9';
const WHITE = '#DFE6E9';
const RED   = '#FF7675';

const T = {
  S01_S: 0,    S01_E: 480,
  S02_S: 480,  S02_E: 1020,
  S03_S: 1020, S03_E: 1320,
  S04_S: 1320, S04_E: 1920,
  S05_S: 1920, S05_E: 2220,
  S06_S: 2220, S06_E: 2520,
  S07_S: 2520, S07_E: 2700,
  TOTAL: 2700,
};

const SUBS = [
  { f: 10,   t: 470,  h: 'क्या आपके साथ कभी ऐसा हुआ है?', r: 'Kya aapke saath kabhi aisa hua hai?', s: 'n' },
  { f: 80,   t: 470,  h: 'कि आप सोने वाले हों और अचानक गिर रहे हों?', r: 'Ki aap sone waale hon aur achanak gir rahe hon?', s: 'n' },
  { f: 490,  t: 750,  h: "इसे 'Hypnic Jerk' कहते हैं।", r: "Isse 'Hypnic Jerk' kehte hain.", s: 'n' },
  { f: 760,  t: 1010, h: 'जब शरीर रिलैक्स होता है, तो मसल्स ढीली पड़ती हैं।', r: 'Jab shareer relax hota hai, toh muscles dhili padti hain.', s: 'n' },
  { f: 1030, t: 1310, h: 'लेकिन ब्रेन इसे "Falling" समझ लेता है।', r: 'Lekin brain isse "Falling" samajh leta hai.', s: 'n' },
  { f: 1330, t: 1600, h: 'ब्रेन को लगता है कि आप बैलेंस खो रहे हैं।', r: 'Brain ko lagta hai ki aap balance kho rahe hain.', s: 'n' },
  { f: 1610, t: 1910, h: 'इसलिए वो एक "Electric Shock" भेजता है।', r: 'Isliye wo ek "Electric Shock" bhejta hai.', s: 'n' },
  { f: 1930, t: 2210, h: 'और आप एक झटके के साथ जाग जाते हैं।', r: 'Aur aap ek jhatke ke saath jaag jaate hain.', s: 'n' },
  { f: 2230, t: 2510, h: 'ब्रेन बस आपकी जान बचा रहा था!', r: 'Brain bas aapki jaan bacha raha tha!', s: 'n' },
  { f: 2530, t: 2690, h: 'Subscribe for more!', r: 'Subscribe for more!', s: 'n' },
];

// Helper: Deterministic Random (for starfields/particles)
const sr = (i: number) => {
  const x = Math.sin(i) * 10000;
  return x - Math.floor(x);
};

/**
 * Audio configuration for each scene
 * Maps scene key to its audio timing and file
 */
const SCENE_AUDIO: Array<{startFrame: number; endFrame: number; id: string}> = [
  { startFrame: T.S01_S, endFrame: T.S01_E, id: 's01' },
  { startFrame: T.S02_S, endFrame: T.S02_E, id: 's02' },
  { startFrame: T.S03_S, endFrame: T.S03_E, id: 's03' },
  { startFrame: T.S04_S, endFrame: T.S04_E, id: 's04' },
  { startFrame: T.S05_S, endFrame: T.S05_E, id: 's05' },
  { startFrame: T.S06_S, endFrame: T.S06_E, id: 's06' },
  { startFrame: T.S07_S, endFrame: T.S07_E, id: 's07' },
];

export const HypnicJerk: React.FC = () => {
  const frame = useCurrentFrame();

  // Find active audio segment(s) for current frame
  const activeAudio = SCENE_AUDIO.filter(a => frame >= a.startFrame && frame <= a.endFrame);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>
      {/* 1. Global Camera Motion (Constant Pan/Zoom) */}
      <AbsoluteFill style={{
        transform: `scale(${interpolate(frame, [0, T.TOTAL], [1, 1.1])}) rotate(${interpolate(frame, [0, T.TOTAL], [0, 1])}deg)`
      }}>
        
        {/* Scene 1: Falling sensation */}
        {frame < T.S02_S && <SceneHook frame={frame} />}

        {/* Scene 2 & 3: Muscle relaxation / Confusion */}
        {frame >= T.S02_S && frame < T.S04_S && <SceneMechanism frame={frame} />}

        {/* Scene 4: Electric Shock */}
        {frame >= T.S04_S && frame < T.S05_S && <SceneShock frame={frame} />}

        {/* Scene 5 & 6: Awakening / Brain Shield */}
        {frame >= T.S05_S && <SceneOutro frame={frame} />}

      </AbsoluteFill>

      {/* Subtitles Overlay */}
      <Subtitles frame={frame} />

      {/* Audio Segments - only load active ones */}
      {activeAudio.map(audio => (
        <Audio
          key={audio.id}
          src={staticFile(`audio/segments/${audio.id}.mp3`)}
          startFrom={0}
        />
      ))}
    </AbsoluteFill>
  );
};

// ── SUBTITLES ──────────────────────────────────────────────────────
const Subtitles: React.FC<{ frame: number }> = ({ frame }) => {
  const sub = SUBS.find(s => frame >= s.f && frame <= s.t);
  if (!sub) return null;

  const spr = spring({ frame: frame - sub.f, fps: FPS, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ top: H * 0.75, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        transform: `scale(${spr})`,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: '20px 40px',
        borderRadius: '20px',
        border: `2px solid ${GOLD}`,
        textAlign: 'center',
        maxWidth: '80%',
      }}>
        <div style={{ color: WHITE, fontSize: 48, fontWeight: 'bold', fontFamily: 'sans-serif' }}>
          {sub.h}
        </div>
        <div style={{ color: TEAL, fontSize: 24, marginTop: 10, fontFamily: 'monospace' }}>
          {sub.r}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── SCENE 1: HOOK (Falling) ───────────────────────────────────────
const SceneHook: React.FC<{ frame: number }> = ({ frame }) => {
  const shake = interpolate(frame, [300, 480], [0, 20]);
  const fall = interpolate(frame, [400, 480], [0, 500], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ transform: `translate(${sr(frame)*shake}px, ${sr(frame+1)*shake + fall}px)` }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute' }}>
        <rect x={CX-200} y={CY-300} width={400} height={600} fill={WHITE} opacity={0.2} />
        <text x={CX} y={CY} textAnchor="middle" fontSize={60} fill={WHITE}>SLEEPING...</text>
        {frame > 400 && <text x={CX} y={CY + 150} textAnchor="middle" fontSize={100} fill={RED} fontWeight="bold">FALLING!!</text>}
      </svg>
    </AbsoluteFill>
  );
};

// ── SCENE 2-3: MECHANISM ──────────────────────────────────────────
const SceneMechanism: React.FC<{ frame: number }> = ({ frame }) => {
  const lf = frame - T.S02_S;
  const relax = interpolate(lf, [0, 300], [0, 1]);
  
  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute' }}>
        <circle cx={CX} cy={CY-200} r={150} fill={GOLD} opacity={0.3} />
        <text x={CX} y={CY+200} textAnchor="middle" fontSize={50} fill={WHITE}>MUSCLES RELAXING...</text>
        <rect x={CX-150} y={CY+250} width={300} height={40} fill={TEAL} transform={`scaleX(${relax})`} />
        
        {lf > 500 && (
          <g transform={`translate(${CX}, ${CY-200})`}>
            <text x={0} y={0} textAnchor="middle" fontSize={80} fill={RED}>CONFUSED!</text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ── SCENE 4: SHOCK ───────────────────────────────────────────────
const SceneShock: React.FC<{ frame: number }> = ({ frame }) => {
  const lf = frame - T.S04_S;
  const shock = (lf % 10 < 5) ? 1 : 0.2;

  return (
    <AbsoluteFill style={{ backgroundColor: shock > 0.5 ? '#222' : BG }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute' }}>
        <text x={CX} y={CY} textAnchor="middle" fontSize={120} fill={GOLD} fontWeight="bold" 
              style={{ transform: `scale(${1 + sr(frame)*0.5})` }}>
          ELECTRIC SHOCK!
        </text>
        {[...Array(10)].map((_, i) => (
          <line key={i} x1={sr(i)*W} y1={0} x2={sr(i+1)*W} y2={H} stroke={GOLD} strokeWidth={5} opacity={shock} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// ── SCENE 5-7: OUTRO ──────────────────────────────────────────────
const SceneOutro: React.FC<{ frame: number }> = ({ frame }) => {
  const lf = frame - T.S05_S;
  const spr = spring({ frame: lf, fps: FPS });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `scale(${spr})`, textAlign: 'center' }}>
        <div style={{ fontSize: 100, color: GOLD }}>🧠🛡️</div>
        <div style={{ fontSize: 60, color: WHITE, marginTop: 40 }}>SAVING YOU!</div>
      </div>
      {frame > T.S07_S && (
        <div style={{ marginTop: 100, fontSize: 40, color: TEAL }}>SUBSCRIBE</div>
      )}
    </AbsoluteFill>
  );
};
