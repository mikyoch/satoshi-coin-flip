# Set up scripts
This folder includes scripts that utilize the sui cli and Linux bash commands to initialize the project configuration

## Prerequisites
- Node v16.18 or similar
- **(For dev environment only)** Sui cli
- **(For dev environment only)** Funded default account in the sui cli. Default account can be funded by using the discord `#devnet-faucet` channel or using the `requestSuiFromFaucet` method of the js sdk.
- **(For dev environment only)** Active address must be the first address that appears when listing keytool information with `sui keytool list` and be of Scheme ed25519
---

## General set up
- Move into the scripts folder
- Run `npm install`

## Project set up (dev)
- Run `npm run dev`

## Project set up (prod)
- If there is a new version of the satoshi flip contract run the `compileToBase64Bytecode.sh` script
- Run `npm run prod`
