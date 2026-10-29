/**
 * ПОЛИНА — ПЕРСОНАЛЬНЫЕ ТРЕНИРОВКИ
 * Core Client Script: Telegram API + Yandex Metrika Goals + Form CRO
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. КОНФИГУРАЦИЯ И ЗАГЛУШКИ (CONFIG & STUBS)
     Заполните эти параметры перед релизом в продакшн!
     ========================================================================== */
  const CONFIG = {
    // Токен вашего Telegram бота (от @BotFather)
    TELEGRAM_BOT_TOKEN: 'YOUR_BOT_TOKEN_HERE',
    
    // ID вашего личного чата или группы (куда слать заявки)
    TELEGRAM_CHAT_ID: 'YOUR_CHAT_ID_HERE',

    // Номер счетчика Яндекс.Метрики
    YANDEX_METRIKA_ID: window.YM_ID || 0,

    // Ссылка на личный Telegram для кнопок связи
    TELEGRAM_DIRECT_LINK: 'https://t.me/your_telegram_username'
  };

  // Флаг mock-режима: если токен не заполнен или тестовый, работаем в демо-режиме
  const isMockTelegram = !CONFIG.TELEGRAM_BOT_TOKEN || 
                          CONFIG.TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' || 
                          CONFIG.TELEGRAM_BOT_TOKEN.trim() === '';

  /* ==========================================================================
     2. ВЕБ-АНАЛИТИКА (ЯНДЕКС.МЕТРИКА)
     Цели: telegram_button_click, lead_form_submit
     ========================================================================== */
  function reachGoal(goalName, params = {}) {
    console.info(`[Analytics Event] Цель отправлена: ${goalName}`, params);

    if (window.ym && typeof window.ym === 'function' && CONFIG.YANDEX_METRIKA_ID > 0) {
      try {
        window.ym(CONFIG.YANDEX_METRIKA_ID, 'reachGoal', goalName, params);
      } catch (err) {
        console.warn('[Analytics Error]', err);
      }
    }
  }

  // Навешиваем слушатели на все кнопки перехода в Telegram
  document.querySelectorAll('[data-analytics="telegram_button_click"]').forEach(element => {
    element.addEventListener('click', () => {
      reachGoal('telegram_button_click', {
        placement: element.getAttribute('aria-label') || element.innerText.trim() || 'button'
      });
    });
  });

  /* ==========================================================================
     3. МОБИЛЬНОЕ МЕНЮ (DRAWER)
     ========================================================================== */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  function openDrawer() {
    mobileDrawer.classList.add('active');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('active');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  /* ==========================================================================
     4. ФОРМАТЫ И СИНХРОНИЗАЦИЯ ТАРИФОВ (CRO HELPER)
     Клик по кнопке тарифа авто-выбирает нужный пункт в форме
     ========================================================================== */
  const selectPlanBtns = document.querySelectorAll('.select-plan-btn');
  const serviceChips = document.querySelectorAll('.service-chip');

  selectPlanBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const planName = btn.getAttribute('data-plan') || '';
      
      // Определяем какой chip активировать
      let matchedValue = 'Онлайн-ведение';
      if (planName.includes('зале')) matchedValue = 'Тренировки в зале';
      if (planName.includes('Диагностика')) matchedValue = 'Диагностика';

      serviceChips.forEach(chip => {
        const radio = chip.querySelector('input');
        if (radio && radio.value === matchedValue) {
          radio.checked = true;
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });
    });
  });

  // Переключение стилей чипов при клике
  serviceChips.forEach(chip => {
    chip.addEventListener('click', () => {
      serviceChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const radio = chip.querySelector('input');
      if (radio) radio.checked = true;
    });
  });

  /* ==========================================================================
     5. МАСКА И ВАЛИДАЦИЯ ТЕЛЕФОНА (+7 ...)
     ========================================================================== */
  const phoneInput = document.getElementById('userPhone');
  const nameInput = document.getElementById('userName');
  const nameError = document.getElementById('nameError');
  const phoneError = document.getElementById('phoneError');

  if (phoneInput) {
    phoneInput.addEventListener('input', formatRussianPhone);
    phoneInput.addEventListener('blur', validatePhoneField);
  }

  if (nameInput) {
    nameInput.addEventListener('blur', validateNameField);
    nameInput.addEventListener('input', () => {
      if (nameInput.classList.contains('is-invalid')) validateNameField();
    });
  }

  function formatRussianPhone(e) {
    let input = e.target;
    let value = input.value.replace(/\D/g, '');
    
    // Если пользователь начал с 8 или 7, нормализуем к 7
    if (value.startsWith('8') || value.startsWith('7')) {
      value = '7' + value.substring(1);
    } else if (value.length > 0 && !value.startsWith('+')) {
      value = '7' + value;
    }

    let formatted = '';
    if (value.length > 0) {
      formatted = '+7 ';
      if (value.length > 1) {
        formatted += '(' + value.substring(1, 4);
      }
      if (value.length >= 5) {
        formatted += ') ' + value.substring(4, 7);
      }
      if (value.length >= 8) {
        formatted += '-' + value.substring(7, 9);
      }
      if (value.length >= 10) {
        formatted += '-' + value.substring(9, 11);
      }
    }
    input.value = formatted;
  }

  function validateNameField() {
    const val = nameInput.value.trim();
    if (!val || val.length < 2) {
      nameInput.classList.add('is-invalid');
      nameError.textContent = 'Пожалуйста, введите ваше имя (минимум 2 буквы)';
      return false;
    } else {
      nameInput.classList.remove('is-invalid');
      nameError.textContent = '';
      return true;
    }
  }

  function validatePhoneField() {
    const val = phoneInput.value.trim();
    // Проверка: либо заполненный телефон (18 символов: +7 (XXX) XXX-XX-XX), либо ник @username
    const isPhoneValid = val.length >= 17;
    const isTgNickValid = val.startsWith('@') && val.length >= 4;

    if (!isPhoneValid && !isTgNickValid) {
      phoneInput.classList.add('is-invalid');
      phoneError.textContent = 'Укажите номер телефона (+7) или @ник_в_телеграм';
      return false;
    } else {
      phoneInput.classList.remove('is-invalid');
      phoneError.textContent = '';
      return true;
    }
  }

  /* ==========================================================================
     6. ОБРАБОТКА И ОТПРАВКА ФОРМЫ (TELEGRAM INTEGRATION)
     ========================================================================== */
  const leadForm = document.getElementById('leadForm');
  const submitBtn = document.getElementById('submitBtn');
  const formStatusAlert = document.getElementById('formStatusAlert');

  // Извлечение UTM-меток из URL
  function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
      if (params.get(key)) utm[key] = params.get(key);
    });
    return Object.keys(utm).length ? utm : null;
  }

  if (leadForm) {
    leadForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const isNameOk = validateNameField();
      const isPhoneOk = validatePhoneField();

      if (!isNameOk || !isPhoneOk) {
        return;
      }

      // Собираем данные
      const selectedFormat = leadForm.querySelector('input[name="format"]:checked')?.value || 'Не выбран';
      const userName = nameInput.value.trim();
      const userContact = phoneInput.value.trim();
      const now = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
      const utms = getUTMParams();

      // UI: Включаем спиннер
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      formStatusAlert.style.display = 'none';

      // 1. Фиксация цели в Яндекс.Метрике
      reachGoal('lead_form_submit', {
        format: selectedFormat
      });

      // 2. Формирование сообщения для Telegram
      let messageHtml = `<b>🎯 Новая заявка с сайта!</b>\n\n`;
      messageHtml += `👤 <b>Имя:</b> ${escapeHtml(userName)}\n`;
      messageHtml += `📞 <b>Контакт:</b> ${escapeHtml(userContact)}\n`;
      messageHtml += `📋 <b>Формат:</b> ${escapeHtml(selectedFormat)}\n`;
      messageHtml += `⏱ <b>Время:</b> ${now} (МСК)\n`;

      if (utms) {
        messageHtml += `\n🏷 <b>Метки:</b>\n` + 
          Object.entries(utms).map(([k, v]) => `• ${k}: ${escapeHtml(v)}`).join('\n');
      }

      try {
        if (isMockTelegram) {
          // Имитируем небольшую сетевую задержку для MVP тестирования
          await new Promise(r => setTimeout(r, 650));
          console.info('[Telegram MOCK MODE]: Сообщение сформировано и готово к отправке:', {
            text: messageHtml,
            instructions: 'Чтобы получать заявки в реальный Telegram, укажите TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в main.js'
          });
        } else {
          // Реальная отправка в Telegram Bot API
          const tgUrl = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`;
          const response = await fetch(tgUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: CONFIG.TELEGRAM_CHAT_ID,
              parse_mode: 'HTML',
              text: messageHtml
            })
          });

          if (!response.ok) {
            throw new Error(`Telegram API Error: ${response.status}`);
          }
        }

        // Успех
        showFormAlert('success', 'Спасибо за заявку! Полина свяжется с вами в течение 30 минут.');
        leadForm.reset();
        serviceChips.forEach((chip, i) => {
          if (i === 0) {
            chip.classList.add('active');
            chip.querySelector('input').checked = true;
          } else {
            chip.classList.remove('active');
          }
        });

      } catch (error) {
        console.error('Ошибка при отправке заявки:', error);
        showFormAlert('error', 'Произошла ошибка при отправке. Пожалуйста, напишите Полине напрямую в Telegram.');
      } finally {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
      }
    });
  }

  function showFormAlert(type, text) {
    formStatusAlert.className = `form-status-alert ${type}`;
    formStatusAlert.textContent = text;
    formStatusAlert.style.display = 'block';
  }

  function escapeHtml(string) {
    return String(string).replace(/[&<>"']/g, function (s) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[s];
    });
  }

  /* ==========================================================================
     7. МОДАЛЬНОЕ ОКНО ПОЛИТИКИ КОНФИДЕНЦИАЛЬНОСТИ
     ========================================================================== */
  const policyModal = document.getElementById('policyModal');
  const policyOpenBtn = document.getElementById('policyOpenBtn');
  const policyCloseBtn = document.getElementById('policyCloseBtn');
  const policyConfirmBtn = document.getElementById('policyConfirmBtn');

  function openPolicy() {
    if (policyModal) {
      policyModal.classList.add('active');
      policyModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closePolicy() {
    if (policyModal) {
      policyModal.classList.remove('active');
      policyModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (policyOpenBtn) policyOpenBtn.addEventListener('click', openPolicy);
  if (policyCloseBtn) policyCloseBtn.addEventListener('click', closePolicy);
  if (policyConfirmBtn) policyConfirmBtn.addEventListener('click', closePolicy);
  if (policyModal) {
    policyModal.addEventListener('click', (e) => {
      if (e.target === policyModal) closePolicy();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && policyModal && policyModal.classList.contains('active')) {
      closePolicy();
    }
  });

  /* ==========================================================================
     8. СДЕЖАННАЯ АНИМАЦИЯ ПОЯВЛЕНИЯ (SCROLL REVEAL OBSERVER)
     Реализована через IntersectionObserver с уважением к prefers-reduced-motion
     ========================================================================== */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const revealTargets = document.querySelectorAll('.bento-card, .pricing-card, .faq-item, .contact-card');
    
    revealTargets.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)';
    });

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealTargets.forEach(el => observer.observe(el));
  }

})();

