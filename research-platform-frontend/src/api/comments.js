import api from './axiosInstance';

const API_URL = '/comments';

const getAllComments = (publicationId) => {
  return api.get(`${API_URL}?publicationId=${publicationId}`);
};

const createComment = (commentData) => {
  return api.post(API_URL, commentData);
};

const updateComment = (commentId, commentData) => {
  return api.put(API_URL, { commentId, ...commentData });
};

const deleteComment = (commentId) => {
  return api.delete(`${API_URL}/${commentId}`);
};

const commentService = {
  getAllComments,
  createComment,
  updateComment,
  deleteComment
};

export default commentService;