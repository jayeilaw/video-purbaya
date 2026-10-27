import React from "react";
import {Audio} from "@remotion/media";
import {loadFont} from "@remotion/google-fonts/PressStart2P";
import {AbsoluteFill, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";

const {fontFamily: pressStart2P} = loadFont("normal", {weights: ["400"], subsets: ["latin"]});

export const PALETTE = {
  night: "#1a1033",
  pink: "#ff9ecd",
  cyan: "#7ee8fa",
  yellow: "#ffe27a",
  violet: "#a78bfa",
  white: "#fff8ff",
  deep: "#100b22",
};

const LOGICAL_WIDTH = 480;
const LOGICAL_HEIGHT = 270;
const PIXEL = 1;

const logicalStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: LOGICAL_WIDTH,
  height: LOGICAL_HEIGHT,
  transform: "scale(4)",
  transformOrigin: "top left",
  overflow: "hidden",
  imageRendering: "pixelated",
  fontFamily: `${pressStart2P}, "Courier New", monospace`,
};

const SoundEffect: React.FC<{file: string; from: number; duration: number; name: string; volume?: number}> = ({file, from, duration, name, volume = 0.58}) => (
  <Sequence name={name} from={from} durationInFrames={duration} layout="none">
    <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
  </Sequence>
);

const seeded = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const PixelRobot: React.FC<{frame: number; x?: number; y?: number; scale?: number}> = ({frame, x = 0, y = 0, scale = 1}) => {
  const blink = frame % 97 < 5;
  const bob = Math.round(Math.sin(frame / 8) * 1.5);
  const rows = [
    "....11111111....",
    "...1222222221...",
    "..122222222221..",
    ".12222222222221.",
    "1222222222222221",
    "1223332222333221",
    "1223332222333221",
    "1222222222222221",
    "1222444444422221",
    "1222444444422221",
    ".12222222222221.",
    "..122222222221..",
    "...1555555551...",
    "...1.1....1.1...",
    "..11.1....1.11..",
    "................",
  ];
  const colors: Record<string, string> = {"1": PALETTE.violet, "2": PALETTE.white, "3": PALETTE.night, "4": PALETTE.cyan, "5": PALETTE.pink};
  return (
    <div style={{position: "absolute", left: x, top: y + bob, width: 16 * PIXEL, height: 16 * PIXEL, scale, imageRendering: "pixelated", filter: "drop-shadow(0 0 4px #7ee8fa88)"}}>
      {rows.map((row, ry) => [...row].map((cell, rx) => {
        if (cell === "." || (blink && ry === 5 && (rx === 3 || rx === 4 || rx === 10 || rx === 11))) return null;
        return <i key={`${rx}-${ry}`} style={{position: "absolute", left: rx, top: ry, width: PIXEL, height: PIXEL, backgroundColor: colors[cell]}} />;
      }))}
    </div>
  );
};

const PixelBackdrop: React.FC<{frame: number; base?: boolean}> = ({frame, base = true}) => (
  <>
    {base ? <div style={{position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 48%, #362253 0%, #22163d 45%, #1a1033 100%)"}} /> : null}
    <div style={{position: "absolute", left: 0, top: 0, right: 0, height: 102, opacity: 0.22, backgroundImage: "linear-gradient(180deg, #a78bfa 1px, transparent 1px)", backgroundSize: "1px 6px"}} />
    {Array.from({length: 56}, (_, i) => {
      const x = seeded(i + 1) * LOGICAL_WIDTH;
      const y = seeded(i + 90) * LOGICAL_HEIGHT;
      const size = seeded(i + 180) > 0.84 ? 2 : 1;
      const twinkle = 0.3 + (Math.sin(frame / (6 + seeded(i + 300) * 9) + i) + 1) * 0.35;
      const drift = (frame * (0.025 + seeded(i + 500) * 0.04)) % 490;
      return <i key={i} style={{position: "absolute", left: (x + drift) % 490, top: y, width: size, height: size, opacity: twinkle, backgroundColor: i % 7 === 0 ? PALETTE.pink : i % 5 === 0 ? PALETTE.cyan : PALETTE.white, boxShadow: size === 2 ? `0 0 5px ${PALETTE.violet}` : "none"}} />;
    })}
    {Array.from({length: 11}, (_, i) => {
      const drift = (frame * (0.08 + (i % 4) * 0.02) + i * 47) % 500;
      return <i key={`dust-${i}`} style={{position: "absolute", left: drift, top: 38 + (i * 67) % 202, width: 1, height: 1, opacity: 0.4 + Math.sin(frame / 12 + i) * 0.25, backgroundColor: i % 2 ? PALETTE.cyan : PALETTE.pink}} />;
    })}
  </>
);

export const SceneOne: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = spring({frame, fps, config: {damping: 14, stiffness: 80, mass: 0.7}});
  const titleOpacity = interpolate(frame, [14, 32, 162, 179], [0, 1, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1)});
  const robotY = interpolate(reveal, [0, 1], [172, 157]);
  const line = interpolate(frame, [26, 52], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <AbsoluteFill style={{backgroundColor: PALETTE.night, overflow: "hidden"}}>
      <div style={logicalStyle}>
        <PixelBackdrop frame={frame} />
        {/* Slow, low amplitude camera drift keeps the whole pixel scene alive. */}
        <div style={{position: "absolute", inset: 0, translate: `${Math.sin(frame / 70) * 1}px ${Math.cos(frame / 55) * 1}px`}}>
          <div style={{position: "absolute", left: 0, top: 201, width: 480, height: 69, background: "linear-gradient(180deg, #20163c 0%, #17102d 100%)", borderTop: "1px solid #a78bfa55"}} />
          <div style={{position: "absolute", left: 96, top: 222, width: 288, height: 1, opacity: 0.35, background: "linear-gradient(90deg, transparent, #7ee8fa, transparent)"}} />
          <div style={{position: "absolute", left: 206, top: 153, width: 68, height: 20, borderRadius: "50%", background: "#7ee8fa", filter: "blur(14px)", opacity: 0.12 + reveal * 0.16}} />
          <PixelRobot frame={frame} x={232} y={robotY} scale={2.2} />
          <div style={{position: "absolute", left: 220, top: 197, width: 40, height: 1, backgroundColor: PALETTE.cyan, opacity: 0.5, transform: `scaleX(${line})`, boxShadow: "0 0 4px #7ee8fa"}} />
          {Array.from({length: 7}, (_, i) => {
            const angle = (i / 7) * Math.PI * 2 + frame / 38;
            const orbit = interpolate(frame, [15, 42], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic)});
            const radius = 34 + (i % 2) * 12;
            const px = 240 + Math.cos(angle) * radius * orbit;
            const py = 163 + Math.sin(angle) * radius * 0.55 * orbit;
            const twinkle = 0.35 + (Math.sin(frame / 7 + i * 2) + 1) * 0.3;
            return <i key={`orbit-${i}`} style={{position: "absolute", left: px, top: py, width: i % 3 === 0 ? 2 : 1, height: i % 3 === 0 ? 2 : 1, backgroundColor: [PALETTE.yellow, PALETTE.pink, PALETTE.cyan][i % 3], opacity: twinkle * orbit, boxShadow: `0 0 4px ${[PALETTE.yellow, PALETTE.pink, PALETTE.cyan][i % 3]}`}} />;
          })}
        </div>
        <div style={{position: "absolute", left: 40, top: 47, width: 400, textAlign: "center", opacity: titleOpacity, scale: interpolate(reveal, [0, 1], [0.92, 1]), color: PALETTE.white, textShadow: "0 0 12px #a78bfa88", fontSize: 12, lineHeight: 1.8, letterSpacing: 0.15}}>
          HOW CAN AI WORK
          <div style={{color: PALETTE.pink}}>BY ITSELF?</div>
        </div>
        <div style={{position: "absolute", left: 16, bottom: 14, color: "#c6b8e5", opacity: 0.75, fontSize: 4, letterSpacing: 0.7}}>01  /  THE QUESTION</div>
        <div style={{position: "absolute", right: 16, bottom: 14, display: "flex", gap: 3, alignItems: "center"}}>
          {Array.from({length: 5}, (_, i) => <i key={i} style={{width: i === 0 ? 9 : 3, height: 2, backgroundColor: i === 0 ? PALETTE.pink : "#786696"}} />)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const brainRows = [
  "...........1111111111...........",
  ".......111122222222221111........",
  ".....1122222222222222222211......",
  "....122222222222222222222221.....",
  "...12222222222222222222222221....",
  "..1222222222222222222222222221...",
  ".122222222222222222222222222221..",
  "122222222222222222222222222222221.",
  "1222222222222222222222222222222221",
  "1222222222222222222222222222222221",
  "1222222222222222222222222222222221",
  ".12222222222222222222222222222221..",
  "..122222222222222222222222222221...",
  "...1222222222222222222222222221....",
  "....12222222222222222222222221.....",
  ".....122222222222222222222221......",
  "......1222222222222222222221.......",
  ".......1222222222222222221.........",
  "........1111111111111111...........",
];

const PixelBrain: React.FC<{frame: number; x?: number; y?: number; connectionPulses?: number[]}> = ({frame, x = 62, y = 95, connectionPulses = []}) => {
  const {fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 11, stiffness: 105, mass: 0.65}});
  const ping = Math.max(0, ...connectionPulses.map((at) => 1 - Math.abs(frame - at) / 8));
  const pulse = 1 + Math.sin(frame / 10) * 0.035 + ping * 0.025;
  const glow = 0.48 + (Math.sin(frame / 8) + 1) * 0.18 + ping * 0.35;
  return (
    <div style={{position: "absolute", left: x, top: y, width: 110, height: 92, scale: interpolate(pop, [0, 1], [0.2, 1]) * pulse, opacity: interpolate(frame, [0, 7], [0, 1], {extrapolateRight: "clamp"}), transformOrigin: "center", filter: `drop-shadow(0 0 ${5 + glow * 8}px #ff9ecd${Math.round(glow * 99).toString(16)})`}}>
      <div style={{position: "absolute", left: 11, top: 15, width: 85, height: 58, background: "#ff9ecd", filter: "blur(18px)", opacity: glow * 0.28}} />
      {brainRows.map((row, y) => [...row].map((cell, x) => {
        if (cell === ".") return null;
        const seam = x === 16 || x === 17;
        const highlight = (x < 15 && y < 7 && (x + y) % 4 === 0) || (x > 18 && y > 11 && (x + y) % 5 === 0);
        const color = cell === "1" ? (highlight ? PALETTE.white : PALETTE.pink) : seam ? "#ce78d5" : highlight ? "#ffd5e8" : "#ee86c7";
        return <i key={`${x}-${y}`} style={{position: "absolute", left: x * 3, top: y * 3, width: 3, height: 3, backgroundColor: color, boxShadow: cell === "1" ? "0 0 3px #ff9ecd" : "none"}} />;
      }))}
      <div style={{position: "absolute", left: 27, top: 81, width: 55, height: 2, opacity: 0.8, background: "linear-gradient(90deg, transparent, #ff9ecd, transparent)"}} />
    </div>
  );
};

const SpeechBubble: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();
  const enter = spring({frame: Math.max(0, frame - 7), fps, config: {damping: 13, stiffness: 90, mass: 0.7}});
  const text = "Hi! I can only chat...";
  const typed = Math.min(text.length, Math.max(0, Math.floor((frame - 23) / 2)));
  const bob = Math.sin(frame / 7) * 1.7;
  return (
    <div style={{position: "absolute", left: 223, top: 89 + bob, width: 213, height: 69, opacity: interpolate(frame, [7, 14], [0, 1], {extrapolateRight: "clamp"}), scale: interpolate(enter, [0, 1], [0.55, 1]), transformOrigin: "left bottom"}}>
      <div style={{position: "absolute", inset: 0, backgroundColor: PALETTE.deep, border: `2px solid ${PALETTE.cyan}`, boxShadow: "0 0 8px #7ee8fa66, 3px 3px 0 #a78bfa"}} />
      <div style={{position: "absolute", left: 18, top: 15, color: PALETTE.white, fontSize: 7, lineHeight: 2.15, letterSpacing: -0.45, whiteSpace: "nowrap", textShadow: "0 0 5px #ff9ecd66"}}>
        {text.slice(0, typed)}{typed < text.length && frame % 10 < 6 ? <span style={{color: PALETTE.pink}}>_</span> : null}
      </div>
      <div style={{position: "absolute", left: 27, bottom: -6, width: 8, height: 8, backgroundColor: PALETTE.deep, borderLeft: `2px solid ${PALETTE.cyan}`, borderBottom: `2px solid ${PALETTE.cyan}`, transform: "skewY(-35deg)"}} />
      <div style={{position: "absolute", right: 9, top: 8, width: 2, height: 2, backgroundColor: PALETTE.pink, boxShadow: `0 0 5px ${PALETTE.pink}`}} />
    </div>
  );
};

const SceneTwo: React.FC<{revealBlocks?: boolean}> = ({revealBlocks = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 16, stiffness: 70}});
  const progress = interpolate(frame, [0, 17], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic)});
  const path = Array.from({length: 24 * 14}, (_, i) => i)
    .filter((i) => seeded(i + 918) < progress)
    .map((i) => {
      const x = (i % 24) * 20;
      const y = Math.floor(i / 24) * (270 / 14);
      return `M${x} ${y}h20v${270 / 14}h-20z`;
    }).join("");
  return (
    <AbsoluteFill style={{backgroundColor: PALETTE.night, overflow: "hidden"}}>
      <div style={{...logicalStyle, ...(revealBlocks ? {mask: "url(#scene-two-block-mask)", WebkitMask: "url(#scene-two-block-mask)"} : {})}}>
        {revealBlocks ? <svg width="0" height="0" style={{position: "absolute"}}><defs><mask id="scene-two-block-mask" x="0" y="0" width="480" height="270" maskUnits="userSpaceOnUse"><rect x="0" y="0" width="480" height="270" fill="black"/><path d={path} fill="white"/></mask></defs></svg> : null}
        <PixelBackdrop frame={frame} />
        <div style={{position: "absolute", inset: 0, translate: `${Math.sin(frame / 65) * 1.2}px ${Math.cos(frame / 54) * 0.8}px`}}>
          <div style={{position: "absolute", left: 74, top: 77, width: 120, height: 120, borderRadius: "50%", background: "#ff9ecd", filter: "blur(28px)", opacity: 0.12 + Math.sin(frame / 10) * 0.035}} />
          <PixelBrain frame={frame} />
          <SpeechBubble frame={frame} />
          {Array.from({length: 18}, (_, i) => {
            const phase = frame * (0.06 + (i % 4) * 0.013) + i * 2.4;
            const angle = i * 2.399 + frame * (i % 3 === 0 ? 0.008 : -0.006);
            const radius = 46 + seeded(i + 45) * 48 + Math.sin(phase) * 5;
            const x = 119 + Math.cos(angle) * radius;
            const y = 137 + Math.sin(angle) * radius * 0.62;
            const flash = Math.max(0, Math.sin(frame / (2.2 + seeded(i + 67) * 3) + i * 5));
            const size = i % 5 === 0 ? 3 : 2;
            return <i key={`spark-${i}`} style={{position: "absolute", left: x, top: y, width: size, height: size, backgroundColor: i % 3 === 0 ? PALETTE.yellow : i % 2 === 0 ? PALETTE.cyan : PALETTE.pink, opacity: flash * interpolate(frame, [0, 13], [0, 1], {extrapolateRight: "clamp"}), boxShadow: `0 0 5px ${i % 2 ? PALETTE.cyan : PALETTE.pink}`}} />;
          })}
          <div style={{position: "absolute", left: 227, top: 175, width: 27, height: 1, background: "linear-gradient(90deg, #ff9ecd, transparent)", opacity: 0.7 * enter}} />
        </div>
        <div style={{position: "absolute", left: 16, bottom: 14, color: "#c6b8e5", opacity: 0.75, fontSize: 4, letterSpacing: 0.7}}>02  /  A VOICE, NO HANDS</div>
        <div style={{position: "absolute", right: 16, bottom: 14, display: "flex", gap: 3, alignItems: "center"}}>
          {Array.from({length: 5}, (_, i) => <i key={i} style={{width: i === 1 ? 9 : 3, height: 2, backgroundColor: i === 1 ? PALETTE.cyan : "#786696"}} />)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

type OrbitIconKind = "browser" | "calendar" | "mail" | "code";
const orbitIcons: {kind: OrbitIconKind; label: string; hue: string; entry: number; angle: number}[] = [
  {kind: "browser", label: "WEB", hue: PALETTE.cyan, entry: 19, angle: -Math.PI / 2},
  {kind: "calendar", label: "DATE", hue: PALETTE.yellow, entry: 33, angle: 0},
  {kind: "mail", label: "MAIL", hue: PALETTE.pink, entry: 47, angle: Math.PI / 2},
  {kind: "code", label: "CODE", hue: PALETTE.violet, entry: 61, angle: Math.PI},
];

const PixelToolIcon: React.FC<{kind: OrbitIconKind; color: string}> = ({kind, color}) => (
  <svg width="30" height="30" viewBox="0 0 32 32" shapeRendering="crispEdges" style={{overflow: "visible", filter: `drop-shadow(0 0 4px ${color}88)`}}>
    {kind === "browser" && <>
      <path d="M4 5h24v22H4z" fill={PALETTE.deep} stroke={color} strokeWidth="2" />
      <path d="M5 10h22M9 8h1M13 8h1M17 8h1" stroke={color} strokeWidth="2" />
      <path d="M9 15h14M9 19h10M9 23h7" stroke={PALETTE.white} strokeWidth="2" />
    </>}
    {kind === "calendar" && <>
      <path d="M5 7h22v21H5z" fill={PALETTE.deep} stroke={color} strokeWidth="2" />
      <path d="M6 12h20M11 4v6M21 4v6" stroke={color} strokeWidth="2" />
      <path d="M10 16h2v2h-2zM16 16h2v2h-2zM22 16h2v2h-2zM10 22h2v2h-2zM16 22h2v2h-2z" fill={PALETTE.white} />
    </>}
    {kind === "mail" && <>
      <path d="M3 8h26v18H3z" fill={PALETTE.deep} stroke={color} strokeWidth="2" />
      <path d="M5 11l11 9 11-9M5 24l8-7M27 24l-8-7" fill="none" stroke={PALETTE.white} strokeWidth="2" />
    </>}
    {kind === "code" && <>
      <path d="M6 5h20v22H6z" fill={PALETTE.deep} stroke={color} strokeWidth="2" />
      <path d="M14 12l-5 4 5 4M18 20l5-8M12 24h9" fill="none" stroke={PALETTE.white} strokeWidth="2" />
      <path d="M3 10h3M26 22h3" stroke={color} strokeWidth="2" />
    </>}
  </svg>
);

const SceneThree: React.FC<{revealBlocks?: boolean}> = ({revealBlocks = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const centerX = 240;
  const centerY = 135;
  const radiusX = 112;
  const radiusY = 77;
  const orbitStart = 112;
  const orbitAngle = interpolate(frame, [orbitStart, orbitStart + 42], [0, 0.36], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic)}) + Math.max(0, frame - orbitStart - 42) * 0.012;
  const connectionPulses = orbitIcons.map((icon) => icon.entry + 34);
  const revealProgress = interpolate(frame, [0, 17], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic)});
  const revealPath = Array.from({length: 24 * 14}, (_, i) => i)
    .filter((i) => seeded(i + 1718) < revealProgress)
    .map((i) => `M${(i % 24) * 20} ${Math.floor(i / 24) * (270 / 14)}h20v${270 / 14}h-20z`).join("");
  const orbital = orbitIcons.map((icon) => {
    const angle = icon.angle + orbitAngle;
    return {
      ...icon,
      x: centerX + Math.cos(angle) * radiusX,
      y: centerY + Math.sin(angle) * radiusY,
    };
  });
  return (
    <AbsoluteFill style={{backgroundColor: PALETTE.night, overflow: "hidden"}}>
      <div style={{...logicalStyle, ...(revealBlocks ? {mask: "url(#scene-three-block-mask)", WebkitMask: "url(#scene-three-block-mask)"} : {})}}>
        {revealBlocks ? <svg width="480" height="270" viewBox="0 0 480 270" style={{position: "absolute", opacity: 0}}><defs><mask id="scene-three-block-mask" x="0" y="0" width="480" height="270" maskUnits="userSpaceOnUse"><rect x="0" y="0" width="480" height="270" fill="black"/><path d={revealPath} fill="white"/></mask></defs></svg> : null}
        <PixelBackdrop frame={frame} />
        <div style={{position: "absolute", inset: 0, translate: `${Math.sin(frame / 72) * 1}px ${Math.cos(frame / 59) * 0.8}px`}}>
          <div style={{position: "absolute", left: 126, top: 68, width: 228, height: 136, borderRadius: "50%", background: "radial-gradient(ellipse, #7ee8fa17, #a78bfa08 60%, transparent 74%)", filter: "blur(2px)"}} />
          <svg width="480" height="270" style={{position: "absolute", inset: 0, overflow: "visible"}}>
            {orbital.map((icon) => {
              const entryProgress = interpolate(frame, [icon.entry + 9, icon.entry + 32], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic)});
              const targetX = icon.x;
              const targetY = icon.y;
              const dx = targetX - centerX;
              const dy = targetY - centerY;
              const length = Math.hypot(dx, dy);
              const startX = centerX + dx * 0.25;
              const startY = centerY + dy * 0.25;
              const endX = targetX - dx * 0.12;
              const endY = targetY - dy * 0.12;
              return <g key={`link-${icon.kind}`} style={{filter: `drop-shadow(0 0 3px ${icon.hue})`}}>
                <line x1={centerX} y1={centerY} x2={targetX} y2={targetY} stroke={icon.hue} strokeWidth="5" strokeOpacity="0.1" />
                <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={icon.hue} strokeWidth="1.5" strokeDasharray={length} strokeDashoffset={length * (1 - entryProgress)} />
                {entryProgress > 0 && entryProgress < 1 ? <rect x={centerX + (endX - centerX) * entryProgress - 1} y={centerY + (endY - centerY) * entryProgress - 1} width="3" height="3" fill={PALETTE.white} /> : null}
              </g>;
            })}
          </svg>
          <PixelBrain frame={frame} x={185} y={89} connectionPulses={connectionPulses} />
          {connectionPulses.map((at, i) => {
            const pulse = Math.max(0, 1 - Math.abs(frame - at) / 9);
            const icon = orbital[i];
            const centerBurst = [
              [236, 105], [278, 132], [244, 166], [200, 139],
            ][i];
            return <React.Fragment key={`brain-pulse-${i}`}>
              <i style={{position: "absolute", left: centerBurst[0] - pulse * 5, top: centerBurst[1] - pulse * 5, width: 3 + pulse * 3, height: 3 + pulse * 3, opacity: pulse, backgroundColor: icon.hue, boxShadow: `0 0 ${3 + pulse * 5}px ${icon.hue}`}} />
              <i style={{position: "absolute", left: centerX + (icon.x - centerX) * 0.26, top: centerY + (icon.y - centerY) * 0.26, width: 2, height: 2, opacity: pulse, backgroundColor: PALETTE.white, boxShadow: `0 0 4px ${icon.hue}`}} />
            </React.Fragment>;
          })}
          {orbital.map((icon) => {
            const pop = spring({frame: Math.max(0, frame - icon.entry), fps, config: {damping: 12, stiffness: 100, mass: 0.55}});
            const halo = 0.16 + 0.08 * (Math.sin(frame / 8 + icon.entry) + 1);
            return <div key={`tool-${icon.kind}`} style={{position: "absolute", left: icon.x - 15, top: icon.y - 17, width: 30, height: 40, opacity: interpolate(frame, [icon.entry, icon.entry + 6], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}), scale: interpolate(pop, [0, 1], [0.15, 1]), transformOrigin: "center", filter: `drop-shadow(0 0 ${3 + halo * 8}px ${icon.hue})`, textAlign: "center"}}>
              <div style={{position: "absolute", left: 4, top: 4, width: 22, height: 22, backgroundColor: icon.hue, opacity: halo, filter: "blur(8px)"}} />
              <PixelToolIcon kind={icon.kind} color={icon.hue} />
              <div style={{position: "relative", marginTop: -1, color: icon.hue, fontSize: 4, lineHeight: 1.5, letterSpacing: 0.25, textShadow: `0 0 4px ${icon.hue}`}}>{icon.label}</div>
            </div>;
          })}
        </div>
        <div style={{position: "absolute", left: 16, bottom: 14, color: "#c6b8e5", opacity: 0.75, fontSize: 4, letterSpacing: 0.7}}>03  /  TOOLS JOIN THE LOOP</div>
        <div style={{position: "absolute", right: 16, bottom: 14, display: "flex", gap: 3, alignItems: "center"}}>
          {Array.from({length: 5}, (_, i) => <i key={i} style={{width: i === 2 ? 9 : 3, height: 2, backgroundColor: i === 2 ? PALETTE.yellow : "#786696"}} />)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SceneFour: React.FC<{revealBlocks?: boolean}> = ({revealBlocks = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const intro = spring({frame, fps, config: {damping: 18, stiffness: 65}});
  const ringAngle = frame * (Math.PI * 2 / 240);
  const ringDegrees = ringAngle * (180 / Math.PI);
  const lightAngle = frame * (Math.PI * 2 / 92) - Math.PI / 2;
  const centerX = 240;
  const centerY = 135;
  const radiusX = 99;
  const radiusY = 75;
  const nodes = [
    {label: "THINK", color: PALETTE.pink, angle: -Math.PI / 2},
    {label: "ACT", color: PALETTE.cyan, angle: Math.PI / 6},
    {label: "OBSERVE", color: PALETTE.yellow, angle: 5 * Math.PI / 6},
  ].map((node) => {
    const angle = node.angle + ringAngle;
    return {...node, x: centerX + Math.cos(angle) * radiusX, y: centerY + Math.sin(angle) * radiusY, angle};
  });
  const streamPhases = nodes.flatMap((_, i) => Array.from({length: 3}, (_, j) => (frame * 0.045 + i * 0.27 + j * 0.34) % 1));
  const chipPulse = 0.25 + (Math.sin(frame / 8) + 1) * 0.12 + streamPhases.filter((phase) => phase > 0.87).length * 0.08;
  const revealProgress = interpolate(frame, [0, 17], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic)});
  const revealPath = Array.from({length: 24 * 14}, (_, i) => i)
    .filter((i) => seeded(i + 2718) < revealProgress)
    .map((i) => `M${(i % 24) * 20} ${Math.floor(i / 24) * (270 / 14)}h20v${270 / 14}h-20z`).join("");
  const travelerX = centerX + Math.cos(lightAngle) * radiusX;
  const travelerY = centerY + Math.sin(lightAngle) * radiusY;
  return (
    <AbsoluteFill style={{backgroundColor: PALETTE.night, overflow: "hidden"}}>
      <div style={{...logicalStyle, ...(revealBlocks ? {mask: "url(#scene-four-block-mask)", WebkitMask: "url(#scene-four-block-mask)"} : {})}}>
        {revealBlocks ? <svg width="480" height="270" viewBox="0 0 480 270" style={{position: "absolute", opacity: 0}}><defs><mask id="scene-four-block-mask" x="0" y="0" width="480" height="270" maskUnits="userSpaceOnUse"><rect x="0" y="0" width="480" height="270" fill="black"/><path d={revealPath} fill="white"/></mask></defs></svg> : null}
        <PixelBackdrop frame={frame} />
        <div style={{position: "absolute", inset: 0, scale: interpolate(intro, [0, 1], [0.96, 1]), translate: `${Math.sin(frame / 72) * 0.9}px ${Math.cos(frame / 67) * 0.8}px`}}>
          <div style={{position: "absolute", left: 153, top: 62, width: 174, height: 144, borderRadius: "50%", background: "radial-gradient(ellipse, #7ee8fa10, #a78bfa0c 64%, transparent 75%)"}} />
          <svg width="480" height="270" style={{position: "absolute", inset: 0, overflow: "visible"}}>
            <ellipse cx={centerX} cy={centerY} rx={radiusX} ry={radiusY} fill="none" stroke="#a78bfa" strokeOpacity="0.2" strokeWidth="3" />
            <ellipse cx={centerX} cy={centerY} rx={radiusX} ry={radiusY} fill="none" stroke={PALETTE.violet} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="3 5" transform={`rotate(${ringDegrees} ${centerX} ${centerY})`} />
            <ellipse cx={centerX} cy={centerY} rx="82" ry="60" fill="none" stroke={PALETTE.cyan} strokeOpacity="0.12" strokeWidth="1" strokeDasharray="1 7" transform={`rotate(${-ringDegrees} ${centerX} ${centerY})`} />
            {nodes.map((node, i) => {
              const dx = centerX - node.x;
              const dy = centerY - node.y;
              const reach = Math.min(1, Math.max(0, (frame - 34 - i * 11) / 20));
              return <g key={`flow-${node.label}`} style={{filter: `drop-shadow(0 0 3px ${node.color})`}}>
                <line x1={node.x + dx * 0.18} y1={node.y + dy * 0.18} x2={centerX - dx * 0.18} y2={centerY - dy * 0.18} stroke={node.color} strokeOpacity="0.12" strokeWidth="1" />
                <line x1={node.x + dx * 0.18} y1={node.y + dy * 0.18} x2={node.x + dx * (0.18 + reach * 0.64)} y2={node.y + dy * (0.18 + reach * 0.64)} stroke={node.color} strokeWidth="1" strokeDasharray="2 3" />
              </g>;
            })}
            {[0, 1, 2].map((tail) => {
              const angle = lightAngle - tail * 0.09;
              return <rect key={`light-tail-${tail}`} x={centerX + Math.cos(angle) * radiusX - 2} y={centerY + Math.sin(angle) * radiusY - 2} width={tail === 0 ? 4 : 2} height={tail === 0 ? 4 : 2} fill={tail === 0 ? PALETTE.white : PALETTE.cyan} opacity={1 - tail * 0.23} style={{filter: "drop-shadow(0 0 5px #7ee8fa)"}} />;
            })}
          </svg>
          <div style={{position: "absolute", left: 194, top: 101, width: 92, height: 68, background: "#7ee8fa", opacity: chipPulse * 0.24, filter: "blur(18px)"}} />
          {[0, 1, 2, 3].map((pin) => <React.Fragment key={`pin-${pin}`}>
            <i style={{position: "absolute", left: 198 + pin * 24, top: 101, width: 8, height: 3, backgroundColor: pin % 2 ? PALETTE.cyan : PALETTE.violet, opacity: 0.8}} />
            <i style={{position: "absolute", left: 198 + pin * 24, top: 166, width: 8, height: 3, backgroundColor: pin % 2 ? PALETTE.violet : PALETTE.cyan, opacity: 0.8}} />
          </React.Fragment>)}
          <div style={{position: "absolute", left: 199, top: 105, width: 82, height: 59, backgroundColor: PALETTE.deep, border: `2px solid ${PALETTE.violet}`, boxShadow: `inset 0 0 0 2px #7ee8fa55, 0 0 8px #7ee8fa${Math.round(chipPulse * 70).toString(16)}`, scale: 1 + Math.sin(frame / 8) * 0.018, transformOrigin: "center", textAlign: "center"}}>
            <div style={{position: "absolute", left: 23, top: 9, width: 34, height: 2, background: PALETTE.cyan, opacity: 0.6 + Math.sin(frame / 5) * 0.25}} />
            <div style={{position: "relative", marginTop: 20, fontSize: 5, lineHeight: 1.6, letterSpacing: 0.15, color: PALETTE.white, textShadow: `0 0 ${4 + chipPulse * 6}px ${PALETTE.cyan}`}}>MEMORY</div>
            <div style={{position: "absolute", left: 38, bottom: 8, width: 4, height: 4, background: PALETTE.yellow, opacity: 0.55 + Math.sin(frame / 4) * 0.35, boxShadow: `0 0 5px ${PALETTE.yellow}`}} />
          </div>
          {nodes.flatMap((node, i) => Array.from({length: 3}, (_, j) => {
            const phase = (frame * 0.045 + i * 0.27 + j * 0.34) % 1;
            const x = node.x + (centerX - node.x) * phase;
            const y = node.y + (centerY - node.y) * phase;
            const size = j === 0 ? 3 : 2;
            return <i key={`data-${i}-${j}`} style={{position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, backgroundColor: j === 0 ? PALETTE.white : node.color, opacity: (0.45 + Math.sin(frame / 4 + i * 2 + j) * 0.35) * interpolate(frame, [32, 50], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}), boxShadow: `0 0 4px ${node.color}`}} />;
          }))}
          {nodes.map((node) => {
            const pop = spring({frame: Math.max(0, frame - 18), fps, config: {damping: 14, stiffness: 85, mass: 0.65}});
            const pulse = 0.4 + 0.25 * (Math.sin(frame / 9 + node.angle) + 1);
            const width = node.label === "OBSERVE" ? 76 : node.label === "THINK" ? 65 : 48;
            return <div key={`node-${node.label}`} style={{position: "absolute", left: node.x - width / 2, top: node.y - 13, width, height: 25, opacity: interpolate(frame, [14, 23], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}), scale: interpolate(pop, [0, 1], [0.35, 1]), transformOrigin: "center", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#160f2f", border: `1px solid ${node.color}`, boxShadow: `0 0 ${3 + pulse * 5}px ${node.color}77`, color: node.color, fontSize: 5, letterSpacing: 0.05, textShadow: `0 0 5px ${node.color}`}}>{node.label}</div>;
          })}
          {nodes.map((node, i) => {
            const angle = node.angle + ringAngle + Math.PI / 3;
            const x = centerX + Math.cos(angle) * (radiusX + 1);
            const y = centerY + Math.sin(angle) * (radiusY + 1);
            return <div key={`arrow-${i}`} style={{position: "absolute", left: x - 2, top: y - 3, width: 5, height: 7, color: PALETTE.yellow, fontSize: 5, lineHeight: 1, opacity: 0.6 + (Math.sin(frame / 5 + i) + 1) * 0.2, textShadow: `0 0 5px ${PALETTE.yellow}`}}>›</div>;
          })}
          <div style={{position: "absolute", left: 184, top: 207, width: 112, textAlign: "center", color: "#b9a9d8", fontSize: 4, letterSpacing: 0.7, opacity: 0.8}}>REASON  /  REMEMBER</div>
        </div>
        <div style={{position: "absolute", left: 16, bottom: 14, color: "#c6b8e5", opacity: 0.75, fontSize: 4, letterSpacing: 0.7}}>04  /  THE AGENT LOOP</div>
        <div style={{position: "absolute", right: 16, bottom: 14, display: "flex", gap: 3, alignItems: "center"}}>
          {Array.from({length: 5}, (_, i) => <i key={i} style={{width: i === 3 ? 9 : 3, height: 2, backgroundColor: i === 3 ? PALETTE.violet : "#786696"}} />)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PixelHuman: React.FC<{frame: number}> = ({frame}) => {
  const rows = [
    "....1111111111....",
    "...1111111111111..",
    "..111122222211111..",
    "..111222222221111..",
    "..111222322221111..",
    "..111222222221111..",
    "...112255222211...",
    "....1122222211....",
    ".....11111111.....",
    ".......3333.......",
    "....4444444444....",
    "...444444444444...",
    "..44444444444444..",
    ".4444444444444444.",
    ".4444444444444444.",
    "..44444444444444..",
    "...444444444444...",
    "....4455554444....",
    "....4555555544....",
    "...555555555555...",
    "..5555......5555..",
    "..5555......5555..",
    ".55555......55555.",
    "..................",
  ];
  const colors: Record<string, string> = {"1": "#34214b", "2": "#ffd2cf", "3": PALETTE.night, "4": PALETTE.cyan, "5": PALETTE.violet};
  const typeMotion = Math.round(Math.sin(frame * 0.9) * 1.2);
  return <div style={{position: "absolute", left: 68, top: 114 + (frame > 20 && frame < 72 ? typeMotion : 0), width: 36, height: 48, imageRendering: "pixelated", filter: "drop-shadow(0 0 4px #a78bfa55)"}}>
    {rows.map((row, y) => [...row].map((cell, x) => cell === "." ? null : <i key={`${x}-${y}`} style={{position: "absolute", left: x * 2, top: y * 2, width: 2, height: 2, backgroundColor: colors[cell]}} />))}
  </div>;
};

type TripIconKind = "plane" | "calendar" | "hotel";
const TripIcon: React.FC<{kind: TripIconKind; color: string}> = ({kind, color}) => (
  <svg width="20" height="20" viewBox="0 0 32 32" shapeRendering="crispEdges" style={{overflow: "visible"}}>
    {kind === "plane" && <>
      <path d="M14 3h4v9l10 6v3l-10-3v7l4 2v2l-6-1-6 1v-2l4-2v-7L4 21v-3l10-6z" fill={color} />
      <path d="M16 6v18" stroke={PALETTE.white} strokeWidth="1" opacity="0.8" />
    </>}
    {kind === "calendar" && <>
      <path d="M5 7h22v21H5z" fill={PALETTE.deep} stroke={color} strokeWidth="2" />
      <path d="M6 12h20M11 4v6M21 4v6" stroke={color} strokeWidth="2" />
      <path d="M10 16h2v2h-2zM16 16h2v2h-2zM22 16h2v2h-2zM10 22h2v2h-2zM16 22h2v2h-2z" fill={PALETTE.white} />
    </>}
    {kind === "hotel" && <>
      <path d="M6 4h20v24H6z" fill={PALETTE.deep} stroke={color} strokeWidth="2" />
      <path d="M11 9h3v3h-3zM18 9h3v3h-3zM11 16h3v3h-3zM18 16h3v3h-3z" fill={PALETTE.cyan} />
      <path d="M14 23h5v5h-5z" fill={color} />
    </>}
  </svg>
);

const PixelCheck: React.FC<{frame: number; completeAt: number}> = ({frame, completeAt}) => {
  const {fps} = useVideoConfig();
  const progress = spring({frame: Math.max(0, frame - completeAt), fps, config: {damping: 10, stiffness: 170, mass: 0.5}});
  const rows = ["......11", ".....11.", "....11..", "...11...", "1.11....", ".111....", "..1....."];
  return <div style={{position: "absolute", right: 7, top: 7, width: 18, height: 16, opacity: interpolate(frame, [completeAt, completeAt + 4], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}), scale: interpolate(progress, [0, 1], [0.25, 1.2]), transformOrigin: "center", filter: "drop-shadow(0 0 4px #7ee8fa)"}}>
    {rows.map((row, y) => [...row].map((cell, x) => cell === "1" ? <i key={`${x}-${y}`} style={{position: "absolute", left: x * 2, top: y * 2, width: 2, height: 2, backgroundColor: PALETTE.cyan}} /> : null))}
  </div>;
};

const SceneFive: React.FC<{revealBlocks?: boolean}> = ({revealBlocks = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const intro = spring({frame, fps, config: {damping: 18, stiffness: 74}});
  const request = "Plan my trip to Bali";
  const typed = Math.min(request.length, Math.max(0, Math.floor((frame - 25) / 2)));
  const rows = [
    {label: "Find flights", icon: "plane" as const, color: PALETTE.cyan, start: 91},
    {label: "Check schedule", icon: "calendar" as const, color: PALETTE.yellow, start: 163},
    {label: "Book hotel", icon: "hotel" as const, color: PALETTE.pink, start: 235},
  ];
  const revealProgress = interpolate(frame, [0, 17], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic)});
  const revealPath = Array.from({length: 24 * 14}, (_, i) => i)
    .filter((i) => seeded(i + 3718) < revealProgress)
    .map((i) => `M${(i % 24) * 20} ${Math.floor(i / 24) * (270 / 14)}h20v${270 / 14}h-20z`).join("");
  return (
    <AbsoluteFill style={{backgroundColor: PALETTE.night, overflow: "hidden"}}>
      <div style={{...logicalStyle, ...(revealBlocks ? {mask: "url(#scene-five-block-mask)", WebkitMask: "url(#scene-five-block-mask)"} : {})}}>
        {revealBlocks ? <svg width="480" height="270" viewBox="0 0 480 270" style={{position: "absolute", opacity: 0}}><defs><mask id="scene-five-block-mask" x="0" y="0" width="480" height="270" maskUnits="userSpaceOnUse"><rect x="0" y="0" width="480" height="270" fill="black"/><path d={revealPath} fill="white"/></mask></defs></svg> : null}
        <PixelBackdrop frame={frame} />
        <div style={{position: "absolute", inset: 0, scale: interpolate(intro, [0, 1], [0.985, 1]), translate: `${Math.sin(frame / 80) * 0.8}px ${Math.cos(frame / 62) * 0.7}px`}}>
          <div style={{position: "absolute", left: 12, top: 70, width: 220, height: 158, background: "radial-gradient(ellipse at 45% 70%, #7ee8fa0d, transparent 72%)"}} />
          {/* Chair and seated human */}
          <div style={{position: "absolute", left: 49, top: 150, width: 38, height: 48, border: "2px solid #a78bfa88", borderBottom: "0", backgroundColor: "#1a103366"}} />
          <PixelHuman frame={frame} />
          {/* Desk, legs and laptop */}
          <div style={{position: "absolute", left: 18, top: 188, width: 220, height: 7, background: "linear-gradient(180deg, #ff9ecd, #a78bfa)", boxShadow: "0 2px 0 #110b25, 0 0 8px #a78bfa55"}} />
          <div style={{position: "absolute", left: 35, top: 195, width: 7, height: 46, backgroundColor: "#716090"}} />
          <div style={{position: "absolute", left: 214, top: 195, width: 7, height: 46, backgroundColor: "#716090"}} />
          <div style={{position: "absolute", left: 105, top: 159, width: 54, height: 29, backgroundColor: PALETTE.deep, border: `2px solid ${PALETTE.cyan}`, boxShadow: "0 0 7px #7ee8fa44"}}>
            <div style={{position: "absolute", left: 5, top: 5, width: 40, height: 13, backgroundColor: "#281b46", border: "1px solid #a78bfa"}} />
            <div style={{position: "absolute", left: 10, top: 21, width: 44, height: 3, backgroundColor: "#a78bfa"}} />
            <div style={{position: "absolute", left: 18, top: 8, width: Math.max(1, Math.min(34, typed * 1.6)), height: 1, backgroundColor: PALETTE.cyan, opacity: 0.7}} />
          </div>
          {Array.from({length: 6}, (_, i) => <i key={`key-${i}`} style={{position: "absolute", left: 112 + i * 7, top: 184, width: 3, height: 1, backgroundColor: PALETTE.white, opacity: frame > 24 && frame < 70 && i === Math.floor(frame / 4) % 6 ? 1 : 0.35}} />)}
          {/* Typed user request */}
          <div style={{position: "absolute", left: 19, top: 43, width: 219, height: 48, backgroundColor: "#160f2e", border: `1px solid ${PALETTE.violet}`, boxShadow: "0 0 8px #a78bfa44"}}>
            <div style={{position: "absolute", left: 8, top: 6, color: PALETTE.violet, fontSize: 4, letterSpacing: 0.55}}>YOUR REQUEST</div>
            <div style={{position: "absolute", left: 8, top: 21, color: PALETTE.white, fontSize: 6, lineHeight: 1.5, whiteSpace: "nowrap"}}>{request.slice(0, typed)}{typed < request.length && frame % 12 < 7 ? <span style={{color: PALETTE.pink}}>_</span> : null}</div>
            <div style={{position: "absolute", right: 7, bottom: 7, width: 7, height: 7, backgroundColor: PALETTE.cyan, boxShadow: "0 0 6px #7ee8fa"}}>
              <i style={{position: "absolute", left: 2, top: 3, width: 4, height: 1, backgroundColor: PALETTE.night, transform: "rotate(-35deg)"}} />
            </div>
          </div>
          <div style={{position: "absolute", left: 75, top: 91, width: 9, height: 9, backgroundColor: "#160f2e", borderLeft: `1px solid ${PALETTE.violet}`, borderBottom: `1px solid ${PALETTE.violet}`, transform: "rotate(-45deg)"}} />
          {/* The robot starts assisting after the request is typed. */}
          <div style={{position: "absolute", left: 210, top: 158, width: 37, height: 35, backgroundColor: "#7ee8fa", filter: "blur(13px)", opacity: frame > 62 ? 0.14 + Math.sin(frame / 7) * 0.04 : 0}} />
          <PixelRobot frame={frame} x={215} y={165} scale={1.45} />
          <div style={{position: "absolute", left: 240, top: 162, width: 3, height: 3, backgroundColor: PALETTE.cyan, opacity: frame > 65 ? 0.5 + Math.sin(frame / 3) * 0.4 : 0, boxShadow: `0 0 5px ${PALETTE.cyan}`}} />
          {/* Itinerary checklist */}
          <div style={{position: "absolute", left: 252, top: 46, width: 212, height: 177, backgroundColor: "#17102e", border: `2px solid ${PALETTE.violet}`, boxShadow: "0 0 12px #a78bfa44, inset 0 0 0 1px #7ee8fa33"}} />
          <div style={{position: "absolute", left: 264, top: 56, width: 188, height: 1, background: "linear-gradient(90deg, #a78bfa, #7ee8fa, transparent)"}} />
          <div style={{position: "absolute", left: 265, top: 63, color: PALETTE.white, fontSize: 5, letterSpacing: 0.25}}>TRIP PLAN</div>
          <div style={{position: "absolute", right: 267, top: 62, color: PALETTE.cyan, fontSize: 4, opacity: 0.8}}>{rows.filter((item) => frame >= item.start + 54).length}/3</div>
          {rows.map((item, i) => {
            const y = 81 + i * 44;
            const slide = spring({frame: Math.max(0, frame - item.start), fps, config: {damping: 14, stiffness: 88, mass: 0.65}});
            const slideX = interpolate(slide, [0, 1], [-24, 0]);
            const progress = interpolate(frame, [item.start + 13, item.start + 48], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic)});
            const complete = frame >= item.start + 52;
            return <div key={item.label} style={{position: "absolute", left: 259 + slideX, top: y, width: 196, height: 38, opacity: interpolate(frame, [item.start, item.start + 7], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}), backgroundColor: complete ? "#211940" : "#1c1535", borderBottom: "1px solid #a78bfa44"}}>
              <div style={{position: "absolute", left: 4, top: 7, width: 23, height: 23, backgroundColor: item.color, opacity: 0.1, filter: "blur(6px)"}} />
              <div style={{position: "absolute", left: 5, top: 7, width: 20, height: 20, display: "flex", justifyContent: "center", alignItems: "center", filter: `drop-shadow(0 0 4px ${item.color}88)`}}>
                <TripIcon kind={item.icon} color={item.color} />
              </div>
              <div style={{position: "absolute", left: 32, top: 8, color: complete ? PALETTE.white : "#d9cbed", fontSize: 4.5, letterSpacing: -0.2, whiteSpace: "nowrap"}}>{item.label}</div>
              <div style={{position: "absolute", left: 32, top: 20, width: 105, height: 3, backgroundColor: "#392b58"}} />
              <div style={{position: "absolute", left: 32, top: 20, width: 105 * progress, height: 3, backgroundColor: complete ? PALETTE.cyan : item.color, boxShadow: `0 0 4px ${item.color}`, transformOrigin: "left"}} />
              {complete ? <PixelCheck frame={frame} completeAt={item.start + 52} /> : null}
            </div>;
          })}
          {Array.from({length: 7}, (_, i) => {
            const active = frame > 65 + i * 8;
            const x = 245 + ((frame * (0.7 + i * 0.07) + i * 39) % 16);
            const y = 174 - ((frame * 0.38 + i * 13) % 74);
            return <i key={`work-pixel-${i}`} style={{position: "absolute", left: x, top: y, width: i % 3 === 0 ? 2 : 1, height: i % 3 === 0 ? 2 : 1, backgroundColor: i % 2 ? PALETTE.cyan : PALETTE.yellow, opacity: active ? 0.6 + Math.sin(frame / 4 + i) * 0.25 : 0, boxShadow: "0 0 4px #7ee8fa"}} />;
          })}
        </div>
        <div style={{position: "absolute", left: 16, bottom: 14, color: "#c6b8e5", opacity: 0.75, fontSize: 4, letterSpacing: 0.7}}>05  /  FROM PLAN TO ACTION</div>
        <div style={{position: "absolute", right: 16, bottom: 14, display: "flex", gap: 3, alignItems: "center"}}>
          {Array.from({length: 5}, (_, i) => <i key={i} style={{width: i === 4 ? 9 : 3, height: 2, backgroundColor: i === 4 ? PALETTE.cyan : "#786696"}} />)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SceneSix: React.FC<{revealBlocks?: boolean}> = ({revealBlocks = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const relaxIn = spring({frame, fps, config: {damping: 16, stiffness: 65}});
  const fadeOut = interpolate(frame, [206, 239], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.55, 0, 0.8, 0.4)});
  const sunRows = ["....1111....", "..11111111..", ".1112222111.", "111222222111", "111222222111", "111222222111", ".1112222111.", "..11111111..", "....1111...."];
  const sunColors: Record<string, string> = {"1": PALETTE.yellow, "2": "#ffb877"};
  const personRows = [
    "....1111111.........",
    "...111111111........",
    "..11122222221.......",
    "..111222322221......",
    "..111222222221......",
    "...111111111........",
    "......22............",
    ".....44444444.......",
    "......444444444.....",
    "........444444444...",
    "...........44444444.",
    "..............555555",
    "...............55555",
    "....................",
  ];
  const personColors: Record<string, string> = {"1": "#34214b", "2": "#ffd2cf", "3": PALETTE.night, "4": PALETTE.cyan, "5": PALETTE.violet};
  const revealProgress = interpolate(frame, [0, 17], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic)});
  const revealPath = Array.from({length: 24 * 14}, (_, i) => i)
    .filter((i) => seeded(i + 4718) < revealProgress)
    .map((i) => `M${(i % 24) * 20} ${Math.floor(i / 24) * (270 / 14)}h20v${270 / 14}h-20z`).join("");
  const title = "AI works, you decide.";
  return (
    <AbsoluteFill style={{backgroundColor: "#080610", overflow: "hidden", opacity: fadeOut}}>
      <div style={{...logicalStyle, ...(revealBlocks ? {mask: "url(#scene-six-block-mask)", WebkitMask: "url(#scene-six-block-mask)"} : {})}}>
        {revealBlocks ? <svg width="480" height="270" viewBox="0 0 480 270" style={{position: "absolute", opacity: 0}}><defs><mask id="scene-six-block-mask" x="0" y="0" width="480" height="270" maskUnits="userSpaceOnUse"><rect x="0" y="0" width="480" height="270" fill="black"/><path d={revealPath} fill="white"/></mask></defs></svg> : null}
        <div style={{position: "absolute", inset: 0, background: "linear-gradient(180deg, #1a1033 0%, #342049 35%, #9a5575 60%, #d87983 69%, #59446d 70%, #36294f 84%, #59415b 84%, #42314f 100%)"}} />
        <PixelBackdrop frame={frame} base={false} />
        {/* Sunset sun, reflecting in the pixel ocean */}
        <div style={{position: "absolute", left: 342, top: 75, width: 36, height: 27, filter: "drop-shadow(0 0 9px #ffe27a99)", opacity: interpolate(relaxIn, [0, 1], [0.5, 1])}}>
          {sunRows.map((row, y) => [...row].map((cell, x) => cell === "." ? null : <i key={`${x}-${y}`} style={{position: "absolute", left: x * 3, top: y * 3, width: 3, height: 3, backgroundColor: sunColors[cell]}} />))}
        </div>
        <div style={{position: "absolute", left: 350, top: 166, width: 22, height: 32, background: "linear-gradient(180deg, #ffe27a77, #ff9ecd00)", opacity: 0.42, filter: "blur(5px)"}} />
        {Array.from({length: 17}, (_, i) => {
          const y = 167 + (i * 7) % 31;
          const width = 4 + (i * 11) % 22;
          const drift = (frame * (0.18 + (i % 4) * 0.06) + i * 31) % 500;
          const withinReflection = Math.abs((drift % 480) - 360) < 34;
          return <i key={`wave-${i}`} style={{position: "absolute", left: drift - width, top: y, width, height: i % 4 === 0 ? 2 : 1, backgroundColor: withinReflection ? PALETTE.yellow : i % 3 === 0 ? PALETTE.cyan : PALETTE.pink, opacity: withinReflection ? 0.32 : 0.18 + (Math.sin(frame / 10 + i) + 1) * 0.12}} />;
        })}
        <div style={{position: "absolute", left: 0, top: 206, width: 480, height: 64, background: "linear-gradient(180deg, #59415b, #382846)"}} />
        {Array.from({length: 20}, (_, i) => {
          const x = seeded(i + 600) * 480;
          const y = 210 + seeded(i + 700) * 58;
          const drift = (frame * (0.08 + seeded(i + 800) * 0.09) + i * 21) % 8;
          return <i key={`sand-pixel-${i}`} style={{position: "absolute", left: x + drift, top: y, width: i % 5 === 0 ? 2 : 1, height: 1, backgroundColor: i % 2 ? PALETTE.pink : PALETTE.yellow, opacity: 0.25 + (Math.sin(frame / 12 + i) + 1) * 0.12}} />;
        })}
        {/* A reclining pixel lounger, framed in bright beach-chair stripes. */}
        <svg width="148" height="88" viewBox="0 0 148 88" shapeRendering="crispEdges" style={{position: "absolute", left: 44, top: 132, overflow: "visible", opacity: interpolate(relaxIn, [0, 1], [0, 1])}}>
          <path d="M17 4L60 53L104 53M56 49L45 82M104 53L120 82M20 8L60 53" fill="none" stroke="#231936" strokeWidth="4" />
          <path d="M20 8L60 53L104 53" fill="none" stroke={PALETTE.cyan} strokeWidth="2" />
          <path d="M27 17l5-4 6 7-5 4zM40 32l5-4 6 7-5 4zM53 46l5-4 6 7-5 4z" fill={PALETTE.pink} />
          <path d="M63 52h39v5H63z" fill={PALETTE.yellow} />
          <path d="M69 58l-4 18M99 58l13 18" stroke="#a78bfa" strokeWidth="2" />
        </svg>
        <div style={{position: "absolute", left: 64, top: 137 + Math.sin(frame / 12) * 0.4, width: 60, height: 42, opacity: interpolate(relaxIn, [0, 1], [0.3, 1]), filter: "drop-shadow(0 0 4px #a78bfa55)"}}>
          {personRows.map((row, y) => [...row].map((cell, x) => cell === "." ? null : <i key={`${x}-${y}`} style={{position: "absolute", left: x * 3, top: y * 3, width: 3, height: 3, backgroundColor: personColors[cell]}} />))}
        </div>
        {/* A tiny tropical drink beside the lounger. */}
        <div style={{position: "absolute", left: 179, top: 179, width: 9, height: 12, backgroundColor: PALETTE.pink, clipPath: "polygon(8% 0, 92% 0, 78% 100%, 22% 100%)", boxShadow: "0 0 4px #ff9ecd"}} />
        <div style={{position: "absolute", left: 184, top: 173, width: 1, height: 10, backgroundColor: PALETTE.yellow, rotate: "-18deg"}} />
        {/* The robot stays busy at a small background workstation. */}
        <div style={{position: "absolute", left: 325, top: 98, width: 131, height: 57, backgroundColor: "#160f2e", border: `1px solid ${PALETTE.violet}`, boxShadow: "0 0 7px #a78bfa55"}}>
          <div style={{position: "absolute", left: 8, top: 7, color: PALETTE.cyan, fontSize: 4, letterSpacing: 0.1}}>WORKING...</div>
          {Array.from({length: 4}, (_, i) => <div key={`code-row-${i}`} style={{position: "absolute", left: 9, top: 19 + i * 7, width: 32 + (i * 19 + Math.floor(frame / 8) * 3) % 62, height: 2, backgroundColor: i % 2 ? PALETTE.pink : PALETTE.violet, opacity: 0.5 + Math.sin(frame / 6 + i) * 0.2}} />)}
          <div style={{position: "absolute", right: 9, top: 21, width: 18, height: 18, border: `1px solid ${PALETTE.cyan}`, opacity: 0.65}}>
            <div style={{position: "absolute", left: 4, top: 5, width: 8, height: 4, borderLeft: `2px solid ${PALETTE.yellow}`, borderBottom: `2px solid ${PALETTE.yellow}`, rotate: "-45deg"}} />
          </div>
          <div style={{position: "absolute", left: 0, bottom: -3, width: 131, height: 3, backgroundColor: PALETTE.violet}} />
        </div>
        <div style={{position: "absolute", left: 344, top: 158, width: 93, height: 6, backgroundColor: "#a78bfa", boxShadow: "0 2px 0 #20142f, 0 0 7px #a78bfa77"}} />
        <div style={{position: "absolute", left: 354, top: 164, width: 5, height: 23, backgroundColor: "#6f5b86"}} />
        <div style={{position: "absolute", left: 420, top: 164, width: 5, height: 23, backgroundColor: "#6f5b86"}} />
        <div style={{position: "absolute", left: 331, top: 156, width: 49, height: 48, background: "#a78bfa", filter: "blur(13px)", opacity: 0.14 + Math.sin(frame / 7) * 0.04}} />
        <PixelRobot frame={frame} x={333} y={144} scale={1.45} />
        {Array.from({length: 12}, (_, i) => {
          const x = (seeded(i + 900) * 480 + frame * (0.09 + (i % 5) * 0.025)) % 490;
          const y = (seeded(i + 1000) * 230 - frame * (0.12 + (i % 4) * 0.025) + 270) % 255;
          const size = i % 4 === 0 ? 2 : 1;
          return <i key={`float-${i}`} style={{position: "absolute", left: x, top: y, width: size, height: size, backgroundColor: i % 3 === 0 ? PALETTE.yellow : i % 2 === 0 ? PALETTE.pink : PALETTE.cyan, opacity: 0.28 + (Math.sin(frame / 8 + i * 3) + 1) * 0.3, boxShadow: size === 2 ? "0 0 4px #7ee8fa" : "none"}} />;
        })}
        <div style={{position: "absolute", left: 63, top: 33, width: 354, textAlign: "center", fontSize: 7.5, lineHeight: 1.8, color: PALETTE.white, textShadow: "0 0 9px #a78bfa99"}}>
          {title.split("").map((char, i) => {
            const startAt = 39 + i * 1.5;
            const charSpring = spring({frame: Math.max(0, frame - startAt), fps, config: {damping: 12, stiffness: 130, mass: 0.45}});
            const shown = frame >= startAt;
            return <span key={`${char}-${i}`} style={{display: "inline-block", opacity: shown ? interpolate(charSpring, [0, 1], [0, 1]) : 0, scale: shown ? interpolate(charSpring, [0, 1], [0.5, 1]) : 0.5, translate: `0 ${shown ? interpolate(charSpring, [0, 1], [3, 0]) : 3}px`, color: i > 11 ? PALETTE.pink : PALETTE.white}}>{char === " " ? "\u00a0" : char}</span>;
          })}
        </div>
        {Array.from({length: 12}, (_, i) => {
          const shown = frame >= 37 + i * 1.5 && frame < 53 + i * 1.5;
          if (!shown) return null;
          const x = 135 + i * 17;
          const y = 44 + (i % 3) * 3;
          const opacity = interpolate(frame - (37 + i * 1.5), [0, 9], [0.8, 0], {extrapolateRight: "clamp"});
          return <i key={`reveal-glint-${i}`} style={{position: "absolute", left: x, top: y, width: 2, height: 2, backgroundColor: i % 2 ? PALETTE.cyan : PALETTE.yellow, opacity, boxShadow: "0 0 4px #ffe27a"}} />;
        })}
        <div style={{position: "absolute", left: 16, bottom: 14, color: "#c6b8e5", opacity: 0.75, fontSize: 4, letterSpacing: 0.7}}>06  /  HUMAN IN CONTROL</div>
        <div style={{position: "absolute", right: 16, bottom: 14, display: "flex", gap: 3, alignItems: "center"}}>
          {Array.from({length: 5}, (_, i) => <i key={i} style={{width: i === 4 ? 9 : 3, height: 2, backgroundColor: i === 4 ? PALETTE.pink : "#786696"}} />)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const UnbuiltScene: React.FC<{index: number}> = ({index}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: `radial-gradient(ellipse at ${30 + index * 9}% ${42 + index * 4}%, #362253, ${PALETTE.night} 72%)`, opacity: interpolate(frame, [0, 10], [0, 1], {extrapolateRight: "clamp"})}} />;
};

export const MyComponent: React.FC = () => {
  const frame = useCurrentFrame();
  const sfx = [
    ...[162, 384, 606, 828, 1170].map((from, i) => ({file: "whoosh.wav", from, duration: 28, name: `Transition whoosh ${i + 1}`, volume: 0.53})),
    {file: "pop.wav", from: 7, duration: 9, name: "Robot wakes", volume: 0.55},
    {file: "pop.wav", from: 162, duration: 9, name: "Brain pops in", volume: 0.55},
    {file: "pop.wav", from: 169, duration: 9, name: "Speech bubble pops in", volume: 0.48},
    ...[384, 403, 417, 431, 445].map((from, i) => ({file: "pop.wav", from, duration: 9, name: `Tool icon pops ${i + 1}`, volume: 0.53})),
    ...[620, 623, 626].map((from, i) => ({file: "pop.wav", from, duration: 9, name: `Loop node pops ${i + 1}`, volume: 0.5})),
    ...[919, 991, 1063].map((from, i) => ({file: "pop.wav", from, duration: 9, name: `Checklist icon slides ${i + 1}`, volume: 0.52})),
    {file: "pop.wav", from: 828, duration: 9, name: "Human settles at desk", volume: 0.46},
    {file: "pop.wav", from: 1178, duration: 9, name: "Beach chair reveal", volume: 0.45},
    ..."Hi! I can only chat...".split("").map((_, i) => ({file: "type.wav", from: 162 + 23 + i * 2, duration: 3, name: `Chat typing ${i + 1}`, volume: 0.42})),
    ..."Plan my trip to Bali".split("").map((_, i) => ({file: "type.wav", from: 828 + 25 + i * 2, duration: 3, name: `Trip prompt typing ${i + 1}`, volume: 0.42})),
    ...[51, 65, 79, 93].map((at, i) => ({file: "blip.wav", from: 384 + at, duration: 8, name: `Tool connection ${i + 1}`, volume: 0.55})),
    ...[54, 65, 76].map((at, i) => ({file: "blip.wav", from: 606 + at, duration: 8, name: `Loop data connection ${i + 1}`, volume: 0.52})),
    {file: "rise.wav", from: 626, duration: 180, name: "Agent loop rising tone", volume: 0.32},
    ...[971, 1043, 1115].map((from, i) => ({file: "ding.wav", from, duration: 29, name: `Checklist checkmark ${i + 1}`, volume: 0.6})),
    {file: "chime.wav", from: 1242, duration: 54, name: "Closing tagline chime", volume: 0.55},
  ];
  return (
  <AbsoluteFill style={{backgroundColor: "#080610"}}>
    <Sequence name="Chiptune music bed" from={0} durationInFrames={1500} layout="none">
      <Audio
        src={staticFile("sfx/bgm.wav")}
        volume={interpolate(frame, [0, 90, 1410, 1500], [0, 0.25, 0.25, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.ease)})}
      />
    </Sequence>
    <Sequence from={1170} durationInFrames={240} name="Scene 6 — Human in control"><SceneSix /></Sequence>
    <Sequence from={828} durationInFrames={360} name="Scene 5 — From plan to action"><SceneFive /></Sequence>
    <Sequence from={606} durationInFrames={240} name="Scene 4 — The agent loop"><SceneFour /></Sequence>
    <Sequence from={384} durationInFrames={240} name="Scene 3 — Tools join the loop"><SceneThree /></Sequence>
    <Sequence from={162} durationInFrames={240} name="Scene 2 — A voice, no hands"><SceneTwo /></Sequence>
    <Sequence from={0} durationInFrames={180} name="Scene 1 — The question"><SceneOne /></Sequence>
    <Sequence from={162} durationInFrames={18} name="Pixel block dissolve"><SceneTwo revealBlocks /></Sequence>
    <Sequence from={384} durationInFrames={18} name="Pixel block dissolve"><SceneThree revealBlocks /></Sequence>
    <Sequence from={606} durationInFrames={18} name="Pixel block dissolve"><SceneFour revealBlocks /></Sequence>
    <Sequence from={828} durationInFrames={18} name="Pixel block dissolve"><SceneFive revealBlocks /></Sequence>
    <Sequence from={1170} durationInFrames={18} name="Pixel block dissolve"><SceneSix revealBlocks /></Sequence>
    {sfx.map((sound) => <SoundEffect key={`${sound.name}-${sound.from}`} {...sound} />)}
  </AbsoluteFill>
  );
};
