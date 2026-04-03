const API_BASE = 'http://localhost:5000';

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('smartstock_role');
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
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
  getStats: () => apiFetch('/api/stats'),
  getAlerts: () => apiFetch('/api/alerts'), 
  getCategories: () => apiFetch('/categories'),
  getSales: () => apiFetch('/sales'),
  postSale: (body: any) => apiFetch('/sales', { method: 'POST', body: JSON.stringify(body) }),
  postCategory: (body: any) => apiFetch('/categories', { method: 'POST', body: JSON.stringify(body) }),
  restockProduct: (id: string, qty: number) => apiFetch('/api/restock', { 
    method: 'POST', 
    body: JSON.stringify({ productId: id, quantity: qty }) 
  }),
  getChartFlow: () => apiFetch('/api/charts/flow'),
  getChartProjections: () => apiFetch('/api/charts/projections'),
  chat: (message: string) => apiFetch('/api/chat', { 
    method: 'POST', 
    body: JSON.stringify({ message }) 
  }),
};

export default api;

