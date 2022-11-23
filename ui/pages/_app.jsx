import React, { Component, useMemo } from "react";
import "../styles/globals.css";
import { WalletProvider } from "@mysten/wallet-adapter-react";
import { WalletStandardAdapterProvider } from "@mysten/wallet-adapter-all-wallets";

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
          Main content here
        </div>
      </WalletProvider>
  );
}

export default MyApp;
