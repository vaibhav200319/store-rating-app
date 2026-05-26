import { useCallback, useState } from "react";
import { browseStoresApi } from "../api/stores";

const DEFAULT_QUERY = {
  page: 1,
  limit: 10,
  search: "",
  sort: "name",
  order: "asc",
};

/**
 * Store listing for USER / OWNER / ADMIN browse page.
 * Always calls GET /api/stores/browse — never /api/stores.
 */
export const useBrowseStores = () => {
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(DEFAULT_QUERY);

  const fetchStores = useCallback(async (overrides = {}) => {
    const nextQuery = {
      page: overrides.page ?? DEFAULT_QUERY.page,
      limit: overrides.limit ?? DEFAULT_QUERY.limit,
      search: overrides.search ?? DEFAULT_QUERY.search,
      sort: overrides.sort ?? DEFAULT_QUERY.sort,
      order: overrides.order ?? DEFAULT_QUERY.order,
    };

    setQuery(nextQuery);
    setLoading(true);
    setError(null);

    try {
      const { data } = await browseStoresApi({
        page: nextQuery.page,
        limit: nextQuery.limit,
        search: nextQuery.search || undefined,
        sort: nextQuery.sort,
        order: nextQuery.order,
      });

      setStores(data.data?.stores || []);
      setPagination(data.data?.pagination || null);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;
      const url = err.config?.url || "";

      console.error("[useBrowseStores] failed:", status, url, message);

      if (status === 403) {
        setError(
          message ||
            "Forbidden — restart the backend server, then log out and log in again."
        );
      } else {
        setError(message || "Failed to load stores");
      }
      setStores([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stores, pagination, loading, error, query, fetchStores };
};
