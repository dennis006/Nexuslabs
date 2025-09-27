import { useEffect } from "react";
import { on, startMock, stopMock } from "./socketMock";
import { usePresenceStore } from "@/store/presenceStore";

export const usePresenceSubscription = () => {
  const setOnline = usePresenceStore((state) => state.setOnlineCount);

  useEffect(() => {
    startMock();
    const off = on("presence:update", (payload) => {
      if (typeof payload?.online === "number") {
        setOnline(payload.online);
      }
    });
    return () => {
      off();
      stopMock();
    };
  }, [setOnline]);
};
