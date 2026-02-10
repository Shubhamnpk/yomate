
// Generates noise using Web Audio API (No external files needed)

let audioCtx: AudioContext | null = null;
let noiseSource: AudioBufferSourceNode | null = null;
let gainNode: GainNode | null = null;

export type NoiseType = 'brown' | 'pink' | 'white' | 'off';

const createNoiseBuffer = (ctx: AudioContext) => {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Fill buffer with white noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
};

export const playNoise = (type: NoiseType) => {
  if (type === 'off') {
    stopNoise();
    return;
  }

  // Init context if needed
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  // Stop existing noise
  if (noiseSource) {
    noiseSource.stop();
    noiseSource.disconnect();
  }

  const buffer = createNoiseBuffer(audioCtx);
  noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;

  // Create filter for color
  const filter = audioCtx.createBiquadFilter();
  
  if (type === 'brown') {
    filter.type = 'lowpass';
    filter.frequency.value = 400; 
  } else if (type === 'pink') {
    filter.type = 'lowpass';
    filter.frequency.value = 1000; // Rough approximation
  } else {
    // White noise (no filter or high shelf)
    filter.type = 'allpass';
  }

  gainNode = audioCtx.createGain();
  // Adjust volume to be subtle
  gainNode.gain.value = 0.05;

  noiseSource.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  noiseSource.start();
};

export const stopNoise = () => {
  if (noiseSource) {
    try {
      noiseSource.stop();
      noiseSource.disconnect();
    } catch (e) {
      // Ignore if already stopped
    }
    noiseSource = null;
  }
  if (gainNode) {
    gainNode.disconnect();
    gainNode = null;
  }
};

export const setVolume = (val: number) => {
  if (gainNode) {
    gainNode.gain.setValueAtTime(val, audioCtx?.currentTime || 0);
  }
};
