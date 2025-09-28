import { useEffect, useRef } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import RootLayout from "@/components/layout/RootLayout";
import AnimatedRoutes from "@/components/layout/AnimatedRoutes";
import Landing from "@/routes/Landing";
import Forum from "@/routes/Forum";
import Category from "@/routes/Category";
import Thread from "@/routes/Thread";
import CreatePost from "@/routes/CreatePost";
import Forums from "@/routes/Forums";
import Login from "@/routes/Auth/Login";
import Register from "@/routes/Auth/Register";
import Profile from "@/routes/Profile";
import { useUiStore } from "@/store/uiStore";
import { usePresenceSubscription } from "@/lib/realtime/presence";
import { SESSION_STORAGE_KEY, useUserStore } from "@/store/userStore";
import { me, refresh } from "@/lib/api/authApi";
import RequireAuth from "@/components/routing/RequireAuth";
import RequireGuest from "@/components/routing/RequireGuest";

const ThemeWatcher = () => {
  const theme = useUiStore((state) => state.theme);
  const density = useUiStore((state) => state.density);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("nexuslabs-theme", theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);
  useEffect(() => {
    const stored = localStorage.getItem("nexuslabs-theme") as "light" | "dark" | null;
    if (stored) {
      useUiStore.setState({ theme: stored });
    }
    const storedDensity = localStorage.getItem("nexuslabs-density") as "comfortable" | "compact" | null;
    if (storedDensity) {
      useUiStore.setState({ density: storedDensity });
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("nexuslabs-density", density);
  }, [density]);
  return null;
};

const SessionManager = () => {
  const triedRef = useRef(false);
  const setSession = useUserStore((state) => state.setSession);
  const clear = useUserStore((state) => state.clear);

  useEffect(() => {
    if (triedRef.current) {
      return;
    }
    triedRef.current = true;

    if (typeof window !== "undefined") {
      const hasStoredSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (!hasStoredSession) {
        clear();
        return;
      }
    }

    let cancelled = false;

    (async () => {
      try {
        const refreshed = await refresh();
        if (cancelled) return;

        if (refreshed?.accessToken) {
          const profile = await me(refreshed.accessToken);
          if (cancelled) return;
          setSession(profile.user, refreshed.accessToken);
        } else {
          clear();
        }
      } catch {
        if (!cancelled) {
          clear();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setSession, clear]);

  return null;
};

const App = () => {
  usePresenceSubscription();
  const location = useLocation();

  return (
    <RootLayout>
      <ThemeWatcher />
      <SessionManager />
      <AnimatedRoutes location={location}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/forums" element={<Forums />} />
          <Route path="/forum/:categoryId" element={<Category />} />
          <Route path="/thread/:threadId" element={<Thread />} />
          <Route path="/u/:handle" element={<Profile />} />
          <Route
            path="/create"
            element={
              <RequireAuth>
                <CreatePost />
              </RequireAuth>
            }
          />
          <Route
            path="/forum/:categoryId/create"
            element={
              <RequireAuth>
                <CreatePost />
              </RequireAuth>
            }
          />
          <Route
            path="/login"
            element={
              <RequireGuest>
                <Login />
              </RequireGuest>
            }
          />
          <Route
            path="/register"
            element={
              <RequireGuest>
                <Register />
              </RequireGuest>
            }
          />
        </Routes>
      </AnimatedRoutes>
      <Toaster richColors expand position="top-center" />
    </RootLayout>
  );
};

export default App;
