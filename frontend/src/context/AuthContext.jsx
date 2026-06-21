import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vpass_token'));
  const [loading, setLoading] = useState(true);

  // On mount, check if we have a stored token and load user
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('vpass_token');
      const storedUser = localStorage.getItem('vpass_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Verify token is still valid
        try {
          const res = await authAPI.getMe();
          setUser(res.data.data);
          localStorage.setItem('vpass_user', JSON.stringify(res.data.data));
        } catch {
          // Token expired or invalid
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user: userData, token: authToken } = res.data.data;

    setUser(userData);
    setToken(authToken);
    localStorage.setItem('vpass_token', authToken);
    localStorage.setItem('vpass_user', JSON.stringify(userData));

    return userData;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    const { user: userData, token: authToken } = res.data.data;

    setUser(userData);
    setToken(authToken);
    localStorage.setItem('vpass_token', authToken);
    localStorage.setItem('vpass_user', JSON.stringify(userData));

    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vpass_token');
    localStorage.removeItem('vpass_user');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
