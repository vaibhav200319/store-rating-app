import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../utils/constants";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  const links = [];

  if (user?.role === ROLES.ADMIN) {
    links.push({ to: "/admin", label: "Admin Dashboard" });
    links.push({ to: "/admin/stores", label: "Manage Stores" });
    links.push({ to: "/stores", label: "Browse Stores" });
  }

  if (user?.role === ROLES.USER) {
    links.push({ to: "/dashboard", label: "My Dashboard" });
    links.push({ to: "/stores", label: "Stores" });
  }

  if (user?.role === ROLES.OWNER) {
    links.push({ to: "/owner", label: "Owner Dashboard" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="text-xl font-bold text-white">
          Store<span className="text-indigo-400">Rate</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 sm:inline">
            {user?.name} · {user?.role}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
