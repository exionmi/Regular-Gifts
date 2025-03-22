// Функция для попытки получения профиля через API бота
function tryToGetProfileFromBotAPI() {
    const tg = window.Telegram.WebApp;
    
    // Если нет доступа к Telegram WebApp, не делаем запрос
    if (!tg || !tg.initData) {
        console.error("Telegram WebApp не доступен");
        return;
    }
    
    console.log("Пытаемся получить профиль с initData");
    
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
        if (!response.ok) {
            throw new Error(`HTTP ошибка: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Данные профиля от API бота:", data);
        
        // Обновляем данные пользователя
        if (data.telegram) {
            if (data.telegram.id) {
                userData.id = data.telegram.id;
            }
            
            if (data.telegram.first_name) {
                userData.name = data.telegram.first_name + 
                    (data.telegram.last_name ? ' ' + data.telegram.last_name : '');
            }
            
            if (data.telegram.username) {
                userData.username = data.telegram.username;
            }
            
            if (data.telegram.photo_url) {
                const avatar = document.getElementById('user-avatar');
                if (avatar) {
                    avatar.src = data.telegram.photo_url;
                    console.log("Установлен аватар из API бота:", data.telegram.photo_url);
                }
            }
            
            // Обновляем UI
            updateProfileUI();
        }
        
        // Если пришли данные приложения, обновляем баланс и призы
        if (data.app_data) {
            userData.balance = data.app_data.balance;
            
            if (Array.isArray(data.app_data.prizes)) {
                userData.prizes = data.app_data.prizes;
            }
            
            // Обновляем UI
            updateProfileUI();
        }
    })
    .catch(error => {
        console.error("Ошибка при получении профиля через API бота:", error);
    });
}

// Функция для отдельного запроса аватара - улучшенная версия
function tryGetAvatarSeparately() {
    const tg = window.Telegram.WebApp;
    
    if (!tg || !tg.initData) {
        console.warn("Невозможно получить аватар: initData недоступен");
        return;
    }
    
    console.log("Пытаемся получить аватар отдельным запросом...");
    
    fetch('/api/telegram/get-avatar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            init_data: tg.initData
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Ответ API аватара:", data);
        
        if (data.photo_url) {
            const avatarElement = document.getElementById('user-avatar');
            if (avatarElement) {
                avatarElement.src = data.photo_url;
                avatarElement.onerror = function() {
                    console.warn("Ошибка загрузки аватара, создаем placeholder");
                    createInitialsAvatar(document.querySelector('.avatar-container'));
                };
                console.log("Установлен аватар из отдельного запроса:", data.photo_url);
            }
        } else {
            // Если нет аватара, создаем placeholder
            createInitialsAvatar(document.querySelector('.avatar-container'));
        }
    })
    .catch(error => {
        console.error("Ошибка при получении аватара:", error);
        createInitialsAvatar(document.querySelector('.avatar-container'));
    });
}
