import { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { secureStorage } from "@/utils/secureStorage";
import { useNavigate } from "react-router-dom";
import api from "@/axios/axios";
import { toast } from "sonner";
import { clearMeasurementUnits } from "@/features/inventory/shared/measurementUnitsCache";

export interface User {
  id: number;
  userid?: number;
  name: string;
  email: string;
  phone?: string;
  user_code?: string;
  user_type: string;
  user_role_name?: string;
  role?: string;
  org_id?: number;
  organization_id?: number;
  temple_id?: number;
  must_change_password?: boolean;
  is_free_trial?: boolean;
  trial_expiry_date?: string;

  Role?: string;
  role_id?: number;
  is_internal?: boolean;
  number_of_users?: number;
  number_of_temples?: number;
  org_ids?: number[];
  number_of_organisations?: number;
  temple?: {
    id: number;
    name: string;
    lat: number;
    lng: number;
  };
  permissions: Record<string, number>;
  expired_modules?: string[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  completePasswordChange: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
// const storedToken = secureStorage.getItem("token");
// if (storedToken) {
//   api.defaults.headers.Authorization = `Bearer ${storedToken}`;
// }

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => secureStorage.getItem("user"));
  const [token, setToken] = useState<string | null>(() => secureStorage.getItem("token"));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loggedTokenRef = useRef<string | null>(null);
  const logout = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    try {
      if (token) {
        await api.post("/auth/logout", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch {
      // Silent fail to ensure local cleanup
    } finally {
      setUser(null);
      setToken(null);
      secureStorage.clear();
      sessionStorage.clear();
      clearMeasurementUnits();
      navigate("/login", { replace: true });
    }
  }, [navigate, token]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const totalDurationMs = (payload.exp - payload.iat) * 1000;
      timerRef.current = setTimeout(logout, totalDurationMs);

    } catch {
      logout();
    }
  }, [logout, token]);

  useEffect(() => {
    if (!token) return;
    const handleActivity = () => startTimer();

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    activityEvents.forEach(event =>
      window.addEventListener(event, handleActivity)
    );

    // Initial start
    startTimer();

    return () => {
      activityEvents.forEach(event =>
        window.removeEventListener(event, handleActivity)
      );
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [token, startTimer]);

  useLayoutEffect(() => {
    if (token) startTimer();
    if (user && token && import.meta.env.VITE_STORAGE_KEY && loggedTokenRef.current !== token) {
      loggedTokenRef.current = token;
      console.group("info:");
      console.log("User:", user.name);
      console.log("Role:", user.user_type);
      console.log("Permissions:", user.permissions);
      if (user.temple_id) console.log("Temple ID:", user.temple_id);
      console.log("Organization ID:", user.organization_id);
      if (user.number_of_users !== undefined) console.log("Number of Users:", user.number_of_users);
      if (user.number_of_temples !== undefined) console.log("Number of Temples:", user.number_of_temples);
      console.log("Token:", token);
      console.groupEnd();
    }

    const respInterceptor = api.interceptors.response.use(
      (res) => res,
      async (err) => {
        const originalRequest = err.config;
        const requestUrl: string = originalRequest?.url ?? '';

        const isAuthFlowCall =
          requestUrl.includes('/auth/login') ||
          requestUrl.includes('/auth/refresh') ||
          requestUrl.includes('/auth/logout');

        if (err.response?.status === 401 && err.response?.data?.code === 'PERMISSIONS_CHANGED') {
          toast.error('Your permissions have changed. Please log in again.', { id: 'permissions-changed' });
          await logout();
          return Promise.reject(err);
        }

        if (err.response?.status === 401 && err.response?.data?.code === 'SESSION_REVOKED') {
          toast.error('You have been logged out because this account was signed in on another device.', { id: 'session-revoked' });
          await logout();
          return Promise.reject(err);
        }

        if (err.response?.status === 401 && !isAuthFlowCall && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshRes = await api.post('/auth/refresh');
            const newToken = refreshRes.data?.access_token;

            if (newToken) {
              secureStorage.setItem('token', newToken);
              setToken(newToken);
              setUser((prev) => {
                if (!prev) return prev;
                const next = {
                  ...prev,
                  permissions: refreshRes.data.permissions ?? prev.permissions,
                  expired_modules: refreshRes.data.expired_modules ?? prev.expired_modules,
                };
                secureStorage.setItem('user', next);
                return next;
              });
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${newToken}`,
              };
              return api(originalRequest);
            }
          } catch {
            // refresh_token is dead too — fall through to logout below
          }

          await logout();
          return Promise.reject(err);
        }

        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.response.eject(respInterceptor);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [token, user, logout, startTimer]);

  useEffect(() => {
    if (!token) return;
    const checkSession = () => {
      if (document.visibilityState === 'visible') api.get('/auth/session').catch(() => null);
    };
    document.addEventListener('visibilitychange', checkSession);
    return () => document.removeEventListener('visibilitychange', checkSession);
  }, [token]);

  const login = (userData: User, newToken: string) => {
    const updatedUser = { ...userData };

    setUser(updatedUser);
    setToken(newToken);

    secureStorage.setItem("user", updatedUser);
    secureStorage.setItem("token", newToken);

    startTimer();
  };

  const completePasswordChange = () => {
    if (!user) return;
    const updatedUser = { ...user, must_change_password: false };
    setUser(updatedUser);
    secureStorage.setItem("user", updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, completePasswordChange }}>
      {children}
    </AuthContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}