# pojia-breaker Web Deploy Guide

## 🎯 Полная инструкция по деплою на Railway

Проблема которую ты описал — это попытка запушить в чужой репозиторий. Решение: создай **свой форк или новый репо**.

---

## ✅ Вариант 1: Деплой через свой GitHub репозиторий

### Шаг 1: Создай свой репозиторий

```bash
# Создай новый репо на GitHub (через веб-интерфейс)
# Название: pojia-breaker-web (или любое другое)
# Visibility: Private или Public (на твой выбор)
```

### Шаг 2: Инициализируй локальный проект

```bash
# Распакуй архив
tar -xzf pojia-breaker-web-complete.tar.gz
cd pojia-breaker-web

# Инициализируй git
git init
git add .
git commit -m "Initial commit: pojia-breaker web interface"

# Добавь свой удалённый репо (замени nominalooo на своё имя)
git remote add origin https://github.com/nominalooo/pojia-breaker-web.git

# Запуш в свой репо
git branch -M main
git push -u origin main
```

### Шаг 3: Деплой на Railway

1. Зайди на [railway.app](https://railway.app)
2. Нажми **New Project**
3. Выбери **Deploy from GitHub repo**
4. Выбери свой репозиторий `pojia-breaker-web`
5. Railway автоматически определит Flask и задеплоит

**Environment Variables (не обязательно для базовой версии):**
- `PORT` — Railway сам установит
- `PYTHON_VERSION` — 3.11 (указано в runtime.txt)

### Шаг 4: Проверь деплой

После деплоя Railway даст тебе URL вида `https://your-app.up.railway.app`

Открой его в браузере — должен загрузиться pojia-breaker интерфейс.

---

## ✅ Вариант 2: Деплой через Vercel

**Проблема:** Vercel требует авторизации от владельца team проекта.

**Решение:** Создай свой проект на Vercel.

### Установка Vercel CLI

```bash
npm install -g vercel
# Или
yarn global add vercel
```

### Деплой

```bash
cd pojia-breaker-web

# Залогинься в Vercel
vercel login

# Задеплой проект (следуй инструкциям)
vercel

# Для продакшн деплоя
vercel --prod
```

**Важно:** Flask не оптимален для Vercel (serverless). Vercel лучше работает с Next.js/static sites. Для Flask рекомендуется Railway или другие PaaS.

---

## ✅ Вариант 3: Локальный запуск (тестирование)

```bash
cd pojia-breaker-web

# Создай виртуальное окружение
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Установи зависимости
pip install -r requirements.txt

# Запусти
python app.py
```

Открой http://localhost:5000

---

## 🔧 Решение проблем

### 1. Error: Permission denied (GitHub push)

**Причина:** Ты пытаешься пушить в репо Justinuse1/pojia-breaker.

**Решение:** Используй **свой** репозиторий (см. Вариант 1).

---

### 2. Vercel: Authorization required to deploy

**Причина:** Проект принадлежит команде justinuse1.

**Решение:** 
- Удали связь с этим проектом: `vercel unlink`
- Создай новый проект: `vercel` (он спросит создать ли новый)

---

### 3. Railway: Build failed

**Проверь:**
- `requirements.txt` существует
- `Procfile` содержит `web: gunicorn app:app`
- `runtime.txt` содержит `python-3.11`

Если проблема с gunicorn:
```bash
# Добавь в requirements.txt
echo "gunicorn==21.2.0" >> requirements.txt
git add requirements.txt
git commit -m "Add gunicorn"
git push
```

---

### 4. Нет доступа к инструментам (nmap, nuclei, etc)

**На Railway/Vercel:** 

Большинство red team инструментов **не будут работать** в облачных PaaS из-за ограничений.

**Решения:**
1. **Для продакшна:** Разверни на VPS (DigitalOcean, AWS EC2, Vultr)
2. **Для теста:** Используй локальный запуск
3. **Частичное решение:** Некоторые команды будут показывать сообщение "not installed" — это нормально для облачных сред

---

## 🚀 VPS Deployment (рекомендуется для полного функционала)

```bash
# На сервере (Ubuntu 22.04)
sudo apt update
sudo apt install -y python3 python3-pip python3-venv \
  nmap nuclei sqlmap ffuf subfinder curl git

# Клонируй свой репо
git clone https://github.com/nominalooo/pojia-breaker-web.git
cd pojia-breaker-web

# Установи зависимости
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Запусти с gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 2 app:app
```

**Для production с nginx:**
```bash
sudo apt install nginx

# Создай конфиг nginx
sudo nano /etc/nginx/sites-available/pojia-breaker

# Добавь:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Активируй
sudo ln -s /etc/nginx/sites-available/pojia-breaker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📦 Содержимое архива

```
pojia-breaker-web/
├── app.py                  # Flask backend с консолью
├── requirements.txt        # Python зависимости
├── Procfile               # Railway/Heroku config
├── runtime.txt            # Python версия
├── railway.json           # Railway настройки
├── templates/
│   └── index.html         # Web интерфейс с консолью
├── static/
│   ├── css/
│   │   └── main.css       # Стили (red team дизайн)
│   └── js/
│       └── main.js        # Логика консоли + API calls
├── skills/
│   └── bteam-skills/      # 24 red team модуля
│       ├── INDEX.md
│       ├── sqli-sql-injection/
│       ├── xss-cross-site-scripting/
│       ├── ssrf-server-side-request-forgery/
│       └── ... (21 more)
├── ammo/
│   ├── ammo_matrix.json   # 19 LLM jailbreak payloads
│   └── poko/
│       └── persona.md     # AI persona configs
└── results/               # Output от скан-модулей
```

---

## 🎮 Как использовать

### 1. Live Console
- Открой консоль (кнопка "Open Console")
- Введи команду: `nmap -sV target.com`
- Нажми Enter
- Результаты появятся в консоли и в разделе "Recent Operations"

### 2. Attack Modules
- Укажи target в поле "Target URL or IP"
- Нажми "Set Target"
- Кликни на модуль (например "Sql Injection")
- Результаты откроются автоматически

### 3. LLM Payloads
- Выбери Target LLM (GPT-4, Claude, etc)
- Кликни на payload
- Скопируй System/User промпты
- Вставь в целевую LLM и тестируй

---

## 🛡️ Security Notes

**Для production:**
- Добавь аутентификацию (Flask-Login, JWT)
- Ограничь доступ к `/api/run/console` (whitelist команд)
- Используй HTTPS (Let's Encrypt)
- Rate limiting (Flask-Limiter)

**Текущая версия — для внутреннего использования / red team операций.**

---

## 🐛 Troubleshooting

**Консоль не выполняет команды:**
- Проверь что backend запущен (статус должен быть "System Ready")
- Открой DevTools (F12) → Console → смотри ошибки
- Проверь что `/api/run/console` endpoint доступен

**Модули возвращают "not installed":**
- Это нормально для облачных сред
- Для полного функционала используй VPS с установленными инструментами

**Результаты не сохраняются:**
- Проверь что папка `results/` существует и writable
- На некоторых PaaS файловая система эфемерная (используй S3/external storage)

---

## 📞 Support

Если что-то не работает — присылай логи:
```bash
# Логи Railway
railway logs

# Логи локально
python app.py 2>&1 | tee debug.log
```

---

**Готово. Разверни, взломай, доминируй.** 🔥
