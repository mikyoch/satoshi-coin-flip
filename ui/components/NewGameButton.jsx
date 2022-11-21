import React, { useState } from "react";
import { createGame } from "../services/SatoshiAPI";

const NewGameButton = () => {
  const [minBet, setMinBet] = useState(100);
  const [maxBet, setMaxBet] = useState(5000);
  const [gameId, setGameId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    //check if values are ok
    if (minBet < 100 || minBet > maxBet) {
      console.error(
        "MinBet value should be greater than 100 and less than maxBet"
      );
      return;
    }
    if (maxBet > 5000) {
      console.error("MaxBet value should not exceed 5000");
      return;
    }
    try {
      let response = await createGame(minBet, maxBet);
      setGameId(response.data.gameId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="w-full max-w-xs">
        <form
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          onSubmit={handleSubmit}
        >
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Minimum Bet
              <input
                placeholder="Minimum bet value"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                value={minBet}
                onChange={(e) => {
                  setMinBet(e.target.value);
                }}
              ></input>
            </label>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Maximum Bet
              <input
                placeholder="Maximum bet value"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                value={maxBet}
                onChange={(e) => {
                  setMaxBet(e.target.value);
                }}
              ></input>
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="bg-sui-ocean text-white px-6 py-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none"
            >
              New game
            </button>
          </div>
        </form>
      </div>
      {gameId && <div>Created game {gameId}</div>}
    </>
  );
};

export { NewGameButton };
