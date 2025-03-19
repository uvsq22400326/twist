import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket: Socket) => {
  console.log("Un utilisateur est connecté au WebSocket");

  socket.on("sendMessage", (message: any) => {
    console.log("Nouveau message reçu :", message);
    io.emit("newMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("Un utilisateur s'est déconnecté");
  });
});

server.listen(3001, () => {
  console.log("Serveur WebSocket en écoute sur http://localhost:3001");
});
