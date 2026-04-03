import { useAuth } from './auth/AuthContext';

const API_BASE = 'http://localhost:5000';

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const { getAuthHeader } = useAuth();
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader(),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }
  return res.json();
};

export const api = {
  getProducts: () => apiFetch('/products'),
  getStats: () => apiFetch('/stats'),  // Fixed to match backend
  getAlerts: () => apiFetch('/api/alerts'), 
  getCategories: () => apiFetch('/categories'),
  getSales: () => apiFetch('/sales'),
  // Add more as needed
};

export default api;

