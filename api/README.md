# Satoshi Server

The Satoshi API is responsible for making sensitive Sui module calls.

You can find Postman collection with available calls and sample responses [api folder](./Satoshi%20Flip%20endpoints.postman_collection.json).

The server includes the following endpoints:
- `POST /game/start` - Creates a new secret and submits it along with the House's stake by calling the `start_game` method of the satoshi_flip module. Handles coin object equivocation with a round robin approach.
- `POST /game/end` - Ends a game by calling the `end_game` method of the satoshi_flip module.
- `GET /game/objects` - Returns all `gameIds` that were created since the API started running

## Prerequisites
You must have the following prerequisites installed to successfully use the example:

 * Node installed locally
 * Sui Client CLI (installed when you install Sui)
 * Run `npm install` in the /scripts folder 
 
## Get started

Follow these steps to get started with the example:

 1. Navigate to the /api folder in the repo and run `npm install`
 1. Run the API with `npm run dev` (this command also sets valaues in the .env file not populated, or creates the file if it doesn't exist. See the [README](../README.md) in the root folder for more detailed information.

## General Debugging notes

 - If the API does not start, ensure that all the .env values are properly set by the setEnv.js script. You can find the Dotenv schema in the .env.template file.
 - You can manually invoke the setEnv.js script by running `npm run set-up-dev-env` within the API folder, or via the scripts folder. Find more information in the [/scripts](../scripts) folder.
