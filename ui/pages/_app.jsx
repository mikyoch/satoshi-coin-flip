// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import "../styles/globals.css";

// Services & dependencies
import { WalletProvider } from "@mysten/wallet-adapter-react";
import { WalletStandardAdapterProvider } from "@mysten/wallet-adapter-all-wallets";
import { Toaster } from "react-hot-toast";

// Components
import Header from "../components/Header";
import Footer from "../components/Footer";
const DynamicGameScreen = dynamic(() => import("../components/GameScreen"), {
  suspense: true,
});

function MyApp() {
  // wallet provider
  const adapters = useMemo(
    () => [
      // Add support for all wallets that adhere to the Wallet Standard:
      new WalletStandardAdapterProvider(),
    ],
    []
  );

  return (
    <>
      <Toaster />
      <WalletProvider adapters={adapters}>
        <div className="App min-h-screen h-full bg-gradient-to-b from-faint-blue to-faint-blue/50 flex flex-col justify-between items-stretch">
          <Header />
          <div className="w-full mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            <Suspense fallback={`Loading...`}>
              <DynamicGameScreen />
            </Suspense>
          </div>
          <Footer />
        </div>
      </WalletProvider>
    </>
  );
}

export default MyApp;
