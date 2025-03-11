import os
import sys
import requests
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO

# Создаем папку для подарков, если она не существует
gifts_dir = os.path.join(os.path.dirname(__file__), "gifts")
os.makedirs(gifts_dir, exist_ok=True)

# Создаем заглушки для изображений, если они не существуют
gift_images = [
    "bear.png", "heart.png", "gift.png", "rose.png", "flowers.png",
    "champagne.png", "rocket.png", "cup.png", "diamond.png", "ring.png", "default.png"
]

# Функция для создания изображения-заглушки с текстом
def create_placeholder_image(filename, text, size=(100, 100), bg_color=(200, 200, 200), text_color=(50, 50, 50)):
    image = Image.new("RGBA", size, bg_color)
    draw = ImageDraw.Draw(image)
    
    # Простой текст без использования шрифтов
    text_width = len(text) * 6
    text_x = (size[0] - text_width) / 2
    text_y = size[1] / 2 - 10
    
    draw.text((text_x, text_y), text, fill=text_color)
    
    image.save(os.path.join(gifts_dir, filename))
    print(f"Создан файл: {filename}")

# Создаем заглушки для изображений подарков
for img_name in gift_images:
    filepath = os.path.join(gifts_dir, img_name)
    if not os.path.exists(filepath):
        gift_name = os.path.splitext(img_name)[0].capitalize()
        create_placeholder_image(img_name, gift_name)

# Создаем заглушку для звезды, если она не существует
star_path = os.path.join(os.path.dirname(__file__), "star.png")
if not os.path.exists(star_path):
    star_image = Image.new("RGBA", (24, 24), (245, 166, 35))
    draw = ImageDraw.Draw(star_image)
    
    # Рисуем простую звезду
    points = [
        (12, 0), (15, 9), (24, 9), (17, 15),
        (20, 24), (12, 18), (4, 24), (7, 15),
        (0, 9), (9, 9)
    ]
    draw.polygon(points, fill=(255, 215, 0))
    
    star_image.save(star_path)
    print(f"Создан файл: star.png")

# Создаем заглушку для аватара, если она не существует
avatar_path = os.path.join(os.path.dirname(__file__), "default-avatar.png")
if not os.path.exists(avatar_path):
    avatar_image = Image.new("RGBA", (80, 80), (100, 100, 100))
    draw = ImageDraw.Draw(avatar_image)
    
    # Рисуем простой аватар
    draw.ellipse((5, 5, 75, 75), fill=(150, 150, 150))
    draw.ellipse((20, 20, 60, 50), fill=(100, 100, 100))
    draw.ellipse((15, 55, 65, 95), fill=(100, 100, 100))
    
    avatar_image.save(avatar_path)
    print(f"Создан файл: default-avatar.png")

print("Все необходимые заглушки для изображений созданы!")
print("Для использования реальных изображений замените заглушки на ваши файлы.")
