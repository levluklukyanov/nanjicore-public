// ═══════════════════════════════════════════════════════════════
// СИСТЕМА ЗВУКА, МУЗЫКИ И САУНДПАКОВ (AUDIO ENGINE & LO-FI SYNTH)
// Модуль: music.js (вынесен из nanj.html / accounts.js, Этап 3 модуляризации)
// Зависимости: Web Audio API, saveCurrentUserData (опционально)
// ═══════════════════════════════════════════════════════════════

// ─── Web Audio API & Procedural Lo-Fi Music Manager (100% Offline & Mobile Ready) ───
class ProceduralLoFiSynth {
  constructor(audioCtx, masterGainNode) {
    this.ctx = audioCtx;
    this.masterGain = masterGainNode;
    this.isPlaying = false;
    this.timer = null;
    this.step = 0;
    this.tempo = 66; // BPM (расслабляющий темп)
    this.activeOscillators = new Set();
    
    // Красивая джазово-чиловая Lo-Fi гармония (частоты в Гц)
    this.chords = [
      // Dm9: D3, F3, A3, C4, E4
      { bass: 73.42, pad: [146.83, 220.00, 261.63, 329.63], arp: [261.63, 329.63, 392.00, 440.00] },
      // G13 / G7: G2, F3, B3, E4
      { bass: 98.00, pad: [174.61, 246.94, 293.66, 329.63], arp: [293.66, 329.63, 392.00, 493.88] },
      // Cmaj9: C3, E3, G3, B3, D4
      { bass: 65.41, pad: [130.81, 196.00, 246.94, 293.66], arp: [246.94, 293.66, 329.63, 392.00] },
      // Am9: A2, C3, E3, G3, B3
      { bass: 110.00, pad: [130.81, 164.81, 196.00, 246.94], arp: [196.00, 246.94, 293.66, 329.63] }
    ];
  }
  
  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.killAllActiveSounds();
    this.step = 0;
    this.scheduleNextBeat();
  }
  
  stop(killImmediately = true) {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (killImmediately) {
      this.killAllActiveSounds();
    }
    // FIX 3: При soft-stop тоже чистим осцилляторы — иначе они висят в памяти
    // если ctx был suspend и onended никогда не сработал
    else {
      this.killAllActiveSounds();
    }
  }

  killAllActiveSounds() {
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop(0);
        osc.disconnect();
      } catch(e) {}
    });
    this.activeOscillators.clear();
  }
  
  async scheduleNextBeat() {
    if (!this.isPlaying || !this.ctx) return;
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch(e) {}
      if (!this.isPlaying || !this.ctx || this.ctx.state !== 'running') {
        // FIX 1: Всегда перепланируем beat — не проверяем ctx.state здесь.
        // scheduleNextBeat сам разберётся через resume() на следующей итерации.
        this.timer = setTimeout(() => this.scheduleNextBeat(), 200);
        return;
      }
    }
    
    const chordIndex = Math.floor(this.step / 4) % this.chords.length;
    const chord = this.chords[chordIndex];
    const beatInBar = this.step % 4;
    const now = this.ctx.currentTime;
    const beatDuration = 60 / this.tempo;
    
    // 1. Тёплый пэд и саб-бас в начале каждого такта
    if (beatInBar === 0) {
      this.playWarmPad(chord.pad, now, beatDuration * 3.8);
      this.playSubBass(chord.bass, now, beatDuration * 3.6);
    }
    
    // 2. Мягкие переливы Rhodes / Lo-Fi Piano
    const arpFreq = chord.arp[this.step % chord.arp.length];
    this.playPianoNote(arpFreq, now, beatDuration * 0.9);
    
    // 3. Синкопа в середине такта
    if (beatInBar === 2) {
      const synFreq = chord.arp[(this.step + 2) % chord.arp.length];
      this.playPianoNote(synFreq, now + beatDuration * 0.5, beatDuration * 0.85);
    }
    
    this.step++;
    const nextTimeMs = beatDuration * 1000;
    // FIX 1: Убрана проверка ctx.state === 'running' — она убивала цикл после смены вкладки.
    // scheduleNextBeat() сам восстанавливается через resume() при suspended.
    this.timer = setTimeout(() => {
      if (this.isPlaying) {
        this.scheduleNextBeat();
      }
    }, nextTimeMs);
  }
  
  playWarmPad(freqs, time, duration) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, time);
      filter.Q.setValueAtTime(1.1, time);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.18, time + duration * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      
      gain.connect(filter);
      filter.connect(this.masterGain);
      
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq * (1 + (idx - 1.5) * 0.003), time);
        osc.connect(gain);
        this.activeOscillators.add(osc);
        osc.onended = () => {
          this.activeOscillators.delete(osc);
          try { osc.disconnect(); } catch(e) {}
        };
        osc.start(time);
        osc.stop(time + duration);
      });
    } catch(e) {}
  }
  
  playSubBass(freq, time, duration) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.26, time + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      gain.connect(filter);
      filter.connect(this.masterGain);
      
      [freq, freq * 2].forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(f, time);
        osc.connect(gain);
        this.activeOscillators.add(osc);
        osc.onended = () => {
          this.activeOscillators.delete(osc);
          try { osc.disconnect(); } catch(e) {}
        };
        osc.start(time);
        osc.stop(time + duration);
      });
    } catch(e) {}
  }
  
  playPianoNote(freq, time, duration) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, time);
      filter.frequency.exponentialRampToValueAtTime(350, time + duration);
      
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.22, time + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      
      this.activeOscillators.add(osc);
      osc.onended = () => {
        this.activeOscillators.delete(osc);
        try { osc.disconnect(); } catch(e) {}
      };
      osc.start(time);
      osc.stop(time + duration);
    } catch(e) {}
  }
}

// ─── ГЛОБАЛЬНЫЙ МЕНЕДЖЕР ЗВУКОВ NANJICORE ───
const soundManager = {
  ctx: null,
  volumePercent: parseInt(localStorage.getItem('app_volume_percent') ?? (localStorage.getItem('sound_enabled') === 'false' ? '0' : '50'), 10),
  musicGain: null,
  effectsGain: null,
  musicEngine: null,
  isMusicStarted: false,
  soundPack: localStorage.getItem('click_sound_pack') || 'classic',

  get enabled() {
    return this.volumePercent > 0;
  },

  init() {
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          
          this.musicGain = this.ctx.createGain();
          this.musicGain.connect(this.ctx.destination);
          this.musicEngine = new ProceduralLoFiSynth(this.ctx, this.musicGain);

          this.effectsGain = this.ctx.createGain();
          this.effectsGain.connect(this.ctx.destination);
        }
      } catch (e) {}
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.applyVolume();
  },

  ensureResumed() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  },

  initBgMusic() {
    this.init();
  },

  // FIX 2: applyVolume теперь ТОЛЬКО выставляет громкость.
  // Запуск/остановка движка — исключительно через startMusicOnUserGesture() и stop().
  applyVolume() {
    const factor = this.volumePercent / 100;
    
    if (this.musicGain && this.ctx) {
      try {
        this.musicGain.gain.setValueAtTime(factor * 1.2, this.ctx.currentTime);
      } catch(e) {}
    }

    // Останавливаем движок только при полном отключении звука
    if (this.musicEngine && this.volumePercent === 0) {
      this.musicEngine.stop();
    }

    if (this.effectsGain && this.ctx) {
      try {
        this.effectsGain.gain.setValueAtTime(factor, this.ctx.currentTime);
      } catch(e) {}
    }
  },

  startMusicOnUserGesture() {
    this.init();
    if (this.volumePercent > 0) {
      // FIX 2: isMusicStarted устанавливается до start(), повторный вызов безопасен
      // (musicEngine.start() защищён от двойного запуска флагом isPlaying)
      this.isMusicStarted = true;
      this.applyVolume();
      if (this.musicEngine) {
        this.musicEngine.start();
      }
    }
  },

  setVolume(val) {
    this.volumePercent = Math.max(0, Math.min(200, parseInt(val, 10) || 0));
    localStorage.setItem('app_volume_percent', this.volumePercent);
    localStorage.setItem('sound_enabled', this.volumePercent > 0 ? 'true' : 'false');
    this.init();
    if (this.volumePercent > 0) {
      // FIX 2: вызываем только startMusicOnUserGesture — она сама вызовет applyVolume()
      // и запустит движок один раз, без дублирования
      this.startMusicOnUserGesture();
    } else {
      if (this.musicEngine) this.musicEngine.stop();
      this.applyVolume();
    }
    if (typeof updateVolumeUI === 'function') updateVolumeUI();
    if (typeof debouncedSaveUserVolume === 'function') {
      debouncedSaveUserVolume();
    } else if (typeof saveCurrentUserData === 'function') {
      saveCurrentUserData();
    }
  },

  setSoundPack(pack) {
    this.soundPack = pack || 'classic';
    localStorage.setItem('click_sound_pack', this.soundPack);
    this.init();
  },

  playClick(overridePack) {
    if (this.volumePercent === 0) return;
    this.ensureResumed();
    if (!this.ctx) return;

    const pack = overridePack || this.soundPack || localStorage.getItem('click_sound_pack') || 'classic';
    const now = this.ctx.currentTime;
    const targetOutput = this.effectsGain || this.ctx.destination;
    const cleanup = (o, g) => {
      o.onended = () => {
        try {
          g.disconnect();
          o.disconnect();
        } catch(e) {}
      };
    };

    try {
      if (pack === 'arcade8bit') {
        // 8-Bit Retro Mario Chime (Тихий аркадный пинг)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.025);
        gain.gain.setValueAtTime(0.10, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(targetOutput);
        cleanup(osc, gain);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (pack === 'katana') {
        // Metallic Blade Slash (Тихий свист катаны)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2600, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.045);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
        osc.connect(gain);
        gain.connect(targetOutput);
        cleanup(osc, gain);
        osc.start(now);
        osc.stop(now + 0.055);
      } else if (pack === 'cyber') {
        // Cyberpunk Laser Pulse (Тихий неоновый импульс)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2800, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);
        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        osc.connect(gain);
        gain.connect(targetOutput);
        cleanup(osc, gain);
        osc.start(now);
        osc.stop(now + 0.045);
      } else if (pack === 'bubble') {
        // Bubble Pop (Тихий мягкий пузырёк)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(1150, now + 0.035);
        gain.gain.setValueAtTime(0.13, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(targetOutput);
        cleanup(osc, gain);
        osc.start(now);
        osc.stop(now + 0.04);
      } else {
        // Classic Clean Pop (Тихий мягкий щелчок)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(780, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.03);
        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(targetOutput);
        cleanup(osc, gain);
        osc.start(now);
        osc.stop(now + 0.035);
      }
    } catch(e) {}
  },

  playTick() {
    // Колесо фортуны использует активный звуковой пак!
    this.playClick();
  },

  playWin() {
    if (this.volumePercent === 0) return;
    this.ensureResumed();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.07);
        const vol = (this.volumePercent / 100) * 0.18;
        gain.gain.setValueAtTime(vol, this.ctx.currentTime + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.07 + 0.3);
        osc.connect(gain);
        gain.connect(this.effectsGain || this.ctx.destination);
        osc.onended = () => {
          try {
            gain.disconnect();
            osc.disconnect();
          } catch(e) {}
        };
        osc.start(this.ctx.currentTime + i * 0.07);
        osc.stop(this.ctx.currentTime + i * 0.07 + 0.3);
      });
    } catch(e) {}
  },

  playUnlock() {
    if (this.volumePercent === 0) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      const vol = (this.volumePercent / 100) * 0.22;
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.05);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.05 + 0.35);
        osc.connect(gain);
        gain.connect(this.effectsGain || this.ctx.destination);
        osc.onended = () => {
          try {
            gain.disconnect();
            osc.disconnect();
          } catch(e) {}
        };
        osc.start(this.ctx.currentTime + i * 0.05);
        osc.stop(this.ctx.currentTime + i * 0.05 + 0.35);
      });
    } catch(e) {}
  }
};

// ─── UI И ОБРАБОТЧИКИ ГРОМКОСТИ И САУНДПАКОВ ───

function updateVolumeUI() {
  const slider = document.getElementById('volumeRange');
  const label = document.getElementById('volumeValueLabel');
  if (slider) slider.value = soundManager.volumePercent;
  if (label) label.textContent = `${soundManager.volumePercent}%`;
}

let _volumeSaveTimer = null;
function debouncedSaveUserVolume() {
  if (_volumeSaveTimer) clearTimeout(_volumeSaveTimer);
  _volumeSaveTimer = setTimeout(() => {
    if (typeof saveCurrentUserData === 'function') {
      saveCurrentUserData();
    } else if (typeof window !== 'undefined' && typeof window.saveCurrentUserData === 'function') {
      window.saveCurrentUserData();
    }
  }, 150);
}

function handleVolumeChange(val) {
  soundManager.setVolume(val);
  debouncedSaveUserVolume();
}

function setVolume(val) {
  soundManager.setVolume(val);
  if (typeof saveCurrentUserData === 'function') {
    saveCurrentUserData();
  } else if (typeof window !== 'undefined' && typeof window.saveCurrentUserData === 'function') {
    window.saveCurrentUserData();
  }
}

function selectSoundPack(pack) {
  if (typeof soundManager !== 'undefined' && soundManager) {
    soundManager.setSoundPack(pack);
    soundManager.playClick(pack);
  }
  localStorage.setItem('click_sound_pack', pack);
  if (typeof saveCurrentUserData === 'function') {
    saveCurrentUserData();
  } else if (typeof window.saveCurrentUserData === 'function') {
    window.saveCurrentUserData();
  }
  updateSoundPackUI();
}

function updateSoundPackUI() {
  const cur = (typeof soundManager !== 'undefined' && soundManager.soundPack) ? soundManager.soundPack : (localStorage.getItem('click_sound_pack') || 'classic');
  document.querySelectorAll('.sound-pack-btn').forEach(btn => {
    const pack = btn.getAttribute('data-sound-pack');
    if (pack === cur) {
      btn.className = 'sound-pack-btn px-2 py-1.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 bg-white dark:bg-gray-800 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm';
    } else {
      btn.className = 'sound-pack-btn px-2 py-1.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 bg-white/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700';
    }
  });
}

// ─── ЖИЗНЕННЫЙ ЦИКЛ АУДИО (АВТОСТАРТ И ПАУЗА В ФОНЕ) ───

// Автостарт фоновой музыки по первому клику/нажатию пользователя.
// Это обязательное требование браузерной Autoplay Policy — AudioContext нельзя
// запустить без user gesture. После первого жеста музыка стартует самостоятельно.
['click', 'keydown', 'touchstart'].forEach(evt => {
  window.addEventListener(evt, () => {
    soundManager.startMusicOnUserGesture();
  }, { once: true });
});

// Автоматическая пауза музыки при сворачивании Chrome, выключении экрана или смене вкладки.
// FIX 2 + FIX 4: убран дублирующий вызов musicEngine.start() после applyVolume().
// FIX 4: gain явно восстанавливается перед перезапуском движка.
let resumeAudioTimeout = null;

document.addEventListener('visibilitychange', () => {
  clearTimeout(resumeAudioTimeout);
  if (document.hidden) {
    // Вкладка скрыта — останавливаем движок и приостанавливаем ctx
    if (soundManager.musicEngine) {
      soundManager.musicEngine.stop(true);
    }
    if (soundManager.musicGain && soundManager.ctx) {
      try {
        soundManager.musicGain.gain.setValueAtTime(0, soundManager.ctx.currentTime);
      } catch(e) {}
    }
    if (soundManager.ctx && soundManager.ctx.state === 'running') {
      soundManager.ctx.suspend().catch(() => {});
    }
  } else {
    // Вкладка снова активна — восстанавливаем контекст и перезапускаем музыку
    if (soundManager.volumePercent > 0 && soundManager.isMusicStarted) {
      resumeAudioTimeout = setTimeout(async () => {
        if (document.hidden) return;
        // Шаг 1: восстанавливаем AudioContext из suspended
        if (soundManager.ctx && soundManager.ctx.state === 'suspended') {
          try { await soundManager.ctx.resume(); } catch(e) {}
        }
        if (soundManager.musicEngine) {
          // Шаг 2: чистим зависшие осцилляторы
          soundManager.musicEngine.killAllActiveSounds();
          // FIX 4: явно восстанавливаем gain до правильного значения (он был занулён при hide)
          if (soundManager.musicGain && soundManager.ctx) {
            try {
              const factor = soundManager.volumePercent / 100;
              soundManager.musicGain.gain.setValueAtTime(factor * 1.2, soundManager.ctx.currentTime);
            } catch(e) {}
          }
          // Шаг 3: запускаем движок — один раз, без applyVolume()
          soundManager.musicEngine.start();
        }
      }, 80);
    }
  }
});

window.addEventListener('pagehide', () => {
  if (soundManager.musicEngine) soundManager.musicEngine.stop(true);
  if (soundManager.ctx && soundManager.ctx.state === 'running') {
    soundManager.ctx.suspend().catch(() => {});
  }
});

window.addEventListener('freeze', () => {
  if (soundManager.musicEngine) soundManager.musicEngine.stop(true);
  if (soundManager.ctx && soundManager.ctx.state === 'running') {
    soundManager.ctx.suspend().catch(() => {});
  }
});

function initMusicUI() {
  updateVolumeUI();
  updateSoundPackUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMusicUI);
} else {
  initMusicUI();
}

// ─── ГЛОБАЛЬНЫЙ ЭКСПОРТ ДЛЯ ИНЛАЙН-ОБРАБОТЧИКОВ И ДРУГИХ МОДУЛЕЙ ───
window.soundManager = soundManager;
window.ProceduralLoFiSynth = ProceduralLoFiSynth;
window.selectSoundPack = selectSoundPack;
window.updateSoundPackUI = updateSoundPackUI;
window.updateVolumeUI = updateVolumeUI;
window.handleVolumeChange = handleVolumeChange;
window.setVolume = setVolume;
window.initMusicUI = initMusicUI;
