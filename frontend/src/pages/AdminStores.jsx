import { useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAdminStores } from "../hooks/useAdminStores";

/**
 * Admin store management — GET /api/stores only (ADMIN).
 */
const AdminStores = () => {
  const { stores, pagination, loading, error, fetchStores } = useAdminStores();

  useEffect(() => {
    fetchStores({ page: 1, limit: 20, sort: "name", order: "asc" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Stores</h1>
          <p className="mt-1 text-sm text-slate-400">
            Admin API: <code className="text-indigo-400">GET /api/stores</code>
          </p>
        </div>
        <Link
          to="/stores"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          Browse as customer →
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading admin stores..." />
      ) : (
        <Card title={`Stores (${pagination?.total ?? stores.length})`}>
          {stores.length === 0 ? (
            <p className="text-slate-400">No stores in the system.</p>
          ) : (
            <ul className="divide-y divide-slate-800">
              {stores.map((store) => (
                <li
                  key={store.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{store.name}</p>
                    <p className="text-sm text-slate-400">
                      {store.address} · Owner ID: {store.ownerId}
                    </p>
                  </div>
                  <span className="text-sm text-amber-400">
                    ★ {store.averageRating ?? "—"} ({store.totalRatings ?? 0})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminStores;
