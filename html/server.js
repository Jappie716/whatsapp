const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public")); // laat de public map zien

let messages = []; // tijdelijke opslag in geheugen

io.on("connection", (socket) => {
  console.log("Nieuwe gebruiker verbonden");

  // stuur oude berichten
  socket.emit("history", messages);

  // als iemand een bericht stuurt
  socket.on("chatMessage", (msg) => {
    messages.push(msg);
    io.emit("chatMessage", msg); // stuur naar iedereen
  });

  socket.on("disconnect", () => {
    console.log("Gebruiker weg");
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server draait op poort ${PORT}`));
