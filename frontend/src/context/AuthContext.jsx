import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ name: 'Instructor Demo', role: 'instructor' });
  return (
    <AuthContext.Provider value={{ user, setUser, token: 'mock-token' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || { user: null };
};

export default AuthContext;
