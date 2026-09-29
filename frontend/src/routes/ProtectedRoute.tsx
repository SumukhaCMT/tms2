import { createContext, useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { hasPermission, type PermissionAction } from "../../../backend/src/permissions/permissions";

const RouteModuleContext = createContext<string | null>(null);

interface Props {
  requiredPermission?: string;
  requiredAction?: PermissionAction;
}

export default function ProtectedRoute({ requiredPermission, requiredAction = "READ" }: Props) {
  const { user, token } = useAuth();
  const parentModule = useContext(RouteModuleContext);

  if (!token || !user) return <Navigate to="/login" replace />;

  if (parentModule && requiredPermission && requiredPermission !== parentModule) {
    console.error(`Misconfigured route: "${requiredPermission}" used inside "${parentModule}" module`);
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredPermission) {
    const permission = user.permissions?.[requiredPermission] ?? null;
    if (!hasPermission(permission, requiredAction)) return <Navigate to="/dashboard" replace />;
  }

  return (
    <RouteModuleContext.Provider value={requiredPermission ?? parentModule}>
      <Outlet />
    </RouteModuleContext.Provider>
  );
}
