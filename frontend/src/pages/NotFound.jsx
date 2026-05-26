import { Link } from "react-router-dom";
import Card from "../components/Card";
import { useAuth } from "../hooks/useAuth";

const NotFound = () => {
  const { getHomePath, isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="text-center">
        <p className="text-6xl font-bold text-indigo-500">404</p>
        <h1 className="mt-4 text-xl font-semibold text-white">Page not found</h1>
        <p className="mt-2 text-slate-400">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          to={isAuthenticated ? getHomePath() : "/login"}
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Go home
        </Link>
      </Card>
    </div>
  );
};

export default NotFound;
