import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import { getAdminDashboardApi } from "../api/admin";
import { useToast } from "../hooks/useToast";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getAdminDashboardApi();
        setStats(data.data);
      } catch (err) {
        showToast(err.response?.data?.message || "Failed to load dashboard", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [showToast]);

  if (loading) return <LoadingSpinner />;

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, color: "from-indigo-600 to-indigo-800" },
    { label: "Total Stores", value: stats?.totalStores ?? 0, color: "from-emerald-600 to-emerald-800" },
    { label: "Total Ratings", value: stats?.totalRatings ?? 0, color: "from-amber-600 to-amber-800" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Admin Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl bg-gradient-to-br ${card.color} p-6 shadow-lg`}
          >
            <p className="text-sm font-medium text-white/80">{card.label}</p>
            <p className="mt-2 text-4xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>
      <Card title="Quick actions" className="mt-8">
        <p className="text-slate-400">
          <Link to="/admin/stores" className="text-indigo-400 hover:underline">
            Manage stores
          </Link>{" "}
          (admin API) or{" "}
          <Link to="/stores" className="text-indigo-400 hover:underline">
            browse stores
          </Link>{" "}
          (customer view). User APIs:{" "}
          <code className="text-indigo-400">/api/admin/*</code>.
        </p>
      </Card>
    </div>
  );
};

export default AdminDashboard;
