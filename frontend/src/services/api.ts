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

  getAnalysis: async () => {
    console.log('Making API request to:', `${BASE_URL}/dashboard`);
    try {
      const token = localStorage.getItem('token');
      console.log('Using token:', token);
      
      const response = await axios.get(`${BASE_URL}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('API response received:', response);
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  getDashboardData: () => {
    return axiosInstance.get('/dashboard');
  },
};

export default api; 