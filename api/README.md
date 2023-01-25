# Satoshi Server

The Satoshi API is responsible for making sensitive Sui module calls.

You can find Postman collection with available calls and sample responses [api folder](./Satoshi%20Flip%20endpoints.postman_collection.json). It also contains endpoints of the previous satoshi smart contract implementation that can be seen in [satoshi_flip](./../satoshi_flip/sources/satoshi_flip.move).

The server includes the following endpoints:
- `POST /game/register` - Called after a user has created a new game. Registers the new game in the api storage. Used for tracking game status and to perform checks.
- `POST /game/single/end` - Ends a game by calling the `play` method of the single_player_satoshi module. Handles coin object equivocation with a round robin approach.
- `GET /game/details` - Returns deails about all games that were created since the API started running
- `POST /game/sign` - Signs a message with the house's private key
- `POST /game/verify` - Verifies that a message was signed by the house's private key

## Prerequisites
You must have the following prerequisites installed to successfully use the example:

 * Node installed locally
 * Sui Client CLI (installed when you install Sui)
 * Run `npm install` in the /scripts folder 
 
## Get started

Follow these steps to get started with the example:

 1. Navigate to the /api folder in the repo and run `npm install`
 1. Run the API with `npm run dev`

## General Debugging notes

 - If the API does not start, ensure that all the .env values are properly set by the setEnv.js script. You can find the Dotenv schema in the .env.template file.
 - You can manually invoke the setEnv.js script by running `npm run set-up-dev-env` within the API folder, or via the scripts folder. Find more information in the [/scripts](../scripts) folder.
