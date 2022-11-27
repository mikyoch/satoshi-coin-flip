import React, { useEffect, useState } from "react";
import { useWallet } from "@mysten/wallet-adapter-react";
import ExplorerLink from "./ExplorerLink";
import Image from "next/image";

export function WalletModal() {
  let { connected } = useWallet();
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const { wallets, wallet, select, connecting, disconnect, getAccounts } =
    useWallet();

  const [account, setAccount] = useState("");

  const handleConnect = (walletName) => {
    select(walletName);
    handleClose();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  useEffect(() => {
    if (!connected) return;

    getAccounts().then((accounts) => {
      if (accounts && accounts.length) {
        setAccount(accounts[0]);
      }
    });
  }, [wallet, connected, getAccounts]);

  return (
    <>
      <div className="w-full flex flex-wrap space-x-2 justify-end">
        <div className="flex-1 text-right">
          {!connected ? (
            <button
              className="flex-1 text-sui-sky bg-sui-ocean-dark border border-sui-sky text-md px-6 py-3 
          rounded-full hover:bg-sui-ocean hover:text-white"
              onClick={handleClickOpen}
            >
              <div className="flex align-start">
                Connect To Wallet
                <span className="flex h-2 w-2 relative ml-2 -mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber/80"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-failure/80"></span>
                </span>
              </div>
            </button>
          ) : (
            <>
              <div className="flex items-center">
                <div className="flex flex-1 justify-end text-sm pr-5">
                  <span className="pr-1 text-sui-text-light">
                    Connected address:
                  </span>
                  <ExplorerLink id={account} type="address" />
                  <span className="pr-1 text-sui-text-light hidden lg:inline-flex">
                    ({wallet.name})
                  </span>
                </div>
                <button
                  className="text-md px-6 py-3 rounded-full border text-sui-text-light border-sui-ocean hover:bg-sui-ocean"
                  onClick={handleDisconnect}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {open ? (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-sui-ocean-dark bg-opacity-50">
            <div className="relative w-auto my-4 mx-auto max-w-3xl">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-sui-ocean outline-none focus:outline-none">
                <div className="flex items-start justify-end p-2.5">
                  <button
                    className="bg-transparent border-0 float-right"
                    onClick={handleClose}
                  >
                    <span className="text-sui-sky h-4 w-4 text-lg block py-0 rounded">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  </button>
                </div>
                <div className="relative px-5 pt-1 pb-5 flex-auto">
                  <div className="text-center test-sm text-white">
                    Select your wallet provider
                  </div>
                  <>
                    {!connected && (
                      <div className="flex pt-6 pb-5">
                        <div className="flex-1">
                          {wallets.map((wallet, i) => (
                            <button
                              className="w-full flex px-6 py-3 bg-sui-ocean-dark rounded-full my-3 items-center hover:bg-sui-text-dark"
                              key={i}
                              onClick={() => handleConnect(wallet.name)}
                            >
                              <span className="mr-3">
                                <Image src={wallet.icon} alt={wallet.name} width="16" height="16"/>
                              </span>
                              <span className="text-sui-text-light">
                                Connect {wallet.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

export default WalletModal;
