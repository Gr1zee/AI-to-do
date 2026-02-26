# 📝 AI To-Do App

Полнофункциональное приложение для управления задачами с FastAPI бэкендом и React фронтендом. Позволяет создавать проекты, управлять задачами и организовывать работу.

![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green?logo=fastapi)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-latest-blue?logo=postgresql)

## ✨ Возможности

- 🔐 **Аутентификация** — регистрация и авторизация с JWT токенами (RS256)
- 📁 **Проекты** — создание и управление проектами
- ✅ **Задачи** — создание задач с приоритетами, статусами и дедлайнами
- 👥 **Участники** — добавление участников в проекты
- 🌓 **Темная тема** — поддержка светлой и темной темы
- 🔄 **Drag & Drop** — перетаскивание задач для изменения статуса

## 🛠️ Технологии

### Backend
- **FastAPI** — современный асинхронный веб-фреймворк
- **SQLAlchemy 2.0** — ORM с поддержкой async
- **PostgreSQL** — реляционная база данных
- **Alembic** — миграции базы данных
- **Pydantic v2** — валидация данных
- **PyJWT** — JWT аутентификация
- **Poetry** — управление зависимостями

### Frontend
- **React 19** — UI библиотека
- **TypeScript** — типизация
- **Vite** — сборщик
- **Tailwind CSS 4** — стилизация
- **React Router 7** — маршрутизация
- **@hello-pangea/dnd** — drag and drop

## 📦 Установка

### Требования
- Python 3.11+
- Node.js 18+
- PostgreSQL (или Docker)
- Poetry

### 1. Клонирование репозитория

```bash
git clone https://github.com/gr1zee/AI-to-do.git
cd AI-to-do
```

### 2. Запуск базы данных

С помощью Docker Compose:

```bash
docker-compose up -d
```

Это запустит:
- PostgreSQL на порту `5432`
- Adminer на порту `8080`
- pgAdmin на порту `5050`

### 3. Настройка Backend

```bash
# Установка зависимостей
poetry install

# Создание файла .env
cp .env.example .env  # или создайте вручную
```

Создайте файл `.env` в корне проекта:

```env
DB__URL=postgresql+asyncpg://user:password@localhost:5432/ai_todo
```

Сгенерируйте JWT ключи:

```bash
# Приватный ключ
openssl genrsa -out jwt-private.pem 2048

# Публичный ключ
openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem
```

Примените миграции:

```bash
poetry run alembic upgrade head
```

### 4. Настройка Frontend

```bash
cd frontend

# Установка зависимостей
npm install
```

## 🚀 Запуск

### Backend

```bash
# Из корневой директории
poetry run python -m app.main
```

Сервер запустится на `http://localhost:8000`

API документация доступна по адресам:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Frontend

```bash
cd frontend
npm run dev
```

Приложение будет доступно на `http://localhost:5173`

## 📊 API Эндпоинты

### Аутентификация
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Регистрация пользователя |
| POST | `/api/auth/login` | Авторизация |

### Проекты
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/projects` | Получить все проекты |
| POST | `/api/projects` | Создать проект |
| DELETE | `/api/projects/{id}` | Удалить проект |

### Задачи
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/tasks` | Получить все задачи |
| POST | `/api/tasks` | Создать задачу |
| PATCH | `/api/tasks/{id}` | Обновить задачу |
| DELETE | `/api/tasks/{id}` | Удалить задачу |

## 🧪 Тестирование

```bash
# Запуск тестов
poetry run pytest

# С покрытием
poetry run pytest --cov=app
```

## 🔧 Разработка

### Форматирование кода

```bash
# Backend
poetry run black app/

# Frontend
cd frontend && npm run lint
```

### Создание миграции

```bash
poetry run alembic revision --autogenerate -m "описание изменений"
```

## 📄 Лицензия

MIT License — см. файл [LICENSE](LICENSE)

## 👤 Автор

**gr1zee**

---

⭐ Если проект был полезен, поставьте звезду!
