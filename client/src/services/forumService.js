import api from './api';

export const forumService = {
  // Get all threads with query params (search, category, tag, sort, page, limit)
  getPosts: async (params = {}) => {
    const response = await api.get('/forum/posts', { params });
    return response.data;
  },

  // Get single thread by ID
  getPostById: async (id) => {
    const response = await api.get(`/forum/posts/${id}`);
    return response.data;
  },

  // Create new thread
  createPost: async (postData) => {
    const response = await api.post('/forum/posts', postData);
    return response.data;
  },

  // Update thread (Author or Admin)
  updatePost: async (id, postData) => {
    const response = await api.put(`/forum/posts/${id}`, postData);
    return response.data;
  },

  // Delete thread (Author or Admin)
  deletePost: async (id) => {
    const response = await api.delete(`/forum/posts/${id}`);
    return response.data;
  },

  // Upvote or downvote post
  votePost: async (id, direction) => {
    const response = await api.patch(`/forum/posts/${id}/vote`, { direction });
    return response.data;
  },

  // Pin/unpin thread (Admin only)
  pinPost: async (id) => {
    const response = await api.patch(`/forum/posts/${id}/pin`);
    return response.data;
  },

  // Close/reopen thread (Author or Admin)
  closePost: async (id) => {
    const response = await api.patch(`/forum/posts/${id}/close`);
    return response.data;
  },

  // Get answers for a specific post
  getAnswers: async (postId) => {
    const response = await api.get(`/forum/posts/${postId}/answers`);
    return response.data;
  },

  // Post an answer/reply
  createAnswer: async (postId, answerData) => {
    const response = await api.post(`/forum/posts/${postId}/answers`, answerData);
    return response.data;
  },

  // Update answer
  updateAnswer: async (answerId, answerData) => {
    const response = await api.put(`/forum/answers/${answerId}`, answerData);
    return response.data;
  },

  // Delete answer
  deleteAnswer: async (answerId) => {
    const response = await api.delete(`/forum/answers/${answerId}`);
    return response.data;
  },

  // Vote on answer
  voteAnswer: async (answerId, direction) => {
    const response = await api.patch(`/forum/answers/${answerId}/vote`, { direction });
    return response.data;
  },

  // Accept/unaccept answer as solution
  acceptAnswer: async (answerId) => {
    const response = await api.patch(`/forum/answers/${answerId}/accept`);
    return response.data;
  },

  // Get forum statistics (Admin)
  getForumStats: async () => {
    const response = await api.get('/forum/stats');
    return response.data;
  },
};

