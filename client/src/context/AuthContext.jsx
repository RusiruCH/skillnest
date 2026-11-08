import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_INSTRUCTOR = {
  id: 'u01',
  name: 'L.M.R.C. Bandara',
  email: 'instructor@skillnest.edu',
  role: 'instructor',
  regNo: 'SEU/IS/22/ICT/113',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  bio: 'Senior Lecturer in Software Engineering & Internet Application Development at SEUSL.',
};

const DEMO_USERS = {
  instructor: DEFAULT_INSTRUCTOR,
  learner: {
    id: 'u02',
    name: 'Kamal Perera',
    email: 'learner@skillnest.edu',
    role: 'learner',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    bio: 'ICT Undergraduate exploring Web Technologies and Cloud Computing.',
  },
  admin: {
    id: 'u03',
    name: 'System Administrator',
    email: 'admin@skillnest.edu',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: 'SkillNest Courseware Administrator.',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('skillnest_user');
    return saved ? JSON.parse(saved) : DEFAULT_INSTRUCTOR;
  });
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('skillnest_token');
    return saved && !saved.startsWith('demo_') ? saved : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('skillnest_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('skillnest_user');
    }
  }, [user]);

  useEffect(() => {
    if (token && !token.startsWith('demo_')) {
      localStorage.setItem('skillnest_token', token);
    } else {
      localStorage.removeItem('skillnest_token');
    }
  }, [token]);

  // Ensure a valid signed JWT exists for evaluation if user is currently loaded
  useEffect(() => {
    const syncAuthSession = async () => {
      const savedToken = localStorage.getItem('skillnest_token');
      const isDummyOrMissing = !savedToken || savedToken.startsWith('demo_');
      if (isDummyOrMissing && user?.email) {
        try {
          const res = await api.post('/auth/login', {
            email: user.email,
            password: 'password123',
          });
          if (res.data?.success && res.data?.token) {
            setToken(res.data.token);
            setUser(res.data.user);
          }
        } catch (_) {
          // Backend offline or non-default credentials
        }
      }
    };
    syncAuthSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed.' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data?.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Registration failed.' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('skillnest_user');
    localStorage.removeItem('skillnest_token');
  };

  // Instant role switch with real JWT authentication from backend
  const switchRole = async (role) => {
    const credentials = {
      instructor: { email: 'instructor@skillnest.edu', password: 'password123' },
      learner: { email: 'learner@skillnest.edu', password: 'password123' },
      admin: { email: 'admin@skillnest.edu', password: 'password123' },
    };

    if (credentials[role]) {
      try {
        const res = await api.post('/auth/login', credentials[role]);
        if (res.data?.success && res.data?.token) {
          setUser(res.data.user);
          setToken(res.data.token);
          return { success: true };
        }
      } catch (err) {
        console.warn('Backend login unavailable for role switch, fallback to mock user:', err.message);
      }
    }

    if (DEMO_USERS[role]) {
      setUser(DEMO_USERS[role]);
      setToken(null);
    }
    return { success: true };
  };

  const isAuthenticated = Boolean(token && !token.startsWith('demo_'));

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

