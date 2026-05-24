import { io } from "socket.io-client";

export const initSocket = (token) => {
    return io("http://localhost:3334", {
        auth: {
            token: token,
        },
        transports: ["websocket", "polling"],
    });
};
