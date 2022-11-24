import React from "react";
import { WalletModal } from "./WalletModal";
import Logo from "../public/svg/sui-logo-light.svg";

const Header = () => {
  return (
    <>
      <div className="bg-sui-ocean-dark px-3.5">
        <div className="py-4">
          <div className="flex justify-between items-center flex-wrap">
            <div className="flex-auto md:pr-3.5">
              <Logo />
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
