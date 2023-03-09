// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * Play Game Button component
 * Use: The button will render as heads or tails and will execute the respective moveCall
 */

import { HOUSE_DATA, PACKAGE } from "../helpers/constants";
import { useWallet } from "@mysten/wallet-adapter-react";
import { Connection, JsonRpcProvider } from "@mysten/sui.js";
import { notifyError, notifyInfo } from "../services/Toasts";
import { COIN } from "../helpers/constants";
import HeadsSvg from "../public/svg/capy.svg";
import TailsSvg from "../public/svg/capy-text.svg";
import { registerGame } from "../services/SatoshiAPI";
import { bytesToHex, randomBytes } from "@noble/hashes/utils";

const PlayButton = ({ coinSide, gameID, callback, loading, showChoice }) => {
  // Initialize provider
  const connectionOptions = new Connection({
    fullnode: "https://fullnode.devnet.sui.io",
  });
  const provider = new JsonRpcProvider(connectionOptions);
  const { connected, getAccounts, signAndExecuteTransaction } = useWallet();

  // Get all coin objects for the current player
  const getPlayerCoinObjects = async () => {
    return new Promise(async (resolve, reject) => {
      const playerAccounts = await getAccounts();
      const playerActiveAccount = playerAccounts[0];

      provider
        .getObjectsOwnedByAddress(playerActiveAccount)
        .then((res) => {
          let coinObjects = res.filter((x) => x.type.includes("Coin"));

          provider
            .getObjectBatch(coinObjects.map((x) => x.objectId))
            .then((res) => {
              const coins = res.map((x) => {
                return {
                  id: Object(x?.details)?.data?.fields?.id?.id,
                  balance: Object(x?.details)?.data?.fields?.balance,
                };
              });
              resolve(coins);
            });
        })
        .catch((e) => {
          console.error("Player Coins error: ", e);
          reject(e);
        });
    });
  };

  // Find the largest (or exact) coin from the player's coin collection
  const getPlayerSuitableCoinID = async () => {
    return new Promise((resolve, reject) => {
      let coinID = "",
        balance = 5000;

      try {
        getPlayerCoinObjects().then((playerCoins) => {
          for (let coin of playerCoins) {
            // Return in case the coin has the exact balance we need
            if (coin.balance >= 5000) {
              coinID = coin.id;
              balance = coin.balance;
              break;
            }
          }

          resolve({ coinID, balance });
        });
      } catch (e) {
        reject(e);
      }
    });
  };

  const handleClick = async () => {
    loading(true);
    try {
      const choice = coinSide === "TAILS" ? COIN.TAILS : COIN.HEADS;
      showChoice(choice);
      // Get an appropriate coin from the player
      const playerCoin = await getPlayerSuitableCoinID();
      if (!playerCoin.coinID) {
        loading(false);
        return notifyInfo(
          "Looks like you are out of coins. Consider requesting some coins from the faucet and try again!"
        );
      }
      const user_randomness = randomBytes(16);
      const userRandomHexString = bytesToHex(user_randomness);
      const transactionResponse = await signAndExecuteTransaction({
        kind: "moveCall",
        data: {
          packageObjectId: `${PACKAGE}`,
          module: "single_player_satoshi",
          function: "start_game",
          typeArguments: [],
          arguments: [
            `${choice}`,
            Array.from(user_randomness),
            `${playerCoin.coinID}`,
            `${HOUSE_DATA}`,
          ],
          gasBudget: 10000,
        },
      });

      const transactionStatus = transactionResponse.effects.status;
      const gameObjId =
        transactionResponse?.effects?.created?.[0]?.reference?.objectId;

      if (transactionStatus === "failure") {
        const statusMessage = transactionResponse.effects.status.error;
        notifyError("Transaction failed. Please make sure you have enough gas");
        console.log(statusMessage.status);
      } else {
        const digest = transactionResponse?.effects?.transactionDigest;
        await registerGame(gameObjId);
        callback(gameObjId, userRandomHexString, choice, digest);
      }
    } catch (e) {
      notifyError("Something went wrong, please try again later");
      console.error(e);
    }
  };

  const renderButtonIcon = (side) => {
    return side === "TAILS" ? <TailsSvg /> : <HeadsSvg />;
  };

  return (
    <>
      <button
        onClick={handleClick}
        id={coinSide}
        disabled={!connected}
        className="group bg-gray-dark text-white/70 px-6 py-3 mx-2 lowercase rounded-full shadow hover:shadow-lg outline-none focus:outline-none  disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed disabled:text-white/50">
        <span className="group-hover:text-white/80 flex items-center justify-center capitalize pr-1">
          <span className="flex justify-center w-6 h-6 text-sui-sky/60 group-hover:text-sui-sky/100">
            {renderButtonIcon(coinSide)}
          </span>
          <span className="px-1 ml-1">Play</span>
          <span className="lowercase">{coinSide}</span>
        </span>
      </button>
    </>
  );
};

export default PlayButton;
