/**
 * Wallet Modal component
 * Use: Renders as a `Connect` button which toggles a modal's visibility
 * The modal integrates the @mysten/wallet-adapter and gives the user the ability
 * to connect from a list of available wallets.
 */
import { useEffect, useRef, useState } from "react";
import { useWallet } from "@mysten/wallet-adapter-react";
import ExplorerLink from "./ExplorerLink";
import SuiSvg from "../public/svg/sui.svg";
import { notifyInfo } from "../services/Toasts";
import { JsonRpcProvider, Network, MIST_PER_SUI } from "@mysten/sui.js";

const WalletModal = () => {
  let { connected, wallets, wallet, select, disconnect, getAccounts } =
    useWallet();
  const [open, setOpen] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [account, setAccount] = useState("");
  const [accountBalance, setAccountBalance] = useState(0);
  const intervalRef = useRef();

  const getBalance = async (account) => {
    if (!account) return;
    let provider = new JsonRpcProvider(Network.DEVNET);
    let coinObjs = await provider.getCoinBalancesOwnedByAddress(account);
    let balance = coinObjs
      .map((coinObj) => coinObj.details.data.fields.balance)
      .reduce((curCoin, nextCoin) => curCoin + nextCoin);
    setAccountBalance(balance / Number(MIST_PER_SUI));
  };

  const setBalanceCheckInterval = (accounts, interval = 3000) => {
    intervalRef.current = setInterval(async () => {
      await getBalance(accounts[0]);
    }, interval);
  };

  const clearBalanceCheckInterval = () => {
    clearInterval(intervalRef.current);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConnect = (walletName) => {
    select(walletName);
    handleClose();
  };

  const handleDisconnect = () => {
    notifyInfo(
      "You are disconnected. Connect your wallet to continue playing!"
    );
    clearBalanceCheckInterval();
    disconnect();
  };

  useEffect(() => {
    if (!connected) return;

    setWalletName(wallet.name.replace(/\(|\)/g, ""));

    getAccounts().then((accounts) => {
      if (accounts && accounts?.length) {
        getBalance(accounts[0]);
        setBalanceCheckInterval(accounts);
        setAccount(accounts[0]);
      }
    });

    return clearBalanceCheckInterval();
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
              <div className="flex items-center justify-end">
                <div className="grid grid-rows-2">
                  <div className="flex flex-1  justify-end text-sm pr-5">
                    <span className="pr-1 text-sui-text-light">
                      Connected address:
                    </span>
                    <ExplorerLink id={account} type="address" text={account} />
                    <span className="pl-1 text-sui-text-light hidden lg2:inline-flex font-light">
                      ({walletName})
                    </span>
                  </div>
                  <div className="flex flex-1  justify-end text-sm pr-5">
                    <span className="pr-1 text-sui-text-light">Balance:</span>
                    <span className="text-sui-sky">
                      <b>{accountBalance}</b> SUI
                    </span>
                  </div>
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
                                {wallet.name.includes("Sui") ? (
                                  <span className="flex w-4 h-6 text-sui-sky">
                                    <SuiSvg />
                                  </span>
                                ) : (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={wallet.icon}
                                    alt={wallet.name}
                                    width="16"
                                    height="16"
                                  />
                                )}
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
};

export default WalletModal;
