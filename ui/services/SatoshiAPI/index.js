import axios from "axios";
var qs = require("qs");

const satoshiAPI = axios.create({
  // @todo: this should be coming from a .env/config file
  baseURL: "http://localhost:8080",
});

const createGame = (minBet, maxBet) => {
  const data = qs.stringify({
    minBet,
    maxBet,
  });

  return satoshiAPI.post("/game/start", data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};

const endGame = (gameId) => {
  const data = qs.stringify({
    gameId,
  });

  return satoshiAPI.post("/game/end", data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};

const getGames = () => {
  return satoshiAPI.get("/game/objects");
};

export { createGame, endGame, getGames };
