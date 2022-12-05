# Set up scripts
This folder includes scripts that utilize the sui cli and Linux bash commands to initialize the project configuration

## Prerequisites
- Node v16.18 or similar
- Sui cli
- Funded default account in the sui cli. Default account can be funded by using the discord `#devnet-faucet` channel or using the `requestSuiFromFaucet` method of the js sdk.
- Active address must be the first address that appears when listing keytool information with `sui keytool list` and be of Scheme ed25519

## Project set up
- Move into the scripts folder
- Run `npm install`
- Run `npm run dev`