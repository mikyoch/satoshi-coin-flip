import React, { Component, useMemo, useState } from "react";
import "../styles/globals.css";
import { WalletProvider } from "@mysten/wallet-adapter-react";
import { WalletStandardAdapterProvider } from "@mysten/wallet-adapter-all-wallets";
import PlayGameButton from "../components/PlayGameButton";
import { COIN } from "../helpers/constants";

// Components
import { Header } from "../components/Header";
import { NewGameButton } from "../components/NewGameButton";

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
      <Header />
      <div className="App h-screen flex flex-col items-center justify-center bg-faint-blue">
        {!newGame ? (
          // Display the New Game button initially
          <NewGameButton setGameId={setNewGame} />
        ) : (
          // Once the gameID is set, show the user the Heads/Tails buttons
          <>
            <PlayGameButton coinSide={COIN.HEADS} />
            <PlayGameButton coinSide={COIN.TAILS} />
          </>
        )}
      </div>
    </WalletProvider>
  );
}

export default MyApp;
