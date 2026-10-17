// ═══════════════════════════════════════════════════════════════
// СИСТЕМА ДОСТИЖЕНИЙ, ПЕРКОВ И АНИМИРОВАННЫХ ТОСТОВ
// Модуль: achievements.js (вынесен из nanj.html, Этап 4 модуляризации)
// Зависимости: soundManager (music.js), confetti (canvas-confetti),
//              getCurrentUser, isCreatorAccount, saveCurrentUserData (accounts.js)
// ═══════════════════════════════════════════════════════════════

// ─── Безопасный парсинг и экранирование ───
function safeJsonParse(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return fallback;
    const parsed = JSON.parse(item);
    return parsed !== null ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}

// ─── База данных достижений ───
const achievementsData = [
  {
    id: 'fanatic',
    lockedTitle: '???',
    unlockedTitle: 'Фанатик',
    lockedDesc: 'Будьте преданным фанатом создателя..',
    unlockedDesc: 'Нажмите 1000 раз на кнопку во вкладке Танджиро!',
    reward: 'Возможность создавать бесконечное количество паков (до разблокировки максимум 5)'
  },
  {
    id: 'nickname',
    lockedTitle: '???',
    unlockedTitle: 'Истинное прозвище',
    lockedDesc: 'Воспользуйтесь клавиатурой, чтобы оскорбить создателя..',
    unlockedDesc: 'Напиши "Танджиро лох" на клавиатуре, введи в игре или нажми 7 раз на его имя!',
    reward: 'На ПК: клавиши 1, 2, 3 и стрелки ← / → для смены вкладок, Пробел — действие, Esc — закрыть окна. На телефоне: свайпы влево/вправо для быстрой смены вкладок!'
  },
  {
    id: 'stalker',
    lockedTitle: '???',
    unlockedTitle: 'Сталкер',
    lockedDesc: 'Узнайте побольше о создателях..',
    unlockedDesc: 'Нажмите на имя каждого создателя в футере!',
    reward: 'Полноэкранный режим для всех вкладок'
  },
  {
    id: 'ludoman',
    lockedTitle: '???',
    unlockedTitle: 'Лудоман',
    lockedDesc: 'Вам не кажется что лайт слишком скучно?',
    unlockedDesc: '100 раз прокрутите колесо фортуны!',
    reward: 'Моментальная прокрутка колеса (переключатель "Турбо-спин")'
  },
  {
    id: 'designer',
    lockedTitle: '???',
    unlockedTitle: 'Дизайнер от бога',
    lockedDesc: 'Примерьте разные стили, пока не зарябит в глазах..',
    unlockedDesc: 'Попробуйте переключить все 12 доступных шрифтов интерфейса!',
    reward: 'Режим "RGB-подсветка" (переливающиеся неоновые границы кнопок и карточки)'
  },
  {
    id: 'epileptic',
    lockedTitle: '???',
    unlockedTitle: 'Эпилептик',
    lockedDesc: 'Пощёлкайте выключателем, пока лампочка не перегорит..',
    unlockedDesc: 'Переключите тему 15 раз за одну минуту!',
    reward: 'Сверхтёмная неоновая тема "Cyberpunk Neon"'
  },
  {
    id: 'dangerous',
    lockedTitle: '???',
    unlockedTitle: 'Особо опасен',
    lockedDesc: 'Попытайтесь грязно выругаться, но система вас остановит..',
    unlockedDesc: 'Получите предупреждение о запрещённых словах 3 раза!',
    reward: 'Эффект тряски экрана при генерации ролей'
  },
  {
    id: 'chef',
    lockedTitle: '???',
    unlockedTitle: 'Шеф-повар паков',
    lockedDesc: 'Соберите безумный микс из множества источников..',
    unlockedDesc: 'Скомбинируйте и запустите игру сразу из 3 или более паков одновременно!',
    reward: 'Режим "Двойной выбор" в Кастоме (выбирает сразу 2 участников)'
  },
  {
    id: 'insider',
    lockedTitle: '???',
    unlockedTitle: 'Свой среди своих',
    lockedDesc: 'Сделайте это место по-настоящему своим..',
    unlockedDesc: 'Установите собственное изображение и на фон сайта, и на фон карточек!',
    reward: 'Анимированный эффект мерцающих звёздных частиц'
  },
  {
    id: 'hacker',
    lockedTitle: '???',
    unlockedTitle: 'Взломщик реальности',
    lockedDesc: 'Постучите по вывеске корпорации..',
    unlockedDesc: 'Быстро кликните 10 раз по надписи «ООО "тмыв иишек"» в футере!',
    reward: 'Взрыв конфетти при каждом действии'
  },
  {
    id: 'creator_blessing',
    lockedTitle: '??? (Эксклюзив)',
    unlockedTitle: 'Архитектор Реальности 🪐',
    lockedDesc: 'Тайное благословение создателя вселенной Nanjicore..',
    unlockedDesc: 'Высший знак отличия: вы управляете правилами и кодом этого мира!',
    reward: 'Королевская аура создателя и доступ к высшим привилегиям',
    isAdminExclusive: true
  },
  {
    id: 'perpetual',
    lockedTitle: '???',
    unlockedTitle: 'Вечный двигатель',
    lockedDesc: 'Попробуйте разогнать вращение, не дожидаясь его остановки..',
    unlockedDesc: 'Нажмите 7 раз подряд на кнопку во время вращения колеса!',
    reward: 'Возможность автоматического прокрута колеса (кнопка "Авто-спин")'
  },
  {
    id: 'universal',
    lockedTitle: '???',
    unlockedTitle: 'Истинный универсал',
    lockedDesc: 'Попробуйте абсолютно всё, что здесь есть..',
    unlockedDesc: 'Сыграйте хотя бы по 5 раз в каждой из 3 вкладок!',
    reward: 'Золотая анимированная VIP-рамка профиля в окне достижений'
  }
];

// ─── Состояние достижений ───
const defaultAchState = {
  tanjiroClicks: 0,
  wheelSpins: 0,
  stalkerVisited: [],
  testedFonts: [],
  badWordCount: 0,
  tabPlays: { tanjiro: 0, jenna: 0, custom: 0 },
  unlocked: {}
};

let rawAchState = {};
try {
  rawAchState = JSON.parse(localStorage.getItem('user_achievements_state')) || {};
} catch (e) {
  rawAchState = {};
}

var achState = (typeof window.achState !== 'undefined' && window.achState && Object.keys(window.achState).length > 0)
  ? window.achState
  : {
      ...defaultAchState,
      ...rawAchState,
      stalkerVisited: Array.isArray(rawAchState.stalkerVisited) ? rawAchState.stalkerVisited : [],
      testedFonts: Array.isArray(rawAchState.testedFonts) ? rawAchState.testedFonts : [],
      badWordCount: typeof rawAchState.badWordCount === 'number' ? rawAchState.badWordCount : 0,
      tabPlays: {
        ...defaultAchState.tabPlays,
        ...(rawAchState.tabPlays || {})
      },
      unlocked: {
        ...defaultAchState.unlocked,
        ...(rawAchState.unlocked || {})
      }
    };
window.achState = achState;

// ─── Настройки эффектов и перков ───
const defaultEffectsSettings = {
  stars: false,
  rgb: false,
  cyberpunk: false,
  shake: true,
  confetti: true,
  hotkeys: true,
  fullscreen: true,
  turbo: true,
  dual: true,
  infinite: true
};

var achEffects = (typeof window.achEffects !== 'undefined' && window.achEffects)
  ? window.achEffects
  : safeJsonParse('ach_effects_settings', defaultEffectsSettings);
window.achEffects = achEffects;

let currentAchFilter = 'all'; // 'all', 'locked', 'completed'

function saveEffectsSettings() {
  localStorage.setItem('ach_effects_settings', JSON.stringify(achEffects));
  if (typeof saveCurrentUserData === 'function') saveCurrentUserData();
  applyAllActiveEffects();
}

function saveAchState() {
  localStorage.setItem('user_achievements_state', JSON.stringify(achState));
  if (typeof saveCurrentUserData === 'function') saveCurrentUserData();
  updateAchievementsUI();
}

// ─── Анимированный тост достижений ───
let toastQueue = [];
let isToastRunning = false;

function triggerAchievementToast(ach) {
  if (typeof soundManager !== 'undefined' && soundManager && typeof soundManager.playUnlock === 'function') {
    soundManager.playUnlock();
  }
  toastQueue.push(ach);
  if (!isToastRunning) processNextToast();
}

function processNextToast() {
  if (toastQueue.length === 0) {
    isToastRunning = false;
    return;
  }
  isToastRunning = true;
  const ach = toastQueue.shift();

  const toast = document.getElementById('achievementToast');
  const textContainer = document.getElementById('toastTextContainer');
  const toastHeader = document.getElementById('toastHeader');
  const toastMain = document.getElementById('toastMain');
  const toastSub = document.getElementById('toastSub');

  if (!toast || !textContainer || !toastHeader || !toastMain || !toastSub) {
    isToastRunning = false;
    return;
  }

  const tHeader = (typeof window.t === 'function') ? window.t('ach_toast_title', 'Выполнено достижение!') : 'Выполнено достижение!';
  const tTitle = (typeof window.t === 'function') ? window.t('ach_' + ach.id + '_unlocked_title', ach.unlockedTitle) : ach.unlockedTitle;
  const tDesc = (typeof window.t === 'function') ? window.t('ach_' + ach.id + '_unlocked_desc', ach.unlockedDesc) : ach.unlockedDesc;
  toastHeader.textContent = tHeader;
  toastHeader.className = 'text-[11px] font-extrabold uppercase tracking-wider text-amber-400';
  toastMain.textContent = tTitle;
  toastSub.textContent = tDesc;

  toast.classList.remove('opacity-0', '-translate-y-32', 'pointer-events-none');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    textContainer.classList.add('opacity-0');
    setTimeout(() => {
      const tRewardHeader = (typeof window.t === 'function') ? window.t('ach_toast_reward_header', 'Получена награда:') : 'Получена награда:';
      const tRewardText = (typeof window.t === 'function') ? window.t('ach_' + ach.id + '_reward', ach.reward) : ach.reward;
      const tRewardSub = (typeof window.t === 'function') ? window.t('ach_toast_reward_sub', 'Награда уже доступна в меню!') : 'Награда уже доступна в меню!';
      toastHeader.textContent = tRewardHeader;
      toastHeader.className = 'text-[11px] font-extrabold uppercase tracking-wider text-emerald-400';
      toastMain.textContent = tRewardText;
      toastSub.textContent = tRewardSub;
      textContainer.classList.remove('opacity-0');
    }, 300);
  }, 2600);

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', '-translate-y-32', 'pointer-events-none');
    setTimeout(() => { processNextToast(); }, 500);
  }, 5500);
}

function unlockAchievement(id) {
  if (!achState.unlocked) achState.unlocked = {};
  if (achState.unlocked[id]) return;
  achState.unlocked[id] = true;

  // Авто-включение только функциональных перков при получении достижения (визуальные темы включаются вручную)
  const achToPerk = {
    dangerous: 'shake',
    hacker: 'confetti',
    nickname: 'hotkeys',
    stalker: 'fullscreen',
    ludoman: 'turbo',
    chef: 'dual',
    perpetual: 'infinite'
  };
  if (achToPerk[id]) {
    achEffects[achToPerk[id]] = true;
    localStorage.setItem('ach_effects_settings', JSON.stringify(achEffects));
  }

  saveAchState();

  const ach = achievementsData.find(a => a.id === id);
  if (ach) {
    triggerAchievementToast(ach);
    if (typeof confetti === 'function') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.2 } });
    }
  }
  applyAllActiveEffects();
}

function registerTabPlay(tabName) {
  if (!achState.tabPlays) achState.tabPlays = { tanjiro: 0, jenna: 0, custom: 0 };
  achState.tabPlays[tabName] = (achState.tabPlays[tabName] || 0) + 1;
  saveAchState();

  if (achState.tabPlays.tanjiro >= 5 && achState.tabPlays.jenna >= 5 && achState.tabPlays.custom >= 5) {
    unlockAchievement('universal');
  }
}

function fireRewardEffects() {
  if (achState.unlocked?.hacker && achEffects.confetti && typeof confetti === 'function') {
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
  }
  if (achState.unlocked?.dangerous && achEffects.shake) {
    const card = document.getElementById('mainContentCard');
    if (card) {
      card.classList.remove('shake-anim');
      void card.offsetHeight;
      card.classList.add('shake-anim');
    }
  }
}

// ─── Холст звёздного неба ───
let starsCanvas = null;
let sCtx = null;
let stars = [];
let starsRaf = null;

function resizeStarsCanvas() {
  if (!starsCanvas) starsCanvas = document.getElementById('starsCanvas');
  if (!starsCanvas) return;
  starsCanvas.width = window.innerWidth;
  starsCanvas.height = window.innerHeight;
  stars = Array.from({ length: 65 }, () => ({
    x: Math.random() * starsCanvas.width,
    y: Math.random() * starsCanvas.height,
    r: Math.random() * 1.8 + 0.6,
    alpha: Math.random(),
    speed: Math.random() * 0.02 + 0.008,
    dy: Math.random() * 0.25 + 0.1
  }));
}

function renderStars() {
  if (!starsCanvas) starsCanvas = document.getElementById('starsCanvas');
  if (!starsCanvas) return;
  if (!sCtx) sCtx = starsCanvas.getContext('2d');
  if (!sCtx) return;

  if (!achState.unlocked?.insider || !achEffects.stars) {
    sCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
    starsRaf = null;
    return;
  }
  sCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
  stars.forEach(s => {
    s.alpha += s.speed;
    s.y -= s.dy;
    if (s.y < 0) s.y = starsCanvas.height;
    const a = Math.abs(Math.sin(s.alpha));
    sCtx.beginPath();
    sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    sCtx.fillStyle = `rgba(255, 255, 255, ${a * 0.85})`;
    sCtx.shadowColor = '#ffffff';
    sCtx.shadowBlur = 5;
    sCtx.fill();
  });
  starsRaf = requestAnimationFrame(renderStars);
}

// ─── Применение всех открытых эффектов ───
function applyAllActiveEffects() {
  const activeUser = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
  if (activeUser && (typeof isCreatorAccount === 'function') && isCreatorAccount(activeUser)) {
    if (!achState.unlocked) achState.unlocked = {};
    achState.unlocked.creator_blessing = true;
  }
  const card = document.getElementById('mainContentCard');

  // 1. Звезды
  if (!starsCanvas) starsCanvas = document.getElementById('starsCanvas');
  const shouldShowStars = !!(achState.unlocked?.insider && achEffects.stars);
  if (starsCanvas) {
    starsCanvas.classList.toggle('hidden', !shouldShowStars);
  }
  if (shouldShowStars && !starsRaf) {
    renderStars();
  }

  // 2. RGB
  if (card) {
    const shouldRgb = !!(achState.unlocked?.designer && achEffects.rgb);
    card.classList.toggle('rgb-border', shouldRgb);
  }

  // 3. Киберпанк тема
  const shouldCyber = !!(achState.unlocked?.epileptic && achEffects.cyberpunk);
  if (document.body) {
    document.body.classList.toggle('cyberpunk-mode', shouldCyber);
  }

  // 4. Полноэкранный режим
  const shouldFs = !!(achState.unlocked?.stalker && achEffects.fullscreen);
  const fsToggleBtn = document.getElementById('fullscreenToggleBtn');
  if (fsToggleBtn) {
    fsToggleBtn.classList.toggle('hidden', !shouldFs);
  }

  // 5. Двойной выбор
  const shouldDual = !!(achState.unlocked?.chef && achEffects.dual);
  const dualBox = document.getElementById('dualDropOptionBox');
  if (dualBox) {
    dualBox.classList.toggle('hidden', !shouldDual);
    dualBox.classList.toggle('flex', shouldDual);
  }

  // 6. Кнопки Авто-спина (только при разблокированной ачивке И только в режиме Колеса)
  const hasPerpetual = !!(achState.unlocked?.perpetual && achEffects.infinite);
  const currentTabModes = (typeof tabModes !== 'undefined' && tabModes) ? tabModes : (window.tabModes || {});

  const tanjiroInfBtn = document.getElementById('tanjiroInfiniteBtn');
  if (tanjiroInfBtn) {
    const showTanjiroInf = hasPerpetual && (currentTabModes.tanjiro === 'wheel');
    tanjiroInfBtn.style.display = showTanjiroInf ? 'flex' : 'none';
    tanjiroInfBtn.classList.toggle('hidden', !showTanjiroInf);
    tanjiroInfBtn.classList.toggle('flex', showTanjiroInf);
  }

  const customInfBtn = document.getElementById('customInfiniteBtn');
  if (customInfBtn) {
    const showCustomInf = hasPerpetual && (currentTabModes.custom === 'wheel');
    customInfBtn.style.display = showCustomInf ? 'flex' : 'none';
    customInfBtn.classList.toggle('hidden', !showCustomInf);
    customInfBtn.classList.toggle('flex', showCustomInf);
  }

  const whoInfBtn = document.getElementById('whoInfiniteBtn');
  if (whoInfBtn) {
    whoInfBtn.style.display = hasPerpetual ? 'flex' : 'none';
    whoInfBtn.classList.toggle('hidden', !hasPerpetual);
    whoInfBtn.classList.toggle('flex', hasPerpetual);
  }

  const membersInfBtn = document.getElementById('membersInfiniteBtn');
  if (membersInfBtn) {
    membersInfBtn.style.display = hasPerpetual ? 'flex' : 'none';
    membersInfBtn.classList.toggle('hidden', !hasPerpetual);
    membersInfBtn.classList.toggle('flex', hasPerpetual);
  }

  // 8. Проверка ачивки Свой среди своих
  if (localStorage.getItem('sitePhotoBg') && localStorage.getItem('tabCustomPhoto')) {
    unlockAchievement('insider');
  }
}

// ─── Отрисовка переключателей перков ───
function renderPerksToggles() {
  const list = document.getElementById('perksTogglesList');
  const section = document.getElementById('perksControlSection');
  if (!list || !section) return;

  const perksDef = [
    { achId: 'insider', key: 'stars', label: (typeof window.t === 'function' ? window.t('perk_stars', 'Звёздный фон') : 'Звёздный фон') },
    { achId: 'designer', key: 'rgb', label: (typeof window.t === 'function' ? window.t('perk_rgb', 'RGB-подсветка') : 'RGB-подсветка') },
    { achId: 'epileptic', key: 'cyberpunk', label: (typeof window.t === 'function' ? window.t('perk_cyberpunk', 'Киберпанк тема') : 'Киберпанк тема') },
    { achId: 'dangerous', key: 'shake', label: (typeof window.t === 'function' ? window.t('perk_shake', 'Тряска экрана') : 'Тряска экрана') },
    { achId: 'hacker', key: 'confetti', label: (typeof window.t === 'function' ? window.t('perk_confetti', 'Конфетти при кликах') : 'Конфетти при кликах') },
    { achId: 'nickname', key: 'hotkeys', label: (typeof window.t === 'function' ? window.t('perk_hotkeys', 'Горячие клавиши и жесты') : 'Горячие клавиши и жесты') },
    { achId: 'stalker', key: 'fullscreen', label: (typeof window.t === 'function' ? window.t('perk_fullscreen', 'Полный экран') : 'Полный экран') },
    { achId: 'ludoman', key: 'turbo', label: (typeof window.t === 'function' ? window.t('perk_turbo', 'Турбо-спин') : 'Турбо-спин') },
    { achId: 'chef', key: 'dual', label: (typeof window.t === 'function' ? window.t('perk_dual', 'Двойной выбор') : 'Двойной выбор') },
    { achId: 'perpetual', key: 'infinite', label: (typeof window.t === 'function' ? window.t('perk_infinite', 'Авто-спин') : 'Авто-спин') }
  ];

  const unlockedPerks = perksDef.filter(p => achState.unlocked?.[p.achId]);
  section.classList.toggle('hidden', unlockedPerks.length === 0);

  list.innerHTML = '';
  unlockedPerks.forEach(p => {
    const item = document.createElement('label');
    item.className = 'flex items-center justify-between p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-amber-400 transition';
    item.innerHTML = `
      <span class="font-medium truncate mr-2 dark:text-gray-200">${p.label}</span>
      <input type="checkbox" ${achEffects[p.key] ? 'checked' : ''} class="w-4 h-4 accent-amber-500 rounded cursor-pointer" />
    `;
    const cb = item.querySelector('input');
    cb.addEventListener('change', (e) => {
      achEffects[p.key] = e.target.checked;
      saveEffectsSettings();
    });
    list.appendChild(item);
  });
}

// ─── Фильтры списка достижений ───
function setAchFilter(filterType) {
  currentAchFilter = filterType;
  const filterBtns = {
    all: document.getElementById('achFilterAll'),
    locked: document.getElementById('achFilterLocked'),
    completed: document.getElementById('achFilterCompleted')
  };
  Object.keys(filterBtns).forEach(k => {
    const btn = filterBtns[k];
    if (!btn) return;
    if (k === filterType) {
      btn.className = 'ach-filter-btn flex-1 py-1.5 rounded-lg bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-sm transition';
    } else {
      btn.className = 'ach-filter-btn flex-1 py-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition';
    }
  });
  updateAchievementsUI();
}

// ─── Обновление UI списка достижений ───
function updateAchievementsUI() {
  const list = document.getElementById('achievementsList');
  const progressText = document.getElementById('achProgressText');
  const progressBar = document.getElementById('achProgressBar');
  const vipBadge = document.getElementById('vipBadge');
  const modalContent = document.getElementById('modalAchievementsContent');

  const totalUnlocked = Object.values(achState.unlocked || {}).filter(Boolean).length;
  const totalAch = achievementsData.length;

  if (progressText) {
    const pPrefix = (typeof window.t === 'function') ? window.t('ach_progress_prefix', 'Прогресс: ') : 'Прогресс: ';
    const pDone = (typeof window.t === 'function') ? window.t('ach_progress_done', 'выполнено') : 'выполнено';
    progressText.textContent = `${pPrefix}${totalUnlocked} / ${totalAch} ${pDone}`;
  }
  if (progressBar) progressBar.style.width = `${(totalUnlocked / totalAch) * 100}%`;

  if (achState.unlocked?.universal) {
    vipBadge?.classList.remove('hidden');
    modalContent?.classList.add('vip-gold-glow');
  } else {
    vipBadge?.classList.add('hidden');
    modalContent?.classList.remove('vip-gold-glow');
  }

  renderPerksToggles();
  if (!list) return;

  let filteredList = [...achievementsData];
  if (currentAchFilter === 'locked') {
    filteredList = filteredList.filter(a => !achState.unlocked?.[a.id]);
  } else if (currentAchFilter === 'completed') {
    filteredList = filteredList.filter(a => !!achState.unlocked?.[a.id]);
  }

  // Невыполненные всегда в самом верху
  filteredList.sort((a, b) => {
    const aDone = !!achState.unlocked?.[a.id];
    const bDone = !!achState.unlocked?.[b.id];
    if (aDone === bDone) return 0;
    return aDone ? 1 : -1;
  });

  list.innerHTML = '';
  if (filteredList.length === 0) {
    const emptyMsg = (typeof window.t === 'function') ? window.t('ach_empty_category', 'В этой категории пока ничего нет.') : 'В этой категории пока ничего нет.';
    list.innerHTML = `<p class="text-center text-sm text-gray-500 py-6">${emptyMsg}</p>`;
    return;
  }

  filteredList.forEach((ach) => {
    const isDone = !!achState.unlocked?.[ach.id];
    const unlockedTitle = (typeof window.t === 'function') ? window.t(`ach_${ach.id}_unlocked_title`, ach.unlockedTitle) : ach.unlockedTitle;
    const lockedTitle = (typeof window.t === 'function') ? window.t(`ach_${ach.id}_locked_title`, ach.lockedTitle) : ach.lockedTitle;
    const unlockedDesc = (typeof window.t === 'function') ? window.t(`ach_${ach.id}_unlocked_desc`, ach.unlockedDesc) : ach.unlockedDesc;
    const lockedDesc = (typeof window.t === 'function') ? window.t(`ach_${ach.id}_locked_desc`, ach.lockedDesc) : ach.lockedDesc;
    const reward = (typeof window.t === 'function') ? window.t(`ach_${ach.id}_reward`, ach.reward) : ach.reward;
    const statusText = isDone
      ? ((typeof window.t === 'function') ? window.t('ach_status_completed', 'ВЫПОЛНЕНО') : 'ВЫПОЛНЕНО')
      : ((typeof window.t === 'function') ? window.t('ach_status_locked', 'ЗАБЛОКИРОВАНО') : 'ЗАБЛОКИРОВАНО');
    const rewardPrefix = (typeof window.t === 'function') ? window.t('ach_reward_prefix', 'Награда: ') : 'Награда: ';

    const card = document.createElement('div');
    card.className = `p-4 rounded-2xl border transition relative ${
      isDone 
        ? 'bg-amber-500/10 border-amber-400/60 dark:bg-amber-950/20 shadow-md' 
        : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700 opacity-85'
    }`;

    card.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="font-bold text-base ${isDone ? 'text-amber-600 dark:text-amber-300' : 'text-gray-800 dark:text-gray-200'}">
              ${isDone ? unlockedTitle : lockedTitle}
            </span>
            <span class="px-2 py-0.5 text-[10px] font-bold rounded-full ${isDone ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}">
              ${statusText}
            </span>
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">
            ${isDone ? unlockedDesc : lockedDesc}
          </p>
          <div class="mt-2 text-xs p-2 rounded-xl ${isDone ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' : 'bg-gray-100 dark:bg-gray-800/60 text-gray-400'}">
            <span class="font-bold">${rewardPrefix}</span> ${reward}
          </div>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
}

// ─── Модальное окно достижений ───
function openAchievementsModal() {
  updateAchievementsUI();
  const modalAchievements = document.getElementById('modalAchievements');
  const modalAchievementsContent = document.getElementById('modalAchievementsContent');
  if (modalAchievements && modalAchievementsContent) {
    modalAchievements.classList.remove('hidden', 'animate-modal-backdrop-out');
    modalAchievements.classList.add('animate-modal-backdrop-in');
    modalAchievementsContent.classList.remove('animate-fade-out-scale', 'opacity-0', 'invisible');
    modalAchievementsContent.classList.add('animate-fade-in-scale');
  }
}

function closeAchievementsModal() {
  const modalAchievements = document.getElementById('modalAchievements');
  const modalAchievementsContent = document.getElementById('modalAchievementsContent');
  if (modalAchievements && modalAchievementsContent) {
    modalAchievements.classList.remove('animate-modal-backdrop-in');
    modalAchievements.classList.add('animate-modal-backdrop-out');
    modalAchievementsContent.classList.remove('animate-fade-in-scale');
    modalAchievementsContent.classList.add('animate-fade-out-scale');
    setTimeout(() => {
      modalAchievements.classList.add('hidden');
      modalAchievements.classList.remove('animate-modal-backdrop-out');
      modalAchievementsContent.classList.remove('animate-fade-out-scale');
      modalAchievementsContent.classList.add('opacity-0', 'invisible');
    }, 180);
  }
}

// ─── Инициализация слушателей событий достижений ───
function initAchievementsListeners() {
  // Аккордеон настроек эффектов
  const perksAccordionToggle = document.getElementById('perksAccordionToggle');
  const perksAccordionContent = document.getElementById('perksAccordionContent');
  const perksAccordionChevron = document.getElementById('perksAccordionChevron');

  if (perksAccordionToggle && perksAccordionContent && perksAccordionChevron) {
    perksAccordionToggle.addEventListener('click', () => {
      const isClosed = perksAccordionContent.classList.contains('hidden');
      perksAccordionContent.classList.toggle('hidden', !isClosed);
      perksAccordionChevron.classList.toggle('rotate-180', isClosed);
    });
  }

  // Фильтры списка достижений
  const filterBtnAll = document.getElementById('achFilterAll');
  const filterBtnLocked = document.getElementById('achFilterLocked');
  const filterBtnCompleted = document.getElementById('achFilterCompleted');
  if (filterBtnAll) filterBtnAll.addEventListener('click', () => setAchFilter('all'));
  if (filterBtnLocked) filterBtnLocked.addEventListener('click', () => setAchFilter('locked'));
  if (filterBtnCompleted) filterBtnCompleted.addEventListener('click', () => setAchFilter('completed'));

  // Открытие окна достижений
  const achievementsBtn = document.getElementById('achievementsBtn');
  if (achievementsBtn) {
    achievementsBtn.addEventListener('click', openAchievementsModal);
  }

  // Закрытие окна достижений
  const closeBtn = document.getElementById('closeAchievementsModalX');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeAchievementsModal);
  }

  const modalAchievements = document.getElementById('modalAchievements');
  if (modalAchievements) {
    modalAchievements.addEventListener('click', (e) => {
      if (e.target === modalAchievements) closeAchievementsModal();
    });
  }

  // Сталкер (клики по ссылкам создателей в футере)
  document.querySelectorAll('.creator-link').forEach(link => {
    link.addEventListener('click', () => {
      const c = link.getAttribute('data-creator');
      if (c && !achState.stalkerVisited.includes(c)) {
        achState.stalkerVisited.push(c);
        saveAchState();
        if (achState.stalkerVisited.length >= 4) unlockAchievement('stalker');
      }
    });
  });

  // Взломщик реальности (10 быстрых кликов по corpTitle)
  let footerClicks = 0;
  let footerTimer = null;
  const corpTitle = document.getElementById('corpTitle');
  if (corpTitle) {
    corpTitle.addEventListener('click', () => {
      footerClicks++;
      clearTimeout(footerTimer);
      footerTimer = setTimeout(() => { footerClicks = 0; }, 2500);
      if (footerClicks >= 10) {
        unlockAchievement('hacker');
        footerClicks = 0;
      }
    });
  }

  // Полноэкранный режим
  const fullscreenToggleBtn = document.getElementById('fullscreenToggleBtn');
  const mainContentCard = document.getElementById('mainContentCard');
  if (fullscreenToggleBtn && mainContentCard) {
    fullscreenToggleBtn.addEventListener('click', () => {
      const isFs = mainContentCard.classList.toggle('fullscreen-card');
      document.body.classList.toggle('tab-fullscreen-active', isFs);
      if (isFs) {
        mainContentCard.style.removeProperty('height');
        mainContentCard.style.removeProperty('min-height');
        mainContentCard.style.removeProperty('max-height');
      } else if (typeof updateAdaptiveCardHeight === 'function') {
        updateAdaptiveCardHeight();
      } else if (typeof window.updateAdaptiveCardHeight === 'function') {
        window.updateAdaptiveCardHeight();
      }
      const expandIcon = document.getElementById('fullscreenExpandIcon');
      const compressIcon = document.getElementById('fullscreenCompressIcon');
      if (expandIcon) expandIcon.classList.toggle('hidden', isFs);
      if (compressIcon) compressIcon.classList.toggle('hidden', !isFs);
      fullscreenToggleBtn.setAttribute('title', isFs ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainContentCard.classList.contains('fullscreen-card')) {
        fullscreenToggleBtn.click();
      }
    });
  }

  // Звёздный холст
  window.addEventListener('resize', resizeStarsCanvas);
  resizeStarsCanvas();
  renderStars();
}

function initAchievements() {
  initAchievementsListeners();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAchievements);
} else {
  initAchievements();
}

window.addEventListener('languageChanged', () => {
  if (typeof updateAchievementsUI === 'function') {
    updateAchievementsUI();
  }
});

// ─── ГЛОБАЛЬНЫЙ ЭКСПОРТ ДЛЯ ИНЛАЙН-ОБРАБОТЧИКОВ И ДРУГИХ МОДУЛЕЙ ───
window.achievementsData = achievementsData;
window.defaultAchState = defaultAchState;
window.achState = achState;
window.defaultEffectsSettings = defaultEffectsSettings;
window.achEffects = achEffects;
window.currentAchFilter = currentAchFilter;
window.safeJsonParse = safeJsonParse;
window.saveEffectsSettings = saveEffectsSettings;
window.saveAchState = saveAchState;
window.triggerAchievementToast = triggerAchievementToast;
window.processNextToast = processNextToast;
window.unlockAchievement = unlockAchievement;
window.registerTabPlay = registerTabPlay;
window.fireRewardEffects = fireRewardEffects;
window.resizeStarsCanvas = resizeStarsCanvas;
window.renderStars = renderStars;
window.applyAllActiveEffects = applyAllActiveEffects;
window.renderPerksToggles = renderPerksToggles;
window.setAchFilter = setAchFilter;
window.updateAchievementsUI = updateAchievementsUI;
window.openAchievementsModal = openAchievementsModal;
window.closeAchievementsModal = closeAchievementsModal;
window.initAchievementsListeners = initAchievementsListeners;
window.initAchievements = initAchievements;
