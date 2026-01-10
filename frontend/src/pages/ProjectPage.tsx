import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { tasksApi, projectsApi } from "../api";
import { Button, Card } from "../components/UI";
import { formatDate } from "../utils/dateUtils";

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  deadline: string | null;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export const ProjectPage = () => {
  useAuth();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "normal",
    status: "pending",
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
      const currentProject = projects.find(
        (p: Project) => p.id === Number(projectId)
      );
      if (currentProject) {
        setProject(currentProject);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to load project:", error);
      navigate("/");
    }
  };

  const loadTasks = async () => {
    try {
      const data = await tasksApi.getAll(Number(projectId));
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tasksApi.create(Number(projectId), newTask);
      setNewTask({ title: "", description: "", priority: "normal", status: "pending" });
      setShowModal(false);
      loadTasks();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (confirm("Are you sure?")) {
      try {
        await tasksApi.delete(Number(projectId), taskId);
        loadTasks();
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await tasksApi.update(Number(projectId), taskId, { status: newStatus });
      loadTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "pending":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:text-blue-800 mb-2 text-sm"
            >
              ← Back to Projects
            </button>
            <h1 className="text-2xl font-bold">{project?.name}</h1>
            <p className="text-gray-600">{project?.description}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Tasks</h2>
          <Button onClick={() => setShowModal(true)}>+ New Task</Button>
        </div>

        {/* Tasks List */}
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : tasks.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600 mb-4">No tasks yet. Create one to get started!</p>
            <Button onClick={() => setShowModal(true)}>Create First Task</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">{task.title}</h3>
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.deadline && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        Due: {formatDate(task.deadline)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-col">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`px-3 py-2 rounded text-white font-medium cursor-pointer ${getStatusColor(task.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteTask(task.id)}
                    className="w-full sm:w-auto"
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
            <h2 className="text-2xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder="Description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              />
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="high">High Priority</option>
              </select>
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
