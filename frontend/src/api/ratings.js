import api from "./axios";

export const submitRatingApi = (storeId, rating) =>
  api.post("/ratings", { storeId, rating });

export const updateRatingApi = (storeId, rating) =>
  api.put(`/ratings/${storeId}`, { rating });

export const getMyRatingsApi = () => api.get("/ratings/my-ratings");

export const getOwnerDashboardApi = () => api.get("/ratings/owner/dashboard");
