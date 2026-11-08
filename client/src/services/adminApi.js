/**
 * adminApi.js — Module 2: Instructor & Course Approval Management
 * Separate API service so we do NOT modify Member 01's api.js
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('skillnest_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Admin Approval API ────────────────────────────────────────────────────────

export const adminAPI = {
  // Dashboard
  getDashboardStats: () =>
    axios.get(`${BASE_URL}/admin/dashboard`, { headers: getAuthHeaders() }),

  // Instructor Applications
  getAllInstructorApplications: (params = {}) =>
    axios.get(`${BASE_URL}/admin/instructor-applications`, {
      headers: getAuthHeaders(),
      params,
    }),

  getInstructorApplicationById: (id) =>
    axios.get(`${BASE_URL}/admin/instructor-applications/${id}`, {
      headers: getAuthHeaders(),
    }),

  approveInstructorApplication: (id, remarks = '') =>
    axios.put(
      `${BASE_URL}/admin/instructor-applications/${id}/approve`,
      { remarks },
      { headers: getAuthHeaders() }
    ),

  rejectInstructorApplication: (id, remarks) =>
    axios.put(
      `${BASE_URL}/admin/instructor-applications/${id}/reject`,
      { remarks },
      { headers: getAuthHeaders() }
    ),

  undoInstructorApplicationStatus: (id) =>
    axios.put(
      `${BASE_URL}/admin/instructor-applications/${id}/undo`,
      {},
      { headers: getAuthHeaders() }
    ),

  // Course Approvals
  getAllCourses: (params = {}) =>
    axios.get(`${BASE_URL}/admin/courses`, {
      headers: getAuthHeaders(),
      params,
    }),

  getPendingCourses: () =>
    axios.get(`${BASE_URL}/admin/courses/pending`, { headers: getAuthHeaders() }),

  getCourseById: (id) =>
    axios.get(`${BASE_URL}/admin/courses/${id}`, { headers: getAuthHeaders() }),

  approveCourse: (id, remarks = '') =>
    axios.put(
      `${BASE_URL}/admin/courses/${id}/approve`,
      { remarks },
      { headers: getAuthHeaders() }
    ),

  rejectCourse: (id, remarks) =>
    axios.put(
      `${BASE_URL}/admin/courses/${id}/reject`,
      { remarks },
      { headers: getAuthHeaders() }
    ),

  undoCourseStatus: (id) =>
    axios.put(
      `${BASE_URL}/admin/courses/${id}/undo`,
      {},
      { headers: getAuthHeaders() }
    ),

  // Approval History
  getApprovalHistory: (params = {}) =>
    axios.get(`${BASE_URL}/admin/approval-history`, {
      headers: getAuthHeaders(),
      params,
    }),
};

// ─── Instructor Application API (for learners) ────────────────────────────────

export const applicationAPI = {
  submitApplication: (data) =>
    axios.post(`${BASE_URL}/instructor-applications`, data, {
      headers: getAuthHeaders(),
    }),

  getMyApplicationStatus: () =>
    axios.get(`${BASE_URL}/instructor-applications/my-status`, {
      headers: getAuthHeaders(),
    }),
};
