import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, FolderKanban, LogOut, Trash2, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { projectsApi } from "../api";
import { Button, Card, Input } from "../components/UI";
import { formatDate } from "../utils/dateUtils";

interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
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

  const handleDeleteProject = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm("Вы уверены, что хотите удалить проект?")) {
      try {
        await projectsApi.delete(id);
        loadProjects();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Навигация */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-800">AI To-Do</span>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Приветственный блок */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">
            Привет, {user?.name || "Пользователь"}! 👋
          </h1>
          <p className="text-slate-500 mt-2">Вот что происходит с твоими проектами сегодня.</p>
        </div>

        {/* Панель действий */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Поиск проектов..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-5 h-5 mr-1" /> Новый проект
          </Button>
        </div>

        {/* Сетка проектов */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4">
              <FolderKanban className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">
              {searchTerm ? "Ничего не найдено" : "Проектов пока нет"}
            </h3>
            <p className="text-slate-500 mt-1 mb-6">
              {searchTerm ? "Попробуйте изменить поисковый запрос." : "Создайте свой первый проект, чтобы начать."}
            </p>
            {!searchTerm && <Button onClick={() => setShowModal(true)}>Создать проект</Button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-50 p-3 rounded-xl group-hover:bg-indigo-100 transition-colors">
                    <FolderKanban className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {project.name}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">
                  {project.description}
                </p>
                
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs text-slate-400">
                  <span>{formatDate(project.created_at)}</span>
                  <span className="font-medium text-indigo-600 group-hover:translate-x-1 transition-transform">
                    Открыть →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <Card className="w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Новый проект</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <Input
                label="Название"
                placeholder="Например: Редизайн сайта"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                required
                autoFocus
              />
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Описание</label>
                <textarea
                  placeholder="Краткое описание проекта..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-24 resize-none"
                  required
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