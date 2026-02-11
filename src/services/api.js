import axios from 'axios';

//const API_URL = 'http://localhost:3636/api';
const API_URL = 'https://todo-backend-rust-nine.vercel.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Project API functions
export const projectAPI = {
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  update: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  }
};

// Column API functions
export const columnAPI = {
  getByProject: async (projectId) => {
    const response = await api.get(`/columns/project/${projectId}`);
    return response.data;
  },

  create: async (columnData) => {
    const response = await api.post('/columns', columnData);
    return response.data;
  },

  update: async (id, columnData) => {
    const response = await api.put(`/columns/${id}`, columnData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/columns/${id}`);
    return response.data;
  }
};

// Ticket API functions
export const ticketAPI = {
  getByProject: async (projectId) => {
    const response = await api.get(`/tickets/project/${projectId}`);
    return response.data;
  },

  getByColumn: async (columnId) => {
    const response = await api.get(`/tickets/column/${columnId}`);
    return response.data;
  },

  create: async (ticketData) => {
    const response = await api.post('/tickets', ticketData);
    return response.data;
  },

  update: async (id, ticketData) => {
    const response = await api.put(`/tickets/${id}`, ticketData);
    return response.data;
  },

  move: async (id, moveData) => {
    const response = await api.put(`/tickets/${id}/move`, moveData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/tickets/${id}`);
    return response.data;
  }
};

// Invitation API functions
export const invitationAPI = {
  getMyInvitations: async () => {
    const response = await api.get('/invitations/my-invitations');
    return response.data;
  },

  send: async (invitationData) => {
    const response = await api.post('/invitations', invitationData);
    return response.data;
  },

  accept: async (id) => {
    const response = await api.put(`/invitations/${id}/accept`);
    return response.data;
  },

  reject: async (id) => {
    const response = await api.put(`/invitations/${id}/reject`);
    return response.data;
  },

  getProjectMembers: async (projectId) => {
    const response = await api.get(`/invitations/project/${projectId}/members`);
    return response.data;
  }
};

export default api;
