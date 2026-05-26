import { Link } from "react-router-dom";
import Card from "../components/Card";
import { useAuth } from "../hooks/useAuth";

const Unauthorized = () => {
  const { getHomePath } = useAuth();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="text-center">
        <p className="text-6xl font-bold text-red-500">403</p>
        <h1 className="mt-4 text-xl font-semibold text-white">Access denied</h1>
        <p className="mt-2 text-slate-400">You don&apos;t have permission to view this page.</p>
        <Link
          to={getHomePath()}
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Go to dashboard
        </Link>
      </Card>
    </div>
  );
};

export default Unauthorized;
