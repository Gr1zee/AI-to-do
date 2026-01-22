import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Plus, ArrowLeft, FolderKanban, LogOut, Trash2,
  Clock, CheckCircle2, Circle, GripVertical,
  Calendar, Flag, Users, UserPlus, X, Shield, Eye, Edit3
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { tasksApi, projectsApi, membersApi } from "../api";
import { Button, Card, Input, ThemeToggle } from "../components/UI";

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
  user_id?: number;
  owner_email?: string;
}

interface Member {
  id: number;
  user_id: number;
  email: string;
  role: "editor" | "viewer";
  added_at: string;
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
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [newMember, setNewMember] = useState({ email: "", role: "viewer" as "editor" | "viewer" });
  const [memberError, setMemberError] = useState<string | null>(null);
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
      loadMembers();
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

  const loadMembers = async () => {
    try {
      const data = await membersApi.getAll(Number(projectId));
      setMembers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const isOwner = project?.user_id === user?.id;

  // Вычисляем роль текущего пользователя
  const getUserRole = (): { role: string; label: string; color: string } => {
    if (isOwner) {
      return { role: "owner", label: "Владелец", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" };
    }
    const myMembership = members.find(m => m.user_id === user?.id);
    if (myMembership?.role === "editor") {
      return { role: "editor", label: "Редактор", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" };
    }
    return { role: "viewer", label: "Просмотр", color: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" };
  };

  const userRole = getUserRole();

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError(null);
    try {
      await membersApi.add(Number(projectId), newMember.email, newMember.role);
      setNewMember({ email: "", role: "viewer" });
      loadMembers();
    } catch (error: any) {
      setMemberError(error.message || "Ошибка при добавлении участника");
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (confirm("Удалить участника из проекта?")) {
      try {
        await membersApi.remove(Number(projectId), userId);
        loadMembers();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleUpdateMemberRole = async (userId: number, newRole: "editor" | "viewer") => {
    try {
      await membersApi.updateRole(Number(projectId), userId, newRole);
      loadMembers();
    } catch (error) {
      console.error(error);
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Навигация */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Назад</span>
              </Link>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <FolderKanban className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-800 dark:text-white">{project?.name || "Проект"}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${userRole.color}`}>
                  {userRole.label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                {user?.email}
              </span>
              <ThemeToggle />
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project?.name}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{project?.description}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowMembersModal(true)}>
              <Users className="w-5 h-5 mr-1" /> Участники
              {members.length > 0 && (
                <span className="ml-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full text-xs font-medium">
                  {members.length}
                </span>
              )}
            </Button>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-5 h-5 mr-1" /> Новая задача
            </Button>
          </div>
        </div>

        {/* Канбан доска */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((column) => (
            <div
              key={column.id}
              className="bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl p-4"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              {/* Заголовок колонки */}
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className={`p-1.5 rounded-lg ${column.bgColor} dark:opacity-80`}>
                  <span className={column.color}>{column.icon}</span>
                </div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">{column.title}</h3>
                <span className="ml-auto text-sm font-medium text-slate-400 bg-white dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
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
                      className={`bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group ${draggedTask?.id === task.id ? "opacity-50 scale-95" : ""
                        }`}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-slate-300 dark:text-slate-600 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 dark:text-white mb-1 break-words">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{task.description}</p>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Приоритет */}
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityInfo.color} dark:opacity-90`}>
                              <Flag className="w-3 h-3 inline mr-1" />
                              {priorityInfo.label}
                            </span>

                            {/* Дедлайн */}
                            {deadlineInfo && (
                              <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${deadlineInfo.isOverdue
                                ? "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/40"
                                : "text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700"
                                }`}>
                                <Calendar className="w-3 h-3" />
                                {deadlineInfo.text}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Пустая колонка */}
                {getTasksByStatus(column.id).length === 0 && (
                  <div className="flex items-center justify-center h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-sm">
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Новая задача</h2>
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
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
                  Описание
                </label>
                <textarea
                  placeholder="Дополнительная информация..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
                    Статус
                  </label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    {COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>{col.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
                    Приоритет
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
                  Дедлайн
                </label>
                <input
                  type="datetime-local"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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

      {/* Модальное окно участников */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <Card className="w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5" /> Участники проекта
              </h2>
              <button
                onClick={() => setShowMembersModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Форма добавления (только для владельца) */}
            {isOwner && (
              <form onSubmit={handleAddMember} className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Добавить участника
                </h3>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Email пользователя"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    required
                    className="flex-1"
                  />
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value as "editor" | "viewer" })}
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="viewer">Просмотр</option>
                    <option value="editor">Редактор</option>
                  </select>
                  <Button type="submit" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {memberError && (
                  <p className="text-red-500 text-sm mt-2">{memberError}</p>
                )}
              </form>
            )}

            {/* Список участников */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {/* Владелец */}
              <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{project?.owner_email || user?.email}</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">Владелец</p>
                  </div>
                </div>
              </div>

              {/* Участники */}
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${member.role === "editor"
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-slate-100 dark:bg-slate-700"
                      }`}>
                      {member.role === "editor"
                        ? <Edit3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        : <Eye className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{member.email}</p>
                      <p className={`text-xs ${member.role === "editor"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-500 dark:text-slate-400"
                        }`}>
                        {member.role === "editor" ? "Редактор" : "Только просмотр"}
                      </p>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateMemberRole(member.user_id, e.target.value as "editor" | "viewer")}
                        className="text-sm px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg"
                      >
                        <option value="viewer">Просмотр</option>
                        <option value="editor">Редактор</option>
                      </select>
                      <button
                        onClick={() => handleRemoveMember(member.user_id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {members.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Нет участников</p>
                  {isOwner && <p className="text-sm">Добавьте участников по email</p>}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="secondary" className="w-full" onClick={() => setShowMembersModal(false)}>
                Закрыть
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
