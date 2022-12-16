// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * Game Details component
 * Use: Contains descriptive information about the game
 */
const GameDetails = ({ boxHeight }) => {
  return (
    <div className={`${boxHeight} max-w-lg`}>
      <div className="w-full my-8 text-sui-text-dark">
        <p className="pt-2">
          We present an implementation of the{" "}
          <span className="font-semibold">Satoshi Coin Flip</span>, a game that
          aims to show fairness implemented on the{" "}
          <span className="text-sui-ocean font-medium underline underline-offset-4">
            Sui blockchain
          </span>
          . The UI assumes the role of the House, and each game requires a 5000
          MIST stake. This is implemented on{" "}
          <span className="font-medium">Sui Devnet</span>.
        </p>
        <p className="pt-2">
          Each game generates a random secret. The secret is hashed and then commits on-chain
          the new game smart contract along with the House&apos;s stake. A user can
          then play by staking the fixed amount we&apos;ve defined - 5000 MIST - and
          selects <span className="underline underline-offset-4">Head</span> or{" "}
          <span className="underline underline-offset-4">Tails</span>. The game
          then ends and the winner is selected. Throughout the entire game,
          everyone can see the hash of the secret. One can validate the secret
          from the end-game transaction: by simply hashing, it they can ensure
          that it was a fair game.
        </p>
        <p className="pt-2">We hope you enjoy playing!</p>
      </div>
    </div>
  );
};

export default GameDetails;
