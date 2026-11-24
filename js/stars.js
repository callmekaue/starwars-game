// Campo de estrelas animado em canvas, com efeito de salto para o hiperespaço.
// Uso: Starfield.init()  |  Starfield.hyperspace()  |  Starfield.burst(x, y)

const Starfield = (() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let canvas, ctx, w, h, cx, cy, stars = [];
  let speed = 0.4;
  let targetSpeed = 0.4;
  let mouseX = 0, mouseY = 0;

  const STAR_COUNT = () => Math.min(500, Math.floor((w * h) / 3500));

  const makeStar = () => ({
    x: (Math.random() - 0.5) * w,
    y: (Math.random() - 0.5) * h,
    z: Math.random() * w,
    pz: 0
  });

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
    cx = w / 2;
    cy = h / 2;
    stars = Array.from({ length: STAR_COUNT() }, makeStar);
    stars.forEach((s) => (s.pz = s.z));
  };

  const draw = () => {
    speed += (targetSpeed - speed) * 0.06;

    // rastro: quanto mais rápido, mais longo
    if (speed > 5) {
      ctx.fillStyle = 'rgba(5, 7, 13, 0.35)';
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.clearRect(0, 0, w, h); // deixa a imagem de fundo aparecer
    }

    const ox = cx + mouseX * 30;
    const oy = cy + mouseY * 30;

    for (const s of stars) {
      s.pz = s.z;
      s.z -= speed * 2;

      if (s.z < 1) {
        Object.assign(s, makeStar());
        s.z = w;
        s.pz = s.z;
      }

      const sx = (s.x / s.z) * w * 0.5 + ox;
      const sy = (s.y / s.z) * w * 0.5 + oy;
      const px = (s.x / s.pz) * w * 0.5 + ox;
      const py = (s.y / s.pz) * w * 0.5 + oy;

      const size = Math.max(0.4, (1 - s.z / w) * 2.6);
      const alpha = Math.min(1, (1 - s.z / w) * 1.4);

      ctx.strokeStyle = speed > 5
        ? `rgba(190, 230, 255, ${alpha})`
        : `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(sx + 0.1, sy + 0.1);
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  };

  const drawStatic = () => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < STAR_COUNT(); i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.8 + 0.2})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
    }
  };

  return {
    init() {
      canvas = document.getElementById('starfield');
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', () => {
        resize();
        if (reduceMotion) drawStatic();
      });

      if (reduceMotion) {
        drawStatic();
        return;
      }

      window.addEventListener('pointermove', (e) => {
        mouseX = e.clientX / window.innerWidth - 0.5;
        mouseY = e.clientY / window.innerHeight - 0.5;
      });

      draw();
    },

    // acelera até o hiperespaço; devolve uma Promise que resolve após `ms`
    hyperspace(ms = 1100) {
      targetSpeed = 60;
      return new Promise((resolve) => setTimeout(resolve, reduceMotion ? 0 : ms));
    },

    // breve aceleração (comemoração)
    boost() {
      targetSpeed = 25;
      setTimeout(() => (targetSpeed = 0.4), 700);
    }
  };
})();

Starfield.init();
