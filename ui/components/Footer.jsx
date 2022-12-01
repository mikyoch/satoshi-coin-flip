import React from "react";
import TailsSvg from "../public/svg/mystenlabs-icon.svg";
import MystenLabs from "../public/svg/mystenlabs.svg";

const Footer = () => {
  const getYear = () => {
    return new Date().getFullYear();
  };

  return (
    <div className="flex flex-wrap items-center justify-between bg-sui-ocean-dark p-3.5">
      <div className="flex items-stretch py-3">
        <span className="text-white/40 h-[15px] w-8">
          <TailsSvg />
        </span>
        <span className="text-white/40 h-[22px] w-32 ml-3">
          <MystenLabs />
        </span>
        <span className="text-white/40 h-[22px] text-[10px] ml-2">© {getYear()}</span>
      </div>
      <div className="text-xs text-white/50">
        <p>This is a demo to present a fair method to use Sui blockchain in order to conduct a 50/50 chance game.</p>
      </div>
    </div>
  );
};

export default Footer;
