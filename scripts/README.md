# Set up scripts
This folder includes scripts that utilize the sui cli and Linux bash commands to initialize the project configuration and deploy the satoshi module.</br>
**Note:** Running the scripts directly from this folder is not required as they are automatically invoked when firing up the ui and api.

## Disclaimer
Dev and prod environments currently do not differentiate the initialization process, rather they are different ways to do the same thing: set up the .env files.
- `npm run dev` will utilize the sui cli to deploy the smart contract
- `npm run prod` will utilize the js/ts sui sdk to deploy the smart contract

These are the main differences between these 2 scripts

## Prerequisites
- Node v16.18 or similar
- **(For dev environment only)** Sui cli
- **(For dev environment only)** Funded default account in the sui cli. Default account can be funded by using the discord `#devnet-faucet` channel or using the `requestSuiFromFaucet` method of the js sdk.
- **(For dev environment only)** Active address must be the first address that appears when listing keytool information with `sui keytool list` and be of Scheme ed25519

## General set up
- Move into the scripts folder
- Run `npm install`

## Project set up (dev)
- Run `npm run dev`

## Project set up (prod)
- If there is a new version of the satoshi flip contract run the `compileToBase64Bytecode.sh` script that is located in the [satoshi_flip folder](../satoshi_flip/compileToBase64Bytecode.sh). This script requires the sui cli to be installed locally.
- Run `npm run prod`
