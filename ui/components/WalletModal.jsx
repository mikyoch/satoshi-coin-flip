import React, { useEffect, useState } from "react";
import { useWallet } from "@mysten/wallet-adapter-react";

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
      <div className="flex-inline">
        {!connected ? (
          <button className="text-white" onClick={handleClickOpen}>
            Connect To Wallet
          </button>
        ) : (
          <>
            <div className="text-sui-sky">{account}</div>
            <button className="text-white" onClick={handleDisconnect}>
              Logout
            </button>
          </>
        )}
        ;
      </div>

      {open ? (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-sui-ocean-dark bg-opacity-50">
            <div className="relative w-auto my-4 mx-auto max-w-3xl">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-sui-ocean outline-none focus:outline-none">
                <div className="flex items-start justify-end p-5">
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
                <div className="relative p-5 flex-auto">
                  <>
                    {!connected && (
                      <div>
                        <div>
                          {wallets.map((wallet, i) => (
                            <div
                              key={i}
                              onClick={() => handleConnect(wallet.name)}
                            >
                              {wallet.name}
                            </div>
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
