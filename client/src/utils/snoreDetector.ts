import { processAudioBuffer } from './audioProcessor';

export class SnoreDetector {
  private static ENERGY_THRESHOLD = 0.1;
  private static FREQ_MIN = 40; // Hz
  private static FREQ_MAX = 300; // Hz

  static isSnoring(audioBuffer: Float32Array): boolean {
    const { energy, frequency } = processAudioBuffer(audioBuffer);
    
    return energy > this.ENERGY_THRESHOLD &&
           frequency >= this.FREQ_MIN &&
           frequency <= this.FREQ_MAX;
  }
}