import { STORAGE_KEYS } from "./constants";

export const getToken = () => localStorage.getItem(STORAGE_KEYS.TOKEN);

export const setToken = (token) => localStorage.setItem(STORAGE_KEYS.TOKEN, token);

export const removeToken = () => localStorage.removeItem(STORAGE_KEYS.TOKEN);

export const getStoredUser = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  return raw ? JSON.parse(raw) : null;
};

export const setStoredUser = (user) =>
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

export const removeStoredUser = () => localStorage.removeItem(STORAGE_KEYS.USER);

export const clearAuthStorage = () => {
  removeToken();
  removeStoredUser();
};
