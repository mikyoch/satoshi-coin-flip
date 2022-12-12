import Slot from "./Slot.jsx";
import HeadsSvg from "../public/svg/capy.svg";
import TailsSvg from "../public/svg/capy-text.svg";

/*
  props.isRunning integer, 0 = tails, 1 = heads, 2 = running
  Usage:
  Pass <Visual isRunning=2 /> to have heads tails spinning
  Pass <Visual isRunning=0 /> to get only "tails"
  Pass <Visual isRunning=1 /> to get only "heads"
*/
const Visual = (props) => {
  const isRunning = props.isRunning === 2;
  const result = props.isRunning === 0 ? "tails" : "heads";

  return (
    <>
      {isRunning ? (
        <div className="coin-slot">
          <Slot />
        </div>
      ) : (
        <div className="coin-slot">
          <div
            id="slot"
            className="slot bg-transparent overflow-hidden rounded-lg flex items-center justify-center drop-shadow-xl my-[55%]"
          >
            <div>
              <div className="block bg-sui-ocean border-4 border-sui-ocean-dark rounded-full text-center p-6">
                {result === "tails" ? (
                  <div className="text-sui-sky h-[50px] w-[50px] flex items-center justify-center">
                    <TailsSvg />
                  </div>
                ) : (
                  <div className="text-sui-sky h-[50px] w-[50px] flex items-center justify-center">
                    <HeadsSvg />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Visual;