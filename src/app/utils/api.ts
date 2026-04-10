const API_URL = 'http://localhost:3333/api';

const getHeaders = () => {
  const token = localStorage.getItem('@giromob:token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error(`API GET request failed for ${endpoint}`);
    return response.json();
  },
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Falha no POST para ${endpoint}`);
    }
    return response.json();
  },
  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`API PUT request failed for ${endpoint}`);
    return response.json();
  },
  delete: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error(`API DELETE request failed for ${endpoint}`);
    return response.json();
  }
};
