import axios from "axios";
import qs from "qs";

const satoshiAPI = axios.create({
  // defaults to dev API
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
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
