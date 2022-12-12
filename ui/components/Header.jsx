/**
 * Header component
 * Use: Top of the page
 * Has: Logo, guides and Wallet connect button
 */
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Link from "next/link";

const DynamicWalletModal = dynamic(() => import("./WalletModal"), {
  suspense: true,
});

import TopHeader from "../components/TopBar";
import Logo from "../public/svg/sui-logo-light.svg";
import CapySvg from "../public/svg/capy.svg";
import CapyTxtSvg from "../public/svg/capy-text.svg";

const Header = () => {
  return (
    <div>
      <TopHeader />
      <div className="bg-sui-ocean-dark px-3.5 overflow-hidden">
        <div className="py-4">
          <div className="flex justify-between items-center flex-wrap flex-col sm:flex-row">
            <div className="flex flex-auto md:pr-3.5 justify-between sm:justify-start items-center">
              <Link href="/">
                <Logo />
              </Link>
              <div className="hidden xs:flex w-auto h-4 border-l-2 border-white/5 sm:ml-10 sm:pl-5">
                <span className="flex flex-auto text-sui-text-light px-5 items-center">
                  <span className="flex w-6 h-6 mr-2 text-sui-text-light">
                    <CapySvg />
                  </span>
                  = heads
                </span>
                <span className="flex flex-auto text-sui-text-light px-1 sm:px-5 items-center">
                  <span className="flex w-12 h-6 mr-2">
                    <CapyTxtSvg />
                  </span>
                  = tails
                </span>
              </div>
            </div>
            <div className="flex-auto pt-4 sm:pt-0 md:pl-3.5">
              <Suspense fallback={`Loading...`}>
                <DynamicWalletModal />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
