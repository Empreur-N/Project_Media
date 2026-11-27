import React, { createContext, useState, useEffect, useContext } from 'react';
import { getProfile, logoutSession } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const profile = await getProfile(token);
          const savedData = localStorage.getItem('user_data');
          const parsedSaved = savedData ? JSON.parse(savedData) : {};
          const merged = { ...parsedSaved, ...profile };
          setUser(merged);
          localStorage.setItem('user_data', JSON.stringify(merged));
        } catch (error) {
          console.warn("Vérification profil:", error.message);
          // Uniquement déconnecter si le token est définitivement révoqué / 401
          if (error.message && (error.message.includes('401') || error.message.includes('privilèges incorrects') || error.message.includes('non autorisé'))) {
            logout();
          }
        }
      }
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

  const updateUser = (newUserData) => {
    setUser(prev => {
      const updated = { ...prev, ...newUserData };
      localStorage.setItem('user_data', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    const currentSessionId = user?.sessionId;
    const currentUsername = user?.username;
    if (currentSessionId || currentUsername) {
      logoutSession(currentSessionId, currentUsername).catch(() => {});
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
  };

  const isVisitor = !user || user.role === 'VISITOR';
  const role = user ? user.role : 'VISITOR';

  return (
    <AuthContext.Provider value={{ user, token, loading, login: loginUser, logout, updateUser, isVisitor, role, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
