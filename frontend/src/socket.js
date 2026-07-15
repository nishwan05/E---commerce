import { io } from "socket.io-client";
export const socket = io("http://localhost:5001", { withCredentials: true });
socket.on("connect", () => console.log("Socket Connected:", socket.id));
