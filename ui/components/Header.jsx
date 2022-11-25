import React from "react";
import { WalletModal } from "./WalletModal";
import Logo from "../public/svg/sui-logo-light.svg";
import HeadsSvg from "../public/svg/heads.svg";
import TailsSvg from "../public/svg/tails.svg";

const Header = () => {
  return (
    <>
      <div className="bg-sui-ocean-dark px-3.5">
        <div className="py-4">
          <div className="flex justify-between items-center flex-wrap">
            <div className="flex flex-auto md:pr-3.5 items-center">
              <Logo />
              <div className="flex w-auto h-4 border-l-2 border-white/5 ml-10 pl-5">
                <span className="flex flex-auto text-sui-text-light px-5 items-center">
                  <span className="flex w-3.5 mr-2">
                    <TailsSvg />
                  </span>
                  = tails
                </span>
                <span className="flex flex-auto text-sui-text-light px-5 items-center">
                  <span className="flex w-3 mr-2">
                    <HeadsSvg />
                  </span>
                  = heads
                </span>
              </div>
            </div>
            <div className="flex-auto md:pl-3.5">
              <WalletModal />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { Header };
