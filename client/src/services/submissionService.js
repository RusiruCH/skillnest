import api from './api';

export const submissionService = {
  // Submit solution to a challenge (Learner)
  submitSolution: async (challengeId, submissionData) => {
    const response = await api.post(`/challenges/${challengeId}/submit`, submissionData);
    return response.data;
  },

  // Retrieve logged-in learner's submission history
  getMySubmissions: async () => {
    const response = await api.get('/submissions/my-submissions');
    return response.data;
  },

  // Retrieve all submissions for a challenge (Instructor / Admin)
  getChallengeSubmissions: async (challengeId) => {
    const response = await api.get(`/submissions/challenge/${challengeId}`);
    return response.data;
  },

  // Retrieve single submission by ID
  getSubmissionById: async (id) => {
    const response = await api.get(`/submissions/${id}`);
    return response.data;
  },

  // Update submission status or feedback / Grade submission (Instructor / Admin)
  gradeSubmission: async (id, gradeData) => {
    const response = await api.put(`/submissions/${id}/grade`, gradeData);
    return response.data;
  },
};
