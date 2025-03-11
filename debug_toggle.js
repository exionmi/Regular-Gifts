// Небольшая кнопка для отладки без нарушения интерфейса

document.addEventListener('DOMContentLoaded', function() {
    // Создаем небольшую кнопку в углу
    const debugBtn = document.createElement('button');
    debugBtn.textContent = '?';
    debugBtn.style.position = 'fixed';
    debugBtn.style.bottom = '10px';
    debugBtn.style.right = '10px';
    debugBtn.style.width = '30px';
    debugBtn.style.height = '30px';
    debugBtn.style.borderRadius = '50%';
    debugBtn.style.border = 'none';
    debugBtn.style.backgroundColor = 'rgba(0,0,0,0.3)';
    debugBtn.style.color = 'white';
    debugBtn.style.fontSize = '16px';
    debugBtn.style.cursor = 'pointer';
    debugBtn.style.zIndex = '9999';
    
    document.body.appendChild(debugBtn);
    
    // Обработчик клика по кнопке
    debugBtn.addEventListener('click', function() {
        // Получаем данные из WebApp
        const tg = window.Telegram.WebApp;
        
        let debugInfo = '';
        
        if (tg && tg.initDataUnsafe) {
            if (tg.initDataUnsafe.user) {
                const user = tg.initDataUnsafe.user;
                debugInfo += `Имя: ${user.first_name || 'Н/Д'}\n`;
                debugInfo += `Фамилия: ${user.last_name || 'Н/Д'}\n`;
                debugInfo += `ID: ${user.id || 'Н/Д'}\n`;
                debugInfo += `Фото URL: ${user.photo_url || 'Нет'}\n`;
                debugInfo += `Имя пользователя: ${user.username || 'Н/Д'}\n`;
            } else {
                debugInfo += "Данные пользователя недоступны.\n";
            }
        } else {
            debugInfo += "WebApp данные недоступны.";
        }
        
        // Показываем данные в alert
        tg.showAlert(debugInfo);
    });
});
