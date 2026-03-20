# 🚀 Встановлення та налаштування PWA

## 📦 Що це містить?

```
📁 Ганtt_Про PWA
├── 📄 Ганtt_Про_v4_1.html      ← Основною додаток
├── 📄 manifest.json            ← Конфіг PWA
├── 📄 sw.js                    ← Service Worker (офлайн)
├── 📄 README.md                ← Справка користувача
├── 📄 INSTALL.md               ← Ця інструкція
├── 📄 .htaccess                ← Для сервера Apache
├── 📄 start-server.bat         ← Запуск на Windows
└── 📄 start-server.sh          ← Запуск на Mac/Linux
```

## 🎯 Швидкий старт (За 2 хвилини)

### 1️⃣ Локальне тестування

**Windows:**
```bash
# Подвійний клік на start-server.bat
# або
python -m http.server 8000
```

**Mac/Linux:**
```bash
bash start-server.sh
# або
python3 -m http.server 8000
```

Потім в браузері відкрийте: `http://localhost:8000`

### 2️⃣ Встановлення як додаток

1. Відкрийте `http://localhost:8000/Ганtt_Про_v4_1.html`
2. Натисніть заказ у адресному рядку (різниці для кожного браузера):
   - **Chrome/Edge**: 📱 → "Встановити"
   - **Safari**: Поділитися → "На екран Домівки"
   - **Firefox**: ⋮ → "Встановити додаток"
3. Готово! Додаток в стартовому меню

---

## 🌐 Розміщення на хостингу

### Вимоги:

- ✅ **HTTPS** (обов'язково для PWA)
- ✅ **Python/Node.js** сервер АБО **Apache/Nginx**
- ✅ Підтримка Service Worker

### Для Apache:

1. Завантажте файли на сервер
2. Переконайтеся, що `.htaccess` в основній папці
3. Включіть модулі:
   ```bash
   a2enmod rewrite
   a2enmod deflate
   service apache2 restart
   ```

### Для Nginx:

Додайте до конфігу (`/etc/nginx/sites-available/default`):

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/html/gantt-pro;
    index Ганtt_Про_v4_1.html;

    # Кеш статочних файлів
    location ~* \.(js|css|html|json|svg)$ {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker - короткий кеш
    location = /sw.js {
        expires 1h;
        add_header Cache-Control "max-age=3600, public";
    }

    # Гжиття компресія
    gzip on;
    gzip_types text/html text/css text/javascript application/json;
}
```

Перезавантажте: `sudo systemctl restart nginx`

### Для інших хостетів:

1. **Netlify**: Автоматичне
2. **GitHub Pages**: Підтримує PWA
3. **Vercel**: Автоматичне
4. **Heroku**: Можливо з Node.js сервером

---

## 🔍 Перевірка встановлення

Розробнику:

1. Натисніть **F12** → **Application** / **Storage**
2. Перевірте:
   - ✅ **Manifest** - Manifest tab
   - ✅ **Service Workers** - Service Workers tab
   - ✅ **Cache Storage** - Cache tab
   - ✅ **Local Storage** - Local Storage tab

Все мав знак ✅ - Готово!

---

## 📱 Мобільне встановлення

### Android

1. Chrome → більше опцій (⋮)
2. "Встановити додаток"
3. Підтвердіть

### iOS (Safari)

1. Натисніть Share ↗️
2. "На екран Домівки"
3. _Додайте_

### iPadOS

Те саме, що iOS

---

## 🔐 Безпека

### На локальному ПК

Service Worker працює без обмежень по `file://`

### На сервері

**ОБОВ'ЯЗКОВО використовуйте HTTPS:**

```bash
# Генерування самопідписаного сертифіката
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```

---

## 🛠️ Трашубутинг

### "Service Worker не реєструється"

```javascript
// Відкрийте консоль (F12) і перевірте помилки
// Можливі причини:
// 1. sw.js не знайдений
// 2. HTTP замість HTTPS на сервері
// 3. Неправильний Content-Type
```

**Рішення:**
- Перевірте, що `sw.js` в одній папці з HTML
- Використовуйте HTTPS на публічному сервері
- Переконайтеся, що `Content-Type: application/javascript`

### "Додаток не встановлюється"

Вимоги для встановлення PWA:
- ✅ HTTPS (на сервері)
- ✅ manifest.json правильно сконфігурований
- ✅ Service Worker реєструється без помилок
- ✅ Мінімум 192x192 іконка

### "Дані зникли"

Це нормально, якщо:
- Очистили кеш браузера
- Видалили додаток заново

**Запобігання:**
- Регулярно експортуйте дані (↓ JSON)
- Синхронізуйте з хмарою (опція в майбутньому)

---

## 📊 Статистика розміру

| Файл | Розмір (орієнтованого) |
|------|-------|
| HTML | ~150 KB |
| Service Worker | ~5 KB |
| Manifest | ~3 KB |
| Після мініфікації | <50 KB |

---

## 🎓 Корисні посилання

- [PWA Docs](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [HTTPS Guide](https://letsencrypt.org/)

---

## 🆘 Потрібна допомога?

1. Перевірте консоль браузера (F12)
2. Перевірте Network tab на помилки
3. Спробуйте в Chrome (найкраща підтримка)
4. Очистіть кеш і перезавантажте

---

**Версія**: 1.0  
**Версія PWA**: 1  
**Підтримку браузеру**: Chrome 64+, Edge 79+, Safari 11.1+, Firefox 55+
