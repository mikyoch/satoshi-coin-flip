<<<<<<< HEAD
import React, { useEffect, useMemo, useState } from "react";
import "../styles/globals.css";
import { WalletProvider } from "@mysten/wallet-adapter-react";
import { WalletStandardAdapterProvider } from "@mysten/wallet-adapter-all-wallets";
import Visual from "../components/Visual";
import { NewGameButton } from "../components/NewGameButton";
import LinksContainer from "../components/LinksContainer";
import { endGame } from "../services/SatoshiAPI";

// Components
import { Header } from "../components/Header";
import ExplorerLink from "../components/ExplorerLink";
=======
import React, { Component, useMemo, useState } from "react";
import "../styles/globals.css";
import { WalletProvider } from "@mysten/wallet-adapter-react";
import { WalletStandardAdapterProvider } from "@mysten/wallet-adapter-all-wallets";
import PlayGameButton from "../components/PlayGameButton";
import { COIN } from "../helpers/constants";

// Components
import { Header } from "../components/Header";
import { NewGameButton } from "../components/NewGameButton";
>>>>>>> master


function MyApp() {
  // wallet provider
  const adapters = useMemo(
    () => [
      // Add support for all wallets that adhere to the Wallet Standard:
      new WalletStandardAdapterProvider(),
    ],
    []
  );
  const [newGame, setNewGame] = useState(null);

  // game logic
  const [visualStatus, setVisualStatus] = useState(2);
  const [gameId, setGameId] = useState("");
  const [history, setHistory] = useState([]);
  const [currentTxs, setCurrentTxs] = useState([]);

  
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
  
  let playerChoice;
  const newGameClicked = (gameId_, transactionId) => {
    setGameId(gameId_);
    setVisualStatus(2);
    setCurrentTxs([{id: gameId_, type: "object"}]);//([{id: transactionId, type: "transaction"}]);
  }

  const play = async (e) => {
    // assert current gameId !== ""

    //test
    const result = Math.floor(Math.random() * 2);
    const choice = e.currentTarget.id === "heads" ? 1 : 0;
    let isWon = result === choice;
    // call end bet and get winner
    const endGameResponse = await endGame(gameId);
    // isWon = endGameResponse.data.playerWon

    setGameId("");
    if (isWon) setHistory(old => [...old, {type: "win", id: gameId}]);
    else setHistory(old => [...old, {type: "loss", id: gameId}]);
  }

  return (
<<<<<<< HEAD
      <WalletProvider adapters={adapters}>
        <Header />
        <div className="App h-screen flex flex-row items-center justify-center bg-faint-blue">
          <div id="game" className="w-3/5 flex flex-col items-center justify-center">
            <span>Current Game: {gameId ?<ExplorerLink id={gameId} type="object"/> : ` -- (Press New Game)`}</span>
            <Visual isRunning={visualStatus} />
            {gameId === "" ?
              (
                <NewGameButton callback={newGameClicked}/>
              )
              :(
                <div id="ht-buttons">
                  <button id="tails" onClick={play}>Heads</button>
                  <button id="heads" onClick={play}>Tails</button>
                </div>
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
=======
    <WalletProvider adapters={adapters}>
      <Header />
      <div className="App h-screen flex flex-col items-center justify-center bg-faint-blue">
        {!newGame ? (
          // Display the New Game button initially
          <NewGameButton setGameId={setNewGame} />
        ) : (
          // Once the gameID is set, show the user the Heads/Tails buttons
          <>
            <PlayGameButton coinSide={COIN.HEADS} gameID={newGame} />
            <PlayGameButton coinSide={COIN.TAILS} gameID={newGame} />
          </>
        )}
      </div>
    </WalletProvider>
>>>>>>> master
  );
}

export default MyApp;
