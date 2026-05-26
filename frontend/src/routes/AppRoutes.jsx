import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import LoadingSpinner from "../components/LoadingSpinner";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminDashboard from "../pages/AdminDashboard";
import UserDashboard from "../pages/UserDashboard";
import OwnerDashboard from "../pages/OwnerDashboard";
import StoreListing from "../pages/StoreListing";
import AdminStores from "../pages/AdminStores";
import NotFound from "../pages/NotFound";
import Unauthorized from "../pages/Unauthorized";
import { useAuth } from "../hooks/useAuth";
import { ROLE_HOME, ROLES } from "../utils/constants";

const HomeRedirect = () => {
  const { isAuthenticated, user, loading, getHomePath } = useAuth();

  if (loading) return <LoadingSpinner label="Loading app..." />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Navigate to={ROLE_HOME[user.role] || getHomePath()} replace />;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <LoadingSpinner label="Loading..." />;

  if (isAuthenticated) {
    return <Navigate to={ROLE_HOME[user.role] || "/login"} replace />;
  }

  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomeRedirect />} />

    <Route element={<GuestRoute><AuthLayout /></GuestRoute>}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Route>

    <Route
      element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }
    >
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <AdminStores />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={[ROLES.USER]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner"
        element={
          <ProtectedRoute roles={[ROLES.OWNER]}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stores"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN, ROLES.USER, ROLES.OWNER]}>
            <StoreListing />
          </ProtectedRoute>
        }
      />
    </Route>

    <Route path="/unauthorized" element={<Unauthorized />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
