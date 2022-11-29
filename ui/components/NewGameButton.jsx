import { React, useState, useEffect } from "react";
import { createGame } from "../services/SatoshiAPI";
import { notifyError } from "../services/Toasts";
import { useWallet } from "@mysten/wallet-adapter-react";

const NewGameButton = (props) => {
  let { connected } = useWallet();
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    setDisabled(!connected)
  }, [connected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    props.loading(true);
    // @todo: change harcoded values to user defined values
    try {
      let response = await createGame(100, 5000);
      props.callback(response.data.gameId, response.data.transactionDigest);
    } catch (e) {
      notifyError("Uh oh, something went wrong. Please try again later!");
      console.error(e);
    }
  };

  return (
    <>
      <button
        onClick={handleSubmit}
        className="bg-sui-ocean text-white px-6 py-3 rounded-full cursor-pointer shadow hover:shadow-lg outline-none focus:outline-none disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed disabled:text-white/50"
        disabled={disabled}
      >
        New game
      </button>
    </>
  );
};

export { NewGameButton };
