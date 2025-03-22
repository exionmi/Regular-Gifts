// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Добавим отладочную информацию
console.log("Инициализация WebApp...");
console.log("WebApp данные:", tg.initDataUnsafe);

// Переменные для хранения данных пользователя
let userData = {
    id: null,
    name: "Гость",
    balance: 0,
    prizes: []
};

// Инициализация приложения
document.addEventListener("DOMContentLoaded", function() {
    // Создаем колесо
    createWheel();
    
    // Настраиваем обработчики вкладок
    setupTabs();
    
    // Настраиваем кнопку вращения
    document.getElementById('spin-btn').addEventListener('click', spinWheel);
    
    // Получаем данные пользователя
    getUserData();
});

// Функция для настройки вкладок
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // Удаляем активный класс со всех вкладок и контента
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Добавляем активный класс на выбранную вкладку и соответствующий контент
            tab.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            // Если открываем профиль, обновляем данные
            if (tabName === 'profile') {
                updateUserData();
            }
        });
    });
}

// Улучшенная функция получения данных пользователя из Telegram
function getUserData() {
    console.log("Получение данных пользователя через Python/aiogram...");
    
    const tg = window.Telegram.WebApp;
    
    if (!tg) {
        console.error("Telegram WebApp API недоступен");
        updateProfileUI();
        return;
    }
    
    // Проверяем наличие initData
    if (!tg.initData) {
        console.warn("initData отсутствует, невозможно получить профиль");
        updateProfileUI();
        return;
    }
    
    // Получаем данные профиля через Python API с использованием aiogram
    fetch('/api/telegram/get-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ init_data: tg.initData })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ошибка: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Данные профиля получены:", data);
        
        // Обновляем локальные данные пользователя
        if (data.telegram) {
            userData.id = data.telegram.user_id;
            userData.name = data.telegram.first_name + 
                (data.telegram.last_name ? ' ' + data.telegram.last_name : '');
            userData.username = data.telegram.username || "NoUsername";
                
            // Отображаем имя пользователя
            const nameElement = document.getElementById('user-name');
            if (nameElement) {
                nameElement.textContent = userData.name;
            }
            
            // Отображаем username
            const usernameElement = document.getElementById('user-username');
            if (usernameElement) {
                usernameElement.textContent = '@' + userData.username;
            }
            
            // Отображаем аватар пользователя
            if (data.telegram.photo_url) {
                const avatarElement = document.getElementById('user-avatar');
                if (avatarElement) {
                    avatarElement.src = data.telegram.photo_url;
                    console.log("Аватар установлен:", data.telegram.photo_url);
                }
            } else {
                // Если аватарки нет в данных, делаем отдельный запрос
                tryGetAvatarSeparately();
            }
        }
        
        // Обновляем данные приложения
        if (data.app_data) {
            userData.balance = data.app_data.balance || 0;
            userData.prizes = Array.isArray(data.app_data.prizes) ? 
                data.app_data.prizes : [];
                
            // Отображаем баланс
            const balanceElement = document.getElementById('user-stars');
            if (balanceElement) {
                balanceElement.textContent = userData.balance;
            }
            
            // Обновляем историю призов
            updatePrizesHistory();
        }
    })
    .catch(error => {
        console.error("Ошибка при получении профиля:", error);
        updateProfileUI(); // Показываем интерфейс с имеющимися данными
    });
}

// Функция для получения данных пользователя с сервера
function fetchUserDataFromServer() {
    const tg = window.Telegram.WebApp;
    
    // Если у нас нет ID пользователя, не делаем запрос
    if (!userData.id && (!tg.initDataUnsafe || !tg.initDataUnsafe.user)) {
        console.warn("Нет ID пользователя для запроса данных с сервера");
        return;
    }
    
    const userId = userData.id || tg.initDataUnsafe.user.id;
    
    fetch(`/api/user-data?userId=${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ошибка ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Данные с сервера:", data);
            
            // Обновляем локальные данные
            userData.balance = data.balance || 0;
            userData.prizes = Array.isArray(data.prizes) ? data.prizes : [];
            
            // Обновляем отображение баланса
            document.getElementById('user-stars').textContent = userData.balance;
            
            // Обновляем историю призов
            updatePrizesHistory();
        })
        .catch(error => {
            console.error("Ошибка при получении данных с сервера:", error);
        });
    
    // Дополнительно пробуем получить данные напрямую через API бота
    // Это поможет получить более актуальную фотографию пользователя
    tryToGetProfileFromBotAPI();
}

// Функция для попытки получения профиля через API бота
function tryToGetProfileFromBotAPI() {
    const tg = window.Telegram.WebApp;
    
    // Если нет доступа к Telegram WebApp, не делаем запрос
    if (!tg || !tg.initData) {
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
    .then(response => response.json())
    .then(data => {
        console.log("Данные профиля от API бота:", data);
        
        if (data && data.telegram) {
            // Обновляем аватар, если он есть
            if (data.telegram.photo_url) {
                const avatar = document.getElementById('user-avatar');
                if (avatar) {
                    avatar.src = data.telegram.photo_url;
                    console.log("Установлен аватар из API бота:", data.telegram.photo_url);
                }
            }
            
            // Обновляем имя пользователя, если оно есть
            if (data.telegram.first_name) {
                const name = data.telegram.first_name + 
                    (data.telegram.last_name ? ' ' + data.telegram.last_name : '');
                    
                document.getElementById('user-name').textContent = name;
                userData.name = name;
            }
        }
    })
    .catch(error => {
        console.error("Ошибка при получении профиля через API бота:", error);
    });
}

// Функция для обновления профиля с данными с сервера
function updateProfileWithServerData(profileData) {
    // Обновляем имя пользователя
    if (profileData.telegram) {
        const nameElement = document.getElementById('user-name');
        if (nameElement) {
            nameElement.textContent = userData.name;
        }
        
        // Обновляем аватар
        if (profileData.telegram.photo_url) {
            const avatarElement = document.getElementById('user-avatar');
            if (avatarElement) {
                avatarElement.src = profileData.telegram.photo_url;
                console.log("Установлен аватар из Python API:", profileData.telegram.photo_url);
            }
        }
    }
    
    // Обновляем данные приложения
    if (profileData.app_data) {
        const balanceElement = document.getElementById('user-stars');
        if (balanceElement) {
            balanceElement.textContent = profileData.app_data.balance || 0;
        }
        
        // Обновляем историю призов
        updatePrizesHistory();
    }
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

// Обновленная функция для обновления UI профиля
function updateProfileUI() {
    // Обновляем имя пользователя
    document.getElementById('user-name').textContent = userData.name || 'Гость';
    
    // Обновляем username если элемент существует
    const usernameElement = document.getElementById('user-username');
    if (usernameElement) {
        usernameElement.textContent = userData.username ? '@' + userData.username : '';
    }
    
    // Обновляем баланс
    document.getElementById('user-stars').textContent = userData.balance;
    
    // Обновляем аватар
    updateUserAvatar();
    
    // Обновляем историю выигрышей
    updatePrizesHistory();
}

// Функция для обновления UI профиля
function updateProfileUI() {
    // Обновляем имя пользователя
    document.getElementById('user-name').textContent = userData.name || 'Гость';
    document.getElementById('user-stars').textContent = userData.balance;
    
    // Обновляем аватар
    updateUserAvatar();
    
    // Обновляем историю выигрышей
    updatePrizesHistory();
}

// Функция для обновления аватара пользователя
function updateUserAvatar() {
    const avatarContainer = document.querySelector('.avatar-container');
    const user = tg.initDataUnsafe.user;
    
    if (!avatarContainer) return;
    
    // Очищаем контейнер
    avatarContainer.innerHTML = '';
    
    if (user && user.photo_url) {
        // Создаем новый элемент img для аватара
        const img = document.createElement('img');
        img.id = 'user-avatar';
        img.alt = 'Аватар';
        img.src = user.photo_url;
        
        // Обработчик ошибки загрузки фото
        img.onerror = function() {
            createInitialsAvatar(avatarContainer);
        };
        
        avatarContainer.appendChild(img);
    } else {
        // Создаем аватар с инициалами
        createInitialsAvatar(avatarContainer);
    }
}

// Функция для создания аватара из инициалов
function createInitialsAvatar(container) {
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Создаем элемент с первой буквой имени
    const initialsDiv = document.createElement('div');
    initialsDiv.classList.add('avatar-placeholder');
    
    // Получаем первую букву имени или используем '?'
    const firstLetter = userData.name ? userData.name.charAt(0).toUpperCase() : '?';
    initialsDiv.textContent = firstLetter;
    
    // Добавляем в контейнер
    container.appendChild(initialsDiv);
}

// Функция для обновления истории выигрышей с использованием эмодзи
function updatePrizesHistory() {
    const prizesList = document.getElementById('prizes-list');
    if (!prizesList) return;
    
    prizesList.innerHTML = ''; // Очищаем список
    
    if (!userData.prizes || userData.prizes.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.textContent = 'Вы еще не выиграли ни одного подарка';
        prizesList.appendChild(emptyItem);
        return;
    }
    
    // Создаем элементы для каждого выигрыша
    userData.prizes.forEach(prize => {
        const li = document.createElement('li');
        
        // Находим соответствующий подарок в массиве gifts
        const giftData = gifts.find(g => g.id === prize.giftId) || { 
            image: "❓", 
            name: prize.giftName || "Подарок" 
        };
        
        // Создаем элемент для эмодзи
        const emojiSpan = document.createElement('span');
        emojiSpan.classList.add('emoji-icon');
        emojiSpan.style.position = 'static'; // Сбрасываем позицию для списка
        emojiSpan.style.transform = 'none'; // Сбрасываем поворот
        emojiSpan.textContent = giftData.image;
        
        const prizeInfo = document.createElement('div');
        prizeInfo.classList.add('prize-info');
        
        const prizeName = document.createElement('div');
        prizeName.textContent = giftData.name;
        
        const prizeDate = document.createElement('div');
        prizeDate.classList.add('prize-date');
        prizeDate.textContent = new Date(prize.date).toLocaleDateString();
        
        prizeInfo.appendChild(prizeName);
        prizeInfo.appendChild(prizeDate);
        
        const prizeValue = document.createElement('div');
        prizeValue.classList.add('prize-stars');
        prizeValue.textContent = `+${prize.value}`;
        
        li.appendChild(emojiSpan);
        li.appendChild(prizeInfo);
        li.appendChild(prizeValue);
        
        prizesList.appendChild(li);
    });
}

// Функция для обновления данных пользователя
function updateUserData() {
    getUserData();
}

// Функция для отправки данных на сервер
async function fetchData(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        // Показываем уведомление об ошибке
        tg.showAlert('Произошла ошибка при обращении к серверу. Пожалуйста, попробуйте позже.');
        return null;
    }
}

// При ошибке загрузки изображения использовать запасное
function handleImageError(img, defaultSrc) {
    img.onerror = null; // Предотвращаем бесконечную рекурсию
    img.src = defaultSrc;
}

// Добавляем обработчики для изображений
document.querySelectorAll('img').forEach(img => {
    img.onerror = () => handleImageError(img, 'images/default.png');
});

// Обработка ошибок загрузки изображений
document.querySelectorAll('img').forEach(img => {
    img.onerror = function() {
        if (img.src.includes('gifts/')) {
            this.src = "images/gifts/default.png";
        } else if (img.id === 'user-avatar') {
            this.src = "images/default-avatar.png";
        }
    };
});

// Инициируем загрузку изображений заранее
function preloadImages() {
    gifts.forEach(gift => {
        const img = new Image();
        img.src = gift.image;
    });
    
    // Загружаем стандартные изображения
    const defaultImages = ["images/gifts/default.png", "images/default-avatar.png", "images/star.png"];
    defaultImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Вызываем предзагрузку изображений
preloadImages();

// Отправляем данные в Telegram при закрытии приложения
window.addEventListener('beforeunload', () => {
    tg.sendData(JSON.stringify({action: 'close'}));
});

// Настройка основной кнопки Telegram если она доступна
if (tg.MainButton) {
    tg.MainButton.setParams({
        text: 'Закрыть',
        color: '#2196F3'
    });
    
    tg.MainButton.onClick(() => {
        tg.close();
    });
}
