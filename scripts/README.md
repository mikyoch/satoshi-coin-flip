# Set up scripts

This folder contains scripts that utilize the SuiClient CLI and Linux Bash commands to initialize the project configuration and deploy the satoshi_coin_flip module.

**Note:** Running the scripts directly from this folder is not required as they are automatically invoked when the API or UI run.

## Disclaimer

Dev and prod environments currently do not differentiate the initialization process, rather they are different ways to do the same thing: set up the .env files.
 - `npm run dev` utilizes the Sui Client CLI to deploy the smart contract
 - `npm run prod` utilizes the JS / TS Sui SDK to deploy the smart contract

These are the main differences between these 2 scripts

## Prerequisites

 - Node v16.18 or similar
 - **(For dev environment only)** Sui Client CLI (installed when you install SUI)
 - **(For dev environment only)** An active address in the Sui Client CLI with enough SUI or MIST to participate in the game. The example uses 5000 MIST. You can add SUI to your address using the Discord [#devnet-faucet](https://discord.com/channels/916379725201563759/971488439931392130) channel, or use the `requestSuiFromFaucet` method of the JS /TS SDK.
 - **(For dev environment only)** The active address must be the first address that appears when listing keytool information with `sui keytool list`, and it must use the ed25519 key scheme.

## General set up

To set up your environment, navigate to the /scripts folder and then run `npm install`

## Project set up (dev)

Run `npm run dev`

## Project set up (prod)

 - If there is a new version of the Satoshi Flip contract (satoshi_flip.move), run the `compileToBase64Bytecode.sh` script that located in the [satoshi_flip folder](../satoshi_flip/compileToBase64Bytecode.sh). This script requires the Sui Client CLI to be installed locally.
 - Run `npm run prod`
