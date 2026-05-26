import { useEffect, useState } from "react";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import { getOwnerDashboardApi } from "../api/ratings";
import { useToast } from "../hooks/useToast";

const OwnerDashboard = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await getOwnerDashboardApi();
        setStores(data.data.stores || []);
      } catch (err) {
        showToast(err.response?.data?.message || "Failed to load dashboard", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [showToast]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Owner Dashboard</h1>

      {stores.length === 0 ? (
        <Card>
          <p className="text-slate-400">You don&apos;t own any stores yet.</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {stores.map((item) => (
            <Card key={item.store.id} title={item.store.name}>
              <p className="mb-4 text-sm text-slate-400">{item.store.address}</p>
              <div className="mb-4 flex flex-wrap gap-4">
                <div className="rounded-lg bg-slate-800 px-4 py-2">
                  <p className="text-xs text-slate-400">Avg Rating</p>
                  <p className="text-xl font-bold text-amber-400">
                    {item.averageRating ?? "—"}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-800 px-4 py-2">
                  <p className="text-xs text-slate-400">Total Ratings</p>
                  <p className="text-xl font-bold text-white">{item.totalRatings}</p>
                </div>
              </div>
              {item.ratedBy?.length > 0 ? (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-300">Rated by</p>
                  <ul className="space-y-2">
                    {item.ratedBy.map((r) => (
                      <li
                        key={r.userId}
                        className="flex justify-between rounded-lg bg-slate-800/50 px-3 py-2 text-sm"
                      >
                        <span>
                          {r.name} ({r.email})
                        </span>
                        <span className="text-amber-400">★ {r.rating}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No ratings yet.</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
