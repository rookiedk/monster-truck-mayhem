export class AudioManager {
  constructor() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.25;
      this.masterGain.connect(this.ctx.destination);
      this.enabled = true;
      this.musicGain = null;
      this.musicNodes = [];
      this.musicInterval = null;
    } catch (e) {
      this.enabled = false;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  // ===================== PROCEDURAL CHIPTUNE MUSIC =====================
  startMusic(levelId = 1) {
    if (!this.enabled) return;
    this.resume();
    this.stopMusic();

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.55;
    this.musicGain.connect(this.masterGain);

    const patterns = {
      1: { // Junkyard — gritty bass-heavy
        notes: [130.8, 146.8, 164.8, 146.8, 174.6, 164.8, 146.8, 130.8, 110, 130.8, 146.8, 164.8, 196, 174.6, 164.8, 146.8],
        bass:  [65.4,  65.4,  73.4,  73.4,  82.4,  82.4,  73.4,  65.4,  55,  65.4,  73.4,  73.4,  98,  87.3,  82.4,  73.4],
        tempo: 200,
        wave: 'square',
      },
      2: { // Mountain — atmospheric, wider intervals
        notes: [196, 220, 262, 294, 330, 294, 262, 220, 196, 247, 294, 330, 392, 330, 294, 247],
        bass:  [98,  98,  110, 110, 131, 131, 110, 98,  98,  123, 131, 131, 165, 131, 131, 123],
        tempo: 240,
        wave: 'triangle',
      },
      3: { // Urban — energetic, faster
        notes: [262, 294, 330, 392, 440, 392, 330, 294, 349, 392, 440, 523, 440, 392, 349, 294],
        bass:  [131, 131, 165, 165, 196, 196, 165, 131, 175, 175, 196, 196, 220, 196, 175, 131],
        tempo: 160,
        wave: 'square',
      },
    };

    const p = patterns[levelId] || patterns[1];
    let step = 0;
    this._musicStarted = false;

    this.musicInterval = setInterval(() => {
      if (!this.enabled || !this.ctx || this.ctx.state === 'closed') {
        clearInterval(this.musicInterval);
        return;
      }
      // Wait for the AudioContext to actually be running before scheduling notes
      if (this.ctx.state === 'suspended') {
        this.resume();
        return;
      }
      const now = this.ctx.currentTime;
      const dur = p.tempo / 1000;

      // Lead
      const osc = this.ctx.createOscillator();
      osc.type = p.wave;
      osc.frequency.setValueAtTime(p.notes[step % p.notes.length], now);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.35, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.9);
      osc.connect(g); g.connect(this.musicGain);
      osc.start(now); osc.stop(now + dur);

      // Bass
      const bass = this.ctx.createOscillator();
      bass.type = 'sawtooth';
      bass.frequency.setValueAtTime(p.bass[step % p.bass.length], now);
      const bg = this.ctx.createGain();
      bg.gain.setValueAtTime(0.25, now);
      bg.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.8);
      const bf = this.ctx.createBiquadFilter();
      bf.type = 'lowpass'; bf.frequency.value = 300;
      bass.connect(bf); bf.connect(bg); bg.connect(this.musicGain);
      bass.start(now); bass.stop(now + dur);

      // Percussion (every 4 steps)
      if (step % 4 === 0) {
        const noise = this.ctx.createBufferSource();
        const noiseBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.05), this.ctx.sampleRate);
        const nd = noiseBuf.getChannelData(0);
        for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
        noise.buffer = noiseBuf;
        const ng = this.ctx.createGain();
        ng.gain.setValueAtTime(0.4, now);
        ng.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        noise.connect(ng); ng.connect(this.musicGain);
        noise.start(now); noise.stop(now + 0.06);
      }
      // Hi-hat (every 2 steps)
      if (step % 2 === 0) {
        const hh = this.ctx.createBufferSource();
        const hhBuf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.025), this.ctx.sampleRate);
        const hhd = hhBuf.getChannelData(0);
        for (let i = 0; i < hhd.length; i++) hhd[i] = (Math.random() * 2 - 1) * (1 - i / hhd.length);
        hh.buffer = hhBuf;
        const hhg = this.ctx.createGain();
        hhg.gain.setValueAtTime(0.15, now);
        hhg.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
        const hhf = this.ctx.createBiquadFilter();
        hhf.type = 'highpass'; hhf.frequency.value = 7000;
        hh.connect(hhf); hhf.connect(hhg); hhg.connect(this.musicGain);
        hh.start(now); hh.stop(now + 0.025);
      }

      step++;
    }, p.tempo);
  }

  stopMusic() {
    if (this.musicInterval) clearInterval(this.musicInterval);
    if (this.musicGain) {
      try { this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime); } catch (e) {}
    }
  }

  // ===================== SFX =====================
  playExplosion(size = 'small') {
    if (!this.enabled) return;
    this.resume();
    const dur = { quick: 0.15, small: 0.25, medium: 0.4, large: 0.6 }[size] || 0.25;
    const freq = { quick: 600, small: 400, medium: 250, large: 150 }[size] || 400;
    const now = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const s = this.ctx.createBufferSource(); s.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(freq, now); f.frequency.exponentialRampToValueAtTime(80, now + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.5, now); g.gain.exponentialRampToValueAtTime(0.01, now + dur);
    s.connect(f); f.connect(g); g.connect(this.masterGain);
    s.start(now); s.stop(now + dur);
  }

  playImpact() {
    if (!this.enabled) return;
    this.resume();
    const now = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(200, now); o.frequency.exponentialRampToValueAtTime(50, now + 0.08);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    o.connect(g); g.connect(this.masterGain); o.start(now); o.stop(now + 0.08);
  }

  playCollect() {
    if (!this.enabled) return;
    this.resume();
    const now = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(800, now); o.frequency.linearRampToValueAtTime(1400, now + 0.08);
    const o2 = this.ctx.createOscillator(); o2.type = 'sine';
    o2.frequency.setValueAtTime(1200, now + 0.06); o2.frequency.linearRampToValueAtTime(1800, now + 0.14);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.2, now); g.gain.linearRampToValueAtTime(0, now + 0.15);
    o.connect(g); o2.connect(g); g.connect(this.masterGain);
    o.start(now); o.stop(now + 0.1); o2.start(now + 0.06); o2.stop(now + 0.15);
  }

  playBoost() {
    if (!this.enabled) return;
    this.resume();
    const now = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(100, now); o.frequency.linearRampToValueAtTime(300, now + 0.25);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.12, now); g.gain.linearRampToValueAtTime(0.01, now + 0.25);
    o.connect(g); g.connect(this.masterGain); o.start(now); o.stop(now + 0.25);
  }

  playCombo() {
    if (!this.enabled) return;
    this.resume();
    const now = this.ctx.currentTime;
    [523, 659, 784].forEach((freq, i) => {
      const o = this.ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.12, now + i * 0.04); g.gain.linearRampToValueAtTime(0, now + i * 0.04 + 0.15);
      o.connect(g); g.connect(this.masterGain); o.start(now + i * 0.04); o.stop(now + i * 0.04 + 0.15);
    });
  }

  playFlip() {
    if (!this.enabled) return;
    this.resume();
    const now = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = 'triangle';
    o.frequency.setValueAtTime(400, now); o.frequency.linearRampToValueAtTime(1200, now + 0.15);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.15, now); g.gain.linearRampToValueAtTime(0, now + 0.2);
    o.connect(g); g.connect(this.masterGain); o.start(now); o.stop(now + 0.2);
  }

  playMenuClick() {
    if (!this.enabled) return;
    this.resume();
    const now = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(600, now);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.1, now); g.gain.linearRampToValueAtTime(0, now + 0.06);
    o.connect(g); g.connect(this.masterGain); o.start(now); o.stop(now + 0.06);
  }

  playSplash() {
    if (!this.enabled) return;
    this.resume();
    const now = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * 0.3);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.5) * 0.3;
    const s = this.ctx.createBufferSource(); s.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 800; f.Q.value = 2;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    s.connect(f); f.connect(g); g.connect(this.masterGain);
    s.start(now); s.stop(now + 0.3);
  }

  playGameOver() {
    if (!this.enabled) return;
    this.resume();
    this.stopMusic();
    const now = this.ctx.currentTime;
    [400, 300, 200].forEach((freq, i) => {
      const o = this.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.15, now + i * 0.2); g.gain.linearRampToValueAtTime(0, now + i * 0.2 + 0.3);
      o.connect(g); g.connect(this.masterGain); o.start(now + i * 0.2); o.stop(now + i * 0.2 + 0.3);
    });
  }

  playLevelComplete() {
    if (!this.enabled) return;
    this.resume();
    this.stopMusic();
    const now = this.ctx.currentTime;
    [523, 659, 784, 1047].forEach((freq, i) => {
      const o = this.ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.15, now + i * 0.1); g.gain.linearRampToValueAtTime(0, now + i * 0.1 + 0.35);
      o.connect(g); g.connect(this.masterGain); o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.35);
    });
  }

  destroy() {
    this.stopMusic();
    if (this.ctx && this.ctx.state !== 'closed') this.ctx.close().catch(() => {});
  }
}
