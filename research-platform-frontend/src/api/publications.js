import api from './axiosInstance';

const API_URL = '/publications';

const getAllPublications = () => {
  return api.get(API_URL);
};

const getPublicationById = (id) => {
  return api.get(`${API_URL}/${id}`);
};

const createPublication = async (formData) => {
  const response = await api.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

const updatePublication = (id, publicationData) => {
  return api.put(`${API_URL}/${id}`, publicationData);
};

const updatePublicationStatus = (id, status) => {
  return api.put(`${API_URL}/${id}/status`, `"${status}"`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

const updatePublicationPremium = (id, premium) => {
  return api.put(`${API_URL}/${id}/premium`, { premium });
};

const deletePublication = (id) => {
  return api.delete(`${API_URL}/${id}`);
};

export default {
  getAllPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  updatePublicationStatus,
  updatePublicationPremium,
  deletePublication
};