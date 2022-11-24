import React, { Component, useMemo, useState } from "react";
import "../styles/globals.css";
import { WalletProvider } from "@mysten/wallet-adapter-react";
import { WalletStandardAdapterProvider } from "@mysten/wallet-adapter-all-wallets";
import PlayGameButton from "../components/PlayGameButton";
import { COIN } from "../helpers/constants";

// Components
import { Header } from "../components/Header";
import { NewGameButton } from "../components/NewGameButton";
import Visual from "../components/Visual";
import Spinner from "../components/Spinner";

function MyApp({ Component, pageProps }) {
  const adapters = useMemo(
    () => [
      // Add support for all wallets that adhere to the Wallet Standard:
      new WalletStandardAdapterProvider(),
    ],
    []
  );
  const [newGame, setNewGame] = useState(null);

  return (
    <WalletProvider adapters={adapters}>
      <div className="App h-screen bg-faint-blue">
        <Header />
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="h-96 rounded-lg border-2 border-dashed border-sui-ocean/10 flex items-center justify-center">
              <Visual />
            </div>
            
            <div className="flex max-w-7xl py-6 sm:px-6 lg:px-8 justify-center">
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
          </div>
        </div>
      </div>
    </WalletProvider>
  );
}

export default MyApp;
