export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const STORAGE_KEYS = {
  TOKEN: "store_rating_token",
  USER: "store_rating_user",
};

export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
  OWNER: "OWNER",
};

export const ROLE_HOME = {
  ADMIN: "/admin",
  USER: "/stores",
  OWNER: "/owner",
};
