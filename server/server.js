const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const port = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { pingInterval: 60000 });

app.use(express.json());

// data = {
//   games: {
//     1234: { //gameId
//       players: ["giri", "anu", "amita"],
//       creator: "giri"
//       guesser: "anu",
//       cluegivers: ["giri", "amita"],
//       clue: "chocolate",
//       hints: ["food", "brown"],
//     }
//   }
// };

const data = { games: {} };

app.get("/api/getGameData", (req, res) => {
  const { gameId } = req.query;
  console.log(data.games[gameId]);
  res.send(data.games[gameId]);
});

app.post("/api/createGame", (req, res) => {
  const { gameId, username, clue } = req.body;

  if (!data.games[gameId]) {
    data.games[gameId] = {
      players: [username],
      creator: username,
      clue: clue,
      hints: []
    };
    res.send("game added to db");
  } else {
    res.send("game id already in db");
  }
});

app.post("/api/joinGame", (req, res) => {
  const { gameId, username } = req.body;

  if (!data.games[gameId]) {
    res.send("game doesn't exist");
  } else {
    data.games[gameId].players.push(username);
    res.send("player added to db");
  }
});

app.post("/api/submitHint", (req, res) => {
  const { hint, gameId } = req.body;
  const game = data.games[gameId];
  game.hints.push(hint);
  if (game.hints.length === game.players.length - 1) {
    res.send(game);
  } else {
    res.send("waiting");
  }
});

const pickGuesser = gameId => {
  const game = data.games[gameId];
  const players = game.players;
  const randomIndex = Math.floor(Math.random() * players.length);
  game.guesser = players[randomIndex];
};

const filterHints = gameId => {
  const game = data.games[gameId];
  const finalHints = [];
  game.hints.forEach((hint, index) => {
    if (game.hintsState[index]) {
      finalHints.push(hint);
    }
  });
  game.finalHints = finalHints;
};

io.on("connection", socket => {
  console.log("a user connected");

  socket.on("disconnect", reason => {
    console.log(`user disconnected because of ${reason}`);
  });

  socket.on("game_created", gameId => {
    console.log(gameId, socket.id);
    socket.join(gameId);
    console.log(io.sockets.adapter.rooms);
  });

  socket.on("new_player", gameId => {
    console.log("new player");
    socket.join(gameId);
    io.in(`${gameId}`).emit("room_update", data.games[gameId]);
  });

  socket.on("join", gameId => {
    console.log(gameId, socket.id);
    socket.join(gameId);
    console.log(io.sockets.adapter.rooms);
  });

  socket.on("start_game", gameId => {
    console.log("start game");
    pickGuesser(gameId);
    console.log(data.games[gameId]);
    io.in(`${gameId}`).emit("game_started", data.games[gameId]);
  });

  socket.on("hints_done", gameId => {
    console.log("hints all in");
    io.in(`${gameId}`).emit("hints_done", data.games[gameId]);
  });

  socket.on("hints_filtered", data => {
    console.log(data);
    console.log("hints filter");
    io.in(`${data.gameId}`).emit("hints_filtered", data.hintsState);
  });

  socket.on("valid_hints_submitted", info => {
    console.log("hints submitted");
    const gameId = info.gameId;
    const validHints = info.hintsState;
    data.games[gameId].hintsState = validHints;
    filterHints(gameId);
    io.in(`${gameId}`).emit("valid_hints_submitted", data.games[gameId]);
  });

  socket.on("guess_submitted", info => {
    console.log("guess submitted");
    const gameId = info.gameId;
    const guess = info.guess;
    data.games[gameId].guess = guess;
    io.in(`${gameId}`).emit("game_done", data.games[gameId]);
  });
});

server.listen(port, () => console.log(`listening on port ${port}`));
