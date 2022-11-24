import { useState, useEffect } from "react";
import Image from "next/image";
import {heads, tails} from "../helpers/constants";

export default function Slot() {
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
  return (
    <div
      id="slot"
      className="slot bg-white overflow-hidden dark:bg-gray-700 h-[250px] md:h-[320px] rounded-lg shadow flex items-center justify-center"
    >
      <div>
        {slotSlides.map((item) => (
          <div
            key={item}
            className="block w-full border-4 border-double border-yellow-400 rounded-full text-center text-5xl md:text-6xl py-6"
          >
            <Image src={`/${item}.jpg`} alt={item} width="64" height="64" />
          </div>
        ))}
      </div>
    </div>
  );
}
