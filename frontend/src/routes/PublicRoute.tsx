import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";

export default function PublicRoute() {
    const { user, token } = useAuth();

    if (token && user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}