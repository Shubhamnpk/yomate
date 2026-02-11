
import * as Tone from 'tone';

// Professional-grade procedural ambient synthesis management
// Handles resource lifecycle to prevent race conditions during sound switching.

let currentSources: any[] = [];
let birdInterval: number | null = null;
let currentMainGain: Tone.Gain | null = null;

export type NoiseType = 'rain' | 'river' | 'wind' | 'ocean' | 'forest' | 'campfire' | 'off';

const cleanupImmediate = () => {
  if (birdInterval) {
    clearInterval(birdInterval);
    birdInterval = null;
  }

  currentSources.forEach(source => {
    try {
      if (source && source.dispose) {
        if (source.stop) source.stop();
        source.dispose();
      }
    } catch (e) {
      console.warn("Error disposing Tone node:", e);
    }
  });
  currentSources = [];

  if (currentMainGain) {
    try {
      currentMainGain.dispose();
    } catch (e) { }
    currentMainGain = null;
  }
};

export const playNoise = async (type: NoiseType) => {
  // Ensure AudioContext is started (requires user gesture)
  await Tone.start();

  // 1. Force immediate cleanup before starting new sound
  cleanupImmediate();

  if (type === 'off') return;

  // 2. Setup Main Gain for the new sound
  const mainGain = new Tone.Gain(0).toDestination();
  currentMainGain = mainGain;

  try {
    if (type === 'rain') {
      const noise = new Tone.Noise("brown").start();
      const filter = new Tone.AutoFilter({
        frequency: 0.1,
        baseFrequency: 600,
        octaves: 2,
        filter: { type: "lowpass", Q: 1, rolloff: -12 }
      }).connect(mainGain).start();
      noise.connect(filter);

      const patter = new Tone.Noise("pink").start();
      const patterFilter = new Tone.Filter(2000, "highpass").connect(mainGain);
      patter.connect(patterFilter);

      currentSources.push(noise, filter, patter, patterFilter);
      mainGain.gain.rampTo(0.15, 2);
    }
    else if (type === 'river') {
      const noise = new Tone.Noise("pink").start();
      const filter = new Tone.AutoFilter({
        frequency: 0.05,
        baseFrequency: 400,
        octaves: 4,
        type: "sine"
      }).connect(mainGain).start();
      noise.connect(filter);

      const gurgleRes = new Tone.Filter({
        frequency: 800,
        type: "bandpass",
        Q: 10
      }).connect(mainGain);

      const lfo = new Tone.LFO(0.2, 400, 1200).connect(gurgleRes.frequency).start();
      noise.connect(gurgleRes);

      currentSources.push(noise, filter, gurgleRes, lfo);
      mainGain.gain.rampTo(0.12, 2);
    }
    else if (type === 'wind') {
      const noise = new Tone.Noise("pink").start();
      const filter = new Tone.AutoFilter({
        frequency: 0.05,
        baseFrequency: 200,
        octaves: 5,
        filter: { type: "lowpass", rolloff: -24, Q: 1 }
      }).connect(mainGain).start();
      noise.connect(filter);

      currentSources.push(noise, filter);
      mainGain.gain.rampTo(0.2, 3);
    }
    else if (type === 'ocean') {
      const noise = new Tone.Noise("brown").start();
      const filter = new Tone.Filter(400, "lowpass").connect(mainGain);
      const waveLfo = new Tone.LFO(0.1, 0.02, 0.15).connect(mainGain.gain).start();
      noise.connect(filter);

      currentSources.push(noise, filter, waveLfo);
    }
    else if (type === 'forest') {
      const noise = new Tone.Noise("pink").start();
      const filter = new Tone.Filter(600, "lowpass").connect(mainGain);
      noise.connect(filter);

      // Bird Synthesis logic fixed: use an envelope ONLY
      const birdOsc = new Tone.Oscillator("sine");
      const birdEnv = new Tone.AmplitudeEnvelope({
        attack: 0.01,
        decay: 0.3,
        sustain: 0,
        release: 0.2
      }).connect(mainGain);
      birdOsc.connect(birdEnv);
      birdOsc.start();

      currentSources.push(noise, filter, birdOsc, birdEnv);
      mainGain.gain.rampTo(0.15, 2); // Boosted forest volume

      birdInterval = window.setInterval(() => {
        if (Math.random() > 0.6) {
          const freq = 1500 + Math.random() * 3500;
          birdOsc.frequency.setValueAtTime(freq, Tone.now());
          birdOsc.frequency.exponentialRampToValueAtTime(freq * 0.7, Tone.now() + 0.15);
          birdEnv.triggerAttackRelease(0.2);
        }
      }, 4000);
    }
    else if (type === 'campfire') {
      // Campfire: Brown noise base + Stochastic high-pass crackles
      const baseNoise = new Tone.Noise("brown").start();
      const baseFilter = new Tone.Filter(200, "lowpass").connect(mainGain);
      baseNoise.connect(baseFilter);

      const crackleNoise = new Tone.Noise("white").start();
      const crackleEnv = new Tone.AmplitudeEnvelope({
        attack: 0.001,
        decay: 0.01,
        sustain: 0,
        release: 0.01
      }).connect(mainGain);
      const crackleFilter = new Tone.Filter(4000, "highpass").connect(crackleEnv);
      crackleNoise.connect(crackleFilter);

      currentSources.push(baseNoise, baseFilter, crackleNoise, crackleEnv, crackleFilter);
      mainGain.gain.rampTo(0.15, 2);

      birdInterval = window.setInterval(() => {
        if (Math.random() > 0.4) {
          crackleEnv.triggerAttackRelease(0.01);
        }
      }, 100);
    }
  } catch (err) {
    console.error("Failed to start ambient sound:", err);
    cleanupImmediate();
  }
};

export const stopNoise = () => {
  if (currentMainGain) {
    currentMainGain.gain.rampTo(0, 1.2);

    const sourcesToDispose = [...currentSources];
    const gainToDispose = currentMainGain;
    const intervalToClear = birdInterval;

    setTimeout(() => {
      if (currentMainGain === gainToDispose) {
        cleanupImmediate();
      } else {
        if (intervalToClear) clearInterval(intervalToClear);
        sourcesToDispose.forEach(s => { try { if (s.dispose) s.dispose(); } catch (e) { } });
        try { if (gainToDispose.dispose) gainToDispose.dispose(); } catch (e) { }
      }
    }, 1500);
  }
};

export const setVolume = (val: number) => {
  if (currentMainGain) {
    currentMainGain.gain.rampTo(val, 0.5);
  }
};

export const playSuccessTink = async () => {
  await Tone.start();
  const synth = new Tone.PolySynth(Tone.Synth).toDestination();
  synth.set({
    oscillator: { type: "sine" },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 }
  });

  const now = Tone.now();
  synth.triggerAttackRelease("C6", "16n", now);
  synth.triggerAttackRelease("E6", "16n", now + 0.05);
  setTimeout(() => synth.dispose(), 500);
};
