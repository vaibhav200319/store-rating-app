import { useEffect, useState } from "react";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import { submitRatingApi } from "../api/ratings";
import { useBrowseStores } from "../hooks/useBrowseStores";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { ROLES } from "../utils/constants";

const StoreListing = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { stores, pagination, loading, error, query, fetchStores } = useBrowseStores();

  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("name");
  const [order, setOrder] = useState("asc");
  const [ratingInputs, setRatingInputs] = useState({});
  const [submitting, setSubmitting] = useState(null);

  const isUser = user?.role === ROLES.USER;

  useEffect(() => {
    if (user?.role) {
      fetchStores({ page: 1, limit: 10, search: "", sort: "name", order: "asc" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores({ page: 1, search: searchInput.trim(), sort, order });
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSort(newSort);
    fetchStores({ page: 1, search: searchInput.trim(), sort: newSort, order });
  };

  const handleOrderChange = (e) => {
    const newOrder = e.target.value;
    setOrder(newOrder);
    fetchStores({ page: 1, search: searchInput.trim(), sort, order: newOrder });
  };

  const handlePageChange = (newPage) => {
    fetchStores({ page: newPage, search: searchInput.trim(), sort, order });
  };

  const handleRate = async (storeId) => {
    const rating = parseInt(ratingInputs[storeId], 10);
    if (!rating || rating < 1 || rating > 5) {
      showToast("Please enter a rating between 1 and 5", "error");
      return;
    }
    setSubmitting(storeId);
    try {
      const { data } = await submitRatingApi(storeId, rating);
      showToast(data.message || "Rating submitted");
      fetchStores({
        page: query.page,
        search: searchInput.trim(),
        sort,
        order,
      });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to submit rating", "error");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white">Stores</h1>
      <p className="mb-6 text-sm text-slate-400">
        Browse and rate stores · API: <code className="text-indigo-400">/stores/browse</code>
      </p>

      <form onSubmit={handleSearch} className="mb-4 flex flex-wrap gap-2">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name or address..."
          className="min-w-[200px] flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none focus:border-indigo-500"
        />
        <select
          value={sort}
          onChange={handleSortChange}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
        >
          <option value="name">Sort by name</option>
          <option value="email">Sort by email</option>
          <option value="address">Sort by address</option>
        </select>
        <select
          value={order}
          onChange={handleOrderChange}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading stores..." />
      ) : stores.length === 0 ? (
        <Card>
          <p className="text-slate-400">
            {error ? "Could not load stores." : "No stores found."}
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {stores.map((store) => (
              <Card key={store.id}>
                <h3 className="text-lg font-semibold text-white">{store.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{store.address}</p>
                <p className="mt-1 text-sm text-slate-500">{store.email}</p>
                <div className="mt-3 flex gap-3 text-sm">
                  <span className="text-amber-400">
                    ★ {store.averageRating ?? "—"} avg
                  </span>
                  <span className="text-slate-400">
                    {store.totalRatings ?? 0} ratings
                  </span>
                </div>

                {isUser && (
                  <div className="mt-4 flex gap-2">
                    <select
                      value={ratingInputs[store.id] || ""}
                      onChange={(e) =>
                        setRatingInputs((prev) => ({
                          ...prev,
                          [store.id]: e.target.value,
                        }))
                      }
                      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                    >
                      <option value="">Rate</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} ★
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRate(store.id)}
                      disabled={submitting === store.id}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                    >
                      {submitting === store.id ? "..." : "Submit"}
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={query.page <= 1 || loading}
                onClick={() => handlePageChange(query.page - 1)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={query.page >= pagination.totalPages || loading}
                onClick={() => handlePageChange(query.page + 1)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StoreListing;
