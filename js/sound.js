// Efeitos sonoros sintetizados com Web Audio API (sem arquivos de áudio).
// O som pode ser ligado/desligado e a escolha fica salva no navegador.

const Sound = (() => {
  let ctx = null;
  let enabled = localStorage.getItem('sw-sound') !== 'off';

  const audio = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  // tom simples com envelope
  const tone = ({ freq = 440, to = freq, type = 'sine', dur = 0.2, vol = 0.15, delay = 0 }) => {
    if (!enabled) return;
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  };

  // ruído filtrado (impacto de sabre)
  const noise = ({ dur = 0.25, vol = 0.2, freq = 1200 }) => {
    if (!enabled) return;
    const ac = audio();
    if (!ac) return;
    const len = Math.floor(ac.sampleRate * dur);
    const buffer = ac.createBuffer(1, len, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    const filter = ac.createBiquadFilter();
    const gain = ac.createGain();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    gain.gain.value = vol;
    src.buffer = buffer;
    src.connect(filter).connect(gain).connect(ac.destination);
    src.start();
  };

  return {
    get enabled() { return enabled; },

    toggle() {
      enabled = !enabled;
      localStorage.setItem('sw-sound', enabled ? 'on' : 'off');
      if (enabled) this.flip();
      return enabled;
    },

    flip() {
      tone({ freq: 220, to: 520, type: 'triangle', dur: 0.12, vol: 0.08 });
    },

    ignite() {
      tone({ freq: 90, to: 160, type: 'sawtooth', dur: 0.5, vol: 0.07 });
      tone({ freq: 180, to: 320, type: 'sine', dur: 0.45, vol: 0.06 });
    },

    match() {
      tone({ freq: 523, type: 'sine', dur: 0.18, vol: 0.12 });
      tone({ freq: 784, type: 'sine', dur: 0.28, vol: 0.12, delay: 0.09 });
      tone({ freq: 110, to: 140, type: 'sawtooth', dur: 0.4, vol: 0.04 });
    },

    wrong() {
      noise({ dur: 0.22, vol: 0.25, freq: 900 });
      tone({ freq: 160, to: 90, type: 'square', dur: 0.2, vol: 0.05 });
    },

    hyperspace() {
      tone({ freq: 60, to: 900, type: 'sawtooth', dur: 1.1, vol: 0.06 });
      noise({ dur: 1.1, vol: 0.08, freq: 400 });
    },

    victory() {
      [392, 523, 659, 784, 1046].forEach((f, i) =>
        tone({ freq: f, type: 'triangle', dur: 0.35, vol: 0.1, delay: i * 0.12 })
      );
    }
  };
})();
