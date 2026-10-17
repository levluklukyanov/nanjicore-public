// ═══════════════════════════════════════════════════════════════
// СИСТЕМА УВЕДОМЛЕНИЙ, ДИАЛОГОВ И ВАЛИДАЦИИ ПАРОЛЕЙ
// Модуль: dialogs.js (вынесен из accounts.js / nanj.html, Этап 5.1 модуляризации)
// Зависимости: DOM
// ═══════════════════════════════════════════════════════════════

// ─── Безопасное экранирование строк для предотвращения XSS ───
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#96;');
}
if (typeof window !== 'undefined' && !window.escapeHtml) {
  window.escapeHtml = escapeHtml;
}

// ═══════════════════════════════════════════════════════════════
// СИСТЕМНЫЕ УВЕДОМЛЕНИЯ В СТИЛЕ САЙТА (ВМЕСТО NATIVE ALERT)
// ═══════════════════════════════════════════════════════════════

function showSiteToast(msg, type = 'warning', customTitle = '') {
  let container = document.getElementById('globalAppToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'globalAppToastContainer';
    container.className = 'fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2.5 pointer-events-none w-[92%] max-w-md';
    document.body.appendChild(container);
  }

  const titles = {
    warning: (typeof window.t === 'function' ? window.t('toast_type_warning') : 'Внимание'),
    error: (typeof window.t === 'function' ? window.t('toast_type_error') : 'Ошибка'),
    success: (typeof window.t === 'function' ? window.t('toast_type_success') : 'Успешно'),
    info: (typeof window.t === 'function' ? window.t('toast_type_info') : 'Информация')
  };

  const icons = {
    warning: '<svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>',
    error: '<svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>',
    success: '<svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    info: '<svg class="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/></svg>'
  };

  const borders = {
    warning: 'border-amber-500/50 shadow-amber-500/20',
    error: 'border-red-500/50 shadow-red-500/20',
    success: 'border-emerald-500/50 shadow-emerald-500/20',
    info: 'border-indigo-500/50 shadow-indigo-500/20'
  };

  const titleColors = {
    warning: 'text-amber-400',
    error: 'text-red-400',
    success: 'text-emerald-400',
    info: 'text-indigo-400'
  };

  const toast = document.createElement('div');
  toast.className = `w-full bg-gray-900/95 dark:bg-gray-800/95 text-white border ${borders[type] || borders.warning} rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-start gap-3.5 pointer-events-auto transition-all duration-300 transform -translate-y-4 opacity-0`;
  
  const title = customTitle || titles[type] || 'Предупреждение';
  const icon = icons[type] || icons.warning;
  const titleColor = titleColors[type] || 'text-amber-400';

  toast.innerHTML = `
    <div class="p-2 rounded-xl bg-white/10 flex-shrink-0 mt-0.5 shadow-inner">
      ${icon}
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-[11px] font-black uppercase tracking-wider ${titleColor}">${escapeHtml(title)}</div>
      <div class="text-xs font-semibold text-gray-200 mt-0.5 leading-relaxed break-words">${escapeHtml(msg)}</div>
    </div>
    <button type="button" class="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10 flex-shrink-0">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
    </button>
  `;

  const closeBtn = toast.querySelector('button');
  const removeToast = () => {
    toast.classList.add('-translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  };

  if (closeBtn) closeBtn.addEventListener('click', removeToast);

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('-translate-y-4', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  setTimeout(removeToast, 4200);
}

// Заменяем стандартный window.alert на красивый тост
if (typeof window !== 'undefined') {
  window.showSiteToast = showSiteToast;
  window.alert = function(msg) {
    showSiteToast(msg, 'warning');
  };
}

// ═══════════════════════════════════════════════════════════════
// ДИАЛОГ ПОДТВЕРЖДЕНИЯ ДЕЙСТВИЙ В СТИЛЕ САЙТА (ВМЕСТО CONFIRM)
// ═══════════════════════════════════════════════════════════════

function showConfirmDialog({
  title = (typeof window.t === 'function' ? window.t('common_confirm_title') : 'Подтверждение'),
  message = (typeof window.t === 'function' ? window.t('common_confirm_message') : 'Вы уверены?'),
  confirmText = (typeof window.t === 'function' ? window.t('common_confirm') : 'Подтвердить'),
  cancelText = (typeof window.t === 'function' ? window.t('confirm_cancel') : 'Отмена'),
  isDanger = true,
  onConfirm = () => {},
  onCancel = () => {}
}) {
  let modal = document.getElementById('globalConfirmModal');
  let content = document.getElementById('globalConfirmModalContent');

  if (!modal || !content) {
    const modalWrapper = document.createElement('div');
    modalWrapper.id = 'globalConfirmModal';
    modalWrapper.className = 'fixed inset-0 bg-black/75 backdrop-blur-md z-[110] hidden flex items-center justify-center p-4 modal-scroll-contain';
    modalWrapper.innerHTML = `
      <div id="globalConfirmModalContent" class="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl transform transition-all opacity-0 invisible text-center border border-gray-100 dark:border-gray-700">
        <div id="globalConfirmIconContainer" class="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-500 mx-auto flex items-center justify-center mb-3.5 shadow-inner">
          <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 id="globalConfirmTitle" class="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Подтверждение</h3>
        <p id="globalConfirmMessage" class="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed"></p>
        <div class="flex gap-3">
          <button id="globalConfirmCancelBtn" type="button" class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl font-bold text-xs transition text-gray-700 dark:text-gray-200">
            Отмена
          </button>
          <button id="globalConfirmOkBtn" type="button" class="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-red-500/25">
            Подтвердить
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modalWrapper);
    modal = modalWrapper;
    content = document.getElementById('globalConfirmModalContent');
  }

  const titleEl = document.getElementById('globalConfirmTitle');
  const msgEl = document.getElementById('globalConfirmMessage');
  const okBtn = document.getElementById('globalConfirmOkBtn');
  const cancelBtn = document.getElementById('globalConfirmCancelBtn');
  const iconBox = document.getElementById('globalConfirmIconContainer');

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;
  if (okBtn) okBtn.textContent = confirmText;
  if (cancelBtn) cancelBtn.textContent = cancelText;

  if (okBtn) {
    if (isDanger) {
      okBtn.className = 'flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-red-500/25 active:scale-95';
    } else {
      okBtn.className = 'flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-500/25 active:scale-95';
    }
  }

  if (iconBox) {
    if (isDanger) {
      iconBox.className = 'w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-500 mx-auto flex items-center justify-center mb-3.5 shadow-inner';
    } else {
      iconBox.className = 'w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center mb-3.5 shadow-inner';
    }
  }

  const closeModal = () => {
    modal.classList.remove('animate-modal-backdrop-in');
    modal.classList.add('animate-modal-backdrop-out');
    content.classList.remove('animate-fade-in-scale');
    content.classList.add('animate-fade-out-scale');
    setTimeout(() => {
      modal.classList.add('hidden');
      modal.classList.remove('animate-modal-backdrop-out');
      content.classList.remove('animate-fade-out-scale');
      content.classList.add('opacity-0', 'invisible');
    }, 180);
  };

  if (okBtn) {
    okBtn.onclick = () => {
      closeModal();
      onConfirm();
    };
  }

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      closeModal();
      onCancel();
    };
  }

  modal.classList.remove('hidden', 'animate-modal-backdrop-out');
  modal.classList.add('animate-modal-backdrop-in');
  content.classList.remove('animate-fade-out-scale', 'opacity-0', 'invisible');
  content.classList.add('animate-fade-in-scale');
}

// ═══════════════════════════════════════════════════════════════
// ПРОВЕРКА НАДЁЖНОСТИ ПАРОЛЯ (PASSWORD STRENGTH EVALUATOR)
// ═══════════════════════════════════════════════════════════════

const FORBIDDEN_PASSWORDS = [
  '1234', '12345', '123456', '1234567', '12345678', '123456789', '1234567890',
  '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999',
  '000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999',
  'password', 'pass', 'admin', 'root', 'user', 'qwerty', 'ytrewq', 'asdfgh', 'zxcvbn',
  '123123', '654321', '987654321', '112233', '12344321', 'йцукен', 'пароль', '123321'
];

function evaluatePasswordStrength(pwd) {
  if (!pwd) {
    return { score: 0, label: 'Пусто', color: 'gray', valid: false, reason: 'Введите пароль' };
  }

  const clean = pwd.trim().toLowerCase();

  // 1. Проверка черного списка простых паролей
  if (FORBIDDEN_PASSWORDS.includes(clean)) {
    return {
      score: 1,
      label: 'Недопустимо простой (в черном списке)',
      color: 'red',
      valid: false,
      reason: 'Пароль слишком предсказуем (например, 1234 или qwerty)!'
    };
  }

  // 2. Проверка на одинаковые повторяющиеся символы (напр. aaaaa, 11111)
  if (/^(.)\1+$/.test(pwd)) {
    return {
      score: 1,
      label: 'Недопустимо простой (один символ)',
      color: 'red',
      valid: false,
      reason: 'Не используйте один и тот же повторяющийся символ!'
    };
  }

  // 3. Минимальная длина 6 символов
  if (pwd.length < 6) {
    return {
      score: 1,
      label: 'Слишком короткий (мин. 6)',
      color: 'red',
      valid: false,
      reason: 'Пароль должен быть длиной не менее 6 символов!'
    };
  }

  // 4. Оценка сложности
  let score = 1;
  if (pwd.length >= 8) score++;
  if (/[A-ZА-ЯЁ]/.test(pwd) && /[a-zа-яё]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-zА-Яа-яЁё0-9]/.test(pwd)) score++;

  let label = 'Слабый';
  let color = 'orange';
  let valid = false;

  if (score >= 4) {
    label = 'Отличный';
    color = 'emerald';
    valid = true;
  } else if (score === 3) {
    label = 'Хороший';
    color = 'indigo';
    valid = true;
  } else if (score === 2) {
    label = 'Средний';
    color = 'amber';
    valid = true;
  } else {
    label = 'Слабый';
    color = 'red';
    valid = false;
  }

  return {
    score: Math.min(score, 4),
    label: label,
    color: color,
    valid: valid,
    reason: !valid ? 'Добавьте цифры или буквы разного регистра' : ''
  };
}

// Визуальное обновление полосок надёжности пароля
function updateStrengthMeterUI(containerId, barPrefix, labelId, pwd) {
  const container = document.getElementById(containerId);
  const label = document.getElementById(labelId);
  if (!container || !label) return;

  if (!pwd) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  const res = evaluatePasswordStrength(pwd);

  const colors = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    gray: 'bg-gray-200 dark:bg-gray-600'
  };

  const textColors = {
    red: 'text-red-500',
    orange: 'text-orange-500',
    amber: 'text-amber-500',
    indigo: 'text-indigo-500 dark:text-indigo-400',
    emerald: 'text-emerald-500',
    gray: 'text-gray-500'
  };

  for (let i = 1; i <= 4; i++) {
    const bar = document.getElementById(`${barPrefix}${i}`);
    if (bar) {
      bar.className = `flex-1 rounded-full h-1.5 transition-colors duration-300 ${
        i <= res.score ? (colors[res.color] || 'bg-gray-300') : 'bg-gray-200 dark:bg-gray-600'
      }`;
    }
  }

  label.textContent = `Надёжность: ${res.label}`;
  label.className = `font-bold ${textColors[res.color] || 'text-gray-500'}`;
}

// ─── ГЛОБАЛЬНЫЙ ЭКСПОРТ ДЛЯ ИНЛАЙН-ОБРАБОТЧИКОВ И ДРУГИХ МОДУЛЕЙ ───
window.escapeHtml = escapeHtml;
window.showSiteToast = showSiteToast;
window.showConfirmDialog = showConfirmDialog;
window.showSiteConfirm = showConfirmDialog;
window.FORBIDDEN_PASSWORDS = FORBIDDEN_PASSWORDS;
window.evaluatePasswordStrength = evaluatePasswordStrength;
window.updateStrengthMeterUI = updateStrengthMeterUI;
