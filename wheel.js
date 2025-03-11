// Определение подарков для колеса
const gifts = [
    { id: 1, name: "Мишка", image: "images/gifts/bear.png", value: 10, color: "#FFD700", chance: 10 },
    { id: 2, name: "Сердечко", image: "images/gifts/heart.png", value: 5, color: "#FF6B6B", chance: 15 },
    { id: 3, name: "Подарок", image: "images/gifts/gift.png", value: 20, color: "#4CAF50", chance: 8 },
    { id: 4, name: "Роза", image: "images/gifts/rose.png", value: 15, color: "#E91E63", chance: 10 },
    { id: 5, name: "Цветы", image: "images/gifts/flowers.png", value: 25, color: "#9C27B0", chance: 7 },
    { id: 6, name: "Шампанское", image: "images/gifts/champagne.png", value: 30, color: "#00BCD4", chance: 5 },
    { id: 7, name: "Ракета", image: "images/gifts/rocket.png", value: 50, color: "#3F51B5", chance: 2 },
    { id: 8, name: "Кубок", image: "images/gifts/cup.png", value: 40, color: "#FFC107", chance: 3 },
    { id: 9, name: "Бриллиант", image: "images/gifts/diamond.png", value: 100, color: "#2196F3", chance: 1 },
    { id: 10, name: "Кольцо", image: "images/gifts/ring.png", value: 75, color: "#607D8B", chance: 2 }
];

// Функция для создания колеса
function createWheel() {
    const wheel = document.getElementById('fortune-wheel');
    const sectionAngle = 360 / gifts.length;
    
    gifts.forEach((gift, index) => {
        const section = document.createElement('div');
        section.classList.add('wheel-section');
        section.style.transform = `rotate(${index * sectionAngle}deg)`;
        section.style.backgroundColor = gift.color;
        
        const content = document.createElement('div');
        content.classList.add('section-content');
        
        const img = document.createElement('img');
        img.src = gift.image;
        img.alt = gift.name;
        // При ошибке загрузки заменяем на стандартную иконку
        img.onerror = function() {
            this.src = "images/gifts/default.png";
        };
        
        content.appendChild(img);
        section.appendChild(content);
        wheel.appendChild(section);
    });
}

// Функция для вращения колеса
function spinWheel() {
    const wheel = document.getElementById('fortune-wheel');
    const spinButton = document.getElementById('spin-btn');
    
    // Деактивируем кнопку на время вращения
    spinButton.disabled = true;
    spinButton.textContent = 'Крутится...';
    
    // Выбираем случайный подарок с учетом вероятностей
    const selectedGift = selectRandomGift();
    
    // Вычисляем угол для вращения
    const sectionAngle = 360 / gifts.length;
    const giftIndex = gifts.findIndex(gift => gift.id === selectedGift.id);
    
    // Случайное количество полных оборотов + позиция приза
    const rotations = 5; // Минимум 5 полных оборотов
    const targetAngle = rotations * 360 + (giftIndex * sectionAngle);
    
    // Добавляем небольшое случайное смещение внутри ячейки
    const randomOffset = Math.random() * (sectionAngle * 0.8);
    const totalAngle = targetAngle + randomOffset;
    
    // Применяем вращение
    wheel.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.24, 0.99)';
    wheel.style.transform = `rotate(${totalAngle}deg)`;
    
    // После окончания вращения показываем результат
    setTimeout(() => {
        showResult(selectedGift);
        spinButton.disabled = false;
        spinButton.textContent = 'Крутить колесо';
    }, 5000);
    
    // Отправляем результат на сервер
    sendResult(selectedGift);
}

// Функция для выбора случайного подарка с учетом шансов
function selectRandomGift() {
    // Вычисляем суммарную вероятность
    const totalChance = gifts.reduce((sum, gift) => sum + gift.chance, 0);
    
    // Генерируем случайное число от 0 до суммарной вероятности
    let random = Math.random() * totalChance;
    
    // Находим выбранный подарок
    for (const gift of gifts) {
        if (random < gift.chance) {
            return gift;
        }
        random -= gift.chance;
    }
    
    // Если что-то пошло не так, возвращаем первый подарок
    return gifts[0];
}

// Функция для показа результата
function showResult(gift) {
    const resultContainer = document.getElementById('result-container');
    const prizeImage = document.getElementById('prize-image');
    const prizeName = document.getElementById('prize-name');
    const starsValue = document.getElementById('stars-value');
    
    prizeImage.src = gift.image;
    // При ошибке загрузки заменяем на стандартную иконку
    prizeImage.onerror = function() {
        this.src = "images/gifts/default.png";
    };
    prizeName.textContent = gift.name;
    starsValue.textContent = gift.value;
    
    resultContainer.style.display = 'flex';
    
    // Обработчик для кнопки "Продолжить"
    document.getElementById('continue-btn').onclick = () => {
        resultContainer.style.display = 'none';
        updateUserData();
    };
}

// Функция для отправки результата на сервер
function sendResult(gift) {
    // Получаем данные пользователя из Telegram
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    
    if (!user) {
        console.error('Не удалось получить данные пользователя Telegram');
        return;
    }
    
    try {
        fetch('/api/save-result', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user.id,
                giftId: gift.id,
                giftValue: gift.value,
                giftName: gift.name
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Результат успешно сохранен:', data);
            // При успешном сохранении обновляем локальные данные
            userData.balance += gift.value;
            userData.prizes.unshift({
                giftId: gift.id,
                giftName: gift.name,
                value: gift.value,
                date: new Date().toISOString()
            });
        })
        .catch(error => {
            console.error('Ошибка при сохранении результата:', error);
            // Для тестирования без сервера или при ошибке просто обновим локальные данные
            userData.balance += gift.value;
            userData.prizes.unshift({
                giftId: gift.id,
                giftName: gift.name,
                value: gift.value,
                date: new Date().toISOString()
            });
        });
    } catch (e) {
        console.error('Общая ошибка при отправке результата:', e);
        // Для тестирования без сервера или при ошибке просто обновим локальные данные
        userData.balance += gift.value;
        userData.prizes.unshift({
            giftId: gift.id,
            giftName: gift.name,
            value: gift.value,
            date: new Date().toISOString()
        });
    }
}
