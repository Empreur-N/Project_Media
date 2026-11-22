import React, { createContext, useState, useEffect, useContext } from 'react';
import { getProfile } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const profile = await getProfile(token);
          const savedData = localStorage.getItem('user_data');
          const parsedSaved = savedData ? JSON.parse(savedData) : {};
          setUser({ ...profile, ...parsedSaved });
        } catch (error) {
          console.error("Erreur lors de la récupération du profil:", error);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const loginUser = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    if (userData) {
      localStorage.setItem('user_data', JSON.stringify(userData));
    }
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
  };

  const isVisitor = !user || user.role === 'VISITOR';
  const role = user ? user.role : 'VISITOR';

  return (
    <AuthContext.Provider value={{ user, token, loading, login: loginUser, logout, isVisitor, role, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
