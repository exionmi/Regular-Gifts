// Отладочный скрипт для проверки доступа к данным Telegram WebApp

// Функция для проверки доступа к данным Telegram
function checkTelegramWebAppData() {
    const debugInfo = document.createElement('div');
    debugInfo.style.padding = '10px';
    debugInfo.style.margin = '10px';
    debugInfo.style.border = '1px solid #ccc';
    debugInfo.style.borderRadius = '5px';
    debugInfo.style.backgroundColor = '#f9f9f9';
    debugInfo.style.display = 'none';
    debugInfo.id = 'debug-info';
    
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Показать отладочную информацию';
    toggleButton.style.padding = '5px 10px';
    toggleButton.style.margin = '10px';
    toggleButton.style.cursor = 'pointer';
    
    toggleButton.onclick = function() {
        const info = document.getElementById('debug-info');
        if (info.style.display === 'none') {
            info.style.display = 'block';
            this.textContent = 'Скрыть отладочную информацию';
        } else {
            info.style.display = 'none';
            this.textContent = 'Показать отладочную информацию';
        }
    };
    
    document.body.appendChild(toggleButton);
    document.body.appendChild(debugInfo);
    
    try {
        const tg = window.Telegram.WebApp;
        
        let html = '<h3>Telegram WebApp Debug Info</h3>';
        
        html += '<p><strong>WebApp инициализирован:</strong> ' + (tg ? 'Да' : 'Нет') + '</p>';
        
        if (tg) {
            html += '<p><strong>initDataUnsafe доступен:</strong> ' + (tg.initDataUnsafe ? 'Да' : 'Нет') + '</p>';
            
            if (tg.initDataUnsafe) {
                html += '<p><strong>user доступен:</strong> ' + (tg.initDataUnsafe.user ? 'Да' : 'Нет') + '</p>';
                
                if (tg.initDataUnsafe.user) {
                    const user = tg.initDataUnsafe.user;
                    html += '<p><strong>ID пользователя:</strong> ' + user.id + '</p>';
                    html += '<p><strong>Имя пользователя:</strong> ' + user.first_name + '</p>';
                    html += '<p><strong>Фамилия:</strong> ' + (user.last_name || 'Не указана') + '</p>';
                    html += '<p><strong>Никнейм:</strong> ' + (user.username || 'Не указан') + '</p>';
                    html += '<p><strong>Язык:</strong> ' + (user.language_code || 'Не указан') + '</p>';
                    html += '<p><strong>Ссылка на аватар:</strong> ' + (user.photo_url || 'Не доступна') + '</p>';
                    
                    if (user.photo_url) {
                        html += '<p><img src="' + user.photo_url + '" alt="User Avatar" style="width: 100px; height: 100px; border-radius: 50%;"></p>';
                    }
                } else {
                    html += '<p>Данные пользователя не доступны</p>';
                }
                
                html += '<p><strong>startParam:</strong> ' + (tg.initDataUnsafe.start_param || 'Не указан') + '</p>';
                html += '<p><strong>authDate:</strong> ' + (tg.initDataUnsafe.auth_date || 'Не указан') + '</p>';
                html += '<p><strong>hash:</strong> ' + (tg.initDataUnsafe.hash || 'Не указан') + '</p>';
            } else {
                html += '<p>initDataUnsafe не содержит данных</p>';
            }
            
            html += '<p><strong>Colorscheme:</strong> ' + tg.colorScheme + '</p>';
            html += '<p><strong>themeParams доступны:</strong> ' + (tg.themeParams ? 'Да' : 'Нет') + '</p>';
            
            if (tg.themeParams) {
                html += '<p><strong>Цвет фона:</strong> ' + tg.themeParams.bg_color + '</p>';
                html += '<p><strong>Основной текст:</strong> ' + tg.themeParams.text_color + '</p>';
                html += '<p><strong>Hint текст:</strong> ' + tg.themeParams.hint_color + '</p>';
                html += '<p><strong>Цвет ссылок:</strong> ' + tg.themeParams.link_color + '</p>';
                html += '<p><strong>Цвет кнопки:</strong> ' + tg.themeParams.button_color + '</p>';
                html += '<p><strong>Текст кнопки:</strong> ' + tg.themeParams.button_text_color + '</p>';
            }
        } else {
            html += '<p>Telegram WebApp не обнаружен. Возможно, страница открыта не в Telegram.</p>';
        }
        
        debugInfo.innerHTML = html;
    } catch (e) {
        debugInfo.innerHTML = '<p>Произошла ошибка при получении данных: ' + e.message + '</p>';
    }
}

// Запускаем проверку после загрузки страницы
document.addEventListener('DOMContentLoaded', checkTelegramWebAppData);
