class SoundController {
  private audioCtx: AudioContext | null = null;
  private ringtoneInterval: number | null = null;
  private sirenInterval: number | null = null;

  private getContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Marimba-inspired iPhone ringtone chord simulation
  playIphoneRingtoneSequence() {
    try {
      const ctx = this.getContext();
      const notes = [
        { freq: 659.25, time: 0.0, dur: 0.12 }, // E5
        { freq: 587.33, time: 0.15, dur: 0.12 }, // D5
        { freq: 440.00, time: 0.30, dur: 0.18 }, // A4
        { freq: 493.88, time: 0.50, dur: 0.18 }, // B4
        { freq: 659.25, time: 0.70, dur: 0.14 }, // E5
        { freq: 587.33, time: 0.86, dur: 0.14 }, // D5
        { freq: 440.00, time: 1.02, dur: 0.22 }, // A4
      ];

      const now = ctx.currentTime;
      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm marimba-like tone with slight triangle wave
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0, now + time);
        gain.gain.linearRampToValueAtTime(0.25, now + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.05);
      });
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  startRinging() {
    this.stopRinging();
    this.playIphoneRingtoneSequence();
    this.ringtoneInterval = window.setInterval(() => {
      this.playIphoneRingtoneSequence();
    }, 2800);
  }

  stopRinging() {
    if (this.ringtoneInterval !== null) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }

  // Continuous Emergency SOS Siren (High-pitch 2-tone rescue alarm)
  playSirenPulse() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Tone 1: High tone (880Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.35, now + 0.02);
      gain1.gain.setValueAtTime(0.35, now + 0.28);
      gain1.gain.linearRampToValueAtTime(0.01, now + 0.3);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.31);

      // Tone 2: Piercing lower tone (660Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(660, now + 0.32);
      gain2.gain.setValueAtTime(0, now + 0.32);
      gain2.gain.linearRampToValueAtTime(0.35, now + 0.34);
      gain2.gain.setValueAtTime(0.35, now + 0.62);
      gain2.gain.linearRampToValueAtTime(0.01, now + 0.65);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.32);
      osc2.stop(now + 0.66);
    } catch {
      // Audio might be restricted
    }
  }

  startEmergencySiren() {
    this.stopEmergencySiren();
    this.stopRinging();
    this.playSirenPulse();
    this.sirenInterval = window.setInterval(() => {
      this.playSirenPulse();
    }, 700);
  }

  stopEmergencySiren() {
    if (this.sirenInterval !== null) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
  }

  // Warning siren sound for high risk call
  playAlarm() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.25);
      osc.frequency.linearRampToValueAtTime(440, now + 0.5);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch {
      // ignored
    }
  }

  // Positive safe chime
  playSafeChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch {
      // ignored
    }
  }

  // Hangup click sound
  playHangup() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // ignored
    }
  }
}

export const soundController = new SoundController();
