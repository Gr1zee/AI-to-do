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
      console.error("Failed to load projects:", error);
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
      console.error("Failed to create project:", error);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (confirm("Are you sure?")) {
      try {
        await projectsApi.delete(id);
        loadProjects();
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleOpenProject = (projectId: number) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">AI To-Do</h1>
            <p className="text-gray-600">Welcome, {user?.name}!</p>
          </div>
          <Button onClick={handleLogout} variant="secondary">
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Your Projects</h2>
          <Button onClick={() => setShowModal(true)}>+ New Project</Button>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : projects.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600 mb-4">No projects yet. Create one to get started!</p>
            <Button onClick={() => setShowModal(true)}>Create First Project</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <p className="text-sm text-gray-500">
                    Created {formatDate(project.created_at)}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="secondary" 
                    className="flex-1"
                    onClick={() => handleOpenProject(project.id)}
                  >
                    Open
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <input
                type="text"
                placeholder="Project name"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder="Description"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                required
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
