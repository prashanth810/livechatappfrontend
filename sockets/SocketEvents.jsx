import { getSocket } from "./Socket";

export const Testingsocket = (handler, off = false) => {
    const socket = getSocket();

    if (!socket) {
        console.log("Socket is not connected !!!");
        return;
    }

    if (off && typeof handler === "function") {
        socket.off("testSocket", handler);
        return;
    }

    if (typeof handler === "function") {
        socket.on("testSocket", handler);
        return;
    }

    // emit
    socket.emit("testSocket", handler);
};

export const updateprofile = (handler, off = false) => {
    const socket = getSocket();

    if (!socket) {
        console.log("Socket is not connected !!!");
        return;
    }

    if (off && typeof handler === "function") {
        socket.off("testSocket", handler);
        return;
    }

    if (typeof handler === "function") {
        socket.on("testSocket", handler);
        return;
    }

    // emit
    socket.emit("testSocket", handler);
};


export const getcontacts = (handler, off = false) => {
    const socket = getSocket();
    if (!socket) {
        console.log("Socket is not connected !!!");
        return;
    }

    if (off && typeof handler === "function") {
        socket.off("getcontacts", handler);
        return;
    }

    if (typeof handler === "function") {
        socket.on("getcontacts", handler);
        return;
    }

    // emit
    socket.emit("getcontacts", handler);
};


export const newcpncersation = (handler, off = false) => {
    const socket = getSocket();
    console.log("🔌 Socket connected?", socket?.connected);
    console.log("🆔 My socket id:", socket?.id);

    if (!socket) {
        console.log("Socket is not connected !!!");
        return;
    }

    if (off && typeof handler === "function") {
        socket.off("newcpncersation", handler);
        return;
    }

    if (typeof handler === "function") {
        socket.on("newcpncersation", handler);
        return;
    }

    // emit
    socket.emit("newcpncersation", handler);
};

export const getconversation = (handler, off = false) => {
    const socket = getSocket();
    console.log("🔌 Socket connected?", socket?.connected);
    console.log("🆔 My socket id:", socket?.id);

    console.log(socket.data, 'ooooooooooooooooooo')

    if (!socket) {
        console.log("Socket is not connected !!!");
        return;
    }

    if (off && typeof handler === "function") {
        socket.off("getconversation", handler);
        return;
    }

    if (typeof handler === "function") {
        socket.on("getconversation", handler);
        return;
    }

    // emit
    socket.emit("getconversation", handler);
};