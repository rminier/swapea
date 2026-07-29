import Pusher from "pusher";
import PusherClient from "pusher-js";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || "app_id",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || "key",
  secret: process.env.PUSHER_SECRET || "secret",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
  useTLS: true,
});

// Initialize client only if window is defined (browser environment)
export const getPusherClient = () => {
  if (typeof window === "undefined") return null;
  return new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_KEY || "key",
    {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
    }
  );
};
