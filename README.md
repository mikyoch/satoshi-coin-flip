# Time Locked Satoshi Coin Flip

A sample UI for presenting the time locked satoshi coin flip.
You can try it @ : `<public URL>`

Note: This example is developed on Sui DevNet and new releases might affect its availability.

## Introduction

We present a fair method to use Sui blockchain in order to conduct a 50 / 50 chance game.

We model it after a coin flip since the chances are 50%.<br/>
The theory backing this project was presented by Kostas Chalkias (Mysten Labs Head of Cryptography) at the GAME3R Forum in Novemeber of 2022.>><br/>
The smart contract source code, that is running on Sui devnet, can be found at `satoshi_flip/sources/satoshi_flip.move`.

## Smart Contract Flow

The smart contract is intended for any two players.<br/>
The first player will be the house, it picks a random secret (the randomness is up to this player) and it commits on chain the hash of this secret.
The second player may come and wage a guess on a predetermined bit of this secret, either 0 or 1.
The house reveals the secret and the smart contract determines the winner.

Fairness is ensured and verifiable by:

1) Hashing the secret and verifying that it matches the initial hash the house submitted (the contract also does this).
2) Time-locking the game so that the house is obliged to reveal the secret after an X amount of epochs (X=7 in our example). 

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

## Prereqs
To try the code here you will need:
- a Sui address with coins
- sui cli tool with active network devnet
- sui compatible wallet on chrome
- npm
- node

## Usage
If you'd like to give the code a try here's how you can set it up:

Clone the repo locally.<br/>
Navigate to the api folder `api/` and edit (or create) the `api/.env` file, set the following values to ones that make sense for you:

- `PORT=8080`
- `environment=dev`
- `trustedOriginsDev=["http://localhost:3000"]`
- `trustedOriginsProd=[""]`
- `BANKER_ADDRESS=<your Sui address or leave empty if you will run the setEnv.js script>`
- `PACKAGE_ADDRESS=<the address of the satoshi_flip package on the Sui network you use or leave empty and run the setEnv.js script>`
- `PRIVATE_KEY=<the private key coresponding to the active address in a [byte array] or leave empty if you intend to run the setEnv.js script>`

If you left any or both of `BANKER_ADDRESS` and `PACKAGE_ADDRESS` empty then run `node setEnv.js` to have them automatically completed.
This script will set the first `ED25519` address you own as the active-address and will publish the contract on the active network (must be devnet).
Also it will set the `PRIVATE_KEY`.

### Smart contract
To deploy the smart contract yourself, if you skipped using the `setEnv.js` script, navigate the the contracts directory `satoshi_flip` and press `sui publish --gas-budget 5000`. Get the package id from the output and put it in the `api/.env` and `ui/.env` files (check the templates for the appropriate variable naming).

### API
Next move to the `api/` directory , do another `npm install`.
Lastly with `npm run dev` the server will start locally at `localhost:8080` depending on the `PORT` variable of in `api/.env`.

### UI
Navigate to the `ui/` directory and run `npm install`, followed by `npm run dev` for local trials. The UI will start running at `localhost:3000` and you can start playing.
