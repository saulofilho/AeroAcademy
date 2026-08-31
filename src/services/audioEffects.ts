/**
 * Aviation Sound Effects & ATC Voice Engine
 */

export class AviationAudioEngine {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private windNoise: AudioNode | null = null;
  private windGain: GainNode | null = null;
  private stallOsc: OscillatorNode | null = null;
  private stallGain: GainNode | null = null;
  private isMuted = false;
  private lastSpokenCallout = '';
  private lastSpokenTime = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startEngine(engineType: 'piston_single' | 'turboprop' | 'jet_turbofan' = 'piston_single') {
    this.initContext();
    if (!this.ctx || this.engineOsc) return;

    try {
      // 1. Engine Drone (Harmonic Oscillator)
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      
      this.engineOsc.type = engineType === 'jet_turbofan' ? 'sawtooth' : 'triangle';
      this.engineOsc.frequency.setValueAtTime(engineType === 'jet_turbofan' ? 120 : 65, this.ctx.currentTime);
      this.engineGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      this.engineOsc.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();

      // 2. Wind Rush Noise (White noise generator with bandpass filter)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.0, this.ctx.currentTime);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.windGain);
      this.windGain.connect(this.ctx.destination);
      whiteNoise.start();
      this.windNoise = whiteNoise;

      // 3. Stall Horn (High pitch warning tone)
      this.stallOsc = this.ctx.createOscillator();
      this.stallGain = this.ctx.createGain();
      this.stallOsc.type = 'square';
      this.stallOsc.frequency.setValueAtTime(850, this.ctx.currentTime);
      this.stallGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.stallOsc.connect(this.stallGain);
      this.stallGain.connect(this.ctx.destination);
      this.stallOsc.start();
    } catch (e) {
      console.warn('Audio initialization notice:', e);
    }
  }

  public updateTelemetrySound(rpm: number, airspeedKts: number, isStall: boolean, throttle: number) {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;

    // Modulate Engine Pitch & Volume by RPM and Throttle
    if (this.engineOsc && this.engineGain) {
      const baseFreq = 50 + (rpm * 0.06);
      this.engineOsc.frequency.setTargetAtTime(Math.max(40, baseFreq), now, 0.05);
      const targetGain = 0.05 + (throttle * 0.15);
      this.engineGain.gain.setTargetAtTime(targetGain, now, 0.05);
    }

    // Modulate Wind Volume by Airspeed
    if (this.windGain) {
      const windVol = Math.min(0.2, (airspeedKts / 200) * 0.15);
      this.windGain.gain.setTargetAtTime(windVol, now, 0.1);
    }

    // Stall Warning Horn
    if (this.stallGain) {
      this.stallGain.gain.setTargetAtTime(isStall ? 0.25 : 0, now, 0.03);
    }
  }

  public playTouchdownSqueak() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.19);
    } catch (e) {
      // Ignore audio glitches
    }
  }

  public playClickSwitch() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  public speakCallout(phrase: string, lang = 'pt') {
    const now = Date.now();
    // Throttle duplicate callouts to prevent audio stutter
    if (this.lastSpokenCallout === phrase && now - this.lastSpokenTime < 3500) {
      return;
    }
    this.lastSpokenCallout = phrase;
    this.lastSpokenTime = now;

    if ('speechSynthesis' in window && !this.isMuted) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(phrase);
      utter.rate = 1.1;
      utter.pitch = 1.0;
      utter.volume = 0.9;
      
      // Auto select voice matching language
      const voices = window.speechSynthesis.getVoices();
      const targetLang = lang === 'pt' ? 'pt-BR' : (lang === 'es' ? 'es-ES' : (lang === 'fr' ? 'fr-FR' : (lang === 'de' ? 'de-DE' : 'en-US')));
      const matched = voices.find(v => v.lang.startsWith(targetLang.substring(0, 2)));
      if (matched) utter.voice = matched;

      window.speechSynthesis.speak(utter);
    }
  }

  public stopAll() {
    if (this.engineOsc) {
      try { this.engineOsc.stop(); } catch (e) {}
      this.engineOsc = null;
    }
    if (this.windNoise) {
      try { (this.windNoise as AudioBufferSourceNode).stop(); } catch (e) {}
      this.windNoise = null;
    }
    if (this.stallOsc) {
      try { this.stallOsc.stop(); } catch (e) {}
      this.stallOsc = null;
    }
  }
}

export const audioEngine = new AviationAudioEngine();
