import React, { useEffect, useMemo, useState } from "react";
import "../styles/globals.css";
import { WalletProvider } from "@mysten/wallet-adapter-react";
import { WalletStandardAdapterProvider } from "@mysten/wallet-adapter-all-wallets";
import { endGame } from "../services/SatoshiAPI";
// Components
import ClipLoader from "react-spinners/ClipLoader";
import { Header } from "../components/Header";
import ExplorerLink from "../components/ExplorerLink";
import Visual from "../components/Visual";
import LinksContainer from "../components/LinksContainer";
import { NewGameButton } from "../components/NewGameButton";
import PlayButton from "../components/PlayGameButton";


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
  const [visualStatus, setVisualStatus] = useState(2);
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
    setCurrentTxs([{id: transactionId, type: "transaction"}]);
  }

  const finish = async (choice) => {
    const endResponse = await endGame(gameId);
    const {playerWon, transactionDigest} = endResponse.data;
    const show = playerWon ? choice : (choice + 1) % 2;
    setVisualStatus(show);
    setIsLoading(false);
    if (playerWon) setHistory(old => [{type: "win", id: gameId}, ...old]);
    else setHistory(old => [{type: "loss", id: gameId}, ...old]);
    setCurrentTxs(old => [{id: transactionDigest, type: "transaction"}, ...old]);
    setGameId("");
  }

  const playButtonClicked = (choice, transactionId) => {
    setCurrentTxs(old => [{id: transactionId, type: "transaction"}, ...old]);
    finish(choice);
  }

  return (
      <WalletProvider adapters={adapters}>
        <Header />
        <div className="App h-screen flex flex-row items-center justify-center bg-faint-blue">
          <div id="game" className="w-3/5 flex flex-col items-center justify-center">
            <span>Current Game: {gameId ?<ExplorerLink id={gameId} type="object"/> : ` -- (Press New Game)`}</span>
            <Visual isRunning={visualStatus} />
            {isLoading ?
            (
              <div id="spinner">
                <ClipLoader
                  color="#6fbcf0"
                  // cssOverride={override}
                  size={30}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
              </div>
            )
            :
            (
              gameId === "" ?
              (
                <NewGameButton callback={newGameClicked} loading={setIsLoading}/>
              )
              :(
                <div id="ht-buttons">
                  <PlayButton coinSide="TAILS" gameID={gameId} callback={playButtonClicked} loading={setIsLoading}/>
                  <PlayButton coinSide="HEADS" gameID={gameId} callback={playButtonClicked} loading={setIsLoading}/>
                </div>
              )
            )
            }
            
          </div>
          <div id="history" className="w-1/5">
            <LinksContainer linksArray={history} />
          </div>
          <div id="transactions" className="w-1/5">
            <LinksContainer linksArray={currentTxs} />
          </div>
        </div>
      </WalletProvider>
  );
}

export default MyApp;
