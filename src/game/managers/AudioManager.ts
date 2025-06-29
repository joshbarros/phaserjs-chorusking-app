import { Howl, Howler } from 'howler';
import type { AudioLayer, BeatSyncData } from '../types/GameTypes';
import { AUDIO_CONFIG } from '../utils/Constants';

export class AudioManager {
  private musicLayers: Map<string, AudioLayer> = new Map();
  private sfxPool: Map<string, Howl> = new Map();
  private beatSync: BeatSyncData;
  private isPlaying = false;
  private masterVolume = 1.0;
  private musicVolume = 0.8;
  private sfxVolume = 1.0;

  constructor() {
    this.beatSync = {
      bpm: AUDIO_CONFIG.DEFAULT_BPM,
      nextBeat: 0,
      currentBeat: 0,
      subdivision: AUDIO_CONFIG.BEAT_SUBDIVISION,
      timeSignature: 4
    };

    this.setupHowler();
    this.initializeSounds();
  }

  private setupHowler() {
    // Set global volume higher
    Howler.volume(1.0);
    
    // Unlock audio on first user interaction
    const unlockAudio = () => {
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }
      // Remove listeners after first unlock
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
      console.log('Audio unlocked!');
    };
    
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    
    // Handle page visibility for audio context
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        Howler.mute(true);
      } else {
        Howler.mute(false);
      }
    });
  }

  private initializeSounds() {
    // Create placeholder sounds using Web Audio API since we don't have audio files yet
    this.createPlaceholderSounds();
    this.createBackgroundMusic();
  }

  private createPlaceholderSounds() {
    // Create more impactful sound effects with higher volumes
    
    // Jump sound - punchy with pitch bend
    const jumpSound = new Howl({
      src: [this.generateJumpSoundDataURL()],
      volume: 0.8
    });
    this.sfxPool.set('jump', jumpSound);

    // Note collection sound - bright and musical
    const noteSound = new Howl({
      src: [this.generateNoteSoundDataURL()],
      volume: 0.9
    });
    this.sfxPool.set('note', noteSound);

    // Death sound - dramatic descending tone
    const deathSound = new Howl({
      src: [this.generateDeathSoundDataURL()],
      volume: 0.7
    });
    this.sfxPool.set('death', deathSound);

    // Explosion sound for enemies
    const explosionSound = new Howl({
      src: [this.generateExplosionSoundDataURL()],
      volume: 0.8
    });
    this.sfxPool.set('explosion', explosionSound);

    // Projectile shoot sound
    const shootSound = new Howl({
      src: [this.generateShootSoundDataURL()],
      volume: 0.6
    });
    this.sfxPool.set('shoot', shootSound);
  }

  private createBackgroundMusic() {
    // Create multiple music layers for dynamic composition with higher volumes
    const bassDrumSound = new Howl({
      src: [this.generateRhythmDataURL(120, 4.0, 'bass')], // 120 BPM, louder
      loop: true,
      volume: 0.7
    });

    const melodySound = new Howl({
      src: [this.generateMelodyDataURL()],
      loop: true,
      volume: 0.6
    });

    const synthSound = new Howl({
      src: [this.generateSynthDataURL()],
      loop: true,
      volume: 0.5
    });

    // Add to music layers with higher volumes
    this.musicLayers.set('bass', {
      name: 'bass',
      sound: bassDrumSound,
      volume: 0.7,
      active: false
    });

    this.musicLayers.set('melody', {
      name: 'melody',
      sound: melodySound,
      volume: 0.6,
      active: false
    });

    this.musicLayers.set('synth', {
      name: 'synth',
      sound: synthSound,
      volume: 0.5,
      active: false
    });
  }

  private generateRhythmDataURL(bpm: number, duration: number, type: 'bass' | 'snare'): string {
    const sampleRate = 44100;
    const samples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);

    // WAV header
    this.writeWavHeader(view, samples);

    const beatInterval = sampleRate * (60 / bpm);
    
    for (let i = 0; i < samples; i++) {
      let sample = 0;
      
      // Create kick drum pattern
      if (type === 'bass') {
        const beatPosition = i % beatInterval;
        if (beatPosition < sampleRate * 0.1) {
          const freq = 60 + (1 - beatPosition / (sampleRate * 0.1)) * 40;
          sample = Math.sin(2 * Math.PI * freq * i / sampleRate) * 
                  Math.exp(-beatPosition / (sampleRate * 0.05)) * 0.8;
        }
      }
      
      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(44 + i * 2, intSample, true);
    }

    const blob = new Blob([view], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  private generateMelodyDataURL(): string {
    const sampleRate = 44100;
    const duration = 4.0; // 4 second loop
    const samples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);

    this.writeWavHeader(view, samples);

    // Simple melody pattern
    const notes = [440, 523, 659, 523, 440, 349, 440, 523]; // A4, C5, E5, C5, A4, F4, A4, C5
    const noteLength = samples / notes.length;

    for (let i = 0; i < samples; i++) {
      const noteIndex = Math.floor(i / noteLength);
      const freq = notes[noteIndex];
      const fadeIn = Math.min(1, (i % noteLength) / (noteLength * 0.1));
      const fadeOut = Math.min(1, ((noteLength - (i % noteLength)) / (noteLength * 0.1)));
      const envelope = Math.min(fadeIn, fadeOut);
      
      const sample = Math.sin(2 * Math.PI * freq * i / sampleRate) * envelope * 0.3;
      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(44 + i * 2, intSample, true);
    }

    const blob = new Blob([view], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  private generateSynthDataURL(): string {
    const sampleRate = 44100;
    const duration = 8.0;
    const samples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);

    this.writeWavHeader(view, samples);

    for (let i = 0; i < samples; i++) {
      // Create a slow evolving synth pad
      const t = i / sampleRate;
      const freq1 = 220 + Math.sin(t * 0.5) * 20;
      const freq2 = 330 + Math.cos(t * 0.3) * 15;
      
      const sample = (Math.sin(2 * Math.PI * freq1 * t) + 
                     Math.sin(2 * Math.PI * freq2 * t) * 0.5) * 0.15;
      
      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(44 + i * 2, intSample, true);
    }

    const blob = new Blob([view], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  private writeWavHeader(view: DataView, samples: number) {
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 44100, true);
    view.setUint32(28, 44100 * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
  }

  // New improved sound generation methods
  private generateJumpSoundDataURL(): string {
    const sampleRate = 44100;
    const duration = 0.15;
    const samples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);

    this.writeWavHeader(view, samples);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      // Pitch bend from 200Hz to 400Hz
      const freq = 200 + (t / duration) * 200;
      const envelope = Math.exp(-t * 8); // Quick decay
      const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.6;
      
      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(44 + i * 2, intSample, true);
    }

    const blob = new Blob([view], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  private generateNoteSoundDataURL(): string {
    const sampleRate = 44100;
    const duration = 0.3;
    const samples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);

    this.writeWavHeader(view, samples);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      // Bright harmonic chord
      const fundamental = 523; // C5
      const harmony1 = fundamental * 1.25; // E5
      const harmony2 = fundamental * 1.5;  // G5
      
      const envelope = Math.exp(-t * 3);
      const sample = (
        Math.sin(2 * Math.PI * fundamental * t) * 0.5 +
        Math.sin(2 * Math.PI * harmony1 * t) * 0.3 +
        Math.sin(2 * Math.PI * harmony2 * t) * 0.2
      ) * envelope * 0.7;
      
      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(44 + i * 2, intSample, true);
    }

    const blob = new Blob([view], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  private generateDeathSoundDataURL(): string {
    const sampleRate = 44100;
    const duration = 0.8;
    const samples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);

    this.writeWavHeader(view, samples);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      // Descending tone from 400Hz to 100Hz
      const freq = 400 - (t / duration) * 300;
      const envelope = Math.exp(-t * 2);
      const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.5;
      
      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(44 + i * 2, intSample, true);
    }

    const blob = new Blob([view], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  private generateExplosionSoundDataURL(): string {
    const sampleRate = 44100;
    const duration = 0.4;
    const samples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);

    this.writeWavHeader(view, samples);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      // Noise-based explosion with filtering
      const noise = (Math.random() * 2 - 1);
      const lpf = Math.exp(-t * 10); // Low-pass filter effect
      const envelope = Math.exp(-t * 6);
      const sample = noise * lpf * envelope * 0.6;
      
      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(44 + i * 2, intSample, true);
    }

    const blob = new Blob([view], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  private generateShootSoundDataURL(): string {
    const sampleRate = 44100;
    const duration = 0.1;
    const samples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);

    this.writeWavHeader(view, samples);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      // Quick laser-like sound
      const freq = 800 + Math.sin(t * 100) * 200;
      const envelope = Math.exp(-t * 15);
      const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4;
      
      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(44 + i * 2, intSample, true);
    }

    const blob = new Blob([view], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  // Public method to start the background music
  startBackgroundMusic() {
    console.log('Starting background music...');
    this.playMusicLayer('bass');
    
    // Gradually add layers
    setTimeout(() => this.fadeInMusicLayer('synth', 2000), 2000);
    setTimeout(() => this.fadeInMusicLayer('melody', 2000), 4000);
  }

  private generateToneDataURL(frequency: number, duration: number): string {
    const sampleRate = 44100;
    const samples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);

    // Generate sine wave
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(44 + i * 2, intSample, true);
    }

    const blob = new Blob([view], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  // Music layer management
  addMusicLayer(name: string, soundPath: string, volume: number = 1.0): void {
    const howl = new Howl({
      src: [soundPath],
      loop: true,
      volume: volume * this.musicVolume,
      autoplay: false
    });

    this.musicLayers.set(name, {
      name,
      sound: howl,
      volume,
      active: false
    });
  }

  playMusicLayer(name: string): void {
    const layer = this.musicLayers.get(name);
    if (layer && !layer.active) {
      layer.sound.play();
      layer.active = true;
    }
  }

  stopMusicLayer(name: string): void {
    const layer = this.musicLayers.get(name);
    if (layer && layer.active) {
      layer.sound.stop();
      layer.active = false;
    }
  }

  fadeInMusicLayer(name: string, duration: number = 1000): void {
    const layer = this.musicLayers.get(name);
    if (layer) {
      layer.sound.volume(0);
      layer.sound.play();
      layer.sound.fade(0, layer.volume * this.musicVolume, duration);
      layer.active = true;
    }
  }

  fadeOutMusicLayer(name: string, duration: number = 1000): void {
    const layer = this.musicLayers.get(name);
    if (layer && layer.active) {
      layer.sound.fade(layer.volume * this.musicVolume, 0, duration);
      layer.sound.once('fade', () => {
        layer.sound.stop();
        layer.active = false;
      });
    }
  }

  // SFX playback
  playSFX(name: string, volume: number = 1.0): void {
    const sound = this.sfxPool.get(name);
    if (sound) {
      const playVolume = volume * this.sfxVolume;
      sound.volume(playVolume);
      sound.play();
      console.log(`Playing SFX: ${name} at volume ${playVolume}`);
    } else {
      console.warn(`SFX '${name}' not found`);
    }
  }

  // Beat synchronization
  setBPM(bpm: number): void {
    this.beatSync.bpm = bpm;
    this.updateBeatTiming();
  }

  private updateBeatTiming(): void {
    const beatDuration = (60 / this.beatSync.bpm) * 1000; // milliseconds per beat
    this.beatSync.nextBeat = Date.now() + beatDuration;
  }

  getCurrentBeat(): number {
    return this.beatSync.currentBeat;
  }

  getTimeToNextBeat(): number {
    return Math.max(0, this.beatSync.nextBeat - Date.now());
  }

  isOnBeat(tolerance: number = 100): boolean {
    const timeToNext = this.getTimeToNextBeat();
    const beatDuration = (60 / this.beatSync.bpm) * 1000;
    const timeFromLast = beatDuration - timeToNext;
    
    return timeToNext <= tolerance || timeFromLast <= tolerance;
  }

  update(): void {
    // Update beat timing
    if (Date.now() >= this.beatSync.nextBeat) {
      this.beatSync.currentBeat++;
      this.updateBeatTiming();
    }
  }

  // Volume controls
  setMasterVolume(volume: number): void {
    this.masterVolume = Phaser.Math.Clamp(volume, 0, 1);
    Howler.volume(this.masterVolume);
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.musicLayers.forEach(layer => {
      layer.sound.volume(layer.volume * this.musicVolume);
    });
  }

  setSFXVolume(volume: number): void {
    this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
  }

  // Utility methods
  stopAllMusic(): void {
    this.musicLayers.forEach(layer => {
      if (layer.active) {
        layer.sound.stop();
        layer.active = false;
      }
    });
  }

  muteAll(): void {
    Howler.mute(true);
  }

  unmuteAll(): void {
    Howler.mute(false);
  }

  // Cleanup
  destroy(): void {
    this.stopAllMusic();
    this.musicLayers.clear();
    this.sfxPool.forEach(sound => sound.unload());
    this.sfxPool.clear();
  }
}