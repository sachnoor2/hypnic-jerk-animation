import { AbsoluteFill, useCurrentFrame, spring, interpolate } from 'remotion';
import React from 'react';

// ═══════════════════════════════════════════════════════════════
//  HYPNIC JERK — Hindi Science Short
//  Canvas : 1080 × 1920  |  60 fps  |  2700 frames (45 s)
//  Style  : Zack D. Films × 3Blue1Brown × Kurzgesagt
// ═══════════════════════════════════════════════════════════════

// ── CANVAS ──
const W   = 1080;
const H   = 1920;
const CX  = W / 2;   // 540
const FPS = 60;

// ── COLORS ──
const BG    = '#0E1117';
const GOLD  = '#FDCB6E';
const TEAL  = '#00CEC9';
const CORAL = '#E17055';
const LIME  = '#55EFC4';
const PURP  = '#A29BFE';
const WHITE = '#DFE6E9';
const RED   = '#FF7675';

// ── SCENE TIMELINE  (frames) ──
const T = {
  HOOK_S:  0,    HOOK_E:  180,
  SET_S:   150,  SET_E:   540,
  MECH_S:  510,  MECH_E:  1440,
  PROOF_S: 1400, PROOF_E: 1980,
  TWIST_S: 1940, TWIST_E: 2520,
  OUTRO_S: 2480, OUTRO_E: 2700,
  TOTAL:   2700,
};

// ── SEEDED RANDOM (no Math.random ever) ──
const sr = (seed: number) => {
  const x = Math.sin(seed + 1.618) * 43758.5453;
  return x - Math.floor(x);
};

// ── EASING ──
const eo3 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ── SPRING SHORTHAND ──
const sp = (f: number, stiff = 120, damp = 14) =>
  spring({ frame: f, fps: FPS, config: { stiffness: stiff, damping: damp } });

// ── SCREEN SHAKE EVENTS ──
const SHAKES = [
  { at: 0,    mag: 20, decay: 38 },
  { at: 515,  mag: 10, decay: 28 },
  { at: 1050, mag: 22, decay: 42 },
  { at: 1950, mag: 14, decay: 32 },
];
function shake(frame: number) {
  let dx = 0, dy = 0;
  for (const ev of SHAKES) {
    const lf = frame - ev.at;
    if (lf >= 0 && lf < ev.decay) {
      const m = ev.mag * Math.exp(-lf * 0.14);
      dx += (sr(frame * 3.3 + ev.at) - 0.5) * 2 * m;
      dy += (sr(frame * 2.6 + ev.at + 1) - 0.5) * m * 0.55;
    }
  }
  return { dx, dy };
}

// ── HINDI SUBTITLE DATA ──
const SUBS = [
  { f: 8,    t: 160,  h: 'सोते वक्त गिरने का एहसास...',            r: 'Sote waqt girne ka ehsaas...' },
  { f: 190,  t: 410,  h: 'शरीर ढीला पड़ता है — आँखें बंद होती हैं।', r: 'Shareer dheela padta hai — aankhein band.' },
  { f: 430,  t: 620,  h: 'तभी brain एक गलती करता है।',              r: 'Tabhi brain ek galti karta hai.' },
  { f: 640,  t: 870,  h: 'Muscles relax होते ही — brain alarm बजाता है!', r: 'Muscles relax hote hi — brain alarm!' },
  { f: 890,  t: 1110, h: '"हम गिर रहे हैं!" — यही brain सोचता है।', r: '"Hum gir rahe hain!" — brain sochta hai.' },
  { f: 1130, t: 1380, h: 'तुरंत पूरे शरीर में emergency signal!',   r: 'Emergency signal shoots down the spine!' },
  { f: 1460, t: 1690, h: '70% लोग इसे हर रात feel करते हैं।',       r: '70% log ise har raat feel karte hain.' },
  { f: 1710, t: 1940, h: 'यह बीमारी नहीं — यह evolution है।',        r: 'Yeh bimari nahi — yeh evolution hai.' },
  { f: 1970, t: 2190, h: 'लाखों साल पहले... हम पेड़ों पर सोते थे।', r: 'Laakhon saal pehle — hum pedon par sote the.' },
  { f: 2210, t: 2420, h: 'Muscles relax = brain: "पेड़ से गिर रहे हैं!"', r: 'Brain fires: "We\'re falling from the tree!"' },
  { f: 2440, t: 2590, h: 'वो reflex आज भी तुम्हारे अंदर जिंदा है।', r: 'That reflex is still alive inside you.' },
  { f: 2620, t: 2688, h: 'क्या आज रात तुम्हें यह एहसास होगा? 😏',  r: 'Will you feel it tonight?' },
];

// ── PHASE INFO ──
function phase(f: number): { name: string; col: string } {
  if (f < T.HOOK_E)  return { name: 'HOOK',      col: GOLD };
  if (f < T.SET_E)   return { name: 'SETUP',     col: TEAL };
  if (f < T.MECH_E)  return { name: 'MECHANISM', col: CORAL };
  if (f < T.PROOF_E) return { name: 'PROOF',     col: LIME };
  if (f < T.TWIST_E) return { name: 'TWIST',     col: PURP };
  return                    { name: 'OUTRO',     col: GOLD };
}

// ═══════════════════════════════════════════════════════════════
//  SVG DEFS
// ═══════════════════════════════════════════════════════════════
const Defs: React.FC = () => (
  <defs>
    <filter id="g3b1b" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="gcrisp" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="ghalo" x="-120%" y="-120%" width="340%" height="340%">
      <feGaussianBlur stdDeviation="38"/>
    </filter>
    <filter id="gkurz" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.55"/>
    </filter>

    <radialGradient id="bg-neb" cx="50%" cy="35%" r="65%">
      <stop offset="0%"   stopColor={TEAL}  stopOpacity="0.07"/>
      <stop offset="55%"  stopColor={PURP}  stopOpacity="0.03"/>
      <stop offset="100%" stopColor={BG}    stopOpacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="50%" r="70%">
      <stop offset="40%" stopColor="transparent"/>
      <stop offset="100%" stopColor="#000"  stopOpacity="0.72"/>
    </radialGradient>
    <linearGradient id="title-g" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stopColor={GOLD}/>
      <stop offset="50%"  stopColor={WHITE}/>
      <stop offset="100%" stopColor={CORAL}/>
    </linearGradient>
    <pattern id="scan" x="0" y="0" width={W} height="3" patternUnits="userSpaceOnUse">
      <rect width={W} height="1" fill="#fff" opacity="0.013"/>
    </pattern>
  </defs>
);

// ═══════════════════════════════════════════════════════════════
//  BACKGROUND
// ═══════════════════════════════════════════════════════════════
const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const stars = Array.from({ length: 150 }, (_, i) => ({
    x:  sr(i * 4 + 1) * W,
    y:  sr(i * 4 + 2) * H,
    r:  0.7 + sr(i * 4 + 3) * 1.8,
    sp: 0.3 + sr(i * 4 + 4) * 1.4,
    ph: sr(i * 4) * Math.PI * 2,
  }));

  return (
    <g>
      <rect width={W} height={H} fill={BG}/>
      <rect width={W} height={H} fill="url(#bg-neb)"/>
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={WHITE}
          opacity={0.25 + Math.sin(frame * s.sp * 0.05 + s.ph) * 0.14}/>
      ))}
      <rect width={W} height={H} fill="url(#vig)"/>
      <rect width={W} height={H} fill="url(#scan)"/>
    </g>
  );
};

// ═══════════════════════════════════════════════════════════════
//  HUD  (header + phase chip + timeline)
// ═══════════════════════════════════════════════════════════════
const HUD: React.FC<{ frame: number }> = ({ frame }) => {
  const ph = phase(frame);
  const slide = interpolate(frame, [0, 22], [-100, 0], { extrapolateRight: 'clamp' });
  const prog  = frame / T.TOTAL;

  return (
    <g>
      {/* Header bar */}
      <g transform={`translate(0,${slide})`}>
        <rect width={W} height={100} fill={BG + 'CC'}/>
        <rect y={97} width={W} height={3} fill={ph.col} opacity={0.9}/>
        <text x={CX} y={46} textAnchor="middle"
          fontFamily="'Impact','Arial Black',sans-serif"
          fontWeight="900" fontSize={26} fill={WHITE} letterSpacing={3}>
          HYPNIC JERK
        </text>
        <text x={CX} y={76} textAnchor="middle"
          fontFamily="'Courier New',monospace"
          fontSize={15} fill={ph.col} opacity={0.85} letterSpacing={6}>
          {ph.name}
        </text>
      </g>
      {/* Phase chip */}
      <rect x={32} y={118} width={210} height={40} rx={8}
        fill={ph.col + '1A'} stroke={ph.col} strokeWidth={1.5}/>
      <text x={137} y={143} textAnchor="middle"
        fontFamily="'Courier New',monospace"
        fontSize={14} fill={ph.col} fontWeight={700} letterSpacing={3}>
        ▶ {ph.name}
      </text>
      {/* Timeline bar */}
      <rect x={60} y={H - 50} width={W - 120} height={5} rx={2.5} fill={WHITE + '18'}/>
      <rect x={60} y={H - 50} width={(W - 120) * prog} height={5} rx={2.5} fill={ph.col}/>
      <circle cx={60 + (W - 120) * prog} cy={H - 47} r={7} fill={ph.col}/>
    </g>
  );
};

// ═══════════════════════════════════════════════════════════════
//  HINDI SUBTITLES
// ═══════════════════════════════════════════════════════════════
const HindiSubs: React.FC<{ frame: number }> = ({ frame }) => {
  const active = SUBS.find(s => frame >= s.f && frame < s.t);
  if (!active) return null;

  const lf  = frame - active.f;
  const dur = active.t - active.f;
  const fi  = interpolate(lf, [0, 12], [0, 1],        { extrapolateRight: 'clamp' });
  const fo  = interpolate(lf, [dur - 16, dur], [1, 0], { extrapolateRight: 'clamp' });
  const op  = Math.min(fi, fo);
  const dy  = interpolate(sp(lf, 80, 14), [0, 1], [20, 0]);

  return (
    <g opacity={op} transform={`translate(0,${dy})`}>
      <rect x={44} y={H - 390} width={W - 88} height={155} rx={16}
        fill={BG + 'EE'} stroke={GOLD} strokeWidth={1.5}/>
      <text x={CX} y={H - 338} textAnchor="middle"
        fontFamily="serif" fontSize={33} fill={WHITE} fontWeight={600}>
        {active.h}
      </text>
      <text x={CX} y={H - 294} textAnchor="middle"
        fontFamily="'Courier New',monospace" fontSize={17}
        fill={GOLD} opacity={0.6} fontStyle="italic">
        {active.r}
      </text>
    </g>
  );
};

// ═══════════════════════════════════════════════════════════════
//  SCENE 1 — HOOK  (0–180)
//  Impossible claim slammed on screen in first 3 seconds
// ═══════════════════════════════════════════════════════════════
const SceneHook: React.FC<{ frame: number }> = ({ frame }) => {
  const lf = frame - T.HOOK_S;
  if (lf < 0) return null;
  const dur    = T.HOOK_E - T.HOOK_S;
  const exitOp = interpolate(lf, [dur - 30, dur], [1, 0], { extrapolateRight: 'clamp' });

  // Impact flash
  const flash = interpolate(lf, [0, 1, 9], [0, 0.88, 0], { extrapolateRight: 'clamp' });

  // Pulsing shock ring
  const ringR  = interpolate(lf, [2, 100], [0, 480],  { extrapolateRight: 'clamp' });
  const ringOp = interpolate(lf, [2, 20, 100], [0, 0.2, 0], { extrapolateRight: 'clamp' });

  // Words stagger in — SLAM spring
  const words = ['सोते वक्त', 'गिरने का', 'एहसास...'];
  const wY    = [590, 720, 850];

  // Sub-hook
  const subOp = interpolate(lf, [90, 120], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <g opacity={exitOp}>
      {/* Flash frame */}
      <rect width={W} height={H} fill={WHITE} opacity={flash}/>

      {/* Shock ring */}
      <ellipse cx={CX} cy={720} rx={ringR} ry={ringR * 0.58}
        fill="none" stroke={GOLD} strokeWidth={4} opacity={ringOp}/>

      {/* Slam words */}
      {words.map((w, i) => {
        const wSp = sp(Math.max(0, lf - i * 16), 200, 11);
        const wOp = interpolate(wSp, [0, 1], [0, 1]);
        const wSc = interpolate(wSp, [0, 1], [1.6, 1]);
        return (
          <g key={i} transform={`translate(${CX},${wY[i]})`} opacity={wOp}>
            <g transform={`scale(${wSc},1)`}>
              <text x={0} y={0} textAnchor="middle"
                fontFamily="'Impact','Arial Black',sans-serif"
                fontWeight="900" fontSize={96}
                fill="url(#title-g)" filter="url(#g3b1b)" letterSpacing={2}>
                {w}
              </text>
            </g>
          </g>
        );
      })}

      {/* "— brain की गलती है —" */}
      <g opacity={subOp}>
        <text x={CX} y={985} textAnchor="middle"
          fontFamily="'Courier New',monospace"
          fontSize={34} fill={CORAL} letterSpacing={3} filter="url(#gcrisp)">
          — brain की गलती है —
        </text>
      </g>
    </g>
  );
};

// ═══════════════════════════════════════════════════════════════
//  SCENE 2 — SETUP  (150–540)
//  Person sleeping, brain glowing
// ═══════════════════════════════════════════════════════════════
const SceneSetup: React.FC<{ frame: number }> = ({ frame }) => {
  const lf = frame - T.SET_S;
  if (lf < 0) return null;
  const dur    = T.SET_E - T.SET_S;
  const exitOp = interpolate(lf, [dur - 40, dur], [1, 0], { extrapolateRight: 'clamp' });
  const enOp   = interpolate(lf, [0, 30], [0, 1],         { extrapolateRight: 'clamp' });
  const op     = Math.min(enOp, exitOp);

  // Gentle breathing
  const breathe = Math.sin(lf * 0.035) * 5;

  // Brain pulse glow
  const brainPulse = 0.08 + Math.sin(lf * 0.045) * 0.04;
  const brainOp    = interpolate(lf, [80, 130], [0, 1], { extrapolateRight: 'clamp' });

  // Z letters
  const zData = [
    { delay: 0, xOff: -70, sz: 32 },
    { delay: 45, xOff: -20, sz: 24 },
    { delay: 90, xOff: 30,  sz: 18 },
  ];

  return (
    <g opacity={op}>
      {/* ── BED & PERSON (Y ≈ 820–960, animation zone) ── */}
      {/* Bed headboard */}
      <rect x={CX - 290} y={820} width={580} height={28} rx={12}
        fill="#3A2A20" opacity={0.85}/>
      {/* Mattress */}
      <rect x={CX - 270} y={848} width={540} height={110} rx={18}
        fill="#1E2D4A" opacity={0.92}/>
      {/* Pillow */}
      <ellipse cx={CX - 110} cy={870} rx={94} ry={30}
        fill={WHITE} opacity={0.12}/>
      {/* Blanket folds */}
      <path d={`M ${CX-270} 880 Q ${CX} 860 ${CX+270} 880
                L ${CX+270} 958 Q ${CX} 975 ${CX-270} 958 Z`}
        fill="#163256" opacity={0.75}/>
      {/* Blanket top fold detail */}
      <path d={`M ${CX-270} 880 Q ${CX} 865 ${CX+270} 880`}
        stroke="#1a4a8a" strokeWidth={3} fill="none" opacity={0.5}/>

      {/* Person — breathing */}
      <g transform={`translate(0,${breathe})`}>
        {/* Head */}
        <ellipse cx={CX - 160} cy={856} rx={38} ry={34}
          fill="#C4956A"/>
        {/* Hair */}
        <ellipse cx={CX - 160} cy={836} rx={40} ry={20}
          fill="#3A2520"/>
        {/* Face details */}
        {/* Closed eye line */}
        <path d={`M ${CX - 173} ${854} Q ${CX - 163} ${850} ${CX - 152} ${854}`}
          stroke="#7A5438" strokeWidth={2} fill="none"/>
        <path d={`M ${CX - 173} ${862} Q ${CX - 163} ${858} ${CX - 152} ${862}`}
          stroke="#7A5438" strokeWidth={2} fill="none"/>
        {/* Nose */}
        <ellipse cx={CX - 160} cy={869} rx={4} ry={3} fill="#A87456" opacity={0.6}/>
        {/* Body under blanket bump */}
        <path d={`M ${CX-130} 885 Q ${CX+80} 870 ${CX+250} 880`}
          stroke="#C4956A" strokeWidth={28} strokeLinecap="round" fill="none" opacity={0.18}/>
      </g>

      {/* Z letters floating upward */}
      {zData.map((z, i) => {
        const zBase = Math.max(0, lf - z.delay);
        const zPhase = (zBase * 0.55) % 200;
        const zy   = 830 - 60 - zPhase;
        const zOp  = interpolate(zPhase, [0, 20, 160, 200], [0, 0.75, 0.75, 0]);
        const zx   = CX + z.xOff + Math.sin(zBase * 0.04 + i * 1.5) * 14;
        return (
          <text key={i} x={zx} y={zy} textAnchor="middle"
            fontFamily="'Impact','Arial Black',sans-serif"
            fontSize={z.sz} fill={TEAL} opacity={zOp} filter="url(#gcrisp)">
            Z
          </text>
        );
      })}

      {/* ── BRAIN (Y ≈ 400–680) ── */}
      <g opacity={brainOp}>
        {/* Halo */}
        <ellipse cx={CX} cy={530} rx={135} ry={115}
          fill={GOLD} opacity={brainPulse} filter="url(#ghalo)"/>
        {/* Brain shape */}
        <path d={`
          M ${CX} 440
          C ${CX+88} 428, ${CX+140} 462, ${CX+128} 516
          C ${CX+150} 548, ${CX+116} 606, ${CX+64} 618
          C ${CX+32} 628, ${CX} 620, ${CX} 614
          C ${CX} 620, ${CX-32} 628, ${CX-64} 618
          C ${CX-116} 606, ${CX-150} 548, ${CX-128} 516
          C ${CX-140} 462, ${CX-88} 428, ${CX} 440 Z
        `}
          fill={GOLD + '22'} stroke={GOLD} strokeWidth={3}
          filter="url(#g3b1b)"/>
        {/* Wrinkle lines */}
        <path d={`M ${CX-28} 462 C ${CX+8} 484, ${CX+44} 462, ${CX+68} 498`}
          stroke={GOLD} strokeWidth={2.2} fill="none" opacity={0.55}/>
        <path d={`M ${CX-68} 520 C ${CX-32} 538, ${CX+12} 520, ${CX+52} 538`}
          stroke={GOLD} strokeWidth={2.2} fill="none" opacity={0.55}/>
        <path d={`M ${CX-90} 568 C ${CX-55} 582, ${CX-8} 568, ${CX+38} 582`}
          stroke={GOLD} strokeWidth={2.2} fill="none" opacity={0.55}/>
        {/* Brain label — object-bound, part of animation */}
        <text x={CX} y={672} textAnchor="middle"
          fontFamily="'Courier New',monospace"
          fontSize={22} fill={GOLD} letterSpacing={5} opacity={0.8}>
          BRAIN
        </text>
      </g>

      {/* Bottom panel — muscle info */}
      {lf > 170 && (
        <g opacity={interpolate(lf, [170, 210], [0, 1], { extrapolateRight: 'clamp' })}>
          <rect x={CX - 190} y={H - 365} width={380} height={58} rx={12}
            fill={TEAL + '18'} stroke={TEAL} strokeWidth={2}/>
          <text x={CX} y={H - 330} textAnchor="middle"
            fontFamily="'Courier New',monospace"
            fontSize={22} fill={TEAL} fontWeight={700}>
            muscles → relax ✓
          </text>
        </g>
      )}
    </g>
  );
};

// ═══════════════════════════════════════════════════════════════
//  SCENE 3 — MECHANISM  (510–1440)
//  Brain alarm → signal → body jerk
// ═══════════════════════════════════════════════════════════════
const SceneMechanism: React.FC<{ frame: number }> = ({ frame }) => {
  const lf = frame - T.MECH_S;
  if (lf < 0) return null;
  const dur    = T.MECH_E - T.MECH_S;
  const exitOp = interpolate(lf, [dur - 40, dur], [1, 0], { extrapolateRight: 'clamp' });
  const enOp   = interpolate(lf, [0, 30], [0, 1],          { extrapolateRight: 'clamp' });
  const op     = Math.min(enOp, exitOp);

  const brainY   = 390;
  const alarming = lf >= 60 && lf < 540;

  // Brain alarm pulse
  const alarmPulse = alarming ? 0.5 + Math.sin(lf * 0.22) * 0.3 : 0.3;
  const ringBeat   = alarming ? Math.sin(lf * 0.18) : 0;

  // Signal phase  (lf 240–540)
  const sigActive = lf >= 240 && lf < 680;

  // Jerk moment  (lf ~540)
  const jerkLf    = Math.max(0, lf - 540);
  const jerkFlash = lf >= 540 ? interpolate(jerkLf, [0, 1, 14], [0, 0.92, 0], { extrapolateRight: 'clamp' }) : 0;
  const jerkBody  = lf >= 540 ? 1 + Math.sin(jerkLf * 0.28) * Math.exp(-jerkLf * 0.045) * 0.18 : 1;

  // Recovery label  (lf >840)
  const recOp = lf > 840 ? interpolate(lf, [840, 880], [0, 1], { extrapolateRight: 'clamp' }) : 0;

  return (
    <g opacity={op}>
      {/* Jerk flash */}
      <rect width={W} height={H} fill={CORAL} opacity={jerkFlash}/>

      {/* ── BRAIN ── */}
      <g transform={`translate(${CX},${brainY})`}>
        {/* Alarm halo */}
        {alarming && (
          <ellipse cx={0} cy={0} rx={140 + ringBeat * 12} ry={118 + ringBeat * 10}
            fill={RED} opacity={0.07 * alarmPulse} filter="url(#ghalo)"/>
        )}
        {/* Alarm expanding rings */}
        {alarming && [0, 1, 2].map(ri => {
          const rf   = (lf - ri * 35) % 120;
          const rRad = rf > 0 ? interpolate(rf, [0, 120], [70, 260]) : 0;
          const rOp  = rf > 0 ? interpolate(rf, [0, 8, 120], [0, 0.55, 0]) : 0;
          return (
            <ellipse key={ri} cx={0} cy={0} rx={rRad} ry={rRad * 0.68}
              fill="none" stroke={RED} strokeWidth={2.5} opacity={rOp}/>
          );
        })}
        {/* Brain body */}
        <path d={`
          M 0 -80 C 75 -92, 128 -58, 116 -10
          C 138 22, 106 72, 56 82
          C 28 92, 0 84, 0 78
          C 0 84, -28 92, -56 82
          C -106 72, -138 22, -116 -10
          C -128 -58, -75 -92, 0 -80 Z
        `}
          fill={alarming ? RED + '28' : GOLD + '22'}
          stroke={alarming ? RED : GOLD}
          strokeWidth={3} filter="url(#g3b1b)"/>
        {/* Wrinkles */}
        <path d={`M -22 -54 C 12 -34, 46 -54, 68 -24`}
          stroke={alarming ? RED : GOLD} strokeWidth={2} fill="none" opacity={0.55}/>
        <path d={`M -54 4 C -22 20, 18 4, 50 20`}
          stroke={alarming ? RED : GOLD} strokeWidth={2} fill="none" opacity={0.55}/>
        {/* Exclamation */}
        {alarming && (
          <text x={0} y={-10} textAnchor="middle"
            fontFamily="'Impact','Arial Black',sans-serif"
            fontSize={44} fill={RED} opacity={alarmPulse} filter="url(#gcrisp)">
            !
          </text>
        )}
      </g>

      {/* ── SPINE / SIGNAL PATH ── */}
      {sigActive && (
        <g>
          {/* Spine line */}
          <line x1={CX} y1={brainY + 100} x2={CX} y2={brainY + 560}
            stroke={WHITE} strokeWidth={3} opacity={0.18}
            strokeDasharray="8 7"/>
          {/* Signal nodes traveling */}
          {[0, 1, 2].map(si => {
            const sf  = Math.max(0, lf - 240 - si * 44);
            const sy  = brainY + 100 + interpolate(eo3(clamp(sf / 310, 0, 1)), [0, 1], [0, 440]);
            const sOp = interpolate(sf, [0, 10, 290, 320], [0, 0.95, 0.95, 0], { extrapolateRight: 'clamp' });
            return (
              <g key={si} opacity={sOp}>
                <circle cx={CX} cy={sy} r={13}
                  fill={CORAL} filter="url(#gcrisp)"/>
                <circle cx={CX} cy={sy} r={26}
                  fill="none" stroke={CORAL} strokeWidth={2} opacity={0.38}/>
              </g>
            );
          })}
        </g>
      )}

      {/* ── BODY JERK ── */}
      {lf >= 540 && (
        <g transform={`translate(${CX}, 1060) scale(${jerkBody}, 1)`}>
          {/* Torso arc */}
          <path d={`M -65 0 C -65 -130, 65 -130, 65 0`}
            fill={WHITE + '18'} stroke={WHITE} strokeWidth={3}
            opacity={interpolate(jerkLf, [0, 25], [0, 0.85], { extrapolateRight: 'clamp' })}/>
          {/* Head bob */}
          <ellipse cx={0} cy={-145} rx={42} ry={38}
            fill={WHITE + '28'} stroke={WHITE} strokeWidth={2}
            opacity={interpolate(jerkLf, [0, 25], [0, 0.85], { extrapolateRight: 'clamp' })}/>
          {/* JERK! label — attached to the body group */}
          <text x={0} y={60} textAnchor="middle"
            fontFamily="'Impact','Arial Black',sans-serif"
            fontSize={38} fill={CORAL} letterSpacing={3}
            opacity={interpolate(jerkLf, [20, 50], [0, 1], { extrapolateRight: 'clamp' })}>
            JERK!
          </text>
        </g>
      )}

      {/* Bottom panel — recovery */}
      <g opacity={recOp}>
        <rect x={CX - 220} y={H - 365} width={440} height={58} rx={12}
          fill={LIME + '18'} stroke={LIME} strokeWidth={2}/>
        <text x={CX} y={H - 330} textAnchor="middle"
          fontFamily="'Courier New',monospace"
          fontSize={21} fill={LIME} fontWeight={700}>
          brain → false alarm ✓
        </text>
      </g>
    </g>
  );
};

// ═══════════════════════════════════════════════════════════════
//  SCENE 4 — PROOF  (1400–1980)
//  70% stat + people visualization
// ═══════════════════════════════════════════════════════════════
const SceneProof: React.FC<{ frame: number }> = ({ frame }) => {
  const lf = frame - T.PROOF_S;
  if (lf < 0) return null;
  const dur    = T.PROOF_E - T.PROOF_S;
  const exitOp = interpolate(lf, [dur - 40, dur], [1, 0], { extrapolateRight: 'clamp' });
  const enOp   = interpolate(lf, [0, 30], [0, 1],          { extrapolateRight: 'clamp' });
  const op     = Math.min(enOp, exitOp);

  const statSp = sp(Math.max(0, lf - 25), 80, 14);
  const statOp = interpolate(statSp, [0, 1], [0, 1]);
  const statSc = interpolate(statSp, [0, 1], [0.65, 1]);

  const TOTAL_P  = 10;
  const ACTIVE_P = 7;

  const dailyOp = lf > 220 ? interpolate(lf, [220, 260], [0, 1], { extrapolateRight: 'clamp' }) : 0;

  return (
    <g opacity={op}>
      {/* ── BIG 70% ── */}
      <g transform={`translate(${CX},520) scale(${statSc})`} opacity={statOp}>
        <text x={0} y={0} textAnchor="middle"
          fontFamily="'Impact','Arial Black',sans-serif"
          fontWeight="900" fontSize={170} fill={GOLD}
          filter="url(#g3b1b)" letterSpacing={6}>
          70%
        </text>
        <text x={0} y={62} textAnchor="middle"
          fontFamily="'Courier New',monospace"
          fontSize={28} fill={WHITE} opacity={0.72} letterSpacing={2}>
          लोग इसे experience करते हैं
        </text>
      </g>

      {/* ── PEOPLE ICONS ── */}
      {lf > 70 && (
        <g>
          {Array.from({ length: TOTAL_P }, (_, i) => {
            const px   = CX - 225 + i * 52;
            const py   = 800;
            const isAc = i < ACTIVE_P;
            const pSp  = sp(Math.max(0, lf - 90 - i * 14), 100, 14);
            const pOp  = interpolate(pSp, [0, 1], [0, 1]);
            const pSc  = interpolate(pSp, [0, 1], [0, 1]);
            const pCol = isAc ? CORAL : WHITE + '30';
            const pStr = isAc ? CORAL : WHITE + '40';
            return (
              <g key={i} transform={`translate(${px},${py}) scale(${pSc})`} opacity={pOp}>
                {/* Head */}
                <circle cx={0} cy={-32} r={15} fill={pCol} stroke={pStr} strokeWidth={2}/>
                {/* Body */}
                <path d={`M -12 -16 L -13 22 L 13 22 L 12 -16 Z`} fill={pCol} opacity={0.7}/>
                {/* Jerk bolt on active */}
                {isAc && (
                  <text x={0} y={-55} textAnchor="middle"
                    fontFamily="'Impact','Arial Black',sans-serif"
                    fontSize={15} fill={RED}
                    opacity={0.75 + Math.sin(lf * 0.1 + i * 0.9) * 0.25}>
                    ⚡
                  </text>
                )}
              </g>
            );
          })}
        </g>
      )}

      {/* Bottom panel */}
      <g opacity={dailyOp}>
        <rect x={CX - 210} y={H - 365} width={420} height={58} rx={12}
          fill={PURP + '18'} stroke={PURP} strokeWidth={2}/>
        <text x={CX} y={H - 330} textAnchor="middle"
          fontFamily="'Courier New',monospace"
          fontSize={21} fill={PURP} fontWeight={700}>
          10% → हर रात  |  रोज़
        </text>
      </g>
    </g>
  );
};

// ═══════════════════════════════════════════════════════════════
//  SCENE 5 — TWIST  (1940–2520)
//  Evolutionary origin — primate in a tree
// ═══════════════════════════════════════════════════════════════
const SceneTwist: React.FC<{ frame: number }> = ({ frame }) => {
  const lf = frame - T.TWIST_S;
  if (lf < 0) return null;
  const dur    = T.TWIST_E - T.TWIST_S;
  const exitOp = interpolate(lf, [dur - 40, dur], [1, 0], { extrapolateRight: 'clamp' });
  const enOp   = interpolate(lf, [0, 30], [0, 1],          { extrapolateRight: 'clamp' });
  const op     = Math.min(enOp, exitOp);

  // Entry flash
  const flash = interpolate(lf, [0, 1, 12], [0, 0.72, 0], { extrapolateRight: 'clamp' });

  // Tree appear
  const treeOp = interpolate(lf, [18, 65], [0, 1], { extrapolateRight: 'clamp' });

  // Primate sway
  const sway = Math.sin(lf * 0.04) * 9;

  // Micro-fall + jerk-back
  const primateFall = lf > 200 ? interpolate(Math.max(0, lf - 200), [0, 42], [0, 90], { extrapolateRight: 'clamp' }) : 0;
  const jerkBack    = lf > 242 ? interpolate(Math.max(0, lf - 242), [0, 32], [0, -90], { extrapolateRight: 'clamp' }) : 0;
  const primateY    = 570 + primateFall + jerkBack;

  // Twist headline
  const twistOp = lf > 300 ? interpolate(lf, [300, 340], [0, 1], { extrapolateRight: 'clamp' }) : 0;
  const eqOp    = lf > 420 ? interpolate(lf, [420, 460], [0, 1], { extrapolateRight: 'clamp' }) : 0;

  const leaves: [number, number, number, number][] = [
    [CX,     450, 58, 42],
    [CX-108, 470, 50, 36],
    [CX+96,  460, 52, 38],
    [CX-62,  410, 44, 32],
    [CX+54,  402, 46, 34],
    [CX-148, 514, 44, 30],
    [CX+134, 496, 46, 32],
  ];

  return (
    <g opacity={op}>
      {/* Flash */}
      <rect width={W} height={H} fill={GOLD} opacity={flash}/>

      {/* ── TREE ── */}
      <g opacity={treeOp}>
        {/* Trunk */}
        <rect x={CX - 20} y={700} width={40} height={310} rx={10}
          fill="#5D4037" opacity={0.82}/>
        {/* Branches */}
        <path d={`M ${CX} 700 L ${CX-128} 555 M ${CX} 700 L ${CX+108} 538
                  M ${CX} 640 L ${CX-84} 496 M ${CX} 660 L ${CX+126} 510`}
          stroke="#5D4037" strokeWidth={22} strokeLinecap="round" fill="none" opacity={0.72}/>
        {/* Leaves */}
        {leaves.map(([lx, ly, rx2, ry2], i) => (
          <ellipse key={i} cx={lx} cy={ly} rx={rx2} ry={ry2}
            fill="#2E7D32" opacity={0.45 + sr(i * 3 + 2) * 0.28}/>
        ))}
      </g>

      {/* "लाखों साल पहले..." headline */}
      <text x={CX} y={310} textAnchor="middle"
        fontFamily="'Impact','Arial Black',sans-serif"
        fontWeight="900" fontSize={50} fill={GOLD}
        filter="url(#g3b1b)" letterSpacing={2}
        opacity={interpolate(lf, [30, 65], [0, 1], { extrapolateRight: 'clamp' })}>
        लाखों साल पहले...
      </text>

      {/* ── PRIMATE ── */}
      {lf > 50 && (
        <g transform={`translate(${CX + sway}, ${primateY})`}
          opacity={interpolate(lf, [50, 90], [0, 1], { extrapolateRight: 'clamp' })}>
          {/* Tail */}
          <path d={`M 18 30 C 60 55, 65 90, 40 100`}
            stroke="#8D6E63" strokeWidth={10} fill="none" strokeLinecap="round"/>
          {/* Body */}
          <ellipse cx={0} cy={0} rx={30} ry={36} fill="#8D6E63"/>
          {/* Head */}
          <circle cx={0} cy={-46} r={24} fill="#8D6E63"/>
          {/* Ears */}
          <circle cx={-22} cy={-52} r={9} fill="#8D6E63"/>
          <circle cx={22}  cy={-52} r={9} fill="#8D6E63"/>
          {/* Eyes — closed when asleep, wide when jerk */}
          {lf < 200 ? (
            <>
              <path d={`M -9 -48 Q -4 -52 1 -48`} stroke="#3A2210" strokeWidth={2.5} fill="none"/>
              <path d={`M 3 -48 Q 8 -52 13 -48`}  stroke="#3A2210" strokeWidth={2.5} fill="none"/>
            </>
          ) : (
            <>
              <circle cx={-5} cy={-49} r={5} fill="#111"/>
              <circle cx={8}  cy={-49} r={5} fill="#111"/>
            </>
          )}
          {/* Arms grabbing branch */}
          <path d={`M -30 -14 L -66 -36`} stroke="#8D6E63" strokeWidth={11} strokeLinecap="round"/>
          <path d={`M  30 -14 L  66 -36`} stroke="#8D6E63" strokeWidth={11} strokeLinecap="round"/>
          {/* Zzz */}
          {lf < 200 && (
            <text x={38} y={-62} fontFamily="'Impact','Arial Black',sans-serif"
              fontSize={24} fill={TEAL}
              opacity={0.65 + Math.sin(lf * 0.07) * 0.3}>z</text>
          )}
          {/* Alert ! */}
          {lf >= 200 && lf < 340 && (
            <text x={0} y={-84} textAnchor="middle"
              fontFamily="'Impact','Arial Black',sans-serif"
              fontSize={40} fill={CORAL}
              filter="url(#gcrisp)">!</text>
          )}
        </g>
      )}

      {/* Twist reveal headline */}
      <g opacity={twistOp}>
        <text x={CX} y={1080} textAnchor="middle"
          fontFamily="'Impact','Arial Black',sans-serif"
          fontWeight="900" fontSize={48} fill={LIME}
          filter="url(#gcrisp)">
          पेड़ से गिरने का डर
        </text>
        <text x={CX} y={1145} textAnchor="middle"
          fontFamily="'Courier New',monospace"
          fontSize={28} fill={WHITE} opacity={0.68}>
          आज भी तुम्हारे अंदर है
        </text>
      </g>

      {/* Bottom equation panel */}
      <g opacity={eqOp}>
        <rect x={CX - 278} y={H - 365} width={556} height={58} rx={12}
          fill={PURP + '18'} stroke={PURP} strokeWidth={2}/>
        <text x={CX} y={H - 330} textAnchor="middle"
          fontFamily="'Courier New',monospace"
          fontSize={20} fill={PURP} fontWeight={700}>
          relax → brain = FALL DETECTED 🌳
        </text>
      </g>
    </g>
  );
};

// ═══════════════════════════════════════════════════════════════
//  SCENE 6 — OUTRO  (2480–2700)
//  Comment trigger + soft CTA
// ═══════════════════════════════════════════════════════════════
const SceneOutro: React.FC<{ frame: number }> = ({ frame }) => {
  const lf = frame - T.OUTRO_S;
  if (lf < 0) return null;
  const dur    = T.OUTRO_E - T.OUTRO_S;
  const exitOp = interpolate(lf, [dur - 18, dur], [1, 0], { extrapolateRight: 'clamp' });
  const enOp   = interpolate(lf, [0, 28], [0, 1],          { extrapolateRight: 'clamp' });
  const op     = Math.min(enOp, exitOp);

  const floatY = Math.sin(lf * 0.055) * 11;

  const lines = [
    { txt: 'क्या आज रात',   col: WHITE,  sz: 56 },
    { txt: 'तुम्हें यह',       col: GOLD,   sz: 72 },
    { txt: 'एहसास होगा?', col: CORAL,  sz: 56 },
  ];

  const ctaOp  = lf > 90  ? interpolate(lf, [90,  118], [0, 1], { extrapolateRight: 'clamp' }) : 0;
  const likeOp = lf > 140 ? interpolate(lf, [140, 168], [0, 1], { extrapolateRight: 'clamp' }) : 0;

  return (
    <g opacity={op}>
      {/* Floating brain icon */}
      <g transform={`translate(${CX},${480 + floatY})`}>
        <ellipse cx={0} cy={0} rx={82} ry={70}
          fill={GOLD} opacity={0.09} filter="url(#ghalo)"/>
        <path d={`
          M 0 -62 C 52 -72, 94 -46, 84 -8
          C 100 16, 76 56, 40 64
          C 20 70, 0 63, 0 58
          C 0 63, -20 70, -40 64
          C -76 56, -100 16, -84 -8
          C -94 -46, -52 -72, 0 -62 Z
        `}
          fill={GOLD + '22'} stroke={GOLD} strokeWidth={2.5}
          filter="url(#g3b1b)"/>
        <text x={0} y={8} textAnchor="middle" fontSize={30}>😴</text>
      </g>

      {/* Staggered lines */}
      {lines.map((l, i) => {
        const lSp = sp(Math.max(0, lf - i * 24), 100, 14);
        const lOp = interpolate(lSp, [0, 1], [0, 1]);
        return (
          <text key={i} x={CX} y={700 + i * 96} textAnchor="middle"
            fontFamily="'Impact','Arial Black',sans-serif"
            fontWeight="900" fontSize={l.sz} fill={l.col}
            filter="url(#g3b1b)" letterSpacing={2} opacity={lOp}>
            {l.txt}
          </text>
        );
      })}

      {/* 💬 Comment CTA */}
      <g opacity={ctaOp}>
        <rect x={CX - 290} y={1020} width={580} height={78} rx={18}
          fill={CORAL + '22'} stroke={CORAL} strokeWidth={2.5}
          filter="url(#gkurz)"/>
        <text x={CX} y={1067} textAnchor="middle"
          fontFamily="'Courier New',monospace"
          fontSize={26} fill={WHITE} fontWeight={700} letterSpacing={1}>
          💬 Comment: हाँ या नहीं?
        </text>
      </g>

      {/* Like + Subscribe — subtle */}
      <g opacity={likeOp}>
        <text x={CX} y={1190} textAnchor="middle"
          fontFamily="'Courier New',monospace"
          fontSize={24} fill={WHITE} opacity={0.44} letterSpacing={4}>
          👍 LIKE  ·  🔔 SUBSCRIBE
        </text>
      </g>
    </g>
  );
};

// ═══════════════════════════════════════════════════════════════
//  ROOT — AnimationScene
// ═══════════════════════════════════════════════════════════════
export const AnimationScene: React.FC = () => {
  const frame     = useCurrentFrame();
  const { dx, dy } = shake(frame);

  return (
    <AbsoluteFill style={{ background: BG }}>
      <svg
        width={W}
        height={H}
        viewBox={`${-dx} ${-dy} ${W} ${H}`}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Defs/>
        <Background frame={frame}/>

        {/* Scenes render in Z order */}
        <SceneHook      frame={frame}/>
        <SceneSetup     frame={frame}/>
        <SceneMechanism frame={frame}/>
        <SceneProof     frame={frame}/>
        <SceneTwist     frame={frame}/>
        <SceneOutro     frame={frame}/>

        {/* HUD always on top */}
        <HUD      frame={frame}/>
        <HindiSubs frame={frame}/>
      </svg>
    </AbsoluteFill>
  );
};

/*
  ROOT.TSX COMPOSITION SETTINGS
  ──────────────────────────────
  import { Composition } from 'remotion';
  import { AnimationScene } from './HypnicJerk';

  export const RemotionRoot: React.FC = () => (
    <Composition
      id="HypnicJerk"
      component={AnimationScene}
      durationInFrames={2700}
      fps={60}
      width={1080}
      height={1920}
    />
  );
*/
