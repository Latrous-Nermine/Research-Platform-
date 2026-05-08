import api from './axiosInstance';

const API_URL = '/users';

const getAllUsers = () => {
  return api.get(API_URL);
};

const getUsersByRole = (role) => {
  return api.get(`${API_URL}/by-role?role=${role}`);
};

const getUserById = (id) => {
  return api.get(`${API_URL}/${id}`);
};

const createUser = async (userData) => {
  const response = await api.post(API_URL, userData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

const updateUser = (id, userData) => {
  return api.put(`${API_URL}/${id}`, userData);
};

const deleteUser = (id) => {
  return api.delete(`${API_URL}/${id}`);
};

const userService = {
  getAllUsers,
  getUsersByRole,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};

export default userService;