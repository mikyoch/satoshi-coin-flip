// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import axios from "axios";
import qs from "qs";

console.log(
  "Which is the current api url:",
  process.env.NEXT_PUBLIC_API_BASE_URL
);
const satoshiAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

const blsSign = (gameId, user_randomness) => {
  gameId = `${gameId}`.replace("0x", "");
  gameId = `${gameId}${user_randomness}`;
  const data = qs.stringify({
    gameId,
  });

  return satoshiAPI.post("/game/sign", data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};

const registerGame = (gameId) => {
  const data = qs.stringify({
    gameId,
  });

  return satoshiAPI.post("/game/register", data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};

const singlePlayerEnd = (gameId, blsSig) => {
  const data = qs.stringify({
    gameId,
    blsSig,
  });

  return satoshiAPI.post("/game/single/end", data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};

export {
  blsSign,
  registerGame,
  singlePlayerEnd,
};
