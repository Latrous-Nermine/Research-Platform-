import api from './axiosInstance';

const API_URL = '/domains';

const getAllDomains = () => {
  return api.get(API_URL);
};

const getDomainById = (id) => {
  return api.get(`${API_URL}/${id}`);
};

const createDomain = (domainData) => {
  return api.post(API_URL, domainData);
};

const updateDomain = (id, domainData) => {
  return api.put(`${API_URL}/${id}`, domainData);
};

const deleteDomain = (id) => {
  return api.delete(`${API_URL}/${id}`);
};

const domainService = {
  getAllDomains,
  getDomainById,
  createDomain,
  updateDomain,
  deleteDomain
};

export default domainService;