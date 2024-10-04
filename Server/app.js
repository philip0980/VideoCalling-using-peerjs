import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "http:" }));
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const peers = {};
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("sendId", (data) => {
    const id = data.id;
    console.log(id);
    peers[socket.id] = id;

    socket.broadcast.emit("newPeer", id);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const port = 8000;
server.listen(port, () => {
  console.log(`App listening at port ${port}`);
});
