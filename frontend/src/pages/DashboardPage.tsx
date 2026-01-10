import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectsApi } from "../api";
import { Button, Card } from "../components/UI";
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
  const [searchTerm, setSearchTerm] = useState(""); // Поиск
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
    e.stopPropagation(); // Чтобы не открывался проект при клике на удаление
    if (confirm("Вы уверены, что хотите удалить проект?")) {
      try {
        await projectsApi.delete(id);
        loadProjects();
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Фильтрация проектов
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header с градиентом */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pb-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">🤖</span> AI To-Do
            </h1>
            <div className="flex items-center gap-4">
              <span className="opacity-80">Привет, {user?.name}</span>
              <button 
                onClick={() => { logout(); navigate("/login"); }}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Выйти
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Мои Проекты</h2>
              <p className="opacity-80">Управляйте задачами с помощью интеллекта</p>
            </div>
            <Button 
              onClick={() => setShowModal(true)} 
              className="bg-white text-blue-600 hover:bg-blue-50 border-none shadow-lg"
            >
              + Новый проект
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content (поднят вверх с отрицательным margin) */}
      <main className="max-w-7xl mx-auto px-4 -mt-16 pb-12 relative z-10">
        
        {/* Поиск */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Поиск проектов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-3 rounded-xl border-none shadow-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="text-center py-16 rounded-2xl shadow-sm border-none">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Проектов пока нет</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {searchTerm ? "Ничего не найдено по вашему запросу." : "Создайте свой первый проект, чтобы начать управлять задачами эффективно."}
            </p>
            {!searchTerm && <Button onClick={() => setShowModal(true)}>Создать проект</Button>}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
              >
                {/* Декоративная полоса сверху */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteProject(e, project.id)}
                    className="text-gray-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    title="Удалить"
                  >
                    🗑️
                  </button>
                </div>
                
                <p className="text-gray-600 mb-6 line-clamp-2 h-12 text-sm">
                  {project.description}
                </p>
                
                <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-4">
                  <span>Создан: {formatDate(project.created_at)}</span>
                  <span className="font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                    Открыть →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal - Создание проекта */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold mb-1 text-gray-800">Новый Проект</h2>
            <p className="text-gray-500 mb-6 text-sm">Придумайте название и описание для новой цели.</p>
            
            <form onSubmit={handleCreateProject}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    placeholder="Например: Редизайн сайта"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-shadow"
                    placeholder="Кратко опишите суть проекта..."
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800"
                  onClick={() => setShowModal(false)}
                >
                  Отмена
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30">
                  Создать проект
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};