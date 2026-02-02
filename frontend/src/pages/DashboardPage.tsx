import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, FolderKanban, LogOut, Trash2, Sparkles, TrendingUp, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { projectsApi } from "../api";
import { Button, Card, Input, ThemeToggle, Logo } from "../components/UI";
import { formatDate } from "../utils/dateUtils";

interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

// Генерация уникального градиента для каждого проекта
const getProjectGradient = (id: number) => {
  const gradients = [
    "from-violet-500 to-purple-600",
    "from-cyan-500 to-blue-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-emerald-500 to-teal-600",
    "from-fuchsia-500 to-pink-600",
  ];
  return gradients[id % gradients.length];
};

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    projectId: number | null;
    projectName: string;
  }>({ show: false, projectId: null, projectName: "" });
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
    loadTodayTasks();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayTasks = async () => {
    try {
      const data = await (await import("../api")).tasksApi.getToday();
      setTodayTasks(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectsApi.create(newProject.name, newProject.description);
      setNewProject({ name: "", description: "" });
      setShowModal(false);
      loadProjects();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setConfirmModal({ show: true, projectId: project.id, projectName: project.name });
  };

  const confirmDeleteProject = async () => {
    if (confirmModal.projectId) {
      try {
        await projectsApi.delete(confirmModal.projectId);
        loadProjects();
      } catch (error) {
        console.error(error);
      }
    }
    setConfirmModal({ show: false, projectId: null, projectName: "" });
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors relative">
      {/* Фоновые декоративные элементы */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#5c6cf2]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#f43f5e]/5 rounded-full blur-3xl" />
      </div>

      {/* Навигация */}
      <nav className="glass sticky top-0 z-30 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <Logo />
              <span className="font-bold text-xl gradient-text">AI To-Do</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {user?.email}
                </span>
              </div>
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/login"); }}>
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Выйти</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* Приветственный блок */}
        <div className="mb-10 animate-slideUp">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Привет, {user?.name || "Пользователь"}!
            </h1>
            <span className="text-3xl">👋</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">Вот что происходит с твоими проектами сегодня.</p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          {[
            { label: "Всего проектов", value: projects.length, icon: FolderKanban, color: "from-[#5c6cf2] to-[#7a8ff8]" },
            { label: "Активных", value: projects.length, icon: TrendingUp, color: "from-emerald-500 to-teal-500" },
            { label: "Выполнено задач", value: "—", icon: CheckCircle2, color: "from-amber-500 to-orange-500" },
          ].map((stat, i) => (
            <div key={i} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 rounded-2xl"
                style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
              <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-4 card-hover">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Сегодняшние задачи */}
        {todayTasks.length > 0 && (
          <div className="mb-8 animate-slideUp">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Сегодня</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {todayTasks.map((t, i) => (
                <div key={t.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{t.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{projects.find(p => p.id === t.project_id)?.name || 'Проект'} • {t.priority}</p>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{t.deadline ? formatDate(t.deadline) : '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Панель действий */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-[#5c6cf2]" />
            <input
              type="text"
              placeholder="Поиск проектов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-[#5c6cf2]/20 focus:border-[#5c6cf2]/60 outline-none transition-all shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
          <Button variant="gradient" onClick={() => setShowModal(true)}>
            <Plus className="w-5 h-5" /> Новый проект
          </Button>
        </div>

        {/* Сетка проектов */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-[#5c6cf2]/20 border-t-[#5c6cf2] animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-[#5c6cf2]" />
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-dashed border-slate-300/60 dark:border-slate-600/60 animate-slideUp">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl mb-4 shadow-inner">
              <FolderKanban className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {searchTerm ? "Ничего не найдено" : "Начните с первого проекта"}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6 max-w-md mx-auto">
              {searchTerm ? "Попробуйте изменить поисковый запрос." : "Создайте проект, чтобы организовать свои задачи и достигать целей быстрее."}
            </p>
            {!searchTerm && (
              <Button variant="gradient" onClick={() => setShowModal(true)}>
                <Sparkles className="w-4 h-4" /> Создать первый проект
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden cursor-pointer card-hover animate-slideUp"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                {/* Градиентная полоса сверху */}
                <div className={`h-1.5 bg-gradient-to-r ${getProjectGradient(project.id)}`} />

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${getProjectGradient(project.id)} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <FolderKanban className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeleteProject(e, project)}
                        className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all opacity-0 group-hover:opacity-100"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[#5c6cf2] dark:group-hover:text-[#7a8ff8] transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4 h-10">
                    {project.description}
                  </p>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(project.created_at)}
                    </span>
                    <span className="font-semibold text-[#5c6cf2] dark:text-[#7a8ff8] flex items-center gap-1 group-hover:gap-2 transition-all">
                      Открыть <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <Card className="w-full max-w-lg p-8 animate-slideUp">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5c6cf2] to-[#7a8ff8] flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Новый проект</h2>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-5">
              <Input
                label="Название"
                placeholder="Например: Редизайн сайта"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                required
                autoFocus
              />
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Описание</label>
                <textarea
                  placeholder="Краткое описание проекта..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-600/80 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5c6cf2]/20 focus:border-[#5c6cf2]/60 transition-all h-28 resize-none"
                  required
                />
              </div>
              <div className="flex gap-3 mt-8">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                  Отмена
                </Button>
                <Button type="submit" variant="gradient" className="flex-1">
                  <Sparkles className="w-4 h-4" /> Создать
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <Card className="w-full max-w-sm p-6 animate-slideUp">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Удалить проект?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
                Вы собираетесь удалить проект
              </p>
              <p className="font-semibold text-slate-900 dark:text-white mb-4">
                «{confirmModal.projectName}»
              </p>
              <p className="text-rose-500 dark:text-rose-400 text-xs mb-6">
                Все задачи проекта будут удалены. Это действие нельзя отменить.
              </p>

              <div className="flex gap-3 w-full">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setConfirmModal({ show: false, projectId: null, projectName: "" })}
                >
                  Отмена
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={confirmDeleteProject}
                >
                  <Trash2 className="w-4 h-4" /> Удалить
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};