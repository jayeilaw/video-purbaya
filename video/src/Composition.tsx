import {
  AbsoluteFill, Easing, Img, Sequence, interpolate,
  spring, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';
import type {CSSProperties, FC} from 'react';

// Ubah ke true setelah logo.png diunggah ke folder public
const USE_LOGO = true;

const BG = '#05060f';
const mono: CSSProperties = {fontFamily: 'monospace', color: '#4dffb0'};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Boot: FC = () => {
  const frame = useCurrentFrame();
  const full = '> booting purbaya.exe...';
  const typed = full.slice(0, Math.floor(frame / 2));
  const cursor = Math.floor(frame / 8) % 2 === 0 ? '█' : ' ';
  return (
    <AbsoluteFill style={{backgroundColor: BG, justifyContent: 'center', padding: 80}}>
      <div style={{...mono, fontSize: 56}}>{typed}{cursor}</div>
    </AbsoluteFill>
  );
};

const Loading: FC = () => {
  const frame = useCurrentFrame();
  const pct = Math.round(interpolate(frame, [0, 50], [0, 100], clamp));
  return (
    <AbsoluteFill style={{backgroundColor: BG, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{width: 800, height: 48, border: '4px solid #4dffb0'}}>
        <div style={{width: `${pct}%`, height: '100%', backgroundColor: '#4dffb0'}} />
      </div>
      <div style={{...mono, fontSize: 56, marginTop: 40}}>LOADING {pct}%</div>
    </AbsoluteFill>
  );
};

const Intro: FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({frame, fps, config: {damping: 12}});
  const op = interpolate(frame, [20, 40], [0, 1], clamp);
  return (
    <AbsoluteFill style={{backgroundColor: BG, justifyContent: 'center', alignItems: 'center'}}>
      {USE_LOGO && (
        <Img
          src={staticFile('logo.png')}
          style={{width: 360, height: 360, objectFit: 'contain', transform: `scale(${scale})`}}
        />
      )}
      <div style={{...mono, fontSize: 72, marginTop: 60, opacity: op, textAlign: 'center'}}>
        POLITEKNIK<br />PURBAYA
      </div>
      <div style={{...mono, color: '#fff', fontSize: 40, marginTop: 30, opacity: op}}>
        Dare to be different
      </div>
    </AbsoluteFill>
  );
};

const Facts: FC = () => {
  const frame = useCurrentFrame();
  const year = Math.round(interpolate(frame, [0, 40], [1900, 2002], clamp));
  const op = interpolate(frame, [40, 55], [0, 1], clamp);
  return (
    <AbsoluteFill style={{backgroundColor: BG, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{...mono, fontSize: 40}}>BERDIRI</div>
      <div style={{...mono, fontSize: 200, fontWeight: 'bold'}}>{year}</div>
      <div style={{...mono, color: '#fff', fontSize: 38, marginTop: 50, opacity: op, textAlign: 'center'}}>
        Dinamai dari Raden Purbayasa,<br />Bupati Tegal pertama
      </div>
    </AbsoluteFill>
  );
};

const Prodi: FC = () => {
  const frame = useCurrentFrame();
  const items = ['D3 TEKNIK MESIN', 'D3 TEKNIK INFORMATIKA', 'D4 ADMINISTRASI PERKANTORAN DIGITAL (APD)'];
  return (
    <AbsoluteFill style={{backgroundColor: BG, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{...mono, fontSize: 44, marginBottom: 60}}>PROGRAM STUDI</div>
      {items.map((t, i) => {
        const x = interpolate(frame, [i * 30, i * 30 + 15], [1200, 0], {
          ...clamp,
          easing: Easing.out(Easing.cubic),
        });
        return (
          <div
            key={t}
            style={{
              ...mono, fontSize: 42, border: '4px solid #4dffb0', padding: '30px 40px',
              marginBottom: 40, width: 900, textAlign: 'center', transform: `translateX(${x}px)`,
            }}
          >
            {t}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Outro: FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15, 45, 60], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{backgroundColor: BG, justifyContent: 'center', alignItems: 'center', opacity}}>
      <div style={{...mono, fontSize: 64, textAlign: 'center'}}>DARE TO<br />BE DIFFERENT</div>
    </AbsoluteFill>
  );
};

export const MyComposition: FC = () => (
  <AbsoluteFill style={{backgroundColor: BG}}>
    <Sequence from={0} durationInFrames={60}><Boot /></Sequence>
    <Sequence from={60} durationInFrames={60}><Loading /></Sequence>
    <Sequence from={120} durationInFrames={90}><Intro /></Sequence>
    <Sequence from={210} durationInFrames={75}><Facts /></Sequence>
    <Sequence from={285} durationInFrames={105}><Prodi /></Sequence>
    <Sequence from={390} durationInFrames={60}><Outro /></Sequence>
  </AbsoluteFill>
);
