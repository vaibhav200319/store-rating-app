import api from "./axios";

export const getAdminDashboardApi = () => api.get("/admin/dashboard");
