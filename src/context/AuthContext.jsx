import {
  createContext,
  useEffect,
  useState,
} from 'react';
import { api } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error(
          'No se pudo recuperar la sesión:',
          error,
        );

        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);

    localStorage.setItem(
      'user',
      JSON.stringify(userData),

    );

    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
  };

  const updateUser = async (profileData) => {
    const updatedProfile = await api.put(
      '/users/me',
      profileData,
    );

    const updatedUser = {
      ...user,
      ...updatedProfile,
      token: user?.token,
    };

    setUser(updatedUser);

    localStorage.setItem(
      'user',
      JSON.stringify(updatedUser),
    );

    return updatedUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};