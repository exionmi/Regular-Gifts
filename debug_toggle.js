// Обновленный отладочный скрипт для проверки получения данных из Telegram

document.addEventListener('DOMContentLoaded', function() {
    // Создаем кнопку отладки
    const btn = document.createElement('button');
    btn.textContent = '🛠️';
    btn.style.position = 'fixed';
    btn.style.bottom = '10px';
    btn.style.right = '10px';
    btn.style.width = '40px';
    btn.style.height = '40px';
    btn.style.borderRadius = '50%';
    btn.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    btn.style.color = 'white';
    btn.style.fontSize = '20px';
    btn.style.border = 'none';
    btn.style.zIndex = '9999';
    btn.style.cursor = 'pointer';
    
    document.body.appendChild(btn);
    
    // Обработчик нажатия на кнопку
    btn.addEventListener('click', function() {
        const tg = window.Telegram.WebApp;
        
        let debugInfo = '';
        
        try {
            // Проверяем доступность Telegram WebApp
            debugInfo += `Telegram WebApp доступен: ${!!tg}\n\n`;
            
            // Проверяем данные пользователя
            if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
                const user = tg.initDataUnsafe.user;
                debugInfo += `ID: ${user.id || 'н/д'}\n`;
                debugInfo += `Имя: ${user.first_name || 'н/д'}\n`;
                debugInfo += `Фамилия: ${user.last_name || 'н/д'}\n`;
                debugInfo += `Username: ${user.username || 'н/д'}\n`;
                debugInfo += `Фото URL: ${user.photo_url || 'недоступно'}\n\n`;
            } else {
                debugInfo += "Данные пользователя недоступны\n\n";
            }
            
            // Проверяем локальные данные
            debugInfo += `Локальное имя: ${userData.name}\n`;
            debugInfo += `Локальный баланс: ${userData.balance}\n`;
            debugInfo += `Количество призов: ${userData.prizes.length}\n\n`;
            
            // Проверяем параметры запуска
            if (tg.initDataUnsafe.start_param) {
                debugInfo += `Start Parameter: ${tg.initDataUnsafe.start_param}\n`;
            }
            
            // Информация о версии и платформе
            debugInfo += `Версия WebApp: ${tg.version}\n`;
            debugInfo += `Платформа: ${tg.platform}\n`;
            debugInfo += `Тема: ${tg.colorScheme}\n`;
            
        } catch (error) {
            debugInfo = `Ошибка при получении отладочной информации: ${error.message}`;
        }
        
        // Выводим информацию
        if (tg.showAlert) {
            tg.showAlert(debugInfo);
        } else {
            alert(debugInfo);
        }
    });
});
