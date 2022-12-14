# Time Locked Satoshi Coin Flip

A sample UI for presenting the time locked satoshi coin flip.
You can try it at: [https://satoshi-flip.sui.io](https://satoshi-flip.sui.io)

Note: This example is developed on Sui DevNet and new releases might affect its availability.

## Introduction

We present a fair method to use Sui blockchain in order to conduct a 50 / 50 chance game.

We model it after a coin flip since the chances are 50%.<br/>
The theory backing this project was presented by Kostas Chalkias (Chief Cryptographer @Mysten Labs) at GAME3R 2022.<br/>
The smart contract source code that is running on Sui devnet can be found at `satoshi_flip/sources/satoshi_flip.move`.

## Smart Contract Flow

The smart contract is intended for any two players.<br/>
The player that starts the game takes the role of the house. The house picks a random secret and commits on chain the hash of the secret. The house is responsible for picking a properly random secret.
The other player may come and wage a guess on a predetermined bit of this secret, either 0 or 1.
The house reveals the secret and the smart contract determines the winner.

Fairness is ensured and verifiable by:

1) Hashing the secret and verifying that it matches the initial hash the house submitted (this is also verified by the contract).
2) Time-locking the game so that the house is obliged to reveal the secret after an X amount of epochs (X=7 in our example). 

## UI Flow

The model used here is a coin flip.<br/>
The house is the UI itself. Any player may join, connect a Sui compatible wallet (Ethos and Sui Wallet supported at the moment), and start a new game by clicking the `New Game` button. <br/>
The house picks the secret and commits the hash and a coin of at least 5000 Mist value.
The player is then invited to pick `Tails` or `Heads` which stand for 0 or 1 and lock 5000 Mist of his balance, to guess the predetermined bit.<br/>
The UI will end the game by revealing the secret and transfer 10000 Mist to the winner.

The contract allows for a variable amount of MIST, up to an amount determined by the house. This UI has locked the amount at 5000 MIST.

The UI is used to showcase our fairness claim, since the player is able at any point to check the created objects and transactions on the chain and verify that the hashes match and that the outcome is correct.

## Server
A simple server is used to protect house private data and calls.<br/>
More details can be found in `api/README.md` file

## Prereqs
To try the example yourself you will need:
- a Sui address with coins
- sui cli tool with active network devnet
- sui compatible wallet on chrome
- npm
- node

## Usage
If you'd like to give the code a try here's how you can set it up:

1) Clone the repo locally
2) Navigate to the scripts folder and run `npm install`
3) Next, the `api/.env` and `ui/.env` files need to be populated.<br/>
    There are two possible ways of setting the required .env files:
    - a) **Automatic** - *(Recomended)* By simply running either the api or the ui, the `setEnv.js` script (located in the `scripts` folder) will be executed and the env files will be created.
    - b) **Manual** - Check section '*(Optional) Configuring dotenv files manually*' below

<details>
<summary> <b>(Optional) Configuring dotenv files manually</b> </summary>
Navigate to the api folder <code>api/</code> and edit (or create) the <code>api/.env</code> file, set the following values to ones that make sense for you:

```dotenv
PORT=8080
TRUSTED_ORIGINS=["http://localhost:3000"]
BANKER_ADDRESS=<your Sui address or leave empty, the setEnv.js script runs on api and ui launch>
PACKAGE_ADDRESS=<the address of the satoshi_flip package on the Sui network you use or leave empty, the setEnv.js script runs on api and ui launch>
PRIVATE_KEY=<the private key coresponding to the active address in a [byte array] or leave empty since the setEnv.js script runs on api and ui launch>
```

If you left any or both of <code>BANKER_ADDRESS</code> and <code>PACKAGE_ADDRESS</code> empty then navigate to <code>scripts</code> folder and run <code>npm run dev</code> to have them automatically completed. 
This script will set the first <code>ED25519</code> address you own as the active-address and will publish the contract on the active network (must be devnet).
Also it will set the <code>PRIVATE_KEY</code>.

## Smart contract (custom set up)
To deploy the smart contract yourself, if you skipped using the <code>setEnv.js</code> script, navigate the the contracts directory <code>satoshi_flip</code> and press <code>sui publish --gas-budget 5000</code>. Get the package id from the output and put it in the <code>api/.env</code> and <code>ui/.env</code> files (check the templates for the appropriate variable naming).

</details><br/>

### API
Next move to the `api/` directory, do another `npm install`.
Lastly with `npm run dev` the server will start locally at `localhost:8080` depending on the `PORT` variable of in `api/.env`.

### UI
Navigate to the `ui/` directory and run `npm install`, followed by `npm run dev` for local trials. The UI will start running at `localhost:3000` and you can start playing.
