// ===============================================================
// NANJICORE: BACKUP CRYPTOGRAPHY & SECURE EXPORT/IMPORT MODULE
// Модуль шифрования бэкапов (PBKDF2 + AES-GCM-256)
// Вынесен на Этапе 5.2 модуляризации
// ===============================================================

/**
 * Асинхронное шифрование полезной нагрузки бэкапа по алгоритму PBKDF2 + AES-GCM-256
 * @param {string} plaintext - Исходная строка JSON
 * @param {string} password - Пароль для шифрования
 * @returns {Promise<Object>} Зашифрованный объект формата nanj_secure_backup_v1
 */
async function encryptBackupPayload(plaintext, password) {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API не поддерживается вашим браузером');
  }
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const pwKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    pwKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    aesKey,
    enc.encode(plaintext)
  );

  const bufferToBase64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));

  return {
    format: "nanj_secure_backup_v1",
    version: 1,
    exportDate: new Date().toISOString(),
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    data: bufferToBase64(ciphertext)
  };
}

/**
 * Асинхронная расшифровка полезной нагрузки бэкапа по алгоритму PBKDF2 + AES-GCM-256
 * @param {Object} encryptedPayload - Зашифрованный объект формата nanj_secure_backup_v1
 * @param {string} password - Пароль для расшифровки
 * @returns {Promise<string>} Исходная строка JSON
 */
async function decryptBackupPayload(encryptedPayload, password) {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API не поддерживается вашим браузером');
  }
  const base64ToBuffer = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const salt = base64ToBuffer(encryptedPayload.salt);
  const iv = base64ToBuffer(encryptedPayload.iv);
  const ciphertext = base64ToBuffer(encryptedPayload.data);

  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const pwKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    pwKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const decryptedBuf = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    aesKey,
    ciphertext
  );

  return dec.decode(decryptedBuf);
}

// ═══════════════════════════════════════════════════════════════
// МОДАЛЬНЫЕ ОКНА: ЗАЩИТА БЭКАПОВ (ЭКСПОРТ/ИМПОРТ)
// ═══════════════════════════════════════════════════════════════

let pendingExportPayload = null;

function openExportPasswordModal(payload) {
  pendingExportPayload = payload;
  const modal = document.getElementById('exportPasswordModal');
  const alertEl = document.getElementById('exportPasswordAlert');
  const pwdInput = document.getElementById('exportPasswordInput');
  const pwdConfirm = document.getElementById('exportPasswordConfirmInput');

  if (pwdInput) pwdInput.value = '';
  if (pwdConfirm) pwdConfirm.value = '';
  if (alertEl) alertEl.classList.add('hidden');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (pwdInput) setTimeout(() => pwdInput.focus(), 150);
  }
}

function closeExportPasswordModal() {
  const modal = document.getElementById('exportPasswordModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  pendingExportPayload = null;
}

async function handleExportWithPassword() {
  const pwdInput = document.getElementById('exportPasswordInput');
  const pwdConfirm = document.getElementById('exportPasswordConfirmInput');
  const alertEl = document.getElementById('exportPasswordAlert');
  const submitBtn = document.getElementById('submitExportPasswordBtn');

  const pwd = (pwdInput?.value || '').trim();
  const confirm = (pwdConfirm?.value || '').trim();

  if (!pwd || pwd.length < 4) {
    if (alertEl) {
      alertEl.textContent = typeof window.t === 'function' ? window.t('backup_err_pwd_short') : 'Пароль для защиты файла должен содержать минимум 4 символа!';
      alertEl.classList.remove('hidden');
    }
    return;
  }

  if (pwd !== confirm) {
    if (alertEl) {
      alertEl.textContent = typeof window.t === 'function' ? window.t('backup_err_pwd_mismatch') : 'Пароли не совпадают!';
      alertEl.classList.remove('hidden');
    }
    return;
  }

  if (!pendingExportPayload) {
    closeExportPasswordModal();
    return;
  }

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = typeof window.t === 'function' ? window.t('backup_status_encrypting') : 'Шифрование...';
    }

    const jsonPlaintext = JSON.stringify(pendingExportPayload, null, 2);
    const encryptedObject = await encryptBackupPayload(jsonPlaintext, pwd);
    encryptedObject.username = pendingExportPayload.username || 'player';

    const safeName = (pendingExportPayload.username || 'player').replace(/[^a-zA-Z0-9а-яА-ЯёЁ_-]/g, '_');
    const fileName = `profile_${safeName}_secure_backup.json`;
    const encryptedStr = JSON.stringify(encryptedObject, null, 2);

    const blob = new Blob([encryptedStr], { type: 'application/json;charset=utf-8' });
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    
    let fileObj = null;
    try {
      fileObj = new File([blob], fileName, { type: 'application/json', lastModified: Date.now() });
    } catch(e) {
      fileObj = blob;
    }

    closeExportPasswordModal();

    if (isMobile && navigator.canShare && fileObj instanceof File && navigator.canShare({ files: [fileObj] })) {
      try {
        await navigator.share({
          files: [fileObj],
          title: `Защищённый бэкап ${pendingExportPayload.username}`,
          text: `Защищённый паролем бэкап профиля «${pendingExportPayload.username}»`
        });
        const toastFn = typeof showSiteToast === 'function' ? showSiteToast : window.showSiteToast;
        if (toastFn) {
          toastFn(`Файл «${fileName}» передан в системное меню!`, 'success', 'Экспорт завершён');
        }
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }

    const blobUrl = URL.createObjectURL(blob);
    const dlAnchor = document.createElement('a');
    dlAnchor.href = blobUrl;
    dlAnchor.download = fileName;
    dlAnchor.rel = 'noopener';
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    setTimeout(() => {
      document.body.removeChild(dlAnchor);
      URL.revokeObjectURL(blobUrl);
    }, 200);

    const toastFn = typeof showSiteToast === 'function' ? showSiteToast : window.showSiteToast;
    if (toastFn) {
      toastFn(`Файл «${fileName}» успешно зашифрован и сохранён!`, 'success', 'Экспорт завершён');
    }
  } catch (err) {
    console.error('Export encryption error:', err);
    if (alertEl) {
      alertEl.textContent = (typeof window.t === 'function' ? window.t('backup_err_crypto') : 'Ошибка шифрования: ') + (err.message || 'Сбой криптографии');
      alertEl.classList.remove('hidden');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = typeof window.t === 'function' ? window.t('backup_export_btn_submit') : 'Зашифровать и скачать';
    }
  }
}

let pendingImportEncryptedObject = null;
let pendingImportFileName = '';

function openImportPasswordModal(encryptedObj, fileName) {
  pendingImportEncryptedObject = encryptedObj;
  pendingImportFileName = fileName;
  const modal = document.getElementById('importPasswordModal');
  const alertEl = document.getElementById('importPasswordAlert');
  const pwdInput = document.getElementById('importPasswordInput');
  const userSpan = document.getElementById('importPasswordUsername');

  if (userSpan) userSpan.textContent = encryptedObj.username || (typeof window.t === 'function' ? window.t('profile_default_username') : 'Игрок');
  if (pwdInput) pwdInput.value = '';
  if (alertEl) alertEl.classList.add('hidden');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (pwdInput) setTimeout(() => pwdInput.focus(), 150);
  }
}

function closeImportPasswordModal() {
  const modal = document.getElementById('importPasswordModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  pendingImportEncryptedObject = null;
}

async function handleDecryptAndImport() {
  const pwdInput = document.getElementById('importPasswordInput');
  const alertEl = document.getElementById('importPasswordAlert');
  const submitBtn = document.getElementById('submitImportPasswordBtn');

  const pwd = (pwdInput?.value || '').trim();
  if (!pwd) {
    if (alertEl) {
      alertEl.textContent = typeof window.t === 'function' ? window.t('backup_err_enter_pwd') : 'Введите пароль от файла бэкапа!';
      alertEl.classList.remove('hidden');
    }
    return;
  }

  if (!pendingImportEncryptedObject) {
    closeImportPasswordModal();
    return;
  }

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = typeof window.t === 'function' ? window.t('backup_status_decrypting') : 'Расшифровка...';
    }

    const decryptedJsonStr = await decryptBackupPayload(pendingImportEncryptedObject, pwd);
    closeImportPasswordModal();
    const applyFn = window.applyImportedJsonString || (typeof applyImportedJsonString === 'function' ? applyImportedJsonString : null);
    if (typeof applyFn !== 'function') {
      throw new Error('Функция импорта недоступна. Пожалуйста, обновите страницу.');
    }
    const success = applyFn(decryptedJsonStr, pendingImportFileName || 'зашифрованный бэкап');
    if (!success) {
      throw new Error('Не удалось применить данные бэкапа');
    }
  } catch (err) {
    console.error('Decryption error:', err);
    if (alertEl) {
      alertEl.textContent = typeof window.t === 'function' ? window.t('backup_err_wrong_pwd') : 'Неверный пароль от файла бэкапа! Проверьте введённый пароль.';
      alertEl.classList.remove('hidden');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = typeof window.t === 'function' ? window.t('backup_import_btn_submit') : 'Расшифровать и применить';
    }
  }
}

// Слушатели событий клавиатуры и клика по подложке модалок
function initBackupCryptoListeners() {
  if (typeof document === 'undefined') return;

  const exportModal = document.getElementById('exportPasswordModal');
  if (exportModal) {
    exportModal.addEventListener('click', (e) => {
      if (e.target === exportModal) closeExportPasswordModal();
    });
  }

  const importModal = document.getElementById('importPasswordModal');
  if (importModal) {
    importModal.addEventListener('click', (e) => {
      if (e.target === importModal) closeImportPasswordModal();
    });
  }

  const exportPwdInput = document.getElementById('exportPasswordInput');
  const exportConfirmInput = document.getElementById('exportPasswordConfirmInput');
  const handleExportEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExportWithPassword();
    }
  };
  if (exportPwdInput) exportPwdInput.addEventListener('keydown', handleExportEnter);
  if (exportConfirmInput) exportConfirmInput.addEventListener('keydown', handleExportEnter);

  const importPwdInput = document.getElementById('importPasswordInput');
  if (importPwdInput) {
    importPwdInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleDecryptAndImport();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (exportModal && !exportModal.classList.contains('hidden')) {
        closeExportPasswordModal();
      }
      if (importModal && !importModal.classList.contains('hidden')) {
        closeImportPasswordModal();
      }
    }
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackupCryptoListeners);
  } else {
    initBackupCryptoListeners();
  }
}

// Явный экспорт в window для взаимодействия между скриптами
if (typeof window !== 'undefined') {
  window.encryptBackupPayload = encryptBackupPayload;
  window.decryptBackupPayload = decryptBackupPayload;
  window.openExportPasswordModal = openExportPasswordModal;
  window.closeExportPasswordModal = closeExportPasswordModal;
  window.handleExportWithPassword = handleExportWithPassword;
  window.openImportPasswordModal = openImportPasswordModal;
  window.closeImportPasswordModal = closeImportPasswordModal;
  window.handleDecryptAndImport = handleDecryptAndImport;
  window.initBackupCryptoListeners = initBackupCryptoListeners;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    encryptBackupPayload,
    decryptBackupPayload,
    openExportPasswordModal,
    closeExportPasswordModal,
    handleExportWithPassword,
    openImportPasswordModal,
    closeImportPasswordModal,
    handleDecryptAndImport,
    initBackupCryptoListeners
  };
}
