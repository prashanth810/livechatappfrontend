import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

let socket = null;

/**
 * Connect socket (only once)
 */
export const connectSocket = async () => {
    if (socket?.connected) {
        console.log("✅ Socket already connected");
        return socket;
    }

    // Disconnect old socket if exists
    if (socket) {
        socket.disconnect();
        socket = null;
    }

    try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
            console.log("❌ No token found");
            return null;
        }

        console.log("🔄 Connecting socket...");

        const SOCKET_URL = "http://chatappbackend-10ud.onrender.com";

        socket = io("http://chatappbackend-10ud.onrender.com", {
            transports: ["websocket"], // ✅ Try polling first
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 2000,
            timeout: 20000, // ✅ Increased timeout
            forceNew: true, // ✅ Force new connection
        });

        socket.on("connect", () => {
            console.log("🟢 Socket connected:", socket.id);
        });

        socket.on("receive-message", (data) => {
            console.log("📩 Message received:", data);
        });

        socket.on("disconnect", (reason) => {
            console.log("🔴 Socket disconnected:", reason);
        });

        socket.on("connect_error", (error) => {
            console.log("❌ Connection error:", error.message);
            console.log("❌ Error details:", error);
        });

        return socket;
    } catch (error) {
        console.log("❌ Socket connection failed:", error);
        return null;
    }
};

/**
 * Get current socket instance
 */
export const getSocket = () => {
    return socket;
};

/**
 * Disconnect socket (logout)
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log("🔴 Socket manually disconnected");
    }
};