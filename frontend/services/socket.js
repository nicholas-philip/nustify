import { io } from "socket.io-client";
import api from "./api";

const WS_URL = import.meta.env.VITE_API_WS || "http://localhost:4500";

const socket = io(WS_URL, {
  autoConnect: false,
});

socket.on("connect", () => {
  console.log("🔌 Socket connected", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Socket disconnected", reason);
});

export const connectSocket = (userId) => {
  const token = api.getToken();
  if (token) {
    socket.auth = { token };
  }
  if (!socket.connected) socket.connect();
  
  if (userId) socket.emit("join", userId);
};

export const disconnectSocket = () => {
  try {
    socket.disconnect();
  } catch (e) {}
};

export const onNotification = (cb) => {
  socket.on("notification", cb);
};

export default socket;
