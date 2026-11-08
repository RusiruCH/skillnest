import api from './api';

/**
 * Module 3: Code Playground API Service
 * Contributor: Member 3 (B.S.D.P. Wickramasingha - SEU/IS/22/ICT/013)
 */

export const playgroundService = {
  // Get supported languages and configuration
  getConfig: async () => {
    const res = await api.get('/playground/config');
    return res.data;
  },

  // Execute source code in isolated sandbox
  executeCode: async ({ language, sourceCode, stdin = '' }) => {
    const res = await api.post('/playground/execute', {
      language,
      sourceCode,
      stdin,
    });
    return res.data;
  },

  // Retrieve learner's execution history
  getHistory: async (params = {}) => {
    const res = await api.get('/playground/history', { params });
    return res.data;
  },

  // Retrieve single execution record
  getRecord: async (id) => {
    const res = await api.get(`/playground/history/${id}`);
    return res.data;
  },

  // Delete a specific execution record
  deleteRecord: async (id) => {
    const res = await api.delete(`/playground/history/${id}`);
    return res.data;
  },

  // Clear all execution history
  clearHistory: async () => {
    const res = await api.delete('/playground/history');
    return res.data;
  },
};

export default playgroundService;

