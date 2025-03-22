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
    debugLog('🔍 Проверка Telegram WebApp...');
    
    // Проверяем наличие объекта window.Telegram
    if (!window.Telegram) {
        debugLog('❌ window.Telegram отсутствует!');
        debugLog('❗ Возможно, вы открыли страницу напрямую в браузере, а не через Telegram');
        return false;
    }
    
    debugLog('✅ window.Telegram доступен');
    
    // Проверяем наличие window.Telegram.WebApp
    if (!window.Telegram.WebApp) {
        debugLog('❌ window.Telegram.WebApp отсутствует!');
        return false;
    }
    
    debugLog('✅ window.Telegram.WebApp доступен');
    
    const tg = window.Telegram.WebApp;
    
    // Проверяем доступность initData
    if (!tg.initData) {
        debugLog('❌ tg.initData отсутствует!');
        return false;
    }
    
    if (tg.initData.length < 10) {
        debugLog(`❌ tg.initData слишком короткий: "${tg.initData}"`);
        return false;
    }
    
    debugLog(`✅ tg.initData доступен (${tg.initData.length} символов)`);
    debugLog(`📝 Начало initData: ${tg.initData.substring(0, 50)}...`);
    
    // Проверяем доступность данных пользователя
    if (!tg.initDataUnsafe) {
        debugLog('❌ tg.initDataUnsafe отсутствует!');
        return false;
    }
    
    debugLog('✅ tg.initDataUnsafe доступен');
    
    if (!tg.initDataUnsafe.user) {
        debugLog('❌ tg.initDataUnsafe.user отсутствует!');
        return false;
    }
    
    debugLog('✅ tg.initDataUnsafe.user доступен');
    
    // Выводим данные пользователя
    const user = tg.initDataUnsafe.user;
    debugLog(`👤 ID пользователя: ${user.id}`);
    debugLog(`👤 Имя: ${user.first_name} ${user.last_name || ''}`);
    debugLog(`👤 Username: ${user.username || 'не указан'}`);
    
    return true;
}

// Запускаем проверку после загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        debugLog('🚀 Начало диагностики Telegram WebApp');
        const isWebAppOk = checkTelegramWebApp();
        
        if (isWebAppOk) {
            debugLog('✅ Telegram WebApp работает корректно');
            
            // Проверяем запрос к API
            debugLog('🔄 Проверка API запроса...');
            const tg = window.Telegram.WebApp;
            
            fetch('/api/telegram/get-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    init_data: tg.initData
                })
            })
            .then(response => {
                debugLog(`📤 Статус ответа API: ${response.status}`);
                return response.json();
            })
            .then(data => {
                debugLog('📥 Получен ответ API:');
                if (data.telegram && data.telegram.id) {
                    debugLog(`✅ Данные пользователя получены: ID=${data.telegram.id}`);
                } else if (data.telegram && data.telegram.error) {
                    debugLog(`❌ Ошибка в данных: ${data.telegram.error}`);
                } else {
                    debugLog('❌ Структура данных не соответствует ожидаемой');
                }
            })
            .catch(error => {
                debugLog(`❌ Ошибка запроса API: ${error.message}`);
            });
        } else {
            debugLog('❌ Проблемы с инициализацией Telegram WebApp');
            debugLog('❗ Возможные решения:');
            debugLog('1. Убедитесь, что вы открыли приложение через Telegram');
            debugLog('2. Проверьте, что веб-приложение корректно добавлено в бота');
            debugLog('3. Иногда помогает перезапуск Telegram');
        }
    }, 1000); // Небольшая задержка для гарантии загрузки Telegram WebApp
});
