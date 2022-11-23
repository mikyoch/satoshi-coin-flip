import React from "react";
import { createGame } from "../services/SatoshiAPI";

const NewGameButton = (props) => {
  const handleSubmit = async (e) => {
    e.preventDefault();

    // @todo: change harcoded values to user defined values
    try {
      let response = await createGame(100, 5000);
      props.setGameId(response.data.gameId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="w-full max-w-xs">
        <form onSubmit={handleSubmit}>
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
    </>
  );
};

export { NewGameButton };
