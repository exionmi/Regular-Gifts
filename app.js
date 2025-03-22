// Глобальные переменные
let tg;
let initDataAvailable = false;

// Переменные для хранения данных пользователя
let userData = {
    id: null,
    name: "Гость",
    username: "NoUsername",
    balance: 0,
    prizes: [],
    photo_url: null
};

// Улучшенная инициализация Telegram WebApp
function initTelegramWebApp() {
    console.log("Инициализация Telegram WebApp...");
    
    try {
        // Получаем объект Telegram WebApp
        tg = window.Telegram.WebApp;
        
        if (!tg) {
            console.error("Telegram WebApp не доступен! Возможно, приложение открыто не в Telegram.");
            return false;
        }
        
        // Сообщаем Telegram, что приложение готово к работе
        tg.ready();
        console.log("Telegram WebApp готов к использованию");
        
        // Проверяем доступность initData после сигнала готовности
        if (tg.initData && tg.initData.length > 10) {
            console.log("initData доступен, длина:", tg.initData.length);
            console.log("Первые 50 символов:", tg.initData.substring(0, 50));
            initDataAvailable = true;
        } else {
            console.warn("initData недоступен или некорректен:", tg.initData);
            console.warn("Длина initData:", tg.initData ? tg.initData.length : 0);
        }
        
        // Только после инициализации получаем данные пользователя
        getUserDataFromTelegram();
        
        // Запрашиваем профиль через API только если initData доступен
        if (initDataAvailable) {
            tryToGetProfileFromBotAPI();
        } else {
            console.warn("Пропускаем запрос профиля из-за отсутствия initData");
        }
        
        // Расширяем окно WebApp
        tg.expand();
        
        return true;
    } catch (e) {
        console.error("Ошибка при инициализации Telegram WebApp:", e);
        return false;
    }
}

// Обработчик загрузки страницы
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM загружен, инициализация приложения...");
    
    // Создаем колесо и настраиваем UI
    createWheel();
    setupTabs();
    
    // Настраиваем кнопку вращения
    const spinButton = document.getElementById('spin-btn');
    if (spinButton) {
        spinButton.addEventListener('click', spinWheel);
    } else {
        console.error("Кнопка вращения не найдена в DOM");
    }
    
    // Инициализируем Telegram WebApp
    if (!initTelegramWebApp()) {
        console.warn("Запуск в автономном режиме без Telegram...");
        
        // Установка тестовых данных в автономном режиме
        userData = {
            id: 12345678,
            name: "Тестовый пользователь",
            username: "test_user",
            balance: 100,
            prizes: [
                {giftId: 1, giftName: "Тестовый подарок", value: 10, date: new Date().toISOString()}
            ]
        };
        
        // Обновляем UI с тестовыми данными
        updateProfileUI();
    }
});

// Функция для настройки переключения вкладок
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (!tabButtons.length || !tabContents.length) {
        console.error("Не найдены элементы вкладок в DOM");
        return;
    }
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Убираем класс active у всех кнопок и контента
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Добавляем класс active нужным элементам
            this.classList.add('active');
            document.getElementById(tabName + '-tab').classList.add('active');
            
            // Обновляем профиль при переключении на его вкладку
            if (tabName === 'profile') {
                updateProfileUI();
            }
        });
    });
}

// Функция для получения данных пользователя из Telegram
function getUserDataFromTelegram() {
    console.log("Получение данных пользователя из Telegram...");
    
    if (!tg || !tg.initDataUnsafe || !tg.initDataUnsafe.user) {
        console.warn("Данные пользователя из Telegram недоступны");
        return;
    }
    
    const user = tg.initDataUnsafe.user;
    
    userData.id = user.id;
    userData.name = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    userData.username = user.username || "NoUsername";
    
    // ИСПРАВЛЕНО: Сохраняем URL аватара из данных Telegram
    if (user.photo_url) {
        userData.photo_url = user.photo_url;
        console.log("Получен URL аватара из Telegram:", userData.photo_url);
    }
    
    // Обновляем интерфейс
    updateProfileUI();
    
    // Если у пользователя есть ID, запрашиваем дополнительные данные с сервера
    if (userData.id) {
        // Запрашиваем данные с сервера
        fetch(`/api/user-data?userId=${userData.id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Получены данные пользователя с сервера:", data);
                
                // Обновляем баланс и призы
                userData.balance = data.balance;
                userData.prizes = data.prizes;
                
                // Обновляем интерфейс
                updateProfileUI();
            })
            .catch(error => {
                console.error("Ошибка при получении данных пользователя:", error);
            });
    }
}

// Улучшенная функция получения данных пользователя через API
function tryToGetProfileFromBotAPI() {
    console.log("Получение профиля через API...");
    
    if (!tg || !tg.initData || tg.initData.length < 10) {
        console.error("Невозможно получить профиль: данные инициализации недоступны");
        return;
    }
    
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
        
        // Обновляем данные пользователя, если они доступны
        if (data.telegram) {
            updateUserInfoFromResponse(data);
        }
    })
    .catch(error => {
        console.error("Ошибка при получении профиля через API бота:", error);
        
        // Логируем детали инициализации для отладки
        console.log("tg.initData (первые 50 символов):", tg.initData.substring(0, 50));
        console.log("tg.initDataUnsafe доступен:", !!tg.initDataUnsafe);
        
        // Показываем сообщение пользователю
        if (tg && tg.showAlert) {
            tg.showAlert("Не удалось получить данные профиля. Пожалуйста, попробуйте позже.");
        }
    });
}

// Вспомогательная функция для обновления данных пользователя из ответа API
function updateUserInfoFromResponse(data) {
    // Обновляем данные из Telegram
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
        
        // ИСПРАВЛЕНО: Обновляем аватар в объекте userData
        if (data.telegram.photo_url) {
            userData.photo_url = data.telegram.photo_url;
            console.log("Получен URL аватара из API:", userData.photo_url);
        }
    }
    
    // Обновляем данные приложения
    if (data.app_data) {
        userData.balance = data.app_data.balance || 0;
        
        if (Array.isArray(data.app_data.prizes)) {
            userData.prizes = data.app_data.prizes;
        }
    }
    
    // Обновляем UI
    updateProfileUI();
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

// Обновленная функция обновления UI профиля
function updateProfileUI() {
    console.log("Обновление UI профиля...");
    
    // Обновляем имя пользователя
    const nameElement = document.getElementById('user-name');
    if (nameElement) {
        nameElement.textContent = userData.name;
    } else {
        console.error("Элемент user-name не найден в DOM");
    }
    
    // Обновляем username
    const usernameElement = document.getElementById('user-username');
    if (usernameElement) {
        usernameElement.textContent = userData.username ? '@' + userData.username : '';
    }
    
    // Обновляем баланс
    const balanceElement = document.getElementById('user-stars');
    if (balanceElement) {
        balanceElement.textContent = userData.balance;
    } else {
        console.error("Элемент user-stars не найден в DOM");
    }
    
    // Обновляем аватар
    updateAvatar();
    
    // Обновляем историю призов
    updatePrizesHistory();
}

// ИСПРАВЛЕНО: Функция для обновления аватара
function updateAvatar() {
    const avatarElement = document.getElementById('user-avatar');
    if (!avatarElement) {
        console.error("Элемент user-avatar не найден в DOM");
        return;
    }
    
    // Используем фото из Telegram или из объекта userData
    // Проверяем в таком порядке:
    // 1. Фото из данных userData (могло прийти с сервера)
    // 2. Фото из Telegram WebApp
    // 3. Дефолтный аватар
    if (userData.photo_url) {
        avatarElement.src = userData.photo_url;
        console.log("Установлен аватар из userData:", userData.photo_url);
    } else if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.photo_url) {
        avatarElement.src = tg.initDataUnsafe.user.photo_url;
        console.log("Установлен аватар из данных Telegram:", tg.initDataUnsafe.user.photo_url);
    } else {
        avatarElement.src = "images/default-avatar.png";
        console.log("Установлен аватар по умолчанию (нет фото в Telegram)");
    }
    
    // Обработчик ошибки загрузки аватара
    avatarElement.onerror = function() {
        console.warn("Ошибка загрузки аватара:", this.src);
        this.src = "images/default-avatar.png";
        console.warn("Используем аватар по умолчанию вместо недоступного");
    };
}

// Функция для обновления истории призов
function updatePrizesHistory() {
    const prizesList = document.getElementById('prizes-list');
    if (!prizesList) {
        console.error("Элемент prizes-list не найден в DOM");
        return;
    }
    
    // Очищаем список
    prizesList.innerHTML = '';
    
    // Если нет призов, показываем сообщение
    if (!userData.prizes || userData.prizes.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.textContent = 'У вас пока нет выигрышей';
        prizesList.appendChild(emptyItem);
        return;
    }
    
    // Добавляем призы в список
    userData.prizes.forEach(prize => {
        const item = document.createElement('li');
        
        // Находим информацию о подарке в списке gifts
        const giftInfo = gifts.find(g => g.id === prize.giftId) || 
                        { image: "🎁", color: "#ccc" };
        
        // Создаем содержимое элемента списка
        item.innerHTML = `
            <span class="prize-list-emoji" style="color: ${giftInfo.color}">
                ${giftInfo.image}
            </span>
            <div class="prize-info">
                <div>${prize.giftName}</div>
                <div class="prize-date">${formatDate(prize.date)}</div>
            </div>
            <div class="prize-stars">+${prize.value}</div>
        `;
        
        prizesList.appendChild(item);
    });
}

// Функция для форматирования даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
