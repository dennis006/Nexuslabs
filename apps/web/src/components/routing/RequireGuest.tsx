import type { ReactElement } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useUserStore } from "@/store/userStore";

export default function RequireGuest({ children }: { children: ReactElement }) {
  const authed = useUserStore((state) => Boolean(state.user && state.accessToken));
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirectTo") || "/forum";

  if (authed) {
    return <Navigate to={redirect} replace />;
  }

  return children;
}
