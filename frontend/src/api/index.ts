const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-app-name.onrender.com'  // Render URL
  : 'http://localhost:8000';              // 本地开发 URL

// API 调用示例
export const fetchData = async () => {
  const response = await fetch(`${API_BASE_URL}/api/endpoint`);
  return response.json();
}; 