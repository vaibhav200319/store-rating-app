import api from "./axios";

const BROWSE_URL = "/stores/browse";
const ADMIN_URL = "/stores";

/**
 * Browse stores — USER, OWNER, ADMIN
 * GET /api/stores/browse
 */
export const browseStoresApi = (params = {}) => {
  if (import.meta.env.DEV) {
    console.debug("[API] GET", BROWSE_URL, params);
  }
  return api.get(BROWSE_URL, { params });
};

/**
 * Admin store management — ADMIN only
 * GET /api/stores
 */
export const getAdminStoresApi = (params = {}) => {
  if (import.meta.env.DEV) {
    console.debug("[API] GET", ADMIN_URL, params);
  }
  return api.get(ADMIN_URL, { params });
};

export const createStoreApi = (data) => api.post(ADMIN_URL, data);

export const getAdminStoreByIdApi = (id) => api.get(`${ADMIN_URL}/${id}`);

export const deleteStoreApi = (id) => api.delete(`${ADMIN_URL}/${id}`);
