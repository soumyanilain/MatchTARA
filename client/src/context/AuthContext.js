import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [professor, setProfessor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('matchtara_token');
    if (token) {
      getMe()
        .then((res) => setProfessor(res.data))
        .catch(() => {
          localStorage.removeItem('matchtara_token');
          localStorage.removeItem('matchtara_professor');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, professorData) => {
    localStorage.setItem('matchtara_token', token);
    localStorage.setItem('matchtara_professor', JSON.stringify(professorData));
    setProfessor(professorData);
  };

  const logout = () => {
    localStorage.removeItem('matchtara_token');
    localStorage.removeItem('matchtara_professor');
    setProfessor(null);
  };

  return (
    <AuthContext.Provider value={{ professor, loading, login, logout, isAuthenticated: !!professor }}>
      {children}
    </AuthContext.Provider>
  );
};
