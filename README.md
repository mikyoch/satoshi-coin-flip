# Time-locked Satoshi Coin Flip

This sample provides an example UI to present a time-locked Satoshi Coin Flip game. You can try it out at [https://satoshi-flip.sui.io](https://satoshi-flip.sui.io).

**Note:** This example runs on Sui DevNet. The site may be briefly unavailable while weekly network updates deploy.

## About the Satoshi Coin Flip example

We present a fair method to use the Sui blockchain to conduct a 50 / 50 game of chance. We model the example after a 2-sided coin flip with a 50% chance for each outcome, Tails or Heads.

Kostas Chalkias, Chief Cryptographer at Mysten Labs, presented the theory behind this project at [GAM3R 2022](https://gam3r.org/).

You can find the source code for the smart contract (satoshi_flip.move) that executes on Sui Devnet in the [satoshi_flip](satoshi_flip/sources/satoshi_flip.move) folder.

## Smart Contract Flow

The smart contract works for any two players. The player that starts the game takes the role of the House. The House picks a random secret and commits on chain the hash of the secret. The House is responsible for picking a properly random secret.

The other player guesses the outcome on a predetermined bit of this secret, either 0 or 1 (Tails or Heads). The House then reveals the secret and the smart contract determines the winner.

Fairness is ensured and verifiable by:
 1. Hashing the secret and verifying that it matches the initial hash the House submitted (this is also verified by the contract).
 1. Time-locking the game so that the House is obliged to reveal the secret after X number of epochs (X=7 in our example).

## UI Flow

The House assumes the role of the UI. Any player can join, connect a Sui-compatible wallet (Ethos, Suiet and Sui Wallet supported currently), and then start a new game by clicking **New Game**.

The House picks the secret and commits the hash and a coin of at least 5000 MIST. The House then asks the player to choose **Tails** or **Heads** (0 or 1 respectively), to guess the predetermined bit. When the player chooses, it locks 5000 MIST of the player's balance in their wallet. 

To end the game, the House reveals the secret and then transfers 10000 MIST to the winner.

The smart contract allows for a variable amount of MIST, up to an amount determined by the House. This example locked the amount at 5000 MIST.

The sample UI demonstrates our fairness claim: The human player can check the objects and transactions created on the chain at any point to verify that the hashes match and the outcome is correct and fair.

## Server

The example uses a simple server to protect House private data and calls. You can find more details about them in the [API README](api)

## Prerequisites

To try the example yourself you will need:
 - a Sui address with SUI coins
 - Sui Client CLI (installed when you install Sui) set to connect to Devnet
 - A Sui-compatible wallet on a Chromium-based browser
 - npm
 - Node

## Using the example

Follow these steps to try out the code yourself:
 1. Clone the repository locally
 1. Navigate to the `/scripts` folder and run `npm install`
 1. Next, populate the `api/.env` and `ui/.env` files. There are two ways to set the required .env files:
    1. **Automatic** - *(Recommended)* Simply run either the API or the UI to execute the `setEnv.js` script (located in the [scripts folder](scripts/dev)), which creates the .env files.
    1. **Manual** - Expand the *Configure .env files manually* section to see details.

<details>
<summary> <b>Configure .env files manually</b> </summary>
Navigate to the `/api` folder and edit (or create) the `api/.env` file. Set values for the following settings as appropriate for your environment:

```
PORT=8080
TRUSTED_ORIGINS=["http://localhost:3000"]
BANKER_ADDRESS=<Your Sui address. If you leave this empty, the setEnv.js script executes when you run the API or start the UI>
PACKAGE_ADDRESS=<the address of the satoshi_flip package on the Sui network you use or leave empty, the setEnv.js script runs on api and ui launch>
PRIVATE_KEY=<the private key coresponding to the active address in a [byte array] or leave empty since the setEnv.js script runs on api and ui launch>
```

If you did not provide values for `BANKER_ADDRESS` or `PACKAGE_ADDRESS`, navigate to `/scripts` folder and run `npm run dev` to add the values automatically. The script sets the first `ED25519` address you own as the active-address, and publishes the contract on the active network (which must be Devnet for this example). It also sets the `PRIVATE_KEY`.

### Smart contract (custom set up)

You can deploy the smart contract yourself. If you skipped using the setEnv.js script, navigate the the /satoshi_flip/sources folder that contains the satoshi_flip.move smart contract, and then run the following command:
```sh
sui publish --gas-budget 5000
``` 

Get the package ID returned, and include it in the `api/.env` and `ui/.env` files. Check the templates for the appropriate variable naming.

</details><br/>

---
### API
Next move to the `api/` directory, do another `npm install`.
Lastly with `npm run dev` the server will start locally at `localhost:8080` depending on the `PORT` variable in `api/.env`.

### UI
Navigate to the `ui/` directory and run `npm install`, followed by `npm run dev` for local trials. The UI will start running at `localhost:3000` and you can start playing.
