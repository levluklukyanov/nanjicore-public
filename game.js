// ===============================================================================
// NANJICORE: GAME ENGINE & CORE LOGIC (Этап 6 модуляризации)
// Модуль рандомайзера, кликера, колеса фортуны, кастомных паков и интерфейса
// ===============================================================================

// === 2. РАНДОМ И ДВИЖОК КОЛЕСА ===
    const lastPicks = { tanjiro: -1, who: -1, members: -1, customName: -1, customRole: -1 };
    
    // ─── Алгоритмы Кастома: Метод исключения и Защита от повторов ───
    let customRemainingNames = [];
    let customRemainingRoles = [];
    let customRecentNamesHistory = [];
    let customRecentRolesHistory = [];

    function resetCustomExclusionPools() {
      const allNames = (typeof customData !== 'undefined' && Array.isArray(customData.names)) ? customData.names : [];
      const allRoles = (typeof customData !== 'undefined' && Array.isArray(customData.roles)) ? customData.roles : [];
      customRemainingNames = [...allNames];
      customRemainingRoles = [...allRoles];
      customRecentNamesHistory = [];
      customRecentRolesHistory = [];
    }

    function getAvailableCustomNames() {
      const allNames = (typeof customData !== 'undefined' && Array.isArray(customData.names)) ? customData.names : [];
      if (!allNames || allNames.length === 0) return [];
      const useExclusion = localStorage.getItem('custom_exclusion_names') === 'true';
      if (!useExclusion) {
        return [...allNames];
      }
      // Оставляем только те имена, которые всё ещё есть в customData.names
      customRemainingNames = (customRemainingNames || []).filter(n => allNames.includes(n));
      // Если все имена уже выпали за цикл — восстанавливаем полный пул для нового цикла
      if (customRemainingNames.length === 0) {
        customRemainingNames = [...allNames];
      }
      return [...customRemainingNames];
    }

    function getAvailableCustomRoles() {
      const allRoles = (typeof customData !== 'undefined' && Array.isArray(customData.roles)) ? customData.roles : [];
      if (!allRoles || allRoles.length === 0) return [];
      const useExclusion = localStorage.getItem('custom_exclusion_roles') === 'true';
      if (!useExclusion) {
        return [...allRoles];
      }
      // Оставляем только те роли, которые всё ещё есть в customData.roles
      customRemainingRoles = (customRemainingRoles || []).filter(r => allRoles.includes(r));
      // Если все роли уже выпали за цикл — восстанавливаем полный пул для нового цикла
      if (customRemainingRoles.length === 0) {
        customRemainingRoles = [...allRoles];
      }
      return [...customRemainingRoles];
    }

    function consumeCustomName(name) {
      const useExclusion = localStorage.getItem('custom_exclusion_names') === 'true';
      if (!useExclusion || !name) return;
      const idx = customRemainingNames.indexOf(name);
      if (idx !== -1) {
        customRemainingNames.splice(idx, 1);
      }
    }

    function consumeCustomRole(role) {
      const useExclusion = localStorage.getItem('custom_exclusion_roles') === 'true';
      if (!useExclusion || !role) return;
      const idx = customRemainingRoles.indexOf(role);
      if (idx !== -1) {
        customRemainingRoles.splice(idx, 1);
      }
    }

    function pickCustomNameIndex(items) {
      if (!items || items.length === 0) return 0;
      if (items.length === 1) return 0;

      const useExclusion = localStorage.getItem('custom_exclusion_names') === 'true';
      const usePity = localStorage.getItem('custom_pity_protection') === 'true';

      if (useExclusion) {
        return Math.floor(Math.random() * items.length);
      }

      if (usePity && items.length > 2) {
        const maxHistory = Math.min(5, items.length - 1);
        const allowedIndices = items.map((_, i) => i).filter(i => !customRecentNamesHistory.includes(i));
        const candidateIndices = allowedIndices.length > 0 ? allowedIndices : items.map((_, i) => i);
        const chosenIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
        customRecentNamesHistory.push(chosenIndex);
        if (customRecentNamesHistory.length > maxHistory) customRecentNamesHistory.shift();
        return chosenIndex;
      }

      return getUniqueRandomIndex(items, 'customName');
    }

    function pickCustomRoleIndex(items) {
      if (!items || items.length === 0) return 0;
      if (items.length === 1) return 0;

      const useExclusion = localStorage.getItem('custom_exclusion_roles') === 'true';
      const usePity = localStorage.getItem('custom_pity_protection') === 'true';

      if (useExclusion) {
        return Math.floor(Math.random() * items.length);
      }

      if (usePity && items.length > 2) {
        const maxHistory = Math.min(5, items.length - 1);
        const allowedIndices = items.map((_, i) => i).filter(i => !customRecentRolesHistory.includes(i));
        const candidateIndices = allowedIndices.length > 0 ? allowedIndices : items.map((_, i) => i);
        const chosenIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
        customRecentRolesHistory.push(chosenIndex);
        if (customRecentRolesHistory.length > maxHistory) customRecentRolesHistory.shift();
        return chosenIndex;
      }

      return getUniqueRandomIndex(items, 'customRole');
    }

    function getCustomNameIndex() {
      const allNames = (typeof customData !== 'undefined' && Array.isArray(customData.names)) ? customData.names : [];
      if (!allNames.length) return 0;
      const avail = getAvailableCustomNames();
      const targetIdx = pickCustomNameIndex(avail);
      const picked = avail[targetIdx];
      const origIdx = allNames.indexOf(picked);
      return origIdx >= 0 ? origIdx : 0;
    }

    function getCustomRoleIndex() {
      const allRoles = (typeof customData !== 'undefined' && Array.isArray(customData.roles)) ? customData.roles : [];
      if (!allRoles.length) return 0;
      const avail = getAvailableCustomRoles();
      const targetIdx = pickCustomRoleIndex(avail);
      const picked = avail[targetIdx];
      const origIdx = allRoles.indexOf(picked);
      return origIdx >= 0 ? origIdx : 0;
    }

    function updateResetPacksButtonVisibility() {
      const resetBtn = document.getElementById('resetAllPacksBtn');
      if (!resetBtn) return;
      const hasActive = userPacks.some(p => p.active);
      if (hasActive) {
        resetBtn.classList.remove('hidden');
        resetBtn.classList.add('flex');
      } else {
        resetBtn.classList.add('hidden');
        resetBtn.classList.remove('flex');
      }
    }

    function getUniqueRandomIndex(arr, key) {
      if (!arr || arr.length <= 1) return 0;
      let newIndex;
      do { newIndex = Math.floor(Math.random() * arr.length); } while (newIndex === lastPicks[key]);
      lastPicks[key] = newIndex;
      return newIndex;
    }

    const wheelColors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#06b6d4'];

    function showWheelComboBadge(canvas, count) {
      if (count < 2) return;

      const comboDisplay = document.getElementById('globalWheelComboDisplay');
      const comboText = document.getElementById('globalWheelComboText');
      if (comboDisplay && comboText) {
        comboText.textContent = `x${count}`;
        comboDisplay.classList.remove('hidden', 'opacity-0');
        comboDisplay.classList.add('opacity-100');

        // Быстрый импульс масштаба при каждом новом клике
        comboText.style.animation = 'none';
        void comboText.offsetHeight;
        comboText.style.animation = 'rainbowFlowFast 0.6s linear infinite';
      }

      // Если колесо внутри модального окна (Кто есть кто / Участники), показываем радужный бейдж слева в модалке
      if (canvas) {
        const modal = canvas.closest('#modalContentWho, #modalMembersContent');
        if (modal) {
          let modalBadge = modal.querySelector('.modal-rainbow-combo');
          if (!modalBadge) {
            modalBadge = document.createElement('div');
            modalBadge.className = 'modal-rainbow-combo rainbow-combo-container absolute left-4 bottom-8 z-50 pointer-events-none select-none transition-all duration-150';
            modalBadge.innerHTML = `<div class="rainbow-combo-text text-4xl sm:text-5xl font-black italic tracking-tighter">x${count}</div>`;
            modal.appendChild(modalBadge);
          } else {
            modalBadge.innerHTML = `<div class="rainbow-combo-text text-4xl sm:text-5xl font-black italic tracking-tighter">x${count}</div>`;
            modalBadge.classList.remove('hidden', 'opacity-0');
          }
        }
      }

      soundManager.playClick();
    }

    function hideWheelComboBadge(canvas) {
      const comboDisplay = document.getElementById('globalWheelComboDisplay');
      if (comboDisplay) {
        comboDisplay.classList.add('opacity-0');
        setTimeout(() => comboDisplay.classList.add('hidden'), 250);
      }

      document.querySelectorAll('.modal-rainbow-combo').forEach(b => {
        b.classList.add('opacity-0');
        setTimeout(() => b.remove(), 250);
      });
    }

    class FortuneWheel {
      constructor(canvasId) {
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);
        // FIX #5: null-check — без этого вся страница падает при опечатке в id
        if (!this.canvas) {
          console.warn(`[FortuneWheel] Canvas #${canvasId} not found`);
          this.ctx = null;
          this.items = [];
          this.currentAngle = 0;
          this.isSpinning = false;
          this.isInfinite = false;
          this.spinCombo = 0;
          this.infiniteRaf = null;
          return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.items = [];
        this.currentAngle = 0;
        this.isSpinning = false;
        this.isInfinite = false;
        this.spinCombo = 0;
        this.infiniteRaf = null;
      }
      setItems(items) {
        if (!this.canvas) return;
        this.items = items && items.length > 0 ? items : ['Пусто'];
        this.draw();
      }
      draw() {
        if (!this.canvas || !this.ctx) return;
        const { width, height } = this.canvas;
        const ctx = this.ctx;
        const scale = width / 280;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - (8 * scale);
        const total = this.items.length;
        const arc = (2 * Math.PI) / total;
        ctx.clearRect(0, 0, width, height);

        this.items.forEach((text, i) => {
          const angle = this.currentAngle + i * arc;
          ctx.beginPath();
          ctx.fillStyle = wheelColors[i % wheelColors.length];
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, angle, angle + arc);
          ctx.lineTo(centerX, centerY);
          ctx.fill();
          
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1.5 * scale;
          ctx.stroke();

          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 4 * scale;
          const baseFontSize = total > 20 ? 9 : total > 10 ? 11 : 13;
          const fontSize = Math.round(baseFontSize * scale);
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.translate(centerX, centerY);
          ctx.rotate(angle + arc / 2);
          ctx.textAlign = 'right';
          const maxLen = total > 16 ? 10 : 16;
          const displayStr = text.length > maxLen ? text.slice(0, maxLen - 2) + '..' : text;
          ctx.fillText(displayStr, radius - (14 * scale), 4 * scale);
          ctx.restore();
        });

        // ─── Внешний металлический обод (Rim) ───
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 3.5 * scale;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - (2 * scale), 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();
        ctx.restore();

        // ─── Центральная многослойная втулка (Hub) ───
        ctx.save();
        // 1. Внешнее стальное кольцо с глубокой тенью
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20 * scale, 0, 2 * Math.PI);
        ctx.fillStyle = '#1e1b4b';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 8 * scale;
        ctx.shadowOffsetY = 2 * scale;
        ctx.fill();

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        // 2. Внутренний полированный металлический диск
        const hubGrad = ctx.createRadialGradient(
          centerX - (3 * scale), centerY - (3 * scale), 1 * scale,
          centerX, centerY, 13 * scale
        );
        hubGrad.addColorStop(0, '#ffffff');
        hubGrad.addColorStop(0.3, '#f1f5f9');
        hubGrad.addColorStop(0.7, '#cbd5e1');
        hubGrad.addColorStop(1, '#94a3b8');

        ctx.beginPath();
        ctx.arc(centerX, centerY, 13 * scale, 0, 2 * Math.PI);
        ctx.fillStyle = hubGrad;
        ctx.shadowColor = 'transparent';
        ctx.fill();

        // 3. Центральная рубиновая сердцевина
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5 * scale, 0, 2 * Math.PI);
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = 'rgba(244, 63, 94, 0.7)';
        ctx.shadowBlur = 5 * scale;
        ctx.fill();
        ctx.restore();
      }
      startInfinite() {
        this.isSpinning = true;
        this.isInfinite = true;
        achState.wheelSpins = (achState.wheelSpins || 0) + 1;
        saveAchState();
        if (achState.wheelSpins >= 100) unlockAchievement('ludoman');

        const total = this.items.length;
        const arc = (2 * Math.PI) / total;
        let lastTickAngle = this.currentAngle;

        const loop = () => {
          if (!this.isInfinite) return;
          this.currentAngle = (this.currentAngle + 0.18) % (2 * Math.PI);
          if (Math.abs(this.currentAngle - lastTickAngle) >= arc) {
            soundManager.playTick();
            lastTickAngle = this.currentAngle;
          }
          this.draw();
          this.infiniteRaf = requestAnimationFrame(loop);
        };
        this.infiniteRaf = requestAnimationFrame(loop);
      }
      stopInfinite(targetIndex, onFinish) {
        this.isInfinite = false;
        if (this.infiniteRaf) cancelAnimationFrame(this.infiniteRaf);

        const total = this.items.length;
        if (targetIndex === undefined || targetIndex === null || targetIndex < 0 || targetIndex >= total) {
          targetIndex = Math.floor(Math.random() * total);
        }
        const arc = (2 * Math.PI) / total;
        const targetSliceAngle = (3 * Math.PI / 2) - (targetIndex * arc + arc / 2);
        const extraRounds = 3 * 2 * Math.PI;
        const startAngle = this.currentAngle;
        const finalAngle = startAngle + extraRounds + ((targetSliceAngle - (startAngle % (2 * Math.PI)) + 4 * Math.PI) % (2 * Math.PI));

        const duration = 2200;
        const startTime = performance.now();

        const easeOutStop = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const prevAngle = this.currentAngle;
          this.currentAngle = startAngle + (finalAngle - startAngle) * easeOut;

          if (Math.floor(this.currentAngle / arc) !== Math.floor(prevAngle / arc)) {
            soundManager.playTick();
          }
          this.draw();

          if (progress < 1) {
            requestAnimationFrame(easeOutStop);
          } else {
            this.isSpinning = false;
            this.currentAngle = finalAngle;
            this.draw();
            if (onFinish) onFinish(this.items[targetIndex], targetIndex);
          }
        };
        requestAnimationFrame(easeOutStop);
      }
      spin(targetIndex, onFinish) {
        // Если колесо уже крутится:
        if (this.isSpinning) {
          // Если активен режим бесконечного спина — останавливаем колесо по клику
          if (this.isInfinite) {
            this.stopInfinite(targetIndex, onFinish);
            return;
          }

          // До получения ачивки клики во время вращения накапливают КОМБО
          if (!achState.unlocked?.perpetual) {
            this.spinCombo = (this.spinCombo || 1) + 1;
            showWheelComboBadge(this.canvas, this.spinCombo);
            if (this.spinCombo >= 7) {
              unlockAchievement('perpetual');
              this.spinCombo = 0;
              hideWheelComboBadge(this.canvas);
            }
          }
          return;
        }

        // Проверка режима бесконечного спина
        this.isSpinning = true;
        this.spinCombo = 1;

        achState.wheelSpins = (achState.wheelSpins || 0) + 1;
        saveAchState();
        if (achState.wheelSpins >= 100) unlockAchievement('ludoman');

        const isTurbo = achState.unlocked?.ludoman && achEffects.turbo;
        const total = this.items.length;
        const arc = (2 * Math.PI) / total;
        const targetSliceAngle = (3 * Math.PI / 2) - (targetIndex * arc + arc / 2);
        const extraRounds = isTurbo ? (2 * 2 * Math.PI) : ((5 + Math.floor(Math.random() * 3)) * 2 * Math.PI);
        const startAngle = this.currentAngle;
        const finalAngle = startAngle + extraRounds + ((targetSliceAngle - (startAngle % (2 * Math.PI)) + 4 * Math.PI) % (2 * Math.PI));

        const duration = isTurbo ? 400 : 3500;
        const startTime = performance.now();

        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = isTurbo ? (1 - Math.pow(1 - progress, 2)) : (1 - Math.pow(1 - progress, 3));
          const prevAngle = this.currentAngle;
          this.currentAngle = startAngle + (finalAngle - startAngle) * easeOut;
          
          if (Math.floor(this.currentAngle / arc) !== Math.floor(prevAngle / arc)) {
            soundManager.playTick();
          }
          this.draw();

          if (progress < 1) {
            this.spinRaf = requestAnimationFrame(animate);
          } else {
            this.isSpinning = false;
            this.spinRaf = null;
            this.spinCombo = 0;
            hideWheelComboBadge(this.canvas);
            this.currentAngle = finalAngle;
            this.draw();
            if (onFinish) onFinish(this.items[targetIndex], targetIndex);
          }
        };
        this.spinRaf = requestAnimationFrame(animate);
      }
      cancelSpin() {
        this.isSpinning = false;
        this.isInfinite = false;
        this.spinCombo = 0;
        if (this.infiniteRaf) {
          cancelAnimationFrame(this.infiniteRaf);
          this.infiniteRaf = null;
        }
        if (this.spinRaf) {
          cancelAnimationFrame(this.spinRaf);
          this.spinRaf = null;
        }
        if (typeof hideWheelComboBadge === 'function') hideWheelComboBadge(this.canvas);
        this.draw();
      }
    }

    // === 3. ШРИФТЫ (ДИЗАЙНЕР ОТ БОГА) ===
    const fontDropdownBtn = document.getElementById('customFontDropdownBtn');
    const fontList = document.getElementById('customFontList');
    const selectedFontLabel = document.getElementById('selectedFontLabel');
    const dropdownArrow = document.getElementById('dropdownArrow');
    const siteBody = document.getElementById('siteBody');

    const fontOptions = [
      { id: 'font-default', name: 'System Default', style: 'font-family: system-ui, sans-serif;' },
      { id: 'font-monocraft', name: 'Monocraft', style: 'font-family: \'Monocraft\', monospace;' },
      { id: 'font-unbounded', name: 'Unbounded', style: 'font-family: \'Unbounded\', sans-serif;' },
      { id: 'font-orbitron', name: 'Orbitron', style: 'font-family: \'Orbitron\', sans-serif;' },
      { id: 'font-russo', name: 'Russo One', style: 'font-family: \'Russo One\', sans-serif;' },
      { id: 'font-vt323', name: 'VT323 Terminal', style: 'font-family: \'VT323\', monospace;' },
      { id: 'font-press-start', name: 'Press Start 2P', style: 'font-family: \'Press Start 2P\', monospace;' },
      { id: 'font-jetbrains', name: 'JetBrains Mono', style: 'font-family: \'JetBrains Mono\', monospace;' },
      { id: 'font-manrope', name: 'Manrope', style: 'font-family: \'Manrope\', sans-serif;' },
      { id: 'font-comfortaa', name: 'Comfortaa', style: 'font-family: \'Comfortaa\', cursive;' },
      { id: 'font-caveat', name: 'Caveat', style: 'font-family: \'Caveat\', cursive;' },
      { id: 'font-neucha', name: 'Neucha', style: 'font-family: \'Neucha\', cursive;' }
    ];

    fontOptions.forEach(font => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'w-full text-left px-3 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-between text-sm dark:text-gray-200';
      item.innerHTML = `<span style="${font.style}">${font.name}</span>`;
      item.addEventListener('click', () => {
        applySiteFont(font.id);
        toggleFontDropdown(false);
        if (!achState.testedFonts.includes(font.id)) {
          achState.testedFonts.push(font.id);
          saveAchState();
        }
        const customTestedCount = achState.testedFonts.filter(id => id !== 'font-default').length;
        if (customTestedCount >= 11) {
          unlockAchievement('designer');
        }
      });
      fontList.appendChild(item);
    });

    function toggleFontDropdown(forceState) {
      const isHidden = fontList.classList.contains('hidden');
      const open = forceState !== undefined ? forceState : isHidden;
      fontList.classList.toggle('hidden', !open);
      dropdownArrow.classList.toggle('rotate-180', open);
    }
    fontDropdownBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFontDropdown(); });
    document.addEventListener('click', (e) => {
      if (!fontDropdownBtn.contains(e.target) && !fontList.contains(e.target)) toggleFontDropdown(false);
    });

    function applySiteFont(fontClass) {
      fontOptions.forEach(f => siteBody.classList.remove(f.id));
      siteBody.classList.add(fontClass);
      localStorage.setItem('siteSelectedFont', fontClass);
      const activeFont = fontOptions.find(f => f.id === fontClass) || fontOptions[0];
      selectedFontLabel.textContent = activeFont.name;
      selectedFontLabel.style = activeFont.style;
    }

    // === 4. ПАКИ ===
    const defaultPacks = [
      { id: 'pack_default_1', title: 'Участники и друзья', type: 'names', names: ['Эбардо', 'Танджиро', 'Алекс', 'Матвей', 'Костя', 'Винзли'], roles: [], active: true },
      { id: 'pack_default_2', title: 'Геймерские роли', type: 'roles', names: [], roles: ['Главный кодер', 'Повелитель багов', 'Спит в войсе', 'Тащит катку', 'АФК игрок', 'Легенда сервера'], active: true },
      { id: 'pack_default_3', title: 'Мемная пати (Комбо)', type: 'both', names: ['Саня', 'Игорь', 'Дед', 'Лерка'], roles: ['Танцует брейк', 'Поёт опенинги', 'Донатит миллионы', 'Забыл микрофон'], active: false }
    ];

    let userPacks = safeJsonParse('custom_saved_packs', defaultPacks);
    let editingPackId = null;
    let packToDeleteId = null;

    function savePacksToStorage() {
      localStorage.setItem('custom_saved_packs', JSON.stringify(userPacks));
      if (typeof saveCurrentUserData === 'function') saveCurrentUserData();
    }

    const modalPacks = document.getElementById('modalPacks');
    const modalPacksContent = document.getElementById('modalPacksContent');
    const quickOpenPacksBtn = document.getElementById('quickOpenPacksBtn');
    const reOpenPacksBtn = document.getElementById('reOpenPacksBtn');
    const reOpenPacksBtn2 = document.getElementById('reOpenPacksBtn2');
    const closePacksModalX = document.getElementById('closePacksModalX');
    const packsContainer = document.getElementById('packsContainer');

    const toggleCreatePackBtn = document.getElementById('toggleCreatePackBtn');
    const newPackForm = document.getElementById('newPackForm');
    const newPackType = document.getElementById('newPackType');
    const newPackNamesBox = document.getElementById('newPackNamesBox');
    const newPackRolesBox = document.getElementById('newPackRolesBox');
    const saveNewPackBtn = document.getElementById('saveNewPackBtn');

    const modalConfirmDelete = document.getElementById('modalConfirmDelete');
    const modalConfirmDeleteContent = document.getElementById('modalConfirmDeleteContent');
    const confirmDeletePackName = document.getElementById('confirmDeletePackName');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    function openDeleteConfirm(pack) {
      packToDeleteId = pack.id;
      confirmDeletePackName.textContent = `"${pack.title}"`;
      modalConfirmDelete.classList.remove('hidden', 'animate-modal-backdrop-out');
      modalConfirmDelete.classList.add('animate-modal-backdrop-in');
      modalConfirmDeleteContent.classList.remove('animate-fade-out-scale', 'opacity-0', 'invisible');
      modalConfirmDeleteContent.classList.add('animate-fade-in-scale');
    }
    function closeDeleteConfirm() {
      modalConfirmDelete.classList.remove('animate-modal-backdrop-in');
      modalConfirmDelete.classList.add('animate-modal-backdrop-out');
      modalConfirmDeleteContent.classList.remove('animate-fade-in-scale');
      modalConfirmDeleteContent.classList.add('animate-fade-out-scale');
      setTimeout(() => { 
        modalConfirmDelete.classList.add('hidden'); 
        modalConfirmDelete.classList.remove('animate-modal-backdrop-out');
        modalConfirmDeleteContent.classList.remove('animate-fade-out-scale');
        modalConfirmDeleteContent.classList.add('opacity-0', 'invisible');
        packToDeleteId = null; 
      }, 180);
    }
    cancelDeleteBtn.addEventListener('click', closeDeleteConfirm);
    confirmDeleteBtn.addEventListener('click', () => {
      if (packToDeleteId) {
        userPacks = userPacks.filter(p => p.id !== packToDeleteId);
        if (editingPackId === packToDeleteId) resetPackForm();
        savePacksToStorage();
        renderPacksList();
      }
      closeDeleteConfirm();
    });

    function syncPackFormVisibility() {
      const val = newPackType.value;
      newPackNamesBox.classList.toggle('hidden', val === 'roles');
      newPackRolesBox.classList.toggle('hidden', val === 'names');
    }
    newPackType.addEventListener('change', syncPackFormVisibility);

    function resetPackForm() {
      editingPackId = null;
      document.getElementById('newPackTitle').value = '';
      document.getElementById('newPackNames').value = '';
      document.getElementById('newPackRoles').value = '';
      newPackType.value = 'both';
      syncPackFormVisibility();
      newPackForm.classList.add('hidden');
      document.getElementById('createPackBtnText').textContent = (typeof window.t === 'function' ? window.t('custom_btn_create_pack') : 'Создать новый пак');
      document.getElementById('createPackBtnIcon').innerHTML = '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>';
      saveNewPackBtn.textContent = (typeof window.t === 'function' ? window.t('custom_btn_save_pack') : 'Сохранить пак');
    }

    toggleCreatePackBtn.addEventListener('click', () => {
      const isHidden = newPackForm.classList.contains('hidden');
      if (isHidden) {
        resetPackForm();
        newPackForm.classList.remove('hidden');
        document.getElementById('createPackBtnText').textContent = (typeof window.t === 'function' ? window.t('custom_btn_hide_form') : 'Скрыть форму');
        document.getElementById('createPackBtnIcon').innerHTML = '<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>';
      } else {
        resetPackForm();
      }
    });

    saveNewPackBtn.addEventListener('click', () => {
      if (!editingPackId && !achState.unlocked?.fanatic && userPacks.length >= 5) {
        showSiteToast('Достигнут лимит (максимум 5 паков)! Разблокируйте достижение «Фанатик», чтобы создавать бесконечно.', 'warning', 'Лимит паков');
        return;
      }
      const title = document.getElementById('newPackTitle').value.trim();
      const type = newPackType.value;
      const names = document.getElementById('newPackNames').value.split(',').map(n => n.trim()).filter(n => n);
      const roles = document.getElementById('newPackRoles').value.split(',').map(r => r.trim()).filter(r => r);

      if (!title || (type === 'names' && !names.length) || (type === 'roles' && !roles.length) || (type === 'both' && (!names.length || !roles.length))) {
        showSiteToast('Заполните все обязательные поля пака!', 'warning', 'Создание пака');
        return;
      }

      if (editingPackId) {
        const target = userPacks.find(p => p.id === editingPackId);
        if (target) {
          target.title = title; target.type = type;
          target.names = (type === 'roles') ? [] : names;
          target.roles = (type === 'names') ? [] : roles;
        }
      } else {
        userPacks.push({
          id: 'pack_' + Date.now(), title, type,
          names: (type === 'roles') ? [] : names,
          roles: (type === 'names') ? [] : roles,
          active: true
        });
      }
      savePacksToStorage();
      renderPacksList();
      resetPackForm();
    });

    function renderPacksList() {
      packsContainer.innerHTML = '';
      updateResetPacksButtonVisibility();
      if (!userPacks.length) {
        packsContainer.innerHTML = '<p class="text-center text-sm text-gray-500 py-6">' + (typeof window.t === 'function' ? window.t('custom_empty_packs') : 'Паков пока нет. Создайте первый!') + '</p>';
        return;
      }
      userPacks.forEach((pack) => {
        const card = document.createElement('div');
        card.className = `p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${pack.active ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-gray-50 dark:bg-gray-700/40 border-gray-200 dark:border-gray-700 opacity-70'}`;
        card.innerHTML = `
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <input type="checkbox" ${pack.active ? 'checked' : ''} class="pack-checkbox w-5 h-5 accent-emerald-600 rounded cursor-pointer" />
            <div class="min-w-0">
              <span class="font-bold text-sm dark:text-white truncate block">${escapeHtml(pack.title)}</span>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${(pack.names && Array.isArray(pack.names)) ? pack.names.length : 0} имён, ${(pack.roles && Array.isArray(pack.roles)) ? pack.roles.length : 0} ролей</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button class="edit-pack-btn text-gray-400 hover:text-emerald-500 p-1.5 transition" title="Редактировать">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
            </button>
            <button class="delete-pack-btn text-gray-400 hover:text-red-500 p-1.5 transition" title="Удалить">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        `;
        card.querySelector('.pack-checkbox').addEventListener('change', (e) => {
          pack.active = e.target.checked; savePacksToStorage(); renderPacksList();
        });
        card.querySelector('.edit-pack-btn').addEventListener('click', () => {
          editingPackId = pack.id;
          document.getElementById('newPackTitle').value = pack.title;
          newPackType.value = pack.type;
          document.getElementById('newPackNames').value = pack.names.join(', ');
          document.getElementById('newPackRoles').value = pack.roles.join(', ');
          syncPackFormVisibility();
          newPackForm.classList.remove('hidden');
          document.getElementById('createPackBtnText').textContent = (typeof window.t === 'function' ? window.t('custom_btn_editing_pack', { title: pack.title }) : 'Редактирование: ' + pack.title);
          saveNewPackBtn.textContent = (typeof window.t === 'function' ? window.t('custom_btn_save_changes') : 'Сохранить изменения');
        });
        card.querySelector('.delete-pack-btn').addEventListener('click', () => openDeleteConfirm(pack));
        packsContainer.appendChild(card);
      });
    }

    function openPacksModal() {
      resetPackForm(); renderPacksList(); 
      modalPacks.classList.remove('hidden', 'animate-modal-backdrop-out');
      modalPacks.classList.add('animate-modal-backdrop-in');
      modalPacksContent.classList.remove('animate-fade-out-scale', 'opacity-0', 'invisible');
      modalPacksContent.classList.add('animate-fade-in-scale');
    }
    function closePacksModal() {
      modalPacks.classList.remove('animate-modal-backdrop-in');
      modalPacks.classList.add('animate-modal-backdrop-out');
      modalPacksContent.classList.remove('animate-fade-in-scale');
      modalPacksContent.classList.add('animate-fade-out-scale');
      setTimeout(() => {
        modalPacks.classList.add('hidden');
        modalPacks.classList.remove('animate-modal-backdrop-out');
        modalPacksContent.classList.remove('animate-fade-out-scale');
        modalPacksContent.classList.add('opacity-0', 'invisible');
      }, 180);
    }
    if (quickOpenPacksBtn) quickOpenPacksBtn.addEventListener('click', openPacksModal);
    if (reOpenPacksBtn) reOpenPacksBtn.addEventListener('click', openPacksModal);
    if (reOpenPacksBtn2) reOpenPacksBtn2.addEventListener('click', openPacksModal);
    closePacksModalX.addEventListener('click', closePacksModal);
    modalPacks.addEventListener('click', (e) => { if (e.target === modalPacks) closePacksModal(); });

    document.getElementById('applyPacksBtn').addEventListener('click', () => {
      const activePacks = userPacks.filter(p => p.active);
      savePacksToStorage();
      resetCustomExclusionPools();

      if (!activePacks.length) {
        // 0 паков выбрано - отключаем паки
        initCustomDataFromActivePacks();
        updateResetPacksButtonVisibility();
        closePacksModal();
        return;
      }

      let combinedNames = []; let combinedRoles = []; let packTitles = [];
      activePacks.forEach(p => {
        packTitles.push(p.title);
        if (p.type === 'names' || p.type === 'both') combinedNames.push(...p.names);
        if (p.type === 'roles' || p.type === 'both') combinedRoles.push(...p.roles);
      });

      combinedNames = [...new Set(combinedNames)];
      combinedRoles = [...new Set(combinedRoles)];

      if (!combinedNames.length || !combinedRoles.length) {
        showSiteToast('В выбранных паках должны присутствовать и имена, и роли/действия!', 'warning', 'Неполный набор'); return;
      }

      if (activePacks.length >= 3) unlockAchievement('chef');

      customData = {
        title: packTitles.length === 1 ? packTitles[0] : 'Комбинация: ' + packTitles.join(' + '),
        desc: `Выбрано паков: ${activePacks.length} (${combinedNames.length} имён, ${combinedRoles.length} ролей)`,
        names: combinedNames, roles: combinedRoles,
        isFromPacks: true
      };

      customTitleDisplay.textContent = customData.title;
      customDescDisplay.textContent = customData.desc;
      customDefaultView.classList.add('hidden');
      customActiveView.classList.remove('hidden');
      customActiveView.classList.add('flex');
      updateTabModeUI('custom', tabModes.custom);
      if (tabModes.custom === 'wheel') resetCustomWheelFlow();
      updateResetPacksButtonVisibility();
      closePacksModal();
    });

    // === 5. РЕЖИМЫ И ВКЛАДКИ ===
    const tabModes = {
      tanjiro: localStorage.getItem('mode_tanjiro') || 'wheel',
      jenna: localStorage.getItem('mode_jenna') || 'button',
      custom: localStorage.getItem('mode_custom') || 'wheel'
    };

    
    function updateAdaptiveCardHeight(specificTab, specificMode) {
      const card = document.getElementById('mainContentCard');
      if (!card) return;

      if (card.classList.contains('fullscreen-card')) {
        card.style.removeProperty('height');
        card.style.removeProperty('min-height');
        card.style.removeProperty('max-height');
        return;
      }

      const activeTab = specificTab || (typeof tabs !== 'undefined' && tabs[currentTabIndex]) || 'tanjiro';
      const isMobile = window.innerWidth < 640;

      // ДЛЯ ДЖЕННЫ: ВСЕГДА ПОЛНОЦЕННЫЙ ПРОСТОРНЫЙ МАСШТАБ КАК НА РЕЖИМЕ КОЛЕСО!
      // Размер окна НЕ сжимается и не изменяется от кнопок режима, чтобы обе карточки мини-игр
      // («Кто есть кто?» и «Участники Дженны») гарантированно помещались целиком на телефоне и не перекрывались
      if (activeTab === 'jenna') {
        card.classList.remove('card-mode-button');
        card.classList.add('card-mode-wheel', 'card-mode-jenna');
        if (isMobile) {
          card.style.setProperty('height', '84vh', 'important');
          card.style.setProperty('min-height', '620px', 'important');
          card.style.setProperty('max-height', '850px', 'important');
        } else {
          card.style.setProperty('height', '760px', 'important');
          card.style.setProperty('min-height', '640px', 'important');
          card.style.setProperty('max-height', '800px', 'important');
        }
        return;
      } else {
        card.classList.remove('card-mode-jenna');
      }

      const mode = specificMode || (typeof tabModes !== 'undefined' && tabModes[activeTab]) || localStorage.getItem('mode_' + activeTab) || (activeTab === 'jenna' ? 'button' : 'wheel');

      if (isMobile) {
        if (activeTab === 'custom') {
          // ДЛЯ КАСТОМА НА ТЕЛЕФОНЕ: комфортный увеличенный масштаб
          if (mode === 'button') {
            card.classList.remove('card-mode-wheel');
            card.classList.add('card-mode-button');
            card.style.setProperty('height', '420px', 'important');
            card.style.setProperty('min-height', '400px', 'important');
            card.style.setProperty('max-height', '480px', 'important');
          } else {
            card.classList.remove('card-mode-button');
            card.classList.add('card-mode-wheel');
            card.style.setProperty('height', '86vh', 'important');
            card.style.setProperty('min-height', '640px', 'important');
            card.style.setProperty('max-height', '860px', 'important');
          }
        } else {
          if (mode === 'button') {
            card.classList.remove('card-mode-wheel');
            card.classList.add('card-mode-button');
            card.style.setProperty('height', '380px', 'important');
            card.style.setProperty('min-height', '360px', 'important');
            card.style.setProperty('max-height', '440px', 'important');
          } else {
            card.classList.remove('card-mode-button');
            card.classList.add('card-mode-wheel');
            card.style.setProperty('height', '82vh', 'important');
            card.style.setProperty('min-height', '600px', 'important');
            card.style.setProperty('max-height', '820px', 'important');
          }
        }
      } else {
        // На ПК (десктоп >= 640px) ВСЕГДА стандартный фиксированный масштаб (760px)
        card.classList.remove('card-mode-button');
        card.classList.add('card-mode-wheel');
        card.style.setProperty('height', '760px', 'important');
        card.style.setProperty('min-height', '640px', 'important');
        card.style.setProperty('max-height', '800px', 'important');
      }
    }

    function updateTabModeUI(tab, mode) {
      tabModes[tab] = mode;
      localStorage.setItem('mode_' + tab, mode);

      if (tab === 'tanjiro') {
        const isWheel = mode === 'wheel';
        document.getElementById('tanjiroModeBtn').className = `mode-toggle px-3 py-1 rounded-full ${!isWheel ? 'bg-white text-gray-900 shadow' : 'text-white/80'} transition-all`;
        document.getElementById('tanjiroModeWheel').className = `mode-toggle px-3 py-1 rounded-full ${isWheel ? 'bg-white text-gray-900 shadow' : 'text-white/80'} transition-all`;
        document.getElementById('tanjiroBtnView').classList.toggle('hidden', isWheel);
        document.getElementById('tanjiroWheelView').classList.toggle('hidden', !isWheel);
        document.getElementById('tanjiroWheelView').classList.toggle('flex', isWheel);
        if (isWheel) tanjiroWheel.draw();
      } else if (tab === 'jenna') {
        const isWheel = mode === 'wheel';
        document.getElementById('jennaModeBtn').className = `mode-toggle px-3 py-1 rounded-full ${!isWheel ? 'bg-white text-gray-900 shadow' : 'text-white/80'} transition-all`;
        document.getElementById('jennaModeWheel').className = `mode-toggle px-3 py-1 rounded-full ${isWheel ? 'bg-white text-gray-900 shadow' : 'text-white/80'} transition-all`;
        document.getElementById('whoWheelBox').classList.toggle('hidden', !isWheel);
        document.getElementById('whoWheelBox').classList.toggle('flex', isWheel);
        document.getElementById('membersWheelBox').classList.toggle('hidden', !isWheel);
        document.getElementById('membersWheelBox').classList.toggle('flex', isWheel);
        const whoInd = document.getElementById('whoModeIndicator');
        const memInd = document.getElementById('membersModeIndicator');
        const modeText = isWheel
          ? (typeof window.t === 'function' ? window.t('mode_wheel', 'Колесо') : 'Колесо')
          : (typeof window.t === 'function' ? window.t('mode_button', 'Кнопка') : 'Кнопка');
        const prefixText = (typeof window.t === 'function' ? window.t('jenna_mode_prefix', 'Режим: ') : 'Режим: ');
        if (whoInd) whoInd.textContent = prefixText + modeText;
        if (memInd) memInd.textContent = prefixText + modeText;
        if (isWheel) { whoWheel.draw(); membersWheel.draw(); }
      } else if (tab === 'custom') {
        const isWheel = mode === 'wheel';
        document.getElementById('customModeBtn').className = `mode-toggle px-3 py-1 rounded-full ${!isWheel ? 'bg-white dark:bg-gray-100 text-gray-900 shadow' : 'text-gray-700 dark:text-white/80'} transition-all`;
        document.getElementById('customModeWheel').className = `mode-toggle px-3 py-1 rounded-full ${isWheel ? 'bg-white dark:bg-gray-100 text-gray-900 shadow' : 'text-gray-700 dark:text-white/80'} transition-all`;
        document.getElementById('customBtnControls').classList.toggle('hidden', isWheel);
        document.getElementById('customBtnControls').classList.toggle('flex', !isWheel);
        document.getElementById('customWheelControls').classList.toggle('hidden', !isWheel);
        document.getElementById('customWheelControls').classList.toggle('flex', isWheel);
        if (isWheel) resetCustomWheelFlow();
      }

      if (typeof applyAllActiveEffects === 'function') applyAllActiveEffects();
      // Во вкладке Дженны переключение режима мини-игр не меняет размер карточки
      if (tab !== 'jenna') {
        updateAdaptiveCardHeight(tab, mode);
      }
    }

    document.getElementById('tanjiroModeBtn').addEventListener('click', () => updateTabModeUI('tanjiro', 'button'));
    document.getElementById('tanjiroModeWheel').addEventListener('click', () => updateTabModeUI('tanjiro', 'wheel'));
    document.getElementById('jennaModeBtn').addEventListener('click', () => updateTabModeUI('jenna', 'button'));
    document.getElementById('jennaModeWheel').addEventListener('click', () => updateTabModeUI('jenna', 'wheel'));
    document.getElementById('customModeBtn').addEventListener('click', () => updateTabModeUI('custom', 'button'));
    document.getElementById('customModeWheel').addEventListener('click', () => updateTabModeUI('custom', 'wheel'));

    const tabs = ['tanjiro', 'jenna', 'custom'];
    let currentTabIndex = 0;
    let isAnimating = false;

    const tabElements = {
      tanjiro: { btn: document.getElementById('tab-tanjiro'), content: document.getElementById('content-tanjiro') },
      jenna: { btn: document.getElementById('tab-jenna'), content: document.getElementById('content-jenna') },
      custom: { btn: document.getElementById('tab-custom'), content: document.getElementById('content-custom') }
    };

    function switchToTab(newTabName) {
      const newIndex = tabs.indexOf(newTabName);
      if (newIndex === currentTabIndex || isAnimating) return;
      isAnimating = true;

      if (typeof stopTanjiroAutoSpin === 'function') stopTanjiroAutoSpin();
      if (typeof stopCustomAutoSpin === 'function') stopCustomAutoSpin();
      if (typeof stopWhoAutoSpin === 'function') stopWhoAutoSpin();
      if (typeof stopMembersAutoSpin === 'function') stopMembersAutoSpin();
      if (typeof tanjiroWheel !== 'undefined' && tanjiroWheel && tanjiroWheel.isSpinning) tanjiroWheel.cancelSpin();
      if (typeof customWheel !== 'undefined' && customWheel && customWheel.isSpinning) customWheel.cancelSpin();
      if (typeof whoWheel !== 'undefined' && whoWheel && whoWheel.isSpinning) whoWheel.cancelSpin();
      if (typeof membersWheel !== 'undefined' && membersWheel && membersWheel.isSpinning) membersWheel.cancelSpin();

      const oldTabName = tabs[currentTabIndex];
      const outgoing = tabElements[oldTabName].content;
      const incoming = tabElements[newTabName].content;

      const isMovingRight = newIndex > currentTabIndex;
      const outClass = isMovingRight ? 'animate-slide-out-left' : 'animate-slide-out-right';
      const inClass = isMovingRight ? 'animate-slide-in-right' : 'animate-slide-in-left';

      tabs.forEach(tab => {
        const btn = tabElements[tab].btn;
        btn.classList.remove('bg-indigo-600', 'bg-emerald-600', 'bg-emerald-500', 'text-white', 'shadow-md', 'shadow-indigo-500/30', 'shadow-emerald-500/30', 'opacity-100');
        btn.classList.add('text-gray-600', 'dark:text-gray-300', 'opacity-85');
      });

      const activeBtn = tabElements[newTabName].btn;
      activeBtn.classList.remove('text-gray-600', 'dark:text-gray-300', 'opacity-85');
      const activeColor = newTabName === 'jenna' ? 'bg-emerald-600' : 'bg-indigo-600';
      const shadowColor = newTabName === 'jenna' ? 'shadow-emerald-500/30' : 'shadow-indigo-500/30';
      activeBtn.classList.add(activeColor, shadowColor, 'text-white', 'shadow-md', 'opacity-100');

      const mainCard = document.getElementById('mainContentCard');
      if (mainCard) {
        if (newTabName === 'jenna') {
          mainCard.classList.remove('card-mode-button');
          mainCard.classList.add('card-mode-wheel', 'card-mode-jenna');
        } else {
          mainCard.classList.remove('card-mode-jenna');
        }
      }

      incoming.classList.remove('hidden');
      outgoing.classList.add(outClass);
      incoming.classList.add(inClass);

      setTimeout(() => {
        outgoing.classList.add('hidden');
        outgoing.classList.remove(outClass);
        incoming.classList.remove(inClass);
        currentTabIndex = newIndex;
        isAnimating = false;
        updateAdaptiveCardHeight(newTabName);
      }, 400);
      updateAdaptiveCardHeight(newTabName);
    }

    tabElements.tanjiro.btn.addEventListener('click', () => switchToTab('tanjiro'));
    tabElements.jenna.btn.addEventListener('click', () => switchToTab('jenna'));
    tabElements.custom.btn.addEventListener('click', () => switchToTab('custom'));

    // === 6. ЛОГИКА ТАНДЖИРО ===
    const revealBtn = document.getElementById('revealBtn');
    const resultDiv = document.getElementById('result');
    const clickCounter = document.getElementById('clickCounter');
    let clickCounterDigits = document.getElementById('clickCounterDigits');
    let answers = (typeof window.i18n !== 'undefined' && window.i18n.getAnswers) 
      ? window.i18n.getAnswers() 
      : ["Натурал на 100%!", "Не по девочкам...", "Универсал!", "Тайный матвейка!", "Лесбиянка!"];
    let clickCount = (typeof achState !== 'undefined' && typeof achState.tanjiroClicks === 'number') ? achState.tanjiroClicks : 0;
    const tanjiroWheel = new FortuneWheel('tanjiroCanvas');
    tanjiroWheel.setItems(answers);

    // Механический роликовый счётчик одометра (цифра уходит вниз, новая приходит сверху, без рамок и фона)
    function createOdometerDigitBox(char) {
      const box = document.createElement('span');
      box.className = 'odometer-digit-box';
      const spacer = document.createElement('span');
      spacer.className = 'odometer-spacer';
      spacer.setAttribute('aria-hidden', 'true');
      spacer.textContent = char;
      const val = document.createElement('span');
      val.className = 'odometer-digit-val';
      val.textContent = char;
      box.appendChild(spacer);
      box.appendChild(val);
      return box;
    }

    function renderOdometer(containerEl, newNum) {
      if (!containerEl) return;
      const targetStr = String(newNum);

      // Первичная инициализация
      if (!containerEl.dataset.initialized) {
        containerEl.innerHTML = '';
        containerEl.dataset.initialized = 'true';
        containerEl.dataset.value = targetStr;
        for (let i = 0; i < targetStr.length; i++) {
          containerEl.appendChild(createOdometerDigitBox(targetStr[i]));
        }
        return;
      }

      const prevStr = containerEl.dataset.value || '';
      if (prevStr === targetStr) return;
      containerEl.dataset.value = targetStr;

      // Если уменьшилось количество разрядов (сброс / смена аккаунта)
      if (containerEl.children.length > targetStr.length) {
        containerEl.innerHTML = '';
        for (let i = 0; i < targetStr.length; i++) {
          containerEl.appendChild(createOdometerDigitBox(targetStr[i]));
        }
        return;
      }

      // Если разрядность увеличилась (например, 9 -> 10)
      while (containerEl.children.length < targetStr.length) {
        const box = createOdometerDigitBox(targetStr[0]);
        const val = box.querySelector('.odometer-digit-val');
        if (val) val.classList.add('incoming-top');
        containerEl.insertBefore(box, containerEl.firstChild);
        if (val) {
          void val.offsetHeight;
          requestAnimationFrame(() => {
            val.classList.remove('incoming-top');
            val.classList.add('incoming-normal');
          });
        }
      }

      const totalBoxes = containerEl.children.length;
      for (let i = 0; i < totalBoxes; i++) {
        const box = containerEl.children[i];
        if (!box) continue;
        const newChar = targetStr[i];
        const spacer = box.querySelector('.odometer-spacer');
        if (spacer) spacer.textContent = newChar;

        const currentVals = box.querySelectorAll('.odometer-digit-val:not(.outgoing-bottom)');
        const activeVal = currentVals[currentVals.length - 1];

        if (!activeVal) {
          const val = document.createElement('span');
          val.className = 'odometer-digit-val';
          val.textContent = newChar;
          box.appendChild(val);
          continue;
        }

        if (activeVal.textContent !== newChar) {
          // Очистка предыдущих завершающихся элементов
          box.querySelectorAll('.outgoing-bottom').forEach(el => el.remove());

          // Старая цифра уходит вниз (translateY 100%)
          activeVal.classList.add('outgoing-bottom');

          // Новая цифра приходит сверху (translateY -100% -> 0)
          const nextVal = document.createElement('span');
          nextVal.className = 'odometer-digit-val incoming-top';
          nextVal.textContent = newChar;
          box.appendChild(nextVal);

          // Force reflow для надёжного старта анимации переката цифр
          void nextVal.offsetHeight;

          requestAnimationFrame(() => {
            nextVal.classList.remove('incoming-top');
            nextVal.classList.add('incoming-normal');
          });

          setTimeout(() => {
            if (activeVal.parentNode) activeVal.remove();
            nextVal.classList.remove('incoming-normal');
          }, 240);
        }
      }
    }

    function updateTanjiroClickCounter(val) {
      if (typeof val === 'number') {
        clickCount = val;
      } else if (typeof achState !== 'undefined' && typeof achState.tanjiroClicks === 'number') {
        clickCount = achState.tanjiroClicks;
      }
      const container = document.getElementById('clickCounter');
      if (!container) return;
      let digits = document.getElementById('clickCounterDigits');
      if (!digits || !container.contains(digits)) {
        container.innerHTML = '<span class="mr-1.5 opacity-90">' + (typeof window.t === 'function' ? window.t('tanjiro_clicks_label') : 'Нажатий:') + '</span><span id="clickCounterDigits" class="odometer-reel-container font-semibold"></span>';
        digits = document.getElementById('clickCounterDigits');
      }
      clickCounterDigits = digits;
      renderOdometer(digits, clickCount);
    }

    function triggerTanjiroResult(answer) {
      if (typeof soundManager !== "undefined" && soundManager) soundManager.playClick();
      achState.tanjiroClicks = (achState.tanjiroClicks || 0) + 1;
      updateTanjiroClickCounter(achState.tanjiroClicks);
      saveAchState();
      if (achState.tanjiroClicks >= 1000) unlockAchievement('fanatic');

      resultDiv.textContent = answer;
      resultDiv.classList.remove('opacity-0', 'invisible', 'animate-pop-in');
      void resultDiv.offsetHeight;
      resultDiv.classList.add('animate-pop-in');
      fireRewardEffects();
    }

    revealBtn.addEventListener('click', () => {
      if (typeof soundManager !== "undefined" && soundManager) soundManager.playClick();
      registerTabPlay('tanjiro');
      const uniqueIdx = getUniqueRandomIndex(answers, 'tanjiro');
      triggerTanjiroResult(answers[uniqueIdx]);
    });

    // Пасхалка: 7 быстрых тапов по заголовку Танджиро разблокируют ачивку «Истинное прозвище» («Танджиро лох»)
    let tanjiroHeadingClicks = 0;
    let tanjiroHeadingTimer = null;
    const tanjiroHeading = document.getElementById('tanjiroTitleHeading') || document.querySelector('#content-tanjiro h1');
    if (tanjiroHeading) {
      tanjiroHeading.addEventListener('click', () => {
        tanjiroHeadingClicks++;
        clearTimeout(tanjiroHeadingTimer);
        tanjiroHeadingTimer = setTimeout(() => { tanjiroHeadingClicks = 0; }, 2500);
        if (tanjiroHeadingClicks >= 7) {
          unlockAchievement('nickname');
          tanjiroHeadingClicks = 0;
          if (typeof soundManager !== 'undefined' && soundManager) soundManager.playClick();
        }
      });
    }

    const tanjiroSpinBtn = document.getElementById('tanjiroSpinBtn');
    const tanjiroInfiniteBtn = document.getElementById('tanjiroInfiniteBtn');
    let isTanjiroAutoSpin = false;
    let tanjiroAutoTimeout = null;

    function stopTanjiroAutoSpin() {
      isTanjiroAutoSpin = false;
      if (tanjiroAutoTimeout) {
        clearTimeout(tanjiroAutoTimeout);
        tanjiroAutoTimeout = null;
      }
      if (tanjiroInfiniteBtn) {
        tanjiroInfiniteBtn.classList.remove('is-active', 'animate-pulse');
        const spinText = (typeof window.t === 'function' ? window.t('tanjiro_auto_spin', 'Авто-спин') : 'Авто-спин');
        tanjiroInfiniteBtn.innerHTML = `<svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg><span data-i18n="tanjiro_auto_spin">${spinText}</span>`;
      }
      if (typeof applyAllActiveEffects === 'function') applyAllActiveEffects();
      updateAdaptiveCardHeight();
    }

    function runTanjiroAutoSpinStep() {
      if (!isTanjiroAutoSpin) return;
      registerTabPlay('tanjiro');
      const uniqueIdx = getUniqueRandomIndex(answers, 'tanjiro');
      tanjiroWheel.spin(uniqueIdx, (selected) => {
        triggerTanjiroResult(selected);
        if (isTanjiroAutoSpin) {
          tanjiroAutoTimeout = setTimeout(() => {
            if (isTanjiroAutoSpin) runTanjiroAutoSpinStep();
          }, 1400);
        }
      });
    }

    function toggleTanjiroAutoSpin() {
      if (isTanjiroAutoSpin) {
        stopTanjiroAutoSpin();
      } else {
        isTanjiroAutoSpin = true;
        if (tanjiroInfiniteBtn) {
          tanjiroInfiniteBtn.classList.add('is-active');
          const stopText = (typeof window.t === 'function' ? window.t('tanjiro_stop_auto_spin', 'Остановить') : 'Остановить');
          tanjiroInfiniteBtn.innerHTML = `<span class="w-2 h-2 rounded-full bg-white animate-ping flex-shrink-0"></span><span class="sm:hidden">Стоп</span><span class="hidden sm:inline" data-i18n="tanjiro_stop_auto_spin">${stopText}</span>`;
        }
        if (!tanjiroWheel.isSpinning) {
          runTanjiroAutoSpinStep();
        }
      }
    }

    if (tanjiroInfiniteBtn) {
      tanjiroInfiniteBtn.addEventListener('click', toggleTanjiroAutoSpin);
    }

    tanjiroSpinBtn.addEventListener('click', () => {
      if (isTanjiroAutoSpin) {
        stopTanjiroAutoSpin();
        return;
      }
      if (tanjiroWheel.isSpinning) {
        // FIX #1: передаём валидный targetIndex и callback, иначе items[undefined]=undefined
        if (!achState.unlocked?.perpetual) {
          const comboIdx = getUniqueRandomIndex(answers, 'tanjiro');
          tanjiroWheel.spin(comboIdx, (selected) => { triggerTanjiroResult(selected); });
        }
        return;
      }
      registerTabPlay('tanjiro');
      const uniqueIdx = getUniqueRandomIndex(answers, 'tanjiro');
      tanjiroWheel.spin(uniqueIdx, (selected) => { triggerTanjiroResult(selected); });
    });

    document.getElementById('tanjiroCanvas')?.addEventListener('click', () => {
      if (tabModes.tanjiro === 'wheel') {
        if (isTanjiroAutoSpin) stopTanjiroAutoSpin();
        else tanjiroSpinBtn.click();
      }
    });

    // === 7. МОДАЛКИ ДЖЕННЫ ===
    const badWords = ['бля', 'сука', 'хуй', 'пизд', 'ебат', 'ёбат', 'нах', 'гандон', 'говно', 'чмо', 'шлюх', 'залуп', 'педик', 'урод', 'мразь'];

    const modalWho = document.getElementById('modalWho');
    const modalContentWho = document.getElementById('modalContentWho');
    const whoInput = document.getElementById('whoInput');
    const whoResult = document.getElementById('whoResult');
    let whoRoles = (typeof window.i18n !== 'undefined' && window.i18n.getWhoRoles)
      ? window.i18n.getWhoRoles()
      : ["Изгой", "Никто", "Нн какой-то", "Легенда чата", "Владелец", "Помощник владельца", "Раб Эбардо"];
    const whoWheel = new FortuneWheel('whoCanvas');
    whoWheel.setItems(whoRoles);

    document.getElementById('openWhoBtn').addEventListener('click', () => {
      modalWho.classList.remove('hidden', 'animate-modal-backdrop-out');
      modalWho.classList.add('animate-modal-backdrop-in');
      modalContentWho.classList.remove('animate-fade-out-scale', 'opacity-0', 'invisible');
      modalContentWho.classList.add('animate-fade-in-scale');
      whoWheel.draw();
    });
    let isWhoAutoSpin = false;
    let whoAutoTimeout = null;

    function stopWhoAutoSpin() {
      isWhoAutoSpin = false;
      if (whoAutoTimeout) {
        clearTimeout(whoAutoTimeout);
        whoAutoTimeout = null;
      }
      if (whoInfiniteBtn) {
        whoInfiniteBtn.classList.remove('is-active', 'animate-pulse');
        const spinText = (typeof window.t === 'function' ? window.t('tanjiro_auto_spin', 'Авто-спин') : 'Авто-спин');
        whoInfiniteBtn.innerHTML = `<svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg><span data-i18n="tanjiro_auto_spin">${spinText}</span>`;
      }
      if (typeof applyAllActiveEffects === 'function') applyAllActiveEffects();
    }

    function runWhoAutoSpinStep() {
      if (!isWhoAutoSpin) return;
      const name = whoInput.value.trim();
      if (!name) {
        stopWhoAutoSpin();
        return;
      }
      registerTabPlay('jenna');
      const uniqueIdx = getUniqueRandomIndex(whoRoles, 'who');
      whoWheel.spin(uniqueIdx, (role) => {
        whoResult.textContent = `${name} — ${role}!`;
        whoResult.classList.remove('opacity-0', 'invisible', 'animate-pop-in');
        void whoResult.offsetHeight; whoResult.classList.add('animate-pop-in');
        fireRewardEffects();
        if (isWhoAutoSpin) {
          whoAutoTimeout = setTimeout(() => {
            if (isWhoAutoSpin) runWhoAutoSpinStep();
          }, 1400);
        }
      });
    }

    function toggleWhoAutoSpin() {
      if (isWhoAutoSpin) {
        stopWhoAutoSpin();
      } else {
        const name = whoInput.value.trim();
        if (!name) {
          whoInput.focus();
          whoInput.classList.add('ring-2', 'ring-red-500');
          setTimeout(() => whoInput.classList.remove('ring-2', 'ring-red-500'), 1000);
          showSiteToast('Введите имя перед запуском авто-спина!', 'warning', 'Дженна');
          return;
        }
        isWhoAutoSpin = true;
        if (whoInfiniteBtn) {
          whoInfiniteBtn.classList.add('is-active');
          const stopText = (typeof window.t === 'function' ? window.t('tanjiro_stop_auto_spin', 'Остановить авто-спин') : 'Остановить авто-спин');
          whoInfiniteBtn.innerHTML = `<span class="w-2 h-2 rounded-full bg-white animate-ping flex-shrink-0"></span><span data-i18n="tanjiro_stop_auto_spin">${stopText}</span>`;
        }
        if (!whoWheel.isSpinning) {
          runWhoAutoSpinStep();
        }
      }
    }

    function closeWho() {
      stopWhoAutoSpin();
      // FIX #7: чистим combo-бейдж при закрытии — иначе DOM-элемент висит как "призрак"
      if (typeof hideWheelComboBadge === 'function') hideWheelComboBadge(whoWheel.canvas);
      modalWho.classList.remove('animate-modal-backdrop-in');
      modalWho.classList.add('animate-modal-backdrop-out');
      modalContentWho.classList.remove('animate-fade-in-scale');
      modalContentWho.classList.add('animate-fade-out-scale');
      setTimeout(() => { 
        modalWho.classList.add('hidden'); 
        modalWho.classList.remove('animate-modal-backdrop-out');
        modalContentWho.classList.remove('animate-fade-out-scale');
        modalContentWho.classList.add('opacity-0', 'invisible');
        whoResult.classList.add('opacity-0', 'invisible'); 
        whoInput.value = ''; 
      }, 180);
    }
    document.getElementById('closeModal').addEventListener('click', closeWho);
    document.getElementById('closeModalWhoX')?.addEventListener('click', closeWho);
    modalWho.addEventListener('click', (e) => { if (e.target === modalWho) closeWho(); });

    const whoInfiniteBtn = document.getElementById('whoInfiniteBtn');
    if (whoInfiniteBtn) whoInfiniteBtn.addEventListener('click', toggleWhoAutoSpin);

    document.getElementById('whoRevealBtn').addEventListener('click', () => {
      if (isWhoAutoSpin) {
        stopWhoAutoSpin();
        return;
      }
      if (whoWheel.isSpinning) {
        // FIX #1: передаём валидный targetIndex и callback
        if (!achState.unlocked?.perpetual) {
          const comboIdx = getUniqueRandomIndex(whoRoles, 'who');
          const name = whoInput.value.trim();
          whoWheel.spin(comboIdx, (role) => {
            whoResult.textContent = `${name} — ${role}!`;
            whoResult.classList.remove('opacity-0', 'invisible', 'animate-pop-in');
            void whoResult.offsetHeight; whoResult.classList.add('animate-pop-in');
          });
        }
        return;
      }
      const name = whoInput.value.trim();
      if (!name) { 
        whoResult.textContent = (typeof window.t === 'function') ? window.t('who_enter_name_toast', "Введите имя!") : "Введите имя!"; 
        whoResult.classList.remove('opacity-0', 'invisible'); 
        return; 
      }
      
      const cleanNameLower = name.toLowerCase().replace(/\s+/g, ' ');
      if (['танджиро лох', 'nyl;bhj kj[', 'tanjiro sucks', 'tanjiro loh'].includes(cleanNameLower)) {
        unlockAchievement('nickname');
      }

      const isBad = badWords.some(w => name.toLowerCase().includes(w));
      if (isBad) {
        achState.badWordCount = (achState.badWordCount || 0) + 1;
        saveAchState();
        if (achState.badWordCount >= 3) unlockAchievement('dangerous');
        whoResult.textContent = (typeof window.t === 'function') ? window.t('who_bad_word_toast', "Никнейм не может состоять из матов!") : "Никнейм не может состоять из матов!";
        whoResult.classList.remove('opacity-0', 'invisible');
        return;
      }

      registerTabPlay('jenna');
      const uniqueIdx = getUniqueRandomIndex(whoRoles, 'who');
      if (tabModes.jenna === 'wheel') {
        whoWheel.spin(uniqueIdx, (role) => {
          whoResult.textContent = `${name} — ${role}!`;
          whoResult.classList.remove('opacity-0', 'invisible', 'animate-pop-in');
          void whoResult.offsetHeight; whoResult.classList.add('animate-pop-in');
          fireRewardEffects();
        });
      } else {
        whoResult.textContent = `${name} — ${whoRoles[uniqueIdx]}!`;
        whoResult.classList.remove('opacity-0', 'invisible', 'animate-pop-in');
        void whoResult.offsetHeight; whoResult.classList.add('animate-pop-in');
        fireRewardEffects();
      }
    });

    document.getElementById('whoCanvas')?.addEventListener('click', () => {
      if (isWhoAutoSpin) stopWhoAutoSpin();
      else document.getElementById('whoRevealBtn').click();
    });

    const modalMembers = document.getElementById('modalMembers');
    const modalMembersContent = document.getElementById('modalMembersContent');
    const membersInput = document.getElementById('membersInput');
    const membersResult = document.getElementById('membersResult');
    const jennaMembers = [
      "Лерка", "Шарлотта", "Кавазя", "Имбирь", "Рис", "Мачетте", "Танджиро", "Эбардо", "Райка", "CVD",
      "Винзли", "Аластор", "Бу", "Костя", "Куане", "Дед-Террорист", "Смайл", "Мельница", "Аилин", "Вандерер",
      "Джей-Фай-Джей", "Редис", "HenChilnside", "Матвейка", "Майка", "Кирилл", "Фран", "Минэко", "Помидорка",
      "Rumble", "Шляпа", "Пушистик", "Darth Vader"
    ];
    function getJennaMembers() {
      const isEn = typeof window.i18n !== 'undefined' && window.i18n.currentLang === 'en';
      return jennaMembers.map(m => {
        if (m === 'Танджиро') return isEn ? 'Tanjiro' : 'Танджиро';
        if (m === 'Эбардо') return isEn ? 'Ebardo' : 'Эбардо';
        return m;
      });
    }
    window.getJennaMembers = getJennaMembers;
    const membersWheel = new FortuneWheel('membersCanvas');
    membersWheel.setItems(getJennaMembers());

    let isMembersAutoSpin = false;
    let membersAutoTimeout = null;

    function stopMembersAutoSpin() {
      isMembersAutoSpin = false;
      if (membersAutoTimeout) {
        clearTimeout(membersAutoTimeout);
        membersAutoTimeout = null;
      }
      if (membersInfiniteBtn) {
        membersInfiniteBtn.classList.remove('is-active', 'animate-pulse');
        const spinText = (typeof window.t === 'function' ? window.t('tanjiro_auto_spin', 'Авто-спин') : 'Авто-спин');
        membersInfiniteBtn.innerHTML = `<svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg><span data-i18n="tanjiro_auto_spin">${spinText}</span>`;
      }
      if (typeof applyAllActiveEffects === 'function') applyAllActiveEffects();
    }

    function runMembersAutoSpinStep() {
      if (!isMembersAutoSpin) return;
      const word = membersInput.value.trim();
      if (!word) {
        stopMembersAutoSpin();
        return;
      }
      registerTabPlay('jenna');
      const pref = (typeof window.t === 'function') ? window.t('members_result_prefix', 'Я уверен, что ') : 'Я уверен, что ';
      const isWord = (typeof window.t === 'function') ? window.t('members_result_is', ' — ') : ' — ';
      membersWheel.spin(uniqueIdx, (member) => {
        membersResult.textContent = `${pref}${member}${isWord}${word}!`;
        membersResult.classList.remove('opacity-0', 'invisible', 'animate-pop-in');
        void membersResult.offsetHeight; membersResult.classList.add('animate-pop-in');
        fireRewardEffects();
        if (isMembersAutoSpin) {
          membersAutoTimeout = setTimeout(() => {
            if (isMembersAutoSpin) runMembersAutoSpinStep();
          }, 1400);
        }
      });
    }

    function toggleMembersAutoSpin() {
      if (isMembersAutoSpin) {
        stopMembersAutoSpin();
      } else {
        const word = membersInput.value.trim();
        if (!word) {
          membersInput.focus();
          membersInput.classList.add('ring-2', 'ring-red-500');
          setTimeout(() => membersInput.classList.remove('ring-2', 'ring-red-500'), 1000);
          showSiteToast('Введите роль или слово перед запуском авто-спина!', 'warning', 'Дженна');
          return;
        }
        isMembersAutoSpin = true;
        if (membersInfiniteBtn) {
          membersInfiniteBtn.classList.add('is-active');
          const stopText = (typeof window.t === 'function' ? window.t('tanjiro_stop_auto_spin', 'Остановить авто-спин') : 'Остановить авто-спин');
          membersInfiniteBtn.innerHTML = `<span class="w-2 h-2 rounded-full bg-white animate-ping flex-shrink-0"></span><span data-i18n="tanjiro_stop_auto_spin">${stopText}</span>`;
        }
        if (!membersWheel.isSpinning) {
          runMembersAutoSpinStep();
        }
      }
    }

    document.getElementById('openMembersBtn').addEventListener('click', () => {
      modalMembers.classList.remove('hidden', 'animate-modal-backdrop-out');
      modalMembers.classList.add('animate-modal-backdrop-in');
      modalMembersContent.classList.remove('animate-fade-out-scale', 'opacity-0', 'invisible');
      modalMembersContent.classList.add('animate-fade-in-scale');
      membersWheel.draw();
    });
    function closeMembers() {
      stopMembersAutoSpin();
      // FIX #7: чистим combo-бейдж при закрытии
      if (typeof hideWheelComboBadge === 'function') hideWheelComboBadge(membersWheel.canvas);
      modalMembers.classList.remove('animate-modal-backdrop-in');
      modalMembers.classList.add('animate-modal-backdrop-out');
      modalMembersContent.classList.remove('animate-fade-in-scale');
      modalMembersContent.classList.add('animate-fade-out-scale');
      setTimeout(() => { 
        modalMembers.classList.add('hidden'); 
        modalMembers.classList.remove('animate-modal-backdrop-out');
        modalMembersContent.classList.remove('animate-fade-out-scale');
        modalMembersContent.classList.add('opacity-0', 'invisible');
        membersResult.classList.add('opacity-0', 'invisible'); 
        membersInput.value = ''; 
      }, 180);
    }
    document.getElementById('closeMembersModal').addEventListener('click', closeMembers);
    document.getElementById('closeModalMembersX')?.addEventListener('click', closeMembers);
    modalMembers.addEventListener('click', (e) => { if (e.target === modalMembers) closeMembers(); });

    const membersInfiniteBtn = document.getElementById('membersInfiniteBtn');
    if (membersInfiniteBtn) membersInfiniteBtn.addEventListener('click', toggleMembersAutoSpin);

    document.getElementById('membersRevealBtn').addEventListener('click', () => {
      if (isMembersAutoSpin) {
        stopMembersAutoSpin();
        return;
      }
      if (membersWheel.isSpinning) {
        // FIX #1: передаём валидный targetIndex и callback
        if (!achState.unlocked?.perpetual) {
          const curMembers = getJennaMembers();
          const comboIdx = getUniqueRandomIndex(curMembers, 'members');
          const word = membersInput.value.trim();
          membersWheel.spin(comboIdx, (member) => {
            membersResult.textContent = (typeof window.t === 'function' ? window.t('members_result_format', { member, word }) : `Я уверен, что ${member} — ${word}!`);
            membersResult.classList.remove('opacity-0', 'invisible', 'animate-pop-in');
            void membersResult.offsetHeight; membersResult.classList.add('animate-pop-in');
          });
        }
        return;
      }
      const word = membersInput.value.trim();
      if (!word) { 
        membersResult.textContent = (typeof window.t === 'function') ? window.t('members_enter_word_toast', "Введите слово!") : "Введите слово!"; 
        membersResult.classList.remove('opacity-0', 'invisible'); 
        return; 
      }
      
      const cleanWordLower = word.toLowerCase().replace(/\s+/g, ' ');
      if (['танджиро лох', 'nyl;bhj kj[', 'tanjiro sucks', 'tanjiro loh'].includes(cleanWordLower)) {
        unlockAchievement('nickname');
      }

      const isBad = badWords.some(w => word.toLowerCase().includes(w));
      if (isBad) {
        achState.badWordCount = (achState.badWordCount || 0) + 1;
        saveAchState();
        if (achState.badWordCount >= 3) unlockAchievement('dangerous');
        membersResult.textContent = (typeof window.t === 'function') ? window.t('members_bad_word_toast', "Статус не может состоять из матов!") : "Статус не может состоять из матов!";
        membersResult.classList.remove('opacity-0', 'invisible');
        return;
      }

      registerTabPlay('jenna');
      const curMembers = getJennaMembers();
      const uniqueIdx = getUniqueRandomIndex(curMembers, 'members');
      const pref = (typeof window.t === 'function') ? window.t('members_result_prefix', 'Я уверен, что ') : 'Я уверен, что ';
      const isWord = (typeof window.t === 'function') ? window.t('members_result_is', ' — ') : ' — ';
      if (tabModes.jenna === 'wheel') {
        membersWheel.spin(uniqueIdx, (member) => {
          membersResult.textContent = `${pref}${member}${isWord}${word}!`;
          membersResult.classList.remove('opacity-0', 'invisible', 'animate-pop-in');
          void membersResult.offsetHeight; membersResult.classList.add('animate-pop-in');
          fireRewardEffects();
        });
      } else {
        membersResult.textContent = `${pref}${curMembers[uniqueIdx]}${isWord}${word}!`;
        membersResult.classList.remove('opacity-0', 'invisible', 'animate-pop-in');
        void membersResult.offsetHeight; membersResult.classList.add('animate-pop-in');
        fireRewardEffects();
      }
    });

    document.getElementById('membersCanvas')?.addEventListener('click', () => {
      if (isMembersAutoSpin) stopMembersAutoSpin();
      else document.getElementById('membersRevealBtn').click();
    });

    // === 8. КАСТОМНАЯ ВКЛАДКА ===
    const modalCustom = document.getElementById('modalCustom');
    const modalCustomContent = document.getElementById('modalCustomContent');
    const customDefaultView = document.getElementById('customDefaultView');
    const customActiveView = document.getElementById('customActiveView');
    const customTitleDisplay = document.getElementById('customTitleDisplay');
    const customDescDisplay = document.getElementById('customDescDisplay');
    const customResult = document.getElementById('customResult');
    const customSpinBtn = document.getElementById('customSpinBtn');
    const customStageBadge = document.getElementById('customStageBadge');
    const customManualListsContainer = document.getElementById('customManualListsContainer');
    const customPacksActiveNotice = document.getElementById('customPacksActiveNotice');

    let customData = { title: 'Моё Меню', desc: 'Сейчас мы это и узнаем...', names: [], roles: [], isFromPacks: false };
    let customStage = 1;
    let selectedCustomName = '';
    const customWheel = new FortuneWheel('customCanvas');

    function resetCustomWheelFlow() {
      if (window.activeCustomCooldown) {
        clearInterval(window.activeCustomCooldown);
        window.activeCustomCooldown = null;
      }
      customStage = 1;
      selectedCustomName = '';
      const availableNames = getAvailableCustomNames();
      if (availableNames && availableNames.length > 0) {
        customWheel.setItems(availableNames);
        customStageBadge.textContent = (typeof window.t === 'function') ? window.t('custom_stage_1', 'Этап 1: Выбираем человека') : 'Этап 1: Выбираем человека';
        customStageBadge.className = 'mb-5 sm:mb-6 px-4 py-1.5 bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold';
        customSpinBtn.textContent = (typeof window.t === 'function') ? window.t('custom_spin_btn', 'Крутить колесо!') : 'Крутить колесо!';
      }
    }

    function initCustomDataFromActivePacks() {
      const activePacks = userPacks.filter(p => p.active);
      if (activePacks.length > 0) {
        let combinedNames = [];
        let combinedRoles = [];
        let packTitles = [];

        activePacks.forEach(p => {
          packTitles.push(p.title);
          if (p.type === 'names' || p.type === 'both') combinedNames.push(...p.names);
          if (p.type === 'roles' || p.type === 'both') combinedRoles.push(...p.roles);
        });

        combinedNames = [...new Set(combinedNames)];
        combinedRoles = [...new Set(combinedRoles)];

        if (combinedNames.length > 0 && combinedRoles.length > 0) {
          customData = {
            title: packTitles.length === 1 ? packTitles[0] : 'Комбинация: ' + packTitles.join(' + '),
            desc: `Выбрано паков: ${activePacks.length} (${combinedNames.length} имён, ${combinedRoles.length} ролей)`,
            names: combinedNames,
            roles: combinedRoles,
            isFromPacks: true
          };
          resetCustomExclusionPools();
          customTitleDisplay.textContent = customData.title;
          customDescDisplay.textContent = customData.desc;
          customDefaultView.classList.add('hidden');
          customActiveView.classList.remove('hidden');
          customActiveView.classList.add('flex');
          if (tabModes.custom === 'wheel') {
            resetCustomWheelFlow();
          }
        }
      } else {
        // 0 активных паков - возвращаемся к ручному кастому либо дефолтному экрану
        const savedManual = safeJsonParse('custom_menu_data_manual', null);
        if (savedManual && savedManual.names?.length > 0 && savedManual.roles?.length > 0) {
          customData = {
            title: savedManual.title || 'Моё Меню',
            desc: savedManual.desc || 'Сейчас мы это и узнаем...',
            names: savedManual.names,
            roles: savedManual.roles,
            isFromPacks: false
          };
          resetCustomExclusionPools();
          customTitleDisplay.textContent = customData.title;
          customDescDisplay.textContent = customData.desc;
          customDefaultView.classList.add('hidden');
          customActiveView.classList.remove('hidden');
          customActiveView.classList.add('flex');
          if (tabModes.custom === 'wheel') {
            resetCustomWheelFlow();
          }
        } else {
          customData = { title: 'Моё Меню', desc: 'Сейчас мы это и узнаем...', names: [], roles: [], isFromPacks: false };
          resetCustomExclusionPools();
          customActiveView.classList.add('hidden');
          customActiveView.classList.remove('flex');
          customDefaultView.classList.remove('hidden');
        }
      }
    }

    function openCustomModal(isManualCreation = false) {
      const hasActivePacks = userPacks.some(p => p.active) && customData.isFromPacks && !isManualCreation;

      document.getElementById('customTitleInput').value = customData.title || '';
      document.getElementById('customDescInput').value = customData.desc || '';

      if (hasActivePacks) {
        customManualListsContainer.classList.add('hidden');
        customPacksActiveNotice.classList.remove('hidden');
      } else {
        customManualListsContainer.classList.remove('hidden');
        customPacksActiveNotice.classList.add('hidden');
        document.getElementById('customNamesInput').value = (customData.names || []).join(', ');
        document.getElementById('customRolesInput').value = (customData.roles || []).join(', ');
      }

      modalCustom.classList.remove('hidden', 'animate-modal-backdrop-out');
      modalCustom.classList.add('animate-modal-backdrop-in');
      modalCustomContent.classList.remove('animate-fade-out-scale', 'opacity-0', 'invisible');
      modalCustomContent.classList.add('animate-fade-in-scale');
    }

    function closeCustomModal() {
      modalCustom.classList.remove('animate-modal-backdrop-in');
      modalCustom.classList.add('animate-modal-backdrop-out');
      modalCustomContent.classList.remove('animate-fade-in-scale');
      modalCustomContent.classList.add('animate-fade-out-scale');
      setTimeout(() => { 
        modalCustom.classList.add('hidden'); 
        modalCustom.classList.remove('animate-modal-backdrop-out');
        modalCustomContent.classList.remove('animate-fade-out-scale');
        modalCustomContent.classList.add('opacity-0', 'invisible');
      }, 180);
    }

    document.getElementById('customizeMenuBtn').addEventListener('click', () => openCustomModal(true));
    document.getElementById('reCustomizeBtn').addEventListener('click', () => openCustomModal(false));
    document.getElementById('reCustomizeBtn2').addEventListener('click', () => openCustomModal(false));
    document.getElementById('closeCustomModal').addEventListener('click', closeCustomModal);
    document.getElementById('closeModalCustomX')?.addEventListener('click', closeCustomModal);
    modalCustom.addEventListener('click', (e) => { if (e.target === modalCustom) closeCustomModal(); });

    document.getElementById('saveCustomBtn').addEventListener('click', () => {
      const title = document.getElementById('customTitleInput').value.trim() || 'Моё Меню';
      const desc = document.getElementById('customDescInput').value.trim() || 'Сейчас мы это и узнаем...';
      const hasActivePacks = userPacks.some(p => p.active) && customData.isFromPacks;

      if (hasActivePacks) {
        customData.title = title;
        customData.desc = desc;
      } else {
        const names = document.getElementById('customNamesInput').value.split(',').map(n => n.trim()).filter(n => n);
        const roles = document.getElementById('customRolesInput').value.split(',').map(r => r.trim()).filter(r => r);

        if (!names.length || !roles.length) { showSiteToast('Введите имена и роли через запятую перед сохранением!', 'warning', 'Пустые поля'); return; }
        customData = { title, desc, names, roles, isFromPacks: false };
        localStorage.setItem('custom_menu_data_manual', JSON.stringify(customData));
        if (typeof saveCurrentUserData === 'function') saveCurrentUserData();
      }

      resetCustomExclusionPools();

      customTitleDisplay.textContent = customData.title;
      customDescDisplay.textContent = customData.desc;

      customDefaultView.classList.add('hidden');
      customActiveView.classList.remove('hidden');
      customActiveView.classList.add('flex');
      updateTabModeUI('custom', tabModes.custom);
      if (tabModes.custom === 'wheel') resetCustomWheelFlow();
      closeCustomModal();
    });

    document.getElementById('customRevealBtn').addEventListener('click', () => {
      if (typeof soundManager !== "undefined" && soundManager) soundManager.playClick();
      const availableNames = getAvailableCustomNames();
      const availableRoles = getAvailableCustomRoles();
      if (!availableNames.length || !availableRoles.length) return;
      registerTabPlay('custom');

      const isDual = achState.unlocked?.chef && achEffects.dual && document.getElementById('dualDropCheckbox')?.checked && availableNames.length >= 2;
      const roleIdx = pickCustomRoleIndex(availableRoles);
      const pickedRole = availableRoles[roleIdx];
      consumeCustomRole(pickedRole);

      if (isDual) {
        const nameIdx1 = pickCustomNameIndex(availableNames);
        const n1 = availableNames[nameIdx1];
        consumeCustomName(n1);

        const remainingAfterN1 = getAvailableCustomNames().filter(n => n !== n1);
        const n2 = remainingAfterN1.length > 0 ? remainingAfterN1[Math.floor(Math.random() * remainingAfterN1.length)] : n1;
        consumeCustomName(n2);
        customResult.textContent = (typeof window.t === 'function' ? window.t('custom_result_format', { n1, n2, role: pickedRole }) : `${n1} и ${n2} — ${pickedRole}!`);
      } else {
        const nameIdx = pickCustomNameIndex(availableNames);
        const pickedName = availableNames[nameIdx];
        consumeCustomName(pickedName);
        customResult.textContent = `${pickedName} — ${pickedRole}!`;
      }

      customResult.classList.remove('opacity-0', 'invisible', 'animate-pop-in');
      void customResult.offsetHeight; customResult.classList.add('animate-pop-in');
      fireRewardEffects();

      if (tabModes.custom === 'wheel') {
        resetCustomWheelFlow();
      }
    });

    const customInfiniteBtn = document.getElementById('customInfiniteBtn');
    let isCustomAutoSpin = false;
    let customAutoTimeout = null;

    function stopCustomAutoSpin() {
      isCustomAutoSpin = false;
      if (customAutoTimeout) {
        clearTimeout(customAutoTimeout);
        customAutoTimeout = null;
      }
      if (customInfiniteBtn) {
        customInfiniteBtn.classList.remove('is-active', 'animate-pulse');
        const spinText = (typeof window.t === 'function' ? window.t('tanjiro_auto_spin', 'Авто-спин') : 'Авто-спин');
        customInfiniteBtn.innerHTML = `<svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg><span data-i18n="tanjiro_auto_spin">${spinText}</span>`;
      }
      if (typeof applyAllActiveEffects === 'function') applyAllActiveEffects();
    }

    function startCustomCooldown(onComplete) {
      if (window.activeCustomCooldown) {
        clearInterval(window.activeCustomCooldown);
        window.activeCustomCooldown = null;
      }
      let cooldownSeconds = 3;
      if (customSpinBtn) {
        customSpinBtn.disabled = true;
        customSpinBtn.classList.add('opacity-50', 'cursor-not-allowed', 'filter', 'grayscale');
        const waitText = (typeof window.t === 'function') ? window.t('custom_wait_cooldown', `Подождите (${cooldownSeconds}с)...`).replace('{sec}', cooldownSeconds) : `Подождите (${cooldownSeconds}с)...`;
        customSpinBtn.setAttribute('title', waitText);
        customSpinBtn.innerHTML = `<span>${waitText}</span>`;
      }

      window.activeCustomCooldown = setInterval(() => {
        cooldownSeconds--;
        if (cooldownSeconds > 0) {
          if (customSpinBtn) {
            const waitText = (typeof window.t === 'function') ? window.t('custom_wait_cooldown', `Подождите (${cooldownSeconds}с)...`).replace('{sec}', cooldownSeconds) : `Подождите (${cooldownSeconds}с)...`;
            customSpinBtn.setAttribute('title', waitText);
            customSpinBtn.innerHTML = `<span>${waitText}</span>`;
          }
        } else {
          clearInterval(window.activeCustomCooldown);
          window.activeCustomCooldown = null;
          resetCustomWheelFlow();
          if (customSpinBtn) {
            customSpinBtn.disabled = false;
            customSpinBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'filter', 'grayscale');
            customSpinBtn.removeAttribute('title');
            const spinBtnText = (typeof window.t === 'function') ? window.t('custom_spin_btn', 'Крутить колесо!') : 'Крутить колесо!';
            customSpinBtn.innerHTML = `<span>${spinBtnText}</span>`;
          }
          if (typeof onComplete === 'function') {
            onComplete();
          }
        }
      }, 1000);
    }

    function runCustomAutoSpinStep() {
      if (!isCustomAutoSpin) return;
      registerTabPlay('custom');

      if (customStage === 1) {
        const availableNames = getAvailableCustomNames();
        if (!availableNames || availableNames.length === 0) {
          stopCustomAutoSpin();
          return;
        }
        customWheel.setItems(availableNames);
        const targetIdx = pickCustomNameIndex(availableNames);
        customWheel.spin(targetIdx, (pickedName) => {
          selectedCustomName = pickedName;
          consumeCustomName(pickedName);

          customStage = 2;
          const availableRoles = getAvailableCustomRoles();
          customWheel.setItems(availableRoles);
          customStageBadge.textContent = (typeof window.t === 'function') ? window.t('custom_stage_2', 'Этап 2: Выбираем действие/роль') : `Человек: ${selectedCustomName}! Теперь действие:`;
          customStageBadge.className = 'mb-5 sm:mb-6 px-4 py-1.5 bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold';
          customSpinBtn.textContent = (typeof window.t === 'function') ? window.t('custom_spin_btn', 'Крутить колесо!') : 'Крутить колесо!';
          if (isCustomAutoSpin) {
            customAutoTimeout = setTimeout(() => {
              if (isCustomAutoSpin) runCustomAutoSpinStep();
            }, 800);
          }
        });
      } else {
        const availableRoles = getAvailableCustomRoles();
        if (!availableRoles || availableRoles.length === 0) {
          stopCustomAutoSpin();
          return;
        }
        customWheel.setItems(availableRoles);
        const targetIdx = pickCustomRoleIndex(availableRoles);
        customWheel.spin(targetIdx, (pickedRole) => {
          consumeCustomRole(pickedRole);
          customResult.textContent = `${selectedCustomName} — ${pickedRole}!`;
          customResult.classList.remove('opacity-0', 'invisible', 'animate-pop-in');
          void customResult.offsetHeight; customResult.classList.add('animate-pop-in');
          fireRewardEffects();

          // ─── Визуальный кулдаун на 3 секунды с обратным отсчетом для автоспина и ручного спина ───
          if (isCustomAutoSpin) {
            startCustomCooldown(() => {
              if (isCustomAutoSpin) {
                runCustomAutoSpinStep();
              }
            });
          } else {
            startCustomCooldown();
          }
        });
      }
    }

    function toggleCustomAutoSpin() {
      if (isCustomAutoSpin) {
        stopCustomAutoSpin();
      } else {
        isCustomAutoSpin = true;
        if (customInfiniteBtn) {
          customInfiniteBtn.classList.add('is-active');
          const stopText = (typeof window.t === 'function' ? window.t('tanjiro_stop_auto_spin', 'Остановить') : 'Остановить');
          customInfiniteBtn.innerHTML = `<span class="w-2 h-2 rounded-full bg-white animate-ping flex-shrink-0"></span><span class="sm:hidden">Стоп</span><span class="hidden sm:inline" data-i18n="tanjiro_stop_auto_spin">${stopText}</span>`;
        }
        if (!customWheel.isSpinning && !window.activeCustomCooldown) {
          runCustomAutoSpinStep();
        }
      }
    }

    if (customInfiniteBtn) customInfiniteBtn.addEventListener('click', toggleCustomAutoSpin);

    customSpinBtn.addEventListener('click', () => {
      if (window.activeCustomCooldown) return;
      if (isCustomAutoSpin) {
        stopCustomAutoSpin();
        return;
      }
      if (customWheel.isSpinning) {
        // FIX #1: spin() без args → undefined result; передаём корректный targetIndex
        if (!achState.unlocked?.perpetual) {
          if (customStage === 1) {
            const av = getAvailableCustomNames();
            if (av.length > 0) customWheel.spin(pickCustomNameIndex(av), () => {});
          } else {
            const av = getAvailableCustomRoles();
            if (av.length > 0) customWheel.spin(pickCustomRoleIndex(av), () => {});
          }
        }
        return;
      }
      registerTabPlay('custom');

      if (customStage === 1) {
        const availableNames = getAvailableCustomNames();
        if (!availableNames || availableNames.length === 0) return;
        customWheel.setItems(availableNames);
        const targetIdx = pickCustomNameIndex(availableNames);
        customWheel.spin(targetIdx, (pickedName) => {
          selectedCustomName = pickedName;
          consumeCustomName(pickedName);

          customStage = 2;
          const availableRoles = getAvailableCustomRoles();
          customWheel.setItems(availableRoles);
          customStageBadge.textContent = (typeof window.t === 'function') ? window.t('custom_stage_2', 'Этап 2: Выбираем действие/роль') : `Человек: ${selectedCustomName}! Теперь действие:`;
          customStageBadge.className = 'mb-5 sm:mb-6 px-4 py-1.5 bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold';
          customSpinBtn.textContent = (typeof window.t === 'function') ? window.t('custom_spin_btn', 'Крутить колесо!') : 'Крутить колесо!';
        });
      } else {
        const availableRoles = getAvailableCustomRoles();
        if (!availableRoles || availableRoles.length === 0) return;
        customWheel.setItems(availableRoles);
        const targetIdx = pickCustomRoleIndex(availableRoles);
        customWheel.spin(targetIdx, (pickedRole) => {
          consumeCustomRole(pickedRole);
          customResult.textContent = `${selectedCustomName} — ${pickedRole}!`;
          customResult.classList.remove('opacity-0', 'invisible', 'animate-pop-in');
          void customResult.offsetHeight; customResult.classList.add('animate-pop-in');
          fireRewardEffects();

          startCustomCooldown();
        });
      }
    });

    document.getElementById('customCanvas')?.addEventListener('click', () => {
      if (window.activeCustomCooldown) return;
      if (tabModes.custom === 'wheel') {
        if (isCustomAutoSpin) stopCustomAutoSpin();
        else customSpinBtn.click();
      }
    });

    
    // Тумблеры алгоритмов Кастома в Настройках
    const exclusionNamesToggle = document.getElementById('customExclusionNamesToggle');
    const exclusionRolesToggle = document.getElementById('customExclusionRolesToggle');
    const pityToggle = document.getElementById('customPityToggle');

    if (exclusionNamesToggle) {
      exclusionNamesToggle.checked = localStorage.getItem('custom_exclusion_names') === 'true';
      exclusionNamesToggle.addEventListener('change', (e) => {
        localStorage.setItem('custom_exclusion_names', e.target.checked ? 'true' : 'false');
        resetCustomExclusionPools();
        if (tabModes.custom === 'wheel' && !customWheel.isSpinning && !window.activeCustomCooldown) {
          resetCustomWheelFlow();
        }
      });
    }

    if (exclusionRolesToggle) {
      exclusionRolesToggle.checked = localStorage.getItem('custom_exclusion_roles') === 'true';
      exclusionRolesToggle.addEventListener('change', (e) => {
        localStorage.setItem('custom_exclusion_roles', e.target.checked ? 'true' : 'false');
        resetCustomExclusionPools();
        if (tabModes.custom === 'wheel' && !customWheel.isSpinning && !window.activeCustomCooldown) {
          resetCustomWheelFlow();
        }
      });
    }

    if (pityToggle) {
      pityToggle.checked = localStorage.getItem('custom_pity_protection') === 'true';
      pityToggle.addEventListener('change', (e) => {
        localStorage.setItem('custom_pity_protection', e.target.checked ? 'true' : 'false');
        resetCustomExclusionPools();
        if (tabModes.custom === 'wheel' && !customWheel.isSpinning && !window.activeCustomCooldown) {
          resetCustomWheelFlow();
        }
      });
    }

    // Обработчик кнопки "Отключить все паки" (Маленькая серая SVG кнопка)
    const resetAllPacksBtnEl = document.getElementById('resetAllPacksBtn');
    if (resetAllPacksBtnEl) {
      resetAllPacksBtnEl.addEventListener('click', () => {
        userPacks.forEach(p => p.active = false);
        saveUserPacks();
        renderPacksList();
        initCustomDataFromActivePacks();
        updateResetPacksButtonVisibility();
        resetCustomExclusionPools();
      });
    }

    // === 9. КЛАВИАТУРА ===
    let konamiCode = '';
    const secretPhrases = ['танджиро лох', 'nyl;bhj kj[', 'tanjiro sucks', 'tanjiro loh'];

    document.addEventListener('keydown', (e) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || document.activeElement?.isContentEditable;
      if (!isInput && e.key && e.key.length === 1) {
        konamiCode += e.key.toLowerCase();
        if (konamiCode.length > 25) konamiCode = konamiCode.slice(-25);
        if (secretPhrases.some(phrase => konamiCode.endsWith(phrase))) {
          unlockAchievement('nickname');
          konamiCode = '';
        }
      }

      // Закрытие любых открытых модальных окон по Escape (работает всегда)
      if (e.key === 'Escape') {
        if (typeof closeUserProfileModal === 'function') closeUserProfileModal();
        if (typeof closeAchievementsModal === 'function') closeAchievementsModal();
        if (typeof closePacksModal === 'function') closePacksModal();
        if (typeof closeCustomModal === 'function') closeCustomModal();
        if (typeof closeWho === 'function') closeWho();
        if (typeof closeMembers === 'function') closeMembers();
        document.getElementById('settingsModal')?.classList.add('hidden');
        document.getElementById('photoModal')?.classList.add('hidden');
        document.getElementById('tabPhotoModal')?.classList.add('hidden');
        
        const authModal = document.getElementById('authModal');
        const currentUserId = typeof getCurrentUserId === 'function' ? getCurrentUserId() : null;
        if (authModal && currentUserId && typeof closeAuthModal === 'function') {
          closeAuthModal();
        }
        if (typeof syncBodyScrollLock === 'function') syncBodyScrollLock();
      }

      if (achState.unlocked?.nickname && achEffects.hotkeys && !isInput) {
        // Перемещение по вкладкам (1, 2, 3 и стрелки ← / →)
        const modalOpen = typeof isAnyModalOpen === 'function' ? isAnyModalOpen() : false;
        if (!modalOpen) {
          if (e.key === '1') {
            switchToTab('tanjiro');
          } else if (e.key === '2') {
            switchToTab('jenna');
          } else if (e.key === '3') {
            switchToTab('custom');
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            const nextIndex = (currentTabIndex + 1) % tabs.length;
            switchToTab(tabs[nextIndex]);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const prevIndex = (currentTabIndex - 1 + tabs.length) % tabs.length;
            switchToTab(tabs[prevIndex]);
          }
        }
        if (e.key === ' ') {
          e.preventDefault();
          const activeTab = tabs[currentTabIndex];
          if (activeTab === 'tanjiro') {
            if (tabModes.tanjiro === 'wheel') document.getElementById('tanjiroSpinBtn').click();
            else revealBtn.click();
          } else if (activeTab === 'custom') {
            if (tabModes.custom === 'wheel') customSpinBtn.click();
            else document.getElementById('customRevealBtn').click();
          }
        }
      }
    });

    // === 9.1 СВАЙП-НАВИГАЦИЯ ПО ВКЛАДКАМ (ЖЕСТЫ ДЛЯ ТЕЛЕФОНОВ) ===
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const mainCard = document.getElementById('mainContentCard');
    if (mainCard) {
      mainCard.addEventListener('touchstart', (e) => {
        if (!achState.unlocked?.nickname || !achEffects.hotkeys) return;
        const modalOpen = typeof isAnyModalOpen === 'function' ? isAnyModalOpen() : false;
        if (modalOpen) return;

        const touch = e.touches[0];
        if (!touch) return;
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
      }, { passive: true });

      mainCard.addEventListener('touchend', (e) => {
        if (!achState.unlocked?.nickname || !achEffects.hotkeys) return;
        const modalOpen = typeof isAnyModalOpen === 'function' ? isAnyModalOpen() : false;
        if (modalOpen) return;

        const touch = e.changedTouches[0];
        if (!touch) return;

        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        const deltaTime = Date.now() - touchStartTime;

        // Не перехватываем свайп, если жест начался в поле ввода
        const target = e.target;
        if (target && target.closest('input, textarea, select, [contenteditable="true"]')) {
          return;
        }

        // Горизонтальный свайп: смещение >= 45px, горизонтальное движение преобладает над вертикальным, время < 650ms
        if (deltaTime <= 650 && Math.abs(deltaX) >= 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
          if (deltaX < 0) {
            // Свайп влево -> следующая вкладка вправо (Танджиро -> Дженна -> Кастом)
            const nextIndex = (currentTabIndex + 1) % tabs.length;
            switchToTab(tabs[nextIndex]);
          } else {
            // Свайп вправо -> предыдущая вкладка влево (Кастом -> Дженна -> Танджиро)
            const prevIndex = (currentTabIndex - 1 + tabs.length) % tabs.length;
            switchToTab(tabs[prevIndex]);
          }
        }
      }, { passive: true });
    }

    // === 10. ТЕМА И ФОНЫ ===
    let themeSwitchTimestamps = [];
    const settingsModal = document.getElementById('settingsModal');
    document.getElementById('settingsBtn').addEventListener('click', () => {
      updateVolumeUI();
      settingsModal.classList.remove('hidden');
    });
    const closeSettings = () => settingsModal.classList.add('hidden');
    document.getElementById('closeSettingsModal')?.addEventListener('click', closeSettings);
    document.getElementById('closeSettingsModalX')?.addEventListener('click', closeSettings);
    settingsModal?.addEventListener('click', (e) => { if (e.target === settingsModal) closeSettings(); });

    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') html.classList.add('dark');

    document.getElementById('themeToggleInModal').addEventListener('click', () => {
      html.classList.toggle('dark');
      localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');

      const now = Date.now();
      themeSwitchTimestamps.push(now);
      themeSwitchTimestamps = themeSwitchTimestamps.filter(t => now - t <= 60000);
      if (themeSwitchTimestamps.length >= 15) unlockAchievement('epileptic');
    });

    // Фон сайта
    const photoModal = document.getElementById('photoModal');
    const fileInput = document.getElementById('fileInput');
    document.getElementById('photoBgBtn').addEventListener('click', () => { settingsModal.classList.add('hidden'); photoModal.classList.remove('hidden'); });
    document.getElementById('closePhotoModal').addEventListener('click', () => photoModal.classList.add('hidden'));
    document.getElementById('selectImageButton').addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          document.body.style.backgroundImage = `url(${ev.target.result})`;
          document.body.style.backgroundSize = 'cover';
          document.body.style.backgroundPosition = 'center';
          document.body.style.backgroundAttachment = 'fixed';
          localStorage.setItem('sitePhotoBg', ev.target.result);
          applyAllActiveEffects();
        };
        reader.readAsDataURL(file);
      }
      photoModal.classList.add('hidden');
    });
    document.getElementById('removePhotoButton').addEventListener('click', () => {
      document.body.style.backgroundImage = '';
      localStorage.removeItem('sitePhotoBg');
      photoModal.classList.add('hidden');
    });

    // Фон вкладок
    const tabPhotoModal = document.getElementById('tabPhotoModal');
    const tabFileInput = document.getElementById('tabFileInput');
    document.getElementById('tabPhotoBgBtn').addEventListener('click', () => { settingsModal.classList.add('hidden'); tabPhotoModal.classList.remove('hidden'); });
    document.getElementById('closeTabPhotoModal').addEventListener('click', () => tabPhotoModal.classList.add('hidden'));
    document.getElementById('selectTabImageButton').addEventListener('click', () => tabFileInput.click());

    tabFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          applyTabPhoto(ev.target.result);
          localStorage.setItem('tabCustomPhoto', ev.target.result);
          applyAllActiveEffects();
        };
        reader.readAsDataURL(file);
      }
      tabPhotoModal.classList.add('hidden');
    });

    function applyTabPhoto(imgUrl) {
      document.querySelectorAll('.tab-content').forEach(card => {
        card.style.backgroundImage = `url(${imgUrl})`;
        card.style.backgroundSize = 'cover';
        card.style.backgroundPosition = 'center';
      });
    }

    document.getElementById('removeTabPhotoButton').addEventListener('click', () => {
      document.querySelectorAll('.tab-content').forEach(card => { card.style.backgroundImage = ''; });
      localStorage.removeItem('tabCustomPhoto');
      tabPhotoModal.classList.add('hidden');
    });

    // Старт
    
    // ─── Обработчики авторизации и профиля ───
    // Обработчики и события авторизации вынесены в отдельный модуль accounts.js

    // ─── Предотвращение прокрутки фона при открытых модальных окнах ───
    function isAnyModalOpen() {
      const selectors = [
        '#authModal',
        '#userProfileModal',
        '#settingsModal',
        '#modalLeaderboard',
        '#modalAchievements',
        '#modalPacks',
        '#modalCustom',
        '#modalWho',
        '#modalMembers',
        '#photoModal',
        '#tabPhotoModal',
        '#modalConfirmDelete'
      ];
      return selectors.some(sel => {
        const el = document.querySelector(sel);
        return el && !el.classList.contains('hidden');
      });
    }

    function syncBodyScrollLock() {
      if (isAnyModalOpen()) {
        document.body.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
      }
    }

    const modalObserver = new MutationObserver(() => {
      syncBodyScrollLock();
    });

    const allModalEls = document.querySelectorAll(
      '#authModal, #userProfileModal, #settingsModal, #modalLeaderboard, #modalAchievements, #modalPacks, #modalCustom, #modalWho, #modalMembers, #photoModal, #tabPhotoModal, #modalConfirmDelete'
    );
    allModalEls.forEach(el => {
      modalObserver.observe(el, { attributes: true, attributeFilter: ['class'] });
    });

    // Предотвращение передачи прокрутки колесика (СКМ) на страницу под модалкой
    window.addEventListener('wheel', (e) => {
      if (isAnyModalOpen()) {
        const scrollable = e.target.closest('.overflow-y-auto, .overflow-auto');
        if (!scrollable) {
          e.preventDefault();
        } else {
          const { scrollTop, scrollHeight, clientHeight } = scrollable;
          const isAtTop = scrollTop <= 0 && e.deltaY < 0;
          const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight && e.deltaY > 0;
          if (isAtTop || isAtBottom) {
            e.preventDefault();
          }
        }
      }
    }, { passive: false });

    
    
    // [Управление жизненным циклом фоновой музыки вынесено в music.js (Этап 3 модуляризации)]

    
function initGameApp() {

      syncBodyScrollLock();
      if (typeof initAccountsEvents === 'function') initAccountsEvents();

      // Проверка авторизации
      const currentId = getCurrentUserId();
      const db = getAccountsDB();
      const hasUser = currentId && db[currentId];

      if (hasUser) {
        loadUserData(currentId);
        if (typeof pullLatestCloudDataForCurrentUser === 'function') pullLatestCloudDataForCurrentUser(false);
        closeAuthModal();
      } else {
        openAuthModal();
      }

      const savedFont = localStorage.getItem('siteSelectedFont') || 'font-default';
      applySiteFont(savedFont);

      if (!achState.testedFonts.includes(savedFont)) {
        achState.testedFonts.push(savedFont);
        saveAchState();
      }

      const savedSiteBg = localStorage.getItem('sitePhotoBg');
      if (savedSiteBg) {
        document.body.style.backgroundImage = `url(${savedSiteBg})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
      }
      const savedTabBg = localStorage.getItem('tabCustomPhoto');
      if (savedTabBg) applyTabPhoto(savedTabBg);

      updateTabModeUI('tanjiro', tabModes.tanjiro);
      updateTabModeUI('jenna', tabModes.jenna);
      updateTabModeUI('custom', tabModes.custom);

      initCustomDataFromActivePacks();
      updateAchievementsUI();
      applyAllActiveEffects();
      updateVolumeUI();
      soundManager.initBgMusic();
      updateUserProfileUI();
      updateTanjiroClickCounter(achState.tanjiroClicks || 0);

      // Скрытие начального экрана загрузки (Splash Screen)
      const appLoader = document.getElementById('siteAppLoader');
      if (appLoader) {
        appLoader.classList.add('opacity-0');
        setTimeout(() => { if (appLoader.parentNode) appLoader.remove(); }, 350);
      }
    
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGameApp);
} else {
  initGameApp();
}


// ===============================================================================
// ГЛОБАЛЬНЫЙ ЭКСПОРТ В WINDOW И MODULE.EXPORTS
// ===============================================================================

if (typeof window !== 'undefined') {
  // Функции рандома и колеса
  window.resetCustomExclusionPools = resetCustomExclusionPools;
  window.getCustomNameIndex = getCustomNameIndex;
  window.getCustomRoleIndex = getCustomRoleIndex;
  window.updateResetPacksButtonVisibility = updateResetPacksButtonVisibility;
  window.getUniqueRandomIndex = getUniqueRandomIndex;
  window.showWheelComboBadge = showWheelComboBadge;
  window.hideWheelComboBadge = hideWheelComboBadge;
  window.wheelColors = wheelColors;

  // Шрифты
  window.toggleFontDropdown = toggleFontDropdown;
  window.applySiteFont = applySiteFont;

  // Паки
  window.savePacksToStorage = savePacksToStorage;
  window.openDeleteConfirm = openDeleteConfirm;
  window.closeDeleteConfirm = closeDeleteConfirm;
  window.syncPackFormVisibility = syncPackFormVisibility;
  window.resetPackForm = resetPackForm;
  window.renderPacksList = renderPacksList;
  window.openPacksModal = openPacksModal;
  window.closePacksModal = closePacksModal;

  // Вкладки и режимы
  window.updateAdaptiveCardHeight = updateAdaptiveCardHeight;
  window.updateTabModeUI = updateTabModeUI;
  window.switchToTab = switchToTab;

  // Танджиро
  window.triggerTanjiroResult = triggerTanjiroResult;
  window.updateTanjiroClickCounter = updateTanjiroClickCounter;
  window.renderOdometer = renderOdometer;
  window.stopTanjiroAutoSpin = stopTanjiroAutoSpin;
  window.runTanjiroAutoSpinStep = runTanjiroAutoSpinStep;
  window.toggleTanjiroAutoSpin = toggleTanjiroAutoSpin;

  // Дженна
  window.stopWhoAutoSpin = stopWhoAutoSpin;
  window.runWhoAutoSpinStep = runWhoAutoSpinStep;
  window.toggleWhoAutoSpin = toggleWhoAutoSpin;
  window.closeWho = closeWho;
  window.stopMembersAutoSpin = stopMembersAutoSpin;
  window.runMembersAutoSpinStep = runMembersAutoSpinStep;
  window.toggleMembersAutoSpin = toggleMembersAutoSpin;
  window.closeMembers = closeMembers;

  // Кастом
  window.resetCustomWheelFlow = resetCustomWheelFlow;
  window.getAvailableCustomNames = getAvailableCustomNames;
  window.getAvailableCustomRoles = getAvailableCustomRoles;
  window.consumeCustomName = consumeCustomName;
  window.consumeCustomRole = consumeCustomRole;
  window.pickCustomNameIndex = pickCustomNameIndex;
  window.pickCustomRoleIndex = pickCustomRoleIndex;
  window.initCustomDataFromActivePacks = initCustomDataFromActivePacks;
  window.openCustomModal = openCustomModal;
  window.closeCustomModal = closeCustomModal;
  window.stopCustomAutoSpin = stopCustomAutoSpin;
  window.startCustomCooldown = startCustomCooldown;
  window.runCustomAutoSpinStep = runCustomAutoSpinStep;
  window.toggleCustomAutoSpin = toggleCustomAutoSpin;

  // UI, фоны, скролл
  window.applyTabPhoto = applyTabPhoto;
  window.isAnyModalOpen = isAnyModalOpen;
  window.syncBodyScrollLock = syncBodyScrollLock;
  if (typeof initGameApp === 'function') window.initGameApp = initGameApp;

  // Двусторонняя реактивная привязка переменных состояния
  Object.defineProperty(window, 'tabModes', {
    get: () => tabModes,
    set: (val) => { if (val && typeof val === 'object') Object.assign(tabModes, val); },
    configurable: true
  });

  window.addEventListener('languageChanged', () => {
    const curAnswers = (typeof window.i18n !== 'undefined' && window.i18n.getAnswers)
      ? window.i18n.getAnswers()
      : ["Натурал на 100%!", "Не по девочкам...", "Универсал!", "Тайный матвейка!", "Лесбиянка!"];
    if (typeof tanjiroWheel !== 'undefined' && tanjiroWheel) {
      tanjiroWheel.setItems(curAnswers);
      if (tabModes.tanjiro === 'wheel') tanjiroWheel.draw();
    }

    const curWhoRoles = (typeof window.i18n !== 'undefined' && window.i18n.getWhoRoles)
      ? window.i18n.getWhoRoles()
      : ["Изгой", "Никто", "Нн какой-то", "Легенда чата", "Владелец", "Помощник владельца", "Раб Эбардо"];
    if (typeof whoWheel !== 'undefined' && whoWheel) {
      whoWheel.setItems(curWhoRoles);
      if (tabModes.jenna === 'wheel') whoWheel.draw();
    }

    if (typeof membersWheel !== 'undefined' && membersWheel && typeof getJennaMembers === 'function') {
      membersWheel.setItems(getJennaMembers());
      if (tabModes.jenna === 'wheel') membersWheel.draw();
    }

    const whoInd = document.getElementById('whoModeIndicator');
    const memInd = document.getElementById('membersModeIndicator');
    const isJennaWheel = tabModes.jenna === 'wheel';
    const modeText = isJennaWheel
      ? (typeof window.t === 'function' ? window.t('mode_wheel', 'Колесо') : 'Колесо')
      : (typeof window.t === 'function' ? window.t('mode_button', 'Кнопка') : 'Кнопка');
    const prefixText = (typeof window.t === 'function' ? window.t('jenna_mode_prefix', 'Режим: ') : 'Режим: ');
    if (whoInd) whoInd.textContent = prefixText + modeText;
    if (memInd) memInd.textContent = prefixText + modeText;

    if (customStage === 1 && customStageBadge) {
      customStageBadge.textContent = (typeof window.t === 'function') ? window.t('custom_stage_1', 'Этап 1: Выбираем человека') : 'Этап 1: Выбираем человека';
    }
  });

  Object.defineProperty(window, 'userPacks', {
    get: () => userPacks,
    set: (val) => { userPacks = val; },
    configurable: true
  });

  Object.defineProperty(window, 'customData', {
    get: () => customData,
    set: (val) => { customData = val; },
    configurable: true
  });

  Object.defineProperty(window, 'activeTab', {
    get: () => (typeof tabs !== 'undefined' && tabs[currentTabIndex]) || 'tanjiro',
    set: (val) => { if (typeof switchToTab === 'function') switchToTab(val); },
    configurable: true
  });

  Object.defineProperty(window, 'clickCount', {
    get: () => clickCount,
    set: (val) => {
      clickCount = val;
      if (typeof updateTanjiroClickCounter === 'function') {
        updateTanjiroClickCounter(val);
      }
    },
    configurable: true
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    resetCustomExclusionPools,
    getAvailableCustomNames,
    getAvailableCustomRoles,
    consumeCustomName,
    consumeCustomRole,
    pickCustomNameIndex,
    pickCustomRoleIndex,
    getCustomNameIndex,
    getCustomRoleIndex,
    updateResetPacksButtonVisibility,
    getUniqueRandomIndex,
    showWheelComboBadge,
    hideWheelComboBadge,
    wheelColors,
    toggleFontDropdown,
    applySiteFont,
    savePacksToStorage,
    openDeleteConfirm,
    closeDeleteConfirm,
    syncPackFormVisibility,
    resetPackForm,
    renderPacksList,
    openPacksModal,
    closePacksModal,
    updateAdaptiveCardHeight,
    updateTabModeUI,
    switchToTab,
    triggerTanjiroResult,
    stopTanjiroAutoSpin,
    runTanjiroAutoSpinStep,
    toggleTanjiroAutoSpin,
    stopWhoAutoSpin,
    runWhoAutoSpinStep,
    toggleWhoAutoSpin,
    closeWho,
    stopMembersAutoSpin,
    runMembersAutoSpinStep,
    toggleMembersAutoSpin,
    closeMembers,
    resetCustomWheelFlow,
    initCustomDataFromActivePacks,
    openCustomModal,
    closeCustomModal,
    stopCustomAutoSpin,
    startCustomCooldown,
    runCustomAutoSpinStep,
    toggleCustomAutoSpin,
    applyTabPhoto,
    isAnyModalOpen,
    syncBodyScrollLock
  };
}
