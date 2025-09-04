import { io } from "socket.io-client";

let socket = null;

export function getSocket(userId, token) {
  if (!userId) return null;

  // khởi tạo hoặc cập nhật auth rồi connect
  if (!socket) {
    socket = io(import.meta.env.VITE_API_ORIGIN, {
      transports: ["websocket"],
      withCredentials: true,
      auth: { userId: String(userId), token },
      reconnection: true,
      reconnectionAttempts: 10,
      timeout: 10000,
    });
  } else {
    socket.auth = { userId: String(userId), token };
    if (!socket.connected) socket.connect();
  }

  // đảm bảo join room theo user_id
  socket.emit("auth:hello", { userId: String(userId) });
  socket.on("connect", () => {
    socket.emit("auth:hello", { userId: String(userId) });
  });

  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
