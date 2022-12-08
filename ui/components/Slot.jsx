import { useState, useEffect } from "react";
import HeadsSvg from "../public/svg/capy.svg";
import TailsSvg from "../public/svg/capy-text.svg";

const Slot = () => {
  const [slotSlides, setSlotSlides] = useState(["heads"]);
  const spinningArray = ["heads", "tails"];

  const setSpinningInterval = (timeout) => {
    return setInterval(() => {
      setSlotSlides(spinningArray.sort(() => 0.5 - Math.random()).slice(0, 1));
    }, timeout);
  };

  useEffect(() => {
    const spinInterval = setSpinningInterval(120);
    return function cleanUp() {
      clearInterval(spinInterval);
    };
  });

  const getCoinSideComponent = (item) => {
    return item === "tails" ? <TailsSvg /> : <HeadsSvg />;
  };

  return (
    <div
      id="slot"
      className="slot bg-transparent overflow-hidden rounded-lg flex items-center justify-center drop-shadow-xl my-[55%]"
    >
      <div>
        <div className="block bg-sui-ocean border-4 border-sui-ocean-dark rounded-full text-center p-6">
          {slotSlides.map((item) => (
            <div
              key="{item}"
              className="text-sui-sky h-[50px] w-[50px] flex items-center justify-center"
            >
              {getCoinSideComponent(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Slot;