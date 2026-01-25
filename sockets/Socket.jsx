import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Utilities } from "../constants/Utilities.js";

let socket = null;

/**
 * Connect socket (only once)
 */
export const connectSocket = async () => {
    if (socket) {
        return socket; // already connected
    }

    const token = await AsyncStorage.getItem("token");

    socket = io(Utilities, {
        transports: ["websocket"],
        auth: {
            token,
        },
    });

    socket.on("connect", () => {
        console.log("🟢 Socket connected:", socket.id);
    });

    socket.on("receive-message", (data) => {
        console.log("📩 Message received:", data);
    });

    socket.on("disconnect", () => {
        console.log("🔴 Socket disconnected");
    });

    return socket;
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
    }
};
