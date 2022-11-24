import React from "react";
import { COIN } from "../helpers/constants";

const PlayButton = ({ coinSide }) => {
  const side = coinSide === COIN.HEADS ? "HEADS" : "TAILS";

  const getCoinSide = () => { console.log(side) };

  return (
    <>
      <button onClick={getCoinSide}>Play {side}</button>
    </>
  );
};

export default PlayButton;
