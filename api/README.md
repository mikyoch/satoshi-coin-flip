# Satoshi Server
The Satoshi API is responsible for making sensitive Sui module calls.<br/>
Postman collection with available calls and sample responses can be found in the `api/Satoshi Flip endpoints.postman_collection.json` file. <br/>

Includes the following endpoints:
- `POST /game/start` - Creates a new secret and submits it along with the house's stake by calling the `start_game` method of the satoshi_flip module. Handles coin object equivocation with a round robin approach.
- `POST /game/end` - Ends a game by calling the `end_game` method of the satoshi_flip module.
- `GET /game/objects` - Returns all gameIds that have been created since the API started running
## Prerequisites
1. Node installed locally and sui cli
1. Go to the *scripts* folder and run `npm install`
## Get started
1. GO to the *api* folder and run `cd api`
1. Run `npm install`
1. Run the api with `npm run dev` (this command will also set the .env file if semi-complete and will create it if it doesn't exist)

## General Debugging notes
- If the API does not start, ensure that all the .env values have been properly set by the `setEnv.js` script. Dotenv schema can be found in the `.env.template` file.
- The `setEnv.js` script can be manually invoked by running `npm run set-up-dev-env` within the API folder or via the scripts folder (further instructions can be found there)