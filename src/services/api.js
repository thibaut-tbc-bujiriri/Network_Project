/**
 * Service API pour les appels HTTP
 * Prêt à être connecté à un backend
 */
import axios from 'axios';

// Configuration de base de l'API
// TODO: Remplacer par l'URL de votre backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Instance Axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
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

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Rediriger vers la page de login si non authentifié
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Méthodes API (à compléter selon vos besoins)
export const apiService = {
  // Authentification
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  
  // Routeurs
  getRouteurDevices: () => api.get('/routeur/devices'),
  getRouteurDevice: (id) => api.get(`/routeur/devices/${id}`),
  
  // Windows Server
  getWindowsServers: () => api.get('/windows-servers'),
  getWindowsServer: (id) => api.get(`/windows-servers/${id}`),
  
  // Users
  getUsers: () => api.get('/users'),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  // Logs
  getLogs: (params) => api.get('/logs', { params }),
  
  // Dashboard stats
  getDashboardStats: () => api.get('/dashboard/stats'),
};

export default api;

