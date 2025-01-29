import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(handle);

  const io = new Server(server);

  const rooms: Record<
    string,
    {
      players: Array<{ id: string; username: string; code?: string }>;
      turn: number;
      gameStarted: boolean;
      attempts: Record<string, Array<{ attempt: string; result: number }>>;
    }
  > = {};

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    socket.on(
      "join-room",
      ({ room, username }: { room: string; username: string }) => {
        if (!rooms[room]) {
          rooms[room] = {
            players: [],
            turn: 0,
            gameStarted: false,
            attempts: {},
          };
        }

        console.log(`User ${username} joined room ${room}`);
        const roomData = rooms[room];

        if (roomData.players.length >= 2) {
          socket.emit("room-full", "This room is full. You cannot join.");
          return;
        }

        roomData.players.push({ id: socket.id, username });
        roomData.attempts[socket.id] = [];

        socket.join(room);
        console.log(`User ${username} joined room ${room}`);

        io.to(room).emit(
          "waiting-players",
          roomData.players.map((p) => p.username),
        );

        if (roomData.players.length === 2) {
          io.to(room).emit("start-game", "Game is starting!");
          roomData.gameStarted = true;
        }
      },
    );

    socket.on(
      "submit-code",
      ({ room, code }: { room: string; code: string }) => {
        const roomData = rooms[room];
        if (!roomData) return;

        const player = roomData.players.find((p) => p.id === socket.id);
        if (player) {
          player.code = code;
          console.log(`Player ${player.username} submitted code: ${code}`);
        }

        if (roomData.players.every((p) => p.code)) {
          io.to(room).emit(
            "codes-ready",
            "Both codes are set. Let the game begin!",
          );
          io.to(roomData.players[roomData.turn].id).emit(
            "your-turn",
            "Your turn to guess!",
          );
        }
      },
    );

    socket.on(
      "make-guess",
      ({ room, guess }: { room: string; guess: string }) => {
        const roomData = rooms[room];
        if (!roomData) return;

        const currentPlayer = roomData.players[roomData.turn];
        const opponentPlayer = roomData.players.find((p) => p.id !== socket.id);
        if (!opponentPlayer || !opponentPlayer.code) return;

        let correctDigits = 0;
        for (let i = 0; i < guess.length; i++) {
          if (guess[i] === opponentPlayer.code[i]) {
            correctDigits++;
          }
        }

        roomData.attempts[socket.id].push({
          attempt: guess,
          result: correctDigits,
        });

        roomData.attempts[opponentPlayer.id].push({
          attempt: guess,
          result: correctDigits,
        });

        if (correctDigits === 4) {
          io.to(room).emit(
            "game-over",
            `${currentPlayer.username} won! Congratulations! ${currentPlayer.username}'s code was ${currentPlayer.code}, and ${opponentPlayer.username}'s code was ${opponentPlayer.code}. | ${currentPlayer.username} venceu! Parabéns! O código do ${currentPlayer.username} era ${currentPlayer.code} e o código do ${opponentPlayer.username} era ${opponentPlayer.code}`,
          );
          const roomData = rooms[room];
          roomData.players.forEach((player) => {
            player.code = undefined;
            roomData.attempts[player.id] = [];
          });
          roomData.turn = 0;
          roomData.gameStarted = false;
          return;
        }

        io.to(socket.id).emit("guess-result", { guess, correctDigits });

        io.to(opponentPlayer.id).emit("opponent-guess", {
          guess,
          correctDigits,
        });

        roomData.turn = (roomData.turn + 1) % 2;
        io.to(roomData.players[roomData.turn].id).emit(
          "your-turn",
          "Your turn to guess!",
        );
      },
    );

    socket.on("restart-game", ({ room }: { room: string }) => {
      console.log(`Restarting game in room ${room}`);
      const roomData = rooms[room];
      console.log({ roomData });
      if (!roomData) return;

      roomData.players.forEach((player) => {
        player.code = undefined;
        roomData.attempts[player.id] = [];
      });
      roomData.turn = 0;
      roomData.gameStarted = false;

      io.to(room).emit("game-restarted");

      io.to(room).emit("waiting-for-codes");
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected", socket.id);

      for (const room of Object.keys(rooms)) {
        const roomData = rooms[room];
        const player = roomData.players.find((p) => p.id === socket.id);

        if (player) {
          roomData.players = roomData.players.filter((p) => p.id !== socket.id);

          io.to(room).emit(
            "player-left",
            `${player.username} has left the game. The game will be paused.`,
          );

          if (roomData.players.length === 0) {
            delete rooms[room];
            console.log(`Room ${room} has been deleted.`);
          } else {
            roomData.gameStarted = false;
            roomData.players.forEach((p) => {
              p.code = undefined;
              roomData.attempts[p.id] = [];
            });
            roomData.turn = 0;

            io.to(room).emit(
              "waiting-players",
              roomData.players.map((p) => p.username),
            );
          }
        }
      }
    });
  });

  server.listen(port, () => {
    console.log(`Server running on http://${hostname}:${port}`);
  });
});
