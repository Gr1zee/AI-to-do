const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem("token");
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string>) },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  },

  get(endpoint: string) {
    return this.request(endpoint, { method: "GET" });
  },

  post(endpoint: string, body: any) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  put(endpoint: string, body: any) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete(endpoint: string) {
    return this.request(endpoint, { method: "DELETE" });
  },
};

export const authApi = {
  register(email: string, name: string, password: string) {
    return apiClient.post("/users", { email, name, password });
  },

  login(email: string, password: string) {
    return apiClient.post("/auth/login", { email, password });
  },

  getProfile() {
    return apiClient.get("/auth/users/me");
  },
};

export const projectsApi = {
  getAll() {
    return apiClient.get("/projects");
  },

  create(name: string, description: string) {
    return apiClient.post("/projects", { name, description });
  },

  update(id: number, name: string, description: string) {
    return apiClient.put(`/projects/${id}`, { name, description });
  },

  delete(id: number) {
    return apiClient.delete(`/projects/${id}`);
  },
};

export const usersApi = {
  getAll() {
    return apiClient.get("/users");
  },
};
