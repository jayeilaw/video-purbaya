#!/usr/bin/env node
/*
 * Generate the project's replaceable, synth-made 8-bit WAV sound library.
 * Run with: node scripts/make-sfx.js
 */
const fs = require("node:fs");
const path = require("node:path");

const SAMPLE_RATE = 22050;
const OUT = path.join(__dirname, "..", "public", "sfx");
const TAU = Math.PI * 2;

const clamp = (x, min = -1, max = 1) => Math.max(min, Math.min(max, x));
const fract = (x) => x - Math.floor(x);
const hash = (n) => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453123);

const osc = (shape, hz, t) => {
  const phase = fract(hz * t);
  if (shape === "square") return phase < 0.5 ? 1 : -1;
  if (shape === "pulse") return phase < 0.34 ? 1 : -1;
  if (shape === "triangle") return 1 - 4 * Math.abs(phase - 0.5);
  return Math.sin(TAU * phase);
};

const envelope = (t, duration, attack = 0.005, release = 0.04) => {
  const a = Math.min(1, t / Math.max(attack, 0.0001));
  const r = Math.min(1, Math.max(0, duration - t) / Math.max(release, 0.0001));
  return Math.min(a, r);
};

const writeWav = (name, duration, sampler) => {
  const count = Math.round(SAMPLE_RATE * duration);
  const dataSize = count;
  const wav = Buffer.alloc(44 + dataSize);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(36 + dataSize, 4);
  wav.write("WAVE", 8);
  wav.write("fmt ", 12);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(SAMPLE_RATE, 24);
  wav.writeUInt32LE(SAMPLE_RATE, 28);
  wav.writeUInt16LE(1, 32);
  wav.writeUInt16LE(8, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < count; i++) {
    const t = i / SAMPLE_RATE;
    // Store true unsigned 8-bit PCM, centered around the WAV silence value 128.
    const quantized = Math.round(clamp(sampler(t, i)) * 127) / 127;
    wav.writeUInt8(Math.max(0, Math.min(255, 128 + Math.round(quantized * 127))), 44 + i);
  }
  fs.writeFileSync(path.join(OUT, name), wav);
  console.log(`${name} (${duration.toFixed(2)}s)`);
};

fs.mkdirSync(OUT, {recursive: true});

writeWav("type.wav", 0.052, (t) => {
  const env = envelope(t, 0.052, 0.001, 0.032);
  const tick = t < 0.009 ? (hash(Math.floor(t * SAMPLE_RATE)) - 0.5) * 0.34 : 0;
  return env * (0.22 * osc("square", 1380 - 320 * (t / 0.052), t) + tick);
});

writeWav("blip.wav", 0.12, (t) => {
  const env = envelope(t, 0.12, 0.004, 0.085);
  const hz = 760 + 560 * Math.min(1, t / 0.12);
  return env * (0.28 * osc("triangle", hz, t) + 0.11 * osc("square", hz * 2, t));
});

writeWav("pop.wav", 0.14, (t) => {
  const env = envelope(t, 0.14, 0.002, 0.1);
  const hz = 220 - 115 * (t / 0.14);
  return env * (0.34 * osc("triangle", hz, t) + 0.07 * osc("square", hz * 0.5, t));
});

let whooshState = 0;
writeWav("whoosh.wav", 0.46, (t, i) => {
  const p = t / 0.46;
  const env = Math.sin(Math.PI * p) ** 1.2;
  const white = hash(i + 51) * 2 - 1;
  const cutoff = 0.025 + (1 - p) * 0.16;
  whooshState += cutoff * (white - whooshState);
  return env * (0.48 * whooshState + 0.08 * osc("triangle", 180 + 90 * p, t));
});

writeWav("rise.wav", 3, (t) => {
  const step = Math.min(11, Math.floor(t / 0.25));
  const note = 220 * Math.pow(2, step / 12);
  const stepT = t % 0.25;
  const noteEnv = envelope(stepT, 0.25, 0.008, 0.05) * (0.65 + 0.35 * Math.sin((step / 12) * Math.PI));
  const swell = 0.55 + 0.45 * (t / 3);
  return noteEnv * swell * (0.2 * osc("triangle", note, t) + 0.07 * osc("square", note * 0.5, t));
});

writeWav("ding.wav", 0.48, (t) => {
  const env = envelope(t, 0.48, 0.002, 0.39);
  const shimmer = Math.exp(-t * 5);
  return env * (0.22 * osc("triangle", 1046.5, t) + 0.13 * osc("triangle", 1568, t) * shimmer + 0.05 * osc("square", 2093, t) * shimmer);
});

writeWav("chime.wav", 0.9, (t) => {
  const env = envelope(t, 0.9, 0.012, 0.76);
  const shimmer = Math.exp(-t * 2.6);
  return env * (0.16 * osc("triangle", 659.25, t) + 0.11 * osc("triangle", 783.99, t) * shimmer + 0.08 * osc("sine", 987.77, t) * shimmer);
});

const chordRoots = [130.81, 110, 87.31, 98, 130.81];
const melody = [
  [523.25, 392, 440, 523.25],
  [440, 523.25, 659.25, 523.25],
  [349.23, 440, 523.25, 440],
  [392, 493.88, 587.33, 493.88],
  [523.25, 392, 329.63, 392],
];
let bgmNoiseState = 0;
writeWav("bgm.wav", 25, (t, i) => {
  const barPosition = t % 5;
  const bar = Math.floor(barPosition);
  const beatPosition = barPosition % 1;
  const beat = Math.floor(beatPosition * 2);
  const step = Math.min(3, Math.floor((beatPosition % 0.5) / 0.125));
  const root = chordRoots[bar];
  const bassHz = root * (beat === 0 ? 1 : 1.5);
  const melodyHz = melody[bar][step];
  const beatEnv = envelope(beatPosition % 0.5, 0.42, 0.01, 0.15);
  const melodyEnv = envelope((beatPosition % 0.5) % 0.125, 0.115, 0.007, 0.07);
  const noise = hash(i + 501) * 2 - 1;
  bgmNoiseState += 0.035 * (noise - bgmNoiseState);
  const softTick = (beatPosition % 0.5) < 0.035 ? bgmNoiseState * 0.035 : 0;
  return 0.18 * osc("triangle", bassHz, t) * beatEnv
    + 0.085 * osc("triangle", melodyHz, t) * melodyEnv
    + 0.025 * osc("square", melodyHz * 2, t) * melodyEnv
    + softTick;
});
