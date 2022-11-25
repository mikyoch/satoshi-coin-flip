import { React, useState } from "react";
import { createGame } from "../services/SatoshiAPI";

const NewGameButton = (props) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    props.loading(true);
    // @todo: change harcoded values to user defined values
    try {
      let response = await createGame(100, 5000);
      props.callback(response.data.gameId, response.data.transactionDigest);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <button
        onClick={handleSubmit}
        className="flex align-start bg-sui-ocean text-white px-6 py-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none"
      >
        New game
        <span className="flex h-2 w-2 relative ml-2 -mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber"></span>
        </span>
      </button>
    </>
  );
};

export { NewGameButton };
