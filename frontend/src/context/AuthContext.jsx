import { createContext, useEffect, useState } from "react";
import { getProfileApi, loginApi, registerApi } from "../api/auth";
import { ROLE_HOME } from "../utils/constants";
import {
  clearAuthStorage,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from "../utils/storage";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on app load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = getToken();
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await getProfileApi();
        setUser(data.user);
        setStoredUser(data.user);
        setTokenState(savedToken);
      } catch {
        clearAuthStorage();
        setUser(null);
        setTokenState(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await loginApi(email, password);
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    setStoredUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await registerApi(formData);
    return data;
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
    setTokenState(null);
  };

  const getHomePath = () => (user ? ROLE_HOME[user.role] || "/login" : "/login");

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, getHomePath, isAuthenticated: Boolean(token && user) }}
    >
      {children}
    </AuthContext.Provider>
  );
};
