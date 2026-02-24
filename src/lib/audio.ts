/**
 * Placeholder audio using Web Audio API (sine waves).
 * Later replace with real audio files via Howler.js.
 */

let audioContext: AudioContext | null = null;
let currentOscillator: OscillatorNode | null = null;
let currentGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioContext;
}

export type VoteOption = "option1" | "option2";

const FREQUENCIES: Record<VoteOption, number> = {
  option1: 440, // A4
  option2: 523, // C5
};

const DURATION_SEC = 2;

/**
 * Play placeholder audio for the given option:
 * - option1: 440Hz (A4) for 2s with fade in/out
 * - option2: 523Hz (C5) for 2s with fade in/out
 */
export function playOptionAudio(option: VoteOption): void {
  stopAudio();

  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(FREQUENCIES[option], ctx.currentTime);
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);
  gainNode.gain.setValueAtTime(0.2, now + 0.1);
  gainNode.gain.linearRampToValueAtTime(0, now + DURATION_SEC);

  oscillator.start(now);
  oscillator.stop(now + DURATION_SEC);

  currentOscillator = oscillator;
  currentGain = gainNode;
}

/**
 * Stop any currently playing placeholder audio.
 */
export function stopAudio(): void {
  if (currentOscillator) {
    try {
      currentOscillator.stop();
      currentOscillator.disconnect();
    } catch {
      // already stopped
    }
    currentOscillator = null;
  }
  currentGain = null;
}
