const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://energy-saving-assistant.onrender.com'  // 生产环境 API
  : 'http://localhost:8000';                        // 开发环境 API

// API 调用示例
export const fetchData = async () => {
  const response = await fetch(`${API_BASE_URL}/api/endpoint`);
  return response.json();
}; 