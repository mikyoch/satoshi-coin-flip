import React, { useEffect, useState, useRef } from "react";
import { COIN } from "../helpers/constants";
import TailsSvg from "../public/svg/capy.svg";
import HeadsSvg from "../public/svg/capy-text.svg";

// Use callback to reset the res value
const GameStatus = ({ res, callback, coinside }) => {
  const [colorOverlay, setColorOverlay] = useState(null); // default: null
  const [open, setOpen] = useState(false); // default: false
  const ref = useRef(null);

  useEffect(() => {
    if (res !== null) {
      setColorOverlay(res);
      setOpen(true);
      ref.current.parentElement
        .querySelector("#game")
        .classList.add("opacity-0");

      triggerClose();
    }
  }, [res]);

  const handleClose = () => {
    setOpen(false);
    callback(null);
    ref.current.parentElement
      .querySelector("#game")
      .classList.remove("opacity-0");
  };

  const triggerClose = () => {
    setTimeout(handleClose, 5000);
  };

  return (
    <>
      <div
        ref={ref}
        className={`flex items-center justify-center h-full rounded-lg z-10 top-0 left-0 transition-all duration-200 overflow-hidden absolute bg-transparent ${
          colorOverlay ? "text-success" : "text-failure"
        } ${open ? "w-full" : "w-0"}`}
        onClick={handleClose}
      >
        <div className="relative coin-slot flex items-center justify-center h-[270px] bg-sui-ocean-dark/90 border border-white/10 rounded-lg">
          <div className="relative h-full slot overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute right-2 top-2 flex text-white/50 cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </div>
            <div className="block bg-black/10 border-4 border-inherit/50 rounded-full text-center p-6 drop-shadow-xl mb-[40px]">
              {coinside === COIN.HEADS ? (
                <div className="text-inherit h-[50px] w-[50px] flex items-center justify-center">
                  <HeadsSvg />
                </div>
              ) : (
                <div className="text-inherit h-[50px] w-[50px] flex items-center justify-center">
                  <TailsSvg />
                </div>
              )}
            </div>

            <div className="h-[50px] px-6 py-3 mx-2 mt-">
              <h2 className="text-2xl font-semibold text-white">
                You played{" "}
                <span className="underline underline-offset-4 decoration-white/30">
                  {coinside === COIN.HEADS ? "heads" : "tails"}
                </span>{" "}
                and you {res ? "won 🎉" : "lost 😓"}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameStatus;
