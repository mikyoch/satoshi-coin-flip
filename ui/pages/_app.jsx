import React, { useEffect, useMemo, useState } from "react";
import "../styles/globals.css";
import { WalletProvider } from "@mysten/wallet-adapter-react";
import { WalletStandardAdapterProvider } from "@mysten/wallet-adapter-all-wallets";
import { endGame } from "../services/SatoshiAPI";
// Components
import { Header } from "../components/Header";
import ExplorerLink from "../components/ExplorerLink";
import Visual from "../components/Visual";
import LinksContainer from "../components/LinksContainer";
import { NewGameButton } from "../components/NewGameButton";
import Spinner from "../components/Spinner";
import PlayButton from "../components/PlayGameButton";
import { Toaster } from "react-hot-toast";
import { notifyPlayResult, notifySucess } from "../services/Toasts";
import { COIN } from "../helpers/constants";
import Footer from "../components/Footer";

function MyApp() {
  // wallet provider
  const adapters = useMemo(
    () => [
      // Add support for all wallets that adhere to the Wallet Standard:
      new WalletStandardAdapterProvider(),
    ],
    []
  );

  // game logic
  const [visualStatus, setVisualStatus] = useState(0);
  const [gameId, setGameId] = useState("");
  const [history, setHistory] = useState([]);
  const [currentTxs, setCurrentTxs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // always make sure to end running games
  useEffect(() => {
    // ToDo: Add prompt to remind the user that a new game is ongoing!
    window.addEventListener("beforeunload", () => {
      if (gameId !== "") {
        endGame(gameId);
        setGameId("");
      }
    });

    window.addEventListener("unload", () => {
      if (gameId !== "") {
        endGame(gameId);
        setGameId("");
      }
    });
  });

  const newGameClicked = (gameId_, transactionId) => {
    setIsLoading(false);
    setGameId(gameId_);
    setVisualStatus(2);
    setCurrentTxs([{ id: transactionId, type: "transaction" }]);
    notifySucess("Created new game!");
  };

  const finish = async (choice) => {
    const endResponse = await endGame(gameId);
    const { playerWon, transactionDigest } = endResponse.data;
    const show = playerWon ? choice : (choice + 1) % 2;
    setVisualStatus(show);
    notifyPlayResult(
      `You played ${choice === COIN.HEADS ? "heads" : "tails"}`,
      playerWon
    );
    setIsLoading(false);
    if (playerWon) setHistory((old) => [{ type: "win", id: gameId }, ...old]);
    else setHistory((old) => [{ type: "loss", id: gameId }, ...old]);
    setCurrentTxs((old) => [
      { id: transactionDigest, type: "transaction" },
      ...old,
    ]);
    setGameId("");
  };

  const playButtonClicked = (choice, transactionId) => {
    setCurrentTxs((old) => [
      { id: transactionId, type: "transaction" },
      ...old,
    ]);
    finish(choice);
  };

  return (
    <>
      <Toaster />
      <WalletProvider adapters={adapters}>
        <div className="App h-screen bg-faint-blue flex flex-col justify-between items-stretch">
          <Header />
          <div className="w-full mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex flex-col items-center justify-center text-center pb-5">
                <span>
                  Current Game:{" "}
                  {gameId ? (
                    <ExplorerLink id={gameId} type="object" />
                  ) : (
                    <div>N/A</div>
                  )}
                </span>
              </div>

              <div className="h-86 rounded-lg border-2 border-dashed border-sui-ocean/10 flex items-center justify-center">
                <div
                  id="game"
                  className="flex flex-col items-center justify-center mb-10"
                >
                  <Visual isRunning={visualStatus} />
                  {isLoading ? (
                    <div className="h-[50px]">
                      <Spinner />
                    </div>
                  ) : gameId === "" ? (
                    <div className="h-[50px]">
                      <NewGameButton
                        callback={newGameClicked}
                        loading={setIsLoading}
                      />
                    </div>
                  ) : (
                    <div id="ht-buttons" className="h-[50px]">
                      <PlayButton
                        coinSide="TAILS"
                        gameID={gameId}
                        callback={playButtonClicked}
                        loading={setIsLoading}
                      />
                      <PlayButton
                        coinSide="HEADS"
                        gameID={gameId}
                        callback={playButtonClicked}
                        loading={setIsLoading}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="relative flex justify-between items-stretch px-4 py-6">
                <div id="history" className="flex-1 flex flex-col">
                  <div className="relative flex justify-center items-end mb-3">
                    <h2 className="pb-2 text-center">History</h2>
                    <span className="absolute w-[200px] h-[4px] rounded-full bg-gradient-to-r from-sui-ocean/0 via-sui-ocean/10 to-sui-ocean/0"></span>
                  </div>
                  <LinksContainer linksArray={history} />
                </div>
                <span className="absolute left-2/4 top-2/4 -ml-[12px] h-6 w-6 text-sui-ocean/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                    />
                  </svg>
                </span>

                <div id="transactions" className="flex-1 flex flex-col">
                  <div className="relative flex justify-center items-end mb-3">
                    <h2 className="pb-2 text-center">Transactions</h2>
                    <span className="absolute w-[200px] h-[4px] rounded-full bg-gradient-to-r from-sui-ocean/0 via-sui-ocean/10 to-sui-ocean/0"></span>
                  </div>
                  <LinksContainer linksArray={currentTxs} />
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </WalletProvider>
    </>
  );
}

export default MyApp;
