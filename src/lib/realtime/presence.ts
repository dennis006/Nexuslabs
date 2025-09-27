import { useEffect } from "react";
import { socketMock } from "./socketMock";
import { usePresenceStore } from "@/store/presenceStore";

export const usePresenceSubscription = () => {
  const setOnline = usePresenceStore((state) => state.setOnlineCount);

  useEffect(() => {
    const handler = (count: number) => setOnline(count);
    socketMock.on("presence:update", handler);
    socketMock.connect();
    return () => {
      socketMock.off("presence:update", handler);
      socketMock.disconnect();
    };
  }, [setOnline]);
};
