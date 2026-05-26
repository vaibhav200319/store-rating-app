import api from "./axios";

export const loginApi = (email, password) =>
  api.post("/auth/login", { email, password });

export const registerApi = (data) => api.post("/auth/register", data);

export const getProfileApi = () => api.get("/auth/profile");
