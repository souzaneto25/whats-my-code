"use client";
import { io } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

export const socket = io(URL, {
  transports: ["websocket"],
  autoConnect: true,
});
