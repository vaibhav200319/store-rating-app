import { useEffect, useState } from "react";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import { getMyRatingsApi } from "../api/ratings";
import { useToast } from "../hooks/useToast";
import { Link } from "react-router-dom";

const UserDashboard = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const { data } = await getMyRatingsApi();
        setRatings(data.data.ratings || []);
      } catch (err) {
        showToast(err.response?.data?.message || "Failed to load ratings", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchRatings();
  }, [showToast]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
        <Link
          to="/stores"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Browse Stores
        </Link>
      </div>

      <Card title={`My Ratings (${ratings.length})`}>
        {ratings.length === 0 ? (
          <p className="text-slate-400">You haven&apos;t rated any stores yet.</p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {ratings.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-4">
                <div>
                  <p className="font-medium text-white">{r.store?.name}</p>
                  <p className="text-sm text-slate-400">{r.store?.address}</p>
                </div>
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-sm font-semibold text-amber-400">
                  ★ {r.rating}/5
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default UserDashboard;
