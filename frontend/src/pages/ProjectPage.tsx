import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { useAuth } from "../context/AuthContext";
import { tasksApi, projectsApi } from "../api";
import { Button, Card } from "../components/UI";
import { formatDate } from "../utils/dateUtils";

// --- Типы ---
interface Task {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "normal" | "high";
  deadline: string | null;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

// Конфигурация колонок для Drag-n-Drop
const COLUMNS = {
  pending: { id: "pending", title: "📝 Нужно сделать", color: "bg-gray-100", border: "border-gray-200" },
  in_progress: { id: "in_progress", title: "🔥 В процессе", color: "bg-blue-50", border: "border-blue-100" },
  completed: { id: "completed", title: "✅ Готово", color: "bg-green-50", border: "border-green-100" },
};

export const ProjectPage = () => {
  useAuth();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Модалка и форма
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "normal",
    deadline: "", // Поле для даты
  });

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    try {
      const [projData, tasksData] = await Promise.all([
        projectsApi.getAll(),
        tasksApi.getAll(Number(projectId))
      ]);
      
      const current = projData.find((p: Project) => p.id === Number(projectId));
      current ? setProject(current) : navigate("/");
      setTasks(tasksData);
    } catch (error) {
      console.error(error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  // --- Обработка Drag-and-Drop ---
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Если никуда не перетащили
    if (!destination) return;

    // Если перетащили в ту же колонку на то же место
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Находим задачу
    const movedTask = tasks.find(t => t.id === Number(draggableId));
    if (!movedTask) return;

    const newStatus = destination.droppableId as Task["status"];

    // 1. Оптимистичное обновление UI (сразу меняем стейт, не ждем сервер)
    const updatedTasks = tasks.map(t => 
      t.id === Number(draggableId) ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    // 2. Отправка запроса на сервер
    try {
      if (movedTask.status !== newStatus) {
        await tasksApi.update(Number(projectId), movedTask.id, { status: newStatus });
      }
    } catch (error) {
      console.error("Failed to update task status", error);
      // Если ошибка - откатываем изменения (можно добавить уведомление)
      loadData(); 
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tasksApi.create(Number(projectId), {
        ...newTask,
        status: "pending",
        deadline: newTask.deadline || undefined // Отправляем undefined если дата пустая
      });
      setNewTask({ title: "", description: "", priority: "normal", deadline: "" });
      setShowModal(false);
      
      // Перезагружаем задачи
      const data = await tasksApi.getAll(Number(projectId));
      setTasks(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (confirm("Удалить задачу?")) {
      try {
        await tasksApi.delete(Number(projectId), taskId);
        setTasks(tasks.filter(t => t.id !== taskId));
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Вспомогательная функция цветов приоритета
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500'; // если есть medium
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Шапка */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div>
          <button onClick={() => navigate("/")} className="text-gray-400 hover:text-gray-800 text-sm mb-1 transition-colors">
            ← Назад
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {project?.name} 
            {loading && <span className="ml-2 text-sm text-gray-400 font-normal">Загрузка...</span>}
          </h1>
        </div>
        <Button onClick={() => setShowModal(true)} className="shadow-lg shadow-blue-500/20">
          + Добавить задачу
        </Button>
      </header>

      {/* Доска Drag-n-Drop */}
      <main className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex h-full min-w-[1000px] gap-6">
            {Object.entries(COLUMNS).map(([columnId, column]) => (
              <div key={columnId} className={`flex-1 flex flex-col rounded-xl ${column.color} border ${column.border} min-w-[320px]`}>
                
                {/* Заголовок колонки */}
                <div className="p-4 border-b border-gray-200/50 flex justify-between items-center">
                  <h2 className="font-bold text-gray-700 flex items-center gap-2">
                    {column.title}
                    <span className="bg-white/60 px-2 py-0.5 rounded-md text-xs text-gray-500 shadow-sm">
                      {tasks.filter(t => t.status === columnId).length}
                    </span>
                  </h2>
                </div>

                {/* Область для сброса задач */}
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar transition-colors ${
                        snapshot.isDraggingOver ? "bg-black/5" : ""
                      }`}
                      style={{ minHeight: '150px' }}
                    >
                      {tasks
                        .filter(task => task.status === columnId)
                        .map((task, index) => (
                          <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-lg p-4 shadow-sm border border-gray-100 group relative overflow-hidden transition-all hover:shadow-md ${
                                  snapshot.isDragging ? "shadow-xl rotate-2 scale-105 z-50 ring-2 ring-blue-400 opacity-90" : ""
                                }`}
                                style={provided.draggableProps.style}
                              >
                                {/* Цветная полоска приоритета слева */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityColor(task.priority)}`} />

                                <div className="pl-3">
                                  <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-gray-800 leading-snug">{task.title}</h3>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  
                                  <p className="text-sm text-gray-500 mb-3 line-clamp-3">{task.description}</p>
                                  
                                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                                    {task.deadline ? (
                                      <div className={`text-xs flex items-center gap-1 ${
                                        new Date(task.deadline) < new Date() ? 'text-red-500 font-medium' : 'text-gray-400'
                                      }`}>
                                        📅 {formatDate(task.deadline)}
                                      </div>
                                    ) : <div />}
                                    
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                      {task.priority}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </main>

      {/* Модальное окно создания задачи */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Новая задача</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Название</label>
                <input
                  type="text"
                  placeholder="Что нужно сделать?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Описание</label>
                <textarea
                  placeholder="Детали задачи..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Приоритет</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="low">Низкий 🟢</option>
                    <option value="normal">Средний 🔵</option>
                    <option value="high">Высокий 🔴</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Дедлайн</label>
                  <input 
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-600"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700">
                  Отмена
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                  Создать
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};