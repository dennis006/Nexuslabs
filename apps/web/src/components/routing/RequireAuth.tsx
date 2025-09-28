import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserStore } from "@/store/userStore";

export default function RequireAuth({ children }: { children: ReactElement }) {
  const user = useUserStore((state) => state.user);
  const token = useUserStore((state) => state.accessToken);
  const location = useLocation();

  if (!user || !token) {
    const redirectTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirectTo=${redirectTo}`} replace />;
  }

  return children;
}
