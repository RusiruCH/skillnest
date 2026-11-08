import axios from 'axios';

const API_BASE = '/api/playground';

/**
 * Helper to obtain auth headers using shared token storage
 */
export const getAuthHeaders = () => {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('skillnest_token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('jwt');

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }

  return headers;
};

/**
 * Check if a user is currently authenticated in the shared system
 */
export const getCurrentAuthUser = () => {
  const storedUser = localStorage.getItem('skillnest_user');
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed && (parsed.id || parsed._id)) {
        return {
          id: parsed.id || parsed._id,
          name: parsed.name || parsed.username || parsed.fullName || 'User',
          email: parsed.email,
          role: parsed.role
        };
      }
    } catch (e) {
      // Continue to token parsing
    }
  }

  const token =
    localStorage.getItem('skillnest_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('jwt');

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id || payload._id || payload.userId || payload.sub,
      name: payload.name || payload.username || payload.fullName || 'User',
      email: payload.email,
      role: payload.role
    };
  } catch (e) {
    return null;
  }
};

/**
 * Fetch module operational status
 */
export const fetchPlaygroundStatus = async () => {
  const response = await axios.get(`${API_BASE}/status`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

/**
 * Fetch supported programming languages
 */
export const fetchSupportedLanguages = async () => {
  const response = await axios.get(`${API_BASE}/languages`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

/**
 * Execute code via external sandboxed runner
 */
export const executeCodeApi = async ({ language, code, stdin = '' }) => {
  const response = await axios.post(
    `${API_BASE}/execute`,
    { language, code, stdin },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

/**
 * Save / Create a new code snippet
 */
export const createSnippetApi = async (snippetData) => {
  const response = await axios.post(`${API_BASE}/snippets`, snippetData, {
    headers: getAuthHeaders()
  });
  return response.data;
};

/**
 * Fetch all public snippets or current user's snippets
 */
export const fetchSnippetsApi = async ({ page = 1, limit = 12, language, search, tag, mySnippets } = {}) => {
  const params = { page, limit };
  if (language && language !== 'all') params.language = language;
  if (search && search.trim()) params.search = search.trim();
  if (tag) params.tag = tag;
  if (mySnippets) params.mySnippets = 'true';

  const response = await axios.get(`${API_BASE}/snippets`, {
    params,
    headers: getAuthHeaders()
  });
  return response.data;
};

/**
 * Fetch a single snippet by ID
 */
export const fetchSnippetByIdApi = async (id) => {
  const response = await axios.get(`${API_BASE}/snippets/${id}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

/**
 * Update snippet by ID (Owner only)
 */
export const updateSnippetApi = async (id, snippetData) => {
  const response = await axios.put(`${API_BASE}/snippets/${id}`, snippetData, {
    headers: getAuthHeaders()
  });
  return response.data;
};

/**
 * Delete snippet by ID (Owner only)
 */
export const deleteSnippetApi = async (id) => {
  const response = await axios.delete(`${API_BASE}/snippets/${id}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

/**
 * Fork an existing snippet
 */
export const forkSnippetApi = async (id) => {
  const response = await axios.post(
    `${API_BASE}/snippets/${id}/fork`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};
