import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      delete config.headers['Content-Type'];
    }
  }
  return config;
});

const api = {
  login: (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    return axiosInstance.post('/token', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  register: (data: { username: string; email: string; password: string }) => {
    return axiosInstance.post('/register', data);
  },

  uploadDataset: (formData: FormData) => {
    const token = localStorage.getItem('token');
    return axiosInstance.post('/dataset/upload', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': undefined
      }
    });
  },

  getAnalysis: () => {
    return axiosInstance.post('/analyze-consumption');
  },

  getDashboardData: () => {
    return axiosInstance.get('/dashboard');
  },
};

export default api; 