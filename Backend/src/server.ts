import http from "http";
import app from "./app";
import { Server } from "socket.io";
import { PORT } from "./config/env";
import arenaSocket from "./socket/arenaSocket";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

arenaSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
