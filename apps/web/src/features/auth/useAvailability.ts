import { useEffect, useRef, useState } from "react";
import { checkAvailability } from "@/lib/api/authApi";

export type AvailabilityStatus = "idle" | "loading" | "available" | "taken";

type AvailabilityState = {
  email: AvailabilityStatus;
  username: AvailabilityStatus;
};

export function useAvailability(email: string, username: string, delay = 350) {
  const [status, setStatus] = useState<AvailabilityState>({ email: "idle", username: "idle" });
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }

    if (!email && !username) {
      setStatus({ email: "idle", username: "idle" });
      return undefined;
    }

    setStatus({
      email: email ? "loading" : "idle",
      username: username ? "loading" : "idle",
    });

    let cancelled = false;

    const handle = window.setTimeout(async () => {
      try {
        const response = await checkAvailability({
          email: email || undefined,
          username: username || undefined,
        });

        if (cancelled) {
          return;
        }

        setStatus({
          email: response.email === "skip" ? "idle" : response.email,
          username: response.username === "skip" ? "idle" : response.username,
        });
      } catch {
        if (cancelled) {
          return;
        }

        setStatus((current) => ({
          email: current.email === "loading" ? "idle" : current.email,
          username: current.username === "loading" ? "idle" : current.username,
        }));
      }
    }, delay);

    timer.current = handle;

    return () => {
      cancelled = true;
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [email, username, delay]);

  const invalid = status.email === "taken" || status.username === "taken";
  const loading = status.email === "loading" || status.username === "loading";

  return { status, invalid, loading };
}
