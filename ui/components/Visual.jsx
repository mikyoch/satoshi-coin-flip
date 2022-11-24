import Image from "next/image";
import Slot from "./Slot.jsx";

/*
  props.isRunning integer, 0 = tails, 1 = heads, 2 = running
  Usage:
  Pass <Visual isRunning=2 /> to have heads tails spinning
  Pass <Visual isRunning=0 /> to get only "tails"
  Pass <Visual isRunning=1 /> to get only "heads"
*/
export default function Visual(props) {
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
                className="slot bg-white overflow-hidden dark:bg-gray-700 h-[250px] md:h-[320px] rounded-lg shadow flex items-center justify-center"
              >
                <div>
                  <div className="block w-full border-4 border-double border-yellow-400 rounded-full text-center text-5xl md:text-6xl py-6">
                    <Image
                      src={`/${result}.jpg`}
                      alt={result}
                      width="64"
                      height="64"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      );

}
