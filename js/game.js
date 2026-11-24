// ==========================================================
// Jogo da memória - Star Wars
// ==========================================================

// os baralhos ficam em js/characters.js (DECKS.jedi e DECKS.sith)

const LEVEL_NAMES = { 6: 'Padawan', 8: 'Cavaleiro', 10: 'Mestre' };
const COLUMNS = { 6: 4, 8: 4, 10: 5 };

// ---------- Elementos ----------
const grid = document.querySelector('.grid');
const spanPlayer = document.querySelector('.player');
const spanTimer = document.querySelector('.timer');
const spanMoves = document.querySelector('.moves');
const spanPairs = document.querySelector('.pairs');
const progressBar = document.querySelector('.progress__bar');
const toast = document.querySelector('.toast');
const modal = document.querySelector('.modal');
const soundButton = document.querySelector('.js-sound');

// ---------- Configuração da partida ----------
const player = localStorage.getItem('player');
const side = localStorage.getItem('side') || 'jedi';
const pairsCount = Number(localStorage.getItem('level')) || 8;

// sem nome de jogador, volta para a tela inicial
if (!player) window.location.replace('../index.html');

document.body.dataset.side = side;

const CHARACTERS = DECKS[side] || DECKS.jedi;
spanPlayer.textContent = player;

// ---------- Estado ----------
const state = {
  first: null,
  second: null,
  locked: false,
  moves: 0,
  matched: 0,
  seconds: 0,
  timerId: null,
  started: false
};

// ---------- Utilitários ----------
const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// embaralhamento Fisher-Yates (o sort aleatório antigo não era uniforme)
const shuffle = (array) => {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const bump = (el) => {
  el.classList.remove('bump');
  void el.offsetWidth; // reinicia a animação
  el.classList.add('bump');
};

let toastTimeout;
const showToast = (text) => {
  toast.textContent = text;
  toast.classList.add('is-visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('is-visible'), 1600);
};

const sparks = (el, amount = 18) => {
  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  for (let i = 0; i < amount; i++) {
    const s = document.createElement('span');
    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 90;
    s.className = 'spark';
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    s.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    document.body.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  }
};

// verifica quais imagens existem na pasta images/ (resultado fica em cache)
const imageStatus = new Map();
const checkImage = (id) => {
  if (!imageStatus.has(id)) {
    imageStatus.set(id, new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = `../images/${id}.jpg`;
    }));
  }
  return imageStatus.get(id);
};

const initials = (name) => {
  const words = name.split(' ');
  if (words.length === 1) return name.replace(/-/g, '').slice(0, 2).toUpperCase();
  return words.slice(-2).map((w) => w[0]).join('').toUpperCase();
};

// ---------- HUD ----------
const updateHud = () => {
  spanMoves.textContent = state.moves;
  spanPairs.textContent = `${state.matched}/${pairsCount}`;
  progressBar.style.width = `${(state.matched / pairsCount) * 100}%`;
};

const startTimer = () => {
  if (state.started) return;
  state.started = true;
  state.timerId = setInterval(() => {
    state.seconds++;
    spanTimer.textContent = formatTime(state.seconds);
  }, 1000);
};

const stopTimer = () => clearInterval(state.timerId);

// ---------- Cartas ----------
const createCard = (character, index) => {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'card';
  card.dataset.character = character.id;
  card.style.setProperty('--i', index);
  card.setAttribute('aria-label', 'Carta virada para baixo');

  card.innerHTML = `
    <div class="card__inner">
      <div class="face face--back"></div>
      <div class="face face--front ${character.hasImage ? '' : 'no-img'}"
           style="--img: url('../images/${character.id}.jpg')"
           data-initials="${initials(character.name)}">
        <span class="face__series">${character.series}</span>
        <span class="face__name">${character.name}</span>
      </div>
    </div>`;

  card.addEventListener('animationend', (e) => {
    if (e.animationName === 'deal') card.classList.add('is-dealt');
  });

  // inclinação 3D acompanhando o mouse
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty('--ry', `${px * 18}deg`);
    card.style.setProperty('--rx', `${-py * 18}deg`);
  });

  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--ry', '0deg');
    card.style.setProperty('--rx', '0deg');
  });

  card.addEventListener('click', () => flipCard(card, character));
  return card;
};

const flipCard = (card, character) => {
  if (
    state.locked ||
    card === state.first ||
    card.classList.contains('is-matched')
  ) return;

  startTimer();
  Sound.flip();
  card.classList.add('is-flipped');
  card.setAttribute('aria-label', character.name);

  if (!state.first) {
    state.first = card;
    return;
  }

  state.second = card;
  state.locked = true;
  state.moves++;
  bump(spanMoves);
  updateHud();

  // espera a carta terminar de virar antes de comparar
  setTimeout(checkPair, 550);
};

const checkPair = () => {
  const { first, second } = state;
  const isMatch = first.dataset.character === second.dataset.character;

  if (isMatch) {
    first.classList.add('is-matched');
    second.classList.add('is-matched');
    first.disabled = true;
    second.disabled = true;
    state.matched++;
    bump(spanPairs);
    updateHud();
    Sound.match();
    sparks(first);
    sparks(second);

    const name = CHARACTERS.find((c) => c.id === first.dataset.character).name;
    showToast(`Par encontrado: ${name}`);

    resetTurn();

    if (state.matched === pairsCount) setTimeout(endGame, 700);
  } else {
    Sound.wrong();
    first.classList.add('is-wrong');
    second.classList.add('is-wrong');

    setTimeout(() => {
      [first, second].forEach((c) => {
        c.classList.remove('is-flipped', 'is-wrong');
        c.setAttribute('aria-label', 'Carta virada para baixo');
      });
      resetTurn();
    }, 700);
  }
};

const resetTurn = () => {
  state.first = null;
  state.second = null;
  state.locked = false;
};

// ---------- Fim de jogo ----------
const endGame = () => {
  stopTimer();
  Sound.victory();
  Starfield.boost();

  const key = `best-${pairsCount}`;
  const previous = JSON.parse(localStorage.getItem(key) || 'null');
  const isRecord =
    !previous ||
    state.seconds < previous.time ||
    (state.seconds === previous.time && state.moves < previous.moves);

  if (isRecord) {
    localStorage.setItem(key, JSON.stringify({ time: state.seconds, moves: state.moves }));
  }
  const best = isRecord ? { time: state.seconds } : previous;

  // classificação: 3 sabres = poucas jogadas extras
  const extra = state.moves - pairsCount;
  const rank = extra <= pairsCount * 0.5 ? 3 : extra <= pairsCount * 1.2 ? 2 : 1;
  const titles = { 1: 'Padawan promissor', 2: 'Cavaleiro habilidoso', 3: 'Mestre da Força' };
  const sithTitles = { 1: 'Aprendiz Sith', 2: 'Lorde Sith', 3: 'Lorde Sombrio' };

  modal.querySelector('.modal__title').textContent = (side === 'sith' ? sithTitles : titles)[rank];
  modal.querySelector('.modal__text').textContent =
    `Parabéns, ${player}! Você completou o nível ${LEVEL_NAMES[pairsCount] || ''}.`;
  modal.querySelectorAll('.rank i').forEach((pip, i) => pip.classList.toggle('on', i < rank));
  modal.querySelector('.r-time').textContent = formatTime(state.seconds);
  modal.querySelector('.r-moves').textContent = state.moves;
  modal.querySelector('.r-best').textContent = formatTime(best.time);
  modal.querySelector('.new-record').hidden = !isRecord || !previous;

  modal.classList.add('is-open');
  modal.querySelector('.js-again').focus();

  // chuva final de faíscas
  document.querySelectorAll('.card').forEach((c, i) =>
    setTimeout(() => sparks(c, 6), i * 40)
  );
};

// ---------- Início / reinício ----------
let loadToken = 0;
const loadGame = async () => {
  const token = ++loadToken;
  stopTimer();
  Object.assign(state, {
    first: null, second: null, locked: false,
    moves: 0, matched: 0, seconds: 0, timerId: null, started: false
  });
  spanTimer.textContent = '00:00';
  updateHud();

  // sorteia personagens do lado escolhido, dando prioridade a quem já tem imagem
  const status = await Promise.all(CHARACTERS.map((c) => checkImage(c.id)));
  const pool = CHARACTERS.map((c, i) => ({ ...c, hasImage: status[i] }));
  const withImage = shuffle(pool.filter((c) => c.hasImage));
  const withoutImage = shuffle(pool.filter((c) => !c.hasImage));
  const chosen = [...withImage, ...withoutImage].slice(0, pairsCount);
  if (token !== loadToken) return; // um reinício mais recente já assumiu
  const deck = shuffle([...chosen, ...chosen]);

  grid.innerHTML = '';
  const cols = COLUMNS[pairsCount] || 5;
  grid.style.setProperty('--cols', cols);
  grid.style.setProperty('--rows', Math.ceil(deck.length / cols));
  grid.dataset.cols = cols;
  deck.forEach((character, i) => grid.appendChild(createCard(character, i)));
};

document.querySelector('.js-restart').addEventListener('click', () => {
  Sound.ignite();
  loadGame();
});

document.querySelector('.js-again').addEventListener('click', () => {
  modal.classList.remove('is-open');
  Sound.ignite();
  loadGame();
});

// ---------- Som ----------
const renderSoundButton = () => {
  soundButton.setAttribute('aria-pressed', String(Sound.enabled));
  soundButton.querySelector('.icon-on').hidden = !Sound.enabled;
  soundButton.querySelector('.icon-off').hidden = Sound.enabled;
};

soundButton.addEventListener('click', () => {
  Sound.toggle();
  renderSoundButton();
});

renderSoundButton();
if (player) loadGame();
