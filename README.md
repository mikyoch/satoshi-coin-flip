# Time Locked Satoshi Coin Flip

A sample UI for presenting the time locked satoshi coin flip.

## Introduction

We present a fair way to conduct a 50 / 50 chance game.

We model it after a coin flip since the chances are 50%.<br/>
The theory backing this project was presented by Kostas Chalkias at the << Confernce??? >><br/>
The smart contract source code, that is running on Sui devnet, can be found at << TO BE ADDED when merged >>

## Smart Contract Flow

The smart contract is intended for any two players.<br/>
The first player will be the house, it picks a random secret (the randomness is up to this player) and it commits on chain the hash of this secret.
The second player may come and wage a guess on a predetermined bit of this secret, either 0 or 1.
The house reveals the secret and the smart contract determines the winner.
The fairness can be checked by hashing the secret and verify that it matches the initial hash the house submitted. (The contract also does this).

## UI Flow

The model used here is a coin flip.<br/>
The house is the UI itself. Any player may join, connect a Sui compatible wallet (Ethos and Sui Wallet supported at the moment), and start a new game by clicking the `New Game` button. <br/>
The house picks the secret and commits the hash and a coin of at least 5000 Mist value.
The player is invited now to pick `Tails` or `Heads` which stand for 0 or 1 and lock 5000 Mist of his balance, to guess the predetermined bit.<br/>
The UI will end the game by revealing the secret and transfer 10000 Mist to the winner.

The contract allows for a variable amount of MIST, up to a determined by the house amount, this UI has locked the amount at 5000 MIST.

The UI is used to showcase our fairness claim, the player may at any point check the created objects and transactions on the chain, he may also double check that the hashes match and that the outcome is correct.

## Server
A simple server is used to protect house private data and calls.

## Usage
If you want to try this yourself, first clone this repository. Then change to the `./ui` directory and run `pnpm install`, followed by `npm run dev` for local trials. The UI will start running at `localhost:3000`.

Next move to the `./api` directory and make sure to change the `house_privkey` value to a private key you own.<br/>
(You can find the < scheme flag byte | pubkey 32 byte| privkey 32 bytes> base64 encoded inside `~/.sui/sui_config/sui.keystore`).<br/>
If you have a local Sui spun up, then also change the `rpc_address` to point to your local node (usually `localhost:9000`) </br>
In any case, if you published the smart contract on a Sui network, either local or public, change the `package_id` value to the one assigned when you published it.
 Lastly with `node server.js` the server will start locally at `localhost:8000`.
