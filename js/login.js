const form = document.querySelector('.login');
const input = document.querySelector('#player');
const button = form.querySelector('button[type="submit"]');
const hint = document.querySelector('.field__hint');
const best = document.querySelector('.best');

const LEVEL_NAMES = { 6: 'Padawan', 8: 'Cavaleiro', 10: 'Mestre' };

const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// restaura escolhas anteriores
const saved = {
  player: localStorage.getItem('player') || '',
  side: localStorage.getItem('side') || 'jedi',
  level: localStorage.getItem('level') || '8'
};

input.value = saved.player;
const pick = (name, value) => {
  const radio = form.querySelector(`input[name="${name}"][value="${value}"]`);
  if (radio) radio.checked = true;
};
pick('side', saved.side);
pick('level', saved.level);

// a introdução só aparece na primeira visita da sessão
if (sessionStorage.getItem('intro-seen')) document.body.classList.add('skip-intro');
sessionStorage.setItem('intro-seen', '1');
document.body.dataset.side = saved.side;

const showBest = () => {
  const level = form.level.value;
  const record = JSON.parse(localStorage.getItem(`best-${level}`) || 'null');
  best.innerHTML = record
    ? `Recorde no nível ${LEVEL_NAMES[level]}: <strong>${formatTime(record.time)}</strong> em ${record.moves} jogadas`
    : '';
};

const validate = () => {
  const ok = input.value.trim().length >= 3;
  button.disabled = !ok;
  hint.textContent = ok ? 'Que a Força esteja com você.' : 'Mínimo de 3 caracteres.';
};

input.addEventListener('input', validate);

form.addEventListener('change', (e) => {
  if (e.target.name === 'side') {
    document.body.dataset.side = e.target.value;
    Sound.ignite();
  }
  if (e.target.name === 'level') showBest();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (button.disabled) return;

  localStorage.setItem('player', input.value.trim());
  localStorage.setItem('side', form.side.value);
  localStorage.setItem('level', form.level.value);

  button.disabled = true;
  form.classList.add('is-leaving');
  Sound.hyperspace();
  await Starfield.hyperspace(1100);

  window.location.href = 'pages/game.html';
});

validate();
showBest();
