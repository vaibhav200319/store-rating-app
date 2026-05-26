import { Outlet, Link } from "react-router-dom";

const AuthLayout = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4">
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Link to="/" className="text-3xl font-bold text-white">
          Store<span className="text-indigo-400">Rate</span>
        </Link>
        <p className="mt-2 text-slate-400">Rate stores. Manage feedback.</p>
      </div>
      <Outlet />
    </div>
  </div>
);

export default AuthLayout;
