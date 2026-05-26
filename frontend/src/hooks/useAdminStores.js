import { useCallback, useState } from "react";
import { getAdminStoresApi } from "../api/stores";

const DEFAULT_QUERY = {
  page: 1,
  limit: 20,
  search: "",
  sort: "name",
  order: "asc",
};

/**
 * Admin store management — GET /api/stores only (ADMIN role required).
 */
export const useAdminStores = () => {
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStores = useCallback(async (overrides = {}) => {
    const nextQuery = { ...DEFAULT_QUERY, ...overrides };
    setLoading(true);
    setError(null);

    try {
      const { data } = await getAdminStoresApi({
        page: nextQuery.page,
        limit: nextQuery.limit,
        search: nextQuery.search || undefined,
        sort: nextQuery.sort,
        order: nextQuery.order,
      });

      setStores(data.data?.stores || []);
      setPagination(data.data?.pagination || null);
    } catch (err) {
      const message = err.response?.data?.message;
      console.error("[useAdminStores] failed:", err.response?.status, message);
      setError(message || "Failed to load stores");
      setStores([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stores, pagination, loading, error, fetchStores };
};
