import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Plus, ArrowLeft, FolderKanban, LogOut, Trash2, 
  Clock, CheckCircle2, Circle, GripVertical,
  Calendar, Flag
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { tasksApi, projectsApi } from "../api";
import { Button, Card, Input } from "../components/UI";

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  deadline: string | null;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
}

type ColumnStatus = "pending" | "in_progress" | "completed";

const COLUMNS: { id: ColumnStatus; title: string; icon: React.ReactNode; color: string; bgColor: string }[] = [
  { 
    id: "pending", 
    title: "К выполнению", 
    icon: <Circle className="w-4 h-4" />,
    color: "text-slate-600",
    bgColor: "bg-slate-100"
  },
  { 
    id: "in_progress", 
    title: "В процессе", 
    icon: <Clock className="w-4 h-4" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  { 
    id: "completed", 
    title: "Завершено", 
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
];

const PRIORITIES: { value: string; label: string; color: string }[] = [
  { value: "low", label: "Низкий", color: "text-slate-500 bg-slate-100" },
  { value: "normal", label: "Средний", color: "text-blue-600 bg-blue-100" },
  { value: "high", label: "Высокий", color: "text-orange-600 bg-orange-100" },
  { value: "urgent", label: "Срочный", color: "text-red-600 bg-red-100" },
];

export const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "normal",
    deadline: ""
  });

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadTasks();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const projects = await projectsApi.getAll();
      const found = projects.find((p: Project) => p.id === Number(projectId));
      setProject(found || null);
    } catch (error) {
      console.error(error);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await tasksApi.getAll(Number(projectId));
      setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tasksApi.create(Number(projectId), {
        title: newTask.title,
        description: newTask.description || undefined,
        status: newTask.status,
        priority: newTask.priority,
        deadline: newTask.deadline || undefined
      });
      setNewTask({ title: "", description: "", status: "pending", priority: "normal", deadline: "" });
      setShowModal(false);
      loadTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (confirm("Удалить задачу?")) {
      try {
        await tasksApi.delete(Number(projectId), taskId);
        loadTasks();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    try {
      await tasksApi.update(Number(projectId), task.id, { status: newStatus });
      loadTasks();
    } catch (error) {
      console.error(error);
    }
  };

  // Drag & Drop
  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: ColumnStatus) => {
    if (draggedTask && draggedTask.status !== status) {
      await handleStatusChange(draggedTask, status);
    }
    setDraggedTask(null);
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityInfo = (priority: string) => {
    return PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const isOverdue = date < now;
    return {
      text: date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
      isOverdue
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Навигация */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Назад</span>
              </Link>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <FolderKanban className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-800">{project?.name || "Проект"}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 hidden sm:block">
                {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/login"); }}>
                <LogOut className="w-4 h-4 mr-2" /> Выйти
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="p-4 sm:p-6 lg:p-8">
        {/* Заголовок и действия */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{project?.name}</h1>
            <p className="text-slate-500 mt-1">{project?.description}</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-5 h-5 mr-1" /> Новая задача
          </Button>
        </div>

        {/* Канбан доска */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((column) => (
            <div
              key={column.id}
              className="bg-slate-100/50 rounded-2xl p-4"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              {/* Заголовок колонки */}
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className={`p-1.5 rounded-lg ${column.bgColor}`}>
                  <span className={column.color}>{column.icon}</span>
                </div>
                <h3 className="font-semibold text-slate-700">{column.title}</h3>
                <span className="ml-auto text-sm font-medium text-slate-400 bg-white px-2 py-0.5 rounded-full">
                  {getTasksByStatus(column.id).length}
                </span>
              </div>

              {/* Задачи */}
              <div className="space-y-3 min-h-[200px]">
                {getTasksByStatus(column.id).map((task) => {
                  const priorityInfo = getPriorityInfo(task.priority);
                  const deadlineInfo = formatDeadline(task.deadline);
                  
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group ${
                        draggedTask?.id === task.id ? "opacity-50 scale-95" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-slate-300 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 mb-1 break-words">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-slate-500 line-clamp-2 mb-3">{task.description}</p>
                          )}
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Приоритет */}
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityInfo.color}`}>
                              <Flag className="w-3 h-3 inline mr-1" />
                              {priorityInfo.label}
                            </span>
                            
                            {/* Дедлайн */}
                            {deadlineInfo && (
                              <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${
                                deadlineInfo.isOverdue 
                                  ? "text-red-600 bg-red-100" 
                                  : "text-slate-500 bg-slate-100"
                              }`}>
                                <Calendar className="w-3 h-3" />
                                {deadlineInfo.text}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-slate-300 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Пустая колонка */}
                {getTasksByStatus(column.id).length === 0 && (
                  <div className="flex items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                    Перетащите задачу сюда
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Модальное окно создания задачи */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <Card className="w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Новая задача</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <Input
                label="Название"
                placeholder="Что нужно сделать?"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
                autoFocus
              />
              
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">
                  Описание
                </label>
                <textarea
                  placeholder="Дополнительная информация..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">
                    Статус
                  </label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    {COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>{col.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">
                    Приоритет
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">
                  Дедлайн
                </label>
                <input
                  type="datetime-local"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex gap-3 mt-8">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                  Отмена
                </Button>
                <Button type="submit" className="flex-1">
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
