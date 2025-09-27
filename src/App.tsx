import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import RootLayout from "@/components/layout/RootLayout";
import AnimatedRoutes from "@/components/layout/AnimatedRoutes";
import Landing from "@/routes/Landing";
import Forum from "@/routes/Forum";
import Category from "@/routes/Category";
import Thread from "@/routes/Thread";
import CreatePost from "@/routes/CreatePost";
import Login from "@/routes/Auth/Login";
import Register from "@/routes/Auth/Register";
import { useUiStore } from "@/store/uiStore";
import { usePresenceSubscription } from "@/lib/realtime/presence";

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

const App = () => {
  usePresenceSubscription();
  const location = useLocation();

  return (
    <RootLayout>
      <ThemeWatcher />
      <AnimatedRoutes location={location}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/:categoryId" element={<Category />} />
          <Route path="/thread/:threadId" element={<Thread />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </AnimatedRoutes>
      <Toaster richColors expand position="top-center" />
    </RootLayout>
  );
};

export default App;
