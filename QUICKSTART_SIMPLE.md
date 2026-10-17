# 🚀 pojia-breaker Quick Start

## Распаковка и запуск (30 секунд)

```bash
# Распакуй архив
tar -xzf pojia-breaker-web-DEPLOY.tar.gz
cd pojia-breaker-web

# Запусти setup (создаст venv, установит зависимости)
./setup.sh

# Активируй venv
source venv/bin/activate

# Запусти сервер
python app.py
```

Открой: **http://localhost:5000**

---

## Deploy на Railway (3 минуты)

```bash
# 1. Создай свой GitHub repo
# Зайди на github.com → New repository → pojia-breaker-web

# 2. Запуш код
git init
git add .
git commit -m "pojia-breaker web interface"
git remote add origin https://github.com/ВАШ_ЮЗЕРНЕЙМ/pojia-breaker-web.git
git branch -M main
git push -u origin main

# 3. Railway
# Зайди на railway.app
# New Project → Deploy from GitHub → выбери свой репо
# Railway автоматически задеплоит Flask приложение
```

**Получишь URL:** `https://your-app.up.railway.app`

---

## Основные команды в консоли

```bash
# Сканирование портов
nmap -sV -sC target.com

# Поиск уязвимостей
nuclei -u https://target.com -severity critical,high

# SQL инъекция
sqlmap -u "https://target.com/page?id=1" --batch --risk=3

# Брутфорс директорий
ffuf -u https://target.com/FUZZ -w /usr/share/wordlists/dirb/common.txt

# Поиск поддоменов
subfinder -d target.com

# Помощь
help
```

---

## Структура

```
pojia-breaker-web/
├── app.py              # Flask backend (ГЛАВНЫЙ ФАЙЛ)
├── templates/
│   └── index.html      # UI с консолью
├── static/
│   ├── css/main.css    # Стили
│   └── js/main.js      # Логика консоли
├── skills/             # 24 attack модуля
├── ammo/               # 19 LLM jailbreak payloads
└── results/            # Выходные файлы
```

---

## Решение проблем

**"Permission denied" при push в GitHub:**
→ Ты пытаешься пушить в чужой репо. Создай СВОЙ репо (см. выше).

**"Authorization required" на Vercel:**
→ Используй Railway вместо Vercel (Flask лучше работает на Railway).

**Команды в консоли не работают (nmap, nuclei):**
→ На облачных платформах (Railway/Vercel) эти инструменты недоступны.
→ Для полного функционала разверни на VPS с установленными инструментами.

**Локально тоже не работают:**
→ Установи инструменты:
```bash
# Ubuntu/Debian
sudo apt install nmap sqlmap

# Go tools
go install github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest
go install github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
```

---

## Что дальше?

1. **Тестируй локально** — запусти на компе, проверь что консоль работает
2. **Deploy на Railway** — выложи в интернет для удалённого доступа
3. **Или разверни на VPS** — для полного набора red team инструментов

**Полная инструкция:** [DEPLOY_FINAL.md](DEPLOY_FINAL.md)

---

**Вопросы? Проблемы?**
- Читай DEPLOY_FINAL.md (подробное руководство)
- Проверь логи: `python app.py` покажет ошибки
- На Railway: `railway logs`

**Готово. Go break things (legally).** 🔥
