import api from './api';

export const challengeService = {
  // Retrieve challenges with optional search, difficulty, status, sort
  getChallenges: async (params = {}) => {
    const response = await api.get('/challenges', { params });
    return response.data;
  },

  // Retrieve single challenge by ID
  getChallengeById: async (id) => {
    const response = await api.get(`/challenges/${id}`);
    return response.data;
  },

  // Create new challenge (Instructor / Admin)
  createChallenge: async (challengeData) => {
    const response = await api.post('/challenges', challengeData);
    return response.data;
  },

  // Update existing challenge (Instructor / Admin)
  updateChallenge: async (id, challengeData) => {
    const response = await api.put(`/challenges/${id}`, challengeData);
    return response.data;
  },

  // Delete challenge (Instructor / Admin)
  deleteChallenge: async (id) => {
    const response = await api.delete(`/challenges/${id}`);
    return response.data;
  },

  // Retrieve challenges created by current instructor
  getInstructorChallenges: async () => {
    const response = await api.get('/challenges/instructor/my-challenges');
    return response.data;
  },

  // Get summary stats for dashboard
  getChallengeStats: async () => {
    const response = await api.get('/challenges/stats/summary');
    return response.data;
  },

  // Seed sample database demo
  seedDatabase: async () => {
    const response = await api.post('/challenges/seed');
    return response.data;
  },
};
