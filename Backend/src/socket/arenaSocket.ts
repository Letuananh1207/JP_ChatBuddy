import { Server, Socket } from "socket.io";
import * as jwt from "jsonwebtoken";
import * as arenaService from "../services/arenaService";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

interface ArenaSocketData {
  userId: string;
}

export default function arenaSocket(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Unauthorized"));
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as { id: string };
      socket.data.userId = payload.id;
      return next();
    } catch (err) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;

    socket.on("arena:join", async ({ code }) => {
      const room = await arenaService.joinRoom(code, userId);
      if (!room) {
        return socket.emit("arena:error", { message: "Unable to join room" });
      }

      socket.join(code);
      const updated = await arenaService.getRoom(code);
      io.to(code).emit("arena:roomUpdate", updated);
    });

    socket.on("arena:ready", async ({ code, ready }) => {
      const room = await arenaService.setParticipantReady(code, userId, ready);
      if (!room) {
        return socket.emit("arena:error", {
          message: "Unable to set ready status",
        });
      }

      const updated = await arenaService.getRoom(code);
      io.to(code).emit("arena:roomUpdate", updated);
      if (updated?.status === "running") {
        io.to(code).emit("arena:start", { questions: updated.questions });
      }
    });

    socket.on(
      "arena:answer",
      async ({ code, questionIndex, answer, duration }) => {
        const room = await arenaService.submitAnswer(
          code,
          userId,
          questionIndex,
          answer,
          duration,
        );
        if (!room) {
          return socket.emit("arena:error", {
            message: "Unable to submit answer",
          });
        }

        io.to(code).emit("arena:roomUpdate", await arenaService.getRoom(code));

        if (room.status === "finished") {
          const ranking = await arenaService.getRanking(code);
          io.to(code).emit("arena:ranking", ranking);
        }
      },
    );

    socket.on("arena:leave", async ({ code }) => {
      await arenaService.leaveRoom(code, userId);
      socket.leave(code);
      const updated = await arenaService.getRoom(code);
      io.to(code).emit("arena:roomUpdate", updated);
    });

    socket.on("disconnect", () => {
      // Optional: handle cleanup or notify room members on disconnect
    });
  });
}
