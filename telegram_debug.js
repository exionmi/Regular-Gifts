/**
 * Скрипт для диагностики проблем с Telegram WebApp
 * Добавьте этот скрипт в index.html для отладки
 */

// Добавляем в DOM элемент, который отображает текущий статус инициализации
function createDebugPanel() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'telegram-debug-panel';
    debugPanel.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        max-height: 30vh;
        overflow-y: auto;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        background: red;
        color: white;
        border: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        cursor: pointer;
    `;
    closeButton.onclick = () => {
        debugPanel.style.display = 'none';
    };
    
    debugPanel.appendChild(closeButton);
    document.body.appendChild(debugPanel);
    
    return debugPanel;
}

// Функция для логирования в панель отладки
function debugLog(message) {
    const panel = document.getElementById('telegram-debug-panel') || createDebugPanel();
    const logItem = document.createElement('div');
    logItem.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    panel.appendChild(logItem);
    panel.scrollTop = panel.scrollHeight;
    
    // Дублируем в консоль
    console.log(`[TG DEBUG] ${message}`);
}

// Функция для проверки доступности Telegram WebApp
function checkTelegramWebApp() {
    console.log('Проверка Telegram WebApp...');
    
    if (!window.Telegram) {
        console.error('window.Telegram отсутствует!');
        console.error('Возможно, вы открыли страницу напрямую в браузере, а не через Telegram');
        return false;
    }
    
    console.log('window.Telegram доступен');
    
    if (!window.Telegram.WebApp) {
        console.error('window.Telegram.WebApp отсутствует!');
        return false;
    }
    
    console.log('window.Telegram.WebApp доступен');
    
    const tg = window.Telegram.WebApp;
    
    // Отладочная информация об initData
    console.log('tg.initData доступен:', !!tg.initData);
    console.log('Длина tg.initData:', tg.initData ? tg.initData.length : 0);
    if (tg.initData && tg.initData.length > 0) {
        console.log('Начало tg.initData:', tg.initData.substring(0, 50) + '...');
    }
    
    // Проверяем доступность данных пользователя
    console.log('tg.initDataUnsafe доступен:', !!tg.initDataUnsafe);
    console.log('tg.initDataUnsafe.user доступен:', !!(tg.initDataUnsafe && tg.initDataUnsafe.user));
    
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        console.log('ID пользователя:', user.id);
        console.log('Имя пользователя:', user.first_name + (user.last_name ? ' ' + user.last_name : ''));
        console.log('Username:', user.username || 'не указан');
    }
    
    return true;
}

// Вызываем функцию проверки с задержкой после загрузки документа
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(checkTelegramWebApp, 1000);
});
