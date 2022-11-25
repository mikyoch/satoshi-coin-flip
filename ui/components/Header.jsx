import React from "react";
import { WalletModal } from "./WalletModal";
import Logo from "../public/svg/sui-logo-light.svg";
import Image from "next/image";

const Header = () => {
  return (
    <>
      <div className="bg-sui-ocean-dark px-3.5">
        <div className="py-4">
          <div className="flex justify-between items-center flex-wrap">
            <div className="flex-auto md:pr-3.5">
              <Logo />
            </div>
            <div className="flex flex-col w-auto">
              <span><Image src="/tails.jpg" alt="0" width="20" height="20" /> = TAILS</span>
              <span><Image src="/heads.jpg" alt="1" width="20" height="20" /> = HEADS</span>
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
