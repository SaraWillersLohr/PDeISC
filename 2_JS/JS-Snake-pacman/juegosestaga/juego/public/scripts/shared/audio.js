// ============================================================
// audio.js — Sintetizador de Sonidos Retro con Web Audio API MEJORADO
// Incluye: efectos SFX + música de fondo generativa
// ============================================================
class AudioSynth {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmNodes = [];
    this.bgmPlaying = false;
    this.bgmTempo = 120; // BPM
    this.bgmStep = 0;
    this.bgmTimer = null;
  }

  // Inicializa el AudioContext en la primera interacción del usuario
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.95; // Volumen aumentado significativamente
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Helper: crear un oscilador y conectarlo al master con mayor calidad
  _osc(type, freq, gainVal, startTime, duration, freqRamp = null) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Añadir filtro para mejor calidad de sonido
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 8000;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (freqRamp) {
      osc.frequency.linearRampToValueAtTime(freqRamp.to, startTime + freqRamp.time);
    }

    gain.gain.setValueAtTime(gainVal * 1.3, startTime); // Aumentar ganancia individual
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
    return { osc, gain };
  }

  // ─── SFX MEJORADOS ─────────────────────────────────────────────────

  // Recoger moneda / punto — más brillante y fuerte
  playCoin() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this._osc('sine', 660, 0.08, now, 0.09);
    this._osc('sine', 990, 0.07, now + 0.06, 0.11);
    this._osc('triangle', 1320, 0.04, now + 0.03, 0.08);
  }

  // Selección de personaje — click arcade retro escolar
  playSelect() {
    this.playCharacterSelect();
  }

  playCharacterSelect() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this._osc('square', 880, 0.08, now, 0.07);
    this._osc('triangle', 1174.66, 0.07, now + 0.04, 0.1);
    this._osc('sine', 659.25, 0.06, now + 0.02, 0.14);
    this._osc('square', 523.25, 0.04, now + 0.08, 0.12);
  }

  // Confirmación al iniciar partida
  playStartGame() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [392, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      this._osc('square', f, 0.09, now + i * 0.07, 0.22);
      this._osc('sine', f * 2, 0.035, now + i * 0.07, 0.16);
    });
  }

  // Power-up / Hora Libre — más épico
  playPowerup() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this._osc('triangle', 250, 0.12, now, 0.5, { to: 1500, time: 0.45 });
    this._osc('sine', 750, 0.06, now + 0.12, 0.4, { to: 1800, time: 0.35 });
    this._osc('square', 500, 0.03, now + 0.2, 0.3, { to: 1000, time: 0.25 });
  }

  // Game Over — más dramático
  playGameOver() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [350, 280, 210, 130];
    notes.forEach((f, i) => {
      this._osc('sawtooth', f, 0.11, now + i * 0.2, 0.28);
      this._osc('square', f / 2, 0.05, now + i * 0.2, 0.25);
    });
  }

  // Comer fantasma — más satisfactorio
  playEatGhost() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this._osc('sine', 900, 0.12, now, 0.1);
    this._osc('sine', 1350, 0.11, now + 0.07, 0.14);
    this._osc('square', 675, 0.06, now + 0.04, 0.12);
    this._osc('triangle', 450, 0.04, now + 0.02, 0.08);
  }

  // Victoria — más alegre
  playVictory() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const melody = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.5];
    melody.forEach((freq, idx) => {
      this._osc('square', freq, 0.07, now + idx * 0.11, 0.2);
      this._osc('sine', freq * 2, 0.035, now + idx * 0.11, 0.18);
      this._osc('triangle', freq * 3, 0.02, now + idx * 0.11, 0.15);
    });
  }

  // Choque / muerte en Snake — más impactante
  playCrash() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      this._osc('sawtooth', 180 + Math.random() * 120, 0.09, now + i * 0.035, 0.15, { to: 35 + Math.random() * 50, time: 0.18 });
    }
    this._osc('square', 100, 0.1, now, 0.2, { to: 40, time: 0.18 });
  }

  // Subida de nivel — más emocionante
  playLevelUp() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const melody = [392, 523.25, 659.25, 783.99, 1046.5, 1318.5];
    melody.forEach((f, i) => {
      this._osc('square', f, 0.08, now + i * 0.09, 0.18);
      this._osc('sine', f * 1.5, 0.04, now + i * 0.09, 0.16);
    });
  }

  // Aviso nivel 3 — estilo "alarma de peligro" más intensa
  playDangerAlert() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      this._osc('sawtooth', 950, 0.13, now + i * 0.18, 0.18);
      this._osc('square', 475, 0.09, now + i * 0.18 + 0.07, 0.13);
    }
  }

  // ─── MÚSICA DE FONDO (BGM) MEJORADA ───────────────────────────────
  // Melodía 8-bit generativa en loop con más capas

  startBGM(style = 'normal') {
    this.init();
    if (!this.ctx || this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.bgmStep = 0;

    // Escalas: normal = pentatónica, danger = cromática
    const normalScale = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00];
    const dangerScale = [146.83, 155.56, 164.81, 174.61, 185.00, 196.00, 207.65, 220.00, 233.08, 246.94];

    const scale = style === 'danger' ? dangerScale : normalScale;
    // Patrón de melody ARPEGIO 16 pasos
    const pattern = [0, 2, 4, 7, 4, 2, 0, 4, 2, 5, 4, 7, 5, 2, 4, 0];
    // Patrón de bajo (2 notas)
    const bassPattern = [0, 4, 0, 4, 7, 4, 0, 4, 0, 5, 0, 5, 7, 5, 0, 4];

    const bpmMs = style === 'danger' ? 85 : 125; // velocidad ajustada
    const stepMs = (60 / bpmMs) * 500; // corcheas

    const playStep = () => {
      if (!this.bgmPlaying || !this.ctx) return;

      const now = this.ctx.currentTime;
      const step = this.bgmStep % pattern.length;

      // Melodía principal más fuerte
      const melFreq = scale[pattern[step] % scale.length];
      this._osc('square', melFreq, style === 'danger' ? 0.04 : 0.035, now, stepMs / 1200);

      // Bajo (octava más grave) más presente
      if (step % 4 === 0) {
        const bassFreq = (scale[bassPattern[step] % scale.length]) / 2;
        this._osc('triangle', bassFreq, 0.05, now, stepMs / 600);
      }

      // Percusión básica cada 4 pasos más fuerte
      if (step % 4 === 0) {
        this._osc('sawtooth', 85, 0.055, now, 0.045, { to: 32, time: 0.045 });
      }
      if (step % 4 === 2) {
        this._osc('square', 210, 0.035, now, 0.035, { to: 155, time: 0.035 });
      }

      this.bgmStep++;
      this.bgmTimer = setTimeout(playStep, stepMs);
    };

    playStep();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  // Cambiar estilo BGM al vuelo (ej. nivel 3)
  switchBGM(style) {
    this.stopBGM();
    setTimeout(() => this.startBGM(style), 60);
  }

  // Volumen master
  setVolume(val) {
    this.init();
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.05);
    }
  }
}

const audioSynth = new AudioSynth();
window.audioSynth = audioSynth; // Accesible globalmente

// Inicializar audio en primer click/toque del usuario
document.addEventListener('click',     () => audioSynth.init(), { once: false });
document.addEventListener('keydown',   () => audioSynth.init(), { once: false });
document.addEventListener('touchstart',() => audioSynth.init(), { once: false });
