import axios from "axios";
import qs from "qs";


console.log("Which is the current api url:", process.env.NEXT_PUBLIC_API_BASE_URL);
const satoshiAPI = axios.create({
  // FIXME: quick fix since env variables can't be passed on k8s to nextjs.
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://satoshi-flip-api.sui.io",
});

const createGame = (minAmount, maxAmount) => {
  const data = qs.stringify({
    minAmount,
    maxAmount,
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
