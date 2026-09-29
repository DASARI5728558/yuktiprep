import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

    socket = io(backendUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("[Socket.IO] Connected to backend, id:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket.IO] Connection error:", err.message);
    });
  }

  return socket;
};
