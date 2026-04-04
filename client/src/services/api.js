import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach JWT to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('matchtara_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('matchtara_token');
      localStorage.removeItem('matchtara_professor');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──
export const registerProfessor = (data) => API.post('/auth/register', data);
export const loginProfessor = (data) => API.post('/auth/login', data);
export const verifyEmail = (token) => API.get(`/auth/verify/${token}`);
export const getMe = () => API.get('/auth/me');

// ── Positions ──
export const getPositions = (params) => API.get('/positions', { params });
export const getPositionById = (id) => API.get(`/positions/${id}`);
export const createPosition = (data) => API.post('/positions', data);
export const updatePosition = (id, data) => API.put(`/positions/${id}`, data);
export const closePosition = (id) => API.patch(`/positions/${id}/close`);
export const deletePosition = (id) => API.delete(`/positions/${id}`);

// ── Applications ──
export const submitApplication = (formData) =>
  API.post('/applications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getApplicationsByPosition = (positionId, params) =>
  API.get(`/applications/position/${positionId}`, { params });
export const getApplicationById = (id) => API.get(`/applications/${id}`);
export const updateApplicationStatus = (id, status) =>
  API.patch(`/applications/${id}/status`, { status });

// ── Dashboard ──
export const getMyPositions = () => API.get('/dashboard/my-positions');
export const getRecentApplications = () => API.get('/dashboard/recent-applications');

export default API;
