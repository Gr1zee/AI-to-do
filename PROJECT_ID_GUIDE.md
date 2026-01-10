# Как получить project_id и создавать задачи внутри проекта

## Архитектура

### Бэкенд API структура

Маршруты теперь организованы иерархически:
- `GET /projects` - Получить все проекты пользователя
- `POST /projects` - Создать новый проект
- **`GET /projects/{project_id}/tasks`** - Получить все задачи проекта
- **`POST /projects/{project_id}/tasks`** - Создать задачу внутри проекта
- **`PATCH /projects/{project_id}/tasks/{task_id}`** - Обновить задачу
- **`DELETE /projects/{project_id}/tasks/{task_id}`** - Удалить задачу

### Как это работает:

1. **Получение project_id с фронтенда:**
   - Пользователь видит список проектов на главной странице (`/`)
   - При клике на "Open" переходит на `/project/{projectId}`
   - `project_id` автоматически передаётся в URL

2. **Проверка доступа:**
   - Функция `get_current_project()` в `tasks.py` проверяет:
     - Что проект существует
     - Что он принадлежит текущему пользователю
   - Если нет доступа → возвращается ошибка 404

3. **Создание задачи:**
   ```
   POST /api/v1/projects/{project_id}/tasks
   {
     "title": "Название задачи",
     "description": "Описание",
     "priority": "high|normal|low",
     "status": "pending|in_progress|completed",
     "deadline": "2025-01-15T10:00:00"
   }
   ```
   - `project_id` берётся из URL
   - `user_id` берётся из токена авторизации
   - Система автоматически связывает задачу с проектом и пользователем

## Файлы которые были изменены

### Бэкенд:
- `app/api/api_v1/tasks.py` - Полностью переработана структура маршрутов
- `app/api/api_v1/crud/tasks.py` - Добавлены функции для работы с проектом
- `app/api/api_v1/crud/projects.py` - Добавлена функция `get_project_by_id()`
- `app/schemas/task.py` - Добавлена схема `TaskUpdate`
- `app/api/api_v1/__init__.py` - Подключены маршруты задач

### Фронтенд:
- `src/api.ts` - Добавлены методы `tasksApi` для работы с задачами
- `src/App.tsx` - Добавлен маршрут `/project/:projectId`
- `src/pages/DashboardPage.tsx` - Обновлена кнопка "Open" для перехода в проект
- `src/pages/ProjectPage.tsx` - Новая страница для управления задачами в проекте

## Примеры использования на фронтенде

### Получить задачи проекта:
```typescript
import { tasksApi } from "../api";

const tasks = await tasksApi.getAll(projectId);
```

### Создать задачу:
```typescript
await tasksApi.create(projectId, {
  title: "Моя первая задача",
  description: "Описание",
  priority: "high",
  status: "pending"
});
```

### Обновить статус задачи:
```typescript
await tasksApi.update(projectId, taskId, { 
  status: "completed" 
});
```

### Удалить задачу:
```typescript
await tasksApi.delete(projectId, taskId);
```

## Как это использовать в приложении

1. **Пользователь входит в систему** → попадает на Dashboard (`/dashboard`)
2. **Видит список своих проектов**
3. **Кликает на кнопку "Open"** → переходит на `/project/{projectId}`
4. **На странице проекта может:**
   - Просмотреть все задачи проекта
   - Создать новую задачу (кнопка "+ New Task")
   - Изменить статус задачи (Pending → In Progress → Completed)
   - Удалить задачу

## Безопасность

- Все запросы требуют авторизации (Bearer token)
- Функция `get_current_project()` проверяет, что проект принадлежит текущему пользователю
- Пользователь не может получить доступ к чужим проектам/задачам
- Все задачи автоматически привязываются к user_id текущего пользователя
