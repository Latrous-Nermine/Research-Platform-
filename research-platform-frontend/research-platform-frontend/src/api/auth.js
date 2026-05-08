import api from './axiosInstance';

const API_URL = '/auth';

const login = async (credentials) => {
  const response = await api.post(`${API_URL}/login`, credentials);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

export default {
  login,
  logout
};