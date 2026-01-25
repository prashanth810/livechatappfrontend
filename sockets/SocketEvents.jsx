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
