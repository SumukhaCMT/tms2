import { createContext, useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { hasPermission, type PermissionAction } from "@/permissions/permissions";

const RouteModuleContext = createContext<string | null>(null);

interface Props {
  requiredPermission?: string;
  requiredAction?: PermissionAction;
}

export default function ProtectedRoute({ requiredPermission, requiredAction = "READ" }: Props) {
  const { user, token } = useAuth();
  const parentModule = useContext(RouteModuleContext);
  const { pathname } = useLocation();

  if (!token || !user) return <Navigate to="/login" replace />;

  if (user.must_change_password && pathname !== "/set-password") return <Navigate to="/set-password" replace />;
  if (!user.must_change_password && pathname === "/set-password") return <Navigate to="/dashboard" replace />;

  if (parentModule && requiredPermission && requiredPermission !== parentModule) {
    console.error(`Misconfigured route: "${requiredPermission}" used inside "${parentModule}" module`);
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredPermission) {
    const permission = user.permissions?.[requiredPermission] ?? null;
    if (!hasPermission(permission, requiredAction)) {
      const expired = user.expired_modules?.includes(requiredPermission);
      return <Navigate to={expired ? `/renew/${requiredPermission}` : "/dashboard"} replace />;
    }
  }

  return (
    <RouteModuleContext.Provider value={requiredPermission ?? parentModule}>
      <Outlet />
    </RouteModuleContext.Provider>
  );
}
