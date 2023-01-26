# Time-locked Satoshi Coin Flip

This sample provides an example UI to present a time-locked Satoshi Coin Flip game. You can try it out at [https://satoshi-flip.sui.io](https://satoshi-flip.sui.io).

**Note:** This example runs on Sui DevNet. The site may be briefly unavailable while weekly network updates deploy.

## About the Satoshi Coin Flip example

We present a fair method to use the Sui blockchain to conduct a 50 / 50 game of chance. We model the example after a 2-sided coin flip with a 50% chance for each outcome, Tails or Heads.

Kostas Chalkias, Chief Cryptographer at Mysten Labs, presented the theory behind this project at [GAM3R 2022](https://gam3r.org/).

You can find the source code for the smart contract (satoshi_flip.move) that executes on Sui Devnet in the [satoshi_flip](satoshi_flip/sources/satoshi_flip.move) folder.

## Smart Contract Flow

The smart contract works for any one player. An entity called house acts as the game's organizer. A treasury object is used to submit the house's stake and is managed by the contract creator. Upon contract deployment, the house data are initialized with the house's public key. 

The player that starts the game picks 16 random bytes and submits them along with their choice of Tails or Heads. Additionally, at this stage the player's & house's stake (5000 MIST) is submitted.

Once the game has been created, anyone can end it by providing a valid BLS signature and the game id. The winner is determined by a bit of the bls signature. The signature is the result of signing the gameId + user's 16 random bytes with the house's private key.

Fairness is ensured and verifiable by:
 1. Player can not guess the house's private key
 1. House can not guess the user's random input
 1. Time-locking the game so that it is obliged to end after X number of epochs (X=7 in our example).

## UI Flow

The House assumes the role of the UI. Any player can join, connect a Sui-compatible wallet (Ethos and Sui Wallet supported currently), and then start a new game by clicking **New Game**.

The player picks a secret and a coin of at least 5000 MIST. The UI then asks the player to choose **Tails** or **Heads** (0 or 1 respectively), to guess the predetermined bit. It then locks 5000 MIST of the player's balance and another 5000 MIST from the house's treasury.

To end the game, the House reveals the secret and then transfers 10000 MIST to the winner.

This example has locked the stake amount at 5000 MIST.

The sample UI demonstrates our fairness claim: The human player can check the objects and transactions created on the chain at any point to verify that the signatures match and the outcome is correct and fair.

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
    1. **Automatic** - *(Recommended)* Run `npm run dev` to execute the initialization scripts (located in the [scripts folder](scripts/dev)), which create the .env files.
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
HOUSE_DATA=<house data object id that is created upon contract initialization>
```

The script sets the first `ED25519` address you own as the active-address, and publishes the contract on the active network (which must be Devnet for this example). It also initializes the smart contract

### Smart contract (custom set up)

You can deploy the smart contract yourself. If you skipped using the setEnv.js script, navigate the the /satoshi_flip/sources folder that contains the satoshi_flip.move smart contract, and then run the following command:
```sh
sui publish --gas-budget 5000
``` 

Get the package ID returned, and include it in the `api/.env` and `ui/.env` files. Store the HouseCap object id. Check the templates for the appropriate variable naming.

Then call the initialize_house_data method to initialize the house's public key and the balance of the treasury. Include the house_data object in the apis .env file.

</details><br/>

---
### API
Next move to the `api/` directory, do another `npm install`.
Lastly with `npm run dev` the server will start locally at `localhost:8080` depending on the `PORT` variable in `api/.env`.

### UI
Navigate to the `ui/` directory and run `npm install`, followed by `npm run dev` for local trials. The UI will start running at `localhost:3000` and you can start playing.
