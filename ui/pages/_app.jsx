import React, { Component, useMemo } from "react";
import "../styles/globals.css";
import { WalletProvider } from "@mysten/wallet-adapter-react";
import { WalletStandardAdapterProvider } from "@mysten/wallet-adapter-all-wallets";
import { TestTransaction } from "../components/TestTransaction";

// Components
import { Header } from "../components/Header";

function MyApp({ Component, pageProps }) {
  const adapters = useMemo(
    () => [
      // Add support for all wallets that adhere to the Wallet Standard:
      new WalletStandardAdapterProvider(),
    ],
    []
  );

  return (
      <WalletProvider adapters={adapters}>
        <Header />
        <div className="App h-screen flex flex-col items-center justify-center bg-faint-blue">
          <h1>Test NFT Transaction</h1>
          <TestTransaction />
        </div>
      </WalletProvider>
  );
}

export default MyApp;
